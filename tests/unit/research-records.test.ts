import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const requiredRecords = [
    "docs/project-memory.md",
    "docs/idea-log.md",
    "docs/decision-log.md",
    "docs/work-log.md",
    "docs/research/question-log.md",
    "docs/research/hypothesis-log.md",
    "docs/research/boundary-log.md",
    "docs/research/idea-implementation-map.md",
    "docs/research/author-idea-corpus.md",
    "docs/process/research-ops.md",
] as const;

const datedLogs = [
    "docs/idea-log.md",
    "docs/decision-log.md",
    "docs/work-log.md",
    "docs/research/boundary-log.md",
] as const;

function readRepositoryFile(path: string): string {
    return readFileSync(resolve(process.cwd(), path), "utf8");
}

function extractDates(source: string): string[] {
    return [...source.matchAll(/^## (\d{4}-\d{2}-\d{2})\s*$/gm)].map((match) => match[1]);
}

test("canonical research records remain UTF-8 text and are indexed by operations", () => {
    const operations = readRepositoryFile("docs/process/research-ops.md");

    for (const path of requiredRecords) {
        const source = readRepositoryFile(path);
        assert.ok(source.length > 0, `${path} must not be empty`);
        assert.equal(source.includes("\u0000"), false, `${path} must not contain UTF-16 null bytes`);

        if (path !== "docs/process/research-ops.md") {
            const relativeTarget = path.replace(/^docs\//, "../");
            assert.ok(
                operations.includes(relativeTarget) || operations.includes(path.replace(/^docs\//, "../")),
                `${path} must be named by the research operations index`,
            );
        }
    }

    assert.match(readRepositoryFile("docs/project-memory.md"), /^Last updated: \d{4}-\d{2}-\d{2}$/m);
    assert.match(readRepositoryFile("docs/research/idea-implementation-map.md"), /^Last reconciled: \d{4}-\d{2}-\d{2}$/m);
    assert.match(readRepositoryFile("docs/research/question-log.md"), /^Last reconciled: \d{4}-\d{2}-\d{2}$/m);
});

test("dated logs keep valid monotonic date sections", () => {
    for (const path of datedLogs) {
        const dates = extractDates(readRepositoryFile(path));
        assert.ok(dates.length > 0, `${path} must contain at least one dated section`);
        const ascending = [...dates].sort();
        const descending = [...ascending].reverse();
        assert.ok(
            dates.every((date, index) => date === ascending[index])
                || dates.every((date, index) => date === descending[index]),
            `${path} date sections must not interleave older and newer sessions`,
        );
        assert.equal(new Set(dates).size, dates.length, `${path} must not repeat a date section`);
    }
});

test("every decision and research question remains inside the tracked record structure", () => {
    const decisionLog = readRepositoryFile("docs/decision-log.md");
    const firstDecisionDate = decisionLog.search(/^## \d{4}-\d{2}-\d{2}\s*$/m);
    const firstDecision = decisionLog.search(/^### D-\d+:/m);
    assert.ok(firstDecisionDate >= 0 && firstDecision > firstDecisionDate, "decisions must follow a dated section");

    const decisionIds = [...decisionLog.matchAll(/^### (D-\d+):/gm)].map((match) => match[1]);
    assert.equal(new Set(decisionIds).size, decisionIds.length, "decision identifiers must be unique");

    const questionLog = readRepositoryFile("docs/research/question-log.md");
    const questionIds = [...questionLog.matchAll(/^### (Q-\d+):/gm)].map((match) => match[1]);
    assert.deepEqual(questionIds, Array.from({ length: 22 }, (_, index) => `Q-${String(index + 1).padStart(3, "0")}`));

    for (const questionId of questionIds) {
        const sectionStart = questionLog.indexOf(`### ${questionId}:`);
        const nextSection = questionLog.indexOf("\n### Q-", sectionStart + 1);
        const section = questionLog.slice(sectionStart, nextSection < 0 ? undefined : nextSection);
        assert.match(section, /^Status: .+$/m, `${questionId} must have an explicit status`);
    }
});

test("completed v0.5.1 preserves v0.5 self-realization and every open research branch", () => {
    const packageManifest = JSON.parse(readRepositoryFile("package.json")) as { version: string };
    const packageLock = JSON.parse(readRepositoryFile("package-lock.json")) as {
        version: string;
        packages: Record<string, { version?: string }>;
    };
    const projectMemory = readRepositoryFile("docs/project-memory.md");
    const operations = readRepositoryFile("docs/process/research-ops.md");
    const closurePlan = readRepositoryFile("docs/architecture/v0.4.9-closure-plan.md");
    const ideaLog = readRepositoryFile("docs/idea-log.md");
    const questionLog = readRepositoryFile("docs/research/question-log.md");
    const implementationMap = readRepositoryFile("docs/research/idea-implementation-map.md");
    const architecture = readRepositoryFile("docs/architecture/v0.5.1-anchored-narrative-world.md");
    const manifest = JSON.parse(readRepositoryFile("package.json")) as { scripts: Record<string, string> };

    assert.equal(packageManifest.version, "0.5.1");
    assert.equal(packageLock.version, "0.5.1");
    assert.equal(packageLock.packages[""]?.version, "0.5.1");
    assert.ok(projectMemory.includes("its completed successor is `v0.5.1`"));
    assert.ok(projectMemory.includes("does not certify OB-001 whole-universe completion"));
    assert.ok(projectMemory.includes("Phase 2 observer, agent, and comparative benchmark work must wait"));
    assert.ok(architecture.includes("Status: completed bounded connected release on 2026-07-15"));
    assert.ok(architecture.includes("all thirteen gates have bounded executable evidence"));
    assert.ok(architecture.includes("not the complete Bubble universe promised by OB-001"));
    assert.ok(manifest.scripts["verify"].includes("verify:narrative-example"));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("examples/anchored-garden.world.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("data/runs/anchored-garden.replay.json")));
    assert.ok(closurePlan.includes("Status: completed on 2026-07-15"));
    assert.ok(operations.includes("## Preservation Discipline"));

    for (const heading of [
        "Future research: observation-induced materialization and perturbative collapse",
        "Future research: deterministic substrate, probabilistic fractal worldhood",
        "Sea-anchor world structure",
        "Bubble as universal semantic unit",
        "Bubble as language generator",
        "Grammar making grammar",
        "Bubble language as a bubble",
        "Bubble must earn its existence",
        "Bubble language clarification",
        "Source cluster",
        "Core project direction",
        "Language ambition",
        "Nondeterministic language direction",
    ]) {
        assert.ok(ideaLog.includes(`### ${heading}`), `original idea cluster '${heading}' must remain recorded`);
    }

    assert.match(questionLog, /### Q-011:[\s\S]*?Status: open/);
    assert.match(questionLog, /### Q-014:[\s\S]*?Status: bounded runtime source-attribution slice completed in v0\.4\.9/);
    assert.match(questionLog, /### Q-015:[\s\S]*?Status: open and explicitly deferred beyond the v0\.5 entry gate/);
    assert.match(questionLog, /### Q-018:[\s\S]*?Status: implemented bounded baseline through v0\.5\.1/);
    assert.match(questionLog, /### Q-019:[\s\S]*?Status: partially implemented through v0\.5\.1/);
    assert.match(questionLog, /### Q-020:[\s\S]*?Status: implemented bounded baseline in v0\.5\.1/);
    assert.match(questionLog, /### Q-021:[\s\S]*?Status: implemented bounded connected baseline in v0\.5\.1/);
    assert.match(questionLog, /### Q-022:[\s\S]*?Status: explicitly deferred until the current Bubble universe and prior idea obligations are complete/);
    assert.ok(implementationMap.includes("`v0.5.0` implements the first organic self-realization vertical flow"));
    assert.ok(implementationMap.includes("Completed `v0.5.1` satisfies its bounded connected gate"));
    assert.ok(implementationMap.includes("long-running persistence, relationship-mediated action, global sea transport, cross-world anchors, and full identity remain open"));
    assert.ok(implementationMap.toLowerCase().includes("this transition does not close or delete the partial, open, or deferred rows above"));
});

test("author ideas remain immutable source obligations rather than prose-only memory", () => {
    const corpus = readRepositoryFile("docs/research/author-idea-corpus.md");
    const ledger = JSON.parse(readRepositoryFile("data/research/idea-obligations.v1.json")) as {
        mode: string;
        recordedDate: string;
        obligations: Array<{
            id: string;
            sourceIds: string[];
            status: string;
            implementationEvidence: string[];
            acceptanceTests: string[];
            remainingLimits: string[];
            reopenCondition: string;
        }>;
        sessionConstraints: Array<{ id: string; status: string }>;
    };

    assert.equal(ledger.mode, "bubble-author-idea-obligations.v1");
    assert.equal(ledger.recordedDate, "2026-07-15");
    assert.equal(new Set(ledger.obligations.map((entry) => entry.id)).size, ledger.obligations.length);
    assert.ok(ledger.obligations.length >= 9);
    for (const obligation of ledger.obligations) {
        assert.ok(obligation.sourceIds.length > 0, `${obligation.id} needs primary-source provenance`);
        for (const sourceId of obligation.sourceIds) {
            assert.ok(corpus.includes(`### ${sourceId}:`), `${sourceId} must remain in the author corpus`);
        }
        assert.ok(obligation.remainingLimits.length > 0, `${obligation.id} must preserve remaining limits`);
        assert.ok(obligation.reopenCondition.length > 0, `${obligation.id} must preserve a reopen condition`);
        if (obligation.status === "realized") {
            assert.ok(obligation.implementationEvidence.length > 0, `${obligation.id} realized status needs code evidence`);
            assert.ok(obligation.acceptanceTests.length > 0, `${obligation.id} realized status needs acceptance tests`);
        }
    }
    assert.ok(ledger.sessionConstraints.some((entry) => entry.id === "SC-001" && entry.status === "in-force"));
});
