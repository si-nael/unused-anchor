// Clean-room BIR v1 reader/encoder.
//
// Written only from docs/reference/bubble-ir.md,
// docs/reference/causal-conformance.md, and docs/reference/bir-schemas.md.
// Nothing under src/ is imported or
// consulted. Every rule below cites the spec sentence it implements; places
// where the documents leave a step to the implementer are marked "DERIVED".

import { createHash } from "node:crypto";

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type CleanRoomErrorCode =
    | "truncated"
    | "non-minimal-uvar"
    | "malformed-utf8"
    | "unpaired-surrogate"
    | "unknown-tag"
    | "set-order"
    | "key-order"
    | "rational-denominator"
    | "rational-not-reduced"
    | "nesting-too-deep"
    | "trailing-bytes"
    | "bad-magic"
    | "unsupported-major"
    | "bad-section-name"
    | "section-order"
    | "undefined-flags"
    | "non-critical-core"
    | "bytes-before-trailer"
    | "trailer-mismatch"
    | "length-overflow"
    | "jcs-unsupported"
    | "section-not-record"
    | "schema";

export class CleanRoomBirError extends Error {
    readonly code: CleanRoomErrorCode;

    constructor(code: CleanRoomErrorCode, message: string) {
        super(`${code}: ${message}`);
        this.code = code;
        this.name = "CleanRoomBirError";
    }
}

function fail(code: CleanRoomErrorCode, message: string): never {
    throw new CleanRoomBirError(code, message);
}

// ---------------------------------------------------------------------------
// Node model (bubble-ir.md section 4)
// ---------------------------------------------------------------------------

export type BirNode =
    | { readonly kind: "structural-boolean"; readonly value: boolean }
    | { readonly kind: "integer"; readonly value: bigint }
    | { readonly kind: "string"; readonly value: string }
    | { readonly kind: "sequence"; readonly items: readonly BirNode[] }
    | { readonly kind: "set"; readonly members: readonly BirNode[] }
    | { readonly kind: "record"; readonly entries: readonly (readonly [string, BirNode])[] }
    | { readonly kind: "map"; readonly entries: readonly (readonly [string, BirNode])[] }
    | { readonly kind: "rational"; readonly numerator: bigint; readonly denominator: bigint }
    | { readonly kind: "exact-boolean"; readonly value: boolean }
    | { readonly kind: "symbol"; readonly value: string };

export const TAG = {
    structuralFalse: 0x01,
    structuralTrue: 0x02,
    integer: 0x03,
    string: 0x04,
    sequence: 0x05,
    set: 0x06,
    record: 0x07,
    map: 0x08,
    rational: 0x10,
    exactFalse: 0x11,
    exactTrue: 0x12,
    symbol: 0x13,
} as const;

// bubble-ir.md section 4, "Nesting bound": "Each section payload is one node
// whose root has depth 0. Every item of a sequence, member of a set, and field
// or entry value of a record or map has the depth of its container plus 1. ...
// Encoders and decoders accept a node at depth up to and including 1024
// (BIR_MAX_DEPTH) and reject any node at depth 1025 or more (BIR014)." The
// decoder "checks the depth before it reads a node's tag".
export const ROOT_DEPTH = 0;
export const MAX_DEPTH = 1024;

// ---------------------------------------------------------------------------
// Byte helpers
// ---------------------------------------------------------------------------

export function compareBytes(a: Uint8Array, b: Uint8Array): number {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i += 1) {
        if (a[i] !== b[i]) return a[i]! < b[i]! ? -1 : 1;
    }
    return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
}

export function concatBytes(parts: readonly Uint8Array[]): Uint8Array {
    let total = 0;
    for (const part of parts) total += part.length;
    const out = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
        out.set(part, offset);
        offset += part.length;
    }
    return out;
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
    return compareBytes(a, b) === 0;
}

export function sha256(...parts: Uint8Array[]): Uint8Array {
    const hash = createHash("sha256");
    for (const part of parts) hash.update(part);
    return new Uint8Array(hash.digest());
}

export function hex(bytes: Uint8Array): string {
    let out = "";
    for (const b of bytes) out += b.toString(16).padStart(2, "0");
    return out;
}

function ascii(text: string): Uint8Array {
    const out = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i += 1) {
        const c = text.charCodeAt(i);
        if (c > 0x7f) throw new Error("ascii only");
        out[i] = c;
    }
    return out;
}

// ---------------------------------------------------------------------------
// Primitive encodings (bubble-ir.md section 3)
// ---------------------------------------------------------------------------

// "Unsigned integer (uvar): unsigned LEB128. The encoding must be minimal: a
// multi-byte encoding may not end with a 0x00 byte."
export function encodeUvar(value: bigint | number): Uint8Array {
    let v = typeof value === "number" ? BigInt(value) : value;
    if (v < 0n) throw new RangeError("uvar must be non-negative");
    const out: number[] = [];
    do {
        let byte = Number(v & 0x7fn);
        v >>= 7n;
        if (v !== 0n) byte |= 0x80;
        out.push(byte);
    } while (v !== 0n);
    return Uint8Array.from(out);
}

// "Signed integer: zigzag mapping (n >= 0 -> 2n, n < 0 -> -2n - 1) followed by uvar."
export function zigzag(n: bigint): bigint {
    return n >= 0n ? 2n * n : -2n * n - 1n;
}

export function unzigzag(u: bigint): bigint {
    return (u & 1n) === 0n ? u / 2n : -(u + 1n) / 2n;
}

export function encodeSigned(value: bigint): Uint8Array {
    return encodeUvar(zigzag(value));
}

// "Text: uvar byte length followed by well-formed UTF-8. Unpaired surrogates
// cannot be encoded; malformed UTF-8 is rejected; a leading BOM is ordinary content."
export function utf8(text: string): Uint8Array {
    for (let i = 0; i < text.length; i += 1) {
        const c = text.charCodeAt(i);
        if (c >= 0xd800 && c <= 0xdbff) {
            const d = i + 1 < text.length ? text.charCodeAt(i + 1) : 0;
            if (d >= 0xdc00 && d <= 0xdfff) {
                i += 1;
                continue;
            }
            fail("unpaired-surrogate", `unpaired high surrogate at ${i}`);
        }
        if (c >= 0xdc00 && c <= 0xdfff) fail("unpaired-surrogate", `unpaired low surrogate at ${i}`);
    }
    return new TextEncoder().encode(text);
}

// ignoreBOM: true keeps a leading U+FEFF as content (the WHATWG default strips it).
const strictUtf8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

export function encodeText(text: string): Uint8Array {
    const body = utf8(text);
    return concatBytes([encodeUvar(body.length), body]);
}

// Canonical string order (bubble-ir.md section 2): code point order, which
// equals bytewise order of UTF-8 encodings.
export function compareCanonicalStrings(a: string, b: string): number {
    return compareBytes(utf8(a), utf8(b));
}

// ---------------------------------------------------------------------------
// Reader
// ---------------------------------------------------------------------------

export class ByteReader {
    pos: number;
    readonly bytes: Uint8Array;
    readonly end: number;

    constructor(bytes: Uint8Array, start = 0, end = bytes.length) {
        this.bytes = bytes;
        this.pos = start;
        this.end = end;
    }

    remaining(): number {
        return this.end - this.pos;
    }

    byte(): number {
        if (this.pos >= this.end) fail("truncated", `need 1 byte at ${this.pos}`);
        return this.bytes[this.pos++]!;
    }

    take(n: number): Uint8Array {
        if (n > this.remaining()) fail("truncated", `need ${n} bytes at ${this.pos}, have ${this.remaining()}`);
        const out = this.bytes.subarray(this.pos, this.pos + n);
        this.pos += n;
        return out;
    }

