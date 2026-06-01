import type {
    BubbleEmissionTarget,
    BubbleNegativeSeaSourceKindIR,
    BubblePositiveSeaSourceKindIR,
    BubbleProgramIR,
} from "../ir";
import type { BubbleSemanticEvaluation, BubbleSemanticEvaluationPlan } from "./semantics";

export type BubbleNegativeSeaPressure = "low" | "elevated" | "high";
export type BubblePositiveSeaSupport = "weak" | "present" | "strong";
export type BubbleAnchorPointStrength = "weak" | "steady" | "strong";
export type BubbleAnchorRewindStability = "fragile" | "guarded" | "stable";
export type BubbleAnchorIdentityStatus = "certified" | "provisional" | "contradicted" | "undetermined";
export type BubbleAuthoredAnchorCriterionStatus = "absent" | "satisfied" | "violated" | "undetermined";

export interface BubbleNegativeSeaPressureSource {
    kind: BubbleNegativeSeaSourceKindIR;
    sourceEffectId: string | null;
    relationKind: BubbleProgramIR["bubble"]["generation"]["relations"][number]["kind"] | null;
    boundaryScope: BubbleProgramIR["bubble"]["effects"][number]["scope"] | null;
    strength: BubbleNegativeSeaPressure;
    evidenceBasis: string[];
}

export interface BubblePositiveSeaSupportSource {
    kind: BubblePositiveSeaSourceKindIR;
    addressId: string | null;
    sourceEffectId: string | null;
    support: BubblePositiveSeaSupport;
    evidenceBasis: string[];
}

export interface BubbleAnchorMaterializedEvidenceSource {
    kind: "materialized-history";
    evidenceBasis: string[];
}

export interface BubbleNegativeSeaAssessment {
    pressure: BubbleNegativeSeaPressure;
    signals: string[];
    pressureSources: BubbleNegativeSeaPressureSource[];
}

export interface BubblePositiveSeaAssessment {
    support: BubblePositiveSeaSupport;
    signals: string[];
    supportSources: BubblePositiveSeaSupportSource[];
}

export interface BubbleAnchorPointAssessment {
    strength: BubbleAnchorPointStrength;
    declaredHistorySupport: boolean;
    materializedHistoryEvidence: boolean;
    rewindStability: BubbleAnchorRewindStability;
    signals: string[];
    authoredCriterionStatus: BubbleAuthoredAnchorCriterionStatus;
    authoredCriterionBasis: string[];
    materializedEvidenceSources: BubbleAnchorMaterializedEvidenceSource[];
    identityStatus: BubbleAnchorIdentityStatus;
}

export type BubbleWorldhoodCondition = "stable" | "stressed" | "dissolving";

export interface BubbleSeaAnchorTheoremWitness {
    theorem: "sea-anchor-necessity.v1";
    negativeRank: number;
    positiveRank: number;
    anchorRank: number;
    worldhoodDelta: number;
    identityDelta: number;
    sustained: boolean;
    condition: BubbleWorldhoodCondition;
    explanation: string;
}

export interface BubbleSeaAnchorAssessment {
    negativeSea: BubbleNegativeSeaAssessment;
    positiveSea: BubblePositiveSeaAssessment;
    anchorPoint: BubbleAnchorPointAssessment;
    theoremWitness: BubbleSeaAnchorTheoremWitness;
}

interface BubbleOntologyEmissionPlan {
    target: BubbleEmissionTarget | null;
}

