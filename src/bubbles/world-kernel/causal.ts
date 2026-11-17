import {
    compareExactRationals,
    exact,
    exactValuesEqual,
    normalizeExactValue,
    validateIntensionalSystem,
    type ExactValue,
    type IntensionalCoordinateQuery,
    type IntensionalSystem,
    type IntensionalValueKind,
} from "./intensional";
import { compareCanonicalStrings } from "./canonical-order";

export type CausalFieldRole =
    | "world-state"
    | "world-condition"
    | "structural-state"
    | "identity-state"
    | "memory-state"
    | "boundary-state"
    | "positive-sea"
    | "negative-sea"
    | "viability";

export interface CausalFieldBinding {
    id: string;
    familyId: string;
    role: CausalFieldRole;
}

export interface CausalWorldDefinition {
    id: string;
    initialExistence?: "active" | "latent";
    fields: CausalFieldBinding[];
    protectedFieldIds: string[];
    seaCoupling: {
        positiveFieldId: string;
        negativeFieldId: string;
        viabilityFieldId: string;
    };
}

export type CausalAnchorEndpoint =
    | { kind: "world"; worldId: string; portId: string }
    | {
        kind: "unresolved-world-relation";
        relationId: string;
        portId: string;
        questionId: string;
    };

export type CausalInterventionKind =
    | "condition"
    | "opportunity"
    | "constraint"
    | "signal"
    | "resource-gradient"
    | "boundary-pressure";

export interface CausalFieldEffect {
    fieldId: string;
    operation: "add" | "subtract" | "set";
    value: ExactValue;
}

export type CausalWorldLifecycleEffect =
    | { kind: "spawn-world"; targetWorldId: string }
    | { kind: "retire-self" };

export interface CausalAnchorTransferEndpoint {
    worldId: string;
    portId: string;
    fieldId: string;
}

export interface CausalAnchorTransferDefinition {
    id: string;
    anchorId: string;
    source: CausalAnchorTransferEndpoint;
    target: CausalAnchorTransferEndpoint;
    sourceNegativeSeaResidue: ExactValue;
    targetPositiveSeaPlacement: ExactValue;
}

export interface CausalAnchorDefinition {
    id: string;
    endpoints: CausalAnchorEndpoint[];
    identityPredicateFamilyIds: string[];
    permittedInterventionKinds: CausalInterventionKind[];
}

export interface CausalWorldWillObjective {
    id: string;
    targetWorldId: string;
    fieldId: string;
    direction: "maximize" | "minimize" | "stabilize";
    weight: ExactValue;
    targetValue?: ExactValue;
}

export interface CausalWorldWillIntervention {
    id: string;
    targetWorldId: string;
    anchorId: string;
    kind: CausalInterventionKind;
    effects: CausalFieldEffect[];
}

export interface CausalWorldWill {
    id: string;
    objectives: CausalWorldWillObjective[];
    hardConstraintFamilyIds: string[];
    interventions: CausalWorldWillIntervention[];
}

export interface CausalFieldParameterBinding {
    parameterName: string;
    worldId: string;
    fieldId: string;
}

export interface CausalStatePredicate {
    id: string;
    query: IntensionalCoordinateQuery;
    fieldParameters: CausalFieldParameterBinding[];
}

export interface CausalInternalLaw {
    id: string;
    worldId: string;
    guard: CausalStatePredicate;
    effects: CausalFieldEffect[];
    lifecycleEffects?: CausalWorldLifecycleEffect[];
    anchorTransferIds?: string[];
    application: "once-per-realization";
    reversibility: "reversible" | "irreversible";
    inverseEffects?: CausalFieldEffect[];
    commitAffectedFieldIds?: string[];
}

export interface CausalEmergenceCriterion {
    id: string;
    worldId: string;
    predicate: CausalStatePredicate;
    witnessFieldIds: string[];
}

// ---- Multiversal sea medium (v0.5.10 contract; see docs/architecture/v0.5.10-multiversal-sea-medium.md) ----

export type CausalSeaQuantity = "negative" | "positive";

/** A shared portion of the sea with exact non-negative quantities. */
export interface CausalSeaRegion {
    id: string;
    negative: ExactValue;
    positive: ExactValue;
}

/** Every declared world is placed in exactly one region. */
export interface CausalSeaPlacement {
    worldId: string;
    regionId: string;
}

/** Undirected nearness between two distinct regions. */
export interface CausalSeaAdjacency {
    id: string;
    regionIds: string[];
}

/** A region, or a world meaning that world's local sea field for the exchanged quantity. */
export type CausalSeaEndpoint =
    | { kind: "region"; regionId: string }
    | { kind: "world"; worldId: string };

export interface CausalSeaRegionParameterBinding {
    parameterName: string;
    regionId: string;
    quantity: CausalSeaQuantity;
}

/** A state predicate that may also bind endpoint region quantities. */
export interface CausalSeaPredicate extends CausalStatePredicate {
    regionParameters: CausalSeaRegionParameterBinding[];
}

/** One law of the medium itself: move an exact positive amount of one quantity between endpoints. */
export interface CausalSeaExchangeLaw {
    id: string;
    quantity: CausalSeaQuantity;
    from: CausalSeaEndpoint;
    to: CausalSeaEndpoint;
    amount: ExactValue;
    guard: CausalSeaPredicate;
    application: "once-per-realization";
}

export interface CausalSeaMedium {
    id: string;
    /** closed: only the medium moves sea quantity; open: other writes are recorded as production. */
    closure: "closed" | "open";
    regions: CausalSeaRegion[];
    placements: CausalSeaPlacement[];
    adjacency: CausalSeaAdjacency[];
    exchangeLaws: CausalSeaExchangeLaw[];
}

export interface AnchoredCausalWorldSystem {
    mode: "bubble-anchored-causal-world.v2";
    formal: IntensionalSystem;
    worlds: CausalWorldDefinition[];
    anchors: CausalAnchorDefinition[];
    anchorTransfers?: CausalAnchorTransferDefinition[];
    /** Shared positive and negative seas in which every world is placed; absent means local seas only. */
    seaMedium?: CausalSeaMedium;
    worldWill: CausalWorldWill;
    internalLaws: CausalInternalLaw[];
    emergenceCriteria: CausalEmergenceCriterion[];
    order: {
        kind: "causal-partial-order";
        universalClock: false;
    };
}

export interface CausalDiagnostic {
    code: string;
    severity: "error";
    path: string;
    message: string;
}

/** The two quantities of the sea medium, in portable canonical order. */
export const CAUSAL_SEA_QUANTITIES: readonly CausalSeaQuantity[] = ["negative", "positive"];

