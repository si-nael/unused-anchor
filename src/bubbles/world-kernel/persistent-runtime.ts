import { createHash } from "node:crypto";
import {
    compareExactRationals,
    exactValuesEqual,
    normalizeExactValue,
    type ExactValue,
} from "./intensional";
import {
    realizeAnchoredCausalWorld,
    type AnchoredCausalRun,
    type CausalContinuation,
    type CausalExecutionOptions,
    type CausalHistoryCommit,
    type CausalTraceEntry,
    type CausalWorldState,
} from "./causal-runtime";
import {
    deriveCausalComponents,
    validatePersistentCausalProgram,
    type CausalInfluenceEdge,
    type CausalLawDependency,
    type DerivedCausalComponent,
    type PersistentCausalProgram,
} from "./persistent";
import type { CausalDiagnostic, CausalFieldRole, CausalInternalLaw } from "./causal";

export interface PersistentCausalExecutionOptions {
    maxClosures?: number;
    maxPaths?: number;
    causalOptions?: CausalExecutionOptions;
}

export interface PersistentCausalClosure {
    id: string;
    cause: "initial-configuration" | "configuration-continuation";
    causedByClosureId?: string;
    inputConfigurationDigest: string;
    outputConfigurationDigest: string;
    inputWorldStates: CausalWorldState[];
    outputWorldStates: CausalWorldState[];
    historyExtension: CausalHistoryCommit[];
    historyExtensionDigest: string;
    selectedContinuationId: string;
    run: AnchoredCausalRun;
}

export interface PersistentHistoryLedgerEntry extends CausalHistoryCommit {
    closureId: string;
    ordinalWithinClosure: number;
}

export interface PersistentCausalPath {
    id: string;
    status: "cycle" | "non-executable" | "budget-exhausted" | "contradicted";
    reason: string;
    closures: PersistentCausalClosure[];
    configurationDigests: string[];
    anchoredHistory: {
        mode: "monotone-causal-commit-ledger";
        entries: PersistentHistoryLedgerEntry[];
        digest: string;
    };
    cycle?: {
        scope: "causal-configuration";
        startConfigurationIndex: number;
        periodClosures: number;
        repeatedConfigurationDigest: string;
        anchoredHistory: {
            mode: "monotone-extension";
            entryCountAtCycleStart: number;
            entryCountAtRecurrence: number;
            extensionCount: number;
            fullAnchoredStateRepeated: boolean;
        };
    };
}

export interface CounterfactualContinuationDifference {
    continuationId: string;
    changedFieldKeys: string[];
    externallyChangedFieldKeys: string[];
    changedTraceLawIds: string[];
    historyChanged: boolean;
    effective: boolean;
}

export interface MemoryCounterfactualEvidence {
    fieldKey: string;
    status: "causally-effective" | "not-effective" | "mixed" | "undetermined";
    rememberedValue: ExactValue;
    erasedToValue: ExactValue;
    changedFieldKeys: string[];
    externallyChangedFieldKeys: string[];
    continuationEvidence: CounterfactualContinuationDifference[];
    counterfactualRunStatus: AnchoredCausalRun["status"];
}

export interface SelfMaintenanceEvidence {
    witnessed: boolean;
    closureId?: string;
    disturbedFieldKey?: string;
    negativeSeaFieldKey?: string;
    negativeSeaEventId?: string;
    disturbanceEventId?: string;
    restorationEventId?: string;
    referenceValue?: ExactValue;
    disturbedValue?: ExactValue;
    restoredValue?: ExactValue;
}

export interface PersistentStructureAssessment {
    pathId: string;
    componentId: string;
    worldId: string;
    memberFieldKeys: string[];
    status: "persistent" | "non-persistent" | "undetermined";
    boundary: {
        derivedFromCausalCut: boolean;
        status: "causally-mediated" | "not-mediated" | "mixed" | "undetermined";
        boundaryFieldKeys: string[];
        incomingEdges: CausalInfluenceEdge[];
        outgoingEdges: CausalInfluenceEdge[];
        incomingDependencies: CausalLawDependency[];
        outgoingDependencies: CausalLawDependency[];
        mediatedIncomingLawIds: string[];
        mediatedOutgoingLawIds: string[];
        cutAblation: {
            ablatedBoundaryFieldKeys: string[];
            testedCrossingLawIds: string[];
            suppressedRecoveryLawIds: string[];
            continuationEvidence: CounterfactualContinuationDifference[];
            counterfactualRunStatus: AnchoredCausalRun["status"] | "not-run";
        };
    };
    identity: {
        recurrentState: boolean;
        identityFieldKeys: string[];
        invariantAcrossCycleCuts: boolean;
    };
    memory: MemoryCounterfactualEvidence[];
    selfMaintenance: SelfMaintenanceEvidence;
    causalInfluence: {
        realizedOutgoingLawIds: string[];
        externallyChangedFieldKeys: string[];
        universalAcrossCounterfactualContinuations: boolean;
        effective: boolean;
    };
    reasons: string[];
}

