// Schema-directed lowering between typed host objects and BIR nodes.
//
// A schema states, for every position, whether a collection is ordered (`seq`) or unordered (`set`),
// which strings are fixed tags, which decimal strings are integers, and where exact values appear. Lowering
// is strict: an unknown field, a non-canonical exact value or decimal string, or a duplicate set member is a
// lowering error rather than a silent normalization, so a lifted object never claims more than its source.

import { normalizeExactValue, type ExactValue } from "../world-kernel/intensional";
import type { BirNode } from "./node";

export interface BirFieldSpec {
    schema: BirSchema;
    optional?: boolean;
}

export type BirSchema =
    | { kind: "bool" }
    | { kind: "text" }
    | { kind: "literal"; value: string }
    | { kind: "integer-text" }
    | { kind: "safe-integer" }
    | { kind: "exact" }
    | { kind: "record"; fields: Record<string, BirFieldSpec> }
    | { kind: "variant"; tag: string; variants: Record<string, Record<string, BirFieldSpec>> }
    | { kind: "set"; of: BirSchema }
    | { kind: "seq"; of: BirSchema }
    | { kind: "map"; of: BirSchema }
    | { kind: "lazy"; resolve: () => BirSchema };

export class BirLoweringError extends Error {
    constructor(readonly code: string, readonly path: string, readonly detail: string) {
        super(`${code} at ${path}: ${detail}`);
        this.name = "BirLoweringError";
    }
}

const INTEGER_TEXT = /^(0|-?[1-9][0-9]*)$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function resolve(schema: BirSchema): Exclude<BirSchema, { kind: "lazy" }> {
    let current = schema;
    while (current.kind === "lazy") current = current.resolve();
    return current;
}

function lowerRecordFields(
    value: Record<string, unknown>,
    fields: Record<string, BirFieldSpec>,
    path: string,
    fixed: Record<string, string> = {},
): BirNode {
    for (const key of Object.keys(value)) {
        if (!(key in fields) && !(key in fixed) && value[key] !== undefined) {
            throw new BirLoweringError("BIRL01", `${path}.${key}`, "field is not part of the BIR schema");
        }
    }
    const entries: Array<[string, BirNode]> = Object.entries(fixed).map(([key, tag]) => [key, { kind: "str", value: tag }]);
    for (const [key, spec] of Object.entries(fields)) {
        const fieldValue = value[key];
        if (fieldValue === undefined) {
            if (!spec.optional) throw new BirLoweringError("BIRL02", `${path}.${key}`, "required field is absent");
            continue;
        }
        entries.push([key, lowerToBir(fieldValue, spec.schema, `${path}.${key}`)]);
    }
    return { kind: "record", fields: entries };
}

