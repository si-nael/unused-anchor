import {
    validateIntensionalSystem,
    type ExactValue,
    type IntensionalFamilyDefinition,
    type IntensionalSystem,
} from "./intensional";

export type NarrativeFieldRole =
    | "world-state"
    | "world-condition"
    | "story-state"
    | "protagonist-state"
    | "protagonist-choice"
    | "relationship-state"
    | "positive-sea"
    | "negative-sea"
    | "viability";

export interface NarrativeFieldBinding {
    id: string;
    familyId: string;
    role: NarrativeFieldRole;
    ownerId?: string;
}

export interface NarrativeGoal {
    id: string;
    fieldId: string;
    direction: "maximize" | "minimize" | "satisfy";
}

export interface NarrativeProtagonist {
    id: string;
    goals: NarrativeGoal[];
    actionKinds: string[];
}

export interface NarrativeRelationship {
    id: string;
    participantIds: string[];
    stateFieldId: string;
}

export interface NarrativeWorldDefinition {
    id: string;
    fields: NarrativeFieldBinding[];
    protagonists: NarrativeProtagonist[];
    relationships: NarrativeRelationship[];
    seaCoupling: {
        positiveFieldId: string;
        negativeFieldId: string;
        viabilityFieldId: string;
    };
}

export type NarrativeAnchorEndpoint =
    | { kind: "world"; worldId: string; portId: string }
    | {
        kind: "unresolved-world-relation";
        relationId: string;
        portId: string;
        questionId: "Q-021";
    };

export type NarrativeInterventionKind =
    | "condition"
    | "opportunity"
    | "constraint"
    | "signal"
    | "resource-gradient"
    | "boundary-pressure";

export interface NarrativeAnchorDefinition {
    id: string;
    endpoints: NarrativeAnchorEndpoint[];
    identityPredicateFamilyIds: string[];
    permittedInterventionKinds: NarrativeInterventionKind[];
}

export interface NarrativeWorldWillObjective {
    id: string;
    targetWorldId: string;
    fieldId: string;
    direction: "maximize" | "minimize" | "stabilize";
    weight: ExactValue;
}

export interface NarrativeWorldWillIntervention {
    id: string;
    targetWorldId: string;
    anchorId: string;
    kind: NarrativeInterventionKind;
    targetFieldId: string;
}

export interface NarrativeWorldWill {
    id: string;
    objectives: NarrativeWorldWillObjective[];
    hardConstraintFamilyIds: string[];
    interventions: NarrativeWorldWillIntervention[];
}

interface NarrativeEventBase {
    id: string;
    worldId: string;
    causes: string[];
}

export type NarrativeCausalEvent =
    | (NarrativeEventBase & {
        kind: "protagonist-action";
        protagonistId: string;
        actionKind: string;
    })
    | (NarrativeEventBase & {
        kind: "world-will-intervention";
        interventionId: string;
    })
    | (NarrativeEventBase & {
        kind: "story-consequence" | "sea-shift";
        affectedFieldIds: string[];
    })
    | (NarrativeEventBase & {
        kind: "history-commit";
        affectedFieldIds: string[];
        irreversible: true;
    });

export interface AnchoredNarrativeWorldSystem {
    mode: "bubble-anchored-narrative-world.v1";
    formal: IntensionalSystem;
    worlds: NarrativeWorldDefinition[];
    anchors: NarrativeAnchorDefinition[];
    worldWill: NarrativeWorldWill;
    causalEvents: NarrativeCausalEvent[];
    order: {
        kind: "causal-partial-order";
        universalClock: false;
    };
}

export interface NarrativeDiagnostic {
    code: string;
    severity: "error";
    path: string;
    message: string;
}

export interface NarrativeWorldAnalysis {
    worldId: string;
    autonomousProtagonistEventIds: string[];
    interventionEventIds: string[];
    agencyViolationInterventionIds: string[];
}

