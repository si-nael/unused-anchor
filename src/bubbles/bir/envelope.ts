// BIR envelope: versioned, sectioned, integrity-checked storage of one or more semantic sections.
//
// Layout (all integers unsigned LEB128, minimal):
//   magic "BUBBLEIR" (8 bytes) | major | minor | section count |
//   sections in strictly increasing name order, each: name (length-prefixed UTF-8) | flags | length | payload |
//   SHA-256 of every preceding byte (32 bytes)
// Flag bit 0 marks a critical section: it carries meaning, and a reader that does not understand it must not
// execute the document. Non-critical sections (provenance, annotations, tooling data) never affect meaning.
// Unknown sections of either kind are preserved byte for byte and are never executed.

import { createHash } from "node:crypto";
import { countHostCost } from "../world-kernel/host-cost";
import { BirFormatError, BirReader, compareBytes, concatBytes, encodeText, encodeUnsigned } from "./node";

export const BIR_MAGIC = Uint8Array.from([0x42, 0x55, 0x42, 0x42, 0x4c, 0x45, 0x49, 0x52]); // "BUBBLEIR"
export const BIR_FORMAT_VERSION = { major: 1, minor: 0 } as const;
const FLAG_CRITICAL = 1n;
const SECTION_NAME = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const SEMANTIC_IDENTITY_DOMAIN = new TextEncoder().encode("bubble-bir-semantic-identity.v1\u0000");

export interface BirSection {
    name: string;
    critical: boolean;
    payload: Uint8Array;
}

export interface BirEnvelope {
    formatVersion: { major: number; minor: number };
    sections: BirSection[];
}

function sha256(bytes: Uint8Array): Uint8Array {
    return new Uint8Array(createHash("sha256").update(bytes).digest());
}

function hex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString("hex");
}

const nameEncoder = new TextEncoder();

/** A `core.` section carries meaning by definition, so it can never be marked non-critical. */
function checkSectionRole(section: BirSection): void {
    if (section.name.startsWith("core.") && !section.critical) {
        throw new BirFormatError("BIR029", `core section '${section.name}' must be critical`);
    }
}

/** Sections are ordered by the raw UTF-8 bytes of their names (equivalently canonical string order). */
function sortedSections(sections: BirSection[]): BirSection[] {
    const encodedNames = sections.map((section) => {
        if (!SECTION_NAME.test(section.name)) throw new BirFormatError("BIR020", `invalid section name '${section.name}'`);
        checkSectionRole(section);
        return { section, name: nameEncoder.encode(section.name) };
    });
    encodedNames.sort((left, right) => compareBytes(left.name, right.name));
    for (let index = 1; index < encodedNames.length; index += 1) {
        if (encodedNames[index - 1]!.section.name === encodedNames[index]!.section.name) {
            throw new BirFormatError("BIR021", `duplicate section '${encodedNames[index]!.section.name}'`);
        }
    }
    return encodedNames.map((entry) => entry.section);
}

export function encodeBirEnvelope(envelope: BirEnvelope): Uint8Array {
    const sections = sortedSections(envelope.sections);
    const body = concatBytes([
        BIR_MAGIC,
        encodeUnsigned(envelope.formatVersion.major),
        encodeUnsigned(envelope.formatVersion.minor),
        encodeUnsigned(sections.length),
        ...sections.flatMap((section) => [
            encodeText(section.name),
            encodeUnsigned(section.critical ? FLAG_CRITICAL : 0n),
            encodeUnsigned(section.payload.length),
            section.payload,
        ]),
    ]);
    return concatBytes([body, sha256(body)]);
}

export function decodeBirEnvelope(bytes: Uint8Array): BirEnvelope {
    countHostCost("birBytesRead", bytes.length);
    if (bytes.length < BIR_MAGIC.length + 32) throw new BirFormatError("BIR022", "input is too short to be a BIR envelope");
    const body = bytes.subarray(0, bytes.length - 32);
    const trailer = bytes.subarray(bytes.length - 32);
    countHostCost("digestsComputed");
    countHostCost("bytesHashed", body.length);
    if (compareBytes(sha256(body), trailer) !== 0) throw new BirFormatError("BIR023", "integrity digest does not match the envelope");
    const reader = new BirReader(body);
    if (compareBytes(reader.readBytes(BIR_MAGIC.length), BIR_MAGIC) !== 0) throw new BirFormatError("BIR024", "not a BIR envelope");
    const major = reader.readUnsigned();
    const minor = reader.readUnsigned();
    if (major !== BigInt(BIR_FORMAT_VERSION.major)) {
        throw new BirFormatError("BIR025", `unsupported BIR major version ${major.toString()}`);
    }
    if (minor > BigInt(Number.MAX_SAFE_INTEGER)) throw new BirFormatError("BIR025", "BIR minor version is out of range");
    const count = reader.readLength();
    const sections: BirSection[] = [];
    let previousName: Uint8Array | undefined;
    for (let index = 0; index < count; index += 1) {
        const name = reader.readText();
        const nameBytes = nameEncoder.encode(name);
        if (!SECTION_NAME.test(name)) throw new BirFormatError("BIR020", `invalid section name '${name}'`);
        if (previousName && compareBytes(previousName, nameBytes) >= 0) {
            throw new BirFormatError("BIR026", "sections are not in strictly increasing name order");
        }
        previousName = nameBytes;
        const flags = reader.readUnsigned();
        if ((flags & ~FLAG_CRITICAL) !== 0n) throw new BirFormatError("BIR027", `section '${name}' uses undefined flags`);
        const length = reader.readLength();
        const section = { name, critical: flags === FLAG_CRITICAL, payload: Uint8Array.from(reader.readBytes(length)) };
        checkSectionRole(section);
        sections.push(section);
    }
    if (reader.remaining !== 0) throw new BirFormatError("BIR028", "trailing bytes before the integrity digest");
    return { formatVersion: { major: Number(major), minor: Number(minor) }, sections };
}

/** Semantic graph identity: critical sections only, independent of non-critical extensions and storage framing. */
export function birSemanticDigest(envelope: BirEnvelope): string {
    const critical = sortedSections(envelope.sections).filter((section) => section.critical);
    return hex(sha256(concatBytes([
        SEMANTIC_IDENTITY_DOMAIN,
        encodeUnsigned(critical.length),
        ...critical.flatMap((section) => [encodeText(section.name), encodeUnsigned(section.payload.length), section.payload]),
    ])));
}

/** Canonical storage identity: every byte of the envelope, including extensions and the integrity trailer. */
export function birStorageDigest(bytes: Uint8Array): string {
    return hex(sha256(bytes));
}
