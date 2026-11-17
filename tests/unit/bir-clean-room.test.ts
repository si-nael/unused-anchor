// Tests for the clean-room BIR v1 implementation in
// tests/conformance-clean-room/clean-room-bir.ts. Expected values come from
// the text of docs/reference/bubble-ir.md and docs/reference/causal-conformance.md,
// or from the committed manifest / inspection artifacts; none come from
// reading the reference implementation under src/.

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import * as bir from "../conformance-clean-room/clean-room-bir";

const repo = resolve(__dirname, "..", "..");
const corpusDir = resolve(repo, "data", "conformance", "causal");

interface ManifestFixture {
    name: string;
    description: string;
    file: string;
    byteLength: number;
    inputSemanticDigest: string;
    storageDigest: string;
    outcomeDigest: string;
    status: string;
    resourceVerdict: Record<string, boolean>;
    hostCost: Record<string, number>;
}

interface Manifest {
    outcomeMode: string;
    fixtures: ManifestFixture[];
}

const manifest = JSON.parse(readFileSync(resolve(corpusDir, "manifest.json"), "utf8")) as Manifest;

function readBytes(path: string): Uint8Array {
    return new Uint8Array(readFileSync(path));
}

function fixtureBytes(fixture: ManifestFixture): Uint8Array {
    return readBytes(resolve(corpusDir, fixture.file));
}

function rejects(fn: () => unknown, code: bir.CleanRoomErrorCode): void {
    assert.throws(fn, (error: unknown) => {
        assert.ok(error instanceof bir.CleanRoomBirError, `expected CleanRoomBirError, got ${String(error)}`);
        assert.equal(error.code, code, error.message);
        return true;
    });
}

const b = (...values: number[]) => Uint8Array.from(values);
const s = (value: string): bir.BirNode => ({ kind: "string", value });
const i = (value: number | bigint): bir.BirNode => ({ kind: "integer", value: BigInt(value) });
const q = (numerator: number, denominator: number): bir.BirNode => ({ kind: "rational", numerator: BigInt(numerator), denominator: BigInt(denominator) });
const set = (...members: bir.BirNode[]): bir.BirNode => ({ kind: "set", members });
const seq = (...items: bir.BirNode[]): bir.BirNode => ({ kind: "sequence", items });
const rec = (entries: Record<string, bir.BirNode>): bir.BirNode => ({ kind: "record", entries: Object.entries(entries) });
const map = (entries: Record<string, bir.BirNode>): bir.BirNode => ({ kind: "map", entries: Object.entries(entries) });
const sha = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");

function splice(bytes: Uint8Array, start: number, end: number, replacement: Uint8Array): Uint8Array {
    return bir.concatBytes([bytes.subarray(0, start), replacement, bytes.subarray(end)]);
}

function findNode(root: bir.BirNode, predicate: (node: bir.BirNode) => boolean): bir.BirNode | undefined {
    if (predicate(root)) return root;
    const children =
        root.kind === "set" ? root.members : root.kind === "sequence" ? root.items : root.kind === "record" || root.kind === "map" ? root.entries.map(([, v]) => v) : [];
    for (const child of children) {
        const found = findNode(child, predicate);
        if (found !== undefined) return found;
    }
    return undefined;
}

function spanOf(node: bir.BirNode): { start: number; end: number } {
    const span = bir.nodeSpan(node);
    assert.ok(span, "decoded node has a span");
    return span;
}

// Re-envelopes a decoded document with one section payload replaced. The
// envelope encoder recomputes section lengths and the trailer, so the only
// defect left is the one introduced into the payload.
function withPayload(decoded: bir.DecodedBir, name: string, payload: Uint8Array): Uint8Array {
    return bir.encodeEnvelope({
        ...decoded.envelope,
        sections: decoded.envelope.sections.map((section) => (section.name === name ? { ...section, payload } : section)),
    });
}

interface RawSection {
    name: string;
    flags: number;
    payload: Uint8Array;
    lengthBytes?: Uint8Array;
}

// Writes an envelope exactly in the given order (bypassing the encoder's
// sorting and checks) and appends a correct SHA-256 trailer.
function rawEnvelope(sections: RawSection[], options: { major?: number; minor?: number; beforeTrailer?: Uint8Array } = {}): Uint8Array {
    const parts: Uint8Array[] = [bir.MAGIC, bir.encodeUvar(options.major ?? 1), bir.encodeUvar(options.minor ?? 0), bir.encodeUvar(sections.length)];
    for (const section of sections) {
        parts.push(bir.encodeText(section.name), bir.encodeUvar(section.flags), section.lengthBytes ?? bir.encodeUvar(section.payload.length), section.payload);
    }
    if (options.beforeTrailer) parts.push(options.beforeTrailer);
    const body = bir.concatBytes(parts);
    return bir.concatBytes([body, bir.sha256(body)]);
}

const EMPTY_RECORD = b(0x07, 0x00);

// ---------------------------------------------------------------------------
// bubble-ir.md section 2 and 3: string order and primitive encodings
// ---------------------------------------------------------------------------

test("clean-room: canonical string order is code point order (bubble-ir.md section 2 examples)", () => {
    const pairs: [string, string][] = [
        ["B", "a"],
        ["a-b", "a_b"],
        ["trace:10:x", "trace:1:x"],
        ["￿", "\u{1F600}"],
    ];
    for (const [lo, hi] of pairs) {
        assert.ok(bir.compareCanonicalStrings(lo, hi) < 0, `${JSON.stringify(lo)} < ${JSON.stringify(hi)}`);
        assert.ok(bir.compareCanonicalStrings(hi, lo) > 0);
    }
    // Not UTF-16 code-unit order: U+1F600 is 0xD83D... in UTF-16, below 0xFFFF.
    assert.ok("\u{1F600}" < "￿", "JavaScript string comparison is UTF-16 order and disagrees");
});

test("clean-room: uvar is minimal unsigned LEB128", () => {
    assert.deepEqual(bir.encodeUvar(0), b(0x00));
    assert.deepEqual(bir.encodeUvar(127), b(0x7f));
    assert.deepEqual(bir.encodeUvar(128), b(0x80, 0x01));
    assert.deepEqual(bir.encodeUvar(300), b(0xac, 0x02));
    const big = (1n << 70n) + 5n;
    assert.equal(new bir.ByteReader(bir.encodeUvar(big)).uvar(), big);
    assert.equal(new bir.ByteReader(b(0x00)).uvar(), 0n);
    // "a multi-byte encoding may not end with a 0x00 byte"
    rejects(() => new bir.ByteReader(b(0x80, 0x00)).uvar(), "non-minimal-uvar");
    rejects(() => new bir.ByteReader(b(0xff, 0x80, 0x00)).uvar(), "non-minimal-uvar");
    rejects(() => new bir.ByteReader(b(0x80)).uvar(), "truncated");
});

