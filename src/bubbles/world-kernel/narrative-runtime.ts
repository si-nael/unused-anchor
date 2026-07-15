import { createHash } from "node:crypto";
import {
    addExactRationals,
    compareExactRationals,
    evaluateIntensionalCoordinate,
    exact,
    exactValuesEqual,
    multiplyExactRationals,
    negateExactRational,
    normalizeExactValue,
    subtractExactRationals,
    type ExactValue,
    type IntensionalCoordinateQuery,
    type IntensionalFamilyDefinition,
    type IntensionalProofStep,
} from "./intensional";
import {
    validateAnchoredNarrativeWorld,
    type AnchoredNarrativeWorldSystem,
    type NarrativeCausalEvent,
    type NarrativeDiagnostic,
    type NarrativeFieldBinding,
} from "./narrative";

export interface NarrativeFieldInitializer {
    worldId: string;
    fieldId: string;
    query: IntensionalCoordinateQuery;
}

export interface NarrativeSeaLaw {
    worldId: string;
    positiveWeight: ExactValue;
    negativeWeight: ExactValue;
}

export interface NarrativeFieldEffect {
    fieldId: string;
    operation: "add" | "subtract" | "set";
    value: ExactValue;
}

export interface NarrativeEventTransition {
    eventId: string;
    reversibility: "reversible" | "irreversible";
    effects: NarrativeFieldEffect[];
    inverseEffects?: NarrativeFieldEffect[];
}

export interface NarrativePredicateQuery {
    id: string;
    query: IntensionalCoordinateQuery;
    fieldParameters?: Array<{
        parameterName: string;
        worldId: string;
        fieldId: string;
    }>;
}

export interface NarrativeAnchorIdentityQuery extends NarrativePredicateQuery {
    anchorId: string;
}

export interface NarrativeInterventionCost {
    interventionId: string;
    cost: ExactValue;
}

export interface ExecutableAnchoredNarrativeProgram {
    mode: "bubble-anchored-narrative-program.v1";
    world: AnchoredNarrativeWorldSystem;
    fieldInitializers: NarrativeFieldInitializer[];
    seaLaws: NarrativeSeaLaw[];
    eventTransitions: NarrativeEventTransition[];
    worldWillExecution: {
        decisionMode: "deterministic" | "plural";
        hardConstraints: NarrativePredicateQuery[];
        anchorIdentity: NarrativeAnchorIdentityQuery[];
        interventionCosts: NarrativeInterventionCost[];
    };
}

export interface NarrativeExecutionOptions {
    worldWillEnabled?: boolean;
    cutAnchorIds?: string[];
    fieldOverrides?: Record<string, ExactValue>;
    evaluationBudgetPerQuery?: number;
    maxInterventionCombinations?: number;
}

export interface NarrativeWorldState {
    worldId: string;
    fields: Record<string, ExactValue>;
    seaContribution: ExactValue;
    intrinsicViability: ExactValue;
}

export interface NarrativeHistoryCommit {
    eventId: string;
    worldId: string;
    affectedFields: Record<string, ExactValue>;
    stateDigest: string;
}

export interface NarrativeExecutionTraceEntry {
    id: string;
    kind:
        | "initial-field"
        | "sea-coupling"
        | "protagonist-action"
        | "world-will-intervention"
        | "story-consequence"
        | "sea-shift"
        | "history-commit";
    worldId: string;
    eventId?: string;
    causes: string[];
    anchorId?: string;
    interventionId?: string;
    effects: Array<{
        fieldId: string;
        operation: "add" | "subtract" | "set" | "derive";
        before?: ExactValue;
        operand?: ExactValue;
        after: ExactValue;
    }>;
}

export interface NarrativeObjectiveContribution {
    objectiveId: string;
    worldId: string;
    fieldId: string;
    direction: "maximize" | "minimize" | "stabilize";
    weightedValue: ExactValue;
}

export interface NarrativeInterventionEligibility {
    interventionId: string;
    eventId?: string;
    anchorId: string;
    status: "eligible" | "blocked";
    reasons: string[];
}

export interface NarrativeCandidateAssessment {
    id: string;
    interventionIds: string[];
    status: "improved" | "rejected" | "inadmissible" | "undetermined";
    score?: ExactValue;
    cost?: ExactValue;
    improvement?: ExactValue;
    objectiveContributions?: NarrativeObjectiveContribution[];
    reasons: string[];
}

export interface NarrativeContinuation {
    id: string;
    selection: "selected" | "selected-plural" | "alternative" | "baseline";
    interventionIds: string[];
    score: ExactValue;
    worldStates: NarrativeWorldState[];
    realizedEventIds: string[];
    trace: NarrativeExecutionTraceEntry[];
    historyCommits: NarrativeHistoryCommit[];
    order: {
        kind: "causal-partial-order";
        universalClock: false;
        causalEdges: Array<{ cause: string; effect: string }>;
        evaluationOrder: string[];
        reversibleEventIds: string[];
        irreversibleEventIds: string[];
        createsHistoryArrow: boolean;
    };
}

export interface NarrativeFormalEvidence {
    subjectId: string;
    purpose: "initial-field" | "hard-constraint" | "anchor-identity";
    status: "resolved" | "undetermined" | "contradicted";
    value?: ExactValue;
    reason?: string;
    proof: IntensionalProofStep[];
}

export interface AnchoredNarrativeRun {
    mode: "bubble-anchored-narrative-run.v1";
    programDigest: string;
    status: "realized" | "stable" | "plural" | "underdetermined" | "blocked" | "contradicted";
    reason?: string;
    options: Required<Pick<NarrativeExecutionOptions, "worldWillEnabled" | "cutAnchorIds" | "fieldOverrides" | "evaluationBudgetPerQuery" | "maxInterventionCombinations">>;
    diagnostics: NarrativeDiagnostic[];
    formalEvidence: NarrativeFormalEvidence[];
    initialWorldStates: NarrativeWorldState[];
    autonomousContinuation?: NarrativeContinuation;
    interventionEligibility: NarrativeInterventionEligibility[];
    baselineScore?: ExactValue;
    candidateAssessments: NarrativeCandidateAssessment[];
    continuations: NarrativeContinuation[];
    selectedContinuationIds: string[];
    unresolvedAlternativeIds: string[];
    resourceUse: {
        formalQueryCount: number;
        formalEvaluationSteps: number;
        interventionCombinationCount: number;
        combinationLimit: number;
        exhaustiveInterventionSearch: boolean;
    };
}

export interface AnchoredNarrativeInspection {
    mode: "bubble-anchored-narrative-inspection.v1";
    summary: {
        status: AnchoredNarrativeRun["status"];
        worldCount: number;
        continuationCount: number;
        selectedContinuationCount: number;
        unresolvedAlternativeCount: number;
        createsHistoryArrow: boolean;
        exhaustiveInterventionSearch: boolean;
    };
    decision: {
        baselineScore?: ExactValue;
        interventionEligibility: NarrativeInterventionEligibility[];
        candidates: NarrativeCandidateAssessment[];
    };
    continuations: NarrativeContinuation[];
    formalEvidence: NarrativeFormalEvidence[];
}

