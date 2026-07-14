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
        proofClaimCount: 8,
        proofClaimKinds: ["syntax", "worldhood", "effect", "anchor", "lineage", "replay", "consistency"],
        proofClaimStatusCounts: {
            certified: 4,
            contradicted: 0,
            undetermined: 4,
        },
        materializedArtifactCount: 1,
        descendantCount: 1,
        artifactCount: 0,
        commitCount: 1,
        evidenceCount: 5,
        sourceAttributionCount: 1,
        sourceAttributionStatusCounts: {
            resolved: 1,
            unresolved: 0,
        },
        sourceAttributionClassifications: ["positive-sea-shift"],
        observationStateCount: 0,
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
            latentRegionCount: 0,
            latentDraftStatuses: [],
            diagnosticsCount: 0,
        },
    ]);
    assert.deepEqual(report.evidence.map((entry) => entry.kind), [
        "negative-sea-state",
        "positive-sea-state",
        "anchor-point-state",
        "effect-trace",
        "event-source-attribution",
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
    assert.equal(report.summary.evidenceCount, 7);
    assert.equal(report.externalObservationLimit, report.plan.externalObservationLimit);
    assert.equal(report.externalObservationLimit.preContactInteriorAccess, "concrete-interior-not-fully-readable");
    assert.deepEqual(report.externalObservationLimit.latentInteriorKinds, []);
    assert.equal(report.externalObservationLimit.traceConsequences.recordsObservationContext, true);
    assert.equal(report.externalObservationLimit.traceConsequences.mayAnchorHistory, true);
    assert.equal(report.proof.verdict, "partially-certified");
    assert.deepEqual(
        Object.fromEntries(report.proof.claims.map((claim) => [claim.id, claim.status])),
        {
            "claim:well-formed-source": "certified",
            "claim:minimum-authored-shape": "certified",
            "claim:worldhood-roles-present": "undetermined",
            "claim:required-effect-obligations": "certified",
            "claim:anchor-identity": "undetermined",
            "claim:lineage-traceability": "undetermined",
            "claim:replay-identity": "undetermined",
            "claim:internal-law-consistency": "undetermined",
        },
    );
    assert.deepEqual(report.evidence.filter((entry) => entry.kind !== "event-source-attribution"), [
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
            pressureSources: [],
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
            supportSources: [
                {
                    kind: "source-lineage",
                    addressId: "bubble:observatory-inspect.bubble::root:Observatory",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["source-lineage-address"],
                },
                {
                    kind: "seed-origin",
                    addressId: "bubble:observatory-inspect.bubble::root:Observatory",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["seeded-origin"],
                },
                {
                    kind: "declared-history-support",
                    addressId: "bubble:observatory-inspect.bubble::root:Observatory",
                    sourceEffectId: "effect:7:commit",
                    support: "present",
                    evidenceBasis: ["declared-history-support"],
                },
            ],
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
            authoredCriterionStatus: "absent",
            authoredCriterionBasis: [],
            materializedEvidenceSources: [],
            identityStatus: "provisional",
            description: "Bubble Observatory currently shows strong inferred anchor support with stable rewind stability and provisional identity status.",
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
            causalLinks: [
                {
                    targetKind: "observation-context",
                    targetId: "evidence:observe:bubble:observatory-inspect.bubble::root:Observatory",
                    relation: "opens-observation-context",
                },
                {
                    targetKind: "anchor-point-state",
                    targetId: "evidence:anchor-point:bubble:observatory-inspect.bubble::root:Observatory",
                    relation: "influences-anchor-assessment",
                },
            ],
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
            causalLinks: [
                {
                    targetKind: "positive-sea-state",
                    targetId: "evidence:positive-sea:bubble:observatory-inspect.bubble::root:Observatory",
                    relation: "contributes-positive-sea-support",
                },
                {
                    targetKind: "anchor-point-state",
                    targetId: "evidence:anchor-point:bubble:observatory-inspect.bubble::root:Observatory",
                    relation: "influences-anchor-assessment",
                },
            ],
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
    const claimById = Object.fromEntries(report.plan.proof.claims.map((claim) => [claim.id, claim]));

    assert.equal(claimById["claim:replay-identity"]?.status, "undetermined");
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("latent-topology"));
    assert.ok(claimById["claim:internal-law-consistency"]?.basis.includes("latent-observation-ready"));
    assert.ok(report.plan.proof.claims.filter((claim) => claim.status === "undetermined").length >= 2);
});

test("inspection runtime proof distinguishes observed collapse history from pristine latent possibility", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-inspect-runtime-proof.bubble" });
    const report = inspectBubbleProgram(program);
    const claimById = Object.fromEntries(report.proof.claims.map((claim) => [claim.id, claim]));

    assert.equal(claimById["claim:replay-identity"]?.scope, "materialized-run");
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("collapse-record"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("observed-history-committed"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("observed-history-open"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("observed-history-shape-partially-committed"));
    assert.ok(!claimById["claim:replay-identity"]?.basis.includes("latent-topology"));
    assert.ok(claimById["claim:replay-identity"]?.assumptions?.includes("observed-collapse-history-is-not-yet-committed"));
    assert.ok(report.summary.proofClaimStatusCounts.undetermined >= 2);
});

test("inspection preserves collapse-record evidence for observed latent regions", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-inspect-collapse.bubble" });
    const report = inspectBubbleProgram(program);
    const collapseEvidence = report.evidence.filter((entry) => entry.kind === "collapse-record");

    assert.equal(report.summary.evidenceCount, 13);
    assert.equal(collapseEvidence.length, 2);
    assert.deepEqual(collapseEvidence.map((entry) => entry.commitStatus), ["committed", "history-open"]);
    assert.deepEqual(collapseEvidence.map((entry) => entry.draftStatus), ["observation-ready", "observation-ready"]);
    assert.deepEqual(collapseEvidence.map((entry) => entry.observationState.phase), ["observed-committed", "observed-history-open"]);
    assert.deepEqual(collapseEvidence.map((entry) => entry.observationState.localMaterialization?.realizedForm ?? null), ["boundary-canopy-anchored-fray", null]);
    assert.equal(collapseEvidence[0]?.observationState.localMaterialization?.perturbationMix, "perturb-mixed");
    assert.equal(collapseEvidence[0]?.observationState.localMaterialization?.nearbyHistoryInfluence, "history-open-neighborhood");
    assert.deepEqual(collapseEvidence[0]?.observationState.localMaterialization?.stateStructure, {
        anchorBinding: "anchored",
        seaBalance: "contested",
        membraneCondition: "frayed-edge",
        historyCoupling: "history-open-neighborhood",
        worldhoodCondition: "stable",
    });
    assert.ok(report.trace.some((event) => event.kind === "local-collapse-materialized"));
});

test("inspection exposes the bounded observation commit policy on the plan surface", () => {
    const source = [
        "bubble CollapseOpen {",
        "  axiom coherence = stable",
        "  will \"observe two canopy edges without choosing one to commit\"",
        "  seed open_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect perturb optional",
        "  hidden region OuterCanopy",
        "  hidden region InnerCanopy",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-open-inspect-policy.bubble" });
    const report = inspectBubbleProgram(program);

    assert.equal(report.externalObservationLimit.traceConsequences.mayMaterializeLatentInterior, true);
    assert.deepEqual(report.externalObservationLimit.latentInteriorKinds, ["hidden-region"]);
    assert.ok(report.plan.observationCommitPolicy);
    assert.equal(report.plan.observationCommitPolicy.selectionRule, "defer-multiple-hidden-region-targets");
    assert.equal(report.plan.observationCommitPolicy.projectedHistoryShape, "history-open-only");
    assert.deepEqual(report.plan.observationCommitPolicy.selectedTargetIds, []);
    assert.deepEqual(report.plan.observationCommitPolicy.deferredTargetIds, [
        "latent-region:semantic:9:hidden-region:OuterCanopy",
        "latent-region:semantic:10:hidden-region:InnerCanopy",
    ]);
    assert.deepEqual(report.observationCommitPolicy, report.plan.observationCommitPolicy);
    assert.ok(report.observationCommitPolicyComparison);
    assert.equal(report.observationCommitPolicyComparison.overrideApplied, false);
    assert.deepEqual(report.observationCommitPolicyComparison.differences, []);
    assert.ok(report.proof.claims.some((claim) => claim.basis.includes("observed-history-shape-history-open-only")));
});

test("inspection can narrow observation commit policy by rule and projected history shape", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-observation-policy-query.bubble" });
    const byRule = inspectBubbleProgram(program, {
        observationPolicyRule: "commit-hidden-region-with-latent-bubble-siblings",
    });
    assert.ok(byRule.observationCommitPolicy);
    assert.equal(byRule.observationCommitPolicy.selectionRule, "commit-hidden-region-with-latent-bubble-siblings");

    const byShape = inspectBubbleProgram(program, {
        observationHistoryShape: "partially-committed",
    });
    assert.ok(byShape.observationCommitPolicy);
    assert.equal(byShape.observationCommitPolicy.projectedHistoryShape, "partially-committed");

    const mismatch = inspectBubbleProgram(program, {
        observationPolicyRule: "defer-multiple-hidden-region-targets",
    });
    assert.equal(mismatch.observationCommitPolicy, null);
    assert.equal(mismatch.plan.observationCommitPolicy, null);
    assert.equal(mismatch.observationCommitPolicyComparison, null);
});

test("inspection exposes override-driven policy comparison for hidden runtime steering", () => {
    const source = [
        "bubble CollapseOpen {",
        "  axiom coherence = stable",
        "  will \"observe two canopy edges without choosing one to commit\"",
        "  seed open_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect perturb optional",
        "  hidden region OuterCanopy",
        "  hidden region InnerCanopy",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-open-inspect-override.bubble" });
    const report = inspectBubbleProgram(program, {}, {
        observationCommitPolicyOverride: {
            mode: "runtime-observation-commit-policy-override.v1",
            source: "runtime-option",
            forcedSelectionRule: "commit-single-observed-region",
            reason: "inspect unit test override",
        },
    });

    assert.ok(report.observationCommitPolicy);
    assert.equal(report.observationCommitPolicy.selectionRule, "commit-single-observed-region");
    assert.equal(report.observationCommitPolicy.decisionSource, "runtime-override");
    assert.ok(report.observationCommitPolicyComparison);
    assert.equal(report.observationCommitPolicyComparison.overrideApplied, true);
    assert.equal(report.observationCommitPolicyComparison.baseline.selectionRule, "defer-multiple-hidden-region-targets");
    assert.equal(report.observationCommitPolicyComparison.effective.selectionRule, "commit-single-observed-region");
    assert.ok(report.observationCommitPolicyComparison.differences.includes("projected-history-shape-changed"));
});

test("inspection upgrades the benchmark micro-world to committed local collapse history", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-threshold-inspect-commit.bubble" });
    const report = inspectBubbleProgram(program);
    const collapseRecord = report.evidence.find((entry) => entry.kind === "collapse-record");
    const replayClaim = report.proof.claims.find((claim) => claim.id === "claim:replay-identity");

    assert.ok(collapseRecord);
    assert.equal(collapseRecord.commitStatus, "committed");
    assert.equal(collapseRecord.observationState.phase, "observed-committed");
    assert.equal(report.summary.commitCount, 1);
    assert.equal(report.summary.proofVerdict, "partially-certified");
    assert.equal(replayClaim?.status, "undetermined");
    assert.ok(replayClaim?.basis.includes("observed-history-committed"));
    assert.ok(replayClaim?.basis.includes("observed-history-shape-fully-committed"));
    assert.match(replayClaim?.explanation ?? "", /remains inferred because no authored anchor criterion fixes same-world replay/);
});

test("inspection exposes observation states as a first-class section", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-observation-states.bubble" });
    const report = inspectBubbleProgram(program);

    assert.equal(report.summary.observationStateCount, 2);
    assert.deepEqual(report.observationStates.map((state) => ({
        id: state.id,
        phase: state.phase,
        localMaterialization: state.localMaterialization?.realizedForm ?? null,
    })), [
        {
            id: "observation-state:latent-region:semantic:9:hidden-region:OuterCanopy",
            phase: "observed-committed",
            localMaterialization: "boundary-canopy-anchored-fray",
        },
        {
            id: "observation-state:latent-region:semantic:10:latent-bubble:WaitingArchive",
            phase: "observed-history-open",
            localMaterialization: null,
        },
    ]);
});

