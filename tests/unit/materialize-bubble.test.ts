import assert from "node:assert/strict";
import test from "node:test";
import { compileBubbleSource } from "../../src/bubbles/language";
import { materializeBubbleProgram, planBubbleProgram } from "../../src/bubbles/runtime";

test("plans and materializes descendant emissions from a meta bubble", () => {
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
    const plan = planBubbleProgram(program);
    const materialized = materializeBubbleProgram(program);

    assert.equal(plan.mode, "semantic-plan.v1");
    assert.deepEqual(plan.emissionPlan, [
        {
            emissionId: "emit:11:Grove",
            sourceName: "Grove",
            sourceKind: "generator",
            target: "descendant",
            quoteName: "Sapling",
            generatorName: "Grove",
            derivedAddress: {
                scheme: "bubble-lineage.v1",
                locatorKind: "lineage-relative",
                anchor: "nursery.bubble",
                path: [
                    {
                        kind: "root",
                        key: "Nursery",
                    },
                    {
                        kind: "spawn",
                        key: "emit:11:Grove",
                    },
                ],
                id: "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove",
            },
            reflectionPaths: ["self.address", "self.worldWill"],
        },
    ]);
    assert.deepEqual(plan.ontology, {
        negativeSea: {
            pressure: "low",
            signals: [],
            pressureSources: [],
        },
        positiveSea: {
            support: "strong",
            signals: ["source-lineage-address", "seeded-origin", "descendant-lineage", "staged-growth"],
            supportSources: [
                {
                    kind: "source-lineage",
                    addressId: "bubble:nursery.bubble::root:Nursery",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["source-lineage-address"],
                },
                {
                    kind: "seed-origin",
                    addressId: "bubble:nursery.bubble::root:Nursery",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["seeded-origin"],
                },
                {
                    kind: "descendant-lineage",
                    addressId: "bubble:nursery.bubble::root:Nursery",
                    sourceEffectId: "effect:6:spawn",
                    support: "present",
                    evidenceBasis: ["descendant-lineage", "descendant-lineage-count:1"],
                },
                {
                    kind: "staged-growth",
                    addressId: "bubble:nursery.bubble::root:Nursery",
                    sourceEffectId: "effect:6:spawn",
                    support: "present",
                    evidenceBasis: ["staged-growth", "staged-growth-count:1"],
                },
            ],
        },
        anchorPoint: {
            strength: "steady",
            declaredHistorySupport: false,
            materializedHistoryEvidence: false,
            rewindStability: "guarded",
            signals: ["axiomatic-basis", "world-will", "seed-continuity"],
            authoredCriterionStatus: "absent",
            authoredCriterionBasis: [],
            materializedEvidenceSources: [],
            identityStatus: "provisional",
        },
        theoremWitness: {
            theorem: "sea-anchor-necessity.v1",
            negativeRank: 0,
            positiveRank: 2,
            anchorRank: 1,
            worldhoodDelta: 3,
            identityDelta: 1,
            sustained: true,
            condition: "stable",
            explanation: "Bubble worldhood remains stable because A=1, P=2, N=0, so A + P - N = 3.",
        },
    });
    assert.equal(plan.proof.mode, "bubble-consistency-certificate.v1");
    assert.equal(plan.proof.verdict, "partially-certified");
    assert.deepEqual(
        Object.fromEntries(plan.proof.claims.map((claim) => [claim.id, claim.status])),
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
    assert.deepEqual(plan.bundle, {
        mode: "bubble-bundle-plan.v1",
        bundleId: "bundle:bubble:nursery.bubble::root:Nursery",
        rootAddressId: "bubble:nursery.bubble::root:Nursery",
        members: [
            {
                memberId: "bundle-member:bubble:nursery.bubble::root:Nursery",
                kind: "root-bubble",
                emissionId: null,
                activationId: null,
                addressId: "bubble:nursery.bubble::root:Nursery",
                profileName: "bubbles.v0.2",
                sourcePath: "nursery.bubble",
                provenance: "root-bubble",
                description: "Root bubble Nursery anchors this bundle.",
            },
            {
                memberId: "bundle-member:emit:11:Grove",
                kind: "descendant-bubble",
                emissionId: "emit:11:Grove",
                activationId: null,
                addressId: "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove",
                profileName: null,
                sourcePath: "nursery.bubble",
                provenance: "staged-emission",
                description: "Emission emit:11:Grove stages one descendant member inside the bundle.",
            },
        ],
        materializationScopes: [
            {
                scopeId: "bundle-scope:bubble:nursery.bubble::root:Nursery",
                target: "root-bubble",
                emissionId: null,
                activationId: null,
                addressId: "bubble:nursery.bubble::root:Nursery",
                description: "The root bubble Nursery is always inside its own materialization scope.",
            },
            {
                scopeId: "bundle-scope:emit:11:Grove",
                target: "emission",
                emissionId: "emit:11:Grove",
                activationId: null,
                addressId: "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove",
                description: "Emission emit:11:Grove defines one staged materialization scope within the bundle.",
            },
        ],
    });
    assert.deepEqual(plan.grammars, []);
    assert.deepEqual(plan.grammarActivationPlan, []);

    assert.equal(materialized.artifacts.length, 1);
    assert.equal(materialized.commits.length, 1);
    assert.equal(materialized.artifacts[0].target, "descendant");
    assert.equal(materialized.artifacts[0].program.bubble.name, "Sapling");
    assert.equal(materialized.artifacts[0].program.bubble.seed, "ember_seed");
    assert.equal(materialized.artifacts[0].address?.id, "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove");
    assert.deepEqual(materialized.artifacts[0].reflections, {
        "self.address": program.bubble.address,
        "self.worldWill": "grow derived worlds",
    });
    assert.deepEqual(materialized.evidence.map((entry) => entry.kind), [
        "negative-sea-state",
        "positive-sea-state",
        "anchor-point-state",
        "effect-trace",
    ]);
    assert.equal(materialized.commits[0].committedAddressId, "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove");
});

test("semantic plans preserve latent topology drafts for hidden regions and latent bubbles", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-plan.bubble" });
    const plan = planBubbleProgram(program);

    assert.deepEqual(plan.latentTopology, program.bubble.latentTopology ?? null);
    assert.equal(plan.observationMaterializationLaw?.kernel, "single-region-observation-kernel.v3");
    assert.ok(plan.observationMaterializationLaw?.determinantAxes.includes("membrane-condition"));
    assert.ok(
        plan.observationMaterializationLaw?.realizedFormRules.some(
            (rule) => rule.id === "hidden-region:history-open:committed:default",
        ),
    );
    assert.deepEqual(plan.latentTopology, {
        mode: "bubble-latent-topology.v1",
        regions: [
            {
                id: "latent-region:semantic:9:hidden-region:OuterCanopy",
                sourceSemanticId: "semantic:9:hidden-region:OuterCanopy",
                name: "OuterCanopy",
                kind: "hidden-region",
                description: "Hidden region OuterCanopy remains outside the current observation surface.",
                sourceLine: 9,
                initialState: "latent",
                observationBoundary: "declared-observation-surface",
                commitBoundary: "declared-history-support",
                perturbationMode: "declared-perturbation",
            },
            {
                id: "latent-region:semantic:10:latent-bubble:WaitingArchive",
                sourceSemanticId: "semantic:10:latent-bubble:WaitingArchive",
                name: "WaitingArchive",
                kind: "latent-bubble",
                description: "Latent bubble WaitingArchive is admitted but not yet materialized.",
                sourceLine: 10,
                initialState: "latent",
                observationBoundary: "declared-observation-surface",
                commitBoundary: "declared-history-support",
                perturbationMode: "declared-perturbation",
            },
        ],
        collapseEvidenceDrafts: [
            {
                id: "collapse-evidence-draft:semantic:9:hidden-region:OuterCanopy",
                latentRegionId: "latent-region:semantic:9:hidden-region:OuterCanopy",
                sourceSemanticId: "semantic:9:hidden-region:OuterCanopy",
                observationEffectIds: ["effect:6:observe"],
                perturbEffectIds: ["effect:8:perturb"],
                commitEffectIds: ["effect:7:commit"],
                draftStatus: "observation-ready",
                description: "Latent region OuterCanopy can materialize under the declared observation surface with declared perturbation support and later anchor that collapse through declared history support.",
            },
            {
                id: "collapse-evidence-draft:semantic:10:latent-bubble:WaitingArchive",
                latentRegionId: "latent-region:semantic:10:latent-bubble:WaitingArchive",
                sourceSemanticId: "semantic:10:latent-bubble:WaitingArchive",
                observationEffectIds: ["effect:6:observe"],
                perturbEffectIds: ["effect:8:perturb"],
                commitEffectIds: ["effect:7:commit"],
                draftStatus: "observation-ready",
                description: "Latent region WaitingArchive can materialize under the declared observation surface with declared perturbation support and later anchor that collapse through declared history support.",
            },
        ],
    });
});

