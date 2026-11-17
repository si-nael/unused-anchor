// Prints the normative BIR v1 schema appendix (docs/reference/bir-schemas.md) from the exported schema objects.
//
// The appendix is generated rather than written by hand so that it cannot drift from the schemas the reference
// encoder, decoder, and outcome projection use: tests/unit/bir-schema-doc.test.ts requires the committed file to
// equal this generator's output.
//
// Usage: npx tsx apps/hatchery/print-bir-schemas.ts [output.md]   (default: docs/reference/bir-schemas.md)

import { writeFileSync } from "node:fs";
import path from "node:path";
import { CAUSAL_PROGRAM_SECTION, causalProgramSchema } from "../../src/bubbles/bir/causal-program";
import { CAUSAL_OPTIONS_SECTION, causalOptionsSchema, causalOutcomeSchema } from "../../src/bubbles/bir/causal-outcome";
import {
    CONFORMANCE_COST_SECTION,
    CONFORMANCE_LABEL_SECTION,
    CONFORMANCE_OUTCOME_SECTION,
    hostCostSchema,
    labelSchema,
} from "../../src/bubbles/bir/conformance";
import type { BirFieldSpec, BirSchema } from "../../src/bubbles/bir/schema";
import { compareCanonicalStrings } from "../../src/bubbles/world-kernel/canonical-order";

export const BIR_SCHEMA_APPENDIX_PATH = "docs/reference/bir-schemas.md";

type ResolvedSchema = Exclude<BirSchema, { kind: "lazy" }>;
type CompositeSchema = Extract<ResolvedSchema, { kind: "record" | "variant" }>;

interface Row {
    path: string;
    presence: string;
    schema: string;
    node: string;
}

interface SectionSpec {
    name: string;
    critical: boolean;
    schema: BirSchema;
    /** True for the outcome projection, which omits an optional set or sequence that would be empty. */
    omitEmptyOptional: boolean;
    summary: string;
}

const SECTIONS: SectionSpec[] = [
    {
        name: CAUSAL_PROGRAM_SECTION,
        critical: true,
        schema: causalProgramSchema,
        omitEmptyOptional: false,
        summary: "The executable causal program `bubble-anchored-causal-program.v2` ([bubble-ir.md](bubble-ir.md) section 6).",
    },
    {
        name: CAUSAL_OPTIONS_SECTION,
        critical: true,
        schema: causalOptionsSchema,
        omitEmptyOptional: false,
        summary: "Execution options, part of the input meaning ([causal-conformance.md](causal-conformance.md) section 1). An absent field means the oracle default; options with no field encode as `07 00`.",
    },
    {
        name: CONFORMANCE_OUTCOME_SECTION,
        critical: false,
        schema: causalOutcomeSchema,
        omitEmptyOptional: true,
        summary: "The expected portable outcome `bubble-causal-outcome.v1` ([causal-conformance.md](causal-conformance.md) section 3).",
    },
    {
        name: CONFORMANCE_COST_SECTION,
        critical: false,
        schema: hostCostSchema,
        omitEmptyOptional: false,
        summary: "The reference oracle's deterministic host-cost profile, informational ([causal-conformance.md](causal-conformance.md) section 5).",
    },
    {
        name: CONFORMANCE_LABEL_SECTION,
        critical: false,
        schema: labelSchema,
        omitEmptyOptional: false,
        summary: "Fixture name and description.",
    },
];

const NODE_TAGS: Record<ResolvedSchema["kind"], string> = {
    bool: "`01` / `02`",
    text: "`04`",
    literal: "`04`",
    "integer-text": "`03`",
    "safe-integer": "`03`",
    exact: "`10` / `11` / `12` / `13`",
    record: "`07`",
    variant: "`07`",
    set: "`06`",
    seq: "`05`",
    map: "`08`",
};

function code(text: string): string {
    return `\`${text}\``;
}

function resolveSchema(schema: BirSchema): ResolvedSchema {
    let current = schema;
    while (current.kind === "lazy") current = current.resolve();
    return current;
}

function canonicalEntries<T>(record: Record<string, T>): Array<[string, T]> {
    return Object.entries(record).sort(([left], [right]) => compareCanonicalStrings(left, right));
}

function isCollection(schema: ResolvedSchema): boolean {
    return schema.kind === "set" || schema.kind === "seq" || schema.kind === "map";
}

