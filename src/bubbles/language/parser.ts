import {
    isEffectKind,
    isEffectRequirement,
    isEffectScope,
    type EffectRequirement,
    type EffectScope,
} from "../effects";
import { throwDiagnostic } from "./diagnostics";
import { formatBubbleExpression, parseBubbleExpression } from "./expressions";
import { parseBubbleGrammarArtifact } from "./grammars";
import type {
    ActivateGrammarDeclaration,
    AnchorDeclaration,
    AxiomDeclaration,
    BubbleDocument,
    BubbleStatement,
    EmitDeclaration,
    EffectDeclaration,
    GrammarDeclaration,
    GeneratorDeclaration,
    ObserveDeclaration,
    QuoteDeclaration,
    RealizationDeclaration,
    ReflectDeclaration,
    SeedDeclaration,
    SpawnDeclaration,
    StateDeclaration,
    TransformDeclaration,
    UnresolvedSemanticDeclaration,
    WillDeclaration,
} from "./ast";
import type { BubbleEmissionTarget, BubbleRealizationMode, BubbleUnresolvedSemanticKind, ScalarValue } from "../ir";

const BUBBLE_HEADER_PATTERN = /^bubble\s+([A-Za-z_][\w-]*)\s*\{$/;
const AXIOM_PATTERN = /^axiom\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const REALIZATION_PATTERN = /^realization\s+(deterministic|nondeterministic)$/;
const WILL_PATTERN = /^will\s+(.+)$/;
const SEED_PATTERN = /^seed\s+(.+)$/;
const OBSERVE_PATTERN = /^observe\s+([A-Za-z_][\w-]*)$/;
const ANCHOR_PATTERN = /^anchor\s+identity\s*=\s*(.+)$/;
const STATE_PATTERN = /^state\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const TRANSFORM_PATTERN = /^transform\s+([A-Za-z_][\w-]*)\s+(reversible|irreversible)\s+state\s+([A-Za-z_][\w-]*)\s+from\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s]+)\s+to\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s]+)(?:\s+inverse\s+([A-Za-z_][\w-]*))?(?:\s+via\s+([A-Za-z_][\w-]*))?$/;
const UNKNOWN_VALUE_PATTERN = /^unknown\s+value\s+([A-Za-z_][\w-]*)(?:\s*=\s*(.+))?$/;
const UNKNOWN_ENTITY_PATTERN = /^unknown\s+entity\s+([A-Za-z_][\w-]*)(?:\s*=\s*(.+))?$/;
const CONSTRAINT_PATTERN = /^constraint\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const PARTIAL_LAW_PATTERN = /^partial\s+law\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const HIDDEN_REGION_PATTERN = /^hidden\s+region\s+([A-Za-z_][\w-]*)(?:\s*=\s*(.+))?$/;
const UNOBSERVABLE_RELATION_PATTERN = /^unobservable\s+relation\s+([A-Za-z_][\w-]*)(?:\s*=\s*(.+))?$/;
const LATENT_BUBBLE_PATTERN = /^latent\s+bubble\s+([A-Za-z_][\w-]*)(?:\s*=\s*(.+))?$/;
const SPAWN_PATTERN = /^spawn\s+([A-Za-z_][\w-]*)(?:\s+when\s+(.+))?$/;
const QUOTE_PATTERN = /^quote\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const GENERATOR_PATTERN = /^generator\s+([A-Za-z_][\w-]*)(?:\s*\(([A-Za-z_][\w-]*)\))?\s+from\s+([A-Za-z_][\w-]*)$/;
const GRAMMAR_PATTERN = /^grammar\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const ACTIVATE_GRAMMAR_PATTERN = /^activate\s+grammar\s+([A-Za-z_][\w-]*)(?:\s+as\s+([A-Za-z_][\w.-]*))?$/;
const REFLECT_PATTERN = /^reflect\s+(self\.[A-Za-z_][\w.]*)$/;
const EMIT_PATTERN = /^emit\s+([A-Za-z_][\w-]*)(?:\((.+)\))?(?:\s+as\s+(descendant|artifact))?$/;
const EFFECT_PATTERN = /^effect\s+([A-Za-z_][\w-]*)(?:\s+(required|optional))?(?:\s+scope\s+([A-Za-z_][\w-]*))?$/;

