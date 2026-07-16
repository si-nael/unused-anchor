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
    type CausalInternalEventAblation,
    type CausalTraceEntry,
    type CausalWorldState,
} from "./causal-runtime";
import {
    inspectPersistentCausalRun,
    realizePersistentCausalWorld,
    type PersistentCausalExecutionOptions,
    type PersistentCausalPath,
    type PersistentCausalRun,
    type PersistentStructureAssessment,
} from "./persistent-runtime";
import type { CausalInternalLaw } from "./causal";
import type { DerivedCausalComponent, PersistentCausalProgram } from "./persistent";

export interface TeleonomicResponseEventAblationContinuation {
    continuationId: string;
    componentConfigurationDigest: string;
    remainsInsideKernel: boolean;
    changedTraceLawIds: string[];
    internalEventAblationIds: string[];
    responseEventNonrealizationWitnessed: boolean;
}

export interface TeleonomicResponseEventAblationEvidence {
    factualClosureId: string;
    status: "necessary" | "not-necessary" | "mixed" | "undetermined";
    counterfactualKind: "same-law-internal-event-nonrealization";
    counterfactualRunStatus: AnchoredCausalRun["status"];
    factualProgramDigest: string;
    counterfactualProgramDigest: string;
    sameProgramDigest: boolean;
    lawDefinitionRetained: boolean;
    eventAblationWitnesses: CausalInternalEventAblation[];
    continuations: TeleonomicResponseEventAblationContinuation[];
}

export interface TeleonomicResponseMemoryDependenceContinuation {
    continuationId: string;
    responseEventRealized: boolean;
}

export interface TeleonomicResponseMemoryDependenceEvidence {
    factualClosureId: string;
    status: "necessary" | "not-necessary" | "mixed" | "undetermined";
    counterfactualKind: "same-program-memory-erasure";
    counterfactualRunStatus: AnchoredCausalRun["status"];
    memoryFieldKeys: string[];
    rememberedValues: Record<string, ExactValue>;
    erasedToValues: Record<string, ExactValue>;
    continuations: TeleonomicResponseMemoryDependenceContinuation[];
}

export function quantifyResponseEventAblationContinuations(
    continuations: Array<Pick<TeleonomicResponseEventAblationContinuation, "remainsInsideKernel">>,
): TeleonomicResponseEventAblationEvidence["status"] {
    if (continuations.length === 0) return "undetermined";
    const insideCount = continuations.filter((entry) => entry.remainsInsideKernel).length;
    if (insideCount === 0) return "necessary";
    if (insideCount === continuations.length) return "not-necessary";
    return "mixed";
}

export function quantifyResponseMemoryDependence(
    continuations: TeleonomicResponseMemoryDependenceContinuation[],
): TeleonomicResponseMemoryDependenceEvidence["status"] {
    if (continuations.length === 0) return "undetermined";
    const realizedCount = continuations.filter((entry) => entry.responseEventRealized).length;
    if (realizedCount === 0) return "necessary";
    if (realizedCount === continuations.length) return "not-necessary";
    return "mixed";
}

export function everyAutonomousPathPreservesKernel(
    paths: Array<{ componentPersistent: boolean; kernelPreserved: boolean }>,
): boolean {
    return paths.length > 0 && paths.every((path) => path.componentPersistent && path.kernelPreserved);
}

export interface TeleonomicAffordanceEvidence {
    lawId: string;
    status: "necessary" | "not-necessary" | "undetermined";
    factualClosureIds: string[];
    negativeSeaEventIds: string[];
    disturbanceEventIds: string[];
    responseEventIds: string[];
    inputKernelDigests: string[];
    outputKernelDigests: string[];
    discriminatorValues: Record<string, ExactValue[]>;
    responseEventAblations: TeleonomicResponseEventAblationEvidence[];
    memoryDependence: TeleonomicResponseMemoryDependenceEvidence[];
}

export interface TeleonomicStructureAssessment {
    pathId: string;
    componentId: string;
    worldId: string;
    status: "teleonomic-capacity" | "non-teleonomic" | "undetermined";
    endogenousNorm: {
        kind: "bounded-invariant-viability-kernel";
        authoredGoalDeclaration: false;
        componentConfigurationDigests: string[];
        cardinality: number;
        closedAcrossRealizedCycle: boolean;
        maintainedByInternalLawIds: string[];
    };
    affordances: TeleonomicAffordanceEvidence[];
    plurality: {
        distinctAffordanceLawIds: string[];
        internalDiscriminatorFieldKeys: string[];
        internalDiscriminatorEvidence: Array<{
            fieldKey: string;
            status: "organically-recurrent" | "not-organic";
            distinctAcrossAffordances: boolean;
            everyResponseValueProducedWithinEpisode: boolean;
            everyCycleInputProducedByPrecedingResponse: boolean;
            witnesses: Array<{
                lawId: string;
                factualClosureId: string;
                withinEpisodeWriterEventId?: string;
                withinEpisodeCausallyProduced: boolean;
                precedingClosureId: string;
                precedingInputWriterEventId?: string;
                precedingResponseEventIds: string[];
                precedingResponseCausallyProducedInput: boolean;
            }>;
        }>;
        organicallyDifferentiated: boolean;
        hostSelection: false;
    };
    autonomy: {
        realizedWithoutWorldWillIntervention: boolean;
        disabledWorldWillAndCutAnchorIds: string[];
        persistentCounterfactualStatus: PersistentCausalRun["status"];
        pathEvidence: Array<{
            pathId: string;
            pathStatus: PersistentCausalPath["status"];
            componentPersistent: boolean;
            kernelPreserved: boolean;
        }>;
        viabilityKernelPreserved: boolean;
        effective: boolean;
    };
    reasons: string[];
}