test("clean-room: signed integers are zigzag then uvar, with arbitrary precision", () => {
    const cases: [bigint, bigint][] = [
        [0n, 0n],
        [-1n, 1n],
        [1n, 2n],
        [-2n, 3n],
        [2n, 4n],
        [1n << 63n, 1n << 64n],
        [-(1n << 100n), (1n << 101n) - 1n],
    ];
    for (const [n, z] of cases) {
        assert.equal(bir.zigzag(n), z);
        assert.equal(bir.unzigzag(z), n);
        assert.deepEqual(bir.encodeNode(i(n)), bir.concatBytes([b(bir.TAG.integer), bir.encodeUvar(z)]));
        assert.deepEqual(bir.decodeNode(bir.encodeNode(i(n))), i(n));
    }
    // A non-minimal integer body is a non-canonical body.
    rejects(() => bir.decodeNode(b(0x03, 0x82, 0x00)), "non-minimal-uvar");
});

test("clean-room: text is length-prefixed well-formed UTF-8 and a leading BOM is content", () => {
    const bom = bir.decodeNode(b(0x04, 0x03, 0xef, 0xbb, 0xbf));
    assert.deepEqual(bom, s("﻿"));
    assert.deepEqual(bir.encodeNode(s("﻿")), b(0x04, 0x03, 0xef, 0xbb, 0xbf));
    assert.deepEqual(bir.encodeNode(s("\u{1F600}")), b(0x04, 0x04, 0xf0, 0x9f, 0x98, 0x80));
    for (const malformed of [b(0x04, 0x01, 0xff), b(0x04, 0x02, 0xc0, 0x80), b(0x04, 0x03, 0xed, 0xa0, 0x80), b(0x04, 0x02, 0xe2, 0x82)]) {
        rejects(() => bir.decodeNode(malformed), "malformed-utf8");
    }
    rejects(() => bir.encodeNode(s("\uD800")), "unpaired-surrogate");
    rejects(() => bir.encodeNode(s("a\uDC00")), "unpaired-surrogate");
    rejects(() => bir.decodeNode(b(0x04, 0x05, 0x61)), "length-overflow");
});

// ---------------------------------------------------------------------------
// bubble-ir.md section 4: nodes
// ---------------------------------------------------------------------------

test("clean-room: every node tag encodes to the bytes of the section 4 table and round-trips", () => {
    const cases: [bir.BirNode, Uint8Array][] = [
        [{ kind: "structural-boolean", value: false }, b(0x01)],
        [{ kind: "structural-boolean", value: true }, b(0x02)],
        [i(-3), b(0x03, 0x05)],
        [s("a"), b(0x04, 0x01, 0x61)],
        [seq(i(1), i(0)), b(0x05, 0x02, 0x03, 0x02, 0x03, 0x00)],
        [set(i(0)), b(0x06, 0x01, 0x03, 0x00)],
        [rec({ k: i(1) }), b(0x07, 0x01, 0x01, 0x6b, 0x03, 0x02)],
        [map({ k: i(1) }), b(0x08, 0x01, 0x01, 0x6b, 0x03, 0x02)],
        [q(-1, 2), b(0x10, 0x01, 0x02)],
        [q(0, 1), b(0x10, 0x00, 0x01)],
        [{ kind: "exact-boolean", value: false }, b(0x11)],
        [{ kind: "exact-boolean", value: true }, b(0x12)],
        [{ kind: "symbol", value: "s" }, b(0x13, 0x01, 0x73)],
    ];
    for (const [node, bytes] of cases) {
        assert.deepEqual(bir.encodeNode(node), bytes, `${node.kind} encoding`);
        assert.deepEqual(bir.decodeNode(bytes), node, `${node.kind} decoding`);
    }
    // Structural and exact booleans are distinct node kinds.
    assert.notDeepEqual(bir.decodeNode(b(0x01)), bir.decodeNode(b(0x11)));
});

test("clean-room: set members are ordered by their complete encodings, which is neither canonical nor length order", () => {
    // Full encodings: "b" = 04 01 62 < "aa" = 04 02 61 61, although "aa" < "b" canonically.
    const bytes = b(0x06, 0x02, 0x04, 0x01, 0x62, 0x04, 0x02, 0x61, 0x61);
    assert.deepEqual(bir.encodeNode(set(s("aa"), s("b"))), bytes);
    assert.deepEqual(bir.decodeNode(bytes), set(s("b"), s("aa")));
    rejects(() => bir.decodeNode(b(0x06, 0x02, 0x04, 0x02, 0x61, 0x61, 0x04, 0x01, 0x62)), "set-order");
    // bubble-ir.md section 4: "a 300-byte string (length bytes ac 02) precedes a 200-byte string (c8 01)".
    const long = s("x".repeat(300));
    const short = s("x".repeat(200));
    const ordered = bir.decodeNode(bir.encodeNode(set(short, long)));
    assert.ok(ordered.kind === "set");
    assert.deepEqual(ordered.members, [long, short]);
    assert.deepEqual(bir.encodeNode(long).subarray(0, 3), b(0x04, 0xac, 0x02));
    assert.deepEqual(bir.encodeNode(short).subarray(0, 3), b(0x04, 0xc8, 0x01));
    // Members of different kinds compare by tag byte first.
    assert.deepEqual(bir.encodeNode(set(s("a"), i(5))), b(0x06, 0x02, 0x03, 0x0a, 0x04, 0x01, 0x61));
    // "A set cannot contain two members with identical encodings"
    rejects(() => bir.decodeNode(b(0x06, 0x02, 0x03, 0x00, 0x03, 0x00)), "set-order");
    rejects(() => bir.encodeNode(set(i(0), i(0))), "set-order");
});

test("clean-room: record and map keys are ordered by canonical string order, not by encoding", () => {
    for (const tag of [0x07, 0x08]) {
        // "aa" < "b" in code point order even though its length prefix is larger.
        const sorted = b(tag, 0x02, 0x02, 0x61, 0x61, 0x01, 0x01, 0x62, 0x02);
        const decoded = bir.decodeNode(sorted);
        assert.ok(decoded.kind === "record" || decoded.kind === "map");
        assert.deepEqual(decoded.entries.map(([k]) => k), ["aa", "b"]);
        assert.deepEqual(bir.encodeNode(decoded), sorted);
        rejects(() => bir.decodeNode(b(tag, 0x02, 0x01, 0x62, 0x02, 0x02, 0x61, 0x61, 0x01)), "key-order");
        // "a record or map cannot repeat a key"
        rejects(() => bir.decodeNode(b(tag, 0x02, 0x01, 0x61, 0x01, 0x01, 0x61, 0x02)), "key-order");
    }
    rejects(() => bir.encodeNode({ kind: "record", entries: [["a", i(0)], ["a", i(1)]] }), "key-order");
    // Code point order, not UTF-16 order: U+FFFF precedes U+1F600.
    const astral = bir.decodeNode(bir.encodeNode(map({ "\u{1F600}": i(0), "￿": i(1) })));
    assert.ok(astral.kind === "map");
    assert.deepEqual(astral.entries.map(([k]) => k), ["￿", "\u{1F600}"]);
});

