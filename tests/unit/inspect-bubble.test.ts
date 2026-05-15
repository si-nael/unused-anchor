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
        plannedGrammarCount: 0,
        plannedGrammarActivationCount: 0,
        plannedEmissionCount: 1,
        materializedArtifactCount: 1,
        descendantCount: 1,
        artifactCount: 0,
        commitCount: 1,
        evidenceCount: 0,
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
    assert.deepEqual(report.evidence, []);
});

test("inspection exposes staged grammar activations as a queryable grammar section", () => {
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
    const report = inspectBubbleProgram(program);

    assert.equal(report.summary.plannedGrammarCount, 1);
    assert.equal(report.summary.plannedGrammarActivationCount, 1);
    assert.equal(report.summary.plannedEmissionCount, 0);
    assert.deepEqual(report.grammars, {
        artifacts: [
            {
                grammarId: "grammar:6:TwigSyntax",
                grammarName: "TwigSyntax",
                artifactKind: "profile-extension",
                profileName: "twig.v0.3",
                extendsProfile: "bubbles.v0.2",
            },
        ],
        activations: [
            {
                activationId: "activate-grammar:7:TwigSyntax",
                grammarId: "grammar:6:TwigSyntax",
                grammarName: "TwigSyntax",
                requestedProfileName: "twig.v0.3",
                resolvedProfileName: "twig.v0.3",
                extendsProfile: "bubbles.v0.2",
                staged: true,
            },
        ],
    });
    assert.deepEqual(report.trace.map((event) => event.kind), [
        "materialization-started",
        "grammar-activation-staged",
        "no-emissions",
    ]);

    const byActivation = inspectBubbleProgram(program, { activationId: "activate-grammar:7:TwigSyntax" });
    assert.equal(byActivation.summary.plannedGrammarActivationCount, 1);
    assert.equal(byActivation.summary.materializedArtifactCount, 0);
    assert.equal(byActivation.summary.commitCount, 0);
    assert.deepEqual(byActivation.trace.map((event) => event.kind), ["grammar-activation-staged"]);

    const byGrammarProfile = inspectBubbleProgram(program, { grammarProfile: "twig.v0.3" });
    assert.equal(byGrammarProfile.grammars.artifacts.length, 1);
    assert.equal(byGrammarProfile.grammars.activations.length, 1);
    assert.deepEqual(byGrammarProfile.trace.map((event) => event.kind), ["grammar-activation-staged"]);
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
    assert.equal(report.summary.evidenceCount, 0);
});

test("inspection queries can narrow reports by emission, address, and trace kind", () => {
    const source = [
        "bubble Observatory {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"observe staged worlds\"",
        "  seed observatory_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  reflect self.address",
        "  emit Sapling as artifact",
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "observatory.bubble" });
    const unfiltered = inspectBubbleProgram(program);
    const descendantEmission = unfiltered.plan.emissionPlan.find((emission) => emission.target === "descendant");

    assert.ok(descendantEmission);

    const byEmission = inspectBubbleProgram(program, { emissionId: descendantEmission.emissionId });
    assert.equal(byEmission.summary.plannedEmissionCount, 1);
    assert.equal(byEmission.summary.materializedArtifactCount, 1);
    assert.deepEqual(byEmission.artifacts.map((artifact) => artifact.target), ["descendant"]);
    assert.deepEqual(byEmission.commits.map((commit) => commit.emissionId), [descendantEmission.emissionId]);
    assert.deepEqual(byEmission.trace.map((event) => event.kind), [
        "reflection-captured",
        "emission-materialized",
        "materialization-committed",
    ]);

    assert.ok(descendantEmission.derivedAddress);

    const byAddress = inspectBubbleProgram(program, { addressId: descendantEmission.derivedAddress.id });
    assert.equal(byAddress.summary.plannedEmissionCount, 1);
    assert.equal(byAddress.artifacts[0].addressId, descendantEmission.derivedAddress.id);
    assert.equal(byAddress.commits[0].committedAddressId, descendantEmission.derivedAddress.id);

    const byKind = inspectBubbleProgram(program, { kind: "reflection-captured" });
    assert.equal(byKind.summary.plannedEmissionCount, 2);
    assert.equal(byKind.trace.length, 2);
    assert.ok(byKind.trace.every((event) => event.kind === "reflection-captured"));
});

test("inspection exposes observation evidence as a first-class report section", () => {
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

    const { program } = compileBubbleSource(source, { sourcePath: "observatory-inspect.bubble" });
    const report = inspectBubbleProgram(program);

    assert.equal(report.summary.plannedEmissionCount, 0);
    assert.equal(report.summary.evidenceCount, 1);
    assert.deepEqual(report.evidence, [
        {
            id: "evidence:observe:bubble:observatory-inspect.bubble::root:Observatory",
            kind: "observation-context",
            bubbleAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            subjectAddressId: "bubble:observatory-inspect.bubble::root:Observatory",
            sourcePath: "observatory-inspect.bubble",
            observationMode: "witness",
            emissionId: null,
            commitId: null,
            description: "Bubble Observatory declares observation mode witness with durable history support.",
        },
    ]);
});