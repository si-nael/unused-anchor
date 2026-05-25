import assert from "node:assert/strict";
import test from "node:test";
import { compileBubbleSource } from "../../src/bubbles/language";
import {
    inspectBubbleProgram,
    recordBubbleProgram,
    replayBubbleRecord,
} from "../../src/bubbles/runtime";

test("records a materialized bubble into a replayable run bundle", () => {
    const source = [
        "bubble Archive {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"preserve experiment history\"",
        "  seed archive_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  reflect self.address",
        "  reflect self.worldWill",
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "archive.bubble" });
    const record = recordBubbleProgram(program);

    assert.equal(record.mode, "bubble-replay.v1");
    assert.equal(record.sourcePath, "archive.bubble");
    assert.equal(record.bubbleName, "Archive");
    assert.equal(record.commitCount, 1);
    assert.equal(record.evidenceCount, 8);
    assert.equal(record.traceCount, 4);
    assert.equal(record.materialization.plan.proof.mode, "bubble-consistency-certificate.v1");
    assert.equal(record.materialization.plan.proof.verdict, "partially-certified");
    assert.equal(record.materialization.proof.mode, "bubble-consistency-certificate.v1");
    assert.equal(record.materialization.proof.verdict, "partially-certified");
    assert.equal(record.materialization.plan.bundle.mode, "bubble-bundle-plan.v1");
    assert.equal(record.materialization.plan.sourcePath, "archive.bubble");
    assert.deepEqual(record.materialization.evidence.map((entry) => entry.kind), [
        "negative-sea-state",
        "positive-sea-state",
        "anchor-point-state",
        "observation-context",
        "history-commit",
        "effect-trace",
        "effect-trace",
        "effect-trace",
    ]);
});

test("replay preserves inspection semantics for stored records", () => {
    const source = [
        "bubble Observatory {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"observe stored runs\"",
        "  seed observatory_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  reflect self.address",
        "  emit Sapling as artifact",
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "observatory-replay.bubble" });
    const live = inspectBubbleProgram(program);
    const record = recordBubbleProgram(program);
    const replayed = replayBubbleRecord(record);

    assert.deepEqual(replayed.summary, live.summary);
    assert.deepEqual(replayed.ontology, live.ontology);
    assert.deepEqual(replayed.semantics, live.semantics);
    assert.deepEqual(replayed.proof, live.proof);
    assert.deepEqual(replayed.bundle, live.bundle);
    assert.deepEqual(replayed.artifacts, live.artifacts);
    assert.deepEqual(replayed.commits, live.commits);
    assert.deepEqual(replayed.evidence, live.evidence);
    assert.deepEqual(replayed.observationStates, live.observationStates);
    assert.deepEqual(replayed.trace, live.trace);

    const descendantEmission = replayed.plan.emissionPlan.find((emission) => emission.target === "descendant");
    assert.ok(descendantEmission);

    const byEmission = replayBubbleRecord(record, { emissionId: descendantEmission.emissionId });
    assert.equal(byEmission.summary.plannedEmissionCount, 1);
    assert.deepEqual(byEmission.bundle.members.map((member) => member.kind), [
        "root-bubble",
        "descendant-bubble",
    ]);
    assert.deepEqual(byEmission.artifacts.map((artifact) => artifact.target), ["descendant"]);

    const byKind = replayBubbleRecord(record, { kind: "materialization-committed" });
    assert.equal(byKind.trace.length, 2);
    assert.ok(byKind.trace.every((event) => event.kind === "materialization-committed"));
});

