import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
    compileEndogenousUniverse,
    continueEndogenousUniverseFromState,
    digestEndogenousProgram,
    digestEndogenousValue,
    exact,
    inspectEndogenousConnectedUniverseRun,
    materializeEndogenousUniverse,
    realizeEndogenousConnectedUniverse,
    recordEndogenousConnectedUniverse,
    replayEndogenousConnectedUniverse,
    term,
    validateAnchoredCausalWorld,
    validateEndogenousUniverseProgram,
    type EndogenousConnectedUniverseRun,
    type EndogenousGeneratedWorld,
    type EndogenousSeaExchangeTemplate,
    type EndogenousUniverseMaterialization,
    type EndogenousUniverseProgram,
    type ExactValue,
} from "../../src/bubbles/world-kernel";

const jsonPath = resolve(process.cwd(), "examples/endogenous-connected-universe.world.json");
const unit = { unit: { kind: "literal", value: "0" } } as const;
const zero = exact.integer(0);
const quarter = exact.rational(1, 4);

/** The canonical connected-universe program, read without any medium another revision may have added. */
function canonicalProgram(): EndogenousUniverseProgram {
    const program = JSON.parse(readFileSync(jsonPath, "utf8")) as EndogenousUniverseProgram;
    delete program.seaMedium;
    return program;
}

function booleanFamily(id: string, parameters: string[], body: ReturnType<typeof term.binary>) {
    return {
        id,
        domain: { axes: [{ name: "unit", kind: "finite" as const, size: "1" }] },
        valueKind: "boolean" as const,
        parameters: parameters.map((name) => ({ name, valueKind: "rational" as const })),
        body,
    };
}

const inflowTemplate = (): EndogenousSeaExchangeTemplate => ({
    id: "inflow",
    quantity: "negative",
    from: "parent-region",
    to: "own-region",
    amount: quarter,
    guard: {
        id: "first-sibling-under-pressure",
        query: { familyId: "first-sibling-under-pressure", at: unit, parameters: { coordinate: { kind: "local-coordinate" } } },
        fieldParameters: [],
        regionParameters: [{ parameterName: "pressure", region: "parent-region", quantity: "negative" }],
    },
});

const seepTemplate = (): EndogenousSeaExchangeTemplate => ({
    id: "seep",
    quantity: "negative",
    from: "own-region",
    to: "self",
    amount: quarter,
    guard: {
        id: "deep-open-boundary",
        query: { familyId: "deep-open-boundary", at: unit, parameters: { depth: { kind: "lineage-depth" } } },
        fieldParameters: [{ parameterName: "boundary", fieldId: "boundary" }],
        regionParameters: [],
    },
});

/**
 * The canonical program in a closed medium. Exterior residue starts in the root's region. A first sibling draws
 * it into its own region while its parent's region is under pressure (`inflow`), and a generated world lets it
 * seep through its own open boundary (`seep`). Each world's own law `absorb-pressure` reads its medium-coupled
 * negative sea and closes the boundary once residue has entered.
 */
