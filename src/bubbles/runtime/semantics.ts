import type {
    BubbleEmissionTarget,
    BubbleExpressionIR,
    BubbleProgramIR,
    BubbleUnresolvedSemanticIR,
    ScalarValue,
} from "../ir";
import { formatBubbleExpression } from "../language";

export type BubbleExecutableCheckStatus = "satisfied" | "violated" | "undetermined";
export type BubbleSemanticEvaluationKind = "constraint" | "partial-law" | "world-will" | "anchor-criterion";

export interface BubbleExecutableCheckResult {
    status: BubbleExecutableCheckStatus;
    basis: string[];
    explanation: string;
}

export interface BubbleSemanticEvaluation extends BubbleExecutableCheckResult {
    evaluationId: string;
    subjectKind: BubbleSemanticEvaluationKind;
    subjectId: string;
    name: string;
    sourceLine: number | null;
    description: string;
    expression: string | null;
}

export interface BubbleSemanticEvaluationPlan {
    mode: "bubble-executable-semantics.v1";
    constraints: BubbleSemanticEvaluation[];
    partialLaws: BubbleSemanticEvaluation[];
    worldWillCriterion: BubbleSemanticEvaluation | null;
    anchorCriterion: BubbleSemanticEvaluation | null;
}

interface BubbleExecutableEmissionPlan {
    target: BubbleEmissionTarget | null;
}

interface BubbleExecutableGrammarActivationPlan {
    activationId: string;
}

type BubbleBooleanEvaluation =
    | { kind: "known"; value: boolean }
    | { kind: "unknown"; reason: string };

export function buildSemanticEvaluationPlan(
    program: BubbleProgramIR,
    emissionPlan: BubbleExecutableEmissionPlan[],
    grammarActivationPlan: BubbleExecutableGrammarActivationPlan[],
): BubbleSemanticEvaluationPlan {
    const environment = buildExecutableEnvironment(program, emissionPlan, grammarActivationPlan);

    return {
        mode: "bubble-executable-semantics.v1",
        constraints: evaluateUnresolvedSemanticKind(program, "constraint", environment),
        partialLaws: evaluateUnresolvedSemanticKind(program, "partial-law", environment),
        worldWillCriterion: evaluateWorldWillCriterionWithEnvironment(program, environment),
        anchorCriterion: evaluateAnchorCriterionWithEnvironment(program, environment),
    };
}

export function evaluateConstraintSemantics(
    program: BubbleProgramIR,
    emissionPlan: BubbleExecutableEmissionPlan[],
    grammarActivationPlan: BubbleExecutableGrammarActivationPlan[],
): BubbleSemanticEvaluation[] {
    return buildSemanticEvaluationPlan(program, emissionPlan, grammarActivationPlan).constraints;
}

export function evaluatePartialLawSemantics(
    program: BubbleProgramIR,
    emissionPlan: BubbleExecutableEmissionPlan[],
    grammarActivationPlan: BubbleExecutableGrammarActivationPlan[],
): BubbleSemanticEvaluation[] {
    return buildSemanticEvaluationPlan(program, emissionPlan, grammarActivationPlan).partialLaws;
}

export function evaluateAnchorCriterion(
    program: BubbleProgramIR,
    emissionPlan: BubbleExecutableEmissionPlan[],
    grammarActivationPlan: BubbleExecutableGrammarActivationPlan[],
): BubbleSemanticEvaluation | null {
    return buildSemanticEvaluationPlan(program, emissionPlan, grammarActivationPlan).anchorCriterion;
}

function evaluateWorldWillCriterionWithEnvironment(
    program: BubbleProgramIR,
    environment: Map<string, ScalarValue>,
): BubbleSemanticEvaluation | null {
    const criterion = program.bubble.worldWillCriterion;
    if (!criterion) {
        return null;
    }

    return {
        evaluationId: `semantic-evaluation:${criterion.id}`,
        subjectKind: "world-will",
        subjectId: criterion.id,
        name: "world will",
        sourceLine: criterion.sourceLine,
        description: criterion.description,
        expression: formatBubbleExpression(criterion.expression),
        ...evaluateNamedExpression(
            "World will criterion",
            criterion.description,
            criterion.expression,
            environment,
            {
                missingExpressionBasis: "legacy-world-will",
                satisfiedBasis: "world-will-satisfied",
                violatedBasis: "world-will-violated",
                unknownBasis: "world-will-reference-gap",
            },
        ),
    };
}

