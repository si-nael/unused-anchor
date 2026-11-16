import {
    exact,
    normalizeExactValue,
    validateEndogenousUniverseProgram,
    type CausalFieldEffect,
    type CausalFieldRole,
    type EndogenousCausalProjection,
    type EndogenousEmergenceTemplate,
    type EndogenousIndexSource,
    type EndogenousInternalLawTemplate,
    type EndogenousPredicateBindingTemplate,
    type EndogenousPredicateTemplate,
    type EndogenousQueryTemplate,
    type EndogenousRelationPredicateBindingTemplate,
    type EndogenousRelationPredicateTemplate,
    type EndogenousSchemaGraph,
    type EndogenousSchemaTransformation,
    type EndogenousUniverseProgram,
    type EndogenousValueSource,
    type EndogenousWorldConstructor,
    type ExactValue,
    type IntensionalAxis,
    type IntensionalBinaryOperator,
    type IntensionalFamilyDefinition,
    type IntensionalTerm,
    type IntensionalUnaryOperator,
    type IntensionalValueKind,
} from "../world-kernel";
import { BubbleCompilerError, createDiagnostic, throwDiagnostic, type Diagnostic } from "./diagnostics";

export interface CompileEndogenousBubbleOptions {
    sourcePath?: string | null;
    strict?: boolean;
}

export interface EndogenousBubbleCompilationResult {
    program: EndogenousUniverseProgram;
    diagnostics: Diagnostic[];
}

interface SourceLine {
    number: number;
    text: string;
}

interface Located<T> {
    line: number;
    value: T;
}

interface LawBuilder {
    line: number;
    id: string;
    guard: EndogenousPredicateTemplate;
    effects: CausalFieldEffect[];
    application: "once-per-realization";
    reversibility: "reversible" | "irreversible";
    inverseEffects: CausalFieldEffect[];
    commitAffectedFieldIds?: string[];
}

interface GraphBuilder {
    line: number;
    kind: "schema" | "graph";
    id: string;
    fields: EndogenousSchemaGraph["fields"];
    protectedFieldIds?: string[];
    ports?: string[];
    seaChannels: EndogenousSchemaGraph["seaChannels"];
    selfIdentity?: EndogenousPredicateTemplate;
    laws: Map<string, LawBuilder>;
    emergenceCriteria: EndogenousEmergenceTemplate[];
    projection?: EndogenousCausalProjection;
}

interface ConstructorBuilder {
    line: number;
    id: string;
    parentSchemaId: string;
    childSchemaId: string;
    coordinates: EndogenousWorldConstructor["coordinates"];
    admission?: EndogenousPredicateTemplate;
    parentPortId?: string;
    childPortId?: string;
    relationIdentity?: EndogenousRelationPredicateTemplate;
    transports: EndogenousWorldConstructor["transports"];
    seaActions: EndogenousWorldConstructor["seaActions"];
    transformation?: {
        line: number;
        id: string;
        replaceGraphId?: string;
        removeLawIds?: string[];
        upsertLaws: Map<string, LawBuilder>;
        effectValues: NonNullable<EndogenousSchemaTransformation["effectValues"]>;
    };
}

const IDENTIFIER_SOURCE = "[A-Za-z_][A-Za-z0-9_.-]*";
const IDENTIFIER = new RegExp(`^${IDENTIFIER_SOURCE}$`);
const EXACT_TOKEN = '(?:"(?:[^"\\\\]|\\\\.)*"|[^\\s]+)';
const HEADER = new RegExp(`^endogenous\\s+bubble\\s+(${IDENTIFIER_SOURCE})\\s*\\{$`);
const VALUE_KINDS = new Set<IntensionalValueKind>(["rational", "boolean", "symbol"]);
const FIELD_ROLES = new Set<CausalFieldRole>([
    "world-state", "world-condition", "structural-state", "identity-state", "memory-state",
    "boundary-state", "positive-sea", "negative-sea", "viability",
]);

