import assert from "node:assert/strict";
import test from "node:test";
import {
    exact,
    inspectAnchoredCausalRun,
    realizeAnchoredCausalWorld,
    recordAnchoredCausalReplay,
    replayAnchoredCausalRecord,
    term,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";
import selfOrganizingField from "../../examples/self-organizing-field.world.json";

function fieldProgram(): ExecutableAnchoredCausalProgram {
    return structuredClone(selfOrganizingField) as ExecutableAnchoredCausalProgram;
}

function selectedWorld(run: ReturnType<typeof realizeAnchoredCausalWorld>) {
    const selected = run.continuations.find((continuation) => run.selectedContinuationIds.includes(continuation.id));
    return selected?.worldStates[0];
}

test("internal laws generate causal events and coherent structure without a designated agent", () => {
    const run = realizeAnchoredCausalWorld(fieldProgram(), { worldWillEnabled: false });

    assert.equal(run.status, "stable");
    assert.deepEqual(run.autonomousContinuation?.realizedEventIds, [
        "law:condense",
        "law:self-organize",
        "commit:law:self-organize",
    ]);
    assert.equal(run.autonomousContinuation?.emergenceAssessments[0]?.status, "emerged");
    assert.deepEqual(run.autonomousContinuation?.emergenceAssessments[0]?.causedByEventIds, [
        "law:condense",
        "law:self-organize",
    ]);
    assert.equal(run.autonomousContinuation?.order.universalClock, false);
    assert.equal(run.autonomousContinuation?.order.createsHistoryArrow, true);
});

test("a counterfactual can suppress one enabled event while retaining the same law program", () => {
    const program = fieldProgram();
    const factual = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const counterfactual = realizeAnchoredCausalWorld(program, {
        worldWillEnabled: false,
        counterfactualInternalEventAblationLawIds: ["self-organize"],
    });
    const continuation = counterfactual.autonomousContinuation!;

    assert.equal(counterfactual.status, "stable");
    assert.equal(counterfactual.programDigest, factual.programDigest);
    assert.equal("internalEventAblations" in factual.autonomousContinuation!, false);
    assert.ok(program.world.internalLaws.some((law) => law.id === "self-organize"));
    assert.equal(continuation.realizedEventIds.includes("law:self-organize"), false);
    assert.equal(continuation.historyCommits.length, 0);
    assert.deepEqual(continuation.internalEventAblations, [{
        id: "ablation:law:self-organize",
        kind: "internal-event-nonrealization",
        lawId: "self-organize",
        worldId: "field-world",
        wouldHaveEventId: "law:self-organize",
        guardEvidenceSubjectId: "autonomous:frontier:1:self-organize:organize-when-condensed",
        frontierIndex: 1,
        causes: ["law:condense"],
        lawRetainedInProgram: true,
        effectsSuppressed: true,
    }]);

    const unknown = realizeAnchoredCausalWorld(program, {
        counterfactualInternalEventAblationLawIds: ["self-organzie"],
    });
    assert.equal(unknown.status, "contradicted");
    assert.match(unknown.reason ?? "", /unknown counterfactual internal-event ablation law/);
});

test("World Will changes a condition through an anchor and the world responds by its own law", () => {
    const run = realizeAnchoredCausalWorld(fieldProgram());
    const world = selectedWorld(run);
    const selected = run.continuations.find((continuation) => run.selectedContinuationIds.includes(continuation.id));

    assert.equal(run.status, "realized");
    assert.deepEqual(world?.fields.condition, exact.integer(1));
    assert.deepEqual(world?.fields.coherence, exact.integer(3));
    assert.deepEqual(world?.fields.viability, exact.integer(6));
    const intervention = selected?.trace.find((entry) => entry.kind === "world-will-intervention");
    assert.deepEqual(intervention?.effects.map((effect) => effect.fieldId).sort(), ["condition", "viability"]);
    const viabilityEffect = intervention?.effects.find((effect) => effect.fieldId === "viability");
    assert.equal(viabilityEffect?.layer, "intrinsic-viability");
    assert.deepEqual(viabilityEffect?.before, exact.integer(1));
    assert.deepEqual(viabilityEffect?.operand, exact.integer(3));
    assert.deepEqual(viabilityEffect?.after, exact.integer(4));
    assert.ok(selected?.trace.some((entry) => entry.kind === "internal-law" && entry.lawId === "respond-to-condition"
        && entry.effects.some((effect) => effect.fieldId === "coherence")));
});

test("a candidate that breaks post-state anchor identity is inadmissible", () => {
    const program = fieldProgram();
    program.world.formal.families.push({
        id: "identity-condition-zero",
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind: "boolean",
        parameters: [{ name: "condition", valueKind: "rational" }],
        body: term.binary("equal", term.parameter("condition"), term.value(exact.integer(0))),
    });
    program.world.anchors[0]!.identityPredicateFamilyIds = ["identity-condition-zero"];
    program.execution.anchorIdentity = [{
        id: "field-anchor-condition-identity",
        anchorId: "field-anchor",
        query: { familyId: "identity-condition-zero", at: { coordinate: "0" }, parameters: {} },
        fieldParameters: [{ parameterName: "condition", worldId: "field-world", fieldId: "condition" }],
    }];

    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "stable");
    assert.equal(run.candidateAssessments[0]?.status, "inadmissible");
    assert.ok(run.candidateAssessments[0]?.reasons.some((reason) => reason.includes("post-state anchor 'field-anchor'")));
    assert.deepEqual(run.selectedContinuationIds, ["continuation:autonomous"]);
});

