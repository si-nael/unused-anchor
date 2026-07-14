# Hypothesis Log

## Active Hypotheses

### H-001: Explicit anchor structure can stabilize independent bubble worlds

Status: active

Claim:

Bubble worlds can remain identifiable as themselves if anchor support is represented explicitly enough to bind laws, history, and replay.

Would be weakened by:

- minimal anchor-aware worlds still losing identity under light pressure
- replay repeatedly failing to return to the same world identity even when the authored support is strong

Next check:

Define one minimal anchor-aware world schema and compare strong-anchor and weak-anchor runs.

### H-002: Negative sea and positive sea can be lowered into operational semantics

Status: partially validated through v0.4.9

Claim:

The negative sea and positive sea can become inspectable runtime semantics rather than remaining only ontology prose.

Current implementation:

- `negativeSea.pressure` and `negativeSea.pressureSources`
- `positiveSea.support` and `positiveSea.supportSources`
- `bubble.seaSemantics` as explicit negative/positive source-kind IR
- `negative-sea-state`, `positive-sea-state`, and separated `anchor-point-state` evidence records
- event-level `event-source-attribution` evidence that can resolve a concrete negative-sea contribution without relabeling every pressure declaration as an executed intrusion
- effect-role, boundary, generation, and staged-emission structure that lower into explicit sea semantics before runtime ontology and proof basis consume them

Remaining gap:

- sea source kinds are now explicit IR support, but still derived from authored structure rather than direct authored sea-law declarations
- there is still no continuous or step-level negative/positive sea dynamics model

Would be weakened by:

- repeated need to explain sea behavior only in external notes rather than in IR or runtime output
- no stable runtime signals for pressure, placement, lineage, or stabilization

Next check:

Decide whether the current explicit IR projection is sufficient, or whether some sea source categories need direct authored law surfaces before richer dynamics work begins.

### H-003: Anchor-aware replay can preserve world identity across materialization boundaries

Status: active

Claim:

Replay and rewind can be made identity-aware if Bubble preserves enough anchor, lineage, and history structure at the runtime boundary.

Would be weakened by:

- replay bundles that reproduce events but not recognizable world identity
- repeated ambiguity about whether a rewound world is the same world or a nearby regenerated variant

Next check:

Define the first replay checks that are explicitly about identity preservation rather than only artifact equality.

### H-004: Apparent inexpressibility can often be lifted into higher-order representation

Status: partially validated by v0.4.1

Claim:

Many world structures that seem inexpressible at one layer can be represented at a richer layer as generators, constraint systems, placeholders, quoted laws, or partially specified semantic objects without collapsing the project into unrestricted host-language programming.

Current implementation:

- unresolved semantic IR for `unknown-value`, `unknown-entity`, `constraint`, `partial-law`, `hidden-region`, `unobservable-relation`, and `latent-bubble`
- executable lowering for parseable `constraint`, `partial law`, `anchor identity`, and parseable world will
- latent topology plus bounded observation materialization law on the plan surface

Remaining gap:

- broader law solving is still intentionally absent
- representability has not yet been tested against cross-file composition, richer observation semantics, or authored collapse policy syntax

Would be weakened by:

- higher-order constructs that cannot be lowered into explicit inspectable IR
- repeated need for opaque escape hatches to express basic target worlds
- evidence that useful higher-order constructs destroy replayability or validation

Next check:

Stabilize the current representability frontier before adding new semantic classes, broader solvers, or cross-file composition.

### H-005: Explicit effect typing can preserve inspectability under world formation

Status: partially validated through v0.4.9

Claim:

World definitions can remain replayable and inspectable even when the language includes semantic nondeterminism, provided every branch and side effect is represented explicitly in the IR and execution trace.

Current implementation:

- `effectRoles` now separate declarations, obligations, permissions, pressures, events, and traces in IR
- runtime emits `effect-trace`, `collapse-record`, `history-commit`, and observation-state evidence
- `effect-trace.causalLinks` now identify the concrete runtime evidence or descendant artifact explained by each authored effect when such a target exists
- `event-source-attribution` consumes concrete effect provenance and preserves direct versus contextual candidates rather than collapsing every declared capability into an executed cause
- observation commit policy and observation materialization law are inspectable plan/runtime surfaces instead of hidden branching only

Remaining gap:

