import type {
    BubbleAddressIR,
    BubbleAddressTemplateIR,
    BubbleAnchorCriterionIR,
    BubbleBoundaryIR,
    BubbleBoundaryScopeIR,
    BubbleEmissionIR,
    BubbleEffectRolesIR,
    EffectEventIR,
    BubbleExpressionIR,
    BubbleGrammarActivationIR,
    BubbleGrammarIR,
    BubbleGeneratorIR,
    BubbleGenerativeRelationIR,
    BubbleGenerationIR,
    BubbleLatentTopologyIR,
    BubbleMetaIR,
    BubbleProfile,
    BubbleQuoteIR,
    BubbleRealizationMode,
    BubbleProgramIR,
    BubbleReflectionIR,
    BubbleUnresolvedSemanticIR,
    BubbleVersion,
    BubbleWorldWillCriterionIR,
    EffectPermissionIR,
    EffectPressureIR,
    EffectIR,
    EffectTraceIR,
    ObligationIR,
} from "../ir";
import { formatBubbleExpression } from "./expressions";
import type {
    ActivateGrammarDeclaration,
    AnchorDeclaration,
    BubbleDocument,
    EmitDeclaration,
    GrammarDeclaration,
    GeneratorDeclaration,
    QuoteDeclaration,
    ReflectDeclaration,
    SpawnDeclaration,
    UnresolvedSemanticDeclaration,
    WillDeclaration,
} from "./ast";
import { throwDiagnostic } from "./diagnostics";

