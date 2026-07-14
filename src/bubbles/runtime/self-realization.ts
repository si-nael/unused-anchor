import type { BubbleProgramIR, ScalarValue } from "../ir";
import type { BubbleSeaAnchorAssessment } from "./ontology";
import { evaluateWorldWillForRealization } from "./semantics";
import type {
    BubbleGrammarActivationPlan,
    BubbleEmissionPlan,
    BubbleSelfRealizationCandidate,
    BubbleSelfRealizationConsequence,
    BubbleSelfRealizationContinuation,
    BubbleSelfRealizationIdentityOutcome,
    BubbleSelfRealizationOrdering,
    BubbleSelfRealizationPlan,
    BubbleSelfRealizationResume,
    BubbleSelfRealizationTopology,
} from "./types";

export function buildBubbleSelfRealization(
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
    grammarActivationPlan: BubbleGrammarActivationPlan[],
    ontology: BubbleSeaAnchorAssessment,
    resume: BubbleSelfRealizationResume | null = null,
): BubbleSelfRealizationPlan | null {
    if (program.profile !== "bubbles.v0.5" || program.bubble.worldWillCriterion === undefined) {
        return null;
    }

    const currentState = resolveCurrentState(program, resume);
    const realizationId = `self-realization:${program.bubble.address.id}${resume === null ? "" : `:${resume.sourceContinuationId}`}`;
    const candidates = [
        buildPreserveCandidate(program, emissionPlan, grammarActivationPlan, ontology, currentState),
        ...program.bubble.transformations.map((transformation) => {
            const effect = transformation.effectId === null
                ? null
                : program.bubble.effects.find((candidate) => candidate.id === transformation.effectId) ?? null;
            const eligible = currentState[transformation.stateName] === transformation.fromValue;
            const stateAfter = eligible
                ? { ...currentState, [transformation.stateName]: transformation.toValue }
                : { ...currentState };
            const consequence = resolveConsequence(transformation.effectKind);
            const ordering = resolveOrdering(transformation.reversibility, consequence);
            const topology = resolveTopology(consequence);
            const identityOutcome = resolveIdentityOutcome(ontology, consequence);
            const worldWillEvaluation = eligible
                ? evaluateWorldWillForRealization(program, emissionPlan, grammarActivationPlan, {
                    ...stateOverrides(stateAfter),
                    ...realizationOverrides({
                        name: transformation.name,
                        kind: "transform",
                        reversibility: transformation.reversibility,
                        ordering,
                        topology,
                        identityOutcome,
                        effectKind: transformation.effectKind,
                        consequence,
                    }),
                })
                : null;

            return {
                candidateId: `candidate:${transformation.id}`,
                kind: "transform",
                transformationId: transformation.id,
                transformationName: transformation.name,
                reversibility: transformation.reversibility,
                ordering,
                topology,
                identityOutcome,
                effectId: transformation.effectId,
                effectKind: transformation.effectKind,
                effectRequirement: effect?.requirement ?? null,
                consequence,
                eligible,
                stateBefore: { ...currentState },
                stateAfter,
                worldWillEvaluation,
                admittedByWorldWill: eligible && worldWillEvaluation?.status === "satisfied",
                selected: false,
                description: eligible
                    ? `Transform ${transformation.name} is available from authored state ${transformation.stateName}=${JSON.stringify(transformation.fromValue)} and projects ${transformation.stateName}=${JSON.stringify(transformation.toValue)}.`
                    : `Transform ${transformation.name} is unavailable because state ${transformation.stateName} is ${JSON.stringify(currentState[transformation.stateName])}, not ${JSON.stringify(transformation.fromValue)}.`,
            } satisfies BubbleSelfRealizationCandidate;
        }),
    ];

    const admitted = candidates.filter((candidate) => candidate.admittedByWorldWill);
    const eligibleRequiredEffectIds = Array.from(new Set(
        candidates
            .filter((candidate) =>
                candidate.kind === "transform"
                && candidate.eligible
                && candidate.effectRequirement === "required"
                && candidate.effectId !== null
            )
            .map((candidate) => candidate.effectId as string),
    ));
    const obligationConflicts = eligibleRequiredEffectIds
        .filter((effectId) => !admitted.some((candidate) => candidate.effectId === effectId))
        .map((effectId) => `Required effect ${effectId} has eligible transformation paths, but the world will admits none of them.`);
    let status: BubbleSelfRealizationPlan["status"];
    let selectedCandidateIds: string[] = [];

    if (obligationConflicts.length > 0) {
        status = "contradicted";
    } else if (admitted.length === 0) {
        status = candidates.some((candidate) => candidate.eligible && candidate.worldWillEvaluation?.status === "undetermined")
            ? "underdetermined"
            : "blocked";
    } else if (admitted.length === 1) {
        selectedCandidateIds = [admitted[0].candidateId];
        status = admitted[0].kind === "preserve" ? "stable" : "realized";
    } else if (program.bubble.generation.realizationMode === "nondeterministic") {
        selectedCandidateIds = admitted.map((candidate) => candidate.candidateId);
        status = "plural";
    } else {
        status = "underdetermined";
    }

    const selectedSet = new Set(selectedCandidateIds);
    const selectedCandidates = candidates.map((candidate) => ({
        ...candidate,
        selected: selectedSet.has(candidate.candidateId),
    }));
    const continuations = selectedCandidates
        .filter((candidate) => candidate.selected)
        .map((candidate) => createContinuation(realizationId, candidate));

    return {
        mode: "bubble-self-realization.v1",
        realizationId,
        governingWillId: program.bubble.worldWillCriterion.id,
        clockAssumption: "no-universal-clock",
        stateSource: resume === null ? "authored-initial" : "resumed-continuation",
        sourceContinuationId: resume?.sourceContinuationId ?? null,
        currentState,
        status,
        candidates: selectedCandidates,
        selectedCandidateIds,
        continuations,
        obligationConflicts,
        description: describeSelfRealization(program, status, selectedCandidates, obligationConflicts),
    };
}

