import assert from "node:assert/strict";
import test from "node:test";
import {
    deriveCausalComponents,
    deriveCausalInfluenceEdges,
    deriveCausalLawDependencies,
    validatePersistentCausalProgram,
    type PersistentCausalProgram,
} from "../../src/bubbles/world-kernel";
import selfMaintainingField from "../../examples/self-maintaining-field.world.json";

function persistentProgram(): PersistentCausalProgram {
    return structuredClone(selfMaintainingField) as PersistentCausalProgram;
}

test("causal recurrence derives a boundary-bearing component instead of declaring an entity", () => {
    const program = persistentProgram();
    const diagnostics = validatePersistentCausalProgram(program);
    const components = deriveCausalComponents(program);
    const component = components.find((candidate) => candidate.memberFieldKeys.includes("maintenance-world.integrity"));

    assert.deepEqual(diagnostics, []);
    assert.ok(component);
    assert.equal(component.recurrent, true);
    assert.ok(component.memberLawIds.includes("restore-from-memory"));
    assert.deepEqual(component.memberFieldKeys, [
        "maintenance-world.boundary",
        "maintenance-world.identity",
        "maintenance-world.integrity",
        "maintenance-world.memory",
        "maintenance-world.phase",
    ]);
    assert.ok(component.incomingEdges.some((edge) => edge.from.fieldId === "negative"));
    assert.ok(component.outgoingEdges.some((edge) => edge.to.fieldId === "signal"));
    assert.deepEqual(component.incomingDependencies.map((dependency) => dependency.lawId).sort(), [
        "negative-sea-erosion",
        "negative-sea-erosion-route-b",
    ]);
    assert.ok(component.outgoingDependencies.some((dependency) => dependency.lawId === "restore-from-memory"));
    assert.equal(component.memberFieldKeys.includes("maintenance-world.negative"), false);
    assert.equal(component.memberFieldKeys.includes("maintenance-world.signal"), false);
});

test("influence edges remain an inspectable projection of exact conjunctive law dependencies", () => {
    const edges = deriveCausalInfluenceEdges(persistentProgram());
    const dependencies = deriveCausalLawDependencies(persistentProgram());

    assert.ok(edges.some((edge) => edge.lawId === "negative-sea-erosion"
        && edge.from.fieldId === "negative" && edge.to.fieldId === "integrity"));
    assert.ok(edges.some((edge) => edge.lawId === "restore-from-memory"
        && edge.from.fieldId === "memory" && edge.to.fieldId === "signal"));
    assert.ok(edges.some((edge) => edge.lawId === "admit-negative-sea"
        && edge.from.fieldId === "pressure" && edge.to.fieldId === "negative"));
    const erosion = dependencies.find((dependency) => dependency.lawId === "negative-sea-erosion")!;
    assert.deepEqual(erosion.guardFieldKeys, [
        "maintenance-world.boundary",
        "maintenance-world.identity",
        "maintenance-world.integrity",
        "maintenance-world.negative",
        "maintenance-world.phase",
    ]);
    assert.deepEqual(erosion.effectFieldKeys, [
        "maintenance-world.integrity",
        "maintenance-world.phase",
        "maintenance-world.signal",
    ]);
});

test("persistent wrapper validation preserves the complete causal-program contract", () => {
    const program = persistentProgram() as unknown as { mode: string; causalProgram: PersistentCausalProgram["causalProgram"] };
    program.mode = "bubble-persistent-causal-program.v0";

    const diagnostics = validatePersistentCausalProgram(program as PersistentCausalProgram);
    assert.ok(diagnostics.some((diagnostic) => diagnostic.code === "PKW001"));
});
