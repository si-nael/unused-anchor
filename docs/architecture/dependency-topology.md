# Dependency Topology

## Purpose

If the repository adopts a bubble-first vocabulary, dependency rules must stay stricter, not looser.

This document defines how the main slices may depend on each other.

## Main Slices

- `src/bubbles/`: local world semantics, axioms, world will hooks, membranes, patches, materialization rules, language/IR definitions, and effect schemas
- `src/cosmos/`: multiverse-wide orchestration, scheduling, indexing, and lifecycle coordination
- `src/beings/`: agent memory, belief, policy, and learning logic
- `src/traces/`: observations, summaries, evidence records, and committed history interfaces
- `src/inspectors/`: world inspection, boundary analysis, and law inference
- `src/runtime/`: clocks, events, causality, execution primitives, and shared low-level services

## Allowed Dependency Direction

Use this high-level shape:

```text
apps -> cosmos/beings/inspectors
cosmos -> bubbles/traces/runtime
beings -> bubbles/traces/runtime
inspectors -> traces/bubbles/runtime
traces -> bubbles/runtime
bubbles -> runtime
```

## Dependency Rules

### 1. Bubbles own local semantics

`src/bubbles/` defines what a bubble universe is and how it evolves locally.

It also owns the language schemas and IR contracts used to describe bubble universes.

It should not depend on:

- `src/beings/`
- `src/inspectors/`
- app-specific code

### 2. Cosmos orchestrates, but does not redefine

`src/cosmos/` may create, schedule, connect, and retire bubbles.

It should not silently override local bubble semantics. If cosmos changes a bubble, it must do so through explicit lifecycle or boundary interfaces.

### 3. Traces are the evidence boundary

`src/traces/` is where latent worlds become durable evidence.

It may depend on bubble types and runtime services, but it should not import agent policy or inspector strategy code.

Effect traces should be part of this boundary rather than being hidden in unrelated logs.

### 4. Beings do not reach into storage internals

`src/beings/` should perceive the world through public bubble interfaces and trace views.

Agents should not directly manipulate patches, histories, or hidden multiverse indices unless that capability is explicitly part of the world.

### 5. Inspectors analyze, but do not secretly run the world

`src/inspectors/` may read traces, summaries, and public bubble snapshots.

It should not become a hidden owner of simulation state. Any mutation pathway used by inspectors must pass through explicit experiment hooks.

### 6. Apps stay thin

`apps/` should assemble workflows, not host core domain rules.

If a concept matters outside one app, move it into `src/`.

### 7. Language tooling should not smuggle runtime policy upward

Parsing, validation, and lowering from DSL to IR may live under `src/bubbles/`, but authoring tools should not become a back door for agent logic or inspection logic.

### 8. Effect handling must stay explicit across boundaries

`src/bubbles/effects/` may define effect kinds and typing rules, while `src/runtime/` may execute them and `src/traces/` may record them.

No layer should invent undeclared side effects on behalf of another layer.

## Architectural Smell Checks

Reconsider the design if any of these happen:

- beings import inspector internals
- bubbles import agent learning code
- inspectors write directly into world state with no explicit protocol
- traces become a generic dumping ground for unrelated serialization code
- app folders accumulate core logic that should live in `src/`

## Why This Matters

The naming scheme only helps if it sharpens the ontology.

The repository should feel unusual because the project is unusual, not because the module graph is obscure.
