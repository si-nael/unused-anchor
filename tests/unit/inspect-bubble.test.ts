import assert from "node:assert/strict";
import test from "node:test";
import { compileBubbleSource } from "../../src/bubbles/language";
import { inspectBubbleProgram, materializeBubbleProgram } from "../../src/bubbles/runtime";

test("inspects a meta bubble into a stable summary and artifact view", () => {
    const source = [
        "bubble Nursery {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"grow derived worlds\"",
        "  seed nursery_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  reflect self.address",
        "  reflect self.worldWill",
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "nursery.bubble" });
    const report = inspectBubbleProgram(program);

    assert.deepEqual(report.summary, {
        bubbleName: "Nursery",
        profile: "bubbles.v0.2",
        addressId: "bubble:nursery.bubble::root:Nursery",
        obligationCount: 1,
        plannedRelationCount: 1,
        plannedGrammarCount: 0,
        plannedGrammarActivationCount: 0,
        plannedEmissionCount: 1,
        plannedSemanticCount: 0,
        semanticKinds: [],
        semanticStatusCounts: {
            satisfied: 0,
            violated: 0,
            undetermined: 0,
        },
        proofVerdict: "partially-certified",
        proofClaimCount: 7,
        proofClaimKinds: ["syntax", "worldhood", "effect", "anchor", "lineage", "replay", "consistency"],
        proofClaimStatusCounts: {
            certified: 5,
            contradicted: 0,
            undetermined: 2,
        },
        materializedArtifactCount: 1,
        descendantCount: 1,
        artifactCount: 0,
        commitCount: 1,
        evidenceCount: 4,
        reflectionPaths: ["self.address", "self.worldWill"],
        traceKinds: [
            "materialization-started",
            "reflection-captured",
            "emission-materialized",
            "materialization-committed",
        ],
    });
    assert.deepEqual(report.bundle.members.map((member) => member.kind), [
        "root-bubble",
        "descendant-bubble",
    ]);
    assert.deepEqual(report.bundle.materializationScopes.map((scope) => scope.target), [
        "root-bubble",
        "emission",
    ]);
    assert.deepEqual(report.artifacts, [
        {
            emissionId: "emit:11:Grove",
            target: "descendant",
            addressId: "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove",
            bubbleName: "Sapling",
            profile: "bubbles.v0.1",
            sourcePath: "nursery.bubble#emit:11:Grove",
            worldWill: "preserve inner symmetry",
            seed: "ember_seed",
            diagnosticsCount: 0,
        },
    ]);
    assert.deepEqual(report.evidence.map((entry) => entry.kind), [
        "negative-sea-state",
        "positive-sea-state",
        "anchor-point-state",
        "effect-trace",
    ]);
});

test("inspection exposes staged grammar activations as a queryable grammar section", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "  activate grammar TwigSyntax as twig.v0.3",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "grammar-nursery.bubble" });
    const report = inspectBubbleProgram(program);

    assert.equal(report.summary.plannedGrammarCount, 1);
    assert.equal(report.summary.plannedGrammarActivationCount, 1);
    assert.equal(report.summary.plannedEmissionCount, 0);
    assert.deepEqual(report.bundle.members.map((member) => member.kind), [
        "root-bubble",
        "grammar-activation",
    ]);
    assert.deepEqual(report.grammars, {
        artifacts: [
            {
                grammarId: "grammar:6:TwigSyntax",
                grammarName: "TwigSyntax",
                artifactKind: "profile-extension",
                profileName: "twig.v0.3",
                extendsProfile: "bubbles.v0.2",
            },
        ],
        activations: [
            {
                activationId: "activate-grammar:7:TwigSyntax",
                grammarId: "grammar:6:TwigSyntax",
                grammarName: "TwigSyntax",
                requestedProfileName: "twig.v0.3",
                resolvedProfileName: "twig.v0.3",
                extendsProfile: "bubbles.v0.2",
                staged: true,
            },
        ],
    });
    assert.deepEqual(report.trace.map((event) => event.kind), [
        "materialization-started",
        "grammar-activation-staged",
        "no-emissions",
    ]);

    const byActivation = inspectBubbleProgram(program, { activationId: "activate-grammar:7:TwigSyntax" });
    assert.equal(byActivation.summary.plannedGrammarActivationCount, 1);
    assert.equal(byActivation.summary.materializedArtifactCount, 0);
    assert.equal(byActivation.summary.commitCount, 0);
    assert.deepEqual(byActivation.bundle.members.map((member) => member.kind), [
        "root-bubble",
        "grammar-activation",
    ]);
    assert.deepEqual(byActivation.trace.map((event) => event.kind), ["grammar-activation-staged"]);

    const byGrammarProfile = inspectBubbleProgram(program, { grammarProfile: "twig.v0.3" });
    assert.equal(byGrammarProfile.grammars.artifacts.length, 1);
    assert.equal(byGrammarProfile.grammars.activations.length, 1);
    assert.deepEqual(byGrammarProfile.trace.map((event) => event.kind), ["grammar-activation-staged"]);
});

