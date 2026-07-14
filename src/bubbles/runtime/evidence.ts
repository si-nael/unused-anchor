import type {
    BubbleAnchorPointAssessment,
    BubbleAnchorPointStrength,
    BubbleAnchorRewindStability,
    BubbleNegativeSeaPressure,
    BubblePositiveSeaSupport,
    BubbleSeaAnchorAssessment,
} from "./ontology";
import type {
    BubbleCollapseEvidenceDraftIR,
    BubbleLatentRegionDescriptorIR,
    BubbleProgramIR,
    EffectIR,
} from "../ir";
import type {
    BubbleObservationCommitPolicyComparison,
    BubbleObservationCommitPolicyDifference,
    BubbleObservationCommitPolicyOverride,
    BubbleExecutionPlan,
    BubbleObservationCommitPolicyHistoryShape,
    BubbleObservationCommitPolicyPlan,
    BubbleObservationMaterializationAnchorBindingRule,
    BubbleObservationMaterializationLaw,
    BubbleObservationMaterializationLawAnchorBinding,
    BubbleObservationMaterializationLawCommitStatus,
    BubbleObservationMaterializationLawMembraneCondition,
    BubbleObservationMaterializationLawNearbyHistoryInfluence,
    BubbleObservationMaterializationLawPerturbationMix,
    BubbleObservationMaterializationLawRealizedForm,
    BubbleObservationMaterializationRealizedFormRule,
    BubbleObservationMaterializationLawSeaBalance,
    BubbleObservationMaterializationMembraneRule,
    BubbleObservationCommitPolicySelectionRule,
    BubbleMaterializationCommit,
    BubbleSelfRealizationPlan,
    MaterializedBubbleArtifact,
} from "./types";

export type BubbleEvidenceKind =
    | "observation-context"
    | "collapse-record"
    | "history-commit"
    | "negative-sea-state"
    | "positive-sea-state"
    | "anchor-point-state"
    | "effect-trace"
    | "self-realization"
    | "event-source-attribution";

export type BubbleEffectTraceMaterializationState = "potential" | "materialized";
export type BubbleEventSourceClassification =
    | "internal-world-event"
    | "negative-sea-pressure"
    | "anchor-drift"
    | "positive-sea-shift"
    | "unresolved-source";
export type BubbleResolvedEventSourceClassification = Exclude<BubbleEventSourceClassification, "unresolved-source">;
export type BubbleEventSourceAttributionStatus = "resolved" | "unresolved";
export type BubbleEventSourceCandidateStrength = "direct" | "contextual";
export type BubbleEventSourceSubjectKind =
    | "collapse-record"
    | "history-commit"
    | "descendant-artifact"
    | "observation-context"
    | "self-realization";
export type BubbleEventSourceOntologyField =
    | "negativeSea.pressure"
    | "positiveSea.support"
    | "anchorPoint.identityStatus"
    | "anchorPoint.rewindStability"
    | "anchorPoint.materializedHistoryEvidence";
export type BubbleEventSourceAttributionBasis =
    | {
        sourceKind: "authored-effect";
        sourceId: string;
        field: "kind" | "scope" | "requirement";
    }
    | {
        sourceKind: "evidence-record";
        sourceId: string;
        field: string;
    }
    | {
        sourceKind: "runtime-ontology";
        sourceId: "runtime-ontology";
        field: BubbleEventSourceOntologyField;
    }
    | {
        sourceKind: "materialized-artifact";
        sourceId: string;
        field: "target" | "address";
    };

export interface BubbleEventSourceCandidate {
    classification: BubbleResolvedEventSourceClassification;
    strength: BubbleEventSourceCandidateStrength;
    basis: BubbleEventSourceAttributionBasis[];
    explanation: string;
}
export type BubbleEffectTraceCausalRelation =
    | "opens-observation-context"
    | "contributes-to-collapse-record"
    | "supports-history-commit"
    | "enables-descendant-materialization"
    | "contributes-negative-sea-pressure"
    | "contributes-positive-sea-support"
    | "influences-anchor-assessment"
    | "governs-self-realization";
export type BubbleCollapseCommitStatus = "uncommitted" | "history-open" | "committed";
export type BubbleObservationStatePhase = "observed-uncommitted" | "observed-history-open" | "observed-committed";
export type BubbleLocalObservationPerturbationMix = BubbleObservationMaterializationLawPerturbationMix;
export type BubbleLocalObservationNearbyHistoryInfluence = BubbleObservationMaterializationLawNearbyHistoryInfluence;
export type BubbleLocalObservationAnchorBinding = BubbleObservationMaterializationLawAnchorBinding;
export type BubbleLocalObservationSeaBalance = BubbleObservationMaterializationLawSeaBalance;
export type BubbleLocalObservationMembraneCondition = BubbleObservationMaterializationLawMembraneCondition;

export interface BubbleLocalObservationStateStructure {
    anchorBinding: BubbleLocalObservationAnchorBinding;
    seaBalance: BubbleLocalObservationSeaBalance;
    membraneCondition: BubbleLocalObservationMembraneCondition;
    historyCoupling: BubbleLocalObservationNearbyHistoryInfluence;
    worldhoodCondition: BubbleSeaAnchorAssessment["theoremWitness"]["condition"];
}

export interface BubbleLocalObservationMaterializationRecord {
    mode: BubbleObservationMaterializationLaw["kernel"];
    latentRegionId: string;
    regionName: string;
    regionKind: BubbleLatentRegionDescriptorIR["kind"];
    realizedForm: BubbleObservationMaterializationLawRealizedForm;
    perturbationMix: BubbleLocalObservationPerturbationMix;
    nearbyHistoryInfluence: BubbleLocalObservationNearbyHistoryInfluence;
    stateStructure: BubbleLocalObservationStateStructure;
    anchorStrength: BubbleAnchorPointStrength;
    negativeSeaPressure: BubbleNegativeSeaPressure;
    positiveSeaSupport: BubblePositiveSeaSupport;
    determinants: string[];
    description: string;
}

interface BubbleEvidenceRecordBase {
    id: string;
    kind: BubbleEvidenceKind;
    bubbleAddressId: string;
    subjectAddressId: string;
    sourcePath: string | null;
    observationMode: string | null;
    emissionId: string | null;
    commitId: string | null;
    description: string;
}

export interface BubbleObservationEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "observation-context";
}

export interface BubbleObservationStateRecord {
    id: string;
    phase: BubbleObservationStatePhase;
    observationMode: string;
    latentRegionId: string;
    sourceSemanticId: string;
    triggerEffectIds: string[];
    perturbEffectIds: string[];
    commitStatus: BubbleCollapseCommitStatus;
    draftStatus: BubbleCollapseEvidenceDraftIR["draftStatus"];
    localMaterialization: BubbleLocalObservationMaterializationRecord | null;
    description: string;
}

export interface BubbleCollapseRecordEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "collapse-record";
    latentRegionId: string;
    sourceSemanticId: string;
    triggerEffectIds: string[];
    perturbEffectIds: string[];
    observationStateId: string;
    observationState: BubbleObservationStateRecord;
    commitStatus: BubbleCollapseCommitStatus;
    draftStatus: BubbleCollapseEvidenceDraftIR["draftStatus"];
}

export interface BubbleHistoryCommitEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "history-commit";
}

export interface BubbleNegativeSeaEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "negative-sea-state";
    pressure: BubbleNegativeSeaPressure;
    signals: string[];
    pressureSources: BubbleSeaAnchorAssessment["negativeSea"]["pressureSources"];
}

export interface BubblePositiveSeaEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "positive-sea-state";
    support: BubblePositiveSeaSupport;
    signals: string[];
    supportSources: BubbleSeaAnchorAssessment["positiveSea"]["supportSources"];
}

export interface BubbleAnchorPointEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "anchor-point-state";
    strength: BubbleAnchorPointStrength;
    declaredHistorySupport: BubbleAnchorPointAssessment["declaredHistorySupport"];
    materializedHistoryEvidence: BubbleAnchorPointAssessment["materializedHistoryEvidence"];
    rewindStability: BubbleAnchorRewindStability;
    signals: string[];
    authoredCriterionStatus: BubbleAnchorPointAssessment["authoredCriterionStatus"];
    authoredCriterionBasis: BubbleAnchorPointAssessment["authoredCriterionBasis"];
    materializedEvidenceSources: BubbleAnchorPointAssessment["materializedEvidenceSources"];
    identityStatus: BubbleAnchorPointAssessment["identityStatus"];
}