- potential branch and collapse capabilities still lack executed causal targets until the runtime gains concrete transition records for them
- authored commit-policy syntax remains intentionally deferred, so current observation-collapse semantics stay bounded runtime law

Would be weakened by:

- ordinary authored worlds requiring hidden runtime effects outside the declared effect system
- effect traces growing too ambiguous to explain which law caused which world transition
- explicit branching proving too costly to replay or inspect in practice

Next check:

Verify that every emitted causal link resolves inside the same materialization result, and add new link relations only alongside concrete new runtime record types.

### H-006: Bubble can justify itself only through unique semantic leverage

Status: active

Claim:

Bubble Language will be worth keeping only if it can represent and preserve bubble-generative semantics, replay structure, sea-anchor state, and higher-order language artifacts more coherently than a host-language embedding plus ad hoc tooling.

Would be weakened by:

- representative target problems turning out to be equally clear in a host language with a thin configuration layer
- Bubble features repeatedly lowering to little more than reorganized syntax over ordinary implementation machinery
- the language needing opaque escape hatches for the very semantics it claims to make first-class

Next check:

Choose one target task involving world generation, inspection, replay, or grammar staging and compare the Bubble path against a realistic host-language alternative.

### H-007: The Bubble Language bubble has its own membrane surface that can be studied directly

Status: active

Claim:

The language stack itself has identifiable membranes, invariants, and failure modes, and studying those boundaries will produce useful design insight rather than only implementation cleanup.

Would be weakened by:

- the language stack proving to have no meaningful internal membrane classes beyond ordinary software bugs
- reflexive language features providing no analyzable structure beyond convenience

Next check:

Extend the current boundary catalog beyond grammar-profile compatibility into reflective scope, activation-graph, provenance, and runtime-escape-hatch failures.

### H-008: Outside observation can remain bounded and interfering without making bubble worldhood observer-dependent

Status: partially validated by v0.4.1

Claim:

Bubble can treat outside observation as causally limited and trace-bearing while still treating bubble worldhood itself as observer-independent.

Current implementation:

- `hidden-region`, `latent-bubble`, and `unobservable-relation` preserve compressed or observer-bounded interior structure in IR
- observation already leaves `observation-context`, `collapse-record`, `observationState`, and `history-commit` records instead of acting as a silent read-only query
- semantic plans and inspect/replay reports now carry explicit `externalObservationLimit` data summarizing pre-contact boundedness, boundary contact surfaces, and trace consequences

Remaining gap:

- there is still no first-class observer agent or authored contact protocol beyond the current effect and boundary model
- outside observation is still represented as a bounded runtime law surface rather than a richer causal calculus

Would be weakened by:

- runtime paths that let outside inspection recover full concrete interior state without any boundary crossing or trace
- semantic drift toward `nothing exists before observation` rather than compressed lawful existence
- future observer features that make worldhood itself observer-relative instead of keeping only access bounded

Next check:

Keep worldhood observer-free while testing whether explicit contact paths or observer-agent layers are needed beyond the current boundary/evidence model.

### H-009: Evidence-bounded attribution can distinguish sea pressure from anchor drift without false certainty

Status: validated for the bounded v0.4.9 runtime scope

Claim:

The existing authored effect provenance, concrete causal links, sea-source evidence, anchor state, collapse records, and commit records contain enough information for the bounded runtime to classify some observed changes as internal world events, negative-sea pressure, anchor drift, or positive-sea shift while preserving `unresolved-source` when those explanations remain observationally entangled.

Would be weakened by:

- fixtures where the proposed classifier can resolve a verdict only by reading information not present in the current materialization result
- systematic collapse of weak anchor state into false claims that anchor drift actually occurred
- systematic relabeling of authored local perturbation as foreign negative-sea residue
- replay changing an attribution verdict or basis without any change in the stored evidence

Validation evidence:

- focused fixtures resolve internal world event, negative-sea pressure, anchor drift, and positive-sea shift from current-run evidence
- the canonical crossroads fixture preserves simultaneous direct negative-sea and anchor-drift candidates as `unresolved-source`
- regression checks resolve every basis to current-run effect provenance, evidence, ontology, or artifacts
- inspection filters and stored replay preserve verdict, candidates, and basis unchanged

Remaining limit:

The hypothesis is not validated for continuous sea dynamics, cross-world residue transport, multi-region causal coupling, or probabilistic-fractal worldhood. Those ideas remain open and must not be treated as disproved or completed by this bounded result.
