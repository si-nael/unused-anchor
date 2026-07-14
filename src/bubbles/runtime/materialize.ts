import type {
    BubbleAddressIR,
    BubbleEmissionIR,
    BubbleExpressionIR,
    BubbleGrammarActivationIR,
    BubbleGrammarIR,
    BubbleGeneratorIR,
    BubbleProgramIR,
    BubbleQuoteIR,
    BubbleReflectionIR,
} from "../ir";
import { compileBubbleSource, formatBubbleExpression } from "../language";
import {
    createLocalObservationCommitId,
    createCollapseRecordEvidence,
    createCommitEvidence,
    createEventSourceAttributionEvidence,
    createEffectTraceEvidence,
    createObservationEvidence,
    createObservationCommitPolicyComparison,
    createObservationCommitPolicyPlan,
    createSeaAnchorEvidence,
    createSelfRealizationEvidence,
} from "./evidence";
import {
    buildSeaAnchorAssessment,
    withMaterializedHistoryEvidence,
} from "./ontology";
import {
    buildConsistencyCertificate,
    buildMaterializedConsistencyCertificate,
} from "./proof";
import { buildSemanticEvaluationPlan } from "./semantics";
import { buildBubbleSelfRealization } from "./self-realization";
import type {
    BubbleBundleMemberPlan,
    BubbleBundlePlan,
    BubbleCollapseRecordEvidenceRecord,
    BubbleEmissionPlan,
    BubbleExecutionPlan,
    BubbleExternalObservationLimit,
    BubbleGrammarActivationPlan,
    BubbleGrammarPlan,
    BubbleHistoryCommitEvidenceRecord,
    BubbleMaterializationCommit,
    BubbleMaterializationResult,
    BubbleMaterializationScopePlan,
    BubbleMaterializationTraceEvent,
    BubbleObservationMaterializationLaw,
    BubbleRuntimeOptions,
    MaterializedBubbleArtifact,
} from "./types";

export function planBubbleProgram(program: BubbleProgramIR, options: BubbleRuntimeOptions = {}): BubbleExecutionPlan {
    const meta = program.bubble.meta;
    const emissions = meta?.emissions ?? [];
    const grammars = buildGrammarPlan(meta?.grammars ?? []);
    const grammarActivationPlan = buildGrammarActivationPlan(meta?.grammarActivations ?? [], grammars);
    const observationMaterializationLaw = buildObservationMaterializationLaw(program);
    const externalObservationLimit = buildExternalObservationLimit(program, observationMaterializationLaw);
    const emissionPlan = emissions.map((emission) => ({
        emissionId: emission.id,
        sourceName: emission.sourceName,
        sourceKind: emission.sourceKind,
        target: emission.target,
        quoteName: emission.provenance.quoteName,
        generatorName: emission.provenance.generatorName,
        derivedAddress: deriveEmissionAddress(program.bubble.address, emission),
        reflectionPaths: emission.provenance.reflectionIds
            .map((reflectionId) => meta?.reflections.find((reflection) => reflection.id === reflectionId)?.path)
            .filter((path): path is string => path !== undefined),
    }));
    const semantics = buildSemanticEvaluationPlan(program, emissionPlan, grammarActivationPlan);
    const ontology = buildSeaAnchorAssessment(program, emissionPlan, semantics);
    const selfRealization = buildBubbleSelfRealization(
        program,
        emissionPlan,
        grammarActivationPlan,
        ontology,
        options.selfRealizationResume ?? null,
    );
    const proof = buildConsistencyCertificate(program, emissionPlan, grammarActivationPlan, ontology, semantics, selfRealization);
    const bundle = buildBundlePlan(program, emissionPlan, grammarActivationPlan);

    const plan = {
        mode: "semantic-plan.v1",
        sourcePath: program.sourcePath,
        profile: program.profile,
        bubbleAddress: program.bubble.address,
        boundary: program.bubble.boundary,
        observationMaterializationLaw,
        externalObservationLimit,
        semantics,
        ontology,
        proof,
        selfRealization,
        bundle,
        latentTopology: program.bubble.latentTopology ?? null,
        observationCommitPolicy: null,
        observationCommitPolicyComparison: null,
        obligations: program.bubble.obligations,
        plannedRelations: program.bubble.generation.relations,
        grammars,
        grammarActivationPlan,
        emissionPlan,
    } satisfies BubbleExecutionPlan;

    const observationCommitPolicyOverride = options.observationCommitPolicyOverride ?? null;
    const observationCommitPolicy = createObservationCommitPolicyPlan(program, plan, observationCommitPolicyOverride);
    const observationCommitPolicyComparison = createObservationCommitPolicyComparison(program, plan, observationCommitPolicyOverride);

    return {
        ...plan,
        observationCommitPolicy,
        observationCommitPolicyComparison,
    };
}