export function compileEndogenousBubbleSource(
    source: string,
    options: CompileEndogenousBubbleOptions = {},
): EndogenousBubbleCompilationResult {
    const sourcePath = options.sourcePath ?? null;
    const lines = meaningfulLines(source);
    if (lines.length === 0) fail("EBL001", "Endogenous Bubble source is empty.", sourcePath, null);
    const header = lines[0]!;
    if (!header.text.match(HEADER)) {
        fail("EBL002", "Expected 'endogenous bubble <Name> {' as the first declaration.", sourcePath, header.number);
    }
    const closing = lines.at(-1)!;
    if (closing.text !== "}") fail("EBL003", "Endogenous Bubble source must end with '}'.", sourcePath, closing.number);

    const families = new Map<string, Located<IntensionalFamilyDefinition>>();
    const queries = new Map<string, Located<EndogenousQueryTemplate>>();
    const graphs = new Map<string, GraphBuilder>();
    const roots: Array<Located<EndogenousUniverseProgram["roots"][number]>> = [];
    const constructors = new Map<string, ConstructorBuilder>();
    let orderLine: number | undefined;

    for (const line of lines.slice(1, -1)) {
        let match = line.text.match(new RegExp(
            `^family\\s+(${IDENTIFIER_SOURCE})\\s+axes\\s+(\\S+)\\s+parameters\\s+(\\S+)\\s+returns\\s+(rational|boolean|symbol)`
            + `(?:\\s+recursion\\s+natural-axis\\s+(${IDENTIFIER_SOURCE}))?\\s*=\\s*(.+)$`,
        ));
        if (match) {
            const family: IntensionalFamilyDefinition = {
                id: match[1]!,
                domain: { axes: parseAxes(match[2]!, sourcePath, line.number) },
                valueKind: match[4] as IntensionalValueKind,
                parameters: parseParameters(match[3]!, sourcePath, line.number),
                body: parseIntensionalTerm(match[6]!, sourcePath, line.number),
                ...(match[5] ? { recursion: { kind: "well-founded-natural-axis" as const, measureAxis: match[5] } } : {}),
            };
            insertUnique(families, family.id, { line: line.number, value: family }, "family", sourcePath);
            continue;
        }

        match = line.text.match(new RegExp(
            `^query\\s+(${IDENTIFIER_SOURCE})\\s+family\\s+(${IDENTIFIER_SOURCE})\\s+at\\s+(.+?)\\s+parameters\\s+(.+)$`,
        ));
        if (match) {
            insertUnique(queries, match[1]!, {
                line: line.number,
                value: {
                    familyId: match[2]!,
                    at: parseRecordAssignments(match[3]!, (raw) => parseIndexSource(raw, sourcePath, line.number), sourcePath, line.number),
                    parameters: parseRecordAssignments(match[4]!, (raw) => parseValueSource(raw, sourcePath, line.number), sourcePath, line.number),
                },
            }, "query", sourcePath);
            continue;
        }

        match = line.text.match(new RegExp(`^(schema|graph)\\s+(${IDENTIFIER_SOURCE})$`));
        if (match) {
            const id = match[2]!;
            insertUnique(graphs, id, {
                line: line.number,
                kind: match[1] as GraphBuilder["kind"],
                id,
                fields: [],
                seaChannels: [],
                laws: new Map(),
                emergenceCriteria: [],
            }, `${match[1]} graph`, sourcePath);
            continue;
        }

        match = line.text.match(new RegExp(
            `^field\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+role\\s+([a-z-]+)\\s+family\\s+(${IDENTIFIER_SOURCE})\\s+initialize\\s+(${IDENTIFIER_SOURCE})$`,
        ));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            const role = match[3] as CausalFieldRole;
            if (!FIELD_ROLES.has(role)) fail("EBL004", `Unknown field role '${match[3]}'.`, sourcePath, line.number);
            requireUniqueArrayId(graph.fields, match[2]!, "field", sourcePath, line.number);
            graph.fields.push({
                id: match[2]!,
                familyId: match[4]!,
                role,
                initializer: requireQuery(queries, match[5]!, sourcePath, line.number),
            });
            continue;
        }

        match = line.text.match(new RegExp(`^protect\\s+(${IDENTIFIER_SOURCE})\\s+(.+)$`));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            if (graph.protectedFieldIds) fail("EBL005", `Protected fields for '${graph.id}' are declared more than once.`, sourcePath, line.number);
            graph.protectedFieldIds = identifierList(match[2]!, sourcePath, line.number);
            continue;
        }

        match = line.text.match(new RegExp(`^ports\\s+(${IDENTIFIER_SOURCE})\\s+(.+)$`));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            if (graph.ports) fail("EBL006", `Ports for '${graph.id}' are declared more than once.`, sourcePath, line.number);
            graph.ports = identifierList(match[2]!, sourcePath, line.number);
            continue;
        }

        match = line.text.match(new RegExp(
            `^sea\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+positive\\s+(${IDENTIFIER_SOURCE})\\s+negative\\s+(${IDENTIFIER_SOURCE})$`,
        ));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            requireUniqueArrayId(graph.seaChannels, match[2]!, "sea channel", sourcePath, line.number);
            graph.seaChannels.push({ id: match[2]!, positiveFieldId: match[3]!, negativeFieldId: match[4]! });
            continue;
        }

        match = line.text.match(new RegExp(
            `^identity\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+query\\s+(${IDENTIFIER_SOURCE})\\s+bind\\s+(.+)$`,
        ));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            if (graph.selfIdentity) fail("EBL007", `Self-identity for '${graph.id}' is declared more than once.`, sourcePath, line.number);
            graph.selfIdentity = predicate(
                match[2]!, match[3]!, match[4]!, queries, sourcePath, line.number,
            );
            continue;
        }

        match = line.text.match(new RegExp(
            `^law\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+guard\\s+(${IDENTIFIER_SOURCE})\\s+query\\s+(${IDENTIFIER_SOURCE})`
            + `\\s+bind\\s+(\\S+)\\s+application\\s+(once-per-realization)\\s+(reversible|irreversible)$`,
        ));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            insertUnique(graph.laws, match[2]!, createLaw(
                match[2]!, match[3]!, match[4]!, match[5]!, match[7] as LawBuilder["reversibility"],
                queries, sourcePath, line.number,
            ), "law", sourcePath);
            continue;
        }

        match = line.text.match(new RegExp(
            `^(effect|inverse)\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+(set|add|subtract)\\s+(${IDENTIFIER_SOURCE})\\s+(${EXACT_TOKEN})$`,
        ));
        if (match) {
            const graph = requireGraph(graphs, match[2]!, sourcePath, line.number);
            const law = requireLaw(graph.laws, match[3]!, sourcePath, line.number);
            const target = match[1] === "effect" ? law.effects : law.inverseEffects;
            target.push({
                fieldId: match[5]!, operation: match[4] as CausalFieldEffect["operation"],
                value: parseExact(match[6]!, sourcePath, line.number),
            });
            continue;
        }

        match = line.text.match(new RegExp(`^commit\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+(.+)$`));
        if (match) {
            const law = requireLaw(requireGraph(graphs, match[1]!, sourcePath, line.number).laws, match[2]!, sourcePath, line.number);
            if (law.commitAffectedFieldIds) fail("EBL008", `Commit set for law '${match[2]}' is declared more than once.`, sourcePath, line.number);
            law.commitAffectedFieldIds = identifierList(match[3]!, sourcePath, line.number);
            continue;
        }

        match = line.text.match(new RegExp(
            `^emergence\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+predicate\\s+(${IDENTIFIER_SOURCE})\\s+query\\s+(${IDENTIFIER_SOURCE})`
            + `\\s+bind\\s+(\\S+)\\s+witness\\s+(.+)$`,
        ));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            requireUniqueArrayId(graph.emergenceCriteria, match[2]!, "emergence criterion", sourcePath, line.number);
            graph.emergenceCriteria.push({
                id: match[2]!,
                predicate: predicate(match[3]!, match[4]!, match[5]!, queries, sourcePath, line.number),
                witnessFieldIds: identifierList(match[6]!, sourcePath, line.number),
            });
            continue;
        }

        match = line.text.match(new RegExp(
            `^projection\\s+(${IDENTIFIER_SOURCE})\\s+viability\\s+(${EXACT_TOKEN})\\s+objective\\s+(${IDENTIFIER_SOURCE})`
            + `\\s+field\\s+(${IDENTIFIER_SOURCE})\\s+direction\\s+(maximize|minimize|stabilize)\\s+weight\\s+(${EXACT_TOKEN})`
            + `(?:\\s+target\\s+(${EXACT_TOKEN}))?$`,
        ));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            if (graph.projection) fail("EBL009", `Causal projection for '${graph.id}' is declared more than once.`, sourcePath, line.number);
            graph.projection = {
                channels: [],
                intrinsicViability: parseExact(match[2]!, sourcePath, line.number, true),
                objective: {
                    id: match[3]!, fieldId: match[4]!, direction: match[5] as EndogenousCausalProjection["objective"]["direction"],
                    weight: parseExact(match[6]!, sourcePath, line.number, true),
                    ...(match[7] ? { targetValue: parseExact(match[7], sourcePath, line.number, true) } : {}),
                },
            };
            continue;
        }

        match = line.text.match(new RegExp(
            `^projection-channel\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+weights\\s+(${EXACT_TOKEN})\\s+(${EXACT_TOKEN})$`,
        ));
        if (match) {
            const graph = requireGraph(graphs, match[1]!, sourcePath, line.number);
            const channelId = match[2]!;
            if (!graph.projection) fail("EBL010", `Projection channels for '${graph.id}' must follow its projection declaration.`, sourcePath, line.number);
            if (graph.projection.channels.some((entry) => entry.channelId === channelId)) {
                fail("EBL011", `Duplicate projection channel '${channelId}'.`, sourcePath, line.number);
            }
            graph.projection.channels.push({
                channelId,
                positiveWeight: parseExact(match[3]!, sourcePath, line.number, true),
                negativeWeight: parseExact(match[4]!, sourcePath, line.number, true),
            });
            continue;
        }

        match = line.text.match(new RegExp(`^root\\s+(${IDENTIFIER_SOURCE})\\s+schema\\s+(${IDENTIFIER_SOURCE})\\s+values\\s+(.+)$`));
        if (match) {
            if (roots.some((entry) => entry.value.id === match![1])) fail("EBL012", `Duplicate root '${match[1]}'.`, sourcePath, line.number);
            roots.push({
                line: line.number,
                value: {
                    id: match[1]!, schemaId: match[2]!,
                    values: parseRecordAssignments(match[3]!, (raw) => parseExact(raw, sourcePath, line.number), sourcePath, line.number),
                },
            });
            continue;
        }

        match = line.text.match(new RegExp(
            `^constructor\\s+(${IDENTIFIER_SOURCE})\\s+parent\\s+(${IDENTIFIER_SOURCE})\\s+child\\s+(${IDENTIFIER_SOURCE})`
            + `\\s+coordinates\\s+(natural|finite\\s+[1-9][0-9]*)$`,
        ));
        if (match) {
            const coordinateParts = match[4]!.split(/\s+/);
            const coordinates: EndogenousWorldConstructor["coordinates"] = coordinateParts[0] === "natural"
                ? { kind: "natural" }
                : { kind: "finite", size: coordinateParts[1]! };
            insertUnique(constructors, match[1]!, {
                line: line.number, id: match[1]!, parentSchemaId: match[2]!, childSchemaId: match[3]!, coordinates,
                transports: [], seaActions: [],
            }, "constructor", sourcePath);
            continue;
        }

        match = line.text.match(new RegExp(
            `^admission\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+query\\s+(${IDENTIFIER_SOURCE})\\s+bind\\s+(.+)$`,
        ));
        if (match) {
            const constructor = requireConstructor(constructors, match[1]!, sourcePath, line.number);
            if (constructor.admission) fail("EBL013", `Admission for constructor '${constructor.id}' is declared more than once.`, sourcePath, line.number);
            constructor.admission = predicate(match[2]!, match[3]!, match[4]!, queries, sourcePath, line.number);
            continue;
        }

        match = line.text.match(new RegExp(
            `^constructor-ports\\s+(${IDENTIFIER_SOURCE})\\s+parent\\s+(${IDENTIFIER_SOURCE})\\s+child\\s+(${IDENTIFIER_SOURCE})$`,
        ));
        if (match) {
            const constructor = requireConstructor(constructors, match[1]!, sourcePath, line.number);
            if (constructor.parentPortId || constructor.childPortId) fail("EBL014", `Ports for constructor '${constructor.id}' are declared more than once.`, sourcePath, line.number);
            constructor.parentPortId = match[2]!;
            constructor.childPortId = match[3]!;
            continue;
        }

        match = line.text.match(new RegExp(
            `^relation\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+query\\s+(${IDENTIFIER_SOURCE})\\s+bind\\s+(.+)$`,
        ));
        if (match) {
            const constructor = requireConstructor(constructors, match[1]!, sourcePath, line.number);
            if (constructor.relationIdentity) fail("EBL015", `Relation identity for '${constructor.id}' is declared more than once.`, sourcePath, line.number);
            constructor.relationIdentity = relationPredicate(
                match[2]!, match[3]!, match[4]!, queries, sourcePath, line.number,
            );
            continue;
        }

        match = line.text.match(new RegExp(
            `^transport\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s*->\\s*(${IDENTIFIER_SOURCE})$`,
        ));
        if (match) {
            requireConstructor(constructors, match[1]!, sourcePath, line.number).transports.push({
                sourceFieldId: match[2]!, targetFieldId: match[3]!,
            });
            continue;
        }

        match = line.text.match(new RegExp(
            `^sea-action\\s+(${IDENTIFIER_SOURCE})\\s+parent\\s+(${IDENTIFIER_SOURCE})\\s+child\\s+(${IDENTIFIER_SOURCE})`
            + `\\s+residue\\s+(${EXACT_TOKEN})\\s+placement\\s+(${EXACT_TOKEN})$`,
        ));
        if (match) {
            requireConstructor(constructors, match[1]!, sourcePath, line.number).seaActions.push({
                parentChannelId: match[2]!, childChannelId: match[3]!,
                parentNegativeResidue: parseExact(match[4]!, sourcePath, line.number, true),
                childPositivePlacement: parseExact(match[5]!, sourcePath, line.number, true),
            });
            continue;
        }

        match = line.text.match(new RegExp(
            `^transform\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})(?:\\s+replace\\s+(${IDENTIFIER_SOURCE}))?$`,
        ));
        if (match) {
            const constructor = requireConstructor(constructors, match[1]!, sourcePath, line.number);
            if (constructor.transformation) fail("EBL016", `Transformation for '${constructor.id}' is declared more than once.`, sourcePath, line.number);
            constructor.transformation = {
                line: line.number, id: match[2]!, ...(match[3] ? { replaceGraphId: match[3] } : {}),
                upsertLaws: new Map(), effectValues: [],
            };
            continue;
        }

        match = line.text.match(new RegExp(`^transform-remove\\s+(${IDENTIFIER_SOURCE})\\s+(.+)$`));
        if (match) {
            const transformation = requireTransformation(constructors, match[1]!, sourcePath, line.number);
            if (transformation.removeLawIds) fail("EBL017", `Transformation removals for '${match[1]}' are declared more than once.`, sourcePath, line.number);
            transformation.removeLawIds = identifierList(match[2]!, sourcePath, line.number);
            continue;
        }

        match = line.text.match(new RegExp(
            `^transform-law\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+guard\\s+(${IDENTIFIER_SOURCE})\\s+query\\s+(${IDENTIFIER_SOURCE})`
            + `\\s+bind\\s+(\\S+)\\s+application\\s+(once-per-realization)\\s+(reversible|irreversible)$`,
        ));
        if (match) {
            const transformation = requireTransformation(constructors, match[1]!, sourcePath, line.number);
            insertUnique(transformation.upsertLaws, match[2]!, createLaw(
                match[2]!, match[3]!, match[4]!, match[5]!, match[7] as LawBuilder["reversibility"],
                queries, sourcePath, line.number,
            ), "transformation law", sourcePath);
            continue;
        }

        match = line.text.match(new RegExp(
            `^transform-(effect|inverse)\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+(set|add|subtract)`
            + `\\s+(${IDENTIFIER_SOURCE})\\s+(${EXACT_TOKEN})$`,
        ));
        if (match) {
            const law = requireLaw(
                requireTransformation(constructors, match[2]!, sourcePath, line.number).upsertLaws,
                match[3]!, sourcePath, line.number,
            );
            const target = match[1] === "effect" ? law.effects : law.inverseEffects;
            target.push({
                fieldId: match[5]!, operation: match[4] as CausalFieldEffect["operation"],
                value: parseExact(match[6]!, sourcePath, line.number),
            });
            continue;
        }

        match = line.text.match(new RegExp(
            `^transform-commit\\s+(${IDENTIFIER_SOURCE})\\s+(${IDENTIFIER_SOURCE})\\s+(.+)$`,
        ));
        if (match) {
            const law = requireLaw(
                requireTransformation(constructors, match[1]!, sourcePath, line.number).upsertLaws,
                match[2]!, sourcePath, line.number,
            );
            if (law.commitAffectedFieldIds) fail("EBL018", `Transformation commit set for '${match[2]}' is declared more than once.`, sourcePath, line.number);
            law.commitAffectedFieldIds = identifierList(match[3]!, sourcePath, line.number);
            continue;
        }

        match = line.text.match(new RegExp(
            `^transform-effect-value\\s+(${IDENTIFIER_SOURCE})\\s+law\\s+(${IDENTIFIER_SOURCE})\\s+effect-index\\s+([0-9]+)\\s+query\\s+(${IDENTIFIER_SOURCE})$`,
        ));
        if (match) {
            requireTransformation(constructors, match[1]!, sourcePath, line.number).effectValues.push({
                lawId: match[2]!, effectIndex: Number(match[3]),
                value: requireQuery(queries, match[4]!, sourcePath, line.number),
            });
            continue;
        }

        match = line.text.match(/^order\s+causal-partial\s+universal-clock\s+(true|false)$/);
        if (match) {
            if (orderLine !== undefined) fail("EBL019", "Causal order is declared more than once.", sourcePath, line.number);
            if (match[1] !== "false") fail("EBL020", "Endogenous Bubble source cannot introduce a universal clock.", sourcePath, line.number);
            orderLine = line.number;
            continue;
        }

        fail("EBL021", `Could not parse endogenous declaration '${line.text}'.`, sourcePath, line.number);
    }

    if (orderLine === undefined) fail("EBL022", "Endogenous Bubble source needs an explicit clockless causal order.", sourcePath, header.number);
    if (families.size === 0) fail("EBL023", "Endogenous Bubble source needs at least one intensional family.", sourcePath, header.number);
    if (![...graphs.values()].some((entry) => entry.kind === "schema")) {
        fail("EBL024", "Endogenous Bubble source needs at least one executable schema.", sourcePath, header.number);
    }

    const usedReplacementGraphs = new Set<string>();
    const program: EndogenousUniverseProgram = {
        mode: "bubble-endogenous-connected-universe-program.v1",
        formal: { mode: "bubble-intensional-system.v1", families: [...families.values()].map((entry) => entry.value) },
        schemas: [...graphs.values()].filter((entry) => entry.kind === "schema").map((entry) => ({
            id: entry.id,
            ...realizeGraph(entry, sourcePath),
        })),
        roots: roots.map((entry) => entry.value),
        constructors: [...constructors.values()].map((entry) => realizeConstructor(entry, graphs, usedReplacementGraphs, sourcePath)),
        order: { kind: "causal-partial-order", universalClock: false },
    };

    for (const graph of graphs.values()) {
        if (graph.kind === "graph" && !usedReplacementGraphs.has(graph.id)) {
            fail("EBL025", `Replacement graph '${graph.id}' is declared but never used.`, sourcePath, graph.line);
        }
    }

    const diagnostics = validateEndogenousUniverseProgram(program).map((entry) => createDiagnostic({
        code: entry.code,
        severity: "error",
        sourcePath,
        message: `${entry.path}: ${entry.message}`,
    }));
    if (options.strict !== false && diagnostics.length > 0) throw new BubbleCompilerError(diagnostics);
    return { program, diagnostics };
}

