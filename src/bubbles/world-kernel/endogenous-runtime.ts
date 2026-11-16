import {
    inspectAnchoredCausalRun,
    realizeAnchoredCausalWorld,
    type AnchoredCausalInspection,
    type AnchoredCausalRun,
    type CausalExecutionOptions,
} from "./causal-runtime";
import {
    causalOptionsForEndogenousCompilation,
    compileEndogenousUniverse,
    continueEndogenousUniverseFromState,
    digestEndogenousValue,
    materializeEndogenousUniverse,
    type EndogenousUniverseMaterialization,
    type EndogenousUniverseOptions,
    type EndogenousUniverseProgram,
} from "./endogenous";
import { evaluateIntensionalCoordinate } from "./intensional";
import { compareCanonicalStrings } from "./canonical-order";

export interface EndogenousConnectedUniverseExecutionOptions {
    generation?: EndogenousUniverseOptions;
    causal?: Omit<CausalExecutionOptions, "fieldOverrides" | "fieldOverrideCauses" | "worldLifecycleOverrides">;
    maxGenerationClosures?: number;
    maxGenerationBranches?: number;
}

export interface EndogenousGenerationBranchStep {
    id: string;
    closureIndex: number;
    parentBranchId: string;
    causalContinuationId: string;
    causalInternalBranchStepIds: string[];
    hostSelection: false;
}

export interface EndogenousGenerationBranchOutcome {
    branchId: string;
    causalContinuationId: string;
    status: "active" | "fixpoint" | "persistent-recurrence" | "undetermined" | "contradicted";
    reason: string;
    outputWorldCount?: number;
    outputConfigurationDigest?: string;
    outputFrontierCount?: number;
    outputDormantAdmissionCount?: number;
    realizedEventCount: number;
    newlyGeneratedEventIds: string[];
    recurrenceCertificateId?: string;
    hostSelection: false;
}

export interface EndogenousGenerationCausalClosure {
    id: string;
    index: number;
    inputBranchId: string;
    inputBranchLineage: EndogenousGenerationBranchStep[];
    inputWorldCount: number;
    inputFrontierCount: number;
    inputDormantAdmissionCount: number;
    outputWorldCount?: number;
    inputConfigurationDigest: string;
    outputConfigurationDigest?: string;
    realizedEventCount: number;
    generationEventIds: string[];
    newlyGeneratedEventIds: string[];
    outcomes: EndogenousGenerationBranchOutcome[];
    causalRun: AnchoredCausalRun;
}

export interface EndogenousGeneratedUniverseBranch {
    id: string;
    lineage: EndogenousGenerationBranchStep[];
    status: "resolved" | "undetermined" | "contradicted";
    closureKind: "fixpoint" | "persistent-recurrence" | "open" | "contradiction";
    reason: string;
    configurationDigest: string;
    evidenceLocation: "top-level" | "branch-local";
    materialization?: EndogenousUniverseMaterialization;
    closureIds: string[];
    worldContinuations?: EndogenousWorldContinuationEvidence[];
    generationCausalEdges?: EndogenousGenerationCausalEdge[];
    hostSelection: false;
}

export interface EndogenousCausalGenerationHistoryEntry {
    id: string;
    closureId: string;
    causalContinuationId: string;
    kind: "causal-event" | "anchor-transfer" | "history-commit" | "generation-event";
    evidenceId: string;
    anchorIds: string[];
    causedByIds: string[];
    affectedFieldKeys: string[];
    hostSelection: false;
}

export interface EndogenousIdentityCutEvidence {
    anchorId: string;
    predicateId: string;
    status: "held" | "failed" | "undetermined" | "contradicted";
    valueDigest?: string;
    proofDigest: string;
    reason?: string;
}

export interface EndogenousGeneratedRecurrenceCertificate {
    mode: "bubble-endogenous-generated-recurrence-certificate.v1";
    id: string;
    branchId: string;
    closureId: string;
    causalContinuationId: string;
    status: "certified" | "not-certified" | "undetermined";
    reason: string;
    cycle: {
        scope: "causal-generation-configuration";
        startClosureIndex: number;
        recurrenceClosureIndex: number;
        periodClosures: number;
        repeatedConfigurationDigest: string;
        realizedActivityRequired: true;
    };
    identity: {
        worldStructureDigestAtCycleStart: string;
        worldStructureDigestAtRecurrence: string;
        stableWorldIds: string[];
        identityDependencyFieldKeys: string[];
        mutatedIdentityDependencyFieldKeys: string[];
        predicatesAtCycleStart: EndogenousIdentityCutEvidence[];
        predicatesAtRecurrence: EndogenousIdentityCutEvidence[];
        invariantAcrossCycleCuts: boolean;
        dependenciesUnmodifiedWithinCycle: boolean;
    };
    anchoredHistory: {
        mode: "monotone-causal-generation-anchor-ledger";
        anchorSetDigestAtCycleStart: string;
        anchorSetDigestAtRecurrence: string;
        generationEventSetDigestAtCycleStart: string;
        generationEventSetDigestAtRecurrence: string;
        topologyPrefixPreserved: boolean;
        entryCountAtCycleStart: number;
        entryCountAtRecurrence: number;
        extensionCount: number;
        causalEvidenceExtensionCount: number;
        committedHistoryExtensionCount: number;
        worldHistoryExtended: boolean;
        extensionDigest: string;
        extensionEntries: EndogenousCausalGenerationHistoryEntry[];
        fullAnchoredStateRepeated: boolean;
    };
    hostSelection: false;
}

export interface EndogenousSelfComplementationStep {
    closureId: string;
    closureIndex: number;
    inputBranchId: string;
    inputWorldCount: number;
    inputFrontierCount: number;
    inputDormantAdmissionCount: number;
    realizedEventCount: number;
    derivedBranchIds: string[];
    newlyGeneratedEventIds: string[];
    reactivatedDormantAdmission: boolean;
    fixedOutcomeCount: number;
    persistentRecurrenceOutcomeCount: number;
    openOutcomeCount: number;
    previousEvidenceDigest: string;
    evidenceDigest: string;
}

export interface EndogenousFiniteRealizationCertificate {
    mode: "bubble-endogenous-finite-realization-certificate.v1";
    infiniteDenotation: {
        kind: "potentially-unbounded" | "finite-by-current-constructor-graph";
        naturalConstructorIds: string[];
        recursiveConstructorIds: string[];
        infinityRemainsIntensional: true;
        finiteMaterializationIsWholeUniverse: boolean;
    };
    finiteCut: {
        kind: "finite-internal-demand-cut";
        externalObserverRequired: false;
        demandDigest: string;
        demand: EndogenousUniverseMaterialization["options"] & {
            maxGenerationClosures: number;
            maxGenerationBranches: number;
        };
        deterministicEvaluation: true;
        selectsBranch: false;
        resultForm: "single-closed-result" | "complete-closed-branch-family" | "open-boundary" | "contradiction";
        worldOutcomeDecided: boolean;
        completeBranchCount: number;
    };
    selfComplementation: {
        kind: "monotone-realization-evidence";
        status: "closed-for-demand" | "progressed-but-open" | "open-without-progress" | "contradicted";
        steps: EndogenousSelfComplementationStep[];
        finalEvidenceDigest: string;
        evidenceLedgerMonotone: true;
        worldStateMonotonicityClaim: false;
        convergenceGuaranteed: false;
        demandedClosureReached: boolean;
        remainingFrontierKinds: EndogenousUniverseMaterialization["frontiers"][number]["kind"][];
        wholeUniverseCompletionClaim: false;
    };
}