function buildObservationMaterializationLaw(
    program: BubbleProgramIR,
): BubbleObservationMaterializationLaw | null {
    if (!program.bubble.latentTopology) {
        return null;
    }

    return {
        mode: "bubble-observation-materialization-law.v1",
        kernel: "single-region-observation-kernel.v3",
        determinantAxes: [
            "region-kind",
            "observation-surface",
            "history-commit-surface",
            "perturbation-surface",
            "perturbation-mix",
            "nearby-history-influence",
            "commit-status",
            "anchor-strength",
            "anchor-binding",
            "negative-sea-pressure",
            "positive-sea-support",
            "sea-balance",
            "worldhood-condition",
            "membrane-condition",
            "projected-history-shape",
        ],
        stateStructure: {
            anchorBindingRules: [
                {
                    id: "anchor-binding:strong-is-anchored",
                    whenAnchorStrength: "strong",
                    binding: "anchored",
                },
                {
                    id: "anchor-binding:steady-isolated-uncommitted-is-tethered",
                    whenAnchorStrength: "steady",
                    whenNearbyHistoryInfluence: "isolated-latency",
                    whenCommitStatus: "uncommitted",
                    binding: "tethered",
                },
                {
                    id: "anchor-binding:steady-isolated-history-open-is-tethered",
                    whenAnchorStrength: "steady",
                    whenNearbyHistoryInfluence: "isolated-latency",
                    whenCommitStatus: "history-open",
                    binding: "tethered",
                },
                {
                    id: "anchor-binding:steady-defaults-anchored",
                    whenAnchorStrength: "steady",
                    binding: "anchored",
                },
                {
                    id: "anchor-binding:weak-committed-neighborhood-is-tethered",
                    whenAnchorStrength: "weak",
                    whenNearbyHistoryInfluence: "committed-neighborhood",
                    whenCommitStatus: "committed",
                    binding: "tethered",
                },
                {
                    id: "anchor-binding:weak-defaults-drifting",
                    whenAnchorStrength: "weak",
                    binding: "drifting",
                },
            ],
            seaBalanceLaw: {
                positiveSeaRanks: {
                    weak: 0,
                    present: 1,
                    strong: 2,
                },
                negativeSeaRanks: {
                    low: 0,
                    elevated: 1,
                    high: 2,
                },
                positiveSkewThreshold: 1,
                negativeSkewThreshold: -1,
                contestedBalance: "contested",
            },
            membraneRules: [
                {
                    id: "membrane:negative-sea-frays",
                    resultPrefix: "frayed",
                    whenSeaBalance: "negative-skewed",
                },
                {
                    id: "membrane:perturb-plus-history-open-frays",
                    resultPrefix: "frayed",
                    whenPerturbationMix: "perturb-mixed",
                    whenNearbyHistoryInfluence: "history-open-neighborhood",
                },
                {
                    id: "membrane:perturbation-pressures",
                    resultPrefix: "pressured",
                    whenPerturbationMix: "perturb-mixed",
                },
                {
                    id: "membrane:contested-sea-pressures",
                    resultPrefix: "pressured",
                    whenSeaBalance: "contested",
                },
                {
                    id: "membrane:stressed-worldhood-pressures",
                    resultPrefix: "pressured",
                    whenWorldhoodCondition: "stressed",
                },
                {
                    id: "membrane:default-settled",
                    resultPrefix: "settled",
                },
            ],
        },
        realizedFormRules: [
            {
                id: "hidden-region:committed-neighborhood:anchored-frayed",
                regionKind: "hidden-region",
                whenHistoryCoupling: "committed-neighborhood",
                whenAnchorBinding: "anchored",
                whenMembraneCondition: "frayed-edge",
                realizedForm: "boundary-canopy-anchored-fray",
            },
            {
                id: "hidden-region:committed-neighborhood:anchored-perturbed",
                regionKind: "hidden-region",
                whenHistoryCoupling: "committed-neighborhood",
                whenAnchorBinding: "anchored",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "boundary-canopy-anchored-wake",
            },
            {
                id: "hidden-region:committed-neighborhood:anchored-default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "committed-neighborhood",
                whenAnchorBinding: "anchored",
                realizedForm: "boundary-canopy-anchored-edge",
            },
            {
                id: "hidden-region:committed-neighborhood:frayed-default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "committed-neighborhood",
                whenMembraneCondition: "frayed-edge",
                realizedForm: "boundary-canopy-frayed-wake",
            },
            {
                id: "hidden-region:committed-neighborhood:perturbed-default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "committed-neighborhood",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "boundary-canopy-perturbed-edge",
            },
            {
                id: "hidden-region:committed-neighborhood:default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "committed-neighborhood",
                realizedForm: "boundary-canopy-edge",
            },
            {
                id: "hidden-region:history-open:committed:anchored-frayed",
                regionKind: "hidden-region",
                whenHistoryCoupling: "history-open-neighborhood",
                whenCommitStatus: "committed",
                whenAnchorBinding: "anchored",
                whenMembraneCondition: "frayed-edge",
                realizedForm: "boundary-canopy-anchored-fray",
            },
            {
                id: "hidden-region:history-open:committed:anchored-default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "history-open-neighborhood",
                whenCommitStatus: "committed",
                whenAnchorBinding: "anchored",
                realizedForm: "boundary-canopy-anchored-edge",
            },
            {
                id: "hidden-region:history-open:committed:frayed-default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "history-open-neighborhood",
                whenCommitStatus: "committed",
                whenMembraneCondition: "frayed-edge",
                realizedForm: "boundary-canopy-frayed-wake",
            },
            {
                id: "hidden-region:history-open:committed:default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "history-open-neighborhood",
                whenCommitStatus: "committed",
                realizedForm: "boundary-canopy-frayed-edge",
            },
            {
                id: "hidden-region:history-open:frayed-default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "history-open-neighborhood",
                whenMembraneCondition: "frayed-edge",
                realizedForm: "boundary-canopy-frayed-wake",
            },
            {
                id: "hidden-region:history-open:anchored-default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "history-open-neighborhood",
                whenAnchorBinding: "anchored",
                realizedForm: "boundary-canopy-anchored-edge",
            },
            {
                id: "hidden-region:history-open:perturbed-default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "history-open-neighborhood",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "boundary-canopy-perturbed-edge",
            },
            {
                id: "hidden-region:history-open:default",
                regionKind: "hidden-region",
                whenHistoryCoupling: "history-open-neighborhood",
                realizedForm: "boundary-canopy-edge",
            },
            {
                id: "hidden-region:isolated:frayed-default",
                regionKind: "hidden-region",
                whenMembraneCondition: "frayed-edge",
                realizedForm: "boundary-canopy-frayed-edge",
            },
            {
                id: "hidden-region:isolated:anchored-positive-perturbed",
                regionKind: "hidden-region",
                whenAnchorBinding: "anchored",
                whenSeaBalance: "positive-skewed",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "boundary-canopy-anchored-edge",
            },
            {
                id: "hidden-region:isolated:anchored-positive-default",
                regionKind: "hidden-region",
                whenAnchorBinding: "anchored",
                whenSeaBalance: "positive-skewed",
                realizedForm: "boundary-canopy-edge",
            },
            {
                id: "hidden-region:isolated:pressured-perturbed",
                regionKind: "hidden-region",
                whenMembraneCondition: "pressured-edge",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "boundary-canopy-perturbed-edge",
            },
            {
                id: "hidden-region:isolated:default",
                regionKind: "hidden-region",
                realizedForm: "boundary-canopy-edge",
            },
            {
                id: "latent-bubble:committed-neighborhood:anchored-frayed",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "committed-neighborhood",
                whenAnchorBinding: "anchored",
                whenMembraneCondition: "frayed-shell",
                realizedForm: "latent-bubble-anchored-fray",
            },
            {
                id: "latent-bubble:committed-neighborhood:anchored-perturbed",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "committed-neighborhood",
                whenAnchorBinding: "anchored",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "latent-bubble-anchored-echo",
            },
            {
                id: "latent-bubble:committed-neighborhood:anchored-default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "committed-neighborhood",
                whenAnchorBinding: "anchored",
                realizedForm: "latent-bubble-anchored-shell",
            },
            {
                id: "latent-bubble:committed-neighborhood:frayed-default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "committed-neighborhood",
                whenMembraneCondition: "frayed-shell",
                realizedForm: "latent-bubble-frayed-echo",
            },
            {
                id: "latent-bubble:committed-neighborhood:perturbed-default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "committed-neighborhood",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "latent-bubble-perturbed-shell",
            },
            {
                id: "latent-bubble:committed-neighborhood:default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "committed-neighborhood",
                realizedForm: "latent-bubble-shell",
            },
            {
                id: "latent-bubble:history-open:committed:anchored-frayed",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "history-open-neighborhood",
                whenCommitStatus: "committed",
                whenAnchorBinding: "anchored",
                whenMembraneCondition: "frayed-shell",
                realizedForm: "latent-bubble-anchored-fray",
            },
            {
                id: "latent-bubble:history-open:committed:anchored-default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "history-open-neighborhood",
                whenCommitStatus: "committed",
                whenAnchorBinding: "anchored",
                realizedForm: "latent-bubble-anchored-shell",
            },
            {
                id: "latent-bubble:history-open:committed:frayed-default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "history-open-neighborhood",
                whenCommitStatus: "committed",
                whenMembraneCondition: "frayed-shell",
                realizedForm: "latent-bubble-frayed-echo",
            },
            {
                id: "latent-bubble:history-open:committed:default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "history-open-neighborhood",
                whenCommitStatus: "committed",
                realizedForm: "latent-bubble-frayed-shell",
            },
            {
                id: "latent-bubble:history-open:frayed-default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "history-open-neighborhood",
                whenMembraneCondition: "frayed-shell",
                realizedForm: "latent-bubble-frayed-echo",
            },
            {
                id: "latent-bubble:history-open:anchored-default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "history-open-neighborhood",
                whenAnchorBinding: "anchored",
                realizedForm: "latent-bubble-anchored-shell",
            },
            {
                id: "latent-bubble:history-open:perturbed-default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "history-open-neighborhood",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "latent-bubble-perturbed-shell",
            },
            {
                id: "latent-bubble:history-open:default",
                regionKind: "latent-bubble",
                whenHistoryCoupling: "history-open-neighborhood",
                realizedForm: "latent-bubble-shell",
            },
            {
                id: "latent-bubble:isolated:frayed-default",
                regionKind: "latent-bubble",
                whenMembraneCondition: "frayed-shell",
                realizedForm: "latent-bubble-frayed-shell",
            },
            {
                id: "latent-bubble:isolated:anchored-positive-perturbed",
                regionKind: "latent-bubble",
                whenAnchorBinding: "anchored",
                whenSeaBalance: "positive-skewed",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "latent-bubble-anchored-shell",
            },
            {
                id: "latent-bubble:isolated:anchored-positive-default",
                regionKind: "latent-bubble",
                whenAnchorBinding: "anchored",
                whenSeaBalance: "positive-skewed",
                realizedForm: "latent-bubble-shell",
            },
            {
                id: "latent-bubble:isolated:pressured-perturbed",
                regionKind: "latent-bubble",
                whenMembraneCondition: "pressured-shell",
                whenPerturbationMix: "perturb-mixed",
                realizedForm: "latent-bubble-perturbed-shell",
            },
            {
                id: "latent-bubble:isolated:default",
                regionKind: "latent-bubble",
                realizedForm: "latent-bubble-shell",
            },
        ],
        description: "Ordered observation materialization law for one locally materialized latent region, externalized from runtime explanation into an explicit plan-level rule surface.",
    };
}