test("clean-room: exact rationals must be reduced with a positive denominator and zero as 0/1", () => {
    assert.deepEqual(bir.decodeNode(b(0x10, 0x05, 0x02)), q(-3, 2));
    rejects(() => bir.decodeNode(b(0x10, 0x04, 0x04)), "rational-not-reduced"); // 2/4
    rejects(() => bir.decodeNode(b(0x10, 0x00, 0x02)), "rational-not-reduced"); // 0/2
    rejects(() => bir.decodeNode(b(0x10, 0x02, 0x00)), "rational-denominator"); // 1/0
    rejects(() => bir.encodeNode(q(2, 4)), "rational-not-reduced");
    rejects(() => bir.encodeNode(q(1, -2)), "rational-denominator");
});

test("clean-room: the root has depth 0 and a node at depth 1025 is rejected by decoder and encoder", () => {
    // `levels` nested sequences: "05 01" repeated levels - 1 times, then "05 00".
    const nested = (levels: number): Uint8Array => {
        const out = new Uint8Array(levels * 2);
        for (let d = 0; d < levels; d += 1) {
            out[d * 2] = 0x05;
            out[d * 2 + 1] = d === levels - 1 ? 0x00 : 0x01;
        }
        return out;
    };
    // "1025 nested sequences (05 01 repeated 1024 times, then 05 00) are accepted, and 1026 are rejected."
    const ok = bir.decodeNode(nested(1025));
    assert.deepEqual(bir.encodeNode(ok), nested(1025));
    rejects(() => bir.decodeNode(nested(1026)), "nesting-too-deep");
    // "the bound applies to a leaf exactly as to a collection"
    const leafAt = (depth: number) => bir.concatBytes([nested(depth + 1).subarray(0, depth * 2), b(0x03, 0x00)]);
    assert.deepEqual(bir.encodeNode(bir.decodeNode(leafAt(1024))), leafAt(1024));
    rejects(() => bir.decodeNode(leafAt(1025)), "nesting-too-deep");
    // Record values and map values count like items; keys and rational parts are not nodes.
    let deepRecord: bir.BirNode = q(1, 2);
    for (let d = 0; d < 1024; d += 1) deepRecord = d % 2 === 0 ? rec({ k: deepRecord }) : map({ k: deepRecord });
    const deepBytes = bir.encodeNode(deepRecord);
    assert.deepEqual(bir.encodeNode(bir.decodeNode(deepBytes)), deepBytes);
    rejects(() => bir.encodeNode(rec({ k: deepRecord })), "nesting-too-deep");
    let deep: bir.BirNode = seq();
    for (let d = 1; d < 1025; d += 1) deep = seq(deep);
    assert.deepEqual(bir.encodeNode(deep), nested(1025));
    rejects(() => bir.encodeNode(seq(deep)), "nesting-too-deep");
});

test("clean-room: unknown tags, trailing bytes, and truncation are rejected", () => {
    for (const tag of [0x00, 0x09, 0x0f, 0x14, 0xff]) rejects(() => bir.decodeNode(b(tag)), "unknown-tag");
    rejects(() => bir.decodeNode(b(0x01, 0x01)), "trailing-bytes");
    rejects(() => bir.decodeNode(b(0x05, 0x02, 0x01)), "length-overflow");
    rejects(() => bir.decodeNode(b(0x10, 0x02)), "truncated");
});

// ---------------------------------------------------------------------------
// bubble-ir.md section 5: envelope
// ---------------------------------------------------------------------------

test("clean-room: envelope layout is magic, versions, sections, and a SHA-256 trailer", () => {
    const envelope: bir.BirEnvelope = {
        major: 1n,
        minor: 0n,
        sections: [
            { name: "core.causal-program", flags: 1n, critical: true, payload: EMPTY_RECORD },
            { name: "zz.note", flags: 0n, critical: false, payload: b(0xde, 0xad) },
        ],
    };
    const bytes = bir.encodeEnvelope(envelope);
    assert.deepEqual(bytes.subarray(0, 8), b(0x42, 0x55, 0x42, 0x42, 0x4c, 0x45, 0x49, 0x52));
    assert.deepEqual(bytes.subarray(8, 11), b(0x01, 0x00, 0x02));
    assert.deepEqual(bytes.subarray(bytes.length - 32), bir.sha256(bytes.subarray(0, bytes.length - 32)));
    const decoded = bir.decodeEnvelope(bytes);
    assert.equal(decoded.executable, true);
    // A non-critical section is preserved byte for byte, even when it is not a node.
    assert.deepEqual(decoded.envelope.sections[1]!.payload, b(0xde, 0xad));
    assert.deepEqual(bir.encodeEnvelope(decoded.envelope), bytes);
    assert.equal(decoded.storageDigest, bir.hex(bir.sha256(bytes)));
});

test("clean-room: sections are ordered by raw name bytes, not by length-prefixed encoding", () => {
    // Raw order "aa" < "b"; length-prefixed order would put 01 62 before 02 61 61.
    const ordered = rawEnvelope([
        { name: "aa", flags: 0, payload: EMPTY_RECORD },
        { name: "b", flags: 0, payload: EMPTY_RECORD },
    ]);
    assert.deepEqual(bir.decodeEnvelope(ordered).envelope.sections.map((x) => x.name), ["aa", "b"]);
    rejects(() => bir.decodeEnvelope(rawEnvelope([{ name: "b", flags: 0, payload: EMPTY_RECORD }, { name: "aa", flags: 0, payload: EMPTY_RECORD }])), "section-order");
    rejects(() => bir.decodeEnvelope(rawEnvelope([{ name: "aa", flags: 0, payload: EMPTY_RECORD }, { name: "aa", flags: 0, payload: EMPTY_RECORD }])), "section-order");
});

