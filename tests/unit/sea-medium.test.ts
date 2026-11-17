// Kernel validation and execution of the v0.5.10 multiversal sea medium
// (docs/architecture/v0.5.10-multiversal-sea-medium.md). Programs are built in code so that every medium set
// position holds two or more members and every rule can be broken one at a time.

import assert from "node:assert/strict";
import test from "node:test";
import {
    exact,
    realizeAnchoredCausalWorld,
    recordAnchoredCausalReplay,
    replayAnchoredCausalRecord,
    term,
    validateExecutableCausalProgram,
    type AnchoredCausalRun,
    type CausalContinuation,
    type CausalInternalLaw,
    type CausalSeaEndpoint,
    type CausalSeaExchangeLaw,
    type CausalSeaMedium,
    type CausalSeaPredicate,
    type CausalSeaQuantity,
    type CausalWorldDefinition,
    type ExactValue,
    type ExecutableAnchoredCausalProgram,
    type IntensionalFamilyDefinition,
    type IntensionalTerm,
} from "../../src/bubbles/world-kernel";
import generationalGrove from "../../examples/generational-grove.world.json";
import selfOrganizingField from "../../examples/self-organizing-field.world.json";

// ---- Program construction ----

const DOMAIN = { axes: [{ name: "coordinate", kind: "natural" as const }] };
const at = { coordinate: "0" };

function constantFamily(value: number): IntensionalFamilyDefinition {
    return { id: `c-${value}`, domain: DOMAIN, valueKind: "rational", parameters: [], body: term.value(exact.integer(value)) };
}

function booleanFamily(id: string, parameters: Array<[string, "rational" | "boolean"]>, body: IntensionalTerm): IntensionalFamilyDefinition {
    return { id, domain: DOMAIN, valueKind: "boolean", parameters: parameters.map(([name, valueKind]) => ({ name, valueKind })), body };
}

const atLeast = (name: string, value: number) => term.binary("greater-than-or-equal", term.parameter(name), term.value(exact.integer(value)));

const PREDICATE_FAMILIES: IntensionalFamilyDefinition[] = [
    booleanFamily("always-true", [], term.value(exact.boolean(true))),
    booleanFamily("pressure-at-least-two", [["negative", "rational"]], atLeast("negative", 2)),
    booleanFamily("exceeds", [["left", "rational"], ["right", "rational"]], term.binary("greater-than", term.parameter("left"), term.parameter("right"))),
    booleanFamily(
        "open-seep",
        [["membrane", "rational"], ["structure", "rational"], ["pressure", "rational"]],
        term.binary("and",
            term.binary("equal", term.parameter("membrane"), term.value(exact.integer(1))),
            term.binary("and", atLeast("structure", 1), atLeast("pressure", 1))),
    ),
    booleanFamily("flag-is-set", [["flag", "boolean"]], term.parameter("flag")),
];

interface WorldSpec {
    id: string;
    latent?: boolean;
    negative: number;
    positive: number;
    structure?: number;
    membrane?: number;
}

function worldDefinition(spec: WorldSpec): CausalWorldDefinition {
    return {
        id: spec.id,
        ...(spec.latent ? { initialExistence: "latent" as const } : {}),
        fields: [
            { id: "positive", familyId: `c-${spec.positive}`, role: "positive-sea" },
            { id: "negative", familyId: `c-${spec.negative}`, role: "negative-sea" },
            { id: "viability", familyId: "c-1", role: "viability" },
            { id: "structure", familyId: `c-${spec.structure ?? 2}`, role: "structural-state" },
            { id: "membrane", familyId: `c-${spec.membrane ?? 1}`, role: "boundary-state" },
        ],
        protectedFieldIds: ["structure"],
        seaCoupling: { positiveFieldId: "positive", negativeFieldId: "negative", viabilityFieldId: "viability" },
    };
}

function buildProgram(
    specs: WorldSpec[],
    internalLaws: CausalInternalLaw[],
    seaMedium: CausalSeaMedium | undefined,
    internalConflictMode?: "underdetermined" | "maximal-commuting-branches",
): ExecutableAnchoredCausalProgram {
    const worlds = specs.map(worldDefinition);
    const constants = [...new Set([0, 1, ...specs.flatMap((spec) => [spec.negative, spec.positive, spec.structure ?? 2, spec.membrane ?? 1])])];
    return {
        mode: "bubble-anchored-causal-program.v2",
        world: {
            mode: "bubble-anchored-causal-world.v2",
            formal: { mode: "bubble-intensional-system.v1", families: [...constants.map(constantFamily), ...structuredClone(PREDICATE_FAMILIES)] },
            worlds,
            anchors: [{
                id: "first-anchor",
                endpoints: [{ kind: "world", worldId: specs[0]!.id, portId: "boundary" }],
                identityPredicateFamilyIds: ["always-true"],
                permittedInterventionKinds: ["condition"],
            }],
            ...(seaMedium ? { seaMedium } : {}),
            worldWill: {
                id: "sea-will",
                objectives: specs.map((spec) => ({
                    id: `keep-${spec.id}`,
                    targetWorldId: spec.id,
                    fieldId: "viability",
                    direction: "maximize" as const,
                    weight: exact.integer(1),
                })),
                hardConstraintFamilyIds: [],
                interventions: [],
            },
            internalLaws,
            emergenceCriteria: [],
            order: { kind: "causal-partial-order", universalClock: false },
        },
        fieldInitializers: worlds.flatMap((world) => world.fields.map((field) => ({
            worldId: world.id,
            fieldId: field.id,
            query: { familyId: field.familyId, at, parameters: {} },
        }))),
        seaLaws: specs.map((spec) => ({ worldId: spec.id, positiveWeight: exact.integer(1), negativeWeight: exact.integer(1) })),
        execution: {
            decisionMode: "deterministic",
            ...(internalConflictMode ? { internalConflictMode } : {}),
            hardConstraints: [],
            anchorIdentity: [{
                id: "first-anchor-remains",
                anchorId: "first-anchor",
                query: { familyId: "always-true", at, parameters: {} },
                fieldParameters: [],
            }],
            interventionCosts: [],
        },
    };
}

