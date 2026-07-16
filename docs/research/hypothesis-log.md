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

### H-010: Executable world will can produce organic self-realization without a hidden external selector

Status: validated for the bounded v0.5.0 single-frontier scope

Claim:

An authored bubble can derive lawful candidates from its own state and transformation contracts, use its executable world will to admit continuations, and preserve ambiguity honestly without host code selecting a preferred outcome.

Validation evidence:

- the reversible garden selects the only eligible will-admitted transform and can resume through its reciprocal inverse
- deterministic multiple admission produces no continuation and remains `underdetermined`
- nondeterministic multiple admission preserves both continuations as `plural`
- descriptive world will is rejected for the `v0.5` profile
- proof, evidence, causal links, attribution, inspection, and replay expose the same selected frontier

Would be weakened by:

- a runtime path that names or randomly chooses a winner outside the authored world will
- deterministic ambiguity being silently ordered by declaration order
- replay losing selected candidate, state, or governing-will provenance
- required effects being ignored when the will rejects their eligible transformation

Next check:

Extend the same law to one bounded multi-step or concrete branching transition while preserving termination, provenance, and non-forced ambiguity.

### H-011: Bubble order can emerge without imposing a universal clock

Status: partially validated through v0.5.4

Claim:

Bubble can distinguish invariant, reversible, causal, branching, terminal, and committed-history structure without making a universal scalar clock a prerequisite of worldhood.

Validation evidence:

- invariant preservation has `ordering: none`
- reciprocal transforms have `ordering: causal` and no history arrow
- selected commit transform has `ordering: committed-history`, creates one root commit, and records the history arrow
- all self-realization records state `no-universal-clock`
- v0.5.3 unfolds exact causal closures, records configuration-continuation edges, certifies finite causal-configuration lassos, and preserves monotone committed anchor history separately while explicitly keeping closure indices separate from world duration
- v0.5.4 derives a period-two invariant viability set in the same closure coordinates while keeping both `universalClock: false` and the separately growing anchor-history ledger

Would be weakened by:

- materialization count or host timestamps becoming implicit world time
- reversible transitions creating durable commits merely because they ran
- inability to represent a cycle or concurrent causal branches without assigning arbitrary total order

Next check:

Reopen from a concrete need for concurrent recurrence, duration, synchronization, or cross-world order; do not reinterpret closure proof coordinates as metric time.

### H-012: Exact intensional families can preserve infinite denotation under finite observation

Status: validated for the bounded exact v0.5.1 kernel

Claim:

A finite typed definition can denote countably infinite and infinite-dimensional Bubble structure while exact demand evaluation materializes only contacted coordinates, preserves dependency evidence, and reports finite computational limits without shrinking the denoted world.

Validation evidence:

- a basis vector over the natural numbers resolves a coordinate far beyond JavaScript safe integers without enumerating prior coordinates
- an identity operator over `N x N` resolves exact diagonal and off-diagonal values
- guarded Fibonacci recursion resolves only demanded dependencies and records coordinate proof steps
- insufficient budget returns `undetermined`, and non-decreasing recursion fails validation
- narrative fields, anchor identity, and post-intervention hard constraints use the same exact query and proof mechanism

Would be weakened by:

- a supposedly infinite family whose reachable coordinates depend on prior eager enumeration
- floating-point drift changing exact identity or anchor predicates
- budget exhaustion producing a guessed value
- host callbacks adding semantics absent from the formal object

Next check:

Reopen from a concrete required world structure that needs coinduction, symbolic limits, measures, topology, or another form outside the exact countable kernel.

### H-013: Anchor-mediated World Will can shape stories without erasing protagonist agency

Status: validated for the bounded connected v0.5.1 runtime

Claim:

A coupled Bubble world can let World Will optimize explicit objectives by changing conditions through anchors while protagonists retain causally attributable action and the story remains autonomous when intervention is disabled.

Would be weakened by:

- the same alleged intervention occurring after its anchor route is cut without an independent internal cause
- World Will directly selecting a protagonist action and still reporting preserved agency
- a story that cannot continue at all when World Will is disabled
- positive or negative sea changes appearing only in report scores and never in causal viability

Validation evidence:

- disabling World Will or cutting the only anchor preserves the autonomous `aria-explores` action while removing the intervention-dependent story
- the intervention trace names `garden-anchor`, changes opportunity and intrinsic viability, and never mutates the protagonist-choice field directly
- exact negative-sea pressure changes realized viability through a recorded sea-coupling trace
- conflicting objectives and post-state hard constraints reject locally attractive interventions
- deterministic ties remain unresolved, plural mode preserves all equal optima, and resource exhaustion reports an unsearched frontier
- stored replay performs same-program re-execution and preserves selected and unresolved continuation identities