test("clean-room: envelope header, flag, name, and trailer rules", () => {
    const program: RawSection = { name: "core.causal-program", flags: 1, payload: EMPTY_RECORD };
    assert.equal(bir.decodeEnvelope(rawEnvelope([program])).executable, true);
    rejects(() => bir.decodeEnvelope(rawEnvelope([program], { major: 2 })), "unsupported-major");
    rejects(() => bir.decodeEnvelope(rawEnvelope([program], { major: 0 })), "unsupported-major");
    // "every other flag bit must be zero"
    rejects(() => bir.decodeEnvelope(rawEnvelope([{ ...program, flags: 3 }])), "undefined-flags");
    rejects(() => bir.decodeEnvelope(rawEnvelope([{ name: "x", flags: 2, payload: EMPTY_RECORD }])), "undefined-flags");
    // "A core section is one whose name begins with the five bytes core. (so
    // core and core-x are not core sections). ... a non-critical core section is rejected (BIR029)."
    rejects(() => bir.decodeEnvelope(rawEnvelope([{ ...program, flags: 0 }])), "non-critical-core");
    rejects(() => bir.decodeEnvelope(rawEnvelope([{ name: "core.x", flags: 0, payload: EMPTY_RECORD }])), "non-critical-core");
    for (const name of ["core", "core-x", "corex.y"]) assert.equal(bir.decodeEnvelope(rawEnvelope([{ name, flags: 0, payload: EMPTY_RECORD }])).envelope.sections[0]!.critical, false);
    // "A decoder accepts any minor version ... and preserves it when re-encoding."
    for (const minor of [1, 2 ** 40, 300]) {
        const bytes = rawEnvelope([program], { minor });
        const decoded = bir.decodeEnvelope(bytes);
        assert.equal(decoded.envelope.minor, BigInt(minor));
        assert.deepEqual(bir.encodeEnvelope(decoded.envelope), bytes);
        // "The minor version is part of storage identity and not of semantic identity."
        assert.equal(decoded.semanticDigest, bir.decodeEnvelope(rawEnvelope([program])).semanticDigest);
        assert.notEqual(decoded.storageDigest, bir.decodeEnvelope(rawEnvelope([program])).storageDigest);
    }
    // "each of them is a record node"
    rejects(() => bir.decodeDocument(rawEnvelope([{ ...program, payload: b(0x05, 0x00) }])), "section-not-record");
    for (const name of ["Core.x", "1a", "a..b", "a.", "a_b", ""]) {
        rejects(() => bir.decodeEnvelope(rawEnvelope([{ name, flags: 0, payload: EMPTY_RECORD }])), "bad-section-name");
    }
    // "bytes between the last section and the trailer"
    rejects(() => bir.decodeEnvelope(rawEnvelope([program], { beforeTrailer: b(0x00) })), "bytes-before-trailer");
    // Non-minimal section length.
    rejects(() => bir.decodeEnvelope(rawEnvelope([{ ...program, lengthBytes: b(0x82, 0x00) }])), "non-minimal-uvar");
    const good = rawEnvelope([program]);
    const badMagic = good.slice();
    badMagic[0] = 0x43;
    rejects(() => bir.decodeEnvelope(badMagic), "bad-magic");
    const badTrailer = good.slice();
    badTrailer[badTrailer.length - 1]! ^= 0x01;
    rejects(() => bir.decodeEnvelope(badTrailer), "trailer-mismatch");
});

test("clean-room: an unknown critical section is preserved and makes the document non-executable", () => {
    const bytes = rawEnvelope([
        { name: "core.causal-program", flags: 1, payload: EMPTY_RECORD },
        { name: "future.semantics", flags: 1, payload: b(0x99, 0x98) },
    ]);
    const decoded = bir.decodeDocument(bytes);
    assert.equal(decoded.executable, false);
    assert.deepEqual(decoded.unknownCriticalSections, ["future.semantics"]);
    assert.deepEqual(bir.reencodeThroughNodes(decoded), bytes);
});

test("clean-room: semantic identity covers critical sections only; storage identity covers every byte", () => {
    const critical: bir.BirSection = { name: "core.causal-program", flags: 1n, critical: true, payload: EMPTY_RECORD };
    const plain = bir.decodeEnvelope(bir.encodeEnvelope({ major: 1n, minor: 0n, sections: [critical] }));
    const annotated = bir.decodeEnvelope(
        bir.encodeEnvelope({ major: 1n, minor: 0n, sections: [critical, { name: "provenance", flags: 0n, critical: false, payload: b(1, 2, 3) }] }),
    );
    const changed = bir.decodeEnvelope(bir.encodeEnvelope({ major: 1n, minor: 0n, sections: [{ ...critical, payload: b(0x07, 0x01, 0x01, 0x61, 0x02) }] }));
    assert.equal(annotated.semanticDigest, plain.semanticDigest);
    assert.notEqual(annotated.storageDigest, plain.storageDigest);
    assert.notEqual(changed.semanticDigest, plain.semanticDigest);
    // "the 31 ASCII bytes bubble-bir-semantic-identity.v1 followed by one 0x00 byte, 32 bytes in all"
    assert.equal(bir.SEMANTIC_DOMAIN.length, 32);
    // "the 33 ASCII bytes bubble-causal-outcome-identity.v1, one 0x00 byte"
    assert.equal(bir.OUTCOME_DOMAIN.length, 34);
    // Written out from the section 1 definition for this one-section document.
    const expected = createHash("sha256")
        .update("bubble-bir-semantic-identity.v1\0", "latin1")
        .update(b(0x01, 0x13))
        .update("core.causal-program", "latin1")
        .update(b(0x02, 0x07, 0x00))
        .digest("hex");
    assert.equal(plain.semanticDigest, expected);
});

// ---------------------------------------------------------------------------
// RFC 8785
// ---------------------------------------------------------------------------

test("clean-room: RFC 8785 serializer sorts keys by UTF-16 code units and escapes like ECMAScript", () => {
    assert.equal(bir.jcs({ "￿": 2, "\u{1F600}": 1, a: 3, B: 4 }), '{"B":4,"a":3,"\u{1F600}":1,"￿":2}');
    assert.equal(bir.jcs(["\u0007\n\t\"\\/é", true, false, null, -0, 12]), '["\\u0007\\n\\t\\"\\\\/é",true,false,null,0,12]');
    assert.equal(bir.jcs({ b: [], a: {} }), '{"a":{},"b":[]}');
    rejects(() => bir.jcs("\uD800"), "jcs-unsupported");
    rejects(() => bir.jcs(0.5), "jcs-unsupported");
});

// ---------------------------------------------------------------------------
// Corpus: data/conformance/causal
// ---------------------------------------------------------------------------

// causal-conformance.md section 1 fixture table.
const FIXTURE_SECTIONS: Record<string, boolean> = {
    "core.causal-program": true,
    "core.causal-execution-options": true,
    "conformance.causal-outcome": false,
    "conformance.host-cost": false,
    "conformance.label": false,
};

const evidenceKindsSeen = new Set<bir.EvidenceKind>();

