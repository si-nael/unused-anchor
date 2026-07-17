# Decision Log

## 2026-05-11

### D-001: Start with a formal micro-world, not graphics

Reason:

The central novelty is not rendering realism. It is whether a compact rule system can generate a world rich enough to preserve identity, lineage, and anchor structure under pressure.

Consequence:

The first implementation should use a discrete graph or grid world with a clear event model.

### D-002: Make independent bubble-world formation the primary objective

Reason:

This gives the project a crisp success criterion and keeps the language centered on world formation rather than on one downstream methodology.

Consequence:

Language and runtime design should prioritize world identity, boundary behavior, lineage, and anchor support.

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

It provides a natural boundary for local laws, world-specific histories, anchor placement, and sea exposure.

Consequence:

The eventual core model should include concepts such as Axiom Pack, World Will, World State, Anchor Point, Sea Exposure, and Boundary Protocol.

### D-006: Make the world will operational

Reason:

If the world will is only narrative flavor, it will not generate measurable behavior or meaningful world-shaping patterns.

Consequence:

Treat the world will as a formal constraint, objective, or invariant that shapes world evolution and can be inferred or violated.

### D-007: Treat world identity and boundary stability as the deepest project layer

Reason:

The motivating question is not merely how to generate worlds, but how rich artificial worlds remain identifiable, bounded, and placeable inside a larger field.

Consequence:

World generation, runtime design, and later evaluation should all be framed around identity classes, boundary modes, lineage structure, and observability limits.

### D-008: Separate anchor drift from observer underdetermination

Reason:

A system can fail to explain observations because the world has drifted, because the observer's model class is too weak, or because the observation budget is too small.

Consequence:

The project must distinguish at least anchor drift, boundary disturbance, and observer-relative model failure.

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

Nondeterminism is useful for modeling world birth, unresolved possibilities, observer-relative branching, boundary pressure, and latent choice, but hidden randomness destroys replay and analysis.

Consequence:

Represent nondeterministic choice as explicit language and IR nodes with branch identity, provenance, and replay semantics.

### D-020: Side effects must be authored and typed

Reason:

If world generation can cause arbitrary hidden side effects, the language becomes impossible to inspect and world behavior becomes uninterpretable.

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

If the language stack is treated as if it stood outside the bubble ontology, the architecture will gain hidden assumptions and lose the ability to reason about its own boundaries, invariants, and membrane surface.

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

### D-040: Bind inspector queries at the runtime report layer, not only at the CLI formatting layer

Reason:

If filtering happens only after the CLI has already selected a section, summary counts and report slices will drift out of sync and different outputs will answer slightly different questions for the same query.

Consequence:

Apply `emission`, `address`, and trace-kind filters inside the inspection runtime before section selection so summary, plan, artifacts, commits, and trace all stay aligned under one query contract.

### D-041: Persist materialized runs as replay records

Reason:

If every experiment query requires recompiling and re-materializing source bubbles, the runtime loses reproducibility and post-hoc analysis becomes coupled to the live execution path instead of to preserved experimental evidence.

Consequence:

Introduce a durable replay-record format that stores one materialization result together with its plan, artifacts, commits, and trace, and let later inspection queries operate against that stored record without rerunning the original bubble source.

### D-043: Raise observation and commit into an explicit evidence layer

Reason:

If observation and durable history remain implicit in raw trace and commit arrays, research queries still depend on post-hoc interpretation rather than on a stable semantic object dedicated to evidence.

Consequence:

Emit first-class evidence records that attach observation mode and durable history commitments to the relevant bubble and address scope, and expose those records through inspection and replay surfaces.

### D-044: Promote spawn conditions from opaque text into structured expression IR

Reason:

If `spawn ... when ...` remains only a raw string, the surface language has the shape of a condition but the compiler still cannot inspect, normalize, or later evaluate its internal structure.

Consequence:

Preserve quoted legacy condition text for compatibility, but allow unquoted `spawn ... when ...` clauses to parse into structured comparison and logical expression IR so the language has a real foothold for future condition semantics.

### D-045: Promote the first shared expression layer beyond spawn conditions

Reason:

If structured expressions remain trapped inside `spawn ... when ...`, the language gains one isolated parser trick rather than a reusable grammar layer that future statements can share.

Consequence:

Use one shared expression grammar for both spawn conditions and `emit` arguments. Keep the current runtime conservative by accepting only scalar literal or reference expressions for generator arguments until fuller expression evaluation semantics exist.

### D-046: Treat grammar generation as a staged meta-grammar problem, not as ambient parser mutation

Reason:

If Bubble is allowed to rewrite its own live grammar surface without explicit stage boundaries, the language may become novel but it will lose replayability, validation stability, and inspectable semantic contracts.

Consequence:

Allow bubbles to emit, transform, or constrain grammar artifacts, but require those artifacts to remain quoted, versioned, provenance-bearing, and separately activatable. Grammar generation should happen across explicit stage boundaries rather than through unrestricted same-stage mutation of the active parser.

### D-047: Introduce `bubbles.v0.3` as the first staged meta-grammar profile

Reason:

The staged meta-grammar direction needs a visible contract boundary. Without an explicit profile, grammar artifacts and activation requests would appear as ad hoc extensions rather than as a stable next step beyond `v0.2`.

Consequence:

Emit `version: "0.3.0"` and `profile: "bubbles.v0.3"` whenever a source file declares grammar artifacts or grammar-activation requests. Lower those declarations into explicit `bubble.meta.grammars` and `bubble.meta.grammarActivations` structures while keeping activation staged rather than same-stage executable.

### D-048: Make grammar artifacts structured and grammar activation queryable

Reason:

If grammar artifacts remain only raw source strings, and grammar activations appear only as inert declarations, `v0.3` gains syntax without gaining enough semantic surface for inspection, replay, or later activation tooling.

Consequence:

Parse grammar artifacts into explicit structured IR forms, starting with `profile <Name> extends <BaseProfile>`, and surface grammar activations as staged plan entries and trace events that inspection and replay tooling can query directly.

### D-049: Bubble must earn its existence by unique semantic capability

Reason:

If Bubble is allowed to succeed merely by running a few examples or by restating host-language behavior in a specialized syntax, the project will accumulate language surface without proving that the language is necessary.

Consequence:

Judge Bubble against a stronger bar: it must support bubble-generative world construction, inspection, replay, sea-anchor analysis, and higher-order language work in ways that ordinary host-language embeddings do not preserve cleanly. Prefer features that increase this unique semantic leverage over features that only widen syntax.

### D-050: Treat the Bubble Language bubble itself as a research task

Reason:

If the language stack is treated only as implementation scaffolding, the project will miss one of its most important subjects: how a governing bubble describing other bubbles remains coherent, inspectable, and self-descriptive without collapsing into opaque self-execution.

Consequence:

Treat language design, compatibility boundaries, membrane surfaces, self-reference limits, and semantic membranes inside Bubble Language as first-class research work rather than as secondary plumbing. Evaluate language changes partly by what they reveal about the Bubble Language bubble itself.