function realizeGraph(builder: GraphBuilder, sourcePath: string | null): EndogenousSchemaGraph {
    if (!builder.protectedFieldIds) fail("EBL026", `Graph '${builder.id}' needs one protected-field declaration (use 'none' when empty).`, sourcePath, builder.line);
    if (!builder.ports) fail("EBL027", `Graph '${builder.id}' needs one ports declaration (use 'none' when empty).`, sourcePath, builder.line);
    if (!builder.selfIdentity) fail("EBL028", `Graph '${builder.id}' needs one self-identity predicate.`, sourcePath, builder.line);
    return {
        fields: builder.fields,
        protectedFieldIds: builder.protectedFieldIds,
        ports: builder.ports,
        seaChannels: builder.seaChannels,
        selfIdentity: builder.selfIdentity,
        internalLaws: [...builder.laws.values()].map(realizeLaw),
        emergenceCriteria: builder.emergenceCriteria,
        ...(builder.projection ? { causalProjection: builder.projection } : {}),
    };
}

function realizeLaw(builder: LawBuilder): EndogenousInternalLawTemplate {
    return {
        id: builder.id,
        guard: builder.guard,
        effects: builder.effects,
        application: builder.application,
        reversibility: builder.reversibility,
        ...(builder.inverseEffects.length > 0 ? { inverseEffects: builder.inverseEffects } : {}),
        ...(builder.commitAffectedFieldIds ? { commitAffectedFieldIds: builder.commitAffectedFieldIds } : {}),
    };
}

