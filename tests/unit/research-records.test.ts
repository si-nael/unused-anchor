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
    assert.deepEqual(questionIds, Array.from({ length: 19 }, (_, index) => `Q-${String(index + 1).padStart(3, "0")}`));

    for (const questionId of questionIds) {
        const sectionStart = questionLog.indexOf(`### ${questionId}:`);
        const nextSection = questionLog.indexOf("\n### Q-", sectionStart + 1);
        const section = questionLog.slice(sectionStart, nextSection < 0 ? undefined : nextSection);
        assert.match(section, /^Status: .+$/m, `${questionId} must have an explicit status`);
    }
});

test("v0.5 implements self-realization without pruning the original research branches", () => {
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

    assert.equal(packageManifest.version, "0.5.0");
    assert.equal(packageLock.version, "0.5.0");
    assert.equal(packageLock.packages[""]?.version, "0.5.0");
    assert.ok(projectMemory.includes("The next incremental release is `v0.5.1`."));
    assert.ok(projectMemory.includes("Phase 2 observer, agent, and comparative benchmark work must wait"));
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
    assert.match(questionLog, /### Q-018:[\s\S]*?Status: implemented bounded baseline in v0\.5\.0/);
    assert.match(questionLog, /### Q-019:[\s\S]*?Status: partially implemented in v0\.5\.0/);
    assert.ok(implementationMap.includes("`v0.5.0` implements the first organic self-realization vertical flow"));
    assert.ok(implementationMap.toLowerCase().includes("this transition does not close or delete the partial, open, or deferred rows above"));
});
