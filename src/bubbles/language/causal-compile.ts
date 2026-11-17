import {
    compareExactRationals,
    exact,
    exactValuesEqual,
    normalizeExactValue,
    validateExecutableCausalProgram,
    type CausalAnchorTransferDefinition,
    type CausalFieldEffect,
    type CausalFieldRole,
    type CausalInterventionKind,
    type CausalSeaEndpoint,
    type CausalSeaExchangeLaw,
    type CausalSeaMedium,
    type CausalSeaQuantity,
    type CausalWorldLifecycleEffect,
    type ExactValue,
    type ExecutableAnchoredCausalProgram,
    type IntensionalBinaryOperator,
    type IntensionalFamilyDefinition,
    type IntensionalTerm,
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

interface SeaMediumDeclaration {
    id: string;
    closure: CausalSeaMedium["closure"];
    line: number;
}

interface SeaRegionDeclaration {
    id: string;
    negative: ExactValue;
    positive: ExactValue;
    line: number;
}

interface SeaPlacementDeclaration {
    worldId: string;
    regionId: string;
    line: number;
}

interface SeaAdjacencyDeclaration {
    id: string;
    regionIds: [string, string];
    line: number;
}

interface SeaExchangeDeclaration {
    id: string;
    quantity: CausalSeaQuantity;
    amount: ExactValue;
    from: CausalSeaEndpoint;
    to: CausalSeaEndpoint;
    line: number;
}

type SeaExchangeGuardDeclaration =
    | {
        exchangeId: string;
        kind: "field";
        worldId: string;
        fieldId: string;
        operator: IntensionalBinaryOperator;
        value: ExactValue;
        line: number;
    }
    | {
        exchangeId: string;
        kind: "region";
        regionId: string;
        quantity: CausalSeaQuantity;
        operator: IntensionalBinaryOperator;
        value: ExactValue;
        line: number;
    };

interface SeaMediumSource {
    medium: SeaMediumDeclaration | undefined;
    regions: SeaRegionDeclaration[];
    placements: SeaPlacementDeclaration[];
    adjacency: SeaAdjacencyDeclaration[];
    exchanges: SeaExchangeDeclaration[];
    guards: SeaExchangeGuardDeclaration[];
}

interface SeaMediumContext {
    worlds: WorldDeclaration[];
    worldIds: Set<string>;
    fieldByKey: Map<string, FieldDeclaration>;
    seas: SeaDeclaration[];
    lawById: Map<string, LawDeclaration>;
    lawEffects: LawEffectDeclaration[];
    lawInverses: LawInverseDeclaration[];
    transfers: TransferDeclaration[];
    sourcePath: string | null;
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
const SOURCE_COMPARISON = "[ \\t]*(=|!=|>=|<=|>|<)[ \\t]*";
const SEA_MEDIUM = new RegExp("^sea-medium" + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE + "(closed|open)$");
const SEA_REGION = new RegExp("^sea-region" + SOURCE_SPACE + "(" + IDENTIFIER + ")"
    + SOURCE_SPACE + "negative" + SOURCE_SPACE + "(" + EXACT_TOKEN + ")"
    + SOURCE_SPACE + "positive" + SOURCE_SPACE + "(" + EXACT_TOKEN + ")$");
const SEA_PLACE = new RegExp("^place" + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE + "in" + SOURCE_SPACE + "(" + IDENTIFIER + ")$");
const SEA_ADJACENT = new RegExp("^adjacent" + SOURCE_SPACE + "(" + IDENTIFIER + ")"
    + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE + "(" + IDENTIFIER + ")$");
const SEA_ENDPOINT = "(region|world)" + SOURCE_SPACE + "(" + IDENTIFIER + ")";
const SEA_EXCHANGE = new RegExp("^exchange" + SOURCE_SPACE + "(" + IDENTIFIER + ")"
    + SOURCE_SPACE + "(negative|positive)" + SOURCE_SPACE + "(" + EXACT_TOKEN + ")"
    + SOURCE_SPACE + "from" + SOURCE_SPACE + SEA_ENDPOINT
    + SOURCE_SPACE + "to" + SOURCE_SPACE + SEA_ENDPOINT + "$");
const SEA_EXCHANGE_REGION_GUARD = new RegExp("^exchange-when" + SOURCE_SPACE + "(" + IDENTIFIER + ")"
    + SOURCE_SPACE + "region" + SOURCE_SPACE + "(" + IDENTIFIER + ")" + SOURCE_SPACE + "(negative|positive)"
    + SOURCE_COMPARISON + "(" + EXACT_TOKEN + ")$");
const SEA_EXCHANGE_FIELD_GUARD = new RegExp("^exchange-when" + SOURCE_SPACE + "(" + IDENTIFIER + ")"
    + SOURCE_SPACE + "(" + IDENTIFIER + ")[.](" + IDENTIFIER + ")"
    + SOURCE_COMPARISON + "(" + EXACT_TOKEN + ")$");
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
    const sea: SeaMediumSource = { medium: undefined, regions: [], placements: [], adjacency: [], exchanges: [], guards: [] };
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
        if (parseSeaMediumLine(line, sea, sourcePath)) continue;
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
    const seaMedium = lowerSeaMedium(sea, {
        worlds, worldIds, fieldByKey, seas, lawById, lawEffects, lawInverses, transfers, sourcePath,
    });
    if (seaMedium) families.push(...seaMedium.families);

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
            ...(seaMedium ? { seaMedium: seaMedium.medium } : {}),
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

function parseSeaMediumLine(line: SourceLine, sea: SeaMediumSource, sourcePath: string | null): boolean {
    let match = line.text.match(SEA_MEDIUM);
    if (match) {
        if (sea.medium) {
            fail("CBL024", `Sea medium is declared more than once (first declared on line ${sea.medium.line}).`, sourcePath, line.number);
        }
        sea.medium = { id: match[1]!, closure: match[2] as SeaMediumDeclaration["closure"], line: line.number };
        return true;
    }
    match = line.text.match(SEA_REGION);
    if (match) {
        sea.regions.push({
            id: match[1]!,
            negative: seaRegionQuantity(match[1]!, "negative", match[2]!, sourcePath, line.number),
            positive: seaRegionQuantity(match[1]!, "positive", match[3]!, sourcePath, line.number),
            line: line.number,
        });
        return true;
    }
    match = line.text.match(SEA_PLACE);
    if (match) {
        sea.placements.push({ worldId: match[1]!, regionId: match[2]!, line: line.number });
        return true;
    }
    match = line.text.match(SEA_ADJACENT);
    if (match) {
        sea.adjacency.push({ id: match[1]!, regionIds: [match[2]!, match[3]!], line: line.number });
        return true;
    }
    match = line.text.match(SEA_EXCHANGE);
    if (match) {
        const amount = parseExact(match[3]!, sourcePath, line.number, true);
        if (compareExactRationals(amount, exact.integer(0)) !== 1) {
            fail("CBL028", `Sea exchange '${match[1]}' must move a positive exact rational amount; received '${match[3]}'.`, sourcePath, line.number);
        }
        sea.exchanges.push({
            id: match[1]!,
            quantity: match[2] as CausalSeaQuantity,
            amount,
            from: seaEndpoint(match[4]!, match[5]!),
            to: seaEndpoint(match[6]!, match[7]!),
            line: line.number,
        });
        return true;
    }
    match = line.text.match(SEA_EXCHANGE_REGION_GUARD);
    if (match) {
        sea.guards.push({
            exchangeId: match[1]!,
            kind: "region",
            regionId: match[2]!,
            quantity: match[3] as CausalSeaQuantity,
            operator: comparisonOperator(match[4]!),
            value: parseExact(match[5]!, sourcePath, line.number, true),
            line: line.number,
        });
        return true;
    }
    match = line.text.match(SEA_EXCHANGE_FIELD_GUARD);
    if (match) {
        sea.guards.push({
            exchangeId: match[1]!,
            kind: "field",
            worldId: match[2]!,
            fieldId: match[3]!,
            operator: comparisonOperator(match[4]!),
            value: parseExact(match[5]!, sourcePath, line.number),
            line: line.number,
        });
        return true;
    }
    return false;
}

function seaRegionQuantity(
    regionId: string,
    quantity: CausalSeaQuantity,
    raw: string,
    sourcePath: string | null,
    line: number,
): ExactValue {
    const value = parseExact(raw, sourcePath, line, true);
    if ((compareExactRationals(value, exact.integer(0)) ?? -1) < 0) {
        fail("CBL027", `Sea region '${regionId}' needs a non-negative exact rational ${quantity} quantity; received '${raw}'.`, sourcePath, line);
    }
    return value;
}

function seaEndpoint(kind: string, id: string): CausalSeaEndpoint {
    return kind === "world" ? { kind: "world", worldId: id } : { kind: "region", regionId: id };
}

function describeSeaEndpoint(endpoint: CausalSeaEndpoint): string {
    return endpoint.kind === "world" ? `world '${endpoint.worldId}'` : `region '${endpoint.regionId}'`;
}

function adjacencyKey(left: string, right: string): string {
    return left < right ? `${left},${right}` : `${right},${left}`;
}

function lowerSeaMedium(
    sea: SeaMediumSource,
    context: SeaMediumContext,
): { medium: CausalSeaMedium; families: IntensionalFamilyDefinition[] } | undefined {
    const { sourcePath } = context;
    const medium = sea.medium;
    if (!medium) {
        const statementLines = [...sea.regions, ...sea.placements, ...sea.adjacency, ...sea.exchanges, ...sea.guards]
            .map((entry) => entry.line);
        if (statementLines.length > 0) {
            fail("CBL025", "Sea medium statements need one 'sea-medium <medium-id> closed|open' declaration.", sourcePath, Math.min(...statementLines));
        }
        return undefined;
    }

    requireUnique(sea.regions, "sea region", sourcePath);
    requireUnique(sea.placements, "world placement", sourcePath, (entry) => entry.worldId);
    requireUnique(sea.adjacency, "sea adjacency", sourcePath);
    requireUnique(sea.exchanges, "sea exchange", sourcePath);

    const regionIds = new Set(sea.regions.map((entry) => entry.id));
    for (const placement of sea.placements) {
        requireWorld(context.worldIds, placement.worldId, sourcePath, placement.line);
        requireRegion(regionIds, placement.regionId, sourcePath, placement.line);
    }
    const placementByWorld = new Map(sea.placements.map((entry) => [entry.worldId, entry.regionId]));
    for (const world of context.worlds) {
        if (!placementByWorld.has(world.id)) {
            fail("CBL029", `World '${world.id}' needs one explicit placement in a region of sea medium '${medium.id}'.`, sourcePath, world.line);
        }
    }
    for (const edge of sea.adjacency) {
        for (const regionId of edge.regionIds) requireRegion(regionIds, regionId, sourcePath, edge.line);
        if (edge.regionIds[0] === edge.regionIds[1]) {
            fail("CBL030", `Adjacency '${edge.id}' must join two distinct regions.`, sourcePath, edge.line);
        }
    }
    requireUnique(sea.adjacency, "sea adjacency between regions", sourcePath, (entry) => adjacencyKey(...entry.regionIds));
    const adjacencyKeys = new Set(sea.adjacency.map((entry) => adjacencyKey(...entry.regionIds)));

    for (const exchange of sea.exchanges) {
        for (const endpoint of [exchange.from, exchange.to]) {
            if (endpoint.kind === "world") requireWorld(context.worldIds, endpoint.worldId, sourcePath, exchange.line);
            else requireRegion(regionIds, endpoint.regionId, sourcePath, exchange.line);
        }
        const { from, to } = exchange;
        if (from.kind === "world" && to.kind === "world") {
            fail("CBL031", `Sea exchange '${exchange.id}' cannot move sea quantity from world to world; worlds exchange content only through anchors.`, sourcePath, exchange.line);
        }
        if (from.kind === "region" && to.kind === "region") {
            if (!adjacencyKeys.has(adjacencyKey(from.regionId, to.regionId))) {
                fail("CBL032", `Sea exchange '${exchange.id}' from ${describeSeaEndpoint(from)} to ${describeSeaEndpoint(to)} needs a declared adjacency between two distinct regions.`, sourcePath, exchange.line);
            }
            continue;
        }
        const worldEndpoint = from.kind === "world" ? from : to;
        const regionEndpoint = from.kind === "region" ? from : to;
        if (worldEndpoint.kind === "world" && regionEndpoint.kind === "region"
            && placementByWorld.get(worldEndpoint.worldId) !== regionEndpoint.regionId) {
            fail("CBL033", `Sea exchange '${exchange.id}' links world '${worldEndpoint.worldId}' with region '${regionEndpoint.regionId}', but that world is placed in region '${placementByWorld.get(worldEndpoint.worldId)}'.`, sourcePath, exchange.line);
        }
    }

    const exchangeById = new Map(sea.exchanges.map((entry) => [entry.id, entry]));
    for (const guard of sea.guards) {
        const exchange = exchangeById.get(guard.exchangeId);
        if (!exchange) fail("CBL035", `Unknown sea exchange '${guard.exchangeId}'.`, sourcePath, guard.line);
        const endpoints = [exchange.from, exchange.to];
        if (guard.kind === "field") {
            requireField(context.fieldByKey, guard.worldId, guard.fieldId, sourcePath, guard.line);
            if (!endpoints.some((endpoint) => endpoint.kind === "world" && endpoint.worldId === guard.worldId)) {
                fail("CBL034", `Sea exchange '${exchange.id}' guard may read only its endpoint worlds and regions; world '${guard.worldId}' is not an endpoint.`, sourcePath, guard.line);
            }
            const field = context.fieldByKey.get(`${guard.worldId}.${guard.fieldId}`)!;
            if (field.initialValue.kind !== guard.value.kind) {
                fail("CBL015", `Sea exchange '${exchange.id}' compares '${guard.worldId}.${guard.fieldId}' with a different exact value kind.`, sourcePath, guard.line);
            }
            if (guard.value.kind !== "rational" && !["equal", "not-equal"].includes(guard.operator)) {
                fail("CBL021", `Sea exchange '${exchange.id}' can only order exact rational values; boolean and symbol guards support equality or inequality.`, sourcePath, guard.line);
            }
        } else {
            requireRegion(regionIds, guard.regionId, sourcePath, guard.line);
            if (!endpoints.some((endpoint) => endpoint.kind === "region" && endpoint.regionId === guard.regionId)) {
                fail("CBL034", `Sea exchange '${exchange.id}' guard may read only its endpoint worlds and regions; region '${guard.regionId}' is not an endpoint.`, sourcePath, guard.line);
            }
        }
    }

    if (medium.closure === "closed") {
        const seaFieldKeys = new Set(context.seas.flatMap((entry) => [
            `${entry.worldId}.${entry.positiveFieldId}`,
            `${entry.worldId}.${entry.negativeFieldId}`,
        ]));
        for (const entry of [...context.lawEffects, ...context.lawInverses]) {
            const law = context.lawById.get(entry.lawId)!;
            const key = `${law.worldId}.${entry.effect.fieldId}`;
            if (seaFieldKeys.has(key)) {
                fail("CBL036", `Closed sea medium '${medium.id}' is the only source and sink of sea quantity; law '${law.id}' cannot write world sea field '${key}'.`, sourcePath, entry.line);
            }
        }
        const zero = exact.integer(0);
        for (const transfer of context.transfers) {
            if (!exactValuesEqual(transfer.sourceNegativeSeaResidue, zero) || !exactValuesEqual(transfer.targetPositiveSeaPlacement, zero)) {
                fail("CBL036", `Closed sea medium '${medium.id}' is the only source and sink of sea quantity; transfer '${transfer.id}' cannot write negative-sea residue or positive-sea placement.`, sourcePath, transfer.line);
            }
        }
    }

    const families: IntensionalFamilyDefinition[] = [];
    const exchangeLaws: CausalSeaExchangeLaw[] = sea.exchanges.map((exchange) => {
        const clauses = sea.guards.filter((guard) => guard.exchangeId === exchange.id)
            .map((guard, index) => ({ guard, parameterName: `value-${index}` }));
        const familyId = `sea-guard-${exchange.id}`;
        families.push(conjunctionFamily(familyId, clauses.map(({ guard, parameterName }) => ({
            parameterName, operator: guard.operator, value: guard.value,
        }))));
        return {
            id: exchange.id,
            quantity: exchange.quantity,
            from: exchange.from,
            to: exchange.to,
            amount: exchange.amount,
            guard: {
                id: `sea-predicate-${exchange.id}`,
                query: { familyId, at: { coordinate: "0" }, parameters: {} },
                fieldParameters: clauses.flatMap(({ guard, parameterName }) => (
                    guard.kind === "field" ? [{ parameterName, worldId: guard.worldId, fieldId: guard.fieldId }] : []
                )),
                regionParameters: clauses.flatMap(({ guard, parameterName }) => (
                    guard.kind === "region" ? [{ parameterName, regionId: guard.regionId, quantity: guard.quantity }] : []
                )),
            },
            application: "once-per-realization",
        };
    });
    return {
        medium: {
            id: medium.id,
            closure: medium.closure,
            regions: sea.regions.map((region) => ({ id: region.id, negative: region.negative, positive: region.positive })),
            placements: sea.placements.map((placement) => ({ worldId: placement.worldId, regionId: placement.regionId })),
            adjacency: sea.adjacency.map((edge) => ({ id: edge.id, regionIds: [...edge.regionIds] })),
            exchangeLaws,
        },
        families,
    };
}

/** One exchange guard family: the conjunction of its clauses, or constant true when it has none. */
function conjunctionFamily(
    id: string,
    clauses: Array<{ parameterName: string; operator: IntensionalBinaryOperator; value: ExactValue }>,
): IntensionalFamilyDefinition {
    if (clauses.length === 0) return constantFamily(id, exact.boolean(true));
    const comparisons = clauses.map((clause): IntensionalTerm => ({
        kind: "binary",
        operator: clause.operator,
        left: { kind: "parameter", name: clause.parameterName },
        right: { kind: "value", value: clause.value },
    }));
    return {
        id,
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind: "boolean",
        parameters: clauses.map((clause) => ({ name: clause.parameterName, valueKind: clause.value.kind })),
        body: comparisons.reduce((left, right): IntensionalTerm => ({ kind: "binary", operator: "and", left, right })),
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

function requireRegion(regionIds: Set<string>, regionId: string, sourcePath: string | null, line: number): void {
    if (!regionIds.has(regionId)) fail("CBL026", `Unknown sea region '${regionId}'.`, sourcePath, line);
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