test("inspection report reuses materialization results faithfully", () => {
    const source = [
        "bubble Studio {",
        "  axiom coherence = stable",
        "  will \"stage worlds\"",
        "  seed studio_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  emit Sapling as artifact",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "studio.bubble" });
    const materialized = materializeBubbleProgram(program);
    const report = inspectBubbleProgram(program);

    assert.equal(report.commits.length, materialized.commits.length);
    assert.equal(report.trace.length, materialized.trace.length);
    assert.equal(report.summary.artifactCount, 1);
    assert.equal(report.summary.descendantCount, 0);
    assert.equal(report.artifacts[0].target, "artifact");
    assert.equal(report.artifacts[0].addressId, null);
    assert.equal(report.summary.evidenceCount, 4);
});

test("inspection queries can narrow reports by emission, address, and trace kind", () => {
    const source = [
        "bubble Observatory {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"observe staged worlds\"",
        "  seed observatory_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  reflect self.address",
        "  emit Sapling as artifact",
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "observatory.bubble" });
    const unfiltered = inspectBubbleProgram(program);
    const descendantEmission = unfiltered.plan.emissionPlan.find((emission) => emission.target === "descendant");

    assert.ok(descendantEmission);

    const byEmission = inspectBubbleProgram(program, { emissionId: descendantEmission.emissionId });
    assert.equal(byEmission.summary.plannedEmissionCount, 1);
    assert.equal(byEmission.summary.materializedArtifactCount, 1);
    assert.deepEqual(byEmission.bundle.members.map((member) => member.kind), [
        "root-bubble",
        "descendant-bubble",
    ]);
    assert.deepEqual(byEmission.artifacts.map((artifact) => artifact.target), ["descendant"]);
    assert.deepEqual(byEmission.commits.map((commit) => commit.emissionId), [descendantEmission.emissionId]);
    assert.deepEqual(byEmission.trace.map((event) => event.kind), [
        "reflection-captured",
        "emission-materialized",
        "materialization-committed",
    ]);

    assert.ok(descendantEmission.derivedAddress);

    const byAddress = inspectBubbleProgram(program, { addressId: descendantEmission.derivedAddress.id });
    assert.equal(byAddress.summary.plannedEmissionCount, 1);
    assert.equal(byAddress.artifacts[0].addressId, descendantEmission.derivedAddress.id);
    assert.equal(byAddress.commits[0].committedAddressId, descendantEmission.derivedAddress.id);

    const byKind = inspectBubbleProgram(program, { kind: "reflection-captured" });
    assert.equal(byKind.summary.plannedEmissionCount, 2);
    assert.equal(byKind.trace.length, 2);
    assert.equal(byKind.bundle.members.length, 3);
    assert.ok(byKind.trace.every((event) => event.kind === "reflection-captured"));
});

