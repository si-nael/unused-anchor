import assert from "node:assert/strict";
import test from "node:test";
import {
    exact,
    inspectPersistentCausalRun,
    quantifyCounterfactualContinuations,
    realizePersistentCausalWorld,
    recordPersistentCausalReplay,
    replayPersistentCausalRecord,
    term,
    type CounterfactualContinuationDifference,
    type IntensionalTerm,
    type PersistentCausalProgram,
} from "../../src/bubbles/world-kernel";
import selfMaintainingField from "../../examples/self-maintaining-field.world.json";

function persistentProgram(): PersistentCausalProgram {
    return structuredClone(selfMaintainingField) as PersistentCausalProgram;
}

test("an unlabeled structure persists across exact causal closures without a universal clock", () => {
    const run = realizePersistentCausalWorld(persistentProgram());
    const path = run.paths[0];
    const assessment = run.assessments[0];

    assert.equal(run.status, "persistent");
    assert.equal(run.order.universalClock, false);
    assert.equal(run.order.kind, "causal-closure-coalgebra");
    assert.equal(path?.status, "cycle");
    assert.equal(path?.closures.length, 3);
    assert.equal(path?.cycle?.scope, "causal-configuration");
    assert.equal(path?.cycle?.startConfigurationIndex, 1);
    assert.equal(path?.cycle?.periodClosures, 2);
    assert.equal(path?.cycle?.anchoredHistory.extensionCount, 2);
    assert.equal(path?.cycle?.anchoredHistory.fullAnchoredStateRepeated, false);
    assert.equal(path?.anchoredHistory.entries.length, 3);
    assert.equal(path?.closures[0]?.run.autonomousContinuation?.emergenceAssessments[0]?.status, "emerged");
    assert.equal(path?.closures[1]?.run.autonomousContinuation?.emergenceAssessments[0]?.status, "persistent");
    assert.equal(assessment?.status, "persistent");
    assert.deepEqual(assessment?.reasons, []);
});

test("boundary, identity, memory, maintenance, and outward influence have separate evidence", () => {
    const assessment = realizePersistentCausalWorld(persistentProgram()).assessments[0]!;

    assert.equal(assessment.boundary.derivedFromCausalCut, true);
    assert.equal(assessment.boundary.status, "causally-mediated");
    assert.ok(assessment.boundary.incomingEdges.some((edge) => edge.from.fieldId === "negative"));
    assert.ok(assessment.boundary.outgoingEdges.some((edge) => edge.to.fieldId === "signal"));
    assert.deepEqual(assessment.boundary.mediatedIncomingLawIds, [
        "negative-sea-erosion",
        "negative-sea-erosion-route-b",
    ]);
    assert.ok(assessment.boundary.mediatedOutgoingLawIds.includes("restore-from-memory"));
    assert.equal(assessment.boundary.cutAblation.continuationEvidence[0]?.historyChanged, true);
    assert.equal(assessment.identity.recurrentState, true);
    assert.equal(assessment.identity.invariantAcrossCycleCuts, true);
    assert.deepEqual(assessment.identity.identityFieldKeys, ["maintenance-world.identity"]);
    assert.equal(assessment.memory[0]?.status, "causally-effective");
    assert.deepEqual(assessment.memory[0]?.rememberedValue, exact.integer(1));
    assert.deepEqual(assessment.memory[0]?.erasedToValue, exact.integer(0));
    assert.ok(assessment.memory[0]?.externallyChangedFieldKeys.includes("maintenance-world.signal"));
    assert.ok(assessment.memory[0]?.continuationEvidence.every((entry) => entry.effective));
    assert.equal(assessment.selfMaintenance.witnessed, true);
    assert.equal(assessment.selfMaintenance.negativeSeaEventId, "law:admit-negative-sea");
    assert.equal(assessment.selfMaintenance.disturbanceEventId, "law:negative-sea-erosion");
    assert.equal(assessment.selfMaintenance.restorationEventId, "law:restore-from-memory");
    assert.deepEqual(assessment.selfMaintenance.referenceValue, exact.integer(2));
    assert.deepEqual(assessment.selfMaintenance.disturbedValue, exact.integer(1));
    assert.deepEqual(assessment.selfMaintenance.restoredValue, exact.integer(2));
    assert.equal(assessment.causalInfluence.effective, true);
    assert.equal(assessment.causalInfluence.universalAcrossCounterfactualContinuations, true);
});