function evaluateAnchorCriterionWithEnvironment(
    program: BubbleProgramIR,
    environment: Map<string, ScalarValue>,
): BubbleSemanticEvaluation | null {
    const criterion = program.bubble.anchorCriterion;
    if (!criterion) {
        return null;
    }

    return {
        evaluationId: `semantic-evaluation:${criterion.id}`,
        subjectKind: "anchor-criterion",
        subjectId: criterion.id,
        name: "anchor identity",
        sourceLine: criterion.sourceLine,
        description: criterion.description,
        expression: formatBubbleExpression(criterion.expression),
        ...evaluateNamedExpression(
            "Anchor identity criterion",
            criterion.description,
            criterion.expression,
            environment,
            {
                missingExpressionBasis: "legacy-anchor-criterion",
                satisfiedBasis: "authored-anchor-criterion",
                violatedBasis: "anchor-criterion-failed",
                unknownBasis: "anchor-criterion-reference-gap",
            },
        ),
    };
}

function evaluateUnresolvedSemanticKind(
    program: BubbleProgramIR,
    kind: Extract<BubbleUnresolvedSemanticIR["kind"], "constraint" | "partial-law">,
    environment: Map<string, ScalarValue>,
): BubbleSemanticEvaluation[] {
    const basisKeys = kind === "constraint"
        ? {
            missingExpressionBasis: "legacy-text-constraint",
            satisfiedBasis: "constraint-satisfied",
            violatedBasis: "constraint-violated",
            unknownBasis: "constraint-reference-gap",
        }
        : {
            missingExpressionBasis: "legacy-text-partial-law",
            satisfiedBasis: "partial-law-satisfied",
            violatedBasis: "partial-law-violated",
            unknownBasis: "partial-law-reference-gap",
        };

    return (program.bubble.unresolvedSemantics ?? [])
        .filter((fragment): fragment is BubbleUnresolvedSemanticIR & { kind: typeof kind } => fragment.kind === kind)
        .map((fragment) => ({
            evaluationId: `semantic-evaluation:${fragment.id}`,
            subjectKind: kind,
            subjectId: fragment.id,
            name: resolveFragmentName(fragment),
            sourceLine: fragment.sourceLine,
            description: fragment.description,
            expression: fragment.expression ? formatBubbleExpression(fragment.expression) : null,
            ...evaluateNamedExpression(
                kind === "constraint"
                    ? `Constraint ${resolveFragmentName(fragment)}`
                    : `Partial law ${resolveFragmentName(fragment)}`,
                fragment.description,
                fragment.expression,
                environment,
                basisKeys,
            ),
        }));
}

function evaluateNamedExpression(
    label: string,
    description: string,
    expression: BubbleExpressionIR | undefined,
    environment: Map<string, ScalarValue>,
    basisKeys: {
        missingExpressionBasis: string;
        satisfiedBasis: string;
        violatedBasis: string;
        unknownBasis: string;
    },
): BubbleExecutableCheckResult {
    if (!expression || expression.kind === "text") {
        return {
            status: "undetermined",
            basis: ["executable-semantic-checker", basisKeys.missingExpressionBasis],
            explanation: `${label} remains undetermined because it is still authored as descriptive text: ${description}.`,
        };
    }

    const evaluation = evaluateBooleanExpression(expression, environment);
    if (evaluation.kind === "unknown") {
        return {
            status: "undetermined",
            basis: ["executable-semantic-checker", basisKeys.unknownBasis],
            explanation: `${label} remains undetermined because ${evaluation.reason}.`,
        };
    }

    return evaluation.value
        ? {
            status: "satisfied",
            basis: ["executable-semantic-checker", basisKeys.satisfiedBasis],
            explanation: `${label} is satisfied by the current executable semantic environment.`,
        }
        : {
            status: "violated",
            basis: ["executable-semantic-checker", basisKeys.violatedBasis],
            explanation: `${label} is violated by the current executable semantic environment.`,
        };
}

