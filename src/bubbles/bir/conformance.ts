// Gate D causal conformance fixtures.
//
// A fixture is one BIR envelope. Its critical sections are the input meaning (program and execution options),
// so a fixture's semantic identity is its input. Its non-critical sections assert the expected portable outcome,
// record the reference oracle's deterministic host cost, and label the case. A backend conforms on a fixture
// when its own run, projected onto the portable outcome, encodes to exactly the expected bytes.

import { createHash } from "node:crypto";
import {
    realizeAnchoredCausalWorld,
    type AnchoredCausalRun,
    type CausalExecutionOptions,
    type ExecutableAnchoredCausalProgram,
} from "../world-kernel/causal-runtime";
import { meterHostCost, type HostCostProfile } from "../world-kernel/host-cost";
import { CAUSAL_PROGRAM_SECTION, causalProgramSchema } from "./causal-program";
import {
    CAUSAL_OPTIONS_SECTION,
    causalOptionsSchema,
    causalOutcomeSchema,
    projectCausalOutcome,
} from "./causal-outcome";
import {
    BIR_FORMAT_VERSION,
    birSemanticDigest,
    birStorageDigest,
    decodeBirEnvelope,
    encodeBirEnvelope,
    type BirEnvelope,
} from "./envelope";
import { BirFormatError, compareBytes, concatBytes, decodeNode, encodeNode, type BirNode } from "./node";
import { bir, BirLoweringError, liftFromBir, lowerToBir } from "./schema";

export const CONFORMANCE_OUTCOME_SECTION = "conformance.causal-outcome";
export const CONFORMANCE_COST_SECTION = "conformance.host-cost";
export const CONFORMANCE_LABEL_SECTION = "conformance.label";
const OUTCOME_IDENTITY_DOMAIN = new TextEncoder().encode("bubble-causal-outcome-identity.v1\u0000");

/** Any backend: given the lifted input, return a run shaped like the reference oracle's. */
export type CausalExecutor = (program: ExecutableAnchoredCausalProgram, options: CausalExecutionOptions) => AnchoredCausalRun;

export interface CausalConformanceCase {
    name: string;
    description: string;
    program: ExecutableAnchoredCausalProgram;
    options: CausalExecutionOptions;
}

export interface CausalConformanceFixture {
    mode: "bubble-causal-conformance-fixture.v1";
    name: string;
    description: string;
    bytes: Uint8Array;
    inputSemanticDigest: string;
    storageDigest: string;
    outcomeDigest: string;
    status: AnchoredCausalRun["status"];
    resourceVerdict: { exhaustiveInterventionSearch: boolean; exhaustiveInternalBranching: boolean };
    hostCost: HostCostProfile;
}

export interface CausalConformanceResult {
    mode: "bubble-causal-conformance-result.v1";
    name: string;
    status: "conformant" | "drift" | "not-executable" | "invalid-fixture" | "executor-failed";
    inputSemanticDigest?: string;
    expectedOutcomeDigest?: string;
    actualOutcomeDigest?: string;
    firstDifference?: string;
    detail?: string;
}

const hostCostSchema = bir.record(Object.fromEntries([
    "exactRationalConstructions", "maxRationalBits", "intensionalQueries", "materializedIntensionalCoordinates",
    "predicateEvaluations", "lawApplications", "branchFrontierCandidates", "realizationCopies", "valueCopies",
    "digestsComputed", "bytesHashed", "birNodesDecoded", "birBytesRead",
].map((key) => [key, bir.safeInteger])));

const labelSchema = bir.record({ name: bir.text, description: bir.text });

export function causalOutcomeDigest(outcomePayload: Uint8Array): string {
    return createHash("sha256").update(concatBytes([OUTCOME_IDENTITY_DOMAIN, outcomePayload])).digest("hex");
}

/** Canonical bytes of a run's portable outcome. */
export function encodeCausalOutcome(run: AnchoredCausalRun): Uint8Array {
    return encodeNode(lowerToBir(projectCausalOutcome(run), causalOutcomeSchema));
}

function section(envelope: BirEnvelope, name: string): Uint8Array | undefined {
    return envelope.sections.find((candidate) => candidate.name === name)?.payload;
}

function liftInput(envelope: BirEnvelope): { program: ExecutableAnchoredCausalProgram; options: CausalExecutionOptions } {
    const programPayload = section(envelope, CAUSAL_PROGRAM_SECTION);
    const optionsPayload = section(envelope, CAUSAL_OPTIONS_SECTION);
    if (!programPayload || !optionsPayload) {
        throw new BirLoweringError("BIRC01", "$", "a conformance fixture needs program and execution-option sections");
    }
    return {
        program: liftFromBir(decodeNode(programPayload), causalProgramSchema) as ExecutableAnchoredCausalProgram,
        options: liftFromBir(decodeNode(optionsPayload), causalOptionsSchema) as CausalExecutionOptions,
    };
}