function fieldPresence(spec: BirFieldSpec, resolved: ResolvedSchema, omitEmptyOptional: boolean): string {
    if (!spec.optional) return isCollection(resolved) ? "required, even if empty" : "required";
    if (!isCollection(resolved)) return "optional";
    // The projection omits only empty arrays (sets and sequences); a map is never omitted for being empty.
    return omitEmptyOptional && resolved.kind !== "map" ? "optional, omitted if empty" : "optional, kept if empty";
}

function schemaLabel(schema: ResolvedSchema): string {
    switch (schema.kind) {
        case "literal":
            return `literal ${code(JSON.stringify(schema.value))}`;
        case "variant":
            return `variant on ${code(schema.tag)}: ${canonicalEntries(schema.variants).map(([tag]) => code(JSON.stringify(tag))).join(", ")}`;
        case "seq":
            return "seq (item order is meaning)";
        case "map":
            return "map (keys are data)";
        default:
            return schema.kind;
    }
}

class SchemaWalker {
    readonly rows: Row[] = [];
    private readonly firstPath = new Map<CompositeSchema, string>();
    private readonly open = new Set<CompositeSchema>();

    constructor(private readonly omitEmptyOptional: boolean) {}

    walk(schema: BirSchema, path: string, presence: string): void {
        const resolved = resolveSchema(schema);
        const node = NODE_TAGS[resolved.kind];
        switch (resolved.kind) {
            case "record":
            case "variant": {
                const first = this.firstPath.get(resolved);
                if (first !== undefined) {
                    const relation = this.open.has(resolved) ? "recursive: same schema as" : "same schema as";
                    this.rows.push({ path, presence, schema: `${resolved.kind}, ${relation} ${code(first)}`, node });
                    return;
                }
                this.firstPath.set(resolved, path);
                this.open.add(resolved);
                this.rows.push({ path, presence, schema: schemaLabel(resolved), node });
                if (resolved.kind === "record") {
                    this.fields(resolved.fields, path);
                } else {
                    for (const [tag, fields] of canonicalEntries(resolved.variants)) {
                        this.fields({ ...fields, [resolved.tag]: { schema: { kind: "literal", value: tag } } }, `${path}<${tag}>`);
                    }
                }
                this.open.delete(resolved);
                return;
            }
            case "set":
            case "seq":
                this.rows.push({ path, presence, schema: schemaLabel(resolved), node });
                this.walk(resolved.of, `${path}[]`, resolved.kind === "set" ? "member" : "item");
                return;
            case "map":
                this.rows.push({ path, presence, schema: schemaLabel(resolved), node });
                this.walk(resolved.of, `${path}{}`, "value");
                return;
            default:
                this.rows.push({ path, presence, schema: schemaLabel(resolved), node });
        }
    }

    private fields(fields: Record<string, BirFieldSpec>, path: string): void {
        for (const [key, spec] of canonicalEntries(fields)) {
            this.walk(spec.schema, `${path}.${key}`, fieldPresence(spec, resolveSchema(spec.schema), this.omitEmptyOptional));
        }
    }
}

function sectionTable(section: SectionSpec): string[] {
    const walker = new SchemaWalker(section.omitEmptyOptional);
    walker.walk(section.schema, "$", "root");
    return [
        "| Path | Presence | Schema | Node tag |",
        "| --- | --- | --- | --- |",
        ...walker.rows.map((row) => `| ${code(row.path)} | ${row.presence} | ${row.schema} | ${row.node} |`),
    ];
}

