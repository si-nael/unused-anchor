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
- `self-maintaining-field.world.json`: `v0.5.3` derived causal boundary, exact recurrence, memory erasure, sea erosion, internal repair, and persistence replay

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
- `npm run verify:persistence-example`

Generated outputs land under `data/runs/`.