export interface EndogenousWorldContinuationEvidence {
    worldId: string;
    schemaId: string;
    schemaRevisionId: string;
    generated: boolean;
    localLawIds: string[];
    realizedLawIds: string[];
    continuationIds: string[];
    receivedTransportIds: string[];
    hostSelection: false;
}

export interface EndogenousGenerationCausalEdge {
    from: string;
    to: string;
    kind:
        | "constructor-causes-world"
        | "world-binds-anchor"
        | "anchor-carries-sea-relation"
        | "anchor-carries-exact-transport"
        | "transport-enters-world"
        | "constructor-transforms-schema"
        | "schema-revision-causes-schema-revision"
        | "schema-revision-enters-world";
}

export interface EndogenousConnectedUniverseRun {
    mode: "bubble-endogenous-connected-universe-run.v1";
    programDigest: string;
    status: "resolved" | "undetermined" | "contradicted";
    reason: string;
    materialization: EndogenousUniverseMaterialization;
    compiledProgramDigest?: string;
    representativeCausalClosureId?: string;
    generationClosures: EndogenousGenerationCausalClosure[];
    branchUniverses: EndogenousGeneratedUniverseBranch[];
    recurrenceCertificates: EndogenousGeneratedRecurrenceCertificate[];
    finiteRealization: EndogenousFiniteRealizationCertificate;
    generationClosure: {
        limit: number;
        branchLimit: number;
        count: number;
        branchCount: number;
        fixpointReached: boolean;
        recurrentConfigurationDetected: boolean;
        persistentRecurrenceCertified: boolean;
        limitExhausted: boolean;
        branchLimitExhausted: boolean;
        pluralContinuationPreserved: boolean;
    };
    worldContinuations: EndogenousWorldContinuationEvidence[];
    generationCausalEdges: EndogenousGenerationCausalEdge[];
    scalarProjection: {
        presentOnlyAtLegacyCausalBoundary: true;
        ontologicalSeaChannelsRemainDistinct: true;
    };
}

export interface EndogenousConnectedUniverseInspection {
    mode: "bubble-endogenous-connected-universe-inspection.v1";
    summary: {
        status: EndogenousConnectedUniverseRun["status"];
        reason: string;
        worldCount: number;
        generatedWorldCount: number;
        anchorCount: number;
        relationAnchorCount: number;
        relationTransportCount: number;
        schemaTransformationEventCount: number;
        seaChannelCount: number;
        frontierCount: number;
        demandedSliceComplete: boolean;
        exhaustiveUniverse: boolean;
        causalContinuationCount: number;
        generatedUniverseBranchCount: number;
        generationClosureCount: number;
        generationFixpointReached: boolean;
        recurrentGenerationConfigurationDetected: boolean;
        persistentGenerationRecurrenceCertified: boolean;
        recurrenceCertificateCount: number;
        generationBranchLimitExhausted: boolean;
        finiteCutResultForm: EndogenousFiniteRealizationCertificate["finiteCut"]["resultForm"];
        selfComplementationStatus: EndogenousFiniteRealizationCertificate["selfComplementation"]["status"];
        everyMaterializedWorldHasContinuationEvidence: boolean;
        hostSelection: false;
        universalClock: false;
    };
    topology: {
        worlds: EndogenousUniverseMaterialization["worlds"];
        anchors: EndogenousUniverseMaterialization["anchors"];
        generationEvents: EndogenousUniverseMaterialization["generationEvents"];
        schemaTransformationEvents: EndogenousUniverseMaterialization["schemaTransformationEvents"];
        frontiers: EndogenousUniverseMaterialization["frontiers"];
        causalEdges: EndogenousGenerationCausalEdge[];
    };
    worldContinuations: EndogenousWorldContinuationEvidence[];
    branches: EndogenousGeneratedUniverseBranch[];
    recurrenceCertificates: EndogenousGeneratedRecurrenceCertificate[];
    finiteRealization: EndogenousFiniteRealizationCertificate;
    causal?: AnchoredCausalInspection;
}

export interface EndogenousConnectedUniverseReplayRecord {
    mode: "bubble-endogenous-connected-universe-replay.v1";
    programDigest: string;
    runDigest: string;
    program: EndogenousUniverseProgram;
    options: EndogenousConnectedUniverseExecutionOptions;
    run: EndogenousConnectedUniverseRun;
}

export interface EndogenousConnectedUniverseReplayResult {
    mode: "bubble-endogenous-connected-universe-replay-result.v1";
    status: "verified" | "integrity-failed" | "reexecution-drift";
    reason: string;
    recordedProgramDigest: string;
    actualProgramDigest: string;
    recordedRunDigest: string;
    storedRunDigest: string;
    replayedRunDigest?: string;
    run?: EndogenousConnectedUniverseRun;
}

function generationEdges(materialization: EndogenousUniverseMaterialization): EndogenousGenerationCausalEdge[] {
    const edges: EndogenousGenerationCausalEdge[] = [];
    for (const event of materialization.generationEvents) {
        edges.push({ from: `constructor:${event.constructorId}`, to: event.id, kind: "constructor-causes-world" });
        edges.push({ from: `world:${event.parentWorldId}`, to: event.id, kind: "constructor-causes-world" });
        edges.push({ from: event.id, to: `world:${event.childWorldId}`, kind: "constructor-causes-world" });
    }
    for (const event of materialization.schemaTransformationEvents) {
        edges.push({
            from: `constructor:${event.constructorId}`,
            to: event.id,
            kind: "constructor-transforms-schema",
        });
        edges.push({
            from: `schema-revision:${event.sourceRevisionId}`,
            to: event.id,
            kind: "schema-revision-causes-schema-revision",
        });
        edges.push({
            from: event.id,
            to: `world:${event.childWorldId}`,
            kind: "schema-revision-enters-world",
        });
    }
    for (const anchor of materialization.anchors) {
        for (const endpoint of anchor.endpoints) {
            edges.push({ from: `world:${endpoint.worldId}`, to: `anchor:${anchor.id}`, kind: "world-binds-anchor" });
        }
        if (anchor.seaActions.length > 0) {
            edges.push({ from: `anchor:${anchor.id}`, to: `sea-relation:${anchor.id}`, kind: "anchor-carries-sea-relation" });
        }
        for (const transport of anchor.transports) {
            edges.push({ from: `anchor:${anchor.id}`, to: transport.id, kind: "anchor-carries-exact-transport" });
            edges.push({ from: transport.id, to: `world:${transport.target.worldId}`, kind: "transport-enters-world" });
        }
    }
    return edges.sort((left, right) => (
        compareCanonicalStrings(left.from, right.from)
        || compareCanonicalStrings(left.to, right.to)
        || compareCanonicalStrings(left.kind, right.kind)
    ));
}

