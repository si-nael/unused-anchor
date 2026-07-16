import assert from "node:assert/strict";
import test from "node:test";
import {
    exact,
    everyAutonomousPathPreservesKernel,
    inspectTeleonomicCausalRun,
    quantifyResponseEventAblationContinuations,
    quantifyResponseMemoryDependence,
    realizeTeleonomicCausalWorld,
    recordTeleonomicCausalReplay,
    replayTeleonomicCausalRecord,
    type IntensionalTerm,
    type PersistentCausalProgram,
} from "../../src/bubbles/world-kernel";
import distributedChannelField from "../../examples/distributed-channel-field.world.json";
import selfMaintainingField from "../../examples/self-maintaining-field.world.json";

function teleonomicProgram(): PersistentCausalProgram {
    return structuredClone(selfMaintainingField) as PersistentCausalProgram;
}

function collapseToSingleResponse(program: PersistentCausalProgram): void {
    program.causalProgram.world.internalLaws = program.causalProgram.world.internalLaws.filter((law) => (
        law.id !== "negative-sea-erosion-route-b" && law.id !== "restore-from-memory-route-b"
    ));
    const response = program.causalProgram.world.internalLaws.find((law) => law.id === "restore-from-memory")!;
    response.effects.find((effect) => effect.fieldId === "phase")!.value = exact.integer(0);
}

function replaceParameterEquality(termValue: IntensionalTerm, parameterName: string, value: IntensionalTerm): boolean {
    if (termValue.kind === "binary") {
        if (termValue.operator === "equal" && termValue.left.kind === "parameter"
            && termValue.left.name === parameterName) {
            termValue.right = value;
            return true;
        }
        return replaceParameterEquality(termValue.left, parameterName, value)
            || replaceParameterEquality(termValue.right, parameterName, value);
    }
    if (termValue.kind === "unary") return replaceParameterEquality(termValue.operand, parameterName, value);
    if (termValue.kind === "if") return replaceParameterEquality(termValue.condition, parameterName, value)
        || replaceParameterEquality(termValue.then, parameterName, value)
        || replaceParameterEquality(termValue.otherwise, parameterName, value);
    return false;
}

function cycleWithThreeResponses(): PersistentCausalProgram {
    const program = teleonomicProgram();
    const families = program.causalProgram.world.formal.families;
    const laws = program.causalProgram.world.internalLaws;
    const routeBResponse = laws.find((law) => law.id === "restore-from-memory-route-b")!;
    routeBResponse.effects.find((effect) => effect.fieldId === "phase")!.value = exact.integer(4);

    const stressC = structuredClone(families.find((family) => family.id === "stress-route-b-ready")!);
    stressC.id = "stress-route-c-ready";
    assert.equal(replaceParameterEquality(stressC.body, "phase", { kind: "value", value: exact.integer(4) }), true);
    const repairC = structuredClone(families.find((family) => family.id === "repair-route-b-ready")!);
    repairC.id = "repair-route-c-ready";
    assert.equal(replaceParameterEquality(repairC.body, "phase", { kind: "value", value: exact.integer(5) }), true);
    families.push(stressC, repairC);

    const erosionC = structuredClone(laws.find((law) => law.id === "negative-sea-erosion-route-b")!);
    erosionC.id = "negative-sea-erosion-route-c";
    erosionC.guard.id = "negative-sea-crosses-route-c-boundary";
    erosionC.guard.query.familyId = stressC.id;
    erosionC.effects.find((effect) => effect.fieldId === "phase")!.value = exact.integer(5);
    const responseC = structuredClone(routeBResponse);
    responseC.id = "restore-from-memory-route-c";
    responseC.guard.id = "repair-route-c-through-retained-structure";
    responseC.guard.query.familyId = repairC.id;
    responseC.effects.find((effect) => effect.fieldId === "phase")!.value = exact.integer(0);
    responseC.effects.find((effect) => effect.fieldId === "signal")!.value = exact.integer(3);
    laws.push(erosionC, responseC);
    return program;
}

function distributedChannelProgram(): PersistentCausalProgram {
    return structuredClone(distributedChannelField) as PersistentCausalProgram;
}