export function parseBubbleSource(source: string, sourcePath: string | null = null): BubbleDocument {
    const rawLines = source.split(/\r?\n/);
    const lines = rawLines.map((line, index) => ({
        lineNumber: index + 1,
        text: stripComment(line).trim(),
    }));

    const meaningfulLines = lines.filter((line) => line.text.length > 0);
    if (meaningfulLines.length === 0) {
        throwDiagnostic({
            code: "BBL001",
            severity: "error",
            message: "Bubbles source is empty.",
            sourcePath,
        });
    }

    const header = meaningfulLines[0];
    const headerMatch = header.text.match(BUBBLE_HEADER_PATTERN);
    if (!headerMatch) {
        throwDiagnostic({
            code: "BBL002",
            severity: "error",
            message: `Expected 'bubble <Name> {' on line ${header.lineNumber}.`,
            sourcePath,
            line: header.lineNumber,
        });
    }

    const closing = meaningfulLines.at(-1);
    if (!closing || closing.text !== "}") {
        throwDiagnostic({
            code: "BBL003",
            severity: "error",
            message: "Bubbles source must end with a closing '}' line.",
            sourcePath,
        });
    }

    const trailingLines = meaningfulLines.slice(meaningfulLines.indexOf(closing) + 1);
    if (trailingLines.length > 0) {
        throwDiagnostic({
            code: "BBL004",
            severity: "error",
            message: `Unexpected content after closing brace on line ${trailingLines[0].lineNumber}.`,
            sourcePath,
            line: trailingLines[0].lineNumber,
        });
    }

    const bodyLines = meaningfulLines.slice(1, -1);
    const declarations = bodyLines.map((line) => parseStatement(line, sourcePath));

    return {
        sourcePath,
        bubble: {
            kind: "bubble",
            line: header.lineNumber,
            name: headerMatch[1],
            declarations,
        },
    };
}

