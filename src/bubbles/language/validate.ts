import type {
    ActivateGrammarDeclaration,
    BubbleDocument,
    EffectDeclaration,
    EmitDeclaration,
    GrammarDeclaration,
    GeneratorDeclaration,
    QuoteDeclaration,
    RealizationDeclaration,
    ReflectDeclaration,
    SpawnDeclaration,
} from "./ast";
import { isBubbleScalarExpression } from "./expressions";
import type { BubbleProgramIR } from "../ir";
import { createDiagnostic, type Diagnostic } from "./diagnostics";

const SUPPORTED_REFLECT_PATHS = new Set(["self.address", "self.profile", "self.seed", "self.worldWill"]);
const SUPPORTED_GRAMMAR_BASE_PROFILES = new Set(["bubbles.v0.1", "bubbles.v0.2", "bubbles.v0.3"]);

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
    const grammarDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is GrammarDeclaration => declaration.kind === "grammar",
    );
    const grammarActivationDeclarations = document.bubble.declarations.filter(
        (declaration): declaration is ActivateGrammarDeclaration => declaration.kind === "activate-grammar",
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

    const namedMetaDeclarations = [...quoteDeclarations, ...generatorDeclarations, ...grammarDeclarations];
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

    const grammarsByName = new Map(grammarDeclarations.map((declaration) => [declaration.name, declaration]));
    const grammarNames = new Set(grammarsByName.keys());
    const localGrammarProfiles = new Set(grammarDeclarations.map((declaration) => declaration.artifact.profileName));
    const grammarLinesByProfile = new Map<string, number>();

    for (const grammarDeclaration of grammarDeclarations) {
        const { profileName, extendsProfile } = grammarDeclaration.artifact;
        const previousProfileLine = grammarLinesByProfile.get(profileName);
        if (previousProfileLine !== undefined) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL222",
                    severity: "error",
                    message: `Grammar profile '${profileName}' was already declared on line ${previousProfileLine}.`,
                    sourcePath,
                    line: grammarDeclaration.line,
                }),
            );
        } else {
            grammarLinesByProfile.set(profileName, grammarDeclaration.line);
        }

        if (!SUPPORTED_GRAMMAR_BASE_PROFILES.has(extendsProfile) && !localGrammarProfiles.has(extendsProfile)) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL220",
                    severity: "error",
                    message: `Grammar '${grammarDeclaration.name}' extends unknown base profile '${extendsProfile}'.`,
                    sourcePath,
                    line: grammarDeclaration.line,
                }),
            );
        }

        if (extendsProfile === profileName) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL220",
                    severity: "error",
                    message: `Grammar '${grammarDeclaration.name}' cannot extend its own profile '${profileName}'.`,
                    sourcePath,
                    line: grammarDeclaration.line,
                }),
            );
        }
    }

    const grammarByProfile = new Map(grammarDeclarations.map((declaration) => [declaration.artifact.profileName, declaration]));
    for (const grammarDeclaration of grammarDeclarations) {
        const cycle = findGrammarProfileCycle(grammarDeclaration.artifact.profileName, grammarByProfile);
        if (!cycle) {
            continue;
        }

        diagnostics.push(
            createDiagnostic({
                code: "BBL223",
                severity: "error",
                message: `Grammar '${grammarDeclaration.name}' participates in a local profile-extension cycle: ${cycle.join(" -> ")}.`,
                sourcePath,
                line: grammarDeclaration.line,
            }),
        );
    }

    for (const grammarActivationDeclaration of grammarActivationDeclarations) {
        if (!grammarNames.has(grammarActivationDeclaration.grammarName)) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL219",
                    severity: "error",
                    message: `Grammar activation references unknown grammar artifact '${grammarActivationDeclaration.grammarName}'.`,
                    sourcePath,
                    line: grammarActivationDeclaration.line,
                }),
            );
            continue;
        }

        const grammarDeclaration = grammarsByName.get(grammarActivationDeclaration.grammarName);
        if (
            grammarDeclaration
            && grammarActivationDeclaration.profileName !== null
            && grammarActivationDeclaration.profileName !== grammarDeclaration.artifact.profileName
        ) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL221",
                    severity: "error",
                    message: `Grammar activation for '${grammarActivationDeclaration.grammarName}' requests profile '${grammarActivationDeclaration.profileName}', but the grammar declares '${grammarDeclaration.artifact.profileName}'.`,
                    sourcePath,
                    line: grammarActivationDeclaration.line,
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

        if (
            generatorDeclaration !== null
            && generatorDeclaration.parameterName !== null
            && emitDeclaration.argument !== null
            && !isBubbleScalarExpression(emitDeclaration.argument)
        ) {
            diagnostics.push(
                createDiagnostic({
                    code: "BBL218",
                    severity: "error",
                    message: `Emit argument for generator '${emitDeclaration.sourceName}' must currently be a scalar literal or reference expression.`,
                    sourcePath,
                    line: emitDeclaration.line,
                }),
            );
        }
    }

    return diagnostics;
}

function findGrammarProfileCycle(
    startProfile: string,
    grammarByProfile: Map<string, GrammarDeclaration>,
): string[] | null {
    const path: string[] = [];
    const pathIndexByProfile = new Map<string, number>();
    let currentProfile = startProfile;

    while (true) {
        const currentGrammar = grammarByProfile.get(currentProfile);
        if (!currentGrammar) {
            return null;
        }

        pathIndexByProfile.set(currentProfile, path.length);
        path.push(currentProfile);

        const nextProfile = currentGrammar.artifact.extendsProfile;
        const cycleStartIndex = pathIndexByProfile.get(nextProfile);
        if (cycleStartIndex !== undefined) {
            return [...path.slice(cycleStartIndex), nextProfile];
        }

        if (!grammarByProfile.has(nextProfile)) {
            return null;
        }

        currentProfile = nextProfile;
    }
}