test("clean-room: every manifest fixture decodes, re-encodes byte-identically, and reproduces its identities", async (t) => {
    assert.ok(manifest.fixtures.length > 0);
    // "The frozen corpus is data/conformance/causal/ with manifest.json": every document there is listed.
    assert.deepEqual(
        readdirSync(corpusDir).filter((file) => file.endsWith(".bir")).sort(),
        manifest.fixtures.map((fixture) => fixture.file).sort(),
    );
    for (const fixture of manifest.fixtures) {
        await t.test(fixture.name, () => {
            const bytes = fixtureBytes(fixture);
            assert.equal(bytes.length, fixture.byteLength);
            const doc = bir.decodeDocument(bytes);

            assert.equal(doc.envelope.major, 1n);
            assert.deepEqual(
                Object.fromEntries(doc.envelope.sections.map((section) => [section.name, section.critical])),
                FIXTURE_SECTIONS,
            );
            assert.equal(doc.executable, true);

            // Canonical: re-encoding every node and the envelope yields identical bytes.
            assert.deepEqual(bir.reencodeThroughNodes(doc), bytes);

            assert.equal(doc.storageDigest, fixture.storageDigest);
            assert.equal(doc.semanticDigest, fixture.inputSemanticDigest);
            const outcomeSection = bir.sectionByName(doc, "conformance.causal-outcome");
            assert.ok(outcomeSection);
            assert.equal(bir.outcomeDigest(outcomeSection.payload), fixture.outcomeDigest);

            // "A fixture's semantic identity is therefore its input": dropping
            // every non-critical section leaves the semantic digest unchanged.
            const inputOnly = bir.decodeEnvelope(
                bir.encodeEnvelope({ ...doc.envelope, sections: doc.envelope.sections.filter((section) => section.critical) }),
            );
            assert.equal(inputOnly.semanticDigest, fixture.inputSemanticDigest);
            assert.notEqual(inputOnly.storageDigest, fixture.storageDigest);

            const outcome = doc.nodes.get("conformance.causal-outcome")!;
            assert.equal(bir.str(bir.req(outcome, "mode")), manifest.outcomeMode);
            assert.equal(bir.str(bir.req(outcome, "status")), fixture.status);
            assert.deepEqual(bir.toPlain(bir.req(outcome, "resourceVerdict")), fixture.resourceVerdict);
            assert.deepEqual(bir.toPlain(doc.nodes.get("conformance.host-cost")!), fixture.hostCost);
            assert.deepEqual(bir.toPlain(doc.nodes.get("conformance.label")!), { name: fixture.name, description: fixture.description });
            assert.equal(doc.nodes.get("core.causal-program")!.kind, "record");
        });
    }
});

test("clean-room: every section-4 evidence id in every fixture outcome is recomputed from the outcome alone", async (t) => {
    for (const fixture of manifest.fixtures) {
        await t.test(fixture.name, () => {
            const doc = bir.decodeDocument(fixtureBytes(fixture));
            const checks = bir.recomputeEvidence(doc.nodes.get("conformance.causal-outcome")!);
            for (const check of checks) {
                evidenceKindsSeen.add(check.kind);
                assert.equal(check.recomputed, check.stored, `${check.path}: ${bir.jcs(check.record)}`);
            }
        });
    }
    // The corpus exercises all four derivations the conformance tests rebuild.
    assert.deepEqual([...evidenceKindsSeen].sort(), ["branch-step", "retirement-residue", "transfer-frontier", "world-lineage"]);
});

test("clean-room: evidence records follow section 4 exactly on a synthetic outcome (set re-sort, parents, spawn-time lineage, chaining)", () => {
    // Law and world ids whose BIR set order (shorter first) differs from canonical order.
    const ledgerEntry = (lawId: string, eventId = `law:${lawId}`) => rec({ key: s(eventId), eventId: s(eventId), lawId: s(lawId) });
    const outcome = bir.decodeNode(
        bir.encodeNode(
            rec({
                autonomousContinuations: set(
                    rec({
                        id: s("continuation:branched"),
                        branchLineage: seq(
                            rec({ id: s("unset-0"), frontierIndex: i(0), realizedLawIds: set(s("aaa"), s("zz")) }),
                            rec({ id: s("unset-1"), frontierIndex: i(2), realizedLawIds: set(s("q")) }),
                        ),
                        ledger: set(ledgerEntry("aaa"), ledgerEntry("zz"), ledgerEntry("sp"), ledgerEntry("q", "medium:q"), ledgerEntry("sp2")),
                        anchorTransferEvents: set(
                            rec({ id: s("transfer:t2:by:zz"), lawId: s("zz"), transferId: s("t2"), frontierId: s("unset") }),
                            rec({ id: s("transfer:t1:by:aaa"), lawId: s("aaa"), transferId: s("t1"), frontierId: s("unset") }),
                        ),
                        order: rec({
                            evaluationFrontiers: seq(
                                set(s("law:aaa"), s("law:zz")),
                                set(s("transfer:t1:by:aaa"), s("transfer:t2:by:zz")),
                                set(s("law:sp")),
                                set(s("spawn:child:by:sp")),
                                set(s("medium:q")),
                                set(s("law:sp2")),
                                set(s("spawn:grand:by:sp2")),
                            ),
                        }),
                        lifecycleEvents: set(
                            rec({ id: s("spawn:child:by:sp"), targetWorldId: s("child"), sourceWorldIds: set(s("xxx"), s("yy")), causedByLawEventIds: set(s("law:sp")), lineageId: s("unset") }),
                            rec({ id: s("spawn:grand:by:sp2"), targetWorldId: s("grand"), sourceWorldIds: set(s("child")), causedByLawEventIds: set(s("law:sp2")), lineageId: s("unset") }),
                        ),
                    }),
                    rec({
                        id: s("continuation:retired"),
                        lifecycleEvents: set(rec({ id: s("retire:old:by:zz"), targetWorldId: s("old"), residue: rec({ finalStateDigest: s("unset") }) })),
                        worldStates: set(
                            rec({
                                worldId: s("old"),
                                fields: map({ b: q(1, 2), a: { kind: "exact-boolean", value: true } }),
                                intrinsicViability: q(0, 1),
                                seaContribution: { kind: "symbol", value: "s" },
                            }),
                        ),
                    }),
                ),
            }),
        ),
    );
    const branched = bir.elements(bir.req(outcome, "autonomousContinuations")).find((c) => bir.str(bir.req(c, "id")) === "continuation:branched")!;
    const step = bir.elements(bir.req(branched, "branchLineage"))[0]!;
    assert.deepEqual(bir.elements(bir.req(step, "realizedLawIds")).map(bir.str), ["zz", "aaa"], "BIR set order puts the shorter id first");

    const checks = bir.recomputeEvidence(outcome);
    const byKind = (kind: bir.EvidenceKind) => checks.filter((check) => check.kind === kind).map((check) => check.recomputed);
    // Records written by hand from causal-conformance.md section 4 and serialized per RFC 8785.
    const step0 = `branch:${sha('{"frontierIndex":0,"parent":[],"realizedLawIds":["aaa","zz"]}').slice(0, 16)}`;
    const step1 = `branch:${sha(`{"frontierIndex":2,"parent":["${step0}"],"realizedLawIds":["q"]}`).slice(0, 16)}`;
    assert.deepEqual(byKind("branch-step"), [step0, step1]);
    const frontierId = `transfer-frontier:${sha('[{"lawId":"aaa","transferId":"t1"},{"lawId":"zz","transferId":"t2"}]').slice(0, 16)}`;
    assert.deepEqual(byKind("transfer-frontier"), [frontierId, frontierId]);
    // The child is spawned before step 1 exists, so its branchLineage holds step 0 only;
    // the grandchild names the child's lineage as its parent lineage and both steps.
    const child = `lineage:${sha(
        `{"branchLineage":["${step0}"],"causedByLawEventIds":["law:sp"],"parentLineages":["initial:xxx","initial:yy"],"sourceWorldIds":["xxx","yy"],"targetWorldId":"child"}`,
    ).slice(0, 20)}`;
    const grand = `lineage:${sha(
        `{"branchLineage":["${step0}","${step1}"],"causedByLawEventIds":["law:sp2"],"parentLineages":["${child}"],"sourceWorldIds":["child"],"targetWorldId":"grand"}`,
    ).slice(0, 20)}`;
    assert.deepEqual(new Set(byKind("world-lineage")), new Set([child, grand]));
    const residue = sha(
        '{"fields":{"a":{"kind":"boolean","value":true},"b":{"denominator":"2","kind":"rational","numerator":"1"}},' +
            '"intrinsicViability":{"denominator":"1","kind":"rational","numerator":"0"},"seaContribution":{"kind":"symbol","value":"s"}}',
    );
    assert.deepEqual(byKind("retirement-residue"), [residue]);
});

