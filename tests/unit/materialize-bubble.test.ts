import assert from "node:assert/strict";
import test from "node:test";
import { compileBubbleSource } from "../../src/bubbles/language";
import { materializeBubbleProgram, planBubbleProgram } from "../../src/bubbles/runtime";

test("plans and materializes descendant emissions from a meta bubble", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "nursery.bubble" });
    const plan = planBubbleProgram(program);
    const materialized = materializeBubbleProgram(program);

    assert.equal(plan.mode, "semantic-plan.v1");
    assert.deepEqual(plan.emissionPlan, [
        {
            emissionId: "emit:11:Grove",
            sourceName: "Grove",
            sourceKind: "generator",
            target: "descendant",
            quoteName: "Sapling",
            generatorName: "Grove",
            derivedAddress: {
                scheme: "bubble-lineage.v1",
                locatorKind: "lineage-relative",
                anchor: "nursery.bubble",
                path: [
                    {
                        kind: "root",
                        key: "Nursery",
                    },
                    {
                        kind: "spawn",
                        key: "emit:11:Grove",
                    },
                ],
                id: "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove",
            },
            reflectionPaths: ["self.address", "self.worldWill"],
        },
    ]);
    assert.deepEqual(plan.ontology, {
        negativeSea: {
            pressure: "low",
            signals: [],
        },
        positiveSea: {
            support: "strong",
            signals: ["source-lineage-address", "seeded-origin", "descendant-lineage", "staged-growth"],
        },
        anchorPoint: {
            strength: "steady",
            trustedHistory: false,
            rewindStability: "guarded",
            signals: ["axiomatic-basis", "world-will", "seed-continuity"],
        },
        theoremWitness: {
            theorem: "sea-anchor-necessity.v1",
            negativeRank: 0,
            positiveRank: 2,
            anchorRank: 1,
            worldhoodDelta: 3,
            identityDelta: 1,
            sustained: true,
            condition: "stable",
            explanation: "Bubble worldhood remains stable because A=1, P=2, N=0, so A + P - N = 3.",
        },
    });
    assert.deepEqual(plan.grammars, []);
    assert.deepEqual(plan.grammarActivationPlan, []);

    assert.equal(materialized.artifacts.length, 1);
    assert.equal(materialized.commits.length, 1);
    assert.equal(materialized.artifacts[0].target, "descendant");
    assert.equal(materialized.artifacts[0].program.bubble.name, "Sapling");
    assert.equal(materialized.artifacts[0].program.bubble.seed, "ember_seed");
    assert.equal(materialized.artifacts[0].address?.id, "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove");
    assert.deepEqual(materialized.artifacts[0].reflections, {
        "self.address": program.bubble.address,
        "self.worldWill": "grow derived worlds",
    });
    assert.deepEqual(materialized.evidence.map((entry) => entry.kind), [
        "negative-sea-state",
        "positive-sea-state",
        "anchor-point-state",
        "effect-trace",
    ]);
    assert.equal(materialized.commits[0].committedAddressId, "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove");
});

test("materializes direct quoted artifacts without generator arguments", () => {
    const source = [
        "bubble Studio {",
        "  axiom coherence = stable",
        "  will \"stage worlds\"",
        "  seed studio_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  emit Sapling as artifact",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "studio.bubble" });
    const materialized = materializeBubbleProgram(program);

    assert.equal(materialized.artifacts.length, 1);
    assert.equal(materialized.artifacts[0].target, "artifact");
    assert.equal(materialized.artifacts[0].address, null);
    assert.equal(materialized.artifacts[0].program.bubble.seed, "latent_seed");
    assert.equal(materialized.trace.at(-1)?.kind, "materialization-committed");
});

