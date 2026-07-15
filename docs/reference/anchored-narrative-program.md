# Anchored Narrative Program Reference

Recorded: 2026-07-15  
Applies to: `bubble-anchored-narrative-program.v1` in `v0.5.1`

## Purpose

This program is the first bounded executable form in which a formal world field, internal protagonist action, positive and negative sea projection, anchor-mediated World Will, causal story consequence, and history record operate in one run. Natural-language prose may explain a program but never supplies missing runtime law.

The canonical complete input is [../../examples/anchored-garden.world.json](../../examples/anchored-garden.world.json).

## Program Shape

An executable program contains:

- `world`: typed worlds, field bindings, protagonists, goals, relationships, anchors, World Will, causal events, and `universalClock: false`
- `fieldInitializers`: exact intensional queries that initialize every field
- `seaLaws`: exact non-negative positive- and negative-sea weights per world
- `eventTransitions`: exact field effects and required additive inverses for reversible events
- `worldWillExecution`: deterministic or plural decision semantics, hard-constraint queries, anchor-identity queries, and exact intervention costs

Every identifier, field reference, formal family, event cause, intervention route, permission, transition, inverse, constraint, identity query, and cost is validated before execution.

## Exact State and Sea Coupling

Each world keeps authored or derived fields plus an internal intrinsic viability. After initialization and every executable event, local viability is recomputed as

\[
V = V_{intrinsic} + w_+ S_+ - w_- S_-.
\]

All current arithmetic is normalized exact rational arithmetic. A sea change therefore alters the world state itself and emits a causal `sea-coupling` trace entry; it is not merely a report score.

## Causal Closure and Agency

Non-intervention events whose declared causes have been realized close to a fixed point over the finite acyclic event graph. This supplies the autonomous baseline before any World-Will intervention is considered.

World Will may directly affect only fields with role `world-condition`, `positive-sea`, `negative-sea`, or `viability`. It cannot directly write `protagonist-choice`, `story-state`, protagonist state, or relationship state. Later protagonist actions and story consequences remain separate events with their own causes.

Disabling World Will or cutting an anchor removes the affected intervention while leaving causally independent protagonist events available.

## State-Bound Formal Predicates

Hard constraints and anchor-identity predicates are exact intensional queries. An optional `fieldParameters` list binds declared family parameters to current `worldId` and `fieldId` values. A parameter cannot be both literal and field-bound, and its formal value kind must match the bound field.

Anchor identity is evaluated against the initialized connected state. Hard constraints are evaluated after each candidate intervention and its causal consequences, so they constrain the resulting world rather than acting as static host flags.

## World-Will Decision

For every eligible intervention combination within the explicit bound, the runtime:

1. rejects non-commuting set effects
2. executes the intervention through its uncut, identity-valid anchor
3. closes resulting non-intervention causal events
4. evaluates post-state hard constraints
5. scores all declared objectives over the connected state
6. subtracts exact intervention cost
7. compares the result with the autonomous baseline

The finite combination frontier is exhaustive when `resourceUse.exhaustiveInterventionSearch` is true. If the frontier exceeds `maxInterventionCombinations`, the result is `underdetermined` and unsearched alternatives remain explicit.

Equal best candidates remain `underdetermined` in deterministic mode. In plural mode, every equal best continuation is selected and preserved. The host never breaks a tie invisibly.

## Result Status

- `realized`: one exact best continuation was selected
- `stable`: eligible interventions exist but none lawfully improves the global objective after cost
- `plural`: authored plural semantics preserves every equal best continuation
- `underdetermined`: finite evidence or resource bounds cannot justify one outcome
- `blocked`: World Will is disabled or every intervention route is unavailable; autonomous story remains
- `contradicted`: program validation or exact execution fails

## Order and History

A continuation records four distinct structures:

- `causalEdges`: the world-level partial order implied by event causes
- `evaluationOrder`: deterministic host execution order, not world time
- `reversibleEventIds` and `irreversibleEventIds`: transition properties
- `historyCommits`: irreversible snapshots; only their presence creates a durable history arrow

Every run states `universalClock: false`.

## Inspection and Replay

Inspection exposes summary, decision evidence, continuations, and formal proof evidence. A replay record stores the exact program, execution options, complete run, and digest. Replay executes the stored program again and compares the new digest, selected continuation identifiers, and unresolved alternative identifiers.

`same-world-reexecution` means deterministic continuity for this exact program and runtime semantics. It is not a universal identity theorem across runtime versions or alternative implementations.

## CLI

```text
npx tsx apps/hatchery/run-narrative.ts <program.json> [output.json]
npx tsx apps/hatchery/inspect-narrative.ts <program.json> [output.json]
npx tsx apps/hatchery/record-narrative.ts <program.json> [output.json]
npx tsx apps/hatchery/replay-narrative.ts <record.json> [output.json]
```

Execution commands accept `--disable-world-will`, repeated `--cut-anchor <id>`, `--evaluation-budget <n>`, and `--max-intervention-combinations <n>`. Inspection also accepts `--section summary|decision|continuations|formal-evidence|report`.

The canonical end-to-end path is `npm run verify:narrative-example`.

## Bounded Release Frontier

This format does not yet provide persistent open-ended story execution, relationship-dependent affordance laws, global multi-world sea transport, cross-world anchor transfer, a complete identity calculus, cyclic/coinductive event structures, or lowering from authored `.bubble` syntax. These are preserved reopen obligations, not rejected ideas.
