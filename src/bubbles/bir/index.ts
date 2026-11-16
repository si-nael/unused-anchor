// Bubble Intermediate Representation (BIR) v1: the first machine-independent execution authority for the
// executable causal kernel. TypeScript remains the reference oracle; BIR is what a second backend must read.

import {
    digestExecutableCausalProgram,
    realizeAnchoredCausalWorld,
    validateExecutableCausalProgram,
    type AnchoredCausalRun,
    type CausalExecutionOptions,
    type ExecutableAnchoredCausalProgram,
} from "../world-kernel/causal-runtime";
import { CAUSAL_PROGRAM_SECTION, causalProgramSchema } from "./causal-program";
import { CAUSAL_OPTIONS_SECTION, causalOptionsSchema } from "./causal-outcome";
import {
    BIR_FORMAT_VERSION,
    birSemanticDigest,
    birStorageDigest,
    decodeBirEnvelope,
    encodeBirEnvelope,
    type BirEnvelope,
    type BirSection,
} from "./envelope";
import { BirFormatError, decodeNode, encodeNode, type BirNode } from "./node";
import { BirLoweringError, liftFromBir, lowerToBir } from "./schema";

export * from "./node";
export * from "./schema";
export * from "./envelope";
export { CAUSAL_PROGRAM_SECTION, causalProgramSchema } from "./causal-program";
export * from "./causal-outcome";
export * from "./conformance";

/** Critical sections this implementation understands and can execute. */
export const UNDERSTOOD_CRITICAL_SECTIONS: readonly string[] = [CAUSAL_PROGRAM_SECTION, CAUSAL_OPTIONS_SECTION];

export interface BirIdentity {
    /** Meaning: critical sections only. Equal for any two documents that denote the same program graph. */
    semanticDigest: string;
    /** Bytes: the whole envelope, including non-critical extensions. */
    storageDigest: string;
}

export interface BirCausalEncoding extends BirIdentity {
    mode: "bubble-bir-causal-encoding.v1";
    bytes: Uint8Array;
    /** Identity of the source TypeScript object as the reference oracle sees it (`run.programDigest`). */
    sourceBackendProgramDigest: string;
}

export interface BirCausalDocument extends BirIdentity {
    mode: "bubble-bir-document.v1";
    envelope: BirEnvelope;
    executable: boolean;
    unknownCriticalSections: string[];
    preservedExtensionSections: string[];
}

export interface BirLiftResult {
    mode: "bubble-bir-causal-lift.v1";
    status: "lifted" | "not-executable" | "contradicted";
    program?: ExecutableAnchoredCausalProgram;
    /** Present when the document carries its own critical execution-options section. */
    options?: CausalExecutionOptions;
    /** Identity of the lifted TypeScript object; differs from a source digest only by host array order. */
    backendProgramDigest?: string;
    diagnostics: string[];
}

export function lowerCausalProgramToBirNode(program: ExecutableAnchoredCausalProgram): BirNode {
    return lowerToBir(program, causalProgramSchema);
}

export function encodeCausalProgramBir(
    program: ExecutableAnchoredCausalProgram,
    options: { extensions?: BirSection[] } = {},
): BirCausalEncoding {
    const diagnostics = validateExecutableCausalProgram(program);
    if (diagnostics.length > 0) {
        throw new BirLoweringError("BIRL20", "$", `program is not a valid executable causal program: ${diagnostics.map((d) => d.code).join(", ")}`);
    }
    for (const extension of options.extensions ?? []) {
        if (UNDERSTOOD_CRITICAL_SECTIONS.includes(extension.name)) {
            throw new BirLoweringError("BIRL21", extension.name, "an extension cannot replace a core semantic section");
        }
    }
    const envelope: BirEnvelope = {
        formatVersion: { ...BIR_FORMAT_VERSION },
        sections: [
            { name: CAUSAL_PROGRAM_SECTION, critical: true, payload: encodeNode(lowerCausalProgramToBirNode(program)) },
            ...(options.extensions ?? []),
        ],
    };
    const bytes = encodeBirEnvelope(envelope);
    return {
        mode: "bubble-bir-causal-encoding.v1",
        bytes,
        semanticDigest: birSemanticDigest(envelope),
        storageDigest: birStorageDigest(bytes),
        sourceBackendProgramDigest: digestExecutableCausalProgram(program),
    };
}

