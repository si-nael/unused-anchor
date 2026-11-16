// BIR node algebra and its canonical binary encoding.
//
// A BIR node is a typed, machine-independent value. Its binary form is canonical: one node has exactly one
// encoding, and the decoder rejects every other byte sequence (non-minimal integers, unsorted or duplicate
// set members, unsorted or duplicate record keys, non-reduced rationals, malformed UTF-8, trailing bytes).
// Canonical string order is Unicode code-point order, which equals bytewise UTF-8 order.

import { compareCanonicalStrings } from "../world-kernel/canonical-order";
import { countHostCost } from "../world-kernel/host-cost";

export type BirNode =
    | { kind: "bool"; value: boolean }
    | { kind: "int"; value: bigint }
    | { kind: "str"; value: string }
    /** Ordered collection: position is part of meaning. */
    | { kind: "seq"; items: BirNode[] }
    /** Unordered collection: canonical order is bytewise order of member encodings; no duplicates. */
    | { kind: "set"; items: BirNode[] }
    /** Schema-typed record: keys are schema field names. */
    | { kind: "record"; fields: Array<[string, BirNode]> }
    /** Data-keyed map: keys are data (coordinate axes, parameter names). */
    | { kind: "map"; entries: Array<[string, BirNode]> }
    /** Exact rational value: denominator > 0, gcd(|numerator|, denominator) = 1, zero is 0/1. */
    | { kind: "rational"; numerator: bigint; denominator: bigint }
    | { kind: "exact-boolean"; value: boolean }
    | { kind: "symbol"; value: string };

export const BIR_NODE_TAG = {
    false: 0x01,
    true: 0x02,
    int: 0x03,
    str: 0x04,
    seq: 0x05,
    set: 0x06,
    record: 0x07,
    map: 0x08,
    rational: 0x10,
    exactFalse: 0x11,
    exactTrue: 0x12,
    symbol: 0x13,
} as const;

/**
 * Normative nesting bound. Encoding and decoding both reject deeper nodes, so every accepted document can be
 * lifted, validated, and evaluated by the reference oracle without exhausting its host stack.
 */
export const BIR_MAX_DEPTH = 1024;

export class BirFormatError extends Error {
    constructor(readonly code: string, readonly detail: string) {
        super(`${code}: ${detail}`);
        this.name = "BirFormatError";
    }
}

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

export function compareBytes(left: Uint8Array, right: Uint8Array): -1 | 0 | 1 {
    const length = Math.min(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
        if (left[index] !== right[index]) return left[index]! < right[index]! ? -1 : 1;
    }
    return left.length === right.length ? 0 : left.length < right.length ? -1 : 1;
}

export function concatBytes(parts: Uint8Array[]): Uint8Array {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
        out.set(part, offset);
        offset += part.length;
    }
    return out;
}

export function encodeUnsigned(value: bigint | number): Uint8Array {
    let remaining = BigInt(value);
    if (remaining < 0n) throw new BirFormatError("BIR001", "unsigned integer cannot be negative");
    const bytes: number[] = [];
    do {
        let byte = Number(remaining & 0x7fn);
        remaining >>= 7n;
        if (remaining !== 0n) byte |= 0x80;
        bytes.push(byte);
    } while (remaining !== 0n);
    return Uint8Array.from(bytes);
}

function encodeSigned(value: bigint): Uint8Array {
    return encodeUnsigned(value >= 0n ? value * 2n : -value * 2n - 1n);
}

const UNPAIRED_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

export function encodeText(value: string): Uint8Array {
    if (UNPAIRED_SURROGATE.test(value)) throw new BirFormatError("BIR002", "string contains an unpaired surrogate");
    const bytes = encoder.encode(value);
    return concatBytes([encodeUnsigned(bytes.length), bytes]);
}

function gcd(left: bigint, right: bigint): bigint {
    let a = left < 0n ? -left : left;
    let b = right < 0n ? -right : right;
    while (b !== 0n) [a, b] = [b, a % b];
    return a;
}