export interface BubbleEffectTraceEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "effect-trace";
    effectId: string;
    effectKind: EffectIR["kind"];
    requirement: EffectIR["requirement"];
    scope: EffectIR["scope"];
    sourceLine: number;
    materializationState: BubbleEffectTraceMaterializationState;
    runtimeSignals: string[];
    causalLinks: BubbleEffectTraceCausalLink[];
}

export interface BubbleEffectTraceCausalLink {
    targetKind: Exclude<BubbleEvidenceKind, "effect-trace" | "event-source-attribution"> | "materialized-artifact";
    targetId: string;
    relation: BubbleEffectTraceCausalRelation;
}

export interface BubbleEventSourceAttributionEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "event-source-attribution";
    subjectKind: BubbleEventSourceSubjectKind;
    subjectId: string;
    status: BubbleEventSourceAttributionStatus;
    classification: BubbleEventSourceClassification;
    candidates: BubbleEventSourceCandidate[];
    basis: BubbleEventSourceAttributionBasis[];
}

export interface BubbleSelfRealizationEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "self-realization";
    realizationId: string;
    status: BubbleSelfRealizationPlan["status"];
    governingWillId: string;
    clockAssumption: BubbleSelfRealizationPlan["clockAssumption"];
    stateSource: BubbleSelfRealizationPlan["stateSource"];
    selectedCandidateIds: string[];
    selectedTransformationIds: string[];
    selectedEffectIds: string[];
    continuationCount: number;
    createsHistoryArrow: boolean;
    identityOutcomes: BubbleSelfRealizationPlan["candidates"][number]["identityOutcome"][];
}

export type BubbleEvidenceRecord =
    | BubbleObservationEvidenceRecord
    | BubbleCollapseRecordEvidenceRecord
    | BubbleHistoryCommitEvidenceRecord
    | BubbleNegativeSeaEvidenceRecord
    | BubblePositiveSeaEvidenceRecord
    | BubbleAnchorPointEvidenceRecord
    | BubbleEffectTraceEvidenceRecord
    | BubbleSelfRealizationEvidenceRecord
    | BubbleEventSourceAttributionEvidenceRecord;

export function createSelfRealizationEvidence(
    program: BubbleProgramIR,
    realization: BubbleSelfRealizationPlan | null,
): BubbleSelfRealizationEvidenceRecord[] {
    if (realization === null) {
        return [];
    }

    const selected = realization.candidates.filter((candidate) => candidate.selected);
    return [{
        id: `evidence:${realization.realizationId}`,
        kind: "self-realization",
        bubbleAddressId: program.bubble.address.id,
        subjectAddressId: program.bubble.address.id,
        sourcePath: program.sourcePath,
        observationMode: program.bubble.generation.lifecycle.observationMode,
        emissionId: null,
        commitId: null,
        realizationId: realization.realizationId,
        status: realization.status,
        governingWillId: realization.governingWillId,
        clockAssumption: realization.clockAssumption,
        stateSource: realization.stateSource,
        selectedCandidateIds: realization.selectedCandidateIds,
        selectedTransformationIds: selected
            .map((candidate) => candidate.transformationId)
            .filter((id): id is string => id !== null),
        selectedEffectIds: selected
            .map((candidate) => candidate.effectId)
            .filter((id): id is string => id !== null),
        continuationCount: realization.continuations.length,
        createsHistoryArrow: realization.continuations.some((continuation) => continuation.createsHistoryArrow),
        identityOutcomes: Array.from(new Set(selected.map((candidate) => candidate.identityOutcome))),
        description: realization.description,
    }];
}

export function createSeaAnchorEvidence(
    program: BubbleProgramIR,
    assessment: BubbleSeaAnchorAssessment,
): BubbleEvidenceRecord[] {
    const rootAddressId = program.bubble.address.id;

    return [
        {
            id: `evidence:negative-sea:${rootAddressId}`,
            kind: "negative-sea-state",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: null,
            commitId: null,
            pressure: assessment.negativeSea.pressure,
            signals: assessment.negativeSea.signals,
            pressureSources: assessment.negativeSea.pressureSources,
            description: assessment.negativeSea.signals.length === 0
                ? `Bubble ${program.bubble.name} currently shows low negative-sea pressure.`
                : `Bubble ${program.bubble.name} currently shows ${assessment.negativeSea.pressure} negative-sea pressure via ${assessment.negativeSea.signals.join(", ")}.`,
        } satisfies BubbleNegativeSeaEvidenceRecord,
        {
            id: `evidence:positive-sea:${rootAddressId}`,
            kind: "positive-sea-state",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: null,
            commitId: null,
            support: assessment.positiveSea.support,
            signals: assessment.positiveSea.signals,
            supportSources: assessment.positiveSea.supportSources,
            description: assessment.positiveSea.signals.length === 0
                ? `Bubble ${program.bubble.name} currently shows weak positive-sea support.`
                : `Bubble ${program.bubble.name} currently shows ${assessment.positiveSea.support} positive-sea support via ${assessment.positiveSea.signals.join(", ")}.`,
        } satisfies BubblePositiveSeaEvidenceRecord,
        {
            id: `evidence:anchor-point:${rootAddressId}`,
            kind: "anchor-point-state",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: null,
            commitId: null,
            strength: assessment.anchorPoint.strength,
            declaredHistorySupport: assessment.anchorPoint.declaredHistorySupport,
            materializedHistoryEvidence: assessment.anchorPoint.materializedHistoryEvidence,
            rewindStability: assessment.anchorPoint.rewindStability,
            signals: assessment.anchorPoint.signals,
            authoredCriterionStatus: assessment.anchorPoint.authoredCriterionStatus,
            authoredCriterionBasis: assessment.anchorPoint.authoredCriterionBasis,
            materializedEvidenceSources: assessment.anchorPoint.materializedEvidenceSources,
            identityStatus: assessment.anchorPoint.identityStatus,
            description: `Bubble ${program.bubble.name} currently shows ${assessment.anchorPoint.strength} inferred anchor support with ${assessment.anchorPoint.rewindStability} rewind stability and ${assessment.anchorPoint.identityStatus} identity status.`,
        } satisfies BubbleAnchorPointEvidenceRecord,
    ];
}

export function createObservationEvidence(program: BubbleProgramIR): BubbleObservationEvidenceRecord[] {
    const observationMode = program.bubble.generation.lifecycle.observationMode;
    if (observationMode === null) {
        return [];
    }

    const rootAddressId = program.bubble.address.id;
    return [
        {
            id: `evidence:observe:${rootAddressId}`,
            kind: "observation-context",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode,
            emissionId: null,
            commitId: null,
            description: program.bubble.generation.lifecycle.commitsHistory
                ? `Bubble ${program.bubble.name} declares observation mode ${observationMode} with declared history support.`
                : `Bubble ${program.bubble.name} declares observation mode ${observationMode}.`,
        },
    ];
}

export function createCollapseRecordEvidence(
    program: BubbleProgramIR,
    plan: BubbleExecutionPlan,
    runtimeOntology: BubbleSeaAnchorAssessment,
    committedLocalObservationRegionIds: ReadonlySet<string> = new Set<string>(),
): BubbleCollapseRecordEvidenceRecord[] {
    const latentTopology = plan.latentTopology;
    const observationMode = program.bubble.generation.lifecycle.observationMode;
    if (latentTopology === null || observationMode === null) {
        return [];
    }

    const rootAddressId = program.bubble.address.id;
    const regionsById = new Map(latentTopology.regions.map((region) => [region.id, region]));
    const localMaterializationTargetId = selectLocalMaterializationTarget(latentTopology.regions);
    const observedDrafts = latentTopology.collapseEvidenceDrafts.filter((draft) => draft.observationEffectIds.length > 0);

    return observedDrafts
        .map((draft) => {
            const region = regionsById.get(draft.latentRegionId) ?? null;
            const observationStateId = `observation-state:${draft.latentRegionId}`;
            const commitStatus = resolveCollapseCommitStatus(
                draft,
                committedLocalObservationRegionIds.has(draft.latentRegionId),
            );
            const observationState = createObservationStateRecord(
                observationStateId,
                observationMode,
                draft,
                commitStatus,
                region,
                runtimeOntology,
                plan.observationMaterializationLaw,
                plan.observationCommitPolicy,
                localMaterializationTargetId === draft.latentRegionId,
            );

            return {
                id: `evidence:collapse:${draft.sourceSemanticId}`,
                kind: "collapse-record",
                bubbleAddressId: rootAddressId,
                subjectAddressId: rootAddressId,
                sourcePath: program.sourcePath,
                observationMode,
                emissionId: null,
                commitId: commitStatus === "committed" ? createLocalObservationCommitId(observationStateId) : null,
                latentRegionId: draft.latentRegionId,
                sourceSemanticId: draft.sourceSemanticId,
                triggerEffectIds: draft.observationEffectIds,
                perturbEffectIds: draft.perturbEffectIds,
                observationStateId,
                observationState,
                commitStatus,
                draftStatus: draft.draftStatus,
                description: describeCollapseRecord(program, region, draft, observationStateId, commitStatus),
            } satisfies BubbleCollapseRecordEvidenceRecord;
        });
}

