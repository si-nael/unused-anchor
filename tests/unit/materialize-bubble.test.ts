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
    ]);
    assert.equal(materialized.trace.at(-1)?.kind, "no-emissions");
});