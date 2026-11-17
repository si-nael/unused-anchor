// Regressions for the v0.5.10 confirmation audit and re-audit of the multiversal sea medium (B-063 to B-069).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { compileCausalBubbleSource } from "../../src/bubbles/language";
import {
    exact,
    realizeAnchoredCausalWorld,
    term,
    validateExecutableCausalProgram,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";

function source(name: string): ExecutableAnchoredCausalProgram {
    const path = resolve(process.cwd(), `examples/${name}.causal.bubble`);
    return compileCausalBubbleSource(readFileSync(path, "utf8"), { sourcePath: path }).program;
}

const options = { worldWillEnabled: false };

test("a world's sea quantity can never be negative under a medium, so a release cannot drain the shared sea", () => {
    const program = source("residue-commons");
    const elder = program.world.worlds.find((world) => world.id === "elder")!;
    const run = realizeAnchoredCausalWorld(program, {
        ...options,
        fieldOverrides: { [`elder.${elder.seaCoupling.negativeFieldId}`]: exact.integer(-2) },
    });
    assert.equal(run.status, "contradicted");
    assert.match(run.reason ?? "", /elder.*must stay non-negative/);
});

test("a closed medium forbids writing any sea-role field, including one outside the coupling", () => {
    const program = structuredClone(source("residue-commons"));
    const exposed = program.world.worlds.find((world) => world.id === "exposed")!;
    const coupled = exposed.fields.find((field) => field.id === exposed.seaCoupling.negativeFieldId)!;
    exposed.fields.push({ id: "pressure", familyId: coupled.familyId, role: "negative-sea" });
    const initializer = program.fieldInitializers.find((entry) => entry.worldId === "exposed" && entry.fieldId === coupled.id)!;
    program.fieldInitializers.push({ ...structuredClone(initializer), fieldId: "pressure" });
    const law = program.world.internalLaws.find((candidate) => candidate.worldId === "exposed")!;
    law.effects.push({ fieldId: "pressure", operation: "add", value: exact.integer(5) });
    assert.ok(validateExecutableCausalProgram(program).some((diagnostic) => diagnostic.code === "CKW237"));
});

test("an exchange cannot share a frontier with an anchor transfer whose endpoint world it changes", () => {
    const program = structuredClone(source("connected-fields"));
    program.world.formal.families.push({
        id: "always-true",
        domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
        valueKind: "boolean",
        parameters: [],
        body: term.value(exact.boolean(true)),
    });
    const transfer = program.world.anchorTransfers![0]!;
    program.world.seaMedium = {
        id: "medium",
        closure: "open",
        regions: [{ id: "reach", negative: exact.integer(5), positive: exact.integer(0) }],
        placements: program.world.worlds.map((world) => ({ worldId: world.id, regionId: "reach" })),
        adjacency: [],
        exchangeLaws: [{
            id: "press",
            quantity: "negative",
            from: { kind: "region", regionId: "reach" },
            to: { kind: "world", worldId: transfer.source.worldId },
            amount: exact.integer(1),
            guard: { id: "press-always", query: { familyId: "always-true", at: { unit: "0" }, parameters: {} }, fieldParameters: [], regionParameters: [] },
            application: "once-per-realization",
        }],
    };
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const run = realizeAnchoredCausalWorld(program, options);
    const transferLawId = program.world.internalLaws.find((law) => (law.anchorTransferIds ?? []).includes(transfer.id))!.id;
    // Both are enabled at the first frontier, so the default conflict mode leaves them honestly unresolved.
    assert.equal(run.status, "underdetermined");
    assert.deepEqual([...run.unresolvedAlternativeIds].sort(), [`law:${transferLawId}`, "medium:press"].sort());
    for (const continuation of [...run.continuations, ...(run.autonomousContinuations ?? [])]) {
        for (const frontier of continuation.order.evaluationFrontiers) {
            assert.ok(!(frontier.includes("medium:press") && frontier.includes(`law:${transferLawId}`)),
                "a transfer certificate must not be computed beside an exchange that changes its endpoint");
        }
    }
});

test("runtime-added sufficiency evidence never collides with an authored predicate id", () => {
    const program = structuredClone(source("residue-commons"));
    const exchange = program.world.seaMedium!.exchangeLaws[0]!;
    exchange.guard.id = "sufficiency";
    const run = realizeAnchoredCausalWorld(program, options);
    const subjects = run.formalEvidence.map((entry) => entry.subjectId);
    assert.equal(new Set(subjects).size, subjects.length);
});

test("a sea medium that is not a declaration is a diagnostic, never a crash", () => {
    for (const value of [null, false, 0, "", "closed", [], 7, {}]) {
        const program = structuredClone(source("residue-commons")) as unknown as { world: Record<string, unknown> };
        program.world.seaMedium = value;
        const typed = program as unknown as ExecutableAnchoredCausalProgram;
        assert.ok(validateExecutableCausalProgram(typed).some((diagnostic) => diagnostic.code === "CKW238"), JSON.stringify(value));
        assert.equal(realizeAnchoredCausalWorld(typed, options).status, "contradicted");
    }
});

test("an exchange that changes no field a transfer certificate reads may share its frontier", () => {
    const program = structuredClone(source("connected-fields"));
    program.world.formal.families.push({
        id: "always-true",
        domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
        valueKind: "boolean",
        parameters: [],
        body: term.value(exact.boolean(true)),
    });
    const transfer = program.world.anchorTransfers![0]!;
    // Identity of the transfer anchor is a constant: no field is read, so nothing the exchange changes can falsify it.
    program.world.anchors.find((anchor) => anchor.id === transfer.anchorId)!.identityPredicateFamilyIds = ["always-true"];
    program.execution.anchorIdentity = program.execution.anchorIdentity.map((predicate) => predicate.anchorId === transfer.anchorId
        ? { ...predicate, query: { familyId: "always-true", at: { unit: "0" }, parameters: {} }, fieldParameters: [] }
        : predicate);
    program.world.seaMedium = {
        id: "medium",
        closure: "open",
        regions: [{ id: "reach", negative: exact.integer(0), positive: exact.integer(5) }],
        placements: program.world.worlds.map((world) => ({ worldId: world.id, regionId: "reach" })),
        adjacency: [],
        exchangeLaws: [{
            id: "lift",
            quantity: "positive",
            from: { kind: "region", regionId: "reach" },
            to: { kind: "world", worldId: transfer.source.worldId },
            amount: exact.integer(1),
            guard: { id: "lift-always", query: { familyId: "always-true", at: { unit: "0" }, parameters: {} }, fieldParameters: [], regionParameters: [] },
            application: "once-per-realization",
        }],
    };
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const run = realizeAnchoredCausalWorld(program, options);
    assert.equal(run.status, "stable", run.reason);
    assert.equal(run.continuations[0]!.anchorTransferEvents?.length, 1);
});