function buildExternalObservationLimit(
    program: BubbleProgramIR,
    observationMaterializationLaw: BubbleObservationMaterializationLaw | null,
): BubbleExternalObservationLimit {
    const { bubble } = program;
    const latentInteriorKinds = Array.from(new Set([
        ...(bubble.latentTopology?.regions.map((region) => region.kind) ?? []),
        ...(bubble.unresolvedSemantics?.filter((fragment) => fragment.kind === "unobservable-relation").map(() => "unobservable-relation" as const) ?? []),
    ]));
    const recordsObservationContext = bubble.generation.lifecycle.observationMode !== null;
    const mayMaterializeLatentInterior = observationMaterializationLaw !== null;
    const mayRecordCollapse = mayMaterializeLatentInterior && bubble.boundary.observationEffectIds.length > 0;
    const mayAnchorHistory = bubble.boundary.commitEffectIds.length > 0;
    const contactSurfaceFragments: string[] = [];

    if (bubble.boundary.observationEffectIds.length > 0) {
        contactSurfaceFragments.push(`${bubble.boundary.observationEffectIds.length} observation surface${bubble.boundary.observationEffectIds.length === 1 ? "" : "s"}`);
    }

    if (bubble.boundary.perturbEffectIds.length > 0) {
        contactSurfaceFragments.push(`${bubble.boundary.perturbEffectIds.length} perturbation surface${bubble.boundary.perturbEffectIds.length === 1 ? "" : "s"}`);
    }

    if (bubble.boundary.commitEffectIds.length > 0) {
        contactSurfaceFragments.push(`${bubble.boundary.commitEffectIds.length} history-commit surface${bubble.boundary.commitEffectIds.length === 1 ? "" : "s"}`);
    }

    return {
        mode: "bubble-external-observation-limit.v1",
        observerPosition: "outside-bubble",
        preContactInteriorAccess: "concrete-interior-not-fully-readable",
        interiorExistenceMode: "compressed-lawful-existence",
        declaredObservationSurface: bubble.boundary.observationSurface,
        declaredPerturbationSurface: bubble.boundary.perturbationSurface,
        declaredHistorySurface: bubble.boundary.historyCommitSurface,
        latentInteriorKinds,
        causalContactEffectIds: {
            observation: bubble.boundary.observationEffectIds,
            perturbation: bubble.boundary.perturbEffectIds,
            historyCommit: bubble.boundary.commitEffectIds,
        },
        traceConsequences: {
            recordsObservationContext,
            mayMaterializeLatentInterior,
            mayRecordCollapse,
            mayAnchorHistory,
        },
        description: contactSurfaceFragments.length === 0
            ? `Within Bubble semantics, an outside observer cannot fully read the concrete interior of ${bubble.name} before causal contact. The bubble persists as compressed lawful existence${latentInteriorKinds.length === 0 ? "" : ` with latent or unobservable interior structure (${latentInteriorKinds.join(", ")})`}, but no explicit observation, perturbation, or history-commit contact surface is currently declared.`
            : `Within Bubble semantics, an outside observer cannot fully read the concrete interior of ${bubble.name} before causal contact. The bubble persists as compressed lawful existence${latentInteriorKinds.length === 0 ? "" : ` with latent or unobservable interior structure (${latentInteriorKinds.join(", ")})`}, and any outside access must pass through ${contactSurfaceFragments.join(", ")}${mayRecordCollapse ? ", where observation may local-materialize latent interior and record collapse evidence" : ""}.`,
    };
}

