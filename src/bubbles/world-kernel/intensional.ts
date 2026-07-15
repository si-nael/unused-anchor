export type ExactValue =
    | { kind: "rational"; numerator: string; denominator: string }
    | { kind: "boolean"; value: boolean }
    | { kind: "symbol"; value: string };

export type IntensionalValueKind = ExactValue["kind"];

export type IntensionalAxis =
    | { name: string; kind: "natural" }
    | { name: string; kind: "integer" }
    | { name: string; kind: "finite"; size: string };

export interface IntensionalDomain {
    axes: IntensionalAxis[];
}

export type IntensionalUnaryOperator = "negate" | "not";

export type IntensionalBinaryOperator =
    | "add"
    | "subtract"
    | "multiply"
    | "divide"
    | "equal"
    | "not-equal"
    | "less-than"
    | "less-than-or-equal"
    | "greater-than"
    | "greater-than-or-equal"
    | "and"
    | "or";

export type IntensionalTerm =
    | { kind: "value"; value: ExactValue }
    | { kind: "index"; axis: string }
    | { kind: "parameter"; name: string }
    | { kind: "unary"; operator: IntensionalUnaryOperator; operand: IntensionalTerm }
    | {
        kind: "binary";
        operator: IntensionalBinaryOperator;
        left: IntensionalTerm;
        right: IntensionalTerm;
    }
    | {
        kind: "if";
        condition: IntensionalTerm;
        then: IntensionalTerm;
        otherwise: IntensionalTerm;
    }
    | {
        kind: "family-coordinate";
        familyId: string;
        at: Record<string, IntensionalTerm>;
        parameters: Record<string, IntensionalTerm>;
    };

export interface IntensionalFamilyDefinition {
    id: string;
    domain: IntensionalDomain;
    valueKind: IntensionalValueKind;
    parameters: Array<{ name: string; valueKind: IntensionalValueKind }>;
    body: IntensionalTerm;
    recursion?: {
        kind: "well-founded-natural-axis";
        measureAxis: string;
    };
}

export interface IntensionalSystem {
    mode: "bubble-intensional-system.v1";
    families: IntensionalFamilyDefinition[];
}

export interface IntensionalCoordinateQuery {
    familyId: string;
    at: Record<string, string>;
    parameters: Record<string, ExactValue>;
}

export interface IntensionalDiagnostic {
    code: string;
    severity: "error";
    path: string;
    message: string;
}

export interface IntensionalProofStep {
    id: string;
    familyId: string;
    coordinate: Record<string, string>;
    parameters: Record<string, ExactValue>;
    rule: "intensional-definition" | "guarded-recursion";
    status: "resolved" | "undetermined" | "contradicted";
    dependencies: string[];
    reason?: string;
}

export interface IntensionalEvaluationResult {
    mode: "bubble-intensional-evaluation.v1";
    status: "resolved" | "undetermined" | "contradicted";
    query: IntensionalCoordinateQuery;
    value?: ExactValue;
    reason?: string;
    diagnostics: IntensionalDiagnostic[];
    budget: {
        limit: number;
        consumed: number;
        remaining: number;
    };
    denotation: {
        cardinality: "finite" | "countably-infinite";
        materializedCoordinateCount: number;
        exhaustiveMaterializationClaim: false;
    };
    proof: IntensionalProofStep[];
}

interface RationalValue {
    kind: "rational";
    numerator: bigint;
    denominator: bigint;
}

type RuntimeValue =
    | RationalValue
    | { kind: "boolean"; value: boolean }
    | { kind: "symbol"; value: string };

type RuntimeOutcome =
    | { status: "resolved"; value: RuntimeValue; dependencies: string[] }
    | { status: "undetermined" | "contradicted"; reason: string; dependencies: string[] };

interface EvaluationEnvironment {
    coordinate: Record<string, bigint>;
    parameters: Record<string, RuntimeValue>;
}