test("inspection exposes observation evidence as a first-class report section", () => {
    const source = [
        "bubble Observatory {",
        "  axiom coherence = stable",
        "  will \"preserve observed history\"",
        "  seed observatory_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "observatory-inspect.bubble" });
    const report = inspectBubbleProgram(program);

    assert.equal(report.summary.plannedEmissionCount, 0);
    assert.equal(report.summary.evidenceCount, 6);
    assert.equal(report.proof.verdict, "partially-certified");
    assert.deepEqual(
        Object.fromEntries(report.proof.claims.map((claim) => [claim.id, claim.status])),
        {
            "claim:well-formed-source": "certified",
            "claim:minimum-worldhood": "certified",
            "claim:required-effect-obligations": "certified",
            "claim:anchor-identity": "certified",
            "claim:lineage-traceability": "undetermined",
            "claim:replay-identity": "certified",
            "claim:internal-law-consistency": "undetermined",
        },
    );
    assert.deepEqual(report.evidence, [
        {
            id: "evidence:negative-sea:bubble:observatory-inspect.bubble::root:Observatory",
            kind: "negative-sea-state",
            bubbleAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            sourcePath: "observatory-inspect.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            pressure: "low",
            signals: [],
            description: "Bubble Observatory currently shows low negative-sea pressure.",
        },
        {
            id: "evidence:positive-sea:bubble:observatory-inspect.bubble::root:Observatory",
            kind: "positive-sea-state",
            bubbleAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            sourcePath: "observatory-inspect.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            support: "present",
            signals: ["source-lineage-address", "seeded-origin", "declared-history-support"],
            description: "Bubble Observatory currently shows present positive-sea support via source-lineage-address, seeded-origin, declared-history-support.",
        },
        {
            id: "evidence:anchor-point:bubble:observatory-inspect.bubble::root:Observatory",
            kind: "anchor-point-state",
            bubbleAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            sourcePath: "observatory-inspect.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            strength: "strong",
            declaredHistorySupport: true,
            materializedHistoryEvidence: false,
            rewindStability: "stable",
            signals: ["axiomatic-basis", "world-will", "seed-continuity", "declared-history-support", "observation-surface"],
            description: "Bubble Observatory currently shows strong anchor support with stable rewind stability.",
        },
        {
            id: "evidence:observe:bubble:observatory-inspect.bubble::root:Observatory",
            kind: "observation-context",
            bubbleAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            sourcePath: "observatory-inspect.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            description: "Bubble Observatory declares observation mode witness with declared history support.",
        },
        {
            id: "evidence:effect:effect:6:observe",
            kind: "effect-trace",
            bubbleAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            sourcePath: "observatory-inspect.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:6:observe",
            effectKind: "observe",
            requirement: "required",
            scope: "local",
            sourceLine: 6,
            materializationState: "materialized",
            runtimeSignals: ["observation-surface"],
            description: "Bubble Observatory recorded required local observe as materialized in this run via observation-surface.",
        },
        {
            id: "evidence:effect:effect:7:commit",
            kind: "effect-trace",
            bubbleAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            sourcePath: "observatory-inspect.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:7:commit",
            effectKind: "commit",
            requirement: "required",
            scope: "local",
            sourceLine: 7,
            materializationState: "potential",
            runtimeSignals: ["declared-history-support"],
            description: "Bubble Observatory recorded required local commit as potential in this run via declared-history-support.",
        },
    ]);
});

test("inspection distinguishes declared history support from materialized history evidence", () => {
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
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "archive-inspect-history.bubble" });
    const report = inspectBubbleProgram(program);

    assert.equal(report.plan.ontology.anchorPoint.declaredHistorySupport, true);
    assert.equal(report.plan.ontology.anchorPoint.materializedHistoryEvidence, false);
    assert.equal(report.ontology.anchorPoint.declaredHistorySupport, true);
    assert.equal(report.ontology.anchorPoint.materializedHistoryEvidence, true);
});