test("plural counterfactual evidence remains mixed when only some lawful continuations change", () => {
    const evidence = (effective: boolean, id: string): CounterfactualContinuationDifference => ({
        continuationId: id,
        changedFieldKeys: effective ? ["world.signal"] : [],
        externallyChangedFieldKeys: effective ? ["world.signal"] : [],
        changedTraceLawIds: [],
        historyChanged: false,
        effective,
    });

    assert.equal(quantifyCounterfactualContinuations([
        evidence(true, "continuation:changed"),
        evidence(false, "continuation:unchanged"),
    ]), "mixed");
});

test("a two-sided dependency cut fails when boundary state does not mediate every crossing law", () => {
    const program = persistentProgram();
    const erosion = program.causalProgram.world.internalLaws.find((law) => law.id === "negative-sea-erosion")!;
    erosion.guard.fieldParameters.find((binding) => binding.parameterName === "boundary")!.fieldId = "identity";

    const run = realizePersistentCausalWorld(program);
    assert.equal(run.status, "non-persistent");
    assert.equal(run.assessments[0]?.boundary.status, "not-mediated");
    assert.equal(run.assessments[0]?.boundary.derivedFromCausalCut, false);
});

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

test("a syntactically bound but semantically redundant boundary cannot certify mediation", () => {
    const program = persistentProgram();
    for (const familyId of [
        "stress-route-a-ready",
        "stress-route-b-ready",
        "repair-route-a-ready",
        "repair-route-b-ready",
    ]) {
        const family = program.causalProgram.world.formal.families.find((candidate) => candidate.id === familyId)!;
        assert.equal(replaceParameterEquality(family.body, "boundary", term.parameter("boundary")), true);
    }

    const run = realizePersistentCausalWorld(program);
    const boundary = run.assessments[0]?.boundary;
    assert.equal(run.status, "non-persistent");
    assert.equal(boundary?.status, "not-mediated");
    assert.equal(boundary?.cutAblation.continuationEvidence[0]?.effective, false);
    assert.deepEqual(boundary?.cutAblation.testedCrossingLawIds, [
        "negative-sea-erosion",
        "negative-sea-erosion-route-b",
        "restore-from-memory",
        "restore-from-memory-route-b",
    ]);
});

test("restoration is rejected when the alleged disturbance did not begin at the recurrent reference", () => {
    const program = persistentProgram();
    program.causalProgram.world.internalLaws = program.causalProgram.world.internalLaws.filter((law) => (
        law.id !== "negative-sea-erosion-route-b" && law.id !== "restore-from-memory-route-b"
    ));
    const repair = program.causalProgram.world.internalLaws.find((law) => law.id === "restore-from-memory")!;
    repair.effects.find((effect) => effect.fieldId === "phase")!.value = exact.integer(0);
    const stress = program.causalProgram.world.formal.families.find((family) => family.id === "stress-route-a-ready")!;
    const preShift = structuredClone(stress);
    preShift.id = "pre-shift-ready";
    program.causalProgram.world.formal.families.push(preShift);
    assert.equal(replaceParameterEquality(stress.body, "integrity", term.value(exact.integer(3))), true);

    const erosionIndex = program.causalProgram.world.internalLaws.findIndex((law) => law.id === "negative-sea-erosion");
    const erosion = program.causalProgram.world.internalLaws[erosionIndex]!;
    const preShiftLaw = structuredClone(erosion);
    preShiftLaw.id = "pre-shift-before-alleged-disturbance";
    preShiftLaw.guard.id = "pre-shift-after-negative-sea";
    preShiftLaw.guard.query.familyId = "pre-shift-ready";
    preShiftLaw.effects = [{ fieldId: "integrity", operation: "add", value: exact.integer(1) }];
    delete preShiftLaw.commitAffectedFieldIds;
    program.causalProgram.world.internalLaws.splice(erosionIndex, 0, preShiftLaw);
    erosion.effects.find((effect) => effect.fieldId === "integrity")!.value = exact.integer(2);

    const run = realizePersistentCausalWorld(program);
    assert.equal(run.paths[0]?.status, "cycle");
    assert.equal(run.assessments[0]?.selfMaintenance.witnessed, false);
    assert.ok(run.assessments[0]?.reasons.some((reason) => reason.includes("recurrent-reference")));
});

