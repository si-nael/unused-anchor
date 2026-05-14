import {
    isEffectKind,
    isEffectRequirement,
    isEffectScope,
    type EffectRequirement,
    type EffectScope,
} from "../effects";
import { throwDiagnostic } from "./diagnostics";
import type {
    AxiomDeclaration,
    BubbleDocument,
    BubbleStatement,
    EmitDeclaration,
    EffectDeclaration,
    GeneratorDeclaration,
    ObserveDeclaration,
    QuoteDeclaration,
    RealizationDeclaration,
    ReflectDeclaration,
    SeedDeclaration,
    SpawnDeclaration,
    WillDeclaration,
} from "./ast";
import type { BubbleEmissionTarget, BubbleRealizationMode, ScalarValue } from "../ir";

const BUBBLE_HEADER_PATTERN = /^bubble\s+([A-Za-z_][\w-]*)\s*\{$/;
const AXIOM_PATTERN = /^axiom\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const REALIZATION_PATTERN = /^realization\s+(deterministic|nondeterministic)$/;
const WILL_PATTERN = /^will\s+(.+)$/;
const SEED_PATTERN = /^seed\s+(.+)$/;
const OBSERVE_PATTERN = /^observe\s+([A-Za-z_][\w-]*)$/;
const SPAWN_PATTERN = /^spawn\s+([A-Za-z_][\w-]*)(?:\s+when\s+(.+))?$/;
const QUOTE_PATTERN = /^quote\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const GENERATOR_PATTERN = /^generator\s+([A-Za-z_][\w-]*)(?:\s*\(([A-Za-z_][\w-]*)\))?\s+from\s+([A-Za-z_][\w-]*)$/;
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
        const statement: WillDeclaration = {
            kind: "will",
            line: line.lineNumber,
            expression: unquote(willMatch[1]),
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

    const spawnMatch = line.text.match(SPAWN_PATTERN);
    if (spawnMatch) {
        const statement: SpawnDeclaration = {
            kind: "spawn",
            line: line.lineNumber,
            familyName: spawnMatch[1],
            condition: spawnMatch[2] ? unquote(spawnMatch[2]) : null,
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
            argument: emitMatch[2] ? unquote(emitMatch[2]) : null,
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