export interface TeleonomicCausalRun {
    mode: "bubble-teleonomic-causal-run.v1";
    programDigest: string;
    status: "teleonomic-capacity" | "non-teleonomic" | "undetermined" | "contradicted";
    reason: string;
    options: PersistentCausalExecutionOptions;
    order: {
        kind: "causal-closure-viability-analysis";
        universalClock: false;
        hostAffordanceSelector: false;
    };
    persistentRun: PersistentCausalRun;
    assessments: TeleonomicStructureAssessment[];
    resourceUse: {
        persistentExecutions: number;
        responseEventAblationExecutions: number;
        memoryErasureExecutions: number;
        exhaustive: boolean;
    };
}

export interface TeleonomicCausalInspection {
    mode: "bubble-teleonomic-causal-inspection.v1";
    summary: {
        status: TeleonomicCausalRun["status"];
        assessmentCount: number;
        certifiedCapacityCount: number;
        affordanceCount: number;
        universalClock: false;
        hostAffordanceSelector: false;
        exhaustive: boolean;
    };
    persistentSummary: ReturnType<typeof inspectPersistentCausalRun>["summary"];
    assessments: TeleonomicStructureAssessment[];
}

export interface TeleonomicCausalReplayRecord {
    mode: "bubble-teleonomic-causal-replay.v1";
    program: PersistentCausalProgram;
    options: PersistentCausalExecutionOptions;
    recordedRun: TeleonomicCausalRun;
    recordedDigest: string;
}

export interface TeleonomicCausalReplayResult {
    mode: "bubble-teleonomic-causal-replay-result.v1";
    status: "same-teleonomic-reexecution" | "reexecution-drift";
    recordIntegrityValid: boolean;
    programIdentityValid: boolean;
    fullRunPreserved: boolean;
    recordedDigest: string;
    recordedRunDigest: string;
    replayedDigest: string;
    replayedRun: TeleonomicCausalRun;
}

interface ResponseEpisode {
    lawId: string;
    closure: PersistentCausalPath["closures"][number];
    continuation: CausalContinuation;
    negativeSeaEventId: string;
    disturbanceEventId: string;
    responseEventId: string;
    responseTraceIndex: number;
    inputKernelDigest: string;
    outputKernelDigest: string;
    discriminatorValues: Record<string, ExactValue>;
}

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

function traceLawIds(continuation: CausalContinuation): string[] {
    return [...new Set(continuation.trace.filter((entry) => entry.kind === "internal-law" && entry.lawId)
        .map((entry) => entry.lawId!))].sort();
}

function symmetricDifference(left: string[], right: string[]): string[] {
    const a = new Set(left);
    const b = new Set(right);
    return [...new Set([...left, ...right])].filter((value) => a.has(value) !== b.has(value)).sort();
}

function componentConfiguration(states: CausalWorldState[], component: DerivedCausalComponent): Record<string, ExactValue> {
    return Object.fromEntries(component.memberFieldKeys.map((key) => [key, stateField(states, key)] as const)
        .filter((entry): entry is readonly [string, ExactValue] => entry[1] !== undefined));
}

function componentDigest(states: CausalWorldState[], component: DerivedCausalComponent): string {
    return digest(componentConfiguration(states, component));
}

function cycleClosures(path: PersistentCausalPath): PersistentCausalPath["closures"] {
    if (!path.cycle) return [];
    return path.closures.slice(
        path.cycle.startConfigurationIndex,
        path.cycle.startConfigurationIndex + path.cycle.periodClosures,
    );
}

function cycleKernel(path: PersistentCausalPath, component: DerivedCausalComponent): string[] {
    if (!path.cycle || path.closures.length === 0) return [];
    const states = [path.closures[0]!.inputWorldStates, ...path.closures.map((closure) => closure.outputWorldStates)];
    return [...new Set(states.slice(
        path.cycle.startConfigurationIndex,
        path.cycle.startConfigurationIndex + path.cycle.periodClosures,
    ).map((state) => componentDigest(state, component)))].sort();
}

