import assert from "node:assert/strict";
import test from "node:test";
import {
    exact,
    inspectAnchoredCausalRun,
    realizeAnchoredCausalWorld,
    realizePersistentCausalWorld,
    recordAnchoredCausalReplay,
    recordPersistentCausalReplay,
    replayAnchoredCausalRecord,
    replayPersistentCausalRecord,
    type ExecutableAnchoredCausalProgram,
    type PersistentCausalProgram,
} from "../../src/bubbles/world-kernel";
import generationalGrove from "../../examples/generational-grove.world.json";
import selfOrganizingField from "../../examples/self-organizing-field.world.json";

function lifecycleProgram(includeRetirement = false): ExecutableAnchoredCausalProgram {
    const program = structuredClone(selfOrganizingField) as ExecutableAnchoredCausalProgram;
    const parent = program.world.worlds[0]!;
    const child = structuredClone(parent);
    child.id = "child-world";
    child.initialExistence = "latent";
    program.world.worlds.push(child);
    program.fieldInitializers.push(...program.fieldInitializers
        .filter((initializer) => initializer.worldId === parent.id)
        .map((initializer) => ({ ...structuredClone(initializer), worldId: child.id })));
    program.seaLaws.push({ ...structuredClone(program.seaLaws[0]!), worldId: child.id });
    program.world.worldWill.objectives.push({
        id: "preserve-child-viability",
        targetWorldId: child.id,
        fieldId: child.seaCoupling.viabilityFieldId,
        direction: "maximize",
        weight: exact.integer(1),
    });
    program.world.worldWill.interventions = [];
    program.execution.interventionCosts = [];
    program.world.internalLaws.push({
        id: "spawn-child",
        worldId: parent.id,
        guard: {
            id: "spawn-child-when-world-law-allows",
            query: { familyId: "always-true", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [],
        },
        effects: [],
        lifecycleEffects: [{ kind: "spawn-world", targetWorldId: child.id }],
        application: "once-per-realization",
        reversibility: "irreversible",
    }, {
        id: "form-child",
        worldId: child.id,
        guard: {
            id: "form-child-from-latent-coherence",
            query: { familyId: "coherence-is-zero", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [{ parameterName: "coherence", worldId: child.id, fieldId: "coherence" }],
        },
        effects: [{ fieldId: "coherence", operation: "set", value: exact.integer(2) }],
        application: "once-per-realization",
        reversibility: "irreversible",
        commitAffectedFieldIds: ["coherence"],
    });
    if (includeRetirement) {
        program.world.internalLaws.push({
            id: "retire-child",
            worldId: child.id,
            guard: {
                id: "retire-child-after-formation",
                query: { familyId: "coherent-structure", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [{ parameterName: "coherence", worldId: child.id, fieldId: "coherence" }],
            },
            effects: [],
            lifecycleEffects: [{ kind: "retire-self" }],
            application: "once-per-realization",
            reversibility: "irreversible",
        });
    }
    program.world.emergenceCriteria.push({
        id: "child-coherent-structure",
        worldId: child.id,
        predicate: {
            id: "child-coherence-exists",
            query: { familyId: "coherent-structure", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [{ parameterName: "coherence", worldId: child.id, fieldId: "coherence" }],
        },
        witnessFieldIds: ["coherence"],
    });
    return program;
}

function childState(states: ReturnType<typeof realizeAnchoredCausalWorld>["initialWorldStates"]) {
    return states.find((state) => state.worldId === "child-world")!;
}

function generationalProgram(): ExecutableAnchoredCausalProgram {
    return structuredClone(generationalGrove) as ExecutableAnchoredCausalProgram;
}

test("an active world's internal law spawns a latent world before that child's laws can act", () => {
    const program = lifecycleProgram();
    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const continuation = run.autonomousContinuation!;
    const spawn = continuation.lifecycleEvents?.find((event) => event.kind === "world-spawn")!;
    const formed = continuation.trace.find((entry) => entry.lawId === "form-child")!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(childState(run.initialWorldStates).lifecycle?.phase, "latent");
    assert.equal(childState(continuation.worldStates).lifecycle?.phase, "active");
    assert.deepEqual(childState(continuation.worldStates).lifecycle?.parentWorldIds, ["field-world"]);
    assert.equal(spawn.targetWorldId, "child-world");
    assert.equal(spawn.hostSelection, false);
    assert.equal(continuation.order.universalClock, false);
    assert.equal(continuation.order.createsHistoryArrow, true);
    assert.deepEqual(continuation.order.historyArrowSources, ["history-commit", "world-lifecycle"]);
    assert.deepEqual(formed.causes, [spawn.id]);
    assert.ok(continuation.trace.findIndex((entry) => entry.kind === "world-spawn")
        < continuation.trace.findIndex((entry) => entry.kind === "sea-coupling" && entry.worldId === "child-world"));
    assert.ok(continuation.order.causalEdges.some((edge) => edge.cause === spawn.id && edge.effect === "law:form-child"));
    assert.equal(continuation.emergenceAssessments
        .find((assessment) => assessment.criterionId === "child-coherent-structure")?.status, "emerged");

    const inspection = inspectAnchoredCausalRun(run);
    assert.equal(inspection.summary.activeWorldCount, 2);
    assert.equal(inspection.summary.latentWorldCount, 0);
    assert.equal(inspection.summary.spawnedWorldCount, 1);

    const replay = replayAnchoredCausalRecord(recordAnchoredCausalReplay(program, { worldWillEnabled: false }));
    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.lifecyclePreserved, true);
});

test("retirement stops a world without deleting its final state, negative sea, lineage, or committed memory", () => {
    const run = realizeAnchoredCausalWorld(lifecycleProgram(true), { worldWillEnabled: false });
    const continuation = run.autonomousContinuation!;
    const finalChild = childState(continuation.worldStates);
    const retirement = continuation.lifecycleEvents?.find((event) => event.kind === "world-retirement")!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(finalChild.lifecycle?.phase, "retired");
    assert.equal(finalChild.lifecycle?.retiredByEventId, retirement.id);
    assert.deepEqual(finalChild.fields.coherence, exact.integer(2));
    assert.deepEqual(retirement.residue?.localNegativeSea, exact.integer(1));
    assert.deepEqual(retirement.residue?.retainedHistoryCommitIds, ["commit:law:form-child"]);
    assert.equal(retirement.lineageId, finalChild.lifecycle?.lineageId);
    assert.ok(continuation.order.causalEdges.some((edge) => edge.cause === "law:retire-child" && edge.effect === retirement.id));
    assert.ok(continuation.trace.some((entry) => entry.kind === "world-retirement" && entry.lifecycleEventId === retirement.id));
});

test("lifecycle provenance creates an irreversible history direction without inventing universal time", () => {
    const program = lifecycleProgram();
    for (const law of program.world.internalLaws) delete law.commitAffectedFieldIds;
    const continuation = realizeAnchoredCausalWorld(program, { worldWillEnabled: false }).autonomousContinuation!;

    assert.equal(continuation.historyCommits.length, 0);
    assert.equal(continuation.order.universalClock, false);
    assert.equal(continuation.order.createsHistoryArrow, true);
    assert.deepEqual(continuation.order.historyArrowSources, ["world-lifecycle"]);
});

test("commuting birth laws create one conjunctive birth with every direct cause", () => {
    const program = lifecycleProgram();
    program.world.internalLaws.push({
        id: "co-cause-child-birth",
        worldId: "field-world",
        guard: {
            id: "co-cause-child-when-world-law-allows",
            query: { familyId: "always-true", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [],
        },
        effects: [],
        lifecycleEffects: [{ kind: "spawn-world", targetWorldId: "child-world" }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });

    const continuation = realizeAnchoredCausalWorld(program, { worldWillEnabled: false }).autonomousContinuation!;
    const spawn = continuation.lifecycleEvents?.find((event) => event.kind === "world-spawn")!;
    assert.equal(continuation.lifecycleEvents?.filter((event) => event.kind === "world-spawn").length, 1);
    assert.deepEqual(spawn.causedByLawEventIds, ["law:co-cause-child-birth", "law:spawn-child"]);
    assert.deepEqual(continuation.trace.find((entry) => entry.lawId === "form-child")?.causes, [spawn.id]);
});

test("the canonical world forms a child, retires its origin, activates the child anchor, and responds internally", () => {
    const run = realizeAnchoredCausalWorld(generationalProgram());
    const selected = run.continuations.find((continuation) => run.selectedContinuationIds.includes(continuation.id))!;
    const origin = selected.worldStates.find((state) => state.worldId === "origin-grove")!;
    const descendant = selected.worldStates.find((state) => state.worldId === "descendant-grove")!;

    assert.equal(run.status, "realized", run.reason);
    assert.equal(run.resourceUse.lifecycleTransitionBound, 3);
    assert.ok(run.continuations.every((continuation) => (
        (continuation.lifecycleEvents?.length ?? 0) <= run.resourceUse.lifecycleTransitionBound!
    )));
    assert.equal(run.initialWorldStates.find((state) => state.worldId === "descendant-grove")?.lifecycle?.phase, "latent");
    assert.equal(origin.lifecycle?.phase, "retired");
    assert.equal(descendant.lifecycle?.phase, "active");
    assert.deepEqual(descendant.fields.structure, exact.integer(2));
    assert.equal(run.interventionEligibility.find((entry) => entry.interventionId === "nurture-descendant")?.status, "eligible");
    assert.equal(run.interventionEligibility.find((entry) => entry.interventionId === "prolong-retired-origin")?.status, "blocked");
    assert.ok(run.interventionEligibility.find((entry) => entry.interventionId === "prolong-retired-origin")
        ?.reasons.some((reason) => reason.includes("inactive world endpoint")));
    assert.deepEqual(run.candidateAssessments[0]?.objectiveContributions?.map((entry) => entry.worldId), ["descendant-grove"]);
    assert.deepEqual(selected.trace.find((entry) => entry.lawId === "respond-to-nurture")?.causes, [
        "law:form-descendant-boundary",
        "will:nurture-descendant",
    ]);

    const inspection = inspectAnchoredCausalRun(run);
    assert.equal(inspection.summary.activeWorldCount, 1);
    assert.equal(inspection.summary.retiredWorldCount, 1);
    assert.equal(inspection.summary.spawnedWorldCount, 1);
    assert.equal(inspection.summary.retirementCount, 1);
});

test("World Will and anchors are not required for canonical birth and retirement", () => {
    const run = realizeAnchoredCausalWorld(generationalProgram(), {
        worldWillEnabled: false,
        cutAnchorIds: ["origin-anchor", "descendant-anchor"],
    });
    const selected = run.autonomousContinuation!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(selected.lifecycleEvents?.filter((event) => event.kind === "world-spawn").length, 1);
    assert.equal(selected.lifecycleEvents?.filter((event) => event.kind === "world-retirement").length, 1);
    assert.deepEqual(selected.worldStates.find((state) => state.worldId === "descendant-grove")?.fields.structure, exact.integer(1));
    assert.ok(!selected.trace.some((entry) => entry.kind === "world-will-intervention"));
});

test("same-program event nonrealization prevents canonical birth instead of converting it into death", () => {
    const run = realizeAnchoredCausalWorld(generationalProgram(), {
        worldWillEnabled: false,
        counterfactualInternalEventAblationLawIds: ["germinate-descendant"],
    });
    const continuation = run.autonomousContinuation!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(continuation.internalEventAblations?.[0]?.lawId, "germinate-descendant");
    assert.equal(continuation.worldStates.find((state) => state.worldId === "descendant-grove")?.lifecycle?.phase, "latent");
    assert.equal(continuation.worldStates.find((state) => state.worldId === "origin-grove")?.lifecycle, undefined);
    assert.equal(continuation.lifecycleEvents, undefined);
    assert.ok(!continuation.trace.some((entry) => entry.kind === "world-retirement"));
});

test("lifecycle replay detects stored phase tampering", () => {
    const record = recordAnchoredCausalReplay(generationalProgram());
    const origin = record.recordedRun.continuations[0]!.worldStates
        .find((state) => state.worldId === "origin-grove")!;
    origin.lifecycle!.phase = "active";

    const replay = replayAnchoredCausalRecord(record);
    assert.equal(replay.status, "reexecution-drift");
    assert.equal(replay.recordIntegrityValid, false);
    assert.equal(replay.lifecyclePreserved, false);
});

test("branch nonrealization leaves a latent world; it does not fabricate a retirement", () => {
    const program = lifecycleProgram();
    program.execution.internalConflictMode = "maximal-commuting-branches";
    program.world.internalLaws = [
        {
            ...structuredClone(program.world.internalLaws.find((law) => law.id === "spawn-child")!),
            effects: [{ fieldId: "condition", operation: "set", value: exact.integer(1) }],
        },
        {
            id: "keep-child-unrealized",
            worldId: "field-world",
            guard: {
                id: "keep-child-unrealized-when-world-law-allows",
                query: { familyId: "always-true", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [],
            },
            effects: [{ fieldId: "condition", operation: "set", value: exact.integer(2) }],
            application: "once-per-realization",
            reversibility: "irreversible",
        },
        structuredClone(program.world.internalLaws.find((law) => law.id === "form-child")!),
    ];

    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    assert.equal(run.status, "plural", run.reason);
    const spawned = run.continuations.find((continuation) => childState(continuation.worldStates).lifecycle?.phase === "active")!;
    const unrealized = run.continuations.find((continuation) => childState(continuation.worldStates).lifecycle?.phase === "latent")!;
    assert.ok(spawned.lifecycleEvents?.some((event) => event.kind === "world-spawn"));
    assert.equal(unrealized.lifecycleEvents, undefined);
    assert.equal(unrealized.branchLineage?.[0]?.nonrealizedLawIds.includes("spawn-child"), true);
    assert.ok(!unrealized.trace.some((entry) => entry.kind === "world-retirement"));
});

test("persistent closure resumes a retired world as retired and cannot spawn it again", () => {
    const persistent: PersistentCausalProgram = {
        mode: "bubble-persistent-causal-program.v1",
        causalProgram: lifecycleProgram(true),
    };
    const run = realizePersistentCausalWorld(persistent, {
        maxClosures: 3,
        causalOptions: { worldWillEnabled: false },
    });
    const closures = run.paths[0]?.closures ?? [];

    assert.ok(closures.length >= 2, run.reason);
    assert.equal(childState(closures[0]!.outputWorldStates).lifecycle?.phase, "retired");
    assert.equal(childState(closures[1]!.inputWorldStates).lifecycle?.phase, "retired");
    assert.ok(!closures[1]!.run.continuations.some((continuation) => (
        continuation.lifecycleEvents?.some((event) => event.kind === "world-spawn")
    )));
});

test("persistent stored replay preserves lifecycle continuation and rejects phase tampering", () => {
    const persistent: PersistentCausalProgram = {
        mode: "bubble-persistent-causal-program.v1",
        causalProgram: lifecycleProgram(true),
    };
    const record = recordPersistentCausalReplay(persistent, {
        maxClosures: 3,
        causalOptions: { worldWillEnabled: false },
    });
    const replay = replayPersistentCausalRecord(record);

    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.fullRunPreserved, true);
    assert.equal(childState(replay.replayedRun.paths[0]!.closures[1]!.inputWorldStates).lifecycle?.phase, "retired");

    childState(record.recordedRun.paths[0]!.closures[0]!.outputWorldStates).lifecycle!.phase = "active";
    const tampered = replayPersistentCausalRecord(record);
    assert.equal(tampered.status, "reexecution-drift");
    assert.equal(tampered.recordIntegrityValid, false);
    assert.equal(tampered.fullRunPreserved, false);
});

test("lifecycle validation rejects reversible birth, active spawn targets, and empty pseudo-laws", () => {
    const reversible = lifecycleProgram();
    reversible.world.internalLaws.find((law) => law.id === "spawn-child")!.reversibility = "reversible";
    assert.ok(realizeAnchoredCausalWorld(reversible).diagnostics.some((entry) => entry.code === "CKW080"));

    const activeTarget = lifecycleProgram();
    activeTarget.world.worlds.find((world) => world.id === "child-world")!.initialExistence = "active";
    assert.ok(realizeAnchoredCausalWorld(activeTarget).diagnostics.some((entry) => entry.code === "CKW078"));

    const empty = lifecycleProgram();
    const spawnLaw = empty.world.internalLaws.find((law) => law.id === "spawn-child")!;
    spawnLaw.lifecycleEffects = [];
    assert.ok(realizeAnchoredCausalWorld(empty).diagnostics.some((entry) => entry.code === "CKW074"));

    const regressed = realizeAnchoredCausalWorld(lifecycleProgram(), {
        worldLifecycleOverrides: { "field-world": { phase: "latent" } },
    });
    assert.equal(regressed.status, "contradicted");
    assert.match(regressed.reason ?? "", /cannot regress to latent existence/);

    const unanchoredRead = lifecycleProgram();
    const childLaw = unanchoredRead.world.internalLaws.find((law) => law.id === "form-child")!;
    childLaw.guard.fieldParameters[0]!.worldId = "field-world";
    assert.ok(realizeAnchoredCausalWorld(unanchoredRead).diagnostics.some((entry) => entry.code === "CKW081"));
});