function continuationEvidence(
    _source: EndogenousUniverseProgram,
    materialization: EndogenousUniverseMaterialization,
    causalWitnesses: Array<{
        causalRun: AnchoredCausalRun;
        continuationId?: string;
        branchId?: string;
    }> = [],
): EndogenousWorldContinuationEvidence[] {
    const traces = causalWitnesses.flatMap((witness, closureIndex) => witness.causalRun.continuations
        .filter((continuation) => !witness.continuationId || continuation.id === witness.continuationId)
        .flatMap((continuation) => (
        continuation.trace.map((entry) => ({
            continuationId: `branch:${witness.branchId ?? "common"}:closure:${closureIndex}:${continuation.id}`,
            entry,
        }))
    )));
    const transports = materialization.anchors.flatMap((anchor) => anchor.transports);
    return materialization.worlds.map((world) => {
        const localLawIds = world.schemaRevision.internalLaws.map((law) => `${world.id}-${law.id}`).sort();
        const witnessed = traces.filter(({ entry }) => entry.worldId === world.id && entry.kind === "internal-law");
        return {
            worldId: world.id,
            schemaId: world.schemaId,
            schemaRevisionId: world.schemaRevision.id,
            generated: !!world.parentWorldId,
            localLawIds,
            realizedLawIds: [...new Set(witnessed.map(({ entry }) => entry.lawId).filter((id): id is string => !!id))].sort(),
            continuationIds: [...new Set(witnessed.map(({ continuationId }) => continuationId))].sort(),
            receivedTransportIds: transports
                .filter((transport) => transport.target.worldId === world.id)
                .map((transport) => transport.id)
                .sort(),
            hostSelection: false as const,
        };
    }).sort((left, right) => compareCanonicalStrings(left.worldId, right.worldId));
}

function generationConfigurationDigest(materialization: EndogenousUniverseMaterialization): string {
    return digestEndogenousValue({
        worlds: materialization.worlds,
        anchors: materialization.anchors,
        generationEvents: materialization.generationEvents,
        schemaTransformationEvents: materialization.schemaTransformationEvents,
        frontiers: materialization.frontiers,
    });
}

interface EndogenousIdentityCutAssessment {
    evidence: EndogenousIdentityCutEvidence[];
    dependencyFieldKeys: string[];
    allHeld: boolean;
    unresolved: boolean;
}

interface EndogenousSeenGenerationConfiguration {
    closureIndex: number;
    historyEntryCount: number;
    worldStructureDigest: string;
    anchorSetDigest: string;
    generationEventSetDigest: string;
    identity: EndogenousIdentityCutAssessment;
}

function worldStructureDigest(materialization: EndogenousUniverseMaterialization): string {
    return digestEndogenousValue(materialization.worlds.map((world) => ({
        id: world.id,
        schemaId: world.schemaId,
        address: world.address,
        parentWorldId: world.parentWorldId,
        generatedByEventId: world.generatedByEventId,
        schemaRevision: world.schemaRevision,
    })));
}

function anchorSetDigest(materialization: EndogenousUniverseMaterialization): string {
    return digestEndogenousValue(materialization.anchors);
}

function generationEventSetDigest(materialization: EndogenousUniverseMaterialization): string {
    return digestEndogenousValue(materialization.generationEvents);
}

function assessIdentityAtCut(
    program: EndogenousUniverseProgram,
    materialization: EndogenousUniverseMaterialization,
): EndogenousIdentityCutAssessment {
    const worlds = new Map(materialization.worlds.map((world) => [world.id, world]));
    const dependencyFieldKeys = [...new Set(materialization.anchors.flatMap((anchor) => (
        anchor.identityPredicates.flatMap((predicate) => predicate.fieldParameters.map((binding) => (
            `${binding.worldId}.${binding.fieldId}`
        )))
    )))].sort();
    const evidence = materialization.anchors.flatMap((anchor) => anchor.identityPredicates.map((predicate) => {
        const parameters = structuredClone(predicate.query.parameters);
        let missingField: string | undefined;
        for (const binding of predicate.fieldParameters) {
            const key = `${binding.worldId}.${binding.fieldId}`;
            const value = worlds.get(binding.worldId)?.fields[binding.fieldId];
            if (!value) {
                missingField = key;
                break;
            }
            parameters[binding.parameterName] = structuredClone(value);
        }
        if (missingField) {
            return {
                anchorId: anchor.id,
                predicateId: predicate.id,
                status: "contradicted" as const,
                proofDigest: digestEndogenousValue([]),
                reason: `identity dependency '${missingField}' is unavailable`,
            };
        }
        const result = evaluateIntensionalCoordinate(program.formal, {
            ...structuredClone(predicate.query),
            parameters,
        }, { budget: materialization.options.evaluationBudgetPerQuery });
        const proofDigest = digestEndogenousValue(result.proof);
        if (result.status !== "resolved" || !result.value) {
            return {
                anchorId: anchor.id,
                predicateId: predicate.id,
                status: result.status === "undetermined" ? "undetermined" as const : "contradicted" as const,
                proofDigest,
                ...(result.reason ? { reason: result.reason } : {}),
            };
        }
        if (result.value.kind !== "boolean") {
            return {
                anchorId: anchor.id,
                predicateId: predicate.id,
                status: "contradicted" as const,
                valueDigest: digestEndogenousValue(result.value),
                proofDigest,
                reason: "identity predicate did not resolve to an exact boolean",
            };
        }
        return {
            anchorId: anchor.id,
            predicateId: predicate.id,
            status: result.value.value ? "held" as const : "failed" as const,
            valueDigest: digestEndogenousValue(result.value),
            proofDigest,
            ...(!result.value.value ? { reason: "identity predicate is false at this recurrence cut" } : {}),
        };
    })).sort((left, right) => (
        compareCanonicalStrings(left.anchorId, right.anchorId) || compareCanonicalStrings(left.predicateId, right.predicateId)
    ));
    return {
        evidence,
        dependencyFieldKeys,
        allHeld: evidence.length > 0 && evidence.every((entry) => entry.status === "held"),
        unresolved: evidence.some((entry) => entry.status === "undetermined"),
    };
}

function causalGenerationHistoryExtension(
    closureId: string,
    continuation: AnchoredCausalRun["continuations"][number],
    newlyGeneratedEventIds: string[],
    materialization: EndogenousUniverseMaterialization,
): EndogenousCausalGenerationHistoryEntry[] {
    const traceByEventId = new Map(continuation.trace
        .filter((entry) => !!entry.eventId)
        .map((entry) => [entry.eventId!, entry]));
    const causalEntries = continuation.realizedEventIds.flatMap((eventId) => {
        const trace = traceByEventId.get(eventId);
        if (trace?.kind === "history-commit") return [];
        return [{
            id: `history-${digestEndogenousValue({ closureId, continuationId: continuation.id, kind: "causal", eventId }).slice(0, 20)}`,
            closureId,
            causalContinuationId: continuation.id,
            kind: trace?.kind === "anchor-transfer" ? "anchor-transfer" as const : "causal-event" as const,
            evidenceId: eventId,
            anchorIds: trace?.anchorId ? [trace.anchorId] : [],
            causedByIds: [...(trace?.causes ?? [])].sort(),
            affectedFieldKeys: [...new Set((trace?.effects ?? []).map((effect) => (
                `${effect.worldId ?? trace!.worldId}.${effect.fieldId}`
            )))].sort(),
            hostSelection: false as const,
        }];
    });
    const commitEntries = continuation.historyCommits.map((commit) => ({
        id: `history-${digestEndogenousValue({ closureId, continuationId: continuation.id, kind: "commit", commit }).slice(0, 20)}`,
        closureId,
        causalContinuationId: continuation.id,
        kind: "history-commit" as const,
        evidenceId: commit.eventId,
        anchorIds: [] as string[],
        causedByIds: [commit.causedByEventId],
        affectedFieldKeys: Object.keys(commit.affectedFields).map((fieldId) => `${commit.worldId}.${fieldId}`).sort(),
        hostSelection: false as const,
    }));
    const generationEntries = newlyGeneratedEventIds.map((eventId) => {
        const event = materialization.generationEvents.find((candidate) => candidate.id === eventId)!;
        const anchorIds = materialization.anchors.filter((anchor) => (
            anchor.endpoints.some((endpoint) => endpoint.worldId === event.childWorldId)
        )).map((anchor) => anchor.id).sort();
        return {
            id: `history-${digestEndogenousValue({ closureId, continuationId: continuation.id, kind: "generation", eventId }).slice(0, 20)}`,
            closureId,
            causalContinuationId: continuation.id,
            kind: "generation-event" as const,
            evidenceId: eventId,
            anchorIds,
            causedByIds: [...event.causes].sort(),
            affectedFieldKeys: [] as string[],
            hostSelection: false as const,
        };
    });
    return [...causalEntries, ...commitEntries, ...generationEntries].sort((left, right) => compareCanonicalStrings(left.id, right.id));
}