function realizeConstructor(
    builder: ConstructorBuilder,
    graphs: Map<string, GraphBuilder>,
    usedReplacementGraphs: Set<string>,
    sourcePath: string | null,
): EndogenousWorldConstructor {
    if (!builder.admission) fail("EBL029", `Constructor '${builder.id}' needs one admission predicate.`, sourcePath, builder.line);
    if (!builder.parentPortId || !builder.childPortId) fail("EBL030", `Constructor '${builder.id}' needs parent and child ports.`, sourcePath, builder.line);
    if (!builder.relationIdentity) fail("EBL031", `Constructor '${builder.id}' needs one relation identity predicate.`, sourcePath, builder.line);
    let schemaTransformation: EndogenousSchemaTransformation | undefined;
    if (builder.transformation) {
        const transformation = builder.transformation;
        let replaceGraph: EndogenousSchemaGraph | undefined;
        if (transformation.replaceGraphId) {
            const graph = requireGraph(graphs, transformation.replaceGraphId, sourcePath, transformation.line);
            if (graph.kind !== "graph") fail("EBL032", `Transformation '${transformation.id}' must replace a declared graph, not executable schema '${graph.id}'.`, sourcePath, transformation.line);
            usedReplacementGraphs.add(graph.id);
            replaceGraph = realizeGraph(graph, sourcePath);
        }
        schemaTransformation = {
            id: transformation.id,
            ...(replaceGraph ? { replaceGraph } : {}),
            ...(transformation.removeLawIds ? { removeLawIds: transformation.removeLawIds } : {}),
            ...(transformation.upsertLaws.size > 0 ? { upsertLaws: [...transformation.upsertLaws.values()].map(realizeLaw) } : {}),
            ...(transformation.effectValues.length > 0 ? { effectValues: transformation.effectValues } : {}),
        };
    }
    return {
        id: builder.id,
        parentSchemaId: builder.parentSchemaId,
        childSchemaId: builder.childSchemaId,
        coordinates: builder.coordinates,
        admission: builder.admission,
        parentPortId: builder.parentPortId,
        childPortId: builder.childPortId,
        relationIdentity: builder.relationIdentity,
        transports: builder.transports,
        seaActions: builder.seaActions,
        ...(schemaTransformation ? { schemaTransformation } : {}),
    };
}