interface EvaluationContext {
    budgetLimit: number;
    remainingBudget: number;
    families: Map<string, IntensionalFamilyDefinition>;
    memo: Map<string, RuntimeOutcome>;
    active: Set<string>;
    proof: IntensionalProofStep[];
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

function greatestCommonDivisor(left: bigint, right: bigint): bigint {
    let a = left < 0n ? -left : left;
    let b = right < 0n ? -right : right;
    while (b !== 0n) {
        const remainder = a % b;
        a = b;
        b = remainder;
    }
    return a === 0n ? 1n : a;
}

function rational(numerator: bigint, denominator = 1n): RationalValue {
    if (denominator === 0n) {
        throw new Error("rational denominator must not be zero");
    }
    const sign = denominator < 0n ? -1n : 1n;
    const divisor = greatestCommonDivisor(numerator, denominator);
    return {
        kind: "rational",
        numerator: (sign * numerator) / divisor,
        denominator: (sign * denominator) / divisor,
    };
}

function parseInteger(source: string): bigint | undefined {
    if (!/^-?(0|[1-9][0-9]*)$/.test(source)) {
        return undefined;
    }
    try {
        return BigInt(source);
    } catch {
        return undefined;
    }
}

function parseExactValue(value: ExactValue): RuntimeValue | undefined {
    if (value.kind === "boolean" || value.kind === "symbol") {
        return value;
    }
    const numerator = parseInteger(value.numerator);
    const denominator = parseInteger(value.denominator);
    if (numerator === undefined || denominator === undefined || denominator === 0n) {
        return undefined;
    }
    return rational(numerator, denominator);
}

function serializeValue(value: RuntimeValue): ExactValue {
    if (value.kind !== "rational") {
        return value;
    }
    return {
        kind: "rational",
        numerator: value.numerator.toString(),
        denominator: value.denominator.toString(),
    };
}

function sameValueKind(value: RuntimeValue, expected: IntensionalValueKind): boolean {
    return value.kind === expected;
}

function diagnostic(code: string, path: string, message: string): IntensionalDiagnostic {
    return { code, severity: "error", path, message };
}

function exactKeys(value: Record<string, unknown>, expected: string[]): boolean {
    const actual = Object.keys(value).sort();
    const sortedExpected = [...expected].sort();
    return actual.length === sortedExpected.length
        && actual.every((entry, index) => entry === sortedExpected[index]);
}

function walkTerms(term: IntensionalTerm, visit: (term: IntensionalTerm) => void): void {
    visit(term);
    if (term.kind === "unary") {
        walkTerms(term.operand, visit);
    } else if (term.kind === "binary") {
        walkTerms(term.left, visit);
        walkTerms(term.right, visit);
    } else if (term.kind === "if") {
        walkTerms(term.condition, visit);
        walkTerms(term.then, visit);
        walkTerms(term.otherwise, visit);
    } else if (term.kind === "family-coordinate") {
        Object.values(term.at).forEach((coordinate) => walkTerms(coordinate, visit));
        Object.values(term.parameters).forEach((parameter) => walkTerms(parameter, visit));
    }
}

function isPositiveIntegerLiteral(term: IntensionalTerm): boolean {
    if (term.kind !== "value" || term.value.kind !== "rational") {
        return false;
    }
    const value = parseExactValue(term.value);
    return value?.kind === "rational"
        && value.denominator === 1n
        && value.numerator > 0n;
}

function isStrictNaturalDescent(term: IntensionalTerm, measureAxis: string): boolean {
    return term.kind === "binary"
        && term.operator === "subtract"
        && term.left.kind === "index"
        && term.left.axis === measureAxis
        && isPositiveIntegerLiteral(term.right);
}

function findDependencyCycle(graph: Map<string, Set<string>>): string[] | undefined {
    const visited = new Set<string>();
    const active = new Set<string>();
    const path: string[] = [];

    const visit = (node: string): string[] | undefined => {
        if (active.has(node)) {
            const cycleStart = path.indexOf(node);
            return [...path.slice(cycleStart), node];
        }
        if (visited.has(node)) {
            return undefined;
        }
        visited.add(node);
        active.add(node);
        path.push(node);
        for (const dependency of graph.get(node) ?? []) {
            const cycle = visit(dependency);
            if (cycle) {
                return cycle;
            }
        }
        path.pop();
        active.delete(node);
        return undefined;
    };

    for (const node of graph.keys()) {
        const cycle = visit(node);
        if (cycle) {
            return cycle;
        }
    }
    return undefined;
}

export function validateIntensionalSystem(system: IntensionalSystem): IntensionalDiagnostic[] {
    const diagnostics: IntensionalDiagnostic[] = [];
    if (system.mode !== "bubble-intensional-system.v1") {
        diagnostics.push(diagnostic("BIK001", "mode", "unsupported intensional system mode"));
    }

    const families = new Map<string, IntensionalFamilyDefinition>();
    for (const [familyIndex, family] of system.families.entries()) {
        const basePath = `families[${familyIndex}]`;
        if (!IDENTIFIER.test(family.id)) {
            diagnostics.push(diagnostic("BIK002", `${basePath}.id`, "family id must be a stable identifier"));
        } else if (families.has(family.id)) {
            diagnostics.push(diagnostic("BIK003", `${basePath}.id`, `duplicate family id '${family.id}'`));
        } else {
            families.set(family.id, family);
        }
        if (family.domain.axes.length === 0) {
            diagnostics.push(diagnostic("BIK004", `${basePath}.domain.axes`, "an intensional family needs at least one index axis"));
        }
        const axisNames = new Set<string>();
        for (const [axisIndex, axis] of family.domain.axes.entries()) {
            const axisPath = `${basePath}.domain.axes[${axisIndex}]`;
            if (!IDENTIFIER.test(axis.name)) {
                diagnostics.push(diagnostic("BIK005", `${axisPath}.name`, "axis name must be a stable identifier"));
            } else if (axisNames.has(axis.name)) {
                diagnostics.push(diagnostic("BIK006", `${axisPath}.name`, `duplicate axis '${axis.name}'`));
            }
            axisNames.add(axis.name);
            if (axis.kind === "finite") {
                const size = parseInteger(axis.size);
                if (size === undefined || size <= 0n) {
                    diagnostics.push(diagnostic("BIK007", `${axisPath}.size`, "finite axis size must be a positive integer"));
                }
            }
        }
        const parameterNames = new Set<string>();
        for (const [parameterIndex, parameter] of family.parameters.entries()) {
            const parameterPath = `${basePath}.parameters[${parameterIndex}]`;
            if (!IDENTIFIER.test(parameter.name)) {
                diagnostics.push(diagnostic("BIK008", `${parameterPath}.name`, "parameter name must be a stable identifier"));
            } else if (parameterNames.has(parameter.name)) {
                diagnostics.push(diagnostic("BIK009", `${parameterPath}.name`, `duplicate parameter '${parameter.name}'`));
            }
            parameterNames.add(parameter.name);
        }
        if (family.recursion) {
            const measure = family.domain.axes.find((axis) => axis.name === family.recursion?.measureAxis);
            if (!measure || measure.kind !== "natural") {
                diagnostics.push(diagnostic(
                    "BIK010",
                    `${basePath}.recursion.measureAxis`,
                    "well-founded recursion must name a natural-number axis",
                ));
            }
        }
    }

    const graph = new Map<string, Set<string>>();
    for (const [familyIndex, family] of system.families.entries()) {
        const basePath = `families[${familyIndex}].body`;
        const axes = new Set(family.domain.axes.map((axis) => axis.name));
        const parameters = new Set(family.parameters.map((parameter) => parameter.name));
        const dependencies = new Set<string>();
        graph.set(family.id, dependencies);
        walkTerms(family.body, (term) => {
            if (term.kind === "value") {
                if (!parseExactValue(term.value)) {
                    diagnostics.push(diagnostic("BIK011", basePath, "value literal is not exact or has a zero denominator"));
                }
                return;
            }
            if (term.kind === "index" && !axes.has(term.axis)) {
                diagnostics.push(diagnostic("BIK012", basePath, `unknown index axis '${term.axis}' in family '${family.id}'`));
                return;
            }
            if (term.kind === "parameter" && !parameters.has(term.name)) {
                diagnostics.push(diagnostic("BIK013", basePath, `unknown parameter '${term.name}' in family '${family.id}'`));
                return;
            }
            if (term.kind !== "family-coordinate") {
                return;
            }
            const target = families.get(term.familyId);
            if (!target) {
                diagnostics.push(diagnostic("BIK014", basePath, `unknown referenced family '${term.familyId}'`));
                return;
            }
            if (!exactKeys(term.at, target.domain.axes.map((axis) => axis.name))) {
                diagnostics.push(diagnostic("BIK015", basePath, `coordinate axes for '${target.id}' do not match its domain`));
            }
            if (!exactKeys(term.parameters, target.parameters.map((parameter) => parameter.name))) {
                diagnostics.push(diagnostic("BIK016", basePath, `parameters for '${target.id}' do not match its declaration`));
            }
            if (target.id === family.id) {
                const measureAxis = family.recursion?.measureAxis;
                if (!measureAxis) {
                    diagnostics.push(diagnostic("BIK017", basePath, `self reference in '${family.id}' lacks a well-founded recursion declaration`));
                } else if (!isStrictNaturalDescent(term.at[measureAxis], measureAxis)) {
                    diagnostics.push(diagnostic(
                        "BIK018",
                        basePath,
                        `recursive reference in '${family.id}' must strictly decrease natural axis '${measureAxis}'`,
                    ));
                }
            } else {
                dependencies.add(target.id);
            }
        });
    }

    const cycle = findDependencyCycle(graph);
    if (cycle) {
        diagnostics.push(diagnostic(
            "BIK019",
            "families",
            `cross-family dependency cycle has no well-founded measure: ${cycle.join(" -> ")}`,
        ));
    }
    return diagnostics;
}

function coordinateCardinality(family: IntensionalFamilyDefinition | undefined): "finite" | "countably-infinite" {
    if (!family) {
        return "finite";
    }
    return family.domain.axes.some((axis) => axis.kind === "natural" || axis.kind === "integer")
        ? "countably-infinite"
        : "finite";
}

function validateCoordinate(
    family: IntensionalFamilyDefinition,
    coordinate: Record<string, string>,
): { parsed?: Record<string, bigint>; reason?: string } {
    if (!exactKeys(coordinate, family.domain.axes.map((axis) => axis.name))) {
        return { reason: `query coordinate axes do not match family '${family.id}'` };
    }
    const parsed: Record<string, bigint> = {};
    for (const axis of family.domain.axes) {
        const value = parseInteger(coordinate[axis.name]);
        if (value === undefined) {
            return { reason: `coordinate '${axis.name}' is not an exact integer` };
        }
        if (axis.kind === "natural" && value < 0n) {
            return { reason: `coordinate '${axis.name}' is outside the natural-number domain` };
        }
        if (axis.kind === "finite") {
            const size = parseInteger(axis.size) ?? 0n;
            if (value < 0n || value >= size) {
                return { reason: `coordinate '${axis.name}' is outside finite domain [0, ${axis.size})` };
            }
        }
        parsed[axis.name] = value;
    }
    return { parsed };
}

function validateParameters(
    family: IntensionalFamilyDefinition,
    supplied: Record<string, ExactValue>,
): { parsed?: Record<string, RuntimeValue>; reason?: string } {
    if (!exactKeys(supplied, family.parameters.map((parameter) => parameter.name))) {
        return { reason: `query parameters do not match family '${family.id}'` };
    }
    const parsed: Record<string, RuntimeValue> = {};
    for (const declaration of family.parameters) {
        const value = parseExactValue(supplied[declaration.name]);
        if (!value || !sameValueKind(value, declaration.valueKind)) {
            return { reason: `parameter '${declaration.name}' does not have kind '${declaration.valueKind}'` };
        }
        parsed[declaration.name] = value;
    }
    return { parsed };
}

function consumeBudget(context: EvaluationContext): RuntimeOutcome | undefined {
    if (context.remainingBudget <= 0) {
        return {
            status: "undetermined",
            reason: "evaluation budget exhausted before the demanded coordinate was resolved",
            dependencies: [],
        };
    }
    context.remainingBudget -= 1;
    return undefined;
}

function resolved(value: RuntimeValue, dependencies: string[] = []): RuntimeOutcome {
    return { status: "resolved", value, dependencies };
}

function failure(status: "undetermined" | "contradicted", reason: string, dependencies: string[] = []): RuntimeOutcome {
    return { status, reason, dependencies };
}

function combineDependencies(...groups: string[][]): string[] {
    return [...new Set(groups.flat())].sort();
}

function compareRational(left: RationalValue, right: RationalValue): bigint {
    return left.numerator * right.denominator - right.numerator * left.denominator;
}

function valuesEqual(left: RuntimeValue, right: RuntimeValue): boolean {
    if (left.kind !== right.kind) {
        return false;
    }
    if (left.kind === "rational" && right.kind === "rational") {
        return left.numerator === right.numerator && left.denominator === right.denominator;
    }
    if (left.kind === "boolean" && right.kind === "boolean") {
        return left.value === right.value;
    }
    return left.kind === "symbol" && right.kind === "symbol" && left.value === right.value;
}

function applyBinary(operator: IntensionalBinaryOperator, left: RuntimeValue, right: RuntimeValue): RuntimeOutcome {
    if (operator === "equal" || operator === "not-equal") {
        const equal = valuesEqual(left, right);
        return resolved({ kind: "boolean", value: operator === "equal" ? equal : !equal });
    }
    if (operator === "and" || operator === "or") {
        if (left.kind !== "boolean" || right.kind !== "boolean") {
            return failure("contradicted", `operator '${operator}' requires boolean operands`);
        }
        return resolved({
            kind: "boolean",
            value: operator === "and" ? left.value && right.value : left.value || right.value,
        });
    }
    if (left.kind !== "rational" || right.kind !== "rational") {
        return failure("contradicted", `operator '${operator}' requires exact rational operands`);
    }
    if (operator === "add") {
        return resolved(rational(
            left.numerator * right.denominator + right.numerator * left.denominator,
            left.denominator * right.denominator,
        ));
    }
    if (operator === "subtract") {
        return resolved(rational(
            left.numerator * right.denominator - right.numerator * left.denominator,
            left.denominator * right.denominator,
        ));
    }
    if (operator === "multiply") {
        return resolved(rational(left.numerator * right.numerator, left.denominator * right.denominator));
    }
    if (operator === "divide") {
        if (right.numerator === 0n) {
            return failure("contradicted", "division by zero contradicts exact arithmetic semantics");
        }
        return resolved(rational(left.numerator * right.denominator, left.denominator * right.numerator));
    }
    const comparison = compareRational(left, right);
    const value = operator === "less-than"
        ? comparison < 0n
        : operator === "less-than-or-equal"
            ? comparison <= 0n
            : operator === "greater-than"
                ? comparison > 0n
                : comparison >= 0n;
    return resolved({ kind: "boolean", value });
}

function serializeCoordinate(coordinate: Record<string, bigint>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(coordinate).sort(([left], [right]) => left.localeCompare(right))
            .map(([name, value]) => [name, value.toString()]),
    );
}

