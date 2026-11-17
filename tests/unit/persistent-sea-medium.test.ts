// Persistent causal closures over the v0.5.10 multiversal sea medium
// (docs/architecture/v0.5.10-multiversal-sea-medium.md). The programs are built in code on top of
// examples/self-maintaining-field.world.json, whose own laws admit and release negative sea, so the medium is open.

import assert from "node:assert/strict";
import test from "node:test";
import {
    addExactRationals,
    exact,
    persistentSeaMediumContinuationOptions,
    realizeAnchoredCausalWorld,
    realizePersistentCausalWorld,
    recordPersistentCausalReplay,
    replayPersistentCausalRecord,
    term,
    type CausalContinuation,
    type CausalSeaExchangeLaw,
    type CausalSeaQuantity,
    type CausalWorldState,
    type ExactValue,
    type PersistentCausalClosure,
    type PersistentCausalProgram,
    type PersistentCausalRun,
} from "../../src/bubbles/world-kernel";
import selfMaintainingField from "../../examples/self-maintaining-field.world.json";

const WORLD = "maintenance-world";
const ELDER = "elder-world";
const at = { coordinate: "0" };
const domain = { axes: [{ name: "coordinate", kind: "natural" as const }] };
const equals = (name: string, value: number) => term.binary("equal", term.parameter(name), term.value(exact.integer(value)));

/**
 * The maintenance world sheds the residue it admits on route b into its basin, and on route a it draws residue
 * back from the basin and releases both units by its own law. Over one two-closure maintenance period the basin
 * returns to the same quantity, so world fields and region quantities repeat together.
 *
 * - `upwell`: the adjacent deep region also feeds the basin once per closure, so the basin drifts while the world
 *   fields still repeat exactly;
 * - `elder`: a second world placed in the deep region retires in the first closure and releases its residue there.
 */
