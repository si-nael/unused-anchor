# Decision Log

## 2026-05-11

### D-001: Start with a formal micro-world, not graphics

Reason:

The central novelty is not rendering realism. It is whether a compact rule system can generate a world rich enough for embedded agents to infer laws and detect contradictions.

Consequence:

The first implementation should use a discrete graph or grid world with a clear event model.

### D-002: Make contradiction detection the primary objective

Reason:

This gives the project a crisp success criterion and cleanly unifies ideas 4 and 11.

Consequence:

Agent evaluation should prioritize law discovery, anomaly detection, and boundary inference.

### D-003: Treat emergence as a secondary layer

Reason:

Ideas 9 and 11 become much easier to study once a single-agent world model benchmark already works.

Consequence:

Multi-agent interaction should come after the base world kernel and observer agent are stable.

### D-004: Separate the final vision from the first executable system

Reason:

The long-term target is a large multiverse of bubble universes, but attempting to build that directly would blur the core research question.

Consequence:

Document the multiverse architecture now, but implement the first version as a small formal world with clean measurement.

### D-005: Use the bubble universe as the main composition unit

Reason:

It provides a natural boundary for local laws, world-specific histories, and controlled anomalies.

Consequence:

The eventual core model should include concepts such as Axiom Pack, World Will, World State, Agent Memory, and Boundary Protocol.

### D-006: Make the world will operational

Reason:

If the world will is only narrative flavor, it will not generate measurable behavior or meaningful contradiction patterns.

Consequence:

Treat the world will as a formal constraint, objective, or invariant that shapes world evolution and can be inferred or violated.

### D-007: Treat consistency as the deepest project layer

Reason:

The motivating question is not merely how to generate worlds, but whether rich artificial worlds can remain free of contradiction in a meaningful formal sense.

Consequence:

World generation, agent design, and evaluation should all be framed around consistency classes, contradiction modes, and observability limits.

### D-008: Separate formal contradiction from epistemic mismatch

Reason:

An agent can fail to explain observations because the world is inconsistent, because the agent's model class is too weak, or because the observation budget is too small.

Consequence:

The project must distinguish at least formal inconsistency, simulation inconsistency, and observer-relative model failure.

### D-009: Enforce research logging as an operating rule

Reason:

This project is concept-heavy and will drift quickly unless ideas, questions, hypotheses, and decisions are recorded separately and updated continuously.

Consequence:

Maintain dedicated logs for ideas, questions, hypotheses, decisions, and work, and update repository memory whenever a durable project fact changes.

### D-010: Model the world will as a latent governing law

Reason:

The world will becomes more powerful when it is not only lore or a visible control variable, but an implicit principle that governs which worlds are born, how they evolve, and when they disappear.

Consequence:

The architecture should allow world birth, persistence, transition, and collapse to be shaped by hidden global rules.

### D-011: Store the multiverse intensionally, not extensionally

Reason:

An unbounded or effectively infinite collection of bubble universes cannot be stored as full explicit state on a finite machine.

Consequence:

Represent the multiverse using generative rules, seeds, local patches, and observation histories; materialize only the causally relevant slice.

### D-012: Treat observation as a storage event

Reason:

Once an agent observes a region or world, that observation may need to become stable history rather than a freely regenerable possibility.

Consequence:

The persistence model should distinguish latent generable content from committed observed history.

### D-013: Use a bubble-first repository vocabulary

Reason:

Generic folders such as world, agents, and simulation are legible, but they understate the fact that bubble universes are the core composition unit of the project.

Consequence:

Prefer a repository vocabulary built around bubbles, cosmos, traces, and inspectors, while keeping each name operationally precise.

### D-014: Make dependency flow follow ontology boundaries

Reason:

If modules depend on each other arbitrarily, the distinction between world law, observation, agent belief, and inspection logic will collapse.

Consequence:

Adopt a dependency topology in which bubbles define local world semantics, traces mediate evidence, beings consume public interfaces, and inspectors analyze without becoming hidden mutation centers.

### D-015: Start with a dedicated world-definition DSL, not a full general-purpose language

Reason:

The project needs inspectability, static validation, replayability, and consistency-aware tooling more than it needs unrestricted expressiveness.

Consequence:

Design a constrained authoring language for world definitions and compile it into a normalized internal representation rather than exposing raw host-language code as the primary world format.

### D-016: Separate surface syntax from executable semantics

Reason:

If the authoring syntax and execution model are fused too early, the language will become hard to validate, transform, and reason about.

Consequence:

Use a three-layer language model: author-facing DSL, normalized IR, and runtime execution kernel.