const region = (regionId: string): CausalSeaEndpoint => ({ kind: "region", regionId });
const world = (worldId: string): CausalSeaEndpoint => ({ kind: "world", worldId });

function seaGuard(
    id: string,
    familyId: string,
    fields: Array<[string, string, string]> = [],
    regions: Array<[string, string, CausalSeaQuantity]> = [],
): CausalSeaPredicate {
    return {
        id,
        query: { familyId, at, parameters: {} },
        fieldParameters: fields.map(([parameterName, worldId, fieldId]) => ({ parameterName, worldId, fieldId })),
        regionParameters: regions.map(([parameterName, regionId, quantity]) => ({ parameterName, regionId, quantity })),
    };
}

function exchange(
    id: string,
    quantity: CausalSeaQuantity,
    from: CausalSeaEndpoint,
    to: CausalSeaEndpoint,
    amount: number,
    guard: CausalSeaPredicate = seaGuard(`${id}-always`, "always-true"),
): CausalSeaExchangeLaw {
    return { id, quantity, from, to, amount: exact.integer(amount), guard, application: "once-per-realization" };
}

function internalLaw(
    id: string,
    worldId: string,
    familyId: string,
    fields: Array<[string, string]>,
    rest: Partial<CausalInternalLaw> = {},
): CausalInternalLaw {
    return {
        id,
        worldId,
        guard: {
            id: `${id}-guard`,
            query: { familyId, at, parameters: {} },
            fieldParameters: fields.map(([parameterName, fieldId]) => ({ parameterName, worldId, fieldId })),
        },
        effects: [],
        application: "once-per-realization",
        reversibility: "irreversible",
        ...rest,
    };
}

/**
 * Two active worlds and one latent world in three shared regions. The elder world retires by its own law; its
 * residue enters its basin, diffuses to the neighbouring basin, seeps through the younger world's open membrane,
 * and the younger world erodes by its own law.
 */
function universeProgram(closure: "closed" | "open" = "closed"): ExecutableAnchoredCausalProgram {
    return buildProgram(
        [
            { id: "elder", negative: 3, positive: 2 },
            { id: "younger", negative: 0, positive: 1 },
            { id: "seed", latent: true, negative: 1, positive: 1 },
        ],
        [
            internalLaw("retire-elder", "elder", "always-true", [], { lifecycleEffects: [{ kind: "retire-self" }] }),
            internalLaw("erode", "younger", "pressure-at-least-two", [["negative", "negative"]], {
                effects: [{ fieldId: "structure", operation: "subtract", value: exact.integer(1) }],
            }),
        ],
        {
            id: "shared-sea",
            closure,
            regions: [
                { id: "elder-basin", negative: exact.integer(0), positive: exact.integer(0) },
                { id: "younger-basin", negative: exact.integer(0), positive: exact.integer(1) },
                { id: "seed-shoal", negative: exact.integer(0), positive: exact.integer(0) },
            ],
            placements: [
                { worldId: "elder", regionId: "elder-basin" },
                { worldId: "younger", regionId: "younger-basin" },
                { worldId: "seed", regionId: "seed-shoal" },
            ],
            adjacency: [
                { id: "basin-link", regionIds: ["elder-basin", "younger-basin"] },
                { id: "shoal-link", regionIds: ["younger-basin", "seed-shoal"] },
            ],
            exchangeLaws: [
                exchange("diffuse", "negative", region("elder-basin"), region("younger-basin"), 2, seaGuard(
                    "gradient",
                    "exceeds",
                    [],
                    [["left", "elder-basin", "negative"], ["right", "younger-basin", "negative"]],
                )),
                exchange("seep", "negative", region("younger-basin"), world("younger"), 2, seaGuard(
                    "membrane-open",
                    "open-seep",
                    [["membrane", "younger", "membrane"], ["structure", "younger", "structure"]],
                    [["pressure", "younger-basin", "negative"]],
                )),
            ],
        },
    );
}

/** Two worlds placed in one pool whose residue suffices for either draw but not for both. */
function scarcityProgram(mode?: "underdetermined" | "maximal-commuting-branches"): ExecutableAnchoredCausalProgram {
    return buildProgram(
        [{ id: "left", negative: 0, positive: 0 }, { id: "right", negative: 0, positive: 0 }],
        [],
        {
            id: "pool-sea",
            closure: "closed",
            regions: [
                { id: "pool", negative: exact.integer(3), positive: exact.integer(0) },
                { id: "margin", negative: exact.integer(0), positive: exact.integer(0) },
            ],
            placements: [{ worldId: "left", regionId: "pool" }, { worldId: "right", regionId: "pool" }],
            adjacency: [{ id: "pool-margin", regionIds: ["pool", "margin"] }],
            exchangeLaws: [
                exchange("draw-left", "negative", region("pool"), world("left"), 2),
                exchange("draw-right", "negative", region("pool"), world("right"), 2),
            ],
        },
        mode,
    );
}

// ---- Observation helpers ----

