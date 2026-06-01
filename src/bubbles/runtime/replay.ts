import type { BubbleProgramIR } from "../ir";
import {
    inspectMaterializationResult,
    type BubbleInspectionQuery,
    type BubbleInspectionReport,
} from "./inspect";
import { materializeBubbleProgram } from "./materialize";
import type {
    BubbleRuntimeOptions,
    BubbleMaterializationResult,
} from "./types";

export interface BubbleReplayRecord {
    mode: "bubble-replay.v1";
    sourcePath: string | null;
    bubbleName: string;
    profile: BubbleProgramIR["profile"];
    rootAddressId: string;
    commitCount: number;
    evidenceCount: number;
    traceCount: number;
    materialization: BubbleMaterializationResult;
}

export function recordBubbleProgram(program: BubbleProgramIR, options: BubbleRuntimeOptions = {}): BubbleReplayRecord {
    return createBubbleReplayRecord(materializeBubbleProgram(program, options));
}

export function createBubbleReplayRecord(result: BubbleMaterializationResult): BubbleReplayRecord {
    return {
        mode: "bubble-replay.v1",
        sourcePath: result.plan.sourcePath,
        bubbleName: result.plan.bubbleAddress.path.at(-1)?.key ?? "<unknown>",
        profile: result.plan.profile,
        rootAddressId: result.plan.bubbleAddress.id,
        commitCount: result.commits.length,
        evidenceCount: result.evidence.length,
        traceCount: result.trace.length,
        materialization: result,
    };
}

export function replayBubbleRecord(
    record: BubbleReplayRecord,
    query: BubbleInspectionQuery = {},
): BubbleInspectionReport {
    return inspectMaterializationResult(record.materialization, query);
}