test("inspection can narrow observation states by id and phase", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-observation-query.bubble" });
    const byId = inspectBubbleProgram(program, {
        observationStateId: "observation-state:latent-region:semantic:9:hidden-region:OuterCanopy",
    });
    assert.equal(byId.summary.observationStateCount, 1);
    assert.deepEqual(byId.observationStates.map((state) => state.id), [
        "observation-state:latent-region:semantic:9:hidden-region:OuterCanopy",
    ]);

    const byPhase = inspectBubbleProgram(program, { observationStatePhase: "observed-history-open" });
    assert.equal(byPhase.summary.observationStateCount, 1);
    assert.deepEqual(byPhase.observationStates.map((state) => state.phase), [
        "observed-history-open",
    ]);

    const committedPhase = inspectBubbleProgram(program, { observationStatePhase: "observed-committed" });
    assert.equal(committedPhase.summary.observationStateCount, 1);
    assert.deepEqual(committedPhase.observationStates.map((state) => state.phase), ["observed-committed"]);
});

test("inspection can compare committed local collapse history against a still-latent sibling artifact", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-mirror.bubble" });
    const report = inspectBubbleProgram(program);

    assert.equal(report.summary.commitCount, 2);
    assert.equal(report.summary.observationStateCount, 1);
    assert.deepEqual(report.observationStates.map((state) => ({ id: state.id, phase: state.phase })), [
        {
            id: "observation-state:latent-region:semantic:9:hidden-region:OuterCanopy",
            phase: "observed-committed",
        },
    ]);
    assert.deepEqual(report.artifacts.map((artifact) => ({
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
            pressureSources: [
                {
                    kind: "nondeterministic-realization",
                    sourceEffectId: null,
                    relationKind: null,
                    boundaryScope: null,
                    strength: "elevated",
                    evidenceBasis: ["nondeterministic-realization"],
                },
                {
                    kind: "branch",
                    sourceEffectId: "effect:11:branch",
                    relationKind: "branch",
                    boundaryScope: "local",
                    strength: "elevated",
                    evidenceBasis: ["branch-pressure", "branch-count:1"],
                },
                {
                    kind: "boundary-stress",
                    sourceEffectId: "effect:10:spawn",
                    relationKind: null,
                    boundaryScope: "membrane",
                    strength: "high",
                    evidenceBasis: [
                        "boundary-exposure",
                        "boundary-exposure-count:2",
                        "obligation:effect:10:spawn",
                        "scope:membrane",
                        "relation:spawn",
                    ],
                },
            ],
        },
        positiveSea: {
            support: "strong",
            signals: ["source-lineage-address", "seeded-origin", "descendant-lineage", "declared-history-support"],
            supportSources: [
                {
                    kind: "source-lineage",
                    addressId: "bubble:boundary-orchard.bubble::root:BoundaryOrchard",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["source-lineage-address"],
                },
                {
                    kind: "seed-origin",
                    addressId: "bubble:boundary-orchard.bubble::root:BoundaryOrchard",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["seeded-origin"],
                },
                {
                    kind: "descendant-lineage",
                    addressId: "bubble:boundary-orchard.bubble::root:BoundaryOrchard",
                    sourceEffectId: "effect:10:spawn",
                    support: "present",
                    evidenceBasis: ["descendant-lineage", "descendant-lineage-count:1"],
                },
                {
                    kind: "declared-history-support",
                    addressId: "bubble:boundary-orchard.bubble::root:BoundaryOrchard",
                    sourceEffectId: "effect:9:commit",
                    support: "present",
                    evidenceBasis: ["declared-history-support"],
                },
            ],
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
            authoredCriterionStatus: "absent",
            authoredCriterionBasis: [],
            materializedEvidenceSources: [],
            identityStatus: "provisional",
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
            "claim:minimum-authored-shape": "certified",
            "claim:worldhood-roles-present": "undetermined",
            "claim:required-effect-obligations": "certified",
            "claim:anchor-identity": "undetermined",
            "claim:lineage-traceability": "certified",
            "claim:replay-identity": "undetermined",
            "claim:internal-law-consistency": "undetermined",
        },
    );
    const claimById = Object.fromEntries(report.proof.claims.map((claim) => [claim.id, claim]));
    assert.ok(claimById["claim:anchor-identity"]?.basis.includes("negative-source:branch"));
    assert.ok(claimById["claim:anchor-identity"]?.basis.includes("negative-source-effect:effect:11:branch"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("positive-source:descendant-lineage"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("theorem-condition:stressed"));
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
            pressureSources: [
                {
                    kind: "boundary-stress",
                    sourceEffectId: "effect:8:leak",
                    relationKind: null,
                    boundaryScope: "membrane",
                    strength: "elevated",
                    evidenceBasis: [
                        "boundary-exposure",
                        "boundary-exposure-count:1",
                        "obligation:effect:8:leak",
                        "scope:membrane",
                    ],
                },
                {
                    kind: "leak",
                    sourceEffectId: "effect:8:leak",
                    relationKind: null,
                    boundaryScope: "membrane",
                    strength: "elevated",
                    evidenceBasis: ["membrane-leak"],
                },
                {
                    kind: "perturb",
                    sourceEffectId: "effect:10:perturb",
                    relationKind: null,
                    boundaryScope: "local",
                    strength: "elevated",
                    evidenceBasis: ["law-perturbation"],
                },
            ],
        },
        positiveSea: {
            support: "present",
            signals: ["source-lineage-address", "seeded-origin", "declared-history-support"],
            supportSources: [
                {
                    kind: "source-lineage",
                    addressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["source-lineage-address"],
                },
                {
                    kind: "seed-origin",
                    addressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["seeded-origin"],
                },
                {
                    kind: "declared-history-support",
                    addressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
                    sourceEffectId: "effect:7:commit",
                    support: "present",
                    evidenceBasis: ["declared-history-support"],
                },
            ],
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
            authoredCriterionStatus: "absent",
            authoredCriterionBasis: [],
            materializedEvidenceSources: [],
            identityStatus: "contradicted",
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
            "claim:minimum-authored-shape": "certified",
            "claim:worldhood-roles-present": "undetermined",
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
            pressureSources: [
                {
                    kind: "boundary-stress",
                    sourceEffectId: "effect:8:leak",
                    relationKind: null,
                    boundaryScope: "membrane",
                    strength: "elevated",
                    evidenceBasis: [
                        "boundary-exposure",
                        "boundary-exposure-count:1",
                        "obligation:effect:8:leak",
                        "scope:membrane",
                    ],
                },
                {
                    kind: "leak",
                    sourceEffectId: "effect:8:leak",
                    relationKind: null,
                    boundaryScope: "membrane",
                    strength: "elevated",
                    evidenceBasis: ["membrane-leak"],
                },
                {
                    kind: "perturb",
                    sourceEffectId: "effect:10:perturb",
                    relationKind: null,
                    boundaryScope: "local",
                    strength: "elevated",
                    evidenceBasis: ["law-perturbation"],
                },
            ],
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
            supportSources: [
                {
                    kind: "source-lineage",
                    addressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["source-lineage-address"],
                },
                {
                    kind: "seed-origin",
                    addressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["seeded-origin"],
                },
                {
                    kind: "declared-history-support",
                    addressId: "bubble:membrane-archive.bubble::root:MembraneArchive",
                    sourceEffectId: "effect:7:commit",
                    support: "present",
                    evidenceBasis: ["declared-history-support"],
                },
            ],
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
            authoredCriterionStatus: "absent",
            authoredCriterionBasis: [],
            materializedEvidenceSources: [],
            identityStatus: "contradicted",
            description: "Bubble MembraneArchive currently shows weak inferred anchor support with guarded rewind stability and contradicted identity status.",
        },
    ]);
    assert.deepEqual(report.evidence.filter((entry) => entry.kind === "effect-trace"), [
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
            causalLinks: [
                {
                    targetKind: "observation-context",
                    targetId: "evidence:observe:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "opens-observation-context",
                },
                {
                    targetKind: "anchor-point-state",
                    targetId: "evidence:anchor-point:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "influences-anchor-assessment",
                },
            ],
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
            causalLinks: [
                {
                    targetKind: "positive-sea-state",
                    targetId: "evidence:positive-sea:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "contributes-positive-sea-support",
                },
                {
                    targetKind: "anchor-point-state",
                    targetId: "evidence:anchor-point:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "influences-anchor-assessment",
                },
            ],
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
            causalLinks: [
                {
                    targetKind: "negative-sea-state",
                    targetId: "evidence:negative-sea:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "contributes-negative-sea-pressure",
                },
                {
                    targetKind: "anchor-point-state",
                    targetId: "evidence:anchor-point:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "influences-anchor-assessment",
                },
            ],
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
            causalLinks: [
                {
                    targetKind: "anchor-point-state",
                    targetId: "evidence:anchor-point:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "influences-anchor-assessment",
                },
            ],
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
            causalLinks: [
                {
                    targetKind: "negative-sea-state",
                    targetId: "evidence:negative-sea:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "contributes-negative-sea-pressure",
                },
                {
                    targetKind: "anchor-point-state",
                    targetId: "evidence:anchor-point:bubble:membrane-archive.bubble::root:MembraneArchive",
                    relation: "influences-anchor-assessment",
                },
            ],
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

test("inspection can narrow executable semantics by world-will kind", () => {
    const source = [
        "bubble GuidedWorldWill {",
        "  axiom coherence = stable",
        "  will history.commits and world.seeded",
        "  seed guided_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  constraint membraneBalance = boundary.pressure <= 0",
        "  anchor identity = world.seeded and history.commits",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "guided-world-will-inspect.bubble" });
    const byKind = inspectBubbleProgram(program, { semanticKind: "world-will" });

    assert.equal(byKind.summary.plannedSemanticCount, 1);
    assert.deepEqual(byKind.summary.semanticKinds, ["world-will"]);
    assert.deepEqual(byKind.summary.semanticStatusCounts, {
        satisfied: 1,
        violated: 0,
        undetermined: 0,
    });
    assert.deepEqual(byKind.semantics.constraints, []);
    assert.deepEqual(byKind.semantics.partialLaws, []);
    assert.equal(byKind.semantics.worldWillCriterion?.subjectKind, "world-will");
    assert.equal(byKind.semantics.worldWillCriterion?.status, "satisfied");
    assert.equal(byKind.semantics.anchorCriterion, null);
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
    assert.equal(report.summary.proofClaimCount, 8);
    assert.deepEqual(report.summary.proofClaimKinds, ["syntax", "worldhood", "effect", "anchor", "lineage", "replay", "consistency"]);
    assert.deepEqual(report.summary.proofClaimStatusCounts, {
        certified: 5,
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
    assert.deepEqual(byStatus.proof, byStatus.plan.proof);

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
    assert.deepEqual(byKind.proof, byKind.plan.proof);

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
    assert.deepEqual(byId.proof, byId.plan.proof);

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
    assert.deepEqual(emptySlice.proof, emptySlice.plan.proof);
});

test("inspection exposes and filters unresolved event-source attribution without hiding candidates", () => {
    const source = [
        "bubble AttributionCrossroads {",
        "  axiom coherence = stable",
        "  will axiom.coherence = \"broken\"",
        "  seed crossroads_seed",
        "  observe witness",
        "  anchor identity = axiom.coherence = \"broken\"",
        "  effect observe required",
        "  effect commit required",
        "  effect debt required",
        "  effect branch optional",
        "  effect perturb optional",
        "  hidden region Crossroads",
        "  hidden region CrossroadsMirror",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "attribution-crossroads-inspect.bubble" });
    const report = inspectBubbleProgram(program, {
        attributionStatus: "unresolved",
        attributionClassification: "anchor-drift",
    });

    assert.equal(report.sourceAttributions.length, 1);
    assert.equal(report.sourceAttributions[0]?.classification, "unresolved-source");
    assert.equal(report.sourceAttributions[0]?.status, "unresolved");
    assert.deepEqual(
        report.sourceAttributions[0]?.candidates.map((candidate) => candidate.classification),
        ["internal-world-event", "negative-sea-pressure", "anchor-drift"],
    );
    assert.deepEqual(report.summary.sourceAttributionStatusCounts, {
        resolved: 0,
        unresolved: 1,
    });
    assert.deepEqual(report.summary.sourceAttributionClassifications, ["unresolved-source"]);
    assert.ok(report.evidence.every((entry) => entry.kind === "event-source-attribution"));
});
