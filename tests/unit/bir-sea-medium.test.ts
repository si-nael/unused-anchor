// BIR schema and portable outcome positions for the v0.5.10 multiversal sea medium.
//
// These tests exercise the schema directly (lower, encode, decode, lift) rather than `encodeCausalProgramBir`,
// so they do not depend on the kernel validator's medium rules. The outcome tests decorate a real run with
// synthetic medium evidence shaped like the run contract in causal-runtime.ts.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
    BIR_FORMAT_VERSION,
    BirFormatError,
    BirLoweringError,
    CAUSAL_PROGRAM_SECTION,
    birSemanticDigest,
    causalOutcomeSchema,
    causalProgramSchema,
    decodeNode,
    encodeCausalOutcome,
    encodeNode,
    liftFromBir,
    lowerCausalProgramToBirNode,
    lowerToBir,
    projectCausalOutcome,
    type BirSchema,
} from "../../src/bubbles/bir";
import {
    realizeAnchoredCausalWorld,
    type AnchoredCausalRun,
    type CausalContinuation,
    type CausalSeaExchangeEvent,
    type CausalSeaMedium,
    type CausalTraceEntry,
    type ExactValue,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";

function r(numerator: string, denominator = "1"): ExactValue {
    return { kind: "rational", numerator, denominator };
}

function stable(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return `{${Object.keys(record).sort().filter((key) => record[key] !== undefined)
            .map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

function resolveSchema(schema: BirSchema): Exclude<BirSchema, { kind: "lazy" }> {
    let resolved = schema;
    while (resolved.kind === "lazy") resolved = resolved.resolve();
    return resolved;
}

/** Applies `order` to every array at a set position, recursively, leaving sequences in place. */
function mapSetPositions(value: unknown, schema: BirSchema, order: (items: unknown[]) => unknown[]): unknown {
    const resolved = resolveSchema(schema);
    if (value === undefined || value === null) return value;
    switch (resolved.kind) {
        case "set":
            return order((value as unknown[]).map((item) => mapSetPositions(item, resolved.of, order)));
        case "seq":
            return (value as unknown[]).map((item) => mapSetPositions(item, resolved.of, order));
        case "map":
            return Object.fromEntries(Object.entries(value as Record<string, unknown>).reverse()
                .map(([key, item]) => [key, mapSetPositions(item, resolved.of, order)]));
        case "record":
        case "variant": {
            const record = value as Record<string, unknown>;
            const fields = resolved.kind === "record" ? resolved.fields : resolved.variants[record[resolved.tag] as string]!;
            return Object.fromEntries(Object.entries(record).reverse().map(([key, item]) => [
                key,
                fields[key] ? mapSetPositions(item, fields[key]!.schema, order) : item,
            ]));
        }
        default:
            return value;
    }
}

const reverseSets = (value: unknown, schema: BirSchema) => mapSetPositions(value, schema, (items) => [...items].reverse());

/** A set-order-free rendering for deep equality modulo set order. */
const modSetOrder = (value: unknown, schema: BirSchema) => stable(mapSetPositions(value, schema, (items) => [...items]
    .sort((left, right) => (stable(left) < stable(right) ? -1 : stable(left) > stable(right) ? 1 : 0))));

function programSemanticDigest(payload: Uint8Array): string {
    return birSemanticDigest({
        formatVersion: { ...BIR_FORMAT_VERSION },
        sections: [{ name: CAUSAL_PROGRAM_SECTION, critical: true, payload }],
    });
}

function groveProgram(): ExecutableAnchoredCausalProgram {
    return JSON.parse(readFileSync(resolve(process.cwd(), "examples/generational-grove.world.json"), "utf8"));
}

const seaMedium: CausalSeaMedium = {
    id: "grove-sea",
    closure: "closed",
    regions: [
        { id: "region-a", negative: r("2"), positive: r("1") },
        { id: "region-b", negative: r("1", "2"), positive: r("3") },
        { id: "region-c", negative: r("0"), positive: r("1", "3") },
    ],
    placements: [
        { worldId: "origin-grove", regionId: "region-a" },
        { worldId: "descendant-grove", regionId: "region-b" },
    ],
    adjacency: [
        { id: "a-b", regionIds: ["region-a", "region-b"] },
        { id: "c-b", regionIds: ["region-c", "region-b"] },
    ],
    exchangeLaws: [
        {
            id: "seep-into-origin",
            quantity: "negative",
            from: { kind: "region", regionId: "region-a" },
            to: { kind: "world", worldId: "origin-grove" },
            amount: r("1", "3"),
            guard: {
                id: "region-a-holds-pressure",
                query: { familyId: "value-is-positive", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [],
                regionParameters: [{ parameterName: "value", regionId: "region-a", quantity: "negative" }],
            },
            application: "once-per-realization",
        },
        {
            id: "drift-a-to-b",
            quantity: "negative",
            from: { kind: "region", regionId: "region-a" },
            to: { kind: "region", regionId: "region-b" },
            amount: r("1", "2"),
            guard: {
                id: "both-regions-hold-pressure",
                query: { familyId: "both-at-least-one", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [],
                regionParameters: [
                    { parameterName: "left", regionId: "region-a", quantity: "negative" },
                    { parameterName: "right", regionId: "region-b", quantity: "positive" },
                ],
            },
            application: "once-per-realization",
        },
        {
            id: "release-from-descendant",
            quantity: "positive",
            from: { kind: "world", worldId: "descendant-grove" },
            to: { kind: "region", regionId: "region-b" },
            amount: r("1", "4"),
            guard: {
                id: "descendant-is-placed-and-supported",
                query: { familyId: "both-at-least-one", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [
                    { parameterName: "left", worldId: "descendant-grove", fieldId: "positive" },
                    { parameterName: "right", worldId: "descendant-grove", fieldId: "viability" },
                ],
                regionParameters: [],
            },
            application: "once-per-realization",
        },
        {
            id: "support-c-from-b",
            quantity: "positive",
            from: { kind: "region", regionId: "region-b" },
            to: { kind: "region", regionId: "region-c" },
            amount: r("1"),
            guard: {
                id: "always",
                query: { familyId: "always-true", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [],
                regionParameters: [],
            },
            application: "once-per-realization",
        },
    ],
};

function mediumProgram(): ExecutableAnchoredCausalProgram {
    const program = groveProgram();
    const one = r("1");
    program.world.formal.families.push({
        id: "both-at-least-one",
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind: "boolean",
        parameters: [{ name: "left", valueKind: "rational" }, { name: "right", valueKind: "rational" }],
        body: {
            kind: "binary",
            operator: "and",
            left: { kind: "binary", operator: "greater-than-or-equal", left: { kind: "parameter", name: "left" }, right: { kind: "value", value: one } },
            right: { kind: "binary", operator: "greater-than-or-equal", left: { kind: "parameter", name: "right" }, right: { kind: "value", value: one } },
        },
    });
    program.world.seaMedium = structuredClone(seaMedium);
    return program;
}

function encodeProgram(program: ExecutableAnchoredCausalProgram): Uint8Array {
    return encodeNode(lowerCausalProgramToBirNode(program));
}

function liftProgram(bytes: Uint8Array): ExecutableAnchoredCausalProgram {
    return liftFromBir(decodeNode(bytes), causalProgramSchema) as ExecutableAnchoredCausalProgram;
}

function loweringCode(action: () => unknown): string | undefined {
    try {
        action();
    } catch (error) {
        if (error instanceof BirLoweringError || error instanceof BirFormatError) return error.code;
        throw error;
    }
    return undefined;
}

test("a sea medium round-trips through BIR and its lift is a canonical fixed point", () => {
    const program = mediumProgram();
    const bytes = encodeProgram(program);
    const lifted = liftProgram(bytes);
    assert.equal(modSetOrder(lifted, causalProgramSchema), modSetOrder(program, causalProgramSchema));
    assert.equal(lifted.world.seaMedium?.exchangeLaws.length, 4);
    assert.deepEqual(Buffer.from(encodeProgram(lifted)), Buffer.from(bytes), "lifting is a fixed point");
    assert.equal(programSemanticDigest(encodeProgram(lifted)), programSemanticDigest(bytes));

    // The medium is meaning: removing it changes the bytes, and a program without one lifts without one.
    const without = groveProgram();
    assert.notDeepEqual(Buffer.from(encodeProgram(without)), Buffer.from(bytes));
    assert.equal("seaMedium" in liftProgram(encodeProgram(without)).world, false);

    // Each content field is semantic: a different endpoint, amount, quantity, or closure changes identity.
    const variants: Array<(medium: CausalSeaMedium) => void> = [
        (medium) => { medium.closure = "open"; },
        (medium) => { medium.exchangeLaws[0]!.amount = r("1", "5"); },
        (medium) => { medium.exchangeLaws[1]!.quantity = "positive"; },
        (medium) => { medium.exchangeLaws[2]!.to = { kind: "region", regionId: "region-c" }; },
        (medium) => { medium.exchangeLaws[0]!.from = { kind: "world", worldId: "origin-grove" }; },
        (medium) => { medium.placements[1]!.regionId = "region-c"; },
        (medium) => { medium.exchangeLaws[1]!.guard.regionParameters[0]!.quantity = "positive"; },
    ];
    for (const change of variants) {
        const changed = mediumProgram();
        change(changed.world.seaMedium!);
        assert.notEqual(programSemanticDigest(encodeProgram(changed)), programSemanticDigest(bytes));
    }
});

test("medium collections are sets: reversing every one leaves bytes and semantic identity unchanged", () => {
    const program = mediumProgram();
    const permuted = reverseSets(program, causalProgramSchema) as ExecutableAnchoredCausalProgram;
    const medium = permuted.world.seaMedium!;
    // Every medium set position holds at least two members, so the reversal really reorders it.
    assert.notEqual(stable(medium), stable(program.world.seaMedium));
    assert.deepEqual(medium.regions.map((region) => region.id), ["region-c", "region-b", "region-a"]);
    assert.deepEqual(medium.adjacency.map((edge) => edge.regionIds), [["region-b", "region-c"], ["region-b", "region-a"]]);
    assert.deepEqual(medium.exchangeLaws.find((law) => law.id === "drift-a-to-b")!.guard.regionParameters.map((p) => p.parameterName), ["right", "left"]);
    assert.deepEqual(medium.exchangeLaws.find((law) => law.id === "release-from-descendant")!.guard.fieldParameters.map((p) => p.parameterName), ["right", "left"]);

    const original = encodeProgram(program);
    const reordered = encodeProgram(permuted);
    assert.deepEqual(Buffer.from(reordered), Buffer.from(original));
    assert.equal(programSemanticDigest(reordered), programSemanticDigest(original));
});

test("lowering rejects non-canonical, duplicated, or unknown medium values", () => {
    const cases: Array<[string, string, (medium: CausalSeaMedium) => void]> = [
        ["BIRL06", "unreduced exchange amount", (medium) => { medium.exchangeLaws[0]!.amount = r("2", "4"); }],
        ["BIRL06", "negative-zero region quantity", (medium) => { medium.regions[2]!.negative = r("-0"); }],
        ["BIRL06", "non-canonical denominator", (medium) => { medium.regions[1]!.negative = r("1", "02"); }],
        ["BIRL03", "quantity that is not text", (medium) => { (medium.exchangeLaws[0] as unknown as Record<string, unknown>).quantity = 1; }],
        ["BIRL07", "unknown endpoint kind", (medium) => { (medium.exchangeLaws[0] as unknown as Record<string, unknown>).to = { kind: "outside", worldId: "origin-grove" }; }],
        ["BIRL02", "endpoint without its world", (medium) => { medium.exchangeLaws[0]!.to = { kind: "world" } as never; }],
        ["BIRL02", "law without a guard", (medium) => { delete (medium.exchangeLaws[3] as unknown as Record<string, unknown>).guard; }],
    ];
    for (const [code, label, change] of cases) {
        const program = mediumProgram();
        change(program.world.seaMedium!);
        assert.equal(loweringCode(() => lowerCausalProgramToBirNode(program)), code, label);
    }

    // A repeated region in one adjacency, or a duplicated placement, is a duplicate set member at encoding.
    const repeatedRegion = mediumProgram();
    repeatedRegion.world.seaMedium!.adjacency[0]!.regionIds = ["region-a", "region-a"];
    assert.equal(loweringCode(() => encodeProgram(repeatedRegion)), "BIR005");
    const duplicatedPlacement = mediumProgram();
    duplicatedPlacement.world.seaMedium!.placements.push({ worldId: "origin-grove", regionId: "region-a" });
    assert.equal(loweringCode(() => encodeProgram(duplicatedPlacement)), "BIR005");
});

test("an unknown field anywhere inside the medium is rejected rather than dropped", () => {
    const extras: Array<[string, (medium: Record<string, any>) => void]> = [
        ["$.world.seaMedium.flow", (medium) => { medium.flow = "continuous"; }],
        ["$.world.seaMedium.regions[0].metric", (medium) => { medium.regions[0].metric = r("1"); }],
        ["$.world.seaMedium.placements[0].weight", (medium) => { medium.placements[0].weight = r("1"); }],
        ["$.world.seaMedium.adjacency[0].distance", (medium) => { medium.adjacency[0].distance = r("1"); }],
        ["$.world.seaMedium.exchangeLaws[0].to.fieldId", (medium) => { medium.exchangeLaws[0].to.fieldId = "negative"; }],
        ["$.world.seaMedium.exchangeLaws[0].guard.regionParameters[0].worldId", (medium) => {
            medium.exchangeLaws[0].guard.regionParameters[0].worldId = "origin-grove";
        }],
        ["$.world.seaMedium.exchangeLaws[1].reversibility", (medium) => { medium.exchangeLaws[1].reversibility = "reversible"; }],
    ];
    for (const [path, change] of extras) {
        const program = mediumProgram();
        change(program.world.seaMedium as unknown as Record<string, any>);
        let caught: unknown;
        try {
            lowerCausalProgramToBirNode(program);
        } catch (error) {
            caught = error;
        }
        assert.ok(caught instanceof BirLoweringError, path);
        assert.equal(caught.code, "BIRL01", path);
        assert.equal(caught.path, path);
    }

    // Lifting is strict in the same way: bytes carrying a field outside the medium schema do not lift.
    const node = lowerCausalProgramToBirNode(mediumProgram());
    const world = node.kind === "record" ? node.fields.find(([key]) => key === "world")![1] : undefined;
    assert.ok(world?.kind === "record");
    const medium = world.fields.find(([key]) => key === "seaMedium")![1];
    assert.ok(medium.kind === "record");
    medium.fields.push(["zz-extra", { kind: "str", value: "host" }]);
    assert.throws(() => liftFromBir(decodeNode(encodeNode(node)), causalProgramSchema), (error: unknown) =>
        error instanceof BirLoweringError && error.code === "BIRL12");
});

// ---- Portable outcome ----

const finalRegions = [
    { id: "region-a", negative: r("7", "6"), positive: r("1") },
    { id: "region-b", negative: r("1"), positive: r("9", "4") },
    { id: "region-c", negative: r("0"), positive: r("4", "3") },
];

function exchangeEvents(): CausalSeaExchangeEvent[] {
    return [
        {
            id: "medium:seep-into-origin",
            lawId: "seep-into-origin",
            quantity: "negative",
            amount: r("1", "3"),
            from: { kind: "region", regionId: "region-a", before: r("2"), after: r("5", "3") },
            to: { kind: "world", worldId: "origin-grove", fieldId: "negative", before: r("1"), after: r("4", "3") },
            causes: ["initial:origin-grove.negative", "law:germinate-descendant"],
            hostSelection: false,
        },
        {
            id: "medium:drift-a-to-b",
            lawId: "drift-a-to-b",
            quantity: "negative",
            amount: r("1", "2"),
            from: { kind: "region", regionId: "region-a", before: r("5", "3"), after: r("7", "6") },
            to: { kind: "region", regionId: "region-b", before: r("1", "2"), after: r("1") },
            causes: ["medium:seep-into-origin", "initial:descendant-grove.positive"],
            hostSelection: false,
        },
        {
            id: "medium:release-from-descendant",
            lawId: "release-from-descendant",
            quantity: "positive",
            amount: r("1", "4"),
            from: { kind: "world", worldId: "descendant-grove", fieldId: "positive", before: r("1"), after: r("3", "4") },
            to: { kind: "region", regionId: "region-b", before: r("3"), after: r("13", "4") },
            causes: ["initial:descendant-grove.positive", "initial:descendant-grove.viability"],
            hostSelection: false,
        },
    ];
}

function mediumTraceEntries(start: number): CausalTraceEntry[] {
    return exchangeEvents().map((event, index) => {
        const effect = (endpoint: CausalSeaExchangeEvent["from"], operation: "add" | "subtract") => endpoint.kind === "region"
            ? { regionId: endpoint.regionId, fieldId: event.quantity, layer: "sea-region" as const, operation, before: endpoint.before, operand: event.amount, after: endpoint.after }
            : { worldId: endpoint.worldId, fieldId: endpoint.fieldId, layer: "world-field" as const, operation, before: endpoint.before, operand: event.amount, after: endpoint.after };
        return {
            id: `trace:${start + index}:${event.id}`,
            kind: "sea-medium",
            worldId: event.to.kind === "world" ? event.to.worldId : event.from.kind === "world" ? event.from.worldId : "grove-sea",
            eventId: event.id,
            lawId: event.lawId,
            causes: [...event.causes],
            effects: [effect(event.from, "subtract"), effect(event.to, "add")],
        };
    });
}

function decorateContinuation(continuation: CausalContinuation): void {
    continuation.seaMedium = {
        regions: structuredClone(finalRegions),
        balance: [
            { quantity: "negative", initialTotal: r("9", "2"), finalTotal: r("9", "2"), production: r("0"), balanced: true },
            { quantity: "positive", initialTotal: r("19", "3"), finalTotal: r("19", "3"), production: r("0"), balanced: true },
        ],
    };
    continuation.seaExchangeEvents = exchangeEvents();
    const retirement = continuation.lifecycleEvents?.find((event) => event.kind === "world-retirement");
    if (retirement?.residue) {
        retirement.residue.seaRelease = { regionId: "region-a", negative: r("4", "3"), positive: r("1") };
        const entry = continuation.trace.find((candidate) => candidate.kind === "world-retirement")!;
        entry.effects.push(
            { regionId: "region-a", fieldId: "negative", layer: "sea-region", operation: "add", before: r("7", "6"), operand: r("4", "3"), after: r("5", "2") },
            { regionId: "region-a", fieldId: "positive", layer: "sea-region", operation: "add", before: r("1"), operand: r("1"), after: r("2") },
        );
    }
    continuation.trace.push(...mediumTraceEntries(continuation.trace.length + 1));
}

function groveRun(): AnchoredCausalRun {
    return realizeAnchoredCausalWorld(groveProgram(), {});
}

function mediumRun(): AnchoredCausalRun {
    const run = structuredClone(groveRun());
    run.initialSeaMedium = structuredClone(seaMedium.regions);
    const continuations = new Set<CausalContinuation>([
        ...run.continuations,
        ...(run.autonomousContinuation ? [run.autonomousContinuation] : []),
        ...(run.autonomousContinuations ?? []),
    ]);
    for (const continuation of continuations) decorateContinuation(continuation);
    return run;
}

function liftOutcome(bytes: Uint8Array): Record<string, any> {
    return liftFromBir(decodeNode(bytes), causalOutcomeSchema) as Record<string, any>;
}

test("the portable outcome carries the medium's regions, exchanges, releases, balance, and region effects", () => {
    const run = mediumRun();
    const bytes = encodeCausalOutcome(run);
    assert.notDeepEqual(Buffer.from(bytes), Buffer.from(encodeCausalOutcome(groveRun())));

    const outcome = liftOutcome(bytes);
    assert.equal(modSetOrder(outcome, causalOutcomeSchema), modSetOrder(projectCausalOutcome(run), causalOutcomeSchema));
    assert.deepEqual(Buffer.from(encodeNode(lowerToBir(outcome, causalOutcomeSchema))), Buffer.from(bytes), "lifted outcome is canonical");

    const initialRegionsSchema = (causalOutcomeSchema as Extract<BirSchema, { kind: "record" }>).fields.initialSeaMedium!.schema;
    assert.equal(modSetOrder(outcome.initialSeaMedium, initialRegionsSchema), modSetOrder(seaMedium.regions, initialRegionsSchema));
    assert.ok(outcome.continuations.length > 0);
    for (const continuation of outcome.continuations) {
        assert.equal(continuation.seaMedium.regions.length, 3);
        assert.deepEqual(continuation.seaMedium.balance.map((entry: { quantity: string }) => entry.quantity).sort(), ["negative", "positive"]);
        assert.equal(continuation.seaMedium.balance[0].balanced, true);

        const events = new Map<string, Record<string, any>>(continuation.seaExchangeEvents.map((event: { id: string }) => [event.id, event]));
        assert.equal(events.size, 3);
        const seep = events.get("medium:seep-into-origin")!;
        assert.deepEqual(seep.to, { kind: "world", worldId: "origin-grove", fieldId: "negative", before: r("1"), after: r("4", "3") });
        assert.deepEqual(seep.from, { kind: "region", regionId: "region-a", before: r("2"), after: r("5", "3") });
        assert.equal("hostSelection" in seep, false, "a constant host flag is not part of the outcome");

        const release = continuation.lifecycleEvents.find((event: { kind: string }) => event.kind === "world-retirement");
        assert.deepEqual(release.residue.seaRelease, { regionId: "region-a", negative: r("4", "3"), positive: r("1") });

        const ledger = new Map<string, Record<string, any>>(continuation.ledger.map((entry: { key: string }) => [entry.key, entry]));
        const drift = ledger.get("medium:drift-a-to-b")!;
        assert.equal(drift.kind, "sea-medium");
        assert.deepEqual(drift.effects.map((effect: { regionId?: string; layer: string }) => `${effect.layer}:${effect.regionId}`).sort(), [
            "sea-region:region-a",
            "sea-region:region-b",
        ]);
        const retirementEntry = [...ledger.values()].find((entry) => entry.kind === "world-retirement")!;
        assert.equal(retirementEntry.effects.filter((effect: { layer: string }) => effect.layer === "sea-region").length, 2);
    }

    // Observable drift: a different `after` on one exchange changes the bytes.
    const drifted = mediumRun();
    drifted.continuations[0]!.seaExchangeEvents![0]!.to.after = r("5", "3");
    assert.notDeepEqual(Buffer.from(encodeCausalOutcome(drifted)), Buffer.from(bytes));
    const unbalanced = mediumRun();
    unbalanced.continuations[0]!.seaMedium!.balance[1]!.balanced = false;
    assert.notDeepEqual(Buffer.from(encodeCausalOutcome(unbalanced)), Buffer.from(bytes));
});

test("medium outcome sets are order-free and host-only exchange fields are ignored", () => {
    const run = mediumRun();
    const bytes = encodeCausalOutcome(run);

    const reordered = mediumRun();
    reordered.initialSeaMedium!.reverse();
    for (const continuation of reordered.continuations) {
        continuation.seaMedium!.regions.reverse();
        continuation.seaMedium!.balance.reverse();
        continuation.seaExchangeEvents!.reverse();
        for (const event of continuation.seaExchangeEvents!) event.causes.reverse();
        for (const entry of continuation.trace) {
            entry.effects.reverse();
            entry.causes.reverse();
        }
        continuation.trace.reverse();
    }
    assert.deepEqual(Buffer.from(encodeCausalOutcome(reordered)), Buffer.from(bytes));

    const hosted = mediumRun();
    for (const continuation of hosted.continuations) {
        for (const event of continuation.seaExchangeEvents!) {
            Object.assign(event, { reason: "the source held enough residue", sufficiencyProof: [{ step: 1 }] });
            Object.assign(event.from, { hostNote: "drawn first" });
        }
        Object.assign(continuation.seaMedium!, { evaluationOrder: ["region-a", "region-b"] });
    }
    assert.deepEqual(Buffer.from(encodeCausalOutcome(hosted)), Buffer.from(bytes));
});

test("empty medium collections on a run without a medium leave its outcome bytes unchanged", () => {
    const base = groveRun();
    const withEmpty = structuredClone(base);
    withEmpty.initialSeaMedium = [];
    for (const continuation of withEmpty.continuations) continuation.seaExchangeEvents = [];
    assert.deepEqual(Buffer.from(encodeCausalOutcome(withEmpty)), Buffer.from(encodeCausalOutcome(base)));
    assert.equal("initialSeaMedium" in projectCausalOutcome(base), false);
});