export interface PersistentCausalRun {
    mode: "bubble-persistent-causal-run.v1";
    programDigest: string;
    status: "persistent" | "non-persistent" | "undetermined" | "contradicted";
    reason: string;
    options: {
        maxClosures: number;
        maxPaths: number;
        causalOptions: CausalExecutionOptions;
    };
    diagnostics: CausalDiagnostic[];
    order: {
        kind: "causal-closure-coalgebra";
        universalClock: false;
        closureEdges: Array<{ cause: string; effect: string; configurationDigest: string }>;
    };
    components: DerivedCausalComponent[];
    candidateComponentIds: string[];
    paths: PersistentCausalPath[];
    assessments: PersistentStructureAssessment[];
    resourceUse: {
        closureExecutions: number;
        pathCount: number;
        closureLimit: number;
        pathLimit: number;
        exhaustive: boolean;
    };
}

export interface PersistentCausalInspection {
    mode: "bubble-persistent-causal-inspection.v1";
    summary: {
        status: PersistentCausalRun["status"];
        candidateComponentCount: number;
        persistentAssessmentCount: number;
        cyclicPathCount: number;
        unresolvedPathCount: number;
        universalClock: false;
        exhaustive: boolean;
    };
    components: DerivedCausalComponent[];
    paths: PersistentCausalPath[];
    assessments: PersistentStructureAssessment[];
}

export interface PersistentCausalReplayRecord {
    mode: "bubble-persistent-causal-replay.v1";
    program: PersistentCausalProgram;
    options: PersistentCausalExecutionOptions;
    recordedRun: PersistentCausalRun;
    recordedDigest: string;
}

export interface PersistentCausalReplayResult {
    mode: "bubble-persistent-causal-replay-result.v1";
    status: "same-world-reexecution" | "reexecution-drift";
    recordedDigest: string;
    recordedRunDigest: string;
    replayedDigest: string;
    recordIntegrityValid: boolean;
    recordedProgramDigestValid: boolean;
    fullRunPreserved: boolean;
    pathCyclesPreserved: boolean;
    persistenceEvidencePreserved: boolean;
    replayedRun: PersistentCausalRun;
}

interface MutablePath {
    id: string;
    closures: PersistentCausalClosure[];
    configurationDigests: string[];
    historyEntries: PersistentHistoryLedgerEntry[];
    historyEntryCounts: number[];
    nextOverrides?: Record<string, ExactValue>;
}

const REQUIRED_ROLES: CausalFieldRole[] = ["structural-state", "identity-state", "memory-state", "boundary-state"];

function stableValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stableValue);
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, entry]) => [key, stableValue(entry)]));
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
    return structuredClone(value);
}

function anchoredHistory(entries: PersistentHistoryLedgerEntry[]): PersistentCausalPath["anchoredHistory"] {
    return {
        mode: "monotone-causal-commit-ledger",
        entries: cloneValue(entries),
        digest: digest(entries),
    };
}

function fieldKey(worldId: string, fieldId: string): string {
    return `${worldId}.${fieldId}`;
}

function stateField(states: CausalWorldState[], key: string): ExactValue | undefined {
    const dot = key.indexOf(".");
    if (dot < 1) return undefined;
    return states.find((state) => state.worldId === key.slice(0, dot))?.fields[key.slice(dot + 1)];
}

function statesToOverrides(program: PersistentCausalProgram, states: CausalWorldState[]): Record<string, ExactValue> {
    const overrides: Record<string, ExactValue> = {};
    for (const state of states) {
        const world = program.causalProgram.world.worlds.find((candidate) => candidate.id === state.worldId);
        if (!world) continue;
        for (const [fieldId, value] of Object.entries(state.fields)) {
            overrides[fieldKey(state.worldId, fieldId)] = fieldId === world.seaCoupling.viabilityFieldId
                ? cloneValue(state.intrinsicViability)
                : cloneValue(value);
        }
    }
    return overrides;
}

function selectedContinuations(run: AnchoredCausalRun): CausalContinuation[] {
    const selected = new Set(run.selectedContinuationIds);
    return run.continuations.filter((continuation) => selected.has(continuation.id));
}

function changedFieldKeys(left: CausalWorldState[], right: CausalWorldState[]): string[] {
    const keys = new Set<string>();
    for (const state of [...left, ...right]) {
        for (const fieldId of Object.keys(state.fields)) keys.add(fieldKey(state.worldId, fieldId));
    }
    return [...keys].filter((key) => {
        const leftValue = stateField(left, key);
        const rightValue = stateField(right, key);
        return !leftValue || !rightValue || !exactValuesEqual(leftValue, rightValue);
    }).sort();
}

function symmetricDifference(left: string[], right: string[]): string[] {
    const leftSet = new Set(left);
    const rightSet = new Set(right);
    return [...new Set([...left, ...right])].filter((value) => leftSet.has(value) !== rightSet.has(value)).sort();
}

function traceLawIds(continuation: CausalContinuation): string[] {
    return [...new Set(continuation.trace
        .filter((entry) => entry.kind === "internal-law" && entry.lawId)
        .map((entry) => entry.lawId!))].sort();
}