    uvar(): bigint {
        const start = this.pos;
        let value = 0n;
        let shift = 0n;
        let byte: number;
        let count = 0;
        do {
            byte = this.byte();
            count += 1;
            value |= BigInt(byte & 0x7f) << shift;
            shift += 7n;
        } while ((byte & 0x80) !== 0);
        if (count > 1 && byte === 0x00) fail("non-minimal-uvar", `non-minimal LEB128 at ${start}`);
        return value;
    }

    // A uvar used as a count or length; bounded by the bytes that remain so a
    // hostile document cannot request an unbounded allocation.
    length(): number {
        const at = this.pos;
        const value = this.uvar();
        if (value > BigInt(this.remaining())) {
            fail("length-overflow", `length ${value} at ${at} exceeds the ${this.remaining()} remaining bytes`);
        }
        return Number(value);
    }

    signed(): bigint {
        return unzigzag(this.uvar());
    }

    // Returns the decoded string and the raw UTF-8 bytes (for ordering checks).
    textWithBytes(): { text: string; raw: Uint8Array } {
        const n = this.length();
        const raw = this.take(n);
        let text: string;
        try {
            text = strictUtf8.decode(raw);
        } catch {
            fail("malformed-utf8", `malformed UTF-8 ending at ${this.pos}`);
        }
        return { text, raw };
    }

    text(): string {
        return this.textWithBytes().text;
    }
}

// ---------------------------------------------------------------------------
// Node decoding
// ---------------------------------------------------------------------------

// Byte spans of decoded nodes, relative to the decoded buffer. Kept out of the
// node objects so structural equality is unaffected; tests use it to corrupt
// real documents at a precise location.
const spans = new WeakMap<BirNode, { start: number; end: number }>();

export function nodeSpan(node: BirNode): { start: number; end: number } | undefined {
    return spans.get(node);
}

function gcd(a: bigint, b: bigint): bigint {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) {
        const t = x % y;
        x = y;
        y = t;
    }
    return x;
}

export interface DecodeStats {
    nodes: number;
}

function decodeNodeAt(reader: ByteReader, depth: number, stats: DecodeStats): BirNode {
    if (depth > MAX_DEPTH) fail("nesting-too-deep", `BIR014: node at depth ${depth} exceeds ${MAX_DEPTH}`);
    const start = reader.pos;
    const tag = reader.byte();
    stats.nodes += 1;
    let node: BirNode;
    switch (tag) {
        case TAG.structuralFalse:
        case TAG.structuralTrue:
            node = { kind: "structural-boolean", value: tag === TAG.structuralTrue };
            break;
        case TAG.integer:
            node = { kind: "integer", value: reader.signed() };
            break;
        case TAG.string:
            node = { kind: "string", value: reader.text() };
            break;
        case TAG.sequence: {
            const count = reader.length();
            const items: BirNode[] = [];
            for (let i = 0; i < count; i += 1) items.push(decodeNodeAt(reader, depth + 1, stats));
            node = { kind: "sequence", items };
            break;
        }
        case TAG.set: {
            // "members in strictly increasing bytewise order of their full encodings"
            const count = reader.length();
            const members: BirNode[] = [];
            let previous: Uint8Array | undefined;
            for (let i = 0; i < count; i += 1) {
                const memberStart = reader.pos;
                const member = decodeNodeAt(reader, depth + 1, stats);
                const encoding = reader.bytes.subarray(memberStart, reader.pos);
                if (previous !== undefined && compareBytes(previous, encoding) >= 0) {
                    fail("set-order", `set member ${i} at ${memberStart} is not strictly greater than its predecessor`);
                }
                previous = encoding;
                members.push(member);
            }
            node = { kind: "set", members };
            break;
        }
        case TAG.record:
        case TAG.map: {
            // "(key text, node) pairs with keys strictly increasing in canonical string order"
            const count = reader.length();
            const entries: (readonly [string, BirNode])[] = [];
            let previous: Uint8Array | undefined;
            for (let i = 0; i < count; i += 1) {
                const keyAt = reader.pos;
                const { text, raw } = reader.textWithBytes();
                if (previous !== undefined && compareBytes(previous, raw) >= 0) {
                    fail("key-order", `key ${JSON.stringify(text)} at ${keyAt} is not strictly greater than its predecessor`);
                }
                previous = raw;
                entries.push([text, decodeNodeAt(reader, depth + 1, stats)]);
            }
            node = { kind: tag === TAG.record ? "record" : "map", entries };
            break;
        }
        case TAG.rational: {
            // "signed numerator, unsigned denominator; denominator > 0, gcd = 1, zero is 0/1"
            const numerator = reader.signed();
            const denominator = reader.uvar();
            if (denominator === 0n) fail("rational-denominator", `zero denominator at ${start}`);
            if (gcd(numerator, denominator) !== 1n) {
                fail("rational-not-reduced", `${numerator}/${denominator} at ${start} is not reduced`);
            }
            node = { kind: "rational", numerator, denominator };
            break;
        }
        case TAG.exactFalse:
        case TAG.exactTrue:
            node = { kind: "exact-boolean", value: tag === TAG.exactTrue };
            break;
        case TAG.symbol:
            node = { kind: "symbol", value: reader.text() };
            break;
        default:
            fail("unknown-tag", `unknown tag 0x${tag.toString(16).padStart(2, "0")} at ${start}`);
    }
    spans.set(node, { start, end: reader.pos });
    return node;
}

// "A decoder also rejects unknown tags, non-canonical bodies, and trailing
// bytes after the root node."
export function decodeNode(bytes: Uint8Array, stats: DecodeStats = { nodes: 0 }): BirNode {
    const reader = new ByteReader(bytes);
    const node = decodeNodeAt(reader, ROOT_DEPTH, stats);
    if (reader.remaining() !== 0) fail("trailing-bytes", `${reader.remaining()} bytes after the root node`);
    return node;
}

// ---------------------------------------------------------------------------
// Node encoding
// ---------------------------------------------------------------------------

// The encoder canonicalizes member and key order itself (sets and records are
// unordered collections) and rejects inputs no canonical encoding exists for:
// duplicate set members, repeated keys, non-reduced rationals, nesting > 1024.
export function encodeNode(node: BirNode): Uint8Array {
    const parts: Uint8Array[] = [];
    encodeInto(node, ROOT_DEPTH, parts);
    return concatBytes(parts);
}

function encodeEntries(tag: number, entries: readonly (readonly [string, BirNode])[], depth: number, out: Uint8Array[]): void {
    const keyed = entries.map(([key, value]) => ({ raw: utf8(key), value }));
    keyed.sort((a, b) => compareBytes(a.raw, b.raw));
    for (let i = 1; i < keyed.length; i += 1) {
        if (compareBytes(keyed[i - 1]!.raw, keyed[i]!.raw) === 0) fail("key-order", "repeated key");
    }
    out.push(Uint8Array.of(tag), encodeUvar(keyed.length));
    for (const { raw, value } of keyed) {
        out.push(encodeUvar(raw.length), raw);
        encodeInto(value, depth + 1, out);
    }
}

