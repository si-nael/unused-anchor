# Repository Plan

## Purpose

The discarded AIPS layout is a good reference for separation of concerns. It should inform the future repository structure without forcing premature implementation.

## Bubble-First Layout

```text
.
├─ README.md
├─ docs/
│  ├─ vision/
│  ├─ architecture/
│  ├─ scenarios/
│  ├─ research/
│  └─ process/
├─ apps/
│  ├─ hatchery/
│  ├─ companion/
│  ├─ inspector/
│  └─ observatory/
├─ src/
│  ├─ cosmos/
│  ├─ bubbles/
│  │  ├─ axioms/
│  │  ├─ effects/
│  │  ├─ language/
│  │  ├─ ir/
│  │  ├─ will/
│  │  ├─ seeds/
│  │  ├─ membranes/
│  │  ├─ patches/
│  │  ├─ history/
│  │  └─ materialization/
│  ├─ beings/
│  ├─ traces/
│  ├─ inspectors/
│  └─ runtime/
├─ data/
│  ├─ seeds/
│  ├─ patches/
│  ├─ traces/
│  └─ runs/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ scenario/
└─ legacy/
```

## Recommended Interpretation

- docs/: theory, vision, scenarios, and architecture notes
- apps/hatchery/: births, collapses, and lifecycle experiments for bubble universes
- apps/companion/: embedded agent experience inside a local world slice
- apps/inspector/: world inspection, boundary analysis, and lineage views
- apps/observatory/: multiverse browsing, summaries, and experimental views
- src/cosmos/: multiverse index, scheduling, lifecycle control, and cross-bubble coordination
- src/bubbles/: the main ontology layer for bubble universes, their language, and their internal structure
- src/beings/: agent memory, belief state, learning, and action policies
- src/traces/: observations, committed history, summaries, and evidence interfaces
- src/inspectors/: world-state inspection, boundary checks, and law inference
- src/runtime/: events, clocks, causality, and execution services
- data/: seeds, local patches, traces, saved runs, and experiment outputs
- tests/: unit, integration, and scenario validation
- legacy/: preserved prior experiments or discarded implementations

## Naming Rule

Use distinctive ontology-driven names only where the concept is central to the project.

- `bubbles` is the primary domain object, so it should be a first-class folder.
- `cosmos` is acceptable for multiverse-wide coordination.
- `beings` and `traces` are acceptable if their responsibilities stay precise.
- Avoid decorative names that hide concrete responsibilities.

## Dependency Shape

The repository should follow a bubble-centered dependency topology.

- apps depend on domain packages but do not contain domain logic
- cosmos orchestrates bubbles but should not own their local semantics
- beings observe bubbles through public interfaces and traces
- inspectors analyze traces and snapshots without becoming world mutation hubs
- traces sit at the boundary between latent generation and committed history

See [dependency-topology.md](dependency-topology.md) for the stricter rule set.
See [bubble-language.md](bubble-language.md) for the language strategy.
See [effect-model.md](effect-model.md) for nondeterminism and effect semantics.
See [repo-strategy.md](repo-strategy.md) for how to run research and language workstreams together.

## Workstream Strategy

The project currently has two strong centers of gravity:

- research: sea-anchor worlds, boundary behavior, experiments, and evaluation
- language: world-definition syntax, IR, effects, validation, and compilation

These should be treated as separate workstreams inside one repository, not as separate repositories yet.

Why:

- both tracks depend on the same ontology
- both tracks need the same Bubble IR and effect vocabulary
- splitting too early would create duplicated semantics and coordination overhead

The shared kernel should stay in:

- `src/bubbles/axioms/`
- `src/bubbles/ir/`
- `src/bubbles/effects/`
- `src/runtime/`

The research-heavy surface should concentrate in:

- `docs/research/`
- `docs/scenarios/`
- `apps/inspector/`
- `tests/scenario/`
- `data/runs/`

The language-heavy surface should concentrate in:

- `src/bubbles/language/`
- validation and lowering logic near `src/bubbles/ir/`
- future authoring tools around the language stack

If a future split is needed, the shared kernel must be isolated first.

## Phased Adoption

### Phase 0

Keep the repository light and document-first.

### Phase 1

Create only the minimal executable slices:

- apps/hatchery/
- apps/inspector/
- src/bubbles/
- src/beings/
- src/inspectors/
- tests/unit/

### Phase 2

Add multi-agent simulation and persistent run artifacts.

### Phase 3

Add multiverse composition, bubble boundaries, and cross-world inspection.

### Phase 4

Add lazy world materialization, region summaries, and lifecycle policies for large or effectively unbounded world collections.

## Practical Rule

Repository growth should follow validated research milestones, not speculative completeness.
