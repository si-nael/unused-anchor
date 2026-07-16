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
    type IntensionalProofStep,
    type IntensionalValueKind,
} from "./intensional";
import {
    validateAnchoredCausalWorld,
    type AnchoredCausalWorldSystem,
    type CausalDiagnostic,
    type CausalEmergenceCriterion,
    type CausalFieldBinding,
    type CausalFieldEffect,
    type CausalInternalLaw,
    type CausalStatePredicate,
    type CausalWorldDefinition,
    type CausalWorldWillIntervention,
} from "./causal";

export interface CausalFieldInitializer {
    worldId: string;
    fieldId: string;
    query: IntensionalCoordinateQuery;
}

export interface CausalSeaLaw {
    worldId: string;
    positiveWeight: ExactValue;
    negativeWeight: ExactValue;
}

export interface CausalAnchorIdentityQuery extends CausalStatePredicate {
    anchorId: string;
}

export interface CausalInterventionCost {
    interventionId: string;
    cost: ExactValue;
}

export interface ExecutableAnchoredCausalProgram {
    mode: "bubble-anchored-causal-program.v2";
    world: AnchoredCausalWorldSystem;
    fieldInitializers: CausalFieldInitializer[];
    seaLaws: CausalSeaLaw[];
    execution: {
        decisionMode: "deterministic" | "plural";
        hardConstraints: CausalStatePredicate[];
        anchorIdentity: CausalAnchorIdentityQuery[];
        interventionCosts: CausalInterventionCost[];
    };
}

export interface CausalExecutionOptions {
    worldWillEnabled?: boolean;
    cutAnchorIds?: string[];
    fieldOverrides?: Record<string, ExactValue>;
    counterfactualInternalEventAblationLawIds?: string[];
    evaluationBudgetPerQuery?: number;
    maxInterventionCombinations?: number;
    maxInternalFrontiers?: number;
}

export type ResolvedCausalExecutionOptions = Omit<Required<CausalExecutionOptions>, "counterfactualInternalEventAblationLawIds">
    & Pick<CausalExecutionOptions, "counterfactualInternalEventAblationLawIds">;

export interface CausalInternalEventAblation {
    id: string;
    kind: "internal-event-nonrealization";
    lawId: string;
    worldId: string;
    wouldHaveEventId: string;
    guardEvidenceSubjectId: string;
    frontierIndex: number;
    causes: string[];
    lawRetainedInProgram: true;
    effectsSuppressed: true;
}

export interface CausalWorldState {
    worldId: string;
    fields: Record<string, ExactValue>;
    intrinsicViability: ExactValue;
    seaContribution: ExactValue;
}

export interface CausalFormalEvidence {
    subjectId: string;
    purpose: "initial-field" | "law-guard" | "hard-constraint" | "anchor-identity" | "emergence-criterion";
    status: "resolved" | "undetermined" | "contradicted";
    value?: ExactValue;
    reason?: string;
    proof: IntensionalProofStep[];
}

export interface CausalTraceEffect {
    fieldId: string;
    layer: "world-field" | "intrinsic-viability";
    operation: "add" | "subtract" | "set" | "derive";
    before?: ExactValue;
    operand?: ExactValue;
    after: ExactValue;
}

export interface CausalTraceEntry {
    id: string;
    kind: "initial-field" | "internal-law" | "sea-coupling" | "world-will-intervention" | "history-commit";
    worldId: string;
    eventId?: string;
    lawId?: string;
    interventionId?: string;
    anchorId?: string;
    causes: string[];
    effects: CausalTraceEffect[];
}

export interface CausalHistoryCommit {
    eventId: string;
    causedByEventId: string;
    worldId: string;
    affectedFields: Record<string, ExactValue>;
    stateDigest: string;
}

export interface CausalEmergenceAssessment {
    criterionId: string;
    worldId: string;
    status: "absent" | "persistent" | "emerged" | "dissolved" | "undetermined" | "contradicted";
    witnessFields: Record<string, ExactValue>;
    causedByEventIds: string[];
    initialEvidence: CausalFormalEvidence;
    finalEvidence: CausalFormalEvidence;
}

export interface CausalObjectiveContribution {
    objectiveId: string;
    worldId: string;
    fieldId: string;
    direction: "maximize" | "minimize" | "stabilize";
    weightedValue: ExactValue;
}

export interface CausalInterventionEligibility {
    interventionId: string;
    anchorId: string;
    status: "eligible" | "blocked";
    reasons: string[];
}

export interface CausalCandidateAssessment {
    id: string;
    interventionIds: string[];
    status: "improved" | "rejected" | "inadmissible" | "undetermined";
    score?: ExactValue;
    cost?: ExactValue;
    improvement?: ExactValue;
    objectiveContributions?: CausalObjectiveContribution[];
    reasons: string[];
}

export interface CausalContinuation {
    id: string;
    selection: "baseline" | "selected" | "selected-plural" | "alternative";
    interventionIds: string[];
    score: ExactValue;
    worldStates: CausalWorldState[];
    realizedEventIds: string[];
    trace: CausalTraceEntry[];
    historyCommits: CausalHistoryCommit[];
    internalEventAblations?: CausalInternalEventAblation[];
    emergenceAssessments: CausalEmergenceAssessment[];
    order: {
        kind: "causal-partial-order";
        universalClock: false;
        causalEdges: Array<{ cause: string; effect: string }>;
        evaluationOrder: string[];
        evaluationFrontiers: string[][];
        reversibleEventIds: string[];
        irreversibleEventIds: string[];
        createsHistoryArrow: boolean;
    };
}

export interface AnchoredCausalRun {
    mode: "bubble-anchored-causal-run.v2";
    programDigest: string;
    status: "realized" | "stable" | "plural" | "underdetermined" | "blocked" | "contradicted";
    reason?: string;
    options: ResolvedCausalExecutionOptions;
    diagnostics: CausalDiagnostic[];
    formalEvidence: CausalFormalEvidence[];
    initialWorldStates: CausalWorldState[];
    autonomousContinuation?: CausalContinuation;
    interventionEligibility: CausalInterventionEligibility[];
    baselineScore?: ExactValue;
    candidateAssessments: CausalCandidateAssessment[];
    continuations: CausalContinuation[];
    selectedContinuationIds: string[];
    unresolvedAlternativeIds: string[];
    resourceUse: {
        formalQueryCount: number;
        formalEvaluationSteps: number;
        internalFrontierCount: number;
        interventionCombinationCount: number;
        combinationLimit: number;
        exhaustiveInterventionSearch: boolean;
    };
}

export interface AnchoredCausalInspection {
    mode: "bubble-anchored-causal-inspection.v2";
    summary: {
        status: AnchoredCausalRun["status"];
        worldCount: number;
        continuationCount: number;
        selectedContinuationCount: number;
        unresolvedAlternativeCount: number;
        emergedStructureCount: number;
        dissolvedStructureCount: number;
        createsHistoryArrow: boolean;
        exhaustiveInterventionSearch: boolean;
    };
    decision: {
        baselineScore?: ExactValue;
        interventionEligibility: CausalInterventionEligibility[];
        candidates: CausalCandidateAssessment[];
    };
    continuations: CausalContinuation[];
    formalEvidence: CausalFormalEvidence[];
}

export interface AnchoredCausalReplayRecord {
    mode: "bubble-anchored-causal-replay.v2";
    program: ExecutableAnchoredCausalProgram;
    options: CausalExecutionOptions;
    recordedRun: AnchoredCausalRun;
    recordedDigest: string;
}

export interface AnchoredCausalReplayResult {
    mode: "bubble-anchored-causal-replay-result.v2";
    status: "same-world-reexecution" | "reexecution-drift";
    recordedDigest: string;
    recordedRunDigest: string;
    replayedDigest: string;
    recordIntegrityValid: boolean;
    recordedProgramDigestValid: boolean;
    fullRunPreserved: boolean;
    selectedContinuationsPreserved: boolean;
    unresolvedAlternativesPreserved: boolean;
    emergencePreserved: boolean;
    replayedRun: AnchoredCausalRun;
}

interface MutableState extends CausalWorldState {
    bindings: Map<string, CausalFieldBinding>;
}