test("latent topology keeps replay identity and internal consistency bounded before collapse history exists", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-proof.bubble" });
    const plan = planBubbleProgram(program);
    const claimById = Object.fromEntries(plan.proof.claims.map((claim) => [claim.id, claim]));

    assert.equal(claimById["claim:replay-identity"]?.status, "undetermined");
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("latent-topology"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("latent-observation-ready"));
    assert.deepEqual(claimById["claim:replay-identity"]?.assumptions, [
        "same-world-replay-is-evaluated-from-the-current-plan-basis",
        "latent-collapse-history-is-not-yet-materialized",
    ]);
    assert.match(claimById["claim:replay-identity"]?.explanation ?? "", /latent regions/);
    assert.match(claimById["claim:replay-identity"]?.explanation ?? "", /observation-ready/);

    assert.equal(claimById["claim:internal-law-consistency"]?.status, "undetermined");
    assert.ok(claimById["claim:internal-law-consistency"]?.basis.includes("latent-topology"));
    assert.ok(claimById["claim:internal-law-consistency"]?.basis.includes("latent-observation-ready"));
    assert.ok(claimById["claim:internal-law-consistency"]?.basis.includes("hidden-region"));
    assert.ok(claimById["claim:internal-law-consistency"]?.basis.includes("latent-admitted-bubble"));
    assert.ok(claimById["claim:internal-law-consistency"]?.assumptions?.includes("observation-induced-collapse-is-not-yet-executed"));
    assert.match(claimById["claim:internal-law-consistency"]?.explanation ?? "", /Latent collapse drafts/);
});

