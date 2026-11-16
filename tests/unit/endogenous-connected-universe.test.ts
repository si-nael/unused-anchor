import assert from "node:assert/strict";
import test from "node:test";
import {
    compileEndogenousUniverse,
    exact,
    inspectEndogenousConnectedUniverseRun,
    materializeEndogenousUniverse,
    realizeEndogenousConnectedUniverse,
    recordEndogenousConnectedUniverse,
    replayEndogenousConnectedUniverse,
    term,
    validateAnchoredCausalWorld,
    validateEndogenousUniverseProgram,
    type EndogenousUniverseProgram,
} from "../../src/bubbles/world-kernel";

function connectedUniverseProgram(): EndogenousUniverseProgram {
    const zero = {
        familyId: "zero",
        at: { unit: { kind: "literal", value: "0" } },
        parameters: {},
    } as const;
    const one = {
        familyId: "one",
        at: { unit: { kind: "literal", value: "0" } },
        parameters: {},
    } as const;
    return {
        mode: "bubble-endogenous-connected-universe-program.v1",
        formal: {
            mode: "bubble-intensional-system.v1",
            families: [
                {
                    id: "zero",
                    domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
                    valueKind: "rational",
                    parameters: [],
                    body: term.value(exact.integer(0)),
                },
                {
                    id: "one",
                    domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
                    valueKind: "rational",
                    parameters: [],
                    body: term.value(exact.integer(1)),
                },
                {
                    id: "root-open",
                    domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
                    valueKind: "rational",
                    parameters: [{ name: "depth", valueKind: "rational" }],
                    body: term.if(
                        term.binary("equal", term.parameter("depth"), term.value(exact.integer(0))),
                        term.value(exact.integer(1)),
                        term.value(exact.integer(0)),
                    ),
                },
                {
                    id: "lineage-value",
                    domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
                    valueKind: "rational",
                    parameters: [
                        { name: "depth", valueKind: "rational" },
                        { name: "coordinate", valueKind: "rational" },
                    ],
                    body: term.binary("add", term.parameter("depth"), term.parameter("coordinate")),
                },
                {
                    id: "admit-all",
                    domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
                    valueKind: "boolean",
                    parameters: [],
                    body: term.value(exact.boolean(true)),
                },
                {
                    id: "is-one",
                    domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
                    valueKind: "boolean",
                    parameters: [{ name: "value", valueKind: "rational" }],
                    body: term.binary("equal", term.parameter("value"), term.value(exact.integer(1))),
                },
                {
                    id: "identity-pair",
                    domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
                    valueKind: "boolean",
                    parameters: [
                        { name: "parent", valueKind: "rational" },
                        { name: "child", valueKind: "rational" },
                    ],
                    body: term.binary(
                        "and",
                        term.binary("equal", term.parameter("parent"), term.value(exact.integer(1))),
                        term.binary("equal", term.parameter("child"), term.value(exact.integer(1))),
                    ),
                },
            ],
        },
        schemas: [{
            id: "field-world",
            fields: [
                { id: "structure", familyId: "zero", role: "structural-state", initializer: zero },
                { id: "identity", familyId: "one", role: "identity-state", initializer: one },
                {
                    id: "memory",
                    familyId: "lineage-value",
                    role: "memory-state",
                    initializer: {
                        familyId: "lineage-value",
                        at: { unit: { kind: "literal", value: "0" } },
                        parameters: {
                            depth: { kind: "lineage-depth" },
                            coordinate: { kind: "local-coordinate" },
                        },
                    },
                },
                { id: "boundary", familyId: "one", role: "boundary-state", initializer: one },
                { id: "signal", familyId: "one", role: "world-condition", initializer: one },
                {
                    id: "condition",
                    familyId: "root-open",
                    role: "world-condition",
                    initializer: {
                        familyId: "root-open",
                        at: { unit: { kind: "literal", value: "0" } },
                        parameters: { depth: { kind: "lineage-depth" } },
                    },
                },
                { id: "lineage-support", familyId: "zero", role: "positive-sea", initializer: zero },
                { id: "lineage-residue", familyId: "zero", role: "negative-sea", initializer: zero },
                { id: "boundary-support", familyId: "zero", role: "positive-sea", initializer: zero },
                { id: "boundary-pressure", familyId: "zero", role: "negative-sea", initializer: zero },
            ],
            protectedFieldIds: ["structure", "identity", "memory", "boundary"],
            ports: ["identity-port", "lineage-port"],
            seaChannels: [
                { id: "lineage", positiveFieldId: "lineage-support", negativeFieldId: "lineage-residue" },
                { id: "boundary", positiveFieldId: "boundary-support", negativeFieldId: "boundary-pressure" },
            ],
            selfIdentity: {
                id: "identity-holds",
                query: { familyId: "is-one", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
                fieldParameters: [{ parameterName: "value", fieldId: "identity" }],
            },
            internalLaws: [{
                id: "condense",
                guard: {
                    id: "condition-open",
                    query: { familyId: "is-one", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
                    fieldParameters: [{ parameterName: "value", fieldId: "condition" }],
                },
                effects: [
                    { fieldId: "structure", operation: "add", value: exact.integer(1) },
                    { fieldId: "condition", operation: "set", value: exact.integer(0) },
                ],
                application: "once-per-realization",
                reversibility: "irreversible",
                commitAffectedFieldIds: ["structure"],
            }],
            emergenceCriteria: [{
                id: "structure-present",
                predicate: {
                    id: "structure-is-one",
                    query: { familyId: "is-one", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
                    fieldParameters: [{ parameterName: "value", fieldId: "structure" }],
                },
                witnessFieldIds: ["structure", "boundary", "identity"],
            }],
            causalProjection: {
                channels: [
                    { channelId: "lineage", positiveWeight: exact.integer(1), negativeWeight: exact.integer(1) },
                    { channelId: "boundary", positiveWeight: exact.rational(1, 2), negativeWeight: exact.rational(1, 2) },
                ],
                intrinsicViability: exact.integer(0),
                objective: {
                    id: "maintain-structure",
                    fieldId: "structure",
                    direction: "maximize",
                    weight: exact.integer(1),
                },
            },
        }],
        roots: [{ id: "origin", schemaId: "field-world", values: {} }],
        constructors: [{
            id: "binary-continuation",
            parentSchemaId: "field-world",
            childSchemaId: "field-world",
            coordinates: { kind: "finite", size: "2" },
            admission: {
                id: "continuation-admitted",
                query: { familyId: "admit-all", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
                fieldParameters: [],
            },
            parentPortId: "lineage-port",
            childPortId: "lineage-port",
            relationIdentity: {
                id: "lineage-identity",
                query: { familyId: "identity-pair", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
                fieldParameters: [
                    { parameterName: "parent", endpoint: "parent", fieldId: "identity" },
                    { parameterName: "child", endpoint: "child", fieldId: "identity" },
                ],
            },
            transports: [{ sourceFieldId: "signal", targetFieldId: "condition" }],
            seaActions: [
                {
                    parentChannelId: "lineage",
                    childChannelId: "lineage",
                    parentNegativeResidue: exact.rational(1, 4),
                    childPositivePlacement: exact.integer(1),
                },
                {
                    parentChannelId: "boundary",
                    childChannelId: "boundary",
                    parentNegativeResidue: exact.rational(1, 8),
                    childPositivePlacement: exact.rational(1, 2),
                },
            ],
        }],
        order: { kind: "causal-partial-order", universalClock: false },
    };
}

function stateReactivatedUniverseProgram(): EndogenousUniverseProgram {
    const program = connectedUniverseProgram();
    program.formal.families.push({
        id: "root-structure-ready",
        domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
        valueKind: "boolean",
        parameters: [
            { name: "origin", valueKind: "rational" },
            { name: "value", valueKind: "rational" },
        ],
        body: term.binary(
            "and",
            term.binary("equal", term.parameter("origin"), term.value(exact.integer(0))),
            term.binary("equal", term.parameter("value"), term.value(exact.integer(1))),
        ),
    });
    const delayed = structuredClone(program.constructors[0]!);
    delayed.id = "after-condensation";
    delayed.coordinates = { kind: "finite", size: "1" };
    delayed.admission = {
        id: "root-condensation-admits-child",
        query: {
            familyId: "root-structure-ready",
            at: { unit: { kind: "literal", value: "0" } },
            parameters: {},
        },
        fieldParameters: [
            { parameterName: "origin", fieldId: "memory" },
            { parameterName: "value", fieldId: "structure" },
        ],
    };
    program.constructors = [delayed];
    return program;
}

function recurrentGeneratedUniverseProgram(): EndogenousUniverseProgram {
    const program = connectedUniverseProgram();
    program.formal.families.push({
        id: "is-zero",
        domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
        valueKind: "boolean",
        parameters: [{ name: "value", valueKind: "rational" }],
        body: term.binary("equal", term.parameter("value"), term.value(exact.integer(0))),
    });
    program.schemas[0]!.internalLaws = [{
        id: "a-lower-condition",
        guard: {
            id: "condition-is-one",
            query: { familyId: "is-one", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
            fieldParameters: [{ parameterName: "value", fieldId: "condition" }],
        },
        effects: [{ fieldId: "condition", operation: "set", value: exact.integer(0) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    }, {
        id: "b-restore-condition",
        guard: {
            id: "condition-is-zero",
            query: { familyId: "is-zero", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
            fieldParameters: [{ parameterName: "value", fieldId: "condition" }],
        },
        effects: [{ fieldId: "condition", operation: "set", value: exact.integer(1) }],
        application: "once-per-realization",
        reversibility: "irreversible",
    }];
    return program;
}

function lawTransformingUniverseProgram(): EndogenousUniverseProgram {
    const program = connectedUniverseProgram();
    program.constructors[0]!.schemaTransformation = {
        id: "lineage-condensation-morphism",
        effectValues: [{
            lawId: "condense",
            effectIndex: 0,
            value: {
                familyId: "lineage-value",
                at: { unit: { kind: "literal", value: "0" } },
                parameters: {
                    depth: { kind: "lineage-depth" },
                    coordinate: { kind: "local-coordinate" },
                },
            },
        }],
    };
    return program;
}

function lawSetTransformingUniverseProgram(): EndogenousUniverseProgram {
    const program = connectedUniverseProgram();
    const condense = program.schemas[0]!.internalLaws[0]!;
    program.constructors[0]!.schemaTransformation = {
        id: "lineage-law-set-morphism",
        removeLawIds: ["condense"],
        upsertLaws: [{
            ...structuredClone(condense),
            id: "lineage-condense",
        }],
        effectValues: [{
            lawId: "lineage-condense",
            effectIndex: 0,
            value: {
                familyId: "lineage-value",
                at: { unit: { kind: "literal", value: "0" } },
                parameters: {
                    depth: { kind: "lineage-depth" },
                    coordinate: { kind: "local-coordinate" },
                },
            },
        }],
    };
    return program;
}

function schemaGraphTransformingUniverseProgram(): EndogenousUniverseProgram {
    const program = connectedUniverseProgram();
    const source = program.schemas[0]!;
    const lineageInitializer = {
        familyId: "lineage-value",
        at: { unit: { kind: "literal" as const, value: "0" } },
        parameters: {
            depth: { kind: "lineage-depth" as const },
            coordinate: { kind: "local-coordinate" as const },
        },
    };
    const lineageLaw = structuredClone(source.internalLaws[0]!);
    lineageLaw.id = "lineage-condense";
    program.constructors[0]!.childPortId = "revision-port";
    program.constructors[0]!.schemaTransformation = {
        id: "whole-world-schema-morphism",
        replaceGraph: {
            fields: [
                ...structuredClone(source.fields),
                { id: "lineage-structure", familyId: "lineage-value", role: "structural-state", initializer: lineageInitializer },
                { id: "revision-support", familyId: "zero", role: "positive-sea", initializer: {
                    familyId: "zero",
                    at: { unit: { kind: "literal", value: "0" } },
                    parameters: {},
                } },
                { id: "revision-residue", familyId: "zero", role: "negative-sea", initializer: {
                    familyId: "zero",
                    at: { unit: { kind: "literal", value: "0" } },
                    parameters: {},
                } },
            ],
            protectedFieldIds: [...source.protectedFieldIds, "lineage-structure"],
            ports: [...source.ports, "revision-port"],
            seaChannels: [
                ...structuredClone(source.seaChannels),
                { id: "revision", positiveFieldId: "revision-support", negativeFieldId: "revision-residue" },
            ],
            selfIdentity: {
                ...structuredClone(source.selfIdentity),
                id: "revision-identity-holds",
            },
            internalLaws: [lineageLaw],
            emergenceCriteria: [{
                id: "lineage-structure-present",
                predicate: {
                    id: "structure-is-one-in-revision",
                    query: { familyId: "is-one", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
                    fieldParameters: [{ parameterName: "value", fieldId: "structure" }],
                },
                witnessFieldIds: ["structure", "lineage-structure", "identity"],
            }],
            causalProjection: {
                channels: [
                    ...structuredClone(source.causalProjection!.channels),
                    { channelId: "revision", positiveWeight: exact.integer(1), negativeWeight: exact.integer(1) },
                ],
                intrinsicViability: exact.integer(1),
                objective: {
                    id: "maintain-lineage-structure",
                    fieldId: "lineage-structure",
                    direction: "maximize",
                    weight: exact.integer(1),
                },
            },
        },
    };
    return program;
}

test("a recursive Bubble constructor intensionally generates a connected world slice", () => {
    const program = connectedUniverseProgram();
    assert.deepEqual(validateEndogenousUniverseProgram(program), []);

    const materialized = materializeEndogenousUniverse(program, { maxDepth: 2, maxWorlds: 32 });
    assert.equal(materialized.status, "resolved");
    assert.equal(materialized.worlds.length, 7);
    assert.equal(materialized.generationEvents.length, 6);
    assert.equal(materialized.schemaTransformationEvents.length, 0);
    assert.equal(materialized.generationEvents.flatMap((event) => event.transportIds).length, 6);
    assert.equal(materialized.anchors.length, 13);
    assert.equal(materialized.frontiers.length, 4);
    assert.equal(materialized.coverage.demandedSliceComplete, true);
    assert.equal(materialized.coverage.exhaustiveUniverse, false);
    assert.equal(materialized.coverage.latentContinuationPreserved, true);
    assert.ok(materialized.generationEvents.every((event) => event.hostSelection === false));
    assert.equal(new Set(materialized.worlds.map((world) => world.schemaRevision.id)).size, 1);

    const root = materialized.worlds.find((world) => !world.parentWorldId)!;
    assert.deepEqual(root.fields["lineage-residue"], exact.rational(1, 2));
    assert.deepEqual(root.fields["boundary-pressure"], exact.rational(1, 4));
    const depthTwo = materialized.worlds.find((world) => world.address.lineage.length === 2)!;
    assert.deepEqual(depthTwo.fields.memory, exact.integer(Number(depthTwo.address.lineage.at(-1)!.coordinate) + 2));
    assert.deepEqual(depthTwo.fields["lineage-support"], exact.integer(1));
    assert.deepEqual(depthTwo.fields["boundary-support"], exact.rational(1, 2));
    assert.deepEqual(depthTwo.fields.condition, exact.integer(1));
    const relationTransports = materialized.anchors.flatMap((anchor) => anchor.transports);
    assert.equal(relationTransports.length, 6);
    assert.ok(relationTransports.every((transport) => transport.hostSelection === false));
});

test("generated worlds inherit and intensionally transform typed law revisions through their lineage", () => {
    const program = lawTransformingUniverseProgram();
    assert.deepEqual(validateEndogenousUniverseProgram(program), []);
    const materialized = materializeEndogenousUniverse(program, { maxDepth: 2, maxWorlds: 32 });

    assert.equal(materialized.status, "resolved");
    assert.equal(materialized.worlds.length, 7);
    assert.equal(materialized.schemaTransformationEvents.length, 6);
    assert.equal(materialized.resourceUse.schemaTransformationEventCount, 6);
    const worlds = new Map(materialized.worlds.map((world) => [world.id, world]));
    for (const world of materialized.worlds) {
        const effect = world.schemaRevision.internalLaws
            .find((law) => law.id === "condense")!
            .effects[0]!;
        if (!world.parentWorldId) {
            assert.equal(world.schemaRevision.sourceRevisionId, undefined);
            assert.deepEqual(effect.value, exact.integer(1));
            continue;
        }
        const expected = world.address.lineage.length + Number(world.address.lineage.at(-1)!.coordinate);
        const parent = worlds.get(world.parentWorldId)!;
        assert.equal(world.schemaRevision.sourceRevisionId, parent.schemaRevision.id);
        assert.deepEqual(effect.value, exact.integer(expected));
        assert.equal(world.schemaRevision.transformedBy?.hostSelection, false);
        assert.equal(world.schemaRevision.transformedBy?.evaluations[0]?.proofDigest.length, 64);
    }
    for (const event of materialized.schemaTransformationEvents) {
        const child = worlds.get(event.childWorldId)!;
        const parent = worlds.get(event.parentWorldId)!;
        const generation = materialized.generationEvents.find((candidate) => candidate.childWorldId === child.id)!;
        const relation = materialized.anchors.find((anchor) => (
            anchor.kind === "generated-relation"
            && anchor.endpoints.some((endpoint) => endpoint.worldId === parent.id)
            && anchor.endpoints.some((endpoint) => endpoint.worldId === child.id)
        ))!;
        assert.equal(event.sourceRevisionId, parent.schemaRevision.id);
        assert.equal(event.targetRevisionId, child.schemaRevision.id);
        assert.equal(generation.schemaTransformationEventId, event.id);
        assert.equal(relation.schemaTransformationEventId, event.id);
        assert.equal(event.hostSelection, false);
    }

    const compiled = compileEndogenousUniverse(program, materialized)!;
    for (const world of materialized.worlds) {
        const compiledLaw = compiled.program.world.internalLaws.find((law) => law.id === `${world.id}-condense`)!;
        const revisionLaw = world.schemaRevision.internalLaws.find((law) => law.id === "condense")!;
        assert.deepEqual(compiledLaw.effects[0]!.value, revisionLaw.effects[0]!.value);
    }

    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 32 },
    });
    assert.equal(run.status, "resolved");
    assert.equal(run.worldContinuations.length, 7);
    assert.ok(run.worldContinuations.every((entry) => (
        entry.schemaRevisionId === worlds.get(entry.worldId)?.schemaRevision.id
    )));
    assert.ok(run.generationCausalEdges.some((edge) => edge.kind === "constructor-transforms-schema"));
    assert.ok(run.generationCausalEdges.some((edge) => edge.kind === "schema-revision-causes-schema-revision"));
    assert.ok(run.generationCausalEdges.some((edge) => edge.kind === "schema-revision-enters-world"));
    assert.equal(inspectEndogenousConnectedUniverseRun(run).summary.schemaTransformationEventCount, 6);
});

test("one recursive law-set morphism removes, adds, replaces, and specializes child law structure", () => {
    const program = lawSetTransformingUniverseProgram();
    assert.deepEqual(validateEndogenousUniverseProgram(program), []);
    const materialized = materializeEndogenousUniverse(program, { maxDepth: 2, maxWorlds: 32 });
    assert.equal(materialized.status, "resolved");

    const root = materialized.worlds.find((world) => !world.parentWorldId)!;
    assert.deepEqual(root.schemaRevision.internalLaws.map((law) => law.id), ["condense"]);
    for (const world of materialized.worlds.filter((candidate) => !!candidate.parentWorldId)) {
        assert.deepEqual(world.schemaRevision.internalLaws.map((law) => law.id), ["lineage-condense"]);
        const expected = world.address.lineage.length + Number(world.address.lineage.at(-1)!.coordinate);
        assert.deepEqual(world.schemaRevision.internalLaws[0]!.effects[0]!.value, exact.integer(expected));
    }

    const depthOneEvents = materialized.schemaTransformationEvents.filter((event) => (
        materialized.worlds.find((world) => world.id === event.childWorldId)!.address.lineage.length === 1
    ));
    const depthTwoEvents = materialized.schemaTransformationEvents.filter((event) => (
        materialized.worlds.find((world) => world.id === event.childWorldId)!.address.lineage.length === 2
    ));
    assert.equal(depthOneEvents.length, 2);
    assert.ok(depthOneEvents.every((event) => (
        event.lawSetChange.removedLawIds.join() === "condense"
        && event.lawSetChange.addedLawIds.join() === "lineage-condense"
        && event.lawSetChange.replacedLawIds.length === 0
    )));
    assert.equal(depthTwoEvents.length, 4);
    assert.ok(depthTwoEvents.every((event) => (
        event.lawSetChange.removedLawIds.length === 0
        && event.lawSetChange.addedLawIds.length === 0
        && event.lawSetChange.replacedLawIds.join() === "lineage-condense"
    )));

    const compiled = compileEndogenousUniverse(program, materialized)!;
    assert.ok(compiled.program.world.internalLaws.some((law) => law.id === `${root.id}-condense`));
    assert.equal(compiled.program.world.internalLaws.filter((law) => law.id.endsWith("-lineage-condense")).length, 6);
    assert.equal(compiled.program.world.internalLaws.some((law) => (
        law.worldId !== root.id && law.id.endsWith("-condense") && !law.id.endsWith("-lineage-condense")
    )), false);

    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 32 },
    });
    assert.equal(run.status, "resolved");
    assert.deepEqual(run.worldContinuations.find((entry) => entry.worldId === root.id)!.localLawIds, [`${root.id}-condense`]);
    assert.ok(run.worldContinuations.filter((entry) => entry.worldId !== root.id).every((entry) => (
        entry.localLawIds.join() === `${entry.worldId}-lineage-condense`
        && entry.realizedLawIds.join() === `${entry.worldId}-lineage-condense`
    )));
});

test("one recursively closed graph morphism realizes the generated world's whole executable schema", () => {
    const program = schemaGraphTransformingUniverseProgram();
    assert.deepEqual(validateEndogenousUniverseProgram(program), []);
    const materialized = materializeEndogenousUniverse(program, { maxDepth: 2, maxWorlds: 32 });
    assert.equal(materialized.status, "resolved");

    const root = materialized.worlds.find((world) => !world.parentWorldId)!;
    const generated = materialized.worlds.filter((world) => !!world.parentWorldId);
    assert.equal(root.schemaRevision.fields.some((field) => field.id === "lineage-structure"), false);
    assert.ok(generated.every((world) => (
        world.schemaRevision.fields.some((field) => field.id === "lineage-structure")
        && world.schemaRevision.protectedFieldIds.includes("lineage-structure")
        && world.schemaRevision.ports.includes("revision-port")
        && world.schemaRevision.seaChannels.some((channel) => channel.id === "revision")
        && world.schemaRevision.selfIdentity.id === "revision-identity-holds"
        && world.schemaRevision.internalLaws.map((law) => law.id).join() === "lineage-condense"
        && world.schemaRevision.emergenceCriteria.map((criterion) => criterion.id).join() === "lineage-structure-present"
        && world.schemaRevision.causalProjection?.objective.fieldId === "lineage-structure"
    )));
    for (const world of generated) {
        const expected = world.address.lineage.length + Number(world.address.lineage.at(-1)!.coordinate);
        assert.deepEqual(world.fields["lineage-structure"], exact.integer(expected));
    }

    const firstGenerationEvents = materialized.schemaTransformationEvents.filter((event) => (
        materialized.worlds.find((world) => world.id === event.childWorldId)!.address.lineage.length === 1
    ));
    assert.ok(firstGenerationEvents.every((event) => (
        event.graphChange.replacementApplied
        && event.graphChange.sourceGraphDigest.length === 64
        && event.graphChange.targetGraphDigest.length === 64
        && event.graphChange.changedComponents.join() === [
            "fields",
            "protectedFieldIds",
            "ports",
            "seaChannels",
            "selfIdentity",
            "internalLaws",
            "emergenceCriteria",
            "causalProjection",
        ].join()
    )));
    assert.ok(materialized.anchors.filter((anchor) => anchor.kind === "generated-relation").every((anchor) => (
        anchor.endpoints.some((endpoint) => endpoint.portId === "revision-port")
    )));

    const compiled = compileEndogenousUniverse(program, materialized)!;
    assert.deepEqual(validateAnchoredCausalWorld(compiled.program.world), []);
    for (const world of generated) {
        const compiledWorld = compiled.program.world.worlds.find((candidate) => candidate.id === world.id)!;
        assert.ok(compiledWorld.fields.some((field) => field.id === "lineage-structure"));
        assert.ok(compiledWorld.protectedFieldIds.includes("lineage-structure"));
        assert.ok(compiled.program.world.internalLaws.some((law) => law.id === `${world.id}-lineage-condense`));
        assert.ok(compiled.program.world.emergenceCriteria.some((criterion) => (
            criterion.id === `${world.id}-lineage-structure-present`
        )));
        assert.ok(compiled.program.world.worldWill.objectives.some((objective) => (
            objective.id === `${world.id}-maintain-lineage-structure`
        )));
    }

    const record = recordEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 32 },
    });
    const replayed = replayEndogenousConnectedUniverse(record);
    assert.equal(replayed.status, "verified");
    assert.ok(replayed.run?.materialization.schemaTransformationEvents.every((event) => (
        event.graphChange.replacementApplied && event.graphChange.targetGraphDigest.length === 64
    )));
    const tampered = structuredClone(record);
    tampered.run.materialization.worlds.find((world) => !!world.parentWorldId)!
        .schemaRevision.fields.find((field) => field.id === "lineage-structure")!.role = "world-condition";
    assert.equal(replayEndogenousConnectedUniverse(tampered).status, "integrity-failed");

    const invalid = schemaGraphTransformingUniverseProgram();
    invalid.constructors[0]!.schemaTransformation!.replaceGraph!.protectedFieldIds.push("missing-field");
    invalid.constructors[0]!.schemaTransformation!.replaceGraph!.emergenceCriteria[0]!.witnessFieldIds.push("missing-witness");
    invalid.constructors[0]!.schemaTransformation!.replaceGraph!.causalProjection!.channels.push({
        channelId: "missing-channel",
        positiveWeight: exact.integer(1),
        negativeWeight: exact.integer(1),
    });
    invalid.constructors[0]!.schemaTransformation!.replaceGraph!.causalProjection!.objective.weight = exact.integer(0);
    const diagnosticCodes = validateEndogenousUniverseProgram(invalid).map((diagnostic) => diagnostic.code);
    assert.ok(diagnosticCodes.includes("EGU014"));
    assert.ok(diagnosticCodes.includes("EGU025"));
    assert.ok(diagnosticCodes.includes("EGU072"));
    assert.ok(diagnosticCodes.includes("EGU076"));
    assert.equal(materializeEndogenousUniverse(invalid, { maxDepth: 1 }).status, "contradicted");
});

test("generated worlds execute their own local laws through the observer-independent causal kernel", () => {
    const run = realizeEndogenousConnectedUniverse(connectedUniverseProgram(), {
        generation: { maxDepth: 2, maxWorlds: 32 },
    });
    assert.equal(run.status, "resolved");
    assert.equal(run.worldContinuations.length, 7);
    assert.ok(run.worldContinuations.every((world) => world.hostSelection === false));
    assert.ok(run.worldContinuations.every((world) => world.realizedLawIds.length === 1));
    assert.equal(run.worldContinuations.filter((world) => world.generated).flatMap((world) => world.receivedTransportIds).length, 6);
    assert.equal(run.scalarProjection.presentOnlyAtLegacyCausalBoundary, true);
    assert.equal(run.scalarProjection.ontologicalSeaChannelsRemainDistinct, true);
    assert.ok(run.generationCausalEdges.some((edge) => edge.kind === "anchor-carries-sea-relation"));
    assert.ok(run.generationCausalEdges.some((edge) => edge.kind === "anchor-carries-exact-transport"));
    assert.equal(run.finiteRealization.infiniteDenotation.kind, "potentially-unbounded");
    assert.deepEqual(run.finiteRealization.infiniteDenotation.recursiveConstructorIds, ["binary-continuation"]);
    assert.equal(run.finiteRealization.infiniteDenotation.infinityRemainsIntensional, true);
    assert.equal(run.finiteRealization.infiniteDenotation.finiteMaterializationIsWholeUniverse, false);
    assert.equal(run.finiteRealization.finiteCut.externalObserverRequired, false);
    assert.equal(run.finiteRealization.finiteCut.deterministicEvaluation, true);
    assert.equal(run.finiteRealization.finiteCut.selectsBranch, false);
    assert.equal(run.finiteRealization.finiteCut.resultForm, "single-closed-result");
    assert.equal(run.finiteRealization.finiteCut.worldOutcomeDecided, true);
    assert.equal(run.finiteRealization.selfComplementation.status, "closed-for-demand");
    assert.equal(run.finiteRealization.selfComplementation.steps.length, 2);
    assert.equal(
        run.finiteRealization.selfComplementation.steps[1]!.previousEvidenceDigest,
        run.finiteRealization.selfComplementation.steps[0]!.evidenceDigest,
    );
    assert.equal(run.finiteRealization.selfComplementation.evidenceLedgerMonotone, true);
    assert.equal(run.finiteRealization.selfComplementation.worldStateMonotonicityClaim, false);
    assert.equal(run.finiteRealization.selfComplementation.convergenceGuaranteed, false);
    assert.equal(run.finiteRealization.selfComplementation.wholeUniverseCompletionClaim, false);
    assert.ok(run.finiteRealization.selfComplementation.remainingFrontierKinds.includes("depth-boundary"));
    const causalEdges = run.generationClosures.flatMap((closure) => (
        closure.causalRun.continuations.flatMap((continuation) => continuation.order.causalEdges)
    ));
    for (const world of run.worldContinuations.filter((entry) => entry.generated)) {
        assert.ok(causalEdges.some((edge) => (
            world.receivedTransportIds.includes(edge.cause)
            && world.realizedLawIds.includes(edge.effect.slice("law:".length))
        )));
    }

    const inspection = inspectEndogenousConnectedUniverseRun(run);
    assert.equal(inspection.summary.worldCount, 7);
    assert.equal(inspection.summary.generatedWorldCount, 6);
    assert.equal(inspection.summary.relationAnchorCount, 6);
    assert.equal(inspection.summary.relationTransportCount, 6);
    assert.equal(inspection.summary.seaChannelCount, 14);
    assert.equal(inspection.summary.finiteCutResultForm, "single-closed-result");
    assert.equal(inspection.summary.selfComplementationStatus, "closed-for-demand");
    assert.equal(inspection.finiteRealization.finiteCut.demandDigest, run.finiteRealization.finiteCut.demandDigest);
    assert.equal(inspection.summary.everyMaterializedWorldHasContinuationEvidence, true);
    assert.equal(inspection.summary.universalClock, false);
});

test("generated worlds do not respond when the constructor relation carries no opening condition", () => {
    const program = connectedUniverseProgram();
    program.constructors[0]!.transports = [];
    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 1, maxWorlds: 8 },
    });
    const root = run.worldContinuations.find((world) => !world.generated)!;
    const generated = run.worldContinuations.filter((world) => world.generated);

    assert.equal(run.status, "resolved");
    assert.equal(root.realizedLawIds.length, 1);
    assert.ok(generated.every((world) => world.receivedTransportIds.length === 0));
    assert.ok(generated.every((world) => world.realizedLawIds.length === 0));
    assert.ok(run.materialization.worlds
        .filter((world) => !!world.parentWorldId)
        .every((world) => JSON.stringify(world.fields.condition) === JSON.stringify(exact.integer(0))));
});

