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
    BubbleExecutionPlan,
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

export function resolveLocalObservationCommitTargetIds(
    program: BubbleProgramIR,
    plan: BubbleExecutionPlan,
): string[] {
    if (!program.bubble.generation.lifecycle.commitsHistory || plan.latentTopology === null) {
        return [];
    }

    const observedDrafts = plan.latentTopology.collapseEvidenceDrafts.filter((draft) => draft.observationEffectIds.length > 0);
    if (observedDrafts.length === 0) {
        return [];
    }

    const localMaterializationTargetId = selectLocalMaterializationTarget(plan.latentTopology.regions);
    if (localMaterializationTargetId === null) {
        return [];
    }

    const targetDraft = observedDrafts.find((draft) => draft.latentRegionId === localMaterializationTargetId);
    if (!targetDraft || targetDraft.commitEffectIds.length === 0) {
        return [];
    }

    if (observedDrafts.length === 1) {
        return [localMaterializationTargetId];
    }

    const regionsById = new Map(plan.latentTopology.regions.map((region) => [region.id, region]));
    const targetRegion = regionsById.get(localMaterializationTargetId) ?? null;
    const observedHiddenRegionCount = observedDrafts.filter((draft) => regionsById.get(draft.latentRegionId)?.kind === "hidden-region").length;
    const latentBubbleSiblingOnly = observedDrafts.every((draft) => {
        if (draft.latentRegionId === localMaterializationTargetId) {
            return true;
        }

        return regionsById.get(draft.latentRegionId)?.kind === "latent-bubble";
    });

    return targetRegion?.kind === "hidden-region"
        && observedHiddenRegionCount === 1
        && latentBubbleSiblingOnly
        ? [localMaterializationTargetId]
        : [];
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