function negativeIncrease(entry: CausalTraceEntry, negativeFieldIds: Set<string>): boolean {
    return entry.effects.some((effect) => {
        if (!negativeFieldIds.has(effect.fieldId) || !effect.before) return false;
        const before = normalizeExactValue(effect.before);
        const after = normalizeExactValue(effect.after);
        return before?.kind === "rational" && after?.kind === "rational"
            && compareExactRationals(after, before) === 1;
    });
}

function valueBeforeTraceEntry(
    closure: ResponseEpisode["closure"],
    continuation: CausalContinuation,
    entryIndex: number,
    key: string,
): ExactValue | undefined {
    let value = stateField(closure.inputWorldStates, key);
    const dot = key.indexOf(".");
    const worldId = key.slice(0, dot);
    const fieldId = key.slice(dot + 1);
    for (const entry of continuation.trace.slice(0, entryIndex)) {
        if (entry.worldId !== worldId) continue;
        const effect = entry.effects.find((candidate) => candidate.fieldId === fieldId && candidate.layer === "world-field");
        if (effect) value = effect.after;
    }
    return value ? cloneValue(value) : undefined;
}

function traceEntryChangesField(entry: CausalTraceEntry, key: string): boolean {
    const dot = key.indexOf(".");
    const worldId = key.slice(0, dot);
    const fieldId = key.slice(dot + 1);
    return entry.worldId === worldId && entry.effects.some((effect) => effect.fieldId === fieldId
        && effect.before !== undefined && !exactValuesEqual(effect.before, effect.after));
}

function eventCausallyDescendsFrom(
    continuation: CausalContinuation,
    eventId: string,
    ancestorEventId: string,
): boolean {
    if (eventId === ancestorEventId) return true;
    const causesByEvent = new Map(continuation.trace.filter((entry) => entry.eventId)
        .map((entry) => [entry.eventId!, entry.causes]));
    const pending = [...causesByEvent.get(eventId) ?? []];
    const visited = new Set<string>();
    while (pending.length > 0) {
        const cause = pending.pop()!;
        if (cause === ancestorEventId) return true;
        if (visited.has(cause)) continue;
        visited.add(cause);
        pending.push(...causesByEvent.get(cause) ?? []);
    }
    return false;
}

function lawUsesBoundaryAndMemory(law: CausalInternalLaw, component: DerivedCausalComponent): boolean {
    const roleByKey = new Map(component.fieldRoles.map((field) => [fieldKey(field.worldId, field.fieldId), field.role]));
    const roles = new Set(law.guard.fieldParameters.map((binding) => roleByKey.get(fieldKey(binding.worldId, binding.fieldId))));
    return roles.has("boundary-state") && roles.has("memory-state");
}

function responseEpisodes(
    program: PersistentCausalProgram,
    path: PersistentCausalPath,
    component: DerivedCausalComponent,
    kernel: Set<string>,
): ResponseEpisode[] {
    const world = program.causalProgram.world.worlds.find((candidate) => candidate.id === component.worldIds[0]);
    if (!world) return [];
    const negativeFieldIds = new Set(world.fields.filter((field) => field.role === "negative-sea").map((field) => field.id));
    const structuralKeys = new Set(component.fieldRoles.filter((field) => field.role === "structural-state")
        .map((field) => fieldKey(field.worldId, field.fieldId)));
    const episodes: ResponseEpisode[] = [];
    for (const closure of cycleClosures(path)) {
        const continuation = closure.run.continuations.find((candidate) => candidate.id === closure.selectedContinuationId);
        if (!continuation) continue;
        const inputKernelDigest = componentDigest(closure.inputWorldStates, component);
        const outputKernelDigest = componentDigest(closure.outputWorldStates, component);
        if (!kernel.has(inputKernelDigest) || !kernel.has(outputKernelDigest)) continue;
        for (let seaIndex = 0; seaIndex < continuation.trace.length; seaIndex += 1) {
            const sea = continuation.trace[seaIndex]!;
            if (sea.kind !== "internal-law" || !sea.eventId || !negativeIncrease(sea, negativeFieldIds)) continue;
            for (let disturbanceIndex = seaIndex + 1; disturbanceIndex < continuation.trace.length; disturbanceIndex += 1) {
                const disturbance = continuation.trace[disturbanceIndex]!;
                if (disturbance.kind !== "internal-law" || !disturbance.eventId
                    || !disturbance.causes.includes(sea.eventId)) continue;
                const disturbed = disturbance.effects.find((effect) => effect.before
                    && structuralKeys.has(fieldKey(world.id, effect.fieldId))
                    && !exactValuesEqual(effect.before, effect.after));
                if (!disturbed) continue;
                for (let responseIndex = disturbanceIndex + 1; responseIndex < continuation.trace.length; responseIndex += 1) {
                    const response = continuation.trace[responseIndex]!;
                    if (response.kind !== "internal-law" || !response.eventId || !response.lawId
                        || !response.causes.includes(disturbance.eventId)) continue;
                    const outputReference = stateField(closure.outputWorldStates, fieldKey(world.id, disturbed.fieldId));
                    const restored = outputReference && response.effects.find((effect) => effect.fieldId === disturbed.fieldId
                        && exactValuesEqual(effect.after, outputReference));
                    const law = program.causalProgram.world.internalLaws.find((candidate) => candidate.id === response.lawId);
                    if (!restored || !law || !lawUsesBoundaryAndMemory(law, component)) continue;
                    const discriminatorValues = Object.fromEntries(law.guard.fieldParameters
                        .map((binding) => fieldKey(binding.worldId, binding.fieldId))
                        .filter((key) => component.memberFieldKeys.includes(key))
                        .map((key) => [key, valueBeforeTraceEntry(closure, continuation, responseIndex, key)] as const)
                        .filter((entry): entry is readonly [string, ExactValue] => entry[1] !== undefined));
                    episodes.push({
                        lawId: law.id,
                        closure,
                        continuation,
                        negativeSeaEventId: sea.eventId,
                        disturbanceEventId: disturbance.eventId,
                        responseEventId: response.eventId,
                        responseTraceIndex: responseIndex,
                        inputKernelDigest,
                        outputKernelDigest,
                        discriminatorValues,
                    });
                }
            }
        }
    }
    return episodes;
}