test("realized world state reactivates a dormant constructor across causal-generation closures", () => {
    const program = stateReactivatedUniverseProgram();
    const initial = materializeEndogenousUniverse(program, { maxDepth: 2, maxWorlds: 8 });
    assert.equal(initial.worlds.length, 1);
    assert.equal(initial.generationEvents.length, 0);
    assert.equal(initial.frontiers.filter((frontier) => frontier.kind === "admission-closed").length, 1);

    const bounded = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 8 },
        maxGenerationClosures: 1,
    });
    assert.equal(bounded.status, "undetermined");
    assert.equal(bounded.materialization.worlds.length, 2);
    assert.equal(bounded.generationClosure.limitExhausted, true);
    assert.equal(bounded.generationClosure.fixpointReached, false);
    assert.equal(bounded.finiteRealization.finiteCut.resultForm, "open-boundary");
    assert.equal(bounded.finiteRealization.finiteCut.worldOutcomeDecided, false);
    assert.equal(bounded.finiteRealization.selfComplementation.status, "progressed-but-open");
    assert.equal(bounded.worldContinuations.find((world) => world.generated)?.realizedLawIds.length, 0);

    const closed = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 8 },
        maxGenerationClosures: 3,
    });
    const root = closed.worldContinuations.find((world) => !world.generated)!;
    const child = closed.worldContinuations.find((world) => world.generated)!;
    assert.equal(closed.status, "resolved");
    assert.equal(closed.materialization.worlds.length, 2);
    assert.equal(closed.generationClosure.count, 3);
    assert.equal(closed.generationClosure.fixpointReached, true);
    assert.equal(closed.generationClosure.limitExhausted, false);
    assert.equal(closed.generationClosures[0]!.newlyGeneratedEventIds.length, 0);
    assert.equal(closed.generationClosures[1]!.newlyGeneratedEventIds.length, 1);
    assert.equal(closed.generationClosures[2]!.newlyGeneratedEventIds.length, 0);
    assert.equal(closed.generationClosures[0]!.inputWorldCount, 1);
    assert.equal(closed.generationClosures[0]!.outputWorldCount, 2);
    assert.equal(closed.generationClosures[1]!.inputWorldCount, 2);
    assert.equal(closed.generationClosures[2]!.inputConfigurationDigest, closed.generationClosures[2]!.outputConfigurationDigest);
    assert.equal(closed.generationClosures[2]!.realizedEventCount, 0);
    assert.ok(closed.finiteRealization.selfComplementation.steps.some((step) => (
        step.reactivatedDormantAdmission
    )));
    assert.equal(root.realizedLawIds.length, 1);
    assert.equal(child.realizedLawIds.length, 1);
    assert.equal(child.receivedTransportIds.length, 1);
    assert.ok(closed.generationClosures[1]!.causalRun.autonomousContinuation!.order.causalEdges.some((edge) => (
        child.receivedTransportIds.includes(edge.cause)
        && edge.effect === `law:${child.realizedLawIds[0]}`
    )));
});

