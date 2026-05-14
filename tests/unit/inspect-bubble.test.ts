import assert from "node:assert/strict";
import test from "node:test";
import { compileBubbleSource } from "../../src/bubbles/language";
import { inspectBubbleProgram, materializeBubbleProgram } from "../../src/bubbles/runtime";

test("inspects a meta bubble into a stable summary and artifact view", () => {
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
    const report = inspectBubbleProgram(program);

    assert.deepEqual(report.summary, {
        bubbleName: "Nursery",
        profile: "bubbles.v0.2",
        addressId: "bubble:nursery.bubble::root:Nursery",
        obligationCount: 1,
        plannedRelationCount: 1,
        plannedEmissionCount: 1,
        materializedArtifactCount: 1,
        descendantCount: 1,
        artifactCount: 0,
        commitCount: 1,
        reflectionPaths: ["self.address", "self.worldWill"],
        traceKinds: [
            "materialization-started",
            "reflection-captured",
            "emission-materialized",
            "materialization-committed",
        ],
    });
    assert.deepEqual(report.artifacts, [
        {
            emissionId: "emit:11:Grove",
            target: "descendant",
            addressId: "bubble:nursery.bubble::root:Nursery/spawn:emit:11:Grove",
            bubbleName: "Sapling",
            profile: "bubbles.v0.1",
            sourcePath: "nursery.bubble#emit:11:Grove",
            worldWill: "preserve inner symmetry",
            seed: "ember_seed",
            diagnosticsCount: 0,
        },
    ]);
});

test("inspection report reuses materialization results faithfully", () => {
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
    const report = inspectBubbleProgram(program);

    assert.equal(report.commits.length, materialized.commits.length);
    assert.equal(report.trace.length, materialized.trace.length);
    assert.equal(report.summary.artifactCount, 1);
    assert.equal(report.summary.descendantCount, 0);
    assert.equal(report.artifacts[0].target, "artifact");
    assert.equal(report.artifacts[0].addressId, null);
});