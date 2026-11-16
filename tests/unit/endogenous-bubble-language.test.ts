import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { BubbleCompilerError, compileEndogenousBubbleSource } from "../../src/bubbles/language";
import {
    realizeEndogenousConnectedUniverse,
    recordEndogenousConnectedUniverse,
    replayEndogenousConnectedUniverse,
    type EndogenousUniverseProgram,
} from "../../src/bubbles/world-kernel";

const sourcePath = resolve(process.cwd(), "examples/endogenous-connected-universe.bubble");
const jsonPath = resolve(process.cwd(), "examples/endogenous-connected-universe.world.json");
const source = readFileSync(sourcePath, "utf8");

function compileExample(): EndogenousUniverseProgram {
    return compileEndogenousBubbleSource(source, { sourcePath }).program;
}

test("endogenous Bubble source is a lossless lowering of the canonical connected-universe program", () => {
    const program = compileExample();
    const jsonProgram = JSON.parse(readFileSync(jsonPath, "utf8")) as EndogenousUniverseProgram;

    assert.deepEqual(program, jsonProgram);
    assert.equal(program.order.universalClock, false);
    assert.equal(program.schemas[0]?.fields.length, 10);
    assert.equal(program.constructors[0]?.relationIdentity.fieldParameters.length, 2);
    assert.equal(program.constructors[0]?.schemaTransformation?.effectValues?.length, 1);
});

test("endogenous Bubble source lowers a complete replacement graph rather than a field-only patch", () => {
    const schemaStart = source.indexOf("  schema field-world");
    const rootStart = source.indexOf("  root origin");
    assert.ok(schemaStart >= 0 && rootStart > schemaStart);
    const replacementGraph = source.slice(schemaStart, rootStart)
        .replace("  schema field-world", "  graph descendant-graph")
        .replaceAll(" field-world ", " descendant-graph ");
    const replacementSource = source
        .slice(0, rootStart)
        .concat(replacementGraph, source.slice(rootStart))
        .replace(
            "  query zero-origin",
            "  family countdown axes n:natural parameters none returns rational recursion natural-axis n = (if (= @n 0) 0 (coordinate countdown (at n (- @n 1))))\n"
            + "  query zero-origin",
        )
        .replace(
            "transform binary-continuation lineage-law-set-morphism",
            "transform binary-continuation lineage-law-set-morphism replace descendant-graph",
        );

    const program = compileEndogenousBubbleSource(replacementSource, { sourcePath: "complete-graph.bubble" }).program;
    const graph = program.constructors[0]?.schemaTransformation?.replaceGraph;

    assert.ok(graph);
    assert.deepEqual(Object.keys(graph).sort(), [
        "causalProjection", "emergenceCriteria", "fields", "internalLaws", "ports",
        "protectedFieldIds", "seaChannels", "selfIdentity",
    ]);
    assert.equal(graph.fields.length, 10);
    assert.equal(graph.seaChannels.length, 2);
    assert.equal(graph.internalLaws.length, 1);
    assert.equal(graph.emergenceCriteria.length, 1);
    assert.equal(graph.causalProjection?.channels.length, 2);
    assert.deepEqual(program.formal.families.find((family) => family.id === "countdown")?.recursion, {
        kind: "well-founded-natural-axis",
        measureAxis: "n",
    });
});

test("endogenous Bubble source preserves realization and same-program re-execution", () => {
    const program = compileExample();
    const options = { generation: { maxDepth: 2, maxWorlds: 32 } };
    const run = realizeEndogenousConnectedUniverse(program, options);
    const replay = replayEndogenousConnectedUniverse(recordEndogenousConnectedUniverse(program, options));

    assert.equal(run.status, "resolved", run.reason);
    assert.equal(run.generationClosures.every((closure) => closure.causalRun.autonomousContinuation?.order.universalClock === false), true);
    assert.equal(replay.status, "verified");
    assert.equal(replay.replayedRunDigest, replay.recordedRunDigest);
});

test("endogenous Bubble source rejects host-time and incomplete or ill-typed semantic shortcuts", () => {
    const clocked = source.replace("universal-clock false", "universal-clock true");
    assert.throws(
        () => compileEndogenousBubbleSource(clocked, { sourcePath: "clocked.bubble" }),
        (error: unknown) => diagnostic(error, "EBL020"),
    );

    const missingIdentity = source.replace(
        "  identity field-world identity-holds query is-one-origin bind value=identity\n",
        "",
    );
    assert.throws(
        () => compileEndogenousBubbleSource(missingIdentity, { sourcePath: "identity-shortcut.bubble" }),
        (error: unknown) => diagnostic(error, "EBL028"),
    );

    const illTypedFamily = source.replace(
        "family zero axes unit:finite(1) parameters none returns rational = 0",
        "family zero axes unit:finite(1) parameters none returns rational = true",
    );
    assert.throws(
        () => compileEndogenousBubbleSource(illTypedFamily, { sourcePath: "ill-typed-family.bubble" }),
        (error: unknown) => error instanceof BubbleCompilerError && error.diagnostics.some((entry) => entry.code.includes("BIK027")),
    );
});

function diagnostic(error: unknown, code: string): boolean {
    return error instanceof BubbleCompilerError && error.diagnostics.some((entry) => entry.code === code);
}