export function materializeBubbleProgram(program: BubbleProgramIR, options: BubbleRuntimeOptions = {}): BubbleMaterializationResult {
    const plan = planBubbleProgram(program, options);
    const baseEvidence = createObservationEvidence(program);
    const selfRealizationCommits = createSelfRealizationCommits(program, plan.selfRealization);
    const committedLocalObservationRegionIds = new Set(plan.observationCommitPolicy?.selectedTargetIds ?? []);
    const trace: BubbleMaterializationTraceEvent[] = [
        {
            kind: "materialization-started",
            message: `Started materialization for ${program.bubble.name}.`,
            details: {
                profile: program.profile,
                address: program.bubble.address.id,
            },
        },
    ];
    if (plan.selfRealization !== null) {
        trace.push({
            kind: "self-realization-resolved",
            message: plan.selfRealization.description,
            details: {
                realizationId: plan.selfRealization.realizationId,
                status: plan.selfRealization.status,
                selectedCandidateIds: plan.selfRealization.selectedCandidateIds,
                clockAssumption: plan.selfRealization.clockAssumption,
            },
        });
    }

    for (const activation of plan.grammarActivationPlan) {
        trace.push({
            kind: "grammar-activation-staged",
            activationId: activation.activationId,
            message: activation.resolvedProfileName === null
                ? `Staged grammar activation ${activation.activationId} for ${activation.grammarName}.`
                : `Staged grammar activation ${activation.activationId} for ${activation.grammarName} as ${activation.resolvedProfileName}.`,
            details: {
                grammarId: activation.grammarId,
                grammarName: activation.grammarName,
                requestedProfileName: activation.requestedProfileName,
                resolvedProfileName: activation.resolvedProfileName,
                extendsProfile: activation.extendsProfile,
                staged: activation.staged,
            },
        });
    }

    const meta = program.bubble.meta;
    if (!meta || meta.emissions.length === 0) {
        trace.push({
            kind: "no-emissions",
            message: `Bubble ${program.bubble.name} has no staged emissions to materialize.`,
        });
        const runtimeOntology = withMaterializedHistoryEvidence(
            plan.ontology,
            selfRealizationCommits.length > 0 || committedLocalObservationRegionIds.size > 0,
        );
        const collapseEvidence = createCollapseRecordEvidence(program, plan, runtimeOntology, committedLocalObservationRegionIds);
        appendLocalCollapseTrace(trace, collapseEvidence);
        const commits = [
            ...selfRealizationCommits,
            ...createLocalCollapseCommits(program, collapseEvidence),
        ];
        const commitEvidence = commits.map((commit) => createCommitEvidence(program, commit));
        appendCommitTrace(trace, commits);
        const supportingEvidence = [
            ...createSeaAnchorEvidence(program, runtimeOntology),
            ...baseEvidence,
            ...createSelfRealizationEvidence(program, plan.selfRealization),
            ...collapseEvidence,
            ...commitEvidence,
        ];
        const effectTraceEvidence = createEffectTraceEvidence(program, plan, [], commits, supportingEvidence);
        const eventSourceAttributionEvidence = createEventSourceAttributionEvidence(
            program,
            runtimeOntology,
            [],
            supportingEvidence,
            effectTraceEvidence,
        );
        const evidence = [
            ...supportingEvidence,
            ...effectTraceEvidence,
            ...eventSourceAttributionEvidence,
        ];
        return {
            plan,
            proof: buildMaterializedConsistencyCertificate(program, plan.proof, evidence, plan.semantics),
            runtimeOntology,
            selfRealization: plan.selfRealization,
            artifacts: [],
            commits,
            evidence,
            trace,
        };
    }

    const quotesByName = new Map(meta.quotes.map((quote) => [quote.name, quote]));
    const generatorsByName = new Map(meta.generators.map((generator) => [generator.name, generator]));
    const reflectionsById = new Map(meta.reflections.map((reflection) => [reflection.id, reflection]));
    const artifacts: MaterializedBubbleArtifact[] = [];
    const commits: BubbleMaterializationCommit[] = [...selfRealizationCommits];
    const commitEvidence: BubbleHistoryCommitEvidenceRecord[] = selfRealizationCommits
        .map((commit) => createCommitEvidence(program, commit));
    appendCommitTrace(trace, selfRealizationCommits);

    for (const emission of meta.emissions) {
        const quote = resolveEmissionQuote(emission, quotesByName, generatorsByName);
        const generator = emission.provenance.generatorName === null ? null : generatorsByName.get(emission.provenance.generatorName) ?? null;
        const reflections = resolveEmissionReflections(program, emission, reflectionsById);
        const source = deriveEmissionSource(quote, generator, emission.argument);
        const sourcePath = createMaterializedSourcePath(program.sourcePath, emission.id);
        const compiled = compileBubbleSource(source, { sourcePath });
        const address = deriveEmissionAddress(program.bubble.address, emission);

        trace.push({
            kind: "reflection-captured",
            emissionId: emission.id,
            message: `Captured ${Object.keys(reflections).length} reflections for ${emission.id}.`,
            details: reflections,
        });

        artifacts.push({
            emissionId: emission.id,
            target: emission.target,
            address,
            sourcePath,
            source,
            program: compiled.program,
            diagnostics: compiled.diagnostics,
            reflections,
        });

        trace.push({
            kind: "emission-materialized",
            emissionId: emission.id,
            message: `Materialized emission ${emission.id} from ${emission.sourceName}.`,
            details: {
                target: emission.target,
                address: address?.id ?? null,
                sourceName: emission.sourceName,
            },
        });

        const commit = {
            id: `commit:${emission.id}`,
            emissionId: emission.id,
            committedAddressId: address?.id ?? null,
            description: emission.target === "descendant"
                ? `Committed descendant materialization for ${emission.id} at ${address?.id ?? "<none>"}.`
                : `Committed artifact materialization for ${emission.id}.`,
        } satisfies BubbleMaterializationCommit;
        commits.push(commit);

        if (program.bubble.generation.lifecycle.commitsHistory) {
            commitEvidence.push(createCommitEvidence(program, commit));
        }

        trace.push({
            kind: "materialization-committed",
            emissionId: emission.id,
            message: commit.description,
            details: {
                commitId: commit.id,
            },
        });
    }

    const runtimeOntology = withMaterializedHistoryEvidence(plan.ontology, commitEvidence.length > 0 || committedLocalObservationRegionIds.size > 0);
    const collapseEvidence = createCollapseRecordEvidence(program, plan, runtimeOntology, committedLocalObservationRegionIds);
    appendLocalCollapseTrace(trace, collapseEvidence);
    const localCollapseCommits = createLocalCollapseCommits(program, collapseEvidence);
    commits.push(...localCollapseCommits);
    commitEvidence.push(...localCollapseCommits.map((commit) => createCommitEvidence(program, commit)));
    appendCommitTrace(trace, localCollapseCommits);
    const supportingEvidence = [
        ...createSeaAnchorEvidence(program, runtimeOntology),
        ...baseEvidence,
        ...createSelfRealizationEvidence(program, plan.selfRealization),
        ...collapseEvidence,
        ...commitEvidence,
    ];
    const effectTraceEvidence = createEffectTraceEvidence(program, plan, artifacts, commits, supportingEvidence);
    const eventSourceAttributionEvidence = createEventSourceAttributionEvidence(
        program,
        runtimeOntology,
        artifacts,
        supportingEvidence,
        effectTraceEvidence,
    );
    const evidence = [
        ...supportingEvidence,
        ...effectTraceEvidence,
        ...eventSourceAttributionEvidence,
    ];

    return {
        plan,
        proof: buildMaterializedConsistencyCertificate(program, plan.proof, evidence, plan.semantics),
        runtimeOntology,
        selfRealization: plan.selfRealization,
        artifacts,
        commits,
        evidence,
        trace,
    };
}

