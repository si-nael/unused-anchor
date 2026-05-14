# Bubble Language v0.2 Meta Profile

## Purpose

This document defines the first staged meta layer for Bubble Language.

`v0.2` extends the `v0.1` world-definition kernel with explicit syntax for quoted bubble artifacts, artifact generators, controlled reflection, and staged emission.

The goal is not unrestricted self-evaluation.

The goal is a minimal reflective layer that stays inspectable.

## Scope

The `v0.2` profile retains all `v0.1` requirements.

It adds these declarations inside a `bubble` body:

- `quote <Name> = <artifact source>`
- `generator <Name>(<param>) from <QuoteName>`
- `reflect self.address`
- `reflect self.worldWill`
- `reflect self.seed`
- `reflect self.profile`
- `emit <Name>(<arg-expression>) as descendant`
- `emit <Name> as artifact`

The current implementation keeps the surface syntax line-oriented.

Quoted artifacts are stored as staged source strings rather than nested parsed subtrees.

The current implementation now uses the shared expression layer for `emit` arguments as well as spawn conditions, but generator emission currently accepts only scalar literal or reference expressions at runtime.

## Semantic Intent

`v0.2` introduces four meta constructs.

- `quote`: captures a bubble artifact as inert inspectable data
- `generator`: defines a parameterized derivation from quoted material
- `reflect`: reads a bounded view of the current bubble context
- `emit`: records an activation request for a quoted or generated artifact

`emit` is still staged at compile time.

It lowers into IR with provenance first.

The current runtime now provides a separate materialization step that can activate emitted artifacts into derived bubbles or reusable artifacts while preserving trace and commit data.

The current runtime also provides an inspection step that summarizes plans, materialized artifacts, commits, and trace events into a stable report surface.

That inspection surface now supports narrow queries by emission identity, derived address, and trace-event kind so the runtime can be used as an actual research instrument rather than only a report dumper.

The runtime now also provides a replay-record step that persists one materialized run into a durable bundle so later queries do not require recompiling or re-materializing the original source bubble.

The runtime now exposes observation and commit evidence as first-class evidence records, so observation is no longer recoverable only by interpreting raw trace and commit structures after the fact.

## Lowering Contract

A `v0.2` compilation should answer at least these questions:

- which quoted artifacts were declared
- which generators derive from which quotes
- which bounded reflections were requested
- which emitted artifacts were requested
- whether an emission originated from a quote or a generator
- which reflections were in scope before each emission

These declarations lower into `bubble.meta` in Bubble IR.

The current runtime layer can additionally produce:

- a semantic execution plan from the compiled IR
- materialized descendant bubbles or artifacts from `emit` declarations
- reflection capture records used during materialization
- trace and commit outputs for each materialized emission
- inspection reports that summarize the resulting plan, artifacts, commits, and trace
- filtered inspection views that can isolate one emission, one derived address, or one trace-event class
- replay records that preserve one materialized run for later filtered inspection
- evidence records that preserve observation context and durable history commitments

If a source file contains any `quote`, `generator`, `reflect`, or `emit` declarations, the compiler emits:

- `version: "0.2.0"`
- `profile: "bubbles.v0.2"`

Otherwise it stays in `v0.1`.

## Validation Rules

The current `v0.2` layer adds these checks:

1. quote and generator names share one meta namespace and may not collide
2. every generator must reference an existing quote
3. reflect paths must stay within the bounded supported set
4. every emit source must resolve to an existing quote or generator
5. emits from quotes may not pass call arguments
6. emits from parameterized generators must supply an argument
7. emits from zero-parameter generators may not supply an argument
8. emits to parameterized generators may currently pass only scalar literal or reference expressions

## Non-Goals

The current `v0.2` profile does not yet provide:

- unrestricted same-stage self-evaluation
- nested block parsing for quoted artifacts
- staged grammar artifacts or grammar activation requests
- cross-file meta imports
- optimizer or planner support for meta artifacts

The current runtime still does not provide:

- full causal simulation for emitted descendants
- optimizer-level rewrites for meta artifacts
- cross-file activation pipelines for meta imports

Those belong to later versions.

## Commands

- `npm run plan:meta-example`
- `npm run materialize:meta-example`
- `npm run inspect:meta-example`
- `npm run record:meta-example`
- `npm run replay:meta-example`
- `npm run verify`

The inspector CLI additionally accepts:

- `--section summary|plan|artifacts|commits|trace|report`
- `--section evidence`
- `--emission <emission-id>`
- `--address <address-id>`
- `--kind <trace-kind>`

## Example

```bubbles
bubble Nursery {
  realization deterministic
  axiom coherence = stable
  will "grow derived worlds"
  seed nursery_seed
  effect spawn required
  quote Sapling = bubble Sapling { realization deterministic axiom coherence = stable will 'preserve inner symmetry' seed latent_seed effect spawn required }
  generator Grove(seedName) from Sapling
  reflect self.address
  reflect self.worldWill
  emit Grove("ember_seed") as descendant
}
```