test("inspection preserves latent topology on the plan surface", () => {
    const source = [
        "bubble ThresholdField {",
        "  axiom coherence = stable",
        "  will \"preserve partial law under observation\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  hidden region OuterCanopy",
        "  latent bubble WaitingArchive",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-inspect-plan.bubble" });
    const report = inspectBubbleProgram(program);

    assert.deepEqual(report.plan.latentTopology, program.bubble.latentTopology ?? null);
    assert.deepEqual(report.plan.latentTopology?.regions.map((region) => region.name), ["OuterCanopy", "WaitingArchive"]);
    assert.deepEqual(report.plan.latentTopology?.collapseEvidenceDrafts.map((draft) => draft.draftStatus), ["observation-ready", "observation-ready"]);
});

test("inspection preserves proof boundedness for latent topology drafts", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-inspect-proof.bubble" });
    const report = inspectBubbleProgram(program);
    const claimById = Object.fromEntries(report.proof.claims.map((claim) => [claim.id, claim]));

    assert.equal(claimById["claim:replay-identity"]?.status, "undetermined");
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("latent-topology"));
    assert.ok(claimById["claim:internal-law-consistency"]?.basis.includes("latent-observation-ready"));
    assert.ok(report.summary.proofClaimStatusCounts.undetermined >= 2);
});
test("inspection exposes sea-anchor ontology for stressed boundary worlds", () => {
    const source = [
        "bubble BoundaryOrchard {",
        "  realization nondeterministic",
        "  axiom coherence = stable",
        "  axiom canopy = dense",
        "  will \"grow through porous edges\"",
        "  seed orchard_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect spawn required scope membrane",
        "  effect branch optional",
        "  spawn GroveChild when boundary.pressure > 3 and membrane.state = \"thin\"",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "boundary-orchard.bubble" });
    const report = inspectBubbleProgram(program);

    assert.deepEqual(report.ontology, {
        negativeSea: {
            pressure: "high",
            signals: ["nondeterministic-realization", "branch-pressure", "boundary-exposure"],
        },
        positiveSea: {
            support: "strong",
            signals: ["source-lineage-address", "seeded-origin", "descendant-lineage", "declared-history-support"],
        },
        anchorPoint: {
            strength: "steady",
            declaredHistorySupport: true,
            materializedHistoryEvidence: false,
            rewindStability: "guarded",
            signals: [
                "axiomatic-basis",
                "world-will",
                "seed-continuity",
                "declared-history-support",
                "observation-surface",
                "negative-pressure",
                "boundary-stress",
                "branch-instability",
            ],
        },
        theoremWitness: {
            theorem: "sea-anchor-necessity.v1",
            negativeRank: 2,
            positiveRank: 2,
            anchorRank: 1,
            worldhoodDelta: 1,
            identityDelta: -1,
            sustained: true,
            condition: "stressed",
            explanation: "Bubble worldhood remains stressed but sustained because A=1, P=2, N=2, so A + P - N = 1.",
        },
    });
    assert.deepEqual(report.plan.ontology, report.ontology);
    assert.deepEqual(report.bundle, report.plan.bundle);
    assert.equal(report.proof.verdict, "partially-certified");
    assert.deepEqual(
        Object.fromEntries(report.proof.claims.map((claim) => [claim.id, claim.status])),
        {
            "claim:well-formed-source": "certified",
            "claim:minimum-worldhood": "certified",
            "claim:required-effect-obligations": "certified",
            "claim:anchor-identity": "certified",
            "claim:lineage-traceability": "certified",
            "claim:replay-identity": "certified",
            "claim:internal-law-consistency": "undetermined",
        },
    );
    assert.deepEqual(report.evidence.slice(0, 3).map((entry) => entry.kind), [
        "negative-sea-state",
        "positive-sea-state",
        "anchor-point-state",
    ]);
});