function mediumProgram(options: { templates?: EndogenousSeaExchangeTemplate[]; rootNegative?: ExactValue } = {}): EndogenousUniverseProgram {
    const program = canonicalProgram();
    program.formal.families.push(
        booleanFamily("pressured-open-boundary", ["pressure", "boundary"], term.binary(
            "and",
            term.binary("greater-than-or-equal", term.parameter("pressure"), term.value(quarter)),
            term.binary("equal", term.parameter("boundary"), term.value(exact.integer(1))),
        )),
        booleanFamily("deep-open-boundary", ["depth", "boundary"], term.binary(
            "and",
            term.binary("greater-than-or-equal", term.parameter("depth"), term.value(exact.integer(1))),
            term.binary("equal", term.parameter("boundary"), term.value(exact.integer(1))),
        )),
        booleanFamily("first-sibling-under-pressure", ["coordinate", "pressure"], term.binary(
            "and",
            term.binary("equal", term.parameter("coordinate"), term.value(zero)),
            term.binary("greater-than-or-equal", term.parameter("pressure"), term.value(exact.rational(1, 2))),
        )),
        booleanFamily("under-pressure", ["pressure"], term.binary(
            "greater-than-or-equal",
            term.parameter("pressure"),
            term.value(quarter),
        )),
    );
    program.schemas[0]!.internalLaws.push({
        id: "absorb-pressure",
        guard: {
            id: "pressure-meets-open-boundary",
            query: { familyId: "pressured-open-boundary", at: unit, parameters: {} },
            fieldParameters: [
                { parameterName: "pressure", fieldId: "projection.negative" },
                { parameterName: "boundary", fieldId: "boundary" },
            ],
        },
        effects: [{ fieldId: "boundary", operation: "set", value: zero }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    for (const action of program.constructors[0]!.seaActions) {
        action.parentNegativeResidue = zero;
        action.childPositivePlacement = zero;
    }
    program.seaMedium = {
        id: "multiversal-sea",
        closure: "closed",
        rootRegions: [{ rootId: "origin", negative: options.rootNegative ?? exact.integer(1), positive: exact.integer(1) }],
        childRegionInitial: { negative: zero, positive: zero },
        exchangeTemplates: options.templates ?? [inflowTemplate(), seepTemplate()],
    };
    return program;
}

function worldAt(materialization: EndogenousUniverseMaterialization, ...coordinates: string[]): EndogenousGeneratedWorld {
    const world = materialization.worlds.find((candidate) => (
        candidate.address.lineage.length === coordinates.length
        && candidate.address.lineage.every((segment, index) => segment.coordinate === coordinates[index])
    ));
    assert.ok(world, `no world at lineage [${coordinates.join(", ")}]`);
    return world;
}

const regionOf = (worldId: string): string => `region-${worldId.slice("world-".length)}`;

function regionState(materialization: EndogenousUniverseMaterialization, worldId: string) {
    const region = materialization.seaMedium?.regions.find((candidate) => candidate.id === regionOf(worldId));
    assert.ok(region, `no region for '${worldId}'`);
    return region;
}

function realizedLawIds(run: EndogenousConnectedUniverseRun): string[] {
    return run.generationClosures.flatMap((closure) => closure.causalRun.continuations.flatMap((continuation) => continuation.realizedEventIds));
}

const realizeMedium = (program: EndogenousUniverseProgram, maxDepth = 2) => realizeEndogenousConnectedUniverse(program, {
    generation: { maxDepth, maxWorlds: 32 },
    maxGenerationClosures: 6,
});

test("every materialized world is placed in its own lineage-adjacent sea region", () => {
    const program = mediumProgram();
    assert.deepEqual(validateEndogenousUniverseProgram(program), []);
    const materialization = materializeEndogenousUniverse(program, { maxDepth: 2, maxWorlds: 32 });
    assert.equal(materialization.status, "resolved");
    assert.equal(materialization.worlds.length, 7);
    const medium = materialization.seaMedium!;
    assert.equal(medium.regions.length, 7);
    assert.equal(medium.placements.length, 7);
    assert.equal(medium.adjacency.length, 6);
    for (const world of materialization.worlds) {
        const region = regionState(materialization, world.id);
        assert.equal(region.worldId, world.id);
        assert.deepEqual(medium.placements.find((placement) => placement.worldId === world.id)?.regionId, region.id);
        if (world.parentWorldId) {
            assert.deepEqual([region.negative, region.positive], [zero, zero], "a child region starts from childRegionInitial");
            const edge = medium.adjacency.find((candidate) => candidate.childWorldId === world.id);
            assert.equal(edge?.parentWorldId, world.parentWorldId);
            assert.deepEqual(edge?.regionIds, [regionOf(world.parentWorldId), region.id].sort());
        } else {
            assert.deepEqual([region.negative, region.positive], [exact.integer(1), exact.integer(1)], "a root region starts from rootRegions");
            assert.equal(medium.adjacency.some((candidate) => candidate.childWorldId === world.id), false);
        }
    }

    const compiled = compileEndogenousUniverse(program, materialization)!;
    const kernelMedium = compiled.program.world.seaMedium!;
    assert.deepEqual(validateAnchoredCausalWorld(compiled.program.world), []);
    assert.equal(kernelMedium.closure, "closed");
    assert.deepEqual(kernelMedium.placements.map((placement) => placement.regionId), kernelMedium.placements.map((placement) => regionOf(placement.worldId)));
    const generated = materialization.worlds.filter((world) => !!world.parentWorldId);
    const root = materialization.worlds.find((world) => !world.parentWorldId)!;
    // Roots skip the parent-region template; every world instantiates the others once, as `<worldId>-<templateId>`.
    assert.deepEqual(
        kernelMedium.exchangeLaws.map((law) => law.id),
        [...generated.map((world) => `${world.id}-inflow`), ...materialization.worlds.map((world) => `${world.id}-seep`)].sort(),
    );
    assert.equal(kernelMedium.exchangeLaws.some((law) => law.id === `${root.id}-inflow`), false);
    for (const world of generated) {
        const inflow = kernelMedium.exchangeLaws.find((law) => law.id === `${world.id}-inflow`)!;
        assert.deepEqual(inflow.from, { kind: "region", regionId: regionOf(world.parentWorldId!) });
        assert.deepEqual(inflow.to, { kind: "region", regionId: regionOf(world.id) });
        assert.deepEqual(inflow.guard.fieldParameters, []);
        assert.deepEqual(inflow.guard.regionParameters, [{ parameterName: "pressure", regionId: regionOf(world.parentWorldId!), quantity: "negative" }]);
        const seep = kernelMedium.exchangeLaws.find((law) => law.id === `${world.id}-seep`)!;
        assert.deepEqual(seep.from, { kind: "region", regionId: regionOf(world.id) });
        assert.deepEqual(seep.to, { kind: "world", worldId: world.id });
        assert.deepEqual(seep.guard.fieldParameters, [{ parameterName: "boundary", worldId: world.id, fieldId: "boundary" }]);
    }
    // The carried region state continues through the kernel's region overrides.
    assert.deepEqual(Object.keys(compiled.seaRegionOverrides!).sort(), kernelMedium.regions.map((region) => region.id));
});

test("residue travels from a parent's region to a child's region and seeps through the child's boundary into its own law", () => {
    const run = realizeMedium(mediumProgram());
    assert.equal(run.status, "resolved");
    assert.equal(run.generationClosure.fixpointReached, true);
    assert.equal(run.generationClosures.length, 4);
    const materialization = run.materialization;
    const root = worldAt(materialization);
    const first = worldAt(materialization, "0");
    const second = worldAt(materialization, "1");
    const grandchild = worldAt(materialization, "0", "0");

    const closure0 = run.generationClosures[0]!.causalRun.continuations[0]!;
    const inflow = closure0.seaExchangeEvents!.find((event) => event.lawId === `${first.id}-inflow`)!;
    assert.deepEqual(inflow.from, { kind: "region", regionId: regionOf(root.id), before: exact.integer(1), after: exact.rational(3, 4) });
    assert.deepEqual(inflow.to, { kind: "region", regionId: regionOf(first.id), before: zero, after: quarter });
    const seep = closure0.seaExchangeEvents!.find((event) => event.lawId === `${first.id}-seep`)!;
    assert.deepEqual(seep.to, { kind: "world", worldId: first.id, fieldId: "projection.negative", before: zero, after: quarter });
    assert.deepEqual(seep.causes, [inflow.id]);
    const absorb = closure0.trace.find((entry) => entry.lawId === `${first.id}-absorb-pressure`)!;
    assert.deepEqual(absorb.causes, [seep.id], "the child's own law responds to the residue that seeped in");
    assert.ok(closure0.order.causalEdges.some((edge) => edge.cause === seep.id && edge.effect === absorb.eventId));

    // The closed boundary stops later seepage; the remaining residue travels on to the grandchild.
    assert.deepEqual(first.fields.boundary, zero);
    assert.deepEqual(grandchild.fields.boundary, zero);
    for (const world of [root, second, ...materialization.worlds.filter((candidate) => candidate.address.lineage[0]?.coordinate === "1")]) {
        assert.deepEqual(world.fields.boundary, exact.integer(1));
    }
    const exchanged = (world: EndogenousGeneratedWorld) => materialization.seaMedium!.placements
        .find((placement) => placement.worldId === world.id)!.exchanged.negative;
    assert.deepEqual(exchanged(first), quarter);
    assert.deepEqual(exchanged(grandchild), quarter);
    assert.deepEqual(regionState(materialization, root.id).negative, quarter);
    assert.deepEqual(regionState(materialization, first.id).negative, quarter);
    assert.deepEqual(regionState(materialization, grandchild.id).negative, zero);
    const grandchildAbsorb = run.generationClosures[2]!.causalRun.continuations[0]!.trace
        .find((entry) => entry.lawId === `${grandchild.id}-absorb-pressure`);
    assert.deepEqual(grandchildAbsorb?.causes, [`medium:${grandchild.id}-seep`]);

    // Without the child's boundary-guarded seep, the same residue stays in the sea and no world law responds.
    const sealed = realizeMedium(mediumProgram({ templates: [inflowTemplate()] }));
    assert.equal(sealed.status, "resolved");
    assert.equal(realizedLawIds(sealed).some((eventId) => eventId.endsWith("-absorb-pressure")), false);
    assert.ok(sealed.materialization.worlds.every((world) => exactValueIs(world.fields.boundary!, exact.integer(1))));
});

function exactValueIs(value: ExactValue, expected: ExactValue): boolean {
    return digestEndogenousValue(value) === digestEndogenousValue(expected);
}

test("a closed medium conserves both seas exactly within and across every causal-generation closure", () => {
    const run = realizeMedium(mediumProgram());
    let previousFinal: Record<string, ExactValue> | undefined;
    for (const closure of run.generationClosures) {
        const ledger = closure.seaMedium!;
        assert.equal(ledger.closure, "closed");
        assert.equal(ledger.interClosureConserved, true);
        for (const continuation of closure.causalRun.continuations) {
            for (const balance of continuation.seaMedium!.balance) {
                assert.equal(balance.balanced, true);
                assert.deepEqual(balance.production, zero);
                assert.deepEqual(balance.finalTotal, exact.integer(1), `${balance.quantity} total is the root region's endowment`);
            }
        }
        for (const entry of ledger.quantities) {
            assert.deepEqual(entry.interClosureProduction, zero);
            assert.deepEqual(entry.inputTotal, exact.integer(1));
            if (previousFinal) assert.deepEqual(entry.predecessorFinalTotal, previousFinal[entry.quantity]);
            else assert.equal(entry.predecessorFinalTotal, undefined);
        }
        previousFinal = Object.fromEntries(closure.causalRun.continuations[0]!.seaMedium!.balance
            .map((balance) => [balance.quantity, balance.finalTotal]));
    }
});

test("region state continues across closures and participates in fixpoint and recurrence certification", () => {
    const run = realizeMedium(mediumProgram());
    // The compiled medium declares each region's endowment; the realized state travels through region overrides.
    assert.equal(new Set(run.generationClosures.map((closure) => closure.causalRun.programDigest)).size, 1);
    for (const [index, closure] of run.generationClosures.entries()) {
        const next = run.generationClosures[index + 1];
        if (!next) break;
        const continuation = closure.causalRun.continuations[0]!;
        assert.deepEqual(next.causalRun.initialSeaMedium, continuation.seaMedium!.regions);
        assert.deepEqual(
            Object.entries(next.causalRun.options.seaRegionOverrides!).map(([id, region]) => ({ id, ...region })),
            continuation.seaMedium!.regions,
        );
        // Every carried cause names a medium event of an earlier closure, qualified by that closure.
        for (const causes of Object.values(next.causalRun.options.seaRegionOverrideCauses ?? {})) {
            assert.ok(causes.every((cause) => run.generationClosures.slice(0, index + 1)
                .some((earlier) => cause.startsWith(`${earlier.id}:medium:`))));
        }
    }
    const first = worldAt(run.materialization, "0");
    const secondClosure = run.generationClosures[1]!.causalRun.continuations[0]!;
    assert.deepEqual(
        secondClosure.seaExchangeEvents!.find((event) => event.lawId === `${first.id}-inflow`)!.causes,
        [`${run.generationClosures[0]!.id}:medium:${first.id}-inflow`, `${run.generationClosures[0]!.id}:medium:${first.id}-seep`],
    );

    // Region-to-region flow only: world fields stop changing after the first closure while the root region drains.
    const drainTemplate: EndogenousSeaExchangeTemplate = {
        ...inflowTemplate(),
        guard: {
            id: "parent-under-pressure",
            query: { familyId: "under-pressure", at: unit, parameters: {} },
            fieldParameters: [],
            regionParameters: [{ parameterName: "pressure", region: "parent-region", quantity: "negative" }],
        },
    };
    const program = mediumProgram({ templates: [drainTemplate] });
    program.constructors[0]!.coordinates = { kind: "finite", size: "1" };
    const drain = realizeMedium(program, 1);
    assert.equal(drain.status, "resolved");
    assert.equal(drain.generationClosure.fixpointReached, true);
    assert.equal(drain.generationClosure.recurrentConfigurationDetected, false);
    assert.deepEqual(drain.recurrenceCertificates, []);
    assert.deepEqual(drain.generationClosures.map((closure) => closure.realizedEventCount), [5, 1, 1, 1, 0]);
    assert.deepEqual(drain.generationClosures.map((closure) => closure.outcomes[0]!.status), ["active", "active", "active", "active", "fixpoint"]);
    const laterWorldStates = drain.generationClosures.slice(1).map((closure) => closure.causalRun.initialWorldStates);
    assert.ok(laterWorldStates.every((states) => digestEndogenousValue(states) === digestEndogenousValue(laterWorldStates[0])),
        "only region quantities change after the first closure");
    const inputDigests = drain.generationClosures.map((closure) => closure.inputConfigurationDigest);
    assert.equal(new Set(inputDigests).size, inputDigests.length, "a changed region quantity is a changed configuration");
    const drainRoot = worldAt(drain.materialization);
    const drainChild = worldAt(drain.materialization, "0");
    assert.deepEqual(regionState(drain.materialization, drainRoot.id).negative, zero);
    assert.deepEqual(regionState(drain.materialization, drainChild.id).negative, exact.integer(1));
});

test("a newly generated child region starts from childRegionInitial when realized state reopens a constructor", () => {
    const delayed = (closure: "closed" | "open"): EndogenousUniverseProgram => {
        const program = mediumProgram();
        program.constructors[0]!.admission = {
            id: "structured-parent",
            query: { familyId: "is-one", at: unit, parameters: {} },
            fieldParameters: [{ parameterName: "value", fieldId: "structure" }],
        };
        if (closure === "open") {
            const canonical = canonicalProgram().constructors[0]!.seaActions;
            program.constructors[0]!.seaActions = canonical;
            program.seaMedium = { ...program.seaMedium!, closure, childRegionInitial: { negative: exact.rational(1, 8), positive: zero } };
        }
        return program;
    };
    const closedRun = realizeMedium(delayed("closed"), 1);
    assert.equal(closedRun.status, "resolved");
    assert.equal(closedRun.generationClosures[0]!.causalRun.initialWorldStates.length, 1);
    const reopened = closedRun.generationClosures[1]!;
    assert.deepEqual(reopened.newlyGeneratedEventIds.length, 2);
    const root = worldAt(closedRun.materialization);
    for (const child of [worldAt(closedRun.materialization, "0"), worldAt(closedRun.materialization, "1")]) {
        assert.deepEqual(
            reopened.causalRun.initialSeaMedium!.find((region) => region.id === regionOf(child.id)),
            { id: regionOf(child.id), negative: zero, positive: zero },
        );
        assert.ok(reopened.causalRun.continuations[0]!.realizedEventIds.includes(`law:${child.id}-lineage-condense`));
    }
    // The root region continues from what the first realization left.
    assert.deepEqual(
        reopened.causalRun.initialSeaMedium!.find((region) => region.id === regionOf(root.id)),
        closedRun.generationClosures[0]!.causalRun.continuations[0]!.seaMedium!.regions.find((region) => region.id === regionOf(root.id)),
    );
    assert.ok(closedRun.generationClosures.every((closure) => closure.seaMedium!.interClosureConserved));

    // In an open medium the constructor's sea actions and the new region's endowment enter between realizations;
    // the endogenous ledger records them as inter-closure production rather than hiding them.
    const openRun = realizeMedium(delayed("open"), 1);
    assert.equal(openRun.status, "resolved");
    const openLedger = openRun.generationClosures[1]!.seaMedium!;
    assert.equal(openLedger.interClosureConserved, false);
    assert.deepEqual(
        openLedger.quantities.map((entry) => [entry.quantity, entry.interClosureProduction]),
        // Root residue 2 x (1/4 + 1/2 x 1/8) plus two regions of 1/8; two children each placed 1 + 1/2 x 1/2.
        [["negative", exact.rational(7, 8)], ["positive", exact.rational(5, 2)]],
    );
    for (const closure of openRun.generationClosures) {
        assert.ok(closure.causalRun.continuations.every((continuation) => continuation.seaMedium!.balance.every((balance) => balance.balanced)));
    }
});

test("every branch-indexed universe carries its own medium state", () => {
    const competing: EndogenousSeaExchangeTemplate = {
        ...inflowTemplate(),
        guard: {
            id: "parent-under-pressure",
            query: { familyId: "under-pressure", at: unit, parameters: {} },
            fieldParameters: [],
            regionParameters: [{ parameterName: "pressure", region: "parent-region", quantity: "negative" }],
        },
    };
    // Two siblings draw one scarce quarter from the root region: the kernel preserves both continuations.
    const run = realizeMedium(mediumProgram({ templates: [competing], rootNegative: quarter }), 1);
    assert.equal(run.status, "resolved");
    assert.equal(run.branchUniverses.length, 2);
    assert.equal(run.finiteRealization.finiteCut.resultForm, "complete-closed-branch-family");
    const holders = run.branchUniverses.map((branch) => {
        assert.equal(branch.evidenceLocation, "branch-local");
        assert.equal(branch.closureKind, "fixpoint");
        const materialization = branch.materialization!;
        const root = worldAt(materialization);
        assert.deepEqual(regionState(materialization, root.id).negative, zero);
        return materialization.seaMedium!.regions
            .filter((region) => exactValueIs(region.negative, quarter))
            .map((region) => region.worldId);
    });
    assert.equal(holders.every((worldIds) => worldIds.length === 1), true);
    assert.notEqual(holders[0]![0], holders[1]![0], "each branch holds the residue in a different sibling's region");
    assert.notEqual(run.branchUniverses[0]!.configurationDigest, run.branchUniverses[1]!.configurationDigest);
});

test("a closed medium rejects sea quantity created outside it", () => {
    const withActions = mediumProgram();
    withActions.constructors[0]!.seaActions = canonicalProgram().constructors[0]!.seaActions;
    const codes = (program: EndogenousUniverseProgram) => validateEndogenousUniverseProgram(program).map((entry) => entry.code);
    assert.deepEqual(codes(withActions), ["EGU205", "EGU205"]);
    assert.equal(materializeEndogenousUniverse(withActions).status, "contradicted");
    assert.equal(realizeMedium(withActions).status, "contradicted");
    // The same constructor actions are admitted, as before, in an open medium.
    withActions.seaMedium!.closure = "open";
    assert.deepEqual(codes(withActions), []);
    assert.equal(realizeMedium(withActions).status, "resolved");

    const endowed = mediumProgram();
    endowed.seaMedium!.childRegionInitial = { negative: quarter, positive: zero };
    assert.deepEqual(codes(endowed), ["EGU204"]);

    const writer = mediumProgram();
    writer.schemas[0]!.internalLaws[0]!.effects.push({ fieldId: "boundary-pressure", operation: "add", value: quarter });
    assert.deepEqual(codes(writer), ["EGU206"]);

    const initialized = mediumProgram();
    const support = initialized.schemas[0]!.fields.find((field) => field.id === "lineage-support")!;
    support.familyId = "one";
    support.initializer = { familyId: "one", at: unit, parameters: {} };
    assert.deepEqual(codes(initialized), []);
    // Roots may begin with sea; a generated world in a closed medium may not.
    const materialization = materializeEndogenousUniverse(initialized, { maxDepth: 1 });
    assert.equal(materialization.status, "contradicted");
    assert.match(materialization.reason, /closed sea medium: generated world/);
});

test("exchange templates keep the kernel's locality and identity rules", () => {
    const codes = (mutate: (program: EndogenousUniverseProgram) => void) => {
        const program = mediumProgram();
        mutate(program);
        return validateEndogenousUniverseProgram(program).map((entry) => entry.code);
    };
    assert.deepEqual(codes((program) => {
        program.seaMedium!.exchangeTemplates[1]!.from = "parent-region";
    }), ["EGU209"]);
    assert.deepEqual(codes((program) => {
        program.seaMedium!.exchangeTemplates[0]!.guard.fieldParameters = [{ parameterName: "boundary", fieldId: "boundary" }];
        program.seaMedium!.exchangeTemplates[0]!.guard.query.familyId = "pressured-open-boundary";
        program.seaMedium!.exchangeTemplates[0]!.guard.query.parameters = {};
    }), ["EGU210"]);
    assert.deepEqual(codes((program) => {
        program.seaMedium!.exchangeTemplates[1]!.guard.regionParameters = [{ parameterName: "depth", region: "parent-region", quantity: "negative" }];
        program.seaMedium!.exchangeTemplates[1]!.guard.query.parameters = {};
    }), ["EGU210"]);
    assert.deepEqual(codes((program) => {
        program.seaMedium!.exchangeTemplates[1]!.id = "absorb-pressure";
    }), ["EGU211"]);
    assert.deepEqual(codes((program) => {
        program.seaMedium!.rootRegions = [];
    }), ["EGU202"]);
    assert.deepEqual(codes((program) => {
        program.seaMedium!.exchangeTemplates.push(seepTemplate());
    }), ["EGU207"]);

    // A world's medium-coupled sea field is readable by its own law only inside a medium.
    const unmediated = mediumProgram();
    delete unmediated.seaMedium;
    assert.deepEqual(validateEndogenousUniverseProgram(unmediated).map((entry) => entry.code), ["EGU054", "EGU023"]);

    // A continued medium needs its realized region state.
    const program = mediumProgram();
    const materialization = materializeEndogenousUniverse(program, { maxDepth: 1 });
    const worldStates = materialization.worlds.map((world) => ({
        worldId: world.id,
        fields: { ...world.fields, "projection.negative": zero, "projection.positive": zero },
    }));
    assert.equal(continueEndogenousUniverseFromState(program, { materialization, worldStates }).status, "contradicted");
    const regions = materialization.seaMedium!.regions.map(({ id, negative, positive }) => ({ id, negative, positive }));
    assert.equal(continueEndogenousUniverseFromState(program, { materialization, worldStates, seaRegions: regions }).status, "resolved");
});

test("reversing the medium's declaration order gives an identical run", () => {
    const forward = mediumProgram();
    forward.roots.push({ id: "far-origin", schemaId: "field-world", values: {} });
    forward.seaMedium!.rootRegions.push({ rootId: "far-origin", negative: exact.rational(1, 2), positive: zero });
    forward.seaMedium!.exchangeTemplates[1]!.guard.fieldParameters = [];
    forward.seaMedium!.exchangeTemplates[1]!.guard.regionParameters = [{ parameterName: "pressure", region: "own-region", quantity: "negative" }];
    forward.seaMedium!.exchangeTemplates[1]!.guard.query = { familyId: "under-pressure", at: unit, parameters: {} };
    const reversed = structuredClone(forward);
    reversed.seaMedium!.rootRegions.reverse();
    reversed.seaMedium!.exchangeTemplates.reverse();
    assert.notDeepEqual(reversed.seaMedium, forward.seaMedium);
    assert.equal(digestEndogenousProgram(reversed), digestEndogenousProgram(forward));
    const forwardRun = realizeMedium(forward, 1);
    const reversedRun = realizeMedium(reversed, 1);
    assert.equal(forwardRun.status, "resolved");
    assert.equal(forwardRun.materialization.seaMedium!.regions.length, 6);
    assert.ok(realizedLawIds(forwardRun).some((eventId) => eventId.startsWith("medium:")));
    assert.equal(digestEndogenousValue(reversedRun), digestEndogenousValue(forwardRun));
});

test("programs without a medium are unchanged", () => {
    const program = canonicalProgram();
    assert.equal(digestEndogenousProgram(program), digestEndogenousValue(program));
    const materialization = materializeEndogenousUniverse(program, { maxDepth: 2, maxWorlds: 32 });
    assert.equal("seaMedium" in materialization, false);
    const compiled = compileEndogenousUniverse(program, materialization)!;
    assert.equal("seaMedium" in compiled.program.world, false);
    assert.equal("seaRegionOverrides" in compiled, false);
    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 32 },
        maxGenerationClosures: 2,
        maxGenerationBranches: 64,
    });
    assert.equal(run.status, "resolved");
    assert.equal(JSON.stringify(run).includes("seaMedium"), false);
    assert.equal(JSON.stringify(run).includes("seaRegionOverride"), false);
    assert.equal("seaMedium" in inspectEndogenousConnectedUniverseRun(run).topology, false);
    // The same slice continues from realized schema fields alone, exactly as before.
    const worldStates = materialization.worlds.map((world) => ({ worldId: world.id, fields: world.fields }));
    assert.equal(continueEndogenousUniverseFromState(program, { materialization, worldStates }).status, "resolved");
});

