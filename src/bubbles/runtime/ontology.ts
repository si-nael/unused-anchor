import type {
    BubbleEmissionTarget,
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
    kind: "nondeterministic-realization" | "branch" | "boundary-stress" | "leak" | "perturb";
    sourceEffectId: string | null;
    relationKind: BubbleProgramIR["bubble"]["generation"]["relations"][number]["kind"] | null;
    boundaryScope: BubbleProgramIR["bubble"]["effects"][number]["scope"] | null;
    strength: BubbleNegativeSeaPressure;
    evidenceBasis: string[];
}

export interface BubblePositiveSeaSupportSource {
    kind: "source-lineage" | "seed-origin" | "descendant-lineage" | "staged-growth" | "declared-history-support";
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
    const { relations, lifecycle, realizationMode } = bubble.generation;
    const boundaryExposureSources = collectBoundaryExposureSources(program);
    const boundaryExposureCount = boundaryExposureSources.length;
    const branchRelations = relations.filter((relation) => relation.kind === "branch");
    const branchRelationCount = branchRelations.length;
    const descendantRelations = relations.filter((relation) => relation.kind === "spawn");
    const descendantRelationCount = descendantRelations.length;
    const descendantEmissionCount = emissionPlan.filter((emission) => emission.target === "descendant").length;

    const negativeSignals: string[] = [];
    const negativePressureSources: BubbleNegativeSeaPressureSource[] = [];
    let negativeScore = 0;
    if (realizationMode === "nondeterministic") {
        negativeScore += 1;
        negativeSignals.push("nondeterministic-realization");
        negativePressureSources.push({
            kind: "nondeterministic-realization",
            sourceEffectId: null,
            relationKind: null,
            boundaryScope: null,
            strength: "elevated",
            evidenceBasis: ["nondeterministic-realization"],
        });
    }

    if (branchRelationCount > 0) {
        negativeScore += 1;
        negativeSignals.push("branch-pressure");
        negativePressureSources.push({
            kind: "branch",
            sourceEffectId: branchRelations[0]?.sourceEffectId ?? null,
            relationKind: "branch",
            boundaryScope: branchRelations[0]?.scope ?? null,
            strength: branchRelationCount > 1 ? "high" : "elevated",
            evidenceBasis: ["branch-pressure", `branch-count:${branchRelationCount}`],
        });
    }

    if (boundaryExposureCount > 0) {
        negativeScore += boundaryExposureCount > 1 ? 2 : 1;
        negativeSignals.push("boundary-exposure");
        negativePressureSources.push({
            kind: "boundary-stress",
            sourceEffectId: boundaryExposureSources[0]?.sourceEffectId ?? null,
            relationKind: boundaryExposureSources[0]?.relationKind ?? null,
            boundaryScope: boundaryExposureSources[0]?.boundaryScope ?? null,
            strength: boundaryExposureCount > 1 ? "high" : "elevated",
            evidenceBasis: Array.from(new Set([
                "boundary-exposure",
                `boundary-exposure-count:${boundaryExposureCount}`,
                ...boundaryExposureSources.flatMap((source) => source.evidenceBasis),
            ])),
        });
    }

    const leakEffects = bubble.effects.filter((effect) => effect.kind === "leak");
    if (lifecycle.supportsLeakage) {
        negativeScore += 1;
        negativeSignals.push("membrane-leak");
        negativePressureSources.push({
            kind: "leak",
            sourceEffectId: leakEffects[0]?.id ?? null,
            relationKind: null,
            boundaryScope: leakEffects[0]?.scope ?? null,
            strength: "elevated",
            evidenceBasis: [resolveLeakSignal(leakEffects[0]?.scope ?? "membrane")],
        });
    }

    const perturbEffects = bubble.effects.filter((effect) => effect.kind === "perturb");
    if (lifecycle.supportsPerturbation) {
        negativeScore += 1;
        negativeSignals.push("law-perturbation");
        negativePressureSources.push({
            kind: "perturb",
            sourceEffectId: perturbEffects[0]?.id ?? null,
            relationKind: null,
            boundaryScope: perturbEffects[0]?.scope ?? null,
            strength: "elevated",
            evidenceBasis: ["law-perturbation"],
        });
    }

    const negativePressure = negativeScore >= 3 ? "high"
        : negativeScore >= 1 ? "elevated"
            : "low";