test("inspection reflects leak, debt, and perturb as runtime ontology stress", () => {
    const source = [
        "bubble MembraneArchive {",
        "  axiom coherence = stable",
        "  will \"hold a porous record\"",
        "  seed archive_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect leak required scope membrane",
        "  effect debt required",
        "  effect perturb optional",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "membrane-archive.bubble" });
    const report = inspectBubbleProgram(program);

    assert.deepEqual(report.ontology, {
        negativeSea: {
            pressure: "high",
            signals: ["boundary-exposure", "membrane-leak", "law-perturbation"],
        },
        positiveSea: {
            support: "present",
            signals: ["source-lineage-address", "seeded-origin", "declared-history-support"],
        },
        anchorPoint: {
            strength: "weak",
            declaredHistorySupport: true,
            materializedHistoryEvidence: false,
            rewindStability: "guarded",
            signals: [
                "axiomatic-basis",
                "world-will",
                "seed-continuity",
                "declared-history-support",
                "observation-surface",
                "negative-pressure",
                "boundary-stress",
                "unresolved-debt",
                "perturbation-stress",
            ],
        },
        theoremWitness: {
            theorem: "sea-anchor-necessity.v1",
            negativeRank: 2,
            positiveRank: 1,
            anchorRank: 0,
            worldhoodDelta: -1,
            identityDelta: -2,
            sustained: false,
            condition: "dissolving",
            explanation: "Bubble worldhood is dissolving because A=0, P=1, N=2, so A + P - N = -1 with identity margin -2.",
        },
    });
    assert.equal(report.proof.verdict, "contradicted");
    assert.deepEqual(report.bundle, report.plan.bundle);
    assert.deepEqual(
        Object.fromEntries(report.proof.claims.map((claim) => [claim.id, claim.status])),
        {
            "claim:well-formed-source": "certified",
            "claim:minimum-worldhood": "certified",
            "claim:required-effect-obligations": "certified",
            "claim:anchor-identity": "contradicted",
            "claim:lineage-traceability": "undetermined",
            "claim:replay-identity": "contradicted",
            "claim:internal-law-consistency": "undetermined",
        },
    );
    assert.deepEqual(report.evidence.slice(0, 3), [
        {
            id: "evidence:negative-sea:bubble:membrane-archive.bubble::root:MembraneArchive",
            kind: "negative-sea-state",
            bubbleAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            subjectAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            sourcePath: "membrane-archive.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            pressure: "high",
            signals: ["boundary-exposure", "membrane-leak", "law-perturbation"],
            description: "Bubble MembraneArchive currently shows high negative-sea pressure via boundary-exposure, membrane-leak, law-perturbation.",
        },
        {
            id: "evidence:positive-sea:bubble:membrane-archive.bubble::root:MembraneArchive",
            kind: "positive-sea-state",
            bubbleAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            subjectAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            sourcePath: "membrane-archive.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            support: "present",
            signals: ["source-lineage-address", "seeded-origin", "declared-history-support"],
            description: "Bubble MembraneArchive currently shows present positive-sea support via source-lineage-address, seeded-origin, declared-history-support.",
        },
        {
            id: "evidence:anchor-point:bubble:membrane-archive.bubble::root:MembraneArchive",
            kind: "anchor-point-state",
            bubbleAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            subjectAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            sourcePath: "membrane-archive.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            strength: "weak",
            declaredHistorySupport: true,
            materializedHistoryEvidence: false,
            rewindStability: "guarded",
            signals: [
                "axiomatic-basis",
                "world-will",
                "seed-continuity",
                "declared-history-support",
                "observation-surface",
                "negative-pressure",
                "boundary-stress",
                "unresolved-debt",
                "perturbation-stress",
            ],
            description: "Bubble MembraneArchive currently shows weak anchor support with guarded rewind stability.",
        },
    ]);
    assert.deepEqual(report.evidence.slice(4), [
        {
            id: "evidence:effect:effect:6:observe",
            kind: "effect-trace",
            bubbleAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            subjectAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            sourcePath: "membrane-archive.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:6:observe",
            effectKind: "observe",
            requirement: "required",
            scope: "local",
            sourceLine: 6,
            materializationState: "materialized",
            runtimeSignals: ["observation-surface"],
            description: "Bubble MembraneArchive recorded required local observe as materialized in this run via observation-surface.",
        },
        {
            id: "evidence:effect:effect:7:commit",
            kind: "effect-trace",
            bubbleAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            subjectAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            sourcePath: "membrane-archive.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:7:commit",
            effectKind: "commit",
            requirement: "required",
            scope: "local",
            sourceLine: 7,
            materializationState: "potential",
            runtimeSignals: ["declared-history-support"],
            description: "Bubble MembraneArchive recorded required local commit as potential in this run via declared-history-support.",
        },
        {
            id: "evidence:effect:effect:8:leak",
            kind: "effect-trace",
            bubbleAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            subjectAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            sourcePath: "membrane-archive.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:8:leak",
            effectKind: "leak",
            requirement: "required",
            scope: "membrane",
            sourceLine: 8,
            materializationState: "potential",
            runtimeSignals: ["membrane-leak"],
            description: "Bubble MembraneArchive recorded required membrane leak as potential in this run via membrane-leak.",
        },
        {
            id: "evidence:effect:effect:9:debt",
            kind: "effect-trace",
            bubbleAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            subjectAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            sourcePath: "membrane-archive.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:9:debt",
            effectKind: "debt",
            requirement: "required",
            scope: "local",
            sourceLine: 9,
            materializationState: "potential",
            runtimeSignals: ["unresolved-debt"],
            description: "Bubble MembraneArchive recorded required local debt as potential in this run via unresolved-debt.",
        },
        {
            id: "evidence:effect:effect:10:perturb",
            kind: "effect-trace",
            bubbleAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            subjectAddressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
            sourcePath: "membrane-archive.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:10:perturb",
            effectKind: "perturb",
            requirement: "optional",
            scope: "local",
            sourceLine: 10,
            materializationState: "potential",
            runtimeSignals: ["law-perturbation"],
            description: "Bubble MembraneArchive recorded optional local perturb as potential in this run via law-perturbation.",
        },
    ]);
});

