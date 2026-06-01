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
    assert.deepEqual(program.bubble.effectRoles, {
        declarations: program.bubble.effects,
        obligations: program.bubble.obligations,
        permissions: [
            {
                effectId: "effect:7:observe",
                effectKind: "observe",
                scope: "local",
                requirement: "optional",
                description: "Author permits optional local observe within the current bubble boundary.",
            },
            {
                effectId: "effect:8:branch",
                effectKind: "branch",
                scope: "local",
                requirement: "optional",
                description: "Author permits optional local branch within the current bubble boundary.",
            },
            {
                effectId: "effect:9:commit",
                effectKind: "commit",
                scope: "local",
                requirement: "required",
                description: "Author permits required local commit within the current bubble boundary.",
            },
        ],
        pressures: [
            {
                effectId: "effect:8:branch",
                effectKind: "branch",
                scope: "local",
                pressureKind: "branch-pressure",
                description: "Effect effect:8:branch contributes branch pressure inside the current bubble boundary.",
            },
        ],
        events: [
            {
                effectId: "effect:7:observe",
                effectKind: "observe",
                scope: "local",
                eventKind: "observation-surface",
                description: "Effect effect:7:observe opens an observation-surface event role for the current bubble.",
            },
            {
                effectId: "effect:8:branch",
                effectKind: "branch",
                scope: "local",
                eventKind: "alternative-branch",
                description: "Effect effect:8:branch opens an alternative-branch event role for the current bubble.",
            },
            {
                effectId: "effect:9:commit",
                effectKind: "commit",
                scope: "local",
                eventKind: "history-commit",
                description: "Effect effect:9:commit opens a history-commit event role for the current bubble.",
            },
        ],
        traces: [
            {
                effectId: "effect:7:observe",
                sourceLine: 7,
                traceKind: "declared-effect",
                description: "Effect effect:7:observe preserves one declared-effect trace origin for downstream planning and runtime evidence.",
            },
            {
                effectId: "effect:8:branch",
                sourceLine: 8,
                traceKind: "declared-effect",
                description: "Effect effect:8:branch preserves one declared-effect trace origin for downstream planning and runtime evidence.",
            },
            {
                effectId: "effect:9:commit",
                sourceLine: 9,
                traceKind: "declared-effect",
                description: "Effect effect:9:commit preserves one declared-effect trace origin for downstream planning and runtime evidence.",
            },
        ],
    });
    assert.deepEqual(program.bubble.generation, {
        realizationMode: "nondeterministic",
        realizationSource: "authored",
        worldWillMode: "governing-principle",
        lifecycle: {
            initialMode: "latent",
            observationMode: "local",
            commitsHistory: true,
            supportsCollapse: false,
            supportsLeakage: false,
            carriesDebt: false,
            supportsPerturbation: false,
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

test("lowers leak, debt, and perturb effects into lifecycle semantics", () => {
    const source = [
        "bubble MembraneArchive {",
        "  axiom coherence = stable",
        "  will \"hold a porous record\"",
        "  seed archive_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect leak required scope membrane",
        "  effect debt required",
        "  effect perturb optional",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "membrane-archive.bubble" });

    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.program.bubble.generation.lifecycle, {
        initialMode: "latent",
        observationMode: "witness",
        commitsHistory: true,
        supportsCollapse: false,
        supportsLeakage: true,
        carriesDebt: true,
        supportsPerturbation: true,
    });
    assert.deepEqual(result.program.bubble.effectRoles.pressures, [
        {
            effectId: "effect:8:leak",
            effectKind: "leak",
            scope: "membrane",
            pressureKind: "membrane-leak",
            description: "Effect effect:8:leak contributes membrane leak pressure inside the current bubble boundary.",
        },
        {
            effectId: "effect:9:debt",
            effectKind: "debt",
            scope: "local",
            pressureKind: "unresolved-debt",
            description: "Effect effect:9:debt contributes unresolved debt pressure inside the current bubble boundary.",
        },
        {
            effectId: "effect:10:perturb",
            effectKind: "perturb",
            scope: "local",
            pressureKind: "law-perturbation",
            description: "Effect effect:10:perturb contributes perturbation pressure inside the current bubble boundary.",
        },
    ]);
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
            artifact: {
                kind: "profile-extension",
                profileName: "twig.v0.3",
                extendsProfile: "bubbles.v0.2",
            },
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

test("compiles a valid v0.4 unresolved semantic bubble world", () => {
    const source = [
        "bubble ThresholdField {",
        "  axiom coherence = stable",
        "  will \"preserve partial law under observation\"",
        "  seed threshold_seed",
        "  effect observe required",
        "  unknown value horizonDepth",
        "  unknown entity DistantWitness = \"observer exists beyond the current membrane\"",
        "  constraint membraneBalance = \"boundary.pressure <= 3\"",
        "  partial law driftRule = \"drift depends on unresolved membrane topology\"",
        "  hidden region OuterCanopy",
        "  unobservable relation RootKnot = \"relation exists but cannot yet be observed\"",
        "  latent bubble WaitingArchive",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "threshold-field.bubble" });

    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.program.version, "0.4.0");
    assert.equal(result.program.profile, "bubbles.v0.4");
    assert.deepEqual(result.program.bubble.unresolvedSemantics, [
        {
            id: "semantic:6:unknown-value:horizonDepth",
            kind: "unknown-value",
            name: "horizonDepth",
            description: "Unknown value horizonDepth remains unresolved.",
            sourceLine: 6,
        },
        {
            id: "semantic:7:unknown-entity:DistantWitness",
            kind: "unknown-entity",
            name: "DistantWitness",
            description: "observer exists beyond the current membrane",
            sourceLine: 7,
        },
        {
            id: "semantic:8:constraint:membraneBalance",
            kind: "constraint",
            name: "membraneBalance",
            description: "boundary.pressure <= 3",
            sourceLine: 8,
        },
        {
            id: "semantic:9:partial-law:driftRule",
            kind: "partial-law",
            name: "driftRule",
            description: "drift depends on unresolved membrane topology",
            sourceLine: 9,
        },
        {
            id: "semantic:10:hidden-region:OuterCanopy",
            kind: "hidden-region",
            name: "OuterCanopy",
            description: "Hidden region OuterCanopy remains outside the current observation surface.",
            sourceLine: 10,
        },
        {
            id: "semantic:11:unobservable-relation:RootKnot",
            kind: "unobservable-relation",
            name: "RootKnot",
            description: "relation exists but cannot yet be observed",
            sourceLine: 11,
        },
        {
            id: "semantic:12:latent-bubble:WaitingArchive",
            kind: "latent-bubble",
            name: "WaitingArchive",
            description: "Latent bubble WaitingArchive is admitted but not yet materialized.",
            sourceLine: 12,
        },
    ]);
    assert.deepEqual(result.program.bubble.latentTopology, {
        mode: "bubble-latent-topology.v1",
        regions: [
            {
                id: "latent-region:semantic:10:hidden-region:OuterCanopy",
                sourceSemanticId: "semantic:10:hidden-region:OuterCanopy",
                name: "OuterCanopy",
                kind: "hidden-region",
                description: "Hidden region OuterCanopy remains outside the current observation surface.",
                sourceLine: 10,
                initialState: "latent",
                observationBoundary: "declared-observation-surface",
                commitBoundary: "undeclared-history-support",
                perturbationMode: "no-declared-perturbation",
            },
            {
                id: "latent-region:semantic:12:latent-bubble:WaitingArchive",
                sourceSemanticId: "semantic:12:latent-bubble:WaitingArchive",
                name: "WaitingArchive",
                kind: "latent-bubble",
                description: "Latent bubble WaitingArchive is admitted but not yet materialized.",
                sourceLine: 12,
                initialState: "latent",
                observationBoundary: "declared-observation-surface",
                commitBoundary: "undeclared-history-support",
                perturbationMode: "no-declared-perturbation",
            },
        ],
        collapseEvidenceDrafts: [
            {
                id: "collapse-evidence-draft:semantic:10:hidden-region:OuterCanopy",
                latentRegionId: "latent-region:semantic:10:hidden-region:OuterCanopy",
                sourceSemanticId: "semantic:10:hidden-region:OuterCanopy",
                observationEffectIds: ["effect:5:observe"],
                perturbEffectIds: [],
                commitEffectIds: [],
                draftStatus: "history-open",
                description: "Latent region OuterCanopy can materialize under the declared observation surface, but no history-commit boundary is declared yet.",
            },
            {
                id: "collapse-evidence-draft:semantic:12:latent-bubble:WaitingArchive",
                latentRegionId: "latent-region:semantic:12:latent-bubble:WaitingArchive",
                sourceSemanticId: "semantic:12:latent-bubble:WaitingArchive",
                observationEffectIds: ["effect:5:observe"],
                perturbEffectIds: [],
                commitEffectIds: [],
                draftStatus: "history-open",
                description: "Latent region WaitingArchive can materialize under the declared observation surface, but no history-commit boundary is declared yet.",
            },
        ],
    });
});

test("compiles executable constraints, partial laws, and explicit anchor criteria", () => {
    const source = [
        "bubble AnchoredThreshold {",
        "  axiom coherence = stable",
        "  will \"hold a bounded membrane\"",
        "  seed threshold_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  constraint membraneBalance = boundary.pressure <= 0",
        "  partial law continuityRule = history.commits and world.seeded",
        "  anchor identity = world.seeded and history.commits",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "anchored-threshold.bubble" });

    assert.equal(result.program.profile, "bubbles.v0.4");
    assert.deepEqual(result.program.bubble.unresolvedSemantics?.[0], {
        id: "semantic:8:constraint:membraneBalance",
        kind: "constraint",
        name: "membraneBalance",
        description: "boundary.pressure <= 0",
        expression: {
            kind: "comparison",
            operator: "<=",
            left: {
                kind: "reference",
                path: "boundary.pressure",
            },
            right: {
                kind: "literal",
                value: 0,
            },
        },
        sourceLine: 8,
    });
    assert.deepEqual(result.program.bubble.unresolvedSemantics?.[1], {
        id: "semantic:9:partial-law:continuityRule",
        kind: "partial-law",
        name: "continuityRule",
        description: "history.commits and world.seeded",
        expression: {
            kind: "logical",
            operator: "and",
            left: {
                kind: "reference",
                path: "history.commits",
            },
            right: {
                kind: "reference",
                path: "world.seeded",
            },
        },
        sourceLine: 9,
    });
    assert.deepEqual(result.program.bubble.anchorCriterion, {
        id: "anchor:10:identity",
        sourceLine: 10,
        description: "world.seeded and history.commits",
        expression: {
            kind: "logical",
            operator: "and",
            left: {
                kind: "reference",
                path: "world.seeded",
            },
            right: {
                kind: "reference",
                path: "history.commits",
            },
        },
    });
});