export function lowerBubbleDocument(document: BubbleDocument): BubbleProgramIR {
    const axioms = new Map<string, boolean | number | string>();
    let authoredRealizationMode: BubbleRealizationMode | null = null;
    let worldWillDeclaration: WillDeclaration | null = null;
    let seed: string | null = null;
    let observationMode: string | null = null;
    let anchorDeclaration: AnchorDeclaration | null = null;
    const unresolvedSemanticDeclarations: UnresolvedSemanticDeclaration[] = [];
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
                if (worldWillDeclaration !== null) {
                    throwDiagnostic({
                        code: "BBL102",
                        severity: "error",
                        message: `Duplicate world will declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                worldWillDeclaration = declaration;
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
            case "anchor":
                if (anchorDeclaration !== null) {
                    throwDiagnostic({
                        code: "BBL106",
                        severity: "error",
                        message: `Duplicate anchor identity declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                anchorDeclaration = declaration;
                break;
            case "unresolved-semantic":
                unresolvedSemanticDeclarations.push(declaration);
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
    const worldWill = worldWillDeclaration?.description ?? null;
    const worldWillCriterion = buildWorldWillCriterion(worldWillDeclaration);
    const obligations = buildObligations(effects);
    const effectRoles = buildEffectRoles(effects, obligations);
    const generation = buildGeneration(address, effects, worldWill, worldWillCriterion, observationMode, authoredRealizationMode, spawnDeclarations);
    const anchorCriterion = buildAnchorCriterion(anchorDeclaration);
    const unresolvedSemantics = buildUnresolvedSemantics(unresolvedSemanticDeclarations);
    const boundary = buildBoundary(effects, obligations, generation.relations, unresolvedSemantics, anchorCriterion, worldWillCriterion);
    const latentTopology = buildLatentTopology(unresolvedSemantics, boundary);
    const meta = buildMeta(
        quoteDeclarations,
        generatorDeclarations,
        grammarDeclarations,
        grammarActivationDeclarations,
        reflectDeclarations,
        emitDeclarations,
    );
    const hasV04Semantics = unresolvedSemantics.length > 0 || anchorCriterion !== null || worldWillCriterion !== null;
    const hasV03Meta = grammarDeclarations.length > 0 || grammarActivationDeclarations.length > 0;
    const profile = hasV04Semantics
        ? "bubbles.v0.4"
        : hasV03Meta
            ? "bubbles.v0.3"
            : meta === null
                ? "bubbles.v0.1"
                : "bubbles.v0.2";
    const version = profile === "bubbles.v0.4"
        ? "0.4.0"
        : profile === "bubbles.v0.3"
            ? "0.3.0"
            : profile === "bubbles.v0.2"
                ? "0.2.0"
                : "0.1.0";

    return {
        version,
        profile,
        sourcePath: document.sourcePath,
        bubble: {
            address,
            name: document.bubble.name,
            axioms: Object.fromEntries(axioms),
            worldWill,
            ...(worldWillCriterion === null ? {} : { worldWillCriterion }),
            seed,
            observationMode,
            boundary,
            effects,
            obligations,
            effectRoles,
            generation,
            ...(anchorCriterion === null ? {} : { anchorCriterion }),
            ...(unresolvedSemantics.length === 0 ? {} : { unresolvedSemantics }),
            ...(latentTopology === null ? {} : { latentTopology }),
            ...(meta === null ? {} : { meta }),
        },
    };
}

function buildAnchorCriterion(declaration: AnchorDeclaration | null): BubbleAnchorCriterionIR | null {
    if (declaration === null) {
        return null;
    }

    return {
        id: `anchor:${declaration.line}:identity`,
        sourceLine: declaration.line,
        description: declaration.description,
        expression: declaration.expression,
    };
}

function buildWorldWillCriterion(declaration: WillDeclaration | null): BubbleWorldWillCriterionIR | null {
    if (declaration === null || declaration.expression.kind === "text") {
        return null;
    }

    return {
        id: `world-will:${declaration.line}`,
        sourceLine: declaration.line,
        description: declaration.description,
        expression: declaration.expression,
    };
}

function buildUnresolvedSemantics(
    declarations: UnresolvedSemanticDeclaration[],
): BubbleUnresolvedSemanticIR[] {
    return declarations.map((declaration) => ({
        id: `semantic:${declaration.line}:${declaration.semanticKind}:${declaration.name}`,
        kind: declaration.semanticKind,
        name: declaration.name,
        description: declaration.description,
        ...(declaration.expression === null ? {} : { expression: declaration.expression }),
        sourceLine: declaration.line,
    }));
}

function buildLatentTopology(
    unresolvedSemantics: BubbleUnresolvedSemanticIR[],
    boundary: BubbleBoundaryIR,
): BubbleLatentTopologyIR | null {
    const latentRegions = unresolvedSemantics.filter(
        (
            fragment,
        ): fragment is BubbleUnresolvedSemanticIR & { kind: "hidden-region" | "latent-bubble" } => fragment.kind === "hidden-region" || fragment.kind === "latent-bubble",
    );

    if (latentRegions.length === 0) {
        return null;
    }

    return {
        mode: "bubble-latent-topology.v1",
        regions: latentRegions.map((fragment) => ({
            id: `latent-region:${fragment.id}`,
            sourceSemanticId: fragment.id,
            name: fragment.name,
            kind: fragment.kind,
            description: fragment.description,
            sourceLine: fragment.sourceLine,
            initialState: "latent",
            observationBoundary: boundary.observationSurface,
            commitBoundary: boundary.historyCommitSurface,
            perturbationMode: boundary.perturbationSurface,
        })),
        collapseEvidenceDrafts: latentRegions.map((fragment) => ({
            id: `collapse-evidence-draft:${fragment.id}`,
            latentRegionId: `latent-region:${fragment.id}`,
            sourceSemanticId: fragment.id,
            observationEffectIds: boundary.observationEffectIds,
            perturbEffectIds: boundary.perturbEffectIds,
            commitEffectIds: boundary.commitEffectIds,
            draftStatus: boundary.observationEffectIds.length === 0
                ? "underspecified"
                : boundary.commitEffectIds.length === 0
                    ? "history-open"
                    : "observation-ready",
            description: boundary.observationEffectIds.length === 0
                ? `Latent region ${fragment.name} has no declared observation surface, so collapse evidence remains underspecified in the current IR draft.`
                : boundary.commitEffectIds.length === 0
                    ? `Latent region ${fragment.name} can materialize under the declared observation surface${boundary.perturbEffectIds.length === 0 ? "" : " with declared perturbation support"}, but no history-commit boundary is declared yet.`
                    : `Latent region ${fragment.name} can materialize under the declared observation surface${boundary.perturbEffectIds.length === 0 ? "" : " with declared perturbation support"} and later anchor that collapse through declared history support.`,
        })),
    };
}

function buildBoundary(
    effects: EffectIR[],
    obligations: ObligationIR[],
    relations: BubbleGenerativeRelationIR[],
    unresolvedSemantics: BubbleUnresolvedSemanticIR[],
    anchorCriterion: BubbleAnchorCriterionIR | null,
    worldWillCriterion: BubbleWorldWillCriterionIR | null,
): BubbleBoundaryIR {
    const observationEffectIds = effects
        .filter((effect) => effect.kind === "observe")
        .map((effect) => effect.id);
    const commitEffectIds = effects
        .filter((effect) => effect.kind === "commit")
        .map((effect) => effect.id);
    const perturbEffectIds = effects
        .filter((effect) => effect.kind === "perturb")
        .map((effect) => effect.id);
    const scopes = buildBoundaryScopes(effects, obligations, relations);
    const semanticReferences = collectBoundarySemanticReferences(unresolvedSemantics, anchorCriterion, worldWillCriterion);

    return {
        mode: "bubble-boundary.v1",
        observationSurface: observationEffectIds.length === 0
            ? "undeclared-observation-surface"
            : "declared-observation-surface",
        historyCommitSurface: commitEffectIds.length === 0
            ? "undeclared-history-support"
            : "declared-history-support",
        perturbationSurface: perturbEffectIds.length === 0
            ? "no-declared-perturbation"
            : "declared-perturbation",
        observationEffectIds,
        commitEffectIds,
        perturbEffectIds,
        scopes,
        semanticReferences,
        description: scopes.length === 0 && semanticReferences.length === 0 && observationEffectIds.length === 0 && commitEffectIds.length === 0
            ? "Bubble currently declares no explicit boundary surface beyond the root address envelope."
            : `Bubble boundary currently tracks ${observationEffectIds.length} observation surface${observationEffectIds.length === 1 ? "" : "s"}, ${commitEffectIds.length} history-commit surface${commitEffectIds.length === 1 ? "" : "s"}, ${scopes.length} scoped membrane/global boundary group${scopes.length === 1 ? "" : "s"}, and ${semanticReferences.length} boundary-referencing semantic path${semanticReferences.length === 1 ? "" : "s"}.`,
    };
}

function buildBoundaryScopes(
    effects: EffectIR[],
    obligations: ObligationIR[],
    relations: BubbleGenerativeRelationIR[],
): BubbleBoundaryScopeIR[] {
    const boundaryScopes = ["membrane", "global"] as const;

    return boundaryScopes.flatMap((scope) => {
        const scopedEffects = effects.filter((effect) => effect.scope === scope).map((effect) => effect.id);
        const scopedObligations = obligations.filter((obligation) => obligation.scope === scope).map((obligation) => obligation.effectId);
        const scopedRelations = relations.filter((relation) => relation.scope === scope);

        if (scopedEffects.length === 0 && scopedObligations.length === 0 && scopedRelations.length === 0) {
            return [];
        }

        return [{
            scope,
            effectIds: scopedEffects,
            obligationEffectIds: scopedObligations,
            relationSourceEffectIds: scopedRelations.map((relation) => relation.sourceEffectId),
            relationKinds: Array.from(new Set(scopedRelations.map((relation) => relation.kind))),
        } satisfies BubbleBoundaryScopeIR];
    });
}

function collectBoundarySemanticReferences(
    unresolvedSemantics: BubbleUnresolvedSemanticIR[],
    anchorCriterion: BubbleAnchorCriterionIR | null,
    worldWillCriterion: BubbleWorldWillCriterionIR | null,
): BubbleBoundaryIR["semanticReferences"] {
    const references: BubbleBoundaryIR["semanticReferences"] = unresolvedSemantics.flatMap((fragment) => {
        if ((fragment.kind !== "constraint" && fragment.kind !== "partial-law") || fragment.expression === undefined) {
            return [];
        }

        const sourceKind = fragment.kind;

        return collectBoundaryReferencePaths(fragment.expression).map((path) => ({
            path,
            sourceKind,
            sourceId: fragment.id,
        }));
    });

    if (anchorCriterion !== null) {
        references.push(...collectBoundaryReferencePaths(anchorCriterion.expression).map((path) => ({
            path,
            sourceKind: "anchor-criterion" as const,
            sourceId: anchorCriterion.id,
        })));
    }

    if (worldWillCriterion !== null) {
        references.push(...collectBoundaryReferencePaths(worldWillCriterion.expression).map((path) => ({
            path,
            sourceKind: "world-will" as const,
            sourceId: worldWillCriterion.id,
        })));
    }

    return references;
}

function collectBoundaryReferencePaths(expression: BubbleExpressionIR): string[] {
    switch (expression.kind) {
        case "text":
            return [];
        case "reference":
            return expression.path.startsWith("boundary.") || expression.path.startsWith("membrane.")
                ? [expression.path]
                : [];
        case "literal":
            return [];
        case "comparison":
            return [
                ...collectBoundaryReferencePaths(expression.left),
                ...collectBoundaryReferencePaths(expression.right),
            ];
        case "logical":
            return [
                ...collectBoundaryReferencePaths(expression.left),
                ...collectBoundaryReferencePaths(expression.right),
            ];
        default:
            return assertNever(expression);
    }
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

function buildEffectRoles(
    effects: EffectIR[],
    obligations: ObligationIR[],
): BubbleEffectRolesIR {
    return {
        declarations: effects.map((effect) => ({ ...effect })),
        obligations: obligations.map((obligation) => ({ ...obligation })),
        permissions: effects.map((effect) => ({
            effectId: effect.id,
            effectKind: effect.kind,
            scope: effect.scope,
            requirement: effect.requirement,
            description: `Author permits ${effect.requirement} ${effect.scope} ${effect.kind} within the current bubble boundary.`,
        } satisfies EffectPermissionIR)),
        pressures: effects.flatMap((effect) => buildEffectPressures(effect)),
        events: effects.flatMap((effect) => buildEffectEvents(effect)),
        traces: effects.map((effect) => ({
            effectId: effect.id,
            sourceLine: effect.sourceLine,
            traceKind: "declared-effect",
            description: `Effect ${effect.id} preserves one declared-effect trace origin for downstream planning and runtime evidence.`,
        } satisfies EffectTraceIR)),
    };
}

function buildEffectPressures(effect: EffectIR): EffectPressureIR[] {
    switch (effect.kind) {
        case "branch":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                pressureKind: "branch-pressure",
                description: `Effect ${effect.id} contributes branch pressure inside the current bubble boundary.`,
            }];
        case "collapse":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                pressureKind: "collapse-pressure",
                description: `Effect ${effect.id} contributes collapse pressure inside the current bubble boundary.`,
            }];
        case "leak":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                pressureKind: effect.scope === "global" ? "global-leak" : effect.scope === "membrane" ? "membrane-leak" : "local-leak",
                description: `Effect ${effect.id} contributes ${effect.scope} leak pressure inside the current bubble boundary.`,
            }];
        case "debt":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                pressureKind: "unresolved-debt",
                description: `Effect ${effect.id} contributes unresolved debt pressure inside the current bubble boundary.`,
            }];
        case "perturb":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                pressureKind: "law-perturbation",
                description: `Effect ${effect.id} contributes perturbation pressure inside the current bubble boundary.`,
            }];
        case "observe":
        case "commit":
        case "spawn":
            return [];
        default:
            return assertNever(effect.kind);
    }
}

