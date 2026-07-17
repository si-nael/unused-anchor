# Anchored Causal World Reference

Applies to: `bubble-anchored-causal-world.v2`, `bubble-anchored-causal-program.v2`, `v0.5.2` through `v0.5.6`, and the active unversioned membrane candidate

Compatibility note: `v0.5.3` unfolds this once-per-realization contract through the separate [Persistent Causal World](persistent-causal-world.md) layer. `v0.5.5` adds opt-in endogenous internal branching while preserving the previous default. `v0.5.6` adds finite declared-world lifecycle and strict source lowering.

## Program Shape

An executable program contains:

- `world`: exact formal families, worlds, anchors, World Will, internal laws, emergence criteria, and causal order;
- `fieldInitializers`: one exact intensional query per field;
- `seaLaws`: exact non-negative positive/negative weights per world;
- `execution`: World-Will decision mode, internal-conflict mode, post-state hard constraints, anchor-identity queries, and exact intervention costs.

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
- optional irreversible `lifecycleEffects` containing `spawn-world(targetWorldId)` or `retire-self`.

The runtime repeatedly evaluates all unresolved guards. All true commuting laws form one causal frontier. An unresolved guard or exhausted frontier budget returns `underdetermined`.

Internal-law guard bindings are local to the law's own world. A cross-world binding is rejected until Bubble has a typed anchor-transfer contract; an ordinary predicate parameter cannot bypass the anchor membrane.

The active unversioned membrane candidate adds `anchorTransferIds` to an irreversible transfer-only source law. One typed transfer connects exact source and target fields through explicit ports on one two-world anchor. It copies the source snapshot only into an unprotected receiving `world-condition`, leaves exact negative-sea residue in the source world and positive-sea placement in the target world, and then allows a later receiving-world law to respond. It cannot directly manufacture protected receiving structure.

Transfer admission requires both endpoint worlds and ports to be active, the anchor not to be cut, exact source/target value kinds to agree, and anchor identity to hold both before and after a cloned proposed crossing. Failure or underdetermination prevents every target and sea mutation. If a latent endpoint is internally born first, the birth event is a direct transfer cause.

The first contract deliberately permits one transfer definition per program and reserves its source snapshot, target, and sea-accounting fields from competing local writers. General multi-transfer commutativity, streaming, transformations, conservation, global seas, and concurrent membrane composition remain open.

`execution.internalConflictMode` has two meanings:

- omitted or `underdetermined`: preserve the `v0.5.2` through `v0.5.4` contract; a non-commuting simultaneous frontier remains unresolved;
- `maximal-commuting-branches`: form the exact compatibility graph of enabled laws, enumerate every maximal commuting frontier, and continue every frontier as an autonomous world.

The branch derivation does not rank alternatives. Every branch records all enabled laws, its realized maximal frontier, excluded nonrealized laws, `derivation: maximal-commuting-frontier`, and `hostSelection: false`. Excluded alternatives are not executed later in that branch.

Two same-field effect sets commute when their order cannot change the result. Additive changes commute. Identical `set` projections commute. Zero additive effects are neutral. Unequal sets, or a meaningful additive change combined with a set on the same field, do not commute.

`maxInternalBranches` bounds generated branch states. If either the branch or frontier bound prevents exhaustive preservation, execution is `underdetermined`; the runtime never selects a prefix of enumerated branches.

## Active Lifecycle Candidate

A world may declare `initialExistence: latent`; omitted existence remains active for compatibility. A latent world's exact initial coordinates describe potential state, but its laws, objectives, constraints, interventions, active sea trace, and anchors remain dormant.

`spawn-world` may target only another declared latent world. All commuting same-target birth effects in one frontier become one `world-spawn` event with every source and causing law, derived lineage, and `hostSelection: false`. The spawn event causes the child's fields, so child laws cannot run before birth and cite birth when their guards first consume those fields.

