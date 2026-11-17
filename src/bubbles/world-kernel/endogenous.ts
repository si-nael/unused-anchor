import { createHash } from "node:crypto";
import {
    addExactRationals,
    compareExactRationals,
    evaluateIntensionalCoordinate,
    exact,
    exactValuesEqual,
    normalizeExactValue,
    subtractExactRationals,
    validateIntensionalSystem,
    type ExactValue,
    type IntensionalCoordinateQuery,
    type IntensionalFamilyDefinition,
    type IntensionalProofStep,
    type IntensionalSystem,
    type IntensionalValueKind,
} from "./intensional";
import type {
    CausalAnchorDefinition,
    CausalEmergenceCriterion,
    CausalFieldBinding,
    CausalFieldEffect,
    CausalFieldRole,
    CausalInternalLaw,
    CausalSeaEndpoint,
    CausalSeaExchangeLaw,
    CausalSeaMedium,
    CausalSeaQuantity,
    CausalStatePredicate,
    CausalWorldDefinition,
    CausalWorldWillObjective,
} from "./causal";
import type {
    CausalAnchorIdentityQuery,
    CausalExecutionOptions,
    CausalFieldInitializer,
    CausalSeaLaw,
    ExecutableAnchoredCausalProgram,
} from "./causal-runtime";
import { compareCanonicalStrings } from "./canonical-order";

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

export type EndogenousIndexSource =
    | { kind: "literal"; value: string }
    | { kind: "lineage-depth" }
    | { kind: "local-coordinate" };

export type EndogenousValueSource =
    | { kind: "literal"; value: ExactValue }
    | { kind: "lineage-depth" }
    | { kind: "local-coordinate" }
    | { kind: "root-id" }
    | { kind: "seed"; name: string }
    | { kind: "parent-field"; fieldId: string };

export interface EndogenousQueryTemplate {
    familyId: string;
    at: Record<string, EndogenousIndexSource>;
    parameters: Record<string, EndogenousValueSource>;
}

export interface EndogenousFieldTemplate {
    id: string;
    familyId: string;
    role: CausalFieldRole;
    initializer: EndogenousQueryTemplate;
}

export interface EndogenousPredicateBindingTemplate {
    parameterName: string;
    fieldId: string;
}

export interface EndogenousPredicateTemplate {
    id: string;
    query: EndogenousQueryTemplate;
    fieldParameters: EndogenousPredicateBindingTemplate[];
}

export interface EndogenousInternalLawTemplate {
    id: string;
    guard: EndogenousPredicateTemplate;
    effects: CausalFieldEffect[];
    application: "once-per-realization";
    reversibility: "reversible" | "irreversible";
    inverseEffects?: CausalFieldEffect[];
    commitAffectedFieldIds?: string[];
}

export interface EndogenousEmergenceTemplate {
    id: string;
    predicate: EndogenousPredicateTemplate;
    witnessFieldIds: string[];
}

export interface EndogenousSeaChannel {
    id: string;
    positiveFieldId: string;
    negativeFieldId: string;
}

export interface EndogenousCausalProjection {
    channels: Array<{
        channelId: string;
        positiveWeight: ExactValue;
        negativeWeight: ExactValue;
    }>;
    intrinsicViability: ExactValue;
    objective: {
        id: string;
        fieldId: string;
        direction: "maximize" | "minimize" | "stabilize";
        weight: ExactValue;
        targetValue?: ExactValue;
    };
}

export interface EndogenousSchemaGraph {
    fields: EndogenousFieldTemplate[];
    protectedFieldIds: string[];
    ports: string[];
    seaChannels: EndogenousSeaChannel[];
    selfIdentity: EndogenousPredicateTemplate;
    internalLaws: EndogenousInternalLawTemplate[];
    emergenceCriteria: EndogenousEmergenceTemplate[];
    causalProjection?: EndogenousCausalProjection;
}

export interface EndogenousWorldSchema extends EndogenousSchemaGraph {
    id: string;
}

export interface EndogenousRootSeed {
    id: string;
    schemaId: string;
    values: Record<string, ExactValue>;
}

export interface EndogenousRelationPredicateBindingTemplate {
    parameterName: string;
    endpoint: "parent" | "child";
    fieldId: string;
}

export interface EndogenousRelationPredicateTemplate {
    id: string;
    query: EndogenousQueryTemplate;
    fieldParameters: EndogenousRelationPredicateBindingTemplate[];
}

export interface EndogenousSeaRelationAction {
    parentChannelId: string;
    childChannelId: string;
    parentNegativeResidue: ExactValue;
    childPositivePlacement: ExactValue;
}

export interface EndogenousRelationTransport {
    sourceFieldId: string;
    targetFieldId: string;
}

export interface EndogenousLawEffectValueTransformation {
    lawId: string;
    effectIndex: number;
    value: EndogenousQueryTemplate;
}

export interface EndogenousSchemaTransformation {
    id: string;
    replaceGraph?: EndogenousSchemaGraph;
    removeLawIds?: string[];
    upsertLaws?: EndogenousInternalLawTemplate[];
    effectValues?: EndogenousLawEffectValueTransformation[];
}

export interface EndogenousWorldConstructor {
    id: string;
    parentSchemaId: string;
    childSchemaId: string;
    coordinates:
        | { kind: "finite"; size: string }
        | { kind: "natural" };
    admission: EndogenousPredicateTemplate;
    parentPortId: string;
    childPortId: string;
    relationIdentity: EndogenousRelationPredicateTemplate;
    transports: EndogenousRelationTransport[];
    seaActions: EndogenousSeaRelationAction[];
    schemaTransformation?: EndogenousSchemaTransformation;
}

// ---- Multiversal sea medium placement (v0.5.10; see docs/architecture/v0.5.10-multiversal-sea-medium.md) ----

/**
 * Under a sea medium, the world's local sea fields that the medium exchanges with: the kernel's `seaCoupling`
 * fields, which the endogenous compiler realizes as the causal projection coordinates. Internal-law guards,
 * emergence predicates, and exchange guards may bind them; nothing else may write them.
 */
export const ENDOGENOUS_MEDIUM_SEA_FIELD_IDS: Readonly<Record<CausalSeaQuantity, string>> = {
    negative: "projection.negative",
    positive: "projection.positive",
};

export interface EndogenousSeaQuantities {
    negative: ExactValue;
    positive: ExactValue;
}

export interface EndogenousSeaRootRegion extends EndogenousSeaQuantities {
    rootId: string;
}

/**
 * `self` is the instantiating world's medium-coupled sea field for the exchanged quantity, `own-region` its own
 * placement region, and `parent-region` its parent's placement region (generated worlds only).
 */
export type EndogenousSeaEndpointTemplate = "self" | "own-region" | "parent-region";

export interface EndogenousSeaRegionBindingTemplate {
    parameterName: string;
    region: "own-region" | "parent-region";
    quantity: CausalSeaQuantity;
}

/** A total typed query over the world's own fields (when `self` is an endpoint) and the endpoint regions. */
export interface EndogenousSeaExchangeGuardTemplate extends EndogenousPredicateTemplate {
    regionParameters: EndogenousSeaRegionBindingTemplate[];
}

export interface EndogenousSeaExchangeTemplate {
    id: string;
    quantity: CausalSeaQuantity;
    from: EndogenousSeaEndpointTemplate;
    to: EndogenousSeaEndpointTemplate;
    amount: ExactValue;
    guard: EndogenousSeaExchangeGuardTemplate;
}

/**
 * The shared medium every materialized world of the universe is placed in. Placement follows lineage: every
 * world has its own region, and a generated world's region is adjacent to its parent's region. Every
 * collection is read as a set, so declaration order never changes identity or instantiation.
 */
export interface EndogenousSeaMediumDeclaration {
    id: string;
    closure: "closed" | "open";
    rootRegions: EndogenousSeaRootRegion[];
    childRegionInitial: EndogenousSeaQuantities;
    exchangeTemplates: EndogenousSeaExchangeTemplate[];
}

export interface EndogenousUniverseProgram {
    mode: "bubble-endogenous-connected-universe-program.v1";
    formal: IntensionalSystem;
    schemas: EndogenousWorldSchema[];
    roots: EndogenousRootSeed[];
    constructors: EndogenousWorldConstructor[];
    /** Absent means local seas only, exactly as before the medium. */
    seaMedium?: EndogenousSeaMediumDeclaration;
    order: {
        kind: "causal-partial-order";
        universalClock: false;
    };
}

export interface EndogenousUniverseOptions {
    maxDepth?: number;
    maxWorlds?: number;
    naturalCoordinateLimit?: number;
    evaluationBudgetPerQuery?: number;
}

export interface ResolvedEndogenousUniverseOptions {
    maxDepth: number;
    maxWorlds: number;
    naturalCoordinateLimit: number;
    evaluationBudgetPerQuery: number;
}

export interface EndogenousLineageSegment {
    constructorId: string;
    coordinate: string;
}

export interface EndogenousWorldAddress {
    rootId: string;
    lineage: EndogenousLineageSegment[];
}

export interface EndogenousSchemaTransformationEvaluation {
    lawId: string;
    effectIndex: number;
    query: IntensionalCoordinateQuery;
    value: ExactValue;
    proofDigest: string;
}

export interface EndogenousLawSetChange {
    requestedRemovalIds: string[];
    removedLawIds: string[];
    upsertedLawIds: string[];
    addedLawIds: string[];
    replacedLawIds: string[];
    sourceLawIds: string[];
    targetLawIds: string[];
}

export interface EndogenousSchemaGraphChange {
    sourceGraphDigest: string;
    targetGraphDigest: string;
    replacementApplied: boolean;
    changedComponents: Array<keyof EndogenousSchemaGraph>;
}

export interface EndogenousGeneratedSchemaRevision extends EndogenousSchemaGraph {
    id: string;
    baseSchemaId: string;
    sourceRevisionId?: string;
    transformedBy?: {
        eventId: string;
        constructorId: string;
        transformationId: string;
        graphChange: EndogenousSchemaGraphChange;
        lawSetChange: EndogenousLawSetChange;
        evaluations: EndogenousSchemaTransformationEvaluation[];
        hostSelection: false;
    };
}

export interface EndogenousGeneratedWorld {
    id: string;
    schemaId: string;
    address: EndogenousWorldAddress;
    parentWorldId?: string;
    generatedByEventId?: string;
    schemaRevision: EndogenousGeneratedSchemaRevision;
    fields: Record<string, ExactValue>;
    initializerQueries: Record<string, IntensionalCoordinateQuery>;
    seaChannels: Array<{
        id: string;
        positiveFieldId: string;
        negativeFieldId: string;
        positive: ExactValue;
        negative: ExactValue;
    }>;
}

export interface EndogenousGeneratedIdentityPredicate {
    id: string;
    query: IntensionalCoordinateQuery;
    fieldParameters: Array<{
        parameterName: string;
        worldId: string;
        fieldId: string;
    }>;
}

export interface EndogenousGeneratedAnchor {
    id: string;
    kind: "world-identity" | "generated-relation";
    constructorId?: string;
    schemaTransformationEventId?: string;
    endpoints: Array<{ worldId: string; portId: string }>;
    identityPredicates: EndogenousGeneratedIdentityPredicate[];
    transports: EndogenousGeneratedRelationTransport[];
    seaActions: EndogenousSeaRelationAction[];
    hostSelection: false;
}

export interface EndogenousGeneratedRelationTransport {
    id: string;
    source: { worldId: string; fieldId: string; value: ExactValue };
    target: { worldId: string; fieldId: string; before: ExactValue; after: ExactValue };
    hostSelection: false;
}

export interface EndogenousGenerationEvent {
    id: string;
    constructorId: string;
    coordinate: string;
    parentWorldId: string;
    childWorldId: string;
    transportIds: string[];
    schemaTransformationEventId?: string;
    causes: string[];
    hostSelection: false;
}

export interface EndogenousSchemaTransformationEvent {
    id: string;
    constructorId: string;
    transformationId: string;
    parentWorldId: string;
    childWorldId: string;
    sourceRevisionId: string;
    targetRevisionId: string;
    graphChange: EndogenousSchemaGraphChange;
    lawSetChange: EndogenousLawSetChange;
    evaluations: EndogenousSchemaTransformationEvaluation[];
    causes: string[];
    hostSelection: false;
}

export interface EndogenousGenerationFrontier {
    kind:
        | "depth-boundary"
        | "natural-open"
        | "world-budget"
        | "root-world-budget"
        | "admission-undetermined"
        | "admission-closed"
        | "sibling-admission-pending"
        | "schema-transformation-undetermined";
    /** Absent only for a root-world-budget frontier, which has no parent world or constructor. */
    parentWorldId?: string;
    constructorId?: string;
    rootId?: string;
    coordinate?: string;
    reason: string;
}

export interface EndogenousDiagnostic {
    code: string;
    severity: "error";
    path: string;
    message: string;
}

export interface EndogenousSeaRegionState extends EndogenousSeaQuantities {
    id: string;
    /** The world this region was created for; its id is derived from that world's id. */
    worldId: string;
    /** Events, qualified by their causal-generation closure, that last changed each quantity. */
    causes: Record<CausalSeaQuantity, string[]>;
}

export interface EndogenousSeaPlacementState {
    worldId: string;
    regionId: string;
    /**
     * Signed net quantity this world's medium-coupled sea fields have exchanged with the medium. The coupled
     * field is the world's channel projection plus this amount.
     */
    exchanged: EndogenousSeaQuantities;
}

export interface EndogenousSeaAdjacencyState {
    id: string;
    parentWorldId: string;
    childWorldId: string;
    regionIds: string[];
}

/** The medium state a demanded slice (and every branch-indexed universe) carries. */
export interface EndogenousSeaMediumMaterialization {
    id: string;
    closure: "closed" | "open";
    regions: EndogenousSeaRegionState[];
    placements: EndogenousSeaPlacementState[];
    adjacency: EndogenousSeaAdjacencyState[];
}

export interface EndogenousUniverseMaterialization {
    mode: "bubble-endogenous-connected-universe-materialization.v1";
    programDigest: string;
    status: "resolved" | "undetermined" | "contradicted";
    reason: string;
    options: ResolvedEndogenousUniverseOptions;
    diagnostics: EndogenousDiagnostic[];
    worlds: EndogenousGeneratedWorld[];
    anchors: EndogenousGeneratedAnchor[];
    generationEvents: EndogenousGenerationEvent[];
    schemaTransformationEvents: EndogenousSchemaTransformationEvent[];
    /** Present only when the program declares a sea medium. */
    seaMedium?: EndogenousSeaMediumMaterialization;
    frontiers: EndogenousGenerationFrontier[];
    formalProof: IntensionalProofStep[];
    coverage: {
        demandedSliceComplete: boolean;
        exhaustiveUniverse: boolean;
        latentContinuationPreserved: boolean;
    };
    resourceUse: {
        worldCount: number;
        anchorCount: number;
        generationEventCount: number;
        schemaTransformationEventCount: number;
        formalEvaluationSteps: number;
    };
}

export interface CompiledEndogenousUniverse {
    program: ExecutableAnchoredCausalProgram;
    fieldOverrides: Record<string, ExactValue>;
    fieldOverrideCauses: Record<string, string[]>;
    /** Present only under a sea medium: the region quantities and causes this realization continues from. */
    seaRegionOverrides?: Record<string, EndogenousSeaQuantities>;
    seaRegionOverrideCauses?: Record<string, string[]>;
}

export interface EndogenousUniverseContinuationInput {
    materialization: EndogenousUniverseMaterialization;
    worldStates: Array<{
        worldId: string;
        fields: Record<string, ExactValue>;
    }>;
    /**
     * Required under a sea medium: the realized quantity of every existing region and, for each quantity a
     * realization changed, the (closure-qualified) events that last changed it. An omitted cause list keeps
     * the region's previous causes.
     */
    seaRegions?: Array<EndogenousSeaQuantities & {
        id: string;
        causes?: Partial<Record<CausalSeaQuantity, string[]>>;
    }>;
}

