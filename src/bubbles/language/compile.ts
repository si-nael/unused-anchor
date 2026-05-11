import type { BubbleDocument } from "./ast";
import type { BubbleProgramIR } from "../ir";
import { BubbleCompilerError, hasErrorDiagnostics, type Diagnostic } from "./diagnostics";
import { lowerBubbleDocument } from "./lower";
import { parseBubbleSource } from "./parser";
import { validateBubbleCompilation } from "./validate";

export interface CompileBubbleOptions {
    sourcePath?: string | null;
    strict?: boolean;
}

export interface CompilationResult {
    document: BubbleDocument;
    program: BubbleProgramIR;
    diagnostics: Diagnostic[];
}

export function compileBubbleSource(source: string, options: CompileBubbleOptions = {}): CompilationResult {
    const document = parseBubbleSource(source, options.sourcePath ?? null);
    const program = lowerBubbleDocument(document);
    const diagnostics = validateBubbleCompilation(document, program);

    if (options.strict !== false && hasErrorDiagnostics(diagnostics)) {
        throw new BubbleCompilerError(diagnostics);
    }

    return {
        document,
        program,
        diagnostics,
    };
}