interface EventRecord {
    id: string;
    causes: string[];
    reversibility: "reversible" | "irreversible";
}

interface MutableRealization {
    states: Map<string, MutableState>;
    appliedLawIds: Set<string>;
    trace: CausalTraceEntry[];
    historyCommits: CausalHistoryCommit[];
    internalEventAblations: CausalInternalEventAblation[];
    events: EventRecord[];
    evaluationOrder: string[];
    evaluationFrontiers: string[][];
    fieldCauses: Map<string, string[]>;
}

interface QueryEvaluation {
    evidence: CausalFormalEvidence;
    steps: number;
}

interface ClosureResult {
    status: "closed" | "undetermined" | "contradicted";
    reason?: string;
    unresolvedLawIds: string[];
    formalEvidence: CausalFormalEvidence[];
    formalSteps: number;
    frontierCount: number;
}

interface ObjectiveScore {
    score: ExactValue;
    contributions: CausalObjectiveContribution[];
}

interface EmergenceResult {
    assessments: CausalEmergenceAssessment[];
    evidence: CausalFormalEvidence[];
    formalSteps: number;
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

function cloneValue<T>(value: T): T {
    return structuredClone(value);
}

function stableStringify(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

function digest(value: unknown): string {
    return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function runtimeIssue(code: string, path: string, message: string): CausalDiagnostic {
    return { code, severity: "error", path, message };
}

function fieldKey(worldId: string, fieldId: string): string {
    return `${worldId}.${fieldId}`;
}

function nonNegativeRational(value: ExactValue): boolean {
    const normalized = normalizeExactValue(value);
    return normalized?.kind === "rational"
        && (compareExactRationals(normalized, exact.integer(0)) ?? -1) >= 0;
}

function predicateFieldKind(
    program: ExecutableAnchoredCausalProgram,
    worldId: string,
    fieldId: string,
): IntensionalValueKind | undefined {
    const field = program.world.worlds.find((world) => world.id === worldId)?.fields.find((candidate) => candidate.id === fieldId);
    return program.world.formal.families.find((family) => family.id === field?.familyId)?.valueKind;
}

function validateRuntimePredicate(
    program: ExecutableAnchoredCausalProgram,
    predicate: CausalStatePredicate,
    path: string,
    diagnostics: CausalDiagnostic[],
): void {
    if (!IDENTIFIER.test(predicate.id)) diagnostics.push(runtimeIssue("CKR001", `${path}.id`, "predicate id must be stable"));
    const family = program.world.formal.families.find((candidate) => candidate.id === predicate.query.familyId);
    if (!family || family.valueKind !== "boolean") {
        diagnostics.push(runtimeIssue("CKR002", `${path}.query.familyId`, "runtime predicate needs a boolean formal family"));
        return;
    }
    const declared = new Map(family.parameters.map((parameter) => [parameter.name, parameter.valueKind]));
    const supplied = new Set(Object.keys(predicate.query.parameters));
    for (const [index, binding] of predicate.fieldParameters.entries()) {
        const bindingPath = `${path}.fieldParameters[${index}]`;
        if (supplied.has(binding.parameterName) || !declared.has(binding.parameterName)) {
            diagnostics.push(runtimeIssue("CKR003", bindingPath, `invalid or duplicate parameter binding '${binding.parameterName}'`));
            continue;
        }
        supplied.add(binding.parameterName);
        if (predicateFieldKind(program, binding.worldId, binding.fieldId) !== declared.get(binding.parameterName)) {
            diagnostics.push(runtimeIssue("CKR004", bindingPath, `bound field '${fieldKey(binding.worldId, binding.fieldId)}' has the wrong value kind`));
        }
    }
    for (const parameterName of declared.keys()) {
        if (!supplied.has(parameterName)) diagnostics.push(runtimeIssue("CKR005", path, `predicate is missing parameter '${parameterName}'`));
    }
    for (const parameterName of supplied) {
        if (!declared.has(parameterName)) diagnostics.push(runtimeIssue("CKR006", path, `predicate supplies undeclared parameter '${parameterName}'`));
    }
}

export function validateExecutableCausalProgram(program: ExecutableAnchoredCausalProgram): CausalDiagnostic[] {
    const diagnostics = validateAnchoredCausalWorld(program.world);
    if (program.mode !== "bubble-anchored-causal-program.v2") {
        diagnostics.push(runtimeIssue("CKR007", "mode", "unsupported executable causal program mode"));
    }
    const worlds = new Map(program.world.worlds.map((world) => [world.id, world]));
    const initializerKeys = new Set<string>();
    for (const [index, initializer] of program.fieldInitializers.entries()) {
        const path = `fieldInitializers[${index}]`;
        const field = worlds.get(initializer.worldId)?.fields.find((candidate) => candidate.id === initializer.fieldId);
        const key = fieldKey(initializer.worldId, initializer.fieldId);
        if (!field) diagnostics.push(runtimeIssue("CKR008", path, `unknown initialized field '${key}'`));
        if (initializerKeys.has(key)) diagnostics.push(runtimeIssue("CKR009", path, `duplicate initializer '${key}'`));
        initializerKeys.add(key);
        if (field && field.familyId !== initializer.query.familyId) {
            diagnostics.push(runtimeIssue("CKR010", `${path}.query.familyId`, `initializer must query '${field.familyId}'`));
        }
    }
    for (const world of program.world.worlds) {
        for (const field of world.fields) {
            if (!initializerKeys.has(fieldKey(world.id, field.id))) {
                diagnostics.push(runtimeIssue("CKR011", "fieldInitializers", `missing initializer '${fieldKey(world.id, field.id)}'`));
            }
        }
    }
    const seaWorlds = new Set<string>();
    for (const [index, law] of program.seaLaws.entries()) {
        const path = `seaLaws[${index}]`;
        if (!worlds.has(law.worldId)) diagnostics.push(runtimeIssue("CKR012", `${path}.worldId`, `unknown sea-law world '${law.worldId}'`));
        if (seaWorlds.has(law.worldId)) diagnostics.push(runtimeIssue("CKR013", path, `duplicate sea law for '${law.worldId}'`));
        seaWorlds.add(law.worldId);
        if (!nonNegativeRational(law.positiveWeight) || !nonNegativeRational(law.negativeWeight)) {
            diagnostics.push(runtimeIssue("CKR014", path, "sea weights must be non-negative exact rationals"));
        }
    }
    for (const world of program.world.worlds) {
        if (!seaWorlds.has(world.id)) diagnostics.push(runtimeIssue("CKR015", "seaLaws", `missing sea law for '${world.id}'`));
    }
    if (program.execution.decisionMode !== "deterministic" && program.execution.decisionMode !== "plural") {
        diagnostics.push(runtimeIssue("CKR016", "execution.decisionMode", "decision mode must be deterministic or plural"));
    }
    for (const [index, predicate] of program.execution.hardConstraints.entries()) {
        validateRuntimePredicate(program, predicate, `execution.hardConstraints[${index}]`, diagnostics);
        if (!program.world.worldWill.hardConstraintFamilyIds.includes(predicate.query.familyId)) {
            diagnostics.push(runtimeIssue("CKR017", `execution.hardConstraints[${index}]`, "hard constraint query is not declared by World Will"));
        }
    }
    for (const familyId of program.world.worldWill.hardConstraintFamilyIds) {
        if (!program.execution.hardConstraints.some((predicate) => predicate.query.familyId === familyId)) {
            diagnostics.push(runtimeIssue("CKR018", "execution.hardConstraints", `missing query for hard constraint family '${familyId}'`));
        }
    }
    for (const [index, predicate] of program.execution.anchorIdentity.entries()) {
        validateRuntimePredicate(program, predicate, `execution.anchorIdentity[${index}]`, diagnostics);
        const anchor = program.world.anchors.find((candidate) => candidate.id === predicate.anchorId);
        if (!anchor?.identityPredicateFamilyIds.includes(predicate.query.familyId)) {
            diagnostics.push(runtimeIssue("CKR019", `execution.anchorIdentity[${index}]`, "anchor identity query is not declared by its anchor"));
        }
    }
    for (const anchor of program.world.anchors) {
        for (const familyId of anchor.identityPredicateFamilyIds) {
            if (!program.execution.anchorIdentity.some((predicate) => predicate.anchorId === anchor.id && predicate.query.familyId === familyId)) {
                diagnostics.push(runtimeIssue("CKR020", "execution.anchorIdentity", `missing identity query '${anchor.id}:${familyId}'`));
            }
        }
    }
    const interventions = new Set(program.world.worldWill.interventions.map((intervention) => intervention.id));
    const costIds = new Set<string>();
    for (const [index, entry] of program.execution.interventionCosts.entries()) {
        if (!interventions.has(entry.interventionId)) diagnostics.push(runtimeIssue("CKR021", `execution.interventionCosts[${index}]`, `unknown intervention '${entry.interventionId}'`));
        if (costIds.has(entry.interventionId)) diagnostics.push(runtimeIssue("CKR022", `execution.interventionCosts[${index}]`, `duplicate cost '${entry.interventionId}'`));
        costIds.add(entry.interventionId);
        if (!nonNegativeRational(entry.cost)) diagnostics.push(runtimeIssue("CKR023", `execution.interventionCosts[${index}].cost`, "intervention cost must be non-negative exact rational"));
    }
    for (const interventionId of interventions) {
        if (!costIds.has(interventionId)) diagnostics.push(runtimeIssue("CKR024", "execution.interventionCosts", `missing cost for '${interventionId}'`));
    }
    return diagnostics;
}

function normalizedOptions(options: CausalExecutionOptions): Required<CausalExecutionOptions> {
    return {
        worldWillEnabled: options.worldWillEnabled ?? true,
        cutAnchorIds: [...new Set(options.cutAnchorIds ?? [])].sort(),
        fieldOverrides: Object.fromEntries(Object.entries(options.fieldOverrides ?? {}).sort(([left], [right]) => left.localeCompare(right))),
        counterfactualInternalEventAblationLawIds: [...new Set(options.counterfactualInternalEventAblationLawIds ?? [])].sort(),
        evaluationBudgetPerQuery: options.evaluationBudgetPerQuery ?? 10_000,
        maxInterventionCombinations: options.maxInterventionCombinations ?? 1_024,
        maxInternalFrontiers: options.maxInternalFrontiers ?? 1_024,
    };
}

function recordedOptions(options: Required<CausalExecutionOptions>): ResolvedCausalExecutionOptions {
    const { counterfactualInternalEventAblationLawIds, ...ordinary } = cloneValue(options);
    return counterfactualInternalEventAblationLawIds.length > 0
        ? { ...ordinary, counterfactualInternalEventAblationLawIds }
        : ordinary;
}

function evaluateQuery(
    program: ExecutableAnchoredCausalProgram,
    subjectId: string,
    purpose: CausalFormalEvidence["purpose"],
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

function evaluatePredicate(
    program: ExecutableAnchoredCausalProgram,
    predicate: CausalStatePredicate,
    purpose: CausalFormalEvidence["purpose"],
    states: Map<string, MutableState>,
    budget: number,
    subjectPrefix = "",
): QueryEvaluation {
    const parameters = { ...predicate.query.parameters };
    for (const binding of predicate.fieldParameters) {
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

function serializeStates(states: Map<string, MutableState>): CausalWorldState[] {
    return [...states.values()].sort((left, right) => left.worldId.localeCompare(right.worldId)).map((state) => ({
        worldId: state.worldId,
        fields: Object.fromEntries(Object.entries(state.fields).sort(([left], [right]) => left.localeCompare(right))),
        intrinsicViability: state.intrinsicViability,
        seaContribution: state.seaContribution,
    }));
}

function statesFromSerialized(
    program: ExecutableAnchoredCausalProgram,
    serialized: CausalWorldState[],
): Map<string, MutableState> {
    const states = new Map<string, MutableState>();
    for (const state of serialized) {
        const world = program.world.worlds.find((candidate) => candidate.id === state.worldId)!;
        states.set(state.worldId, {
            ...cloneValue(state),
            bindings: new Map(world.fields.map((field) => [field.id, field])),
        });
    }
    return states;
}

function cloneRealization(source: MutableRealization): MutableRealization {
    const states = new Map<string, MutableState>();
    for (const [worldId, state] of source.states) {
        states.set(worldId, {
            worldId,
            fields: cloneValue(state.fields),
            intrinsicViability: cloneValue(state.intrinsicViability),
            seaContribution: cloneValue(state.seaContribution),
            bindings: state.bindings,
        });
    }
    return {
        states,
        appliedLawIds: new Set(source.appliedLawIds),
        trace: cloneValue(source.trace),
        historyCommits: cloneValue(source.historyCommits),
        internalEventAblations: cloneValue(source.internalEventAblations),
        events: cloneValue(source.events),
        evaluationOrder: [...source.evaluationOrder],
        evaluationFrontiers: cloneValue(source.evaluationFrontiers),
        fieldCauses: new Map([...source.fieldCauses].map(([key, causes]) => [key, [...causes]])),
    };
}

function recomputeSea(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    worldId: string,
    causes: string[],
): string | undefined {
    const world = program.world.worlds.find((candidate) => candidate.id === worldId);
    const law = program.seaLaws.find((candidate) => candidate.worldId === worldId);
    const state = mutable.states.get(worldId);
    if (!world || !law || !state) return `missing world or sea law for '${worldId}'`;
    const positive = state.fields[world.seaCoupling.positiveFieldId];
    const negative = state.fields[world.seaCoupling.negativeFieldId];
    if (!positive || !negative) return `sea fields are unavailable for '${worldId}'`;
    const positiveContribution = multiplyExactRationals(positive, law.positiveWeight);
    const negativeContribution = multiplyExactRationals(negative, law.negativeWeight);
    const seaContribution = positiveContribution && negativeContribution
        ? subtractExactRationals(positiveContribution, negativeContribution)
        : undefined;
    const viability = seaContribution ? addExactRationals(state.intrinsicViability, seaContribution) : undefined;
    if (!seaContribution || !viability) return `sea coupling for '${worldId}' requires exact rational fields`;
    const fieldId = world.seaCoupling.viabilityFieldId;
    const before = state.fields[fieldId];
    state.seaContribution = seaContribution;
    state.fields[fieldId] = viability;
    if (!before || !exactValuesEqual(before, viability)) {
        mutable.fieldCauses.set(fieldKey(worldId, fieldId), [...new Set(causes)].sort());
    }
    mutable.trace.push({
        id: `trace:${mutable.trace.length + 1}:sea:${worldId}`,
        kind: "sea-coupling",
        worldId,
        causes: [...new Set(causes)].sort(),
        effects: [{
            fieldId,
            layer: "world-field",
            operation: "derive",
            ...(before ? { before } : {}),
            operand: seaContribution,
            after: viability,
        }],
    });
    return undefined;
}

function applyEffect(
    program: ExecutableAnchoredCausalProgram,
    state: MutableState,
    effect: CausalFieldEffect,
): { before?: ExactValue; after?: ExactValue; layer?: CausalTraceEffect["layer"]; reason?: string } {
    const world = program.world.worlds.find((candidate) => candidate.id === state.worldId);
    const binding = state.bindings.get(effect.fieldId);
    const worldField = state.fields[effect.fieldId];
    if (!world || !binding || !worldField) return { reason: `field '${effect.fieldId}' is unavailable in '${state.worldId}'` };
    const intrinsicViability = effect.fieldId === world.seaCoupling.viabilityFieldId;
    const layer: CausalTraceEffect["layer"] = intrinsicViability ? "intrinsic-viability" : "world-field";
    const before = intrinsicViability ? state.intrinsicViability : worldField;
    const operand = normalizeExactValue(effect.value);
    if (!operand) return { reason: `effect on '${effect.fieldId}' has an invalid exact operand` };
    const base = effect.fieldId === world.seaCoupling.viabilityFieldId ? state.intrinsicViability : before;
    const after = effect.operation === "set"
        ? operand
        : effect.operation === "add"
            ? addExactRationals(base, operand)
            : subtractExactRationals(base, operand);
    if (!after) return { reason: `operation '${effect.operation}' is incompatible with '${effect.fieldId}'` };
    if (effect.operation === "set" && before.kind !== after.kind) {
        return { reason: `set operation cannot change the value kind of '${effect.fieldId}'` };
    }
    if (intrinsicViability) state.intrinsicViability = after;
    else state.fields[effect.fieldId] = after;
    return { before, after, layer };
}

function effectSetsConflict(
    entries: Array<{ worldId: string; effects: CausalFieldEffect[] }>,
): boolean {
    const byField = new Map<string, CausalFieldEffect[]>();
    for (const entry of entries) {
        for (const effect of entry.effects) {
            const key = fieldKey(entry.worldId, effect.fieldId);
            byField.set(key, [...byField.get(key) ?? [], effect]);
        }
    }
    return [...byField.values()].some((effects) => effects.length > 1 && effects.some((effect) => effect.operation === "set"));
}

function predicateCauses(predicate: CausalStatePredicate, mutable: MutableRealization): string[] {
    return [...new Set(predicate.fieldParameters.flatMap((binding) => (
        mutable.fieldCauses.get(fieldKey(binding.worldId, binding.fieldId)) ?? []
    )))].sort();
}

function recordCommit(
    mutable: MutableRealization,
    law: CausalInternalLaw,
    causedByEventId: string,
): string | undefined {
    if (!law.commitAffectedFieldIds?.length) return undefined;
    const state = mutable.states.get(law.worldId);
    if (!state) return `commit law '${law.id}' names missing world '${law.worldId}'`;
    const affectedFields = Object.fromEntries(law.commitAffectedFieldIds.map((fieldId) => [fieldId, state.fields[fieldId]]));
    if (Object.values(affectedFields).some((value) => value === undefined)) return `commit law '${law.id}' names an unavailable field`;
    const eventId = `commit:${causedByEventId}`;
    const commit: CausalHistoryCommit = {
        eventId,
        causedByEventId,
        worldId: law.worldId,
        affectedFields: affectedFields as Record<string, ExactValue>,
        stateDigest: digest(state.fields),
    };
    mutable.historyCommits.push(commit);
    mutable.events.push({ id: eventId, causes: [causedByEventId], reversibility: "irreversible" });
    mutable.evaluationOrder.push(eventId);
    mutable.trace.push({
        id: `trace:${mutable.trace.length + 1}:${eventId}`,
        kind: "history-commit",
        worldId: law.worldId,
        eventId,
        lawId: law.id,
        causes: [causedByEventId],
        effects: law.commitAffectedFieldIds.map((fieldId) => ({
            fieldId,
            layer: "world-field",
            operation: "derive",
            after: state.fields[fieldId]!,
        })),
    });
    return undefined;
}

function applyLawFrontier(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    laws: CausalInternalLaw[],
): string | undefined {
    const eventIds: string[] = [];
    const priorFieldCauses = new Map([...mutable.fieldCauses].map(([key, causes]) => [key, [...causes]]));
    const lawEvents = [...laws].sort((left, right) => left.id.localeCompare(right.id)).map((law) => ({
        law,
        eventId: `law:${law.id}`,
        causes: [...new Set([
            ...predicateCauses(law.guard, mutable),
            ...law.effects.filter((effect) => effect.operation !== "set").flatMap((effect) => (
                priorFieldCauses.get(fieldKey(law.worldId, effect.fieldId)) ?? []
            )),
        ])].sort(),
    }));
    const changedWorlds = new Map<string, string[]>();
    const changedFieldEvents = new Map<string, string[]>();
    for (const { law, eventId, causes } of lawEvents) {
        const state = mutable.states.get(law.worldId);
        if (!state) return `law '${law.id}' names missing world '${law.worldId}'`;
        const traceEffects: CausalTraceEffect[] = [];
        for (const effect of law.effects) {
            const applied = applyEffect(program, state, effect);
            if (applied.reason || !applied.after) return applied.reason ?? `law '${law.id}' failed`;
            traceEffects.push({
                fieldId: effect.fieldId,
                layer: applied.layer!,
                operation: effect.operation,
                ...(applied.before ? { before: applied.before } : {}),
                operand: effect.value,
                after: applied.after,
            });
            if (!applied.before || !exactValuesEqual(applied.before, applied.after)) {
                const key = fieldKey(law.worldId, effect.fieldId);
                changedFieldEvents.set(key, [...changedFieldEvents.get(key) ?? [], eventId]);
            }
        }
        mutable.appliedLawIds.add(law.id);
        mutable.events.push({ id: eventId, causes, reversibility: law.reversibility });
        mutable.evaluationOrder.push(eventId);
        mutable.trace.push({
            id: `trace:${mutable.trace.length + 1}:${eventId}`,
            kind: "internal-law",
            worldId: law.worldId,
            eventId,
            lawId: law.id,
            causes,
            effects: traceEffects,
        });
        eventIds.push(eventId);
        changedWorlds.set(law.worldId, [...changedWorlds.get(law.worldId) ?? [], eventId]);
    }
    for (const [key, causes] of changedFieldEvents) {
        mutable.fieldCauses.set(key, [...new Set(causes)].sort());
    }
    mutable.evaluationFrontiers.push([...eventIds]);
    for (const [worldId, causes] of changedWorlds) {
        const seaError = recomputeSea(program, mutable, worldId, causes);
        if (seaError) return seaError;
    }
    for (const { law, eventId } of lawEvents) {
        const commitError = recordCommit(mutable, law, eventId);
        if (commitError) return commitError;
    }
    return undefined;
}

function closeInternalLaws(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    options: Required<CausalExecutionOptions>,
    subjectPrefix: string,
): ClosureResult {
    const formalEvidence: CausalFormalEvidence[] = [];
    let formalSteps = 0;
    let frontierCount = 0;
    while (true) {
        if (frontierCount >= options.maxInternalFrontiers) {
            return {
                status: "undetermined",
                reason: "internal causal-closure frontier budget exhausted",
                unresolvedLawIds: program.world.internalLaws.filter((law) => !mutable.appliedLawIds.has(law.id)
                    && !options.counterfactualInternalEventAblationLawIds.includes(law.id)).map((law) => law.id).sort(),
                formalEvidence,
                formalSteps,
                frontierCount,
            };
        }
        const enabled: CausalInternalLaw[] = [];
        const unresolved: string[] = [];
        for (const law of [...program.world.internalLaws].sort((left, right) => left.id.localeCompare(right.id))) {
            if (mutable.appliedLawIds.has(law.id)) continue;
            const evaluated = evaluatePredicate(
                program,
                law.guard,
                "law-guard",
                mutable.states,
                options.evaluationBudgetPerQuery,
                `${subjectPrefix}frontier:${frontierCount}:${law.id}:`,
            );
            formalEvidence.push(evaluated.evidence);
            formalSteps += evaluated.steps;
            if (evaluated.evidence.status === "undetermined") {
                unresolved.push(law.id);
            } else if (evaluated.evidence.status === "contradicted" || evaluated.evidence.value?.kind !== "boolean") {
                return {
                    status: "contradicted",
                    reason: `guard for internal law '${law.id}' did not produce a boolean`,
                    unresolvedLawIds: [law.id],
                    formalEvidence,
                    formalSteps,
                    frontierCount,
                };
            } else if (evaluated.evidence.value.value) {
                if (options.counterfactualInternalEventAblationLawIds.includes(law.id)) {
                    mutable.appliedLawIds.add(law.id);
                    mutable.internalEventAblations.push({
                        id: `ablation:law:${law.id}`,
                        kind: "internal-event-nonrealization",
                        lawId: law.id,
                        worldId: law.worldId,
                        wouldHaveEventId: `law:${law.id}`,
                        guardEvidenceSubjectId: evaluated.evidence.subjectId,
                        frontierIndex: frontierCount,
                        causes: predicateCauses(law.guard, mutable),
                        lawRetainedInProgram: true,
                        effectsSuppressed: true,
                    });
                } else {
                    enabled.push(law);
                }
            }
        }
        if (unresolved.length > 0) {
            return {
                status: "undetermined",
                reason: "one or more internal-law guards are unresolved",
                unresolvedLawIds: unresolved.sort(),
                formalEvidence,
                formalSteps,
                frontierCount,
            };
        }
        if (enabled.length === 0) {
            return { status: "closed", unresolvedLawIds: [], formalEvidence, formalSteps, frontierCount };
        }
        if (effectSetsConflict(enabled.map((law) => ({ worldId: law.worldId, effects: law.effects })))) {
            return {
                status: "undetermined",
                reason: "simultaneously enabled internal laws have non-commuting set effects",
                unresolvedLawIds: enabled.map((law) => law.id).sort(),
                formalEvidence,
                formalSteps,
                frontierCount,
            };
        }
        const error = applyLawFrontier(program, mutable, enabled);
        if (error) {
            return { status: "contradicted", reason: error, unresolvedLawIds: enabled.map((law) => law.id), formalEvidence, formalSteps, frontierCount };
        }
        frontierCount += 1;
    }
}

function absoluteExact(value: ExactValue): ExactValue | undefined {
    const comparison = compareExactRationals(value, exact.integer(0));
    if (comparison === undefined) return undefined;
    return comparison < 0 ? negateExactRational(value) : normalizeExactValue(value);
}

function scoreObjectives(
    program: ExecutableAnchoredCausalProgram,
    states: Map<string, MutableState>,
): ObjectiveScore | undefined {
    let score = exact.integer(0);
    const contributions: CausalObjectiveContribution[] = [];
    for (const objective of program.world.worldWill.objectives) {
        const value = states.get(objective.targetWorldId)?.fields[objective.fieldId];
        const centered = objective.direction === "stabilize" && value && objective.targetValue
            ? subtractExactRationals(value, objective.targetValue)
            : value;
        const weighted = centered ? multiplyExactRationals(centered, objective.weight) : undefined;
        if (!weighted) return undefined;
        const contribution = objective.direction === "maximize"
            ? weighted
            : objective.direction === "minimize"
                ? negateExactRational(weighted)
                : absoluteExact(weighted) ? negateExactRational(absoluteExact(weighted)!) : undefined;
        if (!contribution) return undefined;
        const next = addExactRationals(score, contribution);
        if (!next) return undefined;
        score = next;
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

function applyInterventions(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    interventions: CausalWorldWillIntervention[],
): string | undefined {
    const changedWorlds = new Map<string, string[]>();
    const frontier: string[] = [];
    const priorFieldCauses = new Map([...mutable.fieldCauses].map(([key, causes]) => [key, [...causes]]));
    const interventionEvents = [...interventions].sort((left, right) => left.id.localeCompare(right.id)).map((intervention) => ({
        intervention,
        eventId: `will:${intervention.id}`,
        causes: [...new Set([
            ...program.world.worldWill.objectives
                .filter((objective) => objective.targetWorldId === intervention.targetWorldId)
                .flatMap((objective) => priorFieldCauses.get(fieldKey(objective.targetWorldId, objective.fieldId)) ?? []),
            ...intervention.effects.filter((effect) => effect.operation !== "set").flatMap((effect) => (
                priorFieldCauses.get(fieldKey(intervention.targetWorldId, effect.fieldId)) ?? []
            )),
        ])].sort(),
    }));
    const changedFieldEvents = new Map<string, string[]>();
    for (const { intervention, eventId, causes } of interventionEvents) {
        const state = mutable.states.get(intervention.targetWorldId);
        if (!state) return `intervention '${intervention.id}' names missing world '${intervention.targetWorldId}'`;
        const traceEffects: CausalTraceEffect[] = [];
        for (const effect of intervention.effects) {
            const applied = applyEffect(program, state, effect);
            if (applied.reason || !applied.after) return applied.reason ?? `intervention '${intervention.id}' failed`;
            traceEffects.push({
                fieldId: effect.fieldId,
                layer: applied.layer!,
                operation: effect.operation,
                ...(applied.before ? { before: applied.before } : {}),
                operand: effect.value,
                after: applied.after,
            });
            if (!applied.before || !exactValuesEqual(applied.before, applied.after)) {
                const key = fieldKey(intervention.targetWorldId, effect.fieldId);
                changedFieldEvents.set(key, [...changedFieldEvents.get(key) ?? [], eventId]);
            }
        }
        mutable.events.push({ id: eventId, causes, reversibility: "irreversible" });
        mutable.evaluationOrder.push(eventId);
        mutable.trace.push({
            id: `trace:${mutable.trace.length + 1}:${eventId}`,
            kind: "world-will-intervention",
            worldId: intervention.targetWorldId,
            eventId,
            interventionId: intervention.id,
            anchorId: intervention.anchorId,
            causes,
            effects: traceEffects,
        });
        changedWorlds.set(intervention.targetWorldId, [...changedWorlds.get(intervention.targetWorldId) ?? [], eventId]);
        frontier.push(eventId);
    }
    for (const [key, causes] of changedFieldEvents) {
        mutable.fieldCauses.set(key, [...new Set(causes)].sort());
    }
    mutable.evaluationFrontiers.push(frontier);
    for (const [worldId, causes] of changedWorlds) {
        const error = recomputeSea(program, mutable, worldId, causes);
        if (error) return error;
    }
    return undefined;
}

function combinationCardinality(valueCount: number): bigint {
    return (1n << BigInt(valueCount)) - 1n;
}

function* boundedCombinations<T>(values: T[], limit: number): Generator<T[]> {
    const total = combinationCardinality(values.length);
    const boundedLimit = total < BigInt(limit) ? total : BigInt(limit);
    for (let mask = 1n; mask <= boundedLimit; mask += 1n) {
        yield values.filter((_, index) => (mask & (1n << BigInt(index))) !== 0n);
    }
}

function booleanEvidenceValue(evidence: CausalFormalEvidence): boolean | undefined {
    return evidence.status === "resolved" && evidence.value?.kind === "boolean"
        ? evidence.value.value
        : undefined;
}

function assessEmergence(
    program: ExecutableAnchoredCausalProgram,
    initialStates: CausalWorldState[],
    mutable: MutableRealization,
    options: Required<CausalExecutionOptions>,
    subjectPrefix: string,
): EmergenceResult {
    const initial = statesFromSerialized(program, initialStates);
    const assessments: CausalEmergenceAssessment[] = [];
    const evidence: CausalFormalEvidence[] = [];
    let formalSteps = 0;
    for (const criterion of [...program.world.emergenceCriteria].sort((left, right) => left.id.localeCompare(right.id))) {
        const initialResult = evaluatePredicate(
            program,
            criterion.predicate,
            "emergence-criterion",
            initial,
            options.evaluationBudgetPerQuery,
            `${subjectPrefix}initial:${criterion.id}:`,
        );
        const finalResult = evaluatePredicate(
            program,
            criterion.predicate,
            "emergence-criterion",
            mutable.states,
            options.evaluationBudgetPerQuery,
            `${subjectPrefix}final:${criterion.id}:`,
        );
        evidence.push(initialResult.evidence, finalResult.evidence);
        formalSteps += initialResult.steps + finalResult.steps;
        const before = booleanEvidenceValue(initialResult.evidence);
        const after = booleanEvidenceValue(finalResult.evidence);
        const status: CausalEmergenceAssessment["status"] = initialResult.evidence.status === "contradicted"
            || finalResult.evidence.status === "contradicted"
            ? "contradicted"
            : before === undefined || after === undefined
                ? "undetermined"
                : before && after
                    ? "persistent"
                    : !before && after
                        ? "emerged"
                        : before && !after
                            ? "dissolved"
                            : "absent";
        const state = mutable.states.get(criterion.worldId);
        const witnessFields = Object.fromEntries(criterion.witnessFieldIds
            .map((fieldId) => [fieldId, state?.fields[fieldId]] as const)
            .filter((entry): entry is readonly [string, ExactValue] => entry[1] !== undefined));
        const relevantFields = new Set([
            ...criterion.witnessFieldIds,
            ...criterion.predicate.fieldParameters
                .filter((binding) => binding.worldId === criterion.worldId)
                .map((binding) => binding.fieldId),
        ]);
        const causedByEventIds = [...new Set(mutable.trace
            .filter((entry) => entry.worldId === criterion.worldId && entry.eventId && entry.kind !== "history-commit"
                && entry.effects.some((effect) => relevantFields.has(effect.fieldId)
                    && (!effect.before || !exactValuesEqual(effect.before, effect.after))))
            .map((entry) => entry.eventId!))].sort();
        assessments.push({
            criterionId: criterion.id,
            worldId: criterion.worldId,
            status,
            witnessFields,
            causedByEventIds,
            initialEvidence: initialResult.evidence,
            finalEvidence: finalResult.evidence,
        });
    }
    return { assessments, evidence, formalSteps };
}

function continuationFromRealization(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    initialStates: CausalWorldState[],
    id: string,
    selection: CausalContinuation["selection"],
    interventionIds: string[],
    score: ExactValue,
    options: Required<CausalExecutionOptions>,
): { continuation: CausalContinuation; emergence: EmergenceResult } {
    const emergence = assessEmergence(program, initialStates, mutable, options, `${id}:`);
    const causalEdges = [...new Map(mutable.events.flatMap((event) => event.causes.map((cause) => [
        `${cause}->${event.id}`,
        { cause, effect: event.id },
    ]))).values()].sort((left, right) => left.cause.localeCompare(right.cause) || left.effect.localeCompare(right.effect));
    const reversibleEventIds = mutable.events.filter((event) => event.reversibility === "reversible").map((event) => event.id).sort();
    const irreversibleEventIds = mutable.events.filter((event) => event.reversibility === "irreversible").map((event) => event.id).sort();
    return {
        continuation: {
            id,
            selection,
            interventionIds: [...interventionIds].sort(),
            score,
            worldStates: serializeStates(mutable.states),
            realizedEventIds: mutable.events.map((event) => event.id),
            trace: cloneValue(mutable.trace),
            historyCommits: cloneValue(mutable.historyCommits),
            ...(mutable.internalEventAblations.length > 0
                ? { internalEventAblations: cloneValue(mutable.internalEventAblations) }
                : {}),
            emergenceAssessments: emergence.assessments,
            order: {
                kind: "causal-partial-order",
                universalClock: false,
                causalEdges,
                evaluationOrder: [...mutable.evaluationOrder],
                evaluationFrontiers: cloneValue(mutable.evaluationFrontiers),
                reversibleEventIds,
                irreversibleEventIds,
                createsHistoryArrow: mutable.historyCommits.length > 0,
            },
        },
        emergence,
    };
}

function totalCost(program: ExecutableAnchoredCausalProgram, interventionIds: string[]): ExactValue | undefined {
    let total = exact.integer(0);
    for (const interventionId of interventionIds) {
        const cost = program.execution.interventionCosts.find((entry) => entry.interventionId === interventionId)?.cost;
        const next = cost ? addExactRationals(total, cost) : undefined;
        if (!next) return undefined;
        total = next;
    }
    return total;
}

function initializeRealization(
    program: ExecutableAnchoredCausalProgram,
    options: Required<CausalExecutionOptions>,
): {
    mutable?: MutableRealization;
    evidence: CausalFormalEvidence[];
    formalSteps: number;
    status?: "underdetermined" | "contradicted";
    reason?: string;
} {
    const states = new Map<string, MutableState>();
    for (const world of program.world.worlds) {
        states.set(world.id, {
            worldId: world.id,
            fields: {},
            intrinsicViability: exact.integer(0),
            seaContribution: exact.integer(0),
            bindings: new Map(world.fields.map((field) => [field.id, field])),
        });
    }
    const mutable: MutableRealization = {
        states,
        appliedLawIds: new Set(),
        trace: [],
        historyCommits: [],
        internalEventAblations: [],
        events: [],
        evaluationOrder: [],
        evaluationFrontiers: [],
        fieldCauses: new Map(),
    };
    const evidence: CausalFormalEvidence[] = [];
    let formalSteps = 0;
    for (const initializer of [...program.fieldInitializers]
        .sort((left, right) => fieldKey(left.worldId, left.fieldId).localeCompare(fieldKey(right.worldId, right.fieldId)))) {
        const key = fieldKey(initializer.worldId, initializer.fieldId);
        const evaluated = evaluateQuery(program, key, "initial-field", initializer.query, options.evaluationBudgetPerQuery);
        evidence.push(evaluated.evidence);
        formalSteps += evaluated.steps;
        if (evaluated.evidence.status !== "resolved" || !evaluated.evidence.value) {
            return {
                evidence,
                formalSteps,
                status: evaluated.evidence.status === "contradicted" ? "contradicted" : "underdetermined",
                reason: `initial field '${key}' could not be resolved`,
            };
        }
        const override = options.fieldOverrides[key];
        const value = override ? normalizeExactValue(override) : normalizeExactValue(evaluated.evidence.value);
        const state = states.get(initializer.worldId);
        const expectedKind = predicateFieldKind(program, initializer.worldId, initializer.fieldId);
        if (!state || !value || value.kind !== expectedKind) {
            return { evidence, formalSteps, status: "contradicted", reason: `initial field '${key}' has an invalid exact value` };
        }
        state.fields[initializer.fieldId] = value;
        mutable.trace.push({
            id: `trace:${mutable.trace.length + 1}:initial:${key}`,
            kind: "initial-field",
            worldId: initializer.worldId,
            causes: [],
            effects: [{ fieldId: initializer.fieldId, layer: "world-field", operation: "derive", after: value }],
        });
    }
    for (const world of program.world.worlds) {
        const state = states.get(world.id)!;
        state.intrinsicViability = state.fields[world.seaCoupling.viabilityFieldId]!;
        const error = recomputeSea(program, mutable, world.id, []);
        if (error) return { evidence, formalSteps, status: "contradicted", reason: error };
    }
    return { mutable, evidence, formalSteps };
}

function evaluateConstraintSet(
    program: ExecutableAnchoredCausalProgram,
    predicates: CausalStatePredicate[],
    purpose: "hard-constraint" | "anchor-identity",
    states: Map<string, MutableState>,
    options: Required<CausalExecutionOptions>,
    prefix: string,
): { admissible?: boolean; evidence: CausalFormalEvidence[]; formalSteps: number; reasons: string[] } {
    const evidence: CausalFormalEvidence[] = [];
    const reasons: string[] = [];
    let formalSteps = 0;
    let admissible: boolean | undefined = true;
    for (const predicate of predicates) {
        const evaluated = evaluatePredicate(program, predicate, purpose, states, options.evaluationBudgetPerQuery, prefix);
        evidence.push(evaluated.evidence);
        formalSteps += evaluated.steps;
        const value = booleanEvidenceValue(evaluated.evidence);
        if (value === undefined) {
            admissible = undefined;
            reasons.push(`predicate '${predicate.id}' is ${evaluated.evidence.status}`);
        } else if (!value && admissible !== undefined) {
            admissible = false;
            reasons.push(`predicate '${predicate.id}' is false`);
        }
    }
    return { admissible, evidence, formalSteps, reasons };
}

export function realizeAnchoredCausalWorld(
    program: ExecutableAnchoredCausalProgram,
    requestedOptions: CausalExecutionOptions = {},
): AnchoredCausalRun {
    const options = normalizedOptions(requestedOptions);
    const runOptions = recordedOptions(options);
    const diagnostics = validateExecutableCausalProgram(program);
    const formalEvidence: CausalFormalEvidence[] = [];
    let formalSteps = 0;
    let internalFrontierCount = 0;
    let interventionCombinationCount = 0;
    let exhaustiveInterventionSearch = true;
    const emptyRun = (
        status: AnchoredCausalRun["status"],
        reason: string,
        extra: Partial<AnchoredCausalRun> = {},
    ): AnchoredCausalRun => ({
        mode: "bubble-anchored-causal-run.v2",
        programDigest: digest(program),
        status,
        reason,
        options: runOptions,
        diagnostics,
        formalEvidence,
        initialWorldStates: [],
        interventionEligibility: [],
        candidateAssessments: [],
        continuations: [],
        selectedContinuationIds: [],
        unresolvedAlternativeIds: [],
        resourceUse: {
            formalQueryCount: formalEvidence.length,
            formalEvaluationSteps: formalSteps,
            internalFrontierCount,
            interventionCombinationCount,
            combinationLimit: options.maxInterventionCombinations,
            exhaustiveInterventionSearch,
        },
        ...extra,
    });
    if (diagnostics.length > 0) return emptyRun("contradicted", "causal program validation failed");
    const knownAnchorIds = new Set(program.world.anchors.map((anchor) => anchor.id));
    const unknownCutAnchorIds = options.cutAnchorIds.filter((anchorId) => !knownAnchorIds.has(anchorId));
    if (unknownCutAnchorIds.length > 0) {
        return emptyRun("contradicted", `unknown cut anchor id(s): ${unknownCutAnchorIds.join(", ")}`);
    }
    const knownFieldKeys = new Set(program.world.worlds.flatMap((world) => (
        world.fields.map((field) => fieldKey(world.id, field.id))
    )));
    const unknownOverrideKeys = Object.keys(options.fieldOverrides).filter((key) => !knownFieldKeys.has(key));
    if (unknownOverrideKeys.length > 0) {
        return emptyRun("contradicted", `unknown field override key(s): ${unknownOverrideKeys.join(", ")}`);
    }
    const knownInternalLawIds = new Set(program.world.internalLaws.map((law) => law.id));
    const unknownAblationLawIds = options.counterfactualInternalEventAblationLawIds
        .filter((lawId) => !knownInternalLawIds.has(lawId));
    if (unknownAblationLawIds.length > 0) {
        return emptyRun("contradicted", `unknown counterfactual internal-event ablation law id(s): ${unknownAblationLawIds.join(", ")}`);
    }
    if (!Number.isSafeInteger(options.evaluationBudgetPerQuery)
        || !Number.isSafeInteger(options.maxInterventionCombinations)
        || !Number.isSafeInteger(options.maxInternalFrontiers)
        || options.evaluationBudgetPerQuery < 1
        || options.maxInterventionCombinations < 0
        || options.maxInternalFrontiers < 1) {
        return emptyRun("contradicted", "execution budgets must be positive, except that the combination limit may be zero");
    }
    const initialized = initializeRealization(program, options);
    formalEvidence.push(...initialized.evidence);
    formalSteps += initialized.formalSteps;
    if (!initialized.mutable || initialized.status) {
        return emptyRun(initialized.status ?? "contradicted", initialized.reason ?? "world initialization failed");
    }
    const initialWorldStates = serializeStates(initialized.mutable.states);
    const autonomous = initialized.mutable;
    const closure = closeInternalLaws(program, autonomous, options, "autonomous:");
    formalEvidence.push(...closure.formalEvidence);
    formalSteps += closure.formalSteps;
    internalFrontierCount += closure.frontierCount;
    const autonomousScore = scoreObjectives(program, autonomous.states);
    if (!autonomousScore) {
        return emptyRun("contradicted", "World Will objectives could not be scored exactly", { initialWorldStates });
    }
    const autonomousBuilt = continuationFromRealization(
        program,
        autonomous,
        initialWorldStates,
        "continuation:autonomous",
        "baseline",
        [],
        autonomousScore.score,
        options,
    );
    formalEvidence.push(...autonomousBuilt.emergence.evidence);
    formalSteps += autonomousBuilt.emergence.formalSteps;
    if (closure.status !== "closed") {
        return emptyRun(closure.status === "contradicted" ? "contradicted" : "underdetermined", closure.reason ?? "internal causal closure failed", {
            initialWorldStates,
            autonomousContinuation: autonomousBuilt.continuation,
            baselineScore: autonomousScore.score,
            continuations: [autonomousBuilt.continuation],
            selectedContinuationIds: [],
            unresolvedAlternativeIds: closure.unresolvedLawIds.map((id) => `law:${id}`),
        });
    }

    const identityByAnchor = new Map<string, ReturnType<typeof evaluateConstraintSet>>();
    for (const anchor of program.world.anchors) {
        const predicates = program.execution.anchorIdentity.filter((predicate) => predicate.anchorId === anchor.id);
        const result = evaluateConstraintSet(program, predicates, "anchor-identity", autonomous.states, options, `anchor:${anchor.id}:`);
        identityByAnchor.set(anchor.id, result);
        formalEvidence.push(...result.evidence);
        formalSteps += result.formalSteps;
    }
    const eligibility: CausalInterventionEligibility[] = program.world.worldWill.interventions
        .map((intervention) => {
            const reasons: string[] = [];
            if (!options.worldWillEnabled) reasons.push("World Will execution is disabled");
            if (options.cutAnchorIds.includes(intervention.anchorId)) reasons.push(`anchor '${intervention.anchorId}' is cut`);
            const identity = identityByAnchor.get(intervention.anchorId);
            if (identity?.admissible !== true) reasons.push(...(identity?.reasons ?? ["anchor identity is unavailable"]));
            return {
                interventionId: intervention.id,
                anchorId: intervention.anchorId,
                status: reasons.length === 0 ? "eligible" as const : "blocked" as const,
                reasons,
            };
        })
        .sort((left, right) => left.interventionId.localeCompare(right.interventionId));
    const eligibleInterventions = program.world.worldWill.interventions
        .filter((intervention) => eligibility.some((entry) => entry.interventionId === intervention.id && entry.status === "eligible"))
        .sort((left, right) => left.id.localeCompare(right.id));
    const totalCombinations = combinationCardinality(eligibleInterventions.length);
    exhaustiveInterventionSearch = totalCombinations <= BigInt(options.maxInterventionCombinations);
    const combinationsToEvaluate = boundedCombinations(eligibleInterventions, options.maxInterventionCombinations);
    const candidateAssessments: CausalCandidateAssessment[] = [];
    const candidateRealizations = new Map<string, { mutable: MutableRealization; objective: ObjectiveScore }>();
    const unresolvedAlternativeIds: string[] = [];
    for (const combination of combinationsToEvaluate) {
        interventionCombinationCount += 1;
        const interventionIds = combination.map((entry) => entry.id).sort();
        const id = `candidate:${interventionIds.join("+")}`;
        if (effectSetsConflict(combination.map((entry) => ({ worldId: entry.targetWorldId, effects: entry.effects })))) {
            candidateAssessments.push({ id, interventionIds, status: "undetermined", reasons: ["simultaneous interventions have non-commuting set effects"] });
            unresolvedAlternativeIds.push(id);
            continue;
        }
        const mutable = cloneRealization(autonomous);
        const interventionError = applyInterventions(program, mutable, combination);
        if (interventionError) {
            candidateAssessments.push({ id, interventionIds, status: "inadmissible", reasons: [interventionError] });
            continue;
        }
        const candidateClosure = closeInternalLaws(program, mutable, options, `${id}:`);
        formalEvidence.push(...candidateClosure.formalEvidence);
        formalSteps += candidateClosure.formalSteps;
        internalFrontierCount += candidateClosure.frontierCount;
        if (candidateClosure.status !== "closed") {
            candidateAssessments.push({
                id,
                interventionIds,
                status: candidateClosure.status === "undetermined" ? "undetermined" : "inadmissible",
                reasons: [candidateClosure.reason ?? "candidate internal closure failed"],
            });
            if (candidateClosure.status === "undetermined") unresolvedAlternativeIds.push(id);
            continue;
        }
        let postAnchorStatus: "admissible" | "inadmissible" | "undetermined" = "admissible";
        const postAnchorReasons: string[] = [];
        for (const anchor of program.world.anchors) {
            const predicates = program.execution.anchorIdentity.filter((predicate) => predicate.anchorId === anchor.id);
            const postIdentity = evaluateConstraintSet(
                program,
                predicates,
                "anchor-identity",
                mutable.states,
                options,
                `${id}:post-anchor:${anchor.id}:`,
            );
            formalEvidence.push(...postIdentity.evidence);
            formalSteps += postIdentity.formalSteps;
            if (postIdentity.admissible === undefined) postAnchorStatus = "undetermined";
            else if (!postIdentity.admissible && postAnchorStatus !== "undetermined") postAnchorStatus = "inadmissible";
            postAnchorReasons.push(...postIdentity.reasons.map((reason) => `post-state anchor '${anchor.id}': ${reason}`));
        }
        if (postAnchorStatus !== "admissible") {
            const status = postAnchorStatus === "undetermined" ? "undetermined" as const : "inadmissible" as const;
            candidateAssessments.push({ id, interventionIds, status, reasons: postAnchorReasons });
            if (status === "undetermined") unresolvedAlternativeIds.push(id);
            continue;
        }
        const constraints = evaluateConstraintSet(program, program.execution.hardConstraints, "hard-constraint", mutable.states, options, `${id}:`);
        formalEvidence.push(...constraints.evidence);
        formalSteps += constraints.formalSteps;
        if (constraints.admissible !== true) {
            const status = constraints.admissible === undefined ? "undetermined" as const : "inadmissible" as const;
            candidateAssessments.push({ id, interventionIds, status, reasons: constraints.reasons });
            if (status === "undetermined") unresolvedAlternativeIds.push(id);
            continue;
        }
        const objective = scoreObjectives(program, mutable.states);
        const cost = totalCost(program, interventionIds);
        const objectiveGain = objective ? subtractExactRationals(objective.score, autonomousScore.score) : undefined;
        const improvement = objectiveGain && cost ? subtractExactRationals(objectiveGain, cost) : undefined;
        if (!objective || !cost || !improvement) {
            candidateAssessments.push({ id, interventionIds, status: "undetermined", reasons: ["candidate score or intervention cost is not an exact rational"] });
            unresolvedAlternativeIds.push(id);
            continue;
        }
        const improved = compareExactRationals(improvement, exact.integer(0)) === 1;
        candidateAssessments.push({
            id,
            interventionIds,
            status: improved ? "improved" : "rejected",
            score: objective.score,
            cost,
            improvement,
            objectiveContributions: objective.contributions,
            reasons: improved ? [] : ["net exact objective improvement is not positive"],
        });
        candidateRealizations.set(id, { mutable, objective });
    }
    if (!exhaustiveInterventionSearch) unresolvedAlternativeIds.push("intervention-search:not-exhaustive");

    const baseExtra: Partial<AnchoredCausalRun> = {
        initialWorldStates,
        autonomousContinuation: autonomousBuilt.continuation,
        interventionEligibility: eligibility,
        baselineScore: autonomousScore.score,
        candidateAssessments,
    };
    if (unresolvedAlternativeIds.length > 0) {
        return emptyRun("underdetermined", "one or more intervention alternatives remain unresolved", {
            ...baseExtra,
            continuations: [autonomousBuilt.continuation],
            unresolvedAlternativeIds: [...new Set(unresolvedAlternativeIds)].sort(),
        });
    }
    const improved = candidateAssessments.filter((candidate) => candidate.status === "improved" && candidate.improvement);
    if (improved.length === 0) {
        const noEligible = program.world.worldWill.interventions.length > 0 && eligibleInterventions.length === 0 && options.worldWillEnabled;
        return emptyRun(noEligible ? "blocked" : "stable", noEligible ? "all World Will interventions are blocked" : "autonomous closure is not improved by any admissible intervention", {
            ...baseExtra,
            continuations: [autonomousBuilt.continuation],
            selectedContinuationIds: [autonomousBuilt.continuation.id],
        });
    }
    let best = improved[0]!;
    for (const candidate of improved.slice(1)) {
        if (compareExactRationals(candidate.improvement!, best.improvement!) === 1) best = candidate;
    }
    const tied = improved.filter((candidate) => compareExactRationals(candidate.improvement!, best.improvement!) === 0);
    if (tied.length > 1 && program.execution.decisionMode === "deterministic") {
        return emptyRun("underdetermined", "equally optimal continuations have no intrinsic deterministic selector", {
            ...baseExtra,
            continuations: [autonomousBuilt.continuation],
            unresolvedAlternativeIds: tied.map((candidate) => candidate.id),
        });
    }
    const selectedCandidates = program.execution.decisionMode === "plural" ? tied : [best];
    const selectedContinuations: CausalContinuation[] = [];
    for (const candidate of selectedCandidates) {
        const realization = candidateRealizations.get(candidate.id)!;
        const built = continuationFromRealization(
            program,
            realization.mutable,
            initialWorldStates,
            `continuation:${candidate.interventionIds.join("+")}`,
            selectedCandidates.length > 1 ? "selected-plural" : "selected",
            candidate.interventionIds,
            realization.objective.score,
            options,
        );
        selectedContinuations.push(built.continuation);
        formalEvidence.push(...built.emergence.evidence);
        formalSteps += built.emergence.formalSteps;
    }
    return emptyRun(selectedContinuations.length > 1 ? "plural" : "realized", "World Will selected exact admissible continuation(s)", {
        ...baseExtra,
        continuations: [autonomousBuilt.continuation, ...selectedContinuations],
        selectedContinuationIds: selectedContinuations.map((continuation) => continuation.id),
    });
}

export function inspectAnchoredCausalRun(run: AnchoredCausalRun): AnchoredCausalInspection {
    const selected = new Set(run.selectedContinuationIds);
    const selectedContinuations = run.continuations.filter((continuation) => selected.has(continuation.id));
    const relevantContinuations = selectedContinuations.length > 0 ? selectedContinuations : run.continuations;
    return {
        mode: "bubble-anchored-causal-inspection.v2",
        summary: {
            status: run.status,
            worldCount: run.initialWorldStates.length,
            continuationCount: run.continuations.length,
            selectedContinuationCount: run.selectedContinuationIds.length,
            unresolvedAlternativeCount: run.unresolvedAlternativeIds.length,
            emergedStructureCount: relevantContinuations.flatMap((continuation) => continuation.emergenceAssessments)
                .filter((assessment) => assessment.status === "emerged").length,
            dissolvedStructureCount: relevantContinuations.flatMap((continuation) => continuation.emergenceAssessments)
                .filter((assessment) => assessment.status === "dissolved").length,
            createsHistoryArrow: relevantContinuations.some((continuation) => continuation.order.createsHistoryArrow),
            exhaustiveInterventionSearch: run.resourceUse.exhaustiveInterventionSearch,
        },
        decision: {
            ...(run.baselineScore ? { baselineScore: run.baselineScore } : {}),
            interventionEligibility: cloneValue(run.interventionEligibility),
            candidates: cloneValue(run.candidateAssessments),
        },
        continuations: cloneValue(run.continuations),
        formalEvidence: cloneValue(run.formalEvidence),
    };
}

export function recordAnchoredCausalReplay(
    program: ExecutableAnchoredCausalProgram,
    options: CausalExecutionOptions = {},
): AnchoredCausalReplayRecord {
    const recordedRun = realizeAnchoredCausalWorld(program, options);
    return {
        mode: "bubble-anchored-causal-replay.v2",
        program: cloneValue(program),
        options: cloneValue(options),
        recordedRun,
        recordedDigest: digest(recordedRun),
    };
}

export function replayAnchoredCausalRecord(record: AnchoredCausalReplayRecord): AnchoredCausalReplayResult {
    const replayedRun = realizeAnchoredCausalWorld(record.program, record.options);
    const recordedRunDigest = digest(record.recordedRun);
    const replayedDigest = digest(replayedRun);
    const recordIntegrityValid = recordedRunDigest === record.recordedDigest;
    const recordedProgramDigestValid = record.recordedRun.programDigest === digest(record.program);
    const fullRunPreserved = stableStringify(record.recordedRun) === stableStringify(replayedRun);
    const recordedEmergence = record.recordedRun.continuations.map((continuation) => ({
        id: continuation.id,
        emergence: continuation.emergenceAssessments,
    }));
    const replayedEmergence = replayedRun.continuations.map((continuation) => ({
        id: continuation.id,
        emergence: continuation.emergenceAssessments,
    }));
    return {
        mode: "bubble-anchored-causal-replay-result.v2",
        status: recordIntegrityValid && recordedProgramDigestValid && replayedDigest === record.recordedDigest && fullRunPreserved
            ? "same-world-reexecution"
            : "reexecution-drift",
        recordedDigest: record.recordedDigest,
        recordedRunDigest,
        replayedDigest,
        recordIntegrityValid,
        recordedProgramDigestValid,
        fullRunPreserved,
        selectedContinuationsPreserved: stableStringify(record.recordedRun.selectedContinuationIds) === stableStringify(replayedRun.selectedContinuationIds),
        unresolvedAlternativesPreserved: stableStringify(record.recordedRun.unresolvedAlternativeIds) === stableStringify(replayedRun.unresolvedAlternativeIds),
        emergencePreserved: stableStringify(recordedEmergence) === stableStringify(replayedEmergence),
        replayedRun,
    };
}
