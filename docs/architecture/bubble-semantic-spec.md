# Bubble Semantic Specification

## Status

This document is the normative semantic contract for Bubble Language.

It is not a user-facing syntax guide.

It exists to answer a different question: what does Bubble mean, what does it guarantee, and which semantic distinctions must remain stable even as syntax and profiles evolve?

Where the current implementation is still partial, that gap is stated explicitly.

## Core Question

Bubble should be judged against one core question:

How can a finite source artifact define a potentially vast multiverse whose full observability is not known in advance, materialize only the required slice, and still preserve world identity, lineage, history, and boundary semantics?

Every core construct should be read against that question.

Stated more directly, Bubble's governing philosophy is this:

use finite memory to represent an effectively infinite bubble multiverse.

That does not mean pretending an infinite world is secretly stored somewhere in full.

It means Bubble must preserve worlds intensionally as law, seed, lineage, latent structure, and committed deviation, while materializing only the local slice forced by observation, interaction, proof, or replay.

## Scope

Bubble core is universal.

It should define:

- bubble identity
- world boundary and membrane semantics
- lineage and address structure
- partial materialization
- history and replay identity
- effect provenance
- staged generation and staged language extension boundaries

Bubble profiles extend the core surface and IR while preserving those contracts.

Applications, benchmarks, agent loops, contradiction search procedures, and evaluator logic are not Bubble core.

They are particular layers built on top.

One non-negotiable consequence follows from this scope: Bubble core should never require extensional storage of the whole multiverse as a precondition for semantic correctness. If one design choice demands global explicit world-state where an intensional representation would preserve the same meaning, that design choice is working against the language's philosophy.

## What Is A Bubble?

A bubble is the minimal generative semantic unit of the system.

It is not a flat object literal and not merely a file-local namespace.

A bubble denotes a world-bearing semantic object that may exist in one of several modes: latent, planned, materialized, committed, drifting, collapsed, or replayed.

A bubble may also generate or constrain other bubbles.

## What Makes A Bubble Independent?

A bubble counts as an independent world only if it has all of the following semantic roles.

- a local law basis
- a boundary that distinguishes internal evolution from outside influence
- a lineage or placement relation within a larger field
- an anchor criterion that decides same-world identity under replay or disturbance

This is the worldhood contract.

The formal necessity proof for negative sea, positive sea, and anchor point is in [docs/architecture/sea-anchor-proof.md](docs/architecture/sea-anchor-proof.md).

## Core Construct Semantics

### `axiom`

Meaning:

The minimal authored unit of world law.

Guarantee:

- contributes to the bubble's local law basis
- is part of what later counts toward anchor support and world identity
- is not mere metadata and should not be interpreted as a decorative key-value bag

Current implementation:

- lowered as a named scalar value inside the compiled bubble
- not yet compiled into a richer law algebra or solver

### `will`

Meaning:

The bubble's governing selection pressure or maintenance criterion.

Guarantee:

- expresses the principle that biases birth, persistence, branching, collapse, or stabilization
- is part of the world's identity basis, not explanatory flavor text
- must remain semantically visible even if its concrete control semantics evolve by profile

Current implementation:

- stored as text in the current IR and used as anchor-support evidence
- not yet compiled into an explicit constraint, ordering, or selection rule

### `seed`

Meaning:

The origin token for reproducibility and identity continuity.

Guarantee:

- supports stable regeneration or reference to the same authored world origin
- contributes to anchor continuity and replay identity
- is not only a randomization string

Current implementation:

- stored as a scalar seed value in IR and used in lineage and ontology estimation

### `observe`

Meaning:

Declares an observation surface, not the existence condition of the world.

Guarantee:

- specifies that some slice of the world can be exposed to evidence
- does not create the world and should not be confused with worldhood itself
- may interact with history commitment and evidence formation

Current implementation:

- lowers into observation mode and evidence behavior
- still influences some coarse ontology estimates, which should eventually be separated into epistemic rather than ontic semantics

### `effect`

Meaning:

Declares an authored semantic surface for world formation.

Guarantee:

- makes side effects explicit rather than hidden in runtime behavior
- can imply capability, obligation, or structural pressure depending on effect kind and requirement
- must remain provenance-bearing and replayable

Current implementation:

- lowers into typed effect IR, obligations, runtime effect traces, and ontology pressure signals
- still combines several semantic roles that should later be separated more cleanly