function continuationDifference(
    baseline: CausalContinuation,
    counterfactual: CausalContinuation,
    memberSet: Set<string>,
): CounterfactualContinuationDifference {
    const changed = changedFieldKeys(baseline.worldStates, counterfactual.worldStates);
    const changedTraceLawIds = symmetricDifference(traceLawIds(baseline), traceLawIds(counterfactual));
    const historyChanged = stableStringify(baseline.historyCommits) !== stableStringify(counterfactual.historyCommits);
    return {
        continuationId: counterfactual.id,
        changedFieldKeys: changed,
        externallyChangedFieldKeys: changed.filter((key) => !memberSet.has(key)),
        changedTraceLawIds,
        historyChanged,
        effective: changed.length > 0 || changedTraceLawIds.length > 0 || historyChanged,
    };
}

export function quantifyCounterfactualContinuations(
    evidence: CounterfactualContinuationDifference[],
): "causally-effective" | "not-effective" | "mixed" {
    const effectiveCount = evidence.filter((entry) => entry.effective).length;
    if (effectiveCount === evidence.length) return "causally-effective";
    if (effectiveCount === 0) return "not-effective";
    return "mixed";
}

function candidateComponents(components: DerivedCausalComponent[]): DerivedCausalComponent[] {
    return components.filter((component) => component.recurrent
        && component.worldIds.length === 1
        && REQUIRED_ROLES.every((role) => component.fieldRoles.some((field) => field.role === role)));
}

function cycleStates(path: PersistentCausalPath): CausalWorldState[][] {
    if (!path.cycle || path.closures.length === 0) return [];
    const states = [path.closures[0]!.inputWorldStates, ...path.closures.map((closure) => closure.outputWorldStates)];
    return states.slice(path.cycle.startConfigurationIndex, states.length);
}

function identityEvidence(path: PersistentCausalPath, component: DerivedCausalComponent): PersistentStructureAssessment["identity"] {
    const identityFieldKeys = component.fieldRoles.filter((field) => field.role === "identity-state")
        .map((field) => fieldKey(field.worldId, field.fieldId)).sort();
    const states = cycleStates(path);
    const invariantAcrossCycleCuts = states.length > 1 && identityFieldKeys.every((key) => {
        const first = stateField(states[0]!, key);
        return Boolean(first) && states.slice(1).every((state) => {
            const value = stateField(state, key);
            return Boolean(value && exactValuesEqual(first!, value));
        });
    });
    return {
        recurrentState: Boolean(path.cycle),
        identityFieldKeys,
        invariantAcrossCycleCuts,
    };
}

function memoryEvidence(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions,
    path: PersistentCausalPath,
    component: DerivedCausalComponent,
): MemoryCounterfactualEvidence[] {
    const first = path.closures[0];
    const last = path.closures.at(-1);
    if (!first || !last) return [];
    const memberSet = new Set(component.memberFieldKeys);
    return component.fieldRoles.filter((field) => field.role === "memory-state").map((field) => {
        const key = fieldKey(field.worldId, field.fieldId);
        const rememberedValue = stateField(last.inputWorldStates, key);
        const erasedToValue = stateField(first.inputWorldStates, key);
        if (!rememberedValue || !erasedToValue || exactValuesEqual(rememberedValue, erasedToValue)) {
            return {
                fieldKey: key,
                status: "not-effective" as const,
                rememberedValue: cloneValue(rememberedValue ?? erasedToValue!),
                erasedToValue: cloneValue(erasedToValue ?? rememberedValue!),
                changedFieldKeys: [],
                externallyChangedFieldKeys: [],
                continuationEvidence: [],
                counterfactualRunStatus: "stable" as const,
            };
        }
        const counterfactual = realizeAnchoredCausalWorld(program.causalProgram, {
            ...options.causalOptions,
            fieldOverrides: {
                ...statesToOverrides(program, last.inputWorldStates),
                [key]: cloneValue(erasedToValue),
            },
        });
        const continuations = selectedContinuations(counterfactual);
        if (continuations.length === 0 || ["underdetermined", "contradicted"].includes(counterfactual.status)) {
            return {
                fieldKey: key,
                status: "undetermined" as const,
                rememberedValue: cloneValue(rememberedValue),
                erasedToValue: cloneValue(erasedToValue),
                changedFieldKeys: [],
                externallyChangedFieldKeys: [],
                continuationEvidence: [],
                counterfactualRunStatus: counterfactual.status,
            };
        }
        const factual = last.run.continuations.find((continuation) => continuation.id === last.selectedContinuationId);
        if (!factual) {
            return {
                fieldKey: key,
                status: "undetermined" as const,
                rememberedValue: cloneValue(rememberedValue),
                erasedToValue: cloneValue(erasedToValue),
                changedFieldKeys: [],
                externallyChangedFieldKeys: [],
                continuationEvidence: [],
                counterfactualRunStatus: counterfactual.status,
            };
        }
        const continuationEvidence = continuations.map((continuation) => (
            continuationDifference(factual, continuation, memberSet)
        ));
        const differences = [...new Set(continuationEvidence.flatMap((entry) => entry.changedFieldKeys))].sort();
        const externalDifferences = [...new Set(continuationEvidence
            .flatMap((entry) => entry.externallyChangedFieldKeys))].sort();
        return {
            fieldKey: key,
            status: quantifyCounterfactualContinuations(continuationEvidence),
            rememberedValue: cloneValue(rememberedValue),
            erasedToValue: cloneValue(erasedToValue),
            changedFieldKeys: differences,
            externallyChangedFieldKeys: externalDifferences,
            continuationEvidence,
            counterfactualRunStatus: counterfactual.status,
        };
    });
}