function stable(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

function withoutProgramDigest(run: AnchoredCausalRun): string {
    const { programDigest: _programDigest, ...rest } = run;
    return stable(rest);
}

function codes(program: ExecutableAnchoredCausalProgram): string[] {
    return validateExecutableCausalProgram(program).map((diagnostic) => diagnostic.code);
}

function fieldOf(continuation: CausalContinuation, worldId: string, fieldId: string): ExactValue | undefined {
    return continuation.worldStates.find((state) => state.worldId === worldId)?.fields[fieldId];
}

function regionOf(continuation: CausalContinuation, regionId: string) {
    return continuation.seaMedium?.regions.find((entry) => entry.id === regionId);
}

function balanceOf(continuation: CausalContinuation, quantity: CausalSeaQuantity) {
    return continuation.seaMedium?.balance.find((entry) => entry.quantity === quantity);
}

function isNegative(value: ExactValue): boolean {
    return value.kind === "rational" && value.numerator.startsWith("-");
}

/** No region quantity or world sea field is ever negative, before or after any recorded effect. */
function assertNoNegativeSea(run: AnchoredCausalRun): void {
    for (const continuation of run.continuations) {
        for (const entry of continuation.trace) {
            for (const effect of entry.effects) {
                if (effect.layer === "sea-region" || effect.fieldId === "negative" || effect.fieldId === "positive") {
                    assert.ok(!isNegative(effect.after) && !(effect.before && isNegative(effect.before)), `${continuation.id} ${entry.id}`);
                }
            }
        }
        for (const entry of continuation.seaMedium?.regions ?? []) {
            assert.ok(!isNegative(entry.negative) && !isNegative(entry.positive), `${continuation.id} region ${entry.id}`);
        }
    }
}

// ---- Tests ----

test("collapsed-world residue enters its region, diffuses through adjacency, seeps through a membrane, and erodes a neighbour by its own law", () => {
    const program = universeProgram();
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "stable", run.reason);
    const continuation = run.autonomousContinuation!;

    const retirement = continuation.lifecycleEvents!.find((event) => event.kind === "world-retirement")!;
    assert.equal(retirement.id, "retire:elder:by:retire-elder");
    assert.deepEqual(retirement.residue?.seaRelease, { regionId: "elder-basin", negative: exact.integer(3), positive: exact.integer(2) });
    assert.deepEqual(retirement.residue?.localNegativeSea, exact.integer(3), "residue still records the world's sea at retirement");
    assert.equal(continuation.worldStates.find((state) => state.worldId === "elder")?.lifecycle?.phase, "retired");
    assert.deepEqual(fieldOf(continuation, "elder", "negative"), exact.integer(0));
    assert.deepEqual(fieldOf(continuation, "elder", "positive"), exact.integer(0));
    assert.deepEqual(fieldOf(continuation, "elder", "viability"), exact.integer(1), "released sea leaves only intrinsic viability");

    const retirementEntry = continuation.trace.find((entry) => entry.kind === "world-retirement")!;
    assert.deepEqual(retirementEntry.effects.map((effect) => `${effect.layer}:${effect.regionId ?? effect.worldId}:${effect.fieldId}`), [
        "world-field:elder:negative",
        "world-field:elder:positive",
        "sea-region:elder-basin:negative",
        "sea-region:elder-basin:positive",
    ]);

    const events = continuation.seaExchangeEvents!;
    assert.deepEqual(events.map((event) => event.id), ["medium:diffuse", "medium:seep"]);
    assert.ok(events.every((event) => event.hostSelection === false));
    assert.deepEqual(events[0]!.from, { kind: "region", regionId: "elder-basin", before: exact.integer(3), after: exact.integer(1) });
    assert.deepEqual(events[0]!.to, { kind: "region", regionId: "younger-basin", before: exact.integer(0), after: exact.integer(2) });
    assert.deepEqual(events[0]!.causes, [retirement.id]);
    assert.deepEqual(events[1]!.to, { kind: "world", worldId: "younger", fieldId: "negative", before: exact.integer(0), after: exact.integer(2) });
    assert.deepEqual(events[1]!.causes, ["medium:diffuse"]);

    const diffuseEntry = continuation.trace.find((entry) => entry.eventId === "medium:diffuse")!;
    assert.equal(diffuseEntry.kind, "sea-medium");
    assert.match(diffuseEntry.id, /^trace:\d+:medium:diffuse$/);
    assert.equal(diffuseEntry.worldId, "shared-sea", "a region-to-region exchange belongs to the medium");
    assert.deepEqual(diffuseEntry.effects.map((effect) => [effect.layer, effect.regionId, effect.fieldId, effect.operation]), [
        ["sea-region", "elder-basin", "negative", "subtract"],
        ["sea-region", "younger-basin", "negative", "add"],
    ]);
    const seepEntry = continuation.trace.find((entry) => entry.eventId === "medium:seep")!;
    assert.equal(seepEntry.worldId, "younger");
    assert.deepEqual(seepEntry.effects.map((effect) => `${effect.layer}:${effect.regionId ?? effect.worldId}:${effect.fieldId}`), [
        "sea-region:younger-basin:negative",
        "world-field:younger:negative",
    ]);
    assert.ok(continuation.trace.some((entry) => entry.kind === "sea-coupling" && entry.worldId === "younger"
        && entry.causes.includes("medium:seep")), "a changed world sea field recomputes that world's viability");

    // The universe connects worlds through the sea: one causal chain from one world's law to another world's law.
    const edges = new Set(continuation.order.causalEdges.map((edge) => `${edge.cause}->${edge.effect}`));
    for (const edge of [
        "law:retire-elder->retire:elder:by:retire-elder",
        "retire:elder:by:retire-elder->medium:diffuse",
        "medium:diffuse->medium:seep",
        "medium:seep->law:erode",
    ]) assert.ok(edges.has(edge), edge);
    assert.deepEqual(fieldOf(continuation, "younger", "negative"), exact.integer(2));
    assert.deepEqual(fieldOf(continuation, "younger", "structure"), exact.integer(1), "the neighbour eroded by its own law");
    assert.deepEqual(continuation.order.evaluationFrontiers, [
        ["law:retire-elder"],
        ["retire:elder:by:retire-elder"],
        ["medium:diffuse"],
        ["medium:seep"],
        ["law:erode"],
    ]);
    assert.ok(continuation.order.irreversibleEventIds.includes("medium:seep"));

    // The runtime-added sufficiency condition is recorded beside the authored guard.
    const evidence = new Map(run.formalEvidence.map((entry) => [entry.subjectId, entry]));
    assert.deepEqual(evidence.get("autonomous:frontier:0:medium:diffuse:#sufficiency")?.value, exact.boolean(false));
    assert.equal(evidence.has("autonomous:frontier:0:medium:diffuse:gradient"), false, "an insufficient source leaves the guard unevaluated");
    assert.deepEqual(evidence.get("autonomous:frontier:1:medium:diffuse:#sufficiency")?.value, exact.boolean(true));
    assert.deepEqual(evidence.get("autonomous:frontier:1:medium:diffuse:gradient")?.value, exact.boolean(true));

    assert.deepEqual(run.initialSeaMedium?.map((entry) => entry.id), ["elder-basin", "seed-shoal", "younger-basin"]);
    assert.deepEqual(continuation.seaMedium?.regions, [
        { id: "elder-basin", negative: exact.integer(1), positive: exact.integer(2) },
        { id: "seed-shoal", negative: exact.integer(0), positive: exact.integer(0) },
        { id: "younger-basin", negative: exact.integer(0), positive: exact.integer(1) },
    ]);
    assertNoNegativeSea(run);

    const replay = replayAnchoredCausalRecord(recordAnchoredCausalReplay(program));
    assert.equal(replay.status, "same-world-reexecution");
});