export interface AnchoredNarrativeAnalysis {
    mode: "bubble-anchored-narrative-analysis.v1";
    status: "valid" | "invalid";
    diagnostics: NarrativeDiagnostic[];
    order: {
        kind: "causal-partial-order";
        universalClock: false;
        acyclic: boolean;
    };
    worlds: NarrativeWorldAnalysis[];
    counterfactuals: {
        worldWillDisabled: {
            removedEventIds: string[];
            survivingProtagonistEventIds: string[];
        };
        anchorCuts: Array<{
            anchorId: string;
            disabledInterventionIds: string[];
            removedEventIds: string[];
            survivingProtagonistEventIds: string[];
        }>;
    };
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

function issue(code: string, path: string, message: string): NarrativeDiagnostic {
    return { code, severity: "error", path, message };
}

function findFamily(
    families: Map<string, IntensionalFamilyDefinition>,
    familyId: string,
    expectedKind: "rational" | "boolean" | undefined,
    code: string,
    path: string,
    diagnostics: NarrativeDiagnostic[],
): IntensionalFamilyDefinition | undefined {
    const family = families.get(familyId);
    if (!family) {
        diagnostics.push(issue(code, path, `unknown formal family '${familyId}'`));
        return undefined;
    }
    if (expectedKind && family.valueKind !== expectedKind) {
        diagnostics.push(issue(code, path, `family '${familyId}' must resolve to '${expectedKind}'`));
    }
    return family;
}

function positiveRational(value: ExactValue): boolean {
    if (value.kind !== "rational" || !/^-?(0|[1-9][0-9]*)$/.test(value.numerator)
        || !/^-?(0|[1-9][0-9]*)$/.test(value.denominator)) {
        return false;
    }
    try {
        const numerator = BigInt(value.numerator);
        const denominator = BigInt(value.denominator);
        return denominator !== 0n && numerator * denominator > 0n;
    } catch {
        return false;
    }
}

function duplicateValues(values: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const value of values) {
        if (seen.has(value)) {
            duplicates.add(value);
        }
        seen.add(value);
    }
    return [...duplicates].sort();
}

function eventCycle(events: Map<string, NarrativeCausalEvent>): string[] | undefined {
    const visited = new Set<string>();
    const active = new Set<string>();
    const path: string[] = [];
    const visit = (id: string): string[] | undefined => {
        if (active.has(id)) {
            const start = path.indexOf(id);
            return [...path.slice(start), id];
        }
        if (visited.has(id)) {
            return undefined;
        }
        visited.add(id);
        active.add(id);
        path.push(id);
        for (const cause of events.get(id)?.causes ?? []) {
            if (!events.has(cause)) {
                continue;
            }
            const cycle = visit(cause);
            if (cycle) {
                return cycle;
            }
        }
        path.pop();
        active.delete(id);
        return undefined;
    };
    for (const id of events.keys()) {
        const cycle = visit(id);
        if (cycle) {
            return cycle;
        }
    }
    return undefined;
}

function ancestorsOf(id: string, events: Map<string, NarrativeCausalEvent>, memo = new Map<string, Set<string>>()): Set<string> {
    const existing = memo.get(id);
    if (existing) {
        return existing;
    }
    const ancestors = new Set<string>();
    memo.set(id, ancestors);
    for (const cause of events.get(id)?.causes ?? []) {
        ancestors.add(cause);
        for (const ancestor of ancestorsOf(cause, events, memo)) {
            ancestors.add(ancestor);
        }
    }
    return ancestors;
}

function causalRemoval(seedIds: Set<string>, events: Map<string, NarrativeCausalEvent>): Set<string> {
    const removed = new Set(seedIds);
    let changed = true;
    while (changed) {
        changed = false;
        for (const event of events.values()) {
            if (!removed.has(event.id) && event.causes.some((cause) => removed.has(cause))) {
                removed.add(event.id);
                changed = true;
            }
        }
    }
    return removed;
}