export function createObservationCommitPolicyPlan(
    program: BubbleProgramIR,
    plan: BubbleExecutionPlan,
    override: BubbleObservationCommitPolicyOverride | null = null,
): BubbleObservationCommitPolicyPlan | null {
    const context = collectObservationCommitPolicyContext(program, plan);
    if (context === null) {
        return null;
    }

    const { selectionRule, selectedTargetIds } = resolveObservationCommitPolicySelection(program, context, override);
    const deferredTargetIds = context.observedRegionIds.filter((regionId) => !selectedTargetIds.includes(regionId));
    const projectedCommitStatuses = context.observedDrafts.map((draft) =>
        resolveCollapseCommitStatus(draft, selectedTargetIds.includes(draft.latentRegionId)),
    );
    const projectedHistoryShape = resolveProjectedObservationCommitShape(projectedCommitStatuses);
    const baseDescription = describeObservationCommitPolicy(
        program,
        selectionRule,
        context.localMaterializationTargetId,
        selectedTargetIds,
        deferredTargetIds,
        projectedHistoryShape,
    );

    return {
        mode: "runtime-observation-commit-policy.v1",
        policyId: `observation-commit-policy:${program.bubble.address.id}`,
        decisionSource: override === null ? "bounded-runtime" : "runtime-override",
        selectionRule,
        localMaterializationTargetId: context.localMaterializationTargetId,
        observedRegionIds: context.observedRegionIds,
        selectedTargetIds,
        deferredTargetIds,
        projectedHistoryShape,
        description: override === null
            ? baseDescription
            : `${baseDescription} Runtime override forces selection rule ${override.forcedSelectionRule} (${override.reason}).`,
    } satisfies BubbleObservationCommitPolicyPlan;
}

export function createObservationCommitPolicyComparison(
    program: BubbleProgramIR,
    plan: BubbleExecutionPlan,
    override: BubbleObservationCommitPolicyOverride | null = null,
): BubbleObservationCommitPolicyComparison | null {
    const baseline = createObservationCommitPolicyPlan(program, plan, null);
    if (baseline === null) {
        return null;
    }

    const effective = createObservationCommitPolicyPlan(program, plan, override);
    if (effective === null) {
        return null;
    }

    const differences = compareObservationCommitPolicyPlans(baseline, effective);

    return {
        mode: "runtime-observation-commit-policy-comparison.v1",
        comparisonId: `observation-commit-policy-comparison:${program.bubble.address.id}`,
        overrideApplied: override !== null,
        override,
        baseline,
        effective,
        differences,
        description: describeObservationCommitPolicyComparison(program, baseline, effective, override, differences),
    } satisfies BubbleObservationCommitPolicyComparison;
}

export function createEffectTraceEvidence(
    program: BubbleProgramIR,
    plan: BubbleExecutionPlan,
    artifacts: MaterializedBubbleArtifact[],
    commits: BubbleMaterializationCommit[],
    supportingEvidence: BubbleEvidenceRecord[],
): BubbleEffectTraceEvidenceRecord[] {
    const rootAddressId = program.bubble.address.id;

    return program.bubble.effects.map((effect) => {
        const runtimeSignals = resolveEffectRuntimeSignals(effect, plan, artifacts, commits, program);
        const materializationState = resolveEffectMaterializationState(effect, artifacts, commits, program, supportingEvidence);
        const causalLinks = resolveEffectCausalLinks(effect, artifacts, supportingEvidence);

        return {
            id: `evidence:effect:${effect.id}`,
            kind: "effect-trace",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: null,
            commitId: null,
            effectId: effect.id,
            effectKind: effect.kind,
            requirement: effect.requirement,
            scope: effect.scope,
            sourceLine: effect.sourceLine,
            materializationState,
            runtimeSignals,
            causalLinks,
            description: runtimeSignals.length === 0
                ? `Bubble ${program.bubble.name} recorded ${effect.requirement} ${effect.scope} ${effect.kind} as ${materializationState} in this run.`
                : `Bubble ${program.bubble.name} recorded ${effect.requirement} ${effect.scope} ${effect.kind} as ${materializationState} in this run via ${runtimeSignals.join(", ")}.`,
        };
    });
}