test("records observation evidence even when no staged emissions exist", () => {
    const source = [
        "bubble Observatory {",
        "  axiom coherence = stable",
        "  will \"preserve observed history\"",
        "  seed observatory_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "observatory.bubble" });
    const materialized = materializeBubbleProgram(program);

    assert.equal(materialized.artifacts.length, 0);
    assert.equal(materialized.commits.length, 0);
    assert.deepEqual(materialized.evidence, [
        {
            id: "evidence:negative-sea:bubble:observatory.bubble::root:Observatory",
            kind: "negative-sea-state",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            pressure: "low",
            signals: [],
            description: "Bubble Observatory currently shows low negative-sea pressure.",
        },
        {
            id: "evidence:positive-sea:bubble:observatory.bubble::root:Observatory",
            kind: "positive-sea-state",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            support: "present",
            signals: ["source-lineage-address", "seeded-origin", "durable-history"],
            description: "Bubble Observatory currently shows present positive-sea support via source-lineage-address, seeded-origin, durable-history.",
        },
        {
            id: "evidence:anchor-point:bubble:observatory.bubble::root:Observatory",
            kind: "anchor-point-state",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            strength: "strong",
            trustedHistory: true,
            rewindStability: "stable",
            signals: ["axiomatic-basis", "world-will", "seed-continuity", "durable-history", "observation-surface"],
            description: "Bubble Observatory currently shows strong anchor support with stable rewind stability.",
        },
        {
            id: "evidence:observe:bubble:observatory.bubble::root:Observatory",
            kind: "observation-context",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            description: "Bubble Observatory declares observation mode witness with durable history support.",
        },
        {
            id: "evidence:effect:effect:6:observe",
            kind: "effect-trace",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:6:observe",
            effectKind: "observe",
            requirement: "required",
            scope: "local",
            sourceLine: 6,
            materializationState: "materialized",
            runtimeSignals: ["observation-surface"],
            description: "Bubble Observatory recorded required local observe as materialized in this run via observation-surface.",
        },
        {
            id: "evidence:effect:effect:7:commit",
            kind: "effect-trace",
            bubbleAddressId: "bubble:observatory.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory.bubble::root:Observatory",
            sourcePath: "observatory.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            effectId: "effect:7:commit",
            effectKind: "commit",
            requirement: "required",
            scope: "local",
            sourceLine: 7,
            materializationState: "potential",
            runtimeSignals: ["durable-history"],
            description: "Bubble Observatory recorded required local commit as potential in this run via durable-history.",
        },
    ]);
    assert.equal(materialized.trace.at(-1)?.kind, "no-emissions");
});

test("plans staged grammar activations without mutating the current parser", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "grammar-nursery.bubble" });
    const plan = planBubbleProgram(program);
    const materialized = materializeBubbleProgram(program);

    assert.deepEqual(plan.grammars, [
        {
            grammarId: "grammar:6:TwigSyntax",
            grammarName: "TwigSyntax",
            artifactKind: "profile-extension",
            profileName: "twig.v0.3",
            extendsProfile: "bubbles.v0.2",
        },
    ]);
    assert.deepEqual(plan.grammarActivationPlan, [
        {
            activationId: "activate-grammar:7:TwigSyntax",
            grammarId: "grammar:6:TwigSyntax",
            grammarName: "TwigSyntax",
            requestedProfileName: "twig.v0.3",
            resolvedProfileName: "twig.v0.3",
            extendsProfile: "bubbles.v0.2",
            staged: true,
        },
    ]);
    assert.deepEqual(materialized.trace.map((event) => event.kind), [
        "materialization-started",
        "grammar-activation-staged",
        "no-emissions",
    ]);
    assert.equal(materialized.trace[1].activationId, "activate-grammar:7:TwigSyntax");
    assert.equal(materialized.artifacts.length, 0);
});

test("resolves staged grammar activations to the declared profile when none is requested explicitly", () => {
    const source = [
        "bubble GrammarNursery {",
        "  axiom coherence = stable",
        "  will \"grow language variants\"",
        "  seed grammar_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "  activate grammar TwigSyntax",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "grammar-nursery-default-profile.bubble" });
    const plan = planBubbleProgram(program);

    assert.deepEqual(plan.grammarActivationPlan, [
        {
            activationId: "activate-grammar:7:TwigSyntax",
            grammarId: "grammar:6:TwigSyntax",
            grammarName: "TwigSyntax",
            requestedProfileName: null,
            resolvedProfileName: "twig.v0.3",
            extendsProfile: "bubbles.v0.2",
            staged: true,
        },
    ]);
});