function createLaw(
    id: string,
    guardId: string,
    queryId: string,
    bindings: string,
    reversibility: LawBuilder["reversibility"],
    queries: Map<string, Located<EndogenousQueryTemplate>>,
    sourcePath: string | null,
    line: number,
): LawBuilder {
    return {
        line,
        id,
        guard: predicate(guardId, queryId, bindings, queries, sourcePath, line),
        effects: [],
        application: "once-per-realization",
        reversibility,
        inverseEffects: [],
    };
}

function predicate(
    id: string,
    queryId: string,
    bindings: string,
    queries: Map<string, Located<EndogenousQueryTemplate>>,
    sourcePath: string | null,
    line: number,
): EndogenousPredicateTemplate {
    return {
        id,
        query: requireQuery(queries, queryId, sourcePath, line),
        fieldParameters: parseBindingAssignments(bindings, (fieldId, parameterName) => ({ parameterName, fieldId }), sourcePath, line),
    };
}

function relationPredicate(
    id: string,
    queryId: string,
    bindings: string,
    queries: Map<string, Located<EndogenousQueryTemplate>>,
    sourcePath: string | null,
    line: number,
): EndogenousRelationPredicateTemplate {
    const fieldParameters = parseBindingAssignments<EndogenousRelationPredicateBindingTemplate>(bindings, (raw, parameterName) => {
        const match = raw.match(new RegExp(`^(parent|child)\\.(${IDENTIFIER_SOURCE})$`));
        if (!match) fail("EBL033", `Relation binding '${parameterName}=${raw}' needs parent.<field> or child.<field>.`, sourcePath, line);
        return { parameterName, endpoint: match[1] as "parent" | "child", fieldId: match[2]! };
    }, sourcePath, line);
    return { id, query: requireQuery(queries, queryId, sourcePath, line), fieldParameters };
}