test("materialization emits collapse-record evidence for observed latent regions", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-collapse.bubble" });
    const materialized = materializeBubbleProgram(program);
    const collapseEvidence = materialized.evidence.filter((entry) => entry.kind === "collapse-record");

    assert.equal(materialized.evidence.length, 10);
    assert.equal(collapseEvidence.length, 2);
    assert.equal(collapseEvidence.filter((entry) => entry.observationState.localMaterialization !== null).length, 1);
    assert.deepEqual(collapseEvidence.map((entry) => ({
        latentRegionId: entry.latentRegionId,
        sourceSemanticId: entry.sourceSemanticId,
        triggerEffectIds: entry.triggerEffectIds,
        perturbEffectIds: entry.perturbEffectIds,
        observationStateId: entry.observationStateId,
        observationStatePhase: entry.observationState.phase,
        localRealizedForm: entry.observationState.localMaterialization?.realizedForm ?? null,
        commitStatus: entry.commitStatus,
        draftStatus: entry.draftStatus,
    })), [
        {
            latentRegionId: "latent-region:semantic:9:hidden-region:OuterCanopy",
            sourceSemanticId: "semantic:9:hidden-region:OuterCanopy",
            triggerEffectIds: ["effect:6:observe"],
            perturbEffectIds: ["effect:8:perturb"],
            observationStateId: "observation-state:latent-region:semantic:9:hidden-region:OuterCanopy",
            observationStatePhase: "observed-committed",
            localRealizedForm: "boundary-canopy-anchored-fray",
            commitStatus: "committed",
            draftStatus: "observation-ready",
        },
        {
            latentRegionId: "latent-region:semantic:10:latent-bubble:WaitingArchive",
            sourceSemanticId: "semantic:10:latent-bubble:WaitingArchive",
            triggerEffectIds: ["effect:6:observe"],
            perturbEffectIds: ["effect:8:perturb"],
            observationStateId: "observation-state:latent-region:semantic:10:latent-bubble:WaitingArchive",
            observationStatePhase: "observed-history-open",
            localRealizedForm: null,
            commitStatus: "history-open",
            draftStatus: "observation-ready",
        },
    ]);
    assert.match(collapseEvidence[0]?.description ?? "", /observed latent region OuterCanopy/);
    assert.match(collapseEvidence[0]?.observationState.description ?? "", /observed-committed/);
    assert.match(collapseEvidence[0]?.observationState.localMaterialization?.description ?? "", /Local observation kernel materialized OuterCanopy/);
    assert.equal(collapseEvidence[0]?.observationState.localMaterialization?.perturbationMix, "perturb-mixed");
    assert.equal(collapseEvidence[0]?.observationState.localMaterialization?.nearbyHistoryInfluence, "history-open-neighborhood");
    assert.ok(materialized.evidence.some((entry) => entry.kind === "history-commit"));
    assert.ok(materialized.trace.some((event) => event.kind === "local-collapse-materialized"));
});

test("materialization can commit one local observation target while leaving sibling observation states history-open", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-mixed-commit.bubble" });
    const materialized = materializeBubbleProgram(program);
    const collapseEvidence = materialized.evidence.filter((entry) => entry.kind === "collapse-record");
    const replayClaim = materialized.proof.claims.find((claim) => claim.id === "claim:replay-identity");
    const internalConsistencyClaim = materialized.proof.claims.find((claim) => claim.id === "claim:internal-law-consistency");

    assert.deepEqual(collapseEvidence.map((entry) => ({
        latentRegionId: entry.latentRegionId,
        commitStatus: entry.commitStatus,
        observationStatePhase: entry.observationState.phase,
        localRealizedForm: entry.observationState.localMaterialization?.realizedForm ?? null,
    })), [
        {
            latentRegionId: "latent-region:semantic:9:hidden-region:OuterCanopy",
            commitStatus: "committed",
            observationStatePhase: "observed-committed",
            localRealizedForm: "boundary-canopy-anchored-fray",
        },
        {
            latentRegionId: "latent-region:semantic:10:latent-bubble:WaitingArchive",
            commitStatus: "history-open",
            observationStatePhase: "observed-history-open",
            localRealizedForm: null,
        },
    ]);
    assert.equal(materialized.commits.length, 1);
    assert.equal(materialized.commits[0]?.emissionId, "observation-state:latent-region:semantic:9:hidden-region:OuterCanopy");
    assert.equal(materialized.runtimeOntology.anchorPoint.materializedHistoryEvidence, true);
    assert.equal(replayClaim?.status, "undetermined");
    assert.ok(replayClaim?.basis.includes("observed-history-committed"));
    assert.ok(replayClaim?.basis.includes("observed-history-open"));
    assert.ok(replayClaim?.basis.includes("observed-history-shape-partially-committed"));
    assert.ok(replayClaim?.assumptions?.includes("observed-collapse-history-is-not-yet-committed"));
    assert.ok(internalConsistencyClaim?.basis.includes("observed-history-shape-partially-committed"));
    assert.match(replayClaim?.explanation ?? "", /shape partially-committed/);
    assert.match(internalConsistencyClaim?.explanation ?? "", /shape partially-committed/);
});