### D-051: Give `activate grammar` a real compatibility contract before runtime activation

Reason:

If grammar activation remains only a named staged request with no static compatibility rules, `v0.3` still looks more like a reference sketch than a usable language boundary.

Consequence:

Require profile-extension grammars to extend a built-in or locally declared base profile, and require explicit activation targets to match the grammar artifact's declared profile name. If no explicit target is provided, resolve the staged activation to the grammar artifact's declared profile.

### D-052: Keep Bubble universal and push project-specific research logic outward

Reason:

If the Bubble core absorbs assumptions that belong only to the bubble-universe AI research agenda, the language will become narrower, harder to reuse, and less credible as a general bubble substrate.

Consequence:

Keep universal semantics such as ontology, IR, effect typing, addressing, planning, materialization, inspection, replay, and staged meta-language boundaries inside Bubble itself. Implement benchmark worlds, agent observation or action loops, evaluator logic, boundary labels, and experiment orchestration as separate research-specific layers on top of that core.

### D-042: Treat bubble as the universal semantic unit of the architecture

Reason:

If bubbles are only one object family among many unrelated architectural primitives, the project will drift toward a split ontology in which the interesting semantics live in bubbles while execution, tooling, and evidence live in special-case machinery outside the model.

Consequence:

Model authored worlds, descendants, language machinery, and preserved evidence as bubbles or explicit relations among bubbles whenever practical. Treat non-bubble machinery as suspect until it is justified clearly.

### D-053: Adopt the negative-sea, positive-sea, and anchor-point model as the current outer-world ontology

Reason:

If Bubble treats worlds only as isolated bubbles with internal laws, it will remain weak at describing instability, lineage, outside residue, identity drift, and the difference between internal world events and boundary disturbance.

Consequence:

Treat each bubble universe as an independent world suspended between a negative sea and a positive sea, with an anchor point that keeps the world identifiable as itself. Use the negative sea to frame erosion, leakage, residue, and external pressure; use the positive sea to frame lineage, placement, continuity, and stabilization; use the anchor point to frame identity, trusted history, and replay-preserving fixation. Keep this ontology ahead of surface syntax and only promote it into Bubble core where the semantics can be inspected, replayed, and operationalized clearly.

Treat authored worlds, descendant structures, governing language machinery, and preserved experiment evidence as bubbles or explicit relations among bubbles whenever possible. Prefer bubble-scoped semantics over global special cases, and treat abstractions that cannot be located in the bubble ontology as design smells unless they are explicitly justified.

### D-054: Prioritize a semantic specification before widening Bubble surface syntax

Reason:

If Bubble keeps adding constructs without a sharper semantic contract, the repository may accumulate features without proving what each construct guarantees about worldhood, materialization, lineage, history, boundary, or replay identity.

Consequence:

Create and maintain a Bubble Semantic Specification that defines the normative meaning of core constructs, lifecycle states, composition targets, partial or unknown world objects, effect roles, and anchor identity semantics. Prefer semantic clarification over new syntax until that contract is stable enough to guide future profiles.

### D-055: Treat bounded consistency certificates as part of Bubble core semantics

Reason:

If Bubble can generate and replay worlds but cannot leave a machine-readable record of which semantic claims were actually discharged, contradicted, or left open, it will remain weak at proving why one generated world counts as a world under its own declared contract.

Consequence:

Attach a bounded consistency certificate to the semantic plan and preserve it through inspection and replay. The certificate should stay relative to the declared profile and current executable semantics, use explicit `certified | contradicted | undetermined` claim states, and avoid pretending to prove more than the current model can actually justify.

### D-056: Use `v0.4` to expose unresolved semantics before adding solvers or full composition syntax

Reason:

If Bubble claims to model partially knowable multiverses but its authored source still cannot name unknown values, partial laws, hidden regions, latent bubbles, or unresolved constraints, the language will keep collapsing back toward an explicit state DSL.

Consequence:

Introduce a `bubbles.v0.4` profile that lets source preserve unresolved semantic objects directly and lowers them into IR and proof basis. Pair that with a first bundle-plan surface in runtime planning so composition becomes explicit at the package level before same-file multi-bubble syntax or cross-file imports exist.

### D-057: Open one executable semantic path before widening the unresolved surface further

Reason:

If Bubble keeps unresolved semantics and anchor identity entirely descriptive, proof will remain trapped at structural diagnostics and inferred scoring even after `v0.4` makes those objects visible in source and IR.

Consequence:

Use the shared expression grammar to make exactly two authored surfaces executable first: `constraint` and `anchor identity`. Lower executable constraints into IR and evaluate them against the current semantic environment so `internal-law-consistency` can be certified or contradicted locally. Lower one explicit `anchor identity` declaration into IR and let it tighten or contradict inferred anchor and replay claims before any broader law solver, partial-law algebra, or richer anchor language is added.

### D-058: Preserve semantic layer shape in summary views, not only in detailed sections

Reason:

If semantic queries narrow inspection or replay output but the summary header only reports emissions, grammar counts, or one flattened scalar, Bubble will quietly demote executable law, anchor, and contradiction structure back into auxiliary detail. That would make the language look like a conventional tool with a semantic appendix instead of a language whose layers remain visible even in compressed views.

Consequence:

When inspection or replay is narrowed by semantic subject or semantic kind, the summary layer should also preserve the selected executable semantic slice through count, kind, and status-distribution fields. Bubble summaries should stay compressed, but they must not erase which semantic layer remains active or whether it is satisfied, contradicted, or underdetermined.

### D-059: Close `v0.4.1` as a stabilization boundary, not as a feature-expansion window

Reason:

`v0.4` already opened unresolved semantics, executable constraints, explicit anchor identity, minimal executable partial-law checking, proof preservation, and inspect/replay semantic query surfaces. If `v0.4.1` keeps absorbing adjacent ideas, it will stop behaving like a closure step and turn into another moving target.

Consequence:

Treat `v0.4.1` as a scope-freeze milestone. Its purpose is to close and stabilize the current semantic stack, not to widen the language again. From this point, changes that belong inside `v0.4.1` should be limited to correctness repairs, report-shape consistency, verification hardening, and documentation needed to make the current surface legible. New semantic classes, richer solvers, stochastic world semantics, cross-file composition, and other expansion work should wait for a later profile or milestone.

### D-060: Semantic query must preserve verdict polarity, not only identity and kind

Reason:

If inspection can narrow executable semantics only by subject identity or semantic class, then contradiction and underdetermination remain second-order facts that users must rediscover by manual scanning. Bubble would still expose semantic objects, but it would fail to make their current necessity boundary directly queryable.

Consequence:

Expose executable semantic status itself as a first-class query axis. Inspection and replay should let users isolate `satisfied`, `violated`, or `undetermined` semantic slices directly, and compressed summary views should preserve the resulting status distribution instead of flattening it away.

### D-061: Proof query must preserve bounded-certificate shape, not only raw claim rows

Reason:

If inspection can filter proof output only as a bag of matching claims while leaving verdicts and summary headers tied to the full unfiltered certificate, Bubble will present contradictory local views: the visible claim slice will say one thing while the visible verdict still describes another world. That breaks the idea that a query exposes one coherent bounded semantic object.

Consequence:

Expose proof claim id, proof family, and proof claim status as first-class query axes. When proof is narrowed, both the proof section and the summary layer should recompute their bounded-certificate shape from the selected claim slice, including verdict and claim-status distribution, instead of preserving stale global values.

### D-062: Separate declared history support from materialized history evidence

Reason:

If Bubble uses one field to mean both "the source declared durable history support" and "this run actually produced history evidence," then ontology and proof will quietly overstate what has really been witnessed. That would blur the boundary between declared semantic intent and run-grounded evidence.

Consequence:

Replace the overloaded history bit with at least two explicit states: declaration-level history support and run-level materialized history evidence. Plan ontology may remain declaration-based, but inspection and replay should expose the runtime distinction whenever concrete history evidence exists.

### D-063: Split authored effects into role projections inside IR before changing syntax

Reason:

One authored `effect` currently carries declaration, obligation, permission, pressure, event, and trace consequences at once. If Bubble leaves those roles collapsed inside one flat list, future semantics will keep leaking between unrelated concerns and the effect model will stay harder to reason about than it needs to be.

Consequence:

Keep the current surface syntax for now, but lower authored effects into one explicit IR role projection that separates declarations, obligations, permissions, pressures, events, and declaration traces. Runtime layers may continue using the legacy `effects` list while newer tooling migrates toward the split role model.

### D-064: Observation-induced materialization must begin from a narrow transition contract, not from new syntax

Reason:

If Bubble tries to implement observation-induced materialization by adding surface syntax or runtime heuristics before a minimal transition model is fixed, the project will blur together latent possibility, first observation, committed history, and replay identity. That would expand the language while weakening its most important guarantees.

Consequence:

Before any code or syntax widening for this branch, define one minimal semantic contract covering `latent -> observed -> committed` transitions, one inspectable perturb-mixing rule, one collapse-evidence shape, and one replay judgment that distinguishes revisiting committed history from regenerating latent possibility. The first runnable slice should stay local to one micro-world and must not introduce hidden randomness, probability-cloud replay semantics, or generalized observer-dependent behavior across the whole language.

### D-065: Adopt a staged observation-collapse roadmap inside Bubble core

Reason:

If observation-induced materialization remains only a research note, the repository will oscillate between abstract ambition and unrelated local implementation steps. That would make it too easy either to postpone the idea indefinitely or to smuggle it into the runtime without one clear contract.

Consequence:

Treat observation-collapse as one staged next-core roadmap. Keep current Bubble core grounded in explicit effects, bounded proof, replay, and latent-topology drafts. Move next through collapse records, one local observation-triggered materialization kernel, replay hardening, and only then any new author-facing syntax. Keep probabilistic clouds, distributional replay, generalized observer-dependent semantics, and hidden randomness explicitly deferred.

### D-066: Keep the single-region commit rule runtime-bounded until a second authored commit policy is semantically necessary

Reason:

The current single-region commit rule exists to stabilize one benchmark transition, not to expose a mature policy family. Bubble still has only one bounded local collapse kernel, one benchmark-specific commit path, and no settled proof contract for competing authored commit policies. Promoting that rule into author-facing policy syntax now would freeze a policy surface before the runtime alternatives and proof consequences are known.

Consequence:

Keep the current single-region commit rule as a bounded runtime benchmark rule for now. Do not add authored commit-policy syntax or policy IR yet. Revisit authored policy only after Bubble has at least one additional semantically distinct commit path or one proof distinction that cannot be expressed cleanly through the current effect and runtime layers.

### D-067: Elevate observation-state querying, but keep sibling-latency comparison as a composed report view for now

Reason:

`observationState` is already a first-class runtime object with stable identity and transition phases, so inspection and replay need direct query axes for it. By contrast, sibling-latency comparison still depends on an evolving combination of committed root observation history plus descendant latent-topology summaries; freezing that into a dedicated diff primitive now would hard-code one comparison vocabulary before enough comparison shapes exist.

Consequence:

Expose observation-state id and observation-state phase as first-class inspection and replay query axes. Keep sibling-latency comparison composed from `observationStates` plus artifact latent-topology summaries until repeated use shows one stable diff/report abstraction is actually needed.

### D-068: A second runtime-bounded commit path still does not justify authored commit-policy syntax yet

Reason:

Bubble now has two semantically distinct runtime-bounded commit behaviors: the original single observed local-state commit path and a mixed local-target path that commits one hidden-region observation while leaving sibling latent-bubble observation states history-open. That is enough to compare replay and consistency behavior across two commit shapes, but it is still not enough to freeze author-facing commit syntax because both paths currently share one local kernel and one runtime target-selection rule.

Consequence:

Keep both commit behaviors runtime-bounded for now. Use the new mixed path to determine whether authored commit policy needs explicit target selection, sibling-open clauses, or a stronger proof vocabulary. Do not add authored commit-policy syntax or commit-policy IR until those distinctions stop moving.

### D-069: Standardize commit-path differences in proof vocabulary before widening commit syntax

Reason:

After adding the mixed local-target commit path, the smallest stable distinction Bubble actually needed was not new authored syntax. It was an explicit proof vocabulary that distinguishes fully committed observation history from partially committed observation history while preserving the per-record `committed` versus `history-open` evidence. That difference is sufficient for replay and internal-consistency reasoning today, while authored target-selection or sibling-open syntax would still be premature.

Consequence:

Normalize runtime proof around explicit observation-history shape basis terms such as `observed-history-shape-fully-committed` and `observed-history-shape-partially-committed`. Keep authored commit policy deferred until Bubble needs one author-controlled choice that cannot be expressed by the current bounded runtime target-selection rule plus this proof vocabulary.

### D-070: Introduce a hidden runtime observation-commit policy object before any authored commit syntax

Reason:

Bubble now needs a stable place to describe how one bounded runtime rule picks commit targets, defers siblings, and projects a resulting observation-history shape. That control surface is real enough for planning, inspection, replay, and future authored-policy design, but still too unstable to expose as source syntax.

Consequence:

Expose a serializable plan-level `observationCommitPolicy` object with target-selection rule, selected targets, deferred targets, and projected history shape. Use that object as the runtime decision surface for local observation commits. Keep it hidden from authored Bubble syntax until authors demonstrably need to steer those choices themselves.

## 2026-06-01

### D-071: Elevate observation-commit policy into an inspectable runtime report surface before authoring syntax

Reason:

If commit-target selection remains visible only inside hidden plan internals or indirect proof basis tags, Bubble cannot treat that behavior as inspectable world law. Before author-facing syntax exists, the runtime still needs one stable public surface where inspectors and replay tools can ask which bounded policy rule applied and which history shape it projected.

Consequence:

Expose `observationCommitPolicy` as a first-class inspect/replay section with direct query axes for policy selection rule and projected observation-history shape. Keep it a runtime report surface, not authored syntax, until the language needs author-controlled target steering.