function parseAxes(raw: string, sourcePath: string | null, line: number): IntensionalAxis[] {
    if (raw === "none") return [];
    return commaParts(raw, sourcePath, line).map((entry) => {
        let match = entry.match(new RegExp(`^(${IDENTIFIER_SOURCE}):(natural|integer)$`));
        if (match) return { name: match[1]!, kind: match[2] as "natural" | "integer" };
        match = entry.match(new RegExp(`^(${IDENTIFIER_SOURCE}):finite\\(([1-9][0-9]*)\\)$`));
        if (match) return { name: match[1]!, kind: "finite", size: match[2]! };
        fail("EBL034", `Invalid intensional axis '${entry}'.`, sourcePath, line);
    });
}

function parseParameters(
    raw: string,
    sourcePath: string | null,
    line: number,
): IntensionalFamilyDefinition["parameters"] {
    if (raw === "none") return [];
    return commaParts(raw, sourcePath, line).map((entry) => {
        const match = entry.match(new RegExp(`^(${IDENTIFIER_SOURCE}):(rational|boolean|symbol)$`));
        if (!match || !VALUE_KINDS.has(match[2] as IntensionalValueKind)) {
            fail("EBL035", `Invalid intensional parameter '${entry}'.`, sourcePath, line);
        }
        return { name: match[1]!, valueKind: match[2] as IntensionalValueKind };
    });
}

function parseIntensionalTerm(raw: string, sourcePath: string | null, line: number): IntensionalTerm {
    const tokens = tokenizeTerm(raw, sourcePath, line);
    let cursor = 0;

    function next(): string {
        const token = tokens[cursor++];
        if (token === undefined) fail("EBL036", "Unexpected end of intensional term.", sourcePath, line);
        return token;
    }

    function parse(): IntensionalTerm {
        const token = next();
        if (token !== "(") {
            if (token.startsWith("$")) return { kind: "parameter", name: requireTermIdentifier(token.slice(1), sourcePath, line) };
            if (token.startsWith("@")) return { kind: "index", axis: requireTermIdentifier(token.slice(1), sourcePath, line) };
            return { kind: "value", value: parseExact(token, sourcePath, line) };
        }

        const head = next();
        if (head === "coordinate") {
            const familyId = requireTermIdentifier(next(), sourcePath, line);
            const at: Record<string, IntensionalTerm> = {};
            const parameters: Record<string, IntensionalTerm> = {};
            while (tokens[cursor] !== ")") {
                if (next() !== "(") fail("EBL037", "Coordinate bindings must be parenthesized.", sourcePath, line);
                const bindingKind = next();
                const name = requireTermIdentifier(next(), sourcePath, line);
                const value = parse();
                if (next() !== ")") fail("EBL038", "Coordinate binding has extra terms.", sourcePath, line);
                const target = bindingKind === "at" ? at : bindingKind === "with" ? parameters : undefined;
                if (!target) fail("EBL039", `Unknown coordinate binding '${bindingKind}'.`, sourcePath, line);
                if (target[name]) fail("EBL040", `Duplicate coordinate binding '${name}'.`, sourcePath, line);
                target[name] = value;
            }
            next();
            return { kind: "family-coordinate", familyId, at, parameters };
        }

        if (head === "if") {
            const condition = parse();
            const then = parse();
            const otherwise = parse();
            if (next() !== ")") fail("EBL041", "'if' needs exactly condition, then, and otherwise terms.", sourcePath, line);
            return { kind: "if", condition, then, otherwise };
        }

        const unary = unaryOperator(head);
        if (unary) {
            const operand = parse();
            if (next() !== ")") fail("EBL042", `Unary '${head}' needs exactly one operand.`, sourcePath, line);
            return { kind: "unary", operator: unary, operand };
        }

        const binary = binaryOperator(head);
        if (binary) {
            const left = parse();
            const right = parse();
            if (next() !== ")") fail("EBL043", `Binary '${head}' needs exactly two operands.`, sourcePath, line);
            return { kind: "binary", operator: binary, left, right };
        }
        fail("EBL044", `Unknown intensional term operator '${head}'.`, sourcePath, line);
    }

    const term = parse();
    if (cursor !== tokens.length) fail("EBL045", `Unexpected trailing intensional token '${tokens[cursor]}'.`, sourcePath, line);
    return term;
}