    const positiveSignals: string[] = [];
    const positiveSupportSources: BubblePositiveSeaSupportSource[] = [];
    let positiveScore = 0;
    if (bubble.address.locatorKind === "source-relative") {
        positiveScore += 1;
        positiveSignals.push("source-lineage-address");
        positiveSupportSources.push({
            kind: "source-lineage",
            addressId: bubble.address.id,
            sourceEffectId: null,
            support: "present",
            evidenceBasis: ["source-lineage-address"],
        });
    }

    if (bubble.seed !== null) {
        positiveScore += 1;
        positiveSignals.push("seeded-origin");
        positiveSupportSources.push({
            kind: "seed-origin",
            addressId: bubble.address.id,
            sourceEffectId: null,
            support: "present",
            evidenceBasis: ["seeded-origin"],
        });
    }

    if (descendantRelationCount > 0) {
        positiveScore += 1;
        positiveSignals.push("descendant-lineage");
        positiveSupportSources.push({
            kind: "descendant-lineage",
            addressId: bubble.address.id,
            sourceEffectId: descendantRelations[0]?.sourceEffectId ?? null,
            support: descendantRelationCount > 1 ? "strong" : "present",
            evidenceBasis: ["descendant-lineage", `descendant-lineage-count:${descendantRelationCount}`],
        });
    }

    if (descendantEmissionCount > 0) {
        positiveScore += 1;
        positiveSignals.push("staged-growth");
        positiveSupportSources.push({
            kind: "staged-growth",
            addressId: bubble.address.id,
            sourceEffectId: descendantRelations[0]?.sourceEffectId ?? null,
            support: descendantEmissionCount > 1 ? "strong" : "present",
            evidenceBasis: ["staged-growth", `staged-growth-count:${descendantEmissionCount}`],
        });
    }

    if (lifecycle.commitsHistory) {
        positiveScore += 1;
        positiveSignals.push("declared-history-support");
        positiveSupportSources.push({
            kind: "declared-history-support",
            addressId: bubble.address.id,
            sourceEffectId: bubble.effects.find((effect) => effect.kind === "commit")?.id ?? null,
            support: "present",
            evidenceBasis: ["declared-history-support"],
        });
    }

    const positiveSupport = positiveScore >= 4 ? "strong"
        : positiveScore >= 2 ? "present"
            : "weak";

    const anchorSignals: string[] = [];
    let anchorScore = 0;
    if (Object.keys(bubble.axioms).length > 0) {
        anchorScore += 1;
        anchorSignals.push("axiomatic-basis");
    }

    if (bubble.worldWill !== null) {
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

    if (boundaryExposureCount > 0) {
        anchorScore -= 1;
        anchorSignals.push("boundary-stress");
    }

    if (branchRelationCount > 0) {
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
    const rewindStress = negativePressure === "high" || branchRelationCount > 0 || lifecycle.carriesDebt;
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

function resolveLeakSignal(scope: BubbleProgramIR["bubble"]["effects"][number]["scope"]): string {
    switch (scope) {
        case "local":
            return "local-leak";
        case "membrane":
            return "membrane-leak";
        case "global":
            return "global-leak";
        default:
            return assertNever(scope);
    }
}

function collectBoundaryExposureSources(program: BubbleProgramIR): Array<{
    sourceEffectId: string | null;
    relationKind: BubbleProgramIR["bubble"]["generation"]["relations"][number]["kind"] | null;
    boundaryScope: BubbleProgramIR["bubble"]["effects"][number]["scope"] | null;
    evidenceBasis: string[];
}> {
    const boundaryScopes = new Set(["membrane", "global"]);
    const obligationExposure = program.bubble.obligations
        .filter((obligation) => boundaryScopes.has(obligation.scope))
        .map((obligation) => ({
            sourceEffectId: obligation.effectId,
            relationKind: null,
            boundaryScope: obligation.scope,
            evidenceBasis: ["boundary-exposure", `obligation:${obligation.effectId}`, `scope:${obligation.scope}`],
        }));
    const relationExposure = program.bubble.generation.relations
        .filter((relation) => boundaryScopes.has(relation.scope))
        .map((relation) => ({
            sourceEffectId: relation.sourceEffectId,
            relationKind: relation.kind,
            boundaryScope: relation.scope,
            evidenceBasis: ["boundary-exposure", `relation:${relation.kind}`, `scope:${relation.scope}`],
        }));

    return [...obligationExposure, ...relationExposure];
}

function assertNever(value: never): never {
    throw new Error(`Unhandled ontology variant: ${String(value)}`);
}