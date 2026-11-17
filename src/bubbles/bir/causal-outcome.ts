// Portable causal outcome (Gate D): the observables a conforming backend must reproduce exactly.
//
// The outcome is what the world did, not how the reference oracle computed it. It keeps statuses, the
// selected and unresolved continuation sets, initial and final world states, the event ledger with causes
// and field effects, the causal partial order and its synchronous frontier layering, commits, lifecycle and
// anchor-transfer provenance, sea-medium regions, exchanges, releases, and balance, internal-event
// nonrealization, emergence, World-Will decision evidence, the resource-boundary verdict, and diagnostic
// codes. It drops oracle-plan artifacts that an optimized backend may legitimately compute differently:
// intensional proof traces, evaluation subject ids, the single evaluation linearization, sequential trace
// numbering, prose reasons, derived sea-coupling trace entries, resource counters, and the host program digest.
//
// Evidence ids that carry world identity (branch steps, lineages, transfer frontiers, commit and retirement
// state digests) are kept. They are lowercase-hex SHA-256 over the RFC 8785 JSON Canonicalization Scheme
// serialization of documented records (docs/reference/causal-conformance.md), so they are portable.

import type {
    AnchoredCausalRun,
    CausalContinuation,
    CausalExecutionOptions,
} from "../world-kernel/causal-runtime";
import { bir, pruneToSchema, type BirSchema } from "./schema";

const text = bir.text;
const exact = bir.exact;
const opt = bir.optional;

const lifecycleState = bir.record({
    phase: text,
    lineageId: opt(text),
    parentWorldIds: opt(bir.set(text)),
    spawnedByEventId: opt(text),
    retiredByEventId: opt(text),
});

const worldState = bir.record({
    worldId: text,
    fields: bir.map(exact),
    intrinsicViability: exact,
    seaContribution: exact,
    lifecycle: opt(lifecycleState),
});

const ledgerEntry = bir.record({
    key: text,
    kind: text,
    worldId: text,
    eventId: opt(text),
    lawId: opt(text),
    interventionId: opt(text),
    anchorId: opt(text),
    lifecycleEventId: opt(text),
    transferId: opt(text),
    causes: bir.set(text),
    effects: bir.set(bir.record({
        worldId: opt(text),
        // A `sea-region` effect names its region; its `fieldId` is then the quantity.
        regionId: opt(text),
        fieldId: text,
        layer: text,
        operation: text,
        before: opt(exact),
        operand: opt(exact),
        after: exact,
    })),
});

const branchStep = bir.record({
    id: text,
    frontierIndex: bir.safeInteger,
    enabledLawIds: bir.set(text),
    realizedLawIds: bir.set(text),
    nonrealizedLawIds: bir.set(text),
    derivation: text,
});

// Multiversal sea medium (v0.5.10). Regions are keyed by id and the balance by quantity, so both are sets.
const seaRegion = bir.record({ id: text, negative: exact, positive: exact });

const seaMediumState = bir.record({
    regions: bir.set(seaRegion),
    balance: bir.set(bir.record({
        quantity: text,
        initialTotal: exact,
        finalTotal: exact,
        production: exact,
        balanced: bir.bool,
    })),
});

const seaExchangeEndpoint = bir.variant("kind", {
    region: { regionId: text, before: exact, after: exact },
    world: { worldId: text, fieldId: text, before: exact, after: exact },
});

const seaExchangeEvent = bir.record({
    id: text,
    lawId: text,
    quantity: text,
    amount: exact,
    from: seaExchangeEndpoint,
    to: seaExchangeEndpoint,
    causes: bir.set(text),
});

const continuation = bir.record({
    id: text,
    selection: text,
    interventionIds: bir.set(text),
    score: exact,
    branchLineage: opt(bir.seq(branchStep)),
    worldStates: bir.set(worldState),
    realizedEventIds: bir.set(text),
    ledger: bir.set(ledgerEntry),
    historyCommits: bir.set(bir.record({
        eventId: text,
        causedByEventId: text,
        worldId: text,
        affectedFields: bir.map(exact),
        stateDigest: text,
    })),
    lifecycleEvents: opt(bir.set(bir.record({
        id: text,
        kind: text,
        sourceWorldIds: bir.set(text),
        targetWorldId: text,
        causedByLawEventIds: bir.set(text),
        beforePhase: text,
        afterPhase: text,
        lineageId: opt(text),
        residue: opt(bir.record({
            finalStateDigest: text,
            localNegativeSea: exact,
            retainedHistoryCommitIds: bir.set(text),
            seaRelease: opt(bir.record({ regionId: text, negative: exact, positive: exact })),
        })),
    }))),
    anchorTransferEvents: opt(bir.set(bir.record({
        id: text,
        frontierId: text,
        composition: text,
        transferId: text,
        lawId: text,
        lawEventId: text,
        anchorId: text,
        source: bir.record({ worldId: text, portId: text, fieldId: text, value: exact }),
        target: bir.record({ worldId: text, portId: text, fieldId: text, before: exact, after: exact }),
        sourceNegativeSea: bir.record({ fieldId: text, before: exact, residue: exact, after: exact, frontierAfter: exact }),
        targetPositiveSea: bir.record({ fieldId: text, before: exact, placement: exact, after: exact, frontierAfter: exact }),
    }))),
    anchorTransferAssessments: opt(bir.set(bir.record({
        id: text,
        transferId: text,
        lawId: text,
        anchorId: text,
        sourceWorldId: text,
        targetWorldId: text,
        status: text,
    }))),
    internalEventAblations: opt(bir.set(bir.record({
        id: text,
        kind: text,
        lawId: text,
        worldId: text,
        wouldHaveEventId: text,
        frontierIndex: bir.safeInteger,
        causes: bir.set(text),
    }))),
    emergence: bir.set(bir.record({
        criterionId: text,
        worldId: text,
        status: text,
        witnessFields: bir.map(exact),
        causedByEventIds: bir.set(text),
    })),
    anchorIdentity: opt(bir.set(bir.record({
        anchorId: text,
        predicateId: text,
        status: text,
        value: opt(exact),
    }))),
    seaMedium: opt(seaMediumState),
    seaExchangeEvents: opt(bir.set(seaExchangeEvent)),
    order: bir.record({
        causalEdges: bir.set(bir.record({ cause: text, effect: text })),
        evaluationFrontiers: bir.seq(bir.set(text)),
        reversibleEventIds: bir.set(text),
        irreversibleEventIds: bir.set(text),
        createsHistoryArrow: bir.bool,
        historyArrowSources: opt(bir.set(text)),
    }),
});