export interface AnchoredNarrativeReplayRecord {
    mode: "bubble-anchored-narrative-replay.v1";
    program: ExecutableAnchoredNarrativeProgram;
    options: NarrativeExecutionOptions;
    recordedRun: AnchoredNarrativeRun;
    recordedDigest: string;
}

export interface AnchoredNarrativeReplayResult {
    mode: "bubble-anchored-narrative-replay-result.v1";
    status: "same-world-reexecution" | "reexecution-drift";
    recordedDigest: string;
    replayedDigest: string;
    selectedContinuationsPreserved: boolean;
    unresolvedAlternativesPreserved: boolean;
    replayedRun: AnchoredNarrativeRun;
}

interface MutableWorldState extends NarrativeWorldState {
    fieldBindings: Map<string, NarrativeFieldBinding>;
}

interface MutableContinuation {
    states: Map<string, MutableWorldState>;
    realizedEvents: Set<string>;
    trace: NarrativeExecutionTraceEntry[];
    historyCommits: NarrativeHistoryCommit[];
    evaluationOrder: string[];
}

interface ObjectiveScore {
    score: ExactValue;
    contributions: NarrativeObjectiveContribution[];
}

interface QueryEvaluation {
    evidence: NarrativeFormalEvidence;
    steps: number;
}

function stableValue(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(stableValue);
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, entry]) => [key, stableValue(entry)]),
        );
    }
    return value;
}

function stableStringify(value: unknown): string {
    return JSON.stringify(stableValue(value));
}

