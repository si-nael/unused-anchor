# Repository Strategy

## Recommendation

Do not split the project into multiple repositories yet.

Keep one repository and run two explicit workstreams inside it:

- research
- language

## Why One Repository Is Better Right Now

At the current stage, the two directions are not independent products.

They share the same core assets:

- bubble ontology
- world-definition semantics
- Bubble IR
- effect vocabulary
- runtime assumptions
- scenario corpus

If these are split too early, one of two bad outcomes usually follows:

- duplicated semantics that slowly diverge
- tight cross-repo coupling that makes every change expensive

## Recommended Internal Split

Treat the repository as having three layers.

### 1. Research workstream

Primary concerns:

- contradiction classes
- anomaly-detection tasks
- scenario design
- evaluation and inspection
- transfer experiments

Likely centers of gravity:

- `docs/research/`
- `docs/scenarios/`
- `apps/inspector/`
- `tests/scenario/`
- `data/runs/`

### 2. Language workstream

Primary concerns:

- DSL design
- Bubble IR
- effect system
- validation rules
- lowering and tooling

Likely centers of gravity:

- `src/bubbles/language/`
- `src/bubbles/ir/`
- `src/bubbles/effects/`
- language-facing validation and compiler tooling

### 3. Shared semantic kernel

Primary concerns:

- axioms
- runtime semantics
- traces
- materialization rules

Likely centers of gravity:

- `src/bubbles/axioms/`
- `src/runtime/`
- `src/traces/`
- selected parts of `src/bubbles/`

## Decision Rule

Research and language may proceed in parallel only if they change the shared semantic kernel through explicit documents, interfaces, and tests rather than ad hoc local assumptions.

## When A Split Might Make Sense

Consider splitting repositories later only if all of the following become true:

1. the Bubble IR is stable enough to serve as a public contract
2. the effect model is stable enough that changes are versioned rather than constantly renegotiated
3. the language tooling and the research runtime have clearly different release cadence
4. each side can be tested without editing the other side on most changes

If those conditions are not met, splitting is overhead, not clarity.

## Practical Recommendation

Make the split conceptual first, not infrastructural.

Use one repository, one log system, one ontology, and two clearly named workstreams.

That keeps the project's color sharp without introducing premature repository boundaries.