test("record and replay bind the medium state", () => {
    const record = recordEndogenousConnectedUniverse(mediumProgram(), {
        generation: { maxDepth: 2, maxWorlds: 32 },
        maxGenerationClosures: 6,
    });
    assert.equal(replayEndogenousConnectedUniverse(record).status, "verified");
    const tampered = structuredClone(record);
    tampered.run.materialization.seaMedium!.regions[0]!.negative = exact.integer(5);
    assert.equal(replayEndogenousConnectedUniverse(tampered).status, "integrity-failed");
    const inspection = inspectEndogenousConnectedUniverseRun(record.run);
    assert.deepEqual(inspection.topology.seaMedium, record.run.materialization.seaMedium);
});

test("under a medium the scalar projection is no longer certified as adapter-only", () => {
    const withMedium = realizeMedium(mediumProgram());
    assert.equal(withMedium.scalarProjection.presentOnlyAtLegacyCausalBoundary, false);
    assert.equal(withMedium.scalarProjection.ontologicalSeaChannelsRemainDistinct, false);
    const without = realizeMedium(canonicalProgram());
    assert.equal(without.scalarProjection.presentOnlyAtLegacyCausalBoundary, true);
});

test("a caller cannot inject world or region continuation state or provenance", () => {
    const program = mediumProgram();
    const honest = realizeMedium(program);
    const forged = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 32 },
        maxGenerationClosures: 6,
        causal: { seaRegionOverrideCauses: { anything: ["forged-host-event"] } } as never,
    });
    assert.equal(digestEndogenousValue(forged), digestEndogenousValue(honest));
});

test("a null medium is a diagnostic and keeps its own identity", () => {
    const program = { ...canonicalProgram(), seaMedium: null } as unknown as EndogenousUniverseProgram;
    assert.ok(validateEndogenousUniverseProgram(program).some((diagnostic) => diagnostic.code === "EGU212"));
    assert.notEqual(digestEndogenousProgram(program), digestEndogenousProgram(canonicalProgram()));
});

test("arrays and incomplete objects are not sea medium declarations", () => {
    for (const value of [[], {}, { id: "m" }]) {
        const program = { ...canonicalProgram(), seaMedium: value } as unknown as EndogenousUniverseProgram;
        assert.ok(validateEndogenousUniverseProgram(program).some((diagnostic) => diagnostic.code === "EGU212"), JSON.stringify(value));
    }
});
