# Typed Cross-World Anchor/Sea Membrane Candidate

Status: active unversioned Gate B candidate after bounded `v0.5.6`; no release selected

Date: 2026-07-17

## Why this seam exists

Bounded `v0.5.6` can causally birth and retire worlds, but its internal laws are deliberately local. A law cannot read another world's field, because such a read would move information without an anchor, an identity condition, sea interaction, or provenance. The next honest seam is therefore not a general message bus. It is the smallest exact relation by which two already lawful worlds can become materially connected without either the host or World Will puppeteering the receiving world.

This candidate preserves the author's ontology as the source of the design. The implementation is not permission to redefine an anchor as a router, positive and negative seas as decorative scores, or a Bubble as a collection of host callbacks.

## One exact relation

The first candidate admits one directed typed anchor span

`(world_s, port_s, field_s) --anchor/transfer--> (world_t, port_t, field_t)`.

The endpoints must belong to the same declared anchor, name different worlds, and carry the same exact value kind. An irreversible internal law in the source world causes the transfer. If both endpoints are active, the anchor is not cut, and its identity holds before and after the proposed crossing, the transition is atomic:

`field_t := field_s`

`negativeSea_s := negativeSea_s + sourceResidue`

`positiveSea_t := positiveSea_t + targetPlacement`.

Both sea quantities are exact and non-negative, and at least one must be non-zero. Each world's ordinary sea law then recomputes viability. The sea changes are material state changes, not moral labels and not evidence for a universal global sea.

The receiving field must currently be an unprotected `world-condition`. The membrane may establish a condition at the boundary, but it cannot write the receiving world's protected structure. Any structural response is produced later by that world's own internal law:

`source law -> anchor transfer -> receiving-world law`.

These arrows are causal partial order, not elapsed time. The transfer is irreversible evidence, but it creates no committed-history arrow unless a separate durable commit or lifecycle rule warrants one.

## Identity and existence

Anchor identity is evaluated on both sides of a cloned proposed transition. Failure or formal underdetermination blocks the entire crossing before target state or either sea is mutated. A cut anchor also blocks the crossing.

A latent or retired endpoint is inactive. A latent target can receive only after an internal birth event activates it. In that case the transfer cites the birth event as a cause, preserving `birth -> transfer` instead of letting initialized latent coordinates masquerade as an already connected world.

## Deliberately narrow constraints

This first contract accepts only one transfer definition per program. Its causing law cannot also carry local field effects, lifecycle effects, or commits. The source snapshot, transfer target, and sea-accounting coordinates are reserved from competing local writers. This prevents host application order from deciding which value crossed the membrane. These restrictions prevent a first successful example from pretending that general transport composition, concurrent membrane algebra, or mixed-effect commutativity has already been solved.

Static validation and runtime assessment reject:

- a port not present on the named anchor;
- same-world pseudo-transfer;
- mismatched exact value kinds;
- direct transfer into protected structure, a sea coordinate, or viability;
- a source payload taken from a sea or viability coordinate;
- reversible, multiply caused, or mixed-effect transfer laws;
- inactive endpoints, cut anchors, and failed pre- or post-state identity;
- ordinary foreign-world guard bindings that bypass the membrane.

## Executable evidence

[`examples/connected-fields.causal.bubble`](../../examples/connected-fields.causal.bubble) lowers through the strict causal Bubble compiler into the existing causal kernel. With World Will disabled, the source world's internal law emits one exact field snapshot, the crossing leaves negative-sea residue at the source and positive-sea placement at the receiver, and the receiver changes protected structure only through its own law. Run, inspection, stored record, and deterministic same-program replay preserve the transfer event, both identity assessments, the sea effects, and causal edges.

Adversarial tests cover cut anchors, latent endpoints, internal birth before transfer, post-transfer identity failure with atomic rollback, unanchored ports, protected targets, and mixed-effect shortcuts.

## What this does not claim

This candidate is not yet:

- a general multi-anchor transport or routing calculus;
- a global positive or negative sea field;
- conservation, diffusion, continuous membrane dynamics, or bidirectional exchange;
- payload transformation, relation transport, streaming, or repeated transfer;
- concurrent composition among multiple crossings;
- World-Will intervention across worlds;
- dynamic world, port, field, or law generation;
- life, agency, relationship, protagonist, or story;
- a portable BIR, Rust engine, Phase 2 observer, or trans-Turing mechanism;
- a release or proof that the Bubble universe is complete.

The next judgment is adversarial and compositional: determine which restriction can be widened from a concrete organic requirement while preserving identity, autonomy, sea materiality, complete branch/lifecycle provenance, and exact replay. Until then the package remains `0.5.6` and this work remains an unversioned candidate.