test("inspection exposes executable semantics separately from proof claim text", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "anchored-threshold-inspect.bubble" });
    const report = inspectBubbleProgram(program);

    assert.deepEqual(report.semantics, report.plan.semantics);
    assert.equal(report.summary.plannedSemanticCount, 3);
    assert.deepEqual(report.summary.semanticKinds, ["constraint", "partial-law", "anchor-criterion"]);
    assert.deepEqual(report.summary.semanticStatusCounts, {
        satisfied: 3,
        violated: 0,
        undetermined: 0,
    });
    assert.deepEqual(
        report.semantics.constraints.map(({ name, status }) => ({ name, status })),
        [{ name: "membraneBalance", status: "satisfied" }],
    );
    assert.deepEqual(
        report.semantics.partialLaws.map(({ name, status }) => ({ name, status })),
        [{ name: "continuityRule", status: "satisfied" }],
    );
    assert.equal(report.semantics.anchorCriterion?.status, "satisfied");
    assert.equal(report.proof.verdict, "partially-certified");

    const bySemanticKind = inspectBubbleProgram(program, { semanticKind: "constraint" });
    assert.equal(bySemanticKind.summary.plannedSemanticCount, 1);
    assert.deepEqual(bySemanticKind.summary.semanticKinds, ["constraint"]);
    assert.deepEqual(bySemanticKind.summary.semanticStatusCounts, {
        satisfied: 1,
        violated: 0,
        undetermined: 0,
    });
    assert.deepEqual(
        bySemanticKind.semantics.constraints.map(({ name, status }) => ({ name, status })),
        [{ name: "membraneBalance", status: "satisfied" }],
    );
    assert.deepEqual(bySemanticKind.semantics.partialLaws, []);
    assert.equal(bySemanticKind.semantics.anchorCriterion, null);

    const anchorSubjectId = report.semantics.anchorCriterion?.subjectId;
    assert.ok(anchorSubjectId);

    const bySemanticId = inspectBubbleProgram(program, { semanticId: anchorSubjectId });
    assert.equal(bySemanticId.summary.plannedSemanticCount, 1);
    assert.deepEqual(bySemanticId.summary.semanticKinds, ["anchor-criterion"]);
    assert.deepEqual(bySemanticId.summary.semanticStatusCounts, {
        satisfied: 1,
        violated: 0,
        undetermined: 0,
    });
    assert.deepEqual(bySemanticId.semantics.constraints, []);
    assert.deepEqual(bySemanticId.semantics.partialLaws, []);
    assert.equal(bySemanticId.semantics.anchorCriterion?.subjectId, anchorSubjectId);
});

