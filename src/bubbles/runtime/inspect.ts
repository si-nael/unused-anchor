import type { BubbleProgramIR } from "../ir";
import { materializeBubbleProgram } from "./materialize";
import type {
    BubbleEventSourceAttributionEvidenceRecord,
    BubbleEventSourceAttributionStatus,
    BubbleEventSourceClassification,
    BubbleEvidenceKind,
    BubbleEvidenceRecord,
    BubbleObservationStateRecord,
} from "./evidence";
import type { BubbleSeaAnchorAssessment } from "./ontology";
import {
    deriveConsistencyVerdict,
    type BubbleConsistencyCertificate,
    type BubbleConsistencyClaim,
    type BubbleConsistencyClaimKind,
    type BubbleConsistencyClaimStatus,
} from "./proof";
import type {
    BubbleExecutableCheckStatus,
    BubbleSemanticEvaluation,
    BubbleSemanticEvaluationKind,
    BubbleSemanticEvaluationPlan,
} from "./semantics";
import type {
    BubbleBundlePlan,
    BubbleExecutionPlan,
    BubbleMaterializationCommit,
    BubbleMaterializationResult,
    BubbleMaterializationTraceEvent,
    BubbleRuntimeOptions,
} from "./types";

export type BubbleInspectionSection = "summary" | "plan" | "externalObservationLimit" | "observationCommitPolicy" | "observationCommitPolicyComparison" | "ontology" | "semantics" | "proof" | "bundle" | "grammars" | "artifacts" | "commits" | "evidence" | "sourceAttributions" | "observationStates" | "trace" | "report";

export interface BubbleInspectionQuery {
    emissionId?: string;
    addressId?: string;
    activationId?: string;
    grammarProfile?: string;
    observationStateId?: string;
    observationStatePhase?: BubbleObservationStateRecord["phase"];
    observationPolicyRule?: NonNullable<BubbleExecutionPlan["observationCommitPolicy"]>["selectionRule"];
    observationHistoryShape?: NonNullable<BubbleExecutionPlan["observationCommitPolicy"]>["projectedHistoryShape"];
    semanticId?: string;
    semanticKind?: BubbleSemanticEvaluationKind;
    semanticStatus?: BubbleExecutableCheckStatus;
    claimId?: string;
    claimKind?: BubbleConsistencyClaimKind;
    claimStatus?: BubbleConsistencyClaimStatus;
    evidenceKind?: BubbleEvidenceKind;
    attributionStatus?: BubbleEventSourceAttributionStatus;
    attributionClassification?: BubbleEventSourceClassification;
    kind?: BubbleMaterializationTraceEvent["kind"];
}

export interface BubbleGrammarInspectionReport {
    artifacts: BubbleExecutionPlan["grammars"];
    activations: BubbleExecutionPlan["grammarActivationPlan"];
}

export interface BubbleArtifactInspection {
    emissionId: string;
    target: "descendant" | "artifact" | null;
    addressId: string | null;
    bubbleName: string;
    profile: BubbleProgramIR["profile"];
    sourcePath: string;
    worldWill: string | null;
    seed: string | null;
    latentRegionCount: number;
    latentDraftStatuses: string[];
    diagnosticsCount: number;
}

export interface BubbleInspectionSummary {
    bubbleName: string;
    profile: BubbleProgramIR["profile"];
    addressId: string;
    obligationCount: number;
    plannedRelationCount: number;
    plannedGrammarCount: number;
    plannedGrammarActivationCount: number;
    plannedEmissionCount: number;
    plannedSemanticCount: number;
    semanticKinds: BubbleSemanticEvaluationKind[];
    semanticStatusCounts: Record<BubbleExecutableCheckStatus, number>;
    proofVerdict: BubbleConsistencyCertificate["verdict"];
    proofClaimCount: number;
    proofClaimKinds: BubbleConsistencyClaimKind[];
    proofClaimStatusCounts: Record<BubbleConsistencyClaimStatus, number>;
    materializedArtifactCount: number;
    descendantCount: number;
    artifactCount: number;
    commitCount: number;
    evidenceCount: number;
    sourceAttributionCount: number;
    sourceAttributionStatusCounts: Record<BubbleEventSourceAttributionStatus, number>;
    sourceAttributionClassifications: BubbleEventSourceClassification[];
    observationStateCount: number;
    reflectionPaths: string[];
    traceKinds: BubbleMaterializationTraceEvent["kind"][];
}