function ablateResponseEvent(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions,
    component: DerivedCausalComponent,
    kernel: Set<string>,
    episode: ResponseEpisode,
): TeleonomicResponseEventAblationEvidence {
    const anchorIds = program.causalProgram.world.anchors.map((anchor) => anchor.id).sort();
    const counterfactual = realizeAnchoredCausalWorld(program.causalProgram, {
        ...options.causalOptions,
        worldWillEnabled: false,
        cutAnchorIds: anchorIds,
        fieldOverrides: statesToOverrides(program, episode.closure.inputWorldStates),
        counterfactualInternalEventAblationLawIds: [episode.lawId],
    });
    const continuations = selectedContinuations(counterfactual);
    const eventAblationWitnesses = continuations.flatMap((continuation) => (continuation.internalEventAblations ?? [])
        .filter((ablation) => ablation.lawId === episode.lawId));
    const factualProgramDigest = episode.closure.run.programDigest;
    const sameProgramDigest = factualProgramDigest === counterfactual.programDigest;
    const lawDefinitionRetained = program.causalProgram.world.internalLaws.some((law) => law.id === episode.lawId);
    if (continuations.length === 0 || ["underdetermined", "contradicted"].includes(counterfactual.status)) {
        return {
            factualClosureId: episode.closure.id,
            status: "undetermined",
            counterfactualKind: "same-law-internal-event-nonrealization",
            counterfactualRunStatus: counterfactual.status,
            factualProgramDigest,
            counterfactualProgramDigest: counterfactual.programDigest,
            sameProgramDigest,
            lawDefinitionRetained,
            eventAblationWitnesses,
            continuations: [],
        };
    }
    const evidence = continuations.map((continuation) => {
        const configurationDigest = componentDigest(continuation.worldStates, component);
        return {
            continuationId: continuation.id,
            componentConfigurationDigest: configurationDigest,
            remainsInsideKernel: kernel.has(configurationDigest),
            changedTraceLawIds: symmetricDifference(traceLawIds(episode.continuation), traceLawIds(continuation)),
            internalEventAblationIds: (continuation.internalEventAblations ?? []).map((ablation) => ablation.id).sort(),
            responseEventNonrealizationWitnessed: (continuation.internalEventAblations ?? []).some((ablation) => (
                ablation.lawId === episode.lawId
                && ablation.wouldHaveEventId === episode.responseEventId
                && ablation.lawRetainedInProgram
                && ablation.effectsSuppressed
            )),
        };
    });
    const fullyWitnessed = sameProgramDigest && lawDefinitionRetained
        && evidence.every((entry) => entry.responseEventNonrealizationWitnessed);
    return {
        factualClosureId: episode.closure.id,
        status: fullyWitnessed ? quantifyResponseEventAblationContinuations(evidence) : "undetermined",
        counterfactualKind: "same-law-internal-event-nonrealization",
        counterfactualRunStatus: counterfactual.status,
        factualProgramDigest,
        counterfactualProgramDigest: counterfactual.programDigest,
        sameProgramDigest,
        lawDefinitionRetained,
        eventAblationWitnesses,
        continuations: evidence,
    };
}

