import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { BubbleCompilerError, compileCausalBubbleSource } from "../../src/bubbles/language";
import {
    inspectAnchoredCausalRun,
    realizeAnchoredCausalWorld,
    recordAnchoredCausalReplay,
    replayAnchoredCausalRecord,
} from "../../src/bubbles/world-kernel";

const examplePath = resolve(process.cwd(), "examples/generational-seed.causal.bubble");

function compileExample() {
    return compileCausalBubbleSource(readFileSync(examplePath, "utf8"), { sourcePath: examplePath }).program;
}

test("causal Bubble source lowers birth and retirement into the existing lifecycle kernel", () => {
    const program = compileExample();
    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const continuation = run.autonomousContinuation!;
    const origin = continuation.worldStates.find((state) => state.worldId === "origin-seed")!;
    const child = continuation.worldStates.find((state) => state.worldId === "descendant-seed")!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(run.initialWorldStates.find((state) => state.worldId === "descendant-seed")?.lifecycle?.phase, "latent");
    assert.equal(origin.lifecycle?.phase, "retired");
    assert.equal(child.lifecycle?.phase, "active");
    assert.equal(continuation.lifecycleEvents?.filter((event) => event.kind === "world-spawn").length, 1);
    assert.equal(continuation.lifecycleEvents?.filter((event) => event.kind === "world-retirement").length, 1);
    assert.equal(continuation.lifecycleEvents?.every((event) => event.hostSelection === false), true);
    assert.deepEqual(continuation.order.historyArrowSources, ["history-commit", "world-lifecycle"]);
    assert.equal(continuation.order.universalClock, false);

    const inspection = inspectAnchoredCausalRun(run);
    assert.equal(inspection.summary.activeWorldCount, 1);
    assert.equal(inspection.summary.retiredWorldCount, 1);
    assert.equal(inspection.summary.spawnedWorldCount, 1);
});

test("causal Bubble lowering preserves exact same-program replay", () => {
    const program = compileExample();
    const replay = replayAnchoredCausalRecord(recordAnchoredCausalReplay(program, { worldWillEnabled: false }));
    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.fullRunPreserved, true);
    assert.equal(replay.lifecyclePreserved, true);
});

test("causal Bubble source refuses lifecycle shortcuts and missing semantic declarations", () => {
    const reversibleBirth = readFileSync(examplePath, "utf8")
        .replace("when condition = 0 irreversible", "when condition = 0 reversible");
    assert.throws(
        () => compileCausalBubbleSource(reversibleBirth, { sourcePath: "reversible-birth.bubble" }),
        (error: unknown) => error instanceof BubbleCompilerError && error.diagnostics.some((entry) => entry.code === "CKW080"),
    );

    const missingSea = readFileSync(examplePath, "utf8")
        .replace("  sea descendant-seed positive positive negative negative viability viability weights 1 1\n", "");
    assert.throws(
        () => compileCausalBubbleSource(missingSea, { sourcePath: "missing-sea.bubble" }),
        (error: unknown) => error instanceof BubbleCompilerError && error.diagnostics.some((entry) => entry.code === "CBL012"),
    );

    const unknownForeignWorld = readFileSync(examplePath, "utf8")
        .replace("world origin-seed when condition", "world absent-world when condition");
    assert.throws(
        () => compileCausalBubbleSource(unknownForeignWorld, { sourcePath: "foreign-world.bubble" }),
        (error: unknown) => error instanceof BubbleCompilerError && error.diagnostics.some((entry) => entry.code === "CBL020"),
    );
});

test("causal Bubble source gives reversible laws exact inverses instead of exposing an unusable keyword", () => {
    const reversible = readFileSync(examplePath, "utf8")
        .replace(
            "law form-descendant-seed world descendant-seed when structure = 0 irreversible",
            "law form-descendant-seed world descendant-seed when structure = 0 reversible",
        )
        .replace(
            "law-effect form-descendant-seed set structure 1",
            "law-effect form-descendant-seed add structure 1\n  law-inverse form-descendant-seed subtract structure 1",
        )
        .replace(
            "law-effect form-descendant-seed set boundary 1",
            "law-effect form-descendant-seed add boundary 1\n  law-inverse form-descendant-seed subtract boundary 1",
        )
        .replace("  law-commit form-descendant-seed structure,boundary\n", "");
    const compilation = compileCausalBubbleSource(reversible, { sourcePath: "reversible-law.bubble" });
    const law = compilation.program.world.internalLaws.find((entry) => entry.id === "form-descendant-seed")!;

    assert.equal(compilation.diagnostics.length, 0);
    assert.equal(law.reversibility, "reversible");
    assert.deepEqual(law.inverseEffects, [
        { fieldId: "structure", operation: "subtract", value: { kind: "rational", numerator: "1", denominator: "1" } },
        { fieldId: "boundary", operation: "subtract", value: { kind: "rational", numerator: "1", denominator: "1" } },
    ]);
    assert.equal(realizeAnchoredCausalWorld(compilation.program, { worldWillEnabled: false }).status, "stable");
});

test("causal Bubble source rejects semantic type shortcuts before runtime", () => {
    const source = readFileSync(examplePath, "utf8");
    const orderedSymbol = source
        .replace("field origin-seed.condition role world-condition = 0", 'field origin-seed.condition role world-condition = "open"')
        .replace("when condition = 0 irreversible", 'when condition > "closed" irreversible');
    assert.throws(
        () => compileCausalBubbleSource(orderedSymbol, { sourcePath: "ordered-symbol.bubble" }),
        (error: unknown) => error instanceof BubbleCompilerError && error.diagnostics.some((entry) => entry.code === "CBL021"),
    );

    const legacyHeader = source.replace("causal bubble GenerationalSeed", "bubble GenerationalSeed");
    assert.throws(
        () => compileCausalBubbleSource(legacyHeader, { sourcePath: "legacy-header.bubble" }),
        (error: unknown) => error instanceof BubbleCompilerError && error.diagnostics.some((entry) => entry.code === "CBL002"),
    );
});