export function canonicalRationalProblem(numerator: bigint, denominator: bigint): string | undefined {
    if (denominator <= 0n) return "rational denominator must be positive";
    if (numerator === 0n) return denominator === 1n ? undefined : "zero must be encoded as 0/1";
    return gcd(numerator, denominator) === 1n ? undefined : "rational must be reduced";
}

function sortedKeyed(entries: Array<[string, BirNode]>, what: string): Array<[string, BirNode]> {
    const sorted = [...entries].sort(([left], [right]) => compareCanonicalStrings(left, right));
    for (let index = 1; index < sorted.length; index += 1) {
        if (sorted[index - 1]![0] === sorted[index]![0]) {
            throw new BirFormatError("BIR003", `duplicate ${what} key '${sorted[index]![0]}'`);
        }
    }
    return sorted;
}

/** Canonical bytes of one node. Sets and keyed collections are sorted here, so callers need not pre-sort. */
export function encodeNode(node: BirNode, depth = 0): Uint8Array {
    if (depth > BIR_MAX_DEPTH) throw new BirFormatError("BIR014", "node nesting exceeds the normative bound");
    const child = (inner: BirNode): Uint8Array => encodeNode(inner, depth + 1);
    switch (node.kind) {
        case "bool":
            return Uint8Array.of(node.value ? BIR_NODE_TAG.true : BIR_NODE_TAG.false);
        case "int":
            return concatBytes([Uint8Array.of(BIR_NODE_TAG.int), encodeSigned(node.value)]);
        case "str":
            return concatBytes([Uint8Array.of(BIR_NODE_TAG.str), encodeText(node.value)]);
        case "symbol":
            return concatBytes([Uint8Array.of(BIR_NODE_TAG.symbol), encodeText(node.value)]);
        case "exact-boolean":
            return Uint8Array.of(node.value ? BIR_NODE_TAG.exactTrue : BIR_NODE_TAG.exactFalse);
        case "rational": {
            const problem = canonicalRationalProblem(node.numerator, node.denominator);
            if (problem) throw new BirFormatError("BIR004", problem);
            return concatBytes([
                Uint8Array.of(BIR_NODE_TAG.rational),
                encodeSigned(node.numerator),
                encodeUnsigned(node.denominator),
            ]);
        }
        case "seq":
            return concatBytes([
                Uint8Array.of(BIR_NODE_TAG.seq),
                encodeUnsigned(node.items.length),
                ...node.items.map(child),
            ]);
        case "set": {
            const members = node.items.map(child).sort(compareBytes);
            for (let index = 1; index < members.length; index += 1) {
                if (compareBytes(members[index - 1]!, members[index]!) === 0) {
                    throw new BirFormatError("BIR005", "set contains a duplicate member");
                }
            }
            return concatBytes([Uint8Array.of(BIR_NODE_TAG.set), encodeUnsigned(members.length), ...members]);
        }
        case "record":
        case "map": {
            const entries = sortedKeyed(node.kind === "record" ? node.fields : node.entries, node.kind);
            return concatBytes([
                Uint8Array.of(node.kind === "record" ? BIR_NODE_TAG.record : BIR_NODE_TAG.map),
                encodeUnsigned(entries.length),
                ...entries.flatMap(([key, value]) => [encodeText(key), child(value)]),
            ]);
        }
    }
}

/** Sequential reader over canonical BIR bytes. Every read validates canonical form. */
export class BirReader {
    private offset = 0;

    constructor(private readonly bytes: Uint8Array) {}

    get position(): number {
        return this.offset;
    }

    get remaining(): number {
        return this.bytes.length - this.offset;
    }

    readByte(): number {
        if (this.offset >= this.bytes.length) throw new BirFormatError("BIR010", "unexpected end of input");
        return this.bytes[this.offset++]!;
    }

    readBytes(length: number): Uint8Array {
        if (length > this.remaining) throw new BirFormatError("BIR010", "unexpected end of input");
        const slice = this.bytes.subarray(this.offset, this.offset + length);
        this.offset += length;
        return slice;
    }