export function validateAnchoredNarrativeWorld(
    system: AnchoredNarrativeWorldSystem,
): NarrativeDiagnostic[] {
    const diagnostics: NarrativeDiagnostic[] = validateIntensionalSystem(system.formal).map((entry) => ({
        code: `NKW-${entry.code}`,
        severity: "error" as const,
        path: `formal.${entry.path}`,
        message: entry.message,
    }));
    if (system.mode !== "bubble-anchored-narrative-world.v1") {
        diagnostics.push(issue("NKW001", "mode", "unsupported anchored narrative world mode"));
    }
    if (system.order.kind !== "causal-partial-order" || system.order.universalClock !== false) {
        diagnostics.push(issue("NKW002", "order", "narrative order must be a causal partial order without a universal clock"));
    }
    const families = new Map(system.formal.families.map((family) => [family.id, family]));
    const worldDuplicates = duplicateValues(system.worlds.map((world) => world.id));
    worldDuplicates.forEach((id) => diagnostics.push(issue("NKW003", "worlds", `duplicate world id '${id}'`)));
    const worlds = new Map(system.worlds.map((world) => [world.id, world]));
    const protagonists = new Map<string, { worldId: string; protagonist: NarrativeProtagonist }>();

    for (const [worldIndex, world] of system.worlds.entries()) {
        const worldPath = `worlds[${worldIndex}]`;
        if (!IDENTIFIER.test(world.id)) {
            diagnostics.push(issue("NKW004", `${worldPath}.id`, "world id must be a stable identifier"));
        }
        if (world.protagonists.length === 0) {
            diagnostics.push(issue("NKW005", `${worldPath}.protagonists`, "a narrative world needs at least one protagonist"));
        }
        const fieldDuplicates = duplicateValues(world.fields.map((field) => field.id));
        fieldDuplicates.forEach((id) => diagnostics.push(issue("NKW006", `${worldPath}.fields`, `duplicate field id '${id}'`)));
        const fields = new Map(world.fields.map((field) => [field.id, field]));
        if (!world.fields.some((field) => field.role === "story-state")) {
            diagnostics.push(issue("NKW045", `${worldPath}.fields`, "a narrative world needs at least one formal story-state field"));
        }
        for (const [fieldIndex, field] of world.fields.entries()) {
            const expected = ["positive-sea", "negative-sea", "viability"].includes(field.role)
                ? "rational" as const
                : undefined;
            findFamily(families, field.familyId, expected, "NKW007", `${worldPath}.fields[${fieldIndex}].familyId`, diagnostics);
        }
        for (const [name, fieldId, expectedRole] of [
            ["positiveFieldId", world.seaCoupling.positiveFieldId, "positive-sea"],
            ["negativeFieldId", world.seaCoupling.negativeFieldId, "negative-sea"],
            ["viabilityFieldId", world.seaCoupling.viabilityFieldId, "viability"],
        ] as const) {
            const field = fields.get(fieldId);
            if (!field || field.role !== expectedRole) {
                diagnostics.push(issue("NKW008", `${worldPath}.seaCoupling.${name}`, `field '${fieldId}' must have role '${expectedRole}'`));
            }
        }
        for (const [protagonistIndex, protagonist] of world.protagonists.entries()) {
            const protagonistPath = `${worldPath}.protagonists[${protagonistIndex}]`;
            if (protagonists.has(protagonist.id)) {
                diagnostics.push(issue("NKW009", `${protagonistPath}.id`, `protagonist id '${protagonist.id}' must be globally unique`));
            } else {
                protagonists.set(protagonist.id, { worldId: world.id, protagonist });
            }
            if (protagonist.goals.length === 0 || protagonist.actionKinds.length === 0) {
                diagnostics.push(issue("NKW010", protagonistPath, "a protagonist needs at least one goal and one lawful action kind"));
            }
            duplicateValues(protagonist.actionKinds).forEach((action) => diagnostics.push(issue(
                "NKW011",
                `${protagonistPath}.actionKinds`,
                `duplicate action kind '${action}'`,
            )));
            for (const [goalIndex, goal] of protagonist.goals.entries()) {
                const field = fields.get(goal.fieldId);
                if (!field) {
                    diagnostics.push(issue("NKW012", `${protagonistPath}.goals[${goalIndex}].fieldId`, `unknown goal field '${goal.fieldId}'`));
                } else {
                    findFamily(families, field.familyId, goal.direction === "satisfy" ? "boolean" : "rational", "NKW013", `${protagonistPath}.goals[${goalIndex}]`, diagnostics);
                }
            }
        }
        const localProtagonistIds = new Set(world.protagonists.map((protagonist) => protagonist.id));
        for (const [fieldIndex, field] of world.fields.entries()) {
            if ((field.role === "protagonist-state" || field.role === "protagonist-choice")
                && (!field.ownerId || !localProtagonistIds.has(field.ownerId))) {
                diagnostics.push(issue(
                    "NKW046",
                    `${worldPath}.fields[${fieldIndex}].ownerId`,
                    `field role '${field.role}' needs a local protagonist owner`,
                ));
            }
        }
        for (const [relationshipIndex, relationship] of world.relationships.entries()) {
            const relationshipPath = `${worldPath}.relationships[${relationshipIndex}]`;
            if (relationship.participantIds.length < 2) {
                diagnostics.push(issue("NKW014", `${relationshipPath}.participantIds`, "a relationship needs at least two protagonists"));
            }
            for (const participantId of relationship.participantIds) {
                const participant = protagonists.get(participantId);
                if (!participant || participant.worldId !== world.id) {
                    diagnostics.push(issue("NKW015", `${relationshipPath}.participantIds`, `unknown local protagonist '${participantId}'`));
                }
            }
            if (fields.get(relationship.stateFieldId)?.role !== "relationship-state") {
                diagnostics.push(issue("NKW016", `${relationshipPath}.stateFieldId`, "relationship state must name a relationship-state field"));
            }
        }
    }

    const anchorDuplicates = duplicateValues(system.anchors.map((anchor) => anchor.id));
    anchorDuplicates.forEach((id) => diagnostics.push(issue("NKW017", "anchors", `duplicate anchor id '${id}'`)));
    const anchors = new Map(system.anchors.map((anchor) => [anchor.id, anchor]));
    for (const [anchorIndex, anchor] of system.anchors.entries()) {
        const anchorPath = `anchors[${anchorIndex}]`;
        if (anchor.endpoints.length < 2) {
            diagnostics.push(issue("NKW018", `${anchorPath}.endpoints`, "an anchor needs at least two explicit relation endpoints"));
        }
        if (!anchor.endpoints.some((endpoint) => endpoint.kind === "world")) {
            diagnostics.push(issue("NKW019", `${anchorPath}.endpoints`, "an anchor needs at least one concrete world endpoint"));
        }
        for (const endpoint of anchor.endpoints) {
            if (endpoint.kind === "world" && !worlds.has(endpoint.worldId)) {
                diagnostics.push(issue("NKW020", `${anchorPath}.endpoints`, `unknown endpoint world '${endpoint.worldId}'`));
            }
        }
        if (anchor.identityPredicateFamilyIds.length === 0) {
            diagnostics.push(issue("NKW021", `${anchorPath}.identityPredicateFamilyIds`, "anchor identity needs at least one formal predicate"));
        }
        anchor.identityPredicateFamilyIds.forEach((familyId) => findFamily(
            families,
            familyId,
            "boolean",
            "NKW022",
            `${anchorPath}.identityPredicateFamilyIds`,
            diagnostics,
        ));
    }

    const objectivesByWorld = new Set<string>();
    for (const [objectiveIndex, objective] of system.worldWill.objectives.entries()) {
        const objectivePath = `worldWill.objectives[${objectiveIndex}]`;
        const world = worlds.get(objective.targetWorldId);
        if (!world) {
            diagnostics.push(issue("NKW023", `${objectivePath}.targetWorldId`, `unknown objective world '${objective.targetWorldId}'`));
            continue;
        }
        objectivesByWorld.add(world.id);
        const field = world.fields.find((candidate) => candidate.id === objective.fieldId);
        if (!field) {
            diagnostics.push(issue("NKW024", `${objectivePath}.fieldId`, `unknown objective field '${objective.fieldId}'`));
        } else {
            findFamily(families, field.familyId, "rational", "NKW025", `${objectivePath}.fieldId`, diagnostics);
            if (field.role === "protagonist-choice") {
                diagnostics.push(issue("NKW047", `${objectivePath}.fieldId`, "World Will may not optimize a protagonist's choice variable directly"));
            }
        }
        if (!positiveRational(objective.weight)) {
            diagnostics.push(issue("NKW026", `${objectivePath}.weight`, "objective weight must be a positive exact rational"));
        }
    }
    for (const world of system.worlds) {
        if (!objectivesByWorld.has(world.id)) {
            diagnostics.push(issue("NKW027", "worldWill.objectives", `World Will needs an explicit objective for world '${world.id}'`));
        }
    }
    system.worldWill.hardConstraintFamilyIds.forEach((familyId, index) => findFamily(
        families,
        familyId,
        "boolean",
        "NKW028",
        `worldWill.hardConstraintFamilyIds[${index}]`,
        diagnostics,
    ));

    const interventionDuplicates = duplicateValues(system.worldWill.interventions.map((intervention) => intervention.id));
    interventionDuplicates.forEach((id) => diagnostics.push(issue("NKW029", "worldWill.interventions", `duplicate intervention id '${id}'`)));
    const interventions = new Map(system.worldWill.interventions.map((intervention) => [intervention.id, intervention]));
    for (const [interventionIndex, intervention] of system.worldWill.interventions.entries()) {
        const interventionPath = `worldWill.interventions[${interventionIndex}]`;
        const world = worlds.get(intervention.targetWorldId);
        const anchor = anchors.get(intervention.anchorId);
        if (!world) {
            diagnostics.push(issue("NKW030", `${interventionPath}.targetWorldId`, `unknown intervention world '${intervention.targetWorldId}'`));
            continue;
        }
        if (!anchor) {
            diagnostics.push(issue("NKW031", `${interventionPath}.anchorId`, `unknown anchor route '${intervention.anchorId}'`));
        } else {
            const reachesWorld = anchor.endpoints.some((endpoint) => endpoint.kind === "world" && endpoint.worldId === world.id);
            if (!reachesWorld) {
                diagnostics.push(issue("NKW032", `${interventionPath}.anchorId`, `anchor '${anchor.id}' does not reach world '${world.id}'`));
            }
            if (!anchor.permittedInterventionKinds.includes(intervention.kind)) {
                diagnostics.push(issue("NKW033", `${interventionPath}.kind`, `anchor '${anchor.id}' does not permit '${intervention.kind}' intervention`));
            }
        }
        const field = world.fields.find((candidate) => candidate.id === intervention.targetFieldId);
        if (!field) {
            diagnostics.push(issue("NKW034", `${interventionPath}.targetFieldId`, `unknown intervention field '${intervention.targetFieldId}'`));
        } else if (!["world-condition", "positive-sea", "negative-sea", "viability"].includes(field.role)) {
            diagnostics.push(issue(
                "NKW035",
                `${interventionPath}.targetFieldId`,
                `World Will may alter world conditions or sea/viability fields, not '${field.role}' directly`,
            ));
        }
    }

    const eventDuplicates = duplicateValues(system.causalEvents.map((event) => event.id));
    eventDuplicates.forEach((id) => diagnostics.push(issue("NKW036", "causalEvents", `duplicate event id '${id}'`)));
    const events = new Map(system.causalEvents.map((event) => [event.id, event]));
    for (const [eventIndex, event] of system.causalEvents.entries()) {
        const eventPath = `causalEvents[${eventIndex}]`;
        if (!worlds.has(event.worldId)) {
            diagnostics.push(issue("NKW037", `${eventPath}.worldId`, `unknown event world '${event.worldId}'`));
        }
        for (const cause of event.causes) {
            if (!events.has(cause)) {
                diagnostics.push(issue("NKW038", `${eventPath}.causes`, `unknown causal predecessor '${cause}'`));
            }
        }
        if (event.kind === "protagonist-action") {
            const actor = protagonists.get(event.protagonistId);
            if (!actor || actor.worldId !== event.worldId) {
                diagnostics.push(issue("NKW039", `${eventPath}.protagonistId`, `unknown protagonist '${event.protagonistId}' in event world`));
            } else if (!actor.protagonist.actionKinds.includes(event.actionKind)) {
                diagnostics.push(issue("NKW040", `${eventPath}.actionKind`, `action '${event.actionKind}' is not lawful for protagonist '${event.protagonistId}'`));
            }
        } else if (event.kind === "world-will-intervention") {
            const intervention = interventions.get(event.interventionId);
            if (!intervention || intervention.targetWorldId !== event.worldId) {
                diagnostics.push(issue("NKW041", `${eventPath}.interventionId`, `unknown intervention '${event.interventionId}' in event world`));
            }
        } else {
            const world = worlds.get(event.worldId);
            for (const fieldId of event.affectedFieldIds) {
                if (!world?.fields.some((field) => field.id === fieldId)) {
                    diagnostics.push(issue("NKW042", `${eventPath}.affectedFieldIds`, `unknown affected field '${fieldId}'`));
                }
            }
        }
    }
    const cycle = eventCycle(events);
    if (cycle) {
        diagnostics.push(issue("NKW043", "causalEvents", `causal event cycle violates partial order: ${cycle.join(" -> ")}`));
    }

    if (!cycle) {
        const interventionEventIds = new Set(
            system.causalEvents.filter((event) => event.kind === "world-will-intervention").map((event) => event.id),
        );
        const ancestorMemo = new Map<string, Set<string>>();
        for (const world of system.worlds) {
            const autonomous = system.causalEvents.filter((event) => event.kind === "protagonist-action"
                && event.worldId === world.id
                && [...ancestorsOf(event.id, events, ancestorMemo)].every((ancestor) => !interventionEventIds.has(ancestor)));
            if (autonomous.length === 0) {
                diagnostics.push(issue(
                    "NKW044",
                    "causalEvents",
                    `world '${world.id}' needs a protagonist action causally independent of World Will intervention`,
                ));
            }
        }
    }
    return diagnostics;
}

