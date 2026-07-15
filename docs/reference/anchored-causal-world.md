# Anchored Causal World Reference

Applies to: `bubble-anchored-causal-world.v2`, `bubble-anchored-causal-program.v2`, and `v0.5.2`

Compatibility note: `v0.5.3` leaves this once-per-realization contract unchanged and unfolds it through the separate [Persistent Causal World](persistent-causal-world.md) layer.

## Program Shape

An executable program contains:

- `world`: exact formal families, worlds, anchors, World Will, internal laws, emergence criteria, and causal order;
- `fieldInitializers`: one exact intensional query per field;
- `seaLaws`: exact non-negative positive/negative weights per world;
- `execution`: decision mode, post-state hard constraints, anchor-identity queries, and exact intervention costs.

The schema is defined in [`src/bubbles/world-kernel/causal.ts`](../../src/bubbles/world-kernel/causal.ts). Execution and replay are defined in [`src/bubbles/world-kernel/causal-runtime.ts`](../../src/bubbles/world-kernel/causal-runtime.ts).

## Fields

Field roles are `world-state`, `world-condition`, `structural-state`, `identity-state`, `memory-state`, `boundary-state`, `positive-sea`, `negative-sea`, and `viability`.

Every world names exactly addressed positive-sea, negative-sea, and viability fields. The runtime computes

`viability = intrinsicViability + positiveWeight × positiveSea - negativeWeight × negativeSea`.

`protectedFieldIds` mark internal structure that World Will may not mutate directly. Internal laws may still change those fields.

Trace effects name their semantic layer. Ordinary effects use `world-field`; direct effects on the viability field use `intrinsic-viability`, after which a separate `sea-coupling` derivation updates the visible world-field viability. A trace must never mix those layers in one before/operand/after equation.

## Internal Laws

Each law has:

- one exact boolean state-bound `guard`;
- local exact `effects` using `add`, `subtract`, or `set`;
- `application: once-per-realization`;
- `reversible` with exact additive `inverseEffects`, or `irreversible`;
- optional `commitAffectedFieldIds` for an explicit irreversible history record.

The runtime repeatedly evaluates all unapplied guards. All true commuting laws form one causal frontier. An unresolved guard, exhausted frontier budget, or non-commuting simultaneous effect returns `underdetermined`.

## Anchors And World Will

An anchor has world or unresolved-relation endpoints, exact identity predicate families, and permitted intervention kinds. An intervention names one reached world, one anchor, one permitted kind, and exact field effects.

World Will may directly affect only `world-condition`, `boundary-state`, the two sea roles, or `viability`. It may never mutate a protected field. Candidate combinations are exhaustively evaluated up to `maxInterventionCombinations`; an incomplete search cannot select a convenient winner.

`maximize` and `minimize` score the exact weighted field. `stabilize` must declare an exact rational `targetValue` and scores the negative exact distance from that target. There is no implicit zero equilibrium.

Anchor identity is checked both before intervention eligibility and after the intervention plus internal causal closure. A candidate that destroys any declared anchor identity is inadmissible; an unresolved post-state identity makes the candidate `undetermined`.

The power-set cardinality is computed exactly with `bigint`, while candidate subsets are generated lazily only up to the configured bound. The runtime never allocates the full intervention power set before applying the bound.

## Emergence

Each emergence criterion contains a boolean predicate and witness fields. It compares initial and final state and emits one of:

- `absent`: false before and after;
- `persistent`: true before and after;
- `emerged`: false before, true after;
- `dissolved`: true before, false after;
- `undetermined`: a query budget or formal dependency prevented a result;
- `contradicted`: the formal query was invalid at execution.

The criterion is generic. Domain-specific claims such as life, agency, protagonist identity, or narrative coherence must be defined by additional lawful criteria rather than inferred from a label.

## Run Status

- `realized`: one unique exact improving continuation was selected;
- `plural`: authored plural semantics preserves all equal best continuations;
- `stable`: autonomous closure remains the best admissible state;
- `blocked`: World Will is enabled but every intervention route is blocked;
- `underdetermined`: formal evaluation, commutation, search, or deterministic selection is unresolved;
- `contradicted`: static validation or exact execution failed.

## Causal Order

Runs always report `kind: causal-partial-order` and `universalClock: false`. `evaluationOrder` and `evaluationFrontiers` make host execution reproducible but do not assign physical time. `causalEdges` carry semantic dependence. `createsHistoryArrow` becomes true only when an explicit history commit exists.

## Commands

```text
npm run run:causal-example
npm run inspect:causal-example
npm run record:causal-example
npm run replay:causal-example
npm run verify:causal
npm run verify:causal-example
```

Common direct options are `--disable-world-will`, repeated `--cut-anchor <id>`, `--evaluation-budget <n>`, `--max-intervention-combinations <n>`, and `--max-internal-frontiers <n>`.

Replay stores the complete typed program and options, verifies that the stored run still hashes to `recordedDigest`, verifies that its program digest matches the stored program, re-executes, and compares the complete run plus selected continuation identities, unresolved alternatives, and emergence assessments. A modified stored run is `reexecution-drift`, even if its selection labels remain unchanged. This is deterministic same-program continuity, not a universal cross-version same-world theorem.