test("a closed medium conserves both quantities exactly over every region and every world, latent ones included", () => {
    const continuation = realizeAnchoredCausalWorld(universeProgram()).autonomousContinuation!;
    // negative: elder 3 + seed (latent) 1; positive: younger-basin 1 + elder 2 + younger 1 + seed 1.
    assert.deepEqual(balanceOf(continuation, "negative"), {
        quantity: "negative",
        initialTotal: exact.integer(4),
        finalTotal: exact.integer(4),
        production: exact.integer(0),
        balanced: true,
    });
    assert.deepEqual(balanceOf(continuation, "positive"), {
        quantity: "positive",
        initialTotal: exact.integer(5),
        finalTotal: exact.integer(5),
        production: exact.integer(0),
        balanced: true,
    });
    assert.deepEqual(continuation.seaMedium?.balance.map((entry) => entry.quantity), ["negative", "positive"]);
});

test("an open medium records every non-medium write of a world sea field as production and stays balanced", () => {
    const program = universeProgram("open");
    program.world.internalLaws.push(
        internalLaw("absorb", "younger", "always-true", [], {
            effects: [{ fieldId: "negative", operation: "add", value: exact.integer(1) }],
        }),
        internalLaw("anchor-placement", "younger", "always-true", [], {
            effects: [{ fieldId: "positive", operation: "set", value: exact.integer(4) }],
        }),
    );
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "stable", run.reason);
    const continuation = run.autonomousContinuation!;
    assert.deepEqual(fieldOf(continuation, "younger", "negative"), exact.integer(3));
    assert.deepEqual(balanceOf(continuation, "negative"), {
        quantity: "negative", initialTotal: exact.integer(4), finalTotal: exact.integer(5), production: exact.integer(1), balanced: true,
    });
    assert.deepEqual(balanceOf(continuation, "positive"), {
        quantity: "positive", initialTotal: exact.integer(5), finalTotal: exact.integer(8), production: exact.integer(3), balanced: true,
    });

    const closed = structuredClone(program);
    closed.world.seaMedium!.closure = "closed";
    assert.ok(codes(closed).includes("CKW233"), "the same writes are rejected by a closed medium");
});

test("joint scarcity is underdetermined by default and never resolved by declaration or id order", () => {
    const program = scarcityProgram();
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "underdetermined");
    assert.match(run.reason ?? "", /scarce source/);
    assert.deepEqual(run.unresolvedAlternativeIds, ["medium:draw-left", "medium:draw-right"]);
    const partial = run.autonomousContinuation!;
    assert.deepEqual(partial.seaExchangeEvents, [], "neither draw is picked");
    assert.deepEqual(regionOf(partial, "pool")?.negative, exact.integer(3));
    assert.equal(partial.trace.some((entry) => entry.kind === "sea-medium"), false);

    const reversed = structuredClone(program);
    reversed.world.seaMedium!.exchangeLaws.reverse();
    assert.equal(withoutProgramDigest(realizeAnchoredCausalWorld(reversed)), withoutProgramDigest(run));
});

test("maximal commuting branches realize every maximal draw from a scarce source, and no branch overdraws it", () => {
    const program = scarcityProgram("maximal-commuting-branches");
    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "plural", run.reason);
    const branches = run.autonomousContinuations!;
    assert.equal(branches.length, 2);
    assert.deepEqual(branches.map((branch) => branch.seaExchangeEvents!.map((event) => event.id)).sort(), [
        ["medium:draw-left"],
        ["medium:draw-right"],
    ]);
    for (const branch of branches) {
        const step = branch.branchLineage![0]!;
        assert.deepEqual(step.enabledLawIds, ["draw-left", "draw-right"]);
        assert.equal(step.realizedLawIds.length, 1);
        assert.deepEqual([...step.realizedLawIds, ...step.nonrealizedLawIds].sort(), ["draw-left", "draw-right"]);
        assert.equal(step.hostSelection, false);
        assert.deepEqual(regionOf(branch, "pool")?.negative, exact.integer(1), "the other draw stays unrealized, not overdrawn");
        assert.ok(branch.seaMedium!.balance.every((entry) => entry.balanced));
        const drawn = step.realizedLawIds[0] === "draw-left" ? "left" : "right";
        const untouched = drawn === "left" ? "right" : "left";
        assert.deepEqual(fieldOf(branch, drawn, "negative"), exact.integer(2));
        assert.deepEqual(fieldOf(branch, untouched, "negative"), exact.integer(0));
    }
    assertNoNegativeSea(run);

    const reversed = structuredClone(program);
    reversed.world.seaMedium!.exchangeLaws.reverse();
    reversed.world.seaMedium!.placements.reverse();
    reversed.world.seaMedium!.regions.reverse();
    assert.equal(withoutProgramDigest(realizeAnchoredCausalWorld(reversed)), withoutProgramDigest(run));
});