function createSelfRealizationCommits(
    program: BubbleProgramIR,
    selfRealization: BubbleExecutionPlan["selfRealization"],
): BubbleMaterializationCommit[] {
    if (selfRealization === null) {
        return [];
    }

    return selfRealization.candidates
        .filter((candidate) => candidate.selected && candidate.consequence === "history-commit")
        .map((candidate) => ({
            id: `commit:self-realization:${candidate.transformationId ?? candidate.candidateId}`,
            emissionId: candidate.candidateId,
            committedAddressId: program.bubble.address.id,
            description: `Committed self-realization ${candidate.transformationName} at ${program.bubble.address.id}; this irreversible realization creates a history arrow.`,
        } satisfies BubbleMaterializationCommit));
}

function createLocalCollapseCommits(
    program: BubbleProgramIR,
    collapseEvidence: BubbleCollapseRecordEvidenceRecord[],
): BubbleMaterializationCommit[] {
    return collapseEvidence
        .filter((record) => record.commitStatus === "committed")
        .map((record) => ({
            id: createLocalObservationCommitId(record.observationStateId),
            emissionId: record.observationStateId,
            committedAddressId: program.bubble.address.id,
            description: `Committed observed local state ${record.observationStateId} for ${record.latentRegionId}.`,
        } satisfies BubbleMaterializationCommit));
}