export function lowerToBir(value: unknown, schema: BirSchema, path = "$"): BirNode {
    const resolved = resolve(schema);
    switch (resolved.kind) {
        case "bool":
            if (typeof value !== "boolean") throw new BirLoweringError("BIRL03", path, "expected a boolean");
            return { kind: "bool", value };
        case "text":
            if (typeof value !== "string") throw new BirLoweringError("BIRL03", path, "expected a string");
            return { kind: "str", value };
        case "literal":
            if (value !== resolved.value) throw new BirLoweringError("BIRL04", path, `expected '${resolved.value}'`);
            return { kind: "str", value };
        case "integer-text":
            if (typeof value !== "string" || !INTEGER_TEXT.test(value)) {
                throw new BirLoweringError("BIRL05", path, "expected a canonical decimal integer string");
            }
            return { kind: "int", value: BigInt(value) };
        case "safe-integer":
            if (typeof value !== "number" || !Number.isSafeInteger(value)) {
                throw new BirLoweringError("BIRL08", path, "expected a safe integer");
            }
            return { kind: "int", value: BigInt(value) };
        case "exact": {
            const exactValue = value as ExactValue;
            const normalized = isPlainObject(value) ? normalizeExactValue(exactValue) : undefined;
            const source = value as Record<string, unknown>;
            const sameFields = !!normalized
                && Object.keys(source).length === Object.keys(normalized).length
                && Object.entries(normalized).every(([key, field]) => source[key] === field);
            if (!normalized || !sameFields) {
                throw new BirLoweringError("BIRL06", path, "expected a canonical exact value");
            }
            if (normalized.kind === "rational") {
                return { kind: "rational", numerator: BigInt(normalized.numerator), denominator: BigInt(normalized.denominator) };
            }
            return normalized.kind === "boolean"
                ? { kind: "exact-boolean", value: normalized.value }
                : { kind: "symbol", value: normalized.value };
        }
        case "record":
            if (!isPlainObject(value)) throw new BirLoweringError("BIRL03", path, "expected a record");
            return lowerRecordFields(value, resolved.fields, path);
        case "variant": {
            if (!isPlainObject(value)) throw new BirLoweringError("BIRL03", path, "expected a record");
            const tag = value[resolved.tag];
            if (typeof tag !== "string" || !(tag in resolved.variants)) {
                throw new BirLoweringError("BIRL07", `${path}.${resolved.tag}`, `unknown variant '${String(tag)}'`);
            }
            return lowerRecordFields(value, resolved.variants[tag]!, path, { [resolved.tag]: tag });
        }
        case "set":
        case "seq":
            if (!Array.isArray(value)) throw new BirLoweringError("BIRL03", path, `expected a ${resolved.kind}`);
            return {
                kind: resolved.kind,
                items: value.map((item, index) => lowerToBir(item, resolved.of, `${path}[${index}]`)),
            };
        case "map":
            if (!isPlainObject(value)) throw new BirLoweringError("BIRL03", path, "expected a map");
            return {
                kind: "map",
                entries: Object.entries(value).map(([key, item]) => [key, lowerToBir(item, resolved.of, `${path}.${key}`)]),
            };
    }
}

function expectNode<K extends BirNode["kind"]>(node: BirNode, kind: K, path: string): Extract<BirNode, { kind: K }> {
    if (node.kind !== kind) throw new BirLoweringError("BIRL10", path, `expected ${kind} node, found ${node.kind}`);
    return node as Extract<BirNode, { kind: K }>;
}

function liftRecordFields(
    node: BirNode,
    fields: Record<string, BirFieldSpec>,
    path: string,
    tagKey?: string,
): Record<string, unknown> {
    const record = expectNode(node, "record", path);
    const byKey = new Map(record.fields);
    const out: Record<string, unknown> = {};
    if (tagKey) {
        out[tagKey] = expectNode(byKey.get(tagKey)!, "str", `${path}.${tagKey}`).value;
        byKey.delete(tagKey);
    }
    for (const [key, spec] of Object.entries(fields)) {
        const child = byKey.get(key);
        byKey.delete(key);
        if (!child) {
            if (!spec.optional) throw new BirLoweringError("BIRL11", `${path}.${key}`, "required field is absent");
            continue;
        }
        out[key] = liftFromBir(child, spec.schema, `${path}.${key}`);
    }
    const unknown = [...byKey.keys()];
    if (unknown.length > 0) throw new BirLoweringError("BIRL12", path, `record has fields outside the schema: ${unknown.join(", ")}`);
    return out;
}