function certifyGeneratedRecurrence(
    program: EndogenousUniverseProgram,
    branchId: string,
    closure: EndogenousGenerationCausalClosure,
    continuation: AnchoredCausalRun["continuations"][number],
    continued: EndogenousUniverseMaterialization,
    seen: EndogenousSeenGenerationConfiguration,
    historyEntries: EndogenousCausalGenerationHistoryEntry[],
): EndogenousGeneratedRecurrenceCertificate {
    const identityAtRecurrence = assessIdentityAtCut(program, continued);
    const repeatedConfigurationDigest = generationConfigurationDigest(continued);
    const worldDigest = worldStructureDigest(continued);
    const currentAnchorDigest = anchorSetDigest(continued);
    const currentGenerationDigest = generationEventSetDigest(continued);
    const extensionEntries = historyEntries.slice(seen.historyEntryCount);
    const committedHistoryExtensionCount = extensionEntries.filter((entry) => (
        entry.kind === "history-commit" || entry.kind === "generation-event"
    )).length;
    const mutatedFields = new Set(extensionEntries.flatMap((entry) => entry.affectedFieldKeys));
    const identityDependencyFieldKeys = [...new Set([
        ...seen.identity.dependencyFieldKeys,
        ...identityAtRecurrence.dependencyFieldKeys,
    ])].sort();
    const mutatedIdentityDependencyFieldKeys = identityDependencyFieldKeys
        .filter((key) => mutatedFields.has(key));
    const topologyPrefixPreserved = seen.anchorSetDigest === currentAnchorDigest
        && seen.generationEventSetDigest === currentGenerationDigest;
    const worldHistoryExtended = committedHistoryExtensionCount > 0;
    const evidenceAtStart = digestEndogenousValue(seen.identity.evidence.map((entry) => ({
        anchorId: entry.anchorId,
        predicateId: entry.predicateId,
        status: entry.status,
        valueDigest: entry.valueDigest,
    })));
    const evidenceAtRecurrence = digestEndogenousValue(identityAtRecurrence.evidence.map((entry) => ({
        anchorId: entry.anchorId,
        predicateId: entry.predicateId,
        status: entry.status,
        valueDigest: entry.valueDigest,
    })));
    const invariantAcrossCycleCuts = seen.worldStructureDigest === worldDigest
        && seen.identity.allHeld
        && identityAtRecurrence.allHeld
        && evidenceAtStart === evidenceAtRecurrence;
    const dependenciesUnmodifiedWithinCycle = mutatedIdentityDependencyFieldKeys.length === 0;
    const unresolved = seen.identity.unresolved || identityAtRecurrence.unresolved;
    const certified = !unresolved
        && invariantAcrossCycleCuts
        && dependenciesUnmodifiedWithinCycle
        && topologyPrefixPreserved
        && extensionEntries.length > 0
        && continuation.realizedEventIds.length > 0;
    const reasons = [
        ...(!topologyPrefixPreserved ? ["generated anchor or generation-event history did not preserve its recurrence prefix"] : []),
        ...(!invariantAcrossCycleCuts ? ["world lineage or exact anchor identity is not invariant across recurrence cuts"] : []),
        ...(!dependenciesUnmodifiedWithinCycle ? ["a causal event mutated an anchor-identity dependency inside the proposed recurrence"] : []),
        ...(extensionEntries.length === 0 || continuation.realizedEventIds.length === 0
            ? ["the proposed active recurrence did not extend causal-generation evidence"] : []),
    ];
    const status: EndogenousGeneratedRecurrenceCertificate["status"] = certified
        ? "certified"
        : unresolved ? "undetermined" : "not-certified";
    const reason = certified
        ? "the causal-generation configuration recurs with invariant lineage identity and a monotone anchored-history extension"
        : reasons.join("; ") || "recurrence identity remains unresolved";
    return {
        mode: "bubble-endogenous-generated-recurrence-certificate.v1",
        id: `generated-recurrence-${digestEndogenousValue({
            branchId,
            closureId: closure.id,
            continuationId: continuation.id,
            repeatedConfigurationDigest,
        }).slice(0, 20)}`,
        branchId,
        closureId: closure.id,
        causalContinuationId: continuation.id,
        status,
        reason,
        cycle: {
            scope: "causal-generation-configuration",
            startClosureIndex: seen.closureIndex,
            recurrenceClosureIndex: closure.index,
            periodClosures: closure.index - seen.closureIndex + 1,
            repeatedConfigurationDigest,
            realizedActivityRequired: true,
        },
        identity: {
            worldStructureDigestAtCycleStart: seen.worldStructureDigest,
            worldStructureDigestAtRecurrence: worldDigest,
            stableWorldIds: continued.worlds.map((world) => world.id).sort(),
            identityDependencyFieldKeys,
            mutatedIdentityDependencyFieldKeys,
            predicatesAtCycleStart: structuredClone(seen.identity.evidence),
            predicatesAtRecurrence: structuredClone(identityAtRecurrence.evidence),
            invariantAcrossCycleCuts,
            dependenciesUnmodifiedWithinCycle,
        },
        anchoredHistory: {
            mode: "monotone-causal-generation-anchor-ledger",
            anchorSetDigestAtCycleStart: seen.anchorSetDigest,
            anchorSetDigestAtRecurrence: currentAnchorDigest,
            generationEventSetDigestAtCycleStart: seen.generationEventSetDigest,
            generationEventSetDigestAtRecurrence: currentGenerationDigest,
            topologyPrefixPreserved,
            entryCountAtCycleStart: seen.historyEntryCount,
            entryCountAtRecurrence: historyEntries.length,
            extensionCount: extensionEntries.length,
            causalEvidenceExtensionCount: extensionEntries.filter((entry) => (
                entry.kind === "causal-event" || entry.kind === "anchor-transfer"
            )).length,
            committedHistoryExtensionCount,
            worldHistoryExtended,
            extensionDigest: digestEndogenousValue(extensionEntries),
            extensionEntries: structuredClone(extensionEntries),
            fullAnchoredStateRepeated: topologyPrefixPreserved && !worldHistoryExtended,
        },
        hostSelection: false,
    };
}

function recursiveConstructorIds(program: EndogenousUniverseProgram): string[] {
    const children = new Map<string, string[]>();
    for (const constructor of program.constructors) {
        const current = children.get(constructor.parentSchemaId) ?? [];
        current.push(constructor.childSchemaId);
        children.set(constructor.parentSchemaId, current);
    }
    const reaches = (start: string, target: string): boolean => {
        const queue = [start];
        const visited = new Set<string>();
        while (queue.length > 0) {
            const schemaId = queue.shift()!;
            if (schemaId === target) return true;
            if (visited.has(schemaId)) continue;
            visited.add(schemaId);
            queue.push(...(children.get(schemaId) ?? []));
        }
        return false;
    };
    return program.constructors
        .filter((constructor) => reaches(constructor.childSchemaId, constructor.parentSchemaId))
        .map((constructor) => constructor.id)
        .sort();
}

