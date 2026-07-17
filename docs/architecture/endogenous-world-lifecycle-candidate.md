# Endogenous World Lifecycle Candidate

Date: 2026-07-17

Status: completed technical precursor; released as bounded `v0.5.6`

## Why This Seam Comes Next

The causal kernel can already form actor-neutral structure, preserve it across causal closures, derive bounded teleonomic capacity, and realize finite endogenous branches. Its declared world set is still static, however. A `spawn` capability in the earlier Bubble IR does not yet mean that the causal-world kernel has created a world, and an authored `collapse` capability is not a world-retirement event.

This candidate connects one bounded dynamic-world seam before deliberative agency or Phase 2 observation: internal world law may actualize a declared latent Bubble, and an active Bubble may terminate its own activity without the host deleting its state or choosing a replacement.

The release identifier was deliberately unset during candidate work. After the complete technical, language, evidence-density, and repository gates passed, the author selected `v0.5.6`; the final boundary is [v0.5.6 Endogenous World Lifecycle](v0.5.6-endogenous-world-lifecycle.md).

## Three Transitions That Must Remain Different

1. **Observation-induced materialization** makes a latent region inside one Bubble concrete under the bounded observation kernel. It does not create a new causal-world identity.
2. **Branch nonrealization** means one retained law event did not occur in one endogenous branch. A world that remains latent in that branch was never retired.
3. **World retirement** ends an already active Bubble. Its final state, lineage, local negative-sea value, and committed memory remain evidence rather than being deleted.

Using one `collapse` boolean for all three would lose ontology, causality, and replay identity.

## Bounded World Graph

Each declared causal world may begin as:

- `active`, the compatible default for every existing program; or
- `latent`, an intensional potential whose initialized coordinates cannot run internal laws, contribute World-Will objectives, receive interventions, or activate anchors before birth.

An irreversible internal law may carry lifecycle effects:

- `spawn-world(targetWorldId)` actualizes a declared latent target;
- `retire-self` terminates the law's own active world.

Lifecycle-only laws are valid. Reversible lifecycle laws, self-spawn, spawn of an initially active target, duplicate lifecycle transitions, missing targets, and effectless pseudo-laws are contradictions at validation.

This is not schema generation. The target world's field and law definitions are still finitely declared in the program. The candidate proves endogenous actualization of a latent world graph, not arbitrary population creation, runtime type synthesis, or an infinite multiverse.

Lifecycle phase is a finite acyclic order, not a clock:

`latent < active < retired`.

An initially active world can cross at most one lifecycle edge; an initially latent world can cross at most two. A finite program with `A` initially active and `L` initially latent worlds therefore has a per-continuation static bound `A + 2L` on lifecycle events. The runtime records this as `lifecycleTransitionBound`. It is a capacity proof, not elapsed time, and persistent continuation cannot reset the rank.

## Causal Birth

Birth is not a host insertion and not a World-Will selection.

When one causal frontier contains one or more commuting laws that spawn the same latent world, the runtime creates one spawn event with:

- every source world;
- every causing law event;
- a lineage identity derived from the target, parent lineages, causal branch lineage, and causes;
- `hostSelection: false`;
- a `latent -> active` phase transition.

The spawn event becomes the direct cause of the child's initialized fields. The child's internal guards can therefore run only on a later causal frontier and cite birth as their cause. Multiple compatible birth laws form one conjunctive multi-parent birth rather than duplicate worlds.

If a competing endogenous branch excludes the spawn law, the target remains latent and no retirement event is fabricated.

## Causal Retirement And Residue

Only an active world's own internal law may retire it in this bounded contract. World Will cannot directly set a phase, and another unanchored world cannot delete it.

Field effects, sea recomputation, and any explicit commit belonging to the retiring law complete before retirement is recorded. The retirement event then preserves:

- the final exact state digest;
- the final local negative-sea coordinate as residue evidence, without pretending that a global sea transport law already exists;
- every retained commit id for that world;
- the existing spawn lineage, if the world was born during execution;
- the causing internal-law events;
- `active -> retired` phase and `hostSelection: false`.

