import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
    exact,
    inspectAnchoredNarrativeRun,
    realizeAnchoredNarrativeWorld,
    recordAnchoredNarrativeWorld,
    replayAnchoredNarrativeWorld,
    term,
    validateExecutableNarrativeProgram,
    type ExecutableAnchoredNarrativeProgram,
} from "../../src/bubbles/world-kernel";
import anchoredGarden from "../../examples/anchored-garden.world.json";

function executableGarden(): ExecutableAnchoredNarrativeProgram {
    return structuredClone(anchoredGarden) as ExecutableAnchoredNarrativeProgram;
}

function stateField(run: ReturnType<typeof realizeAnchoredNarrativeWorld>, fieldId: string) {
    return run.continuations[0]?.worldStates[0]?.fields[fieldId];
}

test("the connected runtime realizes autonomous action, sea coupling, anchored intervention, story, and history", () => {
    const program = executableGarden();
    assert.deepEqual(validateExecutableNarrativeProgram(program), []);

    const run = realizeAnchoredNarrativeWorld(program);

    assert.equal(run.status, "realized");
    assert.deepEqual(run.selectedContinuationIds, ["continuation:offer-path"]);
    assert.deepEqual(run.autonomousContinuation?.realizedEventIds, ["aria-explores"]);
    assert.deepEqual(run.continuations[0]?.realizedEventIds, [
        "aria-explores",
        "aria-tends",
        "garden-remembers",
        "path-is-found",
        "will-offers-path",
    ]);
    assert.deepEqual(stateField(run, "story"), exact.symbol("path-found"));
    assert.deepEqual(stateField(run, "aria-choice"), exact.symbol("tend"));
    assert.deepEqual(stateField(run, "viability"), exact.integer(8));
    assert.equal(run.continuations[0]?.order.universalClock, false);
    assert.deepEqual(run.continuations[0]?.order.reversibleEventIds, ["aria-explores"]);
    assert.equal(run.continuations[0]?.order.createsHistoryArrow, true);
    assert.equal(run.continuations[0]?.historyCommits.length, 1);
    assert.ok(run.continuations[0]?.trace.some((entry) => entry.kind === "world-will-intervention"
        && entry.anchorId === "garden-anchor"));
});

test("disabled World Will and a cut anchor preserve the autonomous protagonist story without intervention", () => {
    for (const options of [
        { worldWillEnabled: false },
        { cutAnchorIds: ["garden-anchor"] },
    ]) {
        const run = realizeAnchoredNarrativeWorld(executableGarden(), options);
        assert.equal(run.status, "blocked");
        assert.deepEqual(run.selectedContinuationIds, ["continuation:baseline"]);
        assert.deepEqual(run.continuations[0]?.realizedEventIds, ["aria-explores"]);
        assert.deepEqual(stateField(run, "story"), exact.symbol("opening"));
        assert.deepEqual(stateField(run, "viability"), exact.integer(5));
        assert.equal(run.continuations[0]?.order.createsHistoryArrow, false);
    }
});

test("negative-sea pressure materially changes exact viability and remains visible in the trace", () => {
    const normal = realizeAnchoredNarrativeWorld(executableGarden(), { worldWillEnabled: false });
    const pressured = realizeAnchoredNarrativeWorld(executableGarden(), {
        worldWillEnabled: false,
        fieldOverrides: { "garden-world.negative": exact.integer(10) },
    });

    assert.deepEqual(stateField(normal, "viability"), exact.integer(5));
    assert.deepEqual(stateField(pressured, "viability"), exact.integer(-4));
    assert.ok(pressured.continuations[0]?.trace.some((entry) => entry.kind === "sea-coupling"
        && entry.effects.some((effect) => effect.after.kind === "rational" && effect.after.numerator === "-4")));
});

test("conflicting objectives reject a locally attractive intervention after global scoring", () => {
    const program = executableGarden();
    program.world.worldWill.objectives.push({
        id: "minimize-negative-pressure",
        targetWorldId: "garden-world",
        fieldId: "negative",
        direction: "minimize",
        weight: exact.integer(5),
    });
    program.eventTransitions.find((transition) => transition.eventId === "will-offers-path")?.effects.push({
        fieldId: "negative",
        operation: "add",
        value: exact.integer(1),
    });

    const run = realizeAnchoredNarrativeWorld(program);
    assert.equal(run.status, "stable");
    assert.equal(run.candidateAssessments[0]?.status, "rejected");
    assert.deepEqual(run.selectedContinuationIds, ["continuation:baseline"]);
});