function finiteRealizationCertificate(
    program: EndogenousUniverseProgram,
    run: Omit<EndogenousConnectedUniverseRun, "finiteRealization">,
): EndogenousFiniteRealizationCertificate {
    const naturalConstructorIds = program.constructors
        .filter((constructor) => constructor.coordinates.kind === "natural")
        .map((constructor) => constructor.id)
        .sort();
    const recursiveIds = recursiveConstructorIds(program);
    const potentiallyUnbounded = naturalConstructorIds.length > 0 || recursiveIds.length > 0;
    const demand = {
        ...run.materialization.options,
        maxGenerationClosures: run.generationClosure.limit,
        maxGenerationBranches: run.generationClosure.branchLimit,
    };
    const demandDigest = digestEndogenousValue(demand);
    let previousEvidenceDigest = digestEndogenousValue({
        programDigest: run.programDigest,
        demandDigest,
        basis: "finite-internal-demand-cut",
    });
    const steps = run.generationClosures.map((closure): EndogenousSelfComplementationStep => {
        const newlyGeneratedEventIds = [...new Set([
            ...closure.newlyGeneratedEventIds,
            ...closure.outcomes.flatMap((outcome) => outcome.newlyGeneratedEventIds),
        ])].sort();
        const derivedBranchIds = [...new Set(closure.outcomes.map((outcome) => outcome.branchId))].sort();
        const evidenceDigest = digestEndogenousValue({
            previousEvidenceDigest,
            closureId: closure.id,
            inputConfigurationDigest: closure.inputConfigurationDigest,
            outcomes: closure.outcomes.map((outcome) => ({
                branchId: outcome.branchId,
                status: outcome.status,
                outputConfigurationDigest: outcome.outputConfigurationDigest,
                newlyGeneratedEventIds: outcome.newlyGeneratedEventIds,
                recurrenceCertificateId: outcome.recurrenceCertificateId,
            })),
            realizedEventCount: closure.realizedEventCount,
        });
        const step = {
            closureId: closure.id,
            closureIndex: closure.index,
            inputBranchId: closure.inputBranchId,
            inputWorldCount: closure.inputWorldCount,
            inputFrontierCount: closure.inputFrontierCount,
            inputDormantAdmissionCount: closure.inputDormantAdmissionCount,
            realizedEventCount: closure.realizedEventCount,
            derivedBranchIds,
            newlyGeneratedEventIds,
            reactivatedDormantAdmission: closure.inputDormantAdmissionCount > 0
                && closure.outcomes.some((outcome) => outcome.newlyGeneratedEventIds.length > 0),
            fixedOutcomeCount: closure.outcomes.filter((outcome) => outcome.status === "fixpoint").length,
            persistentRecurrenceOutcomeCount: closure.outcomes.filter(
                (outcome) => outcome.status === "persistent-recurrence",
            ).length,
            openOutcomeCount: closure.outcomes.filter((outcome) => outcome.status === "active" || outcome.status === "undetermined").length,
            previousEvidenceDigest,
            evidenceDigest,
        };
        previousEvidenceDigest = evidenceDigest;
        return step;
    });
    const branchMaterializations = run.branchUniverses.map((branch) => (
        branch.evidenceLocation === "top-level" ? run.materialization : branch.materialization
    )).filter((materialization): materialization is EndogenousUniverseMaterialization => !!materialization);
    const remainingFrontierKinds = [...new Set(branchMaterializations
        .flatMap((materialization) => materialization.frontiers.map((frontier) => frontier.kind)))].sort();
    const demandedClosureReached = run.status === "resolved"
        && (run.generationClosure.fixpointReached || run.generationClosure.persistentRecurrenceCertified);
    const progressed = steps.some((step) => (
        step.realizedEventCount > 0
        || step.newlyGeneratedEventIds.length > 0
        || step.derivedBranchIds.length > 1
    ));
    const resultForm: EndogenousFiniteRealizationCertificate["finiteCut"]["resultForm"] = run.status === "contradicted"
        ? "contradiction"
        : run.status !== "resolved"
            ? "open-boundary"
            : run.branchUniverses.length > 1
                ? "complete-closed-branch-family"
                : "single-closed-result";
    const selfComplementationStatus: EndogenousFiniteRealizationCertificate["selfComplementation"]["status"] = run.status === "contradicted"
        ? "contradicted"
        : demandedClosureReached
            ? "closed-for-demand"
            : progressed
                ? "progressed-but-open"
                : "open-without-progress";
    return {
        mode: "bubble-endogenous-finite-realization-certificate.v1",
        infiniteDenotation: {
            kind: potentiallyUnbounded ? "potentially-unbounded" : "finite-by-current-constructor-graph",
            naturalConstructorIds,
            recursiveConstructorIds: recursiveIds,
            infinityRemainsIntensional: true,
            finiteMaterializationIsWholeUniverse: !potentiallyUnbounded
                && branchMaterializations.length > 0
                && branchMaterializations.every((materialization) => materialization.coverage.exhaustiveUniverse),
        },
        finiteCut: {
            kind: "finite-internal-demand-cut",
            externalObserverRequired: false,
            demandDigest,
            demand,
            deterministicEvaluation: true,
            selectsBranch: false,
            resultForm,
            worldOutcomeDecided: run.status === "resolved",
            completeBranchCount: run.status === "resolved" ? run.branchUniverses.length : 0,
        },
        selfComplementation: {
            kind: "monotone-realization-evidence",
            status: selfComplementationStatus,
            steps,
            finalEvidenceDigest: previousEvidenceDigest,
            evidenceLedgerMonotone: true,
            worldStateMonotonicityClaim: false,
            convergenceGuaranteed: false,
            demandedClosureReached,
            remainingFrontierKinds,
            wholeUniverseCompletionClaim: false,
        },
    };
}