test("an exchange conflicts with any frontier entry that writes one of its world sea fields, including retirement", () => {
    const writer = scarcityProgram();
    writer.world.seaMedium!.closure = "open";
    writer.world.seaMedium!.exchangeLaws = [writer.world.seaMedium!.exchangeLaws[0]!];
    writer.world.internalLaws = [internalLaw("pressurize", "left", "always-true", [], {
        effects: [{ fieldId: "negative", operation: "add", value: exact.integer(1) }],
    })];
    assert.deepEqual(validateExecutableCausalProgram(writer), []);
    const writerRun = realizeAnchoredCausalWorld(writer);
    assert.equal(writerRun.status, "underdetermined");
    assert.deepEqual(writerRun.unresolvedAlternativeIds, ["law:pressurize", "medium:draw-left"]);
    writer.execution.internalConflictMode = "maximal-commuting-branches";
    const writerBranches = realizeAnchoredCausalWorld(writer).autonomousContinuations!;
    assert.deepEqual(writerBranches.map((branch) => branch.branchLineage![0]!.realizedLawIds).sort(), [["draw-left"], ["pressurize"]]);
    assert.ok(writerBranches.every((branch) => branch.seaMedium!.balance.every((entry) => entry.balanced)));

    const retiring = scarcityProgram();
    retiring.world.seaMedium!.exchangeLaws = [retiring.world.seaMedium!.exchangeLaws[0]!];
    retiring.world.internalLaws = [internalLaw("retire-left", "left", "always-true", [], { lifecycleEffects: [{ kind: "retire-self" }] })];
    const retiringRun = realizeAnchoredCausalWorld(retiring);
    assert.equal(retiringRun.status, "underdetermined");
    assert.deepEqual(retiringRun.unresolvedAlternativeIds, ["law:retire-left", "medium:draw-left"]);

    // Draws from distinct sources into distinct worlds commute and form one frontier.
    const commuting = scarcityProgram();
    commuting.world.seaMedium!.regions.push({ id: "spring", negative: exact.integer(2), positive: exact.integer(0) });
    commuting.world.seaMedium!.placements[1]!.regionId = "spring";
    commuting.world.seaMedium!.exchangeLaws[1]!.from = region("spring");
    const commutingRun = realizeAnchoredCausalWorld(commuting);
    assert.equal(commutingRun.status, "stable", commutingRun.reason);
    assert.deepEqual(commutingRun.autonomousContinuation!.order.evaluationFrontiers, [["medium:draw-left", "medium:draw-right"]]);
});

test("the runtime sufficiency condition forbids any overdraw, and a release can never drive a region negative", () => {
    const program = scarcityProgram();
    program.world.seaMedium!.exchangeLaws = [
        exchange("thirst", "negative", region("pool"), world("left"), 4),
        exchange("shed", "negative", world("right"), region("pool"), 1),
    ];
    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "stable", run.reason);
    const continuation = run.autonomousContinuation!;
    assert.deepEqual(continuation.seaExchangeEvents, []);
    assert.deepEqual(regionOf(continuation, "pool")?.negative, exact.integer(3));
    const evidence = new Map(run.formalEvidence.map((entry) => [entry.subjectId, entry]));
    assert.deepEqual(evidence.get("autonomous:frontier:0:medium:thirst:#sufficiency")?.value, exact.boolean(false));
    assert.deepEqual(evidence.get("autonomous:frontier:0:medium:shed:#sufficiency")?.value, exact.boolean(false));
    assert.equal([...evidence.keys()].some((key) => key.includes(":medium:thirst:thirst-always")), false);

    // Exactly enough is enough.
    program.world.seaMedium!.exchangeLaws[0]!.amount = exact.integer(3);
    const exactRun = realizeAnchoredCausalWorld(program);
    assert.deepEqual(regionOf(exactRun.autonomousContinuation!, "pool")?.negative, exact.integer(0));
    assertNoNegativeSea(exactRun);

    // A world whose local negative sea is below zero cannot release it into an empty region.
    const debtor = buildProgram([{ id: "debtor", negative: -1, positive: 0 }], [
        internalLaw("retire-debtor", "debtor", "always-true", [], { lifecycleEffects: [{ kind: "retire-self" }] }),
    ], {
        id: "thin-sea",
        closure: "closed",
        regions: [{ id: "shallows", negative: exact.integer(0), positive: exact.integer(0) }],
        placements: [{ worldId: "debtor", regionId: "shallows" }],
        adjacency: [],
        exchangeLaws: [],
    });
    const debtorRun = realizeAnchoredCausalWorld(debtor);
    assert.equal(debtorRun.status, "contradicted");
    assert.match(debtorRun.reason ?? "", /debtor.*must stay non-negative/);
});

test("a region quantity changed by an exchange and a release in one frontier is caused by both", () => {
    const program = buildProgram(
        [{ id: "left", negative: 2, positive: 0 }, { id: "right", negative: 1, positive: 0 }],
        [internalLaw("retire-left", "left", "always-true", [], { lifecycleEffects: [{ kind: "retire-self" }] })],
        {
            id: "pool-sea",
            closure: "closed",
            regions: [
                { id: "pool", negative: exact.integer(0), positive: exact.integer(0) },
                { id: "margin", negative: exact.integer(0), positive: exact.integer(0) },
            ],
            placements: [{ worldId: "left", regionId: "pool" }, { worldId: "right", regionId: "pool" }],
            adjacency: [{ id: "pool-margin", regionIds: ["margin", "pool"] }],
            exchangeLaws: [
                exchange("shed-right", "negative", world("right"), region("pool"), 1),
                exchange("drift", "negative", region("pool"), region("margin"), 3),
            ],
        },
    );
    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "stable", run.reason);
    const continuation = run.autonomousContinuation!;
    assert.deepEqual(continuation.order.evaluationFrontiers, [
        ["law:retire-left", "medium:shed-right"],
        ["retire:left:by:retire-left"],
        ["medium:drift"],
    ]);
    const drift = continuation.seaExchangeEvents!.find((event) => event.id === "medium:drift")!;
    assert.deepEqual(drift.from, { kind: "region", regionId: "pool", before: exact.integer(3), after: exact.integer(0) });
    assert.deepEqual(drift.causes, ["medium:shed-right", "retire:left:by:retire-left"]);
    // Isolated `before` values: the release reads the lifecycle sub-step's starting region, not a host order.
    const releaseEffect = continuation.trace.find((entry) => entry.kind === "world-retirement")!.effects
        .find((effect) => effect.layer === "sea-region" && effect.fieldId === "negative")!;
    assert.deepEqual([releaseEffect.before, releaseEffect.after], [exact.integer(1), exact.integer(3)]);
    assert.ok(continuation.seaMedium!.balance.every((entry) => entry.balanced && isZeroProduction(entry.production)));
});