function lawUsesRoles(program: PersistentCausalProgram, law: CausalInternalLaw, component: DerivedCausalComponent): boolean {
    const memberSet = new Set(component.memberFieldKeys);
    const roleByKey = new Map(component.fieldRoles.map((field) => [fieldKey(field.worldId, field.fieldId), field.role]));
    const roles = new Set(law.guard.fieldParameters
        .map((binding) => fieldKey(binding.worldId, binding.fieldId))
        .filter((key) => memberSet.has(key))
        .map((key) => roleByKey.get(key)));
    return roles.has("memory-state") && roles.has("boundary-state");
}

function negativeIncrease(entry: CausalTraceEntry, negativeFieldIds: Set<string>): string | undefined {
    for (const effect of entry.effects) {
        if (!negativeFieldIds.has(effect.fieldId) || !effect.before) continue;
        const before = normalizeExactValue(effect.before);
        const after = normalizeExactValue(effect.after);
        if (before?.kind === "rational" && after?.kind === "rational" && compareExactRationals(after, before) === 1) {
            return effect.fieldId;
        }
    }
    return undefined;
}

function selfMaintenanceEvidence(
    program: PersistentCausalProgram,
    path: PersistentCausalPath,
    component: DerivedCausalComponent,
): SelfMaintenanceEvidence {
    const memberSet = new Set(component.memberFieldKeys);
    const structuralKeys = new Set(component.fieldRoles
        .filter((field) => field.role === "structural-state")
        .map((field) => fieldKey(field.worldId, field.fieldId)));
    const world = program.causalProgram.world.worlds.find((candidate) => candidate.id === component.worldIds[0]);
    if (!world) return { witnessed: false };
    const referenceState = cycleStates(path)[0];
    if (!referenceState) return { witnessed: false };
    const negativeFieldIds = new Set(world.fields.filter((field) => field.role === "negative-sea").map((field) => field.id));
    for (const closure of path.closures) {
        const continuation = closure.run.continuations.find((candidate) => candidate.id === closure.selectedContinuationId);
        if (!continuation) continue;
        for (let index = 0; index < continuation.trace.length; index += 1) {
            const seaEntry = continuation.trace[index]!;
            if (seaEntry.kind !== "internal-law" || !seaEntry.eventId) continue;
            const negativeFieldId = negativeIncrease(seaEntry, negativeFieldIds);
            if (!negativeFieldId) continue;
            for (let disturbanceIndex = index + 1; disturbanceIndex < continuation.trace.length; disturbanceIndex += 1) {
                const disturbance = continuation.trace[disturbanceIndex]!;
                if (disturbance.kind !== "internal-law" || !disturbance.eventId
                    || !disturbance.causes.includes(seaEntry.eventId)) continue;
                const disturbedEffect = disturbance.effects.find((effect) => (
                    structuralKeys.has(fieldKey(world.id, effect.fieldId))
                    && effect.before
                    && !exactValuesEqual(effect.before, effect.after)
                ));
                if (!disturbedEffect) continue;
                const disturbedKey = fieldKey(world.id, disturbedEffect.fieldId);
                if (!memberSet.has(disturbedKey)) continue;
                const referenceValue = stateField(referenceState, disturbedKey);
                if (!referenceValue || !disturbedEffect.before
                    || !exactValuesEqual(disturbedEffect.before, referenceValue)
                    || exactValuesEqual(disturbedEffect.after, referenceValue)) continue;
                for (const restoration of continuation.trace.slice(disturbanceIndex + 1)) {
                    if (restoration.kind !== "internal-law" || !restoration.eventId || !restoration.lawId) continue;
                    const restored = restoration.effects.find((effect) => effect.fieldId === disturbedEffect.fieldId
                        && effect.before && exactValuesEqual(effect.after, referenceValue));
                    const law = program.causalProgram.world.internalLaws.find((candidate) => candidate.id === restoration.lawId);
                    if (!restored || !law || !lawUsesRoles(program, law, component)) continue;
                    if (!restoration.causes.includes(disturbance.eventId)) continue;
                    return {
                        witnessed: true,
                        closureId: closure.id,
                        disturbedFieldKey: disturbedKey,
                        negativeSeaFieldKey: fieldKey(world.id, negativeFieldId),
                        negativeSeaEventId: seaEntry.eventId,
                        disturbanceEventId: disturbance.eventId,
                        restorationEventId: restoration.eventId,
                        referenceValue: cloneValue(referenceValue),
                        disturbedValue: cloneValue(disturbedEffect.after),
                        restoredValue: cloneValue(restored.after),
                    };
                }
            }
        }
    }
    return { witnessed: false };
}

function realizedOutgoingLaws(path: PersistentCausalPath, component: DerivedCausalComponent): string[] {
    const outgoing = new Set(component.outgoingEdges.map((edge) => edge.lawId));
    return [...new Set(path.closures.flatMap((closure) => {
        const continuation = closure.run.continuations.find((candidate) => candidate.id === closure.selectedContinuationId);
        return continuation?.trace.filter((entry) => entry.kind === "internal-law" && entry.lawId && outgoing.has(entry.lawId))
            .map((entry) => entry.lawId!) ?? [];
    }))].sort();
}

