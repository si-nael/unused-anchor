import type {
    BubbleDocument,
    EffectDeclaration,
    EmitDeclaration,
    GeneratorDeclaration,
    QuoteDeclaration,
    RealizationDeclaration,
    ReflectDeclaration,
    SpawnDeclaration,
} from "./ast";
import type { BubbleProgramIR } from "../ir";
import { createDiagnostic, type Diagnostic } from "./diagnostics";

const SUPPORTED_REFLECT_PATHS = new Set(["self.address", "self.profile", "self.seed", "self.worldWill"]);

export function validateBubbleCompilation(document: BubbleDocument, program: BubbleProgramIR): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const bubbleLine = document.bubble.line;
    const sourcePath = program.sourcePath;
    const profile = program.profile;
    const effectDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is EffectDeclaration => declaration.kind === "effect",
    );
    const observeDeclaration = document.bubble.declarations.find((declaration) => declaration.kind === "observe");
    const realizationDeclaration = document.bubble.declarations.find(
        (declaration): declaration is RealizationDeclaration => declaration.kind === "realization",
    );
    const spawnDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is SpawnDeclaration => declaration.kind === "spawn",
    );
    const quoteDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is QuoteDeclaration => declaration.kind === "quote",
    );
    const generatorDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is GeneratorDeclaration => declaration.kind === "generator",
    );
    const reflectDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is ReflectDeclaration => declaration.kind === "reflect",
    );
    const emitDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is EmitDeclaration => declaration.kind === "emit",
    );

    if (Object.keys(program.bubble.axioms).length === 0) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL201",
                severity: "error",
                message: `A bubble must declare at least one axiom in the ${profile} profile.`,
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
                message: `A bubble must declare a world will in the ${profile} profile.`,
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
                message: `A bubble must declare a seed for reproducibility in the ${profile} profile.`,
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
                message: `A bubble must declare at least one explicit effect in the ${profile} profile.`,
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
                message: `An observe declaration requires an explicit observe effect in the ${profile} profile.`,
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

    if (spawnDeclarations.length > 0 && !effectDeclarations.some((declaration) => declaration.effectKind === "spawn")) {
        for (const spawnDeclaration of spawnDeclarations) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL209",
                    severity: "error",
                    message: `A spawn declaration requires an explicit spawn effect in the ${profile} profile.`,
                    sourcePath,
                    line: spawnDeclaration.line,
                }),
            );
        }
    }

    if (realizationDeclaration?.mode === "deterministic" && effectDeclarations.some((declaration) => declaration.effectKind === "branch")) {
        diagnostics.push(
            createDiagnostic({
                code: "BBL210",
                severity: "error",
                message: "A deterministic realization declaration cannot coexist with a branch effect in the current profile.",
                sourcePath,
                line: realizationDeclaration.line,
            }),
        );
    }

    const namedMetaDeclarations = [...quoteDeclarations, ...generatorDeclarations];
    const namedMetaLines = new Map<string, number>();
    for (const declaration of namedMetaDeclarations) {
        const previousLine = namedMetaLines.get(declaration.name);
        if (previousLine !== undefined) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL211",
                    severity: "error",
                    message: `Meta artifact name '${declaration.name}' was already declared on line ${previousLine}.`,
                    sourcePath,
                    line: declaration.line,
                }),
            );
            continue;
        }

        namedMetaLines.set(declaration.name, declaration.line);
    }

    const quoteNames = new Set(quoteDeclarations.map((declaration) => declaration.name));
    const generatorsByName = new Map(generatorDeclarations.map((declaration) => [declaration.name, declaration]));

    for (const generatorDeclaration of generatorDeclarations) {
        if (!quoteNames.has(generatorDeclaration.sourceQuoteName)) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL212",
                    severity: "error",
                    message: `Generator '${generatorDeclaration.name}' references unknown quote '${generatorDeclaration.sourceQuoteName}'.`,
                    sourcePath,
                    line: generatorDeclaration.line,
                }),
            );
        }
    }

    for (const reflectDeclaration of reflectDeclarations) {
        if (!SUPPORTED_REFLECT_PATHS.has(reflectDeclaration.path)) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL213",
                    severity: "error",
                    message: `Reflect path '${reflectDeclaration.path}' is not supported in the current meta profile.`,
                    sourcePath,
                    line: reflectDeclaration.line,
                }),
            );
        }
    }

    for (const emitDeclaration of emitDeclarations) {
        const generatorDeclaration = generatorsByName.get(emitDeclaration.sourceName) ?? null;
        const hasQuote = quoteNames.has(emitDeclaration.sourceName);

        if (generatorDeclaration === null && !hasQuote) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL214",
                    severity: "error",
                    message: `Emit references unknown meta artifact '${emitDeclaration.sourceName}'.`,
                    sourcePath,
                    line: emitDeclaration.line,
                }),
            );
            continue;
        }

        if (hasQuote && emitDeclaration.argument !== null) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL215",
                    severity: "error",
                    message: `Emit cannot pass an argument when activating quote '${emitDeclaration.sourceName}'.`,
                    sourcePath,
                    line: emitDeclaration.line,
                }),
            );
        }

        if (generatorDeclaration !== null && generatorDeclaration.parameterName !== null && emitDeclaration.argument === null) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL216",
                    severity: "error",
                    message: `Emit must supply an argument for generator '${emitDeclaration.sourceName}'.`,
                    sourcePath,
                    line: emitDeclaration.line,
                }),
            );
        }

        if (generatorDeclaration !== null && generatorDeclaration.parameterName === null && emitDeclaration.argument !== null) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL217",
                    severity: "error",
                    message: `Emit cannot pass an argument to generator '${emitDeclaration.sourceName}' because it declares no parameter.`,
                    sourcePath,
                    line: emitDeclaration.line,
                }),
            );
        }
    }

    return diagnostics;
}