function serializeParameters(parameters: Record<string, RuntimeValue>): Record<string, ExactValue> {
    return Object.fromEntries(
        Object.entries(parameters).sort(([left], [right]) => left.localeCompare(right))
            .map(([name, value]) => [name, serializeValue(value)]),
    );
}

function coordinateKey(
    familyId: string,
    coordinate: Record<string, bigint>,
    parameters: Record<string, RuntimeValue>,
): string {
    const coordinatePart = Object.entries(coordinate).sort(([left], [right]) => left.localeCompare(right))
        .map(([name, value]) => `${name}=${value.toString()}`).join(",");
    const parameterPart = Object.entries(parameters).sort(([left], [right]) => left.localeCompare(right))
        .map(([name, value]) => `${name}=${JSON.stringify(serializeValue(value))}`).join(",");
    return `${familyId}[${coordinatePart}](${parameterPart})`;
}

function evaluateTerm(
    term: IntensionalTerm,
    environment: EvaluationEnvironment,
    context: EvaluationContext,
): RuntimeOutcome {
    const exhausted = consumeBudget(context);
    if (exhausted) {
        return exhausted;
    }
    if (term.kind === "value") {
        const value = parseExactValue(term.value);
        return value ? resolved(value) : failure("contradicted", "invalid exact value literal reached evaluation");
    }
    if (term.kind === "index") {
        const value = environment.coordinate[term.axis];
        return value === undefined
            ? failure("contradicted", `index axis '${term.axis}' is unavailable`)
            : resolved(rational(value));
    }
    if (term.kind === "parameter") {
        const value = environment.parameters[term.name];
        return value
            ? resolved(value)
            : failure("contradicted", `parameter '${term.name}' is unavailable`);
    }
    if (term.kind === "unary") {
        const operand = evaluateTerm(term.operand, environment, context);
        if (operand.status !== "resolved") {
            return operand;
        }
        if (term.operator === "negate") {
            return operand.value.kind === "rational"
                ? resolved(rational(-operand.value.numerator, operand.value.denominator), operand.dependencies)
                : failure("contradicted", "operator 'negate' requires an exact rational operand", operand.dependencies);
        }
        return operand.value.kind === "boolean"
            ? resolved({ kind: "boolean", value: !operand.value.value }, operand.dependencies)
            : failure("contradicted", "operator 'not' requires a boolean operand", operand.dependencies);
    }
    if (term.kind === "binary") {
        const left = evaluateTerm(term.left, environment, context);
        if (left.status !== "resolved") {
            return left;
        }
        const right = evaluateTerm(term.right, environment, context);
        if (right.status !== "resolved") {
            return { ...right, dependencies: combineDependencies(left.dependencies, right.dependencies) };
        }
        const applied = applyBinary(term.operator, left.value, right.value);
        return { ...applied, dependencies: combineDependencies(left.dependencies, right.dependencies, applied.dependencies) };
    }
    if (term.kind === "if") {
        const condition = evaluateTerm(term.condition, environment, context);
        if (condition.status !== "resolved") {
            return condition;
        }
        if (condition.value.kind !== "boolean") {
            return failure("contradicted", "if condition must resolve to boolean", condition.dependencies);
        }
        const branch = evaluateTerm(condition.value.value ? term.then : term.otherwise, environment, context);
        return { ...branch, dependencies: combineDependencies(condition.dependencies, branch.dependencies) };
    }

    const target = context.families.get(term.familyId);
    if (!target) {
        return failure("contradicted", `referenced family '${term.familyId}' is unavailable`);
    }
    const coordinate: Record<string, bigint> = {};
    const dependencyGroups: string[][] = [];
    for (const axis of target.domain.axes) {
        const coordinateOutcome = evaluateTerm(term.at[axis.name], environment, context);
        dependencyGroups.push(coordinateOutcome.dependencies);
        if (coordinateOutcome.status !== "resolved") {
            return { ...coordinateOutcome, dependencies: combineDependencies(...dependencyGroups) };
        }
        if (coordinateOutcome.value.kind !== "rational" || coordinateOutcome.value.denominator !== 1n) {
            return failure("contradicted", `coordinate '${axis.name}' must resolve to an exact integer`, combineDependencies(...dependencyGroups));
        }
        coordinate[axis.name] = coordinateOutcome.value.numerator;
    }
    const serializedCoordinate = serializeCoordinate(coordinate);
    const coordinateValidation = validateCoordinate(target, serializedCoordinate);
    if (!coordinateValidation.parsed) {
        return failure("contradicted", coordinateValidation.reason ?? "referenced coordinate is outside its domain", combineDependencies(...dependencyGroups));
    }
    const parameters: Record<string, RuntimeValue> = {};
    for (const declaration of target.parameters) {
        const parameterOutcome = evaluateTerm(term.parameters[declaration.name], environment, context);
        dependencyGroups.push(parameterOutcome.dependencies);
        if (parameterOutcome.status !== "resolved") {
            return { ...parameterOutcome, dependencies: combineDependencies(...dependencyGroups) };
        }
        if (!sameValueKind(parameterOutcome.value, declaration.valueKind)) {
            return failure("contradicted", `parameter '${declaration.name}' has the wrong value kind`, combineDependencies(...dependencyGroups));
        }
        parameters[declaration.name] = parameterOutcome.value;
    }
    const targetOutcome = evaluateFamily(target, coordinate, parameters, context);
    const targetKey = coordinateKey(target.id, coordinate, parameters);
    return {
        ...targetOutcome,
        dependencies: combineDependencies(...dependencyGroups, targetOutcome.dependencies, [targetKey]),
    };
}