function boundaryEvidence(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions,
    path: PersistentCausalPath,
    component: DerivedCausalComponent,
): PersistentStructureAssessment["boundary"] {
    const boundaryFieldKeys = component.fieldRoles.filter((field) => field.role === "boundary-state")
        .map((field) => fieldKey(field.worldId, field.fieldId)).sort();
    const boundarySet = new Set(boundaryFieldKeys);
    const mediatedIncomingLawIds = component.incomingDependencies
        .filter((dependency) => dependency.guardFieldKeys.some((key) => boundarySet.has(key)))
        .map((dependency) => dependency.lawId).sort();
    const mediatedOutgoingLawIds = component.outgoingDependencies
        .filter((dependency) => dependency.guardFieldKeys.some((key) => boundarySet.has(key)))
        .map((dependency) => dependency.lawId).sort();
    const structuralMediation = boundaryFieldKeys.length > 0
        && component.incomingDependencies.length > 0
        && component.outgoingDependencies.length > 0
        && mediatedIncomingLawIds.length === component.incomingDependencies.length
        && mediatedOutgoingLawIds.length === component.outgoingDependencies.length;
    const testedCrossingLawIds = [...new Set([...mediatedIncomingLawIds, ...mediatedOutgoingLawIds])].sort();
    const base = {
        boundaryFieldKeys,
        incomingEdges: cloneValue(component.incomingEdges),
        outgoingEdges: cloneValue(component.outgoingEdges),
        incomingDependencies: cloneValue(component.incomingDependencies),
        outgoingDependencies: cloneValue(component.outgoingDependencies),
        mediatedIncomingLawIds,
        mediatedOutgoingLawIds,
    };
    if (!structuralMediation) {
        return {
            ...base,
            derivedFromCausalCut: false,
            status: "not-mediated",
            cutAblation: {
                ablatedBoundaryFieldKeys: boundaryFieldKeys,
                testedCrossingLawIds,
                suppressedRecoveryLawIds: [],
                continuationEvidence: [],
                counterfactualRunStatus: "not-run",
            },
        };
    }
    const first = path.closures[0];
    const last = path.closures.at(-1);
    const factual = last?.run.continuations.find((continuation) => continuation.id === last.selectedContinuationId);
    if (!first || !last || !factual) {
        return {
            ...base,
            derivedFromCausalCut: false,
            status: "undetermined",
            cutAblation: {
                ablatedBoundaryFieldKeys: boundaryFieldKeys,
                testedCrossingLawIds,
                suppressedRecoveryLawIds: [],
                continuationEvidence: [],
                counterfactualRunStatus: "not-run",
            },
        };
    }
    const boundaryOverrides = Object.fromEntries(boundaryFieldKeys.map((key) => [key, stateField(first.inputWorldStates, key)] as const)
        .filter((entry): entry is readonly [string, ExactValue] => entry[1] !== undefined));
    const boundaryChanged = boundaryFieldKeys.some((key) => {
        const beforeFormation = boundaryOverrides[key];
        const retained = stateField(last.inputWorldStates, key);
        return Boolean(beforeFormation && retained && !exactValuesEqual(beforeFormation, retained));
    });
    if (!boundaryChanged) {
        return {
            ...base,
            derivedFromCausalCut: false,
            status: "not-mediated",
            cutAblation: {
                ablatedBoundaryFieldKeys: boundaryFieldKeys,
                testedCrossingLawIds,
                suppressedRecoveryLawIds: [],
                continuationEvidence: [],
                counterfactualRunStatus: "not-run",
            },
        };
    }
    const suppressedRecoveryLawIds = program.causalProgram.world.internalLaws.filter((law) => (
        !testedCrossingLawIds.includes(law.id)
        && law.effects.some((effect) => boundarySet.has(fieldKey(law.worldId, effect.fieldId)))
    )).map((law) => law.id).sort();
    const ablatedProgram = cloneValue(program);
    ablatedProgram.causalProgram.world.internalLaws = ablatedProgram.causalProgram.world.internalLaws
        .filter((law) => !suppressedRecoveryLawIds.includes(law.id));
    const counterfactual = realizeAnchoredCausalWorld(ablatedProgram.causalProgram, {
        ...options.causalOptions,
        fieldOverrides: {
            ...statesToOverrides(program, last.inputWorldStates),
            ...cloneValue(boundaryOverrides),
        },
    });
    const continuations = selectedContinuations(counterfactual);
    if (continuations.length === 0 || ["underdetermined", "contradicted"].includes(counterfactual.status)) {
        return {
            ...base,
            derivedFromCausalCut: false,
            status: "undetermined",
            cutAblation: {
                ablatedBoundaryFieldKeys: boundaryFieldKeys,
                testedCrossingLawIds,
                suppressedRecoveryLawIds,
                continuationEvidence: [],
                counterfactualRunStatus: counterfactual.status,
            },
        };
    }
    const memberSet = new Set(component.memberFieldKeys);
    const continuationEvidence = continuations.map((continuation) => {
        const evidence = continuationDifference(factual, continuation, memberSet);
        return {
            ...evidence,
            effective: testedCrossingLawIds.every((lawId) => evidence.changedTraceLawIds.includes(lawId)),
        };
    });
    const quantified = quantifyCounterfactualContinuations(continuationEvidence);
    const status = quantified === "causally-effective"
        ? "causally-mediated" as const
        : quantified === "not-effective" ? "not-mediated" as const : "mixed" as const;
    return {
        ...base,
        derivedFromCausalCut: status === "causally-mediated",
        status,
        cutAblation: {
            ablatedBoundaryFieldKeys: boundaryFieldKeys,
            testedCrossingLawIds,
            suppressedRecoveryLawIds,
            continuationEvidence,
            counterfactualRunStatus: counterfactual.status,
        },
    };
}