Retirement stops later internal laws and objectives but does not erase fields. Persistent closure resumes the world as retired and cannot silently respawn it.

## Anchors And World Will

An anchor with an inactive declared-world endpoint is dormant. It cannot carry an intervention and its identity predicate is not used as though the endpoint existed. Once every declared-world endpoint is active, ordinary anchor identity applies.

World-Will objectives and hard constraints range over active worlds. Interventions targeting latent or retired worlds are blocked. A world can still react by its own internal laws after an anchor-mediated condition change; World Will does not receive a lifecycle opcode.

This does not yet implement cross-world transfer. Lifecycle activates or deactivates existing anchor surfaces; it does not complete the anchor identity calculus or global sea dynamics.

Internal-law guards are therefore local to their own world. A law that reads another world's field without a typed anchor-transfer contract is rejected rather than being allowed to smuggle cross-world information through an ordinary parameter binding.

## Order Without A Universal Clock

Spawn and retirement are irreversible causal events, not scalar clock ticks. Their lineage and phase provenance survive persistent continuation, so they create a world-lifecycle history direction even when no explicit field commit exists. The run records `world-lifecycle` separately from `history-commit` as a history-arrow source.

Evaluation order remains host proof evidence only. World order remains a causal partial order with `universalClock: false`.

## Persistence, Inspection, And Replay

Serialized world state carries lifecycle phase and provenance only when lifecycle semantics are present, preserving compact legacy evidence. Persistent closure forwards lifecycle state beside exact field overrides. Configuration digests therefore distinguish latent, active, and retired worlds even when their field coordinates happen to match.

Inspection reports lifecycle counts for a singular relevant continuation. Stored replay compares lifecycle states and events in addition to full-run, program, selection, unresolved-alternative, and emergence evidence.

Counterfactual persistence evidence treats a lifecycle change as causally effective even when final field values are identical.

## Current Focused Evidence

The active implementation currently verifies that:

- a latent world's laws cannot execute before birth;
- the child's first state-bound law cites its spawn event as a cause;
- lineage, causal edges, inspection, and exact replay preserve birth;
- retirement retains state, local negative sea, lineage, and committed memory;
- lifecycle alone creates an irreversible history direction without universal time;
- branch nonrealization remains distinct from retirement;
- persistent continuation preserves retirement and prevents silent rebirth;
- malformed and reversible lifecycle contracts are rejected;
- the final release audit passes TypeScript checking, all 196 tests, both JSON and causal-language lifecycle run/inspection/record/replay cycles, and every legacy generated path.

Canonical evidence:

- `data/runs/generational-grove.run.json`
- `data/runs/generational-grove.inspect.json`
- `data/runs/generational-grove.replay.json`
- `data/runs/generational-grove.replayed.json`
- `examples/generational-seed.causal.bubble`
- `data/runs/generational-seed.run.json`
- `data/runs/generational-seed.inspect.json`
- `data/runs/generational-seed.replay.json`
- `data/runs/generational-seed.replayed.json`

The four lifecycle artifacts total fewer lines and bytes than the existing four `endogenous-branching-field` artifacts, so the candidate did not reproduce the duplicate-evidence expansion recorded in B-029.

This is implementation evidence for an active candidate, not release confirmation.

## Remaining Closure Gates

The candidate includes a strict `causal bubble` lowering path rather than reinterpreting the older descriptive spawn/collapse IR. The source profile declares exact worlds, fields, sea coupling, anchors, objectives, local guards, birth, retirement, inverses, and commits; the ordinary causal CLI compiles it into the same runtime and preserves run, inspection, record, and replay evidence. The source-lowered artifacts remain smaller than the richer JSON lifecycle fixture, so the new surface did not reproduce the plural evidence duplication failure. The bounded gate is now released as `v0.5.6`. It does not close dynamic schema generation, populations, global seas, cross-world transfer, agency, portable BIR, native execution, or whole-universe completion.
