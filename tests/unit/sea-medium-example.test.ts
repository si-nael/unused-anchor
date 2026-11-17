import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { causalConformanceCases } from "../../apps/hatchery/causal-conformance-corpus";
import { causalOutcomeSchema, decodeNode, encodeCausalOutcome, liftFromBir } from "../../src/bubbles/bir";
import { compileCausalBubbleSource } from "../../src/bubbles/language";
import {
    addExactRationals,
    compareCanonicalStrings,
    exactValuesEqual,
    inspectAnchoredCausalRun,
    realizeAnchoredCausalWorld,
    recordAnchoredCausalReplay,
    replayAnchoredCausalRecord,
    validateExecutableCausalProgram,
    type AnchoredCausalRun,
    type CausalContinuation,
    type CausalWorldState,
    type ExactValue,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";

const EXAMPLE_PATH = resolve(process.cwd(), "examples", "residue-commons.causal.bubble");
const SOURCE = readFileSync(EXAMPLE_PATH, "utf8");
const CLOSED_SHELTER = 'field sheltered.boundary role boundary-state = "closed"';
const OPEN_SHELTER = 'field sheltered.boundary role boundary-state = "open"';

const rational = (numerator: number, denominator = 1): ExactValue => ({
    kind: "rational",
    numerator: String(numerator),
    denominator: String(denominator),
});

function compile(source = SOURCE): ExecutableAnchoredCausalProgram {
    return compileCausalBubbleSource(source, { sourcePath: EXAMPLE_PATH }).program;
}

function realize(source = SOURCE): AnchoredCausalRun {
    return realizeAnchoredCausalWorld(compile(source), { worldWillEnabled: false });
}

function variant(search: string, replacement: string, source = SOURCE): string {
    assert.ok(source.includes(search), `example lacks '${search}'`);
    return source.replace(search, replacement);
}

function state(continuation: CausalContinuation | AnchoredCausalRun, worldId: string): CausalWorldState {
    const states = "worldStates" in continuation ? continuation.worldStates : continuation.initialWorldStates;
    const found = states.find((candidate) => candidate.worldId === worldId);
    assert.ok(found, `missing world '${worldId}'`);
    return found;
}

function hasEdge(continuation: CausalContinuation, cause: string, effect: string): boolean {
    return continuation.order.causalEdges.some((edge) => edge.cause === cause && edge.effect === effect);
}

function sum(values: ExactValue[]): ExactValue {
    return values.reduce<ExactValue>((total, value) => addExactRationals(total, value)!, rational(0));
}

const RELEASE = "retire:elder:by:retire-elder";
const CHAIN = ["law:retire-elder", RELEASE, "medium:diffuse-residue", "medium:seep-exposed", "law:erode-exposed"];

test("residue commons is a closed medium whose source lowers and validates without any law writing a sea field", () => {
    const program = compile();
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const medium = program.world.seaMedium;
    assert.ok(medium);
    assert.equal(medium.closure, "closed");
    assert.deepEqual(medium.regions.map((region) => region.id), ["near", "far"]);
    assert.deepEqual(medium.adjacency, [{ id: "near-far", regionIds: ["near", "far"] }]);
    assert.deepEqual(
        medium.placements.map((placement) => `${placement.worldId}@${placement.regionId}`),
        ["elder@near", "heir@near", "exposed@far", "sheltered@far"],
    );
    assert.deepEqual(medium.exchangeLaws.map((law) => law.id), ["support-heir", "diffuse-residue", "seep-exposed", "seep-sheltered"]);
    for (const law of program.world.internalLaws) {
        const world = program.world.worlds.find((candidate) => candidate.id === law.worldId)!;
        const seaFields = [world.seaCoupling.positiveFieldId, world.seaCoupling.negativeFieldId];
        assert.equal(law.effects.some((effect) => seaFields.includes(effect.fieldId)), false, law.id);
    }
});

test("one universe: retirement releases residue that diffuses, seeps through the open boundary, and erodes the exposed world", () => {
    const run = realize();
    assert.equal(run.status, "stable");
    assert.deepEqual(run.selectedContinuationIds, ["continuation:autonomous"]);
    assert.deepEqual(run.unresolvedAlternativeIds, []);
    assert.equal(run.continuations.length, 1);
    assert.deepEqual(run.initialSeaMedium, [
        { id: "far", negative: rational(0), positive: rational(1) },
        { id: "near", negative: rational(0), positive: rational(1) },
    ]);
    const continuation = run.continuations[0]!;

    // The synchronous frontiers: birth, then retirement beside the heir's placement support, then the cross-world chain.
    assert.deepEqual(continuation.order.evaluationFrontiers, [
        ["law:germinate-heir"],
        ["spawn:heir:by:germinate-heir"],
        ["law:retire-elder", "medium:support-heir"],
        [RELEASE],
        ["medium:diffuse-residue", "law:form-heir"],
        ["medium:seep-exposed"],
        ["law:erode-exposed"],
    ]);
    for (let index = 0; index + 1 < CHAIN.length; index += 1) {
        assert.ok(hasEdge(continuation, CHAIN[index]!, CHAIN[index + 1]!), `${CHAIN[index]} -> ${CHAIN[index + 1]}`);
    }
    assert.ok(hasEdge(continuation, "law:germinate-heir", "spawn:heir:by:germinate-heir"));
    assert.ok(hasEdge(continuation, "spawn:heir:by:germinate-heir", "medium:support-heir"));
    assert.ok(hasEdge(continuation, "medium:support-heir", "law:form-heir"));

    // Release on retirement: the elder's entire local sea enters its placement region.
    const lifecycle = continuation.lifecycleEvents ?? [];
    assert.deepEqual(lifecycle.map((event) => event.id), ["spawn:heir:by:germinate-heir", RELEASE]);
    const retirement = lifecycle.find((event) => event.id === RELEASE)!;
    assert.deepEqual(retirement.residue?.seaRelease, { regionId: "near", negative: rational(2), positive: rational(1) });
    assert.deepEqual(retirement.residue?.localNegativeSea, rational(2));
    const elder = state(continuation, "elder");
    assert.equal(elder.lifecycle?.phase, "retired");
    assert.deepEqual([elder.fields.negative, elder.fields.positive], [rational(0), rational(0)]);
    const releaseTrace = continuation.trace.find((entry) => entry.eventId === RELEASE)!;
    assert.deepEqual(
        releaseTrace.effects.filter((effect) => effect.layer === "sea-region").map((effect) => [effect.regionId, effect.fieldId, effect.operation, effect.after]),
        [["near", "negative", "add", rational(2)], ["near", "positive", "add", rational(1)]],
    );

    // Every exchange is the medium's own law, caused by what last changed its bound quantities.
    const exchanges = continuation.seaExchangeEvents ?? [];
    assert.deepEqual(exchanges.map((event) => event.id), ["medium:support-heir", "medium:diffuse-residue", "medium:seep-exposed"]);
    const exchange = (id: string) => exchanges.find((event) => event.id === id)!;
    assert.deepEqual(exchange("medium:diffuse-residue").causes, [RELEASE]);
    assert.deepEqual(exchange("medium:diffuse-residue").from, { kind: "region", regionId: "near", before: rational(2), after: rational(1) });
    assert.deepEqual(exchange("medium:diffuse-residue").to, { kind: "region", regionId: "far", before: rational(0), after: rational(1) });
    assert.deepEqual(exchange("medium:seep-exposed").causes, ["medium:diffuse-residue"]);
    assert.deepEqual(exchange("medium:seep-exposed").from, { kind: "region", regionId: "far", before: rational(1), after: rational(0) });
    assert.deepEqual(exchange("medium:seep-exposed").to, {
        kind: "world", worldId: "exposed", fieldId: "negative", before: rational(0), after: rational(1),
    });
    assert.deepEqual(exchange("medium:support-heir").causes, ["spawn:heir:by:germinate-heir"]);
    assert.deepEqual(exchange("medium:support-heir").to, {
        kind: "world", worldId: "heir", fieldId: "positive", before: rational(0), after: rational(1),
    });
    assert.ok(exchanges.every((event) => event.hostSelection === false));
    const diffusionTrace = continuation.trace.find((entry) => entry.eventId === "medium:diffuse-residue")!;
    assert.equal(diffusionTrace.kind, "sea-medium");
    assert.equal(diffusionTrace.worldId, "commons", "a region-to-region exchange belongs to the medium itself");

    // The admitted residue is the erosion law's only cause.
    const erosion = continuation.trace.find((entry) => entry.eventId === "law:erode-exposed")!;
    assert.deepEqual(erosion.causes, ["medium:seep-exposed"]);
    assert.deepEqual(state(continuation, "exposed").fields.integrity, rational(1));
    assert.ok(continuation.historyCommits.some((commit) => commit.eventId === "commit:law:erode-exposed"));

    // The newborn heir is placed and supported by its region, then forms.
    const heir = state(continuation, "heir");
    assert.equal(heir.lifecycle?.phase, "active");
    assert.deepEqual([heir.fields.positive, heir.fields.structure], [rational(1), rational(1)]);
});

test("the sheltered world's closed boundary keeps the far residue out, so it is unaffected", () => {
    const run = realize();
    const continuation = run.continuations[0]!;
    assert.deepEqual(state(continuation, "sheltered").fields, state(run, "sheltered").fields);
    assert.equal(continuation.realizedEventIds.includes("medium:seep-sheltered"), false);
    assert.equal(
        continuation.trace.some((entry) => entry.worldId === "sheltered" && !["initial-field", "sea-coupling"].includes(entry.kind)),
        false,
    );
    assert.equal(continuation.order.causalEdges.some((edge) => edge.cause.includes("sheltered") || edge.effect.includes("sheltered")), false);
    // The residue was there to draw: the sufficiency held, and only the authored boundary guard refused it.
    const shelteredGuards = run.formalEvidence.filter((evidence) => evidence.subjectId.endsWith("medium:seep-sheltered:sea-predicate-seep-sheltered"));
    assert.ok(shelteredGuards.length > 0);
    assert.ok(shelteredGuards.every((evidence) => evidence.status === "resolved" && evidence.value?.kind === "boolean" && !evidence.value.value));
});

test("the closed medium balances exactly and the eroded world is stressed but still interpretable through its anchor", () => {
    const run = realize();
    const continuation = run.continuations[0]!;
    assert.deepEqual(continuation.seaMedium?.regions, [
        { id: "far", negative: rational(0), positive: rational(1) },
        { id: "near", negative: rational(1), positive: rational(1) },
    ]);
    const program = compile();
    const total = (regions: Array<{ negative: ExactValue; positive: ExactValue }>, states: CausalWorldState[], quantity: "negative" | "positive") => sum([
        ...regions.map((region) => region[quantity]),
        ...program.world.worlds.map((world) => states.find((entry) => entry.worldId === world.id)!
            .fields[quantity === "negative" ? world.seaCoupling.negativeFieldId : world.seaCoupling.positiveFieldId]!),
    ]);
    for (const balance of continuation.seaMedium?.balance ?? []) {
        assert.ok(balance.balanced, balance.quantity);
        assert.deepEqual(balance.production, rational(0), "a closed medium produces nothing");
        assert.ok(exactValuesEqual(balance.initialTotal, balance.finalTotal));
        assert.ok(exactValuesEqual(balance.initialTotal, total(run.initialSeaMedium!, run.initialWorldStates, balance.quantity)));
        assert.ok(exactValuesEqual(balance.finalTotal, total(continuation.seaMedium!.regions, continuation.worldStates, balance.quantity)));
    }
    assert.deepEqual(continuation.seaMedium?.balance.map((balance) => [balance.quantity, balance.finalTotal]), [
        ["negative", rational(2)],
        ["positive", rational(7)],
    ]);

    const exposed = state(continuation, "exposed");
    const before = state(run, "exposed");
    assert.equal(exposed.lifecycle?.phase ?? "active", "active");
    assert.deepEqual(exposed.fields.boundary, before.fields.boundary, "the protected boundary is unchanged");
    assert.deepEqual([before.fields.viability, exposed.fields.viability], [rational(3), rational(2)], "residue lowered viability");
    assert.deepEqual(exposed.seaContribution, rational(1));
    const identity = new Map((continuation.anchorIdentity ?? []).map((verdict) => [verdict.anchorId, verdict]));
    assert.deepEqual(identity.get("exposed-anchor")?.status, "resolved");
    assert.deepEqual(identity.get("exposed-anchor")?.value, { kind: "boolean", value: true });
    assert.deepEqual(identity.get("heir-anchor")?.value, { kind: "boolean", value: true });
    assert.equal(identity.get("elder-anchor")?.status, "not-evaluated", "a retired endpoint is not evaluated");

    const summary = inspectAnchoredCausalRun(run).summary;
    assert.deepEqual(
        [summary.seaRegionCount, summary.seaExchangeCount, summary.seaReleaseCount, summary.seaBalanced],
        [2, 3, 1, true],
    );
    const replay = replayAnchoredCausalRecord(recordAnchoredCausalReplay(program, { worldWillEnabled: false }));
    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.fullRunPreserved, true);
});