test("clean-room: the corpus exercises the section-4 cases the revised documents name", () => {
    // causal-conformance.md section 4: the rebuilt records include "a program whose law ids make
    // BIR set order differ from canonical string order"; the manifest adds nested branch lineage,
    // a chained (non-initial) parent lineage, and a sea-medium retirement residue.
    const seen = { setOrderDiffers: false, stepWithParent: false, nonInitialParentLineage: false, seaRelease: false };
    for (const fixture of manifest.fixtures) {
        const outcome = bir.decodeDocument(fixtureBytes(fixture)).nodes.get("conformance.causal-outcome")!;
        for (const collection of ["autonomousContinuations", "continuations"]) {
            for (const continuation of bir.optionalElements(bir.field(outcome, collection))) {
                const stored = (node: bir.BirNode | undefined) => bir.optionalElements(node).map(bir.str);
                const differs = (values: string[]) => JSON.stringify(values) !== JSON.stringify(bir.canonicalSort(values));
                for (const step of bir.optionalElements(bir.field(continuation, "branchLineage"))) {
                    if (differs(stored(bir.field(step, "realizedLawIds")))) seen.setOrderDiffers = true;
                }
                for (const event of bir.optionalElements(bir.field(continuation, "lifecycleEvents"))) {
                    if (differs(stored(bir.field(event, "sourceWorldIds"))) || differs(stored(bir.field(event, "causedByLawEventIds")))) seen.setOrderDiffers = true;
                    const residue = bir.field(event, "residue");
                    if (residue !== undefined && bir.field(residue, "seaRelease") !== undefined) seen.seaRelease = true;
                }
            }
        }
        for (const check of bir.recomputeEvidence(outcome)) {
            const record = check.record as { parent?: string[]; parentLineages?: string[] };
            if (check.kind === "branch-step" && record.parent!.length > 0) seen.stepWithParent = true;
            if (check.kind === "world-lineage" && record.parentLineages!.some((id) => !id.startsWith("initial:"))) seen.nonInitialParentLineage = true;
        }
    }
    // Not exercised by the corpus: a lineage record whose branchLineage is non-empty (the only
    // spawn in a branched continuation, in sea-scarcity-branches, precedes the branch step).
    assert.deepEqual(seen, { setOrderDiffers: true, stepWithParent: true, nonInitialParentLineage: true, seaRelease: true });
});

// ---------------------------------------------------------------------------
// docs/reference/bir-schemas.md: producing payloads, not only decoding them
// ---------------------------------------------------------------------------

const schemaAppendix = bir.parseSchemaAppendix(readFileSync(resolve(repo, "docs", "reference", "bir-schemas.md"), "utf8"));

