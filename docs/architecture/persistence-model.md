# Persistence Model

## Core Claim

A potentially unbounded multiverse cannot be stored extensionally on a finite machine.

It must be stored intensionally.

That means the system stores a compact specification for generating worlds, not the full explicit state of every world.

## Extensional vs Intensional Storage

### Extensional storage

Store every object, region, and state explicitly.

This is impossible for an effectively infinite multiverse and wasteful even for very large finite worlds.

### Intensional storage

Store:

- generative laws
- seeds or world addresses
- lifecycle rules for world birth and collapse
- local deviations from default generation
- committed event history for observed or causally fixed regions

The world is then reconstructed on demand.

For research use, that reconstruction path also needs a durable run record.

Some questions should be answered against a preserved materialized run rather than by silently regenerating the world from source and hoping the same query surface appears again.

## Proposed Representation

Represent each bubble universe by something like:

- World Address: identifies a world in the multiverse index
- Axiom Pack: local laws and allowed transitions
- World Will: latent governing principle or objective
- Seed State: compact initializer for procedural structure
- Patch Set: deviations from default generative output
- History Log: irreversible observed or committed events
- Summary State: compressed statistics for inactive regions
- Replay Record: a persisted materialization bundle that keeps plan, artifacts, commits, and trace together for later inspection

## Hierarchical Addressing

If worlds can generate further worlds, a world address should not be treated as a flat identifier only.

It should be able to encode hierarchical or generative position.

That may include components such as:

- ancestor path or generative lineage
- local branch identity
- spawned descendant index or family key
- latent family descriptor for worlds that are not yet fully materialized

This allows the system to reason about large or open-ended world-of-world structure without pretending the full hierarchy is already concrete.

## Materialization Rule

A world or region should be materialized only if at least one of the following holds:

- it is currently observed by an agent
- it lies in the causal future or causal past of an active process that must be resolved
- it contains committed history that cannot be regenerated from a seed alone
- it is needed by an inspector or experiment query

Otherwise it should remain latent.

## Observation Principle

Observation is not only a read operation. It can also be a persistence event.

Once an agent observes something, the system may need to preserve:

- what was observed
- under which world laws it was observed
- which later states must remain compatible with that observation

That preservation should become an explicit evidence layer rather than remaining only an implicit side effect of trace accumulation.

This turns observation traces into part of the world's committed structure.

## Star Problem

The multiverse analogue of "there are too many stars to record" should be handled by layered resolution.

For distant or irrelevant structure, store only:

- seeds
- summaries
- aggregate distributions
- causal interfaces

Generate fine detail only near active agents, active measurements, or inspection targets.

## Infinite Case

If the multiverse is literally infinite, only finitely describable subfamilies can be represented in software.

Therefore the practical goal is not to store infinity itself, but to store:

- a finite rule system that defines an unbounded family of worlds
- an addressable subset that can be queried or generated
- a finite committed history induced by actual interaction

## Performance Consequence

This intensional model is also the performance model.

If the system tries to eagerly expand every implied world, it will fail both as research infrastructure and as a multiverse model.

The implementation should instead optimize for:

- lazy materialization of only causally relevant hierarchy slices
- stable replay from compact generative descriptions
- durable replay of already materialized experiment runs
- bounded inspection queries over large latent world families
- summaries and caches that preserve semantics rather than hiding them

## Research Consequence

This persistence model is not merely an optimization. It is part of the ontology of the project.

A world can exist in different modes:

- latent possibility
- active simulation
- committed history
- summarized residue

Those modes should influence what agents can infer about reality and where contradictions may appear.
