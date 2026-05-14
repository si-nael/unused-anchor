import type { BubbleProgramIR } from "../ir";
import {
    materializeBubbleProgram,
    type BubbleExecutionPlan,
    type BubbleMaterializationCommit,
    type BubbleMaterializationResult,
    type BubbleMaterializationTraceEvent,
} from "./materialize";

export type BubbleInspectionSection = "summary" | "plan" | "artifacts" | "commits" | "trace" | "report";

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
    reflectionPaths: string[];
    traceKinds: BubbleMaterializationTraceEvent["kind"][];
}

export interface BubbleInspectionReport {
    summary: BubbleInspectionSummary;
    plan: BubbleExecutionPlan;
    artifacts: BubbleArtifactInspection[];
    commits: BubbleMaterializationCommit[];
    trace: BubbleMaterializationTraceEvent[];
}

export function inspectBubbleProgram(program: BubbleProgramIR): BubbleInspectionReport {
    return inspectMaterializationResult(materializeBubbleProgram(program));
}

export function inspectMaterializationResult(result: BubbleMaterializationResult): BubbleInspectionReport {
    const artifacts = result.artifacts.map((artifact) => ({
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

    const reflectionPaths = Array.from(new Set(result.plan.emissionPlan.flatMap((emission) => emission.reflectionPaths)));
    const descendantCount = artifacts.filter((artifact) => artifact.target === "descendant").length;
    const artifactCount = artifacts.filter((artifact) => artifact.target === "artifact").length;

    return {
        summary: {
            bubbleName: result.plan.bubbleAddress.path.at(-1)?.key ?? "<unknown>",
            profile: result.plan.profile,
            addressId: result.plan.bubbleAddress.id,
            obligationCount: result.plan.obligations.length,
            plannedRelationCount: result.plan.plannedRelations.length,
            plannedEmissionCount: result.plan.emissionPlan.length,
            materializedArtifactCount: artifacts.length,
            descendantCount,
            artifactCount,
            commitCount: result.commits.length,
            reflectionPaths,
            traceKinds: result.trace.map((event) => event.kind),
        },
        plan: result.plan,
        artifacts,
        commits: result.commits,
        trace: result.trace,
    };
}