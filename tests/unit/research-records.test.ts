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
    assert.deepEqual(questionIds, Array.from({ length: 28 }, (_, index) => `Q-${String(index + 1).padStart(3, "0")}`));

    for (const questionId of questionIds) {
        const sectionStart = questionLog.indexOf(`### ${questionId}:`);
        const nextSection = questionLog.indexOf("\n### Q-", sectionStart + 1);
        const section = questionLog.slice(sectionStart, nextSection < 0 ? undefined : nextSection);
        assert.match(section, /^Status: .+$/m, `${questionId} must have an explicit status`);
    }
});

test("completed bounded v0.5.6 preserves prior kernels, the original philosophy, and every open research branch", () => {
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
    const causalArchitecture = readRepositoryFile("docs/architecture/v0.5.2-generative-causal-universe.md");
    const persistenceArchitecture = readRepositoryFile("docs/architecture/v0.5.3-persistent-causal-structure.md");
    const teleonomicArchitecture = readRepositoryFile("docs/architecture/v0.5.4-endogenous-teleonomy.md");
    const branchingArchitecture = readRepositoryFile("docs/architecture/v0.5.5-endogenous-causal-branching.md");
    const lifecycleArchitecture = readRepositoryFile("docs/architecture/endogenous-world-lifecycle-candidate.md");
    const lifecycleRelease = readRepositoryFile("docs/architecture/v0.5.6-endogenous-world-lifecycle.md");
    const manifest = JSON.parse(readRepositoryFile("package.json")) as { scripts: Record<string, string> };

    assert.equal(packageManifest.version, "0.5.6");
    assert.equal(packageLock.version, "0.5.6");
    assert.equal(packageLock.packages[""]?.version, "0.5.6");
    assert.ok(projectMemory.includes("bounded endogenous-world-lifecycle release `v0.5.6`"));
    assert.ok(projectMemory.includes("does not certify deliberation, agency, dynamic schema/population generation, cross-world transport, or OB-001 whole-universe completion"));
    assert.ok(projectMemory.includes("Phase 2 observer, external-agent, and comparative benchmark work must wait"));
    assert.ok(projectMemory.includes("Completed bounded `v0.5.6` closes the finite lifecycle-and-language gate"));
    assert.ok(projectMemory.includes("The author explicitly selected `v0.5.6`"));
    assert.ok(architecture.includes("Status: completed bounded connected release on 2026-07-15"));
    assert.ok(architecture.includes("all thirteen gates have bounded executable evidence"));
    assert.ok(architecture.includes("not the complete Bubble universe promised by OB-001"));
    assert.ok(architecture.includes("explicitly agent-bearing specialization"));
    assert.ok(causalArchitecture.includes("Status: completed bounded corrective release on 2026-07-15"));
    assert.ok(causalArchitecture.includes("does not require a protagonist, an action vocabulary, or a story field"));
    assert.ok(causalArchitecture.includes("It also does not forbid them from arising"));
    assert.ok(persistenceArchitecture.includes("Status: completed bounded persistence release on 2026-07-15"));
    assert.ok(persistenceArchitecture.includes("No entity, protagonist, agent, or persistence criterion is declared"));
    assert.ok(persistenceArchitecture.includes("It still does not establish consciousness, agency, a protagonist, a goal, a relationship, or a story"));
    assert.ok(teleonomicArchitecture.includes("Status: completed bounded teleonomic-capacity release on 2026-07-17"));
    assert.ok(teleonomicArchitecture.includes("introduces no entity, agent, protagonist, goal declaration, action list, or story graph"));
    assert.ok(teleonomicArchitecture.includes("teleonomic capacity**, not life or agency"));
    assert.ok(teleonomicArchitecture.includes("examples/distributed-channel-field.world.json"));
    assert.ok(branchingArchitecture.includes("Status: completed bounded endogenous-causal-branching release on 2026-07-17"));
    assert.ok(branchingArchitecture.includes("every maximal clique of that compatibility graph"));
    assert.ok(branchingArchitecture.includes("hostSelection: false"));
    assert.ok(branchingArchitecture.includes("This is not deliberative agency"));
    assert.ok(lifecycleArchitecture.includes("Status: completed technical precursor; released as bounded `v0.5.6`"));
    assert.ok(lifecycleArchitecture.includes("Observation-induced materialization"));
    assert.ok(lifecycleArchitecture.includes("Branch nonrealization"));
    assert.ok(lifecycleArchitecture.includes("This is not schema generation"));
    assert.ok(lifecycleRelease.includes("Status: completed bounded lifecycle-and-language release"));
    assert.ok(lifecycleRelease.includes("latent < active < retired"));
    assert.ok(lifecycleRelease.includes("This is causal lifecycle"));
    assert.ok(lifecycleRelease.includes("without the host or World Will selecting either lifecycle transition"));
    assert.ok(lifecycleRelease.includes("runtime generation of new field schemas, laws, or open-ended populations"));
    assert.ok(manifest.scripts["verify"].includes("verify:narrative-example"));
    assert.ok(manifest.scripts["verify"].includes("verify:causal-example"));
    assert.ok(manifest.scripts["verify"].includes("verify:branching-example"));
    assert.ok(manifest.scripts["verify"].includes("verify:lifecycle-example"));
    assert.ok(manifest.scripts["verify"].includes("verify:lifecycle-language-example"));
    assert.ok(manifest.scripts["verify"].includes("verify:persistence-example"));
    assert.ok(manifest.scripts["verify"].includes("verify:teleonomy-example"));
    assert.ok(manifest.scripts["verify"].includes("verify:teleonomy-distributed-example"));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("examples/anchored-garden.world.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("examples/self-organizing-field.world.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("examples/self-maintaining-field.world.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("examples/distributed-channel-field.world.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("examples/endogenous-branching-field.world.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("examples/generational-grove.world.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("data/runs/anchored-garden.replay.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("data/runs/self-organizing-field.replay.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("data/runs/self-maintaining-field.replay.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("data/runs/self-maintaining-field.teleonomic.replay.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("data/runs/distributed-channel-field.teleonomic.replay.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("data/runs/endogenous-branching-field.replay.json")));
    assert.doesNotThrow(() => JSON.parse(readRepositoryFile("data/runs/generational-grove.replay.json")));
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
        "Beyond Turing without pretending the finite host is a hypercomputer",
    ]) {
        assert.ok(ideaLog.includes(`### ${heading}`), `original idea cluster '${heading}' must remain recorded`);
    }

    assert.match(questionLog, /### Q-011:[\s\S]*?Status: open/);
    assert.match(questionLog, /### Q-014:[\s\S]*?Status: bounded runtime source-attribution slice completed in v0\.4\.9/);
    assert.match(questionLog, /### Q-015:[\s\S]*?Status: open and explicitly deferred beyond the v0\.5 entry gate/);
    assert.match(questionLog, /### Q-018:[\s\S]*?Status: implemented bounded baseline through v0\.5\.6, including finite endogenous world lifecycle/);
    assert.match(questionLog, /### Q-019:[\s\S]*?Status: partially implemented through v0\.5\.6 with bounded lifecycle-history evidence/);
    assert.match(questionLog, /### Q-020:[\s\S]*?Status: implemented bounded baseline in v0\.5\.1/);
    assert.match(questionLog, /### Q-021:[\s\S]*?Status: implemented bounded connected baseline in v0\.5\.1/);
    assert.match(questionLog, /### Q-022:[\s\S]*?Status: explicitly deferred until the current Bubble universe and prior idea obligations are complete/);
    assert.match(questionLog, /### Q-023:[\s\S]*?Status: implemented actor-neutral generative, persistent, teleonomic-capacity, endogenous-branching, and finite-lifecycle baselines through v0\.5\.6; agency remains open/);
    assert.match(questionLog, /### Q-024:[\s\S]*?Status: implemented bounded exact baseline in v0\.5\.3/);
    assert.match(questionLog, /### Q-025:[\s\S]*?Status: implemented bounded teleonomic-capacity baseline in v0\.5\.4; agency remains open/);
    assert.match(questionLog, /### Q-026:[\s\S]*?Status: open independent foundational question; no release selected and no current hypercomputation claim/);
    assert.match(questionLog, /### Q-027:[\s\S]*?Status: open; selected as a remaining 5\.x semantic-core question before Rust 6\.x/);
    assert.match(questionLog, /### Q-028:[\s\S]*?Status: open; selected as a cross-substrate performance contract spanning late 5\.x and Rust 6\.x/);
    assert.ok(implementationMap.includes("`v0.5.0` implements the first organic self-realization vertical flow"));
    assert.ok(implementationMap.includes("Completed `v0.5.1` satisfies its bounded connected gate"));
    assert.ok(implementationMap.includes("Completed bounded `v0.5.2` adds the forward corrective gate"));
    assert.ok(implementationMap.includes("Completed bounded `v0.5.3` adds the first persistence-and-boundary gate"));
    assert.ok(implementationMap.includes("Completed bounded `v0.5.4` adds the teleonomic-capacity gate"));
    assert.ok(implementationMap.includes("Completed bounded `v0.5.5` adds the endogenous-causal-branching gate"));
    assert.ok(implementationMap.includes("Completed bounded `v0.5.6` adds the endogenous-world-lifecycle and source-lowering gate"));
    assert.ok(implementationMap.includes("This completed bounded release actualizes a finite declared latent graph"));
    assert.ok(implementationMap.includes("deliberative or simultaneous counterfactual choice, relation-mediated action"));
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
    assert.ok(ledger.obligations.length >= 11);
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
    const transTuring = ledger.obligations.find((entry) => entry.id === "OB-012");
    assert.equal(transTuring?.status, "open");
    assert.deepEqual(transTuring?.sourceIds, ["AI-20260717-001", "AI-20260717-002"]);
    assert.ok(corpus.includes("### AI-20260717-001: Can Bubble exceed the Turing-machine boundary?"));
    assert.ok(corpus.includes("### AI-20260717-002: Preserve it as an independent research question"));
    const portableExecution = ledger.obligations.find((entry) => entry.id === "OB-013");
    assert.deepEqual(portableExecution?.sourceIds, ["AI-20260717-003", "AI-20260717-004", "AI-20260717-005"]);
    assert.ok(corpus.includes("### AI-20260717-003: Do not leave the Bubble execution authority trapped in TypeScript"));
    assert.ok(corpus.includes("### AI-20260717-004: Efficient execution must remain portable across computational substrates"));
    assert.ok(corpus.includes("### AI-20260717-005: Close the 5.x semantic core before beginning the Rust 6.x substrate"));
    assert.ok(ledger.sessionConstraints.some((entry) => entry.id === "SC-002" && entry.status === "in-force"));
});