function buildPreserveCandidate(
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
    grammarActivationPlan: BubbleGrammarActivationPlan[],
    ontology: BubbleSeaAnchorAssessment,
    currentState: Record<string, ScalarValue>,
): BubbleSelfRealizationCandidate {
    const identityOutcome = resolveIdentityOutcome(ontology, "none");
    const worldWillEvaluation = evaluateWorldWillForRealization(program, emissionPlan, grammarActivationPlan, {
        ...stateOverrides(currentState),
        ...realizationOverrides({
            name: "Preserve",
            kind: "preserve",
            reversibility: "identity",
            ordering: "none",
            topology: "single",
            identityOutcome,
            effectKind: null,
            consequence: "none",
        }),
    });

    return {
        candidateId: `candidate:preserve:${program.bubble.address.id}`,
        kind: "preserve",
        transformationId: null,
        transformationName: "Preserve",
        reversibility: "identity",
        ordering: "none",
        topology: "single",
        identityOutcome,
        effectId: null,
        effectKind: null,
        effectRequirement: null,
        consequence: "none",
        eligible: true,
        stateBefore: { ...currentState },
        stateAfter: { ...currentState },
        worldWillEvaluation,
        admittedByWorldWill: worldWillEvaluation?.status === "satisfied",
        selected: false,
        description: "Preserve keeps the authored world state invariant and introduces no causal order or history arrow.",
    };
}

function resolveCurrentState(
    program: BubbleProgramIR,
    resume: BubbleSelfRealizationResume | null,
): Record<string, ScalarValue> {
    const authored = Object.fromEntries(program.bubble.stateVariables.map((state) => [state.name, state.initialValue]));
    if (resume === null) {
        return authored;
    }
    if (resume.bubbleAddressId !== program.bubble.address.id) {
        throw new Error(`Self-realization resume belongs to ${resume.bubbleAddressId}, not ${program.bubble.address.id}.`);
    }
    const authoredKeys = Object.keys(authored).sort();
    const resumedKeys = Object.keys(resume.state).sort();
    if (JSON.stringify(authoredKeys) !== JSON.stringify(resumedKeys)) {
        throw new Error(`Self-realization resume must preserve the authored state-variable set for ${program.bubble.name}.`);
    }
    return { ...resume.state };
}

function stateOverrides(state: Record<string, ScalarValue>): Record<string, ScalarValue> {
    return Object.fromEntries(Object.entries(state).map(([name, value]) => [`state.${name}`, value]));
}

