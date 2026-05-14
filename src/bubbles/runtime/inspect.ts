import type { BubbleProgramIR } from "../ir";
import {
    materializeBubbleProgram,
    type BubbleEvidenceRecord,
    type BubbleExecutionPlan,
    type BubbleMaterializationCommit,
    type BubbleMaterializationResult,
    type BubbleMaterializationTraceEvent,
} from "./materialize";

export type BubbleInspectionSection = "summary" | "plan" | "artifacts" | "commits" | "evidence" | "trace" | "report";

export interface BubbleInspectionQuery {
    emissionId?: string;
    addressId?: string;
    kind?: BubbleMaterializationTraceEvent["kind"];
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
    const artifacts = result.artifacts
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
    const commits = result.commits.filter((commit) => matchesEmissionQuery(commit.emissionId, selectedEmissionIds, query));
    const evidence = result.evidence.filter((entry) => matchesEvidenceQuery(entry, query));
    const trace = result.trace.filter((event) => matchesTraceQuery(event, selectedEmissionIds, result.plan.bubbleAddress.id, query));

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
        artifacts,
        commits,
        evidence,
        trace,
    };
}

function filterExecutionPlan(plan: BubbleExecutionPlan, query: BubbleInspectionQuery): BubbleExecutionPlan {
    return {
        ...plan,
        emissionPlan: plan.emissionPlan.filter((emission) => matchesPlanQuery(emission, plan.bubbleAddress.id, query)),
    };
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

function matchesTraceQuery(
    event: BubbleMaterializationTraceEvent,
    selectedEmissionIds: Set<string>,
    rootAddressId: string,
    query: BubbleInspectionQuery,
): boolean {
    if (query.kind && event.kind !== query.kind) {
        return false;
    }

    if (!query.emissionId && !query.addressId) {
        return true;
    }

    if (query.addressId === rootAddressId && !query.emissionId) {
        return true;
    }

    return event.emissionId !== undefined && selectedEmissionIds.has(event.emissionId);
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