test("every lawful causal continuation becomes its own generated-universe branch", () => {
    const program = stateReactivatedUniverseProgram();
    const schema = program.schemas[0]!;
    const alternate = structuredClone(schema.internalLaws[0]!);
    alternate.id = "alternate-condensation";
    alternate.guard.id = "alternate-condition-open";
    alternate.effects = [
        { fieldId: "structure", operation: "set", value: exact.integer(2) },
        { fieldId: "condition", operation: "set", value: exact.integer(0) },
    ];
    schema.internalLaws.push(alternate);
    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 8 },
        maxGenerationClosures: 3,
    });

    assert.equal(run.status, "resolved");
    assert.match(run.reason, /every endogenously preserved universe branch/);
    assert.equal(run.branchUniverses.length, 3);
    assert.deepEqual(run.branchUniverses.map((branch) => branch.materialization!.worlds.length).sort(), [1, 2, 2]);
    assert.ok(run.branchUniverses.every((branch) => branch.evidenceLocation === "branch-local"));
    assert.ok(run.branchUniverses.every((branch) => branch.status === "resolved"));
    assert.ok(run.branchUniverses.every((branch) => branch.lineage.length >= 2));
    assert.ok(run.branchUniverses.every((branch) => branch.lineage.every((step) => step.hostSelection === false)));
    assert.equal(run.generationClosure.branchCount, 3);
    assert.equal(run.generationClosure.fixpointReached, true);
    assert.equal(run.generationClosure.persistentRecurrenceCertified, false);
    assert.equal(run.recurrenceCertificates.length, 0);
    assert.equal(run.finiteRealization.finiteCut.resultForm, "complete-closed-branch-family");
    assert.equal(run.finiteRealization.finiteCut.completeBranchCount, 3);
    assert.equal(run.finiteRealization.finiteCut.selectsBranch, false);
    assert.equal(run.generationClosures[0]!.outcomes.length, 2);
    assert.equal(new Set(run.generationClosures[0]!.outcomes.map((outcome) => outcome.branchId)).size, 2);
    assert.ok(run.generationClosures[0]!.causalRun.continuations.length > 1);
    assert.ok(run.generationClosures[0]!.causalRun.continuations.every((continuation) => (
        continuation.branchLineage?.every((step) => step.hostSelection === false) ?? false
    )));

    const inspection = inspectEndogenousConnectedUniverseRun(run);
    assert.equal(inspection.summary.generatedUniverseBranchCount, 3);
    assert.equal(inspection.branches.length, 3);

    const record = recordEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 8 },
        maxGenerationClosures: 3,
    });
    assert.equal(replayEndogenousConnectedUniverse(record).status, "verified");
    const tampered = structuredClone(record);
    tampered.run.branchUniverses[0]!.lineage[0]!.id = "fabricated-branch-step";
    assert.equal(replayEndogenousConnectedUniverse(tampered).status, "integrity-failed");
});