### D-072: Add a runtime comparison and override layer before widening authored commit syntax

Reason:

Bubble now needs two more capabilities before any source-level commit-policy syntax would be justified: one stable comparison surface that says how the current world law differs from a forced alternative, and one hidden runtime override path that lets tools steer that law experimentally without pretending the language has already committed to authored commit syntax.

Consequence:

Expose `observationCommitPolicyComparison` as a first-class inspect/replay section containing baseline policy, effective policy, override metadata, and explicit delta kinds. Allow `materialize`, `inspect`, and `record` to accept a hidden runtime observation-policy override so Bubble can test alternate local commit law shapes through tooling/runtime options only, not source syntax.

### D-073: Make sea-anchor condition a causal input to local observation form, not only an explanatory tag

Reason:

Bubble only genuinely departs from classical procedural lookup flow when observation-induced local form is shaped by same-world ontological condition, not merely annotated by it afterward. If anchor strength, negative-sea pressure, and positive-sea support stay passive report fields, the runtime still computes local form too much like an old region-kind-plus-policy switch.

Consequence:

Upgrade local observation materialization so it derives a structured `stateStructure` from anchor binding, sea balance, membrane condition, nearby history coupling, and worldhood condition, and let realized local form depend on that structure. Preserve this as runtime law first through `inspect`/`replay` before widening source syntax.

### D-074: Separate minimum authored shape from stronger worldhood certification

Reason:

The old `minimum-worldhood` claim had drifted into over-certification. It was certifying bubbles from `axiom`, `worldWill`, `seed`, and `effect` alone even though the semantic specification defines independent worldhood more strongly through local law basis, boundary, lineage or placement, and an anchor criterion. That shortcut also let `anchor-identity` and `replay-identity` certify too early from inferred ontology support alone.

Consequence:

Split proof into a weaker `minimum-authored-shape` claim and a stronger `worldhood-roles-present` claim. Keep `anchor-identity` and `replay-identity` `undetermined` when same-world continuity is only inferred from ontology and no authored `anchor identity` criterion exists. Use certification only when the stronger authored basis is actually present.

### D-075: Preserve the sea-anchor triad, but separate inferred support from authored criterion and runtime evidence

Reason:

Bubble's negative sea, positive sea, and anchor are still the right core ontology, but the current runtime had started to compress too many different meanings into one layer. Negative sea was only a coarse pressure tag, positive sea only a coarse support tag, and anchor strength mixed inferred stability, authored same-world criteria, and runtime history evidence. That made the triad less honest precisely where Bubble most needs it to stay operational.

Consequence:

Keep `negativeSea`, `positiveSea`, and `anchorPoint` as first-class ontology objects. Enrich negative and positive seas with explicit `pressureSources` and `supportSources`. Treat `anchorPoint.strength` as inferred support only, and expose authored same-world criterion status, runtime materialized evidence sources, and derived identity status as separate fields instead of folding them back into one score or signal list.

### D-076: Boundary must become a first-class IR object before further worldhood hardening

Reason:

Boundary is still the largest remaining core gap. Bubble currently recovers too much boundary meaning indirectly from effect scopes, relation scopes, executable references such as `boundary.*`, and latent-topology observation or commit tags. That is enough for bounded runtime heuristics, but not enough for a stable worldhood contract.

Consequence:

Do not leave boundary as a permanently inferred runtime concept. The next core IR widening should add an explicit boundary object that records observation, commit, membrane, and other worldhood-relevant boundary surfaces as first-class Bubble IR. Negative or positive source kinds should be able to cite that IR directly rather than staying purely runtime-derived forever.

### D-077: Promote world will from legacy text storage toward executable criterion or pressure semantics

Reason:

`worldWill` still survives in Bubble IR mostly as preserved text plus one coarse `generation.worldWillMode` flag. That is enough to keep authored intent, but not enough to let world will participate honestly in proof, pressure, or executable law checks.

Consequence:

Keep the current text field for compatibility, but treat it as legacy storage. The next world-will widening should add a criterion or pressure-oriented IR surface with legacy-text fallback, so authored world will can become executable when parseable and remain explicitly non-executable when still descriptive.

### D-078: Move observation materialization law out of hard-coded runtime explanation and into a minimal law surface

Reason:

The current observation materialization kernel is now semantically meaningful, but its actual law still lives mainly as runtime branching logic and descriptive report text. That makes it harder to inspect as Bubble law and too easy to confuse current bounded runtime behavior with settled authored semantics.

Consequence:

Before inventing source syntax for observation law, extract the current bounded kernel into a minimal IR or plan-level law object that names the determinants, state-structure derivation, and realized-form mapping explicitly. Runtime materialization should consume that law surface rather than keeping the whole rule only as code and explanation strings.

### D-079: Promote sea-source provenance into explicit Bubble IR semantics

Reason:

Boundary, executable world will, and observation-materialization law now all have explicit surfaces, but negative and positive sea source kinds were still being synthesized as local runtime tags inside ontology. That left one of the main worldhood inputs with weaker provenance than the surrounding semantic model.

Consequence:

Compiled bubbles should now carry an explicit `bubble.seaSemantics` projection. Negative and positive source kinds remain derived from authored address, generation, boundary, effect, and staged-emission structure, but the source categories and their contribution weights are now owned by IR instead of being invented only at runtime. Ontology should consume that projection rather than reclassifying source kinds locally.

### D-080: Keep quoted world will as explicit descriptive text, not a forced criterion

Reason:

Quoted or otherwise unparseable `will` declarations preserve authored pressure or orientation, but they do not yet justify executable truth conditions. Treating them as mere legacy residue hides authored intent, while coercing them into criterion form would pretend to executability that the source did not actually provide.

Consequence:

Bubble should keep two explicit authored world-will forms: `criterion` for parseable executable expressions and `descriptive-text` for quoted or otherwise non-executable declarations. The compatibility `worldWill` string remains, but `bubble.worldWillDeclaration` now records the authored mode directly, while `bubble.worldWillCriterion` remains reserved for executable semantics only.

### D-081: Keep worldhood observer-free, but make outside observation explicitly bounded and interfering

Reason:

Bubble already preserves latent topology, hidden regions, unobservable relations, observation-induced local materialization, and replay evidence. Without one explicit statement tying those together, it is too easy to slide into either false omniscient outside inspection or the opposite mistake that unobserved interior simply does not exist.

Consequence:

Bubble should treat outside observation as limited prior to causal contact and interfering once contact occurs. This does not turn worldhood itself into an observer-relative object. Instead, it means an outside observer must cross authored or runtime boundary surfaces to learn concrete interior unfolding, and that crossing may leave `observation-context`, `collapse-record`, `observationState`, or `history-commit` traces. The current bounded implementation should expose this as an inspectable plan/runtime surface before any future observer-agent layer is added.

## 2026-07-15

### D-082: Close the effect-role split with concrete causal targets before adding new effect semantics

Reason:

Bubble already projected authored effects into declarations, obligations, permissions, pressures, events, and traces, but runtime effect traces still stopped at descriptive signal strings. That left inspectors to reconstruct which observation, collapse, commit, sea, anchor, or descendant record an effect actually explained. Adding new effect kinds before closing that provenance gap would widen the model while leaving its existing causal story incomplete.

Consequence:

Add typed `causalLinks` to each runtime `effect-trace`. Links may target only concrete evidence records or materialized descendant artifacts present in the same run. Preserve an empty link set for potential capabilities without an executed target instead of inventing causal history. Keep the relation vocabulary bounded to current runtime records and widen it only when a new concrete transition record exists.

### D-083: Use closure-first progression as the release rule through the v0.5 boundary

Reason:

The project already carries a wide research surface. Advancing by adding another broad semantic layer before reconciling interrupted implementation, stale question status, missing verification, and record drift would make the version number move faster than the world model. The immediate user direction is to finish what has already been opened, one bounded slice at a time.

Consequence:

Treat `v0.4.8` and any required `v0.4.9` as convergence releases. Before opening a new feature family, identify one existing idea or question whose semantics are already sufficiently specified, finish its implementation and verification, update its research status, and record remaining limits without pretending they are solved. Do not promote to `v0.5` while known contradictions exist between canonical ideas, research status, code, tests, and public documentation.

### D-084: Make repository memory an explicit maintained artifact

Reason:

The operating rules require durable repository memory, but the repository previously relied on README and dispersed logs without naming one canonical continuity document. That made stable vocabulary, release discipline, and current boundaries easier to reinterpret between sessions.

Consequence:

Maintain `docs/project-memory.md` as a concise index of durable project facts. Keep raw ideas, open questions, falsifiable hypotheses, decisions, concrete work, and boundary failures in their specialized logs; repository memory links to those records and stores only stable cross-session context. Date every memory revision and update it whenever the core question, scope, vocabulary, release discipline, or canonical record set changes.

### D-085: Require one v0.4.9 convergence release before opening v0.5

Reason:

The `v0.4.8` causal-link work completed effect provenance but exposed the next unresolved foundational seam: the runtime has concrete sea, anchor, observation, commit, collapse, and effect evidence, yet it still does not produce one honest source-attribution assessment that distinguishes an internal world event from negative-sea pressure, anchor drift, positive-sea shift, or an unresolved source. Q-014 asks for exactly this distinction, and the original sea-anchor idea names it as a principal reason for the ontology. Promoting to `v0.5` before closing that seam would leave the triad inspectable but unable to perform one of its intended jobs.

Consequence:

Use `v0.4.9` as a narrow pre-`v0.5` convergence release. Its only semantic addition is evidence-bounded runtime source attribution for Q-014, propagated through materialization, inspection, stored replay, and focused verification. Include the research-record reconciliation and continuity safeguards begun on 2026-07-15. Do not add authored sea syntax, continuous sea dynamics, multi-region collapse, probabilistic-fractal semantics, observer agents, or a general replay solver in this release. Keep package version `0.4.8` until every `v0.4.9` completion gate is met.

### D-086: Close v0.4.9 and make v0.5 the sole next version without closing the research ledger

Reason:

The Q-014 attribution slice now resolves every supported direct class, preserves genuine negative-sea versus anchor-drift ambiguity, carries typed basis through inspection and stored replay, and passes the mandatory example and test paths. The user also requires that version succession remain explicit and that a bounded implementation not erase or over-close the larger ideas that motivated it.

Consequence:

Set the package version to `0.4.9` and treat its closure gates as complete. The next version is `v0.5`; do not create another intermediate version unless the user explicitly changes that decision. Preserve original dated ideas and every partial, open, or deferred question. Mark only the bounded Q-014 runtime slice complete, retain its limitations and reopen condition, and choose one measurable `v0.5` objective without treating unselected research branches as rejected.

### D-087: Keep observer and comparison work in Phase 2 until the bubble universe is complete

Reason:

The proposed scored observer or host-language comparison would measure an outside relationship to a world whose own organic realization semantics were still missing. That reverses the intended dependency: an observer can study a completed world, but should not define or substitute for worldhood.

Consequence:

Make Phase 1 completion of the bubble universe the sole current priority. Defer embedded agents, observer benchmarks, and Bubble-versus-host comparison to Phase 2. Preserve those ideas in the ledger, but do not schedule them ahead of state, transformation, world will, time/order, sea, anchor, history, lineage, and replay closure.

### D-088: Use executable world will as an admission law, not an external transition command

Reason:

If host code directly chooses a transformation, “world will” remains descriptive even when its expression is executable. Organic world operation requires the bubble to present lawful possibilities and let its own will accept or reject their projected consequences.

Consequence:

`bubbles.v0.5` evaluates preserve and eligible transform candidates under projected state plus typed realization metadata. One admitted possibility may realize; deterministic multiplicity remains underdetermined; authored nondeterminism preserves plural continuations. Runtime options may resume a provenance-bearing continuation but cannot name the winning candidate.

### D-089: Do not impose universal time; derive order and history from transformations

Reason:

Treating every materialization as a clock tick would collapse atemporal persistence, reversibility, causal change, branching, and irreversible history into one simulator convention. It would also conflict with the idea that absence of time may mean reversibility rather than frozen existence.

Consequence:

Record `no-universal-clock` in every `v0.5` self-realization plan. Identity preservation introduces no order; reversible transitions have validated inverse and causal order; branch/spawn/collapse expose topology; only an irreversible committed consequence creates a durable history arrow. Keep general cycles, partial causal orders, and metric time open for later `v0.5.x` work.

### D-090: Separate author language from executable semantic authority

Reason:

The author's concepts need the expressive range and provenance of natural language, but using NLP or free prose as runtime truth would make law, identity, agency, and contradiction dependent on an opaque and unstable interpretation step.

Consequence:

Preserve author quotations immutably with separate engineering interpretations and machine-readable obligations. A statement becomes executable only through deterministic lowering to a typed, versioned formal object. NLP may later assist authoring but cannot silently govern the world.

### D-091: Denote infinity intensionally and evaluate it by exact demand

Reason:

Literal completed infinity cannot be stored on a finite machine, while eager finite approximations would destroy the intended meaning of unbounded lineages and infinite-dimensional fields.

Consequence:

Begin `v0.5.1` with exact indexed families `f : I -> V`, finite product domains, guarded natural recursion, demand-driven coordinate evaluation, and proof traces. Treat computation budget as an epistemic limit that yields `undetermined`, never as the boundary of the denoted world.

### D-092: Make v0.5.1 an anchored narrative-world development line

Reason:

The intended Bubble universe contains distinct protagonists and stories, objective World-Will influence, anchors connecting worlds, and positive and negative sea conditions. Modeling implementation mathematics as parallel selectable regimes does not realize that world.

Consequence:

Use [architecture/v0.5.1-anchored-narrative-world.md](architecture/v0.5.1-anchored-narrative-world.md) as the active design. Build a connected seam from formal representation through protagonist agency, causal story, anchor-mediated intervention, sea coupling, inspection, and replay. Do not declare the release complete from the initial formal kernel.

### D-093: Keep internal protagonists in Phase 1 and preserve their agency