export function buildSeaAnchorAssessment(
    program: BubbleProgramIR,
    emissionPlan: BubbleOntologyEmissionPlan[],
    semantics: BubbleSemanticEvaluationPlan,
): BubbleSeaAnchorAssessment {
    const { bubble } = program;
    const { lifecycle } = bubble.generation;
    const negativePressureSources: BubbleNegativeSeaPressureSource[] = bubble.seaSemantics.negativePressureSources.map((source) => ({
        kind: source.kind,
        sourceEffectId: source.sourceEffectId,
        relationKind: source.relationKind,
        boundaryScope: source.boundaryScope,
        strength: source.strength,
        evidenceBasis: source.evidenceBasis,
    }));
    const positiveSupportSources: BubblePositiveSeaSupportSource[] = bubble.seaSemantics.positiveSupportSources.map((source) => ({
        kind: source.kind,
        addressId: source.addressId,
        sourceEffectId: source.sourceEffectId,
        support: source.support,
        evidenceBasis: source.evidenceBasis,
    }));
    const negativeSignals = negativePressureSources.map((source) => resolveNegativeSignal(source.kind));
    const positiveSignals = positiveSupportSources.map((source) => resolvePositiveSignal(source.kind));
    const negativeScore = bubble.seaSemantics.negativePressureSources.reduce(
        (score, source) => score + source.pressureContribution,
        0,
    );
    const positiveScore = bubble.seaSemantics.positiveSupportSources.reduce(
        (score, source) => score + source.supportContribution,
        0,
    );
    const hasBoundaryStress = negativePressureSources.some((source) => source.kind === "boundary-stress");
    const hasBranchPressure = negativePressureSources.some((source) => source.kind === "branch");

    const negativePressure = negativeScore >= 3 ? "high"
        : negativeScore >= 1 ? "elevated"
            : "low";

    const positiveSupport = positiveScore >= 4 ? "strong"
        : positiveScore >= 2 ? "present"
            : "weak";

    const anchorSignals: string[] = [];
    let anchorScore = 0;
    if (Object.keys(bubble.axioms).length > 0) {
        anchorScore += 1;
        anchorSignals.push("axiomatic-basis");
    }

    if (semantics.worldWillCriterion?.status === "satisfied") {
        anchorScore += 1;
        anchorSignals.push("world-will-criterion");
    } else if (semantics.worldWillCriterion?.status === "violated") {
        anchorScore -= 1;
        anchorSignals.push("world-will-criterion-failed");
    } else if (semantics.worldWillCriterion?.status === "undetermined") {
        anchorSignals.push("world-will-criterion-undetermined");
    } else if (bubble.worldWill !== null) {
        anchorScore += 1;
        anchorSignals.push("world-will");
    }

    if (bubble.seed !== null) {
        anchorScore += 1;
        anchorSignals.push("seed-continuity");
    }

    if (lifecycle.commitsHistory) {
        anchorScore += 1;
        anchorSignals.push("declared-history-support");
    }

    if (lifecycle.observationMode !== null) {
        anchorScore += 1;
        anchorSignals.push("observation-surface");
    }

    if (negativePressure === "high") {
        anchorScore -= 1;
        anchorSignals.push("negative-pressure");
    }

    if (hasBoundaryStress) {
        anchorScore -= 1;
        anchorSignals.push("boundary-stress");
    }

    if (hasBranchPressure) {
        anchorScore -= 1;
        anchorSignals.push("branch-instability");
    }

    if (lifecycle.carriesDebt) {
        anchorScore -= 1;
        anchorSignals.push("unresolved-debt");
    }

    if (lifecycle.supportsPerturbation) {
        anchorScore -= 1;
        anchorSignals.push("perturbation-stress");
    }

    const anchorCriterion = semantics.anchorCriterion;
    const anchorStrength = anchorScore >= 4 ? "strong"
        : anchorScore >= 2 ? "steady"
            : "weak";
    const rewindStress = negativePressure === "high" || hasBranchPressure || lifecycle.carriesDebt;
    const rewindStability = bubble.seed !== null && lifecycle.commitsHistory
        ? rewindStress ? "guarded" : "stable"
        : bubble.seed !== null || lifecycle.commitsHistory ? "guarded" : "fragile";
    const theoremWitness = buildSeaAnchorTheoremWitness(negativePressure, positiveSupport, anchorStrength);
    const authoredCriterionStatus = resolveAuthoredAnchorCriterionStatus(anchorCriterion?.status);

    return {
        negativeSea: {
            pressure: negativePressure,
            signals: negativeSignals,
            pressureSources: negativePressureSources,
        },
        positiveSea: {
            support: positiveSupport,
            signals: positiveSignals,
            supportSources: positiveSupportSources,
        },
        anchorPoint: {
            strength: anchorStrength,
            declaredHistorySupport: lifecycle.commitsHistory,
            materializedHistoryEvidence: false,
            rewindStability,
            signals: anchorSignals,
            authoredCriterionStatus,
            authoredCriterionBasis: anchorCriterion?.basis ?? [],
            materializedEvidenceSources: [],
            identityStatus: resolveAnchorIdentityStatus(theoremWitness, authoredCriterionStatus, false),
        },
        theoremWitness,
    };
}

export function withMaterializedHistoryEvidence(
    assessment: BubbleSeaAnchorAssessment,
    hasMaterializedHistoryEvidence: boolean,
): BubbleSeaAnchorAssessment {
    if (assessment.anchorPoint.materializedHistoryEvidence === hasMaterializedHistoryEvidence) {
        return assessment;
    }

    return {
        ...assessment,
        anchorPoint: {
            ...assessment.anchorPoint,
            materializedHistoryEvidence: hasMaterializedHistoryEvidence,
            materializedEvidenceSources: hasMaterializedHistoryEvidence
                ? [{
                    kind: "materialized-history",
                    evidenceBasis: ["materialized-history-evidence"],
                }]
                : [],
            identityStatus: resolveAnchorIdentityStatus(
                assessment.theoremWitness,
                assessment.anchorPoint.authoredCriterionStatus,
                hasMaterializedHistoryEvidence,
            ),
        },
    };
}