test("an insufficient generation-branch budget preserves the whole branch frontier", () => {
    const program = stateReactivatedUniverseProgram();
    const schema = program.schemas[0]!;
    const alternate = structuredClone(schema.internalLaws[0]!);
    alternate.id = "alternate-condensation";
    alternate.guard.id = "alternate-condition-open";
    alternate.effects = [
        { fieldId: "structure", operation: "set", value: exact.integer(2) },
        { fieldId: "condition", operation: "set", value: exact.integer(0) },
    ];
    schema.internalLaws.push(alternate);
    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 2, maxWorlds: 8 },
        maxGenerationClosures: 3,
        maxGenerationBranches: 1,
    });

    assert.equal(run.status, "undetermined");
    assert.match(run.branchUniverses[0]!.reason, /no partial branch subset was selected/);
    assert.equal(run.branchUniverses.length, 1);
    assert.equal(run.branchUniverses[0]!.evidenceLocation, "top-level");
    assert.equal(run.materialization.worlds.length, 1);
    assert.equal(run.generationClosure.branchLimitExhausted, true);
    assert.equal(run.finiteRealization.finiteCut.resultForm, "open-boundary");
    assert.equal(run.finiteRealization.finiteCut.completeBranchCount, 0);
    assert.equal(run.generationClosures[0]!.outcomes.length, 2);
    assert.equal(new Set(run.generationClosures[0]!.outcomes.map((outcome) => outcome.branchId)).size, 2);
    assert.ok(run.generationClosures[0]!.outcomes.every((outcome) => outcome.status === "undetermined"));
    assert.ok(run.generationClosures[0]!.outcomes.every((outcome) => outcome.hostSelection === false));
});