`retire-self` may end only the law's own active world. Retirement preserves the exact final fields, state digest, local negative-sea coordinate, retained commit ids, lineage, and causal source. It stops later activity without deleting the world. Branch nonrealization and observation-induced local materialization are separate event classes.

Bounded `v0.5.6` actualizes a finite declared latent graph. A separate strict `causal bubble` source profile lowers explicit exact lifecycle declarations into this contract while leaving the original descriptive `.bubble` effect syntax unchanged. It does not generate new field schemas, law schemas, populations, typed cross-world transfer, or an open-ended multiverse.

## Anchors And World Will

An anchor has world or unresolved-relation endpoints, exact identity predicate families, and permitted intervention kinds. An intervention names one reached world, one anchor, one permitted kind, and exact field effects.

World Will may directly affect only `world-condition`, `boundary-state`, the two sea roles, or `viability`. It may never mutate a protected field. Candidate combinations are exhaustively evaluated up to `maxInterventionCombinations`; an incomplete search cannot select a convenient winner.

`maximize` and `minimize` score the exact weighted field. `stabilize` must declare an exact rational `targetValue` and scores the negative exact distance from that target. There is no implicit zero equilibrium.

Anchor identity is checked both before intervention eligibility and after the intervention plus internal causal closure. A candidate that destroys any declared anchor identity is inadmissible; an unresolved post-state identity makes the candidate `undetermined`.

An anchor with a latent or retired world endpoint is dormant, and an intervention targeting an inactive world is blocked. Objectives and hard constraints apply to active worlds. World Will has no lifecycle opcode: it may change an admitted condition through an active anchor, after which the world may respond through its own law.

The power-set cardinality is computed exactly with `bigint`, while candidate subsets are generated lazily only up to the configured bound. The runtime never allocates the full intervention power set before applying the bound.

When autonomous internal closure is plural, each branch receives its own objective baseline, anchor-identity evaluation, and intervention search. If one intervention group creates plural internal outcomes, World Will compares the group by the minimum exact net improvement across all outcomes. It may select an intervention group, but it cannot select one endogenous outcome inside that group. Every outcome of a selected group remains selected.

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
- `plural`: endogenous internal branches, plural World-Will ties, or both preserve more than one lawful selected continuation;
- `stable`: autonomous closure remains the best admissible state;
- `blocked`: World Will is enabled but every intervention route is blocked;
- `underdetermined`: formal evaluation, commutation, search, or deterministic selection is unresolved;
- `contradicted`: static validation or exact execution failed.

## Causal Order

Runs always report `kind: causal-partial-order` and `universalClock: false`. `evaluationOrder` and `evaluationFrontiers` make host execution reproducible but do not assign physical time. `causalEdges` carry semantic dependence. Explicit commits create committed history. In lifecycle-aware runs, durably retained birth or retirement provenance also creates a separate `world-lifecycle` history-arrow source.

## Commands

```text
npm run run:causal-example
npm run inspect:causal-example
npm run record:causal-example
npm run replay:causal-example
npm run verify:causal
npm run verify:causal-example
npm run verify:branching-example
npm run verify:lifecycle
npm run verify:lifecycle-example
npm run verify:lifecycle-language-example
npm run verify:membrane
npm run verify:membrane-example
```

Common direct options are `--disable-world-will`, repeated `--cut-anchor <id>`, `--evaluation-budget <n>`, `--max-intervention-combinations <n>`, `--max-internal-frontiers <n>`, and `--max-internal-branches <n>`.

Replay stores the complete typed program and options, verifies that the stored run still hashes to `recordedDigest`, verifies that its program digest matches the stored program, re-executes, and compares the complete run plus selected continuation identities, unresolved alternatives, emergence assessments, lifecycle state/events, and anchor-transfer events when present. A modified stored run is `reexecution-drift`, even if its selection labels remain unchanged. This is deterministic same-program continuity, not a universal cross-version same-world theorem.