function seaProgram(variant: { upwell?: boolean; elder?: boolean } = {}): PersistentCausalProgram {
    const program = structuredClone(selfMaintainingField) as PersistentCausalProgram;
    const world = program.causalProgram.world;
    world.formal.families.push(
        { id: "two", domain, valueKind: "rational", parameters: [], body: term.value(exact.integer(2)) },
        { id: "negative-is-two", domain, valueKind: "boolean", parameters: [{ name: "negative", valueKind: "rational" }], body: equals("negative", 2) },
        {
            id: "residue-at-phase-two",
            domain,
            valueKind: "boolean",
            parameters: [{ name: "negative", valueKind: "rational" }, { name: "phase", valueKind: "rational" }],
            body: term.binary("and", equals("negative", 1), equals("phase", 2)),
        },
        {
            id: "residue-at-phase-zero",
            domain,
            valueKind: "boolean",
            parameters: [{ name: "negative", valueKind: "rational" }, { name: "phase", valueKind: "rational" }],
            body: term.binary("and", equals("negative", 1), equals("phase", 0)),
        },
    );
    // The world's own release now dissolves the admitted unit together with the unit drawn from the basin.
    const release = world.internalLaws.find((law) => law.id === "release-negative-sea")!;
    release.guard.query.familyId = "negative-is-two";
    release.effects[0]!.value = exact.integer(2);
    const worldGuard = (id: string, familyId: string) => ({
        id,
        query: { familyId, at, parameters: {} },
        fieldParameters: ["negative", "phase"].map((fieldId) => ({ parameterName: fieldId, worldId: WORLD, fieldId })),
        regionParameters: [],
    });
    const exchangeLaws: CausalSeaExchangeLaw[] = [
        {
            id: "shed-residue",
            quantity: "negative",
            from: { kind: "world", worldId: WORLD },
            to: { kind: "region", regionId: "basin" },
            amount: exact.integer(1),
            guard: worldGuard("shed-on-route-b", "residue-at-phase-two"),
            application: "once-per-realization",
        },
        {
            id: "draw-residue",
            quantity: "negative",
            from: { kind: "region", regionId: "basin" },
            to: { kind: "world", worldId: WORLD },
            amount: exact.integer(1),
            guard: worldGuard("draw-on-route-a", "residue-at-phase-zero"),
            application: "once-per-realization",
        },
        ...(variant.upwell ? [{
            id: "upwell",
            quantity: "negative" as const,
            from: { kind: "region" as const, regionId: "deep" },
            to: { kind: "region" as const, regionId: "basin" },
            amount: exact.integer(1),
            guard: { id: "upwell-always", query: { familyId: "always-true", at, parameters: {} }, fieldParameters: [], regionParameters: [] },
            application: "once-per-realization" as const,
        }] : []),
    ];
    world.seaMedium = {
        id: "maintenance-sea",
        closure: "open",
        regions: [
            { id: "basin", negative: exact.integer(1), positive: exact.integer(0) },
            { id: "deep", negative: exact.integer(variant.upwell ? 20 : 0), positive: exact.integer(0) },
        ],
        placements: [
            { worldId: WORLD, regionId: "basin" },
            ...(variant.elder ? [{ worldId: ELDER, regionId: "deep" }] : []),
        ],
        adjacency: [{ id: "basin-deep", regionIds: ["basin", "deep"] }],
        exchangeLaws,
    };
    if (variant.elder) {
        world.worlds.push({
            id: ELDER,
            fields: [
                { id: "positive", familyId: "zero", role: "positive-sea" },
                { id: "negative", familyId: "two", role: "negative-sea" },
                { id: "viability", familyId: "one", role: "viability" },
            ],
            protectedFieldIds: [],
            seaCoupling: { positiveFieldId: "positive", negativeFieldId: "negative", viabilityFieldId: "viability" },
        });
        world.worldWill.objectives.push({
            id: "preserve-elder-viability",
            targetWorldId: ELDER,
            fieldId: "viability",
            direction: "maximize",
            weight: exact.integer(1),
        });
        world.internalLaws.push({
            id: "retire-elder",
            worldId: ELDER,
            guard: { id: "elder-retires", query: { familyId: "always-true", at, parameters: {} }, fieldParameters: [] },
            effects: [],
            lifecycleEffects: [{ kind: "retire-self" }],
            application: "once-per-realization",
            reversibility: "irreversible",
        });
        program.causalProgram.fieldInitializers.push(...world.worlds.at(-1)!.fields.map((field) => ({
            worldId: ELDER,
            fieldId: field.id,
            query: { familyId: field.familyId, at, parameters: {} },
        })));
        program.causalProgram.seaLaws.push({ worldId: ELDER, positiveWeight: exact.integer(1), negativeWeight: exact.integer(1) });
    }
    return program;
}

function selected(closure: PersistentCausalClosure): CausalContinuation {
    return closure.run.continuations.find((continuation) => continuation.id === closure.selectedContinuationId)!;
}

function region(closure: PersistentCausalClosure, side: "inputSeaMedium" | "outputSeaMedium", regionId: string, quantity: CausalSeaQuantity): ExactValue {
    return closure[side]!.regions.find((entry) => entry.id === regionId)![quantity];
}

function overridesFrom(program: PersistentCausalProgram, states: CausalWorldState[]): Record<string, ExactValue> {
    return Object.fromEntries(states.flatMap((state) => {
        const viabilityFieldId = program.causalProgram.world.worlds.find((world) => world.id === state.worldId)!.seaCoupling.viabilityFieldId;
        return Object.entries(state.fields).map(([fieldId, value]) => [
            `${state.worldId}.${fieldId}`,
            fieldId === viabilityFieldId ? state.intrinsicViability : value,
        ]);
    }));
}

function lifecycleFrom(states: CausalWorldState[]): Record<string, NonNullable<CausalWorldState["lifecycle"]>> {
    return Object.fromEntries(states.filter((state) => state.lifecycle).map((state) => [state.worldId, state.lifecycle!]));
}

function sumExactRationals(values: ExactValue[]): ExactValue {
    return values.reduce((total, value) => addExactRationals(total, value)!, exact.integer(0));
}

function closures(run: PersistentCausalRun): PersistentCausalClosure[] {
    return run.paths.flatMap((path) => path.closures);
}