function digest(value: unknown): string {
    return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function cloneValue<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function runtimeIssue(code: string, path: string, message: string): NarrativeDiagnostic {
    return { code, severity: "error", path, message };
}

function exactRationalOrUndefined(value: ExactValue): ExactValue | undefined {
    const normalized = normalizeExactValue(value);
    return normalized?.kind === "rational" ? normalized : undefined;
}

function nonNegativeRational(value: ExactValue): boolean {
    const normalized = exactRationalOrUndefined(value);
    return normalized !== undefined && (compareExactRationals(normalized, exact.integer(0)) ?? -1) >= 0;
}

function fieldKey(worldId: string, fieldId: string): string {
    return `${worldId}.${fieldId}`;
}

function inverseEffectMatches(effect: NarrativeFieldEffect, inverse: NarrativeFieldEffect): boolean {
    if (effect.fieldId !== inverse.fieldId || !exactValuesEqual(effect.value, inverse.value)) {
        return false;
    }
    return (effect.operation === "add" && inverse.operation === "subtract")
        || (effect.operation === "subtract" && inverse.operation === "add");
}

function validatePredicateFieldParameters(
    entry: NarrativePredicateQuery,
    path: string,
    families: Map<string, IntensionalFamilyDefinition>,
    worlds: Map<string, AnchoredNarrativeWorldSystem["worlds"][number]>,
    diagnostics: NarrativeDiagnostic[],
): void {
    const family = families.get(entry.query.familyId);
    const declaredParameters = new Map(family?.parameters.map((parameter) => [parameter.name, parameter.valueKind]) ?? []);
    const supplied = new Set(Object.keys(entry.query.parameters));
    for (const [index, binding] of (entry.fieldParameters ?? []).entries()) {
        const bindingPath = `${path}.fieldParameters[${index}]`;
        if (supplied.has(binding.parameterName)) {
            diagnostics.push(runtimeIssue("NKR032", bindingPath, `parameter '${binding.parameterName}' is supplied both literally and from world state`));
            continue;
        }
        if (!declaredParameters.has(binding.parameterName)) {
            diagnostics.push(runtimeIssue("NKR033", bindingPath, `family '${entry.query.familyId}' has no parameter '${binding.parameterName}'`));
            continue;
        }
        supplied.add(binding.parameterName);
        const field = worlds.get(binding.worldId)?.fields.find((candidate) => candidate.id === binding.fieldId);
        if (!field) {
            diagnostics.push(runtimeIssue("NKR034", bindingPath, `unknown bound field '${fieldKey(binding.worldId, binding.fieldId)}'`));
            continue;
        }
        const fieldKind = families.get(field.familyId)?.valueKind;
        if (fieldKind && fieldKind !== declaredParameters.get(binding.parameterName)) {
            diagnostics.push(runtimeIssue("NKR035", bindingPath, `field '${fieldKey(binding.worldId, binding.fieldId)}' does not match parameter kind '${declaredParameters.get(binding.parameterName)}'`));
        }
    }
    for (const parameterName of declaredParameters.keys()) {
        if (!supplied.has(parameterName)) {
            diagnostics.push(runtimeIssue("NKR036", path, `query is missing literal or field binding for parameter '${parameterName}'`));
        }
    }
}

export function validateExecutableNarrativeProgram(
    program: ExecutableAnchoredNarrativeProgram,
): NarrativeDiagnostic[] {
    const diagnostics = validateAnchoredNarrativeWorld(program.world);
    if (program.mode !== "bubble-anchored-narrative-program.v1") {
        diagnostics.push(runtimeIssue("NKR001", "mode", "unsupported executable narrative program mode"));
    }
    const families = new Map(program.world.formal.families.map((family) => [family.id, family]));
    const worlds = new Map(program.world.worlds.map((world) => [world.id, world]));
    const events = new Map(program.world.causalEvents.map((event) => [event.id, event]));
    const interventions = new Map(program.world.worldWill.interventions.map((entry) => [entry.id, entry]));
    const anchors = new Map(program.world.anchors.map((anchor) => [anchor.id, anchor]));

    const initializerKeys = new Set<string>();
    for (const [index, initializer] of program.fieldInitializers.entries()) {
        const path = `fieldInitializers[${index}]`;
        const world = worlds.get(initializer.worldId);
        const field = world?.fields.find((candidate) => candidate.id === initializer.fieldId);
        if (!field) {
            diagnostics.push(runtimeIssue("NKR002", path, `unknown field '${fieldKey(initializer.worldId, initializer.fieldId)}'`));
            continue;
        }
        const key = fieldKey(initializer.worldId, initializer.fieldId);
        if (initializerKeys.has(key)) {
            diagnostics.push(runtimeIssue("NKR003", path, `duplicate initializer '${key}'`));
        }
        initializerKeys.add(key);
        if (initializer.query.familyId !== field.familyId) {
            diagnostics.push(runtimeIssue("NKR004", `${path}.query.familyId`, `initializer must query field family '${field.familyId}'`));
        }
    }
    for (const world of program.world.worlds) {
        for (const field of world.fields) {
            if (!initializerKeys.has(fieldKey(world.id, field.id))) {
                diagnostics.push(runtimeIssue("NKR005", "fieldInitializers", `missing initializer '${fieldKey(world.id, field.id)}'`));
            }
        }
    }

    const seaWorlds = new Set<string>();
    for (const [index, seaLaw] of program.seaLaws.entries()) {
        const path = `seaLaws[${index}]`;
        if (!worlds.has(seaLaw.worldId)) {
            diagnostics.push(runtimeIssue("NKR006", `${path}.worldId`, `unknown sea-law world '${seaLaw.worldId}'`));
        }
        if (seaWorlds.has(seaLaw.worldId)) {
            diagnostics.push(runtimeIssue("NKR007", path, `duplicate sea law for '${seaLaw.worldId}'`));
        }
        seaWorlds.add(seaLaw.worldId);
        if (!nonNegativeRational(seaLaw.positiveWeight) || !nonNegativeRational(seaLaw.negativeWeight)) {
            diagnostics.push(runtimeIssue("NKR008", path, "sea weights must be non-negative exact rationals"));
        }
    }
    for (const world of program.world.worlds) {
        if (!seaWorlds.has(world.id)) {
            diagnostics.push(runtimeIssue("NKR009", "seaLaws", `missing sea law for '${world.id}'`));
        }
    }

    const transitions = new Map<string, NarrativeEventTransition>();
    for (const [index, transition] of program.eventTransitions.entries()) {
        const path = `eventTransitions[${index}]`;
        const event = events.get(transition.eventId);
        if (!event) {
            diagnostics.push(runtimeIssue("NKR010", `${path}.eventId`, `unknown event '${transition.eventId}'`));
            continue;
        }
        if (event.kind === "history-commit") {
            diagnostics.push(runtimeIssue("NKR011", path, "history-commit records current state and must not carry a separate transition"));
        }
        if (transitions.has(transition.eventId)) {
            diagnostics.push(runtimeIssue("NKR012", path, `duplicate transition for '${transition.eventId}'`));
        }
        transitions.set(transition.eventId, transition);
        if (transition.effects.length === 0) {
            diagnostics.push(runtimeIssue("NKR013", `${path}.effects`, "an executable event transition needs at least one field effect"));
        }
        const world = worlds.get(event.worldId);
        for (const effect of transition.effects) {
            const field = world?.fields.find((candidate) => candidate.id === effect.fieldId);
            if (!field) {
                diagnostics.push(runtimeIssue("NKR014", `${path}.effects`, `unknown local field '${effect.fieldId}'`));
                continue;
            }
            if (!normalizeExactValue(effect.value)) {
                diagnostics.push(runtimeIssue("NKR015", `${path}.effects`, `effect on '${effect.fieldId}' has an invalid exact value`));
            }
            if (event.kind === "world-will-intervention"
                && !["world-condition", "positive-sea", "negative-sea", "viability"].includes(field.role)) {
                diagnostics.push(runtimeIssue("NKR016", `${path}.effects`, `World Will cannot directly mutate '${field.role}'`));
            }
        }
        if (event.kind === "world-will-intervention") {
            const intervention = interventions.get(event.interventionId);
            if (intervention && !transition.effects.some((effect) => effect.fieldId === intervention.targetFieldId)) {
                diagnostics.push(runtimeIssue("NKR017", `${path}.effects`, `intervention transition must affect declared target '${intervention.targetFieldId}'`));
            }
        }
        if (transition.reversibility === "reversible") {
            if (!transition.inverseEffects || transition.inverseEffects.length !== transition.effects.length) {
                diagnostics.push(runtimeIssue("NKR018", `${path}.inverseEffects`, "reversible transition needs one exact inverse for every effect"));
            } else {
                const unmatched = [...transition.inverseEffects];
                for (const effect of transition.effects) {
                    const inverseIndex = unmatched.findIndex((inverse) => inverseEffectMatches(effect, inverse));
                    if (inverseIndex < 0) {
                        diagnostics.push(runtimeIssue("NKR019", `${path}.inverseEffects`, `effect on '${effect.fieldId}' has no exact additive inverse`));
                    } else {
                        unmatched.splice(inverseIndex, 1);
                    }
                }
            }
        } else if (transition.inverseEffects?.length) {
            diagnostics.push(runtimeIssue("NKR020", `${path}.inverseEffects`, "irreversible transition must not claim inverse effects"));
        }
    }
    for (const event of program.world.causalEvents) {
        if (event.kind !== "history-commit" && !transitions.has(event.id)) {
            diagnostics.push(runtimeIssue("NKR021", "eventTransitions", `missing transition for event '${event.id}'`));
        }
    }

    const constraints = new Map(program.worldWillExecution.hardConstraints.map((entry) => [entry.query.familyId, entry]));
    for (const familyId of program.world.worldWill.hardConstraintFamilyIds) {
        if (!constraints.has(familyId)) {
            diagnostics.push(runtimeIssue("NKR022", "worldWillExecution.hardConstraints", `missing query for constraint family '${familyId}'`));
        }
    }
    for (const [index, entry] of program.worldWillExecution.hardConstraints.entries()) {
        if (!program.world.worldWill.hardConstraintFamilyIds.includes(entry.query.familyId)) {
            diagnostics.push(runtimeIssue("NKR023", `worldWillExecution.hardConstraints[${index}]`, `query '${entry.id}' is not a declared hard constraint`));
        }
        if (families.get(entry.query.familyId)?.valueKind !== "boolean") {
            diagnostics.push(runtimeIssue("NKR024", `worldWillExecution.hardConstraints[${index}]`, "hard constraint query must resolve to boolean"));
        }
        validatePredicateFieldParameters(
            entry,
            `worldWillExecution.hardConstraints[${index}]`,
            families,
            worlds,
            diagnostics,
        );
    }

    for (const anchor of program.world.anchors) {
        for (const familyId of anchor.identityPredicateFamilyIds) {
            if (!program.worldWillExecution.anchorIdentity.some((entry) => entry.anchorId === anchor.id && entry.query.familyId === familyId)) {
                diagnostics.push(runtimeIssue("NKR025", "worldWillExecution.anchorIdentity", `missing identity query '${anchor.id}:${familyId}'`));
            }
        }
    }
    for (const [index, entry] of program.worldWillExecution.anchorIdentity.entries()) {
        const anchor = anchors.get(entry.anchorId);
        if (!anchor?.identityPredicateFamilyIds.includes(entry.query.familyId)) {
            diagnostics.push(runtimeIssue("NKR026", `worldWillExecution.anchorIdentity[${index}]`, "anchor identity query is not declared by the anchor"));
        }
        if (families.get(entry.query.familyId)?.valueKind !== "boolean") {
            diagnostics.push(runtimeIssue("NKR027", `worldWillExecution.anchorIdentity[${index}]`, "anchor identity query must resolve to boolean"));
        }
        validatePredicateFieldParameters(
            entry,
            `worldWillExecution.anchorIdentity[${index}]`,
            families,
            worlds,
            diagnostics,
        );
    }

    const costs = new Map<string, ExactValue>();
    for (const [index, entry] of program.worldWillExecution.interventionCosts.entries()) {
        if (!interventions.has(entry.interventionId)) {
            diagnostics.push(runtimeIssue("NKR028", `worldWillExecution.interventionCosts[${index}]`, `unknown intervention '${entry.interventionId}'`));
        }
        if (costs.has(entry.interventionId)) {
            diagnostics.push(runtimeIssue("NKR029", `worldWillExecution.interventionCosts[${index}]`, `duplicate cost for '${entry.interventionId}'`));
        }
        costs.set(entry.interventionId, entry.cost);
        if (!nonNegativeRational(entry.cost)) {
            diagnostics.push(runtimeIssue("NKR030", `worldWillExecution.interventionCosts[${index}].cost`, "intervention cost must be a non-negative exact rational"));
        }
    }
    for (const intervention of program.world.worldWill.interventions) {
        if (!costs.has(intervention.id)) {
            diagnostics.push(runtimeIssue("NKR031", "worldWillExecution.interventionCosts", `missing cost for '${intervention.id}'`));
        }
    }
    return diagnostics;
}

function evaluateQuery(
    program: ExecutableAnchoredNarrativeProgram,
    subjectId: string,
    purpose: NarrativeFormalEvidence["purpose"],
    query: IntensionalCoordinateQuery,
    budget: number,
): QueryEvaluation {
    const result = evaluateIntensionalCoordinate(program.world.formal, query, { budget });
    return {
        evidence: {
            subjectId,
            purpose,
            status: result.status,
            ...(result.value ? { value: result.value } : {}),
            ...(result.reason ? { reason: result.reason } : {}),
            proof: result.proof,
        },
        steps: result.budget.consumed,
    };
}

function evaluateStatePredicate(
    program: ExecutableAnchoredNarrativeProgram,
    predicate: NarrativePredicateQuery,
    purpose: NarrativeFormalEvidence["purpose"],
    budget: number,
    states: Map<string, MutableWorldState>,
    subjectPrefix = "",
): QueryEvaluation {
    const parameters = { ...predicate.query.parameters };
    for (const binding of predicate.fieldParameters ?? []) {
        const value = states.get(binding.worldId)?.fields[binding.fieldId];
        if (!value) {
            return {
                evidence: {
                    subjectId: `${subjectPrefix}${predicate.id}`,
                    purpose,
                    status: "contradicted",
                    reason: `bound field '${fieldKey(binding.worldId, binding.fieldId)}' is unavailable`,
                    proof: [],
                },
                steps: 0,
            };
        }
        parameters[binding.parameterName] = value;
    }
    return evaluateQuery(
        program,
        `${subjectPrefix}${predicate.id}`,
        purpose,
        { ...predicate.query, parameters },
        budget,
    );
}

function serializeStates(states: Map<string, MutableWorldState>): NarrativeWorldState[] {
    return [...states.values()].sort((left, right) => left.worldId.localeCompare(right.worldId)).map((state) => ({
        worldId: state.worldId,
        fields: Object.fromEntries(Object.entries(state.fields).sort(([left], [right]) => left.localeCompare(right))),
        seaContribution: state.seaContribution,
        intrinsicViability: state.intrinsicViability,
    }));
}

function cloneMutableContinuation(source: MutableContinuation): MutableContinuation {
    const states = new Map<string, MutableWorldState>();
    for (const [worldId, state] of source.states) {
        states.set(worldId, {
            worldId,
            fields: cloneValue(state.fields),
            seaContribution: cloneValue(state.seaContribution),
            intrinsicViability: cloneValue(state.intrinsicViability),
            fieldBindings: state.fieldBindings,
        });
    }
    return {
        states,
        realizedEvents: new Set(source.realizedEvents),
        trace: cloneValue(source.trace),
        historyCommits: cloneValue(source.historyCommits),
        evaluationOrder: [...source.evaluationOrder],
    };
}

function recomputeSea(
    program: ExecutableAnchoredNarrativeProgram,
    state: MutableWorldState,
    trace: NarrativeExecutionTraceEntry[],
    causeEventId?: string,
): string | undefined {
    const world = program.world.worlds.find((candidate) => candidate.id === state.worldId);
    const law = program.seaLaws.find((candidate) => candidate.worldId === state.worldId);
    if (!world || !law) {
        return `missing world or sea law for '${state.worldId}'`;
    }
    const positive = state.fields[world.seaCoupling.positiveFieldId];
    const negative = state.fields[world.seaCoupling.negativeFieldId];
    if (!positive || !negative) {
        return `sea fields are unavailable for '${state.worldId}'`;
    }
    const positiveContribution = multiplyExactRationals(positive, law.positiveWeight);
    const negativeContribution = multiplyExactRationals(negative, law.negativeWeight);
    const seaContribution = positiveContribution && negativeContribution
        ? subtractExactRationals(positiveContribution, negativeContribution)
        : undefined;
    const viability = seaContribution
        ? addExactRationals(state.intrinsicViability, seaContribution)
        : undefined;
    if (!seaContribution || !viability) {
        return `sea coupling for '${state.worldId}' requires exact rational fields`;
    }
    const viabilityFieldId = world.seaCoupling.viabilityFieldId;
    const before = state.fields[viabilityFieldId];
    state.seaContribution = seaContribution;
    state.fields[viabilityFieldId] = viability;
    trace.push({
        id: `trace:${trace.length + 1}:sea:${state.worldId}`,
        kind: "sea-coupling",
        worldId: state.worldId,
        ...(causeEventId ? { eventId: causeEventId } : {}),
        causes: causeEventId ? [causeEventId] : [],
        effects: [{
            fieldId: viabilityFieldId,
            operation: "derive",
            ...(before ? { before } : {}),
            operand: seaContribution,
            after: viability,
        }],
    });
    return undefined;
}

function applyFieldEffect(
    program: ExecutableAnchoredNarrativeProgram,
    state: MutableWorldState,
    effect: NarrativeFieldEffect,
): { before?: ExactValue; after?: ExactValue; reason?: string } {
    const world = program.world.worlds.find((candidate) => candidate.id === state.worldId);
    const binding = state.fieldBindings.get(effect.fieldId);
    const before = state.fields[effect.fieldId];
    if (!world || !binding || !before) {
        return { reason: `field '${effect.fieldId}' is unavailable in '${state.worldId}'` };
    }
    const base = effect.fieldId === world.seaCoupling.viabilityFieldId
        ? state.intrinsicViability
        : before;
    const normalizedOperand = normalizeExactValue(effect.value);
    if (!normalizedOperand) {
        return { reason: `effect on '${effect.fieldId}' has an invalid exact operand` };
    }
    const after = effect.operation === "set"
        ? normalizedOperand
        : effect.operation === "add"
            ? addExactRationals(base, normalizedOperand)
            : subtractExactRationals(base, normalizedOperand);
    if (!after) {
        return { reason: `operation '${effect.operation}' is incompatible with field '${effect.fieldId}'` };
    }
    if (effect.operation === "set" && before.kind !== after.kind) {
        return { reason: `set operation cannot change value kind of '${effect.fieldId}'` };
    }
    if (effect.fieldId === world.seaCoupling.viabilityFieldId) {
        state.intrinsicViability = after;
    } else {
        state.fields[effect.fieldId] = after;
    }
    return { before, after };
}

function eventTraceKind(event: NarrativeCausalEvent): NarrativeExecutionTraceEntry["kind"] {
    return event.kind;
}

function applyEvent(
    program: ExecutableAnchoredNarrativeProgram,
    mutable: MutableContinuation,
    event: NarrativeCausalEvent,
): string | undefined {
    if (mutable.realizedEvents.has(event.id)) {
        return undefined;
    }
    const state = mutable.states.get(event.worldId);
    if (!state) {
        return `event '${event.id}' names missing world '${event.worldId}'`;
    }
    if (event.kind === "history-commit") {
        const affectedFields = Object.fromEntries(event.affectedFieldIds.map((fieldId) => [fieldId, state.fields[fieldId]]));
        if (Object.values(affectedFields).some((value) => value === undefined)) {
            return `history commit '${event.id}' names an unavailable field`;
        }
        const commit: NarrativeHistoryCommit = {
            eventId: event.id,
            worldId: event.worldId,
            affectedFields: affectedFields as Record<string, ExactValue>,
            stateDigest: digest(state.fields),
        };
        mutable.historyCommits.push(commit);
        mutable.realizedEvents.add(event.id);
        mutable.evaluationOrder.push(event.id);
        mutable.trace.push({
            id: `trace:${mutable.trace.length + 1}:${event.id}`,
            kind: "history-commit",
            worldId: event.worldId,
            eventId: event.id,
            causes: [...event.causes],
            effects: event.affectedFieldIds.map((fieldId) => ({
                fieldId,
                operation: "derive",
                after: state.fields[fieldId]!,
            })),
        });
        return undefined;
    }
    const transition = program.eventTransitions.find((candidate) => candidate.eventId === event.id);
    if (!transition) {
        return `event '${event.id}' has no executable transition`;
    }
    const effects: NarrativeExecutionTraceEntry["effects"] = [];
    for (const effect of transition.effects) {
        const applied = applyFieldEffect(program, state, effect);
        if (applied.reason || !applied.after) {
            return applied.reason ?? `effect failed for '${event.id}'`;
        }
        effects.push({
            fieldId: effect.fieldId,
            operation: effect.operation,
            ...(applied.before ? { before: applied.before } : {}),
            operand: effect.value,
            after: applied.after,
        });
    }
    mutable.realizedEvents.add(event.id);
    mutable.evaluationOrder.push(event.id);
    const intervention = event.kind === "world-will-intervention"
        ? program.world.worldWill.interventions.find((candidate) => candidate.id === event.interventionId)
        : undefined;
    mutable.trace.push({
        id: `trace:${mutable.trace.length + 1}:${event.id}`,
        kind: eventTraceKind(event),
        worldId: event.worldId,
        eventId: event.id,
        causes: [...event.causes],
        ...(intervention ? { anchorId: intervention.anchorId, interventionId: intervention.id } : {}),
        effects,
    });
    const seaError = recomputeSea(program, state, mutable.trace, event.id);
    if (seaError) {
        return seaError;
    }
    return undefined;
}

function closeNonInterventionEvents(
    program: ExecutableAnchoredNarrativeProgram,
    mutable: MutableContinuation,
): string | undefined {
    let changed = true;
    while (changed) {
        changed = false;
        for (const event of program.world.causalEvents) {
            if (event.kind === "world-will-intervention" || mutable.realizedEvents.has(event.id)) {
                continue;
            }
            if (event.causes.every((cause) => mutable.realizedEvents.has(cause))) {
                const error = applyEvent(program, mutable, event);
                if (error) {
                    return error;
                }
                changed = true;
            }
        }
    }
    return undefined;
}

function absoluteExact(value: ExactValue): ExactValue | undefined {
    const comparison = compareExactRationals(value, exact.integer(0));
    if (comparison === undefined) {
        return undefined;
    }
    return comparison < 0 ? negateExactRational(value) : normalizeExactValue(value);
}

function scoreObjectives(
    program: ExecutableAnchoredNarrativeProgram,
    states: Map<string, MutableWorldState>,
): ObjectiveScore | undefined {
    let score = exact.integer(0);
    const contributions: NarrativeObjectiveContribution[] = [];
    for (const objective of program.world.worldWill.objectives) {
        const value = states.get(objective.targetWorldId)?.fields[objective.fieldId];
        const weighted = value ? multiplyExactRationals(value, objective.weight) : undefined;
        if (!weighted) {
            return undefined;
        }
        const contribution = objective.direction === "maximize"
            ? weighted
            : objective.direction === "minimize"
                ? negateExactRational(weighted)
                : absoluteExact(weighted) ? negateExactRational(absoluteExact(weighted)!) : undefined;
        if (!contribution) {
            return undefined;
        }
        const nextScore = addExactRationals(score, contribution);
        if (!nextScore) {
            return undefined;
        }
        score = nextScore;
        contributions.push({
            objectiveId: objective.id,
            worldId: objective.targetWorldId,
            fieldId: objective.fieldId,
            direction: objective.direction,
            weightedValue: contribution,
        });
    }
    return { score, contributions };
}

function transitionForEvent(
    program: ExecutableAnchoredNarrativeProgram,
    eventId: string,
): NarrativeEventTransition | undefined {
    return program.eventTransitions.find((transition) => transition.eventId === eventId);
}

function continuationFromMutable(
    program: ExecutableAnchoredNarrativeProgram,
    mutable: MutableContinuation,
    id: string,
    selection: NarrativeContinuation["selection"],
    interventionIds: string[],
    score: ExactValue,
): NarrativeContinuation {
    const realizedEvents = program.world.causalEvents.filter((event) => mutable.realizedEvents.has(event.id));
    const reversibleEventIds = realizedEvents.filter((event) => transitionForEvent(program, event.id)?.reversibility === "reversible")
        .map((event) => event.id).sort();
    const irreversibleEventIds = realizedEvents.filter((event) => event.kind === "history-commit"
        || transitionForEvent(program, event.id)?.reversibility === "irreversible").map((event) => event.id).sort();
    return {
        id,
        selection,
        interventionIds: [...interventionIds].sort(),
        score,
        worldStates: serializeStates(mutable.states),
        realizedEventIds: [...mutable.realizedEvents].sort(),
        trace: mutable.trace,
        historyCommits: mutable.historyCommits,
        order: {
            kind: "causal-partial-order",
            universalClock: false,
            causalEdges: realizedEvents.flatMap((event) => event.causes
                .filter((cause) => mutable.realizedEvents.has(cause))
                .map((cause) => ({ cause, effect: event.id }))),
            evaluationOrder: mutable.evaluationOrder,
            reversibleEventIds,
            irreversibleEventIds,
            createsHistoryArrow: mutable.historyCommits.length > 0,
        },
    };
}

function combinations<T>(values: T[]): T[][] {
    const result: T[][] = [];
    const count = 1 << values.length;
    for (let mask = 1; mask < count; mask += 1) {
        result.push(values.filter((_, index) => (mask & (1 << index)) !== 0));
    }
    return result;
}

function effectsConflict(program: ExecutableAnchoredNarrativeProgram, events: NarrativeCausalEvent[]): boolean {
    const effectsByField = new Map<string, NarrativeFieldEffect[]>();
    for (const event of events) {
        for (const effect of transitionForEvent(program, event.id)?.effects ?? []) {
            const key = fieldKey(event.worldId, effect.fieldId);
            effectsByField.set(key, [...effectsByField.get(key) ?? [], effect]);
        }
    }
    return [...effectsByField.values()].some((effects) => effects.length > 1 && effects.some((effect) => effect.operation === "set"));
}

function normalizedOptions(options: NarrativeExecutionOptions): AnchoredNarrativeRun["options"] {
    return {
        worldWillEnabled: options.worldWillEnabled ?? true,
        cutAnchorIds: [...new Set(options.cutAnchorIds ?? [])].sort(),
        fieldOverrides: Object.fromEntries(Object.entries(options.fieldOverrides ?? {}).sort(([left], [right]) => left.localeCompare(right))),
        evaluationBudgetPerQuery: options.evaluationBudgetPerQuery ?? 10_000,
        maxInterventionCombinations: options.maxInterventionCombinations ?? 1_024,
    };
}

export function realizeAnchoredNarrativeWorld(
    program: ExecutableAnchoredNarrativeProgram,
    executionOptions: NarrativeExecutionOptions = {},
): AnchoredNarrativeRun {
    const options = normalizedOptions(executionOptions);
    const diagnostics = validateExecutableNarrativeProgram(program);
    const base = {
        mode: "bubble-anchored-narrative-run.v1" as const,
        programDigest: digest(program),
        options,
        diagnostics,
        formalEvidence: [] as NarrativeFormalEvidence[],
        initialWorldStates: [] as NarrativeWorldState[],
        interventionEligibility: [] as NarrativeInterventionEligibility[],
        candidateAssessments: [] as NarrativeCandidateAssessment[],
        continuations: [] as NarrativeContinuation[],
        selectedContinuationIds: [] as string[],
        unresolvedAlternativeIds: [] as string[],
        resourceUse: {
            formalQueryCount: 0,
            formalEvaluationSteps: 0,
            interventionCombinationCount: 0,
            combinationLimit: options.maxInterventionCombinations,
            exhaustiveInterventionSearch: true,
        },
    };
    if (diagnostics.length > 0) {
        return { ...base, status: "contradicted", reason: "executable narrative program failed validation" };
    }

    const formalEvidence: NarrativeFormalEvidence[] = [];
    let formalSteps = 0;
    const states = new Map<string, MutableWorldState>();
    for (const world of program.world.worlds) {
        const fieldBindings = new Map(world.fields.map((field) => [field.id, field]));
        states.set(world.id, {
            worldId: world.id,
            fields: {},
            seaContribution: exact.integer(0),
            intrinsicViability: exact.integer(0),
            fieldBindings,
        });
    }
    const initialTrace: NarrativeExecutionTraceEntry[] = [];
    for (const initializer of program.fieldInitializers) {
        const evaluated = evaluateQuery(
            program,
            fieldKey(initializer.worldId, initializer.fieldId),
            "initial-field",
            initializer.query,
            options.evaluationBudgetPerQuery,
        );
        formalEvidence.push(evaluated.evidence);
        formalSteps += evaluated.steps;
        if (evaluated.evidence.status !== "resolved" || !evaluated.evidence.value) {
            return {
                ...base,
                status: evaluated.evidence.status === "undetermined" ? "underdetermined" : "contradicted",
                reason: `initial field '${fieldKey(initializer.worldId, initializer.fieldId)}' did not resolve`,
                formalEvidence,
                resourceUse: { ...base.resourceUse, formalQueryCount: formalEvidence.length, formalEvaluationSteps: formalSteps },
            };
        }
        const value = options.fieldOverrides[fieldKey(initializer.worldId, initializer.fieldId)]
            ? normalizeExactValue(options.fieldOverrides[fieldKey(initializer.worldId, initializer.fieldId)]!)
            : evaluated.evidence.value;
        if (!value) {
            return { ...base, status: "contradicted", reason: `invalid field override for '${fieldKey(initializer.worldId, initializer.fieldId)}'`, formalEvidence };
        }
        states.get(initializer.worldId)!.fields[initializer.fieldId] = value;
        initialTrace.push({
            id: `trace:${initialTrace.length + 1}:initial:${fieldKey(initializer.worldId, initializer.fieldId)}`,
            kind: "initial-field",
            worldId: initializer.worldId,
            causes: [],
            effects: [{ fieldId: initializer.fieldId, operation: "set", after: value }],
        });
    }
    for (const world of program.world.worlds) {
        const state = states.get(world.id)!;
        const intrinsic = state.fields[world.seaCoupling.viabilityFieldId];
        if (!intrinsic || intrinsic.kind !== "rational") {
            return { ...base, status: "contradicted", reason: `viability field for '${world.id}' must be rational`, formalEvidence };
        }
        state.intrinsicViability = intrinsic;
        const error = recomputeSea(program, state, initialTrace);
        if (error) {
            return { ...base, status: "contradicted", reason: error, formalEvidence };
        }
    }
    const initialWorldStatesSnapshot = serializeStates(states);

    const anchorIdentity = new Map<string, boolean>();
    for (const predicate of program.worldWillExecution.anchorIdentity) {
        const evaluated = evaluateStatePredicate(
            program,
            predicate,
            "anchor-identity",
            options.evaluationBudgetPerQuery,
            states,
        );
        formalEvidence.push(evaluated.evidence);
        formalSteps += evaluated.steps;
        const key = `${predicate.anchorId}:${predicate.query.familyId}`;
        if (evaluated.evidence.status !== "resolved" || evaluated.evidence.value?.kind !== "boolean") {
            return {
                ...base,
                status: evaluated.evidence.status === "undetermined" ? "underdetermined" : "contradicted",
                reason: `anchor identity '${predicate.id}' did not resolve to boolean`,
                formalEvidence,
                initialWorldStates: initialWorldStatesSnapshot,
                resourceUse: { ...base.resourceUse, formalQueryCount: formalEvidence.length, formalEvaluationSteps: formalSteps },
            };
        }
        anchorIdentity.set(key, evaluated.evidence.value.value);
    }

    const autonomous: MutableContinuation = {
        states,
        realizedEvents: new Set(),
        trace: initialTrace,
        historyCommits: [],
        evaluationOrder: [],
    };
    const autonomousError = closeNonInterventionEvents(program, autonomous);
    if (autonomousError) {
        return { ...base, status: "contradicted", reason: autonomousError, formalEvidence, initialWorldStates: initialWorldStatesSnapshot };
    }
    const baselineObjective = scoreObjectives(program, autonomous.states);
    if (!baselineObjective) {
        return { ...base, status: "contradicted", reason: "World Will objective did not resolve to exact rational score", formalEvidence };
    }
    const autonomousContinuation = continuationFromMutable(
        program,
        autonomous,
        "continuation:baseline",
        "baseline",
        [],
        baselineObjective.score,
    );

    const interventionEventById = new Map<string, NarrativeCausalEvent>();
    for (const event of program.world.causalEvents) {
        if (event.kind === "world-will-intervention") {
            interventionEventById.set(event.interventionId, event);
        }
    }
    const eligibility: NarrativeInterventionEligibility[] = program.world.worldWill.interventions.map((intervention) => {
        const reasons: string[] = [];
        const event = interventionEventById.get(intervention.id);
        const anchor = program.world.anchors.find((candidate) => candidate.id === intervention.anchorId);
        if (!options.worldWillEnabled) reasons.push("world-will-disabled");
        if (options.cutAnchorIds.includes(intervention.anchorId)) reasons.push("anchor-cut");
        if (anchor?.identityPredicateFamilyIds.some((familyId) => anchorIdentity.get(`${anchor.id}:${familyId}`) !== true)) {
            reasons.push("anchor-identity-failed");
        }
        if (!event) reasons.push("intervention-event-missing");
        if (event && !event.causes.every((cause) => autonomous.realizedEvents.has(cause))) reasons.push("causal-precondition-unrealized");
        return {
            interventionId: intervention.id,
            ...(event ? { eventId: event.id } : {}),
            anchorId: intervention.anchorId,
            status: reasons.length === 0 ? "eligible" : "blocked",
            reasons,
        };
    });
    const eligibleEvents = eligibility.filter((entry) => entry.status === "eligible")
        .map((entry) => interventionEventById.get(entry.interventionId)!)
        .sort((left, right) => left.id.localeCompare(right.id));
    const combinationCountBig = (1n << BigInt(eligibleEvents.length)) - 1n;
    if (combinationCountBig > BigInt(options.maxInterventionCombinations) || eligibleEvents.length >= 31) {
        return {
            ...base,
            status: "underdetermined",
            reason: "intervention combination budget exhausted before exhaustive World Will optimization",
            formalEvidence,
            initialWorldStates: initialWorldStatesSnapshot,
            autonomousContinuation,
            interventionEligibility: eligibility,
            baselineScore: baselineObjective.score,
            continuations: [autonomousContinuation],
            unresolvedAlternativeIds: eligibleEvents.map((event) => `unsearched:${event.id}`),
            resourceUse: {
                formalQueryCount: formalEvidence.length,
                formalEvaluationSteps: formalSteps,
                interventionCombinationCount: 0,
                combinationLimit: options.maxInterventionCombinations,
                exhaustiveInterventionSearch: false,
            },
        };
    }

    const eventCombinations = combinations(eligibleEvents);
    const candidateAssessments: NarrativeCandidateAssessment[] = [];
    const candidateContinuations = new Map<string, NarrativeContinuation>();
    const costs = new Map(program.worldWillExecution.interventionCosts.map((entry) => [entry.interventionId, entry.cost]));
    for (const combination of eventCombinations) {
        const interventionIds = combination.map((event) => event.kind === "world-will-intervention" ? event.interventionId : "missing").sort();
        const candidateId = `candidate:${interventionIds.join("+")}`;
        if (effectsConflict(program, combination)) {
            candidateAssessments.push({ id: candidateId, interventionIds, status: "inadmissible", reasons: ["non-commuting-field-effects"] });
            continue;
        }
        const mutable = cloneMutableContinuation(autonomous);
        let error: string | undefined;
        for (const event of combination) {
            error = applyEvent(program, mutable, event);
            if (error) break;
        }
        if (!error) error = closeNonInterventionEvents(program, mutable);
        if (error) {
            candidateAssessments.push({ id: candidateId, interventionIds, status: "inadmissible", reasons: [error] });
            continue;
        }
        let constraintsUndetermined = false;
        const failedConstraints: string[] = [];
        for (const predicate of program.worldWillExecution.hardConstraints) {
            const evaluated = evaluateStatePredicate(
                program,
                predicate,
                "hard-constraint",
                options.evaluationBudgetPerQuery,
                mutable.states,
                `${candidateId}:`,
            );
            formalEvidence.push(evaluated.evidence);
            formalSteps += evaluated.steps;
            if (evaluated.evidence.status === "undetermined") {
                constraintsUndetermined = true;
            } else if (evaluated.evidence.status !== "resolved"
                || evaluated.evidence.value?.kind !== "boolean"
                || !evaluated.evidence.value.value) {
                failedConstraints.push(predicate.id);
            }
        }
        if (constraintsUndetermined) {
            candidateAssessments.push({
                id: candidateId,
                interventionIds,
                status: "undetermined",
                reasons: ["hard-constraint-undetermined"],
            });
            continue;
        }
        if (failedConstraints.length > 0) {
            candidateAssessments.push({
                id: candidateId,
                interventionIds,
                status: "inadmissible",
                reasons: failedConstraints.map((id) => `hard-constraint-failed:${id}`),
            });
            continue;
        }
        const objective = scoreObjectives(program, mutable.states);
        let cost = exact.integer(0);
        for (const interventionId of interventionIds) {
            const next = addExactRationals(cost, costs.get(interventionId) ?? exact.integer(0));
            if (!next) {
                error = `cost for '${interventionId}' is not exact rational`;
                break;
            }
            cost = next;
        }
        const score = objective ? subtractExactRationals(objective.score, cost) : undefined;
        const improvement = score ? subtractExactRationals(score, baselineObjective.score) : undefined;
        if (error || !objective || !score || !improvement) {
            candidateAssessments.push({ id: candidateId, interventionIds, status: "inadmissible", reasons: [error ?? "objective evaluation failed"] });
            continue;
        }
        const improved = compareExactRationals(improvement, exact.integer(0)) === 1;
        candidateAssessments.push({
            id: candidateId,
            interventionIds,
            status: improved ? "improved" : "rejected",
            score,
            cost,
            improvement,
            objectiveContributions: objective.contributions,
            reasons: improved ? [] : ["does-not-improve-global-objective-after-cost"],
        });
        candidateContinuations.set(candidateId, continuationFromMutable(
            program,
            mutable,
            `continuation:${interventionIds.join("+")}`,
            "alternative",
            interventionIds,
            score,
        ));
    }

    const improved = candidateAssessments.filter((candidate) => candidate.status === "improved" && candidate.score);
    if (improved.length === 0) {
        const unresolvedCandidates = candidateAssessments.filter((candidate) => candidate.status === "undetermined");
        if (unresolvedCandidates.length > 0) {
            return {
                ...base,
                status: "underdetermined",
                reason: "at least one admissible World Will candidate has an unresolved hard constraint",
                formalEvidence,
                initialWorldStates: initialWorldStatesSnapshot,
                autonomousContinuation,
                interventionEligibility: eligibility,
                baselineScore: baselineObjective.score,
                candidateAssessments,
                continuations: [autonomousContinuation],
                unresolvedAlternativeIds: unresolvedCandidates.map((candidate) => candidate.id),
                resourceUse: {
                    formalQueryCount: formalEvidence.length,
                    formalEvaluationSteps: formalSteps,
                    interventionCombinationCount: eventCombinations.length,
                    combinationLimit: options.maxInterventionCombinations,
                    exhaustiveInterventionSearch: true,
                },
            };
        }
        return {
            ...base,
            status: eligibility.some((entry) => entry.status === "eligible") ? "stable" : "blocked",
            reason: eligibility.some((entry) => entry.status === "eligible")
                ? "no admissible intervention improves the coupled objective after cost"
                : "all World Will interventions are blocked; autonomous story remains",
            formalEvidence,
            initialWorldStates: initialWorldStatesSnapshot,
            autonomousContinuation,
            interventionEligibility: eligibility,
            baselineScore: baselineObjective.score,
            candidateAssessments,
            continuations: [autonomousContinuation],
            selectedContinuationIds: [autonomousContinuation.id],
            resourceUse: {
                formalQueryCount: formalEvidence.length,
                formalEvaluationSteps: formalSteps,
                interventionCombinationCount: eventCombinations.length,
                combinationLimit: options.maxInterventionCombinations,
                exhaustiveInterventionSearch: true,
            },
        };
    }
    const bestScore = improved.reduce((best, candidate) => compareExactRationals(candidate.score!, best) === 1 ? candidate.score! : best, improved[0]!.score!);
    const best = improved.filter((candidate) => compareExactRationals(candidate.score!, bestScore) === 0);
    const continuations = best.map((candidate) => candidateContinuations.get(candidate.id)!).filter(Boolean);
    if (best.length === 1) {
        continuations[0]!.selection = "selected";
        return {
            ...base,
            status: "realized",
            formalEvidence,
            initialWorldStates: initialWorldStatesSnapshot,
            autonomousContinuation,
            interventionEligibility: eligibility,
            baselineScore: baselineObjective.score,
            candidateAssessments,
            continuations,
            selectedContinuationIds: [continuations[0]!.id],
            resourceUse: {
                formalQueryCount: formalEvidence.length,
                formalEvaluationSteps: formalSteps,
                interventionCombinationCount: eventCombinations.length,
                combinationLimit: options.maxInterventionCombinations,
                exhaustiveInterventionSearch: true,
            },
        };
    }
    if (program.worldWillExecution.decisionMode === "plural") {
        continuations.forEach((continuation) => { continuation.selection = "selected-plural"; });
        return {
            ...base,
            status: "plural",
            reason: "authored plural World Will preserves all equally optimal coupled continuations",
            formalEvidence,
            initialWorldStates: initialWorldStatesSnapshot,
            autonomousContinuation,
            interventionEligibility: eligibility,
            baselineScore: baselineObjective.score,
            candidateAssessments,
            continuations,
            selectedContinuationIds: continuations.map((continuation) => continuation.id),
            resourceUse: {
                formalQueryCount: formalEvidence.length,
                formalEvaluationSteps: formalSteps,
                interventionCombinationCount: eventCombinations.length,
                combinationLimit: options.maxInterventionCombinations,
                exhaustiveInterventionSearch: true,
            },
        };
    }
    return {
        ...base,
        status: "underdetermined",
        reason: "deterministic World Will has multiple equally optimal coupled continuations",
        formalEvidence,
        initialWorldStates: initialWorldStatesSnapshot,
        autonomousContinuation,
        interventionEligibility: eligibility,
        baselineScore: baselineObjective.score,
        candidateAssessments,
        continuations,
        unresolvedAlternativeIds: continuations.map((continuation) => continuation.id),
        resourceUse: {
            formalQueryCount: formalEvidence.length,
            formalEvaluationSteps: formalSteps,
            interventionCombinationCount: eventCombinations.length,
            combinationLimit: options.maxInterventionCombinations,
            exhaustiveInterventionSearch: true,
        },
    };
}

export function inspectAnchoredNarrativeRun(
    run: AnchoredNarrativeRun,
    query: { continuationId?: string; worldId?: string } = {},
): AnchoredNarrativeInspection {
    const continuations = run.continuations.filter((continuation) => !query.continuationId || continuation.id === query.continuationId)
        .map((continuation) => query.worldId
            ? { ...continuation, worldStates: continuation.worldStates.filter((state) => state.worldId === query.worldId) }
            : continuation);
    return {
        mode: "bubble-anchored-narrative-inspection.v1",
        summary: {
            status: run.status,
            worldCount: new Set(run.initialWorldStates.map((state) => state.worldId)).size,
            continuationCount: continuations.length,
            selectedContinuationCount: run.selectedContinuationIds.length,
            unresolvedAlternativeCount: run.unresolvedAlternativeIds.length,
            createsHistoryArrow: continuations.some((continuation) => continuation.order.createsHistoryArrow),
            exhaustiveInterventionSearch: run.resourceUse.exhaustiveInterventionSearch,
        },
        decision: {
            ...(run.baselineScore ? { baselineScore: run.baselineScore } : {}),
            interventionEligibility: run.interventionEligibility,
            candidates: run.candidateAssessments,
        },
        continuations,
        formalEvidence: run.formalEvidence,
    };
}

export function recordAnchoredNarrativeWorld(
    program: ExecutableAnchoredNarrativeProgram,
    options: NarrativeExecutionOptions = {},
): AnchoredNarrativeReplayRecord {
    const recordedRun = realizeAnchoredNarrativeWorld(program, options);
    return {
        mode: "bubble-anchored-narrative-replay.v1",
        program: cloneValue(program),
        options: cloneValue(options),
        recordedRun,
        recordedDigest: digest(recordedRun),
    };
}

export function replayAnchoredNarrativeWorld(
    record: AnchoredNarrativeReplayRecord,
): AnchoredNarrativeReplayResult {
    const replayedRun = realizeAnchoredNarrativeWorld(record.program, record.options);
    const replayedDigest = digest(replayedRun);
    return {
        mode: "bubble-anchored-narrative-replay-result.v1",
        status: replayedDigest === record.recordedDigest ? "same-world-reexecution" : "reexecution-drift",
        recordedDigest: record.recordedDigest,
        replayedDigest,
        selectedContinuationsPreserved: stableStringify(replayedRun.selectedContinuationIds)
            === stableStringify(record.recordedRun.selectedContinuationIds),
        unresolvedAlternativesPreserved: stableStringify(replayedRun.unresolvedAlternativeIds)
            === stableStringify(record.recordedRun.unresolvedAlternativeIds),
        replayedRun,
    };
}