function resolveAuthoredAnchorCriterionStatus(
    status: BubbleSemanticEvaluation["status"] | undefined,
): BubbleAuthoredAnchorCriterionStatus {
    switch (status) {
        case undefined:
            return "absent";
        case "satisfied":
            return "satisfied";
        case "violated":
            return "violated";
        case "undetermined":
            return "undetermined";
        default:
            return assertNever(status);
    }
}

function resolveAnchorIdentityStatus(
    theoremWitness: BubbleSeaAnchorTheoremWitness,
    authoredCriterionStatus: BubbleAuthoredAnchorCriterionStatus,
    hasMaterializedHistoryEvidence: boolean,
): BubbleAnchorIdentityStatus {
    if (!theoremWitness.sustained || authoredCriterionStatus === "violated") {
        return "contradicted";
    }

    if (authoredCriterionStatus === "undetermined") {
        return "undetermined";
    }

    if (authoredCriterionStatus === "satisfied") {
        return hasMaterializedHistoryEvidence ? "certified" : "provisional";
    }

    return "provisional";
}

function resolveNegativeSignal(kind: BubbleNegativeSeaSourceKindIR): string {
    switch (kind) {
        case "nondeterministic-realization":
            return "nondeterministic-realization";
        case "branch":
            return "branch-pressure";
        case "boundary-stress":
            return "boundary-exposure";
        case "leak":
            return "membrane-leak";
        case "perturb":
            return "law-perturbation";
        default:
            return assertNever(kind);
    }
}

function resolvePositiveSignal(kind: BubblePositiveSeaSourceKindIR): string {
    switch (kind) {
        case "source-lineage":
            return "source-lineage-address";
        case "seed-origin":
            return "seeded-origin";
        case "descendant-lineage":
            return "descendant-lineage";
        case "staged-growth":
            return "staged-growth";
        case "declared-history-support":
            return "declared-history-support";
        default:
            return assertNever(kind);
    }
}

function buildSeaAnchorTheoremWitness(
    negativePressure: BubbleNegativeSeaPressure,
    positiveSupport: BubblePositiveSeaSupport,
    anchorStrength: BubbleAnchorPointStrength,
): BubbleSeaAnchorTheoremWitness {
    const negativeRank = rankNegativeSeaPressure(negativePressure);
    const positiveRank = rankPositiveSeaSupport(positiveSupport);
    const anchorRank = rankAnchorStrength(anchorStrength);
    const worldhoodDelta = anchorRank + positiveRank - negativeRank;
    const identityDelta = anchorRank - negativeRank;
    const sustained = anchorRank > 0 && worldhoodDelta > 0;
    const condition = !sustained
        ? "dissolving"
        : worldhoodDelta >= 2
            ? "stable"
            : "stressed";
    const explanation = condition === "stable"
        ? `Bubble worldhood remains stable because A=${anchorRank}, P=${positiveRank}, N=${negativeRank}, so A + P - N = ${worldhoodDelta}.`
        : condition === "stressed"
            ? `Bubble worldhood remains stressed but sustained because A=${anchorRank}, P=${positiveRank}, N=${negativeRank}, so A + P - N = ${worldhoodDelta}.`
            : `Bubble worldhood is dissolving because A=${anchorRank}, P=${positiveRank}, N=${negativeRank}, so A + P - N = ${worldhoodDelta} with identity margin ${identityDelta}.`;

    return {
        theorem: "sea-anchor-necessity.v1",
        negativeRank,
        positiveRank,
        anchorRank,
        worldhoodDelta,
        identityDelta,
        sustained,
        condition,
        explanation,
    };
}

function rankNegativeSeaPressure(pressure: BubbleNegativeSeaPressure): number {
    switch (pressure) {
        case "low":
            return 0;
        case "elevated":
            return 1;
        case "high":
            return 2;
        default:
            return assertNever(pressure);
    }
}

function rankPositiveSeaSupport(support: BubblePositiveSeaSupport): number {
    switch (support) {
        case "weak":
            return 0;
        case "present":
            return 1;
        case "strong":
            return 2;
        default:
            return assertNever(support);
    }
}

function rankAnchorStrength(strength: BubbleAnchorPointStrength): number {
    switch (strength) {
        case "weak":
            return 0;
        case "steady":
            return 1;
        case "strong":
            return 2;
        default:
            return assertNever(strength);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled ontology variant: ${String(value)}`);
}