function tokenizeTerm(raw: string, sourcePath: string | null, line: number): string[] {
    const tokens: string[] = [];
    let index = 0;
    while (index < raw.length) {
        if (/\s/.test(raw[index]!)) {
            index += 1;
            continue;
        }
        if (raw[index] === "(" || raw[index] === ")") {
            tokens.push(raw[index]!);
            index += 1;
            continue;
        }
        if (raw[index] === '"') {
            let end = index + 1;
            while (end < raw.length && (raw[end] !== '"' || raw[end - 1] === "\\")) end += 1;
            if (end >= raw.length) fail("EBL046", "Unterminated symbol literal in intensional term.", sourcePath, line);
            tokens.push(raw.slice(index, end + 1));
            index = end + 1;
            continue;
        }
        const match = raw.slice(index).match(/^[^\s()]+/)?.[0];
        if (!match) fail("EBL047", `Could not tokenize intensional term near '${raw.slice(index)}'.`, sourcePath, line);
        tokens.push(match);
        index += match.length;
    }
    return tokens;
}

function unaryOperator(raw: string): IntensionalUnaryOperator | undefined {
    return raw === "negate" || raw === "not" ? raw : undefined;
}

function binaryOperator(raw: string): IntensionalBinaryOperator | undefined {
    const names: Record<string, IntensionalBinaryOperator> = {
        "+": "add", "-": "subtract", "*": "multiply", "/": "divide",
        "=": "equal", "!=": "not-equal", "<": "less-than", "<=": "less-than-or-equal",
        ">": "greater-than", ">=": "greater-than-or-equal", and: "and", or: "or",
        add: "add", subtract: "subtract", multiply: "multiply", divide: "divide",
        equal: "equal", "not-equal": "not-equal", "less-than": "less-than",
        "less-than-or-equal": "less-than-or-equal", "greater-than": "greater-than",
        "greater-than-or-equal": "greater-than-or-equal",
    };
    return names[raw];
}

function parseIndexSource(raw: string, sourcePath: string | null, line: number): EndogenousIndexSource {
    if (raw === "lineage-depth" || raw === "local-coordinate") return { kind: raw };
    if (/^-?[0-9]+$/.test(raw)) return { kind: "literal", value: raw };
    if (raw.startsWith('"') && raw.endsWith('"')) return { kind: "literal", value: parseJsonString(raw, sourcePath, line) };
    fail("EBL048", `Invalid endogenous index source '${raw}'.`, sourcePath, line);
}

function parseValueSource(raw: string, sourcePath: string | null, line: number): EndogenousValueSource {
    if (raw === "lineage-depth" || raw === "local-coordinate" || raw === "root-id") return { kind: raw };
    let match = raw.match(new RegExp(`^seed\\((${IDENTIFIER_SOURCE})\\)$`));
    if (match) return { kind: "seed", name: match[1]! };
    match = raw.match(new RegExp(`^parent-field\\((${IDENTIFIER_SOURCE})\\)$`));
    if (match) return { kind: "parent-field", fieldId: match[1]! };
    return { kind: "literal", value: parseExact(raw, sourcePath, line) };
}

function parseExact(raw: string, sourcePath: string | null, line: number, rationalOnly = false): ExactValue {
    let value: ExactValue | undefined;
    if (/^-?[0-9]+$/.test(raw)) value = exact.integer(raw);
    else {
        const rational = raw.match(/^(-?[0-9]+)\/(-?[0-9]+)$/);
        if (rational) value = exact.rational(rational[1]!, rational[2]!);
        else if (raw === "true" || raw === "false") value = exact.boolean(raw === "true");
        else if (raw.startsWith('"') && raw.endsWith('"')) value = exact.symbol(parseJsonString(raw, sourcePath, line));
    }
    const normalized = value ? normalizeExactValue(value) : undefined;
    if (!normalized || (rationalOnly && normalized.kind !== "rational")) {
        fail("EBL049", `Expected ${rationalOnly ? "an exact rational" : "an exact rational, boolean, or quoted symbol"}; received '${raw}'.`, sourcePath, line);
    }
    return normalized;
}

function parseRecordAssignments<T>(
    raw: string,
    parseValue: (value: string, name: string) => T,
    sourcePath: string | null,
    line: number,
): Record<string, T> {
    if (raw === "none") return {};
    const result: Record<string, T> = {};
    for (const { name, value } of parseRawAssignments(raw, sourcePath, line)) result[name] = parseValue(value, name);
    return result;
}

function parseBindingAssignments<T>(
    raw: string,
    parseValue: (value: string, name: string) => T,
    sourcePath: string | null,
    line: number,
): T[] {
    if (raw === "none") return [];
    return parseRawAssignments(raw, sourcePath, line).map(({ name, value }) => parseValue(value, name));
}

function parseRawAssignments(
    raw: string,
    sourcePath: string | null,
    line: number,
): Array<{ name: string; value: string }> {
    const entries = commaParts(raw, sourcePath, line);
    const seen = new Set<string>();
    const result: Array<{ name: string; value: string }> = [];
    for (const entry of entries) {
        const separator = entry.indexOf("=");
        if (separator < 1) fail("EBL050", `Expected name=value binding, received '${entry}'.`, sourcePath, line);
        const name = entry.slice(0, separator);
        const value = entry.slice(separator + 1);
        if (!IDENTIFIER.test(name) || value.length === 0) fail("EBL050", `Expected name=value binding, received '${entry}'.`, sourcePath, line);
        if (seen.has(name)) fail("EBL051", `Duplicate binding '${name}'.`, sourcePath, line);
        seen.add(name);
        result.push({ name, value });
    }
    return result;
}

function meaningfulLines(source: string): SourceLine[] {
    return source.split(/\r?\n/).map((text, index) => ({ number: index + 1, text: text.trim() }))
        .filter((line) => line.text.length > 0 && !line.text.startsWith("#"));
}

function identifierList(raw: string, sourcePath: string | null, line: number): string[] {
    if (raw === "none") return [];
    const values = commaParts(raw, sourcePath, line);
    if (values.some((entry) => !IDENTIFIER.test(entry))) fail("EBL052", `Expected identifier list, received '${raw}'.`, sourcePath, line);
    if (new Set(values).size !== values.length) fail("EBL053", `Identifier list contains a duplicate: '${raw}'.`, sourcePath, line);
    return values;
}

function commaParts(raw: string, sourcePath: string | null, line: number): string[] {
    const values: string[] = [];
    let start = 0;
    let depth = 0;
    let quoted = false;
    for (let index = 0; index < raw.length; index += 1) {
        const character = raw[index]!;
        if (character === '"' && raw[index - 1] !== "\\") quoted = !quoted;
        else if (!quoted && character === "(") depth += 1;
        else if (!quoted && character === ")") depth -= 1;
        else if (!quoted && depth === 0 && character === ",") {
            values.push(raw.slice(start, index).trim());
            start = index + 1;
        }
        if (depth < 0) fail("EBL054", `Unbalanced binding declaration '${raw}'.`, sourcePath, line);
    }
    if (quoted || depth !== 0) fail("EBL054", `Unbalanced binding declaration '${raw}'.`, sourcePath, line);
    values.push(raw.slice(start).trim());
    const filtered = values.filter(Boolean);
    if (filtered.length === 0) fail("EBL054", `Expected a non-empty comma-separated declaration, received '${raw}'.`, sourcePath, line);
    return filtered;
}

function requireTermIdentifier(raw: string, sourcePath: string | null, line: number): string {
    if (!IDENTIFIER.test(raw)) fail("EBL055", `Invalid intensional identifier '${raw}'.`, sourcePath, line);
    return raw;
}

function parseJsonString(raw: string, sourcePath: string | null, line: number): string {
    try {
        const value: unknown = JSON.parse(raw);
        if (typeof value === "string") return value;
    } catch {
        // The diagnostic below is stable across host JSON implementations.
    }
    fail("EBL056", `Invalid quoted symbol '${raw}'.`, sourcePath, line);
}

function requireGraph(graphs: Map<string, GraphBuilder>, id: string, sourcePath: string | null, line: number): GraphBuilder {
    const graph = graphs.get(id);
    if (!graph) fail("EBL057", `Unknown schema or replacement graph '${id}'.`, sourcePath, line);
    return graph;
}

function requireQuery(
    queries: Map<string, Located<EndogenousQueryTemplate>>,
    id: string,
    sourcePath: string | null,
    line: number,
): EndogenousQueryTemplate {
    const query = queries.get(id);
    if (!query) fail("EBL058", `Unknown endogenous query '${id}'.`, sourcePath, line);
    return structuredClone(query.value);
}

function requireConstructor(
    constructors: Map<string, ConstructorBuilder>,
    id: string,
    sourcePath: string | null,
    line: number,
): ConstructorBuilder {
    const constructor = constructors.get(id);
    if (!constructor) fail("EBL059", `Unknown constructor '${id}'.`, sourcePath, line);
    return constructor;
}

function requireTransformation(
    constructors: Map<string, ConstructorBuilder>,
    id: string,
    sourcePath: string | null,
    line: number,
): NonNullable<ConstructorBuilder["transformation"]> {
    const transformation = requireConstructor(constructors, id, sourcePath, line).transformation;
    if (!transformation) fail("EBL060", `Constructor '${id}' has no preceding transformation declaration.`, sourcePath, line);
    return transformation;
}

function requireLaw(
    laws: Map<string, LawBuilder>,
    id: string,
    sourcePath: string | null,
    line: number,
): LawBuilder {
    const law = laws.get(id);
    if (!law) fail("EBL061", `Unknown law '${id}'.`, sourcePath, line);
    return law;
}

function insertUnique<T>(
    target: Map<string, T>,
    id: string,
    value: T,
    label: string,
    sourcePath: string | null,
): void {
    if (target.has(id)) fail("EBL062", `Duplicate ${label} '${id}'.`, sourcePath, "line" in (value as object) ? Number((value as { line: number }).line) : null);
    target.set(id, value);
}

function requireUniqueArrayId(
    target: Array<{ id: string }>,
    id: string,
    label: string,
    sourcePath: string | null,
    line: number,
): void {
    if (target.some((entry) => entry.id === id)) fail("EBL063", `Duplicate ${label} '${id}'.`, sourcePath, line);
}

function fail(code: string, message: string, sourcePath: string | null, line: number | null): never {
    throwDiagnostic({ code, severity: "error", message, sourcePath, line });
}