export function realizeEndogenousConnectedUniverse(
    program: EndogenousUniverseProgram,
    options: EndogenousConnectedUniverseExecutionOptions = {},
): EndogenousConnectedUniverseRun {
    const initialMaterialization = materializeEndogenousUniverse(program, options.generation);
    const programDigest = digestEndogenousValue(program);
    const closureLimit = options.maxGenerationClosures ?? 2;
    const branchLimit = options.maxGenerationBranches ?? 64;
    const closures: EndogenousGenerationCausalClosure[] = [];
    let fixpointReached = false;
    let recurrentConfigurationDetected = false;
    let limitExhausted = false;
    let branchLimitExhausted = false;
    let commonMaterialization = initialMaterialization;
    const recurrenceCertificates: EndogenousGeneratedRecurrenceCertificate[] = [];

    interface RuntimeBranch {
        id: string;
        lineage: EndogenousGenerationBranchStep[];
        materialization: EndogenousUniverseMaterialization;
        knownGenerationEventIds: Set<string>;
        seenConfigurations: Map<string, EndogenousSeenGenerationConfiguration>;
        historyEntries: EndogenousCausalGenerationHistoryEntry[];
        closureIds: string[];
        witnesses: Array<{
            causalRun: AnchoredCausalRun;
            continuationId?: string;
            branchId: string;
        }>;
    }

    interface TerminalBranch extends RuntimeBranch {
        terminalStatus: EndogenousGeneratedUniverseBranch["status"];
        terminalReason: string;
        terminalClosureKind: EndogenousGeneratedUniverseBranch["closureKind"];
    }

    const rootBranch: RuntimeBranch = {
        id: `generation-branch-${digestEndogenousValue({ programDigest, root: true }).slice(0, 20)}`,
        lineage: [],
        materialization: initialMaterialization,
        knownGenerationEventIds: new Set<string>(),
        seenConfigurations: new Map<string, EndogenousSeenGenerationConfiguration>(),
        historyEntries: [],
        closureIds: [],
        witnesses: [],
    };

    const terminal = (
        branch: RuntimeBranch,
        terminalStatus: TerminalBranch["terminalStatus"],
        terminalReason: string,
        terminalClosureKind: TerminalBranch["terminalClosureKind"] = terminalStatus === "resolved"
            ? "fixpoint"
            : terminalStatus === "contradicted" ? "contradiction" : "open",
    ): TerminalBranch => ({ ...branch, terminalStatus, terminalReason, terminalClosureKind });

    const deriveBranchStep = (
        parentBranchId: string,
        closureIndex: number,
        continuation: AnchoredCausalRun["continuations"][number],
    ): EndogenousGenerationBranchStep => ({
        id: `generation-branch-step-${digestEndogenousValue({
            parentBranchId,
            closureIndex,
            causalContinuationId: continuation.id,
        }).slice(0, 20)}`,
        closureIndex,
        parentBranchId,
        causalContinuationId: continuation.id,
        causalInternalBranchStepIds: (continuation.branchLineage ?? []).map((branchStep) => branchStep.id),
        hostSelection: false,
    });

    const deriveBranchId = (parentBranchId: string, stepId: string): string => (
        `generation-branch-${digestEndogenousValue({ parentBranchId, stepId }).slice(0, 20)}`
    );

    const publicBranch = (branch: TerminalBranch, evidenceLocation: "top-level" | "branch-local"): EndogenousGeneratedUniverseBranch => ({
        id: branch.id,
        lineage: structuredClone(branch.lineage),
        status: branch.terminalStatus,
        closureKind: branch.terminalClosureKind,
        reason: branch.terminalReason,
        configurationDigest: generationConfigurationDigest(branch.materialization),
        evidenceLocation,
        ...(evidenceLocation === "branch-local" ? {
            materialization: structuredClone(branch.materialization),
            worldContinuations: continuationEvidence(program, branch.materialization, branch.witnesses),
            generationCausalEdges: generationEdges(branch.materialization),
        } : {}),
        closureIds: [...branch.closureIds],
        hostSelection: false,
    });

    const assemble = (
        terminalBranches: TerminalBranch[],
        forcedStatus?: EndogenousConnectedUniverseRun["status"],
        forcedReason?: string,
    ): EndogenousConnectedUniverseRun => {
        const singular = terminalBranches.length === 1 ? terminalBranches[0] : undefined;
        const branchUniverses = terminalBranches
            .map((branch) => publicBranch(branch, singular ? "top-level" : "branch-local"))
            .sort((left, right) => compareCanonicalStrings(left.id, right.id));
        const materialization = singular?.materialization ?? commonMaterialization;
        const causalRun = singular?.witnesses.at(-1)?.causalRun;
        const representativeCausalClosureId = singular?.closureIds.at(-1);
        const statuses = terminalBranches.map((branch) => branch.terminalStatus);
        const status = forcedStatus
            ?? (statuses.length > 0 && statuses.every((candidate) => candidate === "resolved")
                ? "resolved"
                : statuses.length > 0 && statuses.every((candidate) => candidate === "contradicted")
                    ? "contradicted"
                    : "undetermined");
        const reason = forcedReason
            ?? (status === "resolved"
                ? terminalBranches.length > 1
                    ? terminalBranches.some((branch) => branch.terminalClosureKind === "persistent-recurrence")
                        ? "every endogenously preserved universe branch closed by fixpoint or certified persistent recurrence"
                        : "every endogenously preserved universe branch reached its own finite demanded closure fixpoint"
                    : terminalBranches[0]?.terminalClosureKind === "persistent-recurrence"
                        ? "generated topology and autonomous world law reached a certified persistent recurrence"
                        : "generated topology and autonomous world law reached a finite demanded closure fixpoint"
                : terminalBranches.length > 1
                    ? "the complete generated branch family remains represented, with at least one branch still open or contradicted"
                    : terminalBranches[0]?.terminalReason ?? "no generated universe branch established closure");
        fixpointReached = terminalBranches.length > 0 && terminalBranches.every((branch) => (
            branch.terminalStatus === "resolved" && branch.terminalClosureKind === "fixpoint"
        ));
        const persistentRecurrenceCertified = terminalBranches.some((branch) => (
            branch.terminalClosureKind === "persistent-recurrence"
        )) && terminalBranches.every((branch) => branch.terminalStatus === "resolved");
        const commonWitnesses = closures.map((closure) => ({
            causalRun: closure.causalRun,
            branchId: closure.inputBranchId,
        }));
        const baseRun: Omit<EndogenousConnectedUniverseRun, "finiteRealization"> = {
            mode: "bubble-endogenous-connected-universe-run.v1",
            programDigest,
            materialization,
            status,
            reason,
            ...(causalRun ? { compiledProgramDigest: causalRun.programDigest } : {}),
            ...(representativeCausalClosureId ? { representativeCausalClosureId } : {}),
            generationClosures: structuredClone(closures),
            branchUniverses,
            recurrenceCertificates: structuredClone(recurrenceCertificates),
            generationClosure: {
                limit: closureLimit,
                branchLimit,
                count: closures.length,
                branchCount: branchUniverses.length,
                fixpointReached,
                recurrentConfigurationDetected,
                persistentRecurrenceCertified,
                limitExhausted: limitExhausted || branchLimitExhausted,
                branchLimitExhausted,
                pluralContinuationPreserved: true,
            },
            worldContinuations: singular
                ? continuationEvidence(program, materialization, singular.witnesses)
                : continuationEvidence(program, materialization, commonWitnesses),
            generationCausalEdges: generationEdges(materialization),
            scalarProjection: {
                presentOnlyAtLegacyCausalBoundary: true,
                ontologicalSeaChannelsRemainDistinct: true,
            },
        };
        return {
            ...baseRun,
            finiteRealization: finiteRealizationCertificate(program, baseRun),
        };
    };

    if (!Number.isSafeInteger(closureLimit) || closureLimit < 1) {
        return assemble(
            [terminal(rootBranch, "contradicted", "generation closure limit must be a positive safe integer")],
            "contradicted",
            "generation closure limit must be a positive safe integer",
        );
    }
    if (!Number.isSafeInteger(branchLimit) || branchLimit < 1) {
        return assemble(
            [terminal(rootBranch, "contradicted", "generation branch limit must be a positive safe integer")],
            "contradicted",
            "generation branch limit must be a positive safe integer",
        );
    }
    if (initialMaterialization.status !== "resolved" || !initialMaterialization.coverage.demandedSliceComplete) {
        return assemble([
            terminal(rootBranch, initialMaterialization.status, initialMaterialization.reason),
        ], initialMaterialization.status, initialMaterialization.reason);
    }

    let activeBranches: RuntimeBranch[] = [rootBranch];
    const terminalBranches: TerminalBranch[] = [];
    for (let closureIndex = 0; closureIndex < closureLimit; closureIndex += 1) {
        if (activeBranches.length === 1 && terminalBranches.length === 0) {
            commonMaterialization = activeBranches[0]!.materialization;
        }
        const executable: Array<{
            branch: RuntimeBranch;
            causalRun: AnchoredCausalRun;
            closure: EndogenousGenerationCausalClosure;
        }> = [];

        for (const branch of activeBranches) {
            const inputConfigurationDigest = generationConfigurationDigest(branch.materialization);
            const compiled = compileEndogenousUniverse(program, branch.materialization);
            if (!compiled) {
                terminalBranches.push(terminal(
                    branch,
                    "undetermined",
                    "the generated slice has no complete legacy causal projection; its worldhood remains represented without fabricated execution",
                ));
                continue;
            }
            const causalRun = realizeAnchoredCausalWorld(
                compiled.program,
                causalOptionsForEndogenousCompilation(compiled, options.causal),
            );
            const generationEventIds = branch.materialization.generationEvents.map((event) => event.id).sort();
            const closureId = `generation-closure-${digestEndogenousValue({
                branchId: branch.id,
                closureIndex,
                inputConfigurationDigest,
            }).slice(0, 20)}`;
            const closure: EndogenousGenerationCausalClosure = {
                id: closureId,
                index: closureIndex,
                inputBranchId: branch.id,
                inputBranchLineage: structuredClone(branch.lineage),
                inputWorldCount: branch.materialization.worlds.length,
                inputFrontierCount: branch.materialization.frontiers.length,
                inputDormantAdmissionCount: branch.materialization.frontiers.filter(
                    (frontier) => frontier.kind === "admission-closed",
                ).length,
                inputConfigurationDigest,
                realizedEventCount: causalRun.continuations.reduce(
                    (total, continuation) => total + continuation.realizedEventIds.length,
                    0,
                ),
                generationEventIds,
                newlyGeneratedEventIds: generationEventIds.filter((eventId) => !branch.knownGenerationEventIds.has(eventId)),
                outcomes: [],
                causalRun,
            };
            closures.push(closure);
            const branchWithClosure: RuntimeBranch = {
                ...branch,
                closureIds: [...branch.closureIds, closureId],
            };
            const causalStatus: EndogenousGeneratedUniverseBranch["status"] = causalRun.status === "contradicted"
                ? "contradicted"
                : causalRun.status === "underdetermined" || causalRun.status === "blocked"
                    ? "undetermined"
                    : "resolved";
            if (causalStatus !== "resolved" || causalRun.continuations.length === 0) {
                terminalBranches.push(terminal(
                    {
                        ...branchWithClosure,
                        witnesses: [...branch.witnesses, { causalRun, branchId: branch.id }],
                    },
                    causalStatus === "resolved" ? "undetermined" : causalStatus,
                    causalRun.reason ?? `causal projection ended with status '${causalRun.status}'`,
                ));
                continue;
            }
            executable.push({ branch: branchWithClosure, causalRun, closure });
        }

        const prospectiveBranchCount = terminalBranches.length
            + executable.reduce((total, entry) => total + entry.causalRun.continuations.length, 0);
        if (prospectiveBranchCount > branchLimit) {
            branchLimitExhausted = true;
            for (const entry of executable) {
                const reason = `complete causal branch family exceeds generation branch limit ${branchLimit}`;
                entry.closure.outcomes = entry.causalRun.continuations.map((continuation) => {
                    const step = deriveBranchStep(entry.branch.id, closureIndex, continuation);
                    return {
                        branchId: deriveBranchId(entry.branch.id, step.id),
                        causalContinuationId: continuation.id,
                        status: "undetermined",
                        reason,
                        realizedEventCount: continuation.realizedEventIds.length,
                        newlyGeneratedEventIds: [],
                        hostSelection: false,
                    };
                });
                terminalBranches.push(terminal(
                    {
                        ...entry.branch,
                        witnesses: [...entry.branch.witnesses, { causalRun: entry.causalRun, branchId: entry.branch.id }],
                    },
                    "undetermined",
                    `${reason}; no partial branch subset was selected`,
                ));
            }
            return assemble(terminalBranches);
        }

        const nextBranches: RuntimeBranch[] = [];
        for (const entry of executable) {
            const inputConfigurationDigest = entry.closure.inputConfigurationDigest;
            const knownAtInput = new Set(entry.closure.generationEventIds);
            const seenWithInput = new Map(entry.branch.seenConfigurations);
            if (!seenWithInput.has(inputConfigurationDigest)) {
                seenWithInput.set(inputConfigurationDigest, {
                    closureIndex,
                    historyEntryCount: entry.branch.historyEntries.length,
                    worldStructureDigest: worldStructureDigest(entry.branch.materialization),
                    anchorSetDigest: anchorSetDigest(entry.branch.materialization),
                    generationEventSetDigest: generationEventSetDigest(entry.branch.materialization),
                    identity: assessIdentityAtCut(program, entry.branch.materialization),
                });
            }
            for (const continuation of entry.causalRun.continuations) {
                const step = deriveBranchStep(entry.branch.id, closureIndex, continuation);
                const branchId = deriveBranchId(entry.branch.id, step.id);
                const continued = continueEndogenousUniverseFromState(program, {
                    materialization: entry.branch.materialization,
                    worldStates: continuation.worldStates,
                }, options.generation);
                const newEventIds = continued.generationEvents
                    .map((event) => event.id)
                    .filter((eventId) => !knownAtInput.has(eventId))
                    .sort();
                const outputConfigurationDigest = generationConfigurationDigest(continued);
                const historyExtension = causalGenerationHistoryExtension(
                    entry.closure.id,
                    continuation,
                    newEventIds,
                    continued,
                );
                const historyEntries = [...entry.branch.historyEntries, ...historyExtension];
                const lineage = [...entry.branch.lineage, step];
                const childBranch: RuntimeBranch = {
                    id: branchId,
                    lineage,
                    materialization: continued,
                    knownGenerationEventIds: knownAtInput,
                    seenConfigurations: seenWithInput,
                    historyEntries,
                    closureIds: [...entry.branch.closureIds],
                    witnesses: [...entry.branch.witnesses, {
                        causalRun: entry.causalRun,
                        continuationId: continuation.id,
                        branchId,
                    }],
                };
                let outcomeStatus: EndogenousGenerationBranchOutcome["status"] = "active";
                let outcomeReason = "causal continuation preserved as an endogenous generated-universe branch";
                let recurrenceCertificateId: string | undefined;
                if (continued.status !== "resolved" || !continued.coverage.demandedSliceComplete) {
                    const continuedStatus = continued.status === "resolved" ? "undetermined" : continued.status;
                    outcomeStatus = continuedStatus;
                    outcomeReason = continued.reason;
                    terminalBranches.push(terminal(childBranch, continuedStatus, continued.reason));
                } else if (newEventIds.length === 0
                    && outputConfigurationDigest === inputConfigurationDigest
                    && continuation.realizedEventIds.length === 0) {
                    outcomeStatus = "fixpoint";
                    outcomeReason = "this generated-universe branch reached a demanded configuration fixpoint";
                    terminalBranches.push(terminal(childBranch, "resolved", outcomeReason));
                } else if (seenWithInput.has(outputConfigurationDigest)) {
                    const recurrence = certifyGeneratedRecurrence(
                        program,
                        branchId,
                        entry.closure,
                        continuation,
                        continued,
                        seenWithInput.get(outputConfigurationDigest)!,
                        historyEntries,
                    );
                    recurrenceCertificates.push(recurrence);
                    recurrenceCertificateId = recurrence.id;
                    recurrentConfigurationDetected = true;
                    if (recurrence.status === "certified") {
                        outcomeStatus = "persistent-recurrence";
                        outcomeReason = recurrence.reason;
                        terminalBranches.push(terminal(
                            childBranch,
                            "resolved",
                            outcomeReason,
                            "persistent-recurrence",
                        ));
                    } else {
                        outcomeStatus = "undetermined";
                        outcomeReason = `recurrent causal-generation configuration is ${recurrence.status}: ${recurrence.reason}`;
                        terminalBranches.push(terminal(childBranch, "undetermined", outcomeReason));
                    }
                } else if (closureIndex + 1 >= closureLimit) {
                    outcomeStatus = "undetermined";
                    outcomeReason = "generation closure budget ended before this branch established a demanded fixpoint";
                    limitExhausted = true;
                    terminalBranches.push(terminal(childBranch, "undetermined", outcomeReason));
                } else {
                    nextBranches.push(childBranch);
                }
                entry.closure.outcomes.push({
                    branchId,
                    causalContinuationId: continuation.id,
                    status: outcomeStatus,
                    reason: outcomeReason,
                    outputWorldCount: continued.worlds.length,
                    outputConfigurationDigest,
                    outputFrontierCount: continued.frontiers.length,
                    outputDormantAdmissionCount: continued.frontiers.filter(
                        (frontier) => frontier.kind === "admission-closed",
                    ).length,
                    realizedEventCount: continuation.realizedEventIds.length,
                    newlyGeneratedEventIds: newEventIds,
                    ...(recurrenceCertificateId ? { recurrenceCertificateId } : {}),
                    hostSelection: false,
                });
            }
            if (entry.closure.outcomes.length === 1) {
                entry.closure.outputWorldCount = entry.closure.outcomes[0]!.outputWorldCount;
                entry.closure.outputConfigurationDigest = entry.closure.outcomes[0]!.outputConfigurationDigest;
            }
        }

        if (nextBranches.length === 0) return assemble(terminalBranches);
        activeBranches = nextBranches;
    }

    limitExhausted = true;
    terminalBranches.push(...activeBranches.map((branch) => terminal(
        branch,
        "undetermined",
        "generation closure budget ended before this branch established a demanded fixpoint",
    )));
    return assemble(terminalBranches);
}