test("shared sea region quantities and their causes continue across closures instead of resetting", () => {
    const program = seaProgram();
    const run = realizePersistentCausalWorld(program);
    const path = run.paths[0]!;
    const [first, second, third] = path.closures;

    assert.equal(path.status, "cycle");
    assert.equal(path.closures.length, 3);
    // The first closure starts from the declared medium; it draws the basin's residue into the world.
    assert.deepEqual(region(first!, "inputSeaMedium", "basin", "negative"), exact.integer(1));
    assert.deepEqual(region(first!, "outputSeaMedium", "basin", "negative"), exact.integer(0));
    // The second closure starts from the emptied basin, not from the declared quantity 1, and sheds residue into it.
    assert.deepEqual(region(second!, "inputSeaMedium", "basin", "negative"), exact.integer(0));
    assert.deepEqual(second!.run.options.seaRegionOverrides?.basin?.negative, exact.integer(0));
    assert.deepEqual(region(second!, "outputSeaMedium", "basin", "negative"), exact.integer(1));
    for (const [index, closure] of path.closures.entries()) {
        if (index === 0) continue;
        const previous = path.closures[index - 1]!;
        assert.deepEqual(closure.inputSeaMedium, previous.outputSeaMedium);
        assert.deepEqual(closure.run.initialSeaMedium, previous.outputSeaMedium!.regions);
        assert.equal(closure.inputConfigurationDigest, previous.outputConfigurationDigest);
    }

    // Region causes are carried as provenance, qualified by the closure that realized them.
    assert.deepEqual(first!.inputSeaMedium!.regionCauses, {});
    assert.deepEqual(second!.inputSeaMedium!.regionCauses, { "basin#negative": [`medium:draw-residue@${first!.id}`] });
    assert.deepEqual(third!.inputSeaMedium!.regionCauses, { "basin#negative": [`medium:shed-residue@${second!.id}`] });
    const shed = selected(second!).seaExchangeEvents!.find((event) => event.lawId === "shed-residue")!;
    const draw = selected(third!).seaExchangeEvents!.find((event) => event.lawId === "draw-residue")!;
    assert.ok(shed.causes.includes(`medium:draw-residue@${first!.id}`));
    assert.ok(draw.causes.includes(`medium:shed-residue@${second!.id}`));
});

test("a retired world's released residue stays in the shared sea in every later closure", () => {
    const run = realizePersistentCausalWorld(seaProgram({ elder: true }));
    assert.deepEqual(run.diagnostics, [], run.reason);
    const path = run.paths[0]!;
    const [first, second, third] = path.closures;
    const retirement = selected(first!).lifecycleEvents!.find((event) => event.kind === "world-retirement")!;

    assert.equal(path.status, "cycle");
    assert.deepEqual(retirement.residue?.seaRelease, { regionId: "deep", negative: exact.integer(2), positive: exact.integer(0) });
    assert.deepEqual(region(first!, "outputSeaMedium", "deep", "negative"), exact.integer(2));
    assert.deepEqual(first!.outputSeaMedium!.regionCauses["deep#negative"], [`${retirement.id}@${first!.id}`]);
    // A zero release changes no region quantity, so it is not a cause.
    assert.equal(first!.outputSeaMedium!.regionCauses["deep#positive"], undefined);
    for (const closure of [second!, third!]) {
        assert.deepEqual(region(closure, "inputSeaMedium", "deep", "negative"), exact.integer(2));
        assert.equal(closure.inputWorldStates.find((state) => state.worldId === ELDER)?.lifecycle?.phase, "retired");
        assert.deepEqual(closure.inputSeaMedium!.regionCauses["deep#negative"], [`${retirement.id}@${first!.id}`]);
    }
});

