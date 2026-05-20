import type {
    BubbleAnchorPointAssessment,
    BubbleAnchorPointStrength,
    BubbleAnchorRewindStability,
    BubbleNegativeSeaPressure,
    BubblePositiveSeaSupport,
    BubbleSeaAnchorAssessment,
} from "./ontology";
import type {
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
    | "history-commit"
    | "negative-sea-state"
    | "positive-sea-state"
    | "anchor-point-state"
    | "effect-trace";

export type BubbleEffectTraceMaterializationState = "potential" | "materialized";

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