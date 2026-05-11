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
    EffectDeclaration,
    ObserveDeclaration,
    SeedDeclaration,
    WillDeclaration,
} from "./ast";
import type { ScalarValue } from "../ir";

const BUBBLE_HEADER_PATTERN = /^bubble\s+([A-Za-z_][\w-]*)\s*\{$/;
const AXIOM_PATTERN = /^axiom\s+([A-Za-z_][\w-]*)\s*=\s*(.+)$/;
const WILL_PATTERN = /^will\s+(.+)$/;
const SEED_PATTERN = /^seed\s+(.+)$/;
const OBSERVE_PATTERN = /^observe\s+([A-Za-z_][\w-]*)$/;
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