### unresolved semantic declarations

Meaning:

Declare semantic objects that the world admits without pretending they are already fully resolved.

Guarantee:

- preserve unresolved semantic structure as first-class authored content
- keep that structure available to later proof, inspection, and completion procedures
- avoid collapsing unknown, partial, hidden, or latent structure into fake explicit certainty

Current implementation:

- `v0.4` source can now declare `unknown value`, `unknown entity`, `constraint`, `partial law`, `hidden region`, `unobservable relation`, and `latent bubble`
- those declarations lower into `bubble.unresolvedSemantics`
- they currently feed proof basis and inspection surfaces, not an executable solver

### `spawn`

Meaning:

Declares descendant-world relation, not unconditional immediate existence.

Guarantee:

- introduces a lineage-bearing descendant possibility
- may become materialized later under planning and runtime conditions
- contributes to family structure even before explicit descendant realization

Current implementation:

- lowers into a descendant generative relation and address template
- actual descendant worlds appear only when materialization activates an emission path

### `quote`

Meaning:

Captures a bubble artifact as a staged inert law fragment.

Guarantee:

- preserves a bubble artifact without immediate execution
- serves as a provenance-bearing semantic object for later generation or transformation

Current implementation:

- stored as staged source text rather than as a fully parsed nested semantic object

### `generator`

Meaning:

Defines a parameterized family builder over a quoted bubble artifact.

Guarantee:

- expresses intensional world-family generation rather than one concrete world instance
- should remain inspectable and lineage-bearing

Current implementation:

- lowers as a named generator linked to a quoted artifact
- current runtime substitution semantics remain conservative

### `reflect`

Meaning:

Requests bounded self-reference.

Guarantee:

- makes self-description explicit and limited
- should never become unrestricted same-stage self-execution

Current implementation:

- captures a narrow set of reflection paths for emitted artifacts

### `emit`

Meaning:

Requests staged materialization from a quoted or generated artifact.

Guarantee:

- does not mean ambient execution of all possible worlds
- turns a staged artifact into either a descendant-world slice or a materialized artifact record
- must preserve provenance, reflection, and replayability

Current implementation:

- materializes descendants or artifacts through the hatchery runtime

### `grammar`

Meaning:

Declares a staged language artifact.

Guarantee:

- treats language-level transformation as a bubble output rather than hidden parser mutation
- preserves compatibility and provenance boundaries

Current implementation:

- lowers structured profile-extension grammar artifacts into IR

### `activate grammar`

Meaning:

Declares a staged compatibility request for a grammar artifact.

Guarantee:

- records intent to activate a grammar profile at a later boundary
- is not immediate same-stage parser mutation

Current implementation:

- exposed as staged activation plans and queryable inspection or replay data

## Boundary

A world boundary is the semantic membrane that separates law-local evolution from cross-bubble or exterior influence.

It is not only a module boundary.

It is the place where Bubble must distinguish:

- internal world event
- cross-bubble or negative-sea residue
- anchor-driven record drift

Boundary semantics are therefore part of world ontology, not tooling afterthoughts.

## Materialization

Materialization is selective realization of a causally relevant slice.

It is not whole-world execution.

Guarantee:

- the language may define more world structure than is presently materialized
- runtime should materialize only the slice required by the current semantic boundary, query, or activation path
- materialization must preserve lineage, provenance, and replay identity constraints

## History

History is not identical to all generated state.

Bubble distinguishes at least two layers.

- latent or regenerable content that may still be recomputed or left unresolved
- committed history that has become durable record for the same world

`commit` therefore means durable fixation into history, not mere existence.

## Anchor Point

The anchor point is the criterion for same-world identity.

It is not first defined as a location marker or a trust score.

Those are derivative uses.

Primary guarantee:

- decides whether history belongs to the same world
- decides whether replay returns to the same world
- decides whether a disturbed branch still counts as the same world
- stabilizes boundary interpretation and lineage continuity

Current implementation:

- anchor strength is still inferred from multiple runtime signals
- source may now author one `anchor identity = <expression-or-description>` declaration as an explicit same-world criterion
- the current runtime can execute only the shared expression subset for that criterion; broader anchor semantics remain open

## Replay Identity

Replay returns to the same world only if the replayed state satisfies the bubble's anchor criterion and identity defect remains within same-world tolerance.

