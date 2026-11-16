import assert from "node:assert/strict";
import test from "node:test";
import {
    exact,
    inspectAnchoredCausalRun,
    realizeAnchoredCausalWorld,
    recordAnchoredCausalReplay,
    replayAnchoredCausalRecord,
    validateExecutableCausalProgram,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";
import selfOrganizingField from "../../examples/self-organizing-field.world.json";

function connectedWorldProgram(): ExecutableAnchoredCausalProgram {
    const program = structuredClone(selfOrganizingField) as ExecutableAnchoredCausalProgram;
    const source = program.world.worlds[0]!;
    const target = structuredClone(source);
    target.id = "receiver-world";
    program.world.worlds.push(target);
    program.fieldInitializers.push(...program.fieldInitializers
        .filter((initializer) => initializer.worldId === source.id)
        .map((initializer) => ({ ...structuredClone(initializer), worldId: target.id })));
    program.seaLaws.push({ ...structuredClone(program.seaLaws[0]!), worldId: target.id });

    source.fields.find((field) => field.id === "condition")!.familyId = "viability-initial";
    program.fieldInitializers.find((initializer) => (
        initializer.worldId === source.id && initializer.fieldId === "condition"
    ))!.query.familyId = "viability-initial";

    const anchor = program.world.anchors[0]!;
    anchor.endpoints = [
        { kind: "world", worldId: source.id, portId: "emission-port" },
        { kind: "world", worldId: target.id, portId: "reception-port" },
    ];
    program.world.anchorTransfers = [{
        id: "condition-current",
        anchorId: anchor.id,
        source: { worldId: source.id, portId: "emission-port", fieldId: "condition" },
        target: { worldId: target.id, portId: "reception-port", fieldId: "condition" },
        sourceNegativeSeaResidue: exact.integer(1),
        targetPositiveSeaPlacement: exact.integer(1),
    }];
    program.world.worldWill.objectives.push({
        id: "preserve-receiver-viability",
        targetWorldId: target.id,
        fieldId: "viability",
        direction: "maximize",
        weight: exact.integer(1),
    });
    program.world.worldWill.interventions = [];
    program.execution.interventionCosts = [];
    program.world.internalLaws = [{
        id: "emit-condition-current",
        worldId: source.id,
        guard: {
            id: "emit-when-source-condition-is-one",
            query: { familyId: "coherence-is-one", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [{ parameterName: "coherence", worldId: source.id, fieldId: "condition" }],
        },
        effects: [],
        anchorTransferIds: ["condition-current"],
        application: "once-per-realization",
        reversibility: "irreversible",
    }, {
        id: "receive-condition-current",
        worldId: target.id,
        guard: {
            id: "respond-when-received-condition-is-one",
            query: { familyId: "coherence-is-one", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [{ parameterName: "coherence", worldId: target.id, fieldId: "condition" }],
        },
        effects: [{ fieldId: "coherence", operation: "add", value: exact.integer(1) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    }];
    program.world.emergenceCriteria = [];
    return program;
}

function siblingTransferProgram(): ExecutableAnchoredCausalProgram {
    const program = connectedWorldProgram();
    const firstReceiver = program.world.worlds.find((world) => world.id === "receiver-world")!;
    const secondReceiver = structuredClone(firstReceiver);
    secondReceiver.id = "receiver-world-b";
    program.world.worlds.push(secondReceiver);
    program.fieldInitializers.push(...program.fieldInitializers
        .filter((initializer) => initializer.worldId === firstReceiver.id)
        .map((initializer) => ({ ...structuredClone(initializer), worldId: secondReceiver.id })));
    program.seaLaws.push({ ...structuredClone(program.seaLaws.find((law) => law.worldId === firstReceiver.id)!), worldId: secondReceiver.id });
    program.world.worldWill.objectives.push({
        id: "preserve-receiver-b-viability",
        targetWorldId: secondReceiver.id,
        fieldId: "viability",
        direction: "maximize",
        weight: exact.integer(1),
    });

    const secondAnchor = structuredClone(program.world.anchors[0]!);
    secondAnchor.id = "field-anchor-b";
    secondAnchor.endpoints = [
        { kind: "world", worldId: "field-world", portId: "emission-port-b" },
        { kind: "world", worldId: secondReceiver.id, portId: "reception-port-b" },
    ];
    program.world.anchors.push(secondAnchor);
    const secondIdentity = structuredClone(program.execution.anchorIdentity[0]!);
    secondIdentity.id = "field-anchor-b-remains-itself";
    secondIdentity.anchorId = secondAnchor.id;
    program.execution.anchorIdentity.push(secondIdentity);
    program.world.anchorTransfers!.push({
        id: "condition-current-b",
        anchorId: secondAnchor.id,
        source: { worldId: "field-world", portId: "emission-port-b", fieldId: "condition" },
        target: { worldId: secondReceiver.id, portId: "reception-port-b", fieldId: "condition" },
        sourceNegativeSeaResidue: exact.integer(1),
        targetPositiveSeaPlacement: exact.integer(1),
    });
    program.world.internalLaws.push({
        id: "emit-condition-current-b",
        worldId: "field-world",
        guard: {
            id: "emit-b-when-source-condition-is-one",
            query: { familyId: "coherence-is-one", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [{ parameterName: "coherence", worldId: "field-world", fieldId: "condition" }],
        },
        effects: [],
        anchorTransferIds: ["condition-current-b"],
        application: "once-per-realization",
        reversibility: "irreversible",
    }, {
        id: "receive-condition-current-b",
        worldId: secondReceiver.id,
        guard: {
            id: "respond-b-when-received-condition-is-one",
            query: { familyId: "coherence-is-one", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [{ parameterName: "coherence", worldId: secondReceiver.id, fieldId: "condition" }],
        },
        effects: [{ fieldId: "coherence", operation: "add", value: exact.integer(1) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    return program;
}

test("an internal law crosses one typed anchor membrane and the receiving world responds by its own law", () => {
    const program = connectedWorldProgram();
    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const continuation = run.autonomousContinuation!;
    const transfer = continuation.anchorTransferEvents?.[0]!;
    const source = continuation.worldStates.find((state) => state.worldId === "field-world")!;
    const target = continuation.worldStates.find((state) => state.worldId === "receiver-world")!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(transfer.anchorId, "field-anchor");
    assert.equal(transfer.hostSelection, false);
    assert.deepEqual(transfer.source.value, exact.integer(1));
    assert.deepEqual(transfer.target.before, exact.integer(0));
    assert.deepEqual(transfer.target.after, exact.integer(1));
    assert.deepEqual(source.fields.negative, exact.integer(2));
    assert.deepEqual(target.fields.positive, exact.integer(3));
    assert.deepEqual(target.fields.condition, exact.integer(1));
    assert.deepEqual(target.fields.coherence, exact.integer(1));
    assert.deepEqual(transfer.sourceNegativeSea.residue, exact.integer(1));
    assert.deepEqual(transfer.targetPositiveSea.placement, exact.integer(1));
    assert.equal(continuation.anchorTransferAssessments?.[0]?.status, "admitted");
    assert.ok(continuation.order.causalEdges.some((edge) => (
        edge.cause === "law:emit-condition-current" && edge.effect === transfer.id
    )));
    assert.ok(continuation.order.causalEdges.some((edge) => (
        edge.cause === transfer.id && edge.effect === "law:receive-condition-current"
    )));
    assert.ok(continuation.trace.findIndex((entry) => entry.kind === "anchor-transfer")
        < continuation.trace.findIndex((entry) => entry.lawId === "receive-condition-current"));

    const inspection = inspectAnchoredCausalRun(run);
    assert.equal(inspection.summary.admittedAnchorTransferCount, 1);
    assert.equal(inspection.summary.blockedAnchorTransferCount, 0);

    const replay = replayAnchoredCausalRecord(recordAnchoredCausalReplay(program, { worldWillEnabled: false }));
    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.anchorTransfersPreserved, true);
});

test("independent sibling crossings form one atomic frontier and both receiving worlds respond", () => {
    const program = siblingTransferProgram();
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const continuation = run.autonomousContinuation!;
    const transfers = continuation.anchorTransferEvents!;
    const source = continuation.worldStates.find((state) => state.worldId === "field-world")!;
    const firstTarget = continuation.worldStates.find((state) => state.worldId === "receiver-world")!;
    const secondTarget = continuation.worldStates.find((state) => state.worldId === "receiver-world-b")!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(transfers.length, 2);
    assert.equal(new Set(transfers.map((transfer) => transfer.frontierId)).size, 1);
    assert.ok(transfers.every((transfer) => transfer.composition === "simultaneous-exact-transfer-frontier"));
    assert.ok(continuation.order.evaluationFrontiers.some((frontier) => (
        frontier.length === 2 && transfers.every((transfer) => frontier.includes(transfer.id))
    )));
    assert.ok(transfers.every((transfer) => JSON.stringify(transfer.sourceNegativeSea.before) === JSON.stringify(exact.integer(1))));
    assert.ok(transfers.every((transfer) => JSON.stringify(transfer.sourceNegativeSea.after) === JSON.stringify(exact.integer(2))));
    assert.ok(transfers.every((transfer) => JSON.stringify(transfer.sourceNegativeSea.frontierAfter) === JSON.stringify(exact.integer(3))));
    assert.deepEqual(source.fields.negative, exact.integer(3));
    assert.deepEqual(firstTarget.fields.condition, exact.integer(1));
    assert.deepEqual(secondTarget.fields.condition, exact.integer(1));
    assert.deepEqual(firstTarget.fields.coherence, exact.integer(1));
    assert.deepEqual(secondTarget.fields.coherence, exact.integer(1));
    assert.ok(!continuation.order.causalEdges.some((edge) => (
        transfers.some((transfer) => transfer.id === edge.cause)
        && transfers.some((transfer) => transfer.id === edge.effect)
    )));
    const replay = replayAnchoredCausalRecord(recordAnchoredCausalReplay(program, { worldWillEnabled: false }));
    assert.equal(replay.status, "same-world-reexecution");
    assert.equal(replay.anchorTransfersPreserved, true);
    assert.equal(new Set(replay.replayedRun.autonomousContinuation!.anchorTransferEvents?.map((event) => event.frontierId)).size, 1);
});

test("a transfer target cannot become another transfer source inside the same frontier", () => {
    const program = siblingTransferProgram();
    const chained = program.world.anchorTransfers!.find((transfer) => transfer.id === "condition-current-b")!;
    chained.source.worldId = "receiver-world";
    chained.source.fieldId = "condition";
    program.world.internalLaws.find((law) => law.id === "emit-condition-current-b")!.worldId = "receiver-world";
    assert.ok(validateExecutableCausalProgram(program).some((diagnostic) => diagnostic.code === "CKW104"));
});

test("a cut anchor blocks the crossing without fabricating target state or a host-selected event", () => {
    const run = realizeAnchoredCausalWorld(connectedWorldProgram(), {
        worldWillEnabled: false,
        cutAnchorIds: ["field-anchor"],
    });
    const continuation = run.autonomousContinuation!;
    const target = continuation.worldStates.find((state) => state.worldId === "receiver-world")!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(continuation.anchorTransferEvents, undefined);
    assert.equal(continuation.anchorTransferAssessments?.[0]?.status, "blocked");
    assert.ok(continuation.anchorTransferAssessments?.[0]?.reasons.some((reason) => reason.includes("is cut")));
    assert.deepEqual(target.fields.condition, exact.integer(0));
    assert.deepEqual(target.fields.coherence, exact.integer(0));
    assert.equal(inspectAnchoredCausalRun(run).summary.blockedAnchorTransferCount, 1);
});

test("an inactive endpoint keeps the membrane dormant until that world can lawfully exist", () => {
    const program = connectedWorldProgram();
    program.world.worlds.find((world) => world.id === "receiver-world")!.initialExistence = "latent";
    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const continuation = run.autonomousContinuation!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(continuation.anchorTransferEvents, undefined);
    assert.equal(continuation.anchorTransferAssessments?.[0]?.status, "blocked");
    assert.ok(continuation.anchorTransferAssessments?.[0]?.reasons.some((reason) => reason.includes("is latent")));
    assert.equal(continuation.worldStates.find((state) => state.worldId === "receiver-world")?.lifecycle?.phase, "latent");
});

test("a latent endpoint can receive only after an internal birth event activates its anchor port", () => {
    const program = connectedWorldProgram();
    program.world.worlds.find((world) => world.id === "receiver-world")!.initialExistence = "latent";
    program.world.internalLaws.push({
        id: "birth-receiver-world",
        worldId: "field-world",
        guard: {
            id: "birth-receiver-when-source-exists",
            query: { familyId: "always-true", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [],
        },
        effects: [],
        lifecycleEffects: [{ kind: "spawn-world", targetWorldId: "receiver-world" }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const continuation = run.autonomousContinuation!;
    const birth = continuation.lifecycleEvents?.find((event) => event.kind === "world-spawn")!;
    const transfer = continuation.anchorTransferEvents?.[0]!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(continuation.worldStates.find((state) => state.worldId === "receiver-world")?.lifecycle?.phase, "active");
    assert.equal(continuation.anchorTransferAssessments?.[0]?.status, "admitted");
    assert.ok(transfer);
    assert.ok(continuation.order.causalEdges.some((edge) => edge.cause === birth.id && edge.effect === transfer.id));
    assert.ok(continuation.trace.findIndex((entry) => entry.kind === "world-spawn")
        < continuation.trace.findIndex((entry) => entry.kind === "anchor-transfer"));
});

test("post-transfer anchor identity failure rejects the crossing before either sea or world is mutated", () => {
    const program = connectedWorldProgram();
    program.world.anchors[0]!.identityPredicateFamilyIds = ["coherence-is-zero"];
    program.execution.anchorIdentity = [{
        id: "receiver-port-must-remain-zero",
        anchorId: "field-anchor",
        query: { familyId: "coherence-is-zero", at: { coordinate: "0" }, parameters: {} },
        fieldParameters: [{ parameterName: "coherence", worldId: "receiver-world", fieldId: "condition" }],
    }];
    const run = realizeAnchoredCausalWorld(program, { worldWillEnabled: false });
    const continuation = run.autonomousContinuation!;
    const source = continuation.worldStates.find((state) => state.worldId === "field-world")!;
    const target = continuation.worldStates.find((state) => state.worldId === "receiver-world")!;

    assert.equal(run.status, "stable", run.reason);
    assert.equal(continuation.anchorTransferEvents, undefined);
    assert.equal(continuation.anchorTransferAssessments?.[0]?.status, "blocked");
    assert.ok(continuation.anchorTransferAssessments?.[0]?.reasons.some((reason) => reason.includes("post-transfer")));
    assert.deepEqual(source.fields.negative, exact.integer(1));
    assert.deepEqual(target.fields.positive, exact.integer(2));
    assert.deepEqual(target.fields.condition, exact.integer(0));
});

test("the membrane validator rejects endpoint, protected-target, and mixed-effect shortcuts", () => {
    const invalidEndpoint = connectedWorldProgram();
    invalidEndpoint.world.anchorTransfers![0]!.target.portId = "unanchored-port";
    assert.ok(validateExecutableCausalProgram(invalidEndpoint).some((diagnostic) => diagnostic.code === "CKW089"));

    const protectedTarget = connectedWorldProgram();
    protectedTarget.world.anchorTransfers![0]!.target.fieldId = "coherence";
    assert.ok(validateExecutableCausalProgram(protectedTarget).some((diagnostic) => diagnostic.code === "CKW092"));

    const mixedEffect = connectedWorldProgram();
    mixedEffect.world.internalLaws.find((law) => law.id === "emit-condition-current")!.effects = [
        { fieldId: "density", operation: "add", value: exact.integer(1) },
    ];
    assert.ok(validateExecutableCausalProgram(mixedEffect).some((diagnostic) => diagnostic.code === "CKW098"));

    const competingSnapshotWriter = connectedWorldProgram();
    competingSnapshotWriter.world.internalLaws.push({
        id: "rewrite-snapshot-beside-transfer",
        worldId: "field-world",
        guard: {
            id: "rewrite-when-present",
            query: { familyId: "always-true", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [],
        },
        effects: [{ fieldId: "condition", operation: "add", value: exact.integer(1) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    });
    assert.ok(validateExecutableCausalProgram(competingSnapshotWriter).some((diagnostic) => diagnostic.code === "CKW102"));
});
