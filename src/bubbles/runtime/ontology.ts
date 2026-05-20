import type {
    BubbleEmissionTarget,
    BubbleProgramIR,
} from "../ir";
import type {
    BubbleAnchorPointStrength,
    BubbleNegativeSeaPressure,
    BubblePositiveSeaSupport,
    BubbleSeaAnchorAssessment,
    BubbleSeaAnchorTheoremWitness,
} from "./materialize";
import type { BubbleSemanticEvaluationPlan } from "./semantics";

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
    const boundaryExposureCount = countBoundaryExposure(program);
    const branchRelationCount = relations.filter((relation) => relation.kind === "branch").length;
    const descendantRelationCount = relations.filter((relation) => relation.kind === "spawn").length;
    const descendantEmissionCount = emissionPlan.filter((emission) => emission.target === "descendant").length;

    const negativeSignals: string[] = [];
    let negativeScore = 0;
    if (realizationMode === "nondeterministic") {
        negativeScore += 1;
        negativeSignals.push("nondeterministic-realization");
    }

    if (branchRelationCount > 0) {
        negativeScore += 1;
        negativeSignals.push("branch-pressure");
    }

    if (boundaryExposureCount > 0) {
        negativeScore += boundaryExposureCount > 1 ? 2 : 1;
        negativeSignals.push("boundary-exposure");
    }

    if (lifecycle.supportsLeakage) {
        negativeScore += 1;
        negativeSignals.push("membrane-leak");
    }

    if (lifecycle.supportsPerturbation) {
        negativeScore += 1;
        negativeSignals.push("law-perturbation");
    }

    const negativePressure = negativeScore >= 3 ? "high"
        : negativeScore >= 1 ? "elevated"
            : "low";

    const positiveSignals: string[] = [];
    let positiveScore = 0;
    if (bubble.address.locatorKind === "source-relative") {
        positiveScore += 1;
        positiveSignals.push("source-lineage-address");
    }

    if (bubble.seed !== null) {
        positiveScore += 1;
        positiveSignals.push("seeded-origin");
    }

    if (descendantRelationCount > 0) {
        positiveScore += 1;
        positiveSignals.push("descendant-lineage");
    }

    if (descendantEmissionCount > 0) {
        positiveScore += 1;
        positiveSignals.push("staged-growth");
    }

    if (lifecycle.commitsHistory) {
        positiveScore += 1;
        positiveSignals.push("durable-history");
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
        anchorSignals.push("durable-history");
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
    if (anchorCriterion?.status === "satisfied") {
        anchorScore += 1;
        anchorSignals.push("authored-anchor-criterion");
    } else if (anchorCriterion?.status === "violated") {
        anchorScore -= 1;
        anchorSignals.push("anchor-criterion-failed");
    } else if (anchorCriterion?.status === "undetermined") {
        anchorSignals.push("anchor-criterion-undetermined");
    }

    const anchorStrength = anchorScore >= 4 ? "strong"
        : anchorScore >= 2 ? "steady"
            : "weak";
    const rewindStress = negativePressure === "high" || branchRelationCount > 0 || lifecycle.carriesDebt;
    const rewindStability = bubble.seed !== null && lifecycle.commitsHistory
        ? rewindStress ? "guarded" : "stable"
        : bubble.seed !== null || lifecycle.commitsHistory ? "guarded" : "fragile";
    const theoremWitness = buildSeaAnchorTheoremWitness(negativePressure, positiveSupport, anchorStrength);

    return {
        negativeSea: {
            pressure: negativePressure,
            signals: negativeSignals,
        },
        positiveSea: {
            support: positiveSupport,
            signals: positiveSignals,
        },
        anchorPoint: {
            strength: anchorStrength,
            trustedHistory: lifecycle.commitsHistory,
            rewindStability,
            signals: anchorSignals,
        },
        theoremWitness,
    };
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

function countBoundaryExposure(program: BubbleProgramIR): number {
    const boundaryScopes = new Set(["membrane", "global"]);
    const obligationExposure = program.bubble.obligations.filter((obligation) => boundaryScopes.has(obligation.scope)).length;
    const relationExposure = program.bubble.generation.relations.filter((relation) => boundaryScopes.has(relation.scope)).length;

    return obligationExposure + relationExposure;
}

function assertNever(value: never): never {
    throw new Error(`Unhandled ontology variant: ${String(value)}`);
}