export function inspectEndogenousConnectedUniverseRun(
    run: EndogenousConnectedUniverseRun,
): EndogenousConnectedUniverseInspection {
    const generatedWorldCount = run.materialization.worlds.filter((world) => !!world.parentWorldId).length;
    const representativeCausalRun = run.representativeCausalClosureId
        ? run.generationClosures.find((closure) => closure.id === run.representativeCausalClosureId)?.causalRun
        : undefined;
    return {
        mode: "bubble-endogenous-connected-universe-inspection.v1",
        summary: {
            status: run.status,
            reason: run.reason,
            worldCount: run.materialization.worlds.length,
            generatedWorldCount,
            anchorCount: run.materialization.anchors.length,
            relationAnchorCount: run.materialization.anchors.filter((anchor) => anchor.kind === "generated-relation").length,
            relationTransportCount: run.materialization.anchors.reduce((total, anchor) => total + anchor.transports.length, 0),
            schemaTransformationEventCount: run.materialization.schemaTransformationEvents.length,
            seaChannelCount: run.materialization.worlds.reduce((total, world) => total + world.seaChannels.length, 0),
            frontierCount: run.materialization.frontiers.length,
            demandedSliceComplete: run.materialization.coverage.demandedSliceComplete,
            exhaustiveUniverse: run.materialization.coverage.exhaustiveUniverse,
            causalContinuationCount: run.generationClosures.reduce(
                (total, closure) => total + closure.causalRun.continuations.length,
                0,
            ),
            generatedUniverseBranchCount: run.branchUniverses.length,
            generationClosureCount: run.generationClosure.count,
            generationFixpointReached: run.generationClosure.fixpointReached,
            recurrentGenerationConfigurationDetected: run.generationClosure.recurrentConfigurationDetected,
            persistentGenerationRecurrenceCertified: run.generationClosure.persistentRecurrenceCertified,
            recurrenceCertificateCount: run.recurrenceCertificates.length,
            generationBranchLimitExhausted: run.generationClosure.branchLimitExhausted,
            finiteCutResultForm: run.finiteRealization.finiteCut.resultForm,
            selfComplementationStatus: run.finiteRealization.selfComplementation.status,
            everyMaterializedWorldHasContinuationEvidence: run.worldContinuations.length === run.materialization.worlds.length,
            hostSelection: false,
            universalClock: false,
        },
        topology: {
            worlds: structuredClone(run.materialization.worlds),
            anchors: structuredClone(run.materialization.anchors),
            generationEvents: structuredClone(run.materialization.generationEvents),
            schemaTransformationEvents: structuredClone(run.materialization.schemaTransformationEvents),
            frontiers: structuredClone(run.materialization.frontiers),
            causalEdges: structuredClone(run.generationCausalEdges),
        },
        worldContinuations: structuredClone(run.worldContinuations),
        branches: structuredClone(run.branchUniverses),
        recurrenceCertificates: structuredClone(run.recurrenceCertificates),
        finiteRealization: structuredClone(run.finiteRealization),
        ...(representativeCausalRun ? { causal: inspectAnchoredCausalRun(representativeCausalRun) } : {}),
    };
}