function encodeInto(node: BirNode, depth: number, out: Uint8Array[]): void {
    if (depth > MAX_DEPTH) fail("nesting-too-deep", `BIR014: node at depth ${depth} exceeds ${MAX_DEPTH}`);
    switch (node.kind) {
        case "structural-boolean":
            out.push(Uint8Array.of(node.value ? TAG.structuralTrue : TAG.structuralFalse));
            return;
        case "integer":
            out.push(Uint8Array.of(TAG.integer), encodeSigned(node.value));
            return;
        case "string":
            out.push(Uint8Array.of(TAG.string), encodeText(node.value));
            return;
        case "sequence":
            out.push(Uint8Array.of(TAG.sequence), encodeUvar(node.items.length));
            for (const item of node.items) encodeInto(item, depth + 1, out);
            return;
        case "set": {
            const encoded = node.members.map((member) => {
                const parts: Uint8Array[] = [];
                encodeInto(member, depth + 1, parts);
                return concatBytes(parts);
            });
            encoded.sort(compareBytes);
            for (let i = 1; i < encoded.length; i += 1) {
                if (compareBytes(encoded[i - 1]!, encoded[i]!) === 0) fail("set-order", "duplicate set member");
            }
            out.push(Uint8Array.of(TAG.set), encodeUvar(encoded.length), ...encoded);
            return;
        }
        case "record":
            encodeEntries(TAG.record, node.entries, depth, out);
            return;
        case "map":
            encodeEntries(TAG.map, node.entries, depth, out);
            return;
        case "rational":
            if (node.denominator <= 0n) fail("rational-denominator", "denominator must be positive");
            if (gcd(node.numerator, node.denominator) !== 1n) fail("rational-not-reduced", "rational is not reduced");
            out.push(Uint8Array.of(TAG.rational), encodeSigned(node.numerator), encodeUvar(node.denominator));
            return;
        case "exact-boolean":
            out.push(Uint8Array.of(node.value ? TAG.exactTrue : TAG.exactFalse));
            return;
        case "symbol":
            out.push(Uint8Array.of(TAG.symbol), encodeText(node.value));
            return;
    }
}

// ---------------------------------------------------------------------------
// Envelope (bubble-ir.md section 5)
// ---------------------------------------------------------------------------

export const MAGIC = ascii("BUBBLEIR");
export const SUPPORTED_MAJOR = 1n;
export const CRITICAL_FLAG = 1n;
const SECTION_NAME = /^[a-z][a-z0-9]*([.-][a-z0-9]+)*$/;

// "core.causal-program and core.causal-execution-options are the critical
// sections BIR v1 understands."
export const UNDERSTOOD_CRITICAL_SECTIONS: readonly string[] = ["core.causal-program", "core.causal-execution-options"];

export interface BirSection {
    readonly name: string;
    readonly flags: bigint;
    readonly critical: boolean;
    readonly payload: Uint8Array;
}

export interface BirEnvelope {
    readonly major: bigint;
    readonly minor: bigint;
    readonly sections: readonly BirSection[];
}

export interface DecodedBir {
    readonly envelope: BirEnvelope;
    readonly trailer: Uint8Array;
    readonly storageDigest: string;
    readonly semanticDigest: string;
    readonly unknownCriticalSections: readonly string[];
    readonly executable: boolean;
}

// bubble-ir.md section 5: "A core section is one whose name begins with the
// five bytes core. (so core and core-x are not core sections)."
export function isCoreSectionName(name: string): boolean {
    return name.startsWith("core.");
}

export function decodeEnvelope(bytes: Uint8Array): DecodedBir {
    if (bytes.length < MAGIC.length + 32) fail("truncated", "shorter than magic plus trailer");
    if (!bytesEqual(bytes.subarray(0, MAGIC.length), MAGIC)) fail("bad-magic", "magic is not BUBBLEIR");
    const bodyEnd = bytes.length - 32;
    // Sections and version fields are parsed only from the bytes that precede the trailer.
    const reader = new ByteReader(bytes, MAGIC.length, bodyEnd);
    const major = reader.uvar();
    // "A decoder rejects a different major version".
    if (major !== SUPPORTED_MAJOR) fail("unsupported-major", `major version ${major}`);
    // "A decoder accepts any minor version ... and preserves it when re-encoding."
    // The reference decoder bounds it at 2^53 - 1 (BIR025); this decoder
    // follows the normative "any" and keeps arbitrary precision.
    const minor = reader.uvar();
    const count = reader.length();
    const sections: BirSection[] = [];
    let previousName: Uint8Array | undefined;
    for (let i = 0; i < count; i += 1) {
        const at = reader.pos;
        const { text: name, raw } = reader.textWithBytes();
        if (!SECTION_NAME.test(name)) fail("bad-section-name", `section name ${JSON.stringify(name)} at ${at}`);
        // "strictly increasing bytewise order of their raw UTF-8 name bytes ... without duplicates"
        if (previousName !== undefined && compareBytes(previousName, raw) >= 0) {
            fail("section-order", `section ${JSON.stringify(name)} is misordered or duplicated`);
        }
        previousName = raw;
        const flags = reader.uvar();
        // "Flag bit 0 marks a critical section; every other flag bit must be zero."
        if ((flags & ~CRITICAL_FLAG) !== 0n) fail("undefined-flags", `section ${name} flags ${flags}`);
        const critical = (flags & CRITICAL_FLAG) === CRITICAL_FLAG;
        // "a non-critical core.* section is rejected (BIR029)"
        if (isCoreSectionName(name) && !critical) fail("non-critical-core", `BIR029: ${name} is not critical`);
        const length = reader.length();
        const payload = reader.take(length);
        sections.push({ name, flags, critical, payload });
    }
    // "rejects ... bytes between the last section and the trailer"
    if (reader.remaining() !== 0) fail("bytes-before-trailer", `${reader.remaining()} bytes between the last section and the trailer`);
    const trailer = bytes.subarray(bodyEnd);
    // "trailer: 32-byte SHA-256 of every preceding byte"
    if (!bytesEqual(trailer, sha256(bytes.subarray(0, bodyEnd)))) fail("trailer-mismatch", "SHA-256 trailer does not match");
    const envelope: BirEnvelope = { major, minor, sections };
    const unknownCriticalSections = sections
        .filter((section) => section.critical && !UNDERSTOOD_CRITICAL_SECTIONS.includes(section.name))
        .map((section) => section.name);
    return {
        envelope,
        trailer: new Uint8Array(trailer),
        storageDigest: storageDigest(bytes),
        semanticDigest: semanticDigest(envelope),
        unknownCriticalSections,
        // "A reader that does not understand a critical section preserves it but must not execute the document."
        executable: unknownCriticalSections.length === 0,
    };
}

// Encodes an envelope. Sections are placed in raw-name-byte order; the same
// rules the decoder enforces are enforced here so an encoder cannot produce a
// document the decoder rejects.
export function encodeEnvelope(envelope: BirEnvelope): Uint8Array {
    const sections = [...envelope.sections].sort((a, b) => compareBytes(utf8(a.name), utf8(b.name)));
    const parts: Uint8Array[] = [MAGIC, encodeUvar(envelope.major), encodeUvar(envelope.minor), encodeUvar(sections.length)];
    let previous: Uint8Array | undefined;
    for (const section of sections) {
        const raw = utf8(section.name);
        if (!SECTION_NAME.test(section.name)) fail("bad-section-name", section.name);
        if (previous !== undefined && compareBytes(previous, raw) === 0) fail("section-order", `duplicate section ${section.name}`);
        previous = raw;
        if ((section.flags & ~CRITICAL_FLAG) !== 0n) fail("undefined-flags", section.name);
        if (section.critical !== ((section.flags & CRITICAL_FLAG) === CRITICAL_FLAG)) {
            throw new Error(`section ${section.name}: critical does not match flags`);
        }
        if (isCoreSectionName(section.name) && !section.critical) fail("non-critical-core", `BIR029: ${section.name}`);
        parts.push(encodeUvar(raw.length), raw, encodeUvar(section.flags), encodeUvar(section.payload.length), section.payload);
    }
    const body = concatBytes(parts);
    return concatBytes([body, sha256(body)]);
}

// bubble-ir.md section 5: "Every section payload that BIR v1 defines
// (core.causal-program, core.causal-execution-options, and the Gate D
// conformance.* sections) is exactly one node with nothing after it, and each
// of them is a record node."
export const NODE_SECTIONS: readonly string[] = [
    "core.causal-program",
    "core.causal-execution-options",
    "conformance.causal-outcome",
    "conformance.host-cost",
    "conformance.label",
];

export interface DecodedDocument extends DecodedBir {
    readonly nodes: ReadonlyMap<string, BirNode>;
    readonly nodeCount: number;
}