function evaluateFamily(
    family: IntensionalFamilyDefinition,
    coordinate: Record<string, bigint>,
    parameters: Record<string, RuntimeValue>,
    context: EvaluationContext,
): RuntimeOutcome {
    const key = coordinateKey(family.id, coordinate, parameters);
    const memoized = context.memo.get(key);
    if (memoized) {
        return memoized;
    }
    if (context.active.has(key)) {
        return failure("contradicted", `non-well-founded demand cycle reached '${key}'`);
    }
    context.active.add(key);
    const outcome = evaluateTerm(family.body, { coordinate, parameters }, context);
    context.active.delete(key);

    const typedOutcome = outcome.status === "resolved" && !sameValueKind(outcome.value, family.valueKind)
        ? failure("contradicted", `family '${family.id}' resolved to '${outcome.value.kind}', expected '${family.valueKind}'`, outcome.dependencies)
        : outcome;
    context.memo.set(key, typedOutcome);
    context.proof.push({
        id: `coordinate-proof:${context.proof.length + 1}`,
        familyId: family.id,
        coordinate: serializeCoordinate(coordinate),
        parameters: serializeParameters(parameters),
        rule: family.recursion ? "guarded-recursion" : "intensional-definition",
        status: typedOutcome.status,
        dependencies: typedOutcome.dependencies,
        ...(typedOutcome.status === "resolved" ? {} : { reason: typedOutcome.reason }),
    });
    return typedOutcome;
}

