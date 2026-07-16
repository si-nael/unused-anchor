import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
    exact,
    validateAnchoredCausalWorld,
    validateAnchoredNarrativeWorld,
    validateExecutableCausalProgram,
    type ExecutableAnchoredCausalProgram,
    type ExecutableAnchoredNarrativeProgram,
} from "../../src/bubbles/world-kernel";
import selfOrganizingField from "../../examples/self-organizing-field.world.json";
import anchoredGarden from "../../examples/anchored-garden.world.json";

function fieldProgram(): ExecutableAnchoredCausalProgram {
    return structuredClone(selfOrganizingField) as ExecutableAnchoredCausalProgram;
}

test("an anchored causal world requires no actor, protagonist, or authored narrative", () => {
    const program = fieldProgram();

    assert.deepEqual(validateAnchoredCausalWorld(program.world), []);
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    assert.equal("protagonists" in program.world.worlds[0]!, false);
    assert.equal("causalEvents" in program.world, false);
});

test("World Will can alter conditions but cannot directly write protected internal structure", () => {
    const program = fieldProgram();
    program.world.worldWill.interventions[0]!.effects.push({
        fieldId: "coherence",
        operation: "set",
        value: exact.integer(99),
    });

    const diagnostics = validateAnchoredCausalWorld(program.world);
    assert.ok(diagnostics.some((entry) => entry.code === "CKW039"));
    assert.ok(diagnostics.some((entry) => entry.code === "CKW040"));
});

test("stabilize objectives require an explicit exact target", () => {
    const program = fieldProgram();
    program.world.worldWill.objectives[0]!.direction = "stabilize";
    assert.ok(validateAnchoredCausalWorld(program.world).some((entry) => entry.code === "CKW071"));

    program.world.worldWill.objectives[0]!.targetValue = exact.integer(2);
    assert.deepEqual(validateAnchoredCausalWorld(program.world), []);
});

test("reversible internal laws must carry exact additive inverses", () => {
    const program = fieldProgram();
    const law = program.world.internalLaws[0]!;
    law.reversibility = "reversible";
    law.inverseEffects = law.effects.map((effect) => ({
        ...effect,
        operation: effect.operation === "add" ? "subtract" as const : "add" as const,
    }));
    assert.deepEqual(validateAnchoredCausalWorld(program.world), []);

    law.inverseEffects[0]!.value = exact.integer(2);
    assert.ok(validateAnchoredCausalWorld(program.world).some((entry) => entry.code === "CKW044"));
});

test("internal conflict semantics must use an explicit supported contract", () => {
    const program = fieldProgram();
    program.execution.internalConflictMode = "maximal-commuting-branches";
    assert.deepEqual(validateExecutableCausalProgram(program), []);

    (program.execution as { internalConflictMode?: string }).internalConflictMode = "pick-first";
    assert.ok(validateExecutableCausalProgram(program).some((entry) => entry.code === "CKR025"));
});

test("the v0.5.1 narrative kernel remains a valid compatible special case", () => {
    const previous = structuredClone(anchoredGarden) as ExecutableAnchoredNarrativeProgram;
    assert.deepEqual(validateAnchoredNarrativeWorld(previous.world), []);
});

test("the causal kernel itself does not hard-code narrative ontology", () => {
    const sources = ["causal.ts", "causal-runtime.ts"].map((file) => (
        readFileSync(resolve(process.cwd(), "src/bubbles/world-kernel", file), "utf8").toLowerCase()
    ));
    for (const token of ["protagonist", "story-state", "story-consequence"]) {
        assert.equal(sources.some((source) => source.includes(token)), false, `generic causal kernel must not require '${token}'`);
    }
});