Replay equality is therefore stronger than artifact equality and weaker than byte-for-byte state identity.

This is why Bubble needs anchor semantics in the first place.

## Lineage

Lineage is the structured relation by which one bubble stands in ancestry, derivation, or placement relation to others.

Guarantee:

- lineage is part of world identity, not just indexing convenience
- addresses should be lineage-relative whenever practical rather than relying on a cheap absolute global coordinate

Current implementation:

- root bubbles receive source-relative addresses
- descendants receive lineage-relative addresses and templates

## Lifecycle Vocabulary

Bubble needs one shared lifecycle vocabulary.

The minimum current semantic set is:

- `latent`: semantically admitted but not presently materialized
- `planned`: selected by semantic planning for possible realization
- `materialized`: instantiated as an active runtime slice or artifact in one run
- `observed`: exposed through an observation surface
- `committed`: fixed into durable history for the same world
- `drifting`: still a world, but anchor or boundary stability is degrading
- `collapsed`: retired or resolved as a live world continuation
- `replayed`: re-instantiated from preserved run history for inspection or comparison

Important distinction:

- `potential` versus `materialized` in current `effect-trace` records is effect-state vocabulary, not full world lifecycle vocabulary

### Observation-Induced Transition Envelope

If Bubble later reopens observation-induced materialization, the first implementation slice should not begin from full stochastic world semantics.

It should begin from one narrow state-transition contract.

For one latent region or latent descendant candidate, the minimum transition model is:

- `latent -> observed` when an authored observation surface or explicit cross-boundary interaction causes local materialization
- `latent -> committed` is invalid; nothing should become durable history without first becoming concrete in one run
- `observed -> observed` when a later interaction changes local state lawfully but does not yet fix durable history
- `observed -> committed` when commit or an equivalent anchor-bearing history event fixes the current observation result as same-world history
- `committed -> observed` means revisitation of committed history, not regeneration of pristine latent possibility
- `committed -> latent` is invalid for same-world replay; that would erase history rather than revisit it

The first implementation slice should therefore treat observation as a state transition that may emit evidence, perturbation residue, and anchor consequences rather than as a silent read.

### Observation-Induced Materialization Invariants

Any future implementation of this branch must preserve at least these invariants.

- latent regions remain compact semantic objects rather than hidden full-state snapshots
- observation may localize and deform a region, but only through authored Bubble semantics plus explicit runtime state, not opaque host randomness
- commit fixes one observed trajectory as history; replay of the same world must revisit that committed trajectory rather than regenerate the untouched latent law
- contradiction, lawful observation-induced divergence, and anchor drift must remain distinguishable in proof
- observation path, nearby history, and boundary pressure may affect materialization only if the resulting causal basis remains inspectable

### Minimal First Slice For Implementation

The first implementable version of observation-induced materialization should stay smaller than the full research vision.

It should include only:

- one explicitly marked latent region or latent descendant site
- one authored observation-triggered materialization rule
- one explicit perturb contribution that can modify the first concrete realization
- one commit path that records the observed result into history
- one replay check that distinguishes revisiting committed history from first-time latent realization
- one proof surface that can still say `certified | contradicted | undetermined` about same-world identity after observation

It should exclude, for the first slice:

- probability clouds
- hidden host randomness
- multi-region collapse coupling
- distributional replay identity
- generalized observer-dependent semantics across the whole language

### Required Semantic Surfaces Before Code Widening

Before Bubble adds new source syntax for this branch, the semantic contract should be explicit for at least these objects.

- latent-region descriptor: what is stored before observation
- observation event: what counts as a causal read-write boundary
- perturb contribution: how authored perturbation mixes into first realization
- collapse record: what evidence proves that a latent region became concrete
- commit boundary: what makes the realized result durable same-world history
- replay judgment: what distinguishes revisitation of committed history from nearby-world drift

Without that contract, observation-induced materialization would widen syntax faster than it strengthens Bubble semantics.

## Effect Semantics

The word `effect` currently carries too much weight.

The long-term semantic split should be this.

- capability: what a bubble can do
- obligation: what a bubble must preserve or admit
- permission: what may occur without being required
- event: what actually occurred in one run
- pressure: what acts on the world even without a discrete event
- trace: what remains as replayable semantic record after the fact

Current implementation already partially separates these layers:

- declaration time: effect kind plus required or optional surface
- planning time: obligations and generation relations
- materialization time: effect traces marked `potential` or `materialized`
- ontology time: pressure signals from branch, leak, debt, perturb, and related structure

But this split still needs to become explicit in the specification and later in IR.

## Composition Model

Bubble cannot remain only a one-root-per-file bootstrap forever if it is meant to be a multiverse language.

The semantic composition target is:

- bubble bundle: a packaging unit containing related bubbles with explicit provenance and boundaries
- bubble family: an intensional family definition rather than one enumerated world list
- cross-bubble relation: typed relation among bubbles, such as lineage, adjacency, coupling, or shared boundary
- shared boundary: an explicit membrane relation between two or more bubbles
- materialization scope: a query or contract that selects which part of a bundle or family becomes active

Current implementation status:

- semantic plans now carry a first bundle plan containing the root bubble, staged emissions, staged grammar activations, and explicit materialization scopes
- one root bubble per file
- descendant relations within one compiled root bubble
- no multi-bubble source unit or cross-file bubble import yet

Bubble-style import should therefore not be interpreted as raw code inclusion.

It should import a world fragment together with provenance, lineage, and boundary contract.

## Partial, Unknown, And Constraint Model

Bubble's long-range necessity depends on being able to preserve what is not yet explicit.

The required semantic objects are:

- `unknown`: a value or entity not yet resolved even though the world admits it
- `latent`: something that may exist or become active without being presently materialized
- `partial`: a world, law, or object given only by incomplete specification
- `constraint`: a condition that narrows admissible worlds without naming one explicit final value
- `hidden`: world structure present in the world but outside the current observation surface
- `unobservable`: structure not directly available to a given observer map under current conditions

These are not optional conveniences.

Without them, Bubble reduces toward a DSL for explicit generated state instead of a language for partially unknowable multiverses.

Current implementation status:

- Bubble IR now has a first minimal unresolved semantic-fragment surface for `unknown-value`, `unknown-entity`, `constraint`, `partial-law`, `hidden-region`, `unobservable-relation`, and `latent-bubble`
- `bubbles.v0.4` source now has a first authoring surface for those unresolved semantic objects
- the current proof certificate can use those fragments as explicit `undetermined` basis for internal semantic consistency claims
- there is still no solver or completion engine for this area, so it remains a partially implemented core feature rather than a completed one

## Core Versus Profile

Bubble core should own:

- bubble identity
- boundary and membrane semantics
- lineage and address contracts
- partial materialization
- history and replay identity
- effect provenance
- anchor semantics
- staged generation and staged language-boundary rules

Profiles may add new source forms or IR objects, but they should not redefine those core contracts.

## Bounded Consistency Certificates

Bubble should not claim absolute contradiction-freedom for every authored world.

Its first proof surface should instead be a bounded consistency certificate attached to the semantic plan.

That certificate should record, under the declared profile and current semantic runtime, which claims are:

- `certified`
- `contradicted`
- `undetermined`

The current runtime contract uses `bubble-consistency-certificate.v1` and treats the certificate as a machine-readable record of relative semantic standing, not as a final metaphysical proof.

At minimum, this certificate should carry bounded claims for:

- well-formed source
- minimum authored shape
- worldhood roles present
- required-effect obligations
- anchor identity
- lineage traceability
- replay identity basis
- internal law consistency

This is the correct direction for Bubble's automatic proof layer.

It lets the language emit explicit proof residue even when some semantic obligations remain open.

## Proof Obligations

This specification requires more proofs than the current repository yet contains.

At minimum, Bubble still needs explicit mathematical proof obligations for:

- world independence and worldhood criteria
- replay identity preservation
- partial materialization soundness
- composition and import preservation of lineage and boundary semantics
- sound separation of ontic world state from epistemic observation state
- effect provenance and effect-trace soundness
- anchor identity semantics under branching, collapse, and replay

The bounded consistency certificate is therefore not a replacement for these proofs.

It is the first executable record of which proof obligations have been discharged, contradicted, or left open in one concrete Bubble plan.

The current sea-anchor proof covers only one slice of this larger semantic program.

## Current Priority

Until this semantic specification is stable enough, Bubble should prefer semantic clarification over new surface syntax.

That means the immediate priority is not arbitrary feature growth.

It is tightening the guarantees around:

- worldhood
- lifecycle
- composition
- partiality and unknowns
- effect roles
- anchor identity