function detachPhaseSchedulingFromResponses(): PersistentCausalProgram {
    const program = teleonomicProgram();
    const laws = program.causalProgram.world.internalLaws;
    for (const lawId of ["restore-from-memory", "restore-from-memory-route-b"]) {
        const response = laws.find((law) => law.id === lawId)!;
        const phaseEffectIndex = response.effects.findIndex((effect) => effect.fieldId === "phase");
        assert.notEqual(phaseEffectIndex, -1);
        const [phaseEffect] = response.effects.splice(phaseEffectIndex, 1);
        const scheduler = structuredClone(response);
        scheduler.id = `detached-phase-scheduler-${lawId}`;
        scheduler.guard.id = `detached-phase-scheduler-guard-${lawId}`;
        scheduler.effects = [phaseEffect!];
        delete scheduler.commitAffectedFieldIds;
        laws.push(scheduler);
    }
    return program;
}

test("an endogenous viability kernel has plural internally differentiated necessary affordances", () => {
    const run = realizeTeleonomicCausalWorld(teleonomicProgram());
    const assessment = run.assessments[0]!;

    assert.equal(run.status, "teleonomic-capacity");
    assert.equal(run.order.universalClock, false);
    assert.equal(run.order.hostAffordanceSelector, false);
    assert.equal(assessment.status, "teleonomic-capacity");
    assert.equal(assessment.endogenousNorm.kind, "bounded-invariant-viability-kernel");
    assert.equal(assessment.endogenousNorm.authoredGoalDeclaration, false);
    assert.equal(assessment.endogenousNorm.cardinality, 2);
    assert.equal(assessment.endogenousNorm.closedAcrossRealizedCycle, true);
    assert.deepEqual(assessment.plurality.distinctAffordanceLawIds, [
        "restore-from-memory",
        "restore-from-memory-route-b",
    ]);
    assert.deepEqual(assessment.plurality.internalDiscriminatorFieldKeys, ["maintenance-world.phase"]);
    const phaseEvidence = assessment.plurality.internalDiscriminatorEvidence
        .find((evidence) => evidence.fieldKey === "maintenance-world.phase")!;
    assert.equal(phaseEvidence.status, "organically-recurrent");
    assert.equal(phaseEvidence.everyResponseValueProducedWithinEpisode, true);
    assert.equal(phaseEvidence.everyCycleInputProducedByPrecedingResponse, true);
    assert.equal(assessment.plurality.organicallyDifferentiated, true);
    assert.equal(assessment.plurality.hostSelection, false);
    assert.ok(assessment.affordances.every((affordance) => affordance.status === "necessary"));
    assert.ok(assessment.affordances.every((affordance) => affordance.memoryDependence.every((dependence) => (
        dependence.status === "necessary"
        && dependence.memoryFieldKeys.length > 0
        && dependence.continuations.length > 0
        && dependence.continuations.every((continuation) => !continuation.responseEventRealized)
    ))));
    assert.ok(assessment.affordances.every((affordance) => affordance.responseEventAblations.every((ablation) => (
        ablation.status === "necessary"
        && ablation.counterfactualKind === "same-law-internal-event-nonrealization"
        && ablation.sameProgramDigest
        && ablation.lawDefinitionRetained
        && ablation.eventAblationWitnesses.length > 0
        && ablation.continuations.length > 0
        && ablation.continuations.every((continuation) => (
            continuation.responseEventNonrealizationWitnessed && !continuation.remainsInsideKernel
        ))
    ))));
});

test("the same teleonomic contract holds for a three-state response cycle", () => {
    const run = realizeTeleonomicCausalWorld(cycleWithThreeResponses());
    const assessment = run.assessments[0]!;

    assert.equal(run.status, "teleonomic-capacity");
    assert.equal(run.persistentRun.paths[0]?.cycle?.periodClosures, 3);
    assert.equal(assessment.endogenousNorm.cardinality, 3);
    assert.deepEqual(assessment.plurality.distinctAffordanceLawIds, [
        "restore-from-memory",
        "restore-from-memory-route-b",
        "restore-from-memory-route-c",
    ]);
    assert.ok(assessment.affordances.every((affordance) => affordance.status === "necessary"));
    assert.ok(assessment.affordances.every((affordance) => affordance.responseEventAblations.every((ablation) => (
        ablation.sameProgramDigest && ablation.lawDefinitionRetained
    ))));
    assert.ok(assessment.plurality.internalDiscriminatorEvidence.every((evidence) => (
        evidence.fieldKey !== "maintenance-world.phase" || evidence.status === "organically-recurrent"
    )));
});