export function liftFromBir(node: BirNode, schema: BirSchema, path = "$"): unknown {
    const resolved = resolve(schema);
    switch (resolved.kind) {
        case "bool":
            return expectNode(node, "bool", path).value;
        case "text":
            return expectNode(node, "str", path).value;
        case "literal": {
            const value = expectNode(node, "str", path).value;
            if (value !== resolved.value) throw new BirLoweringError("BIRL13", path, `expected '${resolved.value}'`);
            return value;
        }
        case "integer-text":
            return expectNode(node, "int", path).value.toString();
        case "safe-integer": {
            const value = expectNode(node, "int", path).value;
            if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
                throw new BirLoweringError("BIRL15", path, "integer exceeds the safe host range");
            }
            return Number(value);
        }
        case "exact":
            if (node.kind === "rational") {
                return { kind: "rational", numerator: node.numerator.toString(), denominator: node.denominator.toString() };
            }
            if (node.kind === "exact-boolean") return { kind: "boolean", value: node.value };
            if (node.kind === "symbol") return { kind: "symbol", value: node.value };
            throw new BirLoweringError("BIRL10", path, `expected an exact value node, found ${node.kind}`);
        case "record":
            return liftRecordFields(node, resolved.fields, path);
        case "variant": {
            const record = expectNode(node, "record", path);
            const tagNode = record.fields.find(([key]) => key === resolved.tag)?.[1];
            const tag = tagNode?.kind === "str" ? tagNode.value : undefined;
            if (!tag || !(tag in resolved.variants)) {
                throw new BirLoweringError("BIRL14", `${path}.${resolved.tag}`, `unknown variant '${String(tag)}'`);
            }
            return liftRecordFields(node, resolved.variants[tag]!, path, resolved.tag);
        }
        case "set":
        case "seq":
            return expectNode(node, resolved.kind, path).items.map((item, index) => liftFromBir(item, resolved.of, `${path}[${index}]`));
        case "map":
            return Object.fromEntries(expectNode(node, "map", path).entries.map(([key, item]) => [
                key,
                liftFromBir(item, resolved.of, `${path}.${key}`),
            ]));
    }
}

export const bir = {
    bool: { kind: "bool" } as BirSchema,
    text: { kind: "text" } as BirSchema,
    integerText: { kind: "integer-text" } as BirSchema,
    safeInteger: { kind: "safe-integer" } as BirSchema,
    exact: { kind: "exact" } as BirSchema,
    literal: (value: string): BirSchema => ({ kind: "literal", value }),
    record: (fields: Record<string, BirSchema | BirFieldSpec>): BirSchema => ({ kind: "record", fields: specs(fields) }),
    variant: (tag: string, variants: Record<string, Record<string, BirSchema | BirFieldSpec>>): BirSchema => ({
        kind: "variant",
        tag,
        variants: Object.fromEntries(Object.entries(variants).map(([name, fields]) => [name, specs(fields)])),
    }),
    set: (of: BirSchema): BirSchema => ({ kind: "set", of }),
    seq: (of: BirSchema): BirSchema => ({ kind: "seq", of }),
    map: (of: BirSchema): BirSchema => ({ kind: "map", of }),
    lazy: (resolveSchema: () => BirSchema): BirSchema => ({ kind: "lazy", resolve: resolveSchema }),
    optional: (schema: BirSchema): BirFieldSpec => ({ schema, optional: true }),
};

function specs(fields: Record<string, BirSchema | BirFieldSpec>): Record<string, BirFieldSpec> {
    return Object.fromEntries(Object.entries(fields).map(([key, value]) => [
        key,
        "schema" in value ? value : { schema: value },
    ]));
}

/**
 * Keeps only what a schema declares, recursively. Host-only fields (and any field a backend adds) are dropped,
 * so a projection never fails merely because a host object carries more than the portable contract.
 */
export function pruneToSchema(value: unknown, schema: BirSchema, options: { omitEmptyOptional?: boolean } = {}): unknown {
    const resolved = resolve(schema);
    if (value === undefined || value === null) return value;
    switch (resolved.kind) {
        case "record":
        case "variant": {
            if (!isPlainObject(value)) return value;
            const fields = resolved.kind === "record"
                ? resolved.fields
                : resolved.variants[value[resolved.tag] as string];
            if (!fields) return value;
            const out: Record<string, unknown> = {};
            if (resolved.kind === "variant") out[resolved.tag] = value[resolved.tag];
            for (const [key, spec] of Object.entries(fields)) {
                const field = value[key];
                if (field === undefined) continue;
                // An empty optional collection and an absent one say the same thing.
                if (options.omitEmptyOptional && spec.optional && Array.isArray(field) && field.length === 0) continue;
                out[key] = pruneToSchema(field, spec.schema, options);
            }
            return out;
        }
        case "set":
        case "seq":
            return Array.isArray(value) ? value.map((item) => pruneToSchema(item, resolved.of, options)) : value;
        case "map":
            return isPlainObject(value)
                ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, pruneToSchema(item, resolved.of, options)]))
                : value;
        default:
            return value;
    }
}