function responseMemoryDependence(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions,
    component: DerivedCausalComponent,
    path: PersistentCausalPath,
    episode: ResponseEpisode,
): TeleonomicResponseMemoryDependenceEvidence {
    const law = program.causalProgram.world.internalLaws.find((candidate) => candidate.id === episode.lawId);
    const roleByKey = new Map(component.fieldRoles.map((field) => [fieldKey(field.worldId, field.fieldId), field.role]));
    const memoryFieldKeys = [...new Set(law?.guard.fieldParameters
        .map((binding) => fieldKey(binding.worldId, binding.fieldId))
        .filter((key) => roleByKey.get(key) === "memory-state") ?? [])].sort();
    const erasedReference = path.closures[0]?.inputWorldStates;
    const rememberedValues: Record<string, ExactValue> = {};
    const erasedToValues: Record<string, ExactValue> = {};
    if (!law || !erasedReference || memoryFieldKeys.length === 0) {
        return {
            factualClosureId: episode.closure.id,
            status: "undetermined",
            counterfactualKind: "same-program-memory-erasure",
            counterfactualRunStatus: "underdetermined",
            memoryFieldKeys,
            rememberedValues,
            erasedToValues,
            continuations: [],
        };
    }
    const fieldOverrides = statesToOverrides(program, episode.closure.inputWorldStates);
    for (const key of memoryFieldKeys) {
        const remembered = stateField(episode.closure.inputWorldStates, key);
        const erased = stateField(erasedReference, key);
        if (!remembered || !erased) {
            return {
                factualClosureId: episode.closure.id,
                status: "undetermined",
                counterfactualKind: "same-program-memory-erasure",
                counterfactualRunStatus: "underdetermined",
                memoryFieldKeys,
                rememberedValues,
                erasedToValues,
                continuations: [],
            };
        }
        rememberedValues[key] = cloneValue(remembered);
        erasedToValues[key] = cloneValue(erased);
        fieldOverrides[key] = cloneValue(erased);
    }
    const anchorIds = program.causalProgram.world.anchors.map((anchor) => anchor.id).sort();
    const counterfactual = realizeAnchoredCausalWorld(program.causalProgram, {
        ...options.causalOptions,
        worldWillEnabled: false,
        cutAnchorIds: anchorIds,
        fieldOverrides,
    });
    const continuations = selectedContinuations(counterfactual);
    if (continuations.length === 0 || ["underdetermined", "contradicted"].includes(counterfactual.status)) {
        return {
            factualClosureId: episode.closure.id,
            status: "undetermined",
            counterfactualKind: "same-program-memory-erasure",
            counterfactualRunStatus: counterfactual.status,
            memoryFieldKeys,
            rememberedValues,
            erasedToValues,
            continuations: [],
        };
    }
    const evidence = continuations.map((continuation) => ({
        continuationId: continuation.id,
        responseEventRealized: continuation.realizedEventIds.includes(episode.responseEventId),
    }));
    return {
        factualClosureId: episode.closure.id,
        status: quantifyResponseMemoryDependence(evidence),
        counterfactualKind: "same-program-memory-erasure",
        counterfactualRunStatus: counterfactual.status,
        memoryFieldKeys,
        rememberedValues,
        erasedToValues,
        continuations: evidence,
    };
}

function affordanceEvidence(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions,
    component: DerivedCausalComponent,
    kernel: Set<string>,
    path: PersistentCausalPath,
    episodes: ResponseEpisode[],
): TeleonomicAffordanceEvidence[] {
    const lawIds = [...new Set(episodes.map((episode) => episode.lawId))].sort();
    return lawIds.map((lawId) => {
        const relevant = episodes.filter((episode) => episode.lawId === lawId);
        const responseEventAblations = relevant.map((episode) => ablateResponseEvent(program, options, component, kernel, episode));
        const memoryDependence = relevant.map((episode) => responseMemoryDependence(program, options, component, path, episode));
        const unresolved = responseEventAblations.some((entry) => entry.status === "undetermined" || entry.status === "mixed")
            || memoryDependence.some((entry) => entry.status === "undetermined" || entry.status === "mixed");
        const necessary = responseEventAblations.length > 0 && memoryDependence.length > 0
            && responseEventAblations.every((entry) => entry.status === "necessary")
            && memoryDependence.every((entry) => entry.status === "necessary");
        const discriminatorValues: Record<string, ExactValue[]> = {};
        for (const episode of relevant) {
            for (const [key, value] of Object.entries(episode.discriminatorValues)) {
                const values = discriminatorValues[key] ?? [];
                if (!values.some((candidate) => exactValuesEqual(candidate, value))) values.push(cloneValue(value));
                discriminatorValues[key] = values;
            }
        }
        return {
            lawId,
            status: unresolved ? "undetermined" : necessary ? "necessary" : "not-necessary",
            factualClosureIds: relevant.map((episode) => episode.closure.id).sort(),
            negativeSeaEventIds: [...new Set(relevant.map((episode) => episode.negativeSeaEventId))].sort(),
            disturbanceEventIds: [...new Set(relevant.map((episode) => episode.disturbanceEventId))].sort(),
            responseEventIds: [...new Set(relevant.map((episode) => episode.responseEventId))].sort(),
            inputKernelDigests: [...new Set(relevant.map((episode) => episode.inputKernelDigest))].sort(),
            outputKernelDigests: [...new Set(relevant.map((episode) => episode.outputKernelDigest))].sort(),
            discriminatorValues,
            responseEventAblations,
            memoryDependence,
        };
    });
}