export const CAUSAL_OUTCOME_MODE = "bubble-causal-outcome.v1";

export const causalOutcomeSchema: BirSchema = bir.record({
    mode: bir.literal(CAUSAL_OUTCOME_MODE),
    status: text,
    diagnosticCodes: bir.set(text),
    initialWorldStates: bir.set(worldState),
    initialSeaMedium: opt(bir.set(seaRegion)),
    autonomousContinuations: bir.set(continuation),
    interventionEligibility: bir.set(bir.record({
        interventionId: text,
        anchorId: text,
        baselineContinuationId: opt(text),
        status: text,
    })),
    baselineScore: opt(exact),
    baselineScores: opt(bir.set(bir.record({ continuationId: text, score: exact }))),
    candidateAssessments: bir.set(bir.record({
        id: text,
        interventionIds: bir.set(text),
        baselineContinuationId: opt(text),
        status: text,
        score: opt(exact),
        cost: opt(exact),
        improvement: opt(exact),
        outcomes: opt(bir.set(bir.record({ id: text, score: exact, improvement: exact }))),
    })),
    continuations: bir.set(continuation),
    selectedContinuationIds: bir.set(text),
    unresolvedAlternativeIds: bir.set(text),
    resourceVerdict: bir.record({
        exhaustiveInterventionSearch: bir.bool,
        exhaustiveInternalBranching: bir.bool,
    }),
});

const lifecycleOverride = lifecycleState;

/** Execution options are part of a fixture's input meaning, so they form a critical section of their own. */
export const CAUSAL_OPTIONS_SECTION = "core.causal-execution-options";

export const causalOptionsSchema: BirSchema = bir.record({
    worldWillEnabled: opt(bir.bool),
    cutAnchorIds: opt(bir.set(text)),
    fieldOverrides: opt(bir.map(exact)),
    fieldOverrideCauses: opt(bir.map(bir.set(text))),
    worldLifecycleOverrides: opt(bir.map(lifecycleOverride)),
    seaRegionOverrides: opt(bir.map(bir.record({ negative: exact, positive: exact }))),
    seaRegionOverrideCauses: opt(bir.map(bir.set(text))),
    counterfactualInternalEventAblationLawIds: opt(bir.set(text)),
    evaluationBudgetPerQuery: opt(bir.safeInteger),
    maxInterventionCombinations: opt(bir.safeInteger),
    maxInternalFrontiers: opt(bir.safeInteger),
    maxInternalBranches: opt(bir.safeInteger),
});

export type PortableCausalOptions = CausalExecutionOptions;

function projectContinuation(source: CausalContinuation): Record<string, unknown> {
    return {
        ...source,
        branchLineage: source.branchLineage,
        ledger: source.trace
            .filter((entry) => entry.kind !== "sea-coupling")
            .map((entry) => ({ ...entry, key: entry.id.replace(/^trace:\d+:/, "") })),
        emergence: source.emergenceAssessments,
    };
}

/**
 * Projects a run onto the portable outcome. Only fields the outcome schema declares survive, so a backend's
 * host-only fields never affect conformance, and an empty optional collection is identified with an absent one.
 */
export function projectCausalOutcome(run: AnchoredCausalRun): Record<string, unknown> {
    const autonomous = run.autonomousContinuations ?? (run.autonomousContinuation ? [run.autonomousContinuation] : []);
    const raw = {
        mode: CAUSAL_OUTCOME_MODE,
        status: run.status,
        diagnosticCodes: [...new Set(run.diagnostics.map((diagnostic) => diagnostic.code))],
        initialWorldStates: run.initialWorldStates,
        initialSeaMedium: run.initialSeaMedium,
        autonomousContinuations: autonomous.map(projectContinuation),
        interventionEligibility: run.interventionEligibility,
        baselineScore: run.baselineScore,
        baselineScores: run.baselineScores,
        candidateAssessments: run.candidateAssessments,
        continuations: run.continuations.map(projectContinuation),
        selectedContinuationIds: run.selectedContinuationIds,
        unresolvedAlternativeIds: run.unresolvedAlternativeIds,
        resourceVerdict: run.resourceUse,
    };
    return pruneToSchema(raw, causalOutcomeSchema, { omitEmptyOptional: true }) as Record<string, unknown>;
}
