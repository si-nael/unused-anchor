import assert from "node:assert/strict";
import test from "node:test";
import { BubbleCompilerError, compileBubbleSource } from "../../src/bubbles/language";
import {
    inspectBubbleProgram,
    materializeBubbleProgram,
    planBubbleProgram,
    recordBubbleProgram,
    replayBubbleRecord,
    type BubbleEffectTraceEvidenceRecord,
    type BubbleSelfRealizationEvidenceRecord,
} from "../../src/bubbles/runtime";

const reversibleGardenSource = [
    "bubble ReversibleGarden {",
    "  realization deterministic",
    "  axiom coherence = stable",
    "  will realization.reversibility = \"reversible\"",
    "  seed garden_seed",
    "  anchor identity = axiom.coherence = \"stable\"",
    "  state phase = \"latent\"",
    "  effect observe required",
    "  transform Awaken reversible state phase from \"latent\" to \"manifest\" inverse Rest via observe",
    "  transform Rest reversible state phase from \"manifest\" to \"latent\" inverse Awaken via observe",
    "}",
].join("\n");

test("world will realizes a reversible transition without inventing universal time or history", () => {
    const { program, diagnostics } = compileBubbleSource(reversibleGardenSource, {
        sourcePath: "reversible-garden.bubble",
    });
    const plan = planBubbleProgram(program);

    assert.deepEqual(diagnostics, []);
    assert.equal(program.profile, "bubbles.v0.5");
    assert.equal(program.version, "0.5.0");
    assert.deepEqual(program.bubble.stateVariables.map((state) => [state.name, state.initialValue]), [["phase", "latent"]]);
    assert.deepEqual(
        program.bubble.transformations.map((transform) => [
            transform.name,
            transform.reversibility,
            transform.stateName,
            transform.fromValue,
            transform.toValue,
            transform.inverseName,
            transform.effectKind,
        ]),
        [
            ["Awaken", "reversible", "phase", "latent", "manifest", "Rest", "observe"],
            ["Rest", "reversible", "phase", "manifest", "latent", "Awaken", "observe"],
        ],
    );
    assert.equal(plan.selfRealization?.status, "realized");
    assert.equal(plan.selfRealization?.clockAssumption, "no-universal-clock");
    assert.deepEqual(plan.selfRealization?.selectedCandidateIds, ["candidate:transform:9:Awaken"]);
    assert.deepEqual(plan.selfRealization?.continuations[0]?.state, { phase: "manifest" });
    assert.equal(plan.selfRealization?.continuations[0]?.reversibility, "reversible");
    assert.equal(plan.selfRealization?.continuations[0]?.ordering, "causal");
    assert.equal(plan.selfRealization?.continuations[0]?.createsHistoryArrow, false);

    const resumed = planBubbleProgram(program, {
        selfRealizationResume: {
            mode: "bubble-self-realization-resume.v1",
            bubbleAddressId: program.bubble.address.id,
            sourceContinuationId: plan.selfRealization?.continuations[0]?.continuationId ?? "missing",
            state: plan.selfRealization?.continuations[0]?.state ?? {},
        },
    });

    assert.equal(resumed.selfRealization?.stateSource, "resumed-continuation");
    assert.deepEqual(resumed.selfRealization?.selectedCandidateIds, ["candidate:transform:10:Rest"]);
    assert.deepEqual(resumed.selfRealization?.continuations[0]?.state, { phase: "latent" });
    assert.equal(resumed.selfRealization?.continuations[0]?.createsHistoryArrow, false);
});

test("an irreversible commit selected by world will creates the history arrow and linked evidence", () => {
    const source = [
        "bubble MemorySeal {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will realization.name = \"Seal\"",
        "  seed memory_seed",
        "  anchor identity = axiom.coherence = \"stable\"",
        "  state memory = \"open\"",
        "  effect commit required",
        "  transform Seal irreversible state memory from \"open\" to \"sealed\" via commit",
        "}",
    ].join("\n");
    const { program } = compileBubbleSource(source, { sourcePath: "memory-seal.bubble" });
    const result = materializeBubbleProgram(program);
    const realizationEvidence = result.evidence.find(
        (entry): entry is BubbleSelfRealizationEvidenceRecord => entry.kind === "self-realization",
    );
    const commitTrace = result.evidence.find(
        (entry): entry is BubbleEffectTraceEvidenceRecord => entry.kind === "effect-trace" && entry.effectKind === "commit",
    );

    assert.equal(result.selfRealization?.status, "realized");
    assert.equal(result.selfRealization?.continuations[0]?.ordering, "committed-history");
    assert.equal(result.selfRealization?.continuations[0]?.createsHistoryArrow, true);
    assert.equal(result.commits.length, 1);
    assert.equal(result.commits[0]?.committedAddressId, program.bubble.address.id);
    assert.equal(realizationEvidence?.createsHistoryArrow, true);
    assert.equal(realizationEvidence?.selectedTransformationIds[0], "transform:9:Seal");
    assert.equal(commitTrace?.materializationState, "materialized");
    assert.ok(commitTrace?.causalLinks.some((link) => link.targetKind === "self-realization"));
    assert.ok(result.proof.claims.some(
        (claim) => claim.kind === "self-realization"
            && claim.status === "certified"
            && claim.scope === "materialized-run"
            && claim.evidenceIds?.includes(realizationEvidence?.id ?? "missing"),
    ));
});