test("world fields that repeat while the shared sea drifts are not certified as recurrence", () => {
    const run = realizePersistentCausalWorld(seaProgram({ upwell: true }), { maxClosures: 6 });
    const path = run.paths[0]!;

    assert.equal(run.status, "undetermined");
    assert.equal(path.status, "budget-exhausted");
    assert.equal(path.cycle, undefined);
    assert.deepEqual(run.assessments, []);
    assert.equal(new Set(path.configurationDigests).size, path.configurationDigests.length);
    // The world fields alone recur with the two-closure maintenance period ...
    assert.deepEqual(path.closures[2]!.outputWorldStates, path.closures[0]!.outputWorldStates);
    assert.deepEqual(path.closures[3]!.outputWorldStates, path.closures[1]!.outputWorldStates);
    // ... while residue keeps accumulating in the basin and draining from the deep region.
    assert.deepEqual(path.closures.map((closure) => region(closure, "outputSeaMedium", "basin", "negative")),
        [1, 3, 3, 5, 5, 7].map((value) => exact.integer(value)));
    assert.deepEqual(path.closures.map((closure) => region(closure, "outputSeaMedium", "deep", "negative")),
        [19, 18, 17, 16, 15, 14].map((value) => exact.integer(value)));
    // An exchange realized in every closure never cites its own earlier realization under the same event id.
    const [first] = path.closures;
    assert.deepEqual(first!.outputSeaMedium!.regionCauses, {
        "basin#negative": [`medium:draw-residue@${first!.id}`],
        "deep#negative": [`medium:upwell@${first!.id}`],
    });
    for (const closure of path.closures) {
        for (const entry of selected(closure).trace) {
            if (entry.eventId) assert.equal(entry.causes.includes(entry.eventId), false, entry.eventId);
        }
    }
});

test("world fields and region quantities that repeat together are certified as one configuration lasso", () => {
    const run = realizePersistentCausalWorld(seaProgram());
    const path = run.paths[0]!;

    assert.equal(path.status, "cycle");
    assert.equal(path.cycle?.startConfigurationIndex, 1);
    assert.equal(path.cycle?.periodClosures, 2);
    assert.equal(path.cycle?.repeatedConfigurationDigest, path.closures[0]!.outputConfigurationDigest);
    assert.deepEqual(path.closures[2]!.outputWorldStates, path.closures[0]!.outputWorldStates);
    assert.deepEqual(path.closures[2]!.outputSeaMedium!.regions, path.closures[0]!.outputSeaMedium!.regions);
    assert.notDeepEqual(path.closures[1]!.outputSeaMedium!.regions, path.closures[0]!.outputSeaMedium!.regions);
    // Region causes are provenance, like anchored history: they differ at the two cuts and do not block recurrence.
    assert.notDeepEqual(path.closures[2]!.outputSeaMedium!.regionCauses, path.closures[0]!.outputSeaMedium!.regionCauses);
    assert.equal(run.status, "persistent");
    assert.equal(run.assessments[0]?.status, "persistent");
    assert.deepEqual(run.assessments[0]?.reasons, []);

    const replay = replayPersistentCausalRecord(recordPersistentCausalReplay(seaProgram()));
    assert.equal(replay.status, "same-world-reexecution");
});

/** Every closure of the three medium programs, with the exact totals at its input and output cuts. */
function closureSeaTotals(): Array<{
    closure: PersistentCausalClosure;
    quantity: CausalSeaQuantity;
    initial: ExactValue;
    final: ExactValue;
}> {
    return [
        realizePersistentCausalWorld(seaProgram()),
        realizePersistentCausalWorld(seaProgram({ elder: true })),
        realizePersistentCausalWorld(seaProgram({ upwell: true }), { maxClosures: 6 }),
    ].flatMap(closures).flatMap((closure) => (["negative", "positive"] as const).map((quantity) => {
        // Every world here names its sea fields after the quantity.
        const total = (regions: Array<Record<CausalSeaQuantity, ExactValue>>, states: CausalWorldState[]) => sumExactRationals([
            ...regions.map((entry) => entry[quantity]),
            ...states.map((state) => state.fields[quantity]!),
        ]);
        return {
            closure,
            quantity,
            initial: total(closure.inputSeaMedium!.regions, closure.inputWorldStates),
            final: total(closure.outputSeaMedium!.regions, closure.outputWorldStates),
        };
    }));
}

test("every closure conserves the medium exactly from the region quantities it continued from", () => {
    for (const { closure, quantity, initial, final } of closureSeaTotals()) {
        const balance = selected(closure).seaMedium!.balance.find((entry) => entry.quantity === quantity)!;
        assert.deepEqual(balance.finalTotal, final, `${closure.id} ${quantity} final total`);
        assert.deepEqual(addExactRationals(initial, balance.production), final, `${closure.id} ${quantity} conservation`);
    }
});