test("planning exposes a bounded observation commit policy object for local target selection", () => {
    const thresholdSource = [
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

    const thresholdPlan = planBubbleProgram(compileBubbleSource(thresholdSource, { sourcePath: "threshold-policy-plan.bubble" }).program);
    assert.ok(thresholdPlan.observationCommitPolicy);
    assert.equal(thresholdPlan.observationCommitPolicy.selectionRule, "commit-hidden-region-with-latent-bubble-siblings");
    assert.equal(thresholdPlan.observationCommitPolicy.decisionSource, "bounded-runtime");
    assert.equal(thresholdPlan.observationCommitPolicy.projectedHistoryShape, "partially-committed");
    assert.equal(thresholdPlan.observationCommitPolicy.localMaterializationTargetId, "latent-region:semantic:9:hidden-region:OuterCanopy");
    assert.deepEqual(thresholdPlan.observationCommitPolicy.selectedTargetIds, [
        "latent-region:semantic:9:hidden-region:OuterCanopy",
    ]);
    assert.deepEqual(thresholdPlan.observationCommitPolicy.deferredTargetIds, [
        "latent-region:semantic:10:latent-bubble:WaitingArchive",
    ]);

    const openSource = [
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

    const openPlan = planBubbleProgram(compileBubbleSource(openSource, { sourcePath: "collapse-open-policy-plan.bubble" }).program);
    assert.ok(openPlan.observationCommitPolicy);
    assert.equal(openPlan.observationCommitPolicy.selectionRule, "defer-multiple-hidden-region-targets");
    assert.equal(openPlan.observationCommitPolicy.decisionSource, "bounded-runtime");
    assert.equal(openPlan.observationCommitPolicy.projectedHistoryShape, "history-open-only");
    assert.equal(openPlan.observationCommitPolicy.localMaterializationTargetId, "latent-region:semantic:9:hidden-region:OuterCanopy");
    assert.deepEqual(openPlan.observationCommitPolicy.selectedTargetIds, []);
    assert.deepEqual(openPlan.observationCommitPolicy.deferredTargetIds, [
        "latent-region:semantic:9:hidden-region:OuterCanopy",
        "latent-region:semantic:10:hidden-region:InnerCanopy",
    ]);
    assert.ok(openPlan.observationCommitPolicyComparison);
    assert.equal(openPlan.observationCommitPolicyComparison.overrideApplied, false);
    assert.equal(openPlan.observationCommitPolicyComparison.baseline.selectionRule, "defer-multiple-hidden-region-targets");
    assert.equal(openPlan.observationCommitPolicyComparison.effective.selectionRule, "defer-multiple-hidden-region-targets");
    assert.deepEqual(openPlan.observationCommitPolicyComparison.differences, []);
});

test("runtime observation policy override can force an alternate local commit law and expose the delta", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-open-policy-override.bubble" });
    const options = {
        observationCommitPolicyOverride: {
            mode: "runtime-observation-commit-policy-override.v1",
            source: "runtime-option",
            forcedSelectionRule: "commit-single-observed-region",
            reason: "unit test override",
        },
    } as const;
    const plan = planBubbleProgram(program, options);
    const materialized = materializeBubbleProgram(program, options);
    const collapseEvidence = materialized.evidence.filter((entry) => entry.kind === "collapse-record");

    assert.ok(plan.observationCommitPolicy);
    assert.equal(plan.observationCommitPolicy.decisionSource, "runtime-override");
    assert.equal(plan.observationCommitPolicy.selectionRule, "commit-single-observed-region");
    assert.equal(plan.observationCommitPolicy.projectedHistoryShape, "partially-committed");
    assert.deepEqual(plan.observationCommitPolicy.selectedTargetIds, [
        "latent-region:semantic:9:hidden-region:OuterCanopy",
    ]);
    assert.deepEqual(plan.observationCommitPolicy.deferredTargetIds, [
        "latent-region:semantic:10:hidden-region:InnerCanopy",
    ]);
    assert.ok(plan.observationCommitPolicyComparison);
    assert.equal(plan.observationCommitPolicyComparison.overrideApplied, true);
    assert.equal(plan.observationCommitPolicyComparison.baseline.selectionRule, "defer-multiple-hidden-region-targets");
    assert.equal(plan.observationCommitPolicyComparison.effective.selectionRule, "commit-single-observed-region");
    assert.deepEqual(plan.observationCommitPolicyComparison.differences, [
        "selection-rule-changed",
        "selected-targets-changed",
        "deferred-targets-changed",
        "projected-history-shape-changed",
    ]);

    assert.equal(materialized.commits.length, 1);
    assert.deepEqual(collapseEvidence.map((entry) => ({
        latentRegionId: entry.latentRegionId,
        commitStatus: entry.commitStatus,
        phase: entry.observationState.phase,
    })), [
        {
            latentRegionId: "latent-region:semantic:9:hidden-region:OuterCanopy",
            commitStatus: "committed",
            phase: "observed-committed",
        },
        {
            latentRegionId: "latent-region:semantic:10:hidden-region:InnerCanopy",
            commitStatus: "history-open",
            phase: "observed-history-open",
        },
    ]);
});

test("materialization can preserve a history-open-only collapse shape when multiple hidden regions are observed", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-open-materialize.bubble" });
    const materialized = materializeBubbleProgram(program);
    const collapseEvidence = materialized.evidence.filter((entry) => entry.kind === "collapse-record");
    const replayClaim = materialized.proof.claims.find((claim) => claim.id === "claim:replay-identity");
    const internalConsistencyClaim = materialized.proof.claims.find((claim) => claim.id === "claim:internal-law-consistency");

    assert.equal(materialized.commits.length, 0);
    assert.equal(materialized.runtimeOntology.anchorPoint.materializedHistoryEvidence, false);
    assert.equal(materialized.evidence.length, 9);
    assert.deepEqual(collapseEvidence.map((entry) => ({
        latentRegionId: entry.latentRegionId,
        commitStatus: entry.commitStatus,
        observationStatePhase: entry.observationState.phase,
        localRealizedForm: entry.observationState.localMaterialization?.realizedForm ?? null,
    })), [
        {
            latentRegionId: "latent-region:semantic:9:hidden-region:OuterCanopy",
            commitStatus: "history-open",
            observationStatePhase: "observed-history-open",
            localRealizedForm: "boundary-canopy-frayed-wake",
        },
        {
            latentRegionId: "latent-region:semantic:10:hidden-region:InnerCanopy",
            commitStatus: "history-open",
            observationStatePhase: "observed-history-open",
            localRealizedForm: null,
        },
    ]);
    assert.ok(replayClaim?.basis.includes("observed-history-shape-history-open-only"));
    assert.ok(!replayClaim?.basis.includes("observed-history-shape-partially-committed"));
    assert.ok(replayClaim?.assumptions?.includes("observed-collapse-history-is-not-yet-committed"));
    assert.match(replayClaim?.explanation ?? "", /shape history-open-only/);
    assert.ok(internalConsistencyClaim?.basis.includes("observed-history-shape-history-open-only"));
    assert.match(internalConsistencyClaim?.explanation ?? "", /shape history-open-only/);
});