Next check:

Reopen when relationship-dependent action, long-running story persistence, cross-world anchor transfer, or global sea transport is implemented; each extension must repeat the agency counterfactuals.

### H-014: An actor-neutral causal kernel can generate structure without excluding later agency

Status: validated for the bounded v0.5.2 once-per-realization closure

Claim:

A Bubble can form exact causal events and detectable internal organization from state-bound laws without requiring a protagonist or authored story graph, while still preserving the narrative kernel as a valid specialization and preventing World Will from manufacturing protected structure directly.

Validation evidence:

- the canonical field world declares no protagonists and no causal event list
- exact guards generate `condense` and then `self-organize` events from changing coherence state
- the coherent-pattern criterion changes from false to true with exact witness fields and causal provenance even when World Will is disabled
- World Will changes only condition and viability through an identity-checked anchor; a separate internal law changes protected coherence
- simultaneous non-commuting laws and insufficient formal budgets remain `underdetermined`
- run, inspection, stored record, and deterministic replay preserve the emergence assessment
- the complete `v0.5.1` narrative example still validates through its original kernel
- adversarial regressions reject post-state anchor-identity loss, preserve simultaneous co-causes, bound power-set search before allocation, keep viability arithmetic in one trace layer, and detect stored-run tampering

Would be weakened by:

- a generated event whose guard is false or unavailable
- declaration order deciding a non-commuting simultaneous frontier
- an emergence claim with no exact state change or witness fields
- World Will directly writing a protected field and the runtime reporting it as internally emerged
- actor-neutral generalization making an explicitly agent-bearing world unrepresentable

Next check:

The bounded persistence case is now H-015. Reopen H-014 only if a stronger persistent or agent-bearing extension makes actor-neutral worlds unrepresentable or lets World Will manufacture protected structure.

### H-015: Exact recurrence plus counterfactual evidence can certify bounded self-maintenance

Status: validated for the bounded v0.5.3 persistent causal world

Claim:

An unlabeled recurrent field component can be distinguished from a merely repeating pattern when conjunctive law hypercuts are fully mediated by its boundary, identity remains invariant across a causal-configuration lasso, retained memory changes every lawful next continuation under erasure, negative-sea pressure causes an inspectable deviation from the recurrent reference followed by exact internal restoration, and the component has universally counterfactually discriminated outward influence.

Validation evidence:

- a field/law factor graph retains complete conjunctive dependencies and derives one strongly connected field projection containing boundary, identity, integrity, memory, and repair phase without declaring an entity
- negative sea remains outside that component and crosses its incoming law hypercut; every incoming/outgoing crossing law binds boundary state, and pre-formation boundary-state ablation changes every crossing law's realization on every continuation after unrelated recovery is suppressed
- the v0.5.4-compatible canonical fixture enters a two-configuration cycle after formation and repeats after three executed closures with a two-closure period and `universalClock: false`; three restoration commits remain in the monotone anchor ledger, so the full anchored state is not misreported as repeating
- an authored plural World-Will tie produces two lawful persistence paths and the persistence layer unfolds and verifies both rather than selecting one
- identity remains exact at every certified recurrence cut
- erasing retained memory to its pre-formation value prevents repair and changes the external signal on every lawful counterfactual continuation; a synthetic mixed-branch regression remains unresolved
- negative-sea admission causes a distinct deviation event from the recurrent integrity reference, which causes a boundary-and-memory-dependent exact restoration event
- excessive erosion defeats the restoration law and is not misreported as persistence
- a synthetic change-return trace whose alleged disturbance begins away from the recurrent reference is rejected as self-maintenance
- World-Will-disabled execution preserves the self-maintenance cycle
- closure/path exhaustion remains unresolved, underlying contradiction remains contradiction, and stored-record tampering produces replay drift

Would be weakened by:

- a boundary supplied only as an authored entity membership list or pairwise dependency cut rather than a boundary-mediated conjunctive law hypercut
- a memory field whose erasure changes no lawful continuation, or only some plural continuations
- a restoration event with no causal negative-sea predecessor or no exact recurrent-reference deviation and return
- host selection of one recurrent branch while another lawful branch dissolves
- treating state repetition, a field role name, or a stable report score alone as persistence
- calling the certified component an agent without goal, affordance, and same-program response-event evidence

Next check:

Model one internally maintained objective with at least two lawful affordances and universal same-program response-event nonrealization on a certified persistent component. Keep agency, protagonist identity, relationships, and story projection as separate later claims.