test("active recurrence persists only with invariant lineage identity and monotone anchor history", () => {
    const run = realizeEndogenousConnectedUniverse(recurrentGeneratedUniverseProgram(), {
        generation: { maxDepth: 1, maxWorlds: 8 },
        maxGenerationClosures: 2,
    });

    assert.equal(run.status, "resolved");
    assert.match(run.reason, /certified persistent recurrence/);
    assert.equal(run.materialization.worlds.length, 3);
    assert.equal(run.materialization.anchors.length, 5);
    assert.equal(run.generationClosure.fixpointReached, false);
    assert.equal(run.generationClosure.recurrentConfigurationDetected, true);
    assert.equal(run.generationClosure.persistentRecurrenceCertified, true);
    assert.equal(run.generationClosures.length, 1);
    assert.equal(run.generationClosures[0]!.inputConfigurationDigest, run.generationClosures[0]!.outputConfigurationDigest);
    assert.equal(run.generationClosures[0]!.realizedEventCount, 6);
    assert.equal(run.branchUniverses[0]!.closureKind, "persistent-recurrence");
    assert.equal(run.recurrenceCertificates.length, 1);
    const recurrence = run.recurrenceCertificates[0]!;
    assert.equal(recurrence.status, "certified");
    assert.equal(recurrence.cycle.periodClosures, 1);
    assert.equal(recurrence.identity.stableWorldIds.length, 3);
    assert.equal(recurrence.identity.invariantAcrossCycleCuts, true);
    assert.equal(recurrence.identity.dependenciesUnmodifiedWithinCycle, true);
    assert.deepEqual(recurrence.identity.mutatedIdentityDependencyFieldKeys, []);
    assert.equal(recurrence.anchoredHistory.topologyPrefixPreserved, true);
    assert.equal(recurrence.anchoredHistory.anchorSetDigestAtCycleStart, recurrence.anchoredHistory.anchorSetDigestAtRecurrence);
    assert.equal(
        recurrence.anchoredHistory.generationEventSetDigestAtCycleStart,
        recurrence.anchoredHistory.generationEventSetDigestAtRecurrence,
    );
    assert.equal(recurrence.anchoredHistory.extensionCount, 6);
    assert.equal(recurrence.anchoredHistory.causalEvidenceExtensionCount, 6);
    assert.equal(recurrence.anchoredHistory.committedHistoryExtensionCount, 0);
    assert.equal(recurrence.anchoredHistory.worldHistoryExtended, false);
    assert.equal(recurrence.anchoredHistory.fullAnchoredStateRepeated, true);
    assert.ok(recurrence.anchoredHistory.extensionEntries.every((entry) => entry.hostSelection === false));
    assert.equal(run.finiteRealization.finiteCut.resultForm, "single-closed-result");
    assert.equal(run.finiteRealization.selfComplementation.status, "closed-for-demand");
    assert.equal(run.finiteRealization.selfComplementation.steps[0]!.persistentRecurrenceOutcomeCount, 1);

    const inspection = inspectEndogenousConnectedUniverseRun(run);
    assert.equal(inspection.summary.persistentGenerationRecurrenceCertified, true);
    assert.equal(inspection.summary.recurrenceCertificateCount, 1);
    assert.equal(inspection.recurrenceCertificates[0]!.id, recurrence.id);

    const record = recordEndogenousConnectedUniverse(recurrentGeneratedUniverseProgram(), {
        generation: { maxDepth: 1, maxWorlds: 8 },
        maxGenerationClosures: 2,
    });
    assert.equal(replayEndogenousConnectedUniverse(record).status, "verified");
    const tampered = structuredClone(record);
    tampered.run.recurrenceCertificates[0]!.anchoredHistory.extensionDigest = "fabricated-history";
    assert.equal(replayEndogenousConnectedUniverse(tampered).status, "integrity-failed");
});