test("self-maintenance remains internal when World Will is disabled", () => {
    const run = realizePersistentCausalWorld(persistentProgram(), {
        causalOptions: { worldWillEnabled: false },
    });

    assert.equal(run.status, "persistent");
    assert.equal(run.assessments[0]?.selfMaintenance.witnessed, true);
    assert.ok(run.paths.every((path) => path.closures.every((closure) => (
        closure.run.continuations.every((continuation) => continuation.interventionIds.length === 0)
    ))));
});

test("plural lawful continuations are all unfolded instead of selecting one host path", () => {
    const program = persistentProgram();
    program.causalProgram.world.formal.families.push({
        id: "viability-at-most-six",
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind: "boolean",
        parameters: [{ name: "viability", valueKind: "rational" }],
        body: term.binary(
            "less-than-or-equal",
            term.parameter("viability"),
            term.value(exact.integer(6)),
        ),
    });
    program.causalProgram.execution.hardConstraints = [{
        id: "bounded-viability",
        query: { familyId: "viability-at-most-six", at: { coordinate: "0" }, parameters: {} },
        fieldParameters: [{ parameterName: "viability", worldId: "maintenance-world", fieldId: "viability" }],
    }];
    program.causalProgram.world.worldWill.hardConstraintFamilyIds = ["viability-at-most-six"];
    program.causalProgram.world.worldWill.interventions = ["left", "right"].map((suffix) => ({
        id: `support-${suffix}`,
        targetWorldId: "maintenance-world",
        anchorId: "maintenance-anchor",
        kind: "condition" as const,
        effects: [{ fieldId: "viability", operation: "add" as const, value: exact.integer(1) }],
    }));
    program.causalProgram.execution.interventionCosts = program.causalProgram.world.worldWill.interventions.map((intervention) => ({
        interventionId: intervention.id,
        cost: exact.integer(0),
    }));
    program.causalProgram.execution.decisionMode = "plural";

    const run = realizePersistentCausalWorld(program);
    assert.equal(run.status, "persistent");
    assert.equal(run.paths.length, 2);
    assert.ok(run.paths.every((path) => path.status === "cycle"));
    assert.deepEqual(run.paths.map((path) => path.closures[0]?.run.status), ["plural", "plural"]);
    assert.deepEqual(run.paths.map((path) => path.closures[0]?.run.selectedContinuationIds.length), [2, 2]);
    assert.ok(run.paths.some((path) => path.id.includes("support-left")));
    assert.ok(run.paths.some((path) => path.id.includes("support-right")));
});

test("endogenous internal branches both retain persistent boundary, identity, and causal memory evidence", () => {
    const program = persistentProgram();
    program.causalProgram.execution.internalConflictMode = "maximal-commuting-branches";
    const alternateFormation = structuredClone(
        program.causalProgram.world.internalLaws.find((law) => law.id === "form-structure")!,
    );
    alternateFormation.id = "form-structure-through-route-b";
    alternateFormation.guard.id = "form-route-b-while-unbounded";
    alternateFormation.effects.find((effect) => effect.fieldId === "phase")!.value = exact.integer(2);
    program.causalProgram.world.internalLaws.push(alternateFormation);

    const run = realizePersistentCausalWorld(program);
    assert.equal(run.status, "persistent");
    assert.equal(run.paths.length, 2);
    assert.ok(run.paths.every((path) => path.status === "cycle"));
    assert.ok(run.paths.every((path) => path.closures[0]?.run.status === "plural"));
    assert.ok(run.paths.every((path) => (
        path.closures[0]?.run.selectedContinuationIds.length === 2
    )));
    assert.equal(run.assessments.length, 2);
    assert.ok(run.assessments.every((assessment) => (
        assessment.status === "persistent"
        && assessment.boundary.derivedFromCausalCut
        && assessment.identity.invariantAcrossCycleCuts
        && assessment.memory.every((memory) => memory.status === "causally-effective")
    )));
});