function evaluateBooleanExpression(
    expression: BubbleExpressionIR,
    environment: Map<string, ScalarValue>,
): BubbleBooleanEvaluation {
    switch (expression.kind) {
        case "text":
            return {
                kind: "unknown",
                reason: "it is still represented as legacy text",
            };
        case "literal":
            return typeof expression.value === "boolean"
                ? { kind: "known", value: expression.value }
                : {
                    kind: "unknown",
                    reason: `literal ${JSON.stringify(expression.value)} is not a boolean predicate`,
                };
        case "reference": {
            const value = environment.get(expression.path);
            if (value === undefined) {
                return {
                    kind: "unknown",
                    reason: `reference '${expression.path}' is not available in the current executable environment`,
                };
            }

            return typeof value === "boolean"
                ? { kind: "known", value }
                : {
                    kind: "unknown",
                    reason: `reference '${expression.path}' resolved to non-boolean value ${JSON.stringify(value)}`,
                };
        }
        case "comparison": {
            const left = resolveScalarOperand(expression.left, environment);
            if (left.kind === "unknown") {
                return left;
            }

            const right = resolveScalarOperand(expression.right, environment);
            if (right.kind === "unknown") {
                return right;
            }

            return compareScalarValues(left.value, right.value, expression.operator);
        }
        case "logical": {
            const left = evaluateBooleanExpression(expression.left, environment);
            const right = evaluateBooleanExpression(expression.right, environment);

            if (expression.operator === "and") {
                if (left.kind === "known" && !left.value) {
                    return left;
                }

                if (right.kind === "known" && !right.value) {
                    return right;
                }

                if (left.kind === "known" && right.kind === "known") {
                    return {
                        kind: "known",
                        value: left.value && right.value,
                    };
                }

                return {
                    kind: "unknown",
                    reason: left.kind === "unknown"
                        ? left.reason
                        : right.kind === "unknown"
                            ? right.reason
                            : "one side of the conjunction could not be resolved",
                };
            }

            if (left.kind === "known" && left.value) {
                return left;
            }

            if (right.kind === "known" && right.value) {
                return right;
            }

            if (left.kind === "known" && right.kind === "known") {
                return {
                    kind: "known",
                    value: left.value || right.value,
                };
            }

            return {
                kind: "unknown",
                reason: left.kind === "unknown"
                    ? left.reason
                    : right.kind === "unknown"
                        ? right.reason
                        : "one side of the disjunction could not be resolved",
            };
        }
        default:
            return assertNever(expression);
    }
}

function resolveScalarOperand(
    expression: BubbleExpressionIR,
    environment: Map<string, ScalarValue>,
):
    | { kind: "known"; value: ScalarValue }
    | { kind: "unknown"; reason: string } {
    switch (expression.kind) {
        case "literal":
            return {
                kind: "known",
                value: expression.value,
            };
        case "reference": {
            const value = environment.get(expression.path);
            if (value === undefined) {
                return {
                    kind: "unknown",
                    reason: `reference '${expression.path}' is not available in the current executable environment`,
                };
            }

            return {
                kind: "known",
                value,
            };
        }
        default:
            return {
                kind: "unknown",
                reason: "comparison operands must resolve to scalar values",
            };
    }
}