export interface BubbleInspectionReport {
    summary: BubbleInspectionSummary;
    plan: BubbleExecutionPlan;
    externalObservationLimit: BubbleExecutionPlan["externalObservationLimit"];
    observationCommitPolicy: BubbleExecutionPlan["observationCommitPolicy"];
    observationCommitPolicyComparison: BubbleExecutionPlan["observationCommitPolicyComparison"];
    ontology: BubbleSeaAnchorAssessment;
    semantics: BubbleExecutionPlan["semantics"];
    proof: BubbleConsistencyCertificate;
    bundle: BubbleBundlePlan;
    grammars: BubbleGrammarInspectionReport;
    artifacts: BubbleArtifactInspection[];
    commits: BubbleMaterializationCommit[];
    evidence: BubbleEvidenceRecord[];
    sourceAttributions: BubbleEventSourceAttributionEvidenceRecord[];
    observationStates: BubbleObservationStateRecord[];
    trace: BubbleMaterializationTraceEvent[];
}

export function inspectBubbleProgram(
    program: BubbleProgramIR,
    query: BubbleInspectionQuery = {},
    options: BubbleRuntimeOptions = {},
): BubbleInspectionReport {
    return inspectMaterializationResult(materializeBubbleProgram(program, options), query);
}

export function inspectMaterializationResult(
    result: BubbleMaterializationResult,
    query: BubbleInspectionQuery = {},
): BubbleInspectionReport {
    const plan = filterExecutionPlan(result.plan, query);
    const proof = filterProofCertificate(result.proof, query);
    const ontology = result.runtimeOntology;
    const selectedEmissionIds = new Set(plan.emissionPlan.map((emission) => emission.emissionId));
    const selectedActivationIds = new Set(plan.grammarActivationPlan.map((activation) => activation.activationId));
    const hideEmissionResults = hasGrammarQuery(query) && !hasEmissionQuery(query);
    const artifacts = hideEmissionResults ? [] : result.artifacts
        .filter((artifact) => matchesEmissionQuery(artifact.emissionId, selectedEmissionIds, query))
        .map((artifact) => ({
            emissionId: artifact.emissionId,
            target: artifact.target,
            addressId: artifact.address?.id ?? null,
            bubbleName: artifact.program.bubble.name,
            profile: artifact.program.profile,
            sourcePath: artifact.sourcePath,
            worldWill: artifact.program.bubble.worldWill,
            seed: artifact.program.bubble.seed,
            latentRegionCount: artifact.program.bubble.latentTopology?.regions.length ?? 0,
            latentDraftStatuses: Array.from(new Set(
                artifact.program.bubble.latentTopology?.collapseEvidenceDrafts.map((draft) => draft.draftStatus) ?? [],
            )),
            diagnosticsCount: artifact.diagnostics.length,
        }));
    const commits = hideEmissionResults
        ? []
        : result.commits.filter((commit) => matchesEmissionQuery(commit.emissionId, selectedEmissionIds, query));
    const evidence = hideEmissionResults ? [] : result.evidence.filter((entry) => matchesEvidenceQuery(entry, query));
    const trace = result.trace.filter((event) => matchesTraceQuery(
        event,
        selectedEmissionIds,
        selectedActivationIds,
        result.plan.bubbleAddress.id,
        query,
    ));

    const selectedSemantics = collectSemanticEvaluations(plan.semantics);
    const selectedProofClaims = proof.claims;
    const sourceAttributions = evidence.filter(
        (entry): entry is BubbleEventSourceAttributionEvidenceRecord => entry.kind === "event-source-attribution",
    );
    const observationStates = collectObservationStates(evidence).filter((state) => matchesObservationStateQuery(state, query));
    const reflectionPaths = Array.from(new Set(plan.emissionPlan.flatMap((emission) => emission.reflectionPaths)));
    const descendantCount = artifacts.filter((artifact) => artifact.target === "descendant").length;
    const artifactCount = artifacts.filter((artifact) => artifact.target === "artifact").length;

    return {
        summary: {
            bubbleName: plan.bubbleAddress.path.at(-1)?.key ?? "<unknown>",
            profile: plan.profile,
            addressId: plan.bubbleAddress.id,
            obligationCount: plan.obligations.length,
            plannedRelationCount: plan.plannedRelations.length,
            plannedGrammarCount: plan.grammars.length,
            plannedGrammarActivationCount: plan.grammarActivationPlan.length,
            plannedEmissionCount: plan.emissionPlan.length,
            plannedSemanticCount: selectedSemantics.length,
            semanticKinds: listSemanticKinds(selectedSemantics),
            semanticStatusCounts: countSemanticStatuses(selectedSemantics),
            proofVerdict: proof.verdict,
            proofClaimCount: selectedProofClaims.length,
            proofClaimKinds: listProofClaimKinds(selectedProofClaims),
            proofClaimStatusCounts: countProofClaimStatuses(selectedProofClaims),
            materializedArtifactCount: artifacts.length,
            descendantCount,
            artifactCount,
            commitCount: commits.length,
            evidenceCount: evidence.length,
            sourceAttributionCount: sourceAttributions.length,
            sourceAttributionStatusCounts: countSourceAttributionStatuses(sourceAttributions),
            sourceAttributionClassifications: listSourceAttributionClassifications(sourceAttributions),
            observationStateCount: observationStates.length,
            reflectionPaths,
            traceKinds: trace.map((event) => event.kind),
        },
        plan,
        externalObservationLimit: plan.externalObservationLimit,
        observationCommitPolicy: plan.observationCommitPolicy ?? null,
        observationCommitPolicyComparison: plan.observationCommitPolicyComparison ?? null,
        ontology,
        semantics: plan.semantics,
        proof,
        bundle: plan.bundle,
        grammars: {
            artifacts: plan.grammars,
            activations: plan.grammarActivationPlan,
        },
        artifacts,
        commits,
        evidence,
        sourceAttributions,
        observationStates,
        trace,
    };
}