// Envelope decoding plus node decoding of every section whose format the
// specs define. Unknown sections stay opaque bytes and are preserved.
export function decodeDocument(bytes: Uint8Array): DecodedDocument {
    const decoded = decodeEnvelope(bytes);
    const nodes = new Map<string, BirNode>();
    const stats: DecodeStats = { nodes: 0 };
    for (const section of decoded.envelope.sections) {
        if (!NODE_SECTIONS.includes(section.name)) continue;
        const node = decodeNode(section.payload, stats);
        if (node.kind !== "record") fail("section-not-record", `${section.name} payload is a ${node.kind}, not a record`);
        nodes.set(section.name, node);
    }
    return { ...decoded, nodes, nodeCount: stats.nodes };
}

// Re-encodes a decoded document with every section payload re-encoded through
// the node model (decode then encode), not copied, so a byte-identical result
// proves the node layer is canonical as well as the envelope layer.
export function reencodeThroughNodes(
    decoded: DecodedBir,
    nodeSections: (name: string) => boolean = (name) => NODE_SECTIONS.includes(name),
): Uint8Array {
    const sections = decoded.envelope.sections.map((section) =>
        nodeSections(section.name) ? { ...section, payload: encodeNode(decodeNode(section.payload)) } : section,
    );
    return encodeEnvelope({ ...decoded.envelope, sections });
}

// ---------------------------------------------------------------------------
// Identities
// ---------------------------------------------------------------------------

// bubble-ir.md section 1: "The storage digest is the lowercase-hex SHA-256 of
// the complete envelope bytes."
export function storageDigest(bytes: Uint8Array): string {
    return hex(sha256(bytes));
}

// bubble-ir.md section 1: the concatenation of "the 31 ASCII bytes
// bubble-bir-semantic-identity.v1 followed by one 0x00 byte, 32 bytes in all,
// with no length prefix", the critical-section count as a uvar, and for each
// critical section in envelope order its name as text, its payload length as a
// uvar, and its payload bytes. "Section flags are not hashed."
export const SEMANTIC_DOMAIN = concatBytes([ascii("bubble-bir-semantic-identity.v1"), Uint8Array.of(0)]);

export function semanticDigest(envelope: BirEnvelope): string {
    const critical = envelope.sections
        .filter((section) => section.critical)
        .sort((a, b) => compareBytes(utf8(a.name), utf8(b.name)));
    const parts: Uint8Array[] = [SEMANTIC_DOMAIN, encodeUvar(critical.length)];
    for (const section of critical) {
        parts.push(encodeText(section.name), encodeUvar(section.payload.length), section.payload);
    }
    return hex(sha256(...parts));
}

// causal-conformance.md section 1: "the lowercase-hex SHA-256 of the
// concatenation of the 33 ASCII bytes bubble-causal-outcome-identity.v1, one
// 0x00 byte, and the outcome payload bytes, with no length prefix."
export const OUTCOME_DOMAIN = concatBytes([ascii("bubble-causal-outcome-identity.v1"), Uint8Array.of(0)]);

export function outcomeDigest(outcomePayload: Uint8Array): string {
    return hex(sha256(OUTCOME_DOMAIN, outcomePayload));
}

export function sectionByName(decoded: DecodedBir, name: string): BirSection | undefined {
    return decoded.envelope.sections.find((section) => section.name === name);
}

// ---------------------------------------------------------------------------
// RFC 8785 JSON Canonicalization Scheme
// ---------------------------------------------------------------------------

export type JcsValue = null | boolean | number | string | readonly JcsValue[] | { readonly [key: string]: JcsValue };

// RFC 8785 section 3.2.2.2: strings serialize like ECMAScript JSON.stringify,
// and lone surrogates are an error.
function jcsString(value: string): string {
    let out = '"';
    for (let i = 0; i < value.length; i += 1) {
        const c = value.charCodeAt(i);
        if (c >= 0xd800 && c <= 0xdbff) {
            const d = i + 1 < value.length ? value.charCodeAt(i + 1) : 0;
            if (!(d >= 0xdc00 && d <= 0xdfff)) fail("jcs-unsupported", "lone surrogate");
            out += value[i]! + value[i + 1]!;
            i += 1;
            continue;
        }
        if (c >= 0xdc00 && c <= 0xdfff) fail("jcs-unsupported", "lone surrogate");
        switch (c) {
            case 0x08: out += "\\b"; break;
            case 0x09: out += "\\t"; break;
            case 0x0a: out += "\\n"; break;
            case 0x0c: out += "\\f"; break;
            case 0x0d: out += "\\r"; break;
            case 0x22: out += '\\"'; break;
            case 0x5c: out += "\\\\"; break;
            default:
                out += c < 0x20 ? `\\u${c.toString(16).padStart(4, "0")}` : value[i]!;
        }
    }
    return `${out}"`;
}

// RFC 8785 section 3.2.3: object members sorted by their names as arrays of
// UTF-16 code units.
function compareUtf16(a: string, b: string): number {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i += 1) {
        const x = a.charCodeAt(i);
        const y = b.charCodeAt(i);
        if (x !== y) return x < y ? -1 : 1;
    }
    return a.length - b.length;
}

export function jcs(value: JcsValue): string {
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") {
        // The evidence records hold only safe integers (causal-conformance.md
        // section 4); other numbers would need the full ES number formatter.
        if (!Number.isSafeInteger(value)) fail("jcs-unsupported", `non-safe-integer number ${value}`);
        return Object.is(value, -0) ? "0" : String(value);
    }
    if (typeof value === "string") return jcsString(value);
    if (Array.isArray(value)) return `[${value.map((item) => jcs(item)).join(",")}]`;
    const object = value as { readonly [key: string]: JcsValue };
    const keys = Object.keys(object).sort(compareUtf16);
    return `{${keys.map((key) => `${jcsString(key)}:${jcs(object[key]!)}`).join(",")}}`;
}

export function sha256HexOfJcs(value: JcsValue): string {
    return hex(sha256(new TextEncoder().encode(jcs(value))));
}

// ---------------------------------------------------------------------------
// Node accessors (used when rebuilding evidence records from an outcome)
// ---------------------------------------------------------------------------

export function field(node: BirNode, key: string): BirNode | undefined {
    if (node.kind !== "record" && node.kind !== "map") throw new Error(`expected record/map, got ${node.kind}`);
    return node.entries.find(([k]) => k === key)?.[1];
}

export function req(node: BirNode, key: string): BirNode {
    const value = field(node, key);
    if (value === undefined) throw new Error(`missing field ${key}`);
    return value;
}

export function str(node: BirNode): string {
    if (node.kind !== "string") throw new Error(`expected string, got ${node.kind}`);
    return node.value;
}

export function int(node: BirNode): number {
    if (node.kind !== "integer") throw new Error(`expected integer, got ${node.kind}`);
    const value = Number(node.value);
    if (!Number.isSafeInteger(value)) throw new Error("integer is not a safe integer");
    return value;
}

export function elements(node: BirNode): readonly BirNode[] {
    if (node.kind === "set") return node.members;
    if (node.kind === "sequence") return node.items;
    throw new Error(`expected set/sequence, got ${node.kind}`);
}

// "an empty optional collection is identified with an absent one"
export function optionalElements(node: BirNode | undefined): readonly BirNode[] {
    return node === undefined ? [] : elements(node);
}

export function canonicalSort(values: readonly string[]): string[] {
    return [...values].sort(compareCanonicalStrings);
}

// "Exact values serialize as {"kind":"rational","numerator":"…","denominator":"…"},
// {"kind":"boolean","value":…}, or {"kind":"symbol","value":"…"}."
export function exactValueJson(node: BirNode): JcsValue {
    switch (node.kind) {
        case "rational":
            return { kind: "rational", numerator: node.numerator.toString(), denominator: node.denominator.toString() };
        case "exact-boolean":
            return { kind: "boolean", value: node.value };
        case "symbol":
            return { kind: "symbol", value: node.value };
        default:
            throw new Error(`not an exact value: ${node.kind}`);
    }
}