function appendCommitTrace(
    trace: BubbleMaterializationTraceEvent[],
    commits: BubbleMaterializationCommit[],
): void {
    for (const commit of commits) {
        trace.push({
            kind: "materialization-committed",
            emissionId: commit.emissionId,
            message: commit.description,
            details: {
                commitId: commit.id,
            },
        });
    }
}

function appendLocalCollapseTrace(
    trace: BubbleMaterializationTraceEvent[],
    collapseEvidence: BubbleCollapseRecordEvidenceRecord[],
): void {
    for (const record of collapseEvidence) {
        if (record.observationState.localMaterialization === null) {
            continue;
        }

        trace.push({
            kind: "local-collapse-materialized",
            message: `Locally materialized ${record.observationState.localMaterialization.regionName} into ${record.observationState.id}.`,
            details: {
                latentRegionId: record.latentRegionId,
                observationStateId: record.observationState.id,
                realizedForm: record.observationState.localMaterialization.realizedForm,
                mode: record.observationState.localMaterialization.mode,
            },
        });
    }
}

function buildGrammarPlan(grammars: BubbleGrammarIR[]): BubbleGrammarPlan[] {
    return grammars.map((grammar) => ({
        grammarId: grammar.id,
        grammarName: grammar.name,
        artifactKind: grammar.artifact.kind,
        profileName: grammar.artifact.profileName,
        extendsProfile: grammar.artifact.extendsProfile,
    }));
}