Reason:

Protagonists are inhabitants whose actions make each bubble's story, whereas the previously deferred observer or benchmark agent is external to the world. Treating both as Phase 2 would leave the world without its intended internal actors.

Consequence:

Add protagonist, goal, relationship, action, and story-state semantics before Phase 2. World Will may change lawful conditions through an anchor but must not directly replace protagonist choice. Validate this distinction with World-Will-disabled and anchor-cut counterfactuals.

### D-094: Defer recursive Bubble self-construction until the current universe is complete

Reason:

Recursive module generation, code synthesis and execution, and construction of a successor Bubble are coherent with Bubble as universe, language, and concept. They also depend on stable semantics for every world constituent and could otherwise generate or conceal the very gaps that Phase 1 is still trying to close.

Consequence:

Preserve the direction as Q-022 and OB-010, with current meta-language and intensional work recorded only as precursors. Do not include recursive self-hosting in `v0.5.1` completion. Reopen it in a later version only after the prior obligation ledger is realized and the author explicitly accepts the current Bubble universe as complete.

### D-095: Evaluate bounded World Will from the post-transition connected state

Reason:

A hard constraint that cannot read the world it constrains is only a static flag, and a host-chosen intervention would contradict organic realization. World Will also needs an honest answer when exact exhaustive search exceeds available resources or several optima remain equal.

Consequence:

For `bubble-anchored-narrative-program.v1`, bind declared formal predicate parameters to exact world fields, evaluate hard constraints after each candidate transition, score the connected result after explicit intervention cost, and exhaust the finite intervention frontier up to a declared bound. Return `underdetermined` on budget exhaustion or an unresolved deterministic tie; preserve all equal optima only when authored plural semantics permits it.

### D-096: Complete only the v0.5.1 connected seam, not the whole Bubble universe

Reason:

The exact runtime now connects formal fields, protagonist action, sea-dependent viability, anchor-mediated World-Will intervention, causal story, history, inspection, and deterministic re-execution. Calling the entire Bubble universe complete would still erase persistent story, relationship affordance, cross-world sea/anchor, full identity, and other obligations.

Consequence:

Certify `v0.5.1` as a bounded connected release while OB-001 remains open. Keep the next release identifier undecided until the completed boundary is reviewed. Preserve Q-022 recursive self-construction as deferred, and do not commit or stage this session's work.

### D-097: Correct mandatory narrative by forward generalization in v0.5.2

Reason:

The author introduced protagonists and stories as an explanatory image of the richness a Bubble should permit, then clarified that forcing those concepts into every world would damage the original project. Deleting them would make the opposite error. `v0.5.1` is already a completed and pushed bounded release, so rewriting it would also destroy valid evidence and version history.

Consequence:

Keep `bubble-anchored-narrative-world.v1` unchanged as an explicitly agent-bearing special case. Make `v0.5.2` the forward corrective release and add a separate actor-neutral causal world kernel from which persistent beings, agency, relations, and stories may later arise. Preserve D-092 and D-093 as historical decisions whose universal reading is superseded by AI-20260715-012 through AI-20260715-015 and Q-023.

### D-098: Generate events from state-bound internal laws and keep World Will out of protected structure

Reason:

A pre-authored event graph can demonstrate a story but cannot establish that the Bubble itself forms its causal development. Conversely, letting World Will directly write a field called coherence or agency would only rename external construction as emergence. Simultaneously enabled laws also cannot inherit an arbitrary host order without violating organic necessity.

Consequence:

In `bubble-anchored-causal-program.v2`, evaluate exact state-bound guards to generate causal events. Apply a simultaneous frontier only when its effects commute; otherwise return `underdetermined`. World Will may optimize and alter permitted condition, boundary, sea, or viability fields through an identity-checked anchor, but may not mutate protected internal fields. Record generic emergence from initial/final predicates and witnesses without assigning protagonist, life, or story identity in the core.

### D-099: Require post-state identity and evidence integrity before closing v0.5.2

Reason:

Passing canonical examples did not prove that an intervention preserved anchor identity, that simultaneous contributors remained present in the causal graph, that viability traces used one semantic layer, that the search bound constrained allocation, or that stored replay content was intact. Each gap admitted a concrete counterexample while ordinary tests still passed.

Consequence:

Do not close `v0.5.2` from the happy path alone. Re-evaluate every declared anchor after candidate closure; preserve all direct same-frontier causes; distinguish intrinsic from sea-coupled viability in traces; enumerate intervention subsets lazily under an exact cardinality bound; and require stored-run, program, and full-run digest agreement for same-world re-execution. Reject unknown runtime override names and require an explicit target for stabilization. Keep one regression test for each counterexample.

### D-100: Require five independent evidence surfaces before calling a recurrent structure persistent

Reason:

Exact state repetition alone can describe a passive loop, and fields named `boundary` or `memory` can remain decorative. Promoting such a pattern to an entity, agent, or living structure would repeat the ontology error corrected in `v0.5.2`. Persistence must also remain compatible with no universal clock and with plural causal continuations that tooling may not select.

Consequence:

Make `v0.5.3` a separate persistence layer over the unchanged actor-neutral kernel. Derive candidate components and membrane cuts from exact law dependencies; unfold every lawful selected continuation; require at least two closures and an exact lasso for recurrence; and certify persistence only when boundary, identity, memory erasure, negative-sea erosion/internal restoration, and outward causal influence all pass. Preserve budget exhaustion as `undetermined`, contradiction as contradiction, excessive erosion as lawful failure, and all replay-integrity checks. Do not call the result an agent or protagonist before goal, affordance, and action-ablation evidence exists.

### D-101: Separate recurrent configuration from anchor history and quantify persistence evidence universally

Reason:

The first passing `v0.5.3` candidate hashed only causal field configurations while calling the result exact world-state recurrence, flattened conjunctive guards into pairwise edges, accepted any change-and-return trace as repair, and unioned plural memory-counterfactual differences existentially. Each implementation passed the canonical tests but admitted a stronger claim than its evidence.

Consequence:

Treat the anchored state as a causal configuration paired with a monotone commit ledger. Certify lasso recurrence only in the configuration projection and report whether the full anchored state repeated. Preserve whole guard/effect tuples in a field/law factor graph; require every crossing law to bind boundary state and require pre-formation boundary-state ablation to change every crossing law's realization after unrelated recovery laws are suppressed. Require negative-sea-caused deviation from, and exact restoration to, the recurrent reference configuration. Quantify memory erasure, boundary ablation, and outward influence over every lawful continuation; mixed evidence is `undetermined`. Retain direct regression tests for all four false-positive classes before closing `v0.5.3`.

### D-102: Derive bounded teleonomic capacity from invariant recurrence and universal action ablation

Reason:

A declared goal, a parallel list of actions, or a host-selected winner would reproduce the ontology and organic-world failures already corrected in v0.5.2. Persistence with one automatic repair also does not establish plural goal-directed capacity. Multi-state cycles create an additional proof risk: a boundary-crossing law realized only in a later phase can escape an ablation that inspects only one closure.