function realizationOverrides(input: {
    name: string;
    kind: BubbleSelfRealizationCandidate["kind"];
    reversibility: BubbleSelfRealizationCandidate["reversibility"];
    ordering: BubbleSelfRealizationOrdering;
    topology: BubbleSelfRealizationTopology;
    identityOutcome: BubbleSelfRealizationIdentityOutcome;
    effectKind: BubbleSelfRealizationCandidate["effectKind"];
    consequence: BubbleSelfRealizationConsequence;
}): Record<string, ScalarValue> {
    return {
        "realization.name": input.name,
        "realization.kind": input.kind,
        "realization.reversibility": input.reversibility,
        "realization.ordering": input.ordering,
        "realization.topology": input.topology,
        "realization.identity": input.identityOutcome,
        "realization.effect": input.effectKind ?? "none",
        "realization.consequence": input.consequence,
        "realization.commitsHistory": input.consequence === "history-commit",
        "realization.opensLineage": input.topology === "branching",
        "realization.terminal": input.topology === "terminal",
    };
}

function resolveConsequence(effectKind: BubbleSelfRealizationCandidate["effectKind"]): BubbleSelfRealizationConsequence {
    switch (effectKind) {
        case null:
            return "causal-trace";
        case "commit":
            return "history-commit";
        case "branch":
            return "branch-continuation";
        case "spawn":
            return "descendant-continuation";
        case "collapse":
            return "world-collapse";
        case "leak":
        case "debt":
        case "perturb":
        case "observe":
            return "causal-trace";
        default:
            return assertNever(effectKind);
    }
}

function resolveOrdering(
    reversibility: BubbleSelfRealizationCandidate["reversibility"],
    consequence: BubbleSelfRealizationConsequence,
): BubbleSelfRealizationOrdering {
    if (consequence === "history-commit" || consequence === "world-collapse") {
        return "committed-history";
    }
    return reversibility === "identity" ? "none" : "causal";
}

function resolveTopology(consequence: BubbleSelfRealizationConsequence): BubbleSelfRealizationTopology {
    if (consequence === "branch-continuation" || consequence === "descendant-continuation") {
        return "branching";
    }
    return consequence === "world-collapse" ? "terminal" : "single";
}

function resolveIdentityOutcome(
    ontology: BubbleSeaAnchorAssessment,
    consequence: BubbleSelfRealizationConsequence,
): BubbleSelfRealizationIdentityOutcome {
    if (consequence === "world-collapse" || ontology.anchorPoint.identityStatus === "contradicted") {
        return "released";
    }
    if (consequence === "history-commit" && ontology.anchorPoint.authoredCriterionStatus === "satisfied") {
        return "preserved";
    }
    return ontology.anchorPoint.identityStatus === "certified" ? "preserved" : "open";
}

function createContinuation(
    realizationId: string,
    candidate: BubbleSelfRealizationCandidate,
): BubbleSelfRealizationContinuation {
    return {
        continuationId: `continuation:${realizationId}:${candidate.candidateId}`,
        candidateId: candidate.candidateId,
        transformationId: candidate.transformationId,
        state: { ...candidate.stateAfter },
        reversibility: candidate.reversibility,
        ordering: candidate.ordering,
        topology: candidate.topology,
        consequence: candidate.consequence,
        createsHistoryArrow: candidate.ordering === "committed-history",
    };
}

function describeSelfRealization(
    program: BubbleProgramIR,
    status: BubbleSelfRealizationPlan["status"],
    candidates: BubbleSelfRealizationCandidate[],
    obligationConflicts: string[],
): string {
    const selected = candidates.filter((candidate) => candidate.selected).map((candidate) => candidate.transformationName);
    switch (status) {
        case "stable":
            return `World will ${program.bubble.worldWillCriterion?.id} selects invariant preservation without assuming a universal clock.`;
        case "realized":
            return `World will ${program.bubble.worldWillCriterion?.id} selects ${selected.join(", ")} as the sole admitted self-realization.`;
        case "plural":
            return `Nondeterministic world will admits plural continuations ${selected.join(", ")} without forcing one external choice.`;
        case "underdetermined":
            return "The current world will does not determine one continuation; possibilities remain explicit rather than being externally forced.";
        case "blocked":
            return "Every currently eligible realization violates the world will, so the bubble remains blocked without fabricating a transition.";
        case "contradicted":
            return `Required effect obligations contradict the world will: ${obligationConflicts.join(" ")}`;
        default:
            return assertNever(status);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled self-realization variant: ${String(value)}`);
}
