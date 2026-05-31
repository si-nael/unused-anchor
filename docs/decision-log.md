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