test("records and replays collapse-record evidence for observed latent regions", () => {
    const source = [
        "bubble ThresholdField {",
        "  axiom coherence = stable",
        "  will \"preserve partial law under observation\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect perturb optional",
        "  hidden region OuterCanopy",
        "  latent bubble WaitingArchive",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-replay-collapse.bubble" });
    const record = recordBubbleProgram(program);
    const replayed = replayBubbleRecord(record);
    const collapseEvidence = replayed.evidence.filter((entry) => entry.kind === "collapse-record");

    assert.equal(record.evidenceCount, 10);
    assert.deepEqual(record.materialization.evidence.map((entry) => entry.kind), [
        "negative-sea-state",
        "positive-sea-state",
        "anchor-point-state",
        "observation-context",
        "collapse-record",
        "collapse-record",
        "history-commit",
        "effect-trace",
        "effect-trace",
        "effect-trace",
    ]);
    assert.equal(collapseEvidence.length, 2);
    assert.deepEqual(collapseEvidence.map((entry) => entry.observationStateId), [
        "observation-state:latent-region:semantic:9:hidden-region:OuterCanopy",
        "observation-state:latent-region:semantic:10:latent-bubble:WaitingArchive",
    ]);
    assert.deepEqual(collapseEvidence.map((entry) => entry.observationState.phase), [
        "observed-committed",
        "observed-history-open",
    ]);
    assert.deepEqual(collapseEvidence.map((entry) => entry.observationState.localMaterialization?.realizedForm ?? null), [
        "boundary-canopy-edge",
        null,
    ]);
    assert.ok(replayed.trace.some((event) => event.kind === "local-collapse-materialized"));

    const claimById = Object.fromEntries(replayed.proof.claims.map((claim) => [claim.id, claim]));
    assert.equal(claimById["claim:replay-identity"]?.scope, "materialized-run");
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("collapse-record"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("observed-history-committed"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("observed-history-shape-partially-committed"));
    assert.ok(claimById["claim:replay-identity"]?.assumptions?.includes("observed-collapse-history-is-not-yet-committed"));
    assert.deepEqual(
        claimById["claim:replay-identity"]?.evidenceIds?.filter((entry) => entry.startsWith("evidence:collapse:")),
        [
            "evidence:collapse:semantic:9:hidden-region:OuterCanopy",
            "evidence:collapse:semantic:10:latent-bubble:WaitingArchive",
        ],
    );
});

test("records and replays committed benchmark local collapse history", () => {
    const source = [
        "bubble CollapseThreshold {",
        "  axiom coherence = stable",
        "  will \"fix one observed canopy edge into history\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect perturb optional",
        "  hidden region OuterCanopy",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-threshold-replay-commit.bubble" });
    const record = recordBubbleProgram(program);
    const replayed = replayBubbleRecord(record);
    const collapseRecord = replayed.evidence.find((entry) => entry.kind === "collapse-record");
    const replayClaim = replayed.proof.claims.find((claim) => claim.id === "claim:replay-identity");

    assert.equal(record.commitCount, 1);
    assert.ok(collapseRecord);
    assert.equal(collapseRecord.commitStatus, "committed");
    assert.equal(collapseRecord.observationState.phase, "observed-committed");
    assert.equal(replayClaim?.status, "certified");
    assert.ok(replayClaim?.basis.includes("observed-history-committed"));
    assert.ok(replayClaim?.basis.includes("observed-history-shape-fully-committed"));
    assert.ok(!replayClaim?.assumptions?.includes("observed-collapse-history-is-not-yet-committed"));
    assert.ok(replayed.trace.some((event) => event.kind === "materialization-committed"));
});

test("replay preserves comparison between committed root collapse history and a latent sibling artifact", () => {
    const source = [
        "bubble CollapseMirror {",
        "  axiom coherence = stable",
        "  will \"commit one observed canopy edge while preserving one latent sibling\"",
        "  seed mirror_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect perturb optional",
        "  hidden region OuterCanopy",
        "  quote Sibling = bubble SiblingCanopy { axiom coherence = stable will 'remain latent sibling canopy' seed sibling_seed effect spawn required hidden region InnerCanopy }",
        "  emit Sibling as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-mirror-replay.bubble" });
    const replayed = replayBubbleRecord(recordBubbleProgram(program));

    assert.deepEqual(replayed.observationStates.map((state) => state.phase), ["observed-committed"]);
    assert.deepEqual(replayed.artifacts.map((artifact) => ({
        bubbleName: artifact.bubbleName,
        latentRegionCount: artifact.latentRegionCount,
        latentDraftStatuses: artifact.latentDraftStatuses,
    })), [
        {
            bubbleName: "SiblingCanopy",
            latentRegionCount: 1,
            latentDraftStatuses: ["underspecified"],
        },
    ]);
});

test("replay can narrow observation states by id and phase", () => {
    const source = [
        "bubble ThresholdField {",
        "  axiom coherence = stable",
        "  will \"preserve partial law under observation\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect perturb optional",
        "  hidden region OuterCanopy",
        "  latent bubble WaitingArchive",
        "}",
    ].join("\n");

    const record = recordBubbleProgram(compileBubbleSource(source, { sourcePath: "threshold-observation-query-replay.bubble" }).program);
    const byId = replayBubbleRecord(record, {
        observationStateId: "observation-state:latent-region:semantic:10:latent-bubble:WaitingArchive",
    });
    assert.equal(byId.summary.observationStateCount, 1);
    assert.deepEqual(byId.observationStates.map((state) => state.id), [
        "observation-state:latent-region:semantic:10:latent-bubble:WaitingArchive",
    ]);

    const byOpenPhase = replayBubbleRecord(record, { observationStatePhase: "observed-history-open" });
    assert.equal(byOpenPhase.summary.observationStateCount, 1);
    assert.deepEqual(byOpenPhase.observationStates.map((state) => state.phase), ["observed-history-open"]);

    const committedRecord = recordBubbleProgram(compileBubbleSource([
        "bubble CollapseThreshold {",
        "  axiom coherence = stable",
        "  will \"fix one observed canopy edge into history\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect perturb optional",
        "  hidden region OuterCanopy",
        "}",
    ].join("\n"), { sourcePath: "collapse-threshold-observation-phase-replay.bubble" }).program);
    const byPhase = replayBubbleRecord(committedRecord, { observationStatePhase: "observed-committed" });
    assert.equal(byPhase.summary.observationStateCount, 1);
    assert.deepEqual(byPhase.observationStates.map((state) => state.phase), ["observed-committed"]);
});

test("replay preserves staged grammar activation queries", () => {
    const source = [
        "bubble GrammarArchive {",
        "  axiom coherence = stable",
        "  will \"preserve language variants\"",
        "  seed archive_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "  activate grammar TwigSyntax as twig.v0.3",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "grammar-archive.bubble" });
    const record = recordBubbleProgram(program);
    const replayed = replayBubbleRecord(record, { activationId: "activate-grammar:7:TwigSyntax" });

    assert.equal(replayed.summary.plannedGrammarCount, 1);
    assert.equal(replayed.summary.plannedGrammarActivationCount, 1);
    assert.deepEqual(replayed.bundle.members.map((member) => member.kind), [
        "root-bubble",
        "grammar-activation",
    ]);
    assert.deepEqual(replayed.grammars.activations, [
        {
            activationId: "activate-grammar:7:TwigSyntax",
            grammarId: "grammar:6:TwigSyntax",
            grammarName: "TwigSyntax",
            requestedProfileName: "twig.v0.3",
            resolvedProfileName: "twig.v0.3",
            extendsProfile: "bubbles.v0.2",
            staged: true,
        },
    ]);
    assert.deepEqual(replayed.trace.map((event) => event.kind), ["grammar-activation-staged"]);
});

test("replay can filter executable semantics by semantic id and kind", () => {
    const source = [
        "bubble AnchoredThreshold {",
        "  axiom coherence = stable",
        "  will \"hold a bounded membrane\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  constraint membraneBalance = boundary.pressure <= 0",
        "  partial law continuityRule = history.commits and world.seeded",
        "  anchor identity = world.seeded and history.commits",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "anchored-threshold-replay.bubble" });
    const record = recordBubbleProgram(program);

    const byKind = replayBubbleRecord(record, { semanticKind: "partial-law" });
    assert.equal(byKind.summary.plannedSemanticCount, 1);
    assert.deepEqual(byKind.summary.semanticKinds, ["partial-law"]);
    assert.deepEqual(byKind.summary.semanticStatusCounts, {
        satisfied: 1,
        violated: 0,
        undetermined: 0,
    });
    assert.deepEqual(
        byKind.semantics.partialLaws.map(({ name, status }) => ({ name, status })),
        [{ name: "continuityRule", status: "satisfied" }],
    );
    assert.deepEqual(byKind.semantics.constraints, []);
    assert.equal(byKind.semantics.anchorCriterion, null);

    const anchorSubjectId = replayBubbleRecord(record).semantics.anchorCriterion?.subjectId;
    assert.ok(anchorSubjectId);

    const byId = replayBubbleRecord(record, { semanticId: anchorSubjectId });
    assert.equal(byId.summary.plannedSemanticCount, 1);
    assert.deepEqual(byId.summary.semanticKinds, ["anchor-criterion"]);
    assert.deepEqual(byId.summary.semanticStatusCounts, {
        satisfied: 1,
        violated: 0,
        undetermined: 0,
    });
    assert.deepEqual(byId.semantics.constraints, []);
    assert.deepEqual(byId.semantics.partialLaws, []);
    assert.equal(byId.semantics.anchorCriterion?.subjectId, anchorSubjectId);
});

test("replay can filter executable semantics by status", () => {
    const source = [
        "bubble BrokenLaw {",
        "  axiom coherence = stable",
        "  will \"hold a bounded membrane\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  partial law continuityRule = history.commits = false",
        "  anchor identity = history.commits = false",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "broken-law-replay.bubble" });
    const record = recordBubbleProgram(program);
    const violated = replayBubbleRecord(record, { semanticStatus: "violated" });

    assert.equal(violated.summary.plannedSemanticCount, 2);
    assert.deepEqual(violated.summary.semanticKinds, ["partial-law", "anchor-criterion"]);
    assert.deepEqual(violated.summary.semanticStatusCounts, {
        satisfied: 0,
        violated: 2,
        undetermined: 0,
    });
    assert.deepEqual(
        violated.semantics.partialLaws.map(({ name, status }) => ({ name, status })),
        [{ name: "continuityRule", status: "violated" }],
    );
    assert.equal(violated.semantics.anchorCriterion?.status, "violated");
});

test("replay can filter proof claims by id, kind, and status", () => {
    const source = [
        "bubble BrokenAnchor {",
        "  axiom coherence = stable",
        "  will \"hold a bounded membrane\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  constraint membraneBalance = boundary.pressure <= 0",
        "  anchor identity = history.commits = false",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "broken-anchor-proof-replay.bubble" });
    const record = recordBubbleProgram(program);

    const byStatus = replayBubbleRecord(record, { claimStatus: "contradicted" });
    assert.equal(byStatus.summary.proofVerdict, "contradicted");
    assert.equal(byStatus.summary.proofClaimCount, 2);
    assert.deepEqual(byStatus.summary.proofClaimKinds, ["anchor", "replay"]);
    assert.deepEqual(byStatus.summary.proofClaimStatusCounts, {
        certified: 0,
        contradicted: 2,
        undetermined: 0,
    });
    assert.deepEqual(byStatus.proof.claims.map((claim) => claim.id), [
        "claim:anchor-identity",
        "claim:replay-identity",
    ]);

    const byKind = replayBubbleRecord(record, { claimKind: "consistency" });
    assert.equal(byKind.summary.proofVerdict, "certified");
    assert.equal(byKind.summary.proofClaimCount, 1);
    assert.deepEqual(byKind.summary.proofClaimKinds, ["consistency"]);
    assert.deepEqual(byKind.summary.proofClaimStatusCounts, {
        certified: 1,
        contradicted: 0,
        undetermined: 0,
    });
    assert.deepEqual(byKind.proof.claims.map((claim) => claim.id), ["claim:internal-law-consistency"]);

    const byId = replayBubbleRecord(record, { claimId: "claim:lineage-traceability" });
    assert.equal(byId.summary.proofVerdict, "undetermined");
    assert.equal(byId.summary.proofClaimCount, 1);
    assert.deepEqual(byId.summary.proofClaimKinds, ["lineage"]);
    assert.deepEqual(byId.summary.proofClaimStatusCounts, {
        certified: 0,
        contradicted: 0,
        undetermined: 1,
    });
    assert.deepEqual(byId.proof.claims.map((claim) => claim.id), ["claim:lineage-traceability"]);
});