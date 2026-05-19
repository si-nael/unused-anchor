import type {
    BubbleAddressIR,
    BubbleAddressTemplateIR,
    BubbleEmissionIR,
    BubbleGrammarActivationIR,
    BubbleGrammarIR,
    BubbleGeneratorIR,
    BubbleGenerativeRelationIR,
    BubbleGenerationIR,
    BubbleMetaIR,
    BubbleProfile,
    BubbleQuoteIR,
    BubbleRealizationMode,
    BubbleProgramIR,
    BubbleReflectionIR,
    BubbleVersion,
    EffectIR,
    ObligationIR,
} from "../ir";
import { formatBubbleExpression } from "./expressions";
import type {
    ActivateGrammarDeclaration,
    BubbleDocument,
    EmitDeclaration,
    GrammarDeclaration,
    GeneratorDeclaration,
    QuoteDeclaration,
    ReflectDeclaration,
    SpawnDeclaration,
} from "./ast";
import { throwDiagnostic } from "./diagnostics";

export function lowerBubbleDocument(document: BubbleDocument): BubbleProgramIR {
    const axioms = new Map<string, boolean | number | string>();
    let authoredRealizationMode: BubbleRealizationMode | null = null;
    let worldWill: string | null = null;
    let seed: string | null = null;
    let observationMode: string | null = null;
    const spawnDeclarations: SpawnDeclaration[] = [];
    const quoteDeclarations: QuoteDeclaration[] = [];
    const generatorDeclarations: GeneratorDeclaration[] = [];
    const grammarDeclarations: GrammarDeclaration[] = [];
    const grammarActivationDeclarations: ActivateGrammarDeclaration[] = [];
    const reflectDeclarations: ReflectDeclaration[] = [];
    const emitDeclarations: EmitDeclaration[] = [];
    const effects: EffectIR[] = [];

    for (const declaration of document.bubble.declarations) {
        switch (declaration.kind) {
            case "axiom":
                if (axioms.has(declaration.name)) {
                    throwDiagnostic({
                        code: "BBL101",
                        severity: "error",
                        message: `Duplicate axiom '${declaration.name}' on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                axioms.set(declaration.name, declaration.value);
                break;
            case "realization":
                if (authoredRealizationMode !== null) {
                    throwDiagnostic({
                        code: "BBL105",
                        severity: "error",
                        message: `Duplicate realization declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                authoredRealizationMode = declaration.mode;
                break;
            case "will":
                if (worldWill !== null) {
                    throwDiagnostic({
                        code: "BBL102",
                        severity: "error",
                        message: `Duplicate world will declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                worldWill = declaration.expression;
                break;
            case "seed":
                if (seed !== null) {
                    throwDiagnostic({
                        code: "BBL103",
                        severity: "error",
                        message: `Duplicate seed declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                seed = declaration.value;
                break;
            case "observe":
                if (observationMode !== null) {
                    throwDiagnostic({
                        code: "BBL104",
                        severity: "error",
                        message: `Duplicate observe declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                observationMode = declaration.mode;
                break;
            case "spawn":
                spawnDeclarations.push(declaration);
                break;
            case "quote":
                quoteDeclarations.push(declaration);
                break;
            case "generator":
                generatorDeclarations.push(declaration);
                break;
            case "grammar":
                grammarDeclarations.push(declaration);
                break;
            case "activate-grammar":
                grammarActivationDeclarations.push(declaration);
                break;
            case "reflect":
                reflectDeclarations.push(declaration);
                break;
            case "emit":
                emitDeclarations.push(declaration);
                break;
            case "effect":
                effects.push({
                    id: createEffectId(declaration.line, declaration.effectKind),
                    sourceLine: declaration.line,
                    sourceConstruct: "effect",
                    kind: declaration.effectKind,
                    requirement: declaration.requirement,
                    scope: declaration.scope,
                });
                break;
            default:
                assertNever(declaration);
        }
    }

    const address = buildBubbleAddress(document.sourcePath, document.bubble.name);
    const obligations = buildObligations(effects);
    const generation = buildGeneration(address, effects, worldWill, observationMode, authoredRealizationMode, spawnDeclarations);
    const meta = buildMeta(
        quoteDeclarations,
        generatorDeclarations,
        grammarDeclarations,
        grammarActivationDeclarations,
        reflectDeclarations,
        emitDeclarations,
    );
    const hasV03Meta = grammarDeclarations.length > 0 || grammarActivationDeclarations.length > 0;
    const profile = hasV03Meta ? "bubbles.v0.3" : meta === null ? "bubbles.v0.1" : "bubbles.v0.2";
    const version = profile === "bubbles.v0.3" ? "0.3.0" : profile === "bubbles.v0.2" ? "0.2.0" : "0.1.0";

    return {
        version,
        profile,
        sourcePath: document.sourcePath,
        bubble: {
            address,
            name: document.bubble.name,
            axioms: Object.fromEntries(axioms),
            worldWill,
            seed,
            observationMode,
            effects,
            obligations,
            generation,
            ...(meta === null ? {} : { meta }),
        },
    };
}

function buildMeta(
    quoteDeclarations: QuoteDeclaration[],
    generatorDeclarations: GeneratorDeclaration[],
    grammarDeclarations: GrammarDeclaration[],
    grammarActivationDeclarations: ActivateGrammarDeclaration[],
    reflectDeclarations: ReflectDeclaration[],
    emitDeclarations: EmitDeclaration[],
): BubbleMetaIR | null {
    if (
        quoteDeclarations.length === 0 &&
        generatorDeclarations.length === 0 &&
        grammarDeclarations.length === 0 &&
        grammarActivationDeclarations.length === 0 &&
        reflectDeclarations.length === 0 &&
        emitDeclarations.length === 0
    ) {
        return null;
    }

    const quotes = quoteDeclarations.map((declaration) => buildQuote(declaration));
    const generators = generatorDeclarations.map((declaration) => buildGenerator(declaration));
    const grammars = grammarDeclarations.map((declaration) => buildGrammar(declaration));
    const grammarActivations = grammarActivationDeclarations.map((declaration) => buildGrammarActivation(declaration));
    const reflections = reflectDeclarations.map((declaration) => buildReflection(declaration));
    const emissions = buildEmissions(emitDeclarations, quotes, generators, reflections);

    return {
        quotes,
        generators,
        reflections,
        emissions,
        ...(grammars.length === 0 ? {} : { grammars }),
        ...(grammarActivations.length === 0 ? {} : { grammarActivations }),
    };
}

function buildObligations(effects: EffectIR[]): ObligationIR[] {
    return effects
        .filter((effect) => effect.requirement === "required")
        .map((effect) => ({
            effectId: effect.id,
            effectKind: effect.kind,
            scope: effect.scope,
            description: `Author declared ${effect.kind} as a required ${effect.scope} effect.`,
        }));
}

function buildGeneration(
    address: BubbleAddressIR,
    effects: EffectIR[],
    worldWill: string | null,
    observationMode: string | null,
    authoredRealizationMode: BubbleRealizationMode | null,
    spawnDeclarations: SpawnDeclaration[],
): BubbleGenerationIR {
    const inferredRealizationMode = effects.some((effect) => effect.kind === "branch") ? "nondeterministic" : "deterministic";

    return {
        realizationMode: authoredRealizationMode ?? inferredRealizationMode,
        realizationSource: authoredRealizationMode === null ? "inferred" : "authored",
        worldWillMode: worldWill === null ? "absent" : "governing-principle",
        lifecycle: {
            initialMode: "latent",
            observationMode,
            commitsHistory: effects.some((effect) => effect.kind === "commit"),
            supportsCollapse: effects.some((effect) => effect.kind === "collapse"),
            supportsLeakage: effects.some((effect) => effect.kind === "leak"),
            carriesDebt: effects.some((effect) => effect.kind === "debt"),
            supportsPerturbation: effects.some((effect) => effect.kind === "perturb"),
        },
        relations: buildGenerativeRelations(address, effects, spawnDeclarations),
    };
}

function buildQuote(declaration: QuoteDeclaration): BubbleQuoteIR {
    return {
        id: createQuoteId(declaration.line, declaration.name),
        name: declaration.name,
        sourceLine: declaration.line,
        artifactKind: "bubble-source",
        artifactSource: declaration.artifactSource,
    };
}

function buildGenerator(declaration: GeneratorDeclaration): BubbleGeneratorIR {
    return {
        id: createGeneratorId(declaration.line, declaration.name),
        name: declaration.name,
        sourceLine: declaration.line,
        parameterName: declaration.parameterName,
        sourceQuoteName: declaration.sourceQuoteName,
    };
}

function buildGrammar(declaration: GrammarDeclaration): BubbleGrammarIR {
    return {
        id: createGrammarId(declaration.line, declaration.name),
        name: declaration.name,
        sourceLine: declaration.line,
        artifact: declaration.artifact,
    };
}

function buildGrammarActivation(declaration: ActivateGrammarDeclaration): BubbleGrammarActivationIR {
    return {
        id: createGrammarActivationId(declaration.line, declaration.grammarName),
        sourceLine: declaration.line,
        grammarName: declaration.grammarName,
        profileName: declaration.profileName,
    };
}

function buildReflection(declaration: ReflectDeclaration): BubbleReflectionIR {
    return {
        id: createReflectionId(declaration.line, declaration.path),
        sourceLine: declaration.line,
        path: declaration.path,
    };
}

function buildEmissions(
    emitDeclarations: EmitDeclaration[],
    quotes: BubbleQuoteIR[],
    generators: BubbleGeneratorIR[],
    reflections: BubbleReflectionIR[],
): BubbleEmissionIR[] {
    const quotesByName = new Map(quotes.map((quote) => [quote.name, quote]));
    const generatorsByName = new Map(generators.map((generator) => [generator.name, generator]));

    return emitDeclarations.map((declaration) => {
        const generator = generatorsByName.get(declaration.sourceName) ?? null;
        const quote = quotesByName.get(declaration.sourceName) ?? null;
        const sourceKind = generator !== null ? "generator" : quote !== null ? "quote" : "unknown";

        return {
            id: createEmitId(declaration.line, declaration.sourceName),
            sourceLine: declaration.line,
            sourceName: declaration.sourceName,
            sourceKind,
            argument: declaration.argument,
            target: declaration.target,
            provenance: {
                quoteName: generator?.sourceQuoteName ?? quote?.name ?? null,
                generatorName: generator?.name ?? null,
                reflectionIds: reflections
                    .filter((reflection) => reflection.sourceLine < declaration.line)
                    .map((reflection) => reflection.id),
            },
        };
    });
}

function buildGenerativeRelations(
    address: BubbleAddressIR,
    effects: EffectIR[],
    spawnDeclarations: SpawnDeclaration[],
): BubbleGenerativeRelationIR[] {
    const nonSpawnRelations = effects
        .filter(
            (effect): effect is EffectIR & { kind: "branch" | "collapse" } =>
                effect.kind === "branch" || effect.kind === "collapse",
        )
        .map((effect) => ({
            kind: effect.kind,
            sourceEffectId: effect.id,
            requirement: effect.requirement,
            scope: effect.scope,
            target: generativeTarget(effect.kind),
            familyName: null,
            condition: null,
            targetAddressTemplate: buildTargetAddressTemplate(address, effect, null),
            description: generativeDescription(effect, null),
        }));
    const spawnEffect = effects.find((effect): effect is EffectIR & { kind: "spawn" } => effect.kind === "spawn");

    if (!spawnEffect) {
        return nonSpawnRelations;
    }

    const spawnRelations = spawnDeclarations.length === 0
        ? [buildSpawnRelation(address, spawnEffect, null)]
        : spawnDeclarations.map((spawnDeclaration) => buildSpawnRelation(address, spawnEffect, spawnDeclaration));

    return [...nonSpawnRelations, ...spawnRelations];
}

function buildBubbleAddress(sourcePath: string | null, bubbleName: string): BubbleAddressIR {
    const anchor = normalizeAnchor(sourcePath);
    const path = [{ kind: "root", key: bubbleName }] as const;

    return {
        scheme: "bubble-lineage.v1",
        locatorKind: "source-relative",
        anchor,
        path: [...path],
        id: createAddressId(anchor, path),
    };
}

function buildTargetAddressTemplate(
    address: BubbleAddressIR,
    effect: EffectIR & { kind: BubbleGenerativeRelationIR["kind"] },
    spawnDeclaration: SpawnDeclaration | null,
): BubbleAddressTemplateIR {
    const pathKey = spawnDeclaration === null ? effect.id : `${spawnDeclaration.familyName}:${spawnDeclaration.line}`;

    return {
        locatorKind: "lineage-relative",
        baseAddressId: address.id,
        pathSuffix: [
            {
                kind: effect.kind,
                key: pathKey,
            },
        ],
        description: createAddressTemplateDescription(address.id, effect, spawnDeclaration),
    };
}

function buildSpawnRelation(
    address: BubbleAddressIR,
    effect: EffectIR & { kind: "spawn" },
    spawnDeclaration: SpawnDeclaration | null,
): BubbleGenerativeRelationIR {
    return {
        kind: "spawn",
        sourceEffectId: effect.id,
        requirement: effect.requirement,
        scope: effect.scope,
        target: "descendant-bubble",
        familyName: spawnDeclaration?.familyName ?? null,
        condition: spawnDeclaration?.condition ?? null,
        targetAddressTemplate: buildTargetAddressTemplate(address, effect, spawnDeclaration),
        description: generativeDescription(effect, spawnDeclaration),
    };
}

function generativeTarget(kind: BubbleGenerativeRelationIR["kind"]): BubbleGenerativeRelationIR["target"] {
    switch (kind) {
        case "branch":
            return "alternative-bubble";
        case "spawn":
            return "descendant-bubble";
        case "collapse":
            return "retired-bubble";
        default:
            return assertNever(kind);
    }
}

function generativeDescription(
    effect: EffectIR & { kind: BubbleGenerativeRelationIR["kind"] },
    spawnDeclaration: SpawnDeclaration | null,
): string {
    switch (effect.kind) {
        case "branch":
            return `This bubble may realize alternative bubble continuations through ${effect.requirement} ${effect.scope} branching.`;
        case "spawn":
            return createSpawnDescription(effect as EffectIR & { kind: "spawn" }, spawnDeclaration);
        case "collapse":
            return `This bubble may retire active bubbles through ${effect.requirement} ${effect.scope} collapse.`;
        default:
            return assertNever(effect.kind);
    }
}

function createSpawnDescription(
    effect: EffectIR & { kind: "spawn" },
    spawnDeclaration: SpawnDeclaration | null,
): string {
    const familyName = spawnDeclaration === null ? "descendant bubbles" : `descendant family '${spawnDeclaration.familyName}'`;
    const condition = spawnDeclaration?.condition === null || spawnDeclaration === null
        ? ""
        : ` when ${formatBubbleExpression(spawnDeclaration.condition)}`;
    return `This bubble may bring ${familyName} into existence through ${effect.requirement} ${effect.scope} spawning${condition}.`;
}

function createAddressTemplateDescription(
    baseAddressId: string,
    effect: EffectIR & { kind: BubbleGenerativeRelationIR["kind"] },
    spawnDeclaration: SpawnDeclaration | null,
): string {
    const target = generativeTarget(effect.kind);
    const relationDetail = spawnDeclaration === null
        ? `relation ${effect.id}`
        : `family ${spawnDeclaration.familyName} at line ${spawnDeclaration.line}`;
    return `Derive a ${target} address from ${baseAddressId} via ${effect.requirement} ${effect.scope} ${effect.kind} ${relationDetail}.`;
}

function createEffectId(line: number, kind: EffectIR["kind"]): string {
    return `effect:${line}:${kind}`;
}

function createQuoteId(line: number, name: string): string {
    return `quote:${line}:${name}`;
}

function createGeneratorId(line: number, name: string): string {
    return `generator:${line}:${name}`;
}

function createGrammarId(line: number, name: string): string {
    return `grammar:${line}:${name}`;
}

function createGrammarActivationId(line: number, grammarName: string): string {
    return `activate-grammar:${line}:${grammarName}`;
}

function createReflectionId(line: number, path: string): string {
    return `reflect:${line}:${path}`;
}

function createEmitId(line: number, sourceName: string): string {
    return `emit:${line}:${sourceName}`;
}

function createAddressId(
    anchor: string,
    path: ReadonlyArray<{
        kind: string;
        key: string;
    }>,
): string {
    const encodedPath = path.map((step) => `${step.kind}:${step.key}`).join("/");
    return `bubble:${anchor}::${encodedPath}`;
}

function normalizeAnchor(sourcePath: string | null): string {
    return (sourcePath ?? "<memory>").replace(/\\/g, "/");
}

function assertNever(value: never): never {
    throw new Error(`Unhandled declaration: ${JSON.stringify(value)}`);
}
