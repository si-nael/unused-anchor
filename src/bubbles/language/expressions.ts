import type {
    BubbleComparisonExpressionIR,
    BubbleExpressionComparisonOperator,
    BubbleExpressionIR,
    BubbleExpressionOperandIR,
    BubbleLiteralExpressionIR,
    BubbleLogicalExpressionIR,
    BubbleExpressionLogicalOperator,
    BubbleReferenceExpressionIR,
    ScalarValue,
} from "../ir";
import { throwDiagnostic } from "./diagnostics";

interface ParseBubbleExpressionOptions {
    context: string;
    lineNumber: number;
    sourcePath: string | null;
    allowLegacyText?: boolean;
}

type ConditionToken =
    | { kind: "identifier"; value: string }
    | { kind: "literal"; value: ScalarValue }
    | { kind: "comparison"; value: BubbleExpressionComparisonOperator }
    | { kind: "logical"; value: BubbleExpressionLogicalOperator }
    | { kind: "paren"; value: "(" | ")" };

export function parseBubbleExpression(rawExpression: string, options: ParseBubbleExpressionOptions): BubbleExpressionIR {
    const trimmed = rawExpression.trim();
    if (options.allowLegacyText && isQuoted(trimmed)) {
        return {
            kind: "text",
            value: unquote(trimmed),
        };
    }

    const tokens = tokenizeBubbleExpression(trimmed, options);
    if (tokens.length === 0) {
        throwExpressionParseError(options, `${capitalizeContext(options.context)} is empty.`);
    }

    let cursor = 0;

    function peek(): ConditionToken | undefined {
        return tokens[cursor];
    }

    function consume(): ConditionToken {
        const token = tokens[cursor];
        cursor += 1;
        return token;
    }

    function parseExpression(): BubbleExpressionIR {
        return parseOrExpression();
    }

    function parseOrExpression(): BubbleExpressionIR {
        let expression = parseAndExpression();
        while (peek()?.kind === "logical" && peek()?.value === "or") {
            consume();
            expression = {
                kind: "logical",
                operator: "or",
                left: expression,
                right: parseAndExpression(),
            } satisfies BubbleLogicalExpressionIR;
        }

        return expression;
    }

    function parseAndExpression(): BubbleExpressionIR {
        let expression = parseComparisonExpression();
        while (peek()?.kind === "logical" && peek()?.value === "and") {
            consume();
            expression = {
                kind: "logical",
                operator: "and",
                left: expression,
                right: parseComparisonExpression(),
            } satisfies BubbleLogicalExpressionIR;
        }

        return expression;
    }

    function parseComparisonExpression(): BubbleExpressionIR {
        if (peek()?.kind === "paren" && peek()?.value === "(") {
            consume();
            const nested = parseExpression();
            const closing = consume();
            if (closing.kind !== "paren" || closing.value !== ")") {
                throwExpressionParseError(options, "Expected ')' to close grouped expression.");
            }
            return parseComparisonSuffix(nested);
        }

        const operand = parseOperand();
        return parseComparisonSuffix(operand);
    }

    function parseComparisonSuffix(left: BubbleExpressionIR): BubbleExpressionIR {
        const next = peek();
        if (!next || next.kind !== "comparison") {
            return left;
        }

        if (!isBubbleScalarExpression(left)) {
            throwExpressionParseError(options, "Comparison operands must be literals or references.");
        }

        const operator = consume().value as BubbleExpressionComparisonOperator;
        const right = parseOperand();
        return {
            kind: "comparison",
            operator,
            left,
            right,
        } satisfies BubbleComparisonExpressionIR;
    }

    function parseOperand(): BubbleExpressionOperandIR {
        const token = consume();
        switch (token.kind) {
            case "identifier":
                return {
                    kind: "reference",
                    path: token.value,
                } satisfies BubbleReferenceExpressionIR;
            case "literal":
                return {
                    kind: "literal",
                    value: token.value,
                } satisfies BubbleLiteralExpressionIR;
            default:
                throwExpressionParseError(options, `Unexpected token '${token.value}' in ${options.context}.`);
        }
    }

    const expression = parseExpression();
    if (cursor !== tokens.length) {
        throwExpressionParseError(options, `Unexpected token '${tokens[cursor].value}' in ${options.context}.`);
    }

    return expression;
}