function isZeroProduction(value: ExactValue): boolean {
    return value.kind === "rational" && value.numerator === "0";
}

test("a latent endpoint world joins the medium only after its lawful birth", () => {
    const program = universeProgram();
    const medium = program.world.seaMedium!;
    medium.regions.find((entry) => entry.id === "seed-shoal")!.positive = exact.integer(1);
    medium.exchangeLaws.push(exchange("nourish-seed", "positive", region("seed-shoal"), world("seed"), 1));
    const dormant = realizeAnchoredCausalWorld(program).autonomousContinuation!;
    assert.equal(dormant.seaExchangeEvents!.some((event) => event.lawId === "nourish-seed"), false);
    assert.equal(realizeAnchoredCausalWorld(program).formalEvidence.some((entry) => entry.subjectId.includes(":medium:nourish-seed:")), false);

    program.world.internalLaws.push(internalLaw("spawn-seed", "younger", "always-true", [], {
        lifecycleEffects: [{ kind: "spawn-world", targetWorldId: "seed" }],
    }));
    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "stable", run.reason);
    const continuation = run.autonomousContinuation!;
    const birth = continuation.lifecycleEvents!.find((event) => event.kind === "world-spawn")!;
    const nourish = continuation.seaExchangeEvents!.find((event) => event.lawId === "nourish-seed")!;
    assert.deepEqual(nourish.causes, [birth.id]);
    assert.deepEqual(continuation.order.evaluationFrontiers[2], ["medium:diffuse", "medium:nourish-seed"]);
    assert.deepEqual(fieldOf(continuation, "seed", "positive"), exact.integer(2));
    assert.ok(continuation.seaMedium!.balance.every((entry) => entry.balanced));
});

test("World Will writes of a world sea field in an open medium are production on the selected continuation", () => {
    const program = scarcityProgram();
    program.world.seaMedium!.closure = "open";
    program.world.worldWill.interventions = [{
        id: "nourish-left",
        targetWorldId: "left",
        anchorId: "first-anchor",
        kind: "condition",
        effects: [{ fieldId: "positive", operation: "add", value: exact.integer(1) }],
    }];
    program.execution.interventionCosts = [{ interventionId: "nourish-left", cost: exact.integer(0) }];
    program.world.seaMedium!.exchangeLaws = [exchange("draw-left", "negative", region("pool"), world("left"), 2)];
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "realized", run.reason);
    const selected = run.continuations.find((continuation) => run.selectedContinuationIds.includes(continuation.id))!;
    assert.deepEqual(selected.interventionIds, ["nourish-left"]);
    assert.deepEqual(balanceOf(selected, "positive"), {
        quantity: "positive", initialTotal: exact.integer(0), finalTotal: exact.integer(1), production: exact.integer(1), balanced: true,
    });
    assert.deepEqual(balanceOf(selected, "negative")?.production, exact.integer(0));
    assert.deepEqual(balanceOf(run.autonomousContinuation!, "positive")?.production, exact.integer(0));

    const closed = structuredClone(program);
    closed.world.seaMedium!.closure = "closed";
    assert.ok(codes(closed).includes("CKW235"));

    // The medium may not move a field that a transfer's anchor identity reads (membrane contract, like CKR026).
    const identity = structuredClone(program);
    identity.world.anchors[0]!.endpoints.push({ kind: "world", worldId: "right", portId: "boundary" });
    identity.world.anchorTransfers = [{
        id: "left-to-right",
        anchorId: "first-anchor",
        source: { worldId: "left", portId: "boundary", fieldId: "structure" },
        target: { worldId: "right", portId: "boundary", fieldId: "membrane" },
        sourceNegativeSeaResidue: exact.integer(1),
        targetPositiveSeaPlacement: exact.integer(0),
    }];
    identity.execution.anchorIdentity[0]!.query.familyId = "pressure-at-least-two";
    identity.world.anchors[0]!.identityPredicateFamilyIds = ["pressure-at-least-two"];
    identity.execution.anchorIdentity[0]!.fieldParameters = [{ parameterName: "negative", worldId: "left", fieldId: "negative" }];
    assert.ok(codes(identity).includes("CKR200"));
});