// ---------------------------------------------------------------------------
// Evidence-id derivations (causal-conformance.md section 4)
// ---------------------------------------------------------------------------

export type EvidenceKind = "branch-step" | "transfer-frontier" | "world-lineage" | "retirement-residue";

export interface EvidenceCheck {
    readonly kind: EvidenceKind;
    readonly path: string;
    readonly stored: string;
    readonly recomputed: string;
    readonly record: JcsValue;
}

// "Each is lowercase-hex SHA-256 over the RFC 8785 JSON Canonicalization
// Scheme serialization of a fixed record, truncated as stated."
// "+ 16 and + 20 mean the first 16 or 20 lowercase hexadecimal characters of
// the digest (8 or 10 bytes), appended to the prefix. full 64 means all 64
// characters with no prefix."
function evidenceId(prefix: string, hexLength: number, record: JcsValue): string {
    return `${prefix}${sha256HexOfJcs(record).slice(0, hexLength)}`;
}

function strings(node: BirNode | undefined): string[] {
    return optionalElements(node).map(str);
}

function fieldMapJson(node: BirNode): JcsValue {
    if (node.kind !== "map") throw new Error(`expected field map, got ${node.kind}`);
    const out: { [key: string]: JcsValue } = {};
    for (const [key, value] of node.entries) out[key] = exactValueJson(value);
    return out;
}

// Recomputes every section-4 evidence id the outcome carries, from the decoded
// outcome alone. Commit-state digests are not recomputed: causal-conformance.md
// section 4 says they are "not reconstructible from the outcome alone".
export function recomputeEvidence(outcome: BirNode): EvidenceCheck[] {
    const checks: EvidenceCheck[] = [];
    for (const collection of ["autonomousContinuations", "continuations"]) {
        optionalElements(field(outcome, collection)).forEach((continuation) => {
            const base = `${collection}[${str(req(continuation, "id"))}]`;
            checks.push(...recomputeContinuationEvidence(continuation, base));
        });
    }
    return checks;
}

function recomputeContinuationEvidence(continuation: BirNode, base: string): EvidenceCheck[] {
    const checks: EvidenceCheck[] = [];
    const order = field(continuation, "order");
    const frontiers = order === undefined ? [] : optionalElements(field(order, "evaluationFrontiers")).map(strings);
    const frontierOfEvent = (eventId: string): number => frontiers.findIndex((frontier) => frontier.includes(eventId));
    const ledger = optionalElements(field(continuation, "ledger"));

    // Branch steps: { parent, frontierIndex, realizedLawIds }. "parent lists the
    // ids of every earlier step of that realization's branch lineage, in lineage
    // order (root first; empty for a first branch)"; "realizedLawIds lists the
    // ids of the laws the child realizes, in canonical string order". The
    // outcome's branchLineage is a sequence, root first, so its order is the
    // lineage order. Parents are chained from the recomputed ids.
    const steps = optionalElements(field(continuation, "branchLineage"));
    const stepIds: string[] = [];
    steps.forEach((step, index) => {
        const record: JcsValue = {
            parent: [...stepIds],
            frontierIndex: int(req(step, "frontierIndex")),
            realizedLawIds: canonicalSort(strings(field(step, "realizedLawIds"))),
        };
        const recomputed = evidenceId("branch:", 16, record);
        checks.push({ kind: "branch-step", path: `${base}.branchLineage[${index}].id`, stored: str(req(step, "id")), recomputed, record });
        stepIds.push(recomputed);
    });
    // Where each step sits in order.evaluationFrontiers. A step "is recorded
    // before its frontier's laws apply", so it sits at the evaluation frontier
    // that holds its realized laws' events. DERIVED (the documents do not say
    // how to locate a step in the outcome): a realized law's event is found
    // through the ledger record whose lawId is that law and whose eventId lies
    // in an evaluation frontier; the earliest such frontier is the step's.
    const stepPositions = steps.map((step) => {
        const lawIds = new Set(strings(field(step, "realizedLawIds")));
        let position = Number.POSITIVE_INFINITY;
        for (const record of ledger) {
            const lawId = field(record, "lawId");
            const eventId = field(record, "eventId");
            if (lawId === undefined || eventId === undefined || !lawIds.has(str(lawId))) continue;
            const at = frontierOfEvent(str(eventId));
            if (at >= 0) position = Math.min(position, at);
        }
        if (!Number.isFinite(position)) throw new Error(`${base}: branch step ${str(req(step, "id"))} has no realized event in any frontier`);
        return position;
    });

    // Transfer frontiers: "The internal laws of one closure frontier that name an
    // anchor transfer cause one transfer frontier ... Those events form one entry
    // of order.evaluationFrontiers and all carry the same frontierId. The record
    // is the array of { lawId, transferId } for those laws, ordered by lawId in
    // canonical string order; ties cannot occur."
    const transfers = optionalElements(field(continuation, "anchorTransferEvents"));
    const groups = new Map<number, BirNode[]>();
    for (const event of transfers) {
        const eventId = str(req(event, "id"));
        const frontierIndex = frontierOfEvent(eventId);
        if (frontierIndex < 0) throw new Error(`${base}: transfer event ${eventId} lies in no evaluation frontier`);
        groups.set(frontierIndex, [...(groups.get(frontierIndex) ?? []), event]);
    }
    for (const [frontierIndex, events] of groups) {
        const members = events
            .map((event) => ({ lawId: str(req(event, "lawId")), transferId: str(req(event, "transferId")) }))
            .sort((a, b) => compareCanonicalStrings(a.lawId, b.lawId));
        for (let i = 1; i < members.length; i += 1) {
            if (members[i - 1]!.lawId === members[i]!.lawId) throw new Error(`${base}: two transfers of law ${members[i]!.lawId} in one frontier`);
        }
        const record: JcsValue = members;
        const recomputed = evidenceId("transfer-frontier:", 16, record);
        for (const event of events) {
            checks.push({
                kind: "transfer-frontier",
                path: `${base}.anchorTransferEvents[${str(req(event, "id"))}].frontierId (frontier ${frontierIndex})`,
                stored: str(req(event, "frontierId")),
                recomputed,
                record,
            });
        }
    }

    // World lineage: { targetWorldId, sourceWorldIds, causedByLawEventIds,
    // parentLineages, branchLineage } with sourceWorldIds and causedByLawEventIds
    // in canonical string order; parentLineages, per source world in that order,
    // is "that world's lifecycle lineageId at spawn time (assigned by an earlier
    // spawn in the same realization or by its worldLifecycleOverrides entry), or
    // initial:<worldId> when it has none"; "A lineage id never changes once
    // assigned, so a source world's lifecycle.lineageId in the continuation's
    // final worldStates is its lineage at spawn time." branchLineage "lists the
    // ids of the steps of the realization's branch lineage at the moment of the
    // spawn ... It includes the step created at the spawning frontier itself ...
    // and it excludes steps created later."
    const lifecycleEvents = optionalElements(field(continuation, "lifecycleEvents"));
    const worldStates = optionalElements(field(continuation, "worldStates"));
    const finalLineage = new Map<string, string>();
    for (const state of worldStates) {
        const lifecycle = field(state, "lifecycle");
        const lineageId = lifecycle === undefined ? undefined : field(lifecycle, "lineageId");
        if (lineageId !== undefined) finalLineage.set(str(req(state, "worldId")), str(lineageId));
    }
    const lineageEventByTarget = new Map<string, BirNode>();
    for (const event of lifecycleEvents) {
        if (field(event, "lineageId") !== undefined) lineageEventByTarget.set(str(req(event, "targetWorldId")), event);
    }
    const lineageMemo = new Map<string, { id: string; record: JcsValue }>();
    const lineageOf = (event: BirNode, visiting: Set<string>): { id: string; record: JcsValue } => {
        const target = str(req(event, "targetWorldId"));
        const memo = lineageMemo.get(target);
        if (memo !== undefined) return memo;
        if (visiting.has(target)) throw new Error(`${base}: cyclic lineage through ${target}`);
        visiting.add(target);
        const sourceWorldIds = canonicalSort(strings(field(event, "sourceWorldIds")));
        const parentLineages = sourceWorldIds.map((worldId) => {
            const parentEvent = lineageEventByTarget.get(worldId);
            if (parentEvent !== undefined) return lineageOf(parentEvent, visiting).id;
            return finalLineage.get(worldId) ?? `initial:${worldId}`;
        });
        const causedByLawEventIds = canonicalSort(strings(field(event, "causedByLawEventIds")));
        const spawnPositions = causedByLawEventIds.map(frontierOfEvent).filter((at) => at >= 0);
        if (spawnPositions.length === 0) throw new Error(`${base}: spawn ${str(req(event, "id"))} has no law event in any frontier`);
        const spawnPosition = Math.min(...spawnPositions);
        const record: JcsValue = {
            targetWorldId: target,
            sourceWorldIds,
            causedByLawEventIds,
            parentLineages,
            branchLineage: stepIds.filter((_, index) => stepPositions[index]! <= spawnPosition),
        };
        const result = { id: evidenceId("lineage:", 20, record), record };
        lineageMemo.set(target, result);
        return result;
    };
    for (const event of lifecycleEvents) {
        if (field(event, "lineageId") === undefined) continue;
        const { id, record } = lineageOf(event, new Set());
        checks.push({ kind: "world-lineage", path: `${base}.lifecycleEvents[${str(req(event, "id"))}].lineageId`, stored: str(req(event, "lineageId")), recomputed: id, record });
    }
    // The same id is repeated in the spawned world's final lifecycle state. A
    // lineage with no spawn event here comes from worldLifecycleOverrides and is
    // an input, not a derived id.
    for (const [worldId, stored] of finalLineage) {
        const event = lineageEventByTarget.get(worldId);
        if (event === undefined) continue;
        const { id, record } = lineageOf(event, new Set());
        checks.push({ kind: "world-lineage", path: `${base}.worldStates[${worldId}].lifecycle.lineageId`, stored, recomputed: id, record });
    }

    // Retirement residue: "{ fields, intrinsicViability, seaContribution } of
    // the retired world's final state ... the record equals that world's entry
    // in the continuation's final worldStates and is reproducible from the
    // outcome alone" (under a sea medium, after the retirement's sea release).
    // The retired world is the retirement event's targetWorldId.
    for (const event of lifecycleEvents) {
        const residue = field(event, "residue");
        const stored = residue === undefined ? undefined : field(residue, "finalStateDigest");
        if (stored === undefined) continue;
        const worldId = str(req(event, "targetWorldId"));
        const state = worldStates.find((candidate) => str(req(candidate, "worldId")) === worldId);
        if (state === undefined) throw new Error(`${base}: retired world ${worldId} has no final state`);
        const record: JcsValue = {
            fields: fieldMapJson(req(state, "fields")),
            intrinsicViability: exactValueJson(req(state, "intrinsicViability")),
            seaContribution: exactValueJson(req(state, "seaContribution")),
        };
        checks.push({
            kind: "retirement-residue",
            path: `${base}.lifecycleEvents[${str(req(event, "id"))}].residue.finalStateDigest`,
            stored: str(stored),
            recomputed: sha256HexOfJcs(record),
            record,
        });
    }
    return checks;
}