export function recordEndogenousConnectedUniverse(
    program: EndogenousUniverseProgram,
    options: EndogenousConnectedUniverseExecutionOptions = {},
): EndogenousConnectedUniverseReplayRecord {
    const run = realizeEndogenousConnectedUniverse(program, options);
    return {
        mode: "bubble-endogenous-connected-universe-replay.v1",
        programDigest: digestEndogenousValue(program),
        runDigest: digestEndogenousValue(run),
        program: structuredClone(program),
        options: structuredClone(options),
        run,
    };
}

export function replayEndogenousConnectedUniverse(
    record: EndogenousConnectedUniverseReplayRecord,
): EndogenousConnectedUniverseReplayResult {
    const actualProgramDigest = digestEndogenousValue(record.program);
    const storedRunDigest = digestEndogenousValue(record.run);
    const base = {
        mode: "bubble-endogenous-connected-universe-replay-result.v1" as const,
        recordedProgramDigest: record.programDigest,
        actualProgramDigest,
        recordedRunDigest: record.runDigest,
        storedRunDigest,
    };
    if (record.mode !== "bubble-endogenous-connected-universe-replay.v1"
        || actualProgramDigest !== record.programDigest
        || storedRunDigest !== record.runDigest) {
        return { ...base, status: "integrity-failed", reason: "stored program or run digest does not match its content" };
    }
    const run = realizeEndogenousConnectedUniverse(record.program, record.options);
    const replayedRunDigest = digestEndogenousValue(run);
    if (replayedRunDigest !== record.runDigest) {
        return {
            ...base,
            status: "reexecution-drift",
            reason: "same-program endogenous universe reexecution changed the generated or causal evidence",
            replayedRunDigest,
            run,
        };
    }
    return {
        ...base,
        status: "verified",
        reason: "program identity, generated topology, sea relations, autonomous continuations, recurrence certificates, and replay evidence agree",
        replayedRunDigest,
        run,
    };
}