test("local collapse kernel materializes one latent region in the benchmark micro-world", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-threshold-kernel.bubble" });
    const materialized = materializeBubbleProgram(program);
    const collapseRecord = materialized.evidence.find((entry) => entry.kind === "collapse-record");
    const replayClaim = materialized.proof.claims.find((claim) => claim.id === "claim:replay-identity");

    assert.ok(collapseRecord);
    assert.equal(collapseRecord.observationState.localMaterialization?.mode, "single-region-observation-kernel.v3");
    assert.equal(collapseRecord.observationState.localMaterialization?.realizedForm, "boundary-canopy-anchored-wake");
    assert.equal(collapseRecord.observationState.localMaterialization?.perturbationMix, "perturb-mixed");
    assert.equal(collapseRecord.observationState.localMaterialization?.nearbyHistoryInfluence, "committed-neighborhood");
    assert.deepEqual(collapseRecord.observationState.localMaterialization?.stateStructure, {
        anchorBinding: "anchored",
        seaBalance: "contested",
        membraneCondition: "pressured-edge",
        historyCoupling: "committed-neighborhood",
        worldhoodCondition: "stable",
    });
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("anchor:strong"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("anchor-binding:anchored"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("sea-balance:contested"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("membrane-condition:pressured-edge"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("perturbation-mix:perturb-mixed"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("nearby-history:committed-neighborhood"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("effect:6:observe"));
    assert.equal(collapseRecord.commitStatus, "committed");
    assert.equal(collapseRecord.observationState.phase, "observed-committed");
    assert.equal(materialized.commits.length, 1);
    assert.equal(materialized.runtimeOntology.anchorPoint.materializedHistoryEvidence, true);
    assert.ok(materialized.evidence.some((entry) => entry.kind === "history-commit"));
    assert.deepEqual(materialized.trace.map((event) => event.kind), [
        "materialization-started",
        "no-emissions",
        "local-collapse-materialized",
        "materialization-committed",
    ]);
    assert.equal(replayClaim?.status, "undetermined");
    assert.ok(replayClaim?.basis.includes("observed-history-committed"));
    assert.ok(replayClaim?.basis.includes("observed-history-shape-fully-committed"));
    assert.ok(!replayClaim?.assumptions?.includes("observed-collapse-history-is-not-yet-committed"));
    assert.match(replayClaim?.explanation ?? "", /remains inferred because no authored anchor criterion fixes same-world replay/);

    const internalConsistencyClaim = materialized.proof.claims.find((claim) => claim.id === "claim:internal-law-consistency");
    assert.equal(internalConsistencyClaim?.status, "undetermined");
    assert.ok(internalConsistencyClaim?.basis.includes("observed-history-shape-fully-committed"));
    assert.ok(internalConsistencyClaim?.basis.includes("committed-hidden-region-history"));
    assert.ok(!internalConsistencyClaim?.basis.includes("hidden-region"));
    assert.match(internalConsistencyClaim?.explanation ?? "", /reinterprets hidden-region:OuterCanopy as observed local history/);
    assert.ok(!/Residual unresolved semantic fragments \(hidden-region\)/.test(internalConsistencyClaim?.explanation ?? ""));
});

test("local collapse kernel lets weak anchor and negative sea fray a committed canopy edge", () => {
    const source = [
        "bubble CollapseStress {",
        "  axiom coherence = stable",
        "  will \"hold one observed canopy edge inside a dissolving membrane\"",
        "  seed stress_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect leak required scope membrane",
        "  effect debt required",
        "  effect perturb optional",
        "  hidden region OuterCanopy",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "collapse-stress-kernel.bubble" });
    const materialized = materializeBubbleProgram(program);
    const collapseRecord = materialized.evidence.find((entry) => entry.kind === "collapse-record");

    assert.ok(collapseRecord);
    assert.equal(materialized.runtimeOntology.negativeSea.pressure, "high");
    assert.equal(materialized.runtimeOntology.anchorPoint.strength, "weak");
    assert.equal(collapseRecord.observationState.localMaterialization?.realizedForm, "boundary-canopy-frayed-wake");
    assert.deepEqual(collapseRecord.observationState.localMaterialization?.stateStructure, {
        anchorBinding: "tethered",
        seaBalance: "negative-skewed",
        membraneCondition: "frayed-edge",
        historyCoupling: "committed-neighborhood",
        worldhoodCondition: "dissolving",
    });
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("anchor:weak"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("negative-sea:high"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("sea-balance:negative-skewed"));
    assert.ok(collapseRecord.observationState.localMaterialization?.determinants.includes("worldhood:dissolving"));
});

test("materialization refines proof from latent drafts to observed collapse history", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "threshold-collapse-proof.bubble" });
    const materialized = materializeBubbleProgram(program);
    const planClaimById = Object.fromEntries(materialized.plan.proof.claims.map((claim) => [claim.id, claim]));
    const runtimeClaimById = Object.fromEntries(materialized.proof.claims.map((claim) => [claim.id, claim]));

    assert.ok(planClaimById["claim:replay-identity"]?.basis.includes("latent-topology"));
    assert.ok(planClaimById["claim:replay-identity"]?.assumptions?.includes("latent-collapse-history-is-not-yet-materialized"));

    assert.equal(runtimeClaimById["claim:replay-identity"]?.scope, "materialized-run");
    assert.ok(runtimeClaimById["claim:replay-identity"]?.basis.includes("collapse-record"));
    assert.ok(runtimeClaimById["claim:replay-identity"]?.basis.includes("observed-history-committed"));
    assert.ok(runtimeClaimById["claim:replay-identity"]?.basis.includes("observed-history-open"));
    assert.ok(runtimeClaimById["claim:replay-identity"]?.basis.includes("observed-history-shape-partially-committed"));
    assert.ok(!runtimeClaimById["claim:replay-identity"]?.basis.includes("latent-topology"));
    assert.ok(runtimeClaimById["claim:replay-identity"]?.assumptions?.includes("observed-collapse-history-is-not-yet-committed"));
    assert.deepEqual(
        runtimeClaimById["claim:replay-identity"]?.evidenceIds?.filter((entry) => entry.startsWith("evidence:collapse:")),
        [
            "evidence:collapse:semantic:9:hidden-region:OuterCanopy",
            "evidence:collapse:semantic:10:latent-bubble:WaitingArchive",
        ],
    );
    assert.match(runtimeClaimById["claim:replay-identity"]?.explanation ?? "", /no longer pristine latent possibility/);

    assert.equal(runtimeClaimById["claim:internal-law-consistency"]?.scope, "materialized-run");
    assert.ok(runtimeClaimById["claim:internal-law-consistency"]?.basis.includes("collapse-record"));
    assert.ok(runtimeClaimById["claim:internal-law-consistency"]?.basis.includes("observed-history-shape-partially-committed"));
    assert.ok(runtimeClaimById["claim:internal-law-consistency"]?.assumptions?.includes("observed-collapse-history-is-not-yet-committed"));
    assert.match(runtimeClaimById["claim:internal-law-consistency"]?.explanation ?? "", /Observed collapse records/);
});
test("materialization distinguishes declared history support from materialized history evidence and links proof claims to evidence", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "archive-history.bubble" });
    const plan = planBubbleProgram(program);
    const materialized = materializeBubbleProgram(program);

    assert.equal(plan.ontology.anchorPoint.declaredHistorySupport, true);
    assert.equal(plan.ontology.anchorPoint.materializedHistoryEvidence, false);
    assert.equal(materialized.runtimeOntology.anchorPoint.declaredHistorySupport, true);
    assert.equal(materialized.runtimeOntology.anchorPoint.materializedHistoryEvidence, true);

    const anchorEvidence = materialized.evidence.find((entry) => entry.kind === "anchor-point-state");
    assert.equal(anchorEvidence?.declaredHistorySupport, true);
    assert.equal(anchorEvidence?.materializedHistoryEvidence, true);

    const requiredEffectsClaim = plan.proof.claims.find((claim) => claim.id === "claim:required-effect-obligations");
    assert.ok(requiredEffectsClaim);
    assert.equal(requiredEffectsClaim.scope, "plan");
    assert.deepEqual(requiredEffectsClaim.dependsOnClaims, ["claim:minimum-authored-shape"]);
    assert.deepEqual(requiredEffectsClaim.evidenceIds, [
        "evidence:effect:effect:7:observe",
        "evidence:effect:effect:8:commit",
        "evidence:effect:effect:9:spawn",
    ]);

    const replayClaim = plan.proof.claims.find((claim) => claim.id === "claim:replay-identity");
    assert.ok(replayClaim);
    assert.equal(replayClaim.scope, "plan");
    assert.deepEqual(replayClaim.dependsOnClaims, ["claim:anchor-identity"]);
    assert.deepEqual(replayClaim.assumptions, ["same-world-replay-is-evaluated-from-the-current-plan-basis"]);
    assert.deepEqual(replayClaim.evidenceIds, [
        "evidence:anchor-point:bubble:archive-history.bubble::root:Archive",
        "evidence:positive-sea:bubble:archive-history.bubble::root:Archive",
        "evidence:negative-sea:bubble:archive-history.bubble::root:Archive",
        "evidence:observe:bubble:archive-history.bubble::root:Archive",
        "evidence:effect:effect:7:observe",
        "evidence:effect:effect:8:commit",
    ]);
});