function filterExecutionPlan(plan: BubbleExecutionPlan, query: BubbleInspectionQuery): BubbleExecutionPlan {
    const grammarActivationPlan = plan.grammarActivationPlan.filter((activation) => matchesGrammarActivationQuery(activation, query));
    const emissionPlan = plan.emissionPlan.filter((emission) => matchesPlanQuery(emission, plan.bubbleAddress.id, query));
    const normalizedObservationCommitPolicy = plan.observationCommitPolicy ?? null;
    const normalizedObservationCommitPolicyComparison = plan.observationCommitPolicyComparison ?? null;
    const observationCommitPolicy = matchesObservationCommitPolicyQuery(normalizedObservationCommitPolicy, query)
        ? normalizedObservationCommitPolicy
        : null;
    const observationCommitPolicyComparison = observationCommitPolicy === null
        ? null
        : normalizedObservationCommitPolicyComparison;

    return {
        ...plan,
        bundle: filterBundlePlan(plan.bundle, emissionPlan, grammarActivationPlan),
        grammars: filterGrammarPlan(plan.grammars, grammarActivationPlan, query),
        observationCommitPolicy,
        observationCommitPolicyComparison,
        semantics: filterSemanticPlan(plan.semantics, query),
        proof: filterProofCertificate(plan.proof, query),
        grammarActivationPlan,
        emissionPlan,
    };
}