export function createEventSourceAttributionEvidence(
    program: BubbleProgramIR,
    assessment: BubbleSeaAnchorAssessment,
    artifacts: MaterializedBubbleArtifact[],
    supportingEvidence: BubbleEvidenceRecord[],
    effectTraces: BubbleEffectTraceEvidenceRecord[],
): BubbleEventSourceAttributionEvidenceRecord[] {
    const rootAddressId = program.bubble.address.id;
    const negativeSeaEvidence = supportingEvidence.find(
        (evidence): evidence is BubbleNegativeSeaEvidenceRecord => evidence.kind === "negative-sea-state",
    );
    const positiveSeaEvidence = supportingEvidence.find(
        (evidence): evidence is BubblePositiveSeaEvidenceRecord => evidence.kind === "positive-sea-state",
    );
    const anchorEvidence = supportingEvidence.find(
        (evidence): evidence is BubbleAnchorPointEvidenceRecord => evidence.kind === "anchor-point-state",
    );
    const negativeSourceEffectIds = new Set(
        assessment.negativeSea.pressureSources
            .map((source) => source.sourceEffectId)
            .filter((effectId): effectId is string => effectId !== null),
    );
    const materializedEffectIds = new Set(
        effectTraces
            .filter((trace) => trace.materializationState === "materialized")
            .map((trace) => trace.effectId),
    );
    const attributions: BubbleEventSourceAttributionEvidenceRecord[] = [];
    const collapseRecords = supportingEvidence.filter(
        (evidence): evidence is BubbleCollapseRecordEvidenceRecord => evidence.kind === "collapse-record",
    );

    for (const collapse of collapseRecords) {
        const negativeEffectIds = collapse.perturbEffectIds.filter(
            (effectId) => negativeSourceEffectIds.has(effectId) && materializedEffectIds.has(effectId),
        );
        const localMaterialization = collapse.observationState.localMaterialization;
        const hasConcreteAnchorDrift = localMaterialization?.stateStructure.anchorBinding === "drifting"
            && collapse.commitStatus !== "committed"
            && (
                assessment.anchorPoint.identityStatus === "contradicted"
                || assessment.anchorPoint.identityStatus === "undetermined"
                || assessment.anchorPoint.rewindStability === "fragile"
            );
        const hasSpecificCandidate = negativeEffectIds.length > 0 || hasConcreteAnchorDrift;
        const candidates: BubbleEventSourceCandidate[] = [];

        if (collapse.triggerEffectIds.length > 0) {
            candidates.push({
                classification: "internal-world-event",
                strength: hasSpecificCandidate ? "contextual" : "direct",
                basis: [
                    evidenceBasis(collapse.id, "triggerEffectIds"),
                    ...collapse.triggerEffectIds.flatMap((effectId) => authoredEffectBasis(effectId)),
                ],
                explanation: hasSpecificCandidate
                    ? "Authored local observation triggered this collapse, but more specific sea or anchor evidence also shaped the realized event."
                    : "Authored local observation is the only concrete source carried by this collapse record.",
            });
        }

        if (negativeEffectIds.length > 0) {
            candidates.push({
                classification: "negative-sea-pressure",
                strength: "direct",
                basis: [
                    evidenceBasis(collapse.id, "perturbEffectIds"),
                    ...negativeEffectIds.flatMap((effectId) => authoredEffectBasis(effectId)),
                    ...(negativeSeaEvidence ? [evidenceBasis(negativeSeaEvidence.id, "pressureSources")] : []),
                    ontologyBasis("negativeSea.pressure"),
                ],
                explanation: "A perturbation recorded on this concrete collapse is also an explicit negative-sea pressure source in the same run.",
            });
        }

        if (hasConcreteAnchorDrift) {
            candidates.push({
                classification: "anchor-drift",
                strength: "direct",
                basis: [
                    evidenceBasis(collapse.id, "observationState.localMaterialization.stateStructure.anchorBinding"),
                    ...(anchorEvidence ? [evidenceBasis(anchorEvidence.id, "identityStatus")] : []),
                    ontologyBasis("anchorPoint.identityStatus"),
                    ontologyBasis("anchorPoint.rewindStability"),
                ],
                explanation: "The concrete local materialization is drifting while same-world identity or rewind support is not securely holding its uncommitted record.",
            });
        }

        attributions.push(createAttributionRecord({
            program,
            subjectKind: "collapse-record",
            subjectId: collapse.id,
            subjectAddressId: collapse.subjectAddressId,
            observationMode: collapse.observationMode,
            emissionId: collapse.emissionId,
            commitId: collapse.commitId,
            candidates,
        }));
    }

    for (const realization of supportingEvidence.filter(
        (evidence): evidence is BubbleSelfRealizationEvidenceRecord => evidence.kind === "self-realization",
    )) {
        if (realization.selectedCandidateIds.length === 0) {
            continue;
        }

        const selectedEffects = program.bubble.effects.filter((effect) => realization.selectedEffectIds.includes(effect.id));
        const negativeEffects = selectedEffects.filter((effect) => negativeSourceEffectIds.has(effect.id));
        const positiveEffects = selectedEffects.filter((effect) => effect.kind === "commit" || effect.kind === "spawn");
        const hasAnchorRelease = realization.identityOutcomes.includes("released")
            && (
                assessment.anchorPoint.identityStatus === "contradicted"
                || assessment.anchorPoint.identityStatus === "undetermined"
            );
        const hasSpecificCandidate = negativeEffects.length > 0 || positiveEffects.length > 0 || hasAnchorRelease;
        const candidates: BubbleEventSourceCandidate[] = [{
            classification: "internal-world-event",
            strength: hasSpecificCandidate ? "contextual" : "direct",
            basis: [
                evidenceBasis(realization.id, "governingWillId"),
                evidenceBasis(realization.id, "selectedTransformationIds"),
            ],
            explanation: hasSpecificCandidate
                ? "The bubble's own world will selected this realization, while a more specific sea, continuity, or anchor consequence also materialized."
                : "The bubble's executable world will and authored transformation are the only concrete source of this self-realization.",
        }];

        if (negativeEffects.length > 0) {
            candidates.push({
                classification: "negative-sea-pressure",
                strength: "direct",
                basis: [
                    evidenceBasis(realization.id, "selectedEffectIds"),
                    ...negativeEffects.flatMap((effect) => authoredEffectBasis(effect.id)),
                    ...(negativeSeaEvidence ? [evidenceBasis(negativeSeaEvidence.id, "pressureSources")] : []),
                    ontologyBasis("negativeSea.pressure"),
                ],
                explanation: "The selected self-realization concretely materializes an authored effect that is also a negative-sea pressure source.",
            });
        }

        if (positiveEffects.length > 0) {
            candidates.push({
                classification: "positive-sea-shift",
                strength: "direct",
                basis: [
                    evidenceBasis(realization.id, "selectedEffectIds"),
                    ...positiveEffects.flatMap((effect) => authoredEffectBasis(effect.id)),
                    ...(positiveSeaEvidence ? [evidenceBasis(positiveSeaEvidence.id, "supportSources")] : []),
                    ontologyBasis("positiveSea.support"),
                ],
                explanation: "The selected self-realization concretely commits continuity or opens descendant lineage under the positive-sea structure.",
            });
        }

        if (hasAnchorRelease) {
            candidates.push({
                classification: "anchor-drift",
                strength: "direct",
                basis: [
                    evidenceBasis(realization.id, "identityOutcomes"),
                    ...(anchorEvidence ? [evidenceBasis(anchorEvidence.id, "identityStatus")] : []),
                    ontologyBasis("anchorPoint.identityStatus"),
                ],
                explanation: "The world-will-selected realization releases same-world identity while the runtime anchor does not securely hold it.",
            });
        }

        attributions.push(createAttributionRecord({
            program,
            subjectKind: "self-realization",
            subjectId: realization.id,
            subjectAddressId: realization.subjectAddressId,
            observationMode: realization.observationMode,
            emissionId: realization.emissionId,
            commitId: realization.commitId,
            candidates,
        }));
    }

    for (const commit of supportingEvidence.filter(
        (evidence): evidence is BubbleHistoryCommitEvidenceRecord => evidence.kind === "history-commit",
    )) {
        attributions.push(createAttributionRecord({
            program,
            subjectKind: "history-commit",
            subjectId: commit.id,
            subjectAddressId: commit.subjectAddressId,
            observationMode: commit.observationMode,
            emissionId: commit.emissionId,
            commitId: commit.commitId,
            candidates: [{
                classification: "positive-sea-shift",
                strength: "direct",
                basis: [
                    evidenceBasis(commit.id, "commitId"),
                    ontologyBasis("anchorPoint.materializedHistoryEvidence"),
                ],
                explanation: "This concrete history commit changes durable continuity and therefore constitutes a positive-sea shift for its subject.",
            }],
        }));
    }

    for (const artifact of artifacts.filter((candidate) => candidate.target === "descendant")) {
        const spawnTraces = effectTraces.filter((trace) =>
            trace.materializationState === "materialized"
            && trace.causalLinks.some((link) =>
                link.targetKind === "materialized-artifact"
                && link.targetId === artifact.emissionId
                && link.relation === "enables-descendant-materialization"
            )
        );

        attributions.push(createAttributionRecord({
            program,
            subjectKind: "descendant-artifact",
            subjectId: artifact.emissionId,
            subjectAddressId: artifact.address?.id ?? rootAddressId,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: artifact.emissionId,
            commitId: null,
            candidates: [{
                classification: "positive-sea-shift",
                strength: "direct",
                basis: [
                    artifactBasis(artifact.emissionId, "target"),
                    ...spawnTraces.flatMap((trace) => authoredEffectBasis(trace.effectId)),
                    ...(positiveSeaEvidence ? [evidenceBasis(positiveSeaEvidence.id, "supportSources")] : []),
                    ontologyBasis("positiveSea.support"),
                ],
                explanation: "A descendant was concretely materialized with lineage provenance, changing placement and growth in the positive sea.",
            }],
        }));
    }

    if (collapseRecords.length === 0) {
        for (const observation of supportingEvidence.filter(
            (evidence): evidence is BubbleObservationEvidenceRecord => evidence.kind === "observation-context",
        )) {
            const observationTraces = effectTraces.filter((trace) =>
                trace.materializationState === "materialized"
                && trace.causalLinks.some((link) =>
                    link.targetKind === "observation-context"
                    && link.targetId === observation.id
                )
            );

            if (observationTraces.length === 0) {
                continue;
            }

            attributions.push(createAttributionRecord({
                program,
                subjectKind: "observation-context",
                subjectId: observation.id,
                subjectAddressId: observation.subjectAddressId,
                observationMode: observation.observationMode,
                emissionId: observation.emissionId,
                commitId: observation.commitId,
                candidates: [{
                    classification: "internal-world-event",
                    strength: "direct",
                    basis: [
                        evidenceBasis(observation.id, "observationMode"),
                        ...observationTraces.flatMap((trace) => authoredEffectBasis(trace.effectId)),
                    ],
                    explanation: "The concrete observation context is caused by an authored observation effect and carries no more specific sea or anchor event evidence.",
                }],
            }));
        }
    }

    return attributions;
}

function createAttributionRecord(input: {
    program: BubbleProgramIR;
    subjectKind: BubbleEventSourceSubjectKind;
    subjectId: string;
    subjectAddressId: string;
    observationMode: string | null;
    emissionId: string | null;
    commitId: string | null;
    candidates: BubbleEventSourceCandidate[];
}): BubbleEventSourceAttributionEvidenceRecord {
    const directCandidates = input.candidates.filter((candidate) => candidate.strength === "direct");
    const directClassifications = [...new Set(directCandidates.map((candidate) => candidate.classification))];
    const resolved = directClassifications.length === 1;
    const classification: BubbleEventSourceClassification = resolved
        ? directClassifications[0]
        : "unresolved-source";
    const basis = uniqueAttributionBasis(
        (resolved ? directCandidates : input.candidates).flatMap((candidate) => candidate.basis),
    );
    const candidateNames = input.candidates.map((candidate) => `${candidate.classification}:${candidate.strength}`);

    return {
        id: `evidence:event-source:${input.subjectId}`,
        kind: "event-source-attribution",
        bubbleAddressId: input.program.bubble.address.id,
        subjectAddressId: input.subjectAddressId,
        sourcePath: input.program.sourcePath,
        observationMode: input.observationMode,
        emissionId: input.emissionId,
        commitId: input.commitId,
        subjectKind: input.subjectKind,
        subjectId: input.subjectId,
        status: resolved ? "resolved" : "unresolved",
        classification,
        candidates: input.candidates,
        basis,
        description: resolved
            ? `Classified ${input.subjectKind} ${input.subjectId} as ${classification} from same-run evidence.`
            : `Kept ${input.subjectKind} ${input.subjectId} as unresolved-source because direct evidence did not select exactly one class${candidateNames.length === 0 ? "" : ` among ${candidateNames.join(", ")}`}.`,
    };
}

function authoredEffectBasis(effectId: string): BubbleEventSourceAttributionBasis[] {
    return [
        {
            sourceKind: "authored-effect",
            sourceId: effectId,
            field: "kind",
        },
        {
            sourceKind: "authored-effect",
            sourceId: effectId,
            field: "scope",
        },
    ];
}

function evidenceBasis(sourceId: string, field: string): BubbleEventSourceAttributionBasis {
    return {
        sourceKind: "evidence-record",
        sourceId,
        field,
    };
}

function ontologyBasis(field: BubbleEventSourceOntologyField): BubbleEventSourceAttributionBasis {
    return {
        sourceKind: "runtime-ontology",
        sourceId: "runtime-ontology",
        field,
    };
}

function artifactBasis(
    sourceId: string,
    field: Extract<BubbleEventSourceAttributionBasis, { sourceKind: "materialized-artifact" }>["field"],
): BubbleEventSourceAttributionBasis {
    return {
        sourceKind: "materialized-artifact",
        sourceId,
        field,
    };
}