/** A world endpoint of the medium means that world's local sea field for the exchanged quantity. */
export function causalSeaFieldId(world: CausalWorldDefinition, quantity: CausalSeaQuantity): string {
    return quantity === "negative" ? world.seaCoupling.negativeFieldId : world.seaCoupling.positiveFieldId;
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
const FIELD_ROLES: CausalFieldRole[] = [
    "world-state", "world-condition", "structural-state", "identity-state", "memory-state",
    "boundary-state", "positive-sea", "negative-sea", "viability",
];
const INTERVENTION_KINDS: CausalInterventionKind[] = [
    "condition", "opportunity", "constraint", "signal", "resource-gradient", "boundary-pressure",
];

function issue(code: string, path: string, message: string): CausalDiagnostic {
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

function positiveRational(value: ExactValue): boolean {
    const normalized = normalizeExactValue(value);
    return normalized?.kind === "rational"
        && compareExactRationals(normalized, exact.integer(0)) === 1;
}

function nonNegativeRational(value: ExactValue): boolean {
    const normalized = normalizeExactValue(value);
    return normalized?.kind === "rational"
        && (compareExactRationals(normalized, exact.integer(0)) ?? -1) >= 0;
}

function inverseEffectMatches(effect: CausalFieldEffect, inverse: CausalFieldEffect): boolean {
    return effect.fieldId === inverse.fieldId
        && exactValuesEqual(effect.value, inverse.value)
        && ((effect.operation === "add" && inverse.operation === "subtract")
            || (effect.operation === "subtract" && inverse.operation === "add"));
}

function validatePredicate(
    predicate: CausalStatePredicate,
    path: string,
    system: AnchoredCausalWorldSystem,
    worlds: Map<string, CausalWorldDefinition>,
    fieldKinds: Map<string, IntensionalValueKind>,
    diagnostics: CausalDiagnostic[],
    regionParameters: CausalSeaRegionParameterBinding[] = [],
): void {
    if (!IDENTIFIER.test(predicate.id)) {
        diagnostics.push(issue("CKW001", `${path}.id`, "predicate id must be a stable identifier"));
    }
    const family = system.formal.families.find((candidate) => candidate.id === predicate.query.familyId);
    if (!family) {
        diagnostics.push(issue("CKW002", `${path}.query.familyId`, `unknown predicate family '${predicate.query.familyId}'`));
        return;
    }
    if (family.valueKind !== "boolean") {
        diagnostics.push(issue("CKW003", `${path}.query.familyId`, "state predicate family must return boolean"));
    }
    const declared = new Map(family.parameters.map((parameter) => [parameter.name, parameter.valueKind]));
    const supplied = new Set(Object.keys(predicate.query.parameters));
    for (const [index, binding] of predicate.fieldParameters.entries()) {
        const bindingPath = `${path}.fieldParameters[${index}]`;
        if (supplied.has(binding.parameterName)) {
            diagnostics.push(issue("CKW004", bindingPath, `parameter '${binding.parameterName}' is supplied more than once`));
            continue;
        }
        const expectedKind = declared.get(binding.parameterName);
        if (!expectedKind) {
            diagnostics.push(issue("CKW005", bindingPath, `family '${family.id}' has no parameter '${binding.parameterName}'`));
            continue;
        }
        supplied.add(binding.parameterName);
        const field = worlds.get(binding.worldId)?.fields.find((candidate) => candidate.id === binding.fieldId);
        if (!field) {
            diagnostics.push(issue("CKW006", bindingPath, `unknown bound field '${binding.worldId}.${binding.fieldId}'`));
            continue;
        }
        if (fieldKinds.get(`${binding.worldId}.${binding.fieldId}`) !== expectedKind) {
            diagnostics.push(issue("CKW007", bindingPath, `bound field kind must match parameter '${binding.parameterName}'`));
        }
    }
    // A sea-medium guard also supplies family parameters from region quantities, which are exact rationals.
    // Field and region bindings together must supply every family parameter exactly once.
    for (const [index, binding] of regionParameters.entries()) {
        const bindingPath = `${path}.regionParameters[${index}]`;
        if (supplied.has(binding.parameterName)) {
            diagnostics.push(issue("CKW229", bindingPath, `parameter '${binding.parameterName}' is supplied more than once`));
            continue;
        }
        const expectedKind = declared.get(binding.parameterName);
        if (!expectedKind) {
            diagnostics.push(issue("CKW230", bindingPath, `family '${family.id}' has no parameter '${binding.parameterName}'`));
            continue;
        }
        supplied.add(binding.parameterName);
        if (expectedKind !== "rational") {
            diagnostics.push(issue("CKW231", bindingPath, `region quantity is an exact rational but parameter '${binding.parameterName}' is '${expectedKind}'`));
        }
    }
    for (const parameterName of declared.keys()) {
        if (!supplied.has(parameterName)) {
            diagnostics.push(issue("CKW008", path, `predicate is missing parameter '${parameterName}'`));
        }
    }
    for (const parameterName of supplied) {
        if (!declared.has(parameterName)) {
            diagnostics.push(issue("CKW009", path, `predicate supplies undeclared parameter '${parameterName}'`));
        }
    }
}

function validateEffects(
    effects: CausalFieldEffect[],
    path: string,
    world: CausalWorldDefinition | undefined,
    diagnostics: CausalDiagnostic[],
    requireNonEmpty = true,
): void {
    if (requireNonEmpty && effects.length === 0) {
        diagnostics.push(issue("CKW010", path, "a transition needs at least one exact field effect"));
    }
    duplicates(effects.map((effect) => effect.fieldId)).forEach((fieldId) => diagnostics.push(
        issue("CKW011", path, `a single transition cannot affect field '${fieldId}' more than once`),
    ));
    for (const [index, effect] of effects.entries()) {
        if (!world?.fields.some((field) => field.id === effect.fieldId)) {
            diagnostics.push(issue("CKW012", `${path}[${index}].fieldId`, `unknown local field '${effect.fieldId}'`));
        }
        if (!normalizeExactValue(effect.value)) {
            diagnostics.push(issue("CKW013", `${path}[${index}].value`, "field effect needs a valid exact value"));
        }
        if (!(["add", "subtract", "set"] as string[]).includes(effect.operation)) {
            diagnostics.push(issue("CKW014", `${path}[${index}].operation`, `unsupported operation '${String(effect.operation)}'`));
        }
    }
}

function validateEffectKinds(
    effects: CausalFieldEffect[],
    path: string,
    world: CausalWorldDefinition | undefined,
    families: Map<string, IntensionalSystem["families"][number]>,
    diagnostics: CausalDiagnostic[],
): void {
    for (const [index, effect] of effects.entries()) {
        const field = world?.fields.find((candidate) => candidate.id === effect.fieldId);
        const expectedKind = field ? families.get(field.familyId)?.valueKind : undefined;
        const value = normalizeExactValue(effect.value);
        if (expectedKind && value && value.kind !== expectedKind) {
            diagnostics.push(issue("CKW064", `${path}[${index}].value`, `effect value must have kind '${expectedKind}'`));
        }
        if (expectedKind && effect.operation !== "set" && expectedKind !== "rational") {
            diagnostics.push(issue("CKW065", `${path}[${index}].operation`, "add and subtract require an exact rational field"));
        }
    }
}

export function validateAnchoredCausalWorld(system: AnchoredCausalWorldSystem): CausalDiagnostic[] {
    const diagnostics: CausalDiagnostic[] = validateIntensionalSystem(system.formal).map((entry) => ({
        code: `CKW-${entry.code}`,
        severity: "error" as const,
        path: `formal.${entry.path}`,
        message: entry.message,
    }));
    if (system.mode !== "bubble-anchored-causal-world.v2") {
        diagnostics.push(issue("CKW015", "mode", "unsupported anchored causal world mode"));
    }
    if (system.order.kind !== "causal-partial-order" || system.order.universalClock !== false) {
        diagnostics.push(issue("CKW016", "order", "world order must remain causal without a forced universal clock"));
    }
    if (system.worlds.length === 0) {
        diagnostics.push(issue("CKW017", "worlds", "an anchored causal system needs at least one world"));
    }
    duplicates(system.worlds.map((world) => world.id)).forEach((id) => diagnostics.push(
        issue("CKW018", "worlds", `duplicate world id '${id}'`),
    ));
    const worlds = new Map(system.worlds.map((world) => [world.id, world]));
    const families = new Map(system.formal.families.map((family) => [family.id, family]));
    const fieldKinds = new Map<string, IntensionalValueKind>();

    if (system.anchors.length === 0) {
        diagnostics.push(issue("CKW052", "anchors", "an anchored causal system needs at least one anchor"));
    }

    for (const [worldIndex, world] of system.worlds.entries()) {
        const worldPath = `worlds[${worldIndex}]`;
        if (!IDENTIFIER.test(world.id)) diagnostics.push(issue("CKW019", `${worldPath}.id`, "world id must be stable"));
        if (world.initialExistence !== undefined && !["active", "latent"].includes(world.initialExistence)) {
            diagnostics.push(issue("CKW073", `${worldPath}.initialExistence`, "initial existence must be active or latent"));
        }
        if (world.fields.length === 0) diagnostics.push(issue("CKW053", `${worldPath}.fields`, "a world needs exact state fields"));
        duplicates(world.fields.map((field) => field.id)).forEach((id) => diagnostics.push(
            issue("CKW020", `${worldPath}.fields`, `duplicate field id '${id}'`),
        ));
        for (const [fieldIndex, field] of world.fields.entries()) {
            if (!IDENTIFIER.test(field.id)) diagnostics.push(issue("CKW054", `${worldPath}.fields[${fieldIndex}].id`, "field id must be stable"));
            if (!FIELD_ROLES.includes(field.role)) diagnostics.push(issue("CKW055", `${worldPath}.fields[${fieldIndex}].role`, `unknown field role '${String(field.role)}'`));
            const family = families.get(field.familyId);
            if (!family) {
                diagnostics.push(issue("CKW021", `${worldPath}.fields[${fieldIndex}].familyId`, `unknown family '${field.familyId}'`));
                continue;
            }
            fieldKinds.set(`${world.id}.${field.id}`, family.valueKind);
        }
        for (const [name, fieldId, role] of [
            ["positiveFieldId", world.seaCoupling.positiveFieldId, "positive-sea"],
            ["negativeFieldId", world.seaCoupling.negativeFieldId, "negative-sea"],
            ["viabilityFieldId", world.seaCoupling.viabilityFieldId, "viability"],
        ] as const) {
            const field = world.fields.find((candidate) => candidate.id === fieldId);
            if (!field || field.role !== role || families.get(field.familyId)?.valueKind !== "rational") {
                diagnostics.push(issue("CKW022", `${worldPath}.seaCoupling.${name}`, `field '${fieldId}' must be an exact rational '${role}' field`));
            }
        }
        duplicates(world.protectedFieldIds).forEach((id) => diagnostics.push(
            issue("CKW023", `${worldPath}.protectedFieldIds`, `duplicate protected field '${id}'`),
        ));
        for (const fieldId of world.protectedFieldIds) {
            if (!world.fields.some((field) => field.id === fieldId)) {
                diagnostics.push(issue("CKW024", `${worldPath}.protectedFieldIds`, `unknown protected field '${fieldId}'`));
            }
        }
    }

    duplicates(system.anchors.map((anchor) => anchor.id)).forEach((id) => diagnostics.push(
        issue("CKW025", "anchors", `duplicate anchor id '${id}'`),
    ));
    const anchors = new Map(system.anchors.map((anchor) => [anchor.id, anchor]));
    for (const [anchorIndex, anchor] of system.anchors.entries()) {
        const path = `anchors[${anchorIndex}]`;
        if (!IDENTIFIER.test(anchor.id)) diagnostics.push(issue("CKW056", `${path}.id`, "anchor id must be stable"));
        if (anchor.endpoints.length === 0 || !anchor.endpoints.some((endpoint) => endpoint.kind === "world")) {
            diagnostics.push(issue("CKW026", `${path}.endpoints`, "an anchor needs at least one world endpoint"));
        }
        const endpointKeys = new Set<string>();
        for (const endpoint of anchor.endpoints) {
            if (!IDENTIFIER.test(endpoint.portId)) {
                diagnostics.push(issue("CKW082", `${path}.endpoints`, `anchor port '${endpoint.portId}' must be stable`));
            }
            if (endpoint.kind === "world" && !worlds.has(endpoint.worldId)) {
                diagnostics.push(issue("CKW027", `${path}.endpoints`, `unknown anchor world '${endpoint.worldId}'`));
            }
            const endpointKey = endpoint.kind === "world"
                ? `world:${endpoint.worldId}:${endpoint.portId}`
                : `relation:${endpoint.relationId}:${endpoint.portId}`;
            if (endpointKeys.has(endpointKey)) {
                diagnostics.push(issue("CKW083", `${path}.endpoints`, `duplicate anchor endpoint '${endpointKey}'`));
            }
            endpointKeys.add(endpointKey);
        }
        if (anchor.identityPredicateFamilyIds.length === 0) {
            diagnostics.push(issue("CKW057", `${path}.identityPredicateFamilyIds`, "anchor identity needs at least one exact predicate"));
        }
        duplicates(anchor.identityPredicateFamilyIds).forEach((familyId) => diagnostics.push(
            issue("CKW058", `${path}.identityPredicateFamilyIds`, `duplicate identity family '${familyId}'`),
        ));
        duplicates(anchor.permittedInterventionKinds).forEach((kind) => diagnostics.push(
            issue("CKW059", `${path}.permittedInterventionKinds`, `duplicate intervention kind '${kind}'`),
        ));
        for (const kind of anchor.permittedInterventionKinds) {
            if (!INTERVENTION_KINDS.includes(kind)) diagnostics.push(issue("CKW060", `${path}.permittedInterventionKinds`, `unknown intervention kind '${String(kind)}'`));
        }
        for (const familyId of anchor.identityPredicateFamilyIds) {
            if (families.get(familyId)?.valueKind !== "boolean") {
                diagnostics.push(issue("CKW028", `${path}.identityPredicateFamilyIds`, `identity family '${familyId}' must be boolean`));
            }
        }
    }

    const anchorTransfers = system.anchorTransfers ?? [];
    duplicates(anchorTransfers.map((transfer) => transfer.id)).forEach((id) => diagnostics.push(
        issue("CKW084", "anchorTransfers", `duplicate anchor transfer id '${id}'`),
    ));
    const transfers = new Map(anchorTransfers.map((transfer) => [transfer.id, transfer]));
    for (const [transferIndex, transfer] of anchorTransfers.entries()) {
        const path = `anchorTransfers[${transferIndex}]`;
        if (!IDENTIFIER.test(transfer.id)) {
            diagnostics.push(issue("CKW085", `${path}.id`, "anchor transfer id must be stable"));
        }
        const anchor = anchors.get(transfer.anchorId);
        if (!anchor) {
            diagnostics.push(issue("CKW086", `${path}.anchorId`, `unknown transfer anchor '${transfer.anchorId}'`));
        }
        const sourceWorld = worlds.get(transfer.source.worldId);
        const targetWorld = worlds.get(transfer.target.worldId);
        if (!sourceWorld || !targetWorld) {
            diagnostics.push(issue("CKW087", path, "anchor transfer endpoints must name declared worlds"));
        }
        if (transfer.source.worldId === transfer.target.worldId) {
            diagnostics.push(issue("CKW088", path, "anchor transfer must cross between distinct worlds"));
        }
        for (const [endpointName, endpoint] of [
            ["source", transfer.source],
            ["target", transfer.target],
        ] as const) {
            if (!IDENTIFIER.test(endpoint.portId)) {
                diagnostics.push(issue("CKW082", `${path}.${endpointName}.portId`, "transfer port must be stable"));
            }
            if (anchor && !anchor.endpoints.some((candidate) => (
                candidate.kind === "world"
                && candidate.worldId === endpoint.worldId
                && candidate.portId === endpoint.portId
            ))) {
                diagnostics.push(issue(
                    "CKW089",
                    `${path}.${endpointName}`,
                    `anchor '${anchor.id}' has no '${endpoint.worldId}.${endpoint.portId}' endpoint`,
                ));
            }
        }
        const sourceField = sourceWorld?.fields.find((field) => field.id === transfer.source.fieldId);
        const targetField = targetWorld?.fields.find((field) => field.id === transfer.target.fieldId);
        if (!sourceField || !targetField) {
            diagnostics.push(issue("CKW090", path, "anchor transfer fields must exist at both endpoints"));
        } else {
            const sourceKind = families.get(sourceField.familyId)?.valueKind;
            const targetKind = families.get(targetField.familyId)?.valueKind;
            if (!sourceKind || sourceKind !== targetKind) {
                diagnostics.push(issue("CKW091", path, "anchor transfer source and target fields must have the same exact value kind"));
            }
            if (["positive-sea", "negative-sea", "viability"].includes(sourceField.role)) {
                diagnostics.push(issue(
                    "CKW103",
                    `${path}.source.fieldId`,
                    "sea coordinates are coupled by transfer accounting and cannot masquerade as payload fields",
                ));
            }
            if (targetField.role !== "world-condition" || targetWorld?.protectedFieldIds.includes(targetField.id)) {
                diagnostics.push(issue(
                    "CKW092",
                    `${path}.target.fieldId`,
                    "the first cross-world membrane may write only an unprotected world-condition port",
                ));
            }
        }
        if (!nonNegativeRational(transfer.sourceNegativeSeaResidue)
            || !nonNegativeRational(transfer.targetPositiveSeaPlacement)
            || (exactValuesEqual(transfer.sourceNegativeSeaResidue, exact.integer(0))
                && exactValuesEqual(transfer.targetPositiveSeaPlacement, exact.integer(0)))) {
            diagnostics.push(issue(
                "CKW093",
                path,
                "anchor transfer sea coupling needs non-negative exact rational residue/placement with at least one material effect",
            ));
        }
    }

    duplicates(system.worldWill.objectives.map((objective) => objective.id)).forEach((id) => diagnostics.push(
        issue("CKW029", "worldWill.objectives", `duplicate objective id '${id}'`),
    ));
    const objectiveWorlds = new Set<string>();
    if (!IDENTIFIER.test(system.worldWill.id)) diagnostics.push(issue("CKW061", "worldWill.id", "World Will id must be stable"));
    for (const [index, objective] of system.worldWill.objectives.entries()) {
        const path = `worldWill.objectives[${index}]`;
        if (!IDENTIFIER.test(objective.id)) diagnostics.push(issue("CKW062", `${path}.id`, "objective id must be stable"));
        if (!["maximize", "minimize", "stabilize"].includes(objective.direction)) {
            diagnostics.push(issue("CKW063", `${path}.direction`, `unknown objective direction '${String(objective.direction)}'`));
        }
        const targetValue = objective.targetValue ? normalizeExactValue(objective.targetValue) : undefined;
        if (objective.direction === "stabilize" && targetValue?.kind !== "rational") {
            diagnostics.push(issue("CKW071", `${path}.targetValue`, "stabilize objective needs an explicit exact rational target value"));
        }
        if (objective.direction !== "stabilize" && objective.targetValue !== undefined) {
            diagnostics.push(issue("CKW072", `${path}.targetValue`, "only stabilize objectives may declare a target value"));
        }
        const world = worlds.get(objective.targetWorldId);
        const field = world?.fields.find((candidate) => candidate.id === objective.fieldId);
        if (!field || families.get(field.familyId)?.valueKind !== "rational") {
            diagnostics.push(issue("CKW030", path, "World Will objective needs a local exact rational field"));
        }
        if (!positiveRational(objective.weight)) {
            diagnostics.push(issue("CKW031", `${path}.weight`, "World Will objective weight must be a positive exact rational"));
        }
        objectiveWorlds.add(objective.targetWorldId);
    }
    for (const world of system.worlds) {
        if (!objectiveWorlds.has(world.id)) {
            diagnostics.push(issue("CKW032", "worldWill.objectives", `World Will needs an explicit objective for '${world.id}'`));
        }
    }
    for (const familyId of system.worldWill.hardConstraintFamilyIds) {
        if (families.get(familyId)?.valueKind !== "boolean") {
            diagnostics.push(issue("CKW033", "worldWill.hardConstraintFamilyIds", `hard constraint family '${familyId}' must be boolean`));
        }
    }

    duplicates(system.worldWill.interventions.map((intervention) => intervention.id)).forEach((id) => diagnostics.push(
        issue("CKW034", "worldWill.interventions", `duplicate intervention id '${id}'`),
    ));
    for (const [index, intervention] of system.worldWill.interventions.entries()) {
        const path = `worldWill.interventions[${index}]`;
        const world = worlds.get(intervention.targetWorldId);
        const anchor = anchors.get(intervention.anchorId);
        if (!world) diagnostics.push(issue("CKW035", `${path}.targetWorldId`, `unknown world '${intervention.targetWorldId}'`));
        if (!anchor) {
            diagnostics.push(issue("CKW036", `${path}.anchorId`, `unknown anchor '${intervention.anchorId}'`));
        } else {
            if (!anchor.endpoints.some((endpoint) => endpoint.kind === "world" && endpoint.worldId === intervention.targetWorldId)) {
                diagnostics.push(issue("CKW037", `${path}.anchorId`, `anchor '${anchor.id}' does not reach '${intervention.targetWorldId}'`));
            }
            if (!anchor.permittedInterventionKinds.includes(intervention.kind)) {
                diagnostics.push(issue("CKW038", `${path}.kind`, `anchor '${anchor.id}' does not permit '${intervention.kind}'`));
            }
        }
        validateEffects(intervention.effects, `${path}.effects`, world, diagnostics);
        validateEffectKinds(intervention.effects, `${path}.effects`, world, families, diagnostics);
        for (const effect of intervention.effects) {
            const field = world?.fields.find((candidate) => candidate.id === effect.fieldId);
            if (world?.protectedFieldIds.includes(effect.fieldId)) {
                diagnostics.push(issue("CKW039", `${path}.effects`, `World Will cannot directly mutate protected field '${effect.fieldId}'`));
            }
            if (field && !["world-condition", "boundary-state", "positive-sea", "negative-sea", "viability"].includes(field.role)) {
                diagnostics.push(issue("CKW040", `${path}.effects`, `World Will cannot directly mutate '${field.role}'`));
            }
        }
    }

    duplicates(system.internalLaws.map((law) => law.id)).forEach((id) => diagnostics.push(
        issue("CKW041", "internalLaws", `duplicate internal law id '${id}'`),
    ));
    const transferReferenceCounts = new Map<string, number>();
    for (const [index, law] of system.internalLaws.entries()) {
        const path = `internalLaws[${index}]`;
        const world = worlds.get(law.worldId);
        if (!IDENTIFIER.test(law.id)) diagnostics.push(issue("CKW066", `${path}.id`, "internal law id must be stable"));
        if (law.application !== "once-per-realization") diagnostics.push(issue("CKW067", `${path}.application`, "unsupported internal-law application mode"));
        if (law.reversibility !== "reversible" && law.reversibility !== "irreversible") {
            diagnostics.push(issue("CKW068", `${path}.reversibility`, "internal law must declare reversible or irreversible"));
        }
        if (!world) diagnostics.push(issue("CKW042", `${path}.worldId`, `unknown law world '${law.worldId}'`));
        validatePredicate(law.guard, `${path}.guard`, system, worlds, fieldKinds, diagnostics);
        for (const [bindingIndex, binding] of law.guard.fieldParameters.entries()) {
            if (binding.worldId !== law.worldId) {
                diagnostics.push(issue(
                    "CKW081",
                    `${path}.guard.fieldParameters[${bindingIndex}]`,
                    "an internal law cannot read another world without a typed anchor-transfer contract",
                ));
            }
        }
        const lifecycleEffects = law.lifecycleEffects ?? [];
        const transferIds = law.anchorTransferIds ?? [];
        if (law.effects.length === 0 && lifecycleEffects.length === 0 && transferIds.length === 0) {
            diagnostics.push(issue("CKW074", path, "an internal law needs at least one field, lifecycle, or anchor-transfer effect"));
        }
        validateEffects(law.effects, `${path}.effects`, world, diagnostics, false);
        validateEffectKinds(law.effects, `${path}.effects`, world, families, diagnostics);
        const lifecycleKeys = lifecycleEffects.map((effect) => (
            effect.kind === "spawn-world" ? `spawn:${effect.targetWorldId}` : "retire:self"
        ));
        duplicates(lifecycleKeys).forEach((key) => diagnostics.push(
            issue("CKW075", `${path}.lifecycleEffects`, `duplicate lifecycle transition '${key}'`),
        ));
        for (const [effectIndex, effect] of lifecycleEffects.entries()) {
            const effectPath = `${path}.lifecycleEffects[${effectIndex}]`;
            if (effect.kind === "spawn-world") {
                const target = worlds.get(effect.targetWorldId);
                if (!target) {
                    diagnostics.push(issue("CKW076", `${effectPath}.targetWorldId`, `unknown spawned world '${effect.targetWorldId}'`));
                } else if (effect.targetWorldId === law.worldId) {
                    diagnostics.push(issue("CKW077", effectPath, "a world cannot spawn itself as a new world"));
                } else if (target.initialExistence !== "latent") {
                    diagnostics.push(issue("CKW078", effectPath, `spawn target '${effect.targetWorldId}' must be declared latent`));
                }
            } else if (effect.kind !== "retire-self") {
                diagnostics.push(issue("CKW079", `${effectPath}.kind`, `unknown lifecycle effect '${String((effect as { kind?: unknown }).kind)}'`));
            }
        }
        if (lifecycleEffects.length > 0 && law.reversibility !== "irreversible") {
            diagnostics.push(issue("CKW080", path, "world birth and retirement are irreversible causal transitions"));
        }
        duplicates(transferIds).forEach((transferId) => diagnostics.push(
            issue("CKW094", `${path}.anchorTransferIds`, `duplicate anchor transfer '${transferId}'`),
        ));
        if (transferIds.length > 1) {
            diagnostics.push(issue("CKW097", `${path}.anchorTransferIds`, "one internal causal event may cause one exact crossing; simultaneous crossings compose as a frontier of distinct laws"));
        }
        for (const transferId of transferIds) {
            const transfer = transfers.get(transferId);
            transferReferenceCounts.set(transferId, (transferReferenceCounts.get(transferId) ?? 0) + 1);
            if (!transfer) {
                diagnostics.push(issue("CKW095", `${path}.anchorTransferIds`, `unknown anchor transfer '${transferId}'`));
            } else if (transfer.source.worldId !== law.worldId) {
                diagnostics.push(issue(
                    "CKW096",
                    `${path}.anchorTransferIds`,
                    `transfer '${transferId}' must be caused by an internal law of its source world`,
                ));
            }
        }
        if (transferIds.length > 0
            && (law.effects.length > 0 || lifecycleEffects.length > 0 || (law.commitAffectedFieldIds?.length ?? 0) > 0)) {
            diagnostics.push(issue(
                "CKW098",
                path,
                "a transfer law is atomic and cannot mix local, lifecycle, or commit effects",
            ));
        }
        if (transferIds.length > 0 && law.reversibility !== "irreversible") {
            diagnostics.push(issue("CKW099", path, "anchor crossing with sea residue/placement is irreversible"));
        }
        if (law.reversibility === "reversible") {
            if (!law.inverseEffects || law.inverseEffects.length !== law.effects.length) {
                diagnostics.push(issue("CKW043", `${path}.inverseEffects`, "reversible law needs one exact additive inverse per effect"));
            } else {
                validateEffects(law.inverseEffects, `${path}.inverseEffects`, world, diagnostics);
                validateEffectKinds(law.inverseEffects, `${path}.inverseEffects`, world, families, diagnostics);
                const unmatched = [...law.inverseEffects];
                for (const effect of law.effects) {
                    const inverseIndex = unmatched.findIndex((inverse) => inverseEffectMatches(effect, inverse));
                    if (inverseIndex < 0) diagnostics.push(issue("CKW044", `${path}.inverseEffects`, `effect on '${effect.fieldId}' lacks an exact inverse`));
                    else unmatched.splice(inverseIndex, 1);
                }
            }
        } else if (law.inverseEffects?.length) {
            diagnostics.push(issue("CKW045", `${path}.inverseEffects`, "irreversible law must not claim an inverse"));
        }
        duplicates(law.commitAffectedFieldIds ?? []).forEach((fieldId) => diagnostics.push(
            issue("CKW105", `${path}.commitAffectedFieldIds`, `duplicate committed field '${fieldId}'`),
        ));
        for (const fieldId of law.commitAffectedFieldIds ?? []) {
            if (!world?.fields.some((field) => field.id === fieldId)) {
                diagnostics.push(issue("CKW046", `${path}.commitAffectedFieldIds`, `unknown committed field '${fieldId}'`));
            }
        }
        if ((law.commitAffectedFieldIds?.length ?? 0) > 0 && law.reversibility !== "irreversible") {
            diagnostics.push(issue("CKW047", path, "a history-committing law must be irreversible"));
        }
    }
    for (const transfer of anchorTransfers) {
        const count = transferReferenceCounts.get(transfer.id) ?? 0;
        if (count !== 1) {
            diagnostics.push(issue(
                "CKW100",
                "anchorTransfers",
                `anchor transfer '${transfer.id}' must be caused by exactly one internal law; found ${count}`,
            ));
        }
    }
    const transferTargetKeys = new Set<string>();
    for (const transfer of anchorTransfers) {
        const sourceWorld = worlds.get(transfer.source.worldId);
        const targetWorld = worlds.get(transfer.target.worldId);
        if (!sourceWorld || !targetWorld) continue;
        const targetKey = `${transfer.target.worldId}.${transfer.target.fieldId}`;
        if (transferTargetKeys.has(targetKey)) {
            diagnostics.push(issue(
                "CKW101",
                "anchorTransfers",
                `simultaneous exact transport reserves one incoming transfer for target port field '${targetKey}'`,
            ));
        }
        transferTargetKeys.add(targetKey);
        const reservedKeys = new Set([
            `${transfer.source.worldId}.${transfer.source.fieldId}`,
            targetKey,
            `${transfer.source.worldId}.${sourceWorld.seaCoupling.negativeFieldId}`,
            `${transfer.target.worldId}.${targetWorld.seaCoupling.positiveFieldId}`,
        ]);
        const competingWriters = system.internalLaws.flatMap((law) => law.effects
            .filter((effect) => reservedKeys.has(`${law.worldId}.${effect.fieldId}`))
            .map((effect) => `${law.id}:${law.worldId}.${effect.fieldId}`));
        if (competingWriters.length > 0) {
            diagnostics.push(issue(
                "CKW102",
                "anchorTransfers",
                `transfer '${transfer.id}' snapshot, target, and sea-accounting fields cannot have local writers in the same closure: ${competingWriters.sort().join(", ")}`,
            ));
        }
    }
    for (let leftIndex = 0; leftIndex < anchorTransfers.length; leftIndex += 1) {
        const left = anchorTransfers[leftIndex]!;
        const leftTarget = `${left.target.worldId}.${left.target.fieldId}`;
        for (let rightIndex = leftIndex + 1; rightIndex < anchorTransfers.length; rightIndex += 1) {
            const right = anchorTransfers[rightIndex]!;
            const rightTarget = `${right.target.worldId}.${right.target.fieldId}`;
            const leftSource = `${left.source.worldId}.${left.source.fieldId}`;
            const rightSource = `${right.source.worldId}.${right.source.fieldId}`;
            if (leftTarget === rightSource || rightTarget === leftSource) {
                diagnostics.push(issue(
                    "CKW104",
                    "anchorTransfers",
                    `transfers '${left.id}' and '${right.id}' cannot derive one another inside a simultaneous frontier; chained transport needs a later causal frontier`,
                ));
            }
        }
    }

    duplicates(system.emergenceCriteria.map((criterion) => criterion.id)).forEach((id) => diagnostics.push(
        issue("CKW048", "emergenceCriteria", `duplicate emergence criterion id '${id}'`),
    ));
    for (const [index, criterion] of system.emergenceCriteria.entries()) {
        const path = `emergenceCriteria[${index}]`;
        if (!IDENTIFIER.test(criterion.id)) diagnostics.push(issue("CKW069", `${path}.id`, "emergence criterion id must be stable"));
        const world = worlds.get(criterion.worldId);
        if (!world) diagnostics.push(issue("CKW049", `${path}.worldId`, `unknown emergence world '${criterion.worldId}'`));
        validatePredicate(criterion.predicate, `${path}.predicate`, system, worlds, fieldKinds, diagnostics);
        if (criterion.witnessFieldIds.length === 0) {
            diagnostics.push(issue("CKW050", `${path}.witnessFieldIds`, "emergence needs at least one exact witness field"));
        }
        duplicates(criterion.witnessFieldIds).forEach((fieldId) => diagnostics.push(
            issue("CKW070", `${path}.witnessFieldIds`, `duplicate witness field '${fieldId}'`),
        ));
        for (const fieldId of criterion.witnessFieldIds) {
            if (!world?.fields.some((field) => field.id === fieldId)) {
                diagnostics.push(issue("CKW051", `${path}.witnessFieldIds`, `unknown witness field '${fieldId}'`));
            }
        }
    }

    validateSeaMedium(system, worlds, fieldKinds, diagnostics);
    return diagnostics;
}

function isZeroRational(value: ExactValue): boolean {
    return exactValuesEqual(value, exact.integer(0));
}

/** Order-free identity of an undirected adjacency between two regions. */
function unorderedRegionPair(left: string, right: string): string {
    return [left, right].sort(compareCanonicalStrings).join(" ");
}

function seaEndpointLabel(endpoint: CausalSeaEndpoint): string {
    return endpoint.kind === "region" ? `region '${endpoint.regionId}'` : `world '${endpoint.worldId}'`;
}

/**
 * Validates the v0.5.10 multiversal sea medium (CKW2xx). Every collection is read as a set: the checks key
 * regions, placements, adjacency, and exchange laws by identity, never by declaration position.
 */
function validateSeaMedium(
    system: AnchoredCausalWorldSystem,
    worlds: Map<string, CausalWorldDefinition>,
    fieldKinds: Map<string, IntensionalValueKind>,
    diagnostics: CausalDiagnostic[],
): void {
    const medium = system.seaMedium as unknown;
    if (medium === undefined) return;
    const record = medium as Record<string, unknown> | null;
    if (record === null || typeof record !== "object" || Array.isArray(record)
        || typeof record.id !== "string" || typeof record.closure !== "string"
        || !["regions", "placements", "adjacency", "exchangeLaws"].every((key) => Array.isArray(record[key]))) {
        diagnostics.push(issue("CKW238", "seaMedium", "a sea medium must be a declaration with id, closure, regions, placements, adjacency, and exchangeLaws"));
        return;
    }
    validateSeaMediumShape(system as AnchoredCausalWorldSystem & { seaMedium: CausalSeaMedium }, worlds, fieldKinds, diagnostics);
}

function validateSeaMediumShape(
    system: AnchoredCausalWorldSystem & { seaMedium: CausalSeaMedium },
    worlds: Map<string, CausalWorldDefinition>,
    fieldKinds: Map<string, IntensionalValueKind>,
    diagnostics: CausalDiagnostic[],
): void {
    const medium = system.seaMedium;
    if (!IDENTIFIER.test(medium.id)) diagnostics.push(issue("CKW200", "seaMedium.id", "sea medium id must be stable"));
    if (worlds.has(medium.id)) {
        diagnostics.push(issue("CKW201", "seaMedium.id", `sea medium id '${medium.id}' cannot also name a world`));
    }
    if (medium.closure !== "closed" && medium.closure !== "open") {
        diagnostics.push(issue("CKW202", "seaMedium.closure", "sea medium closure must be closed or open"));
    }
    // A closed medium is the only source and sink of sea, so no law or intervention may write any sea-role field,
    // including sea-role fields outside the coupling (they stay frozen and outside the medium's accounting).
    if (medium.closure === "closed") {
        const seaRole = (worldId: string, fieldId: string): boolean => {
            const role = worlds.get(worldId)?.fields.find((field) => field.id === fieldId)?.role;
            return role === "negative-sea" || role === "positive-sea";
        };
        const writers: Array<{ path: string; worldId: string; effects: Array<{ fieldId: string }> }> = [
            ...system.internalLaws.flatMap((law, index) => [
                { path: `internalLaws[${index}].effects`, worldId: law.worldId, effects: law.effects },
                { path: `internalLaws[${index}].inverseEffects`, worldId: law.worldId, effects: law.inverseEffects ?? [] },
            ]),
            ...system.worldWill.interventions.map((intervention, index) => ({
                path: `worldWill.interventions[${index}].effects`,
                worldId: intervention.targetWorldId,
                effects: intervention.effects,
            })),
        ];
        for (const writer of writers) {
            for (const effect of writer.effects) {
                if (seaRole(writer.worldId, effect.fieldId)) {
                    diagnostics.push(issue(
                        "CKW237",
                        writer.path,
                        `a closed sea medium forbids writing the sea-role field '${writer.worldId}.${effect.fieldId}'`,
                    ));
                }
            }
        }
    }

    if (medium.regions.length === 0) diagnostics.push(issue("CKW203", "seaMedium.regions", "a sea medium needs at least one region"));
    duplicates(medium.regions.map((region) => region.id)).forEach((id) => diagnostics.push(
        issue("CKW205", "seaMedium.regions", `duplicate sea region id '${id}'`),
    ));
    const regions = new Map(medium.regions.map((region) => [region.id, region]));
    for (const [index, region] of medium.regions.entries()) {
        const path = `seaMedium.regions[${index}]`;
        if (!IDENTIFIER.test(region.id)) diagnostics.push(issue("CKW204", `${path}.id`, "sea region id must be stable"));
        for (const quantity of CAUSAL_SEA_QUANTITIES) {
            if (!nonNegativeRational(region[quantity])) {
                diagnostics.push(issue("CKW206", `${path}.${quantity}`, `sea region ${quantity} quantity must be a non-negative exact rational`));
            }
        }
    }

    const placementsByWorld = new Map<string, string[]>();
    for (const [index, placement] of medium.placements.entries()) {
        const path = `seaMedium.placements[${index}]`;
        if (!worlds.has(placement.worldId)) {
            diagnostics.push(issue("CKW207", `${path}.worldId`, `placement names unknown world '${placement.worldId}'`));
        }
        if (!regions.has(placement.regionId)) {
            diagnostics.push(issue("CKW208", `${path}.regionId`, `placement names unknown sea region '${placement.regionId}'`));
        }
        placementsByWorld.set(placement.worldId, [...placementsByWorld.get(placement.worldId) ?? [], placement.regionId]);
    }
    for (const world of system.worlds) {
        const placed = placementsByWorld.get(world.id) ?? [];
        if (placed.length === 0) {
            diagnostics.push(issue("CKW210", "seaMedium.placements", `world '${world.id}' is not placed in any sea region`));
        } else if (placed.length > 1) {
            diagnostics.push(issue("CKW209", "seaMedium.placements", `world '${world.id}' is placed more than once`));
        }
    }
    const placementOf = new Map([...placementsByWorld]
        .filter(([, placed]) => placed.length === 1)
        .map(([worldId, placed]) => [worldId, placed[0]!]));

    duplicates(medium.adjacency.map((edge) => edge.id)).forEach((id) => diagnostics.push(
        issue("CKW212", "seaMedium.adjacency", `duplicate sea adjacency id '${id}'`),
    ));
    const adjacentPairs = new Set<string>();
    for (const [index, edge] of medium.adjacency.entries()) {
        const path = `seaMedium.adjacency[${index}]`;
        if (!IDENTIFIER.test(edge.id)) diagnostics.push(issue("CKW211", `${path}.id`, "sea adjacency id must be stable"));
        const regionIds = Array.isArray(edge.regionIds) ? edge.regionIds : [];
        if (regionIds.length !== 2 || regionIds[0] === regionIds[1] || regionIds.some((regionId) => !regions.has(regionId))) {
            diagnostics.push(issue("CKW213", `${path}.regionIds`, "a sea adjacency joins exactly two distinct declared regions"));
            continue;
        }
        const pair = unorderedRegionPair(regionIds[0]!, regionIds[1]!);
        if (adjacentPairs.has(pair)) {
            diagnostics.push(issue("CKW214", `${path}.regionIds`, `regions '${regionIds.join("', '")}' are already adjacent`));
        }
        adjacentPairs.add(pair);
    }

    duplicates(medium.exchangeLaws.map((law) => law.id)).forEach((id) => diagnostics.push(
        issue("CKW216", "seaMedium.exchangeLaws", `duplicate sea exchange law id '${id}'`),
    ));
    const internalLawIds = new Set(system.internalLaws.map((law) => law.id));
    for (const [index, law] of medium.exchangeLaws.entries()) {
        const path = `seaMedium.exchangeLaws[${index}]`;
        if (!IDENTIFIER.test(law.id)) diagnostics.push(issue("CKW215", `${path}.id`, "sea exchange law id must be stable"));
        if (internalLawIds.has(law.id)) {
            diagnostics.push(issue("CKW217", `${path}.id`, `sea exchange law '${law.id}' shares its id with an internal law; frontier and branch records name laws by id`));
        }
        if (!CAUSAL_SEA_QUANTITIES.includes(law.quantity)) {
            diagnostics.push(issue("CKW218", `${path}.quantity`, `unknown sea quantity '${String(law.quantity)}'`));
        }
        if (!positiveRational(law.amount)) {
            diagnostics.push(issue("CKW219", `${path}.amount`, "a sea exchange moves an exact positive rational amount"));
        }
        if (law.application !== "once-per-realization") {
            diagnostics.push(issue("CKW225", `${path}.application`, "unsupported sea exchange application mode"));
        }
        let endpointsKnown = true;
        for (const [name, endpoint] of [["from", law.from], ["to", law.to]] as const) {
            const known = endpoint?.kind === "region"
                ? regions.has(endpoint.regionId)
                : endpoint?.kind === "world"
                    ? worlds.has(endpoint.worldId)
                    : false;
            if (!known) {
                endpointsKnown = false;
                diagnostics.push(issue("CKW220", `${path}.${name}`, "a sea exchange endpoint must name a declared region or world"));
            }
        }
        const endpointWorldIds = new Set<string>();
        const endpointRegionIds = new Set<string>();
        for (const endpoint of [law.from, law.to]) {
            if (endpoint?.kind === "world") endpointWorldIds.add(endpoint.worldId);
            if (endpoint?.kind === "region") endpointRegionIds.add(endpoint.regionId);
        }
        if (endpointsKnown) {
            const { from, to } = law;
            if ((from.kind === "region" && to.kind === "region" && from.regionId === to.regionId)
                || (from.kind === "world" && to.kind === "world" && from.worldId === to.worldId)) {
                diagnostics.push(issue("CKW221", path, "a sea exchange must move quantity between two distinct endpoints"));
            }
            if (from.kind === "world" && to.kind === "world") {
                diagnostics.push(issue("CKW222", path, "worlds exchange content only through anchors; a world-to-world sea exchange is forbidden"));
            } else if (from.kind === "region" && to.kind === "region") {
                if (from.regionId !== to.regionId && !adjacentPairs.has(unorderedRegionPair(from.regionId, to.regionId))) {
                    diagnostics.push(issue("CKW223", path, `regions '${from.regionId}' and '${to.regionId}' are not adjacent`));
                }
            } else {
                const worldEndpoint = from.kind === "world" ? from : to as Extract<CausalSeaEndpoint, { kind: "world" }>;
                const regionEndpoint = from.kind === "region" ? from : to as Extract<CausalSeaEndpoint, { kind: "region" }>;
                if (placementOf.get(worldEndpoint.worldId) !== regionEndpoint.regionId) {
                    diagnostics.push(issue(
                        "CKW224",
                        path,
                        `${seaEndpointLabel(worldEndpoint)} exchanges only with its own placement region, not ${seaEndpointLabel(regionEndpoint)}`,
                    ));
                }
            }
        }
        const guardPath = `${path}.guard`;
        let regionParameters = law.guard.regionParameters;
        if (!Array.isArray(regionParameters)) {
            diagnostics.push(issue("CKW226", `${guardPath}.regionParameters`, "a sea exchange guard declares its region bindings as a list"));
            regionParameters = [];
        }
        validatePredicate(law.guard, guardPath, system, worlds, fieldKinds, diagnostics, regionParameters);
        for (const [bindingIndex, binding] of law.guard.fieldParameters.entries()) {
            if (!endpointWorldIds.has(binding.worldId)) {
                diagnostics.push(issue(
                    "CKW227",
                    `${guardPath}.fieldParameters[${bindingIndex}]`,
                    `a sea exchange guard may read only its endpoint worlds, not '${binding.worldId}'`,
                ));
            }
        }
        for (const [bindingIndex, binding] of regionParameters.entries()) {
            const bindingPath = `${guardPath}.regionParameters[${bindingIndex}]`;
            if (!regions.has(binding.regionId) || !CAUSAL_SEA_QUANTITIES.includes(binding.quantity)) {
                diagnostics.push(issue("CKW232", bindingPath, `unknown region quantity '${binding.regionId}.${String(binding.quantity)}'`));
            }
            if (!endpointRegionIds.has(binding.regionId)) {
                diagnostics.push(issue(
                    "CKW228",
                    bindingPath,
                    `a sea exchange guard may read only its endpoint regions, not '${binding.regionId}'`,
                ));
            }
        }
    }

    if (medium.closure !== "closed") return;
    // A closed medium is the only source and sink of sea quantity.
    const seaFieldIds = (world: CausalWorldDefinition | undefined): Set<string> => new Set(world
        ? CAUSAL_SEA_QUANTITIES.map((quantity) => causalSeaFieldId(world, quantity))
        : []);
    for (const [index, law] of system.internalLaws.entries()) {
        const seaFields = seaFieldIds(worlds.get(law.worldId));
        for (const [effectIndex, effect] of law.effects.entries()) {
            if (seaFields.has(effect.fieldId)) {
                diagnostics.push(issue(
                    "CKW233",
                    `internalLaws[${index}].effects[${effectIndex}]`,
                    `closed sea medium: internal law '${law.id}' cannot write world sea field '${law.worldId}.${effect.fieldId}'`,
                ));
            }
        }
        for (const [effectIndex, effect] of (law.inverseEffects ?? []).entries()) {
            if (seaFields.has(effect.fieldId)) {
                diagnostics.push(issue(
                    "CKW234",
                    `internalLaws[${index}].inverseEffects[${effectIndex}]`,
                    `closed sea medium: inverse of internal law '${law.id}' cannot write world sea field '${law.worldId}.${effect.fieldId}'`,
                ));
            }
        }
    }
    for (const [index, intervention] of system.worldWill.interventions.entries()) {
        const seaFields = seaFieldIds(worlds.get(intervention.targetWorldId));
        for (const [effectIndex, effect] of intervention.effects.entries()) {
            if (seaFields.has(effect.fieldId)) {
                diagnostics.push(issue(
                    "CKW235",
                    `worldWill.interventions[${index}].effects[${effectIndex}]`,
                    `closed sea medium: World Will cannot write world sea field '${intervention.targetWorldId}.${effect.fieldId}'`,
                ));
            }
        }
    }
    for (const [index, transfer] of (system.anchorTransfers ?? []).entries()) {
        if (!isZeroRational(transfer.sourceNegativeSeaResidue) || !isZeroRational(transfer.targetPositiveSeaPlacement)) {
            diagnostics.push(issue(
                "CKW236",
                `anchorTransfers[${index}]`,
                `closed sea medium: anchor transfer '${transfer.id}' cannot create sea residue or placement outside the medium`,
            ));
        }
    }
}