export function buildCausalConformanceFixture(
    input: CausalConformanceCase,
    executor: CausalExecutor = realizeAnchoredCausalWorld,
): CausalConformanceFixture {
    const programPayload = encodeNode(lowerToBir(input.program, causalProgramSchema));
    const optionsPayload = encodeNode(lowerToBir(input.options, causalOptionsSchema));
    const inputEnvelope: BirEnvelope = {
        formatVersion: { ...BIR_FORMAT_VERSION },
        sections: [
            { name: CAUSAL_PROGRAM_SECTION, critical: true, payload: programPayload },
            { name: CAUSAL_OPTIONS_SECTION, critical: true, payload: optionsPayload },
        ],
    };
    // The expectation is derived from the decoded input, exactly what any backend will receive, and the cost
    // covers that whole portable path: envelope decoding, lifting, and execution.
    const inputBytes = encodeBirEnvelope(inputEnvelope);
    const { result: run, cost } = meterHostCost(() => {
        const lifted = liftInput(decodeBirEnvelope(inputBytes));
        return executor(lifted.program, lifted.options);
    });
    const outcomePayload = encodeCausalOutcome(run);
    const envelope: BirEnvelope = {
        ...inputEnvelope,
        sections: [
            ...inputEnvelope.sections,
            { name: CONFORMANCE_OUTCOME_SECTION, critical: false, payload: outcomePayload },
            { name: CONFORMANCE_COST_SECTION, critical: false, payload: encodeNode(lowerToBir(cost, hostCostSchema)) },
            {
                name: CONFORMANCE_LABEL_SECTION,
                critical: false,
                payload: encodeNode(lowerToBir({ name: input.name, description: input.description }, labelSchema)),
            },
        ],
    };
    const bytes = encodeBirEnvelope(envelope);
    return {
        mode: "bubble-causal-conformance-fixture.v1",
        name: input.name,
        description: input.description,
        bytes,
        inputSemanticDigest: birSemanticDigest(envelope),
        storageDigest: birStorageDigest(bytes),
        outcomeDigest: causalOutcomeDigest(outcomePayload),
        status: run.status,
        resourceVerdict: {
            exhaustiveInterventionSearch: run.resourceUse.exhaustiveInterventionSearch,
            exhaustiveInternalBranching: run.resourceUse.exhaustiveInternalBranching,
        },
        hostCost: cost,
    };
}

function memberLabel(node: BirNode): string {
    if (node.kind !== "record") return node.kind;
    for (const key of ["id", "key", "worldId", "criterionId", "interventionId", "continuationId", "eventId", "cause"]) {
        const value = node.fields.find(([field]) => field === key)?.[1];
        if (value?.kind === "str") return `${key}=${value.value}`;
    }
    return "record";
}

/** First path at which two outcome nodes differ, for a human-readable drift report. */
export function firstNodeDifference(expected: BirNode, actual: BirNode, path = "$"): string | undefined {
    if (compareBytes(encodeNode(expected), encodeNode(actual)) === 0) return undefined;
    if (expected.kind !== actual.kind) return `${path}: expected ${expected.kind}, found ${actual.kind}`;
    if (expected.kind === "record" || expected.kind === "map") {
        const left = new Map(expected.kind === "record" ? expected.fields : expected.entries);
        const right = new Map(actual.kind === "record" ? actual.fields : (actual as Extract<BirNode, { kind: "map" }>).entries);
        for (const key of [...new Set([...left.keys(), ...right.keys()])].sort()) {
            const a = left.get(key);
            const b = right.get(key);
            if (!a || !b) return `${path}.${key}: ${a ? "missing in actual" : "unexpected in actual"}`;
            const inner = firstNodeDifference(a, b, `${path}.${key}`);
            if (inner) return inner;
        }
    }
    if (expected.kind === "seq") {
        const other = (actual as Extract<BirNode, { kind: "seq" }>).items;
        if (expected.items.length !== other.length) return `${path}: expected ${expected.items.length} items, found ${other.length}`;
        for (let index = 0; index < expected.items.length; index += 1) {
            const inner = firstNodeDifference(expected.items[index]!, other[index]!, `${path}[${index}]`);
            if (inner) return inner;
        }
    }
    if (expected.kind === "set") {
        const other = (actual as Extract<BirNode, { kind: "set" }>).items;
        const encode = (items: BirNode[]) => items.map((item) => Buffer.from(encodeNode(item)).toString("hex"));
        const left = encode(expected.items);
        const right = new Set(encode(other));
        const missing = expected.items.find((_item, index) => !right.has(left[index]!));
        const extra = other.find((item) => !new Set(left).has(Buffer.from(encodeNode(item)).toString("hex")));
        // A same-labelled member that changed is reported at its inner difference.
        if (missing && extra && memberLabel(missing) === memberLabel(extra)) {
            return firstNodeDifference(missing, extra, `${path}{${memberLabel(missing)}}`);
        }
        if (missing) return `${path}: expected member ${memberLabel(missing)} is missing`;
        if (extra) return `${path}: unexpected member ${memberLabel(extra)}`;
    }
    return `${path}: values differ`;
}