test("equal recurrence cuts cannot hide mutation of an anchor-identity dependency", () => {
    const program = recurrentGeneratedUniverseProgram();
    program.schemas[0]!.selfIdentity = {
        id: "condition-carries-identity",
        query: { familyId: "is-one", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
        fieldParameters: [{ parameterName: "value", fieldId: "condition" }],
    };
    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 1, maxWorlds: 8 },
        maxGenerationClosures: 2,
    });

    assert.equal(run.status, "undetermined");
    assert.equal(run.generationClosure.fixpointReached, false);
    assert.equal(run.generationClosure.recurrentConfigurationDetected, true);
    assert.equal(run.generationClosure.persistentRecurrenceCertified, false);
    assert.equal(run.recurrenceCertificates.length, 1);
    const recurrence = run.recurrenceCertificates[0]!;
    assert.equal(recurrence.status, "not-certified");
    assert.equal(recurrence.identity.invariantAcrossCycleCuts, true);
    assert.equal(recurrence.identity.dependenciesUnmodifiedWithinCycle, false);
    assert.deepEqual(
        recurrence.identity.mutatedIdentityDependencyFieldKeys,
        run.materialization.worlds.map((world) => `${world.id}.condition`).sort(),
    );
    assert.match(recurrence.reason, /mutated an anchor-identity dependency/);
});

test("committed world history remains distinct from monotone recurrence evidence", () => {
    const program = recurrentGeneratedUniverseProgram();
    for (const law of program.schemas[0]!.internalLaws) law.commitAffectedFieldIds = ["condition"];
    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 1, maxWorlds: 8 },
        maxGenerationClosures: 2,
    });

    assert.equal(run.status, "resolved");
    const recurrence = run.recurrenceCertificates[0]!;
    assert.equal(recurrence.status, "certified");
    assert.equal(recurrence.anchoredHistory.causalEvidenceExtensionCount, 6);
    assert.equal(recurrence.anchoredHistory.committedHistoryExtensionCount, 6);
    assert.equal(recurrence.anchoredHistory.worldHistoryExtended, true);
    assert.equal(recurrence.anchoredHistory.fullAnchoredStateRepeated, false);
});

test("bounded identity proof cannot fabricate persistent generated recurrence", () => {
    const program = recurrentGeneratedUniverseProgram();
    let expensiveIdentity = term.value(exact.boolean(true));
    for (let index = 0; index < 16; index += 1) {
        expensiveIdentity = term.binary("and", expensiveIdentity, term.value(exact.boolean(true)));
    }
    program.formal.families.push({
        id: "expensive-identity",
        domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
        valueKind: "boolean",
        parameters: [],
        body: expensiveIdentity,
    });
    program.schemas[0]!.selfIdentity = {
        id: "bounded-self-identity",
        query: { familyId: "expensive-identity", at: { unit: { kind: "literal", value: "0" } }, parameters: {} },
        fieldParameters: [],
    };
    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 1, maxWorlds: 8, evaluationBudgetPerQuery: 8 },
        maxGenerationClosures: 2,
    });

    assert.equal(run.status, "undetermined");
    assert.equal(run.generationClosure.recurrentConfigurationDetected, true);
    assert.equal(run.generationClosure.persistentRecurrenceCertified, false);
    assert.equal(run.recurrenceCertificates[0]!.status, "undetermined");
    assert.ok(run.recurrenceCertificates[0]!.identity.predicatesAtCycleStart.some((entry) => (
        entry.status === "undetermined"
    )));
});

test("a world budget cannot select only part of one generated sibling set", () => {
    const materialized = materializeEndogenousUniverse(connectedUniverseProgram(), {
        maxDepth: 1,
        maxWorlds: 2,
    });
    assert.equal(materialized.status, "undetermined");
    assert.equal(materialized.worlds.length, 1);
    assert.equal(materialized.generationEvents.length, 0);
    assert.equal(materialized.frontiers.filter((frontier) => frontier.kind === "world-budget").length, 2);
    assert.equal(materialized.coverage.demandedSliceComplete, false);
});

test("an unresolved admission preserves the complete sibling frontier instead of materializing a partial family", () => {
    const program = connectedUniverseProgram();
    const admission = program.formal.families.find((family) => family.id === "admit-all")!;
    for (let depth = 0; depth < 16; depth += 1) {
        admission.body = term.binary("and", admission.body, term.value(exact.boolean(true)));
    }
    const materialized = materializeEndogenousUniverse(program, {
        maxDepth: 1,
        maxWorlds: 8,
        evaluationBudgetPerQuery: 8,
    });

    assert.equal(materialized.status, "undetermined");
    assert.equal(materialized.worlds.length, 1);
    assert.equal(materialized.generationEvents.length, 0);
    assert.equal(materialized.frontiers.filter((frontier) => frontier.kind === "admission-undetermined").length, 2);
    assert.equal(materialized.coverage.demandedSliceComplete, false);
});

test("an admitted sibling stays recorded while another sibling's admission is unresolved", () => {
    const program = connectedUniverseProgram();
    let expensive = term.value(exact.boolean(true));
    for (let depth = 0; depth < 16; depth += 1) {
        expensive = term.binary("and", expensive, term.value(exact.boolean(true)));
    }
    program.formal.families.push({
        id: "admit-by-coordinate",
        domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
        valueKind: "boolean",
        parameters: [{ name: "coordinate", valueKind: "rational" }],
        body: term.if(
            term.binary("equal", term.parameter("coordinate"), term.value(exact.integer(0))),
            term.value(exact.boolean(true)),
            expensive,
        ),
    });
    program.constructors[0]!.admission = {
        id: "mixed-admission",
        query: {
            familyId: "admit-by-coordinate",
            at: { unit: { kind: "literal", value: "0" } },
            parameters: { coordinate: { kind: "local-coordinate" } },
        },
        fieldParameters: [],
    };
    const materialized = materializeEndogenousUniverse(program, {
        maxDepth: 1,
        maxWorlds: 8,
        evaluationBudgetPerQuery: 8,
    });

    assert.equal(materialized.status, "undetermined");
    assert.equal(materialized.worlds.length, 1);
    assert.deepEqual(
        materialized.frontiers.map((frontier) => `${frontier.kind}@${frontier.coordinate}`).sort(),
        ["admission-undetermined@1", "sibling-admission-pending@0"],
    );
});

