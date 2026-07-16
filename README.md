# unused-anchor

## Project Seed

This repository starts from a research question:

Can a compactly authored bubble universe become and remain a coherent world through its own laws, world will, sea relations, anchor identity, and history semantics without an external chooser forcing its unfolding?

It also starts from a stronger motivating belief:

Our world appears extraordinarily complex, yet it remains explainable without contradiction at least within the scope of our current best models. This motivates a sharper question for artificial worlds: must sufficiently rich virtual worlds eventually generate contradictions, or can a world be designed to remain globally coherent while still supporting complexity, history, and embedded intelligence?

The project combines four directions, in a strict phase order:

- Procedural world generation from compact rules instead of explicit full-state simulation.
- Organic world self-realization through the bubble's own executable world will.
- Later, only after the world core is complete, embedded intelligence and emergent interaction.
- A small axiom-based world with a "world will," nondeterministic anomalies, and bubble universes.

## Working Thesis

Build a minimal world engine that generates reality from compressed axioms and lets each bubble determine lawful continuations through its own world will. Complete the observer-independent world core first. Embedded agents with limited perception and memory are a later Phase 2 research layer, not a prerequisite for worldhood.

## Long-Range Vision

The end state is larger than a single simulated world.

The project should eventually support a multiverse of bubble universes, where each world has its own:

- axiom set or local physics
- "world will" as an invariant, optimization pressure, or governing objective
- story logic, history, and social structure
- agents with memory, belief, and communication
- boundaries that can isolate or connect it to other worlds

At large scale, bubble universes should be able to appear, evolve, merge, decay, and disappear without requiring the system to materialize the full multiverse at once. The world will does not need to appear as an explicit narrated object. It can act as a latent law that shapes world birth, persistence, transition, and collapse.

The interesting part is not only to generate many worlds. It is to let embedded agents treat their world as real, then study whether they can infer laws, detect contradictions, and notice that they may live near a boundary, anomaly, or cross-world inconsistency.

## Why This Is Interesting

- It turns philosophy-of-world questions into a measurable engineering problem.
- It gives a controlled testbed for scientific discovery by AI.
- It connects procedural generation, simulation, emergence, epistemology, and anomaly detection.
- It creates a clear bridge to finite-observation judgment problems.

## Foundational Research Program

The deepest layer of the project is not only world generation. It is the study of consistency.

1. Define classes of artificial worlds that can remain contradiction-free.
2. Characterize where contradictions arise: axioms, composition boundaries, resource limits, observation interfaces, or learned models.
3. Train embedded agents to distinguish ordinary uncertainty from genuine inconsistency.
4. Test whether those learned inspection skills transfer to scientific reasoning about our own world.

## Staged Build Strategy

The final ambition can be large, but the first executable system should stay small.

1. Complete a formal bubble-world kernel with explicit axioms, state, boundary, world will, sea relations, anchor identity, lawful transformation, and history.
2. Connect autonomous continuation, lineage, collapse, replay, and finite representation until the bubble universe operates coherently as one world system.
3. Only then add an embedded companion that learns and tests world laws.
4. Add observer-facing consistency and anomaly benchmarks.
5. Expand to multi-agent interaction and cross-world research.

## Persistence Principle

Potentially unbounded world collections should not be stored as explicit full state.

Instead, the system should store:

- generative rules and seeds
- world-local patches and irreversible events
- observation traces and agent memories
- compact summaries for inactive or distant regions

Worlds and subregions should be materialized only when queried, observed, or causally affected.

## First Practical Scope

1. Define a tiny discrete world on a graph or grid.
2. Express its laws as a compact axiom set.
3. Give agents only local observations.
4. Introduce bubble universes or local rule perturbations.
5. Measure whether agents can recover laws and detect inconsistencies.

## Repository Direction

An older AIPS repository plan remains useful as a reference model for future growth. The main idea to keep is the separation between world definitions, agent models, simulation, and contradiction inspection.

- [docs/vision/multiverse.md](docs/vision/multiverse.md): long-range product and research vision
- [docs/architecture/repository-plan.md](docs/architecture/repository-plan.md): staged repository layout inspired by the discarded AIPS plan
- [docs/architecture/repo-strategy.md](docs/architecture/repo-strategy.md): recommendation for running research and language work in one repository without losing separation
- [docs/architecture/persistence-model.md](docs/architecture/persistence-model.md): how to represent many or unbounded bubble universes without explicit full storage
- [docs/research/foundation.md](docs/research/foundation.md): core consistency problem and formal framing
- [docs/project-memory.md](docs/project-memory.md): durable cross-session vocabulary, boundaries, and release discipline
- [docs/research/idea-implementation-map.md](docs/research/idea-implementation-map.md): idea and question traceability into specifications, code, evidence, and next milestones
- [docs/process/research-ops.md](docs/process/research-ops.md): rules for maintaining logs, ideas, questions, and hypotheses