### D-017: Interpret "express the inexpressible" as a layered representability goal

Reason:

Taken literally, no practical finite language can fully represent every genuinely uncomputable, undefinable, or semantically ungrounded object.

Consequence:

Define the ambition more precisely: the language should make it possible to describe, manipulate, and reason about structures that are inexpressible at a lower layer by using higher-order schemas, constraints, generators, placeholders, and reflective constructs.

### D-018: Higher-order expressiveness must remain inspectable

Reason:

If the language gains power only by smuggling arbitrary opaque behavior through meta-level escape hatches, the project loses the ability to validate, replay, and inspect worlds.

Consequence:

Any higher-order or reflective construct must lower into explicit IR nodes with declared semantics, obligations, or unknown markers rather than disappearing into host-language code.

### D-019: Allow semantic nondeterminism, but only as an explicit construct

Reason:

Nondeterminism is useful for modeling world birth, unresolved possibilities, observer-relative branching, anomaly injection, and latent choice, but hidden randomness destroys replay and analysis.

Consequence:

Represent nondeterministic choice as explicit language and IR nodes with branch identity, provenance, and replay semantics.

### D-020: Side effects must be authored and typed

Reason:

If world generation can cause arbitrary hidden side effects, the language becomes impossible to inspect and contradictions become uninterpretable.

Consequence:

Every world-generating construct that can change history, create branches, leak across membranes, consume budget, or commit observations must declare its effect surface explicitly.

### D-021: Keep one repository and run two workstreams inside it

Reason:

The research direction and the language direction are both central, but they still depend on the same ontology, IR, effect model, and runtime semantics.

Consequence:

Use one monorepo for now, with a clear internal split between research work and language work.

### D-022: Split repositories only after the semantic kernel stabilizes

Reason:

If the repository is split too early, the ontology of bubbles, effects, and runtime semantics will fork or become coupled through awkward cross-repo coordination.

Consequence:

Do not split the repository until the shared kernel, package boundaries, and release cadence are stable enough to evolve independently.

### D-023: Bootstrap the language in TypeScript first

Reason:

The project currently needs rapid iteration on syntax, IR, validation, and tooling more than it needs maximal runtime performance.

Consequence:

Implement the first Bubbles language kernel in TypeScript so parser, compiler, effect model, and tests can evolve quickly.

### D-024: Start with a narrow line-oriented surface syntax

Reason:

The first milestone is not expressive syntax design. It is proving the end-to-end path from authored world source to explicit IR and effect obligations.

Consequence:

Begin with a minimal syntax for `bubble`, `axiom`, `will`, `seed`, `observe`, and `effect`, then widen only after the IR contract is stable.

### D-025: Define an explicit v0.1 profile before widening the language

Reason:

Without a named profile and semantic acceptance rules, the project will keep accumulating ad hoc syntax and the language will remain a perpetual prototype.

Consequence:

Treat the current kernel as `bubbles.v0.1`, with a documented validation profile, typed diagnostics, and a stable compile path from source to IR.

### D-026: Centralize semantic checks in a compiler pipeline

Reason:

If parsing, lowering, CLI behavior, and validation each invent their own checks, development will stall under inconsistent assumptions.

Consequence:

Use one compile entrypoint that runs parse, lower, validate, and diagnostic formatting through a shared contract.

### D-027: Treat Bubble Language as a multiverse-generative language

Reason:

If the language is framed only as a small DSL for describing one world at a time, the implementation will optimize for configuration syntax rather than for bubble birth, branching, latent existence, and world-will-driven world creation.

Consequence:

Treat each bubble definition as a generative semantic unit that may imply other bubbles, not merely one explicit local world state. Future IR work should preserve bubble lifecycle mode, generative relations, and world-will participation rather than storing only flat declarations.

### D-028: Add effect provenance and generation summaries to Bubble IR

Reason:

If the IR stores only flat effect declarations, later runtime, inspection, and multiverse tooling will have no stable handle for tracing which declaration created an obligation or which declared effects imply branching or bubble birth.

Consequence:

Emit effect IDs and source lines in Bubble IR, let obligations refer back to their originating effect declarations, and derive a first-generation multiverse summary that captures realization mode, lifecycle hints, and bubble-generative relations.

### D-029: Model bubble hierarchy intensionally rather than by eager expansion

Reason:

If Bubble Language is meant to span open-ended world-of-world structure, any design that assumes the full hierarchy can be explicitly materialized will collapse under scale and will fail to represent latent families faithfully.

Consequence:

Treat hierarchical bubble structure as an intensional object. Favor generative addresses, ancestry-aware identifiers, latent family descriptors, and on-demand traversal over full expansion of descendant worlds.