test("a world budget cannot let coordinate order choose which cousin family of one level exists", () => {
    const materialized = materializeEndogenousUniverse(connectedUniverseProgram(), {
        maxDepth: 2,
        maxWorlds: 5,
    });

    assert.equal(materialized.status, "undetermined");
    assert.deepEqual(materialized.worlds.map((world) => world.address.lineage.length).sort(), [0, 1, 1]);
    const budget = materialized.frontiers.filter((frontier) => frontier.kind === "world-budget");
    assert.equal(budget.length, 4);
    assert.equal(new Set(budget.map((frontier) => frontier.parentWorldId)).size, 2);
    assert.equal(materialized.coverage.exhaustiveUniverse, false);
});

test("a world budget below the root set preserves every root and never claims the whole universe", () => {
    const program = connectedUniverseProgram();
    program.constructors = [];
    program.roots = [
        { id: "alpha", schemaId: "field-world", values: {} },
        { id: "beta", schemaId: "field-world", values: {} },
    ];
    assert.deepEqual(validateEndogenousUniverseProgram(program), []);
    const materialized = materializeEndogenousUniverse(program, { maxWorlds: 1 });

    assert.equal(materialized.status, "undetermined");
    assert.equal(materialized.worlds.length, 0);
    assert.deepEqual(
        materialized.frontiers.map((frontier) => [frontier.kind, frontier.rootId]),
        [["root-world-budget", "alpha"], ["root-world-budget", "beta"]],
    );
    assert.equal(materialized.coverage.exhaustiveUniverse, false);
    const run = realizeEndogenousConnectedUniverse(program, { generation: { maxWorlds: 1 } });
    assert.equal(run.finiteRealization.infiniteDenotation.finiteMaterializationIsWholeUniverse, false);
});

test("constructor endpoints close against every revision another constructor can give the same schema", () => {
    const program = connectedUniverseProgram();
    const transporting = program.constructors[0]!;
    const { id: _schemaId, ...baseGraph } = structuredClone(program.schemas[0]!);
    const protectedGraph = structuredClone(baseGraph);
    protectedGraph.protectedFieldIds = [...protectedGraph.protectedFieldIds, "condition"];
    const protecting = structuredClone(transporting);
    protecting.id = "a-protect-condition";
    protecting.coordinates = { kind: "finite", size: "1" };
    protecting.transports = [];
    protecting.schemaTransformation = { id: "protect-condition", replaceGraph: protectedGraph };
    program.constructors = [protecting, transporting];

    // The transporting constructor's own endpoints are valid; only a grandchild that inherits the other
    // constructor's revision would expose the protected target.
    assert.ok(validateEndogenousUniverseProgram(program).some((diagnostic) => diagnostic.code === "EGU045"));
    const protectedRun = materializeEndogenousUniverse(program, { maxDepth: 2, maxWorlds: 64 });
    assert.equal(protectedRun.status, "contradicted");
    assert.equal(protectedRun.worlds.length, 0);

    const missingSource = structuredClone(program);
    const replacement = missingSource.constructors[0]!.schemaTransformation!.replaceGraph!;
    replacement.protectedFieldIds = [...baseGraph.protectedFieldIds];
    replacement.fields = replacement.fields.filter((field) => field.id !== "signal");
    assert.ok(validateEndogenousUniverseProgram(missingSource).some((diagnostic) => diagnostic.code === "EGU043"));
    assert.equal(materializeEndogenousUniverse(missingSource, { maxDepth: 2, maxWorlds: 64 }).worlds.length, 0);
});

test("an unresolved schema transformation preserves the complete sibling revision frontier atomically", () => {
    const program = lawTransformingUniverseProgram();
    let expensive = term.value(exact.integer(1));
    for (let depth = 0; depth < 16; depth += 1) {
        expensive = term.binary("add", expensive, term.value(exact.integer(0)));
    }
    program.formal.families.push({
        id: "bounded-law-value",
        domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
        valueKind: "rational",
        parameters: [{ name: "coordinate", valueKind: "rational" }],
        body: term.if(
            term.binary("equal", term.parameter("coordinate"), term.value(exact.integer(0))),
            term.value(exact.integer(1)),
            expensive,
        ),
    });
    program.constructors[0]!.schemaTransformation!.effectValues![0]!.value = {
        familyId: "bounded-law-value",
        at: { unit: { kind: "literal", value: "0" } },
        parameters: { coordinate: { kind: "local-coordinate" } },
    };
    const materialized = materializeEndogenousUniverse(program, {
        maxDepth: 1,
        maxWorlds: 8,
        evaluationBudgetPerQuery: 8,
    });

    assert.equal(materialized.status, "undetermined");
    assert.equal(materialized.worlds.length, 1);
    assert.equal(materialized.generationEvents.length, 0);
    assert.equal(materialized.schemaTransformationEvents.length, 0);
    assert.equal(materialized.frontiers.filter((frontier) => (
        frontier.kind === "schema-transformation-undetermined"
    )).length, 2);
    assert.equal(materialized.coverage.demandedSliceComplete, false);
});

test("a natural constructor preserves its unmaterialized continuation beyond the demanded prefix", () => {
    const program = connectedUniverseProgram();
    program.constructors[0]!.coordinates = { kind: "natural" };
    const materialized = materializeEndogenousUniverse(program, {
        maxDepth: 1,
        maxWorlds: 8,
        naturalCoordinateLimit: 2,
    });

    assert.equal(materialized.status, "resolved");
    assert.equal(materialized.worlds.length, 3);
    assert.equal(materialized.coverage.demandedSliceComplete, true);
    assert.equal(materialized.coverage.exhaustiveUniverse, false);
    assert.equal(materialized.coverage.latentContinuationPreserved, true);
    assert.equal(materialized.frontiers.filter((frontier) => frontier.kind === "natural-open").length, 1);
});

test("the endogenous validator rejects missing identity ports and transport type shortcuts without executing", () => {
    const missingPort = connectedUniverseProgram();
    missingPort.schemas[0]!.ports = [];
    assert.ok(validateEndogenousUniverseProgram(missingPort).some((diagnostic) => diagnostic.code === "EGU040"));
    assert.equal(materializeEndogenousUniverse(missingPort).status, "contradicted");

    const seaPayload = connectedUniverseProgram();
    seaPayload.constructors[0]!.transports[0]!.sourceFieldId = "lineage-support";
    assert.ok(validateEndogenousUniverseProgram(seaPayload).some((diagnostic) => diagnostic.code === "EGU045"));

    const protectedTarget = connectedUniverseProgram();
    protectedTarget.constructors[0]!.transports[0]!.targetFieldId = "structure";
    assert.ok(validateEndogenousUniverseProgram(protectedTarget).some((diagnostic) => diagnostic.code === "EGU045"));

    const duplicateTarget = connectedUniverseProgram();
    duplicateTarget.constructors[0]!.transports.push({ sourceFieldId: "signal", targetFieldId: "condition" });
    assert.ok(validateEndogenousUniverseProgram(duplicateTarget).some((diagnostic) => diagnostic.code === "EGU042"));
});

test("schema law transformations reject untyped, ambiguous, reversible, and structurally unknown targets", () => {
    const unknownLaw = lawTransformingUniverseProgram();
    unknownLaw.constructors[0]!.schemaTransformation!.effectValues![0]!.lawId = "absent";
    assert.ok(validateEndogenousUniverseProgram(unknownLaw).some((diagnostic) => diagnostic.code === "EGU057"));

    const reversible = lawTransformingUniverseProgram();
    reversible.schemas[0]!.internalLaws[0]!.reversibility = "reversible";
    assert.ok(validateEndogenousUniverseProgram(reversible).some((diagnostic) => diagnostic.code === "EGU058"));

    const outsideEffect = lawTransformingUniverseProgram();
    outsideEffect.constructors[0]!.schemaTransformation!.effectValues![0]!.effectIndex = 9;
    assert.ok(validateEndogenousUniverseProgram(outsideEffect).some((diagnostic) => diagnostic.code === "EGU059"));

    const duplicate = lawTransformingUniverseProgram();
    duplicate.constructors[0]!.schemaTransformation!.effectValues!.push(structuredClone(
        duplicate.constructors[0]!.schemaTransformation!.effectValues![0]!,
    ));
    assert.ok(validateEndogenousUniverseProgram(duplicate).some((diagnostic) => diagnostic.code === "EGU060"));

    const wrongKind = lawTransformingUniverseProgram();
    wrongKind.constructors[0]!.schemaTransformation!.effectValues![0]!.value = {
        familyId: "admit-all",
        at: { unit: { kind: "literal", value: "0" } },
        parameters: {},
    };
    assert.ok(validateEndogenousUniverseProgram(wrongKind).some((diagnostic) => diagnostic.code === "EGU061"));
    assert.equal(materializeEndogenousUniverse(wrongKind).status, "contradicted");
});