function assessComponent(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions,
    path: PersistentCausalPath,
    component: DerivedCausalComponent,
): PersistentStructureAssessment {
    const boundary = boundaryEvidence(program, options, path, component);
    const identity = identityEvidence(path, component);
    const memory = memoryEvidence(program, options, path, component);
    const selfMaintenance = selfMaintenanceEvidence(program, path, component);
    const realizedOutgoingLawIds = realizedOutgoingLaws(path, component);
    const externallyChangedFieldKeys = [...new Set(memory.flatMap((entry) => entry.externallyChangedFieldKeys))].sort();
    const universalAcrossCounterfactualContinuations = memory.some((entry) => (
        entry.status === "causally-effective"
        && entry.continuationEvidence.length > 0
        && entry.continuationEvidence.every((continuation) => continuation.externallyChangedFieldKeys.length > 0)
    ));
    const causalInfluence = {
        realizedOutgoingLawIds,
        externallyChangedFieldKeys,
        universalAcrossCounterfactualContinuations,
        effective: realizedOutgoingLawIds.length > 0 && universalAcrossCounterfactualContinuations,
    };
    const reasons: string[] = [];
    if (boundary.status === "undetermined" || boundary.status === "mixed") {
        reasons.push("boundary mediation remains unresolved across lawful cut-ablation continuations");
    } else if (!boundary.derivedFromCausalCut) {
        reasons.push("component lacks a fully boundary-mediated two-sided causal hypercut with effective cut ablation");
    }
    if (!identity.recurrentState || !identity.invariantAcrossCycleCuts) reasons.push("identity is not invariant across a certified recurrent closure cycle");
    if (memory.some((entry) => entry.status === "undetermined" || entry.status === "mixed")) reasons.push("a memory erasure counterfactual is unresolved across lawful continuations");
    else if (!memory.some((entry) => entry.status === "causally-effective")) reasons.push("no retained memory field changes the next lawful closure under erasure");
    if (!selfMaintenance.witnessed) reasons.push("no recurrent-reference restoration follows a negative-sea-caused structural deviation through boundary-and-memory-dependent law");
    if (!causalInfluence.effective) reasons.push("the component has no realized and counterfactually discriminated outward causal influence");
    const status = boundary.status === "undetermined" || boundary.status === "mixed"
        || memory.some((entry) => entry.status === "undetermined" || entry.status === "mixed")
        ? "undetermined" as const
        : reasons.length === 0 ? "persistent" as const : "non-persistent" as const;
    return {
        pathId: path.id,
        componentId: component.id,
        worldId: component.worldIds[0]!,
        memberFieldKeys: cloneValue(component.memberFieldKeys),
        status,
        boundary,
        identity,
        memory,
        selfMaintenance,
        causalInfluence,
        reasons,
    };
}

function normalizeOptions(options: PersistentCausalExecutionOptions): Required<PersistentCausalExecutionOptions> {
    return {
        maxClosures: options.maxClosures ?? 8,
        maxPaths: options.maxPaths ?? 32,
        causalOptions: cloneValue(options.causalOptions ?? {}),
    };
}

