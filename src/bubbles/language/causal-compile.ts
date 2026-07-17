import {
    exact,
    normalizeExactValue,
    validateExecutableCausalProgram,
    type CausalAnchorTransferDefinition,
    type CausalFieldEffect,
    type CausalFieldRole,
    type CausalInterventionKind,
    type CausalWorldLifecycleEffect,
    type ExactValue,
    type ExecutableAnchoredCausalProgram,
    type IntensionalBinaryOperator,
    type IntensionalFamilyDefinition,
} from "../world-kernel";
import { BubbleCompilerError, createDiagnostic, throwDiagnostic, type Diagnostic } from "./diagnostics";

export interface CompileCausalBubbleOptions {
    sourcePath?: string | null;
    strict?: boolean;
}

export interface CausalBubbleCompilationResult {
    program: ExecutableAnchoredCausalProgram;
    diagnostics: Diagnostic[];
}

interface SourceLine {
    number: number;
    text: string;
}

interface WorldDeclaration {
    id: string;
    existence: "active" | "latent";
    line: number;
}

interface FieldDeclaration {
    worldId: string;
    id: string;
    role: CausalFieldRole;
    initialValue: ExactValue;
    line: number;
}

interface SeaDeclaration {
    worldId: string;
    positiveFieldId: string;
    negativeFieldId: string;
    viabilityFieldId: string;
    positiveWeight: ExactValue;
    negativeWeight: ExactValue;
    line: number;
}

interface AnchorDeclaration {
    id: string;
    endpoints: Array<{ worldId: string; portId: string }>;
    permittedKinds: CausalInterventionKind[];
    line: number;
}

interface TransferDeclaration extends CausalAnchorTransferDefinition {
    line: number;
}

interface ObjectiveDeclaration {
    id: string;
    worldId: string;
    fieldId: string;
    direction: "maximize" | "minimize" | "stabilize";
    weight: ExactValue;
    targetValue?: ExactValue;
    line: number;
}

interface LawDeclaration {
    id: string;
    worldId: string;
    guardFieldId: string;
    guardOperator: IntensionalBinaryOperator;
    guardValue: ExactValue;
    reversibility: "reversible" | "irreversible";
    line: number;
}

interface LawEffectDeclaration {
    lawId: string;
    effect: CausalFieldEffect;
    line: number;
}

interface LawLifecycleDeclaration {
    lawId: string;
    effect: CausalWorldLifecycleEffect;
    line: number;
}

interface LawInverseDeclaration {
    lawId: string;
    effect: CausalFieldEffect;
    line: number;
}

interface LawCommitDeclaration {
    lawId: string;
    fieldIds: string[];
    line: number;
}

interface LawTransferDeclaration {
    lawId: string;
    transferId: string;
    line: number;
}

const IDENTIFIER = "[A-Za-z_][A-Za-z0-9_.-]*";
const EXACT_TOKEN = '(?:"(?:[^"\\\\]|\\\\.)*"|[^\\s]+)';
const HEADER = new RegExp(`^causal\\s+bubble\\s+(${IDENTIFIER})\\s*\\{$`);
const WORLD = new RegExp(`^world\\s+(${IDENTIFIER})\\s+(active|latent)$`);
const FIELD = new RegExp(`^field\\s+(${IDENTIFIER})\\.(${IDENTIFIER})\\s+role\\s+([a-z-]+)\\s*=\\s*(.+)$`);
const PROTECT = new RegExp(`^protect\\s+(${IDENTIFIER})\\.(${IDENTIFIER})$`);
const SEA = new RegExp(`^sea\\s+(${IDENTIFIER})\\s+positive\\s+(${IDENTIFIER})\\s+negative\\s+(${IDENTIFIER})\\s+viability\\s+(${IDENTIFIER})\\s+weights\\s+(${EXACT_TOKEN})\\s+(${EXACT_TOKEN})$`);
const ANCHOR = new RegExp(`^anchor\\s+(${IDENTIFIER})\\s+world\\s+(${IDENTIFIER})\\s+port\\s+(${IDENTIFIER})\\s+identity\\s+true\\s+permit\\s+(.+)$`);
const SOURCE_SPACE = "[ \\t]+";
const LINKED_ANCHOR = new RegExp("^anchor" + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE
    + "between" + SOURCE_SPACE + "(" + IDENTIFIER + ")[.](" + IDENTIFIER + ")" + SOURCE_SPACE
    + "and" + SOURCE_SPACE + "(" + IDENTIFIER + ")[.](" + IDENTIFIER + ")" + SOURCE_SPACE
    + "identity" + SOURCE_SPACE + "true" + SOURCE_SPACE + "permit" + SOURCE_SPACE + "(.+)$");