    readUnsigned(): bigint {
        let result = 0n;
        let shift = 0n;
        let count = 0;
        for (;;) {
            const byte = this.readByte();
            count += 1;
            result |= BigInt(byte & 0x7f) << shift;
            if ((byte & 0x80) === 0) {
                if (byte === 0 && count > 1) throw new BirFormatError("BIR011", "non-minimal unsigned integer");
                return result;
            }
            shift += 7n;
        }
    }

    readLength(): number {
        const value = this.readUnsigned();
        if (value > BigInt(this.remaining)) throw new BirFormatError("BIR012", "length exceeds remaining input");
        return Number(value);
    }

    readSigned(): bigint {
        const zigzag = this.readUnsigned();
        return (zigzag & 1n) === 0n ? zigzag >> 1n : -((zigzag + 1n) >> 1n);
    }

    readText(): string {
        const length = this.readLength();
        const bytes = this.readBytes(length);
        try {
            return decoder.decode(bytes);
        } catch {
            throw new BirFormatError("BIR013", "string is not well-formed UTF-8");
        }
    }

    readNode(depth = 0): BirNode {
        if (depth > BIR_MAX_DEPTH) throw new BirFormatError("BIR014", "node nesting exceeds the normative bound");
        countHostCost("birNodesDecoded");
        const tag = this.readByte();
        switch (tag) {
            case BIR_NODE_TAG.false:
                return { kind: "bool", value: false };
            case BIR_NODE_TAG.true:
                return { kind: "bool", value: true };
            case BIR_NODE_TAG.int:
                return { kind: "int", value: this.readSigned() };
            case BIR_NODE_TAG.str:
                return { kind: "str", value: this.readText() };
            case BIR_NODE_TAG.symbol:
                return { kind: "symbol", value: this.readText() };
            case BIR_NODE_TAG.exactFalse:
                return { kind: "exact-boolean", value: false };
            case BIR_NODE_TAG.exactTrue:
                return { kind: "exact-boolean", value: true };
            case BIR_NODE_TAG.rational: {
                const numerator = this.readSigned();
                const denominator = this.readUnsigned();
                const problem = canonicalRationalProblem(numerator, denominator);
                if (problem) throw new BirFormatError("BIR004", problem);
                return { kind: "rational", numerator, denominator };
            }
            case BIR_NODE_TAG.seq: {
                const count = this.readLength();
                const items: BirNode[] = [];
                for (let index = 0; index < count; index += 1) items.push(this.readNode(depth + 1));
                return { kind: "seq", items };
            }
            case BIR_NODE_TAG.set: {
                const count = this.readLength();
                const items: BirNode[] = [];
                let previous: Uint8Array | undefined;
                for (let index = 0; index < count; index += 1) {
                    const start = this.offset;
                    items.push(this.readNode(depth + 1));
                    const member = this.bytes.subarray(start, this.offset);
                    if (previous && compareBytes(previous, member) >= 0) {
                        throw new BirFormatError("BIR015", "set members are not in strictly increasing canonical order");
                    }
                    previous = member;
                }
                return { kind: "set", items };
            }
            case BIR_NODE_TAG.record:
            case BIR_NODE_TAG.map: {
                const count = this.readLength();
                const entries: Array<[string, BirNode]> = [];
                for (let index = 0; index < count; index += 1) {
                    const key = this.readText();
                    if (entries.length > 0 && compareCanonicalStrings(entries.at(-1)![0], key) >= 0) {
                        throw new BirFormatError("BIR016", "keys are not in strictly increasing canonical order");
                    }
                    entries.push([key, this.readNode(depth + 1)]);
                }
                return tag === BIR_NODE_TAG.record ? { kind: "record", fields: entries } : { kind: "map", entries };
            }
            default:
                throw new BirFormatError("BIR017", `unknown node tag 0x${tag.toString(16).padStart(2, "0")}`);
        }
    }
}

/** Decodes exactly one canonical node; trailing bytes are rejected. */
export function decodeNode(bytes: Uint8Array): BirNode {
    const reader = new BirReader(bytes);
    const node = reader.readNode();
    if (reader.remaining !== 0) throw new BirFormatError("BIR018", "trailing bytes after node");
    return node;
}