function buildGrammarActivationPlan(
    activations: BubbleGrammarActivationIR[],
    grammars: BubbleGrammarPlan[],
): BubbleGrammarActivationPlan[] {
    const grammarsByName = new Map(grammars.map((grammar) => [grammar.grammarName, grammar]));

    return activations.map((activation) => {
        const grammar = grammarsByName.get(activation.grammarName) ?? null;
        return {
            activationId: activation.id,
            grammarId: grammar?.grammarId ?? null,
            grammarName: activation.grammarName,
            requestedProfileName: activation.profileName,
            resolvedProfileName: activation.profileName ?? grammar?.profileName ?? null,
            extendsProfile: grammar?.extendsProfile ?? null,
            staged: true,
        };
    });
}

function buildBundlePlan(
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
    grammarActivationPlan: BubbleGrammarActivationPlan[],
): BubbleBundlePlan {
    const rootAddressId = program.bubble.address.id;

    return {
        mode: "bubble-bundle-plan.v1",
        bundleId: `bundle:${rootAddressId}`,
        rootAddressId,
        members: [
            {
                memberId: `bundle-member:${rootAddressId}`,
                kind: "root-bubble",
                emissionId: null,
                activationId: null,
                addressId: rootAddressId,
                profileName: program.profile,
                sourcePath: program.sourcePath,
                provenance: "root-bubble",
                description: `Root bubble ${program.bubble.name} anchors this bundle.`,
            },
            ...emissionPlan.map<BubbleBundleMemberPlan>((emission) => ({
                memberId: `bundle-member:${emission.emissionId}`,
                kind: emission.target === "descendant"
                    ? "descendant-bubble"
                    : emission.target === "artifact"
                        ? "artifact"
                        : "staged-emission",
                emissionId: emission.emissionId,
                activationId: null,
                addressId: emission.derivedAddress?.id ?? null,
                profileName: null,
                sourcePath: program.sourcePath,
                provenance: "staged-emission",
                description: emission.target === "descendant"
                    ? `Emission ${emission.emissionId} stages one descendant member inside the bundle.`
                    : emission.target === "artifact"
                        ? `Emission ${emission.emissionId} stages one artifact member inside the bundle.`
                        : `Emission ${emission.emissionId} remains staged inside the bundle without a fixed target.`,
            })),
            ...grammarActivationPlan.map<BubbleBundleMemberPlan>((activation) => ({
                memberId: `bundle-member:${activation.activationId}`,
                kind: "grammar-activation",
                emissionId: null,
                activationId: activation.activationId,
                addressId: rootAddressId,
                profileName: activation.resolvedProfileName,
                sourcePath: program.sourcePath,
                provenance: "staged-grammar-activation",
                description: `Grammar activation ${activation.activationId} contributes a staged language-boundary member to the bundle.`,
            })),
        ],
        materializationScopes: [
            {
                scopeId: `bundle-scope:${rootAddressId}`,
                target: "root-bubble",
                emissionId: null,
                activationId: null,
                addressId: rootAddressId,
                description: `The root bubble ${program.bubble.name} is always inside its own materialization scope.`,
            },
            ...emissionPlan.map<BubbleMaterializationScopePlan>((emission) => ({
                scopeId: `bundle-scope:${emission.emissionId}`,
                target: "emission",
                emissionId: emission.emissionId,
                activationId: null,
                addressId: emission.derivedAddress?.id ?? null,
                description: `Emission ${emission.emissionId} defines one staged materialization scope within the bundle.`,
            })),
            ...grammarActivationPlan.map<BubbleMaterializationScopePlan>((activation) => ({
                scopeId: `bundle-scope:${activation.activationId}`,
                target: "grammar-activation",
                emissionId: null,
                activationId: activation.activationId,
                addressId: rootAddressId,
                description: `Grammar activation ${activation.activationId} defines one staged language-boundary scope within the bundle.`,
            })),
        ],
    };
}

function resolveEmissionQuote(
    emission: BubbleEmissionIR,
    quotesByName: Map<string, BubbleQuoteIR>,
    generatorsByName: Map<string, BubbleGeneratorIR>,
): BubbleQuoteIR {
    if (emission.sourceKind === "quote") {
        const quote = quotesByName.get(emission.sourceName);
        if (quote) {
            return quote;
        }
    }

    const quoteName = emission.provenance.quoteName;
    if (quoteName) {
        const quote = quotesByName.get(quoteName);
        if (quote) {
            return quote;
        }
    }

    const generatorName = emission.provenance.generatorName;
    if (generatorName) {
        const generator = generatorsByName.get(generatorName);
        if (generator) {
            const quote = quotesByName.get(generator.sourceQuoteName);
            if (quote) {
                return quote;
            }
        }
    }

    throw new Error(`Could not resolve quote for emission '${emission.id}'.`);
}

