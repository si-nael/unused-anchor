# Bubble Language v0.5 Self-Realization Profile

Date: 2026-07-15

Status: implemented baseline

## Purpose

`bubbles.v0.5` establishes the first vertical world flow in which a bubble carries explicit state, offers authored transformations, and lets its executable world will decide which lawful continuation is realized.

This is Phase 1 world work. It does not introduce embedded observers, agents, benchmark judges, or an external chooser. Those belong only after the bubble universe itself is sufficiently complete.

## Source Surface

The profile adds:

```bubbles
state phase = "latent"
transform Awaken reversible state phase from "latent" to "manifest" inverse Rest via observe
transform Rest reversible state phase from "manifest" to "latent" inverse Awaken via observe
```

and:

```bubbles
state memory = "open"
transform Seal irreversible state memory from "open" to "sealed" via commit
```

`state` declares a scalar world-state coordinate. `transform` declares a possible realization over one coordinate, its reversibility contract, and an optional authored effect consequence.

## World-Will Contract

Every `v0.5` bubble must use an executable `will` criterion. The runtime evaluates that criterion separately for each eligible projected continuation with these environment keys:

- `state.<name>`: projected state after the candidate
- `realization.name`
- `realization.kind`: `preserve` or `transform`
- `realization.reversibility`: `identity`, `reversible`, or `irreversible`
- `realization.ordering`: `none`, `causal`, or `committed-history`
- `realization.topology`: `single`, `branching`, or `terminal`
- `realization.identity`: `preserved`, `open`, or `released`
- `realization.effect`
- `realization.consequence`
- `realization.commitsHistory`
- `realization.opensLineage`
- `realization.terminal`

The world will is therefore an internal admissibility law over possibilities, not a host callback that directly mutates state.

## Selection Law

The runtime always includes an invariant `Preserve` candidate.

- no admitted candidate: `blocked`, or `underdetermined` if evaluation itself is unresolved
- one admitted invariant candidate: `stable`
- one admitted transform: `realized`
- multiple admitted candidates under deterministic realization: `underdetermined`; no external tie-breaker is invented
- multiple admitted candidates under nondeterministic realization: `plural`; every admitted continuation remains explicit
- a required eligible transform rejected by the will: `contradicted`

This makes “world will” operational while preserving genuine openness.

## Reversibility And Time

The runtime assumption is `no-universal-clock`.

That does not mean every world is frozen. It means Bubble does not force one global scalar time onto every world:

- invariant preservation has no introduced order
- a reversible transform creates causal order and must name an exact reciprocal inverse
- a non-commit irreversible transform may create causal order without durable history
- a selected `commit` transform creates `committed-history` order and therefore a history arrow
- branching and terminal topology are properties of continuations, not ticks on a universal clock

The current baseline distinguishes atemporal/stationary, reversible, causally ordered, branching, terminal, and history-committed cases. A general partial-order or cyclic-time calculus remains open for later `v0.5.x` work.

## Validation

The compiler enforces:

1. state and transformation names are unique
2. every transformation names a declared state
3. every `via` effect exists
4. reversible transforms name exact reciprocal inverses over the same state and values
5. reversible transforms cannot use structurally irreversible `commit`, `branch`, `spawn`, or `collapse` effects
6. irreversible transforms name an authored effect and cannot declare an inverse
7. `v0.5` world will is executable rather than quoted descriptive prose

## Runtime And Evidence

Planning emits `bubble-self-realization.v1`. Materialization emits:

- `self-realization-resolved` trace
- `self-realization` evidence
- effect-trace causal links to that evidence
- event-source attribution for selected realization
- a root history commit only when the selected consequence is `history-commit`
- a `self-realization` consistency claim

An explicit continuation resume may evaluate the next lawful realization. It must preserve bubble address, source-continuation provenance, and the authored state-variable set. It cannot select a candidate externally.

## Honest Boundary

This release is the first organic self-realization kernel, not the completed bubble universe. `v0.5.1` later proves an explicit agent-bearing connected seam, `v0.5.2` adds actor-neutral multi-frontier causal closure with generic emergence, `v0.5.3` adds bounded causal-configuration recurrence separated from monotone anchor history plus exact persistence evidence, completed bounded `v0.5.4` adds an authored-goal-free invariant viability set with causally regenerated plural response events, per-response memory dependence, distributed internal state, and an autonomy counterfactual, and completed bounded `v0.5.5` adds finite endogenous maximal-commuting branch execution with branch-local anchors, robust set-valued World Will, persistence, and replay. General coinductive/open-ended dynamics, deliberative agency, relations, narrative projection, concrete spawn/collapse artifacts, global sea dynamics, and a full identity/time calculus remain live work. External observer-agent and comparison work remains Phase 2.