test("inspection can narrow executable semantics by status", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "broken-law-inspect.bubble" });
    const violated = inspectBubbleProgram(program, { semanticStatus: "violated" });

    assert.equal(violated.summary.plannedSemanticCount, 2);
    assert.deepEqual(violated.summary.semanticKinds, ["partial-law", "anchor-criterion"]);
    assert.deepEqual(violated.summary.semanticStatusCounts, {
        satisfied: 0,
        violated: 2,
        undetermined: 0,
    });
    assert.deepEqual(violated.semantics.constraints, []);
    assert.deepEqual(
        violated.semantics.partialLaws.map(({ name, status }) => ({ name, status })),
        [{ name: "continuityRule", status: "violated" }],
    );
    assert.equal(violated.semantics.anchorCriterion?.status, "violated");

    const undeterminedProgram = compileBubbleSource([
        "bubble Threshold {",
        "  axiom coherence = stable",
        "  will \"hold an incomplete law\"",
        "  seed threshold_seed",
        "  effect observe required",
        "}",
    ].join("\n"), { sourcePath: "threshold-inspect.bubble" }).program;
    undeterminedProgram.bubble.unresolvedSemantics = [
        {
            id: "semantic:unknown-law",
            kind: "partial-law",
            name: "unknown-law",
            description: "One law fragment remains only partially specified.",
            sourceLine: null,
        },
        {
            id: "semantic:constraint",
            kind: "constraint",
            name: "constraint",
            description: "One governing constraint remains unresolved.",
            sourceLine: null,
        },
    ];

    const undetermined = inspectBubbleProgram(undeterminedProgram, { semanticStatus: "undetermined" });
    assert.equal(undetermined.summary.plannedSemanticCount, 2);
    assert.deepEqual(undetermined.summary.semanticKinds, ["constraint", "partial-law"]);
    assert.deepEqual(undetermined.summary.semanticStatusCounts, {
        satisfied: 0,
        violated: 0,
        undetermined: 2,
    });
    assert.deepEqual(
        undetermined.semantics.constraints.map(({ subjectId, status }) => ({ subjectId, status })),
        [{ subjectId: "semantic:constraint", status: "undetermined" }],
    );
    assert.deepEqual(
        undetermined.semantics.partialLaws.map(({ subjectId, status }) => ({ subjectId, status })),
        [{ subjectId: "semantic:unknown-law", status: "undetermined" }],
    );
    assert.equal(undetermined.semantics.anchorCriterion, null);
});

test("inspection can narrow proof claims by id, kind, and status", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "broken-anchor-proof-inspect.bubble" });
    const report = inspectBubbleProgram(program);

    assert.equal(report.summary.proofVerdict, "contradicted");
    assert.equal(report.summary.proofClaimCount, 7);
    assert.deepEqual(report.summary.proofClaimKinds, ["syntax", "worldhood", "effect", "anchor", "lineage", "replay", "consistency"]);
    assert.deepEqual(report.summary.proofClaimStatusCounts, {
        certified: 4,
        contradicted: 2,
        undetermined: 1,
    });

    const byStatus = inspectBubbleProgram(program, { claimStatus: "contradicted" });
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

    const byKind = inspectBubbleProgram(program, { claimKind: "consistency" });
    assert.equal(byKind.summary.proofVerdict, "certified");
    assert.equal(byKind.summary.proofClaimCount, 1);
    assert.deepEqual(byKind.summary.proofClaimKinds, ["consistency"]);
    assert.deepEqual(byKind.summary.proofClaimStatusCounts, {
        certified: 1,
        contradicted: 0,
        undetermined: 0,
    });
    assert.deepEqual(byKind.proof.claims.map((claim) => claim.id), ["claim:internal-law-consistency"]);

    const byId = inspectBubbleProgram(program, { claimId: "claim:lineage-traceability" });
    assert.equal(byId.summary.proofVerdict, "undetermined");
    assert.equal(byId.summary.proofClaimCount, 1);
    assert.deepEqual(byId.summary.proofClaimKinds, ["lineage"]);
    assert.deepEqual(byId.summary.proofClaimStatusCounts, {
        certified: 0,
        contradicted: 0,
        undetermined: 1,
    });
    assert.deepEqual(byId.proof.claims.map((claim) => claim.id), ["claim:lineage-traceability"]);

    const emptySlice = inspectBubbleProgram(program, { claimKind: "anchor", claimStatus: "certified" });
    assert.equal(emptySlice.summary.proofVerdict, "undetermined");
    assert.equal(emptySlice.summary.proofClaimCount, 0);
    assert.deepEqual(emptySlice.summary.proofClaimKinds, []);
    assert.deepEqual(emptySlice.summary.proofClaimStatusCounts, {
        certified: 0,
        contradicted: 0,
        undetermined: 0,
    });
    assert.deepEqual(emptySlice.proof.claims, []);
});