export function analyzeAnchoredNarrativeWorld(
    system: AnchoredNarrativeWorldSystem,
): AnchoredNarrativeAnalysis {
    const diagnostics = validateAnchoredNarrativeWorld(system);
    const events = new Map(system.causalEvents.map((event) => [event.id, event]));
    const cycle = eventCycle(events);
    const interventionEvents = system.causalEvents.filter(
        (event): event is Extract<NarrativeCausalEvent, { kind: "world-will-intervention" }> => event.kind === "world-will-intervention",
    );
    const interventionEventIds = new Set(interventionEvents.map((event) => event.id));
    const protagonistEvents = system.causalEvents.filter(
        (event): event is Extract<NarrativeCausalEvent, { kind: "protagonist-action" }> => event.kind === "protagonist-action",
    );
    const ancestorMemo = new Map<string, Set<string>>();
    const worlds = system.worlds.map((world): NarrativeWorldAnalysis => {
        const worldProtagonistEvents = protagonistEvents.filter((event) => event.worldId === world.id);
        const autonomous = cycle
            ? []
            : worldProtagonistEvents.filter((event) => [...ancestorsOf(event.id, events, ancestorMemo)]
                .every((ancestor) => !interventionEventIds.has(ancestor)));
        const worldInterventionEvents = interventionEvents.filter((event) => event.worldId === world.id);
        const agencyViolations = system.worldWill.interventions.filter((intervention) => intervention.targetWorldId === world.id
            && world.fields.find((field) => field.id === intervention.targetFieldId)?.role === "protagonist-choice");
        return {
            worldId: world.id,
            autonomousProtagonistEventIds: autonomous.map((event) => event.id).sort(),
            interventionEventIds: worldInterventionEvents.map((event) => event.id).sort(),
            agencyViolationInterventionIds: agencyViolations.map((intervention) => intervention.id).sort(),
        };
    });

    const willDisabledRemoved = causalRemoval(interventionEventIds, events);
    const survivingProtagonistEvents = (removed: Set<string>) => protagonistEvents
        .filter((event) => !removed.has(event.id)).map((event) => event.id).sort();
    const interventionsById = new Map(system.worldWill.interventions.map((intervention) => [intervention.id, intervention]));
    const anchorCuts = system.anchors.map((anchor) => {
        const disabledEvents = interventionEvents.filter((event) => interventionsById.get(event.interventionId)?.anchorId === anchor.id);
        const disabledIds = new Set(disabledEvents.map((event) => event.id));
        const removed = causalRemoval(disabledIds, events);
        return {
            anchorId: anchor.id,
            disabledInterventionIds: disabledEvents.map((event) => event.interventionId).sort(),
            removedEventIds: [...removed].sort(),
            survivingProtagonistEventIds: survivingProtagonistEvents(removed),
        };
    });

    return {
        mode: "bubble-anchored-narrative-analysis.v1",
        status: diagnostics.length === 0 ? "valid" : "invalid",
        diagnostics,
        order: {
            kind: "causal-partial-order",
            universalClock: false,
            acyclic: !cycle,
        },
        worlds,
        counterfactuals: {
            worldWillDisabled: {
                removedEventIds: [...willDisabledRemoved].sort(),
                survivingProtagonistEventIds: survivingProtagonistEvents(willDisabledRemoved),
            },
            anchorCuts,
        },
    };
}