test("every medium validation rule rejects its violation with a CKW2xx code", () => {
    const cases: Array<[string, string, (program: ExecutableAnchoredCausalProgram) => void]> = [
        ["CKW200", "unstable medium id", (p) => { p.world.seaMedium!.id = "shared sea"; }],
        ["CKW201", "medium id names a world", (p) => { p.world.seaMedium!.id = "elder"; }],
        ["CKW202", "unknown closure", (p) => { (p.world.seaMedium as { closure: string }).closure = "leaky"; }],
        ["CKW203", "no regions", (p) => { p.world.seaMedium!.regions = []; }],
        ["CKW204", "unstable region id", (p) => { p.world.seaMedium!.regions[2]!.id = "seed shoal"; }],
        ["CKW205", "duplicate region", (p) => { p.world.seaMedium!.regions.push(structuredClone(p.world.seaMedium!.regions[0]!)); }],
        ["CKW206", "negative region quantity", (p) => { p.world.seaMedium!.regions[0]!.negative = exact.integer(-1); }],
        ["CKW206", "inexact region quantity", (p) => { p.world.seaMedium!.regions[0]!.positive = exact.boolean(true); }],
        ["CKW207", "placement of an unknown world", (p) => { p.world.seaMedium!.placements.push({ worldId: "ghost", regionId: "seed-shoal" }); }],
        ["CKW208", "placement in an unknown region", (p) => { p.world.seaMedium!.placements[2]!.regionId = "abyss"; }],
        ["CKW209", "world placed twice", (p) => { p.world.seaMedium!.placements.push({ worldId: "seed", regionId: "elder-basin" }); }],
        ["CKW210", "unplaced latent world", (p) => { p.world.seaMedium!.placements.pop(); }],
        ["CKW211", "unstable adjacency id", (p) => { p.world.seaMedium!.adjacency[1]!.id = "shoal link"; }],
        ["CKW212", "duplicate adjacency id", (p) => { p.world.seaMedium!.adjacency[1]!.id = "basin-link"; }],
        ["CKW213", "adjacency with one region", (p) => { p.world.seaMedium!.adjacency[1]!.regionIds = ["seed-shoal"]; }],
        ["CKW213", "adjacency of a region with itself", (p) => { p.world.seaMedium!.adjacency[1]!.regionIds = ["seed-shoal", "seed-shoal"]; }],
        ["CKW213", "adjacency to an unknown region", (p) => { p.world.seaMedium!.adjacency[1]!.regionIds = ["seed-shoal", "abyss"]; }],
        ["CKW214", "duplicate unordered pair", (p) => {
            p.world.seaMedium!.adjacency.push({ id: "basin-link-again", regionIds: ["younger-basin", "elder-basin"] });
        }],
        ["CKW215", "unstable exchange id", (p) => { p.world.seaMedium!.exchangeLaws[1]!.id = "seep now"; }],
        ["CKW216", "duplicate exchange id", (p) => { p.world.seaMedium!.exchangeLaws[1]!.id = "diffuse"; }],
        ["CKW217", "exchange id shared with an internal law", (p) => { p.world.seaMedium!.exchangeLaws[1]!.id = "erode"; }],
        ["CKW218", "unknown quantity", (p) => { (p.world.seaMedium!.exchangeLaws[0] as { quantity: string }).quantity = "neutral"; }],
        ["CKW219", "zero amount", (p) => { p.world.seaMedium!.exchangeLaws[0]!.amount = exact.integer(0); }],
        ["CKW219", "negative amount", (p) => { p.world.seaMedium!.exchangeLaws[0]!.amount = exact.rational(-1, 2); }],
        ["CKW220", "unknown endpoint region", (p) => { p.world.seaMedium!.exchangeLaws[0]!.to = region("abyss"); }],
        ["CKW220", "unknown endpoint world", (p) => { p.world.seaMedium!.exchangeLaws[1]!.to = world("ghost"); }],
        ["CKW221", "region to itself", (p) => { p.world.seaMedium!.exchangeLaws[0]!.to = region("elder-basin"); }],
        ["CKW222", "world to world", (p) => { p.world.seaMedium!.exchangeLaws[1]!.from = world("elder"); }],
        ["CKW223", "region to a non-adjacent region", (p) => { p.world.seaMedium!.exchangeLaws[0]!.to = region("seed-shoal"); }],
        ["CKW224", "world to a region it is not placed in", (p) => { p.world.seaMedium!.exchangeLaws[1]!.from = region("elder-basin"); }],
        ["CKW225", "unsupported application", (p) => {
            (p.world.seaMedium!.exchangeLaws[0] as { application: string }).application = "every-frontier";
        }],
        ["CKW226", "region bindings not a list", (p) => {
            (p.world.seaMedium!.exchangeLaws[0]!.guard as { regionParameters: unknown }).regionParameters = undefined;
        }],
        ["CKW227", "guard reads a non-endpoint world", (p) => {
            p.world.seaMedium!.exchangeLaws[1]!.guard.fieldParameters[0]!.worldId = "elder";
        }],
        ["CKW227", "region-to-region guard reads any world", (p) => {
            p.world.seaMedium!.exchangeLaws[0]!.guard = seaGuard("gradient", "pressure-at-least-two", [["negative", "younger", "negative"]]);
        }],
        ["CKW228", "guard reads a non-endpoint region", (p) => {
            p.world.seaMedium!.exchangeLaws[1]!.guard.regionParameters[0]!.regionId = "elder-basin";
        }],
        ["CKW229", "region parameter supplied twice", (p) => {
            p.world.seaMedium!.exchangeLaws[1]!.guard.regionParameters.push({ parameterName: "membrane", regionId: "younger-basin", quantity: "positive" });
        }],
        ["CKW230", "region parameter the family lacks", (p) => {
            p.world.seaMedium!.exchangeLaws[1]!.guard.regionParameters.push({ parameterName: "depth", regionId: "younger-basin", quantity: "positive" });
        }],
        ["CKW231", "region quantity bound to a boolean parameter", (p) => {
            p.world.seaMedium!.exchangeLaws[0]!.guard = seaGuard("flagged", "flag-is-set", [], [["flag", "elder-basin", "negative"]]);
        }],
        ["CKW232", "region parameter of an unknown quantity", (p) => {
            (p.world.seaMedium!.exchangeLaws[1]!.guard.regionParameters[0] as { quantity: string }).quantity = "neutral";
        }],
        ["CKW008", "family parameter supplied by neither binding kind", (p) => {
            p.world.seaMedium!.exchangeLaws[1]!.guard.regionParameters = [];
        }],
        ["CKW003", "guard family that is not boolean", (p) => {
            p.world.seaMedium!.exchangeLaws[0]!.guard = seaGuard("numeric", "c-1");
        }],
        ["CKW233", "closed medium: internal law writes a world sea field", (p) => {
            p.world.internalLaws[1]!.effects.push({ fieldId: "negative", operation: "add", value: exact.integer(1) });
        }],
        ["CKW234", "closed medium: inverse effect writes a world sea field", (p) => {
            const law = p.world.internalLaws[1]!;
            law.reversibility = "reversible";
            law.effects = [{ fieldId: "positive", operation: "add", value: exact.integer(1) }];
            law.inverseEffects = [{ fieldId: "positive", operation: "subtract", value: exact.integer(1) }];
        }],
        ["CKW235", "closed medium: World Will writes a world sea field", (p) => {
            p.world.worldWill.interventions.push({
                id: "push-positive",
                targetWorldId: "elder",
                anchorId: "first-anchor",
                kind: "condition",
                effects: [{ fieldId: "positive", operation: "add", value: exact.integer(1) }],
            });
            p.execution.interventionCosts.push({ interventionId: "push-positive", cost: exact.integer(1) });
        }],
        ["CKW236", "closed medium: anchor transfer residue", (p) => {
            p.world.anchors.push({
                id: "elder-younger",
                endpoints: [{ kind: "world", worldId: "elder", portId: "out" }, { kind: "world", worldId: "younger", portId: "in" }],
                identityPredicateFamilyIds: ["always-true"],
                permittedInterventionKinds: [],
            });
            p.world.anchorTransfers = [{
                id: "elder-signal",
                anchorId: "elder-younger",
                source: { worldId: "elder", portId: "out", fieldId: "structure" },
                target: { worldId: "younger", portId: "in", fieldId: "membrane" },
                sourceNegativeSeaResidue: exact.integer(1),
                targetPositiveSeaPlacement: exact.integer(0),
            }];
        }],
    ];
    for (const [code, label, change] of cases) {
        const program = universeProgram();
        change(program);
        assert.ok(codes(program).includes(code), `${label}: expected ${code}, received ${codes(program).join(", ") || "none"}`);
    }
    assert.deepEqual(validateExecutableCausalProgram(universeProgram()), []);
    assert.deepEqual(validateExecutableCausalProgram(universeProgram("open")), []);
});