test("lowers parseable world will declarations into executable criteria", () => {
    const source = [
        "bubble Guided {",
        "  axiom coherence = stable",
        "  will history.commits and world.seeded",
        "  seed guided_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "guided.bubble" });

    assert.equal(result.program.profile, "bubbles.v0.4");
    assert.equal(result.program.bubble.worldWill, "history.commits and world.seeded");
    assert.equal(result.program.bubble.generation.worldWillMode, "criterion");
    assert.deepEqual(result.program.bubble.worldWillCriterion, {
        id: "world-will:3",
        sourceLine: 3,
        description: "history.commits and world.seeded",
        expression: {
            kind: "logical",
            operator: "and",
            left: {
                kind: "reference",
                path: "history.commits",
            },
            right: {
                kind: "reference",
                path: "world.seeded",
            },
        },
    });
});

test("rejects duplicate unresolved semantic names", () => {
    const source = [
        "bubble DuplicateUnknown {",
        "  axiom coherence = stable",
        "  will \"fail loudly\"",
        "  seed duplicate_seed",
        "  effect observe required",
        "  unknown value horizonDepth",
        "  hidden region horizonDepth",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "duplicate-unknown.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(error.diagnostics.map((diagnostic) => diagnostic.code), ["BBL223"]);
            return true;
        },
    );
});