function filterSemanticPlan(
    semantics: BubbleSemanticEvaluationPlan,
    query: BubbleInspectionQuery,
): BubbleSemanticEvaluationPlan {
    if (!hasSemanticQuery(query)) {
        return semantics;
    }

    return {
        ...semantics,
        constraints: semantics.constraints.filter((evaluation) => matchesSemanticQuery(evaluation, query)),
        partialLaws: semantics.partialLaws.filter((evaluation) => matchesSemanticQuery(evaluation, query)),
        worldWillCriterion: semantics.worldWillCriterion && matchesSemanticQuery(semantics.worldWillCriterion, query)
            ? semantics.worldWillCriterion
            : null,
        anchorCriterion: semantics.anchorCriterion && matchesSemanticQuery(semantics.anchorCriterion, query)
            ? semantics.anchorCriterion
            : null,
    };
}

function collectSemanticEvaluations(semantics: BubbleSemanticEvaluationPlan): BubbleSemanticEvaluation[] {
    return [
        ...semantics.constraints,
        ...semantics.partialLaws,
        ...(semantics.worldWillCriterion ? [semantics.worldWillCriterion] : []),
        ...(semantics.anchorCriterion ? [semantics.anchorCriterion] : []),
    ];
}

function collectObservationStates(evidence: BubbleEvidenceRecord[]): BubbleObservationStateRecord[] {
    const statesById = new Map<string, BubbleObservationStateRecord>();

    for (const entry of evidence) {
        if (entry.kind !== "collapse-record") {
            continue;
        }

        statesById.set(entry.observationState.id, entry.observationState);
    }

    return [...statesById.values()];
}

function listSemanticKinds(evaluations: BubbleSemanticEvaluation[]): BubbleSemanticEvaluationKind[] {
    const kinds: BubbleSemanticEvaluationKind[] = [];

    for (const evaluation of evaluations) {
        if (!kinds.includes(evaluation.subjectKind)) {
            kinds.push(evaluation.subjectKind);
        }
    }

    return kinds;
}

function countSemanticStatuses(evaluations: BubbleSemanticEvaluation[]): Record<BubbleExecutableCheckStatus, number> {
    const counts: Record<BubbleExecutableCheckStatus, number> = {
        satisfied: 0,
        violated: 0,
        undetermined: 0,
    };

    for (const evaluation of evaluations) {
        counts[evaluation.status] += 1;
    }

    return counts;
}

function filterProofCertificate(
    proof: BubbleConsistencyCertificate,
    query: BubbleInspectionQuery,
): BubbleConsistencyCertificate {
    if (!hasProofQuery(query)) {
        return proof;
    }

    const claims = proof.claims.filter((claim) => matchesProofQuery(claim, query));

    return {
        ...proof,
        verdict: deriveConsistencyVerdict(claims),
        claims,
    };
}

function listProofClaimKinds(claims: BubbleConsistencyClaim[]): BubbleConsistencyClaimKind[] {
    const kinds: BubbleConsistencyClaimKind[] = [];

    for (const claim of claims) {
        if (!kinds.includes(claim.kind)) {
            kinds.push(claim.kind);
        }
    }

    return kinds;
}

function countProofClaimStatuses(claims: BubbleConsistencyClaim[]): Record<BubbleConsistencyClaimStatus, number> {
    const counts: Record<BubbleConsistencyClaimStatus, number> = {
        certified: 0,
        contradicted: 0,
        undetermined: 0,
    };

    for (const claim of claims) {
        counts[claim.status] += 1;
    }

    return counts;
}