// Plain JSON view of a node, for inspection and error messages only.
export function toPlain(node: BirNode): unknown {
    switch (node.kind) {
        case "structural-boolean":
            return node.value;
        case "integer":
            return Number.isSafeInteger(Number(node.value)) ? Number(node.value) : node.value.toString();
        case "string":
            return node.value;
        case "sequence":
            return node.items.map(toPlain);
        case "set":
            return { $set: node.members.map(toPlain) };
        case "record":
            return Object.fromEntries(node.entries.map(([k, v]) => [k, toPlain(v)]));
        case "map":
            return { $map: Object.fromEntries(node.entries.map(([k, v]) => [k, toPlain(v)])) };
        default:
            return exactValueJson(node);
    }
}

// ---------------------------------------------------------------------------
// Schema appendix (docs/reference/bir-schemas.md)
//
// The appendix tables are parsed as data, and a schema-driven converter maps
// between BIR nodes and the plain JSON a backend holds. Encoding from JSON
// uses only the appendix's per-position node kinds and presence rules; the
// JSON itself carries no node kinds, no set order, and (for the outcome) empty
// optional collections that the appendix says to omit.
// ---------------------------------------------------------------------------

export type Presence =
    | "root"
    | "required"
    | "required-even-if-empty"
    | "optional"
    | "optional-kept-if-empty"
    | "optional-omitted-if-empty"
    | "member"
    | "item"
    | "value";

export type Schema =
    | { readonly type: "text" | "bool" | "safe-integer" | "integer-text" | "exact" }
    | { readonly type: "literal"; readonly value: string }
    | { readonly type: "record"; readonly fields: ReadonlyMap<string, FieldSchema> }
    | { readonly type: "variant"; readonly tagField: string; readonly alternatives: ReadonlyMap<string, ReadonlyMap<string, FieldSchema>> }
    | { readonly type: "set" | "seq"; readonly element: Schema }
    | { readonly type: "map"; readonly value: Schema };

export interface FieldSchema {
    readonly presence: Presence;
    readonly schema: Schema;
}

interface SchemaRow {
    readonly path: string;
    readonly presence: Presence;
    readonly schema: string;
    readonly tag: string;
}

const PRESENCE: Record<string, Presence> = {
    root: "root",
    required: "required",
    "required, even if empty": "required-even-if-empty",
    optional: "optional",
    "optional, kept if empty": "optional-kept-if-empty",
    "optional, omitted if empty": "optional-omitted-if-empty",
    member: "member",
    item: "item",
    value: "value",
};

// "Node tag. The tag byte, in hex, of the node at that position."
const TAG_CELL: Record<string, string> = {
    record: "`07`",
    variant: "`07`",
    set: "`06`",
    seq: "`05`",
    map: "`08`",
    text: "`04`",
    literal: "`04`",
    bool: "`01` / `02`",
    "safe-integer": "`03`",
    "integer-text": "`03`",
    exact: "`10` / `11` / `12` / `13`",
};

function schemaError(message: string): never {
    fail("schema", message);
}

// "$ is the payload's root node. .name is a record field, [] is a member of a
// set or an item of a sequence, {} is a value of a map (map keys are data),
// and <tag> selects one alternative of a variant."
const LAST_SEGMENT = /(\.[A-Za-z0-9_]+|\[\]|\{\}|<[^<>]+>)$/;

function splitLast(path: string): { parent: string; segment: string } | undefined {
    const match = LAST_SEGMENT.exec(path);
    if (match === null) return undefined;
    return { parent: path.slice(0, path.length - match[1]!.length), segment: match[1]! };
}