test("stabilize scores exact distance from an explicit target", () => {
    const program = fieldProgram();
    program.world.worldWill.objectives[0]!.direction = "stabilize";
    program.world.worldWill.objectives[0]!.targetValue = exact.integer(2);

    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "stable");
    assert.equal(run.candidateAssessments[0]?.status, "rejected");
    assert.deepEqual(run.baselineScore, exact.integer(0));
});

test("unknown anchor cuts and field overrides fail instead of being silently ignored", () => {
    const badAnchor = realizeAnchoredCausalWorld(fieldProgram(), { cutAnchorIds: ["field-anchro"] });
    assert.equal(badAnchor.status, "contradicted");
    assert.match(badAnchor.reason ?? "", /unknown cut anchor/);

    const badField = realizeAnchoredCausalWorld(fieldProgram(), {
        fieldOverrides: { "field-world.coherrence": exact.integer(99) },
    });
    assert.equal(badField.status, "contradicted");
    assert.match(badField.reason ?? "", /unknown field override/);
});

test("commuting same-frontier effects preserve every direct co-cause", () => {
    const program = fieldProgram();
    program.world.worldWill.interventions = [];
    program.execution.interventionCosts = [];
    program.world.formal.families.push({
        id: "density-is-three",
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind: "boolean",
        parameters: [{ name: "density", valueKind: "rational" }],
        body: term.binary("equal", term.parameter("density"), term.value(exact.integer(3))),
    });
    const parallelGuard = structuredClone(program.world.internalLaws[0]!.guard);
    parallelGuard.id = "parallel-density-guard";
    program.world.internalLaws.push({
        id: "a-parallel-density",
        worldId: "field-world",
        guard: parallelGuard,
        effects: [{ fieldId: "density", operation: "add", value: exact.integer(2) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    }, {
        id: "after-dual-density",
        worldId: "field-world",
        guard: {
            id: "after-dual-density-guard",
            query: { familyId: "density-is-three", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [{ parameterName: "density", worldId: "field-world", fieldId: "density" }],
        },
        effects: [{ fieldId: "positive", operation: "add", value: exact.integer(1) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });

    const run = realizeAnchoredCausalWorld(program);
    const downstream = run.autonomousContinuation?.trace.find((entry) => entry.lawId === "after-dual-density");
    assert.deepEqual(downstream?.causes, ["law:a-parallel-density", "law:condense"]);
});

test("intervention search respects its bound without materializing the full power set", () => {
    const program = fieldProgram();
    program.world.worldWill.interventions = Array.from({ length: 30 }, (_, index) => ({
        id: `bounded-intervention-${String(index).padStart(2, "0")}`,
        targetWorldId: "field-world",
        anchorId: "field-anchor",
        kind: "condition" as const,
        effects: [{ fieldId: "viability", operation: "add" as const, value: exact.integer(1) }],
    }));
    program.execution.interventionCosts = program.world.worldWill.interventions.map((intervention) => ({
        interventionId: intervention.id,
        cost: exact.integer(1),
    }));

    const run = realizeAnchoredCausalWorld(program, { maxInterventionCombinations: 1 });
    assert.equal(run.status, "underdetermined");
    assert.equal(run.resourceUse.interventionCombinationCount, 1);
    assert.equal(run.resourceUse.exhaustiveInterventionSearch, false);
    assert.deepEqual(run.unresolvedAlternativeIds, ["intervention-search:not-exhaustive"]);
});

test("simultaneously enabled non-commuting laws remain underdetermined instead of using host order", () => {
    const program = fieldProgram();
    program.world.internalLaws.push({
        id: "competing-condensation",
        worldId: "field-world",
        guard: structuredClone(program.world.internalLaws[0]!.guard),
        effects: [{ fieldId: "coherence", operation: "set", value: exact.integer(7) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    program.world.internalLaws.at(-1)!.guard.id = "competing-condensation-guard";

    const run = realizeAnchoredCausalWorld(program);
    assert.equal(run.status, "underdetermined");
    assert.match(run.reason ?? "", /non-commuting set effects/);
    assert.deepEqual(run.unresolvedAlternativeIds, ["law:competing-condensation", "law:condense"]);
});

test("maximal commuting frontiers become endogenous plural worlds without a host selector", () => {
    const program = fieldProgram();
    program.execution.internalConflictMode = "maximal-commuting-branches";
    program.world.internalLaws.push({
        id: "competing-condensation",
        worldId: "field-world",
        guard: structuredClone(program.world.internalLaws[0]!.guard),
        effects: [{ fieldId: "coherence", operation: "set", value: exact.integer(7) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    program.world.internalLaws.at(-1)!.guard.id = "competing-condensation-guard";

    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const autonomous = run.autonomousContinuations!;
    assert.equal(run.status, "plural");
    assert.equal(run.autonomousContinuation, undefined);
    assert.equal(autonomous.length, 2);
    assert.deepEqual(run.selectedContinuationIds, autonomous.map((continuation) => continuation.id));
    assert.ok(autonomous.every((continuation) => (
        continuation.selection === "autonomous-plural"
        && continuation.interventionIds.length === 0
        && continuation.branchLineage?.length === 1
        && continuation.branchLineage?.[0]?.derivation === "maximal-commuting-frontier"
        && continuation.branchLineage?.[0]?.hostSelection === false
    )));
    assert.deepEqual(
        autonomous.map((continuation) => continuation.branchLineage?.[0]?.realizedLawIds),
        [["competing-condensation"], ["condense"]],
    );
    assert.deepEqual(
        autonomous.map((continuation) => continuation.branchLineage?.[0]?.nonrealizedLawIds),
        [["condense"], ["competing-condensation"]],
    );
    assert.deepEqual(
        autonomous.map((continuation) => continuation.worldStates[0]?.fields.coherence),
        [exact.integer(7), exact.integer(2)],
    );
});

test("every maximal branch retains laws commuting with all conflicting alternatives", () => {
    const program = fieldProgram();
    program.execution.internalConflictMode = "maximal-commuting-branches";
    program.world.internalLaws.push({
        id: "competing-condensation",
        worldId: "field-world",
        guard: structuredClone(program.world.internalLaws[0]!.guard),
        effects: [{ fieldId: "coherence", operation: "set", value: exact.integer(7) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    }, {
        id: "shared-positive-gradient",
        worldId: "field-world",
        guard: structuredClone(program.world.internalLaws[0]!.guard),
        effects: [{ fieldId: "positive", operation: "add", value: exact.integer(1) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    program.world.internalLaws.at(-2)!.guard.id = "competing-condensation-guard";
    program.world.internalLaws.at(-1)!.guard.id = "shared-positive-gradient-guard";

    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    assert.equal(run.status, "plural");
    assert.deepEqual(
        run.autonomousContinuations!.map((continuation) => continuation.branchLineage?.[0]?.realizedLawIds),
        [
            ["competing-condensation", "shared-positive-gradient"],
            ["condense", "shared-positive-gradient"],
        ],
    );
    assert.ok(run.autonomousContinuations!.every((continuation) => (
        continuation.realizedEventIds.includes("law:shared-positive-gradient")
    )));
});

test("identical set projections commute and do not fabricate a branch", () => {
    const program = fieldProgram();
    program.execution.internalConflictMode = "maximal-commuting-branches";
    for (const suffix of ["a", "b"]) {
        const guard = structuredClone(program.world.internalLaws[0]!.guard);
        guard.id = `same-condition-guard-${suffix}`;
        program.world.internalLaws.push({
            id: `same-condition-${suffix}`,
            worldId: "field-world",
            guard,
            effects: [{ fieldId: "condition", operation: "set", value: exact.integer(1) }],
            application: "once-per-realization",
            reversibility: "irreversible",
        });
    }

    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    assert.equal(run.status, "stable");
    assert.equal(run.resourceUse.internalBranchCount, 0);
    assert.equal(run.autonomousContinuation?.branchLineage, undefined);
    assert.deepEqual(run.autonomousContinuation?.order.evaluationFrontiers[0], [
        "law:condense",
        "law:same-condition-a",
        "law:same-condition-b",
    ]);
});

test("an insufficient internal branch budget preserves no arbitrary partial choice", () => {
    const program = fieldProgram();
    program.execution.internalConflictMode = "maximal-commuting-branches";
    program.world.internalLaws.push({
        id: "competing-condensation",
        worldId: "field-world",
        guard: structuredClone(program.world.internalLaws[0]!.guard),
        effects: [{ fieldId: "coherence", operation: "set", value: exact.integer(7) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    program.world.internalLaws.at(-1)!.guard.id = "competing-condensation-guard";

    const run = realizeAnchoredCausalWorld(program, {
        worldWillEnabled: false,
        maxInternalBranches: 1,
    });
    assert.equal(run.status, "underdetermined");
    assert.match(run.reason ?? "", /branch budget exhausted/);
    assert.deepEqual(run.selectedContinuationIds, []);
    assert.equal(run.resourceUse.exhaustiveInternalBranching, false);
    assert.equal(run.resourceUse.internalBranchCount, 0);
});

test("World Will evaluates a branching intervention as a set and preserves every selected outcome", () => {
    const program = fieldProgram();
    program.execution.internalConflictMode = "maximal-commuting-branches";
    const competingResponse = structuredClone(program.world.internalLaws.find((law) => law.id === "respond-to-condition")!);
    competingResponse.id = "alternate-condition-response";
    competingResponse.guard.id = "alternate-response-after-organization";
    competingResponse.effects = [{
        fieldId: "coherence",
        operation: "set",
        value: exact.integer(9),
    }];
    program.world.internalLaws.push(competingResponse);

    const run = realizeAnchoredCausalWorld(program);
    const candidate = run.candidateAssessments[0];
    assert.equal(run.status, "plural");
    assert.equal(candidate?.status, "improved");
    assert.deepEqual(candidate?.improvement, exact.integer(2));
    assert.equal(candidate?.outcomes?.length, 2);
    assert.equal(run.selectedContinuationIds.length, 2);
    assert.ok(run.continuations
        .filter((continuation) => run.selectedContinuationIds.includes(continuation.id))
        .every((continuation) => (
            continuation.selection === "selected-plural"
            && continuation.interventionIds.includes("alter-boundary-condition")
            && continuation.branchLineage?.length === 1
        )));
    assert.deepEqual(
        candidate?.outcomes?.map((outcome) => outcome.score),
        [exact.integer(5), exact.integer(6)],
    );
});

test("World-Will-disabled closure cannot inherit plural intervention paths", () => {
    const program = fieldProgram();
    program.world.formal.families.push({
        id: "viability-at-most-five",
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind: "boolean",
        parameters: [{ name: "viability", valueKind: "rational" }],
        body: term.binary(
            "less-than-or-equal",
            term.parameter("viability"),
            term.value(exact.integer(5)),
        ),
    });
    program.execution.hardConstraints = [{
        id: "bounded-intervention-viability",
        query: { familyId: "viability-at-most-five", at: { coordinate: "0" }, parameters: {} },
        fieldParameters: [{ parameterName: "viability", worldId: "field-world", fieldId: "viability" }],
    }];
    program.world.worldWill.hardConstraintFamilyIds = ["viability-at-most-five"];
    program.world.worldWill.interventions = ["left", "right"].map((suffix) => ({
        id: `alter-boundary-condition-${suffix}`,
        targetWorldId: "field-world",
        anchorId: "field-anchor",
        kind: "condition" as const,
        effects: [{ fieldId: "viability", operation: "add" as const, value: exact.integer(3) }],
    }));
    program.execution.interventionCosts = program.world.worldWill.interventions.map((candidate) => ({
        interventionId: candidate.id,
        cost: exact.integer(1),
    }));
    program.execution.decisionMode = "plural";

    const factual = realizeAnchoredCausalWorld(program);
    assert.equal(factual.status, "plural", JSON.stringify({
        baselineScore: factual.baselineScore,
        candidates: factual.candidateAssessments,
    }, null, 2));
    assert.equal(factual.selectedContinuationIds.length, 2);

    const autonomous = realizeAnchoredCausalWorld(program, {
        worldWillEnabled: false,
        cutAnchorIds: ["field-anchor"],
    });
    assert.equal(autonomous.status, "stable");
    assert.deepEqual(autonomous.selectedContinuationIds, ["continuation:autonomous"]);
    assert.equal(autonomous.continuations.length, 1);
    assert.deepEqual(autonomous.autonomousContinuation?.interventionIds, []);
});

test("a bounded formal query reports unresolved closure rather than inventing a transition", () => {
    const run = realizeAnchoredCausalWorld(fieldProgram(), { evaluationBudgetPerQuery: 1 });
    assert.equal(run.status, "underdetermined");
    assert.match(run.reason ?? "", /guards are unresolved/);
    assert.equal(run.autonomousContinuation?.realizedEventIds.length, 0);
});

test("inspection and replay preserve generic emergence and exact selected continuations", () => {
    const record = recordAnchoredCausalReplay(fieldProgram());
    const replay = replayAnchoredCausalRecord(record);
    const inspection = inspectAnchoredCausalRun(record.recordedRun);

    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.selectedContinuationsPreserved, true);
    assert.equal(replay.unresolvedAlternativesPreserved, true);
    assert.equal(replay.emergencePreserved, true);
    assert.equal(replay.recordIntegrityValid, true);
    assert.equal(replay.fullRunPreserved, true);
    assert.equal(inspection.summary.emergedStructureCount, 1);
    assert.equal(inspection.summary.createsHistoryArrow, true);
    assert.equal(inspection.summary.exhaustiveInterventionSearch, true);
});

test("inspection and replay preserve endogenous branch lineage and exhaustive plurality", () => {
    const program = fieldProgram();
    program.execution.internalConflictMode = "maximal-commuting-branches";
    program.world.internalLaws.push({
        id: "competing-condensation",
        worldId: "field-world",
        guard: structuredClone(program.world.internalLaws[0]!.guard),
        effects: [{ fieldId: "coherence", operation: "set", value: exact.integer(7) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    program.world.internalLaws.at(-1)!.guard.id = "competing-condensation-guard";

    const record = recordAnchoredCausalReplay(program, { worldWillEnabled: false });
    const replay = replayAnchoredCausalRecord(record);
    const inspection = inspectAnchoredCausalRun(record.recordedRun);

    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.fullRunPreserved, true);
    assert.equal(replay.selectedContinuationsPreserved, true);
    assert.equal(inspection.summary.status, "plural");
    assert.equal(inspection.summary.selectedContinuationCount, 2);
    assert.equal(inspection.summary.exhaustiveInternalBranching, true);
    assert.equal(record.recordedRun.resourceUse.internalBranchCount, 2);
    assert.ok(record.recordedRun.autonomousContinuations!.every((continuation) => (
        continuation.branchLineage?.[0]?.hostSelection === false
    )));
});

test("replay rejects a stored run whose recorded digest no longer matches its content", () => {
    const record = recordAnchoredCausalReplay(fieldProgram());
    const selected = record.recordedRun.continuations.find((continuation) => (
        record.recordedRun.selectedContinuationIds.includes(continuation.id)
    ))!;
    selected.worldStates[0]!.fields.condition = exact.integer(999);

    const replay = replayAnchoredCausalRecord(record);
    assert.equal(replay.status, "reexecution-drift");
    assert.equal(replay.recordIntegrityValid, false);
    assert.equal(replay.fullRunPreserved, false);
});