function uniqueAttributionBasis(
    basis: BubbleEventSourceAttributionBasis[],
): BubbleEventSourceAttributionBasis[] {
    const seen = new Set<string>();
    return basis.filter((entry) => {
        const key = `${entry.sourceKind}:${entry.sourceId}:${entry.field}`;
        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

export function createCommitEvidence(
    program: BubbleProgramIR,
    commit: BubbleMaterializationCommit,
): BubbleHistoryCommitEvidenceRecord {
    return {
        id: `evidence:${commit.id}`,
        kind: "history-commit",
        bubbleAddressId: program.bubble.address.id,
        subjectAddressId: commit.committedAddressId ?? program.bubble.address.id,
        sourcePath: program.sourcePath,
        observationMode: program.bubble.generation.lifecycle.observationMode,
        emissionId: commit.emissionId,
        commitId: commit.id,
        description: `Recorded durable history for ${commit.emissionId} at ${commit.committedAddressId ?? program.bubble.address.id}.`,
    };
}

function resolveEffectMaterializationState(
    effect: EffectIR,
    artifacts: MaterializedBubbleArtifact[],
    commits: BubbleMaterializationCommit[],
    program: BubbleProgramIR,
    supportingEvidence: BubbleEvidenceRecord[],
): BubbleEffectTraceMaterializationState {
    if (supportingEvidence.some(
        (evidence) => evidence.kind === "self-realization" && evidence.selectedEffectIds.includes(effect.id),
    )) {
        return "materialized";
    }

    switch (effect.kind) {
        case "observe":
            return program.bubble.generation.lifecycle.observationMode === null ? "potential" : "materialized";
        case "commit":
            return commits.length > 0 ? "materialized" : "potential";
        case "spawn":
            return artifacts.some((artifact) => artifact.target === "descendant") ? "materialized" : "potential";
        case "branch":
        case "collapse":
        case "leak":
        case "debt":
            return "potential";
        case "perturb":
            return supportingEvidence.some(
                (evidence) => evidence.kind === "collapse-record" && evidence.perturbEffectIds.includes(effect.id),
            )
                ? "materialized"
                : "potential";
        default:
            return assertNever(effect.kind);
    }
}

function resolveCollapseCommitStatus(
    draft: BubbleCollapseEvidenceDraftIR,
    committedLocally = false,
): BubbleCollapseCommitStatus {
    if (committedLocally && draft.commitEffectIds.length > 0) {
        return "committed";
    }

    return draft.commitEffectIds.length === 0 ? "uncommitted" : "history-open";
}

function resolveProjectedObservationCommitShape(
    statuses: BubbleCollapseCommitStatus[],
): BubbleObservationCommitPolicyHistoryShape {
    const committedCount = statuses.filter((status) => status === "committed").length;
    const historyOpenCount = statuses.filter((status) => status === "history-open").length;
    const uncommittedCount = statuses.filter((status) => status === "uncommitted").length;

    if (statuses.length > 0 && committedCount === statuses.length) {
        return "fully-committed";
    }

    if (committedCount > 0) {
        return "partially-committed";
    }

    if (statuses.length > 0 && historyOpenCount === statuses.length) {
        return "history-open-only";
    }

    if (statuses.length > 0 && uncommittedCount === statuses.length) {
        return "uncommitted-only";
    }

    return "mixed-open";
}

interface BubbleObservationCommitPolicyContext {
    observedDrafts: BubbleCollapseEvidenceDraftIR[];
    localMaterializationTargetId: string | null;
    observedRegionIds: string[];
    targetDraft: BubbleCollapseEvidenceDraftIR | null;
    targetRegion: BubbleLatentRegionDescriptorIR | null;
    observedHiddenRegionCount: number;
    latentBubbleSiblingOnly: boolean;
}

function collectObservationCommitPolicyContext(
    program: BubbleProgramIR,
    plan: BubbleExecutionPlan,
): BubbleObservationCommitPolicyContext | null {
    if (plan.latentTopology === null || program.bubble.generation.lifecycle.observationMode === null) {
        return null;
    }

    const observedDrafts = plan.latentTopology.collapseEvidenceDrafts.filter((draft) => draft.observationEffectIds.length > 0);
    if (observedDrafts.length === 0) {
        return null;
    }

    const localMaterializationTargetId = selectLocalMaterializationTarget(plan.latentTopology.regions);
    const regionsById = new Map(plan.latentTopology.regions.map((region) => [region.id, region]));
    const observedRegionIds = observedDrafts.map((draft) => draft.latentRegionId);
    const targetDraft = localMaterializationTargetId === null
        ? null
        : observedDrafts.find((draft) => draft.latentRegionId === localMaterializationTargetId) ?? null;
    const targetRegion = localMaterializationTargetId === null
        ? null
        : regionsById.get(localMaterializationTargetId) ?? null;
    const observedHiddenRegionCount = observedDrafts.filter((draft) => regionsById.get(draft.latentRegionId)?.kind === "hidden-region").length;
    const latentBubbleSiblingOnly = localMaterializationTargetId !== null && observedDrafts.every((draft) => {
        if (draft.latentRegionId === localMaterializationTargetId) {
            return true;
        }

        return regionsById.get(draft.latentRegionId)?.kind === "latent-bubble";
    });

    return {
        observedDrafts,
        localMaterializationTargetId,
        observedRegionIds,
        targetDraft,
        targetRegion,
        observedHiddenRegionCount,
        latentBubbleSiblingOnly,
    };
}

function resolveObservationCommitPolicySelection(
    program: BubbleProgramIR,
    context: BubbleObservationCommitPolicyContext,
    override: BubbleObservationCommitPolicyOverride | null,
): {
    selectionRule: BubbleObservationCommitPolicySelectionRule;
    selectedTargetIds: string[];
} {
    const hasCommitEligibleTarget = program.bubble.generation.lifecycle.commitsHistory
        && context.localMaterializationTargetId !== null
        && context.targetDraft !== null
        && context.targetDraft.commitEffectIds.length > 0;

    if (!hasCommitEligibleTarget) {
        return {
            selectionRule: "defer-no-eligible-observed-target",
            selectedTargetIds: [],
        };
    }

    if (override !== null) {
        switch (override.forcedSelectionRule) {
            case "commit-single-observed-region":
            case "commit-hidden-region-with-latent-bubble-siblings":
                return {
                    selectionRule: override.forcedSelectionRule,
                    selectedTargetIds: context.localMaterializationTargetId === null ? [] : [context.localMaterializationTargetId],
                };
            case "defer-multiple-hidden-region-targets":
            case "defer-no-eligible-observed-target":
                return {
                    selectionRule: override.forcedSelectionRule,
                    selectedTargetIds: [],
                };
            default:
                return assertNever(override.forcedSelectionRule);
        }
    }

    if (context.observedDrafts.length === 1) {
        return {
            selectionRule: "commit-single-observed-region",
            selectedTargetIds: context.localMaterializationTargetId === null ? [] : [context.localMaterializationTargetId],
        };
    }

    if (context.targetRegion?.kind === "hidden-region" && context.observedHiddenRegionCount === 1 && context.latentBubbleSiblingOnly) {
        return {
            selectionRule: "commit-hidden-region-with-latent-bubble-siblings",
            selectedTargetIds: context.localMaterializationTargetId === null ? [] : [context.localMaterializationTargetId],
        };
    }

    if (context.observedHiddenRegionCount > 1) {
        return {
            selectionRule: "defer-multiple-hidden-region-targets",
            selectedTargetIds: [],
        };
    }

    return {
        selectionRule: "defer-no-eligible-observed-target",
        selectedTargetIds: [],
    };
}

function compareObservationCommitPolicyPlans(
    baseline: BubbleObservationCommitPolicyPlan,
    effective: BubbleObservationCommitPolicyPlan,
): BubbleObservationCommitPolicyDifference[] {
    const differences: BubbleObservationCommitPolicyDifference[] = [];

    if (baseline.selectionRule !== effective.selectionRule) {
        differences.push("selection-rule-changed");
    }

    if (!sameIds(baseline.selectedTargetIds, effective.selectedTargetIds)) {
        differences.push("selected-targets-changed");
    }

    if (!sameIds(baseline.deferredTargetIds, effective.deferredTargetIds)) {
        differences.push("deferred-targets-changed");
    }

    if (baseline.projectedHistoryShape !== effective.projectedHistoryShape) {
        differences.push("projected-history-shape-changed");
    }

    return differences;
}

function sameIds(left: string[], right: string[]): boolean {
    return left.length === right.length && left.every((entry, index) => entry === right[index]);
}

export function createLocalObservationCommitId(observationStateId: string): string {
    return `commit:${observationStateId}`;
}

function createObservationStateRecord(
    observationStateId: string,
    observationMode: string,
    draft: BubbleCollapseEvidenceDraftIR,
    commitStatus: BubbleCollapseCommitStatus,
    region: BubbleLatentRegionDescriptorIR | null,
    runtimeOntology: BubbleSeaAnchorAssessment,
    observationMaterializationLaw: BubbleObservationMaterializationLaw | null,
    observationCommitPolicy: BubbleObservationCommitPolicyPlan | null,
    materializeLocally: boolean,
): BubbleObservationStateRecord {
    const regionName = region?.name ?? draft.latentRegionId;
    const localMaterialization = materializeLocally && observationMaterializationLaw !== null
        ? createLocalObservationMaterializationRecord(
            draft,
            region,
            runtimeOntology,
            commitStatus,
            observationMaterializationLaw,
            observationCommitPolicy,
        )
        : null;

    return {
        id: observationStateId,
        phase: resolveObservationStatePhase(commitStatus),
        observationMode,
        latentRegionId: draft.latentRegionId,
        sourceSemanticId: draft.sourceSemanticId,
        triggerEffectIds: draft.observationEffectIds,
        perturbEffectIds: draft.perturbEffectIds,
        commitStatus,
        draftStatus: draft.draftStatus,
        localMaterialization,
        description: localMaterialization === null
            ? `Observation state ${observationStateId} records ${regionName} as ${resolveObservationStatePhase(commitStatus)} under ${observationMode}.`
            : `Observation state ${observationStateId} records ${regionName} as ${resolveObservationStatePhase(commitStatus)} under ${observationMode} with one local materialization kernel.`,
    };
}

function createLocalObservationMaterializationRecord(
    draft: BubbleCollapseEvidenceDraftIR,
    region: BubbleLatentRegionDescriptorIR | null,
    runtimeOntology: BubbleSeaAnchorAssessment,
    commitStatus: BubbleCollapseCommitStatus,
    observationMaterializationLaw: BubbleObservationMaterializationLaw,
    observationCommitPolicy: BubbleObservationCommitPolicyPlan | null,
): BubbleLocalObservationMaterializationRecord {
    const law = observationMaterializationLaw;
    const regionName = region?.name ?? draft.latentRegionId;
    const regionKind = region?.kind ?? "hidden-region";
    const perturbationMix = resolveLocalObservationPerturbationMix(draft);
    const nearbyHistoryInfluence = resolveLocalObservationNearbyHistoryInfluence(observationCommitPolicy);
    const stateStructure = resolveLocalObservationStateStructure(
        law,
        regionKind,
        runtimeOntology,
        perturbationMix,
        nearbyHistoryInfluence,
        commitStatus,
    );
    const realizedForm = resolveLocalObservationRealizedForm(
        law,
        regionKind,
        stateStructure,
        perturbationMix,
        commitStatus,
    );
    const determinants = [
        `law:${law.kernel}`,
        `observation:${region?.observationBoundary ?? "declared-observation-surface"}`,
        `commit:${region?.commitBoundary ?? "undeclared-history-support"}`,
        `perturb:${region?.perturbationMode ?? "no-declared-perturbation"}`,
        `perturbation-mix:${perturbationMix}`,
        `nearby-history:${nearbyHistoryInfluence}`,
        `anchor-binding:${stateStructure.anchorBinding}`,
        `sea-balance:${stateStructure.seaBalance}`,
        `membrane-condition:${stateStructure.membraneCondition}`,
        `worldhood:${stateStructure.worldhoodCondition}`,
        `projected-history:${observationCommitPolicy?.projectedHistoryShape ?? "untracked"}`,
        `anchor:${runtimeOntology.anchorPoint.strength}`,
        `negative-sea:${runtimeOntology.negativeSea.pressure}`,
        `positive-sea:${runtimeOntology.positiveSea.support}`,
        ...draft.observationEffectIds,
        ...draft.perturbEffectIds,
    ];

    return {
        mode: law.kernel,
        latentRegionId: draft.latentRegionId,
        regionName,
        regionKind,
        realizedForm,
        perturbationMix,
        nearbyHistoryInfluence,
        stateStructure,
        anchorStrength: runtimeOntology.anchorPoint.strength,
        negativeSeaPressure: runtimeOntology.negativeSea.pressure,
        positiveSeaSupport: runtimeOntology.positiveSea.support,
        determinants: Array.from(new Set(determinants)),
        description: `Local observation kernel materialized ${regionName} as ${realizedForm} with ${perturbationMix}, ${nearbyHistoryInfluence}, anchor binding ${stateStructure.anchorBinding}, sea balance ${stateStructure.seaBalance}, membrane ${stateStructure.membraneCondition}, and worldhood ${stateStructure.worldhoodCondition}.`,
    };
}

function resolveLocalObservationPerturbationMix(
    draft: BubbleCollapseEvidenceDraftIR,
): BubbleLocalObservationPerturbationMix {
    return draft.perturbEffectIds.length > 0 ? "perturb-mixed" : "observation-only";
}

function resolveLocalObservationNearbyHistoryInfluence(
    observationCommitPolicy: BubbleObservationCommitPolicyPlan | null,
): BubbleLocalObservationNearbyHistoryInfluence {
    if (observationCommitPolicy === null) {
        return "isolated-latency";
    }

    if (observationCommitPolicy.deferredTargetIds.length > 0) {
        return "history-open-neighborhood";
    }

    if (observationCommitPolicy.selectedTargetIds.length > 0) {
        return "committed-neighborhood";
    }

    return "isolated-latency";
}

function resolveLocalObservationStateStructure(
    law: BubbleObservationMaterializationLaw,
    regionKind: BubbleLatentRegionDescriptorIR["kind"],
    runtimeOntology: BubbleSeaAnchorAssessment,
    perturbationMix: BubbleLocalObservationPerturbationMix,
    nearbyHistoryInfluence: BubbleLocalObservationNearbyHistoryInfluence,
    commitStatus: BubbleCollapseCommitStatus,
): BubbleLocalObservationStateStructure {
    return {
        anchorBinding: resolveLocalObservationAnchorBinding(
            law,
            runtimeOntology.anchorPoint.strength,
            nearbyHistoryInfluence,
            commitStatus,
        ),
        seaBalance: resolveLocalObservationSeaBalance(
            law,
            runtimeOntology.negativeSea.pressure,
            runtimeOntology.positiveSea.support,
        ),
        membraneCondition: resolveLocalObservationMembraneCondition(
            law,
            regionKind,
            perturbationMix,
            nearbyHistoryInfluence,
            runtimeOntology,
        ),
        historyCoupling: nearbyHistoryInfluence,
        worldhoodCondition: runtimeOntology.theoremWitness.condition,
    };
}

function resolveLocalObservationAnchorBinding(
    law: BubbleObservationMaterializationLaw,
    anchorStrength: BubbleAnchorPointStrength,
    nearbyHistoryInfluence: BubbleLocalObservationNearbyHistoryInfluence,
    commitStatus: BubbleCollapseCommitStatus,
): BubbleLocalObservationAnchorBinding {
    const matchingRule = law.stateStructure.anchorBindingRules.find((rule) =>
        matchesAnchorBindingRule(rule, anchorStrength, nearbyHistoryInfluence, commitStatus),
    );

    if (matchingRule) {
        return matchingRule.binding;
    }

    throw new Error(`Observation materialization law ${law.kernel} has no anchor-binding rule for ${anchorStrength}/${nearbyHistoryInfluence}/${commitStatus}.`);
}

function resolveLocalObservationSeaBalance(
    law: BubbleObservationMaterializationLaw,
    negativeSeaPressure: BubbleNegativeSeaPressure,
    positiveSeaSupport: BubblePositiveSeaSupport,
): BubbleLocalObservationSeaBalance {
    const balance = law.stateStructure.seaBalanceLaw.positiveSeaRanks[positiveSeaSupport]
        - law.stateStructure.seaBalanceLaw.negativeSeaRanks[negativeSeaPressure];

    if (balance >= law.stateStructure.seaBalanceLaw.positiveSkewThreshold) {
        return "positive-skewed";
    }

    if (balance <= law.stateStructure.seaBalanceLaw.negativeSkewThreshold) {
        return "negative-skewed";
    }

    return law.stateStructure.seaBalanceLaw.contestedBalance;
}

function resolveLocalObservationMembraneCondition(
    law: BubbleObservationMaterializationLaw,
    regionKind: BubbleLatentRegionDescriptorIR["kind"],
    perturbationMix: BubbleLocalObservationPerturbationMix,
    nearbyHistoryInfluence: BubbleLocalObservationNearbyHistoryInfluence,
    runtimeOntology: BubbleSeaAnchorAssessment,
): BubbleLocalObservationMembraneCondition {
    const seaBalance = resolveLocalObservationSeaBalance(
        law,
        runtimeOntology.negativeSea.pressure,
        runtimeOntology.positiveSea.support,
    );
    const suffix = regionKind === "hidden-region" ? "edge" : "shell";
    const matchingRule = law.stateStructure.membraneRules.find((rule) =>
        matchesMembraneRule(
            rule,
            seaBalance,
            perturbationMix,
            nearbyHistoryInfluence,
            runtimeOntology.theoremWitness.condition,
        ),
    );

    const prefix = matchingRule?.resultPrefix ?? "settled";
    return `${prefix}-${suffix}` as BubbleLocalObservationMembraneCondition;
}

function resolveLocalObservationRealizedForm(
    law: BubbleObservationMaterializationLaw,
    regionKind: BubbleLatentRegionDescriptorIR["kind"],
    stateStructure: BubbleLocalObservationStateStructure,
    perturbationMix: BubbleLocalObservationPerturbationMix,
    commitStatus: BubbleCollapseCommitStatus,
): BubbleLocalObservationMaterializationRecord["realizedForm"] {
    const matchingRule = law.realizedFormRules.find((rule) =>
        matchesRealizedFormRule(rule, regionKind, stateStructure, perturbationMix, commitStatus),
    );

    if (matchingRule) {
        return matchingRule.realizedForm;
    }

    throw new Error(
        `Observation materialization law ${law.kernel} has no realized-form rule for ${regionKind}/${stateStructure.historyCoupling}/${stateStructure.anchorBinding}/${stateStructure.membraneCondition}/${perturbationMix}/${commitStatus}.`,
    );
}

function matchesAnchorBindingRule(
    rule: BubbleObservationMaterializationAnchorBindingRule,
    anchorStrength: BubbleAnchorPointStrength,
    nearbyHistoryInfluence: BubbleLocalObservationNearbyHistoryInfluence,
    commitStatus: BubbleCollapseCommitStatus,
): boolean {
    return rule.whenAnchorStrength === anchorStrength
        && (rule.whenNearbyHistoryInfluence === undefined || rule.whenNearbyHistoryInfluence === nearbyHistoryInfluence)
        && (rule.whenCommitStatus === undefined || rule.whenCommitStatus === commitStatus);
}

function matchesMembraneRule(
    rule: BubbleObservationMaterializationMembraneRule,
    seaBalance: BubbleLocalObservationSeaBalance,
    perturbationMix: BubbleLocalObservationPerturbationMix,
    nearbyHistoryInfluence: BubbleLocalObservationNearbyHistoryInfluence,
    worldhoodCondition: BubbleSeaAnchorAssessment["theoremWitness"]["condition"],
): boolean {
    return (rule.whenSeaBalance === undefined || rule.whenSeaBalance === seaBalance)
        && (rule.whenPerturbationMix === undefined || rule.whenPerturbationMix === perturbationMix)
        && (rule.whenNearbyHistoryInfluence === undefined || rule.whenNearbyHistoryInfluence === nearbyHistoryInfluence)
        && (rule.whenWorldhoodCondition === undefined || rule.whenWorldhoodCondition === worldhoodCondition);
}

function matchesRealizedFormRule(
    rule: BubbleObservationMaterializationRealizedFormRule,
    regionKind: BubbleLatentRegionDescriptorIR["kind"],
    stateStructure: BubbleLocalObservationStateStructure,
    perturbationMix: BubbleLocalObservationPerturbationMix,
    commitStatus: BubbleCollapseCommitStatus,
): boolean {
    return rule.regionKind === regionKind
        && (rule.whenHistoryCoupling === undefined || rule.whenHistoryCoupling === stateStructure.historyCoupling)
        && (rule.whenCommitStatus === undefined || rule.whenCommitStatus === commitStatus)
        && (rule.whenAnchorBinding === undefined || rule.whenAnchorBinding === stateStructure.anchorBinding)
        && (rule.whenSeaBalance === undefined || rule.whenSeaBalance === stateStructure.seaBalance)
        && (rule.whenMembraneCondition === undefined || rule.whenMembraneCondition === stateStructure.membraneCondition)
        && (rule.whenPerturbationMix === undefined || rule.whenPerturbationMix === perturbationMix);
}

function selectLocalMaterializationTarget(
    regions: BubbleLatentRegionDescriptorIR[],
): string | null {
    const observationReadyHiddenRegion = regions.find((region) =>
        region.kind === "hidden-region"
        && region.observationBoundary === "declared-observation-surface",
    );
    if (observationReadyHiddenRegion) {
        return observationReadyHiddenRegion.id;
    }

    const firstObservedRegion = regions.find((region) => region.observationBoundary === "declared-observation-surface");
    return firstObservedRegion?.id ?? null;
}

function resolveObservationStatePhase(
    commitStatus: BubbleCollapseCommitStatus,
): BubbleObservationStatePhase {
    switch (commitStatus) {
        case "uncommitted":
            return "observed-uncommitted";
        case "history-open":
            return "observed-history-open";
        case "committed":
            return "observed-committed";
        default:
            return assertNever(commitStatus);
    }
}

function describeCollapseRecord(
    program: BubbleProgramIR,
    region: BubbleLatentRegionDescriptorIR | null,
    draft: BubbleCollapseEvidenceDraftIR,
    observationStateId: string,
    commitStatus: BubbleCollapseCommitStatus,
): string {
    const regionName = region?.name ?? draft.latentRegionId;
    const perturbationText = draft.perturbEffectIds.length === 0
        ? "with no declared perturb contribution"
        : `with perturb contributions ${draft.perturbEffectIds.join(", ")}`;
    const commitText = commitStatus === "history-open"
        ? "history remains open pending a later commit-specific collapse kernel"
        : commitStatus === "committed"
            ? "the collapse is already fixed into committed history"
            : "no commit boundary is currently declared for that collapse";

    return `Bubble ${program.bubble.name} observed latent region ${regionName} into ${observationStateId} via ${draft.observationEffectIds.join(", ")} ${perturbationText}; ${commitText}.`;
}

function describeObservationCommitPolicy(
    program: BubbleProgramIR,
    selectionRule: BubbleObservationCommitPolicySelectionRule,
    localMaterializationTargetId: string | null,
    selectedTargetIds: string[],
    deferredTargetIds: string[],
    projectedHistoryShape: BubbleObservationCommitPolicyHistoryShape,
): string {
    switch (selectionRule) {
        case "commit-single-observed-region":
            return `Bubble ${program.bubble.name} uses one bounded observation commit policy to commit the single observed local target ${selectedTargetIds[0] ?? localMaterializationTargetId ?? "<none>"}, projecting shape ${projectedHistoryShape}.`;
        case "commit-hidden-region-with-latent-bubble-siblings":
            return `Bubble ${program.bubble.name} commits hidden-region target ${selectedTargetIds[0] ?? localMaterializationTargetId ?? "<none>"} while deferring sibling observation states ${deferredTargetIds.join(", ")}, projecting shape ${projectedHistoryShape}.`;
        case "defer-multiple-hidden-region-targets":
            return `Bubble ${program.bubble.name} defers local commit because multiple hidden-region observation targets remain in play (${deferredTargetIds.join(", ")}), projecting shape ${projectedHistoryShape}.`;
        case "defer-no-eligible-observed-target":
            return `Bubble ${program.bubble.name} currently has no eligible observed local commit target under the bounded runtime rule, projecting shape ${projectedHistoryShape}.`;
        default:
            return assertNever(selectionRule);
    }
}

function describeObservationCommitPolicyComparison(
    program: BubbleProgramIR,
    baseline: BubbleObservationCommitPolicyPlan,
    effective: BubbleObservationCommitPolicyPlan,
    override: BubbleObservationCommitPolicyOverride | null,
    differences: BubbleObservationCommitPolicyDifference[],
): string {
    if (override === null) {
        return `Bubble ${program.bubble.name} compares the current bounded observation policy against itself: rule ${effective.selectionRule}, projected shape ${effective.projectedHistoryShape}.`;
    }

    if (differences.length === 0) {
        return `Bubble ${program.bubble.name} applies runtime override ${override.forcedSelectionRule} (${override.reason}), but the effective observation policy remains rule ${effective.selectionRule} with projected shape ${effective.projectedHistoryShape}.`;
    }

    return `Bubble ${program.bubble.name} compares baseline rule ${baseline.selectionRule} / shape ${baseline.projectedHistoryShape} against override-driven rule ${effective.selectionRule} / shape ${effective.projectedHistoryShape}; differences: ${differences.join(", ")}.`;
}

function resolveEffectRuntimeSignals(
    effect: EffectIR,
    plan: BubbleExecutionPlan,
    artifacts: MaterializedBubbleArtifact[],
    commits: BubbleMaterializationCommit[],
    program: BubbleProgramIR,
): string[] {
    switch (effect.kind) {
        case "observe":
            return program.bubble.generation.lifecycle.observationMode === null ? [] : ["observation-surface"];
        case "commit":
            return commits.length > 0 ? ["declared-history-support", "history-commit"] : ["declared-history-support"];
        case "spawn":
            return artifacts.some((artifact) => artifact.target === "descendant")
                ? ["descendant-materialization"]
                : plan.plannedRelations.some((relation) => relation.sourceEffectId === effect.id)
                    ? ["descendant-capability"]
                    : [];
        case "branch":
            return plan.plannedRelations.some((relation) => relation.sourceEffectId === effect.id) ? ["branch-pressure"] : [];
        case "collapse":
            return plan.plannedRelations.some((relation) => relation.sourceEffectId === effect.id) ? ["collapse-capability"] : [];
        case "leak":
            return [effect.scope === "global" ? "global-leak" : effect.scope === "membrane" ? "membrane-leak" : "local-leak"];
        case "debt":
            return ["unresolved-debt"];
        case "perturb":
            return ["law-perturbation"];
        default:
            return assertNever(effect.kind);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled evidence variant: ${String(value)}`);
}

function resolveEffectCausalLinks(
    effect: EffectIR,
    artifacts: MaterializedBubbleArtifact[],
    supportingEvidence: BubbleEvidenceRecord[],
): BubbleEffectTraceCausalLink[] {
    const links: BubbleEffectTraceCausalLink[] = [];

    for (const evidence of supportingEvidence) {
        if (evidence.kind === "self-realization" && evidence.selectedEffectIds.includes(effect.id)) {
            links.push({
                targetKind: evidence.kind,
                targetId: evidence.id,
                relation: "governs-self-realization",
            });
        }

        if (effect.kind === "observe" && evidence.kind === "observation-context") {
            links.push({
                targetKind: evidence.kind,
                targetId: evidence.id,
                relation: "opens-observation-context",
            });
        }

        if (
            evidence.kind === "collapse-record"
            && (
                evidence.triggerEffectIds.includes(effect.id)
                || evidence.perturbEffectIds.includes(effect.id)
            )
        ) {
            links.push({
                targetKind: evidence.kind,
                targetId: evidence.id,
                relation: "contributes-to-collapse-record",
            });
        }

        if (effect.kind === "commit" && evidence.kind === "history-commit") {
            links.push({
                targetKind: evidence.kind,
                targetId: evidence.id,
                relation: "supports-history-commit",
            });
        }

        if (
            evidence.kind === "negative-sea-state"
            && evidence.pressureSources.some((source) => source.sourceEffectId === effect.id)
        ) {
            links.push({
                targetKind: evidence.kind,
                targetId: evidence.id,
                relation: "contributes-negative-sea-pressure",
            });
        }

        if (
            evidence.kind === "positive-sea-state"
            && evidence.supportSources.some((source) => source.sourceEffectId === effect.id)
        ) {
            links.push({
                targetKind: evidence.kind,
                targetId: evidence.id,
                relation: "contributes-positive-sea-support",
            });
        }
    }

    if (effect.kind === "spawn") {
        for (const artifact of artifacts.filter((candidate) => candidate.target === "descendant")) {
            links.push({
                targetKind: "materialized-artifact",
                targetId: artifact.emissionId,
                relation: "enables-descendant-materialization",
            });
        }
    }

    const influencesAnchor = effect.kind === "observe" || effect.kind === "debt" || links.some((link) =>
        link.relation === "contributes-negative-sea-pressure"
        || link.relation === "contributes-positive-sea-support"
        || link.relation === "supports-history-commit"
    );
    const anchorEvidence = supportingEvidence.find((evidence) => evidence.kind === "anchor-point-state");
    if (influencesAnchor && anchorEvidence) {
        links.push({
            targetKind: anchorEvidence.kind,
            targetId: anchorEvidence.id,
            relation: "influences-anchor-assessment",
        });
    }

    return links;
}