export function realizePersistentCausalWorld(
    program: PersistentCausalProgram,
    requestedOptions: PersistentCausalExecutionOptions = {},
): PersistentCausalRun {
    const options = normalizeOptions(requestedOptions);
    const diagnostics = validatePersistentCausalProgram(program);
    const components = diagnostics.length === 0 ? deriveCausalComponents(program) : [];
    const candidates = candidateComponents(components);
    const base = {
        mode: "bubble-persistent-causal-run.v1" as const,
        programDigest: digest(program),
        options,
        diagnostics,
        order: {
            kind: "causal-closure-coalgebra" as const,
            universalClock: false as const,
            closureEdges: [] as Array<{ cause: string; effect: string; configurationDigest: string }>,
        },
        components,
        candidateComponentIds: candidates.map((component) => component.id),
    };
    if (diagnostics.length > 0) {
        return {
            ...base,
            status: "contradicted",
            reason: "persistent causal program validation failed",
            paths: [],
            assessments: [],
            resourceUse: { closureExecutions: 0, pathCount: 0, closureLimit: options.maxClosures, pathLimit: options.maxPaths, exhaustive: true },
        };
    }
    if (!Number.isSafeInteger(options.maxClosures) || options.maxClosures < 2
        || !Number.isSafeInteger(options.maxPaths) || options.maxPaths < 1) {
        return {
            ...base,
            status: "contradicted",
            reason: "persistent execution requires at least two closures and positive safe-integer path capacity",
            paths: [],
            assessments: [],
            resourceUse: { closureExecutions: 0, pathCount: 0, closureLimit: options.maxClosures, pathLimit: options.maxPaths, exhaustive: true },
        };
    }

    const queue: MutablePath[] = [{
        id: "path:root",
        closures: [],
        configurationDigests: [],
        historyEntries: [],
        historyEntryCounts: [],
    }];
    const createdPathIds = new Set(["path:root"]);
    const paths: PersistentCausalPath[] = [];
    let closureExecutions = 0;
    let exhaustive = true;
    while (queue.length > 0) {
        const current = queue.shift()!;
        const run = realizeAnchoredCausalWorld(program.causalProgram, {
            ...options.causalOptions,
            ...(current.nextOverrides ? { fieldOverrides: current.nextOverrides } : {}),
        });
        closureExecutions += 1;
        const selected = selectedContinuations(run);
        if (selected.length === 0) {
            paths.push({
                id: current.id,
                status: run.status === "contradicted" ? "contradicted" : "non-executable",
                reason: run.reason ?? `closure returned ${run.status} without a lawful selected continuation`,
                closures: current.closures,
                configurationDigests: current.configurationDigests,
                anchoredHistory: anchoredHistory(current.historyEntries),
            });
            continue;
        }
        for (const continuation of selected) {
            const closureNumber = current.closures.length + 1;
            const closureId = `${current.id}:closure:${closureNumber}:${continuation.id}`;
            const inputDigest = digest(run.initialWorldStates);
            const outputDigest = digest(continuation.worldStates);
            const closure: PersistentCausalClosure = {
                id: closureId,
                cause: current.closures.length === 0 ? "initial-configuration" : "configuration-continuation",
                ...(current.closures.length > 0 ? { causedByClosureId: current.closures.at(-1)!.id } : {}),
                inputConfigurationDigest: inputDigest,
                outputConfigurationDigest: outputDigest,
                inputWorldStates: cloneValue(run.initialWorldStates),
                outputWorldStates: cloneValue(continuation.worldStates),
                historyExtension: cloneValue(continuation.historyCommits),
                historyExtensionDigest: digest(continuation.historyCommits),
                selectedContinuationId: continuation.id,
                run,
            };
            const extensionEntries = continuation.historyCommits.map((commit, index) => ({
                ...cloneValue(commit),
                closureId,
                ordinalWithinClosure: index + 1,
            }));
            const historyEntries = [...current.historyEntries, ...extensionEntries];
            const branchId = selected.length === 1 ? current.id : `${current.id}/${continuation.id}`;
            if (!createdPathIds.has(branchId) && createdPathIds.size >= options.maxPaths) {
                exhaustive = false;
                paths.push({
                    id: branchId,
                    status: "budget-exhausted",
                    reason: "persistent path capacity exhausted before every lawful branch was unfolded",
                    closures: [...current.closures, closure],
                    configurationDigests: [
                        ...(current.configurationDigests.length === 0 ? [inputDigest] : current.configurationDigests),
                        outputDigest,
                    ],
                    anchoredHistory: anchoredHistory(historyEntries),
                });
                continue;
            }
            createdPathIds.add(branchId);
            const closures = [...current.closures, closure];
            const priorDigests = current.configurationDigests.length === 0 ? [inputDigest] : current.configurationDigests;
            const configurationDigests = [...priorDigests, outputDigest];
            const priorHistoryEntryCounts = current.historyEntryCounts.length === 0
                ? [current.historyEntries.length]
                : current.historyEntryCounts;
            const historyEntryCounts = [...priorHistoryEntryCounts, historyEntries.length];
            let repeatedIndex = -1;
            for (let index = configurationDigests.length - 2; index >= 0; index -= 1) {
                if (configurationDigests[index] === outputDigest) {
                    repeatedIndex = index;
                    break;
                }
            }
            if (closures.length >= 2 && repeatedIndex >= 0) {
                paths.push({
                    id: branchId,
                    status: "cycle",
                    reason: "exact causal configuration recurs while anchored history remains a monotone commit extension",
                    closures,
                    configurationDigests,
                    anchoredHistory: anchoredHistory(historyEntries),
                    cycle: {
                        scope: "causal-configuration",
                        startConfigurationIndex: repeatedIndex,
                        periodClosures: configurationDigests.length - 1 - repeatedIndex,
                        repeatedConfigurationDigest: outputDigest,
                        anchoredHistory: {
                            mode: "monotone-extension",
                            entryCountAtCycleStart: historyEntryCounts[repeatedIndex]!,
                            entryCountAtRecurrence: historyEntries.length,
                            extensionCount: historyEntries.length - historyEntryCounts[repeatedIndex]!,
                            fullAnchoredStateRepeated: historyEntries.length === historyEntryCounts[repeatedIndex],
                        },
                    },
                });
                continue;
            }
            if (closures.length >= options.maxClosures) {
                exhaustive = false;
                paths.push({
                    id: branchId,
                    status: "budget-exhausted",
                    reason: "closure bound reached without a recurrence certificate",
                    closures,
                    configurationDigests,
                    anchoredHistory: anchoredHistory(historyEntries),
                });
                continue;
            }
            queue.push({
                id: branchId,
                closures,
                configurationDigests,
                historyEntries,
                historyEntryCounts,
                nextOverrides: statesToOverrides(program, continuation.worldStates),
            });
        }
    }

    const closureEdges = paths.flatMap((path) => path.closures.slice(1).map((closure, index) => ({
        cause: path.closures[index]!.id,
        effect: closure.id,
        configurationDigest: closure.inputConfigurationDigest,
    })));
    const assessments = paths.filter((path) => path.status === "cycle").flatMap((path) => (
        candidates.map((component) => assessComponent(program, options, path, component))
    ));
    const unresolvedPaths = paths.filter((path) => path.status === "budget-exhausted" || path.status === "non-executable");
    const cyclicPaths = paths.filter((path) => path.status === "cycle");
    const everyCycleHasPersistentStructure = cyclicPaths.length > 0 && cyclicPaths.every((path) => (
        assessments.some((assessment) => assessment.pathId === path.id && assessment.status === "persistent")
    ));
    const hasUndeterminedAssessment = assessments.some((assessment) => assessment.status === "undetermined");
    const status = paths.some((path) => path.status === "contradicted")
        ? "contradicted" as const
        : unresolvedPaths.length > 0 || hasUndeterminedAssessment || !exhaustive
            ? "undetermined" as const
            : everyCycleHasPersistentStructure ? "persistent" as const : "non-persistent" as const;
    const reason = status === "persistent"
        ? "every lawful closure path has a recurrent structure with derived boundary, invariant identity, causal memory, self-maintenance, and outward influence"
        : status === "non-persistent"
            ? "closure recurrence did not satisfy every persistent-structure criterion"
            : status === "contradicted"
                ? "a causal closure contradicted the persistent execution contract"
                : "persistence remains unresolved because a path, counterfactual, or resource frontier is incomplete";
    return {
        ...base,
        status,
        reason,
        order: { ...base.order, closureEdges },
        paths,
        assessments,
        resourceUse: {
            closureExecutions,
            pathCount: paths.length,
            closureLimit: options.maxClosures,
            pathLimit: options.maxPaths,
            exhaustive,
        },
    };
}