test("materializes direct quoted artifacts without generator arguments", () => {
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

    assert.equal(materialized.artifacts.length, 1);
    assert.equal(materialized.artifacts[0].target, "artifact");
    assert.equal(materialized.artifacts[0].address, null);
    assert.equal(materialized.artifacts[0].program.bubble.seed, "latent_seed");
    assert.equal(materialized.trace.at(-1)?.kind, "materialization-committed");
});

test("records observation evidence even when no staged emissions exist", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "observatory.bubble" });
    const materialized = materializeBubbleProgram(program);

    assert.equal(materialized.artifacts.length, 0);
    assert.equal(materialized.commits.length, 0);
    assert.deepEqual(materialized.evidence, [
        {
            id: "evidence:negative-sea:bubble:observatory.bubble::root:Observatory",
            kind: "negative-sea-state",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            pressure: "low",
            signals: [],
            pressureSources: [],
            description: "Bubble Observatory currently shows low negative-sea pressure.",
        },
        {
            id: "evidence:positive-sea:bubble:observatory.bubble::root:Observatory",
            kind: "positive-sea-state",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            support: "present",
            signals: ["source-lineage-address", "seeded-origin", "declared-history-support"],
            supportSources: [
                {
                    kind: "source-lineage",
                    addressId: "bubble:observatory.bubble::root:Observatory",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["source-lineage-address"],
                },
                {
                    kind: "seed-origin",
                    addressId: "bubble:observatory.bubble::root:Observatory",
                    sourceEffectId: null,
                    support: "present",
                    evidenceBasis: ["seeded-origin"],
                },
                {
                    kind: "declared-history-support",
                    addressId: "bubble:observatory.bubble::root:Observatory",
                    sourceEffectId: "effect:7:commit",
                    support: "present",
                    evidenceBasis: ["declared-history-support"],
                },
            ],
            description: "Bubble Observatory currently shows present positive-sea support via source-lineage-address, seeded-origin, declared-history-support.",
        },
        {
            id: "evidence:anchor-point:bubble:observatory.bubble::root:Observatory",
            kind: "anchor-point-state",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
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
            id: "evidence:observe:bubble:observatory.bubble::root:Observatory",
            kind: "observation-context",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            description: "Bubble Observatory declares observation mode witness with declared history support.",
        },
        {
            id: "evidence:effect:effect:6:observe",
            kind: "effect-trace",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
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
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
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
    assert.equal(materialized.trace.at(-1)?.kind, "no-emissions");
});

test("internal consistency proof records unresolved semantic fragments as undetermined basis", () => {
    const source = [
        "bubble Threshold {",
        "  axiom coherence = stable",
        "  will \"hold an incomplete law\"",
        "  seed threshold_seed",
        "  effect observe required",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "threshold.bubble" });
    program.bubble.unresolvedSemantics = [
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
        {
            id: "semantic:hidden-region",
            kind: "hidden-region",
            name: "hidden-region",
            description: "One region is admitted but hidden from the current observation surface.",
            sourceLine: null,
        },
    ];

    const plan = planBubbleProgram(program);
    const claim = plan.proof.claims.find((entry) => entry.id === "claim:internal-law-consistency");

    assert.ok(claim);
    assert.equal(claim.status, "undetermined");
    assert.deepEqual(claim.basis, [
        "executable-semantic-checker",
        "legacy-text-constraint",
        "legacy-text-partial-law",
        "hidden-region",
    ]);
    assert.match(claim.explanation, /Partial law/);
    assert.match(claim.explanation, /Constraint/);
    assert.match(claim.explanation, /hidden-region/);
});

