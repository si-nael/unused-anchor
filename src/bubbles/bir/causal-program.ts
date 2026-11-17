// BIR semantic schema for `bubble-anchored-causal-program.v2`, the executable kernel every bounded Bubble world
// path currently runs through.
//
// Collection order classification (see docs/reference/bubble-ir.md):
// - `set`: membership is the meaning; the oracle is invariant under every permutation, which the order
//   regression in tests/unit/bir.test.ts checks for each set position present in the canonical fixtures.
// - `seq`: intensional domain axes keep authored position because no evidence yet shows axis order is free.
// Vocabulary strings such as field roles, intervention kinds, operators, and decision modes are encoded as
// text rather than closed numeric tags, so an open research vocabulary is not frozen into the byte format.

import { bir, type BirSchema } from "./schema";

const term: BirSchema = bir.lazy(() => termSchema);

const termSchema: BirSchema = bir.variant("kind", {
    value: { value: bir.exact },
    index: { axis: bir.text },
    parameter: { name: bir.text },
    unary: { operator: bir.text, operand: term },
    binary: { operator: bir.text, left: term, right: term },
    if: { condition: term, then: term, otherwise: term },
    "family-coordinate": { familyId: bir.text, at: bir.map(term), parameters: bir.map(term) },
});

const intensionalSystem = bir.record({
    mode: bir.literal("bubble-intensional-system.v1"),
    families: bir.set(bir.record({
        id: bir.text,
        domain: bir.record({
            axes: bir.seq(bir.variant("kind", {
                natural: { name: bir.text },
                integer: { name: bir.text },
                finite: { name: bir.text, size: bir.integerText },
            })),
        }),
        valueKind: bir.text,
        parameters: bir.set(bir.record({ name: bir.text, valueKind: bir.text })),
        body: term,
        recursion: bir.optional(bir.record({ kind: bir.text, measureAxis: bir.text })),
    })),
});

const coordinateQuery = bir.record({
    familyId: bir.text,
    at: bir.map(bir.integerText),
    parameters: bir.map(bir.exact),
});

const fieldParameter = bir.record({ parameterName: bir.text, worldId: bir.text, fieldId: bir.text });

const statePredicateFields = {
    id: bir.text,
    query: coordinateQuery,
    fieldParameters: bir.set(fieldParameter),
};

const statePredicate = bir.record(statePredicateFields);

const fieldEffect = bir.record({ fieldId: bir.text, operation: bir.text, value: bir.exact });

const transferEndpoint = bir.record({ worldId: bir.text, portId: bir.text, fieldId: bir.text });

// Multiversal sea medium (v0.5.10). Regions, placements, adjacency, and exchange laws are keyed by id or by
// their content, so they are sets. An adjacency is undirected, so its pair of region ids is a set as well; a
// set also rejects a repeated region, matching the two-distinct-regions rule. A world endpoint names the world
// only; the exchanged quantity selects its local sea field.
const seaEndpoint = bir.variant("kind", {
    region: { regionId: bir.text },
    world: { worldId: bir.text },
});

const seaMedium = bir.record({
    id: bir.text,
    closure: bir.text,
    regions: bir.set(bir.record({ id: bir.text, negative: bir.exact, positive: bir.exact })),
    placements: bir.set(bir.record({ worldId: bir.text, regionId: bir.text })),
    adjacency: bir.set(bir.record({ id: bir.text, regionIds: bir.set(bir.text) })),
    exchangeLaws: bir.set(bir.record({
        id: bir.text,
        quantity: bir.text,
        from: seaEndpoint,
        to: seaEndpoint,
        amount: bir.exact,
        guard: bir.record({
            ...statePredicateFields,
            regionParameters: bir.set(bir.record({ parameterName: bir.text, regionId: bir.text, quantity: bir.text })),
        }),
        application: bir.text,
    })),
});

const worldSystem = bir.record({
    mode: bir.literal("bubble-anchored-causal-world.v2"),
    formal: intensionalSystem,
    worlds: bir.set(bir.record({
        id: bir.text,
        initialExistence: bir.optional(bir.text),
        fields: bir.set(bir.record({ id: bir.text, familyId: bir.text, role: bir.text })),
        protectedFieldIds: bir.set(bir.text),
        seaCoupling: bir.record({
            positiveFieldId: bir.text,
            negativeFieldId: bir.text,
            viabilityFieldId: bir.text,
        }),
    })),
    anchors: bir.set(bir.record({
        id: bir.text,
        endpoints: bir.set(bir.variant("kind", {
            world: { worldId: bir.text, portId: bir.text },
            "unresolved-world-relation": { relationId: bir.text, portId: bir.text, questionId: bir.text },
        })),
        identityPredicateFamilyIds: bir.set(bir.text),
        permittedInterventionKinds: bir.set(bir.text),
    })),
    anchorTransfers: bir.optional(bir.set(bir.record({
        id: bir.text,
        anchorId: bir.text,
        source: transferEndpoint,
        target: transferEndpoint,
        sourceNegativeSeaResidue: bir.exact,
        targetPositiveSeaPlacement: bir.exact,
    }))),
    seaMedium: bir.optional(seaMedium),
    worldWill: bir.record({
        id: bir.text,
        objectives: bir.set(bir.record({
            id: bir.text,
            targetWorldId: bir.text,
            fieldId: bir.text,
            direction: bir.text,
            weight: bir.exact,
            targetValue: bir.optional(bir.exact),
        })),
        hardConstraintFamilyIds: bir.set(bir.text),
        interventions: bir.set(bir.record({
            id: bir.text,
            targetWorldId: bir.text,
            anchorId: bir.text,
            kind: bir.text,
            effects: bir.set(fieldEffect),
        })),
    }),
    internalLaws: bir.set(bir.record({
        id: bir.text,
        worldId: bir.text,
        guard: statePredicate,
        effects: bir.set(fieldEffect),
        lifecycleEffects: bir.optional(bir.set(bir.variant("kind", {
            "spawn-world": { targetWorldId: bir.text },
            "retire-self": {},
        }))),
        anchorTransferIds: bir.optional(bir.set(bir.text)),
        application: bir.text,
        reversibility: bir.text,
        inverseEffects: bir.optional(bir.set(fieldEffect)),
        commitAffectedFieldIds: bir.optional(bir.set(bir.text)),
    })),
    emergenceCriteria: bir.set(bir.record({
        id: bir.text,
        worldId: bir.text,
        predicate: statePredicate,
        witnessFieldIds: bir.set(bir.text),
    })),
    order: bir.record({ kind: bir.text, universalClock: bir.bool }),
});

export const CAUSAL_PROGRAM_SECTION = "core.causal-program";

export const causalProgramSchema: BirSchema = bir.record({
    mode: bir.literal("bubble-anchored-causal-program.v2"),
    world: worldSystem,
    fieldInitializers: bir.set(bir.record({ worldId: bir.text, fieldId: bir.text, query: coordinateQuery })),
    seaLaws: bir.set(bir.record({ worldId: bir.text, positiveWeight: bir.exact, negativeWeight: bir.exact })),
    execution: bir.record({
        decisionMode: bir.text,
        internalConflictMode: bir.optional(bir.text),
        hardConstraints: bir.set(statePredicate),
        anchorIdentity: bir.set(bir.record({ ...statePredicateFields, anchorId: bir.text })),
        interventionCosts: bir.set(bir.record({ interventionId: bir.text, cost: bir.exact })),
    }),
});