function internalDiscriminators(
    component: DerivedCausalComponent,
    path: PersistentCausalPath,
    episodes: ResponseEpisode[],
    affordances: TeleonomicAffordanceEvidence[],
): TeleonomicStructureAssessment["plurality"]["internalDiscriminatorEvidence"] {
    const excludedRoles = new Set(["boundary-state", "memory-state", "identity-state", "structural-state"]);
    const closures = cycleClosures(path);
    return component.fieldRoles.filter((field) => !excludedRoles.has(field.role))
        .map((field) => fieldKey(field.worldId, field.fieldId))
        .map((key) => {
            const byLaw = affordances.map((affordance) => affordance.discriminatorValues[key] ?? []);
            const distinctAcrossAffordances = byLaw.length >= 2
                && byLaw.every((values) => values.length > 0)
                && byLaw.every((values, index) => byLaw.slice(index + 1).every((other) => (
                    !values.some((value) => other.some((candidate) => exactValuesEqual(value, candidate)))
                )));
            const witnesses = episodes.map((episode) => {
                const withinEpisodeWriter = [...episode.continuation.trace.slice(0, episode.responseTraceIndex)].reverse()
                    .find((entry) => entry.eventId && traceEntryChangesField(entry, key));
                const withinEpisodeCausallyProduced = Boolean(withinEpisodeWriter?.eventId
                    && eventCausallyDescendsFrom(episode.continuation, withinEpisodeWriter.eventId, episode.disturbanceEventId));
                const closureIndex = closures.findIndex((closure) => closure.id === episode.closure.id);
                const precedingClosure = closures[(closureIndex - 1 + closures.length) % closures.length]!;
                const precedingContinuation = precedingClosure.run.continuations
                    .find((continuation) => continuation.id === precedingClosure.selectedContinuationId)!;
                const inputValue = stateField(episode.closure.inputWorldStates, key);
                const precedingInputWriter = [...precedingContinuation.trace].reverse().find((entry) => entry.eventId
                    && traceEntryChangesField(entry, key)
                    && inputValue !== undefined
                    && entry.effects.some((effect) => effect.after && exactValuesEqual(effect.after, inputValue)));
                const precedingResponseEventIds = episodes.filter((candidate) => candidate.closure.id === precedingClosure.id)
                    .map((candidate) => candidate.responseEventId).sort();
                const precedingResponseCausallyProducedInput = Boolean(precedingInputWriter?.eventId
                    && precedingResponseEventIds.some((eventId) => eventCausallyDescendsFrom(
                        precedingContinuation,
                        precedingInputWriter.eventId!,
                        eventId,
                    )));
                return {
                    lawId: episode.lawId,
                    factualClosureId: episode.closure.id,
                    ...(withinEpisodeWriter?.eventId ? { withinEpisodeWriterEventId: withinEpisodeWriter.eventId } : {}),
                    withinEpisodeCausallyProduced,
                    precedingClosureId: precedingClosure.id,
                    ...(precedingInputWriter?.eventId ? { precedingInputWriterEventId: precedingInputWriter.eventId } : {}),
                    precedingResponseEventIds,
                    precedingResponseCausallyProducedInput,
                };
            });
            const everyResponseValueProducedWithinEpisode = witnesses.length > 0
                && witnesses.every((witness) => witness.withinEpisodeCausallyProduced);
            const everyCycleInputProducedByPrecedingResponse = witnesses.length > 0
                && witnesses.every((witness) => witness.precedingResponseCausallyProducedInput);
            return {
                fieldKey: key,
                status: distinctAcrossAffordances && everyResponseValueProducedWithinEpisode
                    && everyCycleInputProducedByPrecedingResponse ? "organically-recurrent" as const : "not-organic" as const,
                distinctAcrossAffordances,
                everyResponseValueProducedWithinEpisode,
                everyCycleInputProducedByPrecedingResponse,
                witnesses,
            };
        }).sort((left, right) => left.fieldKey.localeCompare(right.fieldKey));
}

function sameSet(left: string[], right: string[]): boolean {
    return stableStringify([...new Set(left)].sort()) === stableStringify([...new Set(right)].sort());
}