test("hard constraints bind to the post-intervention world instead of acting as static flags", () => {
    const program = executableGarden();
    const constraintFamily = program.world.formal.families.find((family) => family.id === "will-constraint")!;
    constraintFamily.parameters = [{ name: "current_viability", valueKind: "rational" }];
    constraintFamily.body = term.binary(
        "greater-than",
        term.parameter("current_viability"),
        term.value(exact.integer(100)),
    );
    program.worldWillExecution.hardConstraints[0]!.fieldParameters = [{
        parameterName: "current_viability",
        worldId: "garden-world",
        fieldId: "viability",
    }];

    assert.deepEqual(validateExecutableNarrativeProgram(program), []);
    const run = realizeAnchoredNarrativeWorld(program);

    assert.equal(run.status, "stable");
    assert.equal(run.candidateAssessments[0]?.status, "inadmissible");
    assert.deepEqual(run.candidateAssessments[0]?.reasons, ["hard-constraint-failed:identity-must-hold"]);
    assert.ok(run.formalEvidence.some((entry) => entry.subjectId === "candidate:offer-path:identity-must-hold"
        && entry.value?.kind === "boolean" && entry.value.value === false));
});

function addEqualAlternative(program: ExecutableAnchoredNarrativeProgram): void {
    program.world.worldWill.interventions.push({
        id: "offer-other-path",
        targetWorldId: "garden-world",
        anchorId: "garden-anchor",
        kind: "signal",
        targetFieldId: "opportunity",
    });
    program.world.causalEvents.push({
        id: "will-offers-other-path",
        kind: "world-will-intervention",
        worldId: "garden-world",
        causes: ["aria-explores"],
        interventionId: "offer-other-path",
    });
    program.eventTransitions.push({
        eventId: "will-offers-other-path",
        reversibility: "irreversible",
        effects: [
            { fieldId: "opportunity", operation: "set", value: exact.integer(1) },
            { fieldId: "viability", operation: "add", value: exact.integer(3) },
        ],
    });
    program.worldWillExecution.interventionCosts.push({ interventionId: "offer-other-path", cost: exact.integer(1) });
}

test("deterministic ties remain underdetermined and plural mode preserves both worlds", () => {
    const deterministic = executableGarden();
    addEqualAlternative(deterministic);
    const unresolved = realizeAnchoredNarrativeWorld(deterministic);
    assert.equal(unresolved.status, "underdetermined");
    assert.equal(unresolved.continuations.length, 2);
    assert.equal(unresolved.selectedContinuationIds.length, 0);
    assert.equal(unresolved.unresolvedAlternativeIds.length, 2);
    assert.ok(unresolved.candidateAssessments.some((candidate) => candidate.status === "inadmissible"
        && candidate.reasons.includes("non-commuting-field-effects")));

    const plural = executableGarden();
    addEqualAlternative(plural);
    plural.worldWillExecution.decisionMode = "plural";
    const pluralRun = realizeAnchoredNarrativeWorld(plural);
    assert.equal(pluralRun.status, "plural");
    assert.equal(pluralRun.selectedContinuationIds.length, 2);
    assert.ok(pluralRun.continuations.every((continuation) => continuation.selection === "selected-plural"));
});

test("bounded computation reports an unresolved search instead of choosing a convenient intervention", () => {
    const program = executableGarden();
    addEqualAlternative(program);
    const run = realizeAnchoredNarrativeWorld(program, { maxInterventionCombinations: 2 });

    assert.equal(run.status, "underdetermined");
    assert.equal(run.resourceUse.exhaustiveInterventionSearch, false);
    assert.equal(run.selectedContinuationIds.length, 0);
    assert.equal(run.unresolvedAlternativeIds.length, 2);
});

test("inspection and deterministic replay preserve identity, causes, and unresolved alternatives", () => {
    const program = executableGarden();
    addEqualAlternative(program);
    const record = recordAnchoredNarrativeWorld(program);
    const replay = replayAnchoredNarrativeWorld(record);
    const inspection = inspectAnchoredNarrativeRun(record.recordedRun, { worldId: "garden-world" });

    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.selectedContinuationsPreserved, true);
    assert.equal(replay.unresolvedAlternativesPreserved, true);
    assert.equal(inspection.summary.status, "underdetermined");
    assert.equal(inspection.summary.unresolvedAlternativeCount, 2);
    assert.ok(inspection.continuations.every((continuation) => continuation.worldStates.length === 1));
});

test("runtime semantics contain no example-specific protagonist or branch", () => {
    const runtimeSource = readFileSync(resolve(process.cwd(), "src/bubbles/world-kernel/narrative-runtime.ts"), "utf8");
    for (const exampleName of ["aria", "garden-world", "offer-path", "path-found"]) {
        assert.equal(runtimeSource.includes(exampleName), false, `runtime must not hard-code '${exampleName}'`);
    }
});
