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
        "  realization nondeterministic",
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
    assert.deepEqual(program.bubble.address, {
        scheme: "bubble-lineage.v1",
        locatorKind: "source-relative",
        anchor: "inline.bubble",
        path: [
            {
                kind: "root",
                key: "Ember",
            },
        ],
        id: "bubble:inline.bubble::root:Ember",
    });
    assert.equal(program.bubble.name, "Ember");
    assert.equal(program.bubble.axioms.coherence, "stable");
    assert.equal(program.bubble.worldWill, "preserve ember symmetry");
    assert.equal(program.bubble.seed, "first_spark");
    assert.equal(program.bubble.observationMode, "local");
    assert.equal(program.bubble.effects.length, 3);
    assert.deepEqual(program.bubble.effects[2], {
        id: "effect:9:commit",
        sourceLine: 9,
        sourceConstruct: "effect",
        kind: "commit",
        requirement: "required",
        scope: "local",
    });
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(program.bubble.obligations, [
        {
            effectId: "effect:9:commit",
            effectKind: "commit",
            scope: "local",
            description: "Author declared commit as a required local effect.",
        },
    ]);
    assert.deepEqual(program.bubble.generation, {
        realizationMode: "nondeterministic",
        realizationSource: "authored",
        worldWillMode: "governing-principle",
        lifecycle: {
            initialMode: "latent",
            observationMode: "local",
            commitsHistory: true,
            supportsCollapse: false,
        },
        relations: [
            {
                kind: "branch",
                sourceEffectId: "effect:8:branch",
                requirement: "optional",
                scope: "local",
                target: "alternative-bubble",
                familyName: null,
                condition: null,
                targetAddressTemplate: {
                    locatorKind: "lineage-relative",
                    baseAddressId: "bubble:inline.bubble::root:Ember",
                    pathSuffix: [
                        {
                            kind: "branch",
                            key: "effect:8:branch",
                        },
                    ],
                    description: "Derive a alternative-bubble address from bubble:inline.bubble::root:Ember via optional local branch relation effect:8:branch.",
                },
                description: "This bubble may realize alternative bubble continuations through optional local branching.",
            },
        ],
    });
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

test("captures generative relations for spawn effects", () => {
    const source = [
        "bubble Orchard {",
        "  realization deterministic",
        "  axiom canopy = dense",
        "  will \"propagate new groves\"",
        "  seed acorn_seed",
        "  effect spawn required scope membrane",
        "  spawn GroveChild when \"boundary pressure exceeds threshold\"",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "orchard.bubble" });

    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.program.bubble.generation.realizationMode, "deterministic");
    assert.equal(result.program.bubble.generation.realizationSource, "authored");
    assert.deepEqual(result.program.bubble.address, {
        scheme: "bubble-lineage.v1",
        locatorKind: "source-relative",
        anchor: "orchard.bubble",
        path: [
            {
                kind: "root",
                key: "Orchard",
            },
        ],
        id: "bubble:orchard.bubble::root:Orchard",
    });
    assert.deepEqual(result.program.bubble.generation.relations, [
        {
            kind: "spawn",
            sourceEffectId: "effect:6:spawn",
            requirement: "required",
            scope: "membrane",
            target: "descendant-bubble",
            familyName: "GroveChild",
            condition: "boundary pressure exceeds threshold",
            targetAddressTemplate: {
                locatorKind: "lineage-relative",
                baseAddressId: "bubble:orchard.bubble::root:Orchard",
                pathSuffix: [
                    {
                        kind: "spawn",
                        key: "GroveChild:7",
                    },
                ],
                description: "Derive a descendant-bubble address from bubble:orchard.bubble::root:Orchard via required membrane spawn family GroveChild at line 7.",
            },
            description: "This bubble may bring descendant family 'GroveChild' into existence through required membrane spawning when boundary pressure exceeds threshold.",
        },
    ]);
    assert.deepEqual(result.program.bubble.obligations, [
        {
            effectId: "effect:6:spawn",
            effectKind: "spawn",
            scope: "membrane",
            description: "Author declared spawn as a required membrane effect.",
        },
    ]);
});

test("requires spawn declarations to declare a spawn effect", () => {
    const source = [
        "bubble Mist {",
        "  axiom coherence = stable",
        "  will \"drift quietly\"",
        "  seed vapor_seed",
        "  effect branch optional",
        "  spawn MistChild when \"pressure folds inward\"",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "mist.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL206", "BBL209"],
            );
            return true;
        },
    );
});

test("rejects deterministic realization when a branch effect is declared", () => {
    const source = [
        "bubble Lattice {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"hold one path\"",
        "  seed lattice_seed",
        "  effect branch optional",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "lattice.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL206", "BBL210"],
            );
            return true;
        },
    );
});