Consequence:

Make `v0.5.4` an evidence layer over the unchanged persistent program. Derive a finite invariant component-configuration set from the exact certified lasso, require at least two response laws realized under differing internal state, and remove each factual response law while disabling World Will and cutting all anchors; every lawful continuation must leave the set. Re-execute the full persistent world under the same autonomy cut and require the identical kernel. Record no authored goal and no host selector, preserve `undetermined` at every incomplete frontier, and call the result teleonomic capacity rather than agency. Generalize boundary ablation to cover every crossing law realized anywhere in the certified cycle.

### D-103: Withhold v0.5.4 closure and replace law deletion with organic same-program event evidence

Reason:

The first `v0.5.4` candidate was called completed after one canonical period-two fixture and treated deletion of a whole response law as ablation of one action. That changes the world's program instead of asking what follows when an enabled event does not occur. Exact phase differentiation also remained compatible with a detached scheduler that advanced the cycle beside, rather than because of, the structure's response. These shortcuts could make a version advance look easier and more organic than the evidence justified.

Consequence:

Keep `0.5.4` as the working version but withdraw release confirmation. Supersede D-102's law-removal counterfactual with same-program internal-event nonrealization: preserve the program digest and law definition, record the would-have-occurred event, suppress only its effects, and require every selected continuation to carry that witness. Require discriminator value sets to be pairwise disjoint and causally regenerated from the response cycle; reject a detached phase scheduler even when persistence and plural necessary restoration survive. Add a period-three positive case and keep the candidate active until repeated adversarial review, documentation, generated evidence, and the full repository boundary agree.

### D-104: Quantify autonomous kernel preservation over every lawful path

Reason:

The first autonomy certificate accepted the existence of one World-Will-disabled, all-anchors-cut recurrent path with the factual kernel. In a future plural autonomous execution, another lawful path could lose that component or preserve a different kernel while the existential match still passed. This would reintroduce a hidden path selector precisely where the report claimed there was none.

Consequence:

Record path-indexed autonomy evidence for every disabled-and-cut execution path. The same component must be persistently certified and preserve the identical kernel on every path; an empty set, a missing component, one different kernel, or any unresolved/non-cyclic path cannot satisfy autonomy. Keep the global persistent status check as an additional requirement rather than a substitute for this component-wise universal quantifier.

## 2026-07-17

### D-105: Do not invent endogenous branching to satisfy a test fixture

Reason:

The current anchored-causal kernel produces plural selected continuations only from equal World-Will interventions in plural decision mode. With World Will disabled, commuting internal laws close to one autonomous continuation and non-commuting laws remain `underdetermined`. Adding an authored branch menu solely to manufacture a multi-path autonomy test would violate the no-hidden-selector and organic-generation rules.

Consequence:

Keep universal autonomy quantification over every path the current kernel can lawfully represent, and retain path-indexed evidence for future branching semantics. Add a direct regression showing that a factual plural World-Will run becomes exactly one intervention-free autonomous continuation when World Will is disabled and all anchors are cut. Leave endogenous branch/spawn/collapse execution as a later explicit semantic seam rather than smuggling it into `v0.5.4`.

### D-106: Require semantic memory dependence for every teleonomic response

Reason:

A response law could bind a memory-role field while using a tautology such as `memory = memory`. Persistence could still obtain memory evidence from another closure, allowing the decorative binding to cross into a claim that every affordance depends on retained memory.

Consequence:

For every factual response occurrence, reconstruct the same closure input, erase all bound memory-state fields to their pre-formation values, disable World Will, cut every anchor, and evaluate every selected continuation. The response is memory-dependent only when it disappears universally. Mixed or unresolved evidence remains unresolved; a response that survives erasure is not a teleonomic affordance. Preserve the full erasure values, continuation verdicts, and execution count in run and replay evidence.

### D-107: Confirm bounded v0.5.4 after adversarial closure

Reason:

The initial completion claim was correctly withdrawn. Subsequent audits replaced law deletion with same-program event nonrealization, rejected detached schedulers, made discriminator provenance causal, quantified autonomy over every representable path, clarified that endogenous branching is not present in the current kernel, added period-three and independent distributed-channel positive worlds, and required semantic memory dependence for every response. All canonical, distributed, false-positive, boundedness, replay, and legacy repository paths pass together.

Consequence:

Confirm `v0.5.4` as the bounded teleonomic-capacity release dated 2026-07-17. Its closed claim is limited to finite lasso-derived invariant norms with plural organically regenerated, event-necessary, memory-dependent internal responses and World-Will/anchor-independent persistence under the current causal kernel. Do not infer life, deliberation, agency, endogenous branching, relations, narrative coherence, global sea transport, cross-world anchors, whole-universe completion, or recursive self-construction. Preserve D-103 through D-106 and B-020 through B-025 as part of the release evidence rather than erasing the failed candidates.

### D-108: Derive endogenous branches from every maximal commuting frontier

Reason:

Returning `underdetermined` for non-commuting simultaneous laws preserved honesty through `v0.5.4`, but the Bubble universe still could not actualize lawful internal plurality. Declaration order, randomness, a World-Will score, or an authored branch list would all install a selector outside the causal relation being represented. Applying an excluded alternative in a later frontier would also erase the meaning of actual branch formation.

Consequence:

Make `v0.5.5` an opt-in extension of `bubble-anchored-causal-program.v2`. Build the enabled-law compatibility graph and realize every maximal clique as one causal frontier. Record the full enabled set, realized laws, mutually excluded nonrealized laws, maximal-frontier derivation, and `hostSelection: false`. A law compatible with every alternative must appear in every branch. Excluded alternatives remain in the program but cannot execute later in that branch. Preserve the earlier `underdetermined` default for programs that do not explicitly opt in.

### D-109: Treat branching intervention consequences as set-valued World-Will outcomes

Reason:

Once autonomous closure or post-intervention closure becomes plural, scoring each internal outcome independently would let World Will select the favorable branch and silently discard the rest. That would convert an objective-and-anchor mechanism into a hidden branch collapse rule. One valid outcome also cannot excuse an inadmissible or unresolved sibling outcome.

Consequence:

Evaluate anchor identity, intervention eligibility, and objective baselines separately for every autonomous branch. Treat every endogenous result of one intervention combination as one outcome set. Require anchor identity and hard constraints across the entire set, compare the intervention by its minimum exact net improvement, and preserve every outcome of a selected group. Existing deterministic/plural decision mode may resolve ties between intervention groups only; it never selects an internal branch outcome.

### D-110: Confirm bounded v0.5.5 after branch, persistence, replay, and evidence-density closure

Reason:

The maximal-frontier kernel passed its focused cases, but release closure also required backward-compatible default ambiguity, exact commutativity, exhaustive resource failure, robust World-Will behavior, path-universal persistence evidence, replay integrity, and repository-scale artifact discipline. The first plural run schema duplicated every singular continuation inside nested records; that was removed before the final complete verification.

Consequence:

Confirm `v0.5.5` as the bounded endogenous-causal-branching release dated 2026-07-17. Its closed claim is finite exhaustive realization of maximal commuting internal-law frontiers, branch-local anchor and World-Will evaluation, robust set-valued intervention outcomes, real plural persistence paths, and exact inspection/replay preservation without a host selector. The complete `npm.cmd run verify` boundary passes with TypeScript checking, all 179 tests, every canonical run/inspect/record/replay path, and compact singular evidence. Do not infer deliberation, agency, relations, narrative coherence, causal spawn/collapse, global sea transport, cross-world anchors, whole-universe completion, or recursive self-construction.

### D-111: Start lifecycle closure from causal actualization, not dynamic schema pretense

Reason:

The remaining `spawn` and retirement `collapse` gap could be hidden by adding status labels to authored artifacts, but that would not let the causal world itself create or end a Bubble. Full runtime schema generation, populations, and open-ended world creation are also too broad to introduce safely in one step. Observation-induced local materialization and branch nonrealization already have narrower meanings that must not be overwritten by a generic collapse flag.

Consequence:

Begin an unversioned closure candidate in the anchored causal kernel. Allow internal irreversible law events to actualize finitely declared latent worlds and to retire their own active source world. Require lineage, causal provenance, no-host-selection evidence, inactive-world exclusion, retained retirement residue, persistent phase continuation, and replay. Keep world definitions finite and intensional; do not claim dynamic schema generation, cross-world transfer, global sea transport, populations, agency, or a completed release. A version may be selected only after canonical artifacts, adversarial closure, record reconciliation, and the complete repository gate pass.

### D-112: Make lifecycle rank monotone and keep internal law local

Reason:

A lifecycle override that reset an initially active world to latent would make persistence capable of erasing history. A second active world also exposed a preexisting generic predicate channel through which one world's internal law could read another world's field without a typed anchor transfer. Both shortcuts would undermine the very identity and membrane semantics that lifecycle is intended to add.

Consequence:

Treat `latent < active < retired` as an acyclic phase order, never as metric time. Initially active worlds may only remain active or retire; initially latent worlds may activate and later retire. Record the finite per-continuation transition bound `A + 2L`, and reject lifecycle resume state that regresses rank or invents spawn provenance for an initially active world. Internal-law guards bind only local fields until a typed anchor-transfer contract carries cross-world identity, ports, content, causality, sea interaction, and replay evidence.

### D-113: Separate portable Bubble semantics from source syntax, storage bytes, and execution backend

Reason:

The current TypeScript runtime is already substantial enough to serve as an executable semantic oracle, but continuing to make Node object behavior and JSON serialization the implicit authority would make later native execution a reverse-engineering exercise. Conversely, fixing a binary layout before the stable semantic core is identified would turn open philosophical and runtime questions into accidental compatibility constraints.

Consequence:

Use the remaining 5.x line to specify a machine-independent typed semantic graph, exact value/effect contract, canonical semantic ordering, extension-preservation rule, and conformance fixtures. Keep `.bubble` text, TypeScript objects, canonical storage bytes, and backend instructions as distinct projections. A backend earns authority only by exact semantic and replay conformance; similar reports or faster execution are insufficient.

### D-114: Finish the bounded 5.x semantic core before Rust begins in 6.x

Reason:

Porting the current partial ontology directly would duplicate unsettled lifecycle, cross-world membrane, canonical encoding, and performance semantics in two implementations. The author instead requires idea preservation first, a meaningful 5.x core completion second, and Rust from 6.x onward.

Consequence:

Do not add Rust code or name a 6.x release during the 5.x closure work. First complete and reconcile the active lifecycle seam, lower the stable causal core through the Bubble language boundary, specify typed cross-world anchor/sea transfer rather than unanchored field reads, and establish implementation-independent conformance and cost contracts. This is a bounded engine-transition gate, not whole-universe completion: deliberative agency, Phase 2 observers, recursive self-construction, and trans-Turing execution retain their own prerequisites. Rust will be the first native physical backend, while TypeScript remains the reference oracle until differential evidence transfers execution authority.

### D-115: Add a strict causal Bubble profile instead of reinterpreting legacy effect roles

Reason:

Legacy `.bubble` programs describe generative relations, observation collapse, and effect capabilities, but do not contain the exact multi-world fields, local predicates, lifecycle rank, residue, or causal provenance required by the anchored causal runtime. Treating their existing `spawn` and `collapse` words as executable birth and retirement would silently change already preserved language semantics.

Consequence:

Keep every legacy profile unchanged. Introduce `causal bubble` as an additive strict source profile that explicitly declares world existence, exact fields, protected structure, sea coupling, anchors, World-Will objectives, local law guards, field effects, lifecycle effects, and commits. Lower it into `bubble-anchored-causal-program.v2`, validate it with the same kernel validator, and route source through the existing run/inspect/record/replay tools. Keep interventions, general authored intensional families, emergence criteria, and cross-world transfer outside this first profile until their typed contracts are ready.

### D-116: Close the bounded lifecycle-and-language technical gate without assigning a release

Reason:

The lifecycle kernel had already passed birth, retirement, lineage, inactive-world, persistence, replay, tamper, rank, and local-law membrane tests. The added causal source profile now reaches that exact kernel through ordinary run, inspection, record, and replay tooling, rejects semantic shortcuts, preserves legacy language meanings, and passes the full repository with 194 tests. Its generated evidence is smaller than the richer JSON lifecycle fixture and does not duplicate singular continuations.

Consequence:

Treat Gate A of the 5.x-to-6.x transition architecture as technically complete. Do not change `package.json`, call this `v0.5.6`, commit, or infer full lifecycle, dynamic schema, cross-world transport, portable BIR, or universe completion from this result. The next connected 5.x core seam is Gate B: typed cross-world anchor/sea transfer that replaces the currently rejected foreign-world guard shortcut.

### D-117: Confirm bounded v0.5.6 after lifecycle, language, replay, and adversarial closure

Reason:

After D-116 withheld automatic versioning, the author explicitly selected `v0.5.6` and requested final release review. The audit found B-034, one causal-language false surface: `reversible` was parseable without an authored inverse form. The source profile now requires exact opposite additive `law-inverse` effects, rejects incomplete inverse contracts through the shared causal validator, and rejects non-rational order comparison at compile time. Focused lifecycle/language tests, complete JSON and source run/inspection/record/replay cycles, replay tamper boundaries, evidence density, research records, and the full repository pass together with TypeScript checking and all 196 tests.

Consequence:

Confirm `v0.5.6` as the bounded endogenous-world-lifecycle and causal-language-lowering release dated 2026-07-17. Its closed claim is finite declared-world birth and retirement caused only by internal irreversible law, with monotone lifecycle provenance, retained retirement residue, inactive-world exclusion, persistence, local-law membranes, strict authored lowering, inspection, and exact replay. Preserve observation collapse and branch nonrealization as different transitions. Do not infer dynamic schema or population generation, global seas, cross-world anchor transfer, agency, portable BIR, Rust, Phase 2, hypercomputation, or whole-universe completion. No commit is authorized by this release confirmation.