### D-030: Hold Bubble Language to a research-grade quality and performance bar

Reason:

If the language is intended for serious research use, toy-grade semantics, unstable outputs, opaque traces, or avoidable performance collapse would directly undermine its value as an experimental instrument.

Consequence:

Design the language stack for reproducibility, typed and auditable outputs, stable IR contracts, benchmarkable performance, and predictable scaling on large latent multiverse structures.

### D-031: Prefer lineage-relative bubble addressing over cheap absolute localization

Reason:

If bubble identity collapses into a cheap absolute coordinate from an imagined infinite origin, the multiverse risks degenerating into a flat lookup space and agents or tooling gain shortcuts that bypass world-law, ancestry, and trace structure.

Consequence:

Use source-relative root addresses and lineage-relative derivation templates as the cheap operational model. Keep local replay, ancestry traversal, and adjacent bubble derivation tractable, while leaving exact global absolute localization outside the core cheap path.

### D-032: Promote realization and spawn intent into the surface language

Reason:

If realization mode and descendant-family birth stay purely inferred from effect declarations, the author cannot directly state whether branching is intended or which descendant family a spawn relation is meant to introduce.

Consequence:

Add a `realization` declaration so authorial determinism or nondeterminism is explicit, and add `spawn ... when ...` declarations so descendant families and local birth conditions lower directly into Bubble IR instead of remaining implicit.

### D-033: Build Bubble Language as a deployable language stack, not only a reference kernel

Reason:

If Bubble Language stops at an illustrative syntax, IR, and a few examples, it will remain a private prototype rather than a reusable tool for real projects. That would undercut both research reuse and external adoption.

Consequence:

Treat grammar specification, semantic specification, execution runtime, CLI and library tooling, example corpus, compatibility policy, and regression infrastructure as first-class deliverables rather than optional polish.

### D-034: Treat Bubble Language itself as one governing bubble

Reason:

If the language stack is treated as if it stood outside the bubble ontology, the architecture will gain hidden assumptions and lose the ability to reason about its own boundaries, invariants, and contradiction surface.

Consequence:

Model the language stack itself as one special bubble with its own axioms, membranes, compatibility boundaries, and failure modes. Favor controlled self-description over unrestricted self-execution.

### D-035: Use a staged meta layer for bubble-generated bubble artifacts

Reason:

If bubbles are allowed to generate further bubble-language artifacts through unrestricted same-stage evaluation, inspectability and semantic control will collapse quickly.

Consequence:

Start with a staged meta layer built around `quote`, `generator`, `reflect`, and `emit`. Require validation and provenance capture at the `emit` boundary, and treat unrestricted same-stage self-evaluation as out of scope.

### D-036: Introduce `bubbles.v0.2` as the first explicit meta profile

Reason:

The staged meta layer needs a visible contract boundary. Without a named profile, quoted artifacts, generators, bounded reflections, and emission requests would appear as ad hoc extensions rather than a stable language step.

Consequence:

Emit `version: "0.2.0"` and `profile: "bubbles.v0.2"` whenever a source file uses `quote`, `generator`, `reflect`, or `emit`, and lower those declarations into an explicit `bubble.meta` IR section.

### D-037: Use a non-classical world execution model rather than ordinary program execution as the primary semantic contract

Reason:

If Bubble Language inherits the same compile, run, build, input, and output model as an ordinary programming language, it will be forced toward explicit finite-state execution and will lose the core advantage of intensional world representation.

Consequence:

Treat compilation as semantic planning, execution as on-demand world materialization, build as world packaging, input as observation or perturbation, output as trace or materialized slice, and logic as constraint-and-causality propagation rather than only imperative instruction flow.

### D-038: Add a first planner and materializer runtime on top of Bubble IR

Reason:

The non-classical execution model needs an executable slice. Without a planner and materializer that consume Bubble IR and meta emissions, `emit` remains only a compile-time annotation and the runtime model stays rhetorical.

Consequence:

Introduce a semantic plan layer derived from compiled Bubble IR, and a materializer that activates emitted quotes or generators into descendant bubbles or reusable artifacts while capturing reflections, traces, and commit records.

### D-039: Add an inspector surface on top of plan and materialization outputs

Reason:

If the planner and materializer only emit raw JSON structures, the new runtime slice remains hard to query and difficult to use as a real inspection workflow.

Consequence:

Provide an inspection layer that summarizes plans, artifacts, commits, and trace events into a stable report surface, and expose it through a dedicated CLI command so users can inspect Bubble execution without manually traversing raw runtime output.