export function decodeBir(bytes: Uint8Array): BirCausalDocument {
    const envelope = decodeBirEnvelope(bytes);
    const unknownCriticalSections = envelope.sections
        .filter((section) => section.critical && !UNDERSTOOD_CRITICAL_SECTIONS.includes(section.name))
        .map((section) => section.name);
    return {
        mode: "bubble-bir-document.v1",
        envelope,
        semanticDigest: birSemanticDigest(envelope),
        storageDigest: birStorageDigest(bytes),
        executable: unknownCriticalSections.length === 0
            && envelope.sections.some((section) => section.critical && section.name === CAUSAL_PROGRAM_SECTION),
        unknownCriticalSections,
        preservedExtensionSections: envelope.sections.filter((section) => !section.critical).map((section) => section.name),
    };
}

/** Re-encodes a decoded document, preserving every section (including unknown ones) byte for byte. */
export function reencodeBir(document: BirCausalDocument): Uint8Array {
    return encodeBirEnvelope(document.envelope);
}

export function liftCausalProgramFromBir(document: BirCausalDocument): BirLiftResult {
    if (!document.executable) {
        return {
            mode: "bubble-bir-causal-lift.v1",
            status: "not-executable",
            diagnostics: document.unknownCriticalSections.length > 0
                ? document.unknownCriticalSections.map((name) => `unknown critical section '${name}' must be understood before execution`)
                : [`missing critical section '${CAUSAL_PROGRAM_SECTION}'`],
        };
    }
    const section = document.envelope.sections.find((candidate) => candidate.name === CAUSAL_PROGRAM_SECTION)!;
    try {
        const program = liftFromBir(decodeNode(section.payload), causalProgramSchema) as ExecutableAnchoredCausalProgram;
        const optionsSection = document.envelope.sections.find((candidate) => candidate.name === CAUSAL_OPTIONS_SECTION);
        const options = optionsSection
            ? liftFromBir(decodeNode(optionsSection.payload), causalOptionsSchema) as CausalExecutionOptions
            : undefined;
        const diagnostics = validateExecutableCausalProgram(program).map((d) => `${d.code} ${d.path}: ${d.message}`);
        return diagnostics.length > 0
            ? { mode: "bubble-bir-causal-lift.v1", status: "contradicted", diagnostics }
            : {
                mode: "bubble-bir-causal-lift.v1",
                status: "lifted",
                program,
                ...(options ? { options } : {}),
                backendProgramDigest: digestExecutableCausalProgram(program),
                diagnostics: [],
            };
    } catch (error) {
        if (error instanceof BirFormatError || error instanceof BirLoweringError) {
            return { mode: "bubble-bir-causal-lift.v1", status: "contradicted", diagnostics: [error.message] };
        }
        throw error;
    }
}

export interface BirRealization {
    mode: "bubble-bir-causal-realization.v1";
    document: Omit<BirCausalDocument, "envelope">;
    lift: Omit<BirLiftResult, "program">;
    run?: AnchoredCausalRun;
}

/**
 * Decodes BIR bytes, lifts the causal program, and executes it on the TypeScript reference oracle. A document
 * that carries its own execution options runs with them; supplying caller options as well would silently
 * change the document's meaning, so it is refused.
 */
export function realizeAnchoredCausalWorldFromBir(bytes: Uint8Array, options: CausalExecutionOptions = {}): BirRealization {
    const { envelope: _envelope, ...document } = decodeBir(bytes);
    const lifted = liftCausalProgramFromBir({ ...document, envelope: _envelope });
    const { program, options: documentOptions, ...lift } = lifted;
    if (documentOptions && Object.keys(options).length > 0) {
        throw new BirLoweringError("BIRL22", CAUSAL_OPTIONS_SECTION, "the document carries its own execution options; caller options would change its meaning");
    }
    return {
        mode: "bubble-bir-causal-realization.v1",
        document,
        lift,
        ...(program ? { run: realizeAnchoredCausalWorld(program, documentOptions ?? options) } : {}),
    };
}