test("reversing regions, placements, adjacency, exchange laws, and guard bindings changes nothing but the host digest", () => {
    const program = universeProgram();
    const reversed = structuredClone(program);
    const medium = reversed.world.seaMedium!;
    medium.regions.reverse();
    medium.placements.reverse();
    medium.adjacency.reverse();
    medium.adjacency.forEach((edge) => edge.regionIds.reverse());
    medium.exchangeLaws.reverse();
    for (const law of medium.exchangeLaws) {
        law.guard.regionParameters.reverse();
        law.guard.fieldParameters.reverse();
    }
    assert.deepEqual(validateExecutableCausalProgram(reversed), []);
    const original = realizeAnchoredCausalWorld(program);
    const permuted = realizeAnchoredCausalWorld(reversed);
    assert.notEqual(permuted.programDigest, original.programDigest, "the reversal really reorders the host object");
    assert.equal(withoutProgramDigest(permuted), withoutProgramDigest(original));

    // Concurrent writers of one region quantity: two worlds shed into one region in the same frontier.
    const shedding = scarcityProgram();
    shedding.world.seaMedium!.regions[0]!.negative = exact.integer(0);
    shedding.world.worlds.forEach((entry) => { entry.fields.find((field) => field.id === "negative")!.familyId = "c-1"; });
    shedding.fieldInitializers.forEach((initializer) => {
        if (initializer.fieldId === "negative") initializer.query.familyId = "c-1";
    });
    shedding.world.seaMedium!.exchangeLaws = [
        exchange("shed-left", "negative", world("left"), region("pool"), 1),
        exchange("shed-right", "negative", world("right"), region("pool"), 1),
        exchange("drift", "negative", region("pool"), region("margin"), 1, seaGuard("pool-holds", "always-true")),
    ];
    shedding.world.seaMedium!.regions[0]!.negative = exact.integer(1);
    const sheddingRun = realizeAnchoredCausalWorld(shedding);
    assert.equal(sheddingRun.status, "stable", sheddingRun.reason);
    const frontier = sheddingRun.autonomousContinuation!.order.evaluationFrontiers[0]!;
    assert.deepEqual(frontier, ["medium:drift", "medium:shed-left", "medium:shed-right"], "draws and deposits of one region commute");
    assert.deepEqual(regionOf(sheddingRun.autonomousContinuation!, "pool")?.negative, exact.integer(2));
    const reversedShedding = structuredClone(shedding);
    reversedShedding.world.seaMedium!.exchangeLaws.reverse();
    reversedShedding.world.seaMedium!.regions.reverse();
    assert.equal(withoutProgramDigest(realizeAnchoredCausalWorld(reversedShedding)), withoutProgramDigest(sheddingRun));
});

test("a program without a medium carries no medium evidence at all", () => {
    for (const source of [selfOrganizingField, generationalGrove]) {
        const run = realizeAnchoredCausalWorld(structuredClone(source) as ExecutableAnchoredCausalProgram);
        assert.equal("initialSeaMedium" in run, false);
        for (const continuation of run.continuations) {
            assert.equal("seaMedium" in continuation, false);
            assert.equal("seaExchangeEvents" in continuation, false);
            assert.equal(continuation.trace.some((entry) => entry.kind === "sea-medium"
                || entry.effects.some((effect) => effect.layer === "sea-region")), false);
            for (const event of continuation.lifecycleEvents ?? []) {
                assert.equal(event.residue ? "seaRelease" in event.residue : false, false);
            }
            assert.deepEqual(continuation.trace.find((entry) => entry.kind === "world-retirement")?.effects ?? [], []);
        }
    }
});
