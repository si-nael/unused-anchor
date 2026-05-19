# Sea-Anchor Necessity Proof

## Status

This document gives a formal proof inside the Bubble semantic model.

It does not claim to prove a metaphysical truth about all possible worlds.

It proves a narrower and more useful statement:

if Bubble is to model an independent world that is open, situated, and replay-identifiable, then it necessarily factors into three irreducible semantic roles:

- negative sea
- positive sea
- anchor point

## Formal Setting

Let a bubble world be represented by a tuple

$$
B = (L, H, \partial B, \mathcal{R}, \sim)
$$

where:

- $L$ is the local law basis of the world
- $H$ is the currently admitted history or record surface
- $\partial B$ is the world boundary or membrane
- $\mathcal{R}$ is the structured field of lineage, placement, and admissible continuation relations
- $\sim$ is the identity relation used to decide whether replayed or observed states still count as the same world

Bubble requires the following axioms.

### Axiom 1: Openness

The world is not a totally closed object.

There exist admissible disturbances, residue traces, or unresolved influences not determined purely by $L$ and $H$.

### Axiom 2: Situatedness

The world is not an isolated point.

It belongs to a structured field $\mathcal{R}$ that supports lineage, placement, growth, or continuity relative to other worlds or prior states.

### Axiom 3: Identity Persistence

Observation, replay, or rewind must be able to ask whether two admissible states are still the same world.

Therefore $\sim$ cannot be trivial or omitted.

## Definitions

From those axioms, define three semantic roles.

### Negative Sea

The negative sea is the minimal term required by openness.

It is the loosening side of the model: outside residue, boundary disturbance, unresolved ingress, branch pressure, and law perturbation.

Call its operational magnitude $N$.

### Positive Sea

The positive sea is the minimal term required by situatedness.

It is the structuring side of the model: lineage, placement, durable continuity, and growth-support.

Call its operational magnitude $P$.

### Anchor Point

The anchor point is the minimal term required by identity persistence.

It is the fixpoint that lets Bubble distinguish "the same world under disturbance" from "a nearby or replacement world."

Call its operational magnitude $A$.

## Theorem 1: Necessity

Any Bubble model satisfying Axioms 1-3 requires negative sea, positive sea, and anchor point as distinct semantic roles.

### Proof

Assume first that there is no negative-sea role.

Then all admissible state change is either internal law or already-fixed history.

That contradicts Openness, because $\partial B$ no longer separates internal world evolution from outside residue, leakage, or unresolved pressure.

So a negative-sea term is necessary.

Assume next that there is no positive-sea role.

Then the world has no structured placement or lineage support in $\mathcal{R}$.

It may remain a transient local state, but it no longer has the relation structure required for Situatedness.

So a positive-sea term is necessary.

Assume finally that there is no anchor-point role.

Then replay or observation may produce nearby admissible states, but nothing in the model decides whether they are still the same world under $\sim$.

That contradicts Identity Persistence.

So an anchor term is necessary.

Because each omitted role breaks a different axiom, the three roles are not interchangeable.

Therefore negative sea, positive sea, and anchor point are jointly necessary and irreducible inside Bubble's formal model.

## Theorem 2: Operational Worldhood Margin

Once the three roles exist, Bubble can define a worldhood margin.

Let

$$
N, P, A \in \{0, 1, 2\}
$$

be ordinal ranks for negative pressure, positive support, and anchor strength.

Define

$$
M = A + P - N
$$

and the identity margin

$$
I = A - N
$$

Then Bubble classifies a world as:

- stable, if $A > 0$ and $M \ge 2$
- stressed, if $A > 0$ and $0 < M < 2$
- dissolving, otherwise

### Why This Follows

- $N$ measures how strongly the world is being loosened
- $P$ measures how much structured support the world receives from lineage and continuity
- $A$ measures whether the world still has a fixpoint of identity at all

If $A = 0$, the model no longer has enough identity fixation to preserve same-world replay.

If $A + P \le N$, dissolving pressure is not outweighed by structure and fixation.

If $A + P > N$ but only narrowly, the world remains interpretable but stressed.

If $A + P$ clearly exceeds $N$, the world remains stably itself.

## Implementation Mapping

The current runtime implements this theorem witness in the ontology layer.

Current ordinal mapping:

- negative sea: `low -> 0`, `elevated -> 1`, `high -> 2`
- positive sea: `weak -> 0`, `present -> 1`, `strong -> 2`
- anchor point: `weak -> 0`, `steady -> 1`, `strong -> 2`

The runtime then emits:

- `negativeRank`
- `positiveRank`
- `anchorRank`
- `worldhoodDelta = A + P - N`
- `identityDelta = A - N`
- `condition = stable | stressed | dissolving`

This is not yet the final causal control layer.

It is the first formal witness that the sea-anchor model is not decorative vocabulary but part of Bubble's semantic contract.
