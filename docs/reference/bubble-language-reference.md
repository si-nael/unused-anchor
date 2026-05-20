# Bubble Language Reference

## Status

This document is the shared user-facing reference for the current Bubble Language implementation.

For the normative semantic contract behind these source forms, see `docs/architecture/bubble-semantic-spec.md`.

It is meant to answer four practical questions:

- what source forms are valid today
- how Bubble source is interpreted semantically
- how to run the current toolchain
- how to read the generated IR, plan, materialization, inspection, and replay outputs

Bubble is not a JSON schema with a custom skin.

It is a line-oriented domain language with:

- its own source grammar
- versioned language profiles
- a compiler pipeline
- explicit semantic validation
- a planning and materialization runtime
- inspection and replay surfaces

The current implementation supports three profiles:

- `bubbles.v0.1`
- `bubbles.v0.2`
- `bubbles.v0.3`

## Mental Model

Bubble source describes one bubble as a generative semantic object.

A bubble is not interpreted as a flat object literal.

The compiler and runtime treat it as a unit that can declare:

- axioms
- a governing world will
- a seed
- observation mode
- typed effects and obligations
- descendant relations
- quoted staged artifacts
- generators derived from quoted artifacts
- bounded reflection requests
- staged emissions
- staged grammar artifacts and activation requests

The intended pipeline is:

`source -> AST -> Bubble IR -> validation -> semantic plan -> materialization -> inspection/replay`

That pipeline matters because Bubble is designed to preserve semantics that ordinary host-language embeddings often hide across code, runtime convention, and ad hoc tooling.

## Source Model

### General Rules

- one `bubble` declaration per source file
- declarations are line-oriented
- current examples use braces around the bubble body
- names are case-sensitive
- string values can use single or double quotes where the current parser examples do so
- profile promotion is inferred from which declarations appear in the source

### Minimal Shape

```bubbles
bubble Example {
  axiom coherence = stable
  will "preserve local consistency"
  seed example_seed
  effect spawn required
}
```

## Profile Summary

### `bubbles.v0.1`

Core world-definition profile.

Adds support for:

- `bubble`
- `axiom`
- `realization`
- `will`
- `seed`
- `observe`
- `effect`
- `spawn ... when ...`

Typical use: define one bubble world with explicit semantic obligations and descendant relations.

### `bubbles.v0.2`

First staged meta profile.

Retains `v0.1` and adds:

- `quote`
- `generator`
- `reflect`
- `emit`

Typical use: quote bubble artifacts, derive parameterized descendants, capture bounded reflection, and materialize staged emissions.

### `bubbles.v0.3`

First staged meta-grammar profile.

Retains `v0.2` and adds:

- `grammar`
- `activate grammar`

Typical use: define inspectable grammar artifacts and request later activation under explicit profile boundaries.

## Declarations

### `bubble`

Declares the root bubble for the file.

Syntax:

```bubbles
bubble BoundaryOrchard {
  ...
}
```

Interpretation:

- defines the source root for compilation
- becomes the root address anchor in Bubble IR
- owns all local declarations in the file

### `axiom`

Declares one semantic axiom as a key-value pair.

Syntax:

```bubbles
axiom coherence = stable
axiom membrane = porous
```

Interpretation:

- axioms describe invariant world commitments
- a valid authored world is expected to declare at least one axiom

### `realization`

Declares whether the bubble is intended to realize deterministically or nondeterministically.

Syntax:

```bubbles
realization deterministic
realization nondeterministic
```

Interpretation:

- `deterministic` says branching is not intended as part of the authored world contract
- `nondeterministic` permits branching as a first-class world behavior
- if omitted, the current IR may infer a realization mode from declared effects

### `will`

Declares the world will.

Syntax:

```bubbles
will "grow through porous edges"
```

Interpretation:

- world will is treated as a governing principle, not decorative text
- a valid authored world is expected to declare a world will

### `seed`

Declares a stable seed identity for the bubble.

Syntax:

```bubbles
seed orchard_seed
```

Interpretation:

- seed supports reproducibility and stable identification of authored origin
- a valid authored world is expected to declare a seed

### `observe`

Declares an observation mode.

Syntax:

```bubbles
observe witness
observe local
```

Interpretation:

- observation is a semantic declaration, not just runtime metadata
- observation introduces evidence expectations in the runtime layer
- if `observe` is declared, the current validator also expects `observe` and required `commit` effects

### `effect`

Declares one typed effect, whether it is required or optional, and optionally a scope.

Syntax:

```bubbles
effect observe required
effect spawn required scope membrane
effect branch optional
```

Interpretation:

- effects are explicit semantic capabilities and obligations
- they are not implicit runtime side effects
- required effects become obligations in planning output
- optional effects describe permitted but not mandatory behavior
- scope defaults locally unless another scope is declared
- `commit` currently lowers into durable-history lifecycle and evidence behavior
- `collapse` currently lowers into lifecycle support for retirement or merge semantics
- `leak`, `debt`, and `perturb` currently lower into runtime stress signals used by ontology and evidence output

Current effect kinds used by the implementation and examples include:

- `observe`
- `commit`
- `spawn`
- `branch`
- `collapse`
- `leak`
- `debt`
- `perturb`

### Unresolved Semantic Declarations

Bubble `v0.4` adds a first authored surface for unresolved semantic objects.

Syntax:

```bubbles
unknown value horizonDepth
unknown entity DistantWitness = "observer exists beyond the current membrane"
constraint membraneBalance = boundary.pressure <= 3
partial law continuityRule = history.commits and world.seeded
anchor identity = world.seeded and history.commits
partial law driftRule = "drift depends on unresolved membrane topology"
hidden region OuterCanopy
unobservable relation RootKnot = "relation exists but cannot yet be observed"
latent bubble WaitingArchive
```

Interpretation:

- these declarations preserve admitted but unresolved world structure
- they do not yet solve or materialize that structure automatically
- they lower into `bubble.unresolvedSemantics` in compiled IR
- `constraint` is the first unresolved kind with executable checking when it is authored in the shared expression subset
- `partial law` now also has one minimal executable path when it is authored in that same shared expression subset
- `anchor identity` lowers into `bubble.anchorCriterion` and can tighten anchor-identity and replay-identity proof claims
- inspect and replay now expose those executable evaluations directly through a `semantics` section instead of leaving them visible only through proof-claim text
- they currently matter most because the proof layer can either cite them as explicit reasons that a claim remains `undetermined` or directly contradict one authored executable constraint or partial-law fragment

### `spawn`

Declares a descendant bubble family and optional local birth condition.

Syntax:

```bubbles
spawn GroveChild when boundary.pressure > 3 and membrane.state = "thin"
```

Interpretation:

- `spawn` records a descendant relation in the compiled bubble
- the `when` clause can lower into structured expression IR
- declaring `spawn` requires a corresponding `spawn` effect

### `quote`

Captures a bubble artifact as staged inert source.

Syntax:

```bubbles
quote Probe = bubble Probe { realization deterministic axiom coherence = stable will 'preserve sampled symmetry' seed latent_seed effect spawn required }
```

Interpretation:

- quoted artifacts are inspectable declarations inside the current bubble
- they are not executed same-stage by being quoted alone

### `generator`

Declares a parameterized derivation from a quoted artifact.

Syntax:

```bubbles
generator DerivedProbe(seedName) from Probe
```

Interpretation:

- a generator references one quote as its source
- later `emit` declarations can request instantiated descendants from the generator

### `reflect`

Requests bounded reflection over the current bubble context.

Syntax:

```bubbles
reflect self.address
reflect self.profile
reflect self.worldWill
reflect self.seed
```

Interpretation:

- reflection is intentionally bounded to a supported surface
- current reflection paths are explicit and validator-controlled
- reflections become captured context during materialization and inspection

### `emit`

Requests staged activation of a quote or generator.

Syntax:

```bubbles
emit Probe as artifact
emit DerivedProbe("field_seed") as descendant
```

Interpretation:

- `emit ... as artifact` materializes a staged artifact record
- `emit ... as descendant` materializes a derived descendant bubble
- emit declarations are planned first and materialized later by the runtime layer

### `grammar`

Declares a staged grammar artifact.

Syntax:

```bubbles
grammar LeafSyntax = "profile leaf.v0.3 extends branch.v0.3"
```

Interpretation:

- grammar artifacts are inspectable language-level objects
- current structured grammar support is conservative and profile-oriented
- grammar artifacts do not mutate the active parser in the same compile step

### `activate grammar`

Requests staged activation of a named grammar artifact.

Syntax:

```bubbles
activate grammar LeafSyntax
activate grammar TwigSyntax as twig.v0.3
```

Interpretation:

- activation is staged, not immediate parser mutation
- if no explicit profile is named, the activation resolves to the profile declared by the grammar artifact
- activation compatibility is validated at compile time

## Current Validation Rules

### `v0.1`

The current implementation expects a valid authored `v0.1` bubble to satisfy these rules:

1. it declares at least one axiom
2. it declares a world will
3. it declares a seed
4. it declares at least one effect
5. each effect kind is declared at most once
6. if it declares `observe`, it also declares an `observe` effect
7. if it declares `observe`, it also declares a required `commit` effect
8. if it declares `spawn`, it also declares a `spawn` effect
9. if it declares `realization deterministic`, it does not declare a `branch` effect

### `v0.2`

The current implementation adds these `v0.2` constraints:

1. quote and generator names share one meta namespace and may not collide
2. every generator must reference an existing quote
3. reflect paths must stay within the supported bounded set
4. every emit source must resolve to an existing quote or generator
5. emits from quotes may not pass call arguments
6. emits from parameterized generators must supply an argument
7. emits from zero-parameter generators may not supply an argument
8. generator emit arguments currently accept only scalar literal or reference expressions at runtime

### `v0.3`

The current implementation adds these `v0.3` constraints:

1. grammar names share the meta namespace with quotes and generators and may not collide
2. every grammar activation must reference an existing local grammar artifact
3. every grammar artifact must parse into a supported structured grammar form
4. profile-extension grammars must extend either a built-in Bubble profile or another locally declared grammar profile
5. if an activation names a target profile explicitly, it must match the profile declared by the grammar artifact
6. duplicate declared grammar profile identities are rejected
7. local grammar profile-extension cycles are rejected

## Profile Promotion

The compiler promotes the source profile automatically based on which declarations appear.

- source with only `v0.1` constructs compiles as `bubbles.v0.1`
- source containing `quote`, `generator`, `reflect`, or `emit` compiles as `bubbles.v0.2`
- source containing `grammar` or `activate grammar` compiles as `bubbles.v0.3`

Typical compiled outputs therefore include one of:

- `"profile": "bubbles.v0.1"`
- `"profile": "bubbles.v0.2"`
- `"profile": "bubbles.v0.3"`

## Runtime Interpretation

Bubble does not use a conventional compile-then-run story.

The current runtime model is:

- compile: parse, lower, validate, and write Bubble IR
- plan: derive semantic obligations, relations, grammar plans, and emission plans
- materialize: activate staged descendants or artifacts and record evidence, commits, and trace
- inspect: turn plan and materialization state into a stable report surface
- replay: inspect a persisted run bundle later without recompiling the original source

## Command Reference

### Validation and Build

- `npm run check`: TypeScript typecheck
- `npm test`: unit tests
- `npm run verify`: full repository verification pipeline

### Compile and Example Commands

- `npm run validate:example`: validate `examples/first-world.bubble`
- `npm run compile:example`: compile `examples/first-world.bubble` into IR
- `npm run inspect:boundary-example`: inspect the `v0.1` observational example
- `npm run plan:meta-example`: plan the `v0.2` meta example
- `npm run materialize:meta-example`: materialize the `v0.2` meta example
- `npm run inspect:meta-example`: inspect the `v0.2` meta example
- `npm run materialize:observatory-example`: materialize the richer `v0.2` example
- `npm run inspect:observatory-example`: inspect the richer `v0.2` example
- `npm run compile:grammar-example`: compile the `v0.3` grammar example
- `npm run inspect:grammar-example`: inspect the minimal `v0.3` grammar example
- `npm run inspect:grammar-chain-example`: inspect the chained `v0.3` grammar example
- `npm run record:meta-example`: persist one replayable runtime bundle
- `npm run replay:meta-example`: inspect a persisted replay bundle

### CLI Surface

The repository currently exposes these CLIs under `apps/hatchery/`:

- `compile-bubble.ts`
- `plan-bubble.ts`
- `materialize-bubble.ts`
- `inspect-bubble.ts`
- `record-bubble.ts`
- `replay-bubble.ts`

The inspector supports stable sections including:

- `summary`
- `plan`
- `ontology`
- `semantics`
- `proof`
- `bundle`
- `grammars`
- `artifacts`
- `commits`
- `evidence`
- `trace`
- `report`

The current inspection and replay path also supports narrowing by:

- emission identity
- address identity
- activation identity
- grammar profile
- semantic subject or evaluation identity
- semantic subject kind
- semantic execution status
- proof claim identity
- proof claim family
- proof claim status
- trace-event kind

## Reading Outputs

### Compiled IR

Compiled IR files record the normalized semantic form of the source bubble.

Typical top-level fields include:

- `version`
- `profile`
- `sourcePath`
- `bubble`

Inside `bubble`, current outputs may include:

- `address`
- `name`
- `axioms`
- `worldWill`
- `seed`
- `observationMode`
- `effects`
- `obligations`
- `generation`
- `unresolvedSemantics`
- `meta`

Interpret them as follows:

- `address`: lineage-aware identity of the root bubble
- `effects`: authored effect declarations with provenance
- `obligations`: required semantic commitments implied by authored effects
- `generation`: realization mode, lifecycle hints, and bubble-generative relations
- `unresolvedSemantics`: authored unknown, partial, hidden, latent, or constraint-bearing semantic fragments
- `meta`: quotes, generators, reflections, emissions, grammars, and grammar activations

### Semantic Plan

Plan outputs summarize what the runtime would need to honor without yet materializing the whole result.

Look for:

- obligations to satisfy
- bundle members and materialization scopes
- planned descendant or branch relations
- grammar activation plans
- emission plans

### Materialized Output

Materialization outputs show what actually became active in one run.

Look for:

- descendant bubbles
- staged artifacts
- commits
- evidence
- trace events

Evidence now includes authored observation or commit records, per-effect runtime `effect-trace` records, and derived sea-anchor state records for the root bubble.

Current `effect-trace` evidence records carry authored provenance plus current-run runtime interpretation, including:

- effect id and kind
- requirement and scope
- source line
- `materializationState`: whether the effect remained potential or became materialized in this run
- `runtimeSignals`: the current runtime reasons attached to that effect in this run

### Inspection Output

Inspection outputs are the most shareable runtime view.

They condense the compiled and materialized state into a stable query surface.

Typical fields include:

- `summary`
- `plan`
- `ontology`
- `proof`
- `bundle`
- `artifacts`
- `commits`
- `evidence`
- `trace`

Interpretation guidelines:

- if `plannedEmissionCount` is non-zero, the bubble authored staged artifact or descendant requests
- if `plannedGrammarActivationCount` is non-zero, the bubble authored staged grammar work
- `plannedSemanticCount` tells you how many executable semantic checks remain in the currently selected inspection slice
- `semanticKinds` tells you which semantic layers are still present in that slice instead of collapsing them into one undifferentiated count
- `semanticStatusCounts` tells you how the selected semantic layer is currently distributed across satisfied, violated, and underdetermined checks
- `proofVerdict` tells you the current bounded-certificate verdict for the selected proof slice, not only for the full unfiltered certificate
- `proofClaimCount` tells you how many proof claims remain in the currently selected inspection slice
- `proofClaimKinds` tells you which proof families remain active in that slice
- `proofClaimStatusCounts` tells you how that selected proof slice is distributed across certified, contradicted, and undetermined claims
- `reflectionPaths` tell you which bounded self-views were captured during materialization
- `traceKinds` tell you which runtime events actually occurred in the run

### Ontology Output

The inspection runtime now exposes one derived `ontology` section for the root bubble.

This section is the first runtime landing zone for the sea-anchor model.

It does not claim to read metaphysical truth from source text.

It exposes a conservative runtime assessment derived from current Bubble signals such as realization mode, boundary-scoped relations, descendant lineage, seed continuity, observation mode, durable history support, and explicit leak, debt, or perturb capability.

Current fields include:

- `negativeSea.pressure`: current instability pressure inferred from branching, nondeterminism, boundary exposure, and explicit leak or perturb capability
- `positiveSea.support`: current structural support inferred from lineage, seed, descendant growth, and durable history
- `anchorPoint.strength`: current world-identity support inferred from axioms, world will, seed continuity, observation, durable history, and present stress such as unresolved debt or perturbation
- `anchorPoint.trustedHistory`: whether the current world has durable history support in the runtime model
- `anchorPoint.rewindStability`: whether replaying or rewinding is currently assessed as fragile, guarded, or stable
- `theoremWitness`: the current formal witness for Bubble worldhood, including ordinal ranks for $N$, $P$, and $A$, plus `worldhoodDelta = A + P - N` and the derived condition `stable | stressed | dissolving`
- `signals`: explainable reasons for each assessment

This is intentionally a runtime assessment layer, not a new core syntax commitment.

The materializer now also emits these assessments as first-class evidence records:

- `negative-sea-state`
- `positive-sea-state`
- `anchor-point-state`
- `effect-trace`

Those evidence records travel through inspection and replay the same way observation and history-commit records do.

### Proof Certificate Output

The inspection runtime now also exposes one derived `proof` section.

This is a bounded semantic consistency certificate, not a claim that Bubble has solved absolute contradiction-freedom.

Current runtime shape:

- `mode: bubble-consistency-certificate.v1`
- `verdict: certified | partially-certified | contradicted | undetermined`
- `claims[]` with per-claim `status: certified | contradicted | undetermined`

The inspect and replay CLIs can now narrow this section with:

- `--claim <id>` for one proof claim id
- `--claim-kind <syntax|worldhood|effect|anchor|lineage|consistency|replay>` for one proof-claim family
- `--claim-status <certified|contradicted|undetermined>` for one proof verdict slice

When the proof section is narrowed this way, the reported `verdict` is recalculated from the selected claim slice instead of staying pinned to the full unfiltered certificate.

Current claim families include:

- well-formed source
- minimum worldhood
- required-effect obligations
- anchor identity
- lineage traceability
- replay identity basis
- internal law consistency

The current runtime can also preserve unresolved semantic fragments in IR for:

- `unknown-value`
- `unknown-entity`
- `constraint`
- `partial-law`
- `hidden-region`
- `unobservable-relation`
- `latent-bubble`

Current `v0.4` source now does have a surface syntax for these fragments.

What it still does not have is a general solver.

Today the runtime can directly execute authored `constraint`, minimal `partial law`, and `anchor identity` expressions inside the shared expression subset.

Other unresolved fragments still matter because the `internal-law-consistency` claim can cite them directly as reasons that a proof remains `undetermined`.

### Executable Semantics Output

The inspection and replay runtime now also exposes one derived `semantics` section.

Current runtime shape:

- `mode: bubble-executable-semantics.v1`
- `constraints[]`
- `partialLaws[]`
- `anchorCriterion`

Each executable evaluation currently records:

- the semantic subject kind
- the source identifier and source line
- the authored name and preserved expression text when available
- `status: satisfied | violated | undetermined`
- basis tags and explanation text

Use this section when you want to see how one constraint, partial-law fragment, or authored anchor criterion evaluated directly in the current executable environment without first reconstructing that result from proof-claim prose.

The inspect and replay CLIs can now narrow this section with:

- `--semantic <id>` for a semantic subject id or executable evaluation id
- `--semantic-kind <constraint|partial-law|anchor-criterion>` for one semantic subject class
- `--semantic-status <satisfied|violated|undetermined>` for one executable semantic verdict slice

### Bundle Output

The inspection runtime now also exposes one derived `bundle` section.

This is the first minimal composition surface for Bubble.

Current runtime shape:

- `mode: bubble-bundle-plan.v1`
- `bundleId`
- `rootAddressId`
- `members[]`
- `materializationScopes[]`

At this stage, bundle members can include:

- the root bubble
- staged descendant members
- staged artifact members
- staged grammar-activation members

This does not yet mean Bubble has full multi-bubble source composition.

It means the semantic plan now records one provenance-bearing package shape instead of leaving composition entirely implicit in one root bubble.

Interpret the verdict conservatively:

- `certified`: every current claim in the certificate was discharged
- `partially-certified`: some claims were discharged and some remain open
- `contradicted`: at least one current claim failed under the present runtime semantics
- `undetermined`: no current claim could yet be discharged

This certificate travels through planning, inspection, and replay as a first-class runtime artifact.

### Replay Bundles

Replay bundles preserve one materialized run for later inspection.

Use them when you want stable post-run analysis without recompiling or re-materializing the source bubble.

## Example Index

Current runnable examples:

- `examples/first-world.bubble`: minimal `v0.1` compile example
- `examples/boundary-orchard.bubble`: `v0.1` observation, branching, and structured spawn condition example
- `examples/meta-grove.bubble`: `v0.2` quote, generator, reflection, and descendant materialization example
- `examples/observatory-loop.bubble`: `v0.2` observation, artifact emission, descendant emission, and evidence example
- `examples/grammar-nursery.bubble`: minimal `v0.3` grammar artifact example
- `examples/grammar-canopy.bubble`: `v0.3` layered local grammar-profile chain with default activation resolution

## Current Non-Goals

The current implementation does not yet provide:

- multiple bubbles per file
- unrestricted general-purpose expression evaluation
- same-stage self-executing reflection
- same-stage parser mutation from grammar artifacts
- cross-file grammar imports
- full causal simulation for materialized descendants
- complete benchmark or agent-loop infrastructure for bubble-universe AI research

## How To Read Bubble Correctly

When reading Bubble source, do not read it as a pretty serialization format.

Read it as a semantic contract.

- `axiom`, `will`, and `seed` define the authored world basis
- `effect` defines explicit capability and obligation surfaces
- `spawn` defines descendant-world relations
- `quote`, `generator`, `reflect`, and `emit` define staged meta operations
- `grammar` and `activate grammar` define staged language-level operations
- emitted outputs, inspection reports, and replay bundles are part of the language surface, not afterthought tooling

That is the main distinction between Bubble and a thin JSON configuration layer.