function filterBundlePlan(
    bundle: BubbleBundlePlan,
    emissionPlan: BubbleExecutionPlan["emissionPlan"],
    grammarActivationPlan: BubbleExecutionPlan["grammarActivationPlan"],
): BubbleBundlePlan {
    const selectedEmissionIds = new Set(emissionPlan.map((emission) => emission.emissionId));
    const selectedActivationIds = new Set(grammarActivationPlan.map((activation) => activation.activationId));

    return {
        ...bundle,
        members: bundle.members.filter((member) =>
            member.kind === "root-bubble"
            || (member.emissionId !== null && selectedEmissionIds.has(member.emissionId))
            || (member.activationId !== null && selectedActivationIds.has(member.activationId)),
        ),
        materializationScopes: bundle.materializationScopes.filter((scope) =>
            scope.target === "root-bubble"
            || (scope.emissionId !== null && selectedEmissionIds.has(scope.emissionId))
            || (scope.activationId !== null && selectedActivationIds.has(scope.activationId)),
        ),
    };
}

function listSourceAttributionClassifications(
    attributions: BubbleEventSourceAttributionEvidenceRecord[],
): BubbleEventSourceClassification[] {
    return Array.from(new Set(attributions.map((attribution) => attribution.classification)));
}

function countSourceAttributionStatuses(
    attributions: BubbleEventSourceAttributionEvidenceRecord[],
): Record<BubbleEventSourceAttributionStatus, number> {
    return {
        resolved: attributions.filter((attribution) => attribution.status === "resolved").length,
        unresolved: attributions.filter((attribution) => attribution.status === "unresolved").length,
    };
}

function filterGrammarPlan(
    grammars: BubbleExecutionPlan["grammars"],
    grammarActivationPlan: BubbleExecutionPlan["grammarActivationPlan"],
    query: BubbleInspectionQuery,
): BubbleExecutionPlan["grammars"] {
    if (!hasGrammarQuery(query)) {
        return grammars;
    }

    const referencedGrammarIds = new Set(
        grammarActivationPlan
            .map((activation) => activation.grammarId)
            .filter((grammarId): grammarId is string => grammarId !== null),
    );

    return grammars.filter(
        (grammar) => referencedGrammarIds.has(grammar.grammarId) || matchesGrammarArtifactQuery(grammar, query),
    );
}

function matchesPlanQuery(
    emission: BubbleExecutionPlan["emissionPlan"][number],
    rootAddressId: string,
    query: BubbleInspectionQuery,
): boolean {
    if (query.emissionId && emission.emissionId !== query.emissionId) {
        return false;
    }

    if (!query.addressId) {
        return true;
    }

    if (query.addressId === rootAddressId) {
        return true;
    }

    return emission.derivedAddress?.id === query.addressId;
}

function matchesEmissionQuery(
    emissionId: string,
    selectedEmissionIds: Set<string>,
    query: BubbleInspectionQuery,
): boolean {
    if (!query.emissionId && !query.addressId) {
        return true;
    }

    return selectedEmissionIds.has(emissionId);
}

function matchesGrammarActivationQuery(
    activation: BubbleExecutionPlan["grammarActivationPlan"][number],
    query: BubbleInspectionQuery,
): boolean {
    if (query.activationId && activation.activationId !== query.activationId) {
        return false;
    }

    if (
        query.grammarProfile
        && activation.requestedProfileName !== query.grammarProfile
        && activation.resolvedProfileName !== query.grammarProfile
    ) {
        return false;
    }

    return true;
}

function matchesGrammarArtifactQuery(
    grammar: BubbleExecutionPlan["grammars"][number],
    query: BubbleInspectionQuery,
): boolean {
    if (query.grammarProfile && grammar.profileName !== query.grammarProfile) {
        return false;
    }

    return true;
}

