import assert from "node:assert/strict";
import test from "node:test";
import {
    BubbleCompilerError,
    compileBubbleSource,
    parseBubbleSource,
} from "../../src/bubbles/language";

test("compiles a valid v0.1 bubble world", () => {
    const source = [
        "bubble Ember {",
        "  axiom coherence = stable",
        "  will \"preserve ember symmetry\"",
        "  seed first_spark",
        "  observe local",
        "  effect observe optional",
        "  effect branch optional",
        "  effect commit required",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "inline.bubble" });
    const { program } = result;

    assert.equal(program.profile, "bubbles.v0.1");
    assert.equal(program.bubble.name, "Ember");
    assert.equal(program.bubble.axioms.coherence, "stable");
    assert.equal(program.bubble.worldWill, "preserve ember symmetry");
    assert.equal(program.bubble.seed, "first_spark");
    assert.equal(program.bubble.observationMode, "local");
    assert.equal(program.bubble.effects.length, 3);
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(program.bubble.obligations, [
        {
            effectKind: "commit",
            scope: "local",
            description: "Author declared commit as a required local effect.",
        },
    ]);
});

test("rejects unknown effect kinds", () => {
    const source = [
        "bubble Fault {",
        "  effect implode required",
        "}",
    ].join("\n");

    assert.throws(() => parseBubbleSource(source), /Unknown effect kind 'implode'/);
});

test("enforces v0.1 semantic requirements", () => {
    const source = [
        "bubble Thin {",
        "  axiom coherence = stable",
        "  observe local",
        "  effect branch optional",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "thin.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL202", "BBL203", "BBL206", "BBL207", "BBL208"],
            );
            return true;
        },
    );
});

test("emits warnings when all effects are optional", () => {
    const source = [
        "bubble Quiet {",
        "  axiom coherence = stable",
        "  will \"remain latent\"",
        "  seed hush_seed",
        "  effect branch optional",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "quiet.bubble" });

    assert.equal(result.diagnostics.length, 1);
    assert.equal(result.diagnostics[0].code, "BBL206");
    assert.equal(result.diagnostics[0].severity, "warning");
});