function failureDetail(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/**
 * Checks one fixture against any executor. Every failure is reported as a result rather than thrown: a malformed
 * or tampered fixture is `invalid-fixture`, an unknown critical section is `not-executable`, an executor that
 * throws is `executor-failed`, and an executor whose output differs from (or cannot be projected onto) the
 * expected outcome is `drift`.
 */
export function checkCausalConformance(
    bytes: Uint8Array,
    executor: CausalExecutor = realizeAnchoredCausalWorld,
): CausalConformanceResult {
    const mode = "bubble-causal-conformance-result.v1" as const;
    let envelope: BirEnvelope;
    try {
        envelope = decodeBirEnvelope(bytes);
    } catch (error) {
        return { mode, name: "?", status: "invalid-fixture", detail: failureDetail(error) };
    }
    let name = "?";
    const labelPayload = section(envelope, CONFORMANCE_LABEL_SECTION);
    if (labelPayload) {
        try {
            name = (liftFromBir(decodeNode(labelPayload), labelSchema) as { name: string }).name;
        } catch (error) {
            return { mode, name, status: "invalid-fixture", detail: `malformed label: ${failureDetail(error)}` };
        }
    }
    const base = { mode, name, inputSemanticDigest: birSemanticDigest(envelope) };
    const understood = new Set([CAUSAL_PROGRAM_SECTION, CAUSAL_OPTIONS_SECTION]);
    const unknownCritical = envelope.sections.filter((candidate) => candidate.critical && !understood.has(candidate.name));
    if (unknownCritical.length > 0) {
        return { ...base, status: "not-executable", detail: `unknown critical sections: ${unknownCritical.map((s) => s.name).join(", ")}` };
    }
    const expectedPayload = section(envelope, CONFORMANCE_OUTCOME_SECTION);
    if (!expectedPayload) return { ...base, status: "invalid-fixture", detail: "fixture has no expected outcome" };
    let expectedNode: BirNode;
    let input: ReturnType<typeof liftInput>;
    try {
        expectedNode = decodeNode(expectedPayload);
        liftFromBir(expectedNode, causalOutcomeSchema);
        input = liftInput(envelope);
    } catch (error) {
        return { ...base, status: "invalid-fixture", detail: failureDetail(error) };
    }
    const expectedOutcomeDigest = causalOutcomeDigest(expectedPayload);
    let run: AnchoredCausalRun;
    try {
        run = executor(input.program, input.options);
    } catch (error) {
        return { ...base, expectedOutcomeDigest, status: "executor-failed", detail: failureDetail(error) };
    }
    let actualPayload: Uint8Array;
    try {
        actualPayload = encodeCausalOutcome(run);
    } catch (error) {
        return {
            ...base,
            expectedOutcomeDigest,
            status: "drift",
            firstDifference: `$: executor output is not a projectable causal run (${failureDetail(error)})`,
        };
    }
    const result = { ...base, expectedOutcomeDigest, actualOutcomeDigest: causalOutcomeDigest(actualPayload) };
    if (compareBytes(expectedPayload, actualPayload) === 0) return { ...result, status: "conformant" };
    return {
        ...result,
        status: "drift",
        firstDifference: firstNodeDifference(expectedNode, decodeNode(actualPayload)) ?? "outcome bytes differ",
    };
}

/** Decodes a fixture's informational host-cost section. */
export function fixtureHostCost(bytes: Uint8Array): HostCostProfile | undefined {
    const payload = section(decodeBirEnvelope(bytes), CONFORMANCE_COST_SECTION);
    return payload ? liftFromBir(decodeNode(payload), hostCostSchema) as HostCostProfile : undefined;
}