const TRANSFER = new RegExp("^transfer" + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE
    + "anchor" + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE
    + "from" + SOURCE_SPACE + "(" + IDENTIFIER + ")[.](" + IDENTIFIER + ")" + SOURCE_SPACE
    + "field" + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE
    + "to" + SOURCE_SPACE + "(" + IDENTIFIER + ")[.](" + IDENTIFIER + ")" + SOURCE_SPACE
    + "field" + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE
    + "negative-residue" + SOURCE_SPACE + "(" + EXACT_TOKEN + ")" + SOURCE_SPACE
    + "positive-placement" + SOURCE_SPACE + "(" + EXACT_TOKEN + ")$");
const WORLD_WILL = new RegExp(`^world-will\\s+(${IDENTIFIER})$`);
const OBJECTIVE = new RegExp(`^objective\\s+(${IDENTIFIER})\\s+world\\s+(${IDENTIFIER})\\s+field\\s+(${IDENTIFIER})\\s+direction\\s+(maximize|minimize|stabilize)\\s+weight\\s+(${EXACT_TOKEN})(?:\\s+target\\s+(${EXACT_TOKEN}))?$`);
const DECISION = /^decision\s+(deterministic|plural)(?:\s+conflicts\s+(underdetermined|maximal-commuting-branches))?$/;
const LAW = new RegExp(`^law\\s+(${IDENTIFIER})\\s+world\\s+(${IDENTIFIER})\\s+when\\s+(${IDENTIFIER})\\s*(=|!=|>=|<=|>|<)\\s*(${EXACT_TOKEN})\\s+(reversible|irreversible)$`);
const LAW_EFFECT = new RegExp(`^law-effect\\s+(${IDENTIFIER})\\s+(set|add|subtract)\\s+(${IDENTIFIER})\\s+(${EXACT_TOKEN})$`);
const LAW_INVERSE = new RegExp(`^law-inverse\\s+(${IDENTIFIER})\\s+(add|subtract)\\s+(${IDENTIFIER})\\s+(${EXACT_TOKEN})$`);
const LAW_LIFECYCLE = new RegExp(`^law-lifecycle\\s+(${IDENTIFIER})\\s+(?:spawn\\s+(${IDENTIFIER})|(retire-self))$`);
const LAW_COMMIT = new RegExp(`^law-commit\\s+(${IDENTIFIER})\\s+(.+)$`);
const LAW_TRANSFER = new RegExp("^law-transfer" + SOURCE_SPACE + "(" + IDENTIFIER + ")"
    + SOURCE_SPACE + "(" + IDENTIFIER + ")$");
const FIELD_ROLES = new Set<CausalFieldRole>([
    "world-state", "world-condition", "structural-state", "identity-state", "memory-state",
    "boundary-state", "positive-sea", "negative-sea", "viability",
]);
const INTERVENTION_KINDS = new Set<CausalInterventionKind>([
    "condition", "opportunity", "constraint", "signal", "resource-gradient", "boundary-pressure",
]);