export function evaluateIntensionalCoordinate(
    system: IntensionalSystem,
    query: IntensionalCoordinateQuery,
    options: { budget?: number } = {},
): IntensionalEvaluationResult {
    const budgetLimit = Number.isSafeInteger(options.budget) && (options.budget ?? 0) > 0
        ? options.budget as number
        : 10_000;
    const diagnostics = validateIntensionalSystem(system);
    const family = system.families.find((candidate) => candidate.id === query.familyId);
    const base = {
        mode: "bubble-intensional-evaluation.v1" as const,
        query,
        diagnostics,
        budget: {
            limit: budgetLimit,
            consumed: 0,
            remaining: budgetLimit,
        },
        denotation: {
            cardinality: coordinateCardinality(family),
            materializedCoordinateCount: 0,
            exhaustiveMaterializationClaim: false as const,
        },
        proof: [] as IntensionalProofStep[],
    };

    if (diagnostics.length > 0) {
        return {
            ...base,
            status: "contradicted",
            reason: "intensional system failed static validation",
        };
    }
    if (!family) {
        return {
            ...base,
            status: "contradicted",
            reason: `query names unknown family '${query.familyId}'`,
        };
    }
    const coordinate = validateCoordinate(family, query.at);
    if (!coordinate.parsed) {
        return { ...base, status: "contradicted", reason: coordinate.reason };
    }
    const parameters = validateParameters(family, query.parameters);
    if (!parameters.parsed) {
        return { ...base, status: "contradicted", reason: parameters.reason };
    }

    const context: EvaluationContext = {
        budgetLimit,
        remainingBudget: budgetLimit,
        families: new Map(system.families.map((definition) => [definition.id, definition])),
        memo: new Map(),
        active: new Set(),
        proof: [],
    };
    const outcome = evaluateFamily(family, coordinate.parsed, parameters.parsed, context);
    const consumed = context.budgetLimit - context.remainingBudget;
    return {
        ...base,
        status: outcome.status,
        ...(outcome.status === "resolved"
            ? { value: serializeValue(outcome.value) }
            : { reason: outcome.reason }),
        budget: {
            limit: budgetLimit,
            consumed,
            remaining: context.remainingBudget,
        },
        denotation: {
            cardinality: coordinateCardinality(family),
            materializedCoordinateCount: context.proof.length,
            exhaustiveMaterializationClaim: false,
        },
        proof: context.proof,
    };
}

export const exact = {
    integer(value: string | number | bigint): ExactValue {
        return { kind: "rational", numerator: value.toString(), denominator: "1" };
    },
    rational(numerator: string | number | bigint, denominator: string | number | bigint): ExactValue {
        return { kind: "rational", numerator: numerator.toString(), denominator: denominator.toString() };
    },
    boolean(value: boolean): ExactValue {
        return { kind: "boolean", value };
    },
    symbol(value: string): ExactValue {
        return { kind: "symbol", value };
    },
} as const;

export function normalizeExactValue(value: ExactValue): ExactValue | undefined {
    const parsed = parseExactValue(value);
    return parsed ? serializeValue(parsed) : undefined;
}

export function addExactRationals(left: ExactValue, right: ExactValue): ExactValue | undefined {
    const parsedLeft = parseExactValue(left);
    const parsedRight = parseExactValue(right);
    if (parsedLeft?.kind !== "rational" || parsedRight?.kind !== "rational") {
        return undefined;
    }
    return serializeValue(rational(
        parsedLeft.numerator * parsedRight.denominator + parsedRight.numerator * parsedLeft.denominator,
        parsedLeft.denominator * parsedRight.denominator,
    ));
}

export function subtractExactRationals(left: ExactValue, right: ExactValue): ExactValue | undefined {
    const parsedLeft = parseExactValue(left);
    const parsedRight = parseExactValue(right);
    if (parsedLeft?.kind !== "rational" || parsedRight?.kind !== "rational") {
        return undefined;
    }
    return serializeValue(rational(
        parsedLeft.numerator * parsedRight.denominator - parsedRight.numerator * parsedLeft.denominator,
        parsedLeft.denominator * parsedRight.denominator,
    ));
}

export function multiplyExactRationals(left: ExactValue, right: ExactValue): ExactValue | undefined {
    const parsedLeft = parseExactValue(left);
    const parsedRight = parseExactValue(right);
    if (parsedLeft?.kind !== "rational" || parsedRight?.kind !== "rational") {
        return undefined;
    }
    return serializeValue(rational(
        parsedLeft.numerator * parsedRight.numerator,
        parsedLeft.denominator * parsedRight.denominator,
    ));
}

export function negateExactRational(value: ExactValue): ExactValue | undefined {
    const parsed = parseExactValue(value);
    return parsed?.kind === "rational"
        ? serializeValue(rational(-parsed.numerator, parsed.denominator))
        : undefined;
}

export function compareExactRationals(left: ExactValue, right: ExactValue): -1 | 0 | 1 | undefined {
    const parsedLeft = parseExactValue(left);
    const parsedRight = parseExactValue(right);
    if (parsedLeft?.kind !== "rational" || parsedRight?.kind !== "rational") {
        return undefined;
    }
    const comparison = compareRational(parsedLeft, parsedRight);
    return comparison < 0n ? -1 : comparison > 0n ? 1 : 0;
}

export function exactValuesEqual(left: ExactValue, right: ExactValue): boolean {
    const parsedLeft = parseExactValue(left);
    const parsedRight = parseExactValue(right);
    return parsedLeft !== undefined && parsedRight !== undefined && valuesEqual(parsedLeft, parsedRight);
}

export const term = {
    value(value: ExactValue): IntensionalTerm {
        return { kind: "value", value };
    },
    index(axis: string): IntensionalTerm {
        return { kind: "index", axis };
    },
    parameter(name: string): IntensionalTerm {
        return { kind: "parameter", name };
    },
    unary(operator: IntensionalUnaryOperator, operand: IntensionalTerm): IntensionalTerm {
        return { kind: "unary", operator, operand };
    },
    binary(operator: IntensionalBinaryOperator, left: IntensionalTerm, right: IntensionalTerm): IntensionalTerm {
        return { kind: "binary", operator, left, right };
    },
    if(condition: IntensionalTerm, then: IntensionalTerm, otherwise: IntensionalTerm): IntensionalTerm {
        return { kind: "if", condition, then, otherwise };
    },
    coordinate(
        familyId: string,
        at: Record<string, IntensionalTerm>,
        parameters: Record<string, IntensionalTerm> = {},
    ): IntensionalTerm {
        return { kind: "family-coordinate", familyId, at, parameters };
    },
} as const;