export function inspectPersistentCausalRun(run: PersistentCausalRun): PersistentCausalInspection {
    return {
        mode: "bubble-persistent-causal-inspection.v1",
        summary: {
            status: run.status,
            candidateComponentCount: run.candidateComponentIds.length,
            persistentAssessmentCount: run.assessments.filter((assessment) => assessment.status === "persistent").length,
            cyclicPathCount: run.paths.filter((path) => path.status === "cycle").length,
            unresolvedPathCount: run.paths.filter((path) => path.status !== "cycle").length,
            universalClock: false,
            exhaustive: run.resourceUse.exhaustive,
        },
        components: cloneValue(run.components),
        paths: cloneValue(run.paths),
        assessments: cloneValue(run.assessments),
    };
}

export function recordPersistentCausalReplay(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions = {},
): PersistentCausalReplayRecord {
    const recordedRun = realizePersistentCausalWorld(program, options);
    return {
        mode: "bubble-persistent-causal-replay.v1",
        program: cloneValue(program),
        options: cloneValue(options),
        recordedRun,
        recordedDigest: digest(recordedRun),
    };
}

export function replayPersistentCausalRecord(record: PersistentCausalReplayRecord): PersistentCausalReplayResult {
    const replayedRun = realizePersistentCausalWorld(record.program, record.options);
    const recordedRunDigest = digest(record.recordedRun);
    const replayedDigest = digest(replayedRun);
    const recordIntegrityValid = record.recordedDigest === recordedRunDigest;
    const recordedProgramDigestValid = record.recordedRun.programDigest === digest(record.program);
    const fullRunPreserved = stableStringify(record.recordedRun) === stableStringify(replayedRun);
    const recordedCycles = record.recordedRun.paths.map((path) => ({ id: path.id, status: path.status, cycle: path.cycle }));
    const replayedCycles = replayedRun.paths.map((path) => ({ id: path.id, status: path.status, cycle: path.cycle }));
    const recordedAssessments = record.recordedRun.assessments.map((assessment) => ({
        pathId: assessment.pathId,
        componentId: assessment.componentId,
        status: assessment.status,
        memory: assessment.memory,
        selfMaintenance: assessment.selfMaintenance,
    }));
    const replayedAssessments = replayedRun.assessments.map((assessment) => ({
        pathId: assessment.pathId,
        componentId: assessment.componentId,
        status: assessment.status,
        memory: assessment.memory,
        selfMaintenance: assessment.selfMaintenance,
    }));
    const pathCyclesPreserved = stableStringify(recordedCycles) === stableStringify(replayedCycles);
    const persistenceEvidencePreserved = stableStringify(recordedAssessments) === stableStringify(replayedAssessments);
    const same = recordIntegrityValid && recordedProgramDigestValid && record.recordedDigest === replayedDigest
        && fullRunPreserved && pathCyclesPreserved && persistenceEvidencePreserved;
    return {
        mode: "bubble-persistent-causal-replay-result.v1",
        status: same ? "same-world-reexecution" : "reexecution-drift",
        recordedDigest: record.recordedDigest,
        recordedRunDigest,
        replayedDigest,
        recordIntegrityValid,
        recordedProgramDigestValid,
        fullRunPreserved,
        pathCyclesPreserved,
        persistenceEvidencePreserved,
        replayedRun,
    };
}