export function compileCausalBubbleSource(
    source: string,
    options: CompileCausalBubbleOptions = {},
): CausalBubbleCompilationResult {
    const sourcePath = options.sourcePath ?? null;
    const lines = meaningfulLines(source);
    if (lines.length === 0) fail("CBL001", "Causal Bubble source is empty.", sourcePath, null);
    const header = lines[0]!;
    const headerMatch = header.text.match(HEADER);
    if (!headerMatch) {
        fail("CBL002", "Expected 'causal bubble <Name> {' as the first declaration.", sourcePath, header.number);
    }
    const closing = lines.at(-1)!;
    if (closing.text !== "}") fail("CBL003", "Causal Bubble source must end with '}'.", sourcePath, closing.number);

    const worlds: WorldDeclaration[] = [];
    const fields: FieldDeclaration[] = [];
    const protectedFields: Array<{ worldId: string; fieldId: string; line: number }> = [];
    const seas: SeaDeclaration[] = [];
    const anchors: AnchorDeclaration[] = [];
    const transfers: TransferDeclaration[] = [];
    const objectives: ObjectiveDeclaration[] = [];
    const laws: LawDeclaration[] = [];
    const lawEffects: LawEffectDeclaration[] = [];
    const lawInverses: LawInverseDeclaration[] = [];
    const lawLifecycles: LawLifecycleDeclaration[] = [];
    const lawCommits: LawCommitDeclaration[] = [];
    const lawTransfers: LawTransferDeclaration[] = [];
    let worldWillId: string | undefined;
    let decisionMode: "deterministic" | "plural" | undefined;
    let internalConflictMode: "underdetermined" | "maximal-commuting-branches" | undefined;

    for (const line of lines.slice(1, -1)) {
        let match = line.text.match(WORLD);
        if (match) {
            worlds.push({ id: match[1]!, existence: match[2] as WorldDeclaration["existence"], line: line.number });
            continue;
        }
        match = line.text.match(FIELD);
        if (match) {
            const role = match[3] as CausalFieldRole;
            if (!FIELD_ROLES.has(role)) fail("CBL004", `Unknown causal field role '${match[3]}'.`, sourcePath, line.number);
            fields.push({
                worldId: match[1]!,
                id: match[2]!,
                role,
                initialValue: parseExact(match[4]!, sourcePath, line.number),
                line: line.number,
            });
            continue;
        }
        match = line.text.match(PROTECT);
        if (match) {
            protectedFields.push({ worldId: match[1]!, fieldId: match[2]!, line: line.number });
            continue;
        }
        match = line.text.match(SEA);
        if (match) {
            seas.push({
                worldId: match[1]!,
                positiveFieldId: match[2]!,
                negativeFieldId: match[3]!,
                viabilityFieldId: match[4]!,
                positiveWeight: parseExact(match[5]!, sourcePath, line.number, true),
                negativeWeight: parseExact(match[6]!, sourcePath, line.number, true),
                line: line.number,
            });
            continue;
        }
        match = line.text.match(LINKED_ANCHOR);
        if (match) {
            const permittedKinds = commaList(match[6]!, sourcePath, line.number).map((kind) => {
                if (!INTERVENTION_KINDS.has(kind as CausalInterventionKind)) {
                    fail("CBL005", `Unknown anchor intervention kind '${kind}'.`, sourcePath, line.number);
                }
                return kind as CausalInterventionKind;
            });
            anchors.push({
                id: match[1]!,
                endpoints: [
                    { worldId: match[2]!, portId: match[3]! },
                    { worldId: match[4]!, portId: match[5]! },
                ],
                permittedKinds,
                line: line.number,
            });
            continue;
        }
        match = line.text.match(ANCHOR);
        if (match) {
            const permittedKinds = commaList(match[4]!, sourcePath, line.number).map((kind) => {
                if (!INTERVENTION_KINDS.has(kind as CausalInterventionKind)) {
                    fail("CBL005", `Unknown anchor intervention kind '${kind}'.`, sourcePath, line.number);
                }
                return kind as CausalInterventionKind;
            });
            anchors.push({
                id: match[1]!,
                endpoints: [{ worldId: match[2]!, portId: match[3]! }],
                permittedKinds,
                line: line.number,
            });
            continue;
        }
        match = line.text.match(TRANSFER);
        if (match) {
            transfers.push({
                id: match[1]!,
                anchorId: match[2]!,
                source: { worldId: match[3]!, portId: match[4]!, fieldId: match[5]! },
                target: { worldId: match[6]!, portId: match[7]!, fieldId: match[8]! },
                sourceNegativeSeaResidue: parseExact(match[9]!, sourcePath, line.number, true),
                targetPositiveSeaPlacement: parseExact(match[10]!, sourcePath, line.number, true),
                line: line.number,
            });
            continue;
        }
        match = line.text.match(WORLD_WILL);
        if (match) {
            if (worldWillId) fail("CBL006", "World Will is declared more than once.", sourcePath, line.number);
            worldWillId = match[1]!;
            continue;
        }
        match = line.text.match(OBJECTIVE);
        if (match) {
            objectives.push({
                id: match[1]!, worldId: match[2]!, fieldId: match[3]!,
                direction: match[4] as ObjectiveDeclaration["direction"],
                weight: parseExact(match[5]!, sourcePath, line.number, true),
                ...(match[6] ? { targetValue: parseExact(match[6], sourcePath, line.number, true) } : {}),
                line: line.number,
            });
            continue;
        }
        match = line.text.match(DECISION);
        if (match) {
            if (decisionMode) fail("CBL007", "Execution decision mode is declared more than once.", sourcePath, line.number);
            decisionMode = match[1] as "deterministic" | "plural";
            internalConflictMode = match[2] as typeof internalConflictMode;
            continue;
        }
        match = line.text.match(LAW);
        if (match) {
            laws.push({
                id: match[1]!, worldId: match[2]!, guardFieldId: match[3]!,
                guardOperator: comparisonOperator(match[4]!),
                guardValue: parseExact(match[5]!, sourcePath, line.number),
                reversibility: match[6] as LawDeclaration["reversibility"],
                line: line.number,
            });
            continue;
        }
        match = line.text.match(LAW_EFFECT);
        if (match) {
            lawEffects.push({
                lawId: match[1]!,
                effect: { fieldId: match[3]!, operation: match[2] as CausalFieldEffect["operation"], value: parseExact(match[4]!, sourcePath, line.number) },
                line: line.number,
            });
            continue;
        }
        match = line.text.match(LAW_INVERSE);
        if (match) {
            lawInverses.push({
                lawId: match[1]!,
                effect: { fieldId: match[3]!, operation: match[2] as CausalFieldEffect["operation"], value: parseExact(match[4]!, sourcePath, line.number, true) },
                line: line.number,
            });
            continue;
        }
        match = line.text.match(LAW_LIFECYCLE);
        if (match) {
            lawLifecycles.push({
                lawId: match[1]!,
                effect: match[3] === "retire-self"
                    ? { kind: "retire-self" }
                    : { kind: "spawn-world", targetWorldId: match[2]! },
                line: line.number,
            });
            continue;
        }
        match = line.text.match(LAW_COMMIT);
        if (match) {
            lawCommits.push({ lawId: match[1]!, fieldIds: commaList(match[2]!, sourcePath, line.number), line: line.number });
            continue;
        }
        match = line.text.match(LAW_TRANSFER);
        if (match) {
            lawTransfers.push({ lawId: match[1]!, transferId: match[2]!, line: line.number });
            continue;
        }
        fail("CBL008", `Could not parse causal declaration '${line.text}'.`, sourcePath, line.number);
    }

    if (!worldWillId) fail("CBL009", "Causal Bubble needs an explicit world-will declaration.", sourcePath, header.number);
    if (!decisionMode) fail("CBL010", "Causal Bubble needs an explicit decision mode.", sourcePath, header.number);
    if (worlds.length === 0) fail("CBL011", "Causal Bubble needs at least one declared world.", sourcePath, header.number);

    requireUnique(worlds, "world", sourcePath);
    requireUnique(fields, "field", sourcePath, (entry) => `${entry.worldId}.${entry.id}`);
    requireUnique(seas, "sea declaration", sourcePath, (entry) => entry.worldId);
    requireUnique(anchors, "anchor", sourcePath);
    requireUnique(transfers, "anchor transfer", sourcePath);
    requireUnique(objectives, "objective", sourcePath);
    requireUnique(laws, "law", sourcePath);

    const worldIds = new Set(worlds.map((entry) => entry.id));
    const fieldByKey = new Map(fields.map((entry) => [`${entry.worldId}.${entry.id}`, entry]));
    const lawById = new Map(laws.map((entry) => [entry.id, entry]));
    for (const world of worlds) {
        if (!seas.some((entry) => entry.worldId === world.id)) fail("CBL012", `World '${world.id}' needs one explicit sea declaration.`, sourcePath, world.line);
        if (!objectives.some((entry) => entry.worldId === world.id)) fail("CBL013", `World '${world.id}' needs at least one explicit World-Will objective.`, sourcePath, world.line);
    }
    for (const entry of fields) requireWorld(worldIds, entry.worldId, sourcePath, entry.line);
    for (const entry of protectedFields) requireField(fieldByKey, entry.worldId, entry.fieldId, sourcePath, entry.line);
    for (const entry of seas) {
        requireWorld(worldIds, entry.worldId, sourcePath, entry.line);
        requireField(fieldByKey, entry.worldId, entry.positiveFieldId, sourcePath, entry.line);
        requireField(fieldByKey, entry.worldId, entry.negativeFieldId, sourcePath, entry.line);
        requireField(fieldByKey, entry.worldId, entry.viabilityFieldId, sourcePath, entry.line);
    }
    for (const entry of anchors) {
        for (const endpoint of entry.endpoints) requireWorld(worldIds, endpoint.worldId, sourcePath, entry.line);
    }
    const anchorById = new Map(anchors.map((entry) => [entry.id, entry]));
    const transferById = new Map(transfers.map((entry) => [entry.id, entry]));
    for (const transfer of transfers) {
        if (!anchorById.has(transfer.anchorId)) {
            fail("CBL022", `Unknown transfer anchor '${transfer.anchorId}'.`, sourcePath, transfer.line);
        }
        requireField(fieldByKey, transfer.source.worldId, transfer.source.fieldId, sourcePath, transfer.line);
        requireField(fieldByKey, transfer.target.worldId, transfer.target.fieldId, sourcePath, transfer.line);
    }
    for (const entry of objectives) requireField(fieldByKey, entry.worldId, entry.fieldId, sourcePath, entry.line);
    for (const law of laws) requireField(fieldByKey, law.worldId, law.guardFieldId, sourcePath, law.line);
    for (const entry of [...lawEffects, ...lawInverses, ...lawLifecycles, ...lawCommits, ...lawTransfers]) {
        if (!lawById.has(entry.lawId)) fail("CBL014", `Unknown law '${entry.lawId}'.`, sourcePath, entry.line);
    }
    for (const entry of lawTransfers) {
        if (!transferById.has(entry.transferId)) {
            fail("CBL023", `Unknown anchor transfer '${entry.transferId}'.`, sourcePath, entry.line);
        }
    }
    for (const entry of lawEffects) {
        const law = lawById.get(entry.lawId)!;
        requireField(fieldByKey, law.worldId, entry.effect.fieldId, sourcePath, entry.line);
    }
    for (const entry of lawInverses) {
        const law = lawById.get(entry.lawId)!;
        requireField(fieldByKey, law.worldId, entry.effect.fieldId, sourcePath, entry.line);
    }
    for (const entry of lawLifecycles) {
        if (entry.effect.kind === "spawn-world") requireWorld(worldIds, entry.effect.targetWorldId, sourcePath, entry.line);
    }
    for (const entry of lawCommits) {
        const law = lawById.get(entry.lawId)!;
        for (const fieldId of entry.fieldIds) requireField(fieldByKey, law.worldId, fieldId, sourcePath, entry.line);
    }

    const identityFamilyId = "causal-language-anchor-identity-true";
    const families: IntensionalFamilyDefinition[] = anchors.length === 0 ? [] : [constantFamily(identityFamilyId, exact.boolean(true))];
    const fieldFamilyIds = new Map<string, string>();
    for (const field of fields) {
        const familyId = `initial-${field.worldId}-${field.id}`;
        fieldFamilyIds.set(`${field.worldId}.${field.id}`, familyId);
        families.push(constantFamily(familyId, field.initialValue));
    }
    const guardFamilyIds = new Map<string, string>();
    for (const law of laws) {
        const field = fieldByKey.get(`${law.worldId}.${law.guardFieldId}`)!;
        if (field.initialValue.kind !== law.guardValue.kind) {
            fail("CBL015", `Law '${law.id}' compares '${law.guardFieldId}' with a different exact value kind.`, sourcePath, law.line);
        }
        if (law.guardValue.kind !== "rational" && !["equal", "not-equal"].includes(law.guardOperator)) {
            fail("CBL021", `Law '${law.id}' can only order exact rational values; boolean and symbol guards support equality or inequality.`, sourcePath, law.line);
        }
        const familyId = `guard-${law.id}`;
        guardFamilyIds.set(law.id, familyId);
        families.push(predicateFamily(familyId, law.guardOperator, law.guardValue));
    }

    const program: ExecutableAnchoredCausalProgram = {
        mode: "bubble-anchored-causal-program.v2",
        world: {
            mode: "bubble-anchored-causal-world.v2",
            formal: { mode: "bubble-intensional-system.v1", families },
            worlds: worlds.map((world) => {
                const sea = seas.find((entry) => entry.worldId === world.id)!;
                return {
                    id: world.id,
                    ...(world.existence === "latent" ? { initialExistence: "latent" as const } : {}),
                    fields: fields.filter((field) => field.worldId === world.id).map((field) => ({
                        id: field.id,
                        familyId: fieldFamilyIds.get(`${field.worldId}.${field.id}`)!,
                        role: field.role,
                    })),
                    protectedFieldIds: protectedFields.filter((entry) => entry.worldId === world.id).map((entry) => entry.fieldId),
                    seaCoupling: {
                        positiveFieldId: sea.positiveFieldId,
                        negativeFieldId: sea.negativeFieldId,
                        viabilityFieldId: sea.viabilityFieldId,
                    },
                };
            }),
            anchors: anchors.map((anchor) => ({
                id: anchor.id,
                endpoints: anchor.endpoints.map((endpoint) => ({ kind: "world" as const, ...endpoint })),
                identityPredicateFamilyIds: [identityFamilyId],
                permittedInterventionKinds: anchor.permittedKinds,
            })),
            ...(transfers.length > 0 ? {
                anchorTransfers: transfers.map(({ line: _line, ...transfer }) => transfer),
            } : {}),
            worldWill: {
                id: worldWillId,
                objectives: objectives.map((objective) => ({
                    id: objective.id,
                    targetWorldId: objective.worldId,
                    fieldId: objective.fieldId,
                    direction: objective.direction,
                    weight: objective.weight,
                    ...(objective.targetValue ? { targetValue: objective.targetValue } : {}),
                })),
                hardConstraintFamilyIds: [],
                interventions: [],
            },
            internalLaws: laws.map((law) => ({
                id: law.id,
                worldId: law.worldId,
                guard: {
                    id: `predicate-${law.id}`,
                    query: { familyId: guardFamilyIds.get(law.id)!, at: { coordinate: "0" }, parameters: {} },
                    fieldParameters: [{ parameterName: "value", worldId: law.worldId, fieldId: law.guardFieldId }],
                },
                effects: lawEffects.filter((entry) => entry.lawId === law.id).map((entry) => entry.effect),
                ...(lawInverses.some((entry) => entry.lawId === law.id)
                    ? { inverseEffects: lawInverses.filter((entry) => entry.lawId === law.id).map((entry) => entry.effect) }
                    : {}),
                ...(lawLifecycles.some((entry) => entry.lawId === law.id)
                    ? { lifecycleEffects: lawLifecycles.filter((entry) => entry.lawId === law.id).map((entry) => entry.effect) }
                    : {}),
                ...(lawTransfers.some((entry) => entry.lawId === law.id)
                    ? { anchorTransferIds: lawTransfers.filter((entry) => entry.lawId === law.id).map((entry) => entry.transferId) }
                    : {}),
                application: "once-per-realization",
                reversibility: law.reversibility,
                ...(lawCommits.some((entry) => entry.lawId === law.id)
                    ? { commitAffectedFieldIds: lawCommits.filter((entry) => entry.lawId === law.id).flatMap((entry) => entry.fieldIds) }
                    : {}),
            })),
            emergenceCriteria: [],
            order: { kind: "causal-partial-order", universalClock: false },
        },
        fieldInitializers: fields.map((field) => ({
            worldId: field.worldId,
            fieldId: field.id,
            query: { familyId: fieldFamilyIds.get(`${field.worldId}.${field.id}`)!, at: { coordinate: "0" }, parameters: {} },
        })),
        seaLaws: seas.map((sea) => ({ worldId: sea.worldId, positiveWeight: sea.positiveWeight, negativeWeight: sea.negativeWeight })),
        execution: {
            decisionMode,
            ...(internalConflictMode ? { internalConflictMode } : {}),
            hardConstraints: [],
            anchorIdentity: anchors.map((anchor) => ({
                id: `identity-${anchor.id}`,
                anchorId: anchor.id,
                query: { familyId: identityFamilyId, at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [],
            })),
            interventionCosts: [],
        },
    };

    const diagnostics = validateExecutableCausalProgram(program).map((entry) => createDiagnostic({
        code: entry.code,
        severity: "error",
        sourcePath,
        message: `${entry.path}: ${entry.message}`,
    }));
    if (options.strict !== false && diagnostics.length > 0) throw new BubbleCompilerError(diagnostics);
    return { program, diagnostics };
}

function meaningfulLines(source: string): SourceLine[] {
    return source.split(/\r?\n/).map((text, index) => ({ number: index + 1, text: text.trim() }))
        .filter((line) => line.text.length > 0 && !line.text.startsWith("#"));
}

function parseExact(raw: string, sourcePath: string | null, line: number, rationalOnly = false): ExactValue {
    let value: ExactValue | undefined;
    if (/^-?\d+$/.test(raw)) value = exact.integer(raw);
    else if (/^-?\d+\/-?\d+$/.test(raw)) {
        const [numerator, denominator] = raw.split("/");
        value = exact.rational(numerator!, denominator!);
    } else if (!rationalOnly && (raw === "true" || raw === "false")) value = exact.boolean(raw === "true");
    else if (!rationalOnly && raw.startsWith('"') && raw.endsWith('"')) {
        try {
            const parsed = JSON.parse(raw) as unknown;
            if (typeof parsed === "string") value = exact.symbol(parsed);
        } catch {
            value = undefined;
        }
    }
    const normalized = value ? normalizeExactValue(value) : undefined;
    if (!normalized || (rationalOnly && normalized.kind !== "rational")) {
        fail("CBL016", `Invalid ${rationalOnly ? "exact rational" : "exact"} literal '${raw}'.`, sourcePath, line);
    }
    return normalized;
}

function comparisonOperator(operator: string): IntensionalBinaryOperator {
    return ({
        "=": "equal", "!=": "not-equal", ">": "greater-than", ">=": "greater-than-or-equal",
        "<": "less-than", "<=": "less-than-or-equal",
    } as const)[operator as "=" | "!=" | ">" | ">=" | "<" | "<="];
}

function constantFamily(id: string, value: ExactValue): IntensionalFamilyDefinition {
    return {
        id,
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind: value.kind,
        parameters: [],
        body: { kind: "value", value },
    };
}

function predicateFamily(id: string, operator: IntensionalBinaryOperator, value: ExactValue): IntensionalFamilyDefinition {
    return {
        id,
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind: "boolean",
        parameters: [{ name: "value", valueKind: value.kind }],
        body: {
            kind: "binary",
            operator,
            left: { kind: "parameter", name: "value" },
            right: { kind: "value", value },
        },
    };
}

function commaList(raw: string, sourcePath: string | null, line: number): string[] {
    const values = raw.split(",").map((entry) => entry.trim()).filter(Boolean);
    if (values.length === 0 || values.some((entry) => !new RegExp(`^${IDENTIFIER}$`).test(entry))) {
        fail("CBL017", `Expected a comma-separated identifier list, received '${raw}'.`, sourcePath, line);
    }
    return values;
}

function requireUnique<T extends { id?: string; line: number }>(
    entries: T[],
    label: string,
    sourcePath: string | null,
    key: (entry: T) => string = (entry) => entry.id!,
): void {
    const seen = new Map<string, number>();
    for (const entry of entries) {
        const id = key(entry);
        const previous = seen.get(id);
        if (previous !== undefined) fail("CBL018", `Duplicate ${label} '${id}' (first declared on line ${previous}).`, sourcePath, entry.line);
        seen.set(id, entry.line);
    }
}

function requireWorld(worldIds: Set<string>, worldId: string, sourcePath: string | null, line: number): void {
    if (!worldIds.has(worldId)) fail("CBL019", `Unknown world '${worldId}'.`, sourcePath, line);
}

function requireField(
    fields: Map<string, FieldDeclaration>,
    worldId: string,
    fieldId: string,
    sourcePath: string | null,
    line: number,
): void {
    if (!fields.has(`${worldId}.${fieldId}`)) fail("CBL020", `Unknown field '${worldId}.${fieldId}'.`, sourcePath, line);
}

function fail(code: string, message: string, sourcePath: string | null, line: number | null): never {
    throwDiagnostic({ code, severity: "error", message, sourcePath, line });
}