function compareScalarValues(
    left: ScalarValue,
    right: ScalarValue,
    operator: "=" | "!=" | ">" | ">=" | "<" | "<=",
): BubbleBooleanEvaluation {
    switch (operator) {
        case "=":
            return {
                kind: "known",
                value: left === right,
            };
        case "!=":
            return {
                kind: "known",
                value: left !== right,
            };
        case ">":
        case ">=":
        case "<":
        case "<=": {
            if (typeof left !== "number" || typeof right !== "number") {
                return {
                    kind: "unknown",
                    reason: `comparison '${operator}' requires numeric operands but received ${JSON.stringify(left)} and ${JSON.stringify(right)}`,
                };
            }

            return {
                kind: "known",
                value: operator === ">"
                    ? left > right
                    : operator === ">="
                        ? left >= right
                        : operator === "<"
                            ? left < right
                            : left <= right,
            };
        }
        default:
            return assertNever(operator);
    }
}

function buildExecutableEnvironment(
    program: BubbleProgramIR,
    emissionPlan: BubbleExecutableEmissionPlan[],
    grammarActivationPlan: BubbleExecutableGrammarActivationPlan[],
): Map<string, ScalarValue> {
    const environment = new Map<string, ScalarValue>();
    const { bubble } = program;
    const boundaryPressure = countBoundaryExposure(program);
    const descendantRelationCount = bubble.generation.relations.filter((relation) => relation.target === "descendant-bubble").length;
    const branchRelationCount = bubble.generation.relations.filter((relation) => relation.kind === "branch").length;
    const descendantEmissionCount = emissionPlan.filter((emission) => emission.target === "descendant").length;
    const artifactEmissionCount = emissionPlan.filter((emission) => emission.target === "artifact").length;
    const requiredEffectCount = bubble.effects.filter((effect) => effect.requirement === "required").length;

    environment.set("world.seeded", bubble.seed !== null);
    environment.set("world.hasWill", bubble.worldWill !== null);
    environment.set("world.hasExecutableWill", bubble.worldWillCriterion !== undefined);
    environment.set("world.realizationMode", bubble.generation.realizationMode);
    environment.set("world.profile", program.profile);
    environment.set("world.version", program.version);
    environment.set("history.commits", bubble.generation.lifecycle.commitsHistory);
    environment.set("history.durable", bubble.generation.lifecycle.commitsHistory);
    environment.set("boundary.pressure", boundaryPressure);
    environment.set("boundary.exposure", boundaryPressure);
    environment.set("lineage.descendantCount", descendantRelationCount + descendantEmissionCount);
    environment.set("lineage.branchCount", branchRelationCount);
    environment.set("effect.count", bubble.effects.length);
    environment.set("effect.requiredCount", requiredEffectCount);
    environment.set("obligation.count", bubble.obligations.length);
    environment.set("emission.count", emissionPlan.length);
    environment.set("emission.descendantCount", descendantEmissionCount);
    environment.set("emission.artifactCount", artifactEmissionCount);
    environment.set("grammar.activationCount", grammarActivationPlan.length);

    if (bubble.seed !== null) {
        environment.set("world.seed", bubble.seed);
    }

    if (bubble.worldWill !== null) {
        environment.set("world.will", bubble.worldWill);
    }

    if (bubble.generation.lifecycle.observationMode !== null) {
        environment.set("world.observationMode", bubble.generation.lifecycle.observationMode);
    }

    for (const [name, value] of Object.entries(bubble.axioms)) {
        environment.set(`axiom.${name}`, value);
        environment.set(`axioms.${name}`, value);
    }

    for (const effect of bubble.effects) {
        environment.set(`${effect.kind}.enabled`, true);
        environment.set(`${effect.kind}.required`, effect.requirement === "required");
    }

    return environment;
}

function countBoundaryExposure(program: BubbleProgramIR): number {
    return program.bubble.boundary.scopes.reduce(
        (total, scope) => total + scope.obligationEffectIds.length + scope.relationSourceEffectIds.length,
        0,
    );
}

function resolveFragmentName(fragment: BubbleUnresolvedSemanticIR): string {
    const segments = fragment.id.split(":");
    return segments[segments.length - 1] ?? fragment.id;
}

function assertNever(value: never): never {
    throw new Error(`Unhandled executable semantics variant: ${String(value)}`);
}