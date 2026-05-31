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
    BubbleObservationCommitPolicySelectionRule,
    BubbleMaterializationCommit,
    MaterializedBubbleArtifact,
} from "./materialize";

export type BubbleEvidenceKind =
    | "observation-context"
    | "collapse-record"
    | "history-commit"
    | "negative-sea-state"
    | "positive-sea-state"
    | "anchor-point-state"
    | "effect-trace";

export type BubbleEffectTraceMaterializationState = "potential" | "materialized";
export type BubbleCollapseCommitStatus = "uncommitted" | "history-open" | "committed";
export type BubbleObservationStatePhase = "observed-uncommitted" | "observed-history-open" | "observed-committed";

export interface BubbleLocalObservationMaterializationRecord {
    mode: "single-region-observation-kernel.v1";
    latentRegionId: string;
    regionName: string;
    regionKind: BubbleLatentRegionDescriptorIR["kind"];
    realizedForm: "boundary-canopy-edge" | "latent-bubble-shell";
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
}

export interface BubblePositiveSeaEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "positive-sea-state";
    support: BubblePositiveSeaSupport;
    signals: string[];
}

export interface BubbleAnchorPointEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "anchor-point-state";
    strength: BubbleAnchorPointStrength;
    declaredHistorySupport: BubbleAnchorPointAssessment["declaredHistorySupport"];
    materializedHistoryEvidence: BubbleAnchorPointAssessment["materializedHistoryEvidence"];
    rewindStability: BubbleAnchorRewindStability;
    signals: string[];
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
}

export type BubbleEvidenceRecord =
    | BubbleObservationEvidenceRecord
    | BubbleCollapseRecordEvidenceRecord
    | BubbleHistoryCommitEvidenceRecord
    | BubbleNegativeSeaEvidenceRecord
    | BubblePositiveSeaEvidenceRecord
    | BubbleAnchorPointEvidenceRecord
    | BubbleEffectTraceEvidenceRecord;

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
            description: `Bubble ${program.bubble.name} currently shows ${assessment.anchorPoint.strength} anchor support with ${assessment.anchorPoint.rewindStability} rewind stability.`,
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
): BubbleEffectTraceEvidenceRecord[] {
    const rootAddressId = program.bubble.address.id;

    return program.bubble.effects.map((effect) => {
        const runtimeSignals = resolveEffectRuntimeSignals(effect, plan, artifacts, commits, program);
        const materializationState = resolveEffectMaterializationState(effect, artifacts, commits, program);

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
            description: runtimeSignals.length === 0
                ? `Bubble ${program.bubble.name} recorded ${effect.requirement} ${effect.scope} ${effect.kind} as ${materializationState} in this run.`
                : `Bubble ${program.bubble.name} recorded ${effect.requirement} ${effect.scope} ${effect.kind} as ${materializationState} in this run via ${runtimeSignals.join(", ")}.`,
        };
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
): BubbleEffectTraceMaterializationState {
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
        case "perturb":
            return "potential";
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
    materializeLocally: boolean,
): BubbleObservationStateRecord {
    const regionName = region?.name ?? draft.latentRegionId;
    const localMaterialization = materializeLocally
        ? createLocalObservationMaterializationRecord(draft, region, runtimeOntology)
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
): BubbleLocalObservationMaterializationRecord {
    const regionName = region?.name ?? draft.latentRegionId;
    const regionKind = region?.kind ?? "hidden-region";
    const realizedForm = regionKind === "hidden-region" ? "boundary-canopy-edge" : "latent-bubble-shell";
    const determinants = [
        `observation:${region?.observationBoundary ?? "declared-observation-surface"}`,
        `commit:${region?.commitBoundary ?? "undeclared-history-support"}`,
        `perturb:${region?.perturbationMode ?? "no-declared-perturbation"}`,
        `anchor:${runtimeOntology.anchorPoint.strength}`,
        `negative-sea:${runtimeOntology.negativeSea.pressure}`,
        `positive-sea:${runtimeOntology.positiveSea.support}`,
        ...draft.observationEffectIds,
        ...draft.perturbEffectIds,
    ];

    return {
        mode: "single-region-observation-kernel.v1",
        latentRegionId: draft.latentRegionId,
        regionName,
        regionKind,
        realizedForm,
        anchorStrength: runtimeOntology.anchorPoint.strength,
        negativeSeaPressure: runtimeOntology.negativeSea.pressure,
        positiveSeaSupport: runtimeOntology.positiveSea.support,
        determinants: Array.from(new Set(determinants)),
        description: `Local observation kernel materialized ${regionName} as ${realizedForm} under anchor ${runtimeOntology.anchorPoint.strength} with ${runtimeOntology.negativeSea.pressure} negative-sea pressure and ${runtimeOntology.positiveSea.support} positive-sea support.`,
    };
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