# Observation-Collapse Roadmap

## Status

Active staged roadmap.

This is no longer only a free-form research idea.

It is now one next-core Bubble direction with bounded implementation phases.

## Governing Principle

Bubble should use finite memory to represent an effectively infinite bubble multiverse.

That means worlds should remain intensional wherever possible and only become locally concrete when observation, interaction, proof, replay, or commitment forces one slice into explicit history.

## Architectural Target

The target architecture is not ordinary procedural generation.

It is observation-induced materialization:

- latent regions remain compact law-bearing semantic objects
- observation or cross-boundary interaction becomes a causal event, not a passive read
- perturbation, boundary state, anchor condition, and nearby history may influence first realization
- commit fixes one observed trajectory into same-world history
- replay must distinguish revisiting committed history from regenerating latent possibility

## Boundary Of Commitment

Bubble is not yet committing to full stochastic or quantum-like runtime semantics.

What Bubble is committing to now is a staged path toward that architecture without sacrificing inspectability.

### Core now

- explicit `observe`, `commit`, `perturb`, `leak` effects
- unresolved semantics in `v0.4`
- explicit anchor identity criterion
- bounded proof and replay surfaces
- latent-topology draft in IR and semantic plans
- bounded proof awareness that latent collapse keeps replay and consistency open

### Next-core

- collapse record or evidence shape for first observation of one latent region
- one local observation-triggered materialization kernel
- replay distinction between committed-history revisitation and first-time latent realization
- inspection and replay surfaces for collapse records
- one executable benchmark micro-world for this semantics

### Deferred

- probability clouds
- distributional replay identity
- generalized observer-dependent semantics across the whole language
- hidden host randomness
- many-region coupled collapse

## Work Packages

### Package A: Semantic Contract

Goal:

Fix the transition envelope `latent -> observed -> committed` and keep it normative.

Current state:

- semantic specification defines the transition envelope and first-slice invariants
- observation-induced materialization note records the bounded implementation checklist

Exit criteria:

- latent-region descriptor is explicit
- observation event and commit boundary are explicit
- replay judgment for latent versus committed slices is explicit

### Package B: Intensional Topology Surfaces

Goal:

Expose latent regions as first-class semantic objects before runtime collapse exists.

Current state:

- `bubble.unresolvedSemantics` preserves authored names
- `bubble.latentTopology` projects `hidden-region` and `latent-bubble`
- semantic plans preserve `latentTopology`
- bounded proof now cites latent collapse drafts as replay and consistency limits

Exit criteria:

- latent topology is visible in IR, plans, inspection, and replay
- proof can cite latent collapse state without pretending one collapse already occurred

### Package C: Collapse Record

Goal:

Introduce one evidence-bearing record that says a latent region became concrete in one run.

Current state:

- runtime now emits first `collapse-record` evidence for observed latent regions when a latent-topology draft and declared observation surface are both present
- inspection and replay now preserve those records as first-class evidence
- each collapse record now also carries a structured `observationState`, not only a placeholder observation-state id

Required shape:

- latent region id
- triggering observation or interaction cause
- perturb contribution used in that collapse
- resulting observation state id
- commit status

Exit criteria:

- one run can emit a collapse record
- inspection and replay can display that record

### Package D: Local Materialization Kernel

Goal:

Allow one authored latent site to materialize under observation without widening the whole language.

Constraints:

- one local region only
- authored perturb contribution only
- no hidden randomness
- no generalized multiregion collapse

Current state:

- one benchmark micro-world now exists as `examples/collapse-threshold.bubble`
- that example now executes one deterministic `single-region-observation-kernel.v1` local materialization for exactly one observed latent region
- the benchmark also now commits that single observed local state into history without widening the language beyond current effect and unresolved-semantic surfaces
- a second bounded benchmark now exists as `examples/collapse-mixed.bubble`, where one hidden-region local target commits into history while a sibling `latent bubble` observation state remains `history-open`
- a second benchmark, `examples/collapse-mirror.bubble`, now lets inspection and replay compare committed root-local collapse history against one still-latent sibling descendant without widening to many-region coupled collapse

Exit criteria:

- one micro-world can materialize one latent region on observation
- repeated replay can distinguish pristine latent possibility from committed observed history

### Package E: Replay And Proof Hardening

Goal:

Keep same-world replay and contradiction detection trustworthy after collapse begins to happen.

Current state:

- runtime now separates `plan.proof` from a materialized-run proof so inspection and replay can cite actual `collapse-record` evidence instead of only latent-topology drafts
- replay identity already distinguishes pristine latent possibility from observed-but-still-open collapse history
- replay identity now also upgrades to committed same-world revisitation for the single-region benchmark once its local observed state is committed
- runtime proof now also carries mixed committed/open observation-state runs where one hidden-region local target is committed but sibling latent-bubble observation states remain open
- runtime proof now normalizes those commit-path differences through explicit observation-history shape basis terms, so full and mixed local commit paths can be compared without inventing authored commit syntax first
- internal consistency now reinterprets committed hidden-region fragments as observed local history instead of leaving them only as residual unresolved semantics
- replay reports can now compare committed root-local collapse history against latent sibling descendants through top-level `observationStates` plus artifact latent-topology summaries

Required proof distinctions:

- contradiction in world law
- lawful but still-uncommitted observation-induced divergence
- same-world replay after commit
- nearby-world drift or non-identical replay

Exit criteria:

- replay identity claim changes with collapse history instead of only with declared history support
- internal consistency can cite collapse records and residual latent regions separately

### Package F: Author-Facing Surface

Goal:

Only after runtime and proof are stable, decide whether Bubble needs new syntax for observation-collapse control.

Possible future surfaces:

- explicit latent-region declarations richer than current `hidden region` / `latent bubble`
- explicit observation-triggered materialization rules
- explicit perturb-mixing clauses
- explicit collapse or commit policies
- explicit commit-target selection or sibling-open clauses, but only if runtime proof distinctions stop moving first

Exit criteria:

- new syntax says something the existing effect and unresolved-semantic layer cannot already say cleanly
- runtime meaning is already fixed before syntax is widened

## Immediate Queue

The next concrete tasks should be:

1. keep the current commit behaviors runtime-bounded until a third commit shape or one author-controlled target choice makes authored policy semantically necessary
2. treat `observed-history-shape-*` proof vocabulary as the current comparison layer between bounded commit paths rather than widening commit syntax early
3. keep sibling-latency comparison composed from `observationStates` plus artifact latent-topology summaries until one stable diff abstraction proves necessary
4. keep author-facing syntax deferred until those runtime and proof boundaries stop moving

## Success Condition

This roadmap succeeds only if Bubble becomes more itself, not less.

That means:

- less extensional world storage
- more inspectable causal world formation
- stronger replay meaning
- stronger proof boundaries
- no retreat into opaque engine magic