test("removing the sheltered world's closed boundary makes the scarce far residue a typed conflict, not a host choice", () => {
    const opened = variant(CLOSED_SHELTER, OPEN_SHELTER);
    const unresolved = realize(opened);
    assert.equal(unresolved.status, "underdetermined");
    assert.deepEqual(unresolved.selectedContinuationIds, []);
    assert.deepEqual(unresolved.unresolvedAlternativeIds, ["medium:seep-exposed", "medium:seep-sheltered"]);
    const partial = unresolved.continuations[0]!;
    assert.equal(partial.realizedEventIds.includes("medium:diffuse-residue"), true, "the chain reaches the far region");
    assert.equal(partial.realizedEventIds.some((id) => id.startsWith("medium:seep-") || id === "law:erode-exposed"), false);
    assert.deepEqual(partial.seaMedium?.regions.find((region) => region.id === "far")?.negative, rational(1));

    const branching = realize(variant("decision deterministic", "decision deterministic conflicts maximal-commuting-branches", opened));
    assert.equal(branching.status, "plural");
    assert.equal(branching.continuations.length, 2);
    const byDraw = new Map(branching.continuations.map((continuation) => [continuation.branchLineage![0]!.realizedLawIds.join(","), continuation]));
    assert.deepEqual([...byDraw.keys()].sort(compareCanonicalStrings), ["seep-exposed", "seep-sheltered"]);
    for (const continuation of branching.continuations) {
        const [step] = continuation.branchLineage!;
        assert.equal(continuation.branchLineage!.length, 1);
        assert.deepEqual(step!.enabledLawIds, ["seep-exposed", "seep-sheltered"]);
        assert.equal(step!.hostSelection, false);
        assert.ok(continuation.seaMedium?.balance.every((balance) => balance.balanced));
    }
    const exposedDraw = byDraw.get("seep-exposed")!;
    const shelteredDraw = byDraw.get("seep-sheltered")!;
    assert.ok(exposedDraw.realizedEventIds.includes("law:erode-exposed"));
    assert.deepEqual(state(shelteredDraw, "sheltered").fields.negative, rational(1));
    assert.deepEqual(state(shelteredDraw, "exposed").fields, state(branching, "exposed").fields);
    assert.equal(shelteredDraw.realizedEventIds.includes("law:erode-exposed"), false);
});

