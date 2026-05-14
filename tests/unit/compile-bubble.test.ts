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

test("compiles a valid v0.2 meta bubble world", () => {
    const source = [
        "bubble Nursery {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"grow derived worlds\"",
        "  seed nursery_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  reflect self.address",
        "  reflect self.worldWill",
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "nursery.bubble" });

    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.program.version, "0.2.0");
    assert.equal(result.program.profile, "bubbles.v0.2");
    assert.deepEqual(result.program.bubble.meta, {
        quotes: [
            {
                id: "quote:7:Sapling",
                name: "Sapling",
                sourceLine: 7,
                artifactKind: "bubble-source",
                artifactSource: "bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
            },
        ],
        generators: [
            {
                id: "generator:8:Grove",
                name: "Grove",
                sourceLine: 8,
                parameterName: "seedName",
                sourceQuoteName: "Sapling",
            },
        ],
        reflections: [
            {
                id: "reflect:9:self.address",
                sourceLine: 9,
                path: "self.address",
            },
            {
                id: "reflect:10:self.worldWill",
                sourceLine: 10,
                path: "self.worldWill",
            },
        ],
        emissions: [
            {
                id: "emit:11:Grove",
                sourceLine: 11,
                sourceName: "Grove",
                sourceKind: "generator",
                argument: {
                    kind: "literal",
                    value: "ember_seed",
                },
                target: "descendant",
                provenance: {
                    quoteName: "Sapling",
                    generatorName: "Grove",
                    reflectionIds: ["reflect:9:self.address", "reflect:10:self.worldWill"],
                },
            },
        ],
    });
});

test("compiles a valid v0.3 grammar bubble world", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "  activate grammar TwigSyntax as twig.v0.3",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "grammar-nursery.bubble" });

    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.program.version, "0.3.0");
    assert.equal(result.program.profile, "bubbles.v0.3");
    assert.deepEqual(result.program.bubble.meta?.grammars, [
        {
            id: "grammar:6:TwigSyntax",
            name: "TwigSyntax",
            sourceLine: 6,
            artifactKind: "grammar-source",
            artifactSource: "profile twig.v0.3 extends bubbles.v0.2",
        },
    ]);
    assert.deepEqual(result.program.bubble.meta?.grammarActivations, [
        {
            id: "activate-grammar:7:TwigSyntax",
            sourceLine: 7,
            grammarName: "TwigSyntax",
            profileName: "twig.v0.3",
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
            condition: {
                kind: "text",
                value: "boundary pressure exceeds threshold",
            },
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

test("parses structured spawn conditions into expression IR", () => {
    const source = [
        "bubble Lattice {",
        "  axiom coherence = stable",
        "  will \"branch under pressure\"",
        "  seed lattice_seed",
        "  effect spawn required",
        "  spawn LatticeChild when boundary.pressure > 3 and membrane.state = \"thin\"",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "lattice-conditions.bubble" });

    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.program.bubble.generation.relations[0]?.condition, {
        kind: "logical",
        operator: "and",
        left: {
            kind: "comparison",
            operator: ">",
            left: {
                kind: "reference",
                path: "boundary.pressure",
            },
            right: {
                kind: "literal",
                value: 3,
            },
        },
        right: {
            kind: "comparison",
            operator: "=",
            left: {
                kind: "reference",
                path: "membrane.state",
            },
            right: {
                kind: "literal",
                value: "thin",
            },
        },
    });
    assert.equal(
        result.program.bubble.generation.relations[0]?.description,
        'This bubble may bring descendant family \'LatticeChild\' into existence through required local spawning when boundary.pressure > 3 and membrane.state = "thin".',
    );
});

test("parses emit arguments into shared expression IR", () => {
    const source = [
        "bubble Nursery {",
        "  axiom coherence = stable",
        "  will \"grow derived worlds\"",
        "  seed nursery_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  emit Grove(seed_lineage) as descendant",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "nursery-emit-arg.bubble" });

    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.program.bubble.meta?.emissions[0]?.argument, {
        kind: "reference",
        path: "seed_lineage",
    });
});

test("rejects non-scalar emit expressions for generators in the current profile", () => {
    const source = [
        "bubble Nursery {",
        "  axiom coherence = stable",
        "  will \"grow derived worlds\"",
        "  seed nursery_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  emit Grove(boundary.pressure > 3) as descendant",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "nursery-emit-expression.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL218"],
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

test("rejects generators that reference unknown quotes", () => {
    const source = [
        "bubble Workshop {",
        "  axiom coherence = stable",
        "  will \"grow carefully\"",
        "  seed workshop_seed",
        "  effect spawn required",
        "  generator Grove(seedName) from MissingQuote",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "workshop.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL212"],
            );
            return true;
        },
    );
});

test("rejects grammar activations that reference unknown grammar artifacts", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  activate grammar MissingSyntax as missing.v0.3",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "missing-grammar.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL219"],
            );
            return true;
        },
    );
});

test("rejects unsupported emit usage for quoted artifacts", () => {
    const source = [
        "bubble Studio {",
        "  axiom coherence = stable",
        "  will \"stage quoted worlds\"",
        "  seed studio_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  emit Sapling(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "studio.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL215"],
            );
            return true;
        },
    );
});