function cellsOf(line: string): string[] {
    return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function unbacktick(cell: string): string {
    return cell.replace(/^`|`$/g, "");
}

export function parseSchemaAppendix(markdown: string): Map<string, Schema> {
    const rowsBySection = new Map<string, SchemaRow[]>();
    let section: string | undefined;
    for (const line of markdown.split(/\r?\n/)) {
        const heading = /^## (.+?)\s*$/.exec(line);
        if (heading !== null) {
            section = SECTION_NAME.test(heading[1]!) ? heading[1]! : undefined;
            if (section !== undefined) rowsBySection.set(section, []);
            continue;
        }
        if (section === undefined || !line.startsWith("| `$")) continue;
        const cells = cellsOf(line);
        if (cells.length !== 4) schemaError(`row with ${cells.length} cells: ${line}`);
        const presence = PRESENCE[cells[1]!];
        if (presence === undefined) schemaError(`unknown presence ${JSON.stringify(cells[1])} at ${cells[0]}`);
        rowsBySection.get(section)!.push({ path: unbacktick(cells[0]!), presence, schema: cells[2]!, tag: cells[3]! });
    }
    const schemas = new Map<string, Schema>();
    for (const [name, rows] of rowsBySection) schemas.set(name, buildSectionSchema(name, rows));
    return schemas;
}

function buildSectionSchema(section: string, rows: readonly SchemaRow[]): Schema {
    const byPath = new Map<string, SchemaRow>();
    const children = new Map<string, { segment: string; path: string }[]>();
    for (const row of rows) {
        if (byPath.has(row.path)) schemaError(`${section}: duplicate row ${row.path}`);
        byPath.set(row.path, row);
        if (row.path === "$") continue;
        const split = splitLast(row.path);
        if (split === undefined) schemaError(`${section}: unparsable path ${row.path}`);
        children.set(split.parent, [...(children.get(split.parent) ?? []), { segment: split.segment, path: row.path }]);
    }
    const root = byPath.get("$");
    if (root === undefined || root.presence !== "root") schemaError(`${section}: no root row`);

    const built = new Map<string, Schema>();
    const fieldsOf = (path: string): Map<string, FieldSchema> => {
        const fields = new Map<string, FieldSchema>();
        let previous: string | undefined;
        for (const child of children.get(path) ?? []) {
            if (!child.segment.startsWith(".")) continue;
            const key = child.segment.slice(1);
            // "The fields of a record are listed in canonical string order of their keys".
            if (previous !== undefined && compareCanonicalStrings(previous, key) >= 0) {
                schemaError(`${section}: field ${child.path} is not in canonical order after ${previous}`);
            }
            previous = key;
            fields.set(key, { presence: byPath.get(child.path)!.presence, schema: build(child.path) });
        }
        return fields;
    };
    const elementOf = (path: string, segment: "[]" | "{}"): Schema => {
        const elementPath = `${path}${segment}`;
        if (!byPath.has(elementPath)) schemaError(`${section}: ${path} has no ${segment} row`);
        return build(elementPath);
    };
    function build(path: string): Schema {
        const existing = built.get(path);
        if (existing !== undefined) return existing;
        const row = byPath.get(path);
        if (row === undefined) schemaError(`${section}: no row for ${path}`);
        const text = row.schema;
        const reference = /same schema as `([^`]+)`/.exec(text);
        const head = text.split(",")[0]!.trim();
        const baseType = head.startsWith("variant") ? "variant" : head.startsWith("literal") ? "literal" : head.split(" ")[0]!;
        const expectedTag = TAG_CELL[baseType];
        if (expectedTag === undefined) schemaError(`${section}: unknown schema ${JSON.stringify(text)} at ${path}`);
        if (row.tag !== expectedTag) schemaError(`${section}: ${path} is ${baseType} but its tag cell is ${row.tag}`);
        if (reference !== null) {
            // "same schema as P": exactly the schema listed under P (possibly an
            // ancestor, for recursive positions).
            const target = build(reference[1]!);
            const targetType = target.type === "variant" ? "variant" : target.type;
            if (targetType !== baseType) schemaError(`${section}: ${path} says ${baseType} but ${reference[1]} is ${targetType}`);
            built.set(path, target);
            return target;
        }
        switch (baseType) {
            case "record": {
                const fields = new Map<string, FieldSchema>();
                const schema: Schema = { type: "record", fields };
                built.set(path, schema);
                for (const [k, v] of fieldsOf(path)) fields.set(k, v);
                return schema;
            }
            case "variant": {
                const tagField = /variant on `([^`]+)`/.exec(text)?.[1];
                if (tagField === undefined) schemaError(`${section}: variant without tag field at ${path}`);
                const tags = [...text.matchAll(/`"([^"]*)"`/g)].map((match) => match[1]!);
                const alternatives = new Map<string, Map<string, FieldSchema>>();
                const schema: Schema = { type: "variant", tagField, alternatives };
                built.set(path, schema);
                for (const tag of tags) {
                    const fields = fieldsOf(`${path}<${tag}>`);
                    const tagSpec = fields.get(tagField);
                    // "the tag field is listed in each alternative as a literal"
                    if (tagSpec === undefined || tagSpec.schema.type !== "literal" || tagSpec.schema.value !== tag || tagSpec.presence !== "required") {
                        schemaError(`${section}: alternative ${path}<${tag}> does not carry ${tagField} = literal "${tag}"`);
                    }
                    alternatives.set(tag, fields);
                }
                return schema;
            }
            case "set":
            case "seq": {
                const schema = { type: baseType, element: undefined as unknown as Schema };
                built.set(path, schema);
                schema.element = elementOf(path, "[]");
                return schema;
            }
            case "map": {
                const schema = { type: "map" as const, value: undefined as unknown as Schema };
                built.set(path, schema);
                schema.value = elementOf(path, "{}");
                return schema;
            }
            case "literal": {
                const value = /literal `"([^"]*)"`/.exec(text)?.[1];
                if (value === undefined) schemaError(`${section}: literal without value at ${path}`);
                const schema: Schema = { type: "literal", value };
                built.set(path, schema);
                return schema;
            }
            default: {
                const schema = { type: baseType } as Schema;
                built.set(path, schema);
                return schema;
            }
        }
    }
    const schema = build("$");
    if (schema.type !== "record") schemaError(`${section}: root is not a record`);
    // Every row must be reachable from the root.
    for (const row of rows) if (!built.has(row.path)) schemaError(`${section}: row ${row.path} is not reachable from $`);
    return schema;
}

export type HostJson = null | boolean | number | string | HostJson[] | { [key: string]: HostJson };

export interface ToHostOptions {
    // Outcome only: a backend holds empty arrays for collections the appendix
    // marks "optional, omitted if empty"; materialize them.
    readonly materializeOmittedEmpty?: boolean;
    // Arbitrary host order for set members and object keys.
    readonly permute?: <T>(items: T[]) => T[];
}

function isCollectionPresence(presence: Presence): boolean {
    return presence === "required-even-if-empty" || presence === "optional-kept-if-empty" || presence === "optional-omitted-if-empty";
}

function checkPresenceKind(path: string, spec: FieldSchema): void {
    const collection = spec.schema.type === "set" || spec.schema.type === "seq" || spec.schema.type === "map";
    if (collection !== isCollectionPresence(spec.presence) && spec.presence !== "member" && spec.presence !== "item" && spec.presence !== "value") {
        schemaError(`${path}: presence ${spec.presence} does not fit a ${spec.schema.type}`);
    }
}