function shuffler(seed: number): <T>(items: T[]) => T[] {
    let state = seed >>> 0;
    const next = () => {
        // mulberry32
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return <T>(items: T[]) => {
        const out = [...items];
        for (let k = out.length - 1; k > 0; k -= 1) {
            const j = Math.floor(next() * (k + 1));
            [out[k], out[j]] = [out[j]!, out[k]!];
        }
        return out;
    };
}
const reverse = <T>(items: T[]) => [...items].reverse();

function hostOf(doc: bir.DecodedDocument, section: string, options: bir.ToHostOptions): bir.HostJson {
    // A JSON round trip proves the host value is plain JSON with no BIR node kinds in it.
    return JSON.parse(JSON.stringify(bir.nodeToHost(doc.nodes.get(section)!, schemaAppendix.get(section)!, options))) as bir.HostJson;
}

const committedDocuments = () => [
    ...manifest.fixtures.map((fixture) => ({ name: fixture.name, bytes: fixtureBytes(fixture) })),
    { name: "data/bir/connected-fields.bir", bytes: readBytes(resolve(repo, "data", "bir", "connected-fields.bir")) },
];

test("clean-room: the schema appendix parses into one record schema per section", () => {
    assert.deepEqual([...schemaAppendix.keys()].sort(), Object.keys(FIXTURE_SECTIONS).sort());
    const outcome = schemaAppendix.get("conformance.causal-outcome")!;
    assert.ok(outcome.type === "record");
    assert.deepEqual(outcome.fields.get("mode"), { presence: "required", schema: { type: "literal", value: "bubble-causal-outcome.v1" } });
    const continuation = outcome.fields.get("autonomousContinuations")!;
    assert.equal(continuation.presence, "required-even-if-empty");
    assert.ok(continuation.schema.type === "set" && continuation.schema.element.type === "record");
    const continuations = outcome.fields.get("continuations")!.schema;
    // "autonomousContinuations and continuations share one continuation schema"
    assert.ok(continuations.type === "set" && continuations.element === continuation.schema.element);
    const fields = continuation.schema.element.fields;
    // "Exactly two outcome positions are sequences": branchLineage and order.evaluationFrontiers.
    assert.equal(fields.get("branchLineage")!.schema.type, "seq");
    assert.equal(fields.get("branchLineage")!.presence, "optional-omitted-if-empty");
    const order = fields.get("order")!.schema;
    assert.ok(order.type === "record");
    assert.equal(order.fields.get("evaluationFrontiers")!.schema.type, "seq");
    assert.equal(fields.get("interventionIds")!.presence, "required-even-if-empty");
    const options = schemaAppendix.get("core.causal-execution-options")!;
    assert.ok(options.type === "record");
    assert.deepEqual(options.fields.get("worldWillEnabled"), { presence: "optional", schema: { type: "bool" } });
    assert.equal(options.fields.get("cutAnchorIds")!.presence, "optional-kept-if-empty");
});

test("clean-room: every committed section payload is produced byte-identically from plain host JSON using only the appendix", async (t) => {
    let materializedSomewhere = false;
    for (const { name, bytes } of committedDocuments()) {
        await t.test(name, () => {
            const doc = bir.decodeDocument(bytes);
            for (const section of doc.envelope.sections) {
                const outcome = section.name === "conformance.causal-outcome";
                for (const [label, permute] of [["reversed", reverse], ["shuffled", shuffler(section.payload.length)]] as const) {
                    // Sets and object keys in arbitrary host order; for the outcome, every
                    // "optional, omitted if empty" collection the run left empty is held as [].
                    const host = hostOf(doc, section.name, { materializeOmittedEmpty: outcome, permute });
                    const produced = bir.encodeSectionFromHost(section.name, host, schemaAppendix);
                    assert.ok(bir.bytesEqual(produced, section.payload), `${section.name} (${label} host order) differs from the committed payload`);
                }
                if (outcome) {
                    const bare = JSON.stringify(hostOf(doc, section.name, {}));
                    if (bare !== JSON.stringify(hostOf(doc, section.name, { materializeOmittedEmpty: true }))) materializedSomewhere = true;
                }
                // "Options with no field encode as the two bytes 07 00".
                if (section.name === "core.causal-execution-options" && Object.keys(hostOf(doc, section.name, {}) as object).length === 0) {
                    assert.deepEqual(section.payload, EMPTY_RECORD);
                }
            }
        });
    }
    assert.ok(materializedSomewhere, "the corpus has omitted-if-empty outcome collections, so the omission rule was exercised");
});

test("clean-room: appendix presence rules decide bytes (omitted vs kept if empty, unknown fields, sequence order)", () => {
    const fixture = manifest.fixtures.find((candidate) => candidate.name === "connected-fields")!;
    const doc = bir.decodeDocument(fixtureBytes(fixture));
    type Obj = { [key: string]: bir.HostJson };

    // Outcome: a host-only field is dropped, an empty optional set is omitted.
    const outcome = hostOf(doc, "conformance.causal-outcome", {}) as Obj;
    const firstContinuation = (outcome.continuations as Obj[])[0]!;
    assert.equal(firstContinuation.lifecycleEvents, undefined);
    firstContinuation.lifecycleEvents = [];
    outcome.hostSelection = false;
    const payload = bir.sectionByName(doc, "conformance.causal-outcome")!.payload;
    assert.deepEqual(bir.encodeSectionFromHost("conformance.causal-outcome", outcome, schemaAppendix), payload);
    // A required collection must be present in the host value.
    const missingRequired = { ...outcome };
    delete missingRequired.diagnosticCodes;
    rejects(() => bir.encodeSectionFromHost("conformance.causal-outcome", missingRequired, schemaAppendix), "schema");
    // Sequence item order is meaning: reversing evaluationFrontiers changes the bytes.
    const reordered = hostOf(doc, "conformance.causal-outcome", {}) as Obj;
    const order = (reordered.continuations as Obj[])[0]!.order as Obj;
    assert.ok((order.evaluationFrontiers as bir.HostJson[]).length >= 2);
    order.evaluationFrontiers = [...(order.evaluationFrontiers as bir.HostJson[])].reverse();
    assert.ok(!bir.bytesEqual(bir.encodeSectionFromHost("conformance.causal-outcome", reordered, schemaAppendix), payload));

    // Program: an optional collection given as empty is kept and differs from an absent one;
    // a host field outside the schema is rejected (BIRL01).
    const program = hostOf(doc, "core.causal-program", {}) as Obj;
    const programPayload = bir.sectionByName(doc, "core.causal-program")!.payload;
    const laws = (program.world as Obj).internalLaws as Obj[];
    const law = laws.find((candidate) => candidate.inverseEffects === undefined)!;
    law.inverseEffects = [];
    const kept = bir.encodeSectionFromHost("core.causal-program", program, schemaAppendix);
    assert.ok(!bir.bytesEqual(kept, programPayload));
    const keptLaw = bir.elements(bir.req(bir.req(bir.decodeNode(kept), "world"), "internalLaws")).find((node) => bir.str(bir.req(node, "id")) === law.id)!;
    assert.deepEqual(bir.req(keptLaw, "inverseEffects"), set());
    delete law.inverseEffects;
    assert.deepEqual(bir.encodeSectionFromHost("core.causal-program", program, schemaAppendix), programPayload);
    rejects(() => bir.encodeSectionFromHost("core.causal-program", { ...program, hostOnly: true }, schemaAppendix), "schema");

    // Options: an explicitly empty set is encoded (06 00) and differs from absence.
    assert.deepEqual(bir.encodeSectionFromHost("core.causal-execution-options", {}, schemaAppendix), EMPTY_RECORD);
    assert.deepEqual(
        bir.encodeSectionFromHost("core.causal-execution-options", { cutAnchorIds: [] }, schemaAppendix),
        bir.concatBytes([b(0x07, 0x01), bir.encodeText("cutAnchorIds"), b(0x06, 0x00)]),
    );
    // A structural boolean, never an exact one; safe integers only.
    assert.deepEqual(
        bir.encodeSectionFromHost("core.causal-execution-options", { worldWillEnabled: false }, schemaAppendix),
        bir.concatBytes([b(0x07, 0x01), bir.encodeText("worldWillEnabled"), b(0x01)]),
    );
    rejects(() => bir.encodeSectionFromHost("core.causal-execution-options", { maxInternalBranches: 2 ** 53 }, schemaAppendix), "schema");
    // Exact values must already be canonical (BIRL06).
    rejects(
        () => bir.encodeSectionFromHost("core.causal-execution-options", { fieldOverrides: { "w.f": { kind: "rational", numerator: "2", denominator: "4" } } }, schemaAppendix),
        "schema",
    );
});

// ---------------------------------------------------------------------------
// data/bir/connected-fields.bir
// ---------------------------------------------------------------------------

test("clean-room: data/bir/connected-fields.bir decodes, re-encodes byte-identically, and matches its committed inspection", () => {
    const bytes = readBytes(resolve(repo, "data", "bir", "connected-fields.bir"));
    const inspection = JSON.parse(readFileSync(resolve(repo, "data", "bir", "connected-fields.inspect.json"), "utf8")) as {
        byteLength: number;
        formatVersion: { major: number; minor: number };
        identity: { semanticDigest: string; storageDigest: string };
        sections: { name: string; critical: boolean; byteLength: number }[];
        executable: boolean;
    };
    const doc = bir.decodeDocument(bytes);
    assert.equal(bytes.length, inspection.byteLength);
    assert.equal(Number(doc.envelope.major), inspection.formatVersion.major);
    assert.equal(Number(doc.envelope.minor), inspection.formatVersion.minor);
    assert.deepEqual(
        doc.envelope.sections.map((section) => ({ name: section.name, critical: section.critical, byteLength: section.payload.length })),
        inspection.sections,
    );
    assert.equal(doc.executable, inspection.executable);
    assert.deepEqual(bir.reencodeThroughNodes(doc), bytes);
    assert.equal(doc.storageDigest, inspection.identity.storageDigest);
    assert.equal(doc.semanticDigest, inspection.identity.semanticDigest);
    assert.equal(doc.nodes.get("core.causal-program")!.kind, "record");
});

// ---------------------------------------------------------------------------
// Corrupted committed bytes
// ---------------------------------------------------------------------------

test("clean-room: a flipped trailer byte or payload byte is rejected in every committed document", () => {
    const documents = [...manifest.fixtures.map(fixtureBytes), readBytes(resolve(repo, "data", "bir", "connected-fields.bir"))];
    for (const bytes of documents) {
        const trailer = bytes.slice();
        trailer[trailer.length - 1]! ^= 0x80;
        rejects(() => bir.decodeEnvelope(trailer), "trailer-mismatch");
        const body = bytes.slice();
        body[Math.floor(body.length / 2)]! ^= 0x01;
        assert.throws(() => bir.decodeEnvelope(body), bir.CleanRoomBirError);
    }
});

const corruptionFixture = manifest.fixtures.find((fixture) => fixture.name === "generational-grove") ?? manifest.fixtures[0]!;

test("clean-room: an unsorted set inside a committed payload is rejected even with a valid trailer", () => {
    const doc = bir.decodeDocument(fixtureBytes(corruptionFixture));
    for (const name of ["core.causal-program", "conformance.causal-outcome"]) {
        const payload = bir.sectionByName(doc, name)!.payload;
        const target = findNode(doc.nodes.get(name)!, (node) => node.kind === "set" && node.members.length >= 2);
        assert.ok(target && target.kind === "set", `${name} has a set with two members`);
        const first = spanOf(target.members[0]!);
        const second = spanOf(target.members[1]!);
        assert.equal(first.end, second.start);
        const swapped = splice(payload, first.start, second.end, bir.concatBytes([payload.subarray(second.start, second.end), payload.subarray(first.start, first.end)]));
        const corrupted = withPayload(doc, name, swapped);
        bir.decodeEnvelope(corrupted); // the envelope itself stays valid
        rejects(() => bir.decodeDocument(corrupted), "set-order");
    }
});

test("clean-room: misordered record keys inside a committed payload are rejected", () => {
    const doc = bir.decodeDocument(fixtureBytes(corruptionFixture));
    const name = "conformance.causal-outcome";
    const payload = bir.sectionByName(doc, name)!.payload;
    const root = doc.nodes.get(name)!;
    assert.ok(root.kind === "record" && root.entries.length >= 2);
    const entriesStart = 1 + bir.encodeUvar(root.entries.length).length;
    const firstEnd = spanOf(root.entries[0]![1]).end;
    const secondEnd = spanOf(root.entries[1]![1]).end;
    const swapped = splice(payload, entriesStart, secondEnd, bir.concatBytes([payload.subarray(firstEnd, secondEnd), payload.subarray(entriesStart, firstEnd)]));
    rejects(() => bir.decodeDocument(withPayload(doc, name, swapped)), "key-order");
});

test("clean-room: non-minimal integers inside a committed document are rejected", () => {
    const doc = bir.decodeDocument(fixtureBytes(corruptionFixture));
    const name = "core.causal-program";
    const payload = bir.sectionByName(doc, name)!.payload;

    // 1. The root record's count, re-written with a redundant continuation byte.
    const root = doc.nodes.get(name)!;
    assert.ok(root.kind === "record");
    const count = bir.encodeUvar(root.entries.length);
    const padded = count.slice();
    padded[padded.length - 1]! |= 0x80;
    rejects(() => bir.decodeDocument(withPayload(doc, name, splice(payload, 1, 1 + count.length, bir.concatBytes([padded, b(0x00)])))), "non-minimal-uvar");

    // 2. A signed-integer node body (a branch step's frontierIndex), padded the same way.
    const outcomeName = "conformance.causal-outcome";
    const branching = manifest.fixtures.find((fixture) => fixture.name === "endogenous-branching-field");
    assert.ok(branching, "the corpus has the endogenous-branching-field fixture");
    const branchingDoc = bir.decodeDocument(fixtureBytes(branching));
    const branchingPayload = bir.sectionByName(branchingDoc, outcomeName)!.payload;
    const integer = findNode(branchingDoc.nodes.get(outcomeName)!, (node) => node.kind === "integer");
    assert.ok(integer && integer.kind === "integer");
    const span = spanOf(integer);
    const body = bir.encodeSigned(integer.value).slice();
    body[body.length - 1]! |= 0x80;
    rejects(
        () => bir.decodeDocument(withPayload(branchingDoc, outcomeName, splice(branchingPayload, span.start + 1, span.end, bir.concatBytes([body, b(0x00)])))),
        "non-minimal-uvar",
    );

    // 3. A rational in a committed payload rewritten as an unreduced 2k/2d.
    const outcomePayload = bir.sectionByName(doc, outcomeName)!.payload;
    const rational = findNode(doc.nodes.get(outcomeName)!, (node) => node.kind === "rational");
    assert.ok(rational && rational.kind === "rational");
    const rationalSpan = spanOf(rational);
    const unreduced = bir.concatBytes([bir.encodeSigned(rational.numerator * 2n), bir.encodeUvar(rational.denominator * 2n)]);
    rejects(() => bir.decodeDocument(withPayload(doc, outcomeName, splice(outcomePayload, rationalSpan.start + 1, rationalSpan.end, unreduced))), "rational-not-reduced");
});

test("clean-room: committed sections with trailing bytes, a non-critical core flag, or undefined flags are rejected", () => {
    const doc = bir.decodeDocument(fixtureBytes(corruptionFixture));
    const program = bir.sectionByName(doc, "core.causal-program")!;
    rejects(() => bir.decodeDocument(withPayload(doc, program.name, bir.concatBytes([program.payload, b(0x01)]))), "trailing-bytes");
    const raw = (flagsFor: (section: bir.BirSection) => number) =>
        rawEnvelope(doc.envelope.sections.map((section) => ({ name: section.name, flags: flagsFor(section), payload: section.payload })));
    assert.deepEqual(raw((section) => Number(section.flags)), fixtureBytes(corruptionFixture));
    rejects(() => bir.decodeEnvelope(raw((section) => (section.name === "core.causal-execution-options" ? 0 : Number(section.flags)))), "non-critical-core");
    rejects(() => bir.decodeEnvelope(raw((section) => (section.name === "conformance.label" ? 4 : Number(section.flags)))), "undefined-flags");
});