### H-016: An authored-goal-free invariant norm can support bounded teleonomic capacity

Status: validated for the completed bounded v0.5.4 causal worlds

Claim:

A certified persistent component has bounded teleonomic capacity when its recurrent configurations form a finite invariant viability set, at least two internal response laws are realized under causally regenerated pairwise-disjoint component states, every factual response occurrence is necessary under universal same-program event-nonrealization and disappears universally when its retained memory is erased, and the same kernel persists with World Will disabled and every anchor cut, without an authored goal or host affordance selector.

Validation evidence:

- the canonical program contains no goal, agent, protagonist, action menu, or story declaration
- the exact recurrent component projection contains two configurations and closes across a period-two causal cycle while committed anchor history continues to grow
- route A and route B restoration laws occur under different exact phase values and both require the derived boundary and retained memory
- suppressing either enabled response event while retaining the same program and response law makes every witnessed selected continuation from its factual closure input leave the two-configuration kernel
- disabling World Will and cutting `maintenance-anchor` preserves persistence and the identical kernel on every lawful path; empty or mixed path evidence cannot certify autonomy
- collapsing the fixture to one response preserves persistence but yields `non-teleonomic`
- a detached phase scheduler preserves persistence and plural necessary restoration but is rejected because it does not causally regenerate the next discriminator input
- a three-state, three-response cycle satisfies the same contract, so the positive result is not restricted to the canonical period-two shape
- an independent two-channel world contains no scalar `phase` field or parameter; both channel coordinates are organically recurrent and both responses satisfy event necessity, memory dependence, autonomy, and replay
- making one response's memory predicate tautological preserves persistence but makes that affordance non-necessary and the complete run `non-teleonomic`
- a two-closure proof bound cannot discover the period-two lasso and remains `undetermined`
- inspection and exact replay preserve response-event nonrealization and autonomy evidence; stored-kernel tampering is rejected

Would be weakened by:

- accepting a field or prose declaration named goal without an invariant and response-event nonrealization witness
- presenting parallel response candidates to a host selector instead of deriving events from internal state guards
- accepting one successful branch when another lawful response-event counterfactual continuation remains inside the kernel
- preserving the capacity only while World Will or an anchor intervention supplies it
- calling a finite certified invariant subset the maximal viability kernel or calling teleonomic capacity agency

Next check:

Only a later version should test the first organically generated relational or simultaneous-alternative structure that could support a stronger agency claim. Require a new counterfactual contract rather than renaming the completed `v0.5.4` evidence.

### H-017: Maximal commuting frontiers can realize bounded endogenous plurality without an external selector

Status: validated for the bounded v0.5.5 causal branch contract

Claim:

When simultaneously enabled internal laws contain order-dependent effect conflicts, a Bubble can realize every lawful finite autonomous continuation by deriving all maximal commuting frontiers, while preserving common compatible laws, excluding conflicting alternatives only per realized branch, integrating anchors and robust World-Will optimization, and unfolding persistence without declaration order, randomness, an authored option menu, or a host-selected path.

Validation evidence:

- the legacy default still returns `underdetermined` for non-commuting simultaneous laws
- the opt-in branch contract produces two autonomous continuations from two incompatible formation laws
- every branch records the complete enabled set, realized and nonrealized law ids, maximal-frontier derivation, and `hostSelection: false`
- a third law compatible with both formation alternatives occurs in both branch frontiers
- identical set projections remain one commuting frontier and produce no false branch
- an insufficient branch bound returns `underdetermined` with no selected partial continuation
- an anchor-mediated intervention that itself branches is evaluated as one outcome set by guaranteed minimum exact improvement, and every selected outcome remains present
- the persistent causal runtime unfolds two incompatible formation histories and certifies boundary, invariant identity, causally effective memory, sea-caused restoration, and outward influence on both
- inspection and stored replay preserve branch lineage, exhaustive status, selected continuations, emergence, and complete run equality

Would be weakened by:

- declaration or enumeration order selecting one maximal frontier
- executing a branch-excluded alternative later in the same realization
- omitting a law compatible with every alternative from one branch
- reporting a partial branch prefix as realized after resource exhaustion
- allowing World Will to select the favorable outcome inside one branching intervention
- treating endogenous causal plurality as proof that an internal being deliberated or chose

Next check:

Use the first internally generated relation or preference-bearing selector to distinguish world branching from agency. Require causal evidence for option representation, norm or preference, and internal selection before using the words deliberation or choice. Concrete causal `spawn` and `collapse` execution also remain separate open seams.
