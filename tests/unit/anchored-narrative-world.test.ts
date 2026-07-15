import assert from "node:assert/strict";
import test from "node:test";
import {
    analyzeAnchoredNarrativeWorld,
    exact,
    term,
    validateAnchoredNarrativeWorld,
    type AnchoredNarrativeWorldSystem,
    type IntensionalFamilyDefinition,
} from "../../src/bubbles/world-kernel";

function constantFamily(
    id: string,
    valueKind: "rational" | "boolean" | "symbol",
    value: ReturnType<typeof exact.integer> | ReturnType<typeof exact.boolean> | ReturnType<typeof exact.symbol>,
): IntensionalFamilyDefinition {
    return {
        id,
        domain: { axes: [{ name: "coordinate", kind: "natural" }] },
        valueKind,
        parameters: [],
        body: term.value(value),
    };
}

function narrativeFixture(): AnchoredNarrativeWorldSystem {
    return {
        mode: "bubble-anchored-narrative-world.v1",
        formal: {
            mode: "bubble-intensional-system.v1",
            families: [
                constantFamily("positive-field", "rational", exact.integer(3)),
                constantFamily("negative-field", "rational", exact.integer(1)),
                constantFamily("viability-field", "rational", exact.integer(2)),
                constantFamily("story-field", "symbol", exact.symbol("opening")),
                constantFamily("choice-field", "symbol", exact.symbol("undecided")),
                constantFamily("opportunity-field", "rational", exact.integer(0)),
                constantFamily("identity-predicate", "boolean", exact.boolean(true)),
            ],
        },
        worlds: [{
            id: "garden-world",
            fields: [
                { id: "positive", familyId: "positive-field", role: "positive-sea" },
                { id: "negative", familyId: "negative-field", role: "negative-sea" },
                { id: "viability", familyId: "viability-field", role: "viability" },
                { id: "story", familyId: "story-field", role: "story-state" },
                { id: "aria-choice", familyId: "choice-field", role: "protagonist-choice", ownerId: "aria" },
                { id: "opportunity", familyId: "opportunity-field", role: "world-condition" },
            ],
            protagonists: [{
                id: "aria",
                goals: [{ id: "keep-garden-viable", fieldId: "viability", direction: "maximize" }],
                actionKinds: ["explore", "tend"],
            }],
            relationships: [],
            seaCoupling: {
                positiveFieldId: "positive",
                negativeFieldId: "negative",
                viabilityFieldId: "viability",
            },
        }],
        anchors: [{
            id: "garden-anchor",
            endpoints: [
                { kind: "world", worldId: "garden-world", portId: "garden-membrane" },
                {
                    kind: "unresolved-world-relation",
                    relationId: "unique-world-topology",
                    portId: "unresolved-origin",
                    questionId: "Q-021",
                },
            ],
            identityPredicateFamilyIds: ["identity-predicate"],
            permittedInterventionKinds: ["signal"],
        }],
        worldWill: {
            id: "garden-will",
            objectives: [{
                id: "stabilize-garden",
                targetWorldId: "garden-world",
                fieldId: "viability",
                direction: "maximize",
                weight: exact.integer(1),
            }],
            hardConstraintFamilyIds: ["identity-predicate"],
            interventions: [{
                id: "offer-path",
                targetWorldId: "garden-world",
                anchorId: "garden-anchor",
                kind: "signal",
                targetFieldId: "opportunity",
            }],
        },
        causalEvents: [
            {
                id: "aria-explores",
                kind: "protagonist-action",
                worldId: "garden-world",
                causes: [],
                protagonistId: "aria",
                actionKind: "explore",
            },
            {
                id: "will-offers-path",
                kind: "world-will-intervention",
                worldId: "garden-world",
                causes: [],
                interventionId: "offer-path",
            },
            {
                id: "path-is-found",
                kind: "story-consequence",
                worldId: "garden-world",
                causes: ["aria-explores", "will-offers-path"],
                affectedFieldIds: ["story", "viability"],
            },
        ],
        order: { kind: "causal-partial-order", universalClock: false },
    };
}

test("an anchored narrative preserves autonomous protagonist action beside World-Will intervention", () => {
    const analysis = analyzeAnchoredNarrativeWorld(narrativeFixture());

    assert.equal(analysis.status, "valid");
    assert.deepEqual(analysis.diagnostics, []);
    assert.deepEqual(analysis.worlds[0]?.autonomousProtagonistEventIds, ["aria-explores"]);
    assert.deepEqual(analysis.worlds[0]?.interventionEventIds, ["will-offers-path"]);
    assert.deepEqual(analysis.worlds[0]?.agencyViolationInterventionIds, []);
    assert.equal(analysis.order.universalClock, false);
    assert.equal(analysis.order.acyclic, true);
});

test("World-Will-disabled and anchor-cut counterfactuals remove intervention consequences, not independent action", () => {
    const analysis = analyzeAnchoredNarrativeWorld(narrativeFixture());

    assert.deepEqual(analysis.counterfactuals.worldWillDisabled.removedEventIds, [
        "path-is-found",
        "will-offers-path",
    ]);
    assert.deepEqual(analysis.counterfactuals.worldWillDisabled.survivingProtagonistEventIds, ["aria-explores"]);
    assert.deepEqual(analysis.counterfactuals.anchorCuts, [{
        anchorId: "garden-anchor",
        disabledInterventionIds: ["offer-path"],
        removedEventIds: ["path-is-found", "will-offers-path"],
        survivingProtagonistEventIds: ["aria-explores"],
    }]);
});

test("World Will cannot target a protagonist choice directly", () => {
    const system = narrativeFixture();
    system.worldWill.interventions[0]!.targetFieldId = "aria-choice";

    const diagnostics = validateAnchoredNarrativeWorld(system);
    assert.ok(diagnostics.some((entry) => entry.code === "NKW035"));
    assert.deepEqual(
        analyzeAnchoredNarrativeWorld(system).worlds[0]?.agencyViolationInterventionIds,
        ["offer-path"],
    );
});

test("World Will cannot make a protagonist choice variable its optimization target", () => {
    const system = narrativeFixture();
    system.worldWill.objectives[0]!.fieldId = "aria-choice";

    const diagnostics = validateAnchoredNarrativeWorld(system);
    assert.ok(diagnostics.some((entry) => entry.code === "NKW047"));
});

test("every intervention must use an anchor that reaches its target world", () => {
    const system = narrativeFixture();
    system.anchors[0]!.endpoints[0] = {
        kind: "unresolved-world-relation",
        relationId: "missing-route",
        portId: "unknown",
        questionId: "Q-021",
    };

    const diagnostics = validateAnchoredNarrativeWorld(system);
    assert.ok(diagnostics.some((entry) => entry.code === "NKW019"));
    assert.ok(diagnostics.some((entry) => entry.code === "NKW032"));
});

test("causal cycles and stories wholly dependent on World Will fail before execution", () => {
    const cycle = narrativeFixture();
    cycle.causalEvents[0]!.causes = ["path-is-found"];
    assert.ok(validateAnchoredNarrativeWorld(cycle).some((entry) => entry.code === "NKW043"));

    const dependent = narrativeFixture();
    dependent.causalEvents[0]!.causes = ["will-offers-path"];
    dependent.causalEvents[2]!.causes = ["aria-explores"];
    assert.ok(validateAnchoredNarrativeWorld(dependent).some((entry) => entry.code === "NKW044"));
});