function parseStatement(line: { lineNumber: number; text: string }, sourcePath: string | null): BubbleStatement {
    const axiomMatch = line.text.match(AXIOM_PATTERN);
    if (axiomMatch) {
        const statement: AxiomDeclaration = {
            kind: "axiom",
            line: line.lineNumber,
            name: axiomMatch[1],
            value: parseScalar(axiomMatch[2]),
        };
        return statement;
    }

    const realizationMatch = line.text.match(REALIZATION_PATTERN);
    if (realizationMatch) {
        const statement: RealizationDeclaration = {
            kind: "realization",
            line: line.lineNumber,
            mode: realizationMatch[1] as BubbleRealizationMode,
        };
        return statement;
    }

    const willMatch = line.text.match(WILL_PATTERN);
    if (willMatch) {
        const expression = parseBubbleExpression(willMatch[1], {
            context: "world will",
            lineNumber: line.lineNumber,
            sourcePath,
            allowLegacyText: true,
        });
        const statement: WillDeclaration = {
            kind: "will",
            line: line.lineNumber,
            expression,
            description: expression.kind === "text" ? expression.value : formatBubbleExpression(expression),
        };
        return statement;
    }

    const seedMatch = line.text.match(SEED_PATTERN);
    if (seedMatch) {
        const statement: SeedDeclaration = {
            kind: "seed",
            line: line.lineNumber,
            value: unquote(seedMatch[1]),
        };
        return statement;
    }

    const observeMatch = line.text.match(OBSERVE_PATTERN);
    if (observeMatch) {
        const statement: ObserveDeclaration = {
            kind: "observe",
            line: line.lineNumber,
            mode: observeMatch[1],
        };
        return statement;
    }

    const anchorMatch = line.text.match(ANCHOR_PATTERN);
    if (anchorMatch) {
        const expression = parseBubbleExpression(anchorMatch[1], {
            context: "anchor identity criterion",
            lineNumber: line.lineNumber,
            sourcePath,
            allowLegacyText: true,
        });
        const statement: AnchorDeclaration = {
            kind: "anchor",
            line: line.lineNumber,
            expression,
            description: expression.kind === "text" ? expression.value : formatBubbleExpression(expression),
        };
        return statement;
    }

    const stateMatch = line.text.match(STATE_PATTERN);
    if (stateMatch) {
        const statement: StateDeclaration = {
            kind: "state",
            line: line.lineNumber,
            name: stateMatch[1],
            initialValue: parseScalar(stateMatch[2]),
        };
        return statement;
    }

    const transformMatch = line.text.match(TRANSFORM_PATTERN);
    if (transformMatch) {
        const rawEffectKind = transformMatch[7] ?? null;
        if (rawEffectKind !== null && !isEffectKind(rawEffectKind)) {
            throwDiagnostic({
                code: "BBL011",
                severity: "error",
                message: `Unknown transform effect '${rawEffectKind}' on line ${line.lineNumber}.`,
                sourcePath,
                line: line.lineNumber,
            });
        }

        const statement: TransformDeclaration = {
            kind: "transform",
            line: line.lineNumber,
            name: transformMatch[1],
            reversibility: transformMatch[2] as TransformDeclaration["reversibility"],
            stateName: transformMatch[3],
            fromValue: parseScalar(transformMatch[4]),
            toValue: parseScalar(transformMatch[5]),
            inverseName: transformMatch[6] ?? null,
            effectKind: rawEffectKind,
        };
        return statement;
    }

    const unresolvedSemantic = parseUnresolvedSemanticStatement(line, sourcePath);
    if (unresolvedSemantic) {
        return unresolvedSemantic;
    }

    const spawnMatch = line.text.match(SPAWN_PATTERN);
    if (spawnMatch) {
        const statement: SpawnDeclaration = {
            kind: "spawn",
            line: line.lineNumber,
            familyName: spawnMatch[1],
            condition: spawnMatch[2]
                ? parseBubbleExpression(spawnMatch[2], {
                    context: "spawn condition",
                    lineNumber: line.lineNumber,
                    sourcePath,
                    allowLegacyText: true,
                })
                : null,
        };
        return statement;
    }

    const quoteMatch = line.text.match(QUOTE_PATTERN);
    if (quoteMatch) {
        const statement: QuoteDeclaration = {
            kind: "quote",
            line: line.lineNumber,
            name: quoteMatch[1],
            artifactSource: unquote(quoteMatch[2]),
        };
        return statement;
    }

    const generatorMatch = line.text.match(GENERATOR_PATTERN);
    if (generatorMatch) {
        const statement: GeneratorDeclaration = {
            kind: "generator",
            line: line.lineNumber,
            name: generatorMatch[1],
            parameterName: generatorMatch[2] ?? null,
            sourceQuoteName: generatorMatch[3],
        };
        return statement;
    }

    const grammarMatch = line.text.match(GRAMMAR_PATTERN);
    if (grammarMatch) {
        const statement: GrammarDeclaration = {
            kind: "grammar",
            line: line.lineNumber,
            name: grammarMatch[1],
            artifact: parseBubbleGrammarArtifact(unquote(grammarMatch[2]), {
                lineNumber: line.lineNumber,
                sourcePath,
            }),
        };
        return statement;
    }

    const activateGrammarMatch = line.text.match(ACTIVATE_GRAMMAR_PATTERN);
    if (activateGrammarMatch) {
        const statement: ActivateGrammarDeclaration = {
            kind: "activate-grammar",
            line: line.lineNumber,
            grammarName: activateGrammarMatch[1],
            profileName: activateGrammarMatch[2] ?? null,
        };
        return statement;
    }

    const reflectMatch = line.text.match(REFLECT_PATTERN);
    if (reflectMatch) {
        const statement: ReflectDeclaration = {
            kind: "reflect",
            line: line.lineNumber,
            path: reflectMatch[1],
        };
        return statement;
    }

    const emitMatch = line.text.match(EMIT_PATTERN);
    if (emitMatch) {
        const statement: EmitDeclaration = {
            kind: "emit",
            line: line.lineNumber,
            sourceName: emitMatch[1],
            argument: emitMatch[2]
                ? parseBubbleExpression(emitMatch[2], {
                    context: "emit argument",
                    lineNumber: line.lineNumber,
                    sourcePath,
                })
                : null,
            target: (emitMatch[3] as BubbleEmissionTarget | undefined) ?? null,
        };
        return statement;
    }

    const effectMatch = line.text.match(EFFECT_PATTERN);
    if (effectMatch) {
        const effectKind = effectMatch[1];
        if (!isEffectKind(effectKind)) {
            throwDiagnostic({
                code: "BBL005",
                severity: "error",
                message: `Unknown effect kind '${effectKind}' on line ${line.lineNumber}.`,
                sourcePath,
                line: line.lineNumber,
            });
        }

        const requirement = parseRequirement(effectMatch[2], line.lineNumber, sourcePath);
        const scope = parseScope(effectMatch[3], line.lineNumber, sourcePath);

        const statement: EffectDeclaration = {
            kind: "effect",
            line: line.lineNumber,
            effectKind,
            requirement,
            scope,
        };
        return statement;
    }

    throwDiagnostic({
        code: "BBL008",
        severity: "error",
        message: `Could not parse statement on line ${line.lineNumber}: '${line.text}'.`,
        sourcePath,
        line: line.lineNumber,
    });
}

function parseRequirement(rawRequirement: string | undefined, lineNumber: number, sourcePath: string | null): EffectRequirement {
    if (!rawRequirement) {
        return "optional";
    }

    if (!isEffectRequirement(rawRequirement)) {
        throwDiagnostic({
            code: "BBL006",
            severity: "error",
            message: `Unknown effect requirement '${rawRequirement}' on line ${lineNumber}.`,
            sourcePath,
            line: lineNumber,
        });
    }

    return rawRequirement;
}

function parseScope(rawScope: string | undefined, lineNumber: number, sourcePath: string | null): EffectScope {
    if (!rawScope) {
        return "local";
    }

    if (!isEffectScope(rawScope)) {
        throwDiagnostic({
            code: "BBL007",
            severity: "error",
            message: `Unknown effect scope '${rawScope}' on line ${lineNumber}.`,
            sourcePath,
            line: lineNumber,
        });
    }

    return rawScope;
}