function matchesTraceQuery(
    event: BubbleMaterializationTraceEvent,
    selectedEmissionIds: Set<string>,
    selectedActivationIds: Set<string>,
    rootAddressId: string,
    query: BubbleInspectionQuery,
): boolean {
    if (query.kind && event.kind !== query.kind) {
        return false;
    }

    const emissionQuery = hasEmissionQuery(query);
    const grammarQuery = hasGrammarQuery(query);
    if (!emissionQuery && !grammarQuery) {
        return true;
    }

    let matched = false;

    if (emissionQuery) {
        if (query.addressId === rootAddressId && !query.emissionId) {
            matched = true;
        } else if (event.emissionId !== undefined && selectedEmissionIds.has(event.emissionId)) {
            matched = true;
        }
    }

    if (grammarQuery && event.activationId !== undefined && selectedActivationIds.has(event.activationId)) {
        matched = true;
    }

    return matched;
}

function matchesEvidenceQuery(evidence: BubbleEvidenceRecord, query: BubbleInspectionQuery): boolean {
    if (query.evidenceKind && evidence.kind !== query.evidenceKind) {
        return false;
    }

    if (query.attributionStatus || query.attributionClassification) {
        if (evidence.kind !== "event-source-attribution") {
            return false;
        }

        if (query.attributionStatus && evidence.status !== query.attributionStatus) {
            return false;
        }

        if (
            query.attributionClassification
            && evidence.classification !== query.attributionClassification
            && !evidence.candidates.some((candidate) => candidate.classification === query.attributionClassification)
        ) {
            return false;
        }
    }

    if (query.emissionId && evidence.emissionId !== query.emissionId) {
        return false;
    }

    if (!query.addressId) {
        return true;
    }

    return evidence.subjectAddressId === query.addressId || evidence.bubbleAddressId === query.addressId;
}

function matchesObservationStateQuery(state: BubbleObservationStateRecord, query: BubbleInspectionQuery): boolean {
    if (query.observationStateId && state.id !== query.observationStateId) {
        return false;
    }

    if (query.observationStatePhase && state.phase !== query.observationStatePhase) {
        return false;
    }

    return true;
}

function matchesObservationCommitPolicyQuery(
    policy: BubbleExecutionPlan["observationCommitPolicy"] | undefined,
    query: BubbleInspectionQuery,
): boolean {
    if (policy == null) {
        return !query.observationPolicyRule && !query.observationHistoryShape;
    }

    if (query.observationPolicyRule && policy.selectionRule !== query.observationPolicyRule) {
        return false;
    }

    if (query.observationHistoryShape && policy.projectedHistoryShape !== query.observationHistoryShape) {
        return false;
    }

    return true;
}

function matchesSemanticQuery(evaluation: BubbleSemanticEvaluation, query: BubbleInspectionQuery): boolean {
    if (
        query.semanticId
        && evaluation.subjectId !== query.semanticId
        && evaluation.evaluationId !== query.semanticId
    ) {
        return false;
    }

    if (query.semanticKind && evaluation.subjectKind !== query.semanticKind) {
        return false;
    }

    if (query.semanticStatus && evaluation.status !== query.semanticStatus) {
        return false;
    }

    return true;
}

function matchesProofQuery(claim: BubbleConsistencyClaim, query: BubbleInspectionQuery): boolean {
    if (query.claimId && claim.id !== query.claimId) {
        return false;
    }

    if (query.claimKind && claim.kind !== query.claimKind) {
        return false;
    }

    if (query.claimStatus && claim.status !== query.claimStatus) {
        return false;
    }

    return true;
}

function hasEmissionQuery(query: BubbleInspectionQuery): boolean {
    return query.emissionId !== undefined || query.addressId !== undefined;
}

function hasGrammarQuery(query: BubbleInspectionQuery): boolean {
    return query.activationId !== undefined || query.grammarProfile !== undefined;
}

function hasSemanticQuery(query: BubbleInspectionQuery): boolean {
    return query.semanticId !== undefined
        || query.semanticKind !== undefined
        || query.semanticStatus !== undefined;
}

function hasProofQuery(query: BubbleInspectionQuery): boolean {
    return query.claimId !== undefined
        || query.claimKind !== undefined
        || query.claimStatus !== undefined;
}
