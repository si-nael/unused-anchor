# Bubble Language v0.4 Unresolved-Semantics Profile

## Purpose

This document defines the first explicit unresolved-semantics profile for Bubble Language.

`v0.4` extends the `v0.3` line by letting authored source preserve semantic objects that are admitted by the world model but not yet fully resolved.

The goal is not to solve those objects completely.

The goal is to stop pretending they do not exist.

## Scope

The `v0.4` profile retains all `v0.3` requirements.

It adds these declarations inside a `bubble` body:

- `unknown value <Name> [= <description>]`
- `unknown entity <Name> [= <description>]`
- `constraint <Name> = <description>`
- `anchor identity = <expression-or-description>`
- `partial law <Name> = <description>`
- `hidden region <Name> [= <description>]`
- `unobservable relation <Name> [= <description>]`
- `latent bubble <Name> [= <description>]`

These declarations are line-oriented like the rest of the current Bubble surface.

They do not yet introduce a solver, a full law algebra, or authored multi-bubble composition syntax.

## Semantic Intent

`v0.4` is the first profile that lets Bubble source say, directly, that some semantic object is real in the authored world but not fully determined.

This matters because Bubble is not trying to be only an explicit state generator.

It is trying to preserve partially knowable multiverse structure without collapsing it into fake certainty.

The current declarations should therefore be read conservatively:

- `unknown value`: some value exists but is not yet resolved
- `unknown entity`: some entity is admitted but not yet identified fully
- `constraint`: some admissibility condition exists without one final explicit witness, but the current runtime can execute the shared expression subset when one is authored directly
- `anchor identity`: the authored same-world identity criterion for replay and disturbance checks
- `partial law`: some law fragment exists but is not yet complete, but the current runtime can execute one minimal shared-expression form when the fragment is authored directly in that subset
- `hidden region`: some world region exists outside the current observation surface
- `unobservable relation`: some relation exists but cannot currently be exposed
- `latent bubble`: some bubble is admitted without current materialization

## Lowering Contract

A `v0.4` compilation should answer at least these questions:

- which unresolved semantic fragments were authored
- which authored name each unresolved fragment preserved in IR
- which unresolved kind each declaration named
- what stable identifier and source line each fragment received
- which descriptive text, explicit or defaulted, was preserved
- whether a constraint lowered into an executable expression witness
- whether a partial law lowered into an executable expression witness
- whether an explicit anchor criterion was authored
- which proof obligations remain open because of those fragments
- which staged bundle members and materialization scopes are now visible in the semantic plan

Unresolved-semantic declarations lower into `bubble.unresolvedSemantics` in Bubble IR.

Each lowered unresolved fragment now also preserves its authored `name` directly in IR instead of forcing later tooling to recover that name from the synthetic id.

`anchor identity` lowers into `bubble.anchorCriterion`.

When one bubble contains `hidden region` or `latent bubble` declarations, the compiler also emits a first `bubble.latentTopology` projection. That draft IR records explicit latent-region descriptors together with collapse-evidence drafts connected to any declared `observe`, `perturb`, and `commit` effects. It is still only a preparation surface, not a full observation-collapse runtime.

The runtime proof layer can cite unresolved fragments directly as `undetermined` basis for `internal-law-consistency`, and it can now execute authored `constraint`, `partial law`, and `anchor identity` expressions inside the current shared expression subset.

When latent-topology drafts exist, the bounded proof layer may also keep `replay identity` or `internal-law-consistency` `undetermined` with latent-collapse basis rather than over-certifying same-world replay before any actual collapse history exists.

The semantic plan now also carries a dedicated executable-semantics surface that records per-constraint, per-partial-law, and anchor-criterion evaluation results directly instead of leaving them visible only through proof-claim text.

When `bubble.latentTopology` exists, the semantic plan now preserves that latent-topology draft directly instead of leaving it visible only in compiled IR.

The semantic plan also now carries a first `bundle` surface that groups the root bubble, staged emissions, staged grammar activations, and their current materialization scopes into one provenance-bearing package shape.

If a source file contains any unresolved semantic declarations or an explicit anchor criterion, the compiler emits:

- `version: "0.4.0"`
- `profile: "bubbles.v0.4"`

## Validation Rules

The current `v0.4` layer adds these checks:

1. unresolved semantic names must be unique within one bubble body
2. grammar artifacts may extend `bubbles.v0.4` as a known base profile
3. only one `anchor identity` declaration may appear in one bubble body
4. unresolved semantic declarations preserve source intent, but only `constraint` and one minimal `partial law` form currently gain executable checking

## Non-Goals

The current `v0.4` profile does not yet provide:

- an executable law solver
- general constraint satisfiability search
- unknown-resolution search over world completions
- authored bundle syntax
- multi-bubble source units
- cross-file bubble import
- anchor semantics beyond the current shared expression subset

Those belong to later versions.

## Example

```bubbles
bubble ThresholdField {
  axiom coherence = stable
  will "preserve partial law under observation"
  seed threshold_seed
  observe witness
  effect observe required
  effect commit required
  unknown value horizonDepth
  constraint membraneBalance = boundary.pressure <= 3
  partial law continuityRule = history.commits and world.seeded
  anchor identity = world.seeded and history.commits
  hidden region OuterCanopy
  latent bubble WaitingArchive
}
```