const PREAMBLE = [
    "# BIR v1 Schema Appendix",
    "",
    "Status: normative appendix to [bubble-ir.md](bubble-ir.md) and [causal-conformance.md](causal-conformance.md).",
    "",
    "This file is generated from the exported schema objects by `npx tsx apps/hatchery/print-bir-schemas.ts`, and `tests/unit/bir-schema-doc.test.ts` fails whenever it differs from the generator output. Change the schemas or the generator, never this file by hand.",
    "",
    "Every section payload listed here is exactly one BIR node, and each root is a record node. The tables below list every position of that node, so a backend can produce, and not only decode, each payload.",
    "",
    "## Reading the tables",
    "",
    "- **Path.** `$` is the payload's root node. `.name` is a record field, `[]` is a member of a set or an item of a sequence, `{}` is a value of a map (map keys are data), and `<tag>` selects one alternative of a variant.",
    "- **Order of rows.** The fields of a record are listed in canonical string order of their keys, which is the order in which they are encoded. Variant alternatives are listed in canonical order of their tags.",
    "- **Presence.** A `required` field is always encoded, and an `optional` field may be absent. `member`, `item`, and `value` mark collection elements. For a collection field, the presence also states whether an empty collection is encoded (see below). A record carries exactly its listed fields: a decoder rejects any other key (`BIRL12`) and an absent required field (`BIRL11`).",
    "- **Node tag.** The tag byte, in hex, of the node at that position ([bubble-ir.md](bubble-ir.md) section 4).",
    "- **`same schema as P`.** The position has exactly the schema listed under path `P`, whose rows are not repeated. `recursive: same schema as P` marks a position nested inside `P` that refers back to it.",
    "",
    "| Schema | Node | Constraint |",
    "| --- | --- | --- |",
    "| `bool` | structural boolean `01` (false) / `02` (true) | never an exact boolean |",
    "| `text` | string `04` | well-formed UTF-8 text |",
    "| `literal \"v\"` | string `04` | exactly the text `v` |",
    "| `integer-text` | integer `03` | the host value is a canonical decimal string `0` or `-?[1-9][0-9]*` (`BIRL05`) |",
    "| `safe-integer` | integer `03` | the host value is an integer with absolute value at most 2^53 - 1 (`BIRL08`, `BIRL15`) |",
    "| `exact` | rational `10`, exact boolean `11` / `12`, or symbol `13` | a canonical exact world value (`BIRL06`) |",
    "| `record` | record `07` | exactly the listed fields |",
    "| `variant on k` | record `07` | a record whose string field `k` is one of the listed tags, together with that alternative's fields; the tag field is listed in each alternative as a literal |",
    "| `set` | set `06` | unordered; members in strictly increasing bytewise order of their encodings, no duplicates |",
    "| `seq` | sequence `05` | ordered; item position is part of meaning |",
    "| `map` | map `08` | keys are data, in strictly increasing canonical string order |",
    "",
    "## Optional fields and empty collections",
    "",
    "- In every section, a required collection is always encoded, even when empty: an empty set is `06 00`, an empty sequence `05 00`, and an empty map `08 00`. The tables mark these fields `required, even if empty`.",
    "- In `core.causal-program` and `core.causal-execution-options`, presence is preserved exactly. An optional field is encoded exactly when the host object has it, and an optional collection given as empty is encoded as an empty node, which differs from an absent field in bytes and in semantic identity. No field is identified with a default. The tables mark these collections `optional, kept if empty`.",
    "- In `conformance.causal-outcome`, the projection applies exactly one normalization, at every depth: an optional set or sequence that would be empty is omitted. The tables mark these collections `optional, omitted if empty`. An optional field of any other kind (record, map, exact value, text, or boolean) is present exactly when the executed run defines it and is never omitted for being empty. Fields the run carries outside the schema are dropped before encoding, so they never affect conformance; a decoder of the section still rejects unknown keys.",
    "- In `conformance.host-cost` and `conformance.label`, every field is required.",
    "",
    "## Sections",
    "",
    "| Section | Critical | Content |",
    "| --- | --- | --- |",
];

/** Renders the complete appendix. The output depends only on the schema objects, so it is deterministic. */
export function renderBirSchemaAppendix(): string {
    const lines = [...PREAMBLE];
    for (const section of SECTIONS) {
        lines.push(`| [${code(section.name)}](#${section.name.replaceAll(".", "")}) | ${section.critical ? "yes" : "no"} | ${section.summary} |`);
    }
    for (const section of SECTIONS) {
        lines.push("", `## ${section.name}`, "", section.summary, "", ...sectionTable(section));
    }
    return `${lines.join("\n")}\n`;
}

function main(): void {
    const output = process.argv[2] ?? path.resolve(__dirname, "..", "..", BIR_SCHEMA_APPENDIX_PATH);
    writeFileSync(output, renderBirSchemaAppendix(), "utf8");
    process.stdout.write(`Wrote BIR schema appendix -> ${output.replaceAll("\\", "/")}\n`);
}

if (require.main === module) main();
