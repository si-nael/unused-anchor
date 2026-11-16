import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { causalConformanceCases, CAUSAL_CONFORMANCE_DIRECTORY } from "../../apps/hatchery/causal-conformance-corpus";
import {
    BirLoweringError,
    buildCausalConformanceFixture,
    causalOutcomeSchema,
    causalProgramSchema,
    checkCausalConformance,
    decodeBir,
    decodeNode,
    encodeBirEnvelope,
    encodeCausalOutcome,
    fixtureHostCost,
    liftFromBir,
    realizeAnchoredCausalWorldFromBir,
    type BirSchema,
    type CausalExecutor,
} from "../../src/bubbles/bir";
import {
    compareCanonicalStrings,
    realizeAnchoredCausalWorld,
    type AnchoredCausalRun,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";

interface ManifestEntry {
    name: string;
    file: string;
    inputSemanticDigest: string;
    outcomeDigest: string;
    status: AnchoredCausalRun["status"];
    resourceVerdict: { exhaustiveInterventionSearch: boolean; exhaustiveInternalBranching: boolean };
}

const manifest = JSON.parse(readFileSync(resolve(process.cwd(), CAUSAL_CONFORMANCE_DIRECTORY, "manifest.json"), "utf8")) as {
    fixtures: ManifestEntry[];
};

function fixtureBytes(name: string): Uint8Array {
    const entry = manifest.fixtures.find((candidate) => candidate.name === name)!;
    return new Uint8Array(readFileSync(resolve(process.cwd(), CAUSAL_CONFORMANCE_DIRECTORY, entry.file)));
}

function reverseSetPositions(value: unknown, schema: BirSchema): unknown {
    let resolved = schema;
    while (resolved.kind === "lazy") resolved = resolved.resolve();
    switch (resolved.kind) {
        case "set":
            return [...(value as unknown[])].reverse().map((item) => reverseSetPositions(item, resolved.of));
        case "seq":
            return (value as unknown[]).map((item) => reverseSetPositions(item, resolved.of));
        case "map":
            return Object.fromEntries(Object.entries(value as Record<string, unknown>).reverse()
                .map(([key, item]) => [key, reverseSetPositions(item, resolved.of)]));
        case "record":
        case "variant": {
            const record = value as Record<string, unknown>;
            const fields = resolved.kind === "record" ? resolved.fields : resolved.variants[record[resolved.tag] as string]!;
            return Object.fromEntries(Object.entries(record).map(([key, item]) => [
                key,
                fields[key] ? reverseSetPositions(item, fields[key]!.schema) : item,
            ]));
        }
        default:
            return value;
    }
}

/** Independent RFC 8785 serializer for the value shapes used by evidence-id derivations. */
function jcs(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(jcs).join(",")}]`;
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        // RFC 8785 sorts member names by UTF-16 code units.
        const keys = Object.keys(record).sort((left, right) => {
            for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
                const difference = left.charCodeAt(index) - right.charCodeAt(index);
                if (difference !== 0) return difference;
            }
            return left.length - right.length;
        });
        return `{${keys.map((key) => `${JSON.stringify(key)}:${jcs(record[key])}`).join(",")}}`;
    }
    if (typeof value === "number" && !Number.isSafeInteger(value)) throw new Error("only integers are used in evidence ids");
    return JSON.stringify(value);
}

const sha = (value: unknown): string => createHash("sha256").update(jcs(value)).digest("hex");

test("the frozen corpus covers every case and the reference oracle conforms to all of it", () => {
    assert.deepEqual(manifest.fixtures.map((entry) => entry.name).sort(), causalConformanceCases().map((entry) => entry.name).sort());
    for (const entry of manifest.fixtures) {
        const result = checkCausalConformance(fixtureBytes(entry.name));
        assert.equal(result.status, "conformant", `${entry.name}: ${result.firstDifference ?? result.detail ?? ""}`);
        assert.equal(result.inputSemanticDigest, entry.inputSemanticDigest);
        assert.equal(result.expectedOutcomeDigest, entry.outcomeDigest);
    }
});

test("resource-boundary fixtures fix an honest verdict instead of a convenient partial world", () => {
    const verdict = (name: string) => manifest.fixtures.find((entry) => entry.name === name)!;
    assert.equal(verdict("branch-budget-exhausted").status, "underdetermined");
    assert.equal(verdict("branch-budget-exhausted").resourceVerdict.exhaustiveInternalBranching, false);
    assert.equal(verdict("intervention-budget-exhausted").status, "underdetermined");
    assert.equal(verdict("intervention-budget-exhausted").resourceVerdict.exhaustiveInterventionSearch, false);
    assert.equal(verdict("proof-budget-exhausted").status, "underdetermined");
    assert.equal(verdict("unknown-option-target").status, "contradicted");

    // A backend that answers an exhausted branch budget by keeping the first branch is not conformant.
    const choosesFirstBranch: CausalExecutor = (program, options) => {
        const { maxInternalBranches: _bound, ...unbounded } = options;
        const run = realizeAnchoredCausalWorld(program, unbounded);
        return {
            ...run,
            status: "realized",
            continuations: run.continuations.slice(0, 1),
            selectedContinuationIds: run.continuations.slice(0, 1).map((continuation) => continuation.id),
        };
    };
    const result = checkCausalConformance(fixtureBytes("branch-budget-exhausted"), choosesFirstBranch);
    assert.equal(result.status, "drift");
    assert.ok(result.firstDifference);
});

test("a backend that changes what the world did drifts at a precise location", () => {
    const shiftsOneField: CausalExecutor = (program, options) => {
        const run = structuredClone(realizeAnchoredCausalWorld(program, options));
        const state = run.continuations[0]!.worldStates[0]!;
        const fieldId = Object.keys(state.fields).sort()[0]!;
        state.fields[fieldId] = { kind: "rational", numerator: "999", denominator: "1" };
        return run;
    };
    const result = checkCausalConformance(fixtureBytes("connected-fields"), shiftsOneField);
    assert.equal(result.status, "drift");
    assert.match(result.firstDifference!, /[cC]ontinuations\{id=continuation:autonomous\}\.worldStates\{worldId=[^}]+\}\.fields\./);
    assert.notEqual(result.actualOutcomeDigest, result.expectedOutcomeDigest);
});

test("host-only differences in how a world is computed remain conformant", () => {
    const reorganizesHostDetail: CausalExecutor = (program, options) => {
        const run = structuredClone(realizeAnchoredCausalWorld(program, options));
        run.programDigest = "0".repeat(64);
        run.reason = "a different backend explains itself differently";
        run.formalEvidence = [...run.formalEvidence].reverse().map((evidence) => ({ ...evidence, proof: [], subjectId: `other:${evidence.subjectId}` }));
        run.resourceUse = { ...run.resourceUse, formalEvaluationSteps: 0, formalQueryCount: 0 };
        for (const continuation of [...run.continuations, ...(run.autonomousContinuations ?? [])]) {
            continuation.trace = [...continuation.trace].reverse()
                .filter((entry) => entry.kind !== "sea-coupling")
                .map((entry, index) => ({ ...entry, id: entry.id.replace(/^trace:\d+:/, `trace:${index + 100}:`) }));
            continuation.order.evaluationOrder = [...continuation.order.evaluationOrder].reverse();
            continuation.worldStates = [...continuation.worldStates].reverse();
            continuation.realizedEventIds = [...continuation.realizedEventIds].reverse();
        }
        run.candidateAssessments = run.candidateAssessments.map((candidate) => ({ ...candidate, reasons: ["rephrased"] }));
        return run;
    };
    for (const name of ["endogenous-branching-field", "generational-grove", "connected-fields", "endogenous-connected-universe"]) {
        const result = checkCausalConformance(fixtureBytes(name), reorganizesHostDetail);
        assert.equal(result.status, "conformant", `${name}: ${result.firstDifference ?? ""}`);
    }
});

test("conformance does not depend on how the input program was ordered", () => {
    for (const entry of causalConformanceCases().filter((candidate) => ["self-organizing-field", "endogenous-connected-universe"].includes(candidate.name))) {
        const permuted = reverseSetPositions(entry.program, causalProgramSchema) as ExecutableAnchoredCausalProgram;
        const fixture = buildCausalConformanceFixture({ ...entry, program: permuted });
        const committed = manifest.fixtures.find((candidate) => candidate.name === entry.name)!;
        assert.equal(fixture.inputSemanticDigest, committed.inputSemanticDigest);
        assert.equal(fixture.outcomeDigest, committed.outcomeDigest);
    }
});

interface OutcomeView {
    continuations: Array<Record<string, any>>;
    autonomousContinuations: Array<Record<string, any>>;
    initialWorldStates: Array<Record<string, any>>;
}

/** The decoded portable outcome alone: what an independent backend sees. */
function outcomeOf(program: ExecutableAnchoredCausalProgram, options = {}): OutcomeView {
    const run = realizeAnchoredCausalWorld(program, options);
    return liftFromBir(decodeNode(encodeCausalOutcome(run)), causalOutcomeSchema) as OutcomeView;
}

const canonicalIds = (ids: string[]): string[] => [...ids].sort(compareCanonicalStrings);

function assertBranchIdsFromOutcome(outcome: OutcomeView): number {
    let checked = 0;
    for (const continuation of [...outcome.continuations, ...outcome.autonomousContinuations]) {
        const lineage = (continuation.branchLineage ?? []) as Array<{ id: string; frontierIndex: number; realizedLawIds: string[] }>;
        lineage.forEach((step, index) => {
            assert.equal(step.id, `branch:${sha({
                parent: lineage.slice(0, index).map((prior) => prior.id),
                frontierIndex: step.frontierIndex,
                realizedLawIds: canonicalIds(step.realizedLawIds),
            }).slice(0, 16)}`);
            checked += 1;
        });
    }
    return checked;
}

test("world-identity evidence ids are reproducible from the decoded outcome alone by RFC 8785 hashing", () => {
    const cases = causalConformanceCases();
    const branching = cases.find((entry) => entry.name === "endogenous-branching-field")!.program;
    assert.ok(assertBranchIdsFromOutcome(outcomeOf(branching)) > 0);

    // Rename a co-realized law so that BIR set order (shorter strings first) differs from canonical order.
    const firstRun = realizeAnchoredCausalWorld(branching);
    const multiLawStep = [...firstRun.continuations, ...(firstRun.autonomousContinuations ?? [])]
        .flatMap((continuation) => continuation.branchLineage ?? [])
        .find((step) => step.realizedLawIds.length >= 2)!;
    const renamedLawId = multiLawStep.realizedLawIds[0]!;
    const renamed = structuredClone(branching);
    renamed.world.internalLaws.find((law) => law.id === renamedLawId)!.id = "z";
    const renamedOutcome = outcomeOf(renamed);
    const storedOrder = renamedOutcome.continuations.flatMap((continuation) => continuation.branchLineage ?? [])
        .find((step: { realizedLawIds: string[] }) => step.realizedLawIds.includes("z"))!.realizedLawIds as string[];
    assert.notDeepEqual(storedOrder, canonicalIds(storedOrder), "the probe must exercise a set order that is not canonical order");
    assert.ok(assertBranchIdsFromOutcome(renamedOutcome) > 0);

    const connected = cases.find((entry) => entry.name === "connected-fields")!;
    const transfers = outcomeOf(connected.program, connected.options).continuations
        .flatMap((continuation) => continuation.anchorTransferEvents ?? []) as Array<{ frontierId: string; lawId: string; transferId: string }>;
    assert.ok(transfers.length > 0);
    for (const frontierId of new Set(transfers.map((transfer) => transfer.frontierId))) {
        const members = transfers.filter((transfer) => transfer.frontierId === frontierId)
            .sort((left, right) => compareCanonicalStrings(left.lawId, right.lawId))
            .map((transfer) => ({ lawId: transfer.lawId, transferId: transfer.transferId }));
        assert.equal(frontierId, `transfer-frontier:${sha(members).slice(0, 16)}`);
    }

    const grove = outcomeOf(cases.find((entry) => entry.name === "generational-grove")!.program);
    const continuation = grove.continuations.find((candidate) => candidate.id === "continuation:autonomous")!;
    const spawn = continuation.lifecycleEvents.find((event: { kind: string }) => event.kind === "world-spawn");
    const sources = canonicalIds(spawn.sourceWorldIds);
    const initialLineage = (worldId: string) => grove.initialWorldStates.find((state) => state.worldId === worldId)?.lifecycle?.lineageId ?? `initial:${worldId}`;
    assert.equal(spawn.lineageId, `lineage:${sha({
        targetWorldId: spawn.targetWorldId,
        sourceWorldIds: sources,
        causedByLawEventIds: canonicalIds(spawn.causedByLawEventIds),
        parentLineages: sources.map(initialLineage),
        branchLineage: [],
    }).slice(0, 20)}`);
    const retirement = continuation.lifecycleEvents.find((event: { kind: string }) => event.kind === "world-retirement");
    const retired = continuation.worldStates.find((state: { worldId: string }) => state.worldId === retirement.targetWorldId);
    assert.equal(retirement.residue.finalStateDigest, sha({
        fields: retired.fields,
        intrinsicViability: retired.intrinsicViability,
        seaContribution: retired.seaContribution,
    }));
});

test("anchor identity verdicts are part of what the world did", () => {
    const breaksIdentity: CausalExecutor = (program, options) => {
        const run = structuredClone(realizeAnchoredCausalWorld(program, options));
        for (const continuation of [...run.continuations, ...(run.autonomousContinuations ?? []), ...(run.autonomousContinuation ? [run.autonomousContinuation] : [])]) {
            continuation.anchorIdentity = continuation.anchorIdentity?.map((verdict) => ({ ...verdict, value: { kind: "boolean" as const, value: false } }));
        }
        return run;
    };
    const result = checkCausalConformance(fixtureBytes("autonomy-all-anchors-cut"), breaksIdentity);
    assert.equal(result.status, "drift");
    assert.match(result.firstDifference!, /anchorIdentity/);
});

test("the checker reports every failure instead of throwing", () => {
    const base = decodeBir(fixtureBytes("connected-fields")).envelope;
    const withSection = (name: string, payload: Uint8Array) => encodeBirEnvelope({
        ...base,
        sections: base.sections.map((section) => section.name === name ? { ...section, payload } : section),
    });
    assert.equal(checkCausalConformance(withSection("conformance.label", Uint8Array.of(0xff))).status, "invalid-fixture");
    assert.equal(checkCausalConformance(withSection("conformance.causal-outcome", Uint8Array.of(0xff))).status, "invalid-fixture");
    const crashes: CausalExecutor = () => {
        throw new Error("backend crashed");
    };
    assert.equal(checkCausalConformance(fixtureBytes("connected-fields"), crashes).status, "executor-failed");
    const malformed: CausalExecutor = (program, options) => {
        const run = structuredClone(realizeAnchoredCausalWorld(program, options)) as unknown as Record<string, unknown>;
        delete run.selectedContinuationIds;
        return run as unknown as AnchoredCausalRun;
    };
    const malformedResult = checkCausalConformance(fixtureBytes("connected-fields"), malformed);
    assert.equal(malformedResult.status, "drift");
    assert.match(malformedResult.firstDifference!, /not a projectable causal run/);
    const annotates: CausalExecutor = (program, options) => {
        const run = structuredClone(realizeAnchoredCausalWorld(program, options)) as unknown as { continuations: Array<Record<string, any>> };
        for (const continuation of run.continuations) {
            continuation.trace = continuation.trace.map((entry: Record<string, unknown>) => ({ ...entry, backendNote: "jit" }));
            continuation.anchorTransferEvents = (continuation.anchorTransferEvents ?? []).map((event: Record<string, unknown>) => ({ ...event, lane: 3 }));
            continuation.lifecycleEvents = (continuation.lifecycleEvents ?? []).map((event: Record<string, unknown>) => ({ ...event, lane: 3 }));
        }
        return run as unknown as AnchoredCausalRun;
    };
    for (const name of ["connected-fields", "generational-grove"]) {
        assert.equal(checkCausalConformance(fixtureBytes(name), annotates).status, "conformant", name);
    }
});

test("fixture input sections must be critical, and a document's own options are its execution meaning", () => {
    const base = decodeBir(fixtureBytes("autonomy-all-anchors-cut")).envelope;
    const body = encodeBirEnvelope(base);
    // Demote the options section by flipping its flag byte, then reseal: the decoder rejects a non-critical core section.
    const demoted = Uint8Array.from(body.subarray(0, body.length - 32));
    const marker = new TextEncoder().encode("core.causal-execution-options");
    const at = Buffer.from(demoted).indexOf(Buffer.from(marker));
    demoted[at + marker.length] = 0;
    const resealed = new Uint8Array(demoted.length + 32);
    resealed.set(demoted);
    resealed.set(createHash("sha256").update(demoted).digest(), demoted.length);
    assert.equal(checkCausalConformance(resealed).status, "invalid-fixture");

    const fromBir = realizeAnchoredCausalWorldFromBir(fixtureBytes("autonomy-all-anchors-cut"));
    const entry = manifest.fixtures.find((candidate) => candidate.name === "autonomy-all-anchors-cut")!;
    assert.equal(fromBir.run!.status, entry.status);
    assert.throws(
        () => realizeAnchoredCausalWorldFromBir(fixtureBytes("autonomy-all-anchors-cut"), { worldWillEnabled: true }),
        (error: unknown) => error instanceof BirLoweringError && error.code === "BIRL22",
    );
});

test("host cost is deterministic, informational, and profiles the four selected workload classes", () => {
    const cases = causalConformanceCases();
    const branchCase = cases.find((entry) => entry.name === "endogenous-branching-field")!;
    assert.deepEqual(buildCausalConformanceFixture(branchCase).hostCost, buildCausalConformanceFixture(branchCase).hostCost);
    const profile = (name: string) => fixtureHostCost(fixtureBytes(name))!;
    assert.ok(profile("endogenous-branching-field").branchFrontierCandidates > 0, "branch-heavy");
    assert.ok(profile("self-organizing-field").exactRationalConstructions > 0, "exact arithmetic");
    assert.ok(profile("endogenous-connected-universe").materializedIntensionalCoordinates
        > profile("connected-fields").materializedIntensionalCoordinates, "intensional");
    assert.ok(profile("generational-grove").lawApplications > 0 && profile("self-maintaining-field").lawApplications > 0, "persistent lifecycle");
    assert.ok(profile("connected-fields").birNodesDecoded > 0 && profile("connected-fields").birBytesRead > 0, "portable decoding is metered");
});

test("a tampered or future-semantic fixture is reported rather than silently accepted", () => {
    const bytes = Uint8Array.from(fixtureBytes("connected-fields"));
    bytes[bytes.length - 40] = bytes[bytes.length - 40]! ^ 0x01;
    assert.equal(checkCausalConformance(bytes).status, "invalid-fixture");
    const document = decodeBir(fixtureBytes("connected-fields"));
    const future = encodeBirEnvelope({
        ...document.envelope,
        sections: [...document.envelope.sections, { name: "core.future-semantics", critical: true, payload: Uint8Array.of(1) }],
    });
    assert.equal(checkCausalConformance(future).status, "not-executable");
});