test("a memory-shaped field is not evidence when erasure has no causal consequence", () => {
    const program = persistentProgram();
    const form = program.causalProgram.world.internalLaws.find((law) => law.id === "form-structure")!;
    form.effects.find((effect) => effect.fieldId === "memory")!.value = exact.integer(0);

    const run = realizePersistentCausalWorld(program);
    assert.equal(run.status, "non-persistent");
    assert.equal(run.assessments[0]?.memory[0]?.status, "not-effective");
    assert.equal(run.assessments[0]?.selfMaintenance.witnessed, false);
});

test("pressure beyond the restoration law dissolves the claimed maintenance cycle", () => {
    const program = persistentProgram();
    const erosion = program.causalProgram.world.internalLaws.find((law) => law.id === "negative-sea-erosion")!;
    erosion.effects.find((effect) => effect.fieldId === "integrity")!.value = exact.integer(3);

    const run = realizePersistentCausalWorld(program);
    assert.equal(run.status, "non-persistent");
    assert.equal(run.assessments[0]?.status, "non-persistent");
    assert.ok(run.assessments[0]?.reasons.some((reason) => reason.includes("restoration")));
});

test("insufficient closure proof budget is unresolved rather than declared persistent", () => {
    const run = realizePersistentCausalWorld(persistentProgram(), { maxClosures: 1 });
    assert.equal(run.status, "contradicted");
    assert.match(run.reason, /at least two closures/);

    const drifting = persistentProgram();
    const repair = drifting.causalProgram.world.internalLaws.find((law) => law.id === "restore-from-memory")!;
    const erosion = drifting.causalProgram.world.internalLaws.find((law) => law.id === "negative-sea-erosion")!;
    erosion.effects = erosion.effects.filter((effect) => effect.fieldId !== "signal");
    repair.effects.find((effect) => effect.fieldId === "signal")!.operation = "add";
    const bounded = realizePersistentCausalWorld(drifting, { maxClosures: 2 });
    assert.equal(bounded.status, "undetermined");
    assert.equal(bounded.paths[0]?.status, "budget-exhausted");
});

test("a contradicted causal closure remains contradicted at the persistence layer", () => {
    const run = realizePersistentCausalWorld(persistentProgram(), {
        causalOptions: { fieldOverrides: { "maintenance-world.memroy": exact.integer(1) } },
    });

    assert.equal(run.status, "contradicted");
    assert.equal(run.paths[0]?.status, "contradicted");
    assert.match(run.paths[0]?.reason ?? "", /unknown field override/);
});

test("factual persistence cannot be certified from a counterfactually ablated execution", () => {
    const run = realizePersistentCausalWorld(persistentProgram(), {
        causalOptions: { counterfactualInternalEventAblationLawIds: ["restore-from-memory"] },
    });

    assert.equal(run.status, "contradicted");
    assert.match(run.reason, /factual execution cannot begin with counterfactual internal-event ablations/);
    assert.deepEqual(run.paths, []);
});

test("inspection and replay preserve recurrence and counterfactual persistence evidence", () => {
    const record = recordPersistentCausalReplay(persistentProgram());
    const replay = replayPersistentCausalRecord(record);
    const inspection = inspectPersistentCausalRun(record.recordedRun);

    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.recordIntegrityValid, true);
    assert.equal(replay.recordedProgramDigestValid, true);
    assert.equal(replay.fullRunPreserved, true);
    assert.equal(replay.pathCyclesPreserved, true);
    assert.equal(replay.persistenceEvidencePreserved, true);
    assert.equal(inspection.summary.status, "persistent");
    assert.equal(inspection.summary.persistentAssessmentCount, 1);
    assert.equal(inspection.summary.universalClock, false);
});

test("persistent replay detects stored-run tampering", () => {
    const record = recordPersistentCausalReplay(persistentProgram());
    record.recordedRun.assessments[0]!.status = "non-persistent";

    const replay = replayPersistentCausalRecord(record);
    assert.equal(replay.status, "reexecution-drift");
    assert.equal(replay.recordIntegrityValid, false);
    assert.equal(replay.fullRunPreserved, false);
});