function assessTeleonomy(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions,
    persistentRun: PersistentCausalRun,
    autonomousRun: PersistentCausalRun,
    path: PersistentCausalPath,
    persistentAssessment: PersistentStructureAssessment,
): TeleonomicStructureAssessment {
    const component = persistentRun.components.find((candidate) => candidate.id === persistentAssessment.componentId)!;
    const kernelDigests = cycleKernel(path, component);
    const kernel = new Set(kernelDigests);
    const closures = cycleClosures(path);
    const closedAcrossRealizedCycle = closures.length > 0 && closures.every((closure) => (
        kernel.has(componentDigest(closure.inputWorldStates, component))
        && kernel.has(componentDigest(closure.outputWorldStates, component))
    ));
    const episodes = responseEpisodes(program, path, component, kernel);
    const affordances = affordanceEvidence(program, options, component, kernel, path, episodes);
    const distinctAffordanceLawIds = affordances.map((affordance) => affordance.lawId).sort();
    const internalDiscriminatorEvidence = internalDiscriminators(component, path, episodes, affordances);
    const internalDiscriminatorFieldKeys = internalDiscriminatorEvidence
        .filter((evidence) => evidence.status === "organically-recurrent").map((evidence) => evidence.fieldKey);
    const organicallyDifferentiated = distinctAffordanceLawIds.length >= 2 && internalDiscriminatorFieldKeys.length > 0;
    const realizedWithoutWorldWillIntervention = closures.every((closure) => {
        const continuation = closure.run.continuations.find((candidate) => candidate.id === closure.selectedContinuationId);
        return Boolean(continuation && continuation.interventionIds.length === 0);
    });
    const pathEvidence = autonomousRun.paths.map((candidatePath) => {
        const componentPersistent = autonomousRun.assessments.some((assessment) => assessment.pathId === candidatePath.id
            && assessment.componentId === component.id && assessment.status === "persistent");
        return {
            pathId: candidatePath.id,
            pathStatus: candidatePath.status,
            componentPersistent,
            kernelPreserved: candidatePath.status === "cycle" && componentPersistent
                && sameSet(kernelDigests, cycleKernel(candidatePath, component)),
        };
    });
    const viabilityKernelPreserved = everyAutonomousPathPreservesKernel(pathEvidence);
    const anchorIds = program.causalProgram.world.anchors.map((anchor) => anchor.id).sort();
    const autonomy = {
        realizedWithoutWorldWillIntervention,
        disabledWorldWillAndCutAnchorIds: anchorIds,
        persistentCounterfactualStatus: autonomousRun.status,
        pathEvidence,
        viabilityKernelPreserved,
        effective: realizedWithoutWorldWillIntervention && autonomousRun.status === "persistent" && viabilityKernelPreserved,
    };
    const reasons: string[] = [];
    if (persistentAssessment.status !== "persistent") reasons.push("the substrate component is not persistently certified");
    if (!closedAcrossRealizedCycle || kernelDigests.length === 0) reasons.push("no bounded invariant component-configuration kernel closes across the recurrent cycle");
    if (affordances.length < 2) reasons.push("fewer than two internally realized response affordances maintain the viability kernel");
    if (!organicallyDifferentiated) reasons.push("affordances are not differentiated by the component's own causal state");
    if (affordances.some((affordance) => affordance.status === "undetermined")) {
        reasons.push("a response-event or response-memory counterfactual is unresolved");
    } else if (affordances.some((affordance) => affordance.responseEventAblations
        .some((entry) => entry.status !== "necessary"))) {
        reasons.push("an alleged affordance is not necessary for its factual viability transition");
    } else if (affordances.some((affordance) => affordance.memoryDependence
        .some((entry) => entry.status !== "necessary"))) {
        reasons.push("an alleged affordance does not semantically depend on retained memory");
    }
    if (!autonomy.effective) reasons.push("the viability kernel is not preserved with World Will disabled and all anchors cut");
    const unresolved = affordances.some((affordance) => affordance.status === "undetermined")
        || autonomousRun.status === "undetermined";
    return {
        pathId: path.id,
        componentId: component.id,
        worldId: component.worldIds[0]!,
        status: unresolved ? "undetermined" : reasons.length === 0 ? "teleonomic-capacity" : "non-teleonomic",
        endogenousNorm: {
            kind: "bounded-invariant-viability-kernel",
            authoredGoalDeclaration: false,
            componentConfigurationDigests: kernelDigests,
            cardinality: kernelDigests.length,
            closedAcrossRealizedCycle,
            maintainedByInternalLawIds: distinctAffordanceLawIds,
        },
        affordances,
        plurality: {
            distinctAffordanceLawIds,
            internalDiscriminatorFieldKeys,
            internalDiscriminatorEvidence,
            organicallyDifferentiated,
            hostSelection: false,
        },
        autonomy,
        reasons,
    };
}

