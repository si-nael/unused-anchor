export type DiagnosticSeverity = "error" | "warning";

export interface Diagnostic {
    code: string;
    severity: DiagnosticSeverity;
    message: string;
    sourcePath: string | null;
    line: number | null;
    hint?: string;
}

export interface DiagnosticInput {
    code: string;
    severity: DiagnosticSeverity;
    message: string;
    sourcePath?: string | null;
    line?: number | null;
    hint?: string;
}

export class BubbleCompilerError extends Error {
    readonly diagnostics: Diagnostic[];

    constructor(diagnostics: Diagnostic[]) {
        super(formatDiagnostics(diagnostics));
        this.name = "BubbleCompilerError";
        this.diagnostics = diagnostics;
    }
}

export function createDiagnostic(input: DiagnosticInput): Diagnostic {
    return {
        code: input.code,
        severity: input.severity,
        message: input.message,
        sourcePath: input.sourcePath ?? null,
        line: input.line ?? null,
        hint: input.hint,
    };
}

export function throwDiagnostic(input: DiagnosticInput): never {
    throw new BubbleCompilerError([createDiagnostic(input)]);
}

export function hasErrorDiagnostics(diagnostics: Diagnostic[]): boolean {
    return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

export function formatDiagnostic(diagnostic: Diagnostic): string {
    const location = formatLocation(diagnostic.sourcePath, diagnostic.line);
    const hint = diagnostic.hint ? `\n  hint: ${diagnostic.hint}` : "";
    return `[${diagnostic.severity} ${diagnostic.code}] ${location} ${diagnostic.message}${hint}`;
}

export function formatDiagnostics(diagnostics: Diagnostic[]): string {
    return diagnostics.map(formatDiagnostic).join("\n");
}

function formatLocation(sourcePath: string | null, line: number | null): string {
    const base = sourcePath ?? "<memory>";
    return line === null ? base : `${base}:${line}`;
}