for (const [mode, expectedStatus, expectedContinuations] of [
    ["deterministic", "underdetermined", 0],
    ["nondeterministic", "plural", 2],
] as const) {
    test(`${mode} world will preserves the correct meaning of multiple admitted continuations`, () => {
        const source = [
            `bubble ForkingField {`,
            `  realization ${mode}`,
            "  axiom coherence = stable",
            "  will realization.kind = \"transform\"",
            "  seed fork_seed",
            "  anchor identity = axiom.coherence = \"stable\"",
            "  state hue = \"clear\"",
            "  effect perturb required",
            "  transform Red irreversible state hue from \"clear\" to \"red\" via perturb",
            "  transform Blue irreversible state hue from \"clear\" to \"blue\" via perturb",
            "}",
        ].join("\n");
        const { program } = compileBubbleSource(source, { sourcePath: `${mode}-fork.bubble` });
        const plan = planBubbleProgram(program);

        assert.equal(plan.selfRealization?.status, expectedStatus);
        assert.equal(plan.selfRealization?.continuations.length, expectedContinuations);
        assert.equal(plan.selfRealization?.continuations.some((continuation) => continuation.createsHistoryArrow), false);
    });
}

test("v0.5 rejects descriptive will and malformed reversible contracts", () => {
    const descriptiveWill = [
        "bubble UnruledState {",
        "  axiom coherence = stable",
        "  will \"choose organically\"",
        "  seed state_seed",
        "  state phase = \"latent\"",
        "  effect perturb required",
        "  transform Awaken irreversible state phase from \"latent\" to \"manifest\" via perturb",
        "}",
    ].join("\n");
    const brokenInverse = [
        "bubble BrokenCycle {",
        "  axiom coherence = stable",
        "  will realization.kind = \"transform\"",
        "  seed state_seed",
        "  state phase = \"latent\"",
        "  effect perturb required",
        "  transform Awaken reversible state phase from \"latent\" to \"manifest\" inverse Rest via perturb",
        "  transform Rest reversible state phase from \"manifest\" to \"latent\" inverse Missing via perturb",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(descriptiveWill, { sourcePath: "unruled-state.bubble" }),
        (error: unknown) => error instanceof BubbleCompilerError
            && error.diagnostics.some((diagnostic) => diagnostic.code === "BBL224"),
    );
    assert.throws(
        () => compileBubbleSource(brokenInverse, { sourcePath: "broken-cycle.bubble" }),
        (error: unknown) => error instanceof BubbleCompilerError
            && error.diagnostics.some((diagnostic) => diagnostic.code === "BBL228"),
    );
});

test("one admitted path satisfies a shared required effect without making rejected alternatives contradictory", () => {
    const source = [
        "bubble DirectedField {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will realization.name = \"Red\"",
        "  seed directed_seed",
        "  state hue = \"clear\"",
        "  effect perturb required",
        "  transform Red irreversible state hue from \"clear\" to \"red\" via perturb",
        "  transform Blue irreversible state hue from \"clear\" to \"blue\" via perturb",
        "}",
    ].join("\n");
    const { program } = compileBubbleSource(source, { sourcePath: "directed-field.bubble" });
    const plan = planBubbleProgram(program);

    assert.equal(plan.selfRealization?.status, "realized");
    assert.deepEqual(plan.selfRealization?.obligationConflicts, []);
    assert.deepEqual(plan.selfRealization?.selectedCandidateIds, ["candidate:transform:8:Red"]);
});

test("inspection and stored replay preserve the same self-realization frontier", () => {
    const { program } = compileBubbleSource(reversibleGardenSource, {
        sourcePath: "reversible-garden-replay.bubble",
    });
    const inspected = inspectBubbleProgram(program);
    const replayed = replayBubbleRecord(recordBubbleProgram(program));

    assert.equal(inspected.summary.selfRealizationStatus, "realized");
    assert.equal(inspected.summary.selfRealizationContinuationCount, 1);
    assert.equal(inspected.summary.selfRealizationCreatesHistoryArrow, false);
    assert.deepEqual(replayed.selfRealization, inspected.selfRealization);
    assert.deepEqual(replayed.summary, inspected.summary);
});
