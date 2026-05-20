import assert from "node:assert/strict";
import test from "node:test";
import { compileBubbleSource } from "../../src/bubbles/language";
import {
    inspectBubbleProgram,
    recordBubbleProgram,
    replayBubbleRecord,
} from "../../src/bubbles/runtime";

test("records a materialized bubble into a replayable run bundle", () => {
    const source = [
        "bubble Archive {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"preserve experiment history\"",
        "  seed archive_seed",
        "  observe witness",
        "  effect observe required",
        "  effect commit required",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  reflect self.address",
        "  reflect self.worldWill",
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "archive.bubble" });
    const record = recordBubbleProgram(program);

    assert.equal(record.mode, "bubble-replay.v1");
    assert.equal(record.sourcePath, "archive.bubble");
    assert.equal(record.bubbleName, "Archive");
    assert.equal(record.commitCount, 1);
    assert.equal(record.evidenceCount, 8);
    assert.equal(record.traceCount, 4);
    assert.equal(record.materialization.plan.proof.mode, "bubble-consistency-certificate.v1");
    assert.equal(record.materialization.plan.proof.verdict, "partially-certified");
    assert.equal(record.materialization.plan.sourcePath, "archive.bubble");
    assert.deepEqual(record.materialization.evidence.map((entry) => entry.kind), [
        "negative-sea-state",
        "positive-sea-state",
        "anchor-point-state",
        "observation-context",
        "history-commit",
        "effect-trace",
        "effect-trace",
        "effect-trace",
    ]);
});

test("replay preserves inspection semantics for stored records", () => {
    const source = [
        "bubble Observatory {",
        "  realization deterministic",
        "  axiom coherence = stable",
        "  will \"observe stored runs\"",
        "  seed observatory_seed",
        "  effect spawn required",
        "  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }",
        "  generator Grove(seedName) from Sapling",
        "  reflect self.address",
        "  emit Sapling as artifact",
        "  emit Grove(\"ember_seed\") as descendant",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "observatory-replay.bubble" });
    const live = inspectBubbleProgram(program);
    const record = recordBubbleProgram(program);
    const replayed = replayBubbleRecord(record);

    assert.deepEqual(replayed.summary, live.summary);
    assert.deepEqual(replayed.ontology, live.ontology);
    assert.deepEqual(replayed.proof, live.proof);
    assert.deepEqual(replayed.artifacts, live.artifacts);
    assert.deepEqual(replayed.commits, live.commits);
    assert.deepEqual(replayed.evidence, live.evidence);
    assert.deepEqual(replayed.trace, live.trace);

    const descendantEmission = replayed.plan.emissionPlan.find((emission) => emission.target === "descendant");
    assert.ok(descendantEmission);

    const byEmission = replayBubbleRecord(record, { emissionId: descendantEmission.emissionId });
    assert.equal(byEmission.summary.plannedEmissionCount, 1);
    assert.deepEqual(byEmission.artifacts.map((artifact) => artifact.target), ["descendant"]);

    const byKind = replayBubbleRecord(record, { kind: "materialization-committed" });
    assert.equal(byKind.trace.length, 2);
    assert.ok(byKind.trace.every((event) => event.kind === "materialization-committed"));
});

test("replay preserves staged grammar activation queries", () => {
    const source = [
        "bubble GrammarArchive {",
        "  axiom coherence = stable",
        "  will \"preserve language variants\"",
        "  seed archive_seed",
        "  effect spawn required",
        "  grammar TwigSyntax = \"profile twig.v0.3 extends bubbles.v0.2\"",
        "  activate grammar TwigSyntax as twig.v0.3",
        "}",
    ].join("\n");

    const { program } = compileBubbleSource(source, { sourcePath: "grammar-archive.bubble" });
    const record = recordBubbleProgram(program);
    const replayed = replayBubbleRecord(record, { activationId: "activate-grammar:7:TwigSyntax" });

    assert.equal(replayed.summary.plannedGrammarCount, 1);
    assert.equal(replayed.summary.plannedGrammarActivationCount, 1);
    assert.deepEqual(replayed.grammars.activations, [
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
    assert.deepEqual(replayed.trace.map((event) => event.kind), ["grammar-activation-staged"]);
});