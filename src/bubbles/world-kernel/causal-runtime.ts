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
    type CausalAnchorTransferDefinition,
    type CausalDiagnostic,
    type CausalEmergenceCriterion,
    type CausalFieldBinding,
    type CausalFieldEffect,
    type CausalInternalLaw,
    type CausalStatePredicate,
    type CausalWorldDefinition,
    type CausalWorldLifecycleEffect,
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
        internalConflictMode?: "underdetermined" | "maximal-commuting-branches";
        hardConstraints: CausalStatePredicate[];
        anchorIdentity: CausalAnchorIdentityQuery[];
        interventionCosts: CausalInterventionCost[];
    };
}

export interface CausalExecutionOptions {
    worldWillEnabled?: boolean;
    cutAnchorIds?: string[];
    fieldOverrides?: Record<string, ExactValue>;
    worldLifecycleOverrides?: Record<string, CausalWorldLifecycleState>;
    counterfactualInternalEventAblationLawIds?: string[];
    evaluationBudgetPerQuery?: number;
    maxInterventionCombinations?: number;
    maxInternalFrontiers?: number;
    maxInternalBranches?: number;
}

export type ResolvedCausalExecutionOptions = Omit<
    Required<CausalExecutionOptions>,
    "counterfactualInternalEventAblationLawIds" | "worldLifecycleOverrides"
> & Pick<CausalExecutionOptions, "counterfactualInternalEventAblationLawIds" | "worldLifecycleOverrides">;

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
    lifecycle?: CausalWorldLifecycleState;
}

export interface CausalWorldLifecycleState {
    phase: "latent" | "active" | "retired";
    lineageId?: string;
    parentWorldIds?: string[];
    spawnedByEventId?: string;
    retiredByEventId?: string;
}

export interface CausalWorldRetirementResidue {
    finalStateDigest: string;
    localNegativeSea: ExactValue;
    retainedHistoryCommitIds: string[];
}

export interface CausalWorldLifecycleEvent {
    id: string;
    kind: "world-spawn" | "world-retirement";
    sourceWorldIds: string[];
    targetWorldId: string;
    causedByLawEventIds: string[];
    beforePhase: "latent" | "active";
    afterPhase: "active" | "retired";
    hostSelection: false;
    lineageId?: string;
    residue?: CausalWorldRetirementResidue;
}

export interface CausalAnchorTransferEvent {
    id: string;
    transferId: string;
    lawId: string;
    lawEventId: string;
    anchorId: string;
    source: CausalAnchorTransferDefinition["source"] & { value: ExactValue };
    target: CausalAnchorTransferDefinition["target"] & { before: ExactValue; after: ExactValue };
    sourceNegativeSea: { fieldId: string; before: ExactValue; residue: ExactValue; after: ExactValue };
    targetPositiveSea: { fieldId: string; before: ExactValue; placement: ExactValue; after: ExactValue };
    hostSelection: false;
}

export interface CausalAnchorTransferAssessment {
    id: string;
    transferId: string;
    lawId: string;
    anchorId: string;
    sourceWorldId: string;
    targetWorldId: string;
    status: "admitted" | "blocked" | "undetermined";
    reasons: string[];
    identityEvidenceSubjectIds: string[];
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
    worldId?: string;
    fieldId: string;
    layer: "world-field" | "intrinsic-viability";
    operation: "add" | "subtract" | "set" | "derive";
    before?: ExactValue;
    operand?: ExactValue;
    after: ExactValue;
}

export interface CausalTraceEntry {
    id: string;
    kind: "initial-field" | "internal-law" | "sea-coupling" | "world-will-intervention" | "history-commit"
        | "world-spawn" | "world-retirement" | "anchor-transfer";
    worldId: string;
    eventId?: string;
    lawId?: string;
    interventionId?: string;
    anchorId?: string;
    lifecycleEventId?: string;
    transferId?: string;
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
    baselineContinuationId?: string;
    status: "eligible" | "blocked";
    reasons: string[];
}

export interface CausalCandidateAssessment {
    id: string;
    interventionIds: string[];
    baselineContinuationId?: string;
    status: "improved" | "rejected" | "inadmissible" | "undetermined";
    score?: ExactValue;
    cost?: ExactValue;
    improvement?: ExactValue;
    objectiveContributions?: CausalObjectiveContribution[];
    outcomes?: Array<{
        id: string;
        score: ExactValue;
        improvement: ExactValue;
        objectiveContributions: CausalObjectiveContribution[];
        branchLineage: CausalInternalBranchStep[];
    }>;
    reasons: string[];
}

export interface CausalInternalBranchStep {
    id: string;
    frontierIndex: number;
    enabledLawIds: string[];
    realizedLawIds: string[];
    nonrealizedLawIds: string[];
    derivation: "maximal-commuting-frontier";
    hostSelection: false;
}

export interface CausalContinuation {
    id: string;
    selection: "baseline" | "autonomous-plural" | "selected" | "selected-plural" | "alternative";
    interventionIds: string[];
    score: ExactValue;
    branchLineage?: CausalInternalBranchStep[];
    worldStates: CausalWorldState[];
    realizedEventIds: string[];
    trace: CausalTraceEntry[];
    historyCommits: CausalHistoryCommit[];
    lifecycleEvents?: CausalWorldLifecycleEvent[];
    anchorTransferEvents?: CausalAnchorTransferEvent[];
    anchorTransferAssessments?: CausalAnchorTransferAssessment[];
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
        historyArrowSources?: Array<"history-commit" | "world-lifecycle">;
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
    autonomousContinuations?: CausalContinuation[];
    interventionEligibility: CausalInterventionEligibility[];
    baselineScore?: ExactValue;
    baselineScores?: Array<{ continuationId: string; score: ExactValue }>;
    candidateAssessments: CausalCandidateAssessment[];
    continuations: CausalContinuation[];
    selectedContinuationIds: string[];
    unresolvedAlternativeIds: string[];
    resourceUse: {
        formalQueryCount: number;
        formalEvaluationSteps: number;
        internalFrontierCount: number;
        internalBranchCount: number;
        interventionCombinationCount: number;
        combinationLimit: number;
        branchLimit: number;
        lifecycleTransitionBound?: number;
        exhaustiveInterventionSearch: boolean;
        exhaustiveInternalBranching: boolean;
    };
}

export interface AnchoredCausalInspection {
    mode: "bubble-anchored-causal-inspection.v2";
    summary: {
        status: AnchoredCausalRun["status"];
        worldCount: number;
        activeWorldCount?: number;
        latentWorldCount?: number;
        retiredWorldCount?: number;
        spawnedWorldCount?: number;
        retirementCount?: number;
        admittedAnchorTransferCount?: number;
        blockedAnchorTransferCount?: number;
        continuationCount: number;
        selectedContinuationCount: number;
        unresolvedAlternativeCount: number;
        emergedStructureCount: number;
        dissolvedStructureCount: number;
        createsHistoryArrow: boolean;
        exhaustiveInterventionSearch: boolean;
        exhaustiveInternalBranching: boolean;
    };
    decision: {
        baselineScore?: ExactValue;
        baselineScores?: Array<{ continuationId: string; score: ExactValue }>;
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
    lifecyclePreserved?: boolean;
    anchorTransfersPreserved?: boolean;
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
    lifecycleEvents: CausalWorldLifecycleEvent[];
    anchorTransferEvents: CausalAnchorTransferEvent[];
    anchorTransferAssessments: CausalAnchorTransferAssessment[];
    internalEventAblations: CausalInternalEventAblation[];
    branchedAwayLawIds: Set<string>;
    branchLineage: CausalInternalBranchStep[];
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
    realizations: MutableRealization[];
    formalEvidence: CausalFormalEvidence[];
    formalSteps: number;
    frontierCount: number;
    branchCount: number;
    exhaustiveBranching: boolean;
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

function worldPhase(state: CausalWorldState | undefined): CausalWorldLifecycleState["phase"] {
    return state?.lifecycle?.phase ?? "active";
}

function predicateWorldsAreActive(predicate: CausalStatePredicate, states: Map<string, MutableState>): boolean {
    return predicate.fieldParameters.every((binding) => worldPhase(states.get(binding.worldId)) === "active");
}

function anchorWorldsAreActive(
    program: ExecutableAnchoredCausalProgram,
    anchorId: string,
    states: Map<string, MutableState>,
): boolean {
    const anchor = program.world.anchors.find((candidate) => candidate.id === anchorId);
    return !!anchor && anchor.endpoints
        .filter((endpoint): endpoint is Extract<typeof endpoint, { kind: "world" }> => endpoint.kind === "world")
        .every((endpoint) => worldPhase(states.get(endpoint.worldId)) === "active");
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
    if (program.execution.internalConflictMode !== undefined
        && program.execution.internalConflictMode !== "underdetermined"
        && program.execution.internalConflictMode !== "maximal-commuting-branches") {
        diagnostics.push(runtimeIssue(
            "CKR025",
            "execution.internalConflictMode",
            "internal conflict mode must be underdetermined or maximal-commuting-branches",
        ));
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
    for (const transfer of program.world.anchorTransfers ?? []) {
        const identityFields = new Set(program.execution.anchorIdentity
            .filter((predicate) => predicate.anchorId === transfer.anchorId)
            .flatMap((predicate) => predicate.fieldParameters.map((binding) => fieldKey(binding.worldId, binding.fieldId))));
        const competingIdentityWriters = program.world.internalLaws.flatMap((law) => law.effects
            .filter((effect) => identityFields.has(fieldKey(law.worldId, effect.fieldId)))
            .map((effect) => `${law.id}:${fieldKey(law.worldId, effect.fieldId)}`));
        if (competingIdentityWriters.length > 0) {
            diagnostics.push(runtimeIssue(
                "CKR026",
                "execution.anchorIdentity",
                `transfer '${transfer.id}' identity fields cannot change in the same closure under the first membrane contract: ${competingIdentityWriters.sort().join(", ")}`,
            ));
        }
    }
    return diagnostics;
}

function normalizedOptions(options: CausalExecutionOptions): Required<CausalExecutionOptions> {
    return {
        worldWillEnabled: options.worldWillEnabled ?? true,
        cutAnchorIds: [...new Set(options.cutAnchorIds ?? [])].sort(),
        fieldOverrides: Object.fromEntries(Object.entries(options.fieldOverrides ?? {}).sort(([left], [right]) => left.localeCompare(right))),
        worldLifecycleOverrides: Object.fromEntries(Object.entries(options.worldLifecycleOverrides ?? {})
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([worldId, lifecycle]) => [worldId, {
                ...cloneValue(lifecycle),
                ...(lifecycle.parentWorldIds
                    ? { parentWorldIds: [...new Set(lifecycle.parentWorldIds)].sort() }
                    : {}),
            }])),
        counterfactualInternalEventAblationLawIds: [...new Set(options.counterfactualInternalEventAblationLawIds ?? [])].sort(),
        evaluationBudgetPerQuery: options.evaluationBudgetPerQuery ?? 10_000,
        maxInterventionCombinations: options.maxInterventionCombinations ?? 1_024,
        maxInternalFrontiers: options.maxInternalFrontiers ?? 1_024,
        maxInternalBranches: options.maxInternalBranches ?? 1_024,
    };
}

function recordedOptions(options: Required<CausalExecutionOptions>): ResolvedCausalExecutionOptions {
    const { counterfactualInternalEventAblationLawIds, worldLifecycleOverrides, ...ordinary } = cloneValue(options);
    return {
        ...ordinary,
        ...(counterfactualInternalEventAblationLawIds.length > 0 ? { counterfactualInternalEventAblationLawIds } : {}),
        ...(Object.keys(worldLifecycleOverrides).length > 0 ? { worldLifecycleOverrides } : {}),
    };
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
        ...(state.lifecycle ? { lifecycle: cloneValue(state.lifecycle) } : {}),
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
            ...(state.lifecycle ? { lifecycle: cloneValue(state.lifecycle) } : {}),
            bindings: state.bindings,
        });
    }
    return {
        states,
        appliedLawIds: new Set(source.appliedLawIds),
        trace: cloneValue(source.trace),
        historyCommits: cloneValue(source.historyCommits),
        lifecycleEvents: cloneValue(source.lifecycleEvents),
        anchorTransferEvents: cloneValue(source.anchorTransferEvents),
        anchorTransferAssessments: cloneValue(source.anchorTransferAssessments),
        internalEventAblations: cloneValue(source.internalEventAblations),
        branchedAwayLawIds: new Set(source.branchedAwayLawIds),
        branchLineage: cloneValue(source.branchLineage),
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
    recordTrace = true,
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
    if (recordTrace) {
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
    }
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

interface AppliedAnchorTransferFields {
    payload: ExactValue;
    targetBefore: ExactValue;
    targetAfter: ExactValue;
    sourceNegativeFieldId: string;
    sourceNegativeBefore: ExactValue;
    sourceNegativeAfter: ExactValue;
    targetPositiveFieldId: string;
    targetPositiveBefore: ExactValue;
    targetPositiveAfter: ExactValue;
    traceEffects: CausalTraceEffect[];
}

function mutateAnchorTransferFields(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    transfer: CausalAnchorTransferDefinition,
): { applied?: AppliedAnchorTransferFields; reason?: string } {
    const sourceWorld = program.world.worlds.find((world) => world.id === transfer.source.worldId);
    const targetWorld = program.world.worlds.find((world) => world.id === transfer.target.worldId);
    const sourceState = mutable.states.get(transfer.source.worldId);
    const targetState = mutable.states.get(transfer.target.worldId);
    const payload = sourceState?.fields[transfer.source.fieldId];
    if (!sourceWorld || !targetWorld || !sourceState || !targetState || !payload) {
        return { reason: `transfer '${transfer.id}' has an unavailable endpoint or payload` };
    }
    const sourceNext = cloneValue(sourceState);
    const targetNext = cloneValue(targetState);
    const sourceNegativeFieldId = sourceWorld.seaCoupling.negativeFieldId;
    const targetPositiveFieldId = targetWorld.seaCoupling.positiveFieldId;
    const targetApplied = applyEffect(program, targetNext, {
        fieldId: transfer.target.fieldId,
        operation: "set",
        value: cloneValue(payload),
    });
    const sourceNegativeApplied = applyEffect(program, sourceNext, {
        fieldId: sourceNegativeFieldId,
        operation: "add",
        value: transfer.sourceNegativeSeaResidue,
    });
    const targetPositiveApplied = applyEffect(program, targetNext, {
        fieldId: targetPositiveFieldId,
        operation: "add",
        value: transfer.targetPositiveSeaPlacement,
    });
    for (const applied of [targetApplied, sourceNegativeApplied, targetPositiveApplied]) {
        if (applied.reason || !applied.before || !applied.after) {
            return { reason: applied.reason ?? `transfer '${transfer.id}' could not update its typed membrane fields` };
        }
    }
    mutable.states.set(transfer.source.worldId, sourceNext);
    mutable.states.set(transfer.target.worldId, targetNext);
    return {
        applied: {
            payload: cloneValue(payload),
            targetBefore: targetApplied.before!,
            targetAfter: targetApplied.after!,
            sourceNegativeFieldId,
            sourceNegativeBefore: sourceNegativeApplied.before!,
            sourceNegativeAfter: sourceNegativeApplied.after!,
            targetPositiveFieldId,
            targetPositiveBefore: targetPositiveApplied.before!,
            targetPositiveAfter: targetPositiveApplied.after!,
            traceEffects: [
                {
                    worldId: transfer.target.worldId,
                    fieldId: transfer.target.fieldId,
                    layer: targetApplied.layer!,
                    operation: "set",
                    before: targetApplied.before!,
                    operand: cloneValue(payload),
                    after: targetApplied.after!,
                },
                {
                    worldId: transfer.source.worldId,
                    fieldId: sourceNegativeFieldId,
                    layer: sourceNegativeApplied.layer!,
                    operation: "add",
                    before: sourceNegativeApplied.before!,
                    operand: transfer.sourceNegativeSeaResidue,
                    after: sourceNegativeApplied.after!,
                },
                {
                    worldId: transfer.target.worldId,
                    fieldId: targetPositiveFieldId,
                    layer: targetPositiveApplied.layer!,
                    operation: "add",
                    before: targetPositiveApplied.before!,
                    operand: transfer.targetPositiveSeaPlacement,
                    after: targetPositiveApplied.after!,
                },
            ],
        },
    };
}

function upsertAnchorTransferAssessment(
    mutable: MutableRealization,
    assessment: CausalAnchorTransferAssessment,
): void {
    const index = mutable.anchorTransferAssessments.findIndex((entry) => entry.lawId === assessment.lawId);
    if (index >= 0) mutable.anchorTransferAssessments[index] = assessment;
    else mutable.anchorTransferAssessments.push(assessment);
}

function assessAnchorTransferLaw(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    law: CausalInternalLaw,
    options: Required<CausalExecutionOptions>,
    subjectPrefix: string,
): {
    status: CausalAnchorTransferAssessment["status"];
    assessment: CausalAnchorTransferAssessment;
    evidence: CausalFormalEvidence[];
    formalSteps: number;
} {
    const transfer = program.world.anchorTransfers!.find((candidate) => candidate.id === law.anchorTransferIds![0])!;
    const identityEvidence: CausalFormalEvidence[] = [];
    let formalSteps = 0;
    const reasons: string[] = [];
    const baseAssessment = {
        id: `transfer-assessment:${law.id}:${transfer.id}`,
        transferId: transfer.id,
        lawId: law.id,
        anchorId: transfer.anchorId,
        sourceWorldId: transfer.source.worldId,
        targetWorldId: transfer.target.worldId,
    };
    if (options.cutAnchorIds.includes(transfer.anchorId)) reasons.push(`anchor '${transfer.anchorId}' is cut`);
    for (const endpoint of [transfer.source, transfer.target]) {
        const phase = worldPhase(mutable.states.get(endpoint.worldId));
        if (phase !== "active") reasons.push(`transfer endpoint world '${endpoint.worldId}' is ${phase}`);
    }
    const identityPredicates = program.execution.anchorIdentity
        .filter((predicate) => predicate.anchorId === transfer.anchorId);
    if (reasons.length === 0) {
        const preIdentity = evaluateConstraintSet(
            program,
            identityPredicates,
            "anchor-identity",
            mutable.states,
            options,
            `${subjectPrefix}transfer:${transfer.id}:pre:`,
        );
        identityEvidence.push(...preIdentity.evidence);
        formalSteps += preIdentity.formalSteps;
        if (preIdentity.admissible === undefined) {
            reasons.push(...preIdentity.reasons);
            return {
                status: "undetermined",
                assessment: {
                    ...baseAssessment,
                    status: "undetermined",
                    reasons,
                    identityEvidenceSubjectIds: identityEvidence.map((entry) => entry.subjectId),
                },
                evidence: identityEvidence,
                formalSteps,
            };
        }
        if (!preIdentity.admissible) reasons.push(...preIdentity.reasons);
    }
    if (reasons.length === 0) {
        const preview = cloneRealization(mutable);
        const mutated = mutateAnchorTransferFields(program, preview, transfer);
        if (mutated.reason) reasons.push(mutated.reason);
        else {
            const sourceSeaError = recomputeSea(program, preview, transfer.source.worldId, [], false);
            const targetSeaError = recomputeSea(program, preview, transfer.target.worldId, [], false);
            if (sourceSeaError || targetSeaError) reasons.push(sourceSeaError ?? targetSeaError!);
        }
        if (reasons.length === 0) {
            const postIdentity = evaluateConstraintSet(
                program,
                identityPredicates,
                "anchor-identity",
                preview.states,
                options,
                `${subjectPrefix}transfer:${transfer.id}:post:`,
            );
            identityEvidence.push(...postIdentity.evidence);
            formalSteps += postIdentity.formalSteps;
            if (postIdentity.admissible === undefined) {
                reasons.push(...postIdentity.reasons);
                return {
                    status: "undetermined",
                    assessment: {
                        ...baseAssessment,
                        status: "undetermined",
                        reasons,
                        identityEvidenceSubjectIds: identityEvidence.map((entry) => entry.subjectId),
                    },
                    evidence: identityEvidence,
                    formalSteps,
                };
            }
            if (!postIdentity.admissible) reasons.push(...postIdentity.reasons.map((reason) => `post-transfer ${reason}`));
        }
    }
    const status = reasons.length === 0 ? "admitted" : "blocked";
    return {
        status,
        assessment: {
            ...baseAssessment,
            status,
            reasons,
            identityEvidenceSubjectIds: identityEvidence.map((entry) => entry.subjectId),
        },
        evidence: identityEvidence,
        formalSteps,
    };
}

function effectSetsConflict(
    entries: Array<{
        worldId: string;
        effects: CausalFieldEffect[];
        lifecycleEffects?: CausalWorldLifecycleEffect[];
        transferWorldIds?: string[];
    }>,
): boolean {
    const byField = new Map<string, CausalFieldEffect[]>();
    for (const entry of entries) {
        for (const effect of entry.effects) {
            const key = fieldKey(entry.worldId, effect.fieldId);
            byField.set(key, [...byField.get(key) ?? [], effect]);
        }
    }
    const fieldConflict = [...byField.values()].some((effects) => {
        const meaningful = effects.filter((effect) => (
            effect.operation === "set" || !exactValuesEqual(effect.value, exact.integer(0))
        ));
        if (meaningful.length <= 1) return false;
        const setters = meaningful.filter((effect) => effect.operation === "set");
        if (setters.length === 0) return false;
        return setters.length !== meaningful.length
            || setters.some((effect) => !exactValuesEqual(effect.value, setters[0]!.value));
    });
    if (fieldConflict) return true;
    const byWorld = new Map<string, Set<CausalWorldLifecycleEffect["kind"]>>();
    for (const entry of entries) {
        for (const effect of entry.lifecycleEffects ?? []) {
            const targetWorldId = effect.kind === "retire-self" ? entry.worldId : effect.targetWorldId;
            byWorld.set(targetWorldId, new Set([...(byWorld.get(targetWorldId) ?? []), effect.kind]));
        }
    }
    if ([...byWorld.values()].some((kinds) => kinds.size > 1)) return true;
    const lifecycleWorldIds = new Set(byWorld.keys());
    const transferWorldIds = new Set(entries.flatMap((entry) => entry.transferWorldIds ?? []));
    return [...transferWorldIds].some((worldId) => lifecycleWorldIds.has(worldId));
}

function lawConflictEntry(program: ExecutableAnchoredCausalProgram, law: CausalInternalLaw) {
    const transferWorldIds = (law.anchorTransferIds ?? []).flatMap((transferId) => {
        const transfer = program.world.anchorTransfers?.find((candidate) => candidate.id === transferId);
        return transfer ? [transfer.source.worldId, transfer.target.worldId] : [];
    });
    return {
        worldId: law.worldId,
        effects: law.effects,
        lifecycleEffects: law.lifecycleEffects,
        transferWorldIds,
    };
}

function lifecycleEffectsApplicable(law: CausalInternalLaw, states: Map<string, MutableState>): boolean {
    if (worldPhase(states.get(law.worldId)) !== "active") return false;
    return (law.lifecycleEffects ?? []).every((effect) => (
        effect.kind === "retire-self" || worldPhase(states.get(effect.targetWorldId)) === "latent"
    ));
}

function maximalCommutingLawFrontiers(
    program: ExecutableAnchoredCausalProgram,
    laws: CausalInternalLaw[],
    limit: number,
): { frontiers: CausalInternalLaw[][]; exhaustive: boolean } {
    const ordered = [...laws].sort((left, right) => left.id.localeCompare(right.id));
    const byId = new Map(ordered.map((law) => [law.id, law]));
    const compatible = new Map(ordered.map((law) => [
        law.id,
        new Set(ordered
            .filter((candidate) => candidate.id !== law.id && !effectSetsConflict([
                lawConflictEntry(program, law),
                lawConflictEntry(program, candidate),
            ]))
            .map((candidate) => candidate.id)),
    ]));
    const results: string[][] = [];
    let exhaustive = true;
    const search = (chosen: string[], possibleInput: string[], excludedInput: string[]): void => {
        if (!exhaustive) return;
        let possible = [...possibleInput];
        let excluded = [...excludedInput];
        if (possible.length === 0 && excluded.length === 0) {
            results.push([...chosen].sort());
            if (results.length > limit) exhaustive = false;
            return;
        }
        const pivot = [...possible, ...excluded]
            .sort((left, right) => {
                const leftDegree = possible.filter((id) => compatible.get(left)?.has(id)).length;
                const rightDegree = possible.filter((id) => compatible.get(right)?.has(id)).length;
                return rightDegree - leftDegree || left.localeCompare(right);
            })[0];
        const candidates = possible.filter((id) => !pivot || !compatible.get(pivot)?.has(id));
        for (const candidate of candidates) {
            if (!possible.includes(candidate)) continue;
            const neighbors = compatible.get(candidate) ?? new Set<string>();
            search(
                [...chosen, candidate],
                possible.filter((id) => neighbors.has(id)),
                excluded.filter((id) => neighbors.has(id)),
            );
            possible = possible.filter((id) => id !== candidate);
            excluded = [...excluded, candidate];
            if (!exhaustive) return;
        }
    };
    search([], ordered.map((law) => law.id), []);
    return {
        frontiers: results
            .slice(0, limit)
            .sort((left, right) => left.join("+").localeCompare(right.join("+")))
            .map((ids) => ids.map((id) => byId.get(id)!)),
        exhaustive,
    };
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

function applyAnchorTransferFrontier(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    lawEvents: Array<{ law: CausalInternalLaw; eventId: string }>,
): string | undefined {
    const transferEventIds: string[] = [];
    for (const { law, eventId: lawEventId } of [...lawEvents].sort((left, right) => left.law.id.localeCompare(right.law.id))) {
        const transferId = law.anchorTransferIds?.[0];
        if (!transferId) continue;
        const transfer = program.world.anchorTransfers?.find((candidate) => candidate.id === transferId);
        if (!transfer) return `law '${law.id}' names missing anchor transfer '${transferId}'`;
        const mutated = mutateAnchorTransferFields(program, mutable, transfer);
        if (!mutated.applied) return mutated.reason ?? `transfer '${transfer.id}' failed`;
        const applied = mutated.applied;
        const transferEventId = `transfer:${transfer.id}:by:${law.id}`;
        const transferCauses = [...new Set([
            lawEventId,
            ...[transfer.source.worldId, transfer.target.worldId].flatMap((worldId) => {
                const spawnedByEventId = mutable.states.get(worldId)?.lifecycle?.spawnedByEventId;
                return spawnedByEventId ? [spawnedByEventId] : [];
            }),
        ])].sort();
        const transferEvent: CausalAnchorTransferEvent = {
            id: transferEventId,
            transferId: transfer.id,
            lawId: law.id,
            lawEventId,
            anchorId: transfer.anchorId,
            source: { ...cloneValue(transfer.source), value: cloneValue(applied.payload) },
            target: {
                ...cloneValue(transfer.target),
                before: cloneValue(applied.targetBefore),
                after: cloneValue(applied.targetAfter),
            },
            sourceNegativeSea: {
                fieldId: applied.sourceNegativeFieldId,
                before: cloneValue(applied.sourceNegativeBefore),
                residue: cloneValue(transfer.sourceNegativeSeaResidue),
                after: cloneValue(applied.sourceNegativeAfter),
            },
            targetPositiveSea: {
                fieldId: applied.targetPositiveFieldId,
                before: cloneValue(applied.targetPositiveBefore),
                placement: cloneValue(transfer.targetPositiveSeaPlacement),
                after: cloneValue(applied.targetPositiveAfter),
            },
            hostSelection: false,
        };
        mutable.anchorTransferEvents.push(transferEvent);
        mutable.events.push({ id: transferEventId, causes: transferCauses, reversibility: "irreversible" });
        mutable.evaluationOrder.push(transferEventId);
        mutable.trace.push({
            id: `trace:${mutable.trace.length + 1}:${transferEventId}`,
            kind: "anchor-transfer",
            worldId: transfer.target.worldId,
            eventId: transferEventId,
            lawId: law.id,
            anchorId: transfer.anchorId,
            transferId: transfer.id,
            causes: transferCauses,
            effects: cloneValue(applied.traceEffects),
        });
        for (const [key, before, after] of [
            [fieldKey(transfer.target.worldId, transfer.target.fieldId), applied.targetBefore, applied.targetAfter],
            [fieldKey(transfer.source.worldId, applied.sourceNegativeFieldId), applied.sourceNegativeBefore, applied.sourceNegativeAfter],
            [fieldKey(transfer.target.worldId, applied.targetPositiveFieldId), applied.targetPositiveBefore, applied.targetPositiveAfter],
        ] as const) {
            if (!exactValuesEqual(before, after)) mutable.fieldCauses.set(key, [transferEventId]);
        }
        const sourceSeaError = recomputeSea(program, mutable, transfer.source.worldId, [transferEventId]);
        if (sourceSeaError) return sourceSeaError;
        const targetSeaError = recomputeSea(program, mutable, transfer.target.worldId, [transferEventId]);
        if (targetSeaError) return targetSeaError;
        transferEventIds.push(transferEventId);
    }
    if (transferEventIds.length > 0) mutable.evaluationFrontiers.push(transferEventIds);
    return undefined;
}

function applyLifecycleFrontier(
    program: ExecutableAnchoredCausalProgram,
    mutable: MutableRealization,
    lawEvents: Array<{ law: CausalInternalLaw; eventId: string }>,
): string | undefined {
    const transitions = new Map<string, {
        kind: CausalWorldLifecycleEffect["kind"];
        sourceWorldIds: Set<string>;
        causedByLawEventIds: Set<string>;
    }>();
    for (const { law, eventId } of lawEvents) {
        for (const effect of law.lifecycleEffects ?? []) {
            const targetWorldId = effect.kind === "retire-self" ? law.worldId : effect.targetWorldId;
            const existing = transitions.get(targetWorldId);
            if (existing && existing.kind !== effect.kind) {
                return `world '${targetWorldId}' cannot be spawned and retired in one causal frontier`;
            }
            const transition = existing ?? {
                kind: effect.kind,
                sourceWorldIds: new Set<string>(),
                causedByLawEventIds: new Set<string>(),
            };
            transition.sourceWorldIds.add(law.worldId);
            transition.causedByLawEventIds.add(eventId);
            transitions.set(targetWorldId, transition);
        }
    }
    const lifecycleEventIds: string[] = [];
    for (const [targetWorldId, transition] of [...transitions].sort(([left], [right]) => left.localeCompare(right))) {
        const state = mutable.states.get(targetWorldId);
        const world = program.world.worlds.find((candidate) => candidate.id === targetWorldId);
        if (!state || !world) return `lifecycle transition names missing world '${targetWorldId}'`;
        const sourceWorldIds = [...transition.sourceWorldIds].sort();
        const causedByLawEventIds = [...transition.causedByLawEventIds].sort();
        const causeLabel = causedByLawEventIds.map((id) => id.slice("law:".length)).join("+");
        if (transition.kind === "spawn-world") {
            if (worldPhase(state) !== "latent") return `spawn target '${targetWorldId}' is not latent`;
            const eventId = `spawn:${targetWorldId}:by:${causeLabel}`;
            const lineageId = `lineage:${digest({
                targetWorldId,
                sourceWorldIds,
                causedByLawEventIds,
                parentLineages: sourceWorldIds.map((worldId) => (
                    mutable.states.get(worldId)?.lifecycle?.lineageId ?? `initial:${worldId}`
                )),
                branchLineage: mutable.branchLineage.map((step) => step.id),
            }).slice(0, 20)}`;
            state.lifecycle = {
                phase: "active",
                lineageId,
                parentWorldIds: sourceWorldIds,
                spawnedByEventId: eventId,
            };
            for (const fieldId of state.bindings.keys()) {
                mutable.fieldCauses.set(fieldKey(targetWorldId, fieldId), [eventId]);
            }
            const lifecycleEvent: CausalWorldLifecycleEvent = {
                id: eventId,
                kind: "world-spawn",
                sourceWorldIds,
                targetWorldId,
                causedByLawEventIds,
                beforePhase: "latent",
                afterPhase: "active",
                hostSelection: false,
                lineageId,
            };
            mutable.lifecycleEvents.push(lifecycleEvent);
            mutable.events.push({ id: eventId, causes: causedByLawEventIds, reversibility: "irreversible" });
            mutable.evaluationOrder.push(eventId);
            mutable.trace.push({
                id: `trace:${mutable.trace.length + 1}:${eventId}`,
                kind: "world-spawn",
                worldId: targetWorldId,
                eventId,
                lifecycleEventId: eventId,
                causes: causedByLawEventIds,
                effects: [],
            });
            const seaError = recomputeSea(program, mutable, targetWorldId, [eventId]);
            if (seaError) return seaError;
            lifecycleEventIds.push(eventId);
            continue;
        }
        if (worldPhase(state) !== "active") return `retirement target '${targetWorldId}' is not active`;
        const eventId = `retire:${targetWorldId}:by:${causeLabel}`;
        const negativeFieldId = world.seaCoupling.negativeFieldId;
        const localNegativeSea = state.fields[negativeFieldId];
        if (!localNegativeSea) return `retirement target '${targetWorldId}' has no negative-sea state`;
        const residue: CausalWorldRetirementResidue = {
            finalStateDigest: digest({
                fields: state.fields,
                intrinsicViability: state.intrinsicViability,
                seaContribution: state.seaContribution,
            }),
            localNegativeSea: cloneValue(localNegativeSea),
            retainedHistoryCommitIds: mutable.historyCommits
                .filter((commit) => commit.worldId === targetWorldId)
                .map((commit) => commit.eventId),
        };
        state.lifecycle = {
            ...(state.lifecycle ?? { phase: "active" as const }),
            phase: "retired",
            retiredByEventId: eventId,
        };
        const lifecycleEvent: CausalWorldLifecycleEvent = {
            id: eventId,
            kind: "world-retirement",
            sourceWorldIds,
            targetWorldId,
            causedByLawEventIds,
            beforePhase: "active",
            afterPhase: "retired",
            hostSelection: false,
            ...(state.lifecycle.lineageId ? { lineageId: state.lifecycle.lineageId } : {}),
            residue,
        };
        mutable.lifecycleEvents.push(lifecycleEvent);
        mutable.events.push({ id: eventId, causes: causedByLawEventIds, reversibility: "irreversible" });
        mutable.evaluationOrder.push(eventId);
        mutable.trace.push({
            id: `trace:${mutable.trace.length + 1}:${eventId}`,
            kind: "world-retirement",
            worldId: targetWorldId,
            eventId,
            lifecycleEventId: eventId,
            causes: causedByLawEventIds,
            effects: [],
        });
        lifecycleEventIds.push(eventId);
    }
    if (lifecycleEventIds.length > 0) mutable.evaluationFrontiers.push(lifecycleEventIds);
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
    const transferError = applyAnchorTransferFrontier(program, mutable, lawEvents);
    if (transferError) return transferError;
    const lifecycleError = applyLifecycleFrontier(program, mutable, lawEvents);
    if (lifecycleError) return lifecycleError;
    return undefined;
}

function closeInternalLaws(
    program: ExecutableAnchoredCausalProgram,
    initial: MutableRealization,
    options: Required<CausalExecutionOptions>,
    subjectPrefix: string,
): ClosureResult {
    const formalEvidence: CausalFormalEvidence[] = [];
    let formalSteps = 0;
    let frontierCount = 0;
    let branchCount = 0;
    const completed: MutableRealization[] = [];
    const queue: Array<{ mutable: MutableRealization; localFrontierCount: number }> = [{
        mutable: initial,
        localFrontierCount: 0,
    }];
    const partialRealizations = (current?: MutableRealization): MutableRealization[] => [
        ...completed,
        ...(current ? [current] : []),
        ...queue.map((entry) => entry.mutable),
    ];
    while (queue.length > 0) {
        const node = queue.shift()!;
        const mutable = node.mutable;
        while (true) {
            const enabled: CausalInternalLaw[] = [];
            const unresolved: string[] = [];
            const branchSubject = mutable.branchLineage.length > 0
                ? `branch:${mutable.branchLineage.map((step) => step.id).join("/")}:`
                : "";
            for (const law of [...program.world.internalLaws].sort((left, right) => left.id.localeCompare(right.id))) {
                if (mutable.appliedLawIds.has(law.id) || mutable.branchedAwayLawIds.has(law.id)) continue;
                if (!lifecycleEffectsApplicable(law, mutable.states) || !predicateWorldsAreActive(law.guard, mutable.states)) {
                    continue;
                }
                const evaluated = evaluatePredicate(
                    program,
                    law.guard,
                    "law-guard",
                    mutable.states,
                    options.evaluationBudgetPerQuery,
                    `${subjectPrefix}${branchSubject}frontier:${node.localFrontierCount}:${law.id}:`,
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
                        realizations: partialRealizations(mutable),
                        formalEvidence,
                        formalSteps,
                        frontierCount,
                        branchCount,
                        exhaustiveBranching: true,
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
                            frontierIndex: node.localFrontierCount,
                            causes: predicateCauses(law.guard, mutable),
                            lawRetainedInProgram: true,
                            effectsSuppressed: true,
                        });
                    } else if ((law.anchorTransferIds?.length ?? 0) > 0) {
                        const transferAssessment = assessAnchorTransferLaw(
                            program,
                            mutable,
                            law,
                            options,
                            `${subjectPrefix}${branchSubject}frontier:${node.localFrontierCount}:${law.id}:`,
                        );
                        formalEvidence.push(...transferAssessment.evidence);
                        formalSteps += transferAssessment.formalSteps;
                        upsertAnchorTransferAssessment(mutable, transferAssessment.assessment);
                        if (transferAssessment.status === "undetermined") unresolved.push(law.id);
                        else if (transferAssessment.status === "admitted") enabled.push(law);
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
                    realizations: partialRealizations(mutable),
                    formalEvidence,
                    formalSteps,
                    frontierCount,
                    branchCount,
                    exhaustiveBranching: true,
                };
            }
            if (enabled.length === 0) {
                completed.push(mutable);
                break;
            }
            const conflict = effectSetsConflict(enabled.map((law) => ({
                ...lawConflictEntry(program, law),
            })));
            if (conflict && program.execution.internalConflictMode !== "maximal-commuting-branches") {
                return {
                    status: "undetermined",
                    reason: "simultaneously enabled internal laws have non-commuting set effects",
                    unresolvedLawIds: enabled.map((law) => law.id).sort(),
                    realizations: partialRealizations(mutable),
                    formalEvidence,
                    formalSteps,
                    frontierCount,
                    branchCount,
                    exhaustiveBranching: true,
                };
            }
            if (conflict) {
                const remainingBranchBudget = options.maxInternalBranches - branchCount;
                const alternatives = maximalCommutingLawFrontiers(program, enabled, Math.max(remainingBranchBudget, 0));
                if (!alternatives.exhaustive || alternatives.frontiers.length === 0
                    || branchCount + alternatives.frontiers.length > options.maxInternalBranches) {
                    return {
                        status: "undetermined",
                        reason: "endogenous internal-branch budget exhausted before every maximal commuting frontier was preserved",
                        unresolvedLawIds: enabled.map((law) => law.id).sort(),
                        realizations: partialRealizations(mutable),
                        formalEvidence,
                        formalSteps,
                        frontierCount,
                        branchCount,
                        exhaustiveBranching: false,
                    };
                }
                if (frontierCount + alternatives.frontiers.length > options.maxInternalFrontiers) {
                    return {
                        status: "undetermined",
                        reason: "internal causal-closure frontier budget cannot preserve every endogenous branch",
                        unresolvedLawIds: enabled.map((law) => law.id).sort(),
                        realizations: partialRealizations(mutable),
                        formalEvidence,
                        formalSteps,
                        frontierCount,
                        branchCount,
                        exhaustiveBranching: true,
                    };
                }
                const enabledLawIds = enabled.map((law) => law.id).sort();
                for (const frontier of alternatives.frontiers) {
                    const child = cloneRealization(mutable);
                    const realizedLawIds = frontier.map((law) => law.id).sort();
                    const nonrealizedLawIds = enabledLawIds.filter((lawId) => !realizedLawIds.includes(lawId));
                    nonrealizedLawIds.forEach((lawId) => child.branchedAwayLawIds.add(lawId));
                    const step: CausalInternalBranchStep = {
                        id: `branch:${digest({
                            parent: child.branchLineage.map((entry) => entry.id),
                            frontierIndex: node.localFrontierCount,
                            realizedLawIds,
                        }).slice(0, 16)}`,
                        frontierIndex: node.localFrontierCount,
                        enabledLawIds,
                        realizedLawIds,
                        nonrealizedLawIds,
                        derivation: "maximal-commuting-frontier",
                        hostSelection: false,
                    };
                    child.branchLineage.push(step);
                    const error = applyLawFrontier(program, child, frontier);
                    if (error) {
                        return {
                            status: "contradicted",
                            reason: error,
                            unresolvedLawIds: realizedLawIds,
                            realizations: partialRealizations(child),
                            formalEvidence,
                            formalSteps,
                            frontierCount,
                            branchCount,
                            exhaustiveBranching: true,
                        };
                    }
                    queue.push({ mutable: child, localFrontierCount: node.localFrontierCount + 1 });
                    frontierCount += 1;
                    branchCount += 1;
                }
                break;
            }
            if (frontierCount + 1 > options.maxInternalFrontiers) {
                return {
                    status: "undetermined",
                    reason: "internal causal-closure frontier budget exhausted",
                    unresolvedLawIds: enabled.map((law) => law.id).sort(),
                    realizations: partialRealizations(mutable),
                    formalEvidence,
                    formalSteps,
                    frontierCount,
                    branchCount,
                    exhaustiveBranching: true,
                };
            }
            const error = applyLawFrontier(program, mutable, enabled);
            if (error) {
                return {
                    status: "contradicted",
                    reason: error,
                    unresolvedLawIds: enabled.map((law) => law.id),
                    realizations: partialRealizations(mutable),
                    formalEvidence,
                    formalSteps,
                    frontierCount,
                    branchCount,
                    exhaustiveBranching: true,
                };
            }
            frontierCount += 1;
            node.localFrontierCount += 1;
        }
    }
    return {
        status: "closed",
        unresolvedLawIds: [],
        realizations: completed.sort((left, right) => (
            left.branchLineage.map((step) => step.realizedLawIds.join("+")).join("/").localeCompare(
                right.branchLineage.map((step) => step.realizedLawIds.join("+")).join("/"),
            )
        )),
        formalEvidence,
        formalSteps,
        frontierCount,
        branchCount,
        exhaustiveBranching: true,
    };
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
        if (worldPhase(states.get(objective.targetWorldId)) !== "active") continue;
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
        if (worldPhase(state) !== "active") {
            return `intervention '${intervention.id}' targets inactive world '${intervention.targetWorldId}'`;
        }
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
        const initialActive = worldPhase(initial.get(criterion.worldId)) === "active";
        const finalActive = worldPhase(mutable.states.get(criterion.worldId)) === "active";
        const before = initialActive ? booleanEvidenceValue(initialResult.evidence) : false;
        const after = finalActive ? booleanEvidenceValue(finalResult.evidence) : false;
        const relevantContradiction = (initialActive && initialResult.evidence.status === "contradicted")
            || (finalActive && finalResult.evidence.status === "contradicted");
        const status: CausalEmergenceAssessment["status"] = relevantContradiction
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
                && ((entry.kind === "world-spawn" || entry.kind === "world-retirement")
                    || entry.effects.some((effect) => relevantFields.has(effect.fieldId)
                        && (!effect.before || !exactValuesEqual(effect.before, effect.after)))))
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
    const historyArrowSources: Array<"history-commit" | "world-lifecycle"> = [
        ...(mutable.historyCommits.length > 0 ? ["history-commit" as const] : []),
        ...(mutable.lifecycleEvents.length > 0 ? ["world-lifecycle" as const] : []),
    ];
    return {
        continuation: {
            id,
            selection,
            interventionIds: [...interventionIds].sort(),
            score,
            ...(mutable.branchLineage.length > 0 ? { branchLineage: cloneValue(mutable.branchLineage) } : {}),
            worldStates: serializeStates(mutable.states),
            realizedEventIds: mutable.events.map((event) => event.id),
            trace: cloneValue(mutable.trace),
            historyCommits: cloneValue(mutable.historyCommits),
            ...(mutable.lifecycleEvents.length > 0 ? { lifecycleEvents: cloneValue(mutable.lifecycleEvents) } : {}),
            ...(mutable.anchorTransferEvents.length > 0
                ? { anchorTransferEvents: cloneValue(mutable.anchorTransferEvents) }
                : {}),
            ...(mutable.anchorTransferAssessments.length > 0
                ? { anchorTransferAssessments: cloneValue(mutable.anchorTransferAssessments) }
                : {}),
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
                createsHistoryArrow: historyArrowSources.length > 0,
                ...(mutable.lifecycleEvents.length > 0 ? { historyArrowSources } : {}),
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
        const lifecycle = options.worldLifecycleOverrides[world.id]
            ?? (world.initialExistence === "latent" ? { phase: "latent" as const } : undefined);
        states.set(world.id, {
            worldId: world.id,
            fields: {},
            intrinsicViability: exact.integer(0),
            seaContribution: exact.integer(0),
            ...(lifecycle ? { lifecycle: cloneValue(lifecycle) } : {}),
            bindings: new Map(world.fields.map((field) => [field.id, field])),
        });
    }
    const mutable: MutableRealization = {
        states,
        appliedLawIds: new Set(),
        trace: [],
        historyCommits: [],
        lifecycleEvents: [],
        anchorTransferEvents: [],
        anchorTransferAssessments: [],
        internalEventAblations: [],
        branchedAwayLawIds: new Set(),
        branchLineage: [],
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
        const error = recomputeSea(program, mutable, world.id, [], worldPhase(state) === "active");
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
        if (!predicateWorldsAreActive(predicate, states)) continue;
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

function branchContinuationSuffix(mutable: MutableRealization): string {
    return mutable.branchLineage.length === 0
        ? ""
        : `:branch:${mutable.branchLineage.map((step) => step.id.slice("branch:".length)).join(".")}`;
}

function minimumExactRational(values: ExactValue[]): ExactValue | undefined {
    if (values.length === 0) return undefined;
    let minimum = values[0]!;
    for (const value of values.slice(1)) {
        const comparison = compareExactRationals(value, minimum);
        if (comparison === undefined) return undefined;
        if (comparison < 0) minimum = value;
    }
    return minimum;
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
    let internalBranchCount = 0;
    let interventionCombinationCount = 0;
    let exhaustiveInterventionSearch = true;
    let exhaustiveInternalBranching = true;
    const lifecycleAwareProgram = program.world.worlds.some((world) => world.initialExistence === "latent")
        || program.world.internalLaws.some((law) => (law.lifecycleEffects?.length ?? 0) > 0);
    const lifecycleTransitionBound = program.world.worlds.reduce((total, world) => (
        total + (world.initialExistence === "latent" ? 2 : 1)
    ), 0);
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
            internalBranchCount,
            interventionCombinationCount,
            combinationLimit: options.maxInterventionCombinations,
            branchLimit: options.maxInternalBranches,
            ...(lifecycleAwareProgram ? { lifecycleTransitionBound } : {}),
            exhaustiveInterventionSearch,
            exhaustiveInternalBranching,
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
    const knownWorldIds = new Set(program.world.worlds.map((world) => world.id));
    const unknownLifecycleWorldIds = Object.keys(options.worldLifecycleOverrides)
        .filter((worldId) => !knownWorldIds.has(worldId));
    if (unknownLifecycleWorldIds.length > 0) {
        return emptyRun("contradicted", `unknown lifecycle override world id(s): ${unknownLifecycleWorldIds.join(", ")}`);
    }
    for (const [worldId, lifecycle] of Object.entries(options.worldLifecycleOverrides)) {
        if (!["latent", "active", "retired"].includes(lifecycle.phase)) {
            return emptyRun("contradicted", `lifecycle override for '${worldId}' has an invalid phase`);
        }
        const parents = lifecycle.parentWorldIds ?? [];
        if (parents.some((parentWorldId) => !knownWorldIds.has(parentWorldId) || parentWorldId === worldId)) {
            return emptyRun("contradicted", `lifecycle override for '${worldId}' has an invalid parent world`);
        }
        const hasSpawnProvenance = !!lifecycle.lineageId && parents.length > 0 && !!lifecycle.spawnedByEventId;
        const hasAnySpawnProvenance = !!lifecycle.lineageId || parents.length > 0 || !!lifecycle.spawnedByEventId;
        const declaredLatent = program.world.worlds.find((world) => world.id === worldId)?.initialExistence === "latent";
        if (!declaredLatent && lifecycle.phase === "latent") {
            return emptyRun("contradicted", `initially active world '${worldId}' cannot regress to latent existence`);
        }
        if (!declaredLatent && hasAnySpawnProvenance) {
            return emptyRun("contradicted", `initially active world '${worldId}' cannot claim spawn provenance`);
        }
        if (hasAnySpawnProvenance && !hasSpawnProvenance) {
            return emptyRun("contradicted", `lifecycle override for '${worldId}' has incomplete spawn provenance`);
        }
        if (lifecycle.phase === "latent" && (hasAnySpawnProvenance || lifecycle.retiredByEventId)) {
            return emptyRun("contradicted", `latent lifecycle override for '${worldId}' cannot claim realized history`);
        }
        if (declaredLatent && lifecycle.phase !== "latent" && !hasSpawnProvenance) {
            return emptyRun("contradicted", `realized latent world '${worldId}' requires lineage and spawn provenance`);
        }
        if (lifecycle.phase === "retired" && !lifecycle.retiredByEventId) {
            return emptyRun("contradicted", `retired lifecycle override for '${worldId}' requires retirement provenance`);
        }
        if (lifecycle.phase !== "retired" && lifecycle.retiredByEventId) {
            return emptyRun("contradicted", `non-retired lifecycle override for '${worldId}' cannot claim retirement provenance`);
        }
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
        || !Number.isSafeInteger(options.maxInternalBranches)
        || options.evaluationBudgetPerQuery < 1
        || options.maxInterventionCombinations < 0
        || options.maxInternalFrontiers < 1
        || options.maxInternalBranches < 1) {
        return emptyRun("contradicted", "execution budgets must be positive, except that the intervention combination limit may be zero");
    }
    const initialized = initializeRealization(program, options);
    formalEvidence.push(...initialized.evidence);
    formalSteps += initialized.formalSteps;
    if (!initialized.mutable || initialized.status) {
        return emptyRun(initialized.status ?? "contradicted", initialized.reason ?? "world initialization failed");
    }
    const initialWorldStates = serializeStates(initialized.mutable.states);
    const closure = closeInternalLaws(program, initialized.mutable, options, "autonomous:");
    formalEvidence.push(...closure.formalEvidence);
    formalSteps += closure.formalSteps;
    internalFrontierCount += closure.frontierCount;
    internalBranchCount += closure.branchCount;
    exhaustiveInternalBranching = exhaustiveInternalBranching && closure.exhaustiveBranching;
    const autonomousBases: Array<{
        mutable: MutableRealization;
        objective: ObjectiveScore;
        continuation: CausalContinuation;
    }> = [];
    for (const mutable of closure.realizations) {
        const objective = scoreObjectives(program, mutable.states);
        if (!objective) {
            return emptyRun("contradicted", "World Will objectives could not be scored exactly", { initialWorldStates });
        }
        const built = continuationFromRealization(
            program,
            mutable,
            initialWorldStates,
            `continuation:autonomous${branchContinuationSuffix(mutable)}`,
            closure.realizations.length > 1 ? "autonomous-plural" : "baseline",
            [],
            objective.score,
            options,
        );
        autonomousBases.push({ mutable, objective, continuation: built.continuation });
        formalEvidence.push(...built.emergence.evidence);
        formalSteps += built.emergence.formalSteps;
    }
    const autonomousContinuations = autonomousBases.map((base) => base.continuation);
    const baselineScores = autonomousBases.map((base) => ({
        continuationId: base.continuation.id,
        score: base.objective.score,
    }));
    const singularAutonomous = autonomousBases.length === 1 ? autonomousBases[0] : undefined;
    if (closure.status !== "closed") {
        return emptyRun(closure.status === "contradicted" ? "contradicted" : "underdetermined", closure.reason ?? "internal causal closure failed", {
            initialWorldStates,
            ...(singularAutonomous ? {
                autonomousContinuation: singularAutonomous.continuation,
                baselineScore: singularAutonomous.objective.score,
            } : {}),
            ...(autonomousBases.length > 1 ? { autonomousContinuations, baselineScores } : {}),
            continuations: autonomousContinuations,
            selectedContinuationIds: [],
            unresolvedAlternativeIds: closure.unresolvedLawIds.map((id) => `law:${id}`),
        });
    }

    const eligibility: CausalInterventionEligibility[] = [];
    const eligibleByBaseline = new Map<string, CausalWorldWillIntervention[]>();
    for (const base of autonomousBases) {
        const identityByAnchor = new Map<string, ReturnType<typeof evaluateConstraintSet>>();
        for (const anchor of program.world.anchors) {
            const predicates = program.execution.anchorIdentity.filter((predicate) => predicate.anchorId === anchor.id);
            const result = anchorWorldsAreActive(program, anchor.id, base.mutable.states)
                ? evaluateConstraintSet(
                    program,
                    predicates,
                    "anchor-identity",
                    base.mutable.states,
                    options,
                    `anchor:${base.continuation.id}:${anchor.id}:`,
                )
                : {
                    admissible: false,
                    evidence: [],
                    formalSteps: 0,
                    reasons: [`anchor '${anchor.id}' has an inactive world endpoint`],
                };
            identityByAnchor.set(anchor.id, result);
            formalEvidence.push(...result.evidence);
            formalSteps += result.formalSteps;
        }
        const baseEligibility = program.world.worldWill.interventions
            .map((intervention): CausalInterventionEligibility => {
                const reasons: string[] = [];
                if (!options.worldWillEnabled) reasons.push("World Will execution is disabled");
                if (options.cutAnchorIds.includes(intervention.anchorId)) reasons.push(`anchor '${intervention.anchorId}' is cut`);
                if (worldPhase(base.mutable.states.get(intervention.targetWorldId)) !== "active") {
                    reasons.push(`target world '${intervention.targetWorldId}' is inactive`);
                }
                const identity = identityByAnchor.get(intervention.anchorId);
                if (identity?.admissible !== true) reasons.push(...(identity?.reasons ?? ["anchor identity is unavailable"]));
                return {
                    interventionId: intervention.id,
                    anchorId: intervention.anchorId,
                    ...(autonomousBases.length > 1 ? { baselineContinuationId: base.continuation.id } : {}),
                    status: reasons.length === 0 ? "eligible" : "blocked",
                    reasons,
                };
            })
            .sort((left, right) => left.interventionId.localeCompare(right.interventionId));
        eligibility.push(...baseEligibility);
        eligibleByBaseline.set(
            base.continuation.id,
            program.world.worldWill.interventions
                .filter((intervention) => baseEligibility.some((entry) => (
                    entry.interventionId === intervention.id && entry.status === "eligible"
                )))
                .sort((left, right) => left.id.localeCompare(right.id)),
        );
    }
    const totalCombinations = autonomousBases.reduce(
        (total, base) => total + combinationCardinality(eligibleByBaseline.get(base.continuation.id)?.length ?? 0),
        0n,
    );
    exhaustiveInterventionSearch = totalCombinations <= BigInt(options.maxInterventionCombinations);
    const candidateAssessments: CausalCandidateAssessment[] = [];
    const candidateRealizations = new Map<string, Array<{ mutable: MutableRealization; objective: ObjectiveScore }>>();
    const unresolvedAlternativeIds: string[] = [];
    for (const base of autonomousBases) {
        const eligibleInterventions = eligibleByBaseline.get(base.continuation.id) ?? [];
        const remainingCombinationBudget = Math.max(
            options.maxInterventionCombinations - interventionCombinationCount,
            0,
        );
        for (const combination of boundedCombinations(eligibleInterventions, remainingCombinationBudget)) {
            interventionCombinationCount += 1;
            const interventionIds = combination.map((entry) => entry.id).sort();
            const baseDiscriminator = autonomousBases.length > 1
                ? `${base.continuation.id.slice("continuation:autonomous:".length)}:`
                : "";
            const id = `candidate:${baseDiscriminator}${interventionIds.join("+")}`;
            const baselineReference = autonomousBases.length > 1
                ? { baselineContinuationId: base.continuation.id }
                : {};
            if (effectSetsConflict(combination.map((entry) => ({ worldId: entry.targetWorldId, effects: entry.effects })))) {
                candidateAssessments.push({
                    id,
                    interventionIds,
                    ...baselineReference,
                    status: "undetermined",
                    reasons: ["simultaneous interventions have non-commuting set effects"],
                });
                unresolvedAlternativeIds.push(id);
                continue;
            }
            const mutable = cloneRealization(base.mutable);
            const interventionError = applyInterventions(program, mutable, combination);
            if (interventionError) {
                candidateAssessments.push({
                    id,
                    interventionIds,
                    ...baselineReference,
                    status: "inadmissible",
                    reasons: [interventionError],
                });
                continue;
            }
            const candidateClosure = closeInternalLaws(program, mutable, options, `${id}:`);
            formalEvidence.push(...candidateClosure.formalEvidence);
            formalSteps += candidateClosure.formalSteps;
            internalFrontierCount += candidateClosure.frontierCount;
            internalBranchCount += candidateClosure.branchCount;
            exhaustiveInternalBranching = exhaustiveInternalBranching && candidateClosure.exhaustiveBranching;
            if (candidateClosure.status !== "closed") {
                candidateAssessments.push({
                    id,
                    interventionIds,
                    ...baselineReference,
                    status: candidateClosure.status === "undetermined" ? "undetermined" : "inadmissible",
                    reasons: [candidateClosure.reason ?? "candidate internal closure failed"],
                });
                if (candidateClosure.status === "undetermined") unresolvedAlternativeIds.push(id);
                continue;
            }
            const outcomes: Array<{ mutable: MutableRealization; objective: ObjectiveScore; improvement: ExactValue }> = [];
            let groupStatus: "admissible" | "inadmissible" | "undetermined" = "admissible";
            const groupReasons: string[] = [];
            const cost = totalCost(program, interventionIds);
            for (const [outcomeIndex, outcome] of candidateClosure.realizations.entries()) {
                for (const anchor of program.world.anchors) {
                    const predicates = program.execution.anchorIdentity.filter((predicate) => predicate.anchorId === anchor.id);
                    const postIdentity = anchorWorldsAreActive(program, anchor.id, outcome.states)
                        ? evaluateConstraintSet(
                            program,
                            predicates,
                            "anchor-identity",
                            outcome.states,
                            options,
                            `${id}:outcome:${outcomeIndex}:post-anchor:${anchor.id}:`,
                        )
                        : { admissible: true, evidence: [], formalSteps: 0, reasons: [] };
                    formalEvidence.push(...postIdentity.evidence);
                    formalSteps += postIdentity.formalSteps;
                    if (postIdentity.admissible === undefined) groupStatus = "undetermined";
                    else if (!postIdentity.admissible && groupStatus !== "undetermined") groupStatus = "inadmissible";
                    groupReasons.push(...postIdentity.reasons.map((reason) => (
                        `outcome '${outcomeIndex}' post-state anchor '${anchor.id}': ${reason}`
                    )));
                }
                const constraints = evaluateConstraintSet(
                    program,
                    program.execution.hardConstraints,
                    "hard-constraint",
                    outcome.states,
                    options,
                    `${id}:outcome:${outcomeIndex}:`,
                );
                formalEvidence.push(...constraints.evidence);
                formalSteps += constraints.formalSteps;
                if (constraints.admissible === undefined) groupStatus = "undetermined";
                else if (!constraints.admissible && groupStatus !== "undetermined") groupStatus = "inadmissible";
                groupReasons.push(...constraints.reasons.map((reason) => `outcome '${outcomeIndex}': ${reason}`));
                const objective = scoreObjectives(program, outcome.states);
                const objectiveGain = objective ? subtractExactRationals(objective.score, base.objective.score) : undefined;
                const improvement = objectiveGain && cost ? subtractExactRationals(objectiveGain, cost) : undefined;
                if (!objective || !cost || !improvement) {
                    groupStatus = "undetermined";
                    groupReasons.push(`outcome '${outcomeIndex}' score or intervention cost is not an exact rational`);
                } else {
                    outcomes.push({ mutable: outcome, objective, improvement });
                }
            }
            if (groupStatus !== "admissible" || outcomes.length !== candidateClosure.realizations.length || !cost) {
                const status = groupStatus === "undetermined" ? "undetermined" : "inadmissible";
                candidateAssessments.push({
                    id,
                    interventionIds,
                    ...baselineReference,
                    status,
                    reasons: [...new Set(groupReasons)].sort(),
                });
                if (status === "undetermined") unresolvedAlternativeIds.push(id);
                continue;
            }
            const guaranteedImprovement = minimumExactRational(outcomes.map((outcome) => outcome.improvement));
            const guaranteedScore = minimumExactRational(outcomes.map((outcome) => outcome.objective.score));
            if (!guaranteedImprovement || !guaranteedScore) {
                candidateAssessments.push({
                    id,
                    interventionIds,
                    ...baselineReference,
                    status: "undetermined",
                    reasons: ["plural candidate outcomes could not be ordered exactly"],
                });
                unresolvedAlternativeIds.push(id);
                continue;
            }
            const improved = compareExactRationals(guaranteedImprovement, exact.integer(0)) === 1;
            candidateAssessments.push({
                id,
                interventionIds,
                ...baselineReference,
                status: improved ? "improved" : "rejected",
                score: guaranteedScore,
                cost,
                improvement: guaranteedImprovement,
                ...(outcomes.length === 1
                    ? { objectiveContributions: outcomes[0]!.objective.contributions }
                    : {
                        outcomes: outcomes.map((outcome) => ({
                            id: `outcome:${id}${branchContinuationSuffix(outcome.mutable)}`,
                            score: outcome.objective.score,
                            improvement: outcome.improvement,
                            objectiveContributions: outcome.objective.contributions,
                            branchLineage: cloneValue(outcome.mutable.branchLineage),
                        })),
                    }),
                reasons: improved
                    ? []
                    : ["guaranteed net exact objective improvement across every endogenous outcome is not positive"],
            });
            candidateRealizations.set(id, outcomes.map((outcome) => ({
                mutable: outcome.mutable,
                objective: outcome.objective,
            })));
        }
    }
    if (!exhaustiveInterventionSearch) unresolvedAlternativeIds.push("intervention-search:not-exhaustive");

    const baseExtra: Partial<AnchoredCausalRun> = {
        initialWorldStates,
        ...(singularAutonomous
            ? { autonomousContinuation: singularAutonomous.continuation }
            : { autonomousContinuations }),
        interventionEligibility: eligibility,
        ...(singularAutonomous
            ? { baselineScore: singularAutonomous.objective.score }
            : { baselineScores }),
        candidateAssessments,
    };
    if (unresolvedAlternativeIds.length > 0) {
        return emptyRun("underdetermined", "one or more intervention alternatives remain unresolved", {
            ...baseExtra,
            continuations: autonomousContinuations,
            unresolvedAlternativeIds: [...new Set(unresolvedAlternativeIds)].sort(),
        });
    }
    const selectedContinuations: CausalContinuation[] = [];
    const selectedAutonomousIds: string[] = [];
    let selectedInterventionGroupCount = 0;
    for (const base of autonomousBases) {
        const improved = candidateAssessments.filter((candidate) => (
            candidate.status === "improved"
            && candidate.improvement
            && (autonomousBases.length === 1 || candidate.baselineContinuationId === base.continuation.id)
        ));
        if (improved.length === 0) {
            selectedAutonomousIds.push(base.continuation.id);
            continue;
        }
        let best = improved[0]!;
        for (const candidate of improved.slice(1)) {
            if (compareExactRationals(candidate.improvement!, best.improvement!) === 1) best = candidate;
        }
        const tied = improved.filter((candidate) => compareExactRationals(candidate.improvement!, best.improvement!) === 0);
        if (tied.length > 1 && program.execution.decisionMode === "deterministic") {
            return emptyRun("underdetermined", "equally optimal intervention groups have no intrinsic deterministic selector", {
                ...baseExtra,
                continuations: autonomousContinuations,
                unresolvedAlternativeIds: tied.map((candidate) => candidate.id).sort(),
            });
        }
        const selectedGroups = program.execution.decisionMode === "plural" ? tied : [best];
        selectedInterventionGroupCount += selectedGroups.length;
        for (const candidate of selectedGroups) {
            for (const realization of candidateRealizations.get(candidate.id) ?? []) {
                const built = continuationFromRealization(
                    program,
                    realization.mutable,
                    initialWorldStates,
                    `continuation:${candidate.interventionIds.join("+")}${branchContinuationSuffix(realization.mutable)}`,
                    "selected",
                    candidate.interventionIds,
                    realization.objective.score,
                    options,
                );
                selectedContinuations.push(built.continuation);
                formalEvidence.push(...built.emergence.evidence);
                formalSteps += built.emergence.formalSteps;
            }
        }
    }
    const selectedIds = [
        ...selectedAutonomousIds,
        ...selectedContinuations.map((continuation) => continuation.id),
    ];
    if (selectedIds.length > 1) {
        selectedContinuations.forEach((continuation) => {
            continuation.selection = "selected-plural";
        });
        autonomousContinuations
            .filter((continuation) => selectedAutonomousIds.includes(continuation.id))
            .forEach((continuation) => {
                continuation.selection = "autonomous-plural";
            });
    }
    const noEligible = program.world.worldWill.interventions.length > 0
        && options.worldWillEnabled
        && autonomousBases.every((base) => (eligibleByBaseline.get(base.continuation.id)?.length ?? 0) === 0);
    const status: AnchoredCausalRun["status"] = noEligible
        ? "blocked"
        : selectedIds.length > 1
            ? "plural"
            : selectedInterventionGroupCount > 0
                ? "realized"
                : "stable";
    const reason = noEligible
        ? "all World Will interventions are blocked on every endogenous continuation"
        : selectedIds.length > 1
            ? "endogenous branches and any selected World Will intervention groups preserve every lawful continuation"
            : selectedInterventionGroupCount > 0
                ? "World Will selected an exact admissible intervention group"
                : "autonomous closure is not improved by any admissible intervention";
    return emptyRun(status, reason, {
        ...baseExtra,
        continuations: [...autonomousContinuations, ...selectedContinuations],
        selectedContinuationIds: selectedIds,
    });
}

export function inspectAnchoredCausalRun(run: AnchoredCausalRun): AnchoredCausalInspection {
    const selected = new Set(run.selectedContinuationIds);
    const selectedContinuations = run.continuations.filter((continuation) => selected.has(continuation.id));
    const relevantContinuations = selectedContinuations.length > 0 ? selectedContinuations : run.continuations;
    const lifecycleAware = run.initialWorldStates.some((state) => state.lifecycle)
        || relevantContinuations.some((continuation) => (continuation.lifecycleEvents?.length ?? 0) > 0);
    const singularLifecycleStates = lifecycleAware && relevantContinuations.length === 1
        ? relevantContinuations[0]!.worldStates
        : undefined;
    return {
        mode: "bubble-anchored-causal-inspection.v2",
        summary: {
            status: run.status,
            worldCount: run.initialWorldStates.length,
            ...(singularLifecycleStates ? {
                activeWorldCount: singularLifecycleStates.filter((state) => worldPhase(state) === "active").length,
                latentWorldCount: singularLifecycleStates.filter((state) => worldPhase(state) === "latent").length,
                retiredWorldCount: singularLifecycleStates.filter((state) => worldPhase(state) === "retired").length,
                spawnedWorldCount: relevantContinuations[0]!.lifecycleEvents
                    ?.filter((event) => event.kind === "world-spawn").length ?? 0,
                retirementCount: relevantContinuations[0]!.lifecycleEvents
                    ?.filter((event) => event.kind === "world-retirement").length ?? 0,
            } : {}),
            ...(relevantContinuations.length === 1 ? {
                admittedAnchorTransferCount: relevantContinuations[0]!.anchorTransferAssessments
                    ?.filter((assessment) => assessment.status === "admitted").length ?? 0,
                blockedAnchorTransferCount: relevantContinuations[0]!.anchorTransferAssessments
                    ?.filter((assessment) => assessment.status === "blocked").length ?? 0,
            } : {}),
            continuationCount: run.continuations.length,
            selectedContinuationCount: run.selectedContinuationIds.length,
            unresolvedAlternativeCount: run.unresolvedAlternativeIds.length,
            emergedStructureCount: relevantContinuations.flatMap((continuation) => continuation.emergenceAssessments)
                .filter((assessment) => assessment.status === "emerged").length,
            dissolvedStructureCount: relevantContinuations.flatMap((continuation) => continuation.emergenceAssessments)
                .filter((assessment) => assessment.status === "dissolved").length,
            createsHistoryArrow: relevantContinuations.some((continuation) => continuation.order.createsHistoryArrow),
            exhaustiveInterventionSearch: run.resourceUse.exhaustiveInterventionSearch,
            exhaustiveInternalBranching: run.resourceUse.exhaustiveInternalBranching,
        },
        decision: {
            ...(run.baselineScore ? { baselineScore: run.baselineScore } : {}),
            ...(run.baselineScores ? { baselineScores: cloneValue(run.baselineScores) } : {}),
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
    const lifecycleAware = record.recordedRun.initialWorldStates.some((state) => state.lifecycle)
        || record.recordedRun.continuations.some((continuation) => (continuation.lifecycleEvents?.length ?? 0) > 0);
    const recordedLifecycle = record.recordedRun.continuations.map((continuation) => ({
        id: continuation.id,
        states: continuation.worldStates.map((state) => ({ worldId: state.worldId, lifecycle: state.lifecycle })),
        events: continuation.lifecycleEvents ?? [],
    }));
    const replayedLifecycle = replayedRun.continuations.map((continuation) => ({
        id: continuation.id,
        states: continuation.worldStates.map((state) => ({ worldId: state.worldId, lifecycle: state.lifecycle })),
        events: continuation.lifecycleEvents ?? [],
    }));
    const transferAware = record.recordedRun.continuations.some((continuation) => (
        (continuation.anchorTransferEvents?.length ?? 0) > 0
        || (continuation.anchorTransferAssessments?.length ?? 0) > 0
    ));
    const recordedTransfers = record.recordedRun.continuations.map((continuation) => ({
        id: continuation.id,
        events: continuation.anchorTransferEvents ?? [],
        assessments: continuation.anchorTransferAssessments ?? [],
    }));
    const replayedTransfers = replayedRun.continuations.map((continuation) => ({
        id: continuation.id,
        events: continuation.anchorTransferEvents ?? [],
        assessments: continuation.anchorTransferAssessments ?? [],
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
        ...(lifecycleAware ? { lifecyclePreserved: stableStringify(recordedLifecycle) === stableStringify(replayedLifecycle) } : {}),
        ...(transferAware ? { anchorTransfersPreserved: stableStringify(recordedTransfers) === stableStringify(replayedTransfers) } : {}),
        replayedRun,
    };
}