export function realizeTeleonomicCausalWorld(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions = {},
): TeleonomicCausalRun {
    const persistentRun = realizePersistentCausalWorld(program, options);
    const anchorIds = program.causalProgram?.world?.anchors?.map((anchor) => anchor.id).sort() ?? [];
    const autonomousOptions: PersistentCausalExecutionOptions = {
        ...cloneValue(options),
        causalOptions: {
            ...cloneValue(options.causalOptions ?? {}),
            worldWillEnabled: false,
            cutAnchorIds: anchorIds,
        },
    };
    const autonomousRun = persistentRun.status === "contradicted"
        ? persistentRun
        : realizePersistentCausalWorld(program, autonomousOptions);
    const assessments = persistentRun.paths.filter((path) => path.status === "cycle").flatMap((path) => (
        persistentRun.assessments.filter((assessment) => assessment.pathId === path.id).map((assessment) => (
            assessTeleonomy(program, options, persistentRun, autonomousRun, path, assessment)
        ))
    ));
    const cyclicPathIds = persistentRun.paths.filter((path) => path.status === "cycle").map((path) => path.id);
    const everyPathCertified = cyclicPathIds.length > 0 && cyclicPathIds.every((pathId) => (
        assessments.some((assessment) => assessment.pathId === pathId && assessment.status === "teleonomic-capacity")
    ));
    const hasUndetermined = assessments.some((assessment) => assessment.status === "undetermined")
        || persistentRun.status === "undetermined" || autonomousRun.status === "undetermined";
    const status = persistentRun.status === "contradicted" || autonomousRun.status === "contradicted"
        ? "contradicted" as const
        : hasUndetermined ? "undetermined" as const
            : everyPathCertified ? "teleonomic-capacity" as const : "non-teleonomic" as const;
    const responseEventAblationExecutions = assessments.reduce((sum, assessment) => sum + assessment.affordances
        .reduce((inner, affordance) => inner + affordance.responseEventAblations.length, 0), 0);
    const memoryErasureExecutions = assessments.reduce((sum, assessment) => sum + assessment.affordances
        .reduce((inner, affordance) => inner + affordance.memoryDependence.length, 0), 0);
    return {
        mode: "bubble-teleonomic-causal-run.v1",
        programDigest: digest(program),
        status,
        reason: status === "teleonomic-capacity"
            ? "every lawful recurrent path contains an autonomous invariant viability kernel with plural organically regenerated, response-event-necessary, memory-dependent affordances"
            : status === "non-teleonomic"
                ? "persistence does not satisfy the bounded endogenous-norm, same-program response-event, memory-dependence, and autonomy contract"
                : status === "contradicted"
                    ? "the persistent substrate or autonomy counterfactual is contradicted"
                    : "teleonomic capacity remains unresolved at a causal or resource frontier",
        options: cloneValue(options),
        order: {
            kind: "causal-closure-viability-analysis",
            universalClock: false,
            hostAffordanceSelector: false,
        },
        persistentRun,
        assessments,
        resourceUse: {
            persistentExecutions: persistentRun === autonomousRun ? 1 : 2,
            responseEventAblationExecutions,
            memoryErasureExecutions,
            exhaustive: persistentRun.resourceUse.exhaustive && autonomousRun.resourceUse.exhaustive
                && !assessments.some((assessment) => assessment.status === "undetermined"),
        },
    };
}

export function inspectTeleonomicCausalRun(run: TeleonomicCausalRun): TeleonomicCausalInspection {
    return {
        mode: "bubble-teleonomic-causal-inspection.v1",
        summary: {
            status: run.status,
            assessmentCount: run.assessments.length,
            certifiedCapacityCount: run.assessments.filter((assessment) => assessment.status === "teleonomic-capacity").length,
            affordanceCount: run.assessments.reduce((sum, assessment) => sum + assessment.affordances.length, 0),
            universalClock: false,
            hostAffordanceSelector: false,
            exhaustive: run.resourceUse.exhaustive,
        },
        persistentSummary: inspectPersistentCausalRun(run.persistentRun).summary,
        assessments: cloneValue(run.assessments),
    };
}

export function recordTeleonomicCausalReplay(
    program: PersistentCausalProgram,
    options: PersistentCausalExecutionOptions = {},
): TeleonomicCausalReplayRecord {
    const recordedRun = realizeTeleonomicCausalWorld(program, options);
    return {
        mode: "bubble-teleonomic-causal-replay.v1",
        program: cloneValue(program),
        options: cloneValue(options),
        recordedRun,
        recordedDigest: digest(recordedRun),
    };
}

export function replayTeleonomicCausalRecord(record: TeleonomicCausalReplayRecord): TeleonomicCausalReplayResult {
    const replayedRun = realizeTeleonomicCausalWorld(record.program, record.options);
    const recordedRunDigest = digest(record.recordedRun);
    const replayedDigest = digest(replayedRun);
    const recordIntegrityValid = record.recordedDigest === recordedRunDigest;
    const programIdentityValid = record.recordedRun.programDigest === digest(record.program);
    const fullRunPreserved = stableStringify(record.recordedRun) === stableStringify(replayedRun);
    return {
        mode: "bubble-teleonomic-causal-replay-result.v1",
        status: recordIntegrityValid && programIdentityValid && fullRunPreserved
            ? "same-teleonomic-reexecution" : "reexecution-drift",
        recordIntegrityValid,
        programIdentityValid,
        fullRunPreserved,
        recordedDigest: record.recordedDigest,
        recordedRunDigest,
        replayedDigest,
        replayedRun,
    };
}