## Current Operating Model

For now, this project should stay in one repository.

Inside that repository, run two coordinated workstreams:

1. research: world theory, contradiction studies, experiments, scenarios, and evaluation
2. language: Bubbles DSL, IR, effect system, compiler path, and tooling

They should share one semantic kernel rather than drifting into parallel definitions of the same ontology.

Repository splitting should happen only after the shared kernel, interfaces, and release cadence are stable enough to separate cleanly.

## Current Bubble Language Stack

The repository now contains an executable Bubble Language stack rather than only a parser bootstrap.

- `bubbles.v0.1`: core world declarations for `bubble`, `axiom`, `will`, `seed`, `observe`, and `effect`
- `bubbles.v0.2`: staged meta artifacts through `quote`, `generator`, `reflect`, and `emit`
- `bubbles.v0.3`: staged grammar artifacts and activation planning
- `bubbles.v0.4`: unresolved semantics, `anchor identity`, executable semantic fragments, and latent topology
- `bubbles.v0.5`: explicit state, reversible/irreversible transformations, and world-will-selected self-realization without a forced universal clock
- semantic planning and selective materialization
- sea-anchor ontology assessment with explicit source arrays and separated anchor state fields
- bounded consistency certificates and executable checks for `constraint`, `partial law`, `anchor identity`, and parseable world will
- bounded observation-collapse evidence, observation states, observation commit policy, and replay surfaces
- `v0.4.8` effect-trace causal links from authored effects to the concrete evidence records and descendant artifacts they explain
- `v0.4.9` evidence-bounded event-source attribution for internal world events, negative-sea pressure, anchor drift, positive-sea shifts, and honestly unresolved sources
- `v0.5.0` self-realization evidence, continuations, reciprocal reversibility, plural/underdetermined possibility preservation, and history arrows created only by selected commits
- completed bounded `v0.5.1`: exact intensional families plus autonomous protagonist action, sea-coupled viability, post-state constrained World Will, identity-checked anchor intervention, causal story/history, inspection, and deterministic same-program replay
- completed bounded `v0.5.2`: actor-neutral causal worlds whose exact state guards generate events and generic structure, protected internal fields, pre/post identity-checked anchored World-Will conditions, honest non-commuting and bounded-search underdetermination, exact layered traces, inspection, and integrity-checked emergence-preserving replay; `v0.5.1` remains a compatible agent-bearing specialization
- completed bounded `v0.5.3`: unlabeled recurrent components derived from conjunctive law dependencies, boundary-mediated causal hypercuts, causal-configuration recurrence separated from monotone anchor history, universally quantified memory/cut counterfactuals, recurrent-reference restoration after negative-sea deviation, outward influence, and integrity-checked persistence replay
- completed bounded `v0.5.4`: an authored-goal-free invariant viability kernel over recurrent components, causally regenerated plural response affordances, universal same-program response-event nonrealization, per-response semantic memory erasure, World-Will-disabled/all-anchors-cut autonomy evidence, canonical phase and independent distributed-channel worlds, no host affordance selector, and integrity-checked teleonomic replay
- completed bounded `v0.5.5`: opt-in endogenous causal branching derived from every maximal commuting frontier of simultaneously enabled laws, typed nonrealized alternatives and branch lineage, exhaustive branch budgets, branch-local anchor and World-Will evaluation, guaranteed-improvement comparison over set-valued outcomes, persistent-memory evidence across real autonomous branches, and integrity-checked plural replay

Current stabilization commands:

1. `npm install`
2. `npm run verify`
3. `npm run verify:core`
4. `npm run verify:records`
5. `npm run verify:intensional`
6. `npm run verify:narrative`
7. `npm run verify:narrative-example`
8. `npm run verify:causal`
9. `npm run verify:causal-example`
10. `npm run verify:branching-example`
11. `npm run verify:persistence`
12. `npm run verify:persistence-example`
13. `npm run verify:teleonomy`
14. `npm run verify:teleonomy-example`
15. `npm run verify:teleonomy-distributed-example`
16. `npm run verify:examples`
17. `npm run verify:collapse`
18. `npm run verify:replay`
19. `npm run verify:attribution`
20. `npm run verify:self-realization`

Representative source examples:

- [examples/first-world.bubble](examples/first-world.bubble)
- [examples/meta-grove.bubble](examples/meta-grove.bubble)
- [examples/observatory-loop.bubble](examples/observatory-loop.bubble)
- [examples/collapse-threshold.bubble](examples/collapse-threshold.bubble)
- [examples/collapse-mirror.bubble](examples/collapse-mirror.bubble)
- [examples/attribution-crossroads.bubble](examples/attribution-crossroads.bubble)
- [examples/self-held-garden.bubble](examples/self-held-garden.bubble)
- [examples/memory-seal.bubble](examples/memory-seal.bubble)
- [examples/anchored-garden.world.json](examples/anchored-garden.world.json)
- [examples/self-organizing-field.world.json](examples/self-organizing-field.world.json)
- [examples/self-maintaining-field.world.json](examples/self-maintaining-field.world.json)
- [examples/distributed-channel-field.world.json](examples/distributed-channel-field.world.json)
- [examples/endogenous-branching-field.world.json](examples/endogenous-branching-field.world.json)

`v0.5.0` supplies the first bounded vertical world flow. Completed `v0.5.1` proves one explicit agent-bearing narrative seam. Completed bounded `v0.5.2` generalizes the core so state-bound internal laws generate causal events and structure without requiring a protagonist or plot graph. Completed bounded `v0.5.3` derives one recurrent causal component and verifies boundary, identity, memory, repair, and influence across closures. Completed bounded `v0.5.4` derives finite invariant viability kernels and causally regenerated plural memory-dependent response events without authoring a goal or using a host selector. Completed bounded `v0.5.5` lets non-commuting internal law structure generate every maximal commuting autonomous world and carries those branches through anchors, World Will, persistence, inspection, and replay. This is endogenous causal plurality, not yet deliberative choice or agency. None of these versions is the completed Bubble universe: deliberative choice, agency, relations, narrative projection, populations, dynamic law/schema generation, concrete spawn/collapse execution, open-ended dynamics, global multi-world seas, cross-world anchors, and the full identity calculus remain open before Phase 2.

## Repository Notes

- [docs/idea-log.md](docs/idea-log.md): raw ideas and project framing
- [docs/decision-log.md](docs/decision-log.md): decisions and rationale
- [docs/work-log.md](docs/work-log.md): progress log
- [docs/research/question-log.md](docs/research/question-log.md): open research questions and status
- [docs/research/hypothesis-log.md](docs/research/hypothesis-log.md): falsifiable hypotheses and test plans
- [docs/research/boundary-log.md](docs/research/boundary-log.md): observed language and runtime membrane failures
- [docs/research/author-idea-corpus.md](docs/research/author-idea-corpus.md): immutable author quotations separated from engineering interpretation
- [docs/architecture/v0.5.1-anchored-narrative-world.md](docs/architecture/v0.5.1-anchored-narrative-world.md): completed bounded connected world architecture, evidence, and reopen frontier
- [docs/reference/anchored-narrative-program.md](docs/reference/anchored-narrative-program.md): executable program, state-bound constraints, decision semantics, CLI, and replay contract
- [docs/architecture/v0.5.2-generative-causal-universe.md](docs/architecture/v0.5.2-generative-causal-universe.md): actor-neutral generative correction, event formation, emergence, and compatibility boundary
- [docs/reference/anchored-causal-world.md](docs/reference/anchored-causal-world.md): causal IR, law closure, World-Will constraints, CLI, inspection, and replay contract
- [docs/architecture/v0.5.3-persistent-causal-structure.md](docs/architecture/v0.5.3-persistent-causal-structure.md): closure coalgebra, derived causal boundary, memory and maintenance counterfactuals, and non-closure boundary
- [docs/reference/persistent-causal-world.md](docs/reference/persistent-causal-world.md): persistence program, execution, inspection, CLI, and replay contract
- [docs/architecture/v0.5.4-endogenous-teleonomy.md](docs/architecture/v0.5.4-endogenous-teleonomy.md): invariant viability, organically differentiated necessary responses, autonomy counterfactual, and non-agency boundary
- [docs/architecture/v0.5.5-endogenous-causal-branching.md](docs/architecture/v0.5.5-endogenous-causal-branching.md): maximal-commuting-frontier derivation, plural autonomous continuations, set-valued World Will, branch budgets, persistence, and replay
- [docs/reference/teleonomic-causal-world.md](docs/reference/teleonomic-causal-world.md): teleonomic execution, same-program response-event nonrealization, organic discriminator provenance, inspection, CLI, and replay contract
- [docs/architecture/v0.4.9-closure-plan.md](docs/architecture/v0.4.9-closure-plan.md): completed bounded convergence gate before `v0.5`
- [docs/architecture/v0.5-self-realization-plan.md](docs/architecture/v0.5-self-realization-plan.md): implemented `v0.5` Phase 1 vertical world-flow boundary and `v0.5.1` continuation queue