function buildEffectEvents(effect: EffectIR): EffectEventIR[] {
    switch (effect.kind) {
        case "observe":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                eventKind: "observation-surface",
                description: `Effect ${effect.id} opens an observation-surface event role for the current bubble.`,
            }];
        case "commit":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                eventKind: "history-commit",
                description: `Effect ${effect.id} opens a history-commit event role for the current bubble.`,
            }];
        case "spawn":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                eventKind: "descendant-generation",
                description: `Effect ${effect.id} opens a descendant-generation event role for the current bubble.`,
            }];
        case "branch":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                eventKind: "alternative-branch",
                description: `Effect ${effect.id} opens an alternative-branch event role for the current bubble.`,
            }];
        case "collapse":
            return [{
                effectId: effect.id,
                effectKind: effect.kind,
                scope: effect.scope,
                eventKind: "retirement-collapse",
                description: `Effect ${effect.id} opens a retirement-collapse event role for the current bubble.`,
            }];
        case "leak":
        case "debt":
        case "perturb":
            return [];
        default:
            return assertNever(effect.kind);
    }
}

function buildGeneration(
    address: BubbleAddressIR,
    effects: EffectIR[],
    worldWill: string | null,
    worldWillCriterion: BubbleWorldWillCriterionIR | null,
    observationMode: string | null,
    authoredRealizationMode: BubbleRealizationMode | null,
    spawnDeclarations: SpawnDeclaration[],
): BubbleGenerationIR {
    const inferredRealizationMode = effects.some((effect) => effect.kind === "branch") ? "nondeterministic" : "deterministic";

    return {
        realizationMode: authoredRealizationMode ?? inferredRealizationMode,
        realizationSource: authoredRealizationMode === null ? "inferred" : "authored",
        worldWillMode: worldWillCriterion !== null
            ? "criterion"
            : worldWill === null
                ? "absent"
                : "governing-principle",
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