function parseUnresolvedSemanticStatement(
    line: { lineNumber: number; text: string },
    sourcePath: string | null,
): UnresolvedSemanticDeclaration | null {
    const unknownValueMatch = line.text.match(UNKNOWN_VALUE_PATTERN);
    if (unknownValueMatch) {
        return createUnresolvedSemanticDeclaration(line.lineNumber, sourcePath, "unknown-value", unknownValueMatch[1], unknownValueMatch[2]);
    }

    const unknownEntityMatch = line.text.match(UNKNOWN_ENTITY_PATTERN);
    if (unknownEntityMatch) {
        return createUnresolvedSemanticDeclaration(line.lineNumber, sourcePath, "unknown-entity", unknownEntityMatch[1], unknownEntityMatch[2]);
    }

    const constraintMatch = line.text.match(CONSTRAINT_PATTERN);
    if (constraintMatch) {
        return createUnresolvedSemanticDeclaration(line.lineNumber, sourcePath, "constraint", constraintMatch[1], constraintMatch[2]);
    }

    const partialLawMatch = line.text.match(PARTIAL_LAW_PATTERN);
    if (partialLawMatch) {
        return createUnresolvedSemanticDeclaration(line.lineNumber, sourcePath, "partial-law", partialLawMatch[1], partialLawMatch[2]);
    }

    const hiddenRegionMatch = line.text.match(HIDDEN_REGION_PATTERN);
    if (hiddenRegionMatch) {
        return createUnresolvedSemanticDeclaration(line.lineNumber, sourcePath, "hidden-region", hiddenRegionMatch[1], hiddenRegionMatch[2]);
    }

    const unobservableRelationMatch = line.text.match(UNOBSERVABLE_RELATION_PATTERN);
    if (unobservableRelationMatch) {
        return createUnresolvedSemanticDeclaration(line.lineNumber, sourcePath, "unobservable-relation", unobservableRelationMatch[1], unobservableRelationMatch[2]);
    }

    const latentBubbleMatch = line.text.match(LATENT_BUBBLE_PATTERN);
    if (latentBubbleMatch) {
        return createUnresolvedSemanticDeclaration(line.lineNumber, sourcePath, "latent-bubble", latentBubbleMatch[1], latentBubbleMatch[2]);
    }

    return null;
}

function createUnresolvedSemanticDeclaration(
    line: number,
    sourcePath: string | null,
    semanticKind: BubbleUnresolvedSemanticKind,
    name: string,
    rawDescription: string | undefined,
): UnresolvedSemanticDeclaration {
    const expression = (semanticKind === "constraint" || semanticKind === "partial-law") && rawDescription
        ? parseBubbleExpression(rawDescription, {
            context: semanticKind === "constraint" ? `constraint ${name}` : `partial law ${name}`,
            lineNumber: line,
            sourcePath,
            allowLegacyText: true,
        })
        : null;

    return {
        kind: "unresolved-semantic",
        line,
        semanticKind,
        name,
        description: rawDescription
            ? expression && expression.kind !== "text"
                ? formatBubbleExpression(expression)
                : unquote(rawDescription)
            : defaultUnresolvedSemanticDescription(semanticKind, name),
        expression: expression && expression.kind !== "text" ? expression : null,
    };
}

function defaultUnresolvedSemanticDescription(kind: BubbleUnresolvedSemanticKind, name: string): string {
    switch (kind) {
        case "unknown-value":
            return `Unknown value ${name} remains unresolved.`;
        case "unknown-entity":
            return `Unknown entity ${name} remains unresolved.`;
        case "constraint":
            return `Constraint ${name} remains unresolved.`;
        case "partial-law":
            return `Partial law ${name} remains unresolved.`;
        case "hidden-region":
            return `Hidden region ${name} remains outside the current observation surface.`;
        case "unobservable-relation":
            return `Unobservable relation ${name} remains outside the current observation map.`;
        case "latent-bubble":
            return `Latent bubble ${name} is admitted but not yet materialized.`;
        default:
            return assertNever(kind);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled parser variant: ${String(value)}`);
}

function parseScalar(rawValue: string): ScalarValue {
    const value = rawValue.trim();
    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(value)) {
        return Number(value);
    }

    return unquote(value);
}

function unquote(value: string): string {
    const trimmed = value.trim();
    if (
        (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
}

function stripComment(line: string): string {
    let insideQuote = false;
    let activeQuote = "";

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if ((character === '"' || character === "'") && line[index - 1] !== "\\") {
            if (!insideQuote) {
                insideQuote = true;
                activeQuote = character;
            } else if (activeQuote === character) {
                insideQuote = false;
                activeQuote = "";
            }
        }

        if (character === "#" && !insideQuote) {
            return line.slice(0, index);
        }
    }

    return line;
}