function resolveEmissionReflections(
    program: BubbleProgramIR,
    emission: BubbleEmissionIR,
    reflectionsById: Map<string, BubbleReflectionIR>,
): Record<string, unknown> {
    const resolvedEntries = emission.provenance.reflectionIds.map((reflectionId) => {
        const reflection = reflectionsById.get(reflectionId);
        if (!reflection) {
            return [reflectionId, null] as const;
        }

        return [reflection.path, resolveReflectionValue(program, reflection.path)] as const;
    });

    return Object.fromEntries(resolvedEntries);
}

function resolveReflectionValue(program: BubbleProgramIR, path: string): unknown {
    switch (path) {
        case "self.address":
            return program.bubble.address;
        case "self.profile":
            return program.profile;
        case "self.seed":
            return program.bubble.seed;
        case "self.worldWill":
            return program.bubble.worldWill;
        default:
            return null;
    }
}

function deriveEmissionSource(
    quote: BubbleQuoteIR,
    generator: BubbleGeneratorIR | null,
    argument: BubbleExpressionIR | null,
): string {
    const normalizedSource = normalizeQuotedArtifactSource(quote.artifactSource);

    if (generator === null || generator.parameterName === null || argument === null) {
        return normalizedSource;
    }

    const formattedArgument = formatBubbleExpression(argument);
    const replacedSource = normalizedSource.replace(
        /\bseed\s+("[^"]*"|'[^']*'|[^\s{}]+)/,
        `seed ${formattedArgument}`,
    );

    if (replacedSource !== normalizedSource) {
        return replacedSource;
    }

    return normalizedSource.replace(/\n\}\s*$/, `\n  seed ${formattedArgument}\n}`);
}

function deriveEmissionAddress(baseAddress: BubbleAddressIR, emission: BubbleEmissionIR): BubbleAddressIR | null {
    if (emission.target !== "descendant") {
        return null;
    }

    const path = [
        ...baseAddress.path,
        {
            kind: "spawn" as const,
            key: emission.id,
        },
    ];

    return {
        scheme: baseAddress.scheme,
        locatorKind: "lineage-relative",
        anchor: baseAddress.anchor,
        path,
        id: createAddressId(baseAddress.anchor, path),
    };
}

function createMaterializedSourcePath(sourcePath: string | null, emissionId: string): string {
    return `${sourcePath ?? "<memory>"}#${emissionId}`;
}

function createAddressId(
    anchor: string,
    path: ReadonlyArray<{
        kind: string;
        key: string;
    }>,
): string {
    const encodedPath = path.map((step) => `${step.kind}:${step.key}`).join("/");
    return `bubble:${anchor}::${encodedPath}`;
}

function assertNever(value: never): never {
    throw new Error(`Unhandled effect kind: ${String(value)}`);
}

function normalizeQuotedArtifactSource(source: string): string {
    if (source.includes("\n")) {
        return source;
    }

    const match = source.match(/^bubble\s+([A-Za-z_][\w-]*)\s*\{\s*(.*)\s*\}\s*$/s);
    if (!match) {
        return source;
    }

    const bubbleName = match[1];
    const stringLiterals: string[] = [];
    const maskedBody = match[2].replace(/"[^"]*"|'[^']*'/g, (literal) => {
        const marker = `__bubble_string_${stringLiterals.length}__`;
        stringLiterals.push(literal);
        return marker;
    });
    const body = maskedBody
        .replace(/\s+(?=realization\b)/g, "\n  ")
        .replace(/\s+(?=axiom\b)/g, "\n  ")
        .replace(/\s+(?=will\b)/g, "\n  ")
        .replace(/\s+(?=seed\b)/g, "\n  ")
        .replace(/\s+(?=observe\b)/g, "\n  ")
        .replace(/\s+(?=unknown\b)/g, "\n  ")
        .replace(/\s+(?=constraint\b)/g, "\n  ")
        .replace(/\s+(?=partial\b)/g, "\n  ")
        .replace(/\s+(?=hidden\b)/g, "\n  ")
        .replace(/\s+(?=unobservable\b)/g, "\n  ")
        .replace(/\s+(?=latent\b)/g, "\n  ")
        .replace(/\s+(?=anchor\b)/g, "\n  ")
        .replace(/(?<!effect)\s+(?=spawn\b)/g, "\n  ")
        .replace(/\s+(?=effect\b)/g, "\n  ")
        .replace(/\s+(?=grammar\b)/g, "\n  ")
        .replace(/\s+(?=activate\b)/g, "\n  ")
        .replace(/\s+(?=quote\b)/g, "\n  ")
        .replace(/\s+(?=generator\b)/g, "\n  ")
        .replace(/\s+(?=reflect\b)/g, "\n  ")
        .replace(/\s+(?=emit\b)/g, "\n  ")
        .replace(/__bubble_string_(\d+)__/g, (_marker, indexText) => {
            const index = Number(indexText);
            return stringLiterals[index] ?? _marker;
        })
        .trim();

    const statements = body
        .split(/\n/)
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0)
        .map((statement) => `  ${statement}`);

    return [`bubble ${bubbleName} {`, ...statements, `}`].join("\n");
}