test("complete law-set morphisms reject ambiguous topology and invalid effect or inverse contracts", () => {
    const validReversible = lawSetTransformingUniverseProgram();
    validReversible.constructors[0]!.schemaTransformation!.upsertLaws!.push({
        id: "reversible-structure-shift",
        guard: structuredClone(validReversible.schemas[0]!.internalLaws[0]!.guard),
        effects: [{ fieldId: "structure", operation: "add", value: exact.integer(1) }],
        application: "once-per-realization",
        reversibility: "reversible",
        inverseEffects: [{ fieldId: "structure", operation: "subtract", value: exact.integer(1) }],
    });
    assert.deepEqual(validateEndogenousUniverseProgram(validReversible), []);
    const reversibleMaterialization = materializeEndogenousUniverse(validReversible, { maxDepth: 1, maxWorlds: 8 });
    assert.equal(reversibleMaterialization.status, "resolved");
    assert.deepEqual(
        validateAnchoredCausalWorld(compileEndogenousUniverse(validReversible, reversibleMaterialization)!.program.world),
        [],
    );

    const empty = connectedUniverseProgram();
    empty.constructors[0]!.schemaTransformation = { id: "empty-morphism" };
    assert.ok(validateEndogenousUniverseProgram(empty).some((diagnostic) => diagnostic.code === "EGU056"));

    const duplicateRemoval = lawSetTransformingUniverseProgram();
    duplicateRemoval.constructors[0]!.schemaTransformation!.removeLawIds!.push("condense");
    assert.ok(validateEndogenousUniverseProgram(duplicateRemoval).some((diagnostic) => diagnostic.code === "EGU068"));

    const unknownRemoval = lawSetTransformingUniverseProgram();
    unknownRemoval.constructors[0]!.schemaTransformation!.removeLawIds = ["absent-law"];
    assert.ok(validateEndogenousUniverseProgram(unknownRemoval).some((diagnostic) => diagnostic.code === "EGU068"));

    const duplicateUpsert = lawSetTransformingUniverseProgram();
    duplicateUpsert.constructors[0]!.schemaTransformation!.upsertLaws!.push(structuredClone(
        duplicateUpsert.constructors[0]!.schemaTransformation!.upsertLaws![0]!,
    ));
    assert.ok(validateEndogenousUniverseProgram(duplicateUpsert).some((diagnostic) => diagnostic.code === "EGU069"));

    const overlap = lawSetTransformingUniverseProgram();
    overlap.constructors[0]!.schemaTransformation!.removeLawIds = ["lineage-condense"];
    assert.ok(validateEndogenousUniverseProgram(overlap).some((diagnostic) => diagnostic.code === "EGU069"));

    const invalidInverse = lawSetTransformingUniverseProgram();
    invalidInverse.constructors[0]!.schemaTransformation!.upsertLaws![0]!.reversibility = "reversible";
    assert.ok(validateEndogenousUniverseProgram(invalidInverse).some((diagnostic) => diagnostic.code === "EGU066"));

    const duplicateEffect = lawSetTransformingUniverseProgram();
    duplicateEffect.constructors[0]!.schemaTransformation!.upsertLaws![0]!.effects.push({
        fieldId: "structure",
        operation: "add",
        value: exact.integer(1),
    });
    assert.ok(validateEndogenousUniverseProgram(duplicateEffect).some((diagnostic) => diagnostic.code === "EGU064"));

    const wrongEffectKind = lawSetTransformingUniverseProgram();
    wrongEffectKind.constructors[0]!.schemaTransformation!.upsertLaws![0]!.effects[0]!.value = exact.boolean(true);
    assert.ok(validateEndogenousUniverseProgram(wrongEffectKind).some((diagnostic) => diagnostic.code === "EGU065"));
    assert.equal(materializeEndogenousUniverse(wrongEffectKind).status, "contradicted");
});

test("query templates are total typed contracts rather than runtime-false fallbacks", () => {
    const wrongAxis = connectedUniverseProgram();
    wrongAxis.schemas[0]!.selfIdentity.query.at = { wrong: { kind: "literal", value: "0" } };
    assert.ok(validateEndogenousUniverseProgram(wrongAxis).some((diagnostic) => diagnostic.code === "EGU049"));
    assert.equal(materializeEndogenousUniverse(wrongAxis).status, "contradicted");

    const missingParameter = connectedUniverseProgram();
    missingParameter.schemas[0]!.selfIdentity.fieldParameters = [];
    assert.ok(validateEndogenousUniverseProgram(missingParameter).some((diagnostic) => diagnostic.code === "EGU051"));

    const wrongKind = connectedUniverseProgram();
    wrongKind.schemas[0]!.selfIdentity.fieldParameters = [];
    wrongKind.schemas[0]!.selfIdentity.query.parameters.value = {
        kind: "literal",
        value: exact.boolean(true),
    };
    assert.ok(validateEndogenousUniverseProgram(wrongKind).some((diagnostic) => diagnostic.code === "EGU053"));

    const unavailableParent = connectedUniverseProgram();
    unavailableParent.schemas[0]!.internalLaws[0]!.guard.fieldParameters = [];
    unavailableParent.schemas[0]!.internalLaws[0]!.guard.query.parameters.value = {
        kind: "parent-field",
        fieldId: "signal",
    };
    assert.ok(validateEndogenousUniverseProgram(unavailableParent).some((diagnostic) => diagnostic.code === "EGU055"));
});

test("worldhood remains represented when a legacy scalar execution projection is absent", () => {
    const program = connectedUniverseProgram();
    delete program.schemas[0]!.causalProjection;
    const materialized = materializeEndogenousUniverse(program, { maxDepth: 1, maxWorlds: 8 });
    assert.equal(materialized.status, "resolved");
    assert.equal(materialized.worlds.length, 3);

    const run = realizeEndogenousConnectedUniverse(program, {
        generation: { maxDepth: 1, maxWorlds: 8 },
    });
    assert.equal(run.status, "undetermined");
    assert.match(run.reason, /no complete legacy causal projection/);
    assert.equal(run.representativeCausalClosureId, undefined);
});

test("record and replay preserve generated topology, sea relations, and autonomous continuation", () => {
    const record = recordEndogenousConnectedUniverse(connectedUniverseProgram(), {
        generation: { maxDepth: 2, maxWorlds: 32 },
    });
    const replayed = replayEndogenousConnectedUniverse(record);
    assert.equal(replayed.status, "verified");
    assert.equal(replayed.run?.materialization.worlds.length, 7);

    const tampered = structuredClone(record);
    tampered.run.finiteRealization.selfComplementation.finalEvidenceDigest = "fabricated-evidence";
    assert.equal(replayEndogenousConnectedUniverse(tampered).status, "integrity-failed");
});

test("record and replay bind inherited schema revisions and their transformation provenance", () => {
    const record = recordEndogenousConnectedUniverse(lawSetTransformingUniverseProgram(), {
        generation: { maxDepth: 2, maxWorlds: 32 },
    });
    const replayed = replayEndogenousConnectedUniverse(record);
    assert.equal(replayed.status, "verified");
    assert.equal(replayed.run?.materialization.schemaTransformationEvents.length, 6);
    assert.deepEqual(
        replayed.run?.materialization.schemaTransformationEvents[0]!.lawSetChange.targetLawIds,
        ["lineage-condense"],
    );

    const tampered = structuredClone(record);
    tampered.run.materialization.schemaTransformationEvents[0]!.lawSetChange.targetLawIds = ["fabricated-law"];
    assert.equal(replayEndogenousConnectedUniverse(tampered).status, "integrity-failed");
});