test("distributed causal channels support teleonomic capacity without a scalar phase coordinate", () => {
    const run = realizeTeleonomicCausalWorld(distributedChannelProgram());
    const assessment = run.assessments[0]!;

    assert.equal(run.status, "teleonomic-capacity");
    assert.equal(assessment.endogenousNorm.cardinality, 2);
    assert.deepEqual(assessment.plurality.internalDiscriminatorFieldKeys, [
        "distributed-maintenance-world.channel-a",
        "distributed-maintenance-world.channel-b",
    ]);
    assert.ok(assessment.plurality.internalDiscriminatorEvidence.every((evidence) => (
        evidence.status === "organically-recurrent"
        && evidence.everyResponseValueProducedWithinEpisode
        && evidence.everyCycleInputProducedByPrecedingResponse
    )));
    assert.ok(assessment.affordances.every((affordance) => affordance.status === "necessary"));
    assert.ok(assessment.affordances.every((affordance) => affordance.memoryDependence
        .every((dependence) => dependence.status === "necessary")));
    assert.equal(JSON.stringify(run).includes("phase"), false);
});

test("a detached phase scheduler cannot masquerade as organic affordance differentiation", () => {
    const run = realizeTeleonomicCausalWorld(detachPhaseSchedulingFromResponses());
    assert.equal(run.persistentRun.status, "persistent", JSON.stringify(run.persistentRun, null, 2));
    const assessment = run.assessments[0]!;
    const phaseEvidence = assessment.plurality.internalDiscriminatorEvidence
        .find((evidence) => evidence.fieldKey === "maintenance-world.phase")!;

    assert.equal(assessment.affordances.length, 2);
    assert.ok(assessment.affordances.every((affordance) => affordance.status === "necessary"));
    assert.equal(run.status, "non-teleonomic");
    assert.equal(phaseEvidence.distinctAcrossAffordances, true);
    assert.equal(phaseEvidence.everyResponseValueProducedWithinEpisode, true);
    assert.equal(phaseEvidence.everyCycleInputProducedByPrecedingResponse, false);
    assert.equal(phaseEvidence.status, "not-organic");
    assert.deepEqual(assessment.plurality.internalDiscriminatorFieldKeys, []);
    assert.equal(assessment.plurality.organicallyDifferentiated, false);
});

test("persistence with only one response is not inflated into teleonomic plurality", () => {
    const program = teleonomicProgram();
    collapseToSingleResponse(program);

    const run = realizeTeleonomicCausalWorld(program);
    const assessment = run.assessments[0]!;
    assert.equal(run.persistentRun.status, "persistent");
    assert.equal(run.status, "non-teleonomic");
    assert.equal(assessment.affordances.length, 1);
    assert.equal(assessment.plurality.organicallyDifferentiated, false);
    assert.ok(assessment.reasons.some((reason) => reason.includes("fewer than two")));
});

test("a name-only goal cannot promote one-response persistence", () => {
    const program = teleonomicProgram() as PersistentCausalProgram & { goal?: string };
    collapseToSingleResponse(program);
    program.goal = "survive";

    const run = realizeTeleonomicCausalWorld(program);
    assert.equal(run.status, "non-teleonomic");
    assert.equal(run.assessments[0]?.endogenousNorm.authoredGoalDeclaration, false);
    assert.equal(run.assessments[0]?.affordances.length, 1);
});

test("a syntactically bound but semantically decorative memory cannot support an affordance", () => {
    const program = teleonomicProgram();
    const family = program.causalProgram.world.formal.families
        .find((candidate) => candidate.id === "repair-route-b-ready")!;
    assert.equal(replaceParameterEquality(family.body, "memory", {
        kind: "parameter",
        name: "memory",
    }), true);

    const run = realizeTeleonomicCausalWorld(program);
    const routeB = run.assessments[0]?.affordances
        .find((affordance) => affordance.lawId === "restore-from-memory-route-b")!;

    assert.equal(run.persistentRun.status, "persistent");
    assert.equal(run.status, "non-teleonomic");
    assert.equal(routeB.status, "not-necessary");
    assert.ok(routeB.memoryDependence.every((dependence) => dependence.status === "not-necessary"));
    assert.ok(routeB.memoryDependence.every((dependence) => dependence.continuations
        .every((continuation) => continuation.responseEventRealized)));
});

test("response-event necessity is universal across lawful counterfactual continuations", () => {
    assert.equal(quantifyResponseEventAblationContinuations([
        { remainsInsideKernel: false },
        { remainsInsideKernel: false },
    ]), "necessary");
    assert.equal(quantifyResponseEventAblationContinuations([
        { remainsInsideKernel: false },
        { remainsInsideKernel: true },
    ]), "mixed");
    assert.equal(quantifyResponseEventAblationContinuations([
        { remainsInsideKernel: true },
        { remainsInsideKernel: true },
    ]), "not-necessary");
    assert.equal(quantifyResponseEventAblationContinuations([]), "undetermined");
    assert.equal(quantifyResponseMemoryDependence([
        { continuationId: "left", responseEventRealized: false },
        { continuationId: "right", responseEventRealized: false },
    ]), "necessary");
    assert.equal(quantifyResponseMemoryDependence([
        { continuationId: "left", responseEventRealized: false },
        { continuationId: "right", responseEventRealized: true },
    ]), "mixed");
    assert.equal(quantifyResponseMemoryDependence([
        { continuationId: "left", responseEventRealized: true },
    ]), "not-necessary");
    assert.equal(quantifyResponseMemoryDependence([]), "undetermined");
});

test("autonomy requires kernel preservation on every lawful disabled-and-cut path", () => {
    assert.equal(everyAutonomousPathPreservesKernel([
        { componentPersistent: true, kernelPreserved: true },
        { componentPersistent: true, kernelPreserved: true },
    ]), true);
    assert.equal(everyAutonomousPathPreservesKernel([
        { componentPersistent: true, kernelPreserved: true },
        { componentPersistent: true, kernelPreserved: false },
    ]), false);
    assert.equal(everyAutonomousPathPreservesKernel([
        { componentPersistent: true, kernelPreserved: true },
        { componentPersistent: false, kernelPreserved: true },
    ]), false);
    assert.equal(everyAutonomousPathPreservesKernel([]), false);
});

test("the capacity survives with World Will disabled and every anchor cut", () => {
    const run = realizeTeleonomicCausalWorld(teleonomicProgram());
    const autonomy = run.assessments[0]!.autonomy;

    assert.equal(autonomy.realizedWithoutWorldWillIntervention, true);
    assert.deepEqual(autonomy.disabledWorldWillAndCutAnchorIds, ["maintenance-anchor"]);
    assert.equal(autonomy.persistentCounterfactualStatus, "persistent");
    assert.ok(autonomy.pathEvidence.length > 0);
    assert.ok(autonomy.pathEvidence.every((path) => path.componentPersistent && path.kernelPreserved));
    assert.equal(autonomy.viabilityKernelPreserved, true);
    assert.equal(autonomy.effective, true);
});

test("a bounded proof frontier stays unresolved instead of inventing a goal", () => {
    const run = realizeTeleonomicCausalWorld(teleonomicProgram(), { maxClosures: 2 });

    assert.equal(run.status, "undetermined");
    assert.equal(run.persistentRun.status, "undetermined");
    assert.deepEqual(run.assessments, []);
    assert.equal(run.resourceUse.exhaustive, false);
});

test("inspection and replay preserve the complete teleonomic counterfactual evidence", () => {
    const record = recordTeleonomicCausalReplay(teleonomicProgram());
    const replay = replayTeleonomicCausalRecord(record);
    const inspection = inspectTeleonomicCausalRun(record.recordedRun);

    assert.equal(replay.status, "same-teleonomic-reexecution");
    assert.equal(replay.recordIntegrityValid, true);
    assert.equal(replay.programIdentityValid, true);
    assert.equal(replay.fullRunPreserved, true);
    assert.equal(inspection.summary.status, "teleonomic-capacity");
    assert.equal(inspection.summary.certifiedCapacityCount, 1);
    assert.equal(inspection.summary.affordanceCount, 2);
    assert.equal(inspection.summary.universalClock, false);
    assert.equal(inspection.summary.hostAffordanceSelector, false);
});

test("teleonomic replay detects stored evidence tampering", () => {
    const record = recordTeleonomicCausalReplay(teleonomicProgram());
    record.recordedRun.assessments[0]!.endogenousNorm.authoredGoalDeclaration = false;
    record.recordedRun.assessments[0]!.endogenousNorm.componentConfigurationDigests[0] = "forged-kernel";

    const replay = replayTeleonomicCausalRecord(record);
    assert.equal(replay.status, "reexecution-drift");
    assert.equal(replay.recordIntegrityValid, false);
    assert.equal(replay.fullRunPreserved, false);
});