test("the kernel balance certificate of every continued closure is stated from its continued regions", () => {
    for (const { closure, quantity, initial } of closureSeaTotals()) {
        const balance = selected(closure).seaMedium!.balance.find((entry) => entry.quantity === quantity)!;
        assert.deepEqual(balance.initialTotal, initial, `${closure.id} ${quantity} initial total`);
        assert.equal(balance.balanced, true, `${closure.id} ${quantity} balance`);
    }
});

test("counterfactual re-executions start from the medium the factual closure started from", () => {
    const program = seaProgram();
    const run = realizePersistentCausalWorld(program);
    const path = run.paths[0]!;
    const assessment = run.assessments[0]!;

    // Every closure is reproduced exactly from its recorded input cut, which is how counterfactuals re-execute it.
    for (const closure of path.closures.slice(1)) {
        const reproduced = realizeAnchoredCausalWorld(program.causalProgram, {
            fieldOverrides: overridesFrom(program, closure.inputWorldStates),
            worldLifecycleOverrides: lifecycleFrom(closure.inputWorldStates),
            ...persistentSeaMediumContinuationOptions(closure.inputSeaMedium),
        });
        assert.deepEqual(reproduced.initialSeaMedium, closure.run.initialSeaMedium);
        assert.deepEqual(reproduced.continuations, closure.run.continuations);
    }

    // The boundary ablation of the second closure starts from its emptied basin, so the ablated and factual
    // continuations both end with one unit there; the ablated laws do not touch the medium.
    const second = path.closures[1]!;
    const evidence = assessment.boundary.cutAblation.continuationEvidence;
    assert.equal(assessment.boundary.status, "causally-mediated");
    assert.ok(evidence.some((entry) => entry.factualClosureId === second.id));
    assert.ok(evidence.every((entry) => entry.changedSeaRegionKeys === undefined));
    assert.ok(assessment.memory.every((entry) => entry.status === "causally-effective"
        && entry.continuationEvidence.every((continuation) => continuation.changedSeaRegionKeys === undefined)));

    // Had the counterfactual reset the medium to its declaration, the same ablation would report a sea difference.
    const ablated = structuredClone(program);
    ablated.causalProgram.world.internalLaws = ablated.causalProgram.world.internalLaws
        .filter((law) => !assessment.boundary.cutAblation.suppressedRecoveryLawIds.includes(law.id));
    const preFormation = Object.fromEntries(assessment.boundary.cutAblation.ablatedBoundaryFieldKeys.map((key) => [
        key,
        path.closures[0]!.inputWorldStates[0]!.fields[key.slice(key.indexOf(".") + 1)]!,
    ]));
    const reset = realizeAnchoredCausalWorld(ablated.causalProgram, {
        fieldOverrides: { ...overridesFrom(program, second.inputWorldStates), ...preFormation },
        worldLifecycleOverrides: lifecycleFrom(second.inputWorldStates),
    });
    const resetBasin = reset.continuations[0]!.seaMedium!.regions.find((entry) => entry.id === "basin")!.negative;
    assert.deepEqual(resetBasin, exact.integer(2));
    assert.deepEqual(region(second, "outputSeaMedium", "basin", "negative"), exact.integer(1));
});

test("programs without a medium keep closure records and counterfactual evidence free of medium state", () => {
    const run = realizePersistentCausalWorld(structuredClone(selfMaintainingField) as PersistentCausalProgram);

    assert.equal(run.status, "persistent");
    assert.ok(closures(run).every((closure) => !("inputSeaMedium" in closure) && !("outputSeaMedium" in closure)));
    assert.ok(closures(run).every((closure) => closure.run.initialSeaMedium === undefined
        && closure.run.options.seaRegionOverrides === undefined));
    assert.ok(run.assessments.every((assessment) => [
        ...assessment.boundary.cutAblation.continuationEvidence,
        ...assessment.memory.flatMap((entry) => entry.continuationEvidence),
    ].every((entry) => !("changedSeaRegionKeys" in entry))));
    assert.deepEqual(persistentSeaMediumContinuationOptions(undefined), {});
});
