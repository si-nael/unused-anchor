# unused-anchor

## Project Seed

This repository starts from a research question:

Can an embedded AI agent, living inside a small procedural world with partial observation, infer that world's rules and detect contradictions under finite evidence?

It also starts from a stronger motivating belief:

Our world appears extraordinarily complex, yet it remains explainable without contradiction at least within the scope of our current best models. This motivates a sharper question for artificial worlds: must sufficiently rich virtual worlds eventually generate contradictions, or can a world be designed to remain globally coherent while still supporting complexity, history, and embedded intelligence?

The project combines four directions:

- Procedural world generation from compact rules instead of explicit full-state simulation.
- An AI companion that treats the world as real from the inside.
- Emergence through repeated interaction among simple agents.
- A small axiom-based world with a "world will," nondeterministic anomalies, and bubble universes.

## Working Thesis

Build a minimal world engine that generates reality from a compressed set of axioms, then place one or more AI agents inside that world with limited perception and memory. The agents should form beliefs, discover regularities, and identify contradictions or anomalies caused by hidden rule changes, boundary effects, or nondeterministic events.

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

1. Build a formal micro-world kernel with explicit axioms and partial observation.
2. Add a single embedded companion that learns and tests world laws.
3. Add an inspector that evaluates contradiction, consistency, and anomaly detection.
4. Expand to multi-agent interaction inside one world.
5. Compose multiple bubble universes with distinct world wills and narrative structures.
6. Study cross-world transfer, boundary effects, and multiverse-level contradictions.

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
- semantic planning and selective materialization
- sea-anchor ontology assessment with explicit source arrays and separated anchor state fields
- bounded consistency certificates and executable checks for `constraint`, `partial law`, `anchor identity`, and parseable world will
- bounded observation-collapse evidence, observation states, observation commit policy, and replay surfaces
- `v0.4.8` effect-trace causal links from authored effects to the concrete evidence records and descendant artifacts they explain
- `v0.4.9` evidence-bounded event-source attribution for internal world events, negative-sea pressure, anchor drift, positive-sea shifts, and honestly unresolved sources

Current stabilization commands:

1. `npm install`
2. `npm run verify`
3. `npm run verify:core`
4. `npm run verify:records`
5. `npm run verify:examples`
6. `npm run verify:collapse`
7. `npm run verify:replay`
8. `npm run verify:attribution`

Representative source examples:

- [examples/first-world.bubble](examples/first-world.bubble)
- [examples/meta-grove.bubble](examples/meta-grove.bubble)
- [examples/observatory-loop.bubble](examples/observatory-loop.bubble)
- [examples/collapse-threshold.bubble](examples/collapse-threshold.bubble)
- [examples/collapse-mirror.bubble](examples/collapse-mirror.bubble)
- [examples/attribution-crossroads.bubble](examples/attribution-crossroads.bubble)

Observation-collapse and event-source attribution are bounded runtime kernels in the completed `v0.4.9` line. They are not yet a general collapse solver, complete causal calculus, probabilistic replay model, or authored commit-policy language. The next version is `v0.5`; it should open one measurable research objective without erasing the still-open ideas and questions recorded in the repository.

## Repository Notes

- [docs/idea-log.md](docs/idea-log.md): raw ideas and project framing
- [docs/decision-log.md](docs/decision-log.md): decisions and rationale
- [docs/work-log.md](docs/work-log.md): progress log
- [docs/research/question-log.md](docs/research/question-log.md): open research questions and status
- [docs/research/hypothesis-log.md](docs/research/hypothesis-log.md): falsifiable hypotheses and test plans
- [docs/research/boundary-log.md](docs/research/boundary-log.md): observed language and runtime membrane failures
- [docs/architecture/v0.4.9-closure-plan.md](docs/architecture/v0.4.9-closure-plan.md): completed bounded convergence gate before `v0.5`