interface OutcomeView {
    continuations: Array<Record<string, any>>;
    autonomousContinuations?: Array<Record<string, any>>;
}

function outcomeOf(program: ExecutableAnchoredCausalProgram, options = {}): OutcomeView {
    return liftFromBir(decodeNode(encodeCausalOutcome(realizeAnchoredCausalWorld(program, options))), causalOutcomeSchema) as OutcomeView;
}

test("the conformance corpus carries the sea-medium cases and exercises the clean-room derivation probes", () => {
    const cases = new Map(causalConformanceCases().map((entry) => [entry.name, entry]));
    const statuses = Object.fromEntries([
        "residue-commons", "sea-scarcity-underdetermined", "sea-scarcity-branches",
        "branch-set-order", "nested-branch-lineage", "chained-lineage",
    ].map((name) => {
        const entry = cases.get(name);
        assert.ok(entry, name);
        assert.deepEqual(validateExecutableCausalProgram(entry.program), [], name);
        return [name, realizeAnchoredCausalWorld(entry.program, entry.options).status];
    }));
    assert.deepEqual(statuses, {
        "residue-commons": "stable",
        "sea-scarcity-underdetermined": "underdetermined",
        "sea-scarcity-branches": "plural",
        "branch-set-order": "plural",
        "nested-branch-lineage": "plural",
        "chained-lineage": "stable",
    });
    const all = (outcome: OutcomeView) => [...outcome.continuations, ...(outcome.autonomousContinuations ?? [])];

    // (a) The stored set order of a co-realized step is not canonical string order.
    const setOrder = cases.get("branch-set-order")!;
    const stored = all(outcomeOf(setOrder.program, setOrder.options)).flatMap((continuation) => continuation.branchLineage ?? [])
        .find((step: { realizedLawIds: string[] }) => step.realizedLawIds.includes("z"))!.realizedLawIds as string[];
    assert.notDeepEqual(stored, [...stored].sort(compareCanonicalStrings));

    // (b) Every continuation's lineage has two sequential steps, so the second step's hashed `parent` list is non-empty.
    const nested = cases.get("nested-branch-lineage")!;
    const nestedRun = realizeAnchoredCausalWorld(nested.program, nested.options);
    assert.ok(nestedRun.continuations.length > 0);
    for (const continuation of nestedRun.continuations) {
        assert.equal(continuation.branchLineage?.length, 2, continuation.id);
        assert.deepEqual(continuation.branchLineage!.map((step) => step.frontierIndex), [0, 1]);
    }

    // (c) The grandchild's spawn names the descendant's assigned lineage, not an initial one.
    const chained = cases.get("chained-lineage")!;
    const chainedRun = realizeAnchoredCausalWorld(chained.program, chained.options).continuations[0]!;
    const spawns = new Map((chainedRun.lifecycleEvents ?? []).filter((event) => event.kind === "world-spawn").map((event) => [event.targetWorldId, event]));
    const descendant = spawns.get("descendant-seed")!;
    const grandchild = spawns.get("grandchild-seed")!;
    assert.deepEqual(grandchild.sourceWorldIds, ["descendant-seed"]);
    assert.ok(descendant.lineageId && grandchild.lineageId && descendant.lineageId !== grandchild.lineageId);
    assert.equal(state(chainedRun, "descendant-seed").lifecycle?.lineageId, descendant.lineageId);
    assert.equal(state(chainedRun, "grandchild-seed").lifecycle?.parentWorldIds?.[0], "descendant-seed");
});