export function formatBubbleExpression(expression: BubbleExpressionIR): string {
    switch (expression.kind) {
        case "text":
            return expression.value;
        case "reference":
            return expression.path;
        case "literal":
            return typeof expression.value === "string" ? JSON.stringify(expression.value) : String(expression.value);
        case "comparison":
            return `${formatBubbleExpression(expression.left)} ${expression.operator} ${formatBubbleExpression(expression.right)}`;
        case "logical":
            return `${wrapBubbleExpression(expression.left)} ${expression.operator} ${wrapBubbleExpression(expression.right)}`;
        default:
            return assertNever(expression);
    }
}

export function isBubbleScalarExpression(expression: BubbleExpressionIR): expression is BubbleExpressionOperandIR {
    return expression.kind === "reference" || expression.kind === "literal";
}

function wrapBubbleExpression(expression: BubbleExpressionIR): string {
    return expression.kind === "logical"
        ? `(${formatBubbleExpression(expression)})`
        : formatBubbleExpression(expression);
}

function tokenizeBubbleExpression(rawExpression: string, options: ParseBubbleExpressionOptions): ConditionToken[] {
    const tokens: ConditionToken[] = [];
    let index = 0;

    while (index < rawExpression.length) {
        const character = rawExpression[index];

        if (/\s/.test(character)) {
            index += 1;
            continue;
        }

        const operator = rawExpression.slice(index).match(/^(>=|<=|!=|=|>|<)/)?.[1];
        if (operator) {
            tokens.push({
                kind: "comparison",
                value: operator as BubbleExpressionComparisonOperator,
            });
            index += operator.length;
            continue;
        }

        if (character === "(" || character === ")") {
            tokens.push({
                kind: "paren",
                value: character,
            });
            index += 1;
            continue;
        }

        if (character === '"' || character === "'") {
            const literal = readQuotedToken(rawExpression, index, options);
            tokens.push({
                kind: "literal",
                value: unquote(literal.value),
            });
            index = literal.nextIndex;
            continue;
        }

        const wordMatch = rawExpression.slice(index).match(/^-?\d+(?:\.\d+)?|^[A-Za-z_][A-Za-z0-9_.-]*/)?.[0];
        if (wordMatch) {
            if (wordMatch === "and" || wordMatch === "or") {
                tokens.push({
                    kind: "logical",
                    value: wordMatch,
                });
            } else if (wordMatch === "true" || wordMatch === "false") {
                tokens.push({
                    kind: "literal",
                    value: wordMatch === "true",
                });
            } else if (/^-?\d+(?:\.\d+)?$/.test(wordMatch)) {
                tokens.push({
                    kind: "literal",
                    value: Number(wordMatch),
                });
            } else {
                tokens.push({
                    kind: "identifier",
                    value: wordMatch,
                });
            }
            index += wordMatch.length;
            continue;
        }

        throwExpressionParseError(options, `Unexpected character '${character}' in ${options.context}.`);
    }

    return tokens;
}

function readQuotedToken(
    source: string,
    startIndex: number,
    options: ParseBubbleExpressionOptions,
): { value: string; nextIndex: number } {
    const quote = source[startIndex];
    let index = startIndex + 1;
    while (index < source.length) {
        if (source[index] === quote && source[index - 1] !== "\\") {
            return {
                value: source.slice(startIndex, index + 1),
                nextIndex: index + 1,
            };
        }
        index += 1;
    }

    throwExpressionParseError(options, `Unterminated quoted string in ${options.context}.`);
}

function throwExpressionParseError(options: ParseBubbleExpressionOptions, message: string): never {
    throwDiagnostic({
        code: "BBL010",
        severity: "error",
        message,
        sourcePath: options.sourcePath,
        line: options.lineNumber,
    });
}

function isQuoted(value: string): boolean {
    return (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))
    );
}

function unquote(value: string): string {
    const trimmed = value.trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"'))
        || (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
}

function capitalizeContext(value: string): string {
    return value.length === 0 ? value : `${value[0].toUpperCase()}${value.slice(1)}`;
}

function assertNever(value: never): never {
    throw new Error(`Unhandled bubble expression: ${JSON.stringify(value)}`);
}