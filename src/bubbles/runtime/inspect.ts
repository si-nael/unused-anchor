import type { BubbleProgramIR } from "../ir";
import {
    materializeBubbleProgram,
    type BubbleEvidenceRecord,
    type BubbleExecutionPlan,
    type BubbleMaterializationCommit,
    type BubbleMaterializationResult,
    type BubbleMaterializationTraceEvent,
} from "./materialize";

export type BubbleInspectionSection = "summary" | "plan" | "grammars" | "artifacts" | "commits" | "evidence" | "trace" | "report";

export interface BubbleInspectionQuery {
    emissionId?: string;
    addressId?: string;
    activationId?: string;
    grammarProfile?: string;
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
    materializedArtifactCount: number;
    descendantCount: number;
    artifactCount: number;
    commitCount: number;
    evidenceCount: number;
    reflectionPaths: string[];
    traceKinds: BubbleMaterializationTraceEvent["kind"][];
}

export interface BubbleInspectionReport {
    summary: BubbleInspectionSummary;
    plan: BubbleExecutionPlan;
    grammars: BubbleGrammarInspectionReport;
    artifacts: BubbleArtifactInspection[];
    commits: BubbleMaterializationCommit[];
    evidence: BubbleEvidenceRecord[];
    trace: BubbleMaterializationTraceEvent[];
}

export function inspectBubbleProgram(program: BubbleProgramIR, query: BubbleInspectionQuery = {}): BubbleInspectionReport {
    return inspectMaterializationResult(materializeBubbleProgram(program), query);
}

export function inspectMaterializationResult(
    result: BubbleMaterializationResult,
    query: BubbleInspectionQuery = {},
): BubbleInspectionReport {
    const plan = filterExecutionPlan(result.plan, query);
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
            materializedArtifactCount: artifacts.length,
            descendantCount,
            artifactCount,
            commitCount: commits.length,
            evidenceCount: evidence.length,
            reflectionPaths,
            traceKinds: trace.map((event) => event.kind),
        },
        plan,
        grammars: {
            artifacts: plan.grammars,
            activations: plan.grammarActivationPlan,
        },
        artifacts,
        commits,
        evidence,
        trace,
    };
}

function filterExecutionPlan(plan: BubbleExecutionPlan, query: BubbleInspectionQuery): BubbleExecutionPlan {
    const grammarActivationPlan = plan.grammarActivationPlan.filter((activation) => matchesGrammarActivationQuery(activation, query));
    return {
        ...plan,
        grammars: filterGrammarPlan(plan.grammars, grammarActivationPlan, query),
        grammarActivationPlan,
        emissionPlan: plan.emissionPlan.filter((emission) => matchesPlanQuery(emission, plan.bubbleAddress.id, query)),
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
    if (query.emissionId && evidence.emissionId !== query.emissionId) {
        return false;
    }

    if (!query.addressId) {
        return true;
    }

    return evidence.subjectAddressId === query.addressId || evidence.bubbleAddressId === query.addressId;
}

function hasEmissionQuery(query: BubbleInspectionQuery): boolean {
    return query.emissionId !== undefined || query.addressId !== undefined;
}

function hasGrammarQuery(query: BubbleInspectionQuery): boolean {
    return query.activationId !== undefined || query.grammarProfile !== undefined;
}