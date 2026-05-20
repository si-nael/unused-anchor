# Effect Model

## Premise

This project can support a nondeterministic world-definition language.

But nondeterminism is only useful if its consequences are explicit.

The guiding rule is simple:

world generation may have side effects, but those side effects must be part of the authored semantics.

## Core Principle

A world definition should not evaluate only to a world state fragment.

It should evaluate to something closer to:

`result = world_delta + effect_trace + obligations`

This makes side effects inspectable rather than accidental.

## Primitive Effect Candidates

### `branch`

Creates or exposes a new possible continuation.

### `spawn`

Creates a new bubble universe, region, or local regime.

### `collapse`

Retires, resolves, or merges a branch or world.

### `commit`

Turns an event, observation, or state into durable history.

### `leak`

Transfers influence, information, or structure across a membrane.

### `debt`

Records an unresolved future obligation, such as deferred consistency repair or mandatory later resolution.

### `perturb`

Applies a deliberate disturbance to local laws, parameters, or environment.

### `observe`

Represents an interaction that forces disclosure, commitment, or refinement.

## Why This Matters

The user idea is strong precisely because it makes world generation costly in meaning.

Some worlds should not come for free.

If an author asks for a certain kind of world, the language may say:

- you can have that world, but it creates branch pressure
- you can have that symmetry break, but it incurs consistency debt
- you can have that observation, but it commits history and destroys alternatives

That is much more interesting than ordinary random generation.

## Static Requirements

Every effectful construct should declare:

- which effect kinds it may emit
- whether the effect is mandatory or optional
- whether the effect is local, membrane-crossing, or multiverse-wide
- whether the effect is replayable, summarizable, or history-committing

## Runtime Requirements

The runtime should preserve:

- branch identity
- effect provenance
- commit history
- unresolved obligations
- enough information for replay or postmortem inspection

Current implemented slice:

- `commit` lowers into declared-history-support lifecycle behavior and, when one run actually commits, concrete `history-commit` evidence
- `collapse` lowers into lifecycle support for retirement semantics
- `leak` raises negative-sea pressure as explicit membrane stress
- `debt` weakens anchor support and guards rewind stability as an unresolved obligation signal
- `perturb` raises negative-sea pressure and anchor stress as explicit law disturbance
- authored effects now also emit first-class `effect-trace` runtime records with provenance, scope, current-run signals, and whether they remained potential or became materialized in that run

## Non-Goal

Do not confuse this with "anything can mutate anything."

That is not a powerful effect model. It is just loss of semantic control.

## Research Value

An explicit effect model lets the project study questions such as:

- which worlds are expensive in branching
- which laws generate deferred obligations or anchor stress
- which observations are history-forcing
- whether agents can infer hidden effect structure from finite traces

## Suggested Next Step

The next concrete step is to make effect traces more causal by linking them to the exact runtime records they explain, for example:

- which commits were history-forced by a `commit` effect
- which descendant or branch records were enabled by `spawn` or `branch`
- which ontology or boundary signals were influenced by `leak`, `debt`, or `perturb`