// Validates a decoded node against the appendix (unknown keys BIRL12, absent
// required fields BIRL11, node kinds per the tag column) and converts it to the
// plain JSON a backend would hold.
export function nodeToHost(node: BirNode, schema: Schema, options: ToHostOptions = {}, path = "$"): HostJson {
    const permute = options.permute ?? (<T>(items: T[]) => items);
    const expect = (kind: BirNode["kind"] | readonly BirNode["kind"][]) => {
        const kinds = typeof kind === "string" ? [kind] : kind;
        if (!kinds.includes(node.kind)) schemaError(`${path}: expected ${kinds.join("/")}, found ${node.kind}`);
    };
    switch (schema.type) {
        case "text":
            expect("string");
            return (node as { value: string }).value;
        case "literal":
            expect("string");
            if ((node as { value: string }).value !== schema.value) schemaError(`${path}: expected literal ${schema.value}`);
            return schema.value;
        case "bool":
            expect("structural-boolean");
            return (node as { value: boolean }).value;
        case "safe-integer": {
            expect("integer");
            const value = (node as { value: bigint }).value;
            if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < -BigInt(Number.MAX_SAFE_INTEGER)) schemaError(`${path}: not a safe integer`);
            return Number(value);
        }
        case "integer-text":
            expect("integer");
            return (node as { value: bigint }).value.toString();
        case "exact":
            expect(["rational", "exact-boolean", "symbol"]);
            return exactValueJson(node) as HostJson;
        case "set":
        case "seq": {
            expect(schema.type === "set" ? "set" : "sequence");
            const items = elements(node).map((item, index) => nodeToHost(item, schema.element, options, `${path}[${index}]`));
            return schema.type === "set" ? permute(items) : items;
        }
        case "map": {
            expect("map");
            const entries = (node as { entries: readonly (readonly [string, BirNode])[] }).entries.map(
                ([key, value]) => [key, nodeToHost(value, schema.value, options, `${path}{${key}}`)] as [string, HostJson],
            );
            return Object.fromEntries(permute(entries));
        }
        case "record":
            expect("record");
            return recordToHost(node, schema.fields, options, path);
        case "variant": {
            expect("record");
            const tagNode = field(node, schema.tagField);
            if (tagNode === undefined || tagNode.kind !== "string") schemaError(`${path}: variant without string ${schema.tagField}`);
            const fields = schema.alternatives.get(tagNode.value);
            if (fields === undefined) schemaError(`${path}: unknown variant tag ${tagNode.value}`);
            return recordToHost(node, fields, options, `${path}<${tagNode.value}>`);
        }
    }
}

function recordToHost(node: BirNode, fields: ReadonlyMap<string, FieldSchema>, options: ToHostOptions, path: string): HostJson {
    const permute = options.permute ?? (<T>(items: T[]) => items);
    const entries = (node as { entries: readonly (readonly [string, BirNode])[] }).entries;
    for (const [key] of entries) if (!fields.has(key)) schemaError(`BIRL12: ${path}.${key} is not in the schema`);
    const out: [string, HostJson][] = [];
    for (const [key, spec] of fields) {
        checkPresenceKind(`${path}.${key}`, spec);
        const value = entries.find(([k]) => k === key)?.[1];
        if (value === undefined) {
            if (spec.presence === "required" || spec.presence === "required-even-if-empty") schemaError(`BIRL11: ${path}.${key} is required`);
            if (spec.presence === "optional-omitted-if-empty" && options.materializeOmittedEmpty) out.push([key, []]);
            continue;
        }
        if (spec.presence === "optional-omitted-if-empty" && elements(value).length === 0) {
            schemaError(`${path}.${key} is encoded empty although the appendix omits it when empty`);
        }
        out.push([key, nodeToHost(value, spec.schema, options, `${path}.${key}`)]);
    }
    return Object.fromEntries(permute(out));
}

export interface FromHostOptions {
    // "Fields the run carries outside the schema are dropped before encoding"
    // (outcome only); elsewhere a field outside the schema is rejected (BIRL01).
    readonly dropUnknown?: boolean;
}

const CANONICAL_DECIMAL = /^(0|-?[1-9][0-9]*)$/;
const POSITIVE_DECIMAL = /^[1-9][0-9]*$/;

function isObject(value: HostJson): value is { [key: string]: HostJson } {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Builds the BIR node for a host JSON value using only the appendix schema.
export function hostToNode(value: HostJson, schema: Schema, options: FromHostOptions = {}, path = "$"): BirNode {
    switch (schema.type) {
        case "text":
            if (typeof value !== "string") schemaError(`${path}: expected text`);
            return { kind: "string", value };
        case "literal":
            if (value !== schema.value) schemaError(`${path}: expected literal ${schema.value}`);
            return { kind: "string", value: schema.value };
        case "bool":
            if (typeof value !== "boolean") schemaError(`${path}: expected boolean`);
            return { kind: "structural-boolean", value };
        case "safe-integer":
            if (typeof value !== "number" || !Number.isSafeInteger(value)) schemaError(`${path}: expected a safe integer`);
            return { kind: "integer", value: BigInt(value) };
        case "integer-text":
            if (typeof value !== "string" || !CANONICAL_DECIMAL.test(value) || value === "-0") schemaError(`${path}: expected a canonical decimal string`);
            return { kind: "integer", value: BigInt(value) };
        case "exact":
            return exactFromHost(value, path);
        case "set":
        case "seq": {
            if (!Array.isArray(value)) schemaError(`${path}: expected an array`);
            const items = value.map((item, index) => hostToNode(item, schema.element, options, `${path}[${index}]`));
            return schema.type === "set" ? { kind: "set", members: items } : { kind: "sequence", items };
        }
        case "map": {
            if (!isObject(value)) schemaError(`${path}: expected an object`);
            return { kind: "map", entries: Object.entries(value).map(([key, item]) => [key, hostToNode(item, schema.value, options, `${path}{${key}}`)] as const) };
        }
        case "record":
            if (!isObject(value)) schemaError(`${path}: expected an object`);
            return recordFromHost(value, schema.fields, options, path);
        case "variant": {
            if (!isObject(value)) schemaError(`${path}: expected an object`);
            const tag = value[schema.tagField];
            const fields = typeof tag === "string" ? schema.alternatives.get(tag) : undefined;
            if (fields === undefined) schemaError(`${path}: unknown variant tag ${JSON.stringify(tag)}`);
            return recordFromHost(value, fields, options, `${path}<${tag as string}>`);
        }
    }
}

function recordFromHost(value: { [key: string]: HostJson }, fields: ReadonlyMap<string, FieldSchema>, options: FromHostOptions, path: string): BirNode {
    for (const key of Object.keys(value)) {
        if (!fields.has(key) && !options.dropUnknown) schemaError(`BIRL01: ${path}.${key} is outside the schema`);
    }
    const entries: (readonly [string, BirNode])[] = [];
    for (const [key, spec] of fields) {
        const has = Object.prototype.hasOwnProperty.call(value, key);
        const item = has ? value[key]! : undefined;
        if (item === undefined) {
            if (spec.presence === "required" || spec.presence === "required-even-if-empty") schemaError(`${path}.${key} is required`);
            continue;
        }
        // "an optional set or sequence that would be empty is omitted"
        if (spec.presence === "optional-omitted-if-empty" && Array.isArray(item) && item.length === 0) continue;
        entries.push([key, hostToNode(item, spec.schema, options, `${path}.${key}`)]);
    }
    return { kind: "record", entries };
}

function exactFromHost(value: HostJson, path: string): BirNode {
    if (!isObject(value)) schemaError(`${path}: expected an exact value object`);
    switch (value.kind) {
        case "rational": {
            const { numerator, denominator } = value;
            if (typeof numerator !== "string" || !CANONICAL_DECIMAL.test(numerator) || numerator === "-0") schemaError(`${path}: BIRL06 numerator`);
            if (typeof denominator !== "string" || !POSITIVE_DECIMAL.test(denominator)) schemaError(`${path}: BIRL06 denominator`);
            const node: BirNode = { kind: "rational", numerator: BigInt(numerator), denominator: BigInt(denominator) };
            if (gcd(node.numerator, node.denominator) !== 1n) schemaError(`${path}: BIRL06 rational is not reduced`);
            return node;
        }
        case "boolean":
            if (typeof value.value !== "boolean") schemaError(`${path}: exact boolean value`);
            return { kind: "exact-boolean", value: value.value };
        case "symbol":
            if (typeof value.value !== "string") schemaError(`${path}: exact symbol value`);
            return { kind: "symbol", value: value.value };
        default:
            schemaError(`${path}: unknown exact kind ${JSON.stringify(value.kind)}`);
    }
}

// The section rule the appendix states for unknown host fields.
export function encodeSectionFromHost(section: string, host: HostJson, schemas: ReadonlyMap<string, Schema>): Uint8Array {
    const schema = schemas.get(section);
    if (schema === undefined) schemaError(`no schema for ${section}`);
    return encodeNode(hostToNode(host, schema, { dropUnknown: section === "conformance.causal-outcome" }));
}