test("rejects invalid grammar artifact syntax", () => {
    const source = [
        "bubble BrokenGrammar {",
        "  axiom coherence = stable",
        "  will \"fail loudly\"",
        "  seed broken_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 over bubbles.v0.2\"",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "broken-grammar.bubble" }),
        /Expected 'profile <Name> extends <BaseProfile>'/,
    );
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

test("rejects grammar artifacts that extend unknown base profiles", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends moss.v0.1\"",
        "  activate grammar TwigSyntax as twig.v0.3",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "unknown-base-profile.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL220"],
            );
            return true;
        },
    );
});

test("rejects grammar activations that request a mismatched profile name", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "  activate grammar TwigSyntax as moss.v0.1",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "mismatched-activation-profile.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL221"],
            );
            return true;
        },
    );
});

test("allows grammars to extend locally declared grammar profiles", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar BaseSyntax = \"profile twig.base.v0.3 extends bubbles.v0.2\"",
        "  grammar LeafSyntax = \"profile twig.leaf.v0.3 extends twig.base.v0.3\"",
        "  activate grammar LeafSyntax as twig.leaf.v0.3",
        "}",
    ].join("\n");

    const result = compileBubbleSource(source, { sourcePath: "local-grammar-chain.bubble" });

    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.program.profile, "bubbles.v0.3");
    assert.equal(result.program.bubble.meta?.grammars?.length, 2);
});

test("rejects duplicate declared grammar profile names", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar TwigSyntaxA = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "  grammar TwigSyntaxB = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "duplicate-grammar-profile.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL222"],
            );
            return true;
        },
    );
});

test("rejects local grammar profile-extension cycles", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends moss.v0.3\"",
        "  grammar MossSyntax = \"profile moss.v0.3 extends twig.v0.3\"",
        "  activate grammar TwigSyntax as twig.v0.3",
        "}",
    ].join("\n");

    assert.throws(
        () => compileBubbleSource(source, { sourcePath: "grammar-cycle.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError);
            assert.deepEqual(
                error.diagnostics.map((diagnostic) => diagnostic.code),
                ["BBL223", "BBL223"],
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

