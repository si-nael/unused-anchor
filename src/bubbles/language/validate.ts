import type { EffectDeclaration } from "./ast";
import type { BubbleDocument } from "./ast";
import type { BubbleProgramIR } from "../ir";
import { createDiagnostic, type Diagnostic } from "./diagnostics";

export function validateBubbleCompilation(document: BubbleDocument, program: BubbleProgramIR): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const bubbleLine = document.bubble.line;
    const sourcePath = program.sourcePath;
    const effectDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is EffectDeclaration => declaration.kind === "effect",
    );
    const observeDeclaration = document.bubble.declarations.find((declaration) => declaration.kind === "observe");

    if (Object.keys(program.bubble.axioms).length === 0) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL201",
                severity: "error",
                message: "A bubble must declare at least one axiom in the v0.1 profile.",
                sourcePath,
                line: bubbleLine,
            }),
        );
    }

    if (program.bubble.worldWill === null) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL202",
                severity: "error",
                message: "A bubble must declare a world will in the v0.1 profile.",
                sourcePath,
                line: bubbleLine,
            }),
        );
    }

    if (program.bubble.seed === null) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL203",
                severity: "error",
                message: "A bubble must declare a seed for reproducibility in the v0.1 profile.",
                sourcePath,
                line: bubbleLine,
            }),
        );
    }

    if (effectDeclarations.length === 0) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL204",
                severity: "error",
                message: "A bubble must declare at least one explicit effect in the v0.1 profile.",
                sourcePath,
                line: bubbleLine,
            }),
        );
    }

    const declaredKinds = new Map<string, number>();
    for (const declaration of effectDeclarations) {
        const previousLine = declaredKinds.get(declaration.effectKind);
        if (previousLine !== undefined) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL205",
                    severity: "error",
                    message: `Effect kind '${declaration.effectKind}' was already declared on line ${previousLine}.`,
                    sourcePath,
                    line: declaration.line,
                }),
            );
            continue;
        }

        declaredKinds.set(declaration.effectKind, declaration.line);
    }

    if (effectDeclarations.length > 0 && !effectDeclarations.some((declaration) => declaration.requirement === "required")) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL206",
                severity: "warning",
                message: "All declared effects are optional; the world has no mandatory semantic obligations yet.",
                sourcePath,
                line: effectDeclarations[0].line,
            }),
        );
    }

    if (observeDeclaration && !effectDeclarations.some((declaration) => declaration.effectKind === "observe")) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL207",
                severity: "error",
                message: "An observe declaration requires an explicit observe effect in the v0.1 profile.",
                sourcePath,
                line: observeDeclaration.line,
            }),
        );
    }

    if (
        observeDeclaration &&
        !effectDeclarations.some(
            (declaration) => declaration.effectKind === "commit" && declaration.requirement === "required",
        )
    ) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL208",
                severity: "error",
                message: "An observe declaration requires a required commit effect so observation can become durable history.",
                sourcePath,
                line: observeDeclaration.line,
            }),
        );
    }

    return diagnostics;
}