test("executable constraints and partial laws certify internal consistency and authored anchor identity", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "anchored-threshold.bubble" });
    const plan = planBubbleProgram(program);
    const claimById = Object.fromEntries(plan.proof.claims.map((claim) => [claim.id, claim]));

    assert.equal(plan.semantics.mode, "bubble-executable-semantics.v1");
    assert.deepEqual(
        plan.semantics.constraints.map(({ name, status, expression }) => ({ name, status, expression })),
        [{
            name: "membraneBalance",
            status: "satisfied",
            expression: "boundary.pressure <= 0",
        }],
    );
    assert.deepEqual(
        plan.semantics.partialLaws.map(({ name, status, expression }) => ({ name, status, expression })),
        [{
            name: "continuityRule",
            status: "satisfied",
            expression: "history.commits and world.seeded",
        }],
    );
    assert.equal(plan.semantics.anchorCriterion?.status, "satisfied");
    assert.equal(claimById["claim:internal-law-consistency"]?.status, "certified");
    assert.equal(claimById["claim:anchor-identity"]?.status, "certified");
    assert.equal(claimById["claim:replay-identity"]?.status, "certified");
    assert.ok(claimById["claim:anchor-identity"]?.basis.includes("positive-source:declared-history-support"));
    assert.ok(claimById["claim:anchor-identity"]?.basis.includes("positive-source-effect:effect:7:commit"));
    assert.ok(claimById["claim:anchor-identity"]?.basis.includes("theorem-condition:stable"));
    assert.ok(claimById["claim:replay-identity"]?.basis.includes("anchor-authored-criterion-status:satisfied"));
    assert.equal(plan.ontology.anchorPoint.authoredCriterionStatus, "satisfied");
    assert.ok(plan.ontology.anchorPoint.authoredCriterionBasis.includes("authored-anchor-criterion"));
    assert.equal(plan.ontology.anchorPoint.identityStatus, "provisional");
});

