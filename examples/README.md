# Bubble Examples

These examples are meant to run against the current Bubble toolchain, not just illustrate syntax.

For the consolidated language reference, see `docs/reference/bubble-language-reference.md`.

- `first-world.bubble`: minimal `bubbles.v0.1` compile example
- `boundary-orchard.bubble`: `v0.1` observational world with branching and structured spawn conditions
- `meta-grove.bubble`: `bubbles.v0.2` staged quote, generator, and descendant materialization example
- `observatory-loop.bubble`: `v0.2` observation, artifact emission, descendant emission, and evidence example
- `grammar-nursery.bubble`: minimal `bubbles.v0.3` grammar artifact example
- `grammar-canopy.bubble`: `v0.3` layered local grammar-profile chain with default activation resolution
- `attribution-crossroads.bubble`: `v0.4.9` ambiguity fixture where direct negative-sea and anchor-drift evidence must remain `unresolved-source`
- `self-organizing-field.world.json`: `v0.5.2` actor-neutral state-generated structure and anchored causal replay
- `self-maintaining-field.world.json`: `v0.5.3` persistence plus completed bounded `v0.5.4` two-state invariant viability, causally regenerated memory-dependent necessary responses, autonomy ablation, and separate persistence/teleonomic replay
- `distributed-channel-field.world.json`: independent `v0.5.4` teleonomic world with two coupled causal channel coordinates, no scalar phase field or parameter, per-response semantic memory dependence, and mandatory teleonomic run/inspect/record/replay evidence
- `endogenous-branching-field.world.json`: `v0.5.5` actor-neutral world whose internal conflict graph yields two maximal commuting autonomous formation frontiers, preserves one common positive-sea law in both, evaluates World Will separately in each branch, and replays the full plural lineage
- `generational-grove.world.json`: bounded `v0.5.6` world in which one active world law actualizes a latent descendant, the origin retires with residue instead of being deleted, the descendant forms its own boundary, and only the newly active descendant anchor can carry a World-Will condition that its internal law answers
- `generational-seed.causal.bubble`: bounded `v0.5.6` strict causal `.bubble` lowering fixture for the same lifecycle kernel; it explicitly declares exact fields, sea coupling, protected structure, anchors, objectives, local guards, causal birth, retirement, and commits without treating the older descriptive `spawn`/`collapse` IR as executed history

Run the examples through the existing CLI scripts:

- `npm run compile:example`
- `npm run inspect:boundary-example`
- `npm run materialize:meta-example`
- `npm run inspect:meta-example`
- `npm run materialize:observatory-example`
- `npm run inspect:observatory-example`
- `npm run verify:attribution`
- `npm run compile:grammar-example`
- `npm run inspect:grammar-example`
- `npm run inspect:grammar-chain-example`
- `npm run verify:causal-example`
- `npm run verify:branching-example`
- `npm run verify:lifecycle-example`
- `npm run verify:lifecycle-language-example`
- `npm run verify:persistence-example`
- `npm run verify:teleonomy-example`

Generated outputs land under `data/runs/`.