function stableStringify(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

export function digestEndogenousValue(value: unknown): string {
    return createHash("sha256").update(stableStringify(value)).digest("hex");
}

const SEA_QUANTITIES: readonly CausalSeaQuantity[] = ["negative", "positive"];

function byParameterName<T extends { parameterName: string }>(left: T, right: T): number {
    return compareCanonicalStrings(left.parameterName, right.parameterName);
}

/**
 * The medium declaration read as sets: every collection in canonical order. Malformed collections are left
 * as declared, so a program can be digested before validation reports them.
 */
function normalizeSeaMediumDeclaration(medium: EndogenousSeaMediumDeclaration): EndogenousSeaMediumDeclaration {
    const sortedBindings = <T extends { parameterName: string }>(bindings: T[]): T[] => (
        Array.isArray(bindings) ? [...bindings].sort(byParameterName) : bindings
    );
    return {
        id: medium.id,
        closure: medium.closure,
        rootRegions: Array.isArray(medium.rootRegions)
            ? structuredClone(medium.rootRegions).sort((left, right) => compareCanonicalStrings(String(left.rootId), String(right.rootId)))
            : structuredClone(medium.rootRegions),
        childRegionInitial: structuredClone(medium.childRegionInitial),
        exchangeTemplates: Array.isArray(medium.exchangeTemplates)
            ? structuredClone(medium.exchangeTemplates)
                .map((template) => (template?.guard && typeof template.guard === "object" ? {
                    ...template,
                    guard: {
                        ...template.guard,
                        fieldParameters: sortedBindings(template.guard.fieldParameters),
                        regionParameters: sortedBindings(template.guard.regionParameters),
                    },
                } : template))
                .sort((left, right) => compareCanonicalStrings(String(left?.id), String(right?.id)))
            : structuredClone(medium.exchangeTemplates),
    };
}

/**
 * The identity of an endogenous program. A program without a sea medium digests exactly as before; a medium
 * declaration contributes in canonical set order, so reordering its regions or templates is the same program.
 */
export function digestEndogenousProgram(program: EndogenousUniverseProgram): string {
    const { seaMedium, ...rest } = program;
    // Only an absent medium digests like a medium-free program; any other value, even null, keeps its identity.
    if (seaMedium === undefined) return digestEndogenousValue(rest);
    return digestEndogenousValue(seaMedium && typeof seaMedium === "object"
        ? { ...rest, seaMedium: normalizeSeaMediumDeclaration(seaMedium) }
        : program);
}

function issue(code: string, path: string, message: string): EndogenousDiagnostic {
    return { code, severity: "error", path, message };
}

function duplicates(values: string[]): string[] {
    const seen = new Set<string>();
    const repeated = new Set<string>();
    for (const value of values) {
        if (seen.has(value)) repeated.add(value);
        seen.add(value);
    }
    return [...repeated].sort();
}

function nonNegativeRational(value: ExactValue): boolean {
    const normalized = normalizeExactValue(value);
    return normalized?.kind === "rational"
        && (compareExactRationals(normalized, exact.integer(0)) ?? -1) >= 0;
}

function positiveRational(value: ExactValue): boolean {
    const normalized = normalizeExactValue(value);
    return normalized?.kind === "rational"
        && (compareExactRationals(normalized, exact.integer(0)) ?? 0) > 0;
}

function fieldById(schema: EndogenousSchemaGraph, fieldId: string): EndogenousFieldTemplate | undefined {
    return schema.fields.find((field) => field.id === fieldId);
}

interface QueryValidationContext {
    boundParameterKinds?: Map<string, IntensionalValueKind | undefined>;
    parentSchemas?: EndogenousWorldSchema[];
    reachableRoots: EndogenousRootSeed[];
}

function sameNames(actual: string[], expected: string[]): boolean {
    if (actual.length !== expected.length) return false;
    const sortedActual = [...actual].sort();
    const sortedExpected = [...expected].sort();
    return sortedActual.every((name, index) => name === sortedExpected[index]);
}

function fieldValueKind(
    schema: EndogenousWorldSchema,
    fieldId: string,
    families: Map<string, IntensionalFamilyDefinition>,
): IntensionalValueKind | undefined {
    const field = fieldById(schema, fieldId);
    return field ? families.get(field.familyId)?.valueKind : undefined;
}

function validateIndexSource(
    source: EndogenousIndexSource,
    axis: IntensionalFamilyDefinition["domain"]["axes"][number],
    path: string,
    diagnostics: EndogenousDiagnostic[],
): void {
    if (source.kind !== "literal") return;
    if (!/^-?(0|[1-9][0-9]*)$/.test(source.value)) {
        diagnostics.push(issue("EGU052", path, "literal coordinate source must be an exact integer"));
        return;
    }
    const coordinate = BigInt(source.value);
    if (axis.kind === "natural" && coordinate < 0n) {
        diagnostics.push(issue("EGU052", path, "natural-axis coordinate cannot be negative"));
    }
    if (axis.kind === "finite" && (coordinate < 0n || coordinate >= BigInt(axis.size))) {
        diagnostics.push(issue("EGU052", path, `coordinate lies outside finite axis '${axis.name}'`));
    }
}

function validateValueSource(
    source: EndogenousValueSource,
    expectedKind: IntensionalValueKind,
    path: string,
    context: QueryValidationContext,
    families: Map<string, IntensionalFamilyDefinition>,
    diagnostics: EndogenousDiagnostic[],
): void {
    let actualKinds: IntensionalValueKind[] = [];
    if (source.kind === "literal") {
        const value = normalizeExactValue(source.value);
        if (!value) {
            diagnostics.push(issue("EGU052", path, "literal parameter source must be an exact value"));
            return;
        }
        actualKinds = [value.kind];
    } else if (source.kind === "lineage-depth" || source.kind === "local-coordinate") {
        actualKinds = ["rational"];
    } else if (source.kind === "root-id") {
        actualKinds = ["symbol"];
    } else if (source.kind === "seed") {
        if (!IDENTIFIER.test(source.name)) {
            diagnostics.push(issue("EGU052", path, `seed source '${source.name}' needs a stable name`));
            return;
        }
        if (context.reachableRoots.length === 0) return;
        for (const root of context.reachableRoots) {
            const value = normalizeExactValue(root.values[source.name]!);
            if (!value) {
                diagnostics.push(issue("EGU052", path, `seed source '${source.name}' is absent from reachable root '${root.id}'`));
                return;
            }
            actualKinds.push(value.kind);
        }
    } else {
        if (!context.parentSchemas || context.parentSchemas.length === 0) {
            diagnostics.push(issue("EGU055", path, "parent-field source is unavailable in this query context"));
            return;
        }
        for (const parentSchema of context.parentSchemas) {
            const kind = fieldValueKind(parentSchema, source.fieldId, families);
            if (!kind) {
                diagnostics.push(issue("EGU052", path, `parent field '${source.fieldId}' is unavailable on schema '${parentSchema.id}'`));
                return;
            }
            actualKinds.push(kind);
        }
    }
    if (actualKinds.some((kind) => kind !== expectedKind)) {
        diagnostics.push(issue("EGU053", path, `parameter source must have exact kind '${expectedKind}'`));
    }
}

function validateQueryTemplate(
    query: EndogenousQueryTemplate,
    path: string,
    program: EndogenousUniverseProgram,
    context: QueryValidationContext,
    diagnostics: EndogenousDiagnostic[],
): IntensionalFamilyDefinition | undefined {
    const families = new Map(program.formal.families.map((family) => [family.id, family]));
    const family = families.get(query.familyId);
    if (!family) {
        diagnostics.push(issue("EGU048", `${path}.familyId`, `unknown query family '${query.familyId}'`));
        return undefined;
    }

    const actualAxes = Object.keys(query.at);
    const expectedAxes = family.domain.axes.map((axis) => axis.name);
    if (!sameNames(actualAxes, expectedAxes)) {
        diagnostics.push(issue("EGU049", `${path}.at`, `query axes must exactly match [${expectedAxes.join(", ")}]`));
    }
    for (const axis of family.domain.axes) {
        const source = query.at[axis.name];
        if (source) validateIndexSource(source, axis, `${path}.at.${axis.name}`, diagnostics);
    }

    const boundKinds = context.boundParameterKinds ?? new Map<string, IntensionalValueKind | undefined>();
    const directNames = Object.keys(query.parameters);
    const overlap = directNames.filter((name) => boundKinds.has(name));
    for (const name of overlap) {
        diagnostics.push(issue("EGU050", `${path}.parameters.${name}`, `parameter '${name}' is supplied by both query source and field binding`));
    }
    const actualParameters = [...new Set([...directNames, ...boundKinds.keys()])];
    const expectedParameters = family.parameters.map((parameter) => parameter.name);
    if (!sameNames(actualParameters, expectedParameters)) {
        diagnostics.push(issue("EGU051", `${path}.parameters`, `query parameters must exactly match [${expectedParameters.join(", ")}]`));
    }
    for (const parameter of family.parameters) {
        const source = query.parameters[parameter.name];
        if (source) {
            validateValueSource(source, parameter.valueKind, `${path}.parameters.${parameter.name}`, context, families, diagnostics);
        }
        if (boundKinds.has(parameter.name) && boundKinds.get(parameter.name) !== parameter.valueKind) {
            diagnostics.push(issue("EGU054", `${path}.fieldParameters.${parameter.name}`, `field binding must have exact kind '${parameter.valueKind}'`));
        }
    }
    return family;
}

/** Under a sea medium, a world with a causal projection exposes its medium-coupled sea fields to its own guards. */
function mediumSeaFieldsReadable(program: EndogenousUniverseProgram, schema: EndogenousSchemaGraph): boolean {
    return !!program.seaMedium && !!schema.causalProjection;
}

function isMediumSeaFieldId(fieldId: string): boolean {
    return SEA_QUANTITIES.some((quantity) => ENDOGENOUS_MEDIUM_SEA_FIELD_IDS[quantity] === fieldId);
}

function validatePredicateTemplate(
    predicate: EndogenousPredicateTemplate,
    path: string,
    schema: EndogenousWorldSchema,
    program: EndogenousUniverseProgram,
    diagnostics: EndogenousDiagnostic[],
    reachableRoots: EndogenousRootSeed[],
    parentSchemas?: EndogenousWorldSchema[],
    mediumSeaFields = false,
): void {
    if (!IDENTIFIER.test(predicate.id)) diagnostics.push(issue("EGU020", `${path}.id`, "predicate id must be stable"));
    const families = new Map(program.formal.families.map((family) => [family.id, family]));
    const mediumField = (fieldId: string): boolean => mediumSeaFields && isMediumSeaFieldId(fieldId);
    const boundParameterKinds = new Map<string, IntensionalValueKind | undefined>();
    for (const binding of predicate.fieldParameters) {
        boundParameterKinds.set(
            binding.parameterName,
            mediumField(binding.fieldId) ? "rational" : fieldValueKind(schema, binding.fieldId, families),
        );
    }
    const family = validateQueryTemplate(predicate.query, `${path}.query`, program, {
        boundParameterKinds,
        parentSchemas,
        reachableRoots,
    }, diagnostics);
    if (family?.valueKind !== "boolean") diagnostics.push(issue("EGU021", `${path}.query.familyId`, "predicate family must be boolean"));
    duplicates(predicate.fieldParameters.map((binding) => binding.parameterName)).forEach((name) => diagnostics.push(
        issue("EGU022", `${path}.fieldParameters`, `duplicate field parameter '${name}'`),
    ));
    for (const binding of predicate.fieldParameters) {
        if (!fieldById(schema, binding.fieldId) && !mediumField(binding.fieldId)) {
            diagnostics.push(issue("EGU023", `${path}.fieldParameters`, `unknown local field '${binding.fieldId}'`));
        }
    }
}

function inverseLawEffectMatches(effect: CausalFieldEffect, inverse: CausalFieldEffect): boolean {
    return effect.fieldId === inverse.fieldId
        && exactValuesEqual(effect.value, inverse.value)
        && ((effect.operation === "add" && inverse.operation === "subtract")
            || (effect.operation === "subtract" && inverse.operation === "add"));
}

function validateInternalLawEffects(
    effects: CausalFieldEffect[],
    path: string,
    schema: EndogenousWorldSchema,
    families: Map<string, IntensionalFamilyDefinition>,
    diagnostics: EndogenousDiagnostic[],
    requireNonEmpty: boolean,
): void {
    if (requireNonEmpty && effects.length === 0) {
        diagnostics.push(issue("EGU018", path, "local continuation law needs a material field effect"));
    }
    duplicates(effects.map((effect) => effect.fieldId)).forEach((fieldId) => diagnostics.push(
        issue("EGU064", path, `one internal law cannot affect field '${fieldId}' more than once`),
    ));
    for (const [effectIndex, effect] of effects.entries()) {
        const effectPath = `${path}[${effectIndex}]`;
        const field = fieldById(schema, effect.fieldId);
        if (!field) {
            diagnostics.push(issue("EGU019", `${effectPath}.fieldId`, `unknown field '${effect.fieldId}'`));
            continue;
        }
        const value = normalizeExactValue(effect.value);
        const fieldKind = families.get(field.familyId)?.valueKind;
        if (!value || (fieldKind && value.kind !== fieldKind)) {
            diagnostics.push(issue("EGU065", `${effectPath}.value`, `law effect must have the field's exact '${fieldKind ?? "declared"}' kind`));
        }
        if (!(effect.operation === "add" || effect.operation === "subtract" || effect.operation === "set")) {
            diagnostics.push(issue("EGU065", `${effectPath}.operation`, `unsupported law effect operation '${String(effect.operation)}'`));
        } else if (effect.operation !== "set" && fieldKind !== "rational") {
            diagnostics.push(issue("EGU065", `${effectPath}.operation`, "add and subtract require an exact rational field"));
        }
    }
}

function validateInternalLawTemplate(
    law: EndogenousInternalLawTemplate,
    path: string,
    schema: EndogenousWorldSchema,
    program: EndogenousUniverseProgram,
    diagnostics: EndogenousDiagnostic[],
    reachableRoots: EndogenousRootSeed[],
): void {
    const families = new Map(program.formal.families.map((family) => [family.id, family]));
    if (!IDENTIFIER.test(law.id)
        || law.application !== "once-per-realization"
        || (law.reversibility !== "reversible" && law.reversibility !== "irreversible")) {
        diagnostics.push(issue("EGU063", path, "internal law needs a stable id, supported application, and explicit reversibility"));
    }
    validatePredicateTemplate(
        law.guard,
        `${path}.guard`,
        schema,
        program,
        diagnostics,
        reachableRoots,
        undefined,
        mediumSeaFieldsReadable(program, schema),
    );
    validateInternalLawEffects(law.effects, `${path}.effects`, schema, families, diagnostics, true);
    if (law.reversibility === "reversible") {
        if (!law.inverseEffects || law.inverseEffects.length !== law.effects.length) {
            diagnostics.push(issue("EGU066", `${path}.inverseEffects`, "reversible law needs one exact additive inverse per effect"));
        } else {
            validateInternalLawEffects(law.inverseEffects, `${path}.inverseEffects`, schema, families, diagnostics, true);
            const unmatched = [...law.inverseEffects];
            for (const effect of law.effects) {
                const inverseIndex = unmatched.findIndex((inverse) => inverseLawEffectMatches(effect, inverse));
                if (inverseIndex < 0) {
                    diagnostics.push(issue("EGU066", `${path}.inverseEffects`, `effect on '${effect.fieldId}' lacks an exact inverse`));
                } else {
                    unmatched.splice(inverseIndex, 1);
                }
            }
        }
    } else if (law.inverseEffects?.length) {
        diagnostics.push(issue("EGU066", `${path}.inverseEffects`, "irreversible law must not claim an inverse"));
    }
    duplicates(law.commitAffectedFieldIds ?? []).forEach((fieldId) => diagnostics.push(
        issue("EGU067", `${path}.commitAffectedFieldIds`, `duplicate committed field '${fieldId}'`),
    ));
    for (const fieldId of law.commitAffectedFieldIds ?? []) {
        if (!fieldById(schema, fieldId)) {
            diagnostics.push(issue("EGU067", `${path}.commitAffectedFieldIds`, `unknown committed field '${fieldId}'`));
        }
    }
    if ((law.commitAffectedFieldIds?.length ?? 0) > 0 && law.reversibility !== "irreversible") {
        diagnostics.push(issue("EGU067", path, "a history-committing law must be irreversible"));
    }
}

function validateSchemaGraphDefinition(
    schema: EndogenousWorldSchema,
    path: string,
    program: EndogenousUniverseProgram,
    diagnostics: EndogenousDiagnostic[],
    reachableRoots: EndogenousRootSeed[],
    parentSchemas?: EndogenousWorldSchema[],
): void {
    const families = new Map(program.formal.families.map((family) => [family.id, family]));
    if (schema.fields.length === 0) diagnostics.push(issue("EGU009", `${path}.fields`, "schema needs exact fields"));
    duplicates(schema.fields.map((field) => field.id)).forEach((id) => diagnostics.push(issue("EGU010", `${path}.fields`, `duplicate field '${id}'`)));
    duplicates(schema.ports).forEach((id) => diagnostics.push(issue("EGU011", `${path}.ports`, `duplicate port '${id}'`)));
    if (schema.ports.length === 0) diagnostics.push(issue("EGU040", `${path}.ports`, "schema identity needs at least one stable anchor port"));
    for (const [portIndex, portId] of schema.ports.entries()) {
        if (!IDENTIFIER.test(portId)) diagnostics.push(issue("EGU041", `${path}.ports[${portIndex}]`, "anchor port id must be stable"));
    }
    for (const [fieldIndex, field] of schema.fields.entries()) {
        if (!IDENTIFIER.test(field.id)) diagnostics.push(issue("EGU012", `${path}.fields[${fieldIndex}].id`, "field id must be stable"));
        if (!["world-state", "world-condition", "structural-state", "identity-state", "memory-state", "boundary-state", "positive-sea", "negative-sea", "viability"].includes(field.role)) {
            diagnostics.push(issue("EGU074", `${path}.fields[${fieldIndex}].role`, `unknown causal field role '${String(field.role)}'`));
        }
        const family = families.get(field.familyId);
        if (!family || field.initializer.familyId !== field.familyId) {
            diagnostics.push(issue("EGU013", `${path}.fields[${fieldIndex}]`, "field initializer must query its declared family"));
        }
        validateQueryTemplate(field.initializer, `${path}.fields[${fieldIndex}].initializer`, program, {
            parentSchemas,
            reachableRoots,
        }, diagnostics);
    }
    duplicates(schema.protectedFieldIds).forEach((fieldId) => diagnostics.push(
        issue("EGU070", `${path}.protectedFieldIds`, `duplicate protected field '${fieldId}'`),
    ));
    for (const fieldId of schema.protectedFieldIds) {
        if (!fieldById(schema, fieldId)) diagnostics.push(issue("EGU014", `${path}.protectedFieldIds`, `unknown protected field '${fieldId}'`));
    }
    duplicates(schema.seaChannels.map((channel) => channel.id)).forEach((id) => diagnostics.push(issue("EGU015", `${path}.seaChannels`, `duplicate sea channel '${id}'`)));
    for (const [channelIndex, channel] of schema.seaChannels.entries()) {
        if (!IDENTIFIER.test(channel.id)) diagnostics.push(issue("EGU075", `${path}.seaChannels[${channelIndex}].id`, "sea channel id must be stable"));
        const positive = fieldById(schema, channel.positiveFieldId);
        const negative = fieldById(schema, channel.negativeFieldId);
        if (positive?.role !== "positive-sea" || families.get(positive.familyId)?.valueKind !== "rational") {
            diagnostics.push(issue("EGU016", `${path}.seaChannels[${channelIndex}].positiveFieldId`, "positive channel field must be exact rational positive-sea"));
        }
        if (negative?.role !== "negative-sea" || families.get(negative.familyId)?.valueKind !== "rational") {
            diagnostics.push(issue("EGU017", `${path}.seaChannels[${channelIndex}].negativeFieldId`, "negative channel field must be exact rational negative-sea"));
        }
    }
    validatePredicateTemplate(schema.selfIdentity, `${path}.selfIdentity`, schema, program, diagnostics, reachableRoots);
    duplicates(schema.internalLaws.map((law) => law.id)).forEach((id) => diagnostics.push(
        issue("EGU062", `${path}.internalLaws`, `duplicate internal law '${id}' prevents stable schema revision identity`),
    ));
    for (const [lawIndex, law] of schema.internalLaws.entries()) {
        validateInternalLawTemplate(law, `${path}.internalLaws[${lawIndex}]`, schema, program, diagnostics, reachableRoots);
    }
    duplicates(schema.emergenceCriteria.map((criterion) => criterion.id)).forEach((id) => diagnostics.push(
        issue("EGU071", `${path}.emergenceCriteria`, `duplicate emergence criterion '${id}'`),
    ));
    for (const [criterionIndex, criterion] of schema.emergenceCriteria.entries()) {
        const criterionPath = `${path}.emergenceCriteria[${criterionIndex}]`;
        if (!IDENTIFIER.test(criterion.id)) diagnostics.push(issue("EGU071", `${criterionPath}.id`, "emergence criterion id must be stable"));
        validatePredicateTemplate(
            criterion.predicate,
            `${criterionPath}.predicate`,
            schema,
            program,
            diagnostics,
            reachableRoots,
            undefined,
            mediumSeaFieldsReadable(program, schema),
        );
        duplicates(criterion.witnessFieldIds).forEach((fieldId) => diagnostics.push(
            issue("EGU072", `${criterionPath}.witnessFieldIds`, `duplicate emergence witness '${fieldId}'`),
        ));
        for (const fieldId of criterion.witnessFieldIds) {
            if (!fieldById(schema, fieldId)) diagnostics.push(issue("EGU072", `${criterionPath}.witnessFieldIds`, `unknown emergence witness '${fieldId}'`));
        }
    }
    const projection = schema.causalProjection;
    if (projection) {
        if (!nonNegativeRational(projection.intrinsicViability)) diagnostics.push(issue("EGU024", `${path}.causalProjection.intrinsicViability`, "compatibility projection needs non-negative exact intrinsic value"));
        duplicates(projection.channels.map((channel) => channel.channelId)).forEach((channelId) => diagnostics.push(
            issue("EGU073", `${path}.causalProjection.channels`, `duplicate projected sea channel '${channelId}'`),
        ));
        for (const channel of projection.channels) {
            if (!schema.seaChannels.some((candidate) => candidate.id === channel.channelId)) diagnostics.push(issue("EGU025", `${path}.causalProjection.channels`, `unknown sea channel '${channel.channelId}'`));
            if (!nonNegativeRational(channel.positiveWeight) || !nonNegativeRational(channel.negativeWeight)) diagnostics.push(issue("EGU026", `${path}.causalProjection.channels`, "projection weights must be non-negative exact rationals"));
        }
        const objectiveField = fieldById(schema, projection.objective.fieldId);
        if (!objectiveField || families.get(objectiveField.familyId)?.valueKind !== "rational") diagnostics.push(issue("EGU027", `${path}.causalProjection.objective.fieldId`, "compatibility objective needs a local rational field"));
        const objective = projection.objective;
        if (!IDENTIFIER.test(objective.id)
            || !["maximize", "minimize", "stabilize"].includes(objective.direction)
            || !positiveRational(objective.weight)) {
            diagnostics.push(issue("EGU076", `${path}.causalProjection.objective`, "compatibility objective needs a stable id, supported direction, and positive exact weight"));
        }
        const target = objective.targetValue ? normalizeExactValue(objective.targetValue) : undefined;
        if ((objective.direction === "stabilize" && target?.kind !== "rational")
            || (objective.direction !== "stabilize" && objective.targetValue !== undefined)) {
            diagnostics.push(issue("EGU077", `${path}.causalProjection.objective.targetValue`, "only stabilize may declare its required exact rational target"));
        }
    }
}

export function validateEndogenousUniverseProgram(program: EndogenousUniverseProgram): EndogenousDiagnostic[] {
    const diagnostics: EndogenousDiagnostic[] = validateIntensionalSystem(program.formal).map((entry) => ({
        code: `EGU-${entry.code}`,
        severity: "error" as const,
        path: `formal.${entry.path}`,
        message: entry.message,
    }));
    if (program.mode !== "bubble-endogenous-connected-universe-program.v1") {
        diagnostics.push(issue("EGU001", "mode", "unsupported endogenous universe program mode"));
    }
    if (program.order.kind !== "causal-partial-order" || program.order.universalClock !== false) {
        diagnostics.push(issue("EGU002", "order", "generation must preserve causal partial order without a universal clock"));
    }
    if (program.schemas.length === 0) diagnostics.push(issue("EGU003", "schemas", "generation needs at least one world schema"));
    if (program.roots.length === 0) diagnostics.push(issue("EGU004", "roots", "generation needs at least one root seed"));
    duplicates(program.schemas.map((schema) => schema.id)).forEach((id) => diagnostics.push(issue("EGU005", "schemas", `duplicate schema '${id}'`)));
    duplicates(program.roots.map((root) => root.id)).forEach((id) => diagnostics.push(issue("EGU006", "roots", `duplicate root '${id}'`)));
    duplicates(program.constructors.map((constructor) => constructor.id)).forEach((id) => diagnostics.push(issue("EGU007", "constructors", `duplicate constructor '${id}'`)));
    const schemas = new Map(program.schemas.map((schema) => [schema.id, schema]));
    const families = new Map(program.formal.families.map((family) => [family.id, family]));
    const rootsById = new Map(program.roots.map((root) => [root.id, root]));
    const reachableRootIdsBySchema = new Map(program.schemas.map((schema) => [schema.id, new Set<string>()]));
    // A world of schema S can carry S's base graph or any complete replacement graph produced for S by any
    // constructor: a same-schema child inherits whatever revision its parent realized. Every constructor
    // endpoint must therefore close against every such candidate, not only its own replacement.
    const revisionCandidatesBySchema = new Map<string, EndogenousWorldSchema[]>(
        program.schemas.map((schema) => [schema.id, [schema]]),
    );
    for (const constructor of program.constructors) {
        const replacement = constructor.schemaTransformation?.replaceGraph;
        const candidates = revisionCandidatesBySchema.get(constructor.childSchemaId);
        if (!replacement || !candidates) continue;
        const endpoint: EndogenousWorldSchema = { id: constructor.childSchemaId, ...normalizeSchemaGraph(replacement) };
        const endpointDigest = digestEndogenousValue(normalizeSchemaGraph(endpoint));
        if (!candidates.some((candidate) => digestEndogenousValue(normalizeSchemaGraph(candidate)) === endpointDigest)) {
            candidates.push(endpoint);
        }
    }
    const revisionCandidates = (schemaId: string): EndogenousWorldSchema[] => revisionCandidatesBySchema.get(schemaId) ?? [];
    const parentSchemasByChild = new Map<string, EndogenousWorldSchema[]>();
    for (const root of program.roots) reachableRootIdsBySchema.get(root.schemaId)?.add(root.id);
    for (const constructor of program.constructors) {
        const parent = schemas.get(constructor.parentSchemaId);
        const child = schemas.get(constructor.childSchemaId);
        if (!parent || !child) continue;
        const possibleParents = parentSchemasByChild.get(child.id) ?? [];
        for (const candidate of revisionCandidates(parent.id)) {
            if (!possibleParents.includes(candidate)) possibleParents.push(candidate);
        }
        parentSchemasByChild.set(child.id, possibleParents);
    }
    let reachabilityChanged = true;
    while (reachabilityChanged) {
        reachabilityChanged = false;
        for (const constructor of program.constructors) {
            const parentRoots = reachableRootIdsBySchema.get(constructor.parentSchemaId);
            const childRoots = reachableRootIdsBySchema.get(constructor.childSchemaId);
            if (!parentRoots || !childRoots) continue;
            for (const rootId of parentRoots) {
                if (childRoots.has(rootId)) continue;
                childRoots.add(rootId);
                reachabilityChanged = true;
            }
        }
    }
    const reachableRoots = (schemaId: string): EndogenousRootSeed[] => (
        [...(reachableRootIdsBySchema.get(schemaId) ?? [])]
            .map((rootId) => rootsById.get(rootId))
            .filter((root): root is EndogenousRootSeed => !!root)
    );

    for (const [schemaIndex, schema] of program.schemas.entries()) {
        const path = `schemas[${schemaIndex}]`;
        if (!IDENTIFIER.test(schema.id)) diagnostics.push(issue("EGU008", `${path}.id`, "schema id must be stable"));
        validateSchemaGraphDefinition(
            schema,
            path,
            program,
            diagnostics,
            reachableRoots(schema.id),
            program.roots.some((root) => root.schemaId === schema.id)
                ? undefined
                : parentSchemasByChild.get(schema.id),
        );
    }

    for (const [rootIndex, root] of program.roots.entries()) {
        if (!IDENTIFIER.test(root.id)) diagnostics.push(issue("EGU028", `roots[${rootIndex}].id`, "root id must be stable"));
        if (!schemas.has(root.schemaId)) diagnostics.push(issue("EGU029", `roots[${rootIndex}].schemaId`, `unknown schema '${root.schemaId}'`));
        for (const [name, value] of Object.entries(root.values)) {
            if (!IDENTIFIER.test(name) || !normalizeExactValue(value)) diagnostics.push(issue("EGU030", `roots[${rootIndex}].values.${name}`, "seed value needs a stable name and exact value"));
        }
    }

    for (const [constructorIndex, constructor] of program.constructors.entries()) {
        const path = `constructors[${constructorIndex}]`;
        if (!IDENTIFIER.test(constructor.id)) diagnostics.push(issue("EGU031", `${path}.id`, "constructor id must be stable"));
        const parent = schemas.get(constructor.parentSchemaId);
        const child = schemas.get(constructor.childSchemaId);
        if (!parent || !child) {
            diagnostics.push(issue("EGU032", path, "constructor schemas must exist"));
            continue;
        }
        const transformation = constructor.schemaTransformation;
        const childEndpoint: EndogenousWorldSchema = transformation?.replaceGraph
            ? { id: child.id, ...normalizeSchemaGraph(transformation.replaceGraph) }
            : child;
        // Base parent first: admission is validated against it before the other realizable parent revisions.
        const parentEndpoints = revisionCandidates(parent.id);
        // The revision a child actually starts from: its own replacement, the inherited parent revision for a
        // same-schema relation, or the child base graph across schemas.
        const childEndpoints = transformation?.replaceGraph
            ? [childEndpoint]
            : constructor.parentSchemaId === constructor.childSchemaId
                ? revisionCandidates(child.id)
                : [child];
        if (transformation?.replaceGraph) {
            validateSchemaGraphDefinition(
                childEndpoint,
                `${path}.schemaTransformation.replaceGraph`,
                program,
                diagnostics,
                reachableRoots(child.id),
                parentEndpoints,
            );
        }
        if (constructor.coordinates.kind === "finite" && (!/^[1-9][0-9]*$/.test(constructor.coordinates.size))) {
            diagnostics.push(issue("EGU033", `${path}.coordinates.size`, "finite constructor size must be a positive natural"));
        }
        validatePredicateTemplate(
            constructor.admission,
            `${path}.admission`,
            parent,
            program,
            diagnostics,
            reachableRoots(parent.id),
            [parent],
        );
        for (const [revisionIndex, parentEndpoint] of parentEndpoints.slice(1).entries()) {
            validatePredicateTemplate(
                constructor.admission,
                `${path}.admission@revision[${revisionIndex}]`,
                parentEndpoint,
                program,
                diagnostics,
                reachableRoots(parent.id),
                parentEndpoints,
            );
        }
        if (parentEndpoints.some((endpoint) => !endpoint.ports.includes(constructor.parentPortId))
            || childEndpoints.some((endpoint) => !endpoint.ports.includes(constructor.childPortId))) {
            diagnostics.push(issue("EGU034", path, "constructor anchor ports must exist on both schemas"));
        }
        if (!IDENTIFIER.test(constructor.relationIdentity.id)) {
            diagnostics.push(issue("EGU020", `${path}.relationIdentity.id`, "relation predicate id must be stable"));
        }
        duplicates(constructor.relationIdentity.fieldParameters.map((binding) => binding.parameterName)).forEach((name) => diagnostics.push(
            issue("EGU022", `${path}.relationIdentity.fieldParameters`, `duplicate field parameter '${name}'`),
        ));
        const relationBindingKinds = new Map<string, IntensionalValueKind | undefined>();
        for (const binding of constructor.relationIdentity.fieldParameters) {
            const endpointSchemas = binding.endpoint === "parent" ? parentEndpoints : childEndpoints;
            const kinds = endpointSchemas.map((endpoint) => fieldValueKind(endpoint, binding.fieldId, families));
            relationBindingKinds.set(
                binding.parameterName,
                kinds.every((kind) => kind === kinds[0]) ? kinds[0] : undefined,
            );
        }
        const relationFamily = validateQueryTemplate(
            constructor.relationIdentity.query,
            `${path}.relationIdentity.query`,
            program,
            {
                boundParameterKinds: relationBindingKinds,
                parentSchemas: parentEndpoints,
                reachableRoots: reachableRoots(child.id),
            },
            diagnostics,
        );
        if (relationFamily?.valueKind !== "boolean") diagnostics.push(issue("EGU035", `${path}.relationIdentity.query.familyId`, "relation identity family must be boolean"));
        for (const binding of constructor.relationIdentity.fieldParameters) {
            const endpointSchemas = binding.endpoint === "parent" ? parentEndpoints : childEndpoints;
            if (endpointSchemas.some((endpoint) => !fieldById(endpoint, binding.fieldId))) diagnostics.push(issue("EGU036", `${path}.relationIdentity.fieldParameters`, `unknown ${binding.endpoint} field '${binding.fieldId}'`));
        }
        const transports = constructor.transports ?? [];
        duplicates(transports.map((transport) => transport.targetFieldId)).forEach((fieldId) => diagnostics.push(
            issue("EGU042", `${path}.transports`, `generated relation cannot transport twice into child field '${fieldId}'`),
        ));
        for (const [transportIndex, transport] of transports.entries()) {
            const transportPath = `${path}.transports[${transportIndex}]`;
            const sourceFields = parentEndpoints.map((endpoint) => fieldById(endpoint, transport.sourceFieldId));
            const targetFields = childEndpoints.map((endpoint) => fieldById(endpoint, transport.targetFieldId));
            if (sourceFields.some((field) => !field) || targetFields.some((field) => !field)) {
                diagnostics.push(issue("EGU043", transportPath, "relation transport fields must exist at both schema endpoints"));
                continue;
            }
            if (sourceFields.some((sourceField) => targetFields.some((targetField) => (
                families.get(sourceField!.familyId)?.valueKind !== families.get(targetField!.familyId)?.valueKind
            )))) {
                diagnostics.push(issue("EGU044", transportPath, "relation transport endpoints must have the same exact value kind"));
            }
            if (sourceFields.some((sourceField) => ["positive-sea", "negative-sea", "viability"].includes(sourceField!.role))
                || targetFields.some((targetField) => targetField!.role !== "world-condition")
                || childEndpoints.some((endpoint) => endpoint.protectedFieldIds.includes(transport.targetFieldId))) {
                diagnostics.push(issue(
                    "EGU045",
                    transportPath,
                    "relation transport must carry a non-sea payload into an unprotected child world-condition field",
                ));
            }
        }
        if (transformation) {
            const transformationPath = `${path}.schemaTransformation`;
            const removeLawIds = transformation.removeLawIds ?? [];
            const upsertLaws = transformation.upsertLaws ?? [];
            const effectValues = transformation.effectValues ?? [];
            const replacementChangesBase = !!transformation.replaceGraph
                && digestEndogenousValue(normalizeSchemaGraph(child)) !== digestEndogenousValue(normalizeSchemaGraph(childEndpoint));
            if (!IDENTIFIER.test(transformation.id)
                || (!replacementChangesBase && removeLawIds.length + upsertLaws.length + effectValues.length === 0)) {
                diagnostics.push(issue(
                    "EGU056",
                    transformationPath,
                    "schema transformation needs a stable id and a complete graph replacement or law morphism",
                ));
            }
            duplicates(removeLawIds).forEach((lawId) => diagnostics.push(
                issue("EGU068", `${transformationPath}.removeLawIds`, `duplicate law removal '${lawId}'`),
            ));
            for (const lawId of removeLawIds) {
                // Removal is idempotent per realized revision, so it must name a law of at least one source revision.
                if (!childEndpoints.some((endpoint) => endpoint.internalLaws.some((law) => law.id === lawId))) {
                    diagnostics.push(issue("EGU068", `${transformationPath}.removeLawIds`, `unknown base child law removal '${lawId}'`));
                }
            }
            duplicates(upsertLaws.map((law) => law.id)).forEach((lawId) => diagnostics.push(
                issue("EGU069", `${transformationPath}.upsertLaws`, `duplicate law upsert '${lawId}'`),
            ));
            const removed = new Set(removeLawIds);
            for (const [lawIndex, law] of upsertLaws.entries()) {
                if (removed.has(law.id)) {
                    diagnostics.push(issue(
                        "EGU069",
                        `${transformationPath}.upsertLaws[${lawIndex}]`,
                        `law '${law.id}' cannot be removed and upserted by one morphism`,
                    ));
                }
            }
            duplicates(effectValues.map((entry) => `${entry.lawId}:${entry.effectIndex}`)).forEach((target) => diagnostics.push(
                issue("EGU060", `${transformationPath}.effectValues`, `duplicate schema transformation target '${target}'`),
            ));
            const effectValueFamilies = effectValues.map((entry, entryIndex) => validateQueryTemplate(
                entry.value,
                `${transformationPath}.effectValues[${entryIndex}].value`,
                program,
                {
                    parentSchemas: parentEndpoints,
                    reachableRoots: reachableRoots(child.id),
                },
                diagnostics,
            ));
            // The law morphism applies to whichever revision the child starts from, so it must close on each one.
            for (const [candidateIndex, candidate] of childEndpoints.entries()) {
                const revisionSuffix = candidateIndex === 0 ? "" : `@revision[${candidateIndex}]`;
                for (const [lawIndex, law] of upsertLaws.entries()) {
                    validateInternalLawTemplate(
                        law,
                        `${transformationPath}.upsertLaws[${lawIndex}]${revisionSuffix}`,
                        candidate,
                        program,
                        diagnostics,
                        reachableRoots(child.id),
                    );
                }
                const targetLaws = structuredClone(candidate.internalLaws)
                    .filter((law) => !removed.has(law.id));
                for (const law of upsertLaws) {
                    const targetIndex = targetLaws.findIndex((existing) => existing.id === law.id);
                    if (targetIndex < 0) targetLaws.push(structuredClone(law));
                    else targetLaws[targetIndex] = structuredClone(law);
                }
                for (const [entryIndex, entry] of effectValues.entries()) {
                    const entryPath = `${transformationPath}.effectValues[${entryIndex}]${revisionSuffix}`;
                    const law = targetLaws.find((existing) => existing.id === entry.lawId);
                    if (!law) {
                        diagnostics.push(issue("EGU057", `${entryPath}.lawId`, `unknown child internal law '${entry.lawId}'`));
                        continue;
                    }
                    if (law.reversibility !== "irreversible") {
                        diagnostics.push(issue(
                            "EGU058",
                            entryPath,
                            "effect-value transformation is limited to irreversible laws until inverse-law morphisms are represented",
                        ));
                    }
                    if (!Number.isSafeInteger(entry.effectIndex)
                        || entry.effectIndex < 0
                        || entry.effectIndex >= law.effects.length) {
                        diagnostics.push(issue("EGU059", `${entryPath}.effectIndex`, "schema transformation effect index is outside the target law"));
                        continue;
                    }
                    const targetEffect = law.effects[entry.effectIndex]!;
                    const targetField = fieldById(candidate, targetEffect.fieldId);
                    const queryFamily = effectValueFamilies[entryIndex];
                    const targetKind = targetField ? families.get(targetField.familyId)?.valueKind : undefined;
                    if (queryFamily && targetKind && queryFamily.valueKind !== targetKind) {
                        diagnostics.push(issue(
                            "EGU061",
                            `${entryPath}.value.familyId`,
                            `schema transformation must produce the target field's exact '${targetKind}' kind`,
                        ));
                    }
                }
            }
        }
        if (constructor.seaActions.length === 0) diagnostics.push(issue("EGU037", `${path}.seaActions`, "generated relation needs material sea action"));
        for (const action of constructor.seaActions) {
            if (parentEndpoints.some((endpoint) => !endpoint.seaChannels.some((channel) => channel.id === action.parentChannelId))
                || childEndpoints.some((endpoint) => !endpoint.seaChannels.some((channel) => channel.id === action.childChannelId))) {
                diagnostics.push(issue("EGU038", `${path}.seaActions`, "sea action channels must exist at both endpoints"));
            }
            if (!nonNegativeRational(action.parentNegativeResidue) || !nonNegativeRational(action.childPositivePlacement)) {
                diagnostics.push(issue("EGU039", `${path}.seaActions`, "sea action values must be non-negative exact rationals"));
            }
        }
    }
    validateSeaMediumDeclaration(program, revisionCandidates, families, diagnostics);
    return diagnostics;
}

const SEA_FIELD_ROLES: ReadonlySet<CausalFieldRole> = new Set<CausalFieldRole>(["positive-sea", "negative-sea"]);
const SEA_ENDPOINT_TEMPLATES: readonly EndogenousSeaEndpointTemplate[] = ["self", "own-region", "parent-region"];

function isZeroRational(value: ExactValue): boolean {
    const normalized = normalizeExactValue(value);
    return normalized?.kind === "rational" && exactValuesEqual(normalized, exact.integer(0));
}

/**
 * Validates the endogenous medium declaration (EGU2xx). Every collection is read as a set keyed by identity,
 * and every rule mirrors the kernel's medium contract so that no instantiated medium can fail it.
 */
function validateSeaMediumDeclaration(
    program: EndogenousUniverseProgram,
    revisionCandidates: (schemaId: string) => EndogenousWorldSchema[],
    families: Map<string, IntensionalFamilyDefinition>,
    diagnostics: EndogenousDiagnostic[],
): void {
    const medium = program.seaMedium;
    if (medium === undefined) return;
    const shape = medium as unknown as Record<string, unknown> | null;
    if (shape === null || typeof shape !== "object" || Array.isArray(shape)
        || typeof shape.id !== "string" || typeof shape.closure !== "string"
        || !Array.isArray(shape.rootRegions) || !Array.isArray(shape.exchangeTemplates)
        || shape.childRegionInitial === null || typeof shape.childRegionInitial !== "object") {
        diagnostics.push(issue("EGU212", "seaMedium", "a sea medium must be a declaration with id, closure, rootRegions, childRegionInitial, and exchangeTemplates, or absent"));
        return;
    }
    if (!IDENTIFIER.test(medium.id) || medium.id.startsWith("world-") || medium.id.startsWith("region-")) {
        diagnostics.push(issue("EGU200", "seaMedium.id", "sea medium id must be stable and outside the generated world and region namespaces"));
    }
    if (medium.closure !== "closed" && medium.closure !== "open") {
        diagnostics.push(issue("EGU201", "seaMedium.closure", "sea medium closure must be closed or open"));
    }
    const closed = medium.closure === "closed";

    const rootRegions = Array.isArray(medium.rootRegions) ? medium.rootRegions : [];
    if (!Array.isArray(medium.rootRegions)) diagnostics.push(issue("EGU202", "seaMedium.rootRegions", "root regions are declared as a list"));
    duplicates(rootRegions.map((region) => region.rootId)).forEach((rootId) => diagnostics.push(
        issue("EGU202", "seaMedium.rootRegions", `root '${rootId}' has more than one root region`),
    ));
    const rootIds = new Set(program.roots.map((root) => root.id));
    for (const [index, region] of rootRegions.entries()) {
        const regionPath = `seaMedium.rootRegions[${index}]`;
        if (!rootIds.has(region.rootId)) diagnostics.push(issue("EGU202", `${regionPath}.rootId`, `unknown root '${region.rootId}'`));
        for (const quantity of SEA_QUANTITIES) {
            if (!nonNegativeRational(region[quantity])) {
                diagnostics.push(issue("EGU203", `${regionPath}.${quantity}`, `root region ${quantity} quantity must be a non-negative exact rational`));
            }
        }
    }
    for (const root of program.roots) {
        if (!rootRegions.some((region) => region.rootId === root.id)) {
            diagnostics.push(issue("EGU202", "seaMedium.rootRegions", `root '${root.id}' has no root region`));
        }
    }
    for (const quantity of SEA_QUANTITIES) {
        const value = medium.childRegionInitial?.[quantity];
        if (!value || !nonNegativeRational(value)) {
            diagnostics.push(issue("EGU203", `seaMedium.childRegionInitial.${quantity}`, `child region ${quantity} quantity must be a non-negative exact rational`));
        } else if (closed && !isZeroRational(value)) {
            diagnostics.push(issue(
                "EGU204",
                `seaMedium.childRegionInitial.${quantity}`,
                "closed sea medium: a generated region cannot begin with sea quantity created outside the medium",
            ));
        }
    }

    if (closed) {
        // A closed medium is the only source and sink: constructor actions and local laws cannot create sea.
        for (const [constructorIndex, constructor] of program.constructors.entries()) {
            for (const [actionIndex, action] of constructor.seaActions.entries()) {
                if (!isZeroRational(action.parentNegativeResidue) || !isZeroRational(action.childPositivePlacement)) {
                    diagnostics.push(issue(
                        "EGU205",
                        `constructors[${constructorIndex}].seaActions[${actionIndex}]`,
                        `closed sea medium: constructor '${constructor.id}' cannot create parent residue or child placement outside the medium`,
                    ));
                }
            }
        }
        const lawWritesSea = (
            law: EndogenousInternalLawTemplate,
            graphs: EndogenousSchemaGraph[],
            lawPath: string,
        ): void => {
            for (const [name, effects] of [["effects", law.effects], ["inverseEffects", law.inverseEffects ?? []]] as const) {
                for (const [effectIndex, effect] of effects.entries()) {
                    if (graphs.some((graph) => SEA_FIELD_ROLES.has(fieldById(graph, effect.fieldId)?.role as CausalFieldRole))) {
                        diagnostics.push(issue(
                            "EGU206",
                            `${lawPath}.${name}[${effectIndex}]`,
                            `closed sea medium: internal law '${law.id}' cannot write sea field '${effect.fieldId}'`,
                        ));
                    }
                }
            }
        };
        for (const [schemaIndex, schema] of program.schemas.entries()) {
            for (const [lawIndex, law] of schema.internalLaws.entries()) {
                lawWritesSea(law, [schema], `schemas[${schemaIndex}].internalLaws[${lawIndex}]`);
            }
        }
        for (const [constructorIndex, constructor] of program.constructors.entries()) {
            const transformation = constructor.schemaTransformation;
            const transformationPath = `constructors[${constructorIndex}].schemaTransformation`;
            for (const [lawIndex, law] of (transformation?.replaceGraph?.internalLaws ?? []).entries()) {
                lawWritesSea(law, [transformation!.replaceGraph!], `${transformationPath}.replaceGraph.internalLaws[${lawIndex}]`);
            }
            for (const [lawIndex, law] of (transformation?.upsertLaws ?? []).entries()) {
                lawWritesSea(law, revisionCandidates(constructor.childSchemaId), `${transformationPath}.upsertLaws[${lawIndex}]`);
            }
        }
    }

    // Exchange templates are instantiated for every materialized world, so each closes against every revision
    // any world can carry, and its instantiated law id `<worldId>-<templateId>` must not meet an internal law id.
    const candidates = program.schemas.flatMap((schema) => revisionCandidates(schema.id));
    const internalLawIds = new Set([
        ...candidates.flatMap((candidate) => candidate.internalLaws.map((law) => law.id)),
        ...program.constructors.flatMap((constructor) => (constructor.schemaTransformation?.upsertLaws ?? []).map((law) => law.id)),
    ]);
    const templates = Array.isArray(medium.exchangeTemplates) ? medium.exchangeTemplates : [];
    if (!Array.isArray(medium.exchangeTemplates)) {
        diagnostics.push(issue("EGU207", "seaMedium.exchangeTemplates", "exchange templates are declared as a list"));
    }
    duplicates(templates.map((template) => template.id)).forEach((id) => diagnostics.push(
        issue("EGU207", "seaMedium.exchangeTemplates", `duplicate sea exchange template '${id}'`),
    ));
    for (const [index, template] of templates.entries()) {
        const templatePath = `seaMedium.exchangeTemplates[${index}]`;
        if (!IDENTIFIER.test(template.id)) diagnostics.push(issue("EGU207", `${templatePath}.id`, "sea exchange template id must be stable"));
        if (internalLawIds.has(template.id)) {
            diagnostics.push(issue(
                "EGU211",
                `${templatePath}.id`,
                `sea exchange template '${template.id}' shares its id with an internal law; instantiated law ids would collide`,
            ));
        }
        if (!SEA_QUANTITIES.includes(template.quantity)) {
            diagnostics.push(issue("EGU208", `${templatePath}.quantity`, `unknown sea quantity '${String(template.quantity)}'`));
        }
        if (!positiveRational(template.amount)) {
            diagnostics.push(issue("EGU208", `${templatePath}.amount`, "a sea exchange moves an exact positive rational amount"));
        }
        const endpoints = [template.from, template.to];
        if (endpoints.some((endpoint) => !SEA_ENDPOINT_TEMPLATES.includes(endpoint))) {
            diagnostics.push(issue("EGU209", templatePath, "sea exchange endpoints are self, own-region, or parent-region"));
        } else if (template.from === template.to) {
            diagnostics.push(issue("EGU209", templatePath, "a sea exchange must move quantity between two distinct endpoints"));
        } else if (endpoints.includes("self") && endpoints.includes("parent-region")) {
            diagnostics.push(issue(
                "EGU209",
                templatePath,
                "a world exchanges only with its own placement region; its parent's region is reached through region adjacency",
            ));
        }

        const guard = template.guard;
        const guardPath = `${templatePath}.guard`;
        if (!guard || typeof guard !== "object") {
            diagnostics.push(issue("EGU210", guardPath, "a sea exchange template needs a typed guard"));
            continue;
        }
        if (!IDENTIFIER.test(guard.id)) diagnostics.push(issue("EGU210", `${guardPath}.id`, "sea exchange guard id must be stable"));
        const fieldParameters = Array.isArray(guard.fieldParameters) ? guard.fieldParameters : [];
        const regionParameters = Array.isArray(guard.regionParameters) ? guard.regionParameters : [];
        if (!Array.isArray(guard.fieldParameters) || !Array.isArray(guard.regionParameters)) {
            diagnostics.push(issue("EGU210", guardPath, "a sea exchange guard declares its field and region bindings as lists"));
        }
        duplicates([...fieldParameters, ...regionParameters].map((binding) => binding.parameterName)).forEach((name) => diagnostics.push(
            issue("EGU210", guardPath, `parameter '${name}' is bound more than once`),
        ));
        const selfIsEndpoint = endpoints.includes("self");
        const boundParameterKinds = new Map<string, IntensionalValueKind | undefined>();
        for (const [bindingIndex, binding] of fieldParameters.entries()) {
            const bindingPath = `${guardPath}.fieldParameters[${bindingIndex}]`;
            if (!selfIsEndpoint) {
                diagnostics.push(issue(
                    "EGU210",
                    bindingPath,
                    "a sea exchange guard may read the world's own fields only when the world itself is an endpoint",
                ));
            }
            const kinds = candidates.map((candidate) => (
                isMediumSeaFieldId(binding.fieldId) && candidate.causalProjection
                    ? "rational" as const
                    : fieldValueKind(candidate, binding.fieldId, families)
            ));
            if (kinds.some((kind) => kind === undefined)) {
                diagnostics.push(issue("EGU210", bindingPath, `field '${binding.fieldId}' is not available on every schema revision a world can carry`));
            }
            boundParameterKinds.set(binding.parameterName, kinds.every((kind) => kind === kinds[0]) ? kinds[0] : undefined);
        }
        for (const [bindingIndex, binding] of regionParameters.entries()) {
            const bindingPath = `${guardPath}.regionParameters[${bindingIndex}]`;
            if ((binding.region !== "own-region" && binding.region !== "parent-region") || !SEA_QUANTITIES.includes(binding.quantity)) {
                diagnostics.push(issue("EGU210", bindingPath, "a region binding names own-region or parent-region and a sea quantity"));
            } else if (!endpoints.includes(binding.region)) {
                diagnostics.push(issue("EGU210", bindingPath, `a sea exchange guard may read only its endpoint regions, not '${binding.region}'`));
            }
            boundParameterKinds.set(binding.parameterName, "rational");
        }
        const family = validateQueryTemplate(guard.query, `${guardPath}.query`, program, {
            boundParameterKinds,
            reachableRoots: program.roots,
        }, diagnostics);
        if (family && family.valueKind !== "boolean") {
            diagnostics.push(issue("EGU210", `${guardPath}.query.familyId`, "sea exchange guard family must be boolean"));
        }
    }
}

function resolveOptions(options: EndogenousUniverseOptions): ResolvedEndogenousUniverseOptions {
    return {
        maxDepth: options.maxDepth ?? 3,
        maxWorlds: options.maxWorlds ?? 256,
        naturalCoordinateLimit: options.naturalCoordinateLimit ?? 16,
        evaluationBudgetPerQuery: options.evaluationBudgetPerQuery ?? 10_000,
    };
}

function validOptions(options: ResolvedEndogenousUniverseOptions): boolean {
    return Number.isSafeInteger(options.maxDepth) && options.maxDepth >= 0
        && Number.isSafeInteger(options.maxWorlds) && options.maxWorlds >= 1
        && Number.isSafeInteger(options.naturalCoordinateLimit) && options.naturalCoordinateLimit >= 1
        && Number.isSafeInteger(options.evaluationBudgetPerQuery) && options.evaluationBudgetPerQuery >= 1;
}

function addressCoordinate(address: EndogenousWorldAddress): string {
    return address.lineage.at(-1)?.coordinate ?? "0";
}

function resolveValueSource(
    source: EndogenousValueSource,
    address: EndogenousWorldAddress,
    root: EndogenousRootSeed,
    parent?: EndogenousGeneratedWorld,
): ExactValue | undefined {
    if (source.kind === "literal") return normalizeExactValue(source.value);
    if (source.kind === "lineage-depth") return exact.integer(address.lineage.length);
    if (source.kind === "local-coordinate") return exact.integer(addressCoordinate(address));
    if (source.kind === "root-id") return exact.symbol(address.rootId);
    if (source.kind === "seed") return normalizeExactValue(root.values[source.name]!);
    return parent?.fields[source.fieldId];
}

function resolveIndexSource(source: EndogenousIndexSource, address: EndogenousWorldAddress): string | undefined {
    if (source.kind === "literal") return /^-?(0|[1-9][0-9]*)$/.test(source.value) ? source.value : undefined;
    if (source.kind === "lineage-depth") return address.lineage.length.toString();
    return addressCoordinate(address);
}

function resolveQuery(
    template: EndogenousQueryTemplate,
    address: EndogenousWorldAddress,
    root: EndogenousRootSeed,
    parent?: EndogenousGeneratedWorld,
): IntensionalCoordinateQuery | undefined {
    const at: Record<string, string> = {};
    const parameters: Record<string, ExactValue> = {};
    for (const [axis, source] of Object.entries(template.at)) {
        const value = resolveIndexSource(source, address);
        if (value === undefined) return undefined;
        at[axis] = value;
    }
    for (const [name, source] of Object.entries(template.parameters)) {
        const value = resolveValueSource(source, address, root, parent);
        if (!value) return undefined;
        parameters[name] = value;
    }
    return { familyId: template.familyId, at, parameters };
}

function worldId(address: EndogenousWorldAddress): string {
    return `world-${digestEndogenousValue(address).slice(0, 20)}`;
}

function selfAnchorId(world: EndogenousGeneratedWorld): string {
    return `anchor-self-${world.id.slice("world-".length)}`;
}

function relationAnchorId(eventId: string): string {
    return `anchor-${digestEndogenousValue(eventId).slice(0, 20)}`;
}

/** A world's own placement region, derived from its lineage-addressed world id. */
function seaRegionId(worldIdValue: string): string {
    return `region-${worldIdValue.slice("world-".length)}`;
}

/** The lineage adjacency between a generated world's region and its parent's region. */
function seaAdjacencyId(childWorldId: string): string {
    return `adjacency-${childWorldId.slice("world-".length)}`;
}

/** The world's medium-coupled sea field: its channel projection plus what it exchanged with the medium. */
function mediumCoupledSea(
    world: EndogenousGeneratedWorld,
    projection: EndogenousCausalProjection,
    placement: EndogenousSeaPlacementState | undefined,
    quantity: CausalSeaQuantity,
): ExactValue | undefined {
    const projected = sumWeightedChannels(world, world.schemaRevision, projection, quantity);
    if (!projected || !placement) return projected;
    return addExactRationals(projected, placement.exchanged[quantity]);
}

function normalizeSchemaGraph(schema: EndogenousSchemaGraph): EndogenousSchemaGraph {
    return {
        fields: structuredClone(schema.fields).sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        protectedFieldIds: [...schema.protectedFieldIds].sort(),
        ports: [...schema.ports].sort(),
        seaChannels: structuredClone(schema.seaChannels).sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        selfIdentity: structuredClone(schema.selfIdentity),
        internalLaws: structuredClone(schema.internalLaws).sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        emergenceCriteria: structuredClone(schema.emergenceCriteria).sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        ...(schema.causalProjection ? { causalProjection: structuredClone(schema.causalProjection) } : {}),
    };
}

const SCHEMA_GRAPH_COMPONENTS: Array<keyof EndogenousSchemaGraph> = [
    "fields",
    "protectedFieldIds",
    "ports",
    "seaChannels",
    "selfIdentity",
    "internalLaws",
    "emergenceCriteria",
    "causalProjection",
];

function schemaGraphChange(
    source: EndogenousSchemaGraph,
    target: EndogenousSchemaGraph,
    replacementApplied: boolean,
): EndogenousSchemaGraphChange {
    return {
        sourceGraphDigest: digestEndogenousValue(normalizeSchemaGraph(source)),
        targetGraphDigest: digestEndogenousValue(normalizeSchemaGraph(target)),
        replacementApplied,
        changedComponents: SCHEMA_GRAPH_COMPONENTS.filter((component) => (
            digestEndogenousValue(source[component]) !== digestEndogenousValue(target[component])
        )),
    };
}

function baseSchemaRevision(schema: EndogenousWorldSchema): EndogenousGeneratedSchemaRevision {
    const graph = normalizeSchemaGraph(schema);
    return {
        id: `schema-revision-${digestEndogenousValue({ baseSchemaId: schema.id, graph }).slice(0, 20)}`,
        baseSchemaId: schema.id,
        ...graph,
    };
}

function instantiateWorld(
    program: EndogenousUniverseProgram,
    revision: EndogenousGeneratedSchemaRevision,
    address: EndogenousWorldAddress,
    root: EndogenousRootSeed,
    budget: number,
    parent?: EndogenousGeneratedWorld,
): { world?: EndogenousGeneratedWorld; proof: IntensionalProofStep[]; steps: number; status?: "undetermined" | "contradicted"; reason?: string } {
    const fields: Record<string, ExactValue> = {};
    const initializerQueries: Record<string, IntensionalCoordinateQuery> = {};
    const proof: IntensionalProofStep[] = [];
    let steps = 0;
    for (const field of revision.fields) {
        const query = resolveQuery(field.initializer, address, root, parent);
        if (!query) return { proof, steps, status: "contradicted", reason: `initializer source for '${revision.baseSchemaId}.${field.id}' is unavailable` };
        const evaluated = evaluateIntensionalCoordinate(program.formal, query, { budget });
        proof.push(...evaluated.proof);
        steps += evaluated.budget.consumed;
        if (evaluated.status !== "resolved" || !evaluated.value) {
            return {
                proof,
                steps,
                status: evaluated.status === "contradicted" ? "contradicted" : "undetermined",
                reason: `initializer '${revision.baseSchemaId}.${field.id}' is ${evaluated.status}`,
            };
        }
        fields[field.id] = evaluated.value;
        initializerQueries[field.id] = query;
    }
    const id = worldId(address);
    return {
        proof,
        steps,
        world: {
            id,
            schemaId: revision.baseSchemaId,
            address: structuredClone(address),
            ...(parent ? { parentWorldId: parent.id, generatedByEventId: `generation-${id}` } : {}),
            schemaRevision: structuredClone(revision),
            fields,
            initializerQueries,
            seaChannels: revision.seaChannels.map((channel) => ({
                ...channel,
                positive: fields[channel.positiveFieldId]!,
                negative: fields[channel.negativeFieldId]!,
            })),
        },
    };
}

function realizeSchemaRevision(
    program: EndogenousUniverseProgram,
    constructor: EndogenousWorldConstructor,
    childSchema: EndogenousWorldSchema,
    childAddress: EndogenousWorldAddress,
    root: EndogenousRootSeed,
    parent: EndogenousGeneratedWorld,
    budget: number,
): {
    revision?: EndogenousGeneratedSchemaRevision;
    event?: EndogenousSchemaTransformationEvent;
    proof: IntensionalProofStep[];
    steps: number;
    status?: "undetermined" | "contradicted";
    reason?: string;
} {
    const source = constructor.parentSchemaId === constructor.childSchemaId
        ? structuredClone(parent.schemaRevision)
        : baseSchemaRevision(childSchema);
    const transformation = constructor.schemaTransformation;
    if (!transformation) return { revision: source, proof: [], steps: 0 };

    const targetGraph = transformation.replaceGraph
        ? normalizeSchemaGraph(transformation.replaceGraph)
        : normalizeSchemaGraph(source);
    const internalLaws = targetGraph.internalLaws;
    const sourceLawIds = internalLaws.map((law) => law.id).sort();
    const requestedRemovalIds = [...(transformation.removeLawIds ?? [])].sort();
    const removedLawIds: string[] = [];
    for (const lawId of requestedRemovalIds) {
        const lawIndex = internalLaws.findIndex((law) => law.id === lawId);
        if (lawIndex < 0) continue;
        internalLaws.splice(lawIndex, 1);
        removedLawIds.push(lawId);
    }
    const addedLawIds: string[] = [];
    const replacedLawIds: string[] = [];
    const upsertLaws = [...(transformation.upsertLaws ?? [])]
        .sort((left, right) => compareCanonicalStrings(left.id, right.id));
    for (const law of upsertLaws) {
        const lawIndex = internalLaws.findIndex((candidate) => candidate.id === law.id);
        if (lawIndex < 0) {
            internalLaws.push(structuredClone(law));
            addedLawIds.push(law.id);
        } else {
            internalLaws[lawIndex] = structuredClone(law);
            replacedLawIds.push(law.id);
        }
    }
    internalLaws.sort((left, right) => compareCanonicalStrings(left.id, right.id));
    const lawSetChange: EndogenousLawSetChange = {
        requestedRemovalIds,
        removedLawIds,
        upsertedLawIds: upsertLaws.map((law) => law.id),
        addedLawIds,
        replacedLawIds,
        sourceLawIds,
        targetLawIds: internalLaws.map((law) => law.id),
    };
    const evaluations: EndogenousSchemaTransformationEvaluation[] = [];
    const proof: IntensionalProofStep[] = [];
    let steps = 0;
    for (const entry of transformation.effectValues ?? []) {
        const query = resolveQuery(entry.value, childAddress, root, parent);
        if (!query) {
            return {
                proof,
                steps,
                status: "contradicted",
                reason: `schema transformation '${transformation.id}' could not bind '${entry.lawId}[${entry.effectIndex}]'`,
            };
        }
        const evaluated = evaluateIntensionalCoordinate(program.formal, query, { budget });
        proof.push(...evaluated.proof);
        steps += evaluated.budget.consumed;
        if (evaluated.status !== "resolved" || !evaluated.value) {
            return {
                proof,
                steps,
                status: evaluated.status === "contradicted" ? "contradicted" : "undetermined",
                reason: `schema transformation '${transformation.id}' is ${evaluated.status}`,
            };
        }
        const law = internalLaws.find((candidate) => candidate.id === entry.lawId);
        const effect = law?.effects[entry.effectIndex];
        if (!effect || effect.value.kind !== evaluated.value.kind) {
            return {
                proof,
                steps,
                status: "contradicted",
                reason: `schema transformation '${transformation.id}' violated the target effect's exact kind`,
            };
        }
        effect.value = structuredClone(evaluated.value);
        evaluations.push({
            lawId: entry.lawId,
            effectIndex: entry.effectIndex,
            query: structuredClone(query),
            value: structuredClone(evaluated.value),
            proofDigest: digestEndogenousValue({ query, value: evaluated.value, proof: evaluated.proof }),
        });
    }
    targetGraph.internalLaws = internalLaws;
    const graphChange = schemaGraphChange(source, targetGraph, !!transformation.replaceGraph);
    const childId = worldId(childAddress);
    const eventId = `schema-transformation-${childId}`;
    const revision: EndogenousGeneratedSchemaRevision = {
        id: `schema-revision-${digestEndogenousValue({
            baseSchemaId: childSchema.id,
            sourceRevisionId: source.id,
            transformationId: transformation.id,
            graphChange,
            lawSetChange,
            evaluations,
            targetGraph,
        }).slice(0, 20)}`,
        baseSchemaId: childSchema.id,
        sourceRevisionId: source.id,
        transformedBy: {
            eventId,
            constructorId: constructor.id,
            transformationId: transformation.id,
            graphChange: structuredClone(graphChange),
            lawSetChange: structuredClone(lawSetChange),
            evaluations: structuredClone(evaluations),
            hostSelection: false,
        },
        ...targetGraph,
    };
    return {
        revision,
        event: {
            id: eventId,
            constructorId: constructor.id,
            transformationId: transformation.id,
            parentWorldId: parent.id,
            childWorldId: childId,
            sourceRevisionId: source.id,
            targetRevisionId: revision.id,
            graphChange: structuredClone(graphChange),
            lawSetChange: structuredClone(lawSetChange),
            evaluations: structuredClone(evaluations),
            causes: [`schema-revision:${source.id}`, `constructor:${constructor.id}`, `world:${parent.id}`],
            hostSelection: false,
        },
        proof,
        steps,
    };
}

function refreshSeaChannels(world: EndogenousGeneratedWorld): void {
    world.seaChannels = world.schemaRevision.seaChannels.map((channel) => ({
        ...channel,
        positive: world.fields[channel.positiveFieldId]!,
        negative: world.fields[channel.negativeFieldId]!,
    }));
}

function selfAnchor(
    world: EndogenousGeneratedWorld,
    root: EndogenousRootSeed,
): EndogenousGeneratedAnchor | undefined {
    const identity = world.schemaRevision.selfIdentity;
    const query = resolveQuery(identity.query, world.address, root, undefined);
    if (!query) return undefined;
    return {
        id: selfAnchorId(world),
        kind: "world-identity",
        endpoints: [{ worldId: world.id, portId: world.schemaRevision.ports[0]! }],
        identityPredicates: [{
            id: `${world.id}-${identity.id}`,
            query,
            fieldParameters: identity.fieldParameters.map((binding) => ({
                parameterName: binding.parameterName,
                worldId: world.id,
                fieldId: binding.fieldId,
            })),
        }],
        transports: [],
        seaActions: [],
        hostSelection: false,
    };
}

interface GenerationProposal {
    constructor: EndogenousWorldConstructor;
    coordinate: string;
    address: EndogenousWorldAddress;
    root: EndogenousRootSeed;
}

function deriveEndogenousUniverse(
    program: EndogenousUniverseProgram,
    requestedOptions: EndogenousUniverseOptions = {},
    continuation?: EndogenousUniverseContinuationInput,
): EndogenousUniverseMaterialization {
    const options = resolveOptions(requestedOptions);
    const diagnostics = validateEndogenousUniverseProgram(program);
    const programDigest = digestEndogenousProgram(program);
    if (continuation && continuation.materialization.programDigest !== programDigest) {
        diagnostics.push(issue("EGU046", "continuation.materialization.programDigest", "continued generation must use the same endogenous universe program"));
    }
    if (continuation && (continuation.materialization.status !== "resolved"
        || !continuation.materialization.coverage.demandedSliceComplete)) {
        diagnostics.push(issue("EGU047", "continuation.materialization", "continued generation needs a previously resolved demanded slice"));
    }
    const worlds: EndogenousGeneratedWorld[] = structuredClone(continuation?.materialization.worlds ?? []);
    const anchors: EndogenousGeneratedAnchor[] = structuredClone(continuation?.materialization.anchors ?? []);
    const generationEvents: EndogenousGenerationEvent[] = structuredClone(continuation?.materialization.generationEvents ?? []);
    const schemaTransformationEvents: EndogenousSchemaTransformationEvent[] = structuredClone(
        continuation?.materialization.schemaTransformationEvents ?? [],
    );
    const frontiers: EndogenousGenerationFrontier[] = [];
    const formalProof: IntensionalProofStep[] = structuredClone(continuation?.materialization.formalProof ?? []);
    let formalEvaluationSteps = continuation?.materialization.resourceUse.formalEvaluationSteps ?? 0;
    // The shared medium: every world gets its own region, adjacent to its parent's region.
    const medium = program.seaMedium ? normalizeSeaMediumDeclaration(program.seaMedium) : undefined;
    const priorMedium = continuation?.materialization.seaMedium;
    const seaRegions = new Map((priorMedium?.regions ?? []).map((region) => [region.id, structuredClone(region)]));
    const seaPlacements = new Map((priorMedium?.placements ?? []).map((placement) => [placement.worldId, structuredClone(placement)]));
    const seaAdjacency = new Map((priorMedium?.adjacency ?? []).map((edge) => [edge.id, structuredClone(edge)]));
    const placeWorld = (
        world: EndogenousGeneratedWorld,
        initial: EndogenousSeaQuantities,
        parent?: EndogenousGeneratedWorld,
    ): void => {
        const regionId = seaRegionId(world.id);
        seaRegions.set(regionId, {
            id: regionId,
            worldId: world.id,
            negative: normalizeExactValue(initial.negative)!,
            positive: normalizeExactValue(initial.positive)!,
            causes: { negative: [], positive: [] },
        });
        seaPlacements.set(world.id, {
            worldId: world.id,
            regionId,
            exchanged: { negative: exact.integer(0), positive: exact.integer(0) },
        });
        if (parent) {
            const adjacencyId = seaAdjacencyId(world.id);
            seaAdjacency.set(adjacencyId, {
                id: adjacencyId,
                parentWorldId: parent.id,
                childWorldId: world.id,
                regionIds: [seaRegionId(parent.id), regionId].sort(compareCanonicalStrings),
            });
        }
    };
    let status: EndogenousUniverseMaterialization["status"] = "resolved";
    let reason = continuation
        ? "the connected-universe slice was continued from realized world state"
        : "the demanded connected-universe slice was derived from Bubble constructors";
    let demandedSliceComplete = true;
    const finish = (): EndogenousUniverseMaterialization => ({
        mode: "bubble-endogenous-connected-universe-materialization.v1",
        programDigest,
        status,
        reason,
        options,
        diagnostics,
        worlds: [...worlds].sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        anchors: [...anchors].sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        generationEvents: [...generationEvents].sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        schemaTransformationEvents: [...schemaTransformationEvents].sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        ...(medium ? {
            seaMedium: {
                id: medium.id,
                closure: medium.closure,
                regions: [...seaRegions.values()].sort((left, right) => compareCanonicalStrings(left.id, right.id)),
                placements: [...seaPlacements.values()].sort((left, right) => compareCanonicalStrings(left.worldId, right.worldId)),
                adjacency: [...seaAdjacency.values()].sort((left, right) => compareCanonicalStrings(left.id, right.id)),
            },
        } : {}),
        frontiers: [...frontiers].sort((left, right) => compareCanonicalStrings(stableStringify(left), stableStringify(right))),
        formalProof,
        coverage: {
            demandedSliceComplete,
            exhaustiveUniverse: status === "resolved" && demandedSliceComplete && frontiers.length === 0,
            latentContinuationPreserved: frontiers.length > 0,
        },
        resourceUse: {
            worldCount: worlds.length,
            anchorCount: anchors.length,
            generationEventCount: generationEvents.length,
            schemaTransformationEventCount: schemaTransformationEvents.length,
            formalEvaluationSteps,
        },
    });
    if (diagnostics.length > 0 || !validOptions(options)) {
        status = "contradicted";
        reason = diagnostics.length > 0 ? "endogenous universe validation failed" : "generation budgets must be positive safe integers";
        return finish();
    }
    const schemas = new Map(program.schemas.map((schema) => [schema.id, schema]));
    const roots = new Map(program.roots.map((root) => [root.id, root]));
    const queue: EndogenousGeneratedWorld[] = [];
    const existingWorldIds = new Set(worlds.map((world) => world.id));
    if (continuation) {
        if (worlds.length > options.maxWorlds) {
            status = "contradicted";
            demandedSliceComplete = false;
            reason = "continued generation cannot use a world budget below the existing slice";
            return finish();
        }
        const stateByWorld = new Map(continuation.worldStates.map((state) => [state.worldId, state]));
        if (medium) {
            // Region quantities and their causes continue exactly as world fields do.
            const regionStates = new Map((continuation.seaRegions ?? []).map((region) => [region.id, region]));
            const unknownRegionIds = [...regionStates.keys()].filter((regionId) => !seaRegions.has(regionId));
            const missingRegionIds = [...seaRegions.keys()].filter((regionId) => !regionStates.has(regionId));
            if (!priorMedium || unknownRegionIds.length > 0 || missingRegionIds.length > 0
                || seaPlacements.size !== worlds.length || worlds.some((world) => !seaPlacements.has(world.id))) {
                status = "contradicted";
                demandedSliceComplete = false;
                reason = "continued generation needs the realized state of exactly every sea region its predecessor placed worlds in";
                return finish();
            }
            for (const region of seaRegions.values()) {
                const state = regionStates.get(region.id)!;
                for (const quantity of SEA_QUANTITIES) {
                    const value = state[quantity] ? normalizeExactValue(state[quantity]) : undefined;
                    const causes = state.causes?.[quantity];
                    if (!value || !nonNegativeRational(value)
                        || (causes !== undefined && (!Array.isArray(causes)
                            || causes.some((cause) => typeof cause !== "string" || cause.length === 0)))) {
                        status = "contradicted";
                        demandedSliceComplete = false;
                        reason = `continued generation received an invalid realized ${quantity} quantity for sea region '${region.id}'`;
                        return finish();
                    }
                    region[quantity] = value;
                    if (causes !== undefined) region.causes[quantity] = [...new Set(causes)].sort(compareCanonicalStrings);
                }
            }
        }
        for (const world of worlds) {
            const state = stateByWorld.get(world.id);
            if (!state) {
                status = "contradicted";
                demandedSliceComplete = false;
                reason = `continued generation is missing realized state for '${world.id}'`;
                return finish();
            }
            const placement = medium ? seaPlacements.get(world.id) : undefined;
            const projection = world.schemaRevision.causalProjection;
            if (placement && projection) {
                // The coupled field is the channel projection plus what the medium exchanged with this world. Only
                // the medium writes the coupled field during a realization, so its realized change is exchange.
                for (const quantity of SEA_QUANTITIES) {
                    const before = mediumCoupledSea(world, projection, placement, quantity);
                    const realizedValue = state.fields[ENDOGENOUS_MEDIUM_SEA_FIELD_IDS[quantity]];
                    const realized = realizedValue ? normalizeExactValue(realizedValue) : undefined;
                    const change = before && realized?.kind === "rational" ? subtractExactRationals(realized, before) : undefined;
                    const exchanged = change ? addExactRationals(placement.exchanged[quantity], change) : undefined;
                    if (!exchanged) {
                        status = "contradicted";
                        demandedSliceComplete = false;
                        reason = `continued generation is missing the realized medium-coupled ${quantity} sea field of '${world.id}'`;
                        return finish();
                    }
                    placement.exchanged[quantity] = exchanged;
                }
            }
            for (const field of world.schemaRevision.fields) {
                const value = normalizeExactValue(state.fields[field.id]!);
                if (!value || value.kind !== world.fields[field.id]?.kind) {
                    status = "contradicted";
                    demandedSliceComplete = false;
                    reason = `continued generation received an invalid exact field '${world.id}.${field.id}'`;
                    return finish();
                }
                world.fields[field.id] = value;
            }
            refreshSeaChannels(world);
        }
        queue.push(...[...worlds].sort((left, right) => (
            left.address.lineage.length - right.address.lineage.length || compareCanonicalStrings(left.id, right.id)
        )));
    } else {
        const orderedRoots = [...program.roots].sort((left, right) => compareCanonicalStrings(left.id, right.id));
        if (orderedRoots.length > options.maxWorlds) {
            status = "undetermined";
            demandedSliceComplete = false;
            reason = "root materialization exceeded the world budget";
            for (const root of orderedRoots) {
                frontiers.push({ kind: "root-world-budget", rootId: root.id, reason });
            }
            return finish();
        }
        for (const root of orderedRoots) {
            const schema = schemas.get(root.schemaId)!;
            const created = instantiateWorld(
                program,
                baseSchemaRevision(schema),
                { rootId: root.id, lineage: [] },
                root,
                options.evaluationBudgetPerQuery,
            );
            formalProof.push(...created.proof);
            formalEvaluationSteps += created.steps;
            if (!created.world) {
                status = created.status ?? "contradicted";
                reason = created.reason ?? "root initialization failed";
                demandedSliceComplete = false;
                return finish();
            }
            worlds.push(created.world);
            existingWorldIds.add(created.world.id);
            queue.push(created.world);
            if (medium) placeWorld(created.world, medium.rootRegions.find((region) => region.rootId === root.id)!);
            const identityAnchor = selfAnchor(created.world, root);
            if (!identityAnchor) {
                status = "contradicted";
                reason = `self identity query for '${created.world.id}' could not be resolved`;
                return finish();
            }
            anchors.push(identityAnchor);
        }
    }

    interface GenerationLevelPlan {
        parent: EndogenousGeneratedWorld;
        parentSchema: EndogenousGeneratedSchemaRevision;
        parentSnapshot: EndogenousGeneratedWorld;
        proposals: GenerationProposal[];
    }
    // Phase A for one parent: evaluate every admission and return the complete admitted sibling family, or
    // record why no member of the family can be materialized.
    const proposeChildren = (parent: EndogenousGeneratedWorld): GenerationLevelPlan | undefined => {
        const parentSchema = parent.schemaRevision;
        const root = roots.get(parent.address.rootId)!;
        const constructors = program.constructors
            .filter((constructor) => constructor.parentSchemaId === parent.schemaId)
            .sort((left, right) => compareCanonicalStrings(left.id, right.id));
        if (constructors.length === 0) return undefined;
        if (parent.address.lineage.length >= options.maxDepth) {
            for (const constructor of constructors) {
                frontiers.push({
                    kind: "depth-boundary",
                    parentWorldId: parent.id,
                    constructorId: constructor.id,
                    reason: "the requested local depth ended while the constructor remains intensionally available",
                });
            }
            return undefined;
        }
        const parentSnapshot = structuredClone(parent);
        const proposals: GenerationProposal[] = [];
        let parentAdmissionComplete = true;
        for (const constructor of constructors) {
            const coordinateLimit = constructor.coordinates.kind === "finite"
                ? BigInt(constructor.coordinates.size)
                : BigInt(options.naturalCoordinateLimit);
            for (let coordinate = 0n; coordinate < coordinateLimit; coordinate += 1n) {
                const childAddress: EndogenousWorldAddress = {
                    rootId: parent.address.rootId,
                    lineage: [...parent.address.lineage, { constructorId: constructor.id, coordinate: coordinate.toString() }],
                };
                if (existingWorldIds.has(worldId(childAddress))) continue;
                const query = resolveQuery(constructor.admission.query, childAddress, root, parentSnapshot);
                if (!query) {
                    status = "contradicted";
                    reason = `admission query for '${constructor.id}' could not bind its sources`;
                    demandedSliceComplete = false;
                    break;
                }
                const parameters = { ...query.parameters };
                for (const binding of constructor.admission.fieldParameters) {
                    const value = parentSnapshot.fields[binding.fieldId];
                    if (!value) {
                        status = "contradicted";
                        reason = `admission field '${parent.id}.${binding.fieldId}' is unavailable`;
                        break;
                    }
                    parameters[binding.parameterName] = value;
                }
                if (status === "contradicted") break;
                const evaluated = evaluateIntensionalCoordinate(program.formal, { ...query, parameters }, { budget: options.evaluationBudgetPerQuery });
                formalProof.push(...evaluated.proof);
                formalEvaluationSteps += evaluated.budget.consumed;
                if (evaluated.status !== "resolved" || evaluated.value?.kind !== "boolean") {
                    status = evaluated.status === "contradicted" ? "contradicted" : "undetermined";
                    parentAdmissionComplete = false;
                    demandedSliceComplete = false;
                    reason = `admission '${constructor.id}' is ${evaluated.status}`;
                    frontiers.push({
                        kind: "admission-undetermined",
                        parentWorldId: parent.id,
                        constructorId: constructor.id,
                        coordinate: coordinate.toString(),
                        reason,
                    });
                    continue;
                }
                if (evaluated.value.value) {
                    proposals.push({ constructor, coordinate: coordinate.toString(), address: childAddress, root });
                } else {
                    frontiers.push({
                        kind: "admission-closed",
                        parentWorldId: parent.id,
                        constructorId: constructor.id,
                        coordinate: coordinate.toString(),
                        reason: "the constructor remains intensionally available but its exact admission is false in this realized state",
                    });
                }
            }
            if (constructor.coordinates.kind === "natural") {
                frontiers.push({
                    kind: "natural-open",
                    parentWorldId: parent.id,
                    constructorId: constructor.id,
                    coordinate: options.naturalCoordinateLimit.toString(),
                    reason: "natural constructor remains intensionally available beyond the demanded local prefix",
                });
            }
        }
        if (status === "contradicted") return undefined;
        proposals.sort((left, right) => {
            const constructorOrder = compareCanonicalStrings(left.constructor.id, right.constructor.id);
            if (constructorOrder !== 0) return constructorOrder;
            const leftCoordinate = BigInt(left.coordinate);
            const rightCoordinate = BigInt(right.coordinate);
            return leftCoordinate < rightCoordinate ? -1 : leftCoordinate > rightCoordinate ? 1 : 0;
        });
        if (!parentAdmissionComplete) {
            // An admitted sibling is not materialized while its family is unresolved, but it is not forgotten.
            for (const proposal of proposals) {
                frontiers.push({
                    kind: "sibling-admission-pending",
                    parentWorldId: parent.id,
                    constructorId: proposal.constructor.id,
                    coordinate: proposal.coordinate,
                    reason: "this sibling is admitted, but its complete sibling family is unresolved, so no member is materialized",
                });
            }
            return undefined;
        }
        return { parent, parentSchema, parentSnapshot, proposals };
    };

    // Phase B for one parent: prepare the whole sibling family from one snapshot and commit it atomically.
    const commitChildren = (plan: GenerationLevelPlan): void => {
        const { parent, parentSchema, parentSnapshot, proposals } = plan;
        const prepared: Array<{
            proposal: GenerationProposal;
            childSchema: EndogenousWorldSchema;
            child: EndogenousGeneratedWorld;
            eventId: string;
            identityQuery: IntensionalCoordinateQuery;
            identityAnchor: EndogenousGeneratedAnchor;
            transports: EndogenousGeneratedRelationTransport[];
            schemaTransformationEvent?: EndogenousSchemaTransformationEvent;
        }> = [];
        let preparationFrontierKind: EndogenousGenerationFrontier["kind"] | undefined;
        for (const proposal of proposals) {
            const childSchema = schemas.get(proposal.constructor.childSchemaId)!;
            const realizedRevision = realizeSchemaRevision(
                program,
                proposal.constructor,
                childSchema,
                proposal.address,
                proposal.root,
                parentSnapshot,
                options.evaluationBudgetPerQuery,
            );
            formalProof.push(...realizedRevision.proof);
            formalEvaluationSteps += realizedRevision.steps;
            if (!realizedRevision.revision) {
                status = realizedRevision.status ?? "contradicted";
                demandedSliceComplete = false;
                reason = realizedRevision.reason ?? "generated schema transformation failed";
                if (status === "undetermined") preparationFrontierKind = "schema-transformation-undetermined";
                break;
            }
            const created = instantiateWorld(
                program,
                realizedRevision.revision,
                proposal.address,
                proposal.root,
                options.evaluationBudgetPerQuery,
                parentSnapshot,
            );
            formalProof.push(...created.proof);
            formalEvaluationSteps += created.steps;
            if (!created.world) {
                status = created.status ?? "contradicted";
                demandedSliceComplete = false;
                reason = created.reason ?? "generated world initialization failed";
                if (status === "undetermined") preparationFrontierKind = "schema-transformation-undetermined";
                break;
            }
            const child = created.world;
            const eventId = `generation-${child.id}`;
            if (!parentSnapshot.schemaRevision.ports.includes(proposal.constructor.parentPortId)
                || !child.schemaRevision.ports.includes(proposal.constructor.childPortId)) {
                status = "contradicted";
                demandedSliceComplete = false;
                reason = `relation anchor '${proposal.constructor.id}' has no port on a realized schema revision`;
                break;
            }
            const transports: EndogenousGeneratedRelationTransport[] = [];
            for (const [transportIndex, transport] of (proposal.constructor.transports ?? []).entries()) {
                const sourceValue = parentSnapshot.fields[transport.sourceFieldId];
                const targetBefore = child.fields[transport.targetFieldId];
                if (!sourceValue || !targetBefore || sourceValue.kind !== targetBefore.kind) {
                    status = "contradicted";
                    demandedSliceComplete = false;
                    reason = `relation transport '${proposal.constructor.id}' could not preserve its exact endpoint kind`;
                    break;
                }
                // Static validation closes every realizable revision; this guards the realized one directly.
                const realizedTarget = child.schemaRevision.fields.find((field) => field.id === transport.targetFieldId);
                if (realizedTarget?.role !== "world-condition"
                    || child.schemaRevision.protectedFieldIds.includes(transport.targetFieldId)) {
                    status = "contradicted";
                    demandedSliceComplete = false;
                    reason = `relation transport '${proposal.constructor.id}' cannot write a protected or non-condition child field`;
                    break;
                }
                const value = structuredClone(sourceValue);
                child.fields[transport.targetFieldId] = structuredClone(value);
                transports.push({
                    id: `transport-${eventId}-${transportIndex}`,
                    source: {
                        worldId: parent.id,
                        fieldId: transport.sourceFieldId,
                        value: structuredClone(value),
                    },
                    target: {
                        worldId: child.id,
                        fieldId: transport.targetFieldId,
                        before: structuredClone(targetBefore),
                        after: structuredClone(value),
                    },
                    hostSelection: false,
                });
            }
            if (status === "contradicted") break;
            const identityQuery = resolveQuery(proposal.constructor.relationIdentity.query, child.address, proposal.root, parentSnapshot);
            const identityBindingsExist = proposal.constructor.relationIdentity.fieldParameters.every((binding) => (
                binding.endpoint === "parent"
                    ? !!parentSnapshot.fields[binding.fieldId]
                    : !!child.fields[binding.fieldId]
            ));
            const identityAnchor = selfAnchor(child, proposal.root);
            if (!identityQuery || !identityAnchor || !identityBindingsExist) {
                status = "contradicted";
                demandedSliceComplete = false;
                reason = !identityQuery
                    ? `relation identity for '${proposal.constructor.id}' could not bind its sources`
                    : !identityAnchor
                        ? `self identity query for '${child.id}' could not be resolved`
                        : `relation identity for '${proposal.constructor.id}' has no field on a realized schema revision`;
                break;
            }
            prepared.push({
                proposal,
                childSchema,
                child,
                eventId,
                identityQuery,
                identityAnchor,
                transports,
                ...(realizedRevision.event ? { schemaTransformationEvent: realizedRevision.event } : {}),
            });
        }
        if (prepared.length !== proposals.length) {
            if (preparationFrontierKind) {
                for (const proposal of proposals) {
                    frontiers.push({
                        kind: preparationFrontierKind,
                        parentWorldId: parent.id,
                        constructorId: proposal.constructor.id,
                        coordinate: proposal.coordinate,
                        reason,
                    });
                }
            }
            return;
        }
        const nextParentFields = structuredClone(parent.fields);
        for (const entry of prepared) {
            const { proposal, childSchema, child } = entry;
            for (const action of proposal.constructor.seaActions) {
                const parentChannel = parentSchema.seaChannels.find((channel) => channel.id === action.parentChannelId);
                const childChannel = child.schemaRevision.seaChannels.find((channel) => channel.id === action.childChannelId);
                if (!parentChannel || !childChannel) {
                    status = "contradicted";
                    demandedSliceComplete = false;
                    reason = `sea relation '${proposal.constructor.id}' has no channel on a realized schema revision`;
                    break;
                }
                const parentNegative = addExactRationals(nextParentFields[parentChannel.negativeFieldId]!, action.parentNegativeResidue);
                const childPositive = addExactRationals(child.fields[childChannel.positiveFieldId]!, action.childPositivePlacement);
                if (!parentNegative || !childPositive) {
                    status = "contradicted";
                    demandedSliceComplete = false;
                    reason = `sea relation '${proposal.constructor.id}' could not be applied exactly`;
                    break;
                }
                nextParentFields[parentChannel.negativeFieldId] = parentNegative;
                child.fields[childChannel.positiveFieldId] = childPositive;
            }
            if (status === "contradicted") break;
            refreshSeaChannels(child);
        }
        if (status === "contradicted") return;
        if (medium?.closure === "closed") {
            // A closed medium is the only source of sea quantity: a generated world begins with none of its own.
            for (const { child } of prepared) {
                const seaField = child.schemaRevision.fields.find((field) => (
                    SEA_FIELD_ROLES.has(field.role) && !isZeroRational(child.fields[field.id]!)
                ));
                if (seaField) {
                    status = "contradicted";
                    demandedSliceComplete = false;
                    reason = `closed sea medium: generated world '${child.id}' would begin with sea quantity in '${seaField.id}' created outside the medium`;
                    return;
                }
            }
        }
        parent.fields = nextParentFields;
        refreshSeaChannels(parent);
        for (const entry of prepared) {
            const { proposal, child, eventId, identityQuery, identityAnchor, transports, schemaTransformationEvent } = entry;
            worlds.push(child);
            existingWorldIds.add(child.id);
            queue.push(child);
            if (medium) placeWorld(child, medium.childRegionInitial, parent);
            generationEvents.push({
                id: eventId,
                constructorId: proposal.constructor.id,
                coordinate: proposal.coordinate,
                parentWorldId: parent.id,
                childWorldId: child.id,
                transportIds: transports.map((transport) => transport.id),
                ...(schemaTransformationEvent ? { schemaTransformationEventId: schemaTransformationEvent.id } : {}),
                causes: [`world:${parent.id}`, `constructor:${proposal.constructor.id}`],
                hostSelection: false,
            });
            if (schemaTransformationEvent) schemaTransformationEvents.push(schemaTransformationEvent);
            anchors.push({
                id: relationAnchorId(eventId),
                kind: "generated-relation",
                constructorId: proposal.constructor.id,
                ...(schemaTransformationEvent ? { schemaTransformationEventId: schemaTransformationEvent.id } : {}),
                endpoints: [
                    { worldId: parent.id, portId: proposal.constructor.parentPortId },
                    { worldId: child.id, portId: proposal.constructor.childPortId },
                ],
                identityPredicates: [{
                    id: `${eventId}-${proposal.constructor.relationIdentity.id}`,
                    query: identityQuery,
                    fieldParameters: proposal.constructor.relationIdentity.fieldParameters.map((binding) => ({
                        parameterName: binding.parameterName,
                        worldId: binding.endpoint === "parent" ? parent.id : child.id,
                        fieldId: binding.fieldId,
                    })),
                }],
                transports: structuredClone(transports),
                seaActions: structuredClone(proposal.constructor.seaActions),
                hostSelection: false,
            });
            anchors.push(identityAnchor);
        }
    };

    // Generation proceeds one lineage depth at a time. The world budget is checked against every admitted
    // sibling family of the whole level before any member exists, so neither coordinate nor world-id order
    // can decide which cousin family survives an insufficient budget.
    // Read through a function: the phase closures update status, which control-flow narrowing cannot see.
    const contradicted = (): boolean => status === "contradicted";
    let worldBudgetExhausted = false;
    while (queue.length > 0 && !contradicted()) {
        queue.sort((left, right) => (
            left.address.lineage.length - right.address.lineage.length || compareCanonicalStrings(left.id, right.id)
        ));
        const depth = queue[0]!.address.lineage.length;
        const level: EndogenousGeneratedWorld[] = [];
        while (queue.length > 0 && queue[0]!.address.lineage.length === depth) level.push(queue.shift()!);
        const plans: GenerationLevelPlan[] = [];
        for (const parent of level) {
            const plan = proposeChildren(parent);
            if (contradicted()) break;
            if (plan) plans.push(plan);
        }
        if (contradicted()) break;
        const proposedWorldCount = plans.reduce((total, plan) => total + plan.proposals.length, 0);
        if (proposedWorldCount > 0 && (worldBudgetExhausted || worlds.length + proposedWorldCount > options.maxWorlds)) {
            worldBudgetExhausted = true;
            status = "undetermined";
            demandedSliceComplete = false;
            reason = "the world budget cannot preserve the complete generated sibling set";
            for (const plan of plans) {
                for (const proposal of plan.proposals) {
                    frontiers.push({
                        kind: "world-budget",
                        parentWorldId: plan.parent.id,
                        constructorId: proposal.constructor.id,
                        coordinate: proposal.coordinate,
                        reason,
                    });
                }
            }
            continue;
        }
        for (const plan of plans) {
            commitChildren(plan);
            if (contradicted()) break;
        }
    }
    return finish();
}

export function materializeEndogenousUniverse(
    program: EndogenousUniverseProgram,
    requestedOptions: EndogenousUniverseOptions = {},
): EndogenousUniverseMaterialization {
    return deriveEndogenousUniverse(program, requestedOptions);
}

export function continueEndogenousUniverseFromState(
    program: EndogenousUniverseProgram,
    continuation: EndogenousUniverseContinuationInput,
    requestedOptions: EndogenousUniverseOptions = continuation.materialization.options,
): EndogenousUniverseMaterialization {
    return deriveEndogenousUniverse(program, requestedOptions, continuation);
}

function sumWeightedChannels(
    world: EndogenousGeneratedWorld,
    schema: EndogenousSchemaGraph,
    projection: EndogenousCausalProjection,
    direction: "positive" | "negative",
): ExactValue | undefined {
    let total = exact.integer(0);
    for (const projected of projection.channels) {
        const channel = schema.seaChannels.find((candidate) => candidate.id === projected.channelId)!;
        const value = world.fields[direction === "positive" ? channel.positiveFieldId : channel.negativeFieldId]!;
        const weight = direction === "positive" ? projected.positiveWeight : projected.negativeWeight;
        const normalizedValue = normalizeExactValue(value);
        const normalizedWeight = normalizeExactValue(weight);
        if (normalizedValue?.kind !== "rational" || normalizedWeight?.kind !== "rational") return undefined;
        const numerator = BigInt(normalizedValue.numerator) * BigInt(normalizedWeight.numerator);
        const denominator = BigInt(normalizedValue.denominator) * BigInt(normalizedWeight.denominator);
        const next = addExactRationals(total, exact.rational(numerator, denominator));
        if (!next) return undefined;
        total = next;
    }
    return total;
}

function instantiatePredicate(
    worldIdValue: string,
    predicate: EndogenousPredicateTemplate,
    address: EndogenousWorldAddress,
    root: EndogenousRootSeed,
): CausalStatePredicate | undefined {
    const query = resolveQuery(predicate.query, address, root, undefined);
    return query ? {
        id: `${worldIdValue}-${predicate.id}`,
        query,
        fieldParameters: predicate.fieldParameters.map((binding) => ({
            parameterName: binding.parameterName,
            worldId: worldIdValue,
            fieldId: binding.fieldId,
        })),
    } : undefined;
}

export function compileEndogenousUniverse(
    source: EndogenousUniverseProgram,
    materialization: EndogenousUniverseMaterialization,
): CompiledEndogenousUniverse | undefined {
    if (materialization.status !== "resolved" || !materialization.coverage.demandedSliceComplete) return undefined;
    if (materialization.worlds.some((world) => !world.schemaRevision.causalProjection)) return undefined;
    // A declared medium must have been carried by the materialization, and only then.
    if (!!source.seaMedium !== !!materialization.seaMedium) return undefined;
    const mediumState = materialization.seaMedium;
    const placements = new Map((mediumState?.placements ?? []).map((placement) => [placement.worldId, placement]));
    const projectionFamilyId = `generated_projection_zero_${materialization.programDigest.slice(0, 10)}`;
    const formal: IntensionalSystem = {
        mode: "bubble-intensional-system.v1",
        families: [
            ...structuredClone(source.formal.families),
            {
                id: projectionFamilyId,
                domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
                valueKind: "rational",
                parameters: [],
                body: { kind: "value", value: exact.integer(0) },
            },
        ],
    };
    const worlds: CausalWorldDefinition[] = [];
    const fieldInitializers: CausalFieldInitializer[] = [];
    const seaLaws: CausalSeaLaw[] = [];
    const internalLaws: CausalInternalLaw[] = [];
    const emergenceCriteria: CausalEmergenceCriterion[] = [];
    const objectives: CausalWorldWillObjective[] = [];
    const fieldOverrides: Record<string, ExactValue> = {};
    const fieldOverrideCauses: Record<string, string[]> = {};
    const transportedFieldCauses = new Map<string, EndogenousGeneratedRelationTransport[]>();
    for (const transport of materialization.anchors.flatMap((anchor) => anchor.transports)) {
        const key = `${transport.target.worldId}.${transport.target.fieldId}`;
        transportedFieldCauses.set(key, [...transportedFieldCauses.get(key) ?? [], transport]
            .sort((left, right) => compareCanonicalStrings(left.id, right.id)));
    }
    const roots = new Map(source.roots.map((root) => [root.id, root]));
    for (const world of materialization.worlds) {
        const schema = world.schemaRevision;
        const projection = schema.causalProjection!;
        const placement = placements.get(world.id);
        if (mediumState && !placement) return undefined;
        const positive = mediumCoupledSea(world, projection, placement, "positive");
        const negative = mediumCoupledSea(world, projection, placement, "negative");
        if (!positive || !negative) return undefined;
        const projectionFields: CausalFieldBinding[] = [
            { id: "projection.positive", familyId: projectionFamilyId, role: "positive-sea" },
            { id: "projection.negative", familyId: projectionFamilyId, role: "negative-sea" },
            { id: "projection.viability", familyId: projectionFamilyId, role: "viability" },
        ];
        worlds.push({
            id: world.id,
            initialExistence: "active",
            fields: [
                ...schema.fields.map(({ id, familyId, role }) => ({ id, familyId, role })),
                ...projectionFields,
            ],
            protectedFieldIds: [...schema.protectedFieldIds],
            seaCoupling: {
                positiveFieldId: "projection.positive",
                negativeFieldId: "projection.negative",
                viabilityFieldId: "projection.viability",
            },
        });
        for (const field of schema.fields) {
            fieldInitializers.push({ worldId: world.id, fieldId: field.id, query: world.initializerQueries[field.id]! });
            const key = `${world.id}.${field.id}`;
            fieldOverrides[key] = world.fields[field.id]!;
            const causes = transportedFieldCauses.get(key)
                ?.filter((transport) => exactValuesEqual(world.fields[field.id]!, transport.target.after))
                .map((transport) => transport.id);
            if (causes?.length) fieldOverrideCauses[key] = [...causes];
        }
        for (const [fieldId, value] of [
            ["projection.positive", positive],
            ["projection.negative", negative],
            ["projection.viability", projection.intrinsicViability],
        ] as const) {
            fieldInitializers.push({
                worldId: world.id,
                fieldId,
                query: { familyId: projectionFamilyId, at: { unit: "0" }, parameters: {} },
            });
            fieldOverrides[`${world.id}.${fieldId}`] = value;
        }
        seaLaws.push({ worldId: world.id, positiveWeight: exact.integer(1), negativeWeight: exact.integer(1) });
        const root = roots.get(world.address.rootId)!;
        for (const law of world.schemaRevision.internalLaws) {
            const guard = instantiatePredicate(world.id, law.guard, world.address, root);
            if (!guard) return undefined;
            internalLaws.push({
                id: `${world.id}-${law.id}`,
                worldId: world.id,
                guard,
                effects: structuredClone(law.effects),
                application: law.application,
                reversibility: law.reversibility,
                ...(law.inverseEffects ? { inverseEffects: structuredClone(law.inverseEffects) } : {}),
                ...(law.commitAffectedFieldIds ? { commitAffectedFieldIds: [...law.commitAffectedFieldIds] } : {}),
            });
        }
        for (const criterion of schema.emergenceCriteria) {
            const predicate = instantiatePredicate(world.id, criterion.predicate, world.address, root);
            if (!predicate) return undefined;
            emergenceCriteria.push({
                id: `${world.id}-${criterion.id}`,
                worldId: world.id,
                predicate,
                witnessFieldIds: [...criterion.witnessFieldIds],
            });
        }
        objectives.push({
            id: `${world.id}-${projection.objective.id}`,
            targetWorldId: world.id,
            fieldId: projection.objective.fieldId,
            direction: projection.objective.direction,
            weight: projection.objective.weight,
            ...(projection.objective.targetValue ? { targetValue: projection.objective.targetValue } : {}),
        });
    }
    const anchors: CausalAnchorDefinition[] = materialization.anchors.map((anchor) => ({
        id: anchor.id,
        endpoints: anchor.endpoints.map((endpoint) => ({ kind: "world" as const, ...endpoint })),
        identityPredicateFamilyIds: [...new Set(anchor.identityPredicates.map((predicate) => predicate.query.familyId))],
        permittedInterventionKinds: [],
    }));
    const anchorIdentity: CausalAnchorIdentityQuery[] = materialization.anchors.flatMap((anchor) => (
        anchor.identityPredicates.map((predicate) => ({ ...structuredClone(predicate), anchorId: anchor.id }))
    ));
    const seaMedium = source.seaMedium && mediumState
        ? compileSeaMedium(normalizeSeaMediumDeclaration(source.seaMedium), mediumState, materialization, roots)
        : undefined;
    if (source.seaMedium && !seaMedium) return undefined;
    const program: ExecutableAnchoredCausalProgram = {
        mode: "bubble-anchored-causal-program.v2",
        world: {
            mode: "bubble-anchored-causal-world.v2",
            formal,
            worlds,
            anchors,
            ...(seaMedium ? { seaMedium: seaMedium.medium } : {}),
            worldWill: {
                id: `generated-world-will-${materialization.programDigest.slice(0, 10)}`,
                objectives,
                hardConstraintFamilyIds: [],
                interventions: [],
            },
            internalLaws,
            emergenceCriteria,
            order: { kind: "causal-partial-order", universalClock: false },
        },
        fieldInitializers,
        seaLaws,
        execution: {
            decisionMode: "plural",
            internalConflictMode: "maximal-commuting-branches",
            hardConstraints: [],
            anchorIdentity,
            interventionCosts: [],
        },
    };
    return {
        program,
        fieldOverrides,
        fieldOverrideCauses,
        ...(seaMedium ? {
            seaRegionOverrides: seaMedium.regionOverrides,
            seaRegionOverrideCauses: seaMedium.regionOverrideCauses,
        } : {}),
    };
}

/**
 * Lowers the carried medium state to the kernel's `world.seaMedium`: one region per world, one placement per
 * world in its own region, one lineage adjacency per generated world, and every exchange template instantiated
 * once per world as `<worldId>-<templateId>`. Roots skip templates that read or move their (absent) parent region.
 *
 * Like field initializers, the declared regions carry their initial endowment (`rootRegions` for a root's region,
 * `childRegionInitial` for a generated world's region); the carried quantities and their causes continue through
 * `seaRegionOverrides`/`seaRegionOverrideCauses`, exactly as world fields continue through field overrides.
 */
function compileSeaMedium(
    declaration: EndogenousSeaMediumDeclaration,
    state: EndogenousSeaMediumMaterialization,
    materialization: EndogenousUniverseMaterialization,
    roots: Map<string, EndogenousRootSeed>,
): {
    medium: CausalSeaMedium;
    regionOverrides: Record<string, EndogenousSeaQuantities>;
    regionOverrideCauses: Record<string, string[]>;
} | undefined {
    const regions = [...state.regions].sort((left, right) => compareCanonicalStrings(left.id, right.id));
    const regionOverrides: Record<string, EndogenousSeaQuantities> = {};
    const regionOverrideCauses: Record<string, string[]> = {};
    for (const region of regions) {
        regionOverrides[region.id] = { negative: structuredClone(region.negative), positive: structuredClone(region.positive) };
        for (const quantity of SEA_QUANTITIES) {
            if (region.causes[quantity].length > 0) regionOverrideCauses[`${region.id}#${quantity}`] = [...region.causes[quantity]];
        }
    }
    const exchangeLaws: CausalSeaExchangeLaw[] = [];
    for (const world of [...materialization.worlds].sort((left, right) => compareCanonicalStrings(left.id, right.id))) {
        const root = roots.get(world.address.rootId);
        if (!root) return undefined;
        const ownRegionId = seaRegionId(world.id);
        const parentRegionId = world.parentWorldId ? seaRegionId(world.parentWorldId) : undefined;
        const regionOf = (region: "own-region" | "parent-region"): string | undefined => (
            region === "own-region" ? ownRegionId : parentRegionId
        );
        for (const template of declaration.exchangeTemplates) {
            const readsParent = template.from === "parent-region" || template.to === "parent-region"
                || template.guard.regionParameters.some((binding) => binding.region === "parent-region");
            if (readsParent && !parentRegionId) continue;
            const endpoint = (kind: EndogenousSeaEndpointTemplate): CausalSeaEndpoint => (
                kind === "self" ? { kind: "world", worldId: world.id } : { kind: "region", regionId: regionOf(kind)! }
            );
            const query = resolveQuery(template.guard.query, world.address, root, undefined);
            const amount = normalizeExactValue(template.amount);
            if (!query || !amount) return undefined;
            const id = `${world.id}-${template.id}`;
            exchangeLaws.push({
                id,
                quantity: template.quantity,
                from: endpoint(template.from),
                to: endpoint(template.to),
                amount,
                guard: {
                    id: `${id}-${template.guard.id}`,
                    query,
                    fieldParameters: template.guard.fieldParameters.map((binding) => ({
                        parameterName: binding.parameterName,
                        worldId: world.id,
                        fieldId: binding.fieldId,
                    })),
                    regionParameters: template.guard.regionParameters.map((binding) => ({
                        parameterName: binding.parameterName,
                        regionId: regionOf(binding.region)!,
                        quantity: binding.quantity,
                    })),
                },
                application: "once-per-realization",
            });
        }
    }
    const worldsById = new Map(materialization.worlds.map((world) => [world.id, world]));
    const endowments: Array<{ id: string } & EndogenousSeaQuantities> = [];
    for (const region of regions) {
        const world = worldsById.get(region.worldId);
        const endowment = !world
            ? undefined
            : world.parentWorldId
                ? declaration.childRegionInitial
                : declaration.rootRegions.find((candidate) => candidate.rootId === world.address.rootId);
        const negative = endowment ? normalizeExactValue(endowment.negative) : undefined;
        const positive = endowment ? normalizeExactValue(endowment.positive) : undefined;
        if (!negative || !positive) return undefined;
        endowments.push({ id: region.id, negative, positive });
    }
    return {
        medium: {
            id: declaration.id,
            closure: declaration.closure,
            regions: endowments,
            placements: [...state.placements]
                .sort((left, right) => compareCanonicalStrings(left.worldId, right.worldId))
                .map((placement) => ({ worldId: placement.worldId, regionId: placement.regionId })),
            adjacency: [...state.adjacency]
                .sort((left, right) => compareCanonicalStrings(left.id, right.id))
                .map((edge) => ({ id: edge.id, regionIds: [...edge.regionIds] })),
            exchangeLaws: exchangeLaws.sort((left, right) => compareCanonicalStrings(left.id, right.id)),
        },
        regionOverrides,
        regionOverrideCauses,
    };
}

export function causalOptionsForEndogenousCompilation(
    compiled: CompiledEndogenousUniverse,
    requested: Omit<
        CausalExecutionOptions,
        "fieldOverrides" | "fieldOverrideCauses" | "worldLifecycleOverrides" | "seaRegionOverrides" | "seaRegionOverrideCauses"
    > = {},
): CausalExecutionOptions {
    // Continuation state and its provenance come only from the generated universe, never from the caller: a
    // caller-supplied override or cause would forge world or region history.
    const {
        fieldOverrides: _fieldOverrides,
        fieldOverrideCauses: _fieldOverrideCauses,
        worldLifecycleOverrides: _worldLifecycleOverrides,
        seaRegionOverrides: _seaRegionOverrides,
        seaRegionOverrideCauses: _seaRegionOverrideCauses,
        ...ordinary
    } = requested as CausalExecutionOptions;
    return {
        ...ordinary,
        fieldOverrides: compiled.fieldOverrides,
        fieldOverrideCauses: compiled.fieldOverrideCauses,
        ...(compiled.seaRegionOverrides ? { seaRegionOverrides: compiled.seaRegionOverrides } : {}),
        ...(compiled.seaRegionOverrideCauses && Object.keys(compiled.seaRegionOverrideCauses).length > 0
            ? { seaRegionOverrideCauses: compiled.seaRegionOverrideCauses }
            : {}),
        worldWillEnabled: requested.worldWillEnabled ?? false,
    };
}