test("parseable world will criteria become executable pressure in the semantic plan", () => {
    const source = [
        "bubble GuidedPressure {",
        "  axiom coherence = stable",
        "  will history.commits and world.seeded",
        "  seed guided_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "guided-pressure.bubble" });
    const plan = planBubbleProgram(program);

    assert.equal(plan.semantics.worldWillCriterion?.subjectKind, "world-will");
    assert.equal(plan.semantics.worldWillCriterion?.status, "satisfied");
    assert.equal(plan.semantics.worldWillCriterion?.expression, "history.commits and world.seeded");
    assert.ok(plan.ontology.anchorPoint.signals.includes("world-will-criterion"));
    assert.ok(!plan.ontology.anchorPoint.signals.includes("world-will"));
});

test("authored anchor criteria can contradict inferred anchor scoring", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "broken-anchor.bubble" });
    const plan = planBubbleProgram(program);
    const claimById = Object.fromEntries(plan.proof.claims.map((claim) => [claim.id, claim]));

    assert.equal(claimById["claim:internal-law-consistency"]?.status, "certified");
    assert.equal(claimById["claim:anchor-identity"]?.status, "contradicted");
    assert.equal(claimById["claim:replay-identity"]?.status, "contradicted");
    assert.equal(plan.ontology.anchorPoint.authoredCriterionStatus, "violated");
    assert.ok(plan.ontology.anchorPoint.authoredCriterionBasis.includes("anchor-criterion-failed"));
    assert.equal(plan.ontology.anchorPoint.identityStatus, "contradicted");
    assert.equal(plan.proof.verdict, "contradicted");
});

test("violated executable constraints contradict internal consistency", () => {
    const source = [
        "bubble ImpossibleBoundary {",
        "  axiom coherence = stable",
        "  will \"hold a bounded membrane\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  constraint membraneBalance = boundary.pressure < 0",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "impossible-boundary.bubble" });
    const plan = planBubbleProgram(program);
    const claim = plan.proof.claims.find((entry) => entry.id === "claim:internal-law-consistency");

    assert.ok(claim);
    assert.equal(claim.status, "contradicted");
    assert.ok(claim.basis.includes("constraint-violated"));
    assert.equal(plan.proof.verdict, "contradicted");
});

test("violated executable partial laws contradict internal consistency", () => {
    const source = [
        "bubble BrokenLaw {",
        "  axiom coherence = stable",
        "  will \"hold a bounded membrane\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  partial law continuityRule = history.commits = false",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "broken-law.bubble" });
    const plan = planBubbleProgram(program);
    const claim = plan.proof.claims.find((entry) => entry.id === "claim:internal-law-consistency");

    assert.ok(claim);
    assert.equal(plan.semantics.partialLaws[0]?.status, "violated");
    assert.equal(claim.status, "contradicted");
    assert.ok(claim.basis.includes("partial-law-violated"));
    assert.equal(plan.proof.verdict, "contradicted");
});

test("plans staged grammar activations without mutating the current parser", () => {
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
    const plan = planBubbleProgram(program);
    const materialized = materializeBubbleProgram(program);

    assert.deepEqual(plan.grammars, [
        {
            grammarId: "grammar:6:TwigSyntax",
            grammarName: "TwigSyntax",
            artifactKind: "profile-extension",
            profileName: "twig.v0.3",
            extendsProfile: "bubbles.v0.2",
        },
    ]);
    assert.deepEqual(plan.grammarActivationPlan, [
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
    assert.deepEqual(plan.bundle.members, [
        {
            memberId: "bundle-member:bubble:grammar-nursery.bubble::root:GrammarNursery",
            kind: "root-bubble",
            emissionId: null,
            activationId: null,
            addressId: "bubble:grammar-nursery.bubble::root:GrammarNursery",
            profileName: "bubbles.v0.3",
            sourcePath: "grammar-nursery.bubble",
            provenance: "root-bubble",
            description: "Root bubble GrammarNursery anchors this bundle.",
        },
        {
            memberId: "bundle-member:activate-grammar:7:TwigSyntax",
            kind: "grammar-activation",
            emissionId: null,
            activationId: "activate-grammar:7:TwigSyntax",
            addressId: "bubble:grammar-nursery.bubble::root:GrammarNursery",
            profileName: "twig.v0.3",
            sourcePath: "grammar-nursery.bubble",
            provenance: "staged-grammar-activation",
            description: "Grammar activation activate-grammar:7:TwigSyntax contributes a staged language-boundary member to the bundle.",
        },
    ]);
    assert.deepEqual(materialized.trace.map((event) => event.kind), [
        "materialization-started",
        "grammar-activation-staged",
        "no-emissions",
    ]);
    assert.equal(materialized.trace[1].activationId, "activate-grammar:7:TwigSyntax");
    assert.equal(materialized.artifacts.length, 0);
});

test("resolves staged grammar activations to the declared profile when none is requested explicitly", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "  activate grammar TwigSyntax",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "grammar-nursery-default-profile.bubble" });
    const plan = planBubbleProgram(program);

    assert.deepEqual(plan.grammarActivationPlan, [
        {
            activationId: "activate-grammar:7:TwigSyntax",
            grammarId: "grammar:6:TwigSyntax",
            grammarName: "TwigSyntax",
            requestedProfileName: null,
            resolvedProfileName: "twig.v0.3",
            extendsProfile: "bubbles.v0.2",
            staged: true,
        },
    ]);
});