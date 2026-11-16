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

### H-018: Computability provenance can separate trans-Turing world semantics from false host hypercomputation

Status: open and untested

Claim:

A Bubble can coherently contain denotations or causal relations wider than its finite evaluator can decide if every result records the computational layer that justifies it, internal accessibility remains distinct from world truth, and no oracle, limit completion, exact continuum value, or physical assumption is silently relabeled as effective execution.

Would be supported by:

- one formal world model in which the same query is unresolved in a purely effective Bubble and resolved only after crossing a typed oracle-bearing anchor
- proof that the oracle result records source identity, relative degree or capability, query and answer provenance, causal access, and a replay contract different from host re-execution
- one limit-stage world whose semantics distinguish finite successor evaluation, symbolic fixed-point evidence, and any assumed actual completion rule
- one model-theoretic case where a proposition is meaningful or true in the world while remaining inaccessible to an internal being and `undetermined` to the host
- inspection and replay that preserve `effective`, `relative-oracle`, `limit-derived`, `axiomatic`, `undetermined`, and `contradicted` without flattening them

Would be weakened or falsified by:

- reporting an intensional infinite family, a long-running process, finite branching, randomness, or self-modifying code as non-Turing computation by itself
- allowing World Will, an anchor, a sea, or an exact real constant to return a non-computable answer without a typed source
- claiming that a conventional host completed a transfinite execution because it simulated a finite prefix or manipulated a symbolic limit expression
- replay silently regenerating an oracle or physical answer from effective code and calling it the same evidence
- a computational layer that cannot state which facts are world truths, internally accessible observations, host-computed results, or unresolved claims

First check:

Specify the four-case comparison in Q-026 and prove a conservation result for the effective case: when every initial value, transition, branch rule, anchor response, and World-Will evaluation is computable, Bubble does not gain non-recursive computational power from composition, plurality, or self-reference alone. Only then test a typed relative-oracle extension.

### H-019: Internal lifecycle law can actualize a bounded dynamic world graph without a host world selector

Status: validated for the bounded `v0.5.6` lifecycle-and-language release

Claim:

A finite declared Bubble graph becomes meaningfully dynamic when active-world internal laws, rather than the host or World Will, causally actualize latent worlds and retire their own source worlds; birth lineage, inactive-world exclusion, retirement residue, persistent continuation, and replay must all remain part of the same evidence contract.

Current supporting evidence:

- latent worlds retain exact intensional definitions but cannot execute laws, contribute objectives, receive interventions, activate anchors, or emit active sea traces before birth
- one or several commuting internal law events produce one typed spawn event with every cause, parent lineage, and `hostSelection: false`
- the child's first state-bound law occurs on a later frontier and cites the spawn event as a direct cause
- a branch that excludes the birth law leaves the target latent and records no false retirement
- `retire-self` preserves fields, final state digest, local negative sea, committed-memory ids, lineage, and causal provenance rather than deleting the world
- persistent closure resumes a retired world as retired and cannot silently birth it again
- lifecycle rank is acyclic with static per-continuation bound `A + 2L`, and resume input cannot regress an initially active world to latent
- internal law cannot use an ordinary predicate binding as an unanchored cross-world information channel
- the canonical generational grove births a descendant, retires its origin, blocks the retired origin anchor, activates the descendant anchor, and lets the descendant answer an anchor-mediated condition through its own internal law
- World-Will-disabled and all-anchors-cut execution preserves canonical birth, formation, and retirement
- inspection and exact replay preserve lifecycle counts, states, events, lineage, and history direction; stored phase tampering is rejected
- a strict `causal bubble` source profile lowers exact world declarations, local guards, sea coupling, anchors, objectives, birth, retirement, and commits into the same causal validator and run/inspection/record/replay path without changing the legacy descriptive language

Would be weakened by:

- treating initialized latent coordinates as already active state
- allowing World Will, declaration order, or a host callback to invoke birth or retirement directly
- deleting retired state or confusing retirement with branch nonrealization or observation-induced local materialization
- restoring only field values across persistent closure while losing lifecycle phase and provenance
- allowing phase-rank regression or untyped cross-world guard reads
- calling a finitely predeclared latent graph dynamic schema generation, population evolution, or an open-ended multiverse
- claiming release completion before canonical artifacts, full verification, record reconciliation, and evidence-density audit pass

Next check:

Run the complete repository and evidence-density boundary with the added causal-language fixture. Then make the author-facing release judgment without inferring typed cross-world transfer, portable BIR, wider dynamic generation, or a version identifier from technical success alone.

### H-020: A machine-independent semantic graph can preserve Bubble identity across optimized backends

Status: open and untested; semantic contract belongs to late 5.x and Rust execution begins only in 6.x

Claim:

If Bubble's exact values, causal relations, effects, lifecycle, boundary transfers, provenance, and commit rules are specified independently from their storage bytes and host evaluation schedule, then a TypeScript reference runtime and an optimized Rust kernel can realize the same bounded world while using different internal data layouts and execution strategies.

Would be supported by:

- a typed BIR whose canonical semantic graph is independent of TypeScript and Rust object layout
- canonical fixtures whose decoded meaning, event ledger, selected continuation set, lifecycle lineage, commits, and final digest agree exactly across two implementations
- deterministic parallel or incremental evaluation producing the same semantic evidence as serial reference execution
- versioned extensions that round-trip without deletion and cannot execute until their semantics are supported
- a cost report that shows lower host work or memory without converting exhaustion into a partial selected world

Would be weakened or falsified by:

- defining identity as equality of TypeScript JSON or Rust memory bytes
- a backend-dependent iteration or thread order changing branch identity, World-Will choice, commit order, or replay result
- faster execution obtained by pruning expensive lawful branches without an in-world equivalence or collapse law
- a supposedly portable BIR that embeds Node callbacks, Rust-specific types, one CPU instruction set, or an implicit scalar time
- canonical encoding that cannot preserve unknown future semantic sections without pretending to understand them

First check:

Complete the 5.x portable-core inventory and encode one narrow stable vertical slice as a semantic conformance fixture without implementing Rust. The fixture must expose exact values, an internal causal frontier, lifecycle or commit provenance, and one honest resource boundary. Rust implementation starts only after that contract survives adversarial review.

### H-021: A typed anchor span with material sea effects can connect autonomous worlds

Status: supported as the bounded `v0.5.7` baseline with a bounded `v0.5.8` simultaneous/generated-relation extension; general recurrence remains untested

Claim:

Two actor-neutral Bubble worlds can exchange exact content without an external router or World-Will puppetry when a source-world internal law causes an identity-preserving anchor crossing, the crossing materially changes the source negative sea and target positive sea, and the receiving world converts only the admitted boundary condition into internal structure through its own law.

Current supporting evidence:

- the transfer is declared as explicit source and target world/port/field endpoints on one two-world anchor
- its source and target exact value kinds must agree, both endpoints must be active, and a cut anchor blocks it
- pre- and post-transfer identity are evaluated before mutation; false or unresolved identity leaves target and both seas unchanged
- the transfer writes only an unprotected `world-condition`, while a causally later receiving-world law writes protected structure
- exact source negative-sea residue and target positive-sea placement change both states and local viability coupling
- `source internal law -> anchor transfer -> target internal law` is preserved in the causal partial order with `hostSelection: false`
- an internally caused birth must precede transfer into a formerly latent endpoint and remains a direct transfer cause
- strict source lowering, inspection, stored records, deterministic replay, and negative validator cases all cover the same typed runtime relation
- the active connected-universe constructor derives relation anchors, exact parent-to-child condition transport, and separate channel-valued sea actions for every admitted lineage edge
- each generated transport ID becomes a direct cause of the receiving world's local law; removing transport leaves the world present but suppresses that response
- two independent causal membrane crossings read one pre-frontier snapshot, commit atomically, accumulate exact shared sea changes, and occupy one frontier without a causal edge between siblings
- same-frontier target-to-source chaining and identity dependence on another crossing's writes are rejected rather than serialized by host order

Would be weakened or falsified by:

- any transfer occurring while its anchor is cut or either endpoint is inactive
- a foreign guard, host callback, declaration order, or World Will fabricating the crossing
- transfer directly mutating protected receiving structure or omitting either declared sea effect from evidence
- pre/post identity failure mutating any portion of the proposed atomic crossing
- replay preserving final fields while losing the transfer event, ports, identity evidence, sea accounting, or causal edges
- treating one snapshot relation as proof of general routing, global sea conservation, concurrent composition, agency, or whole-universe completion
- allowing a multi-transfer loop to derive payload order, overwrite shared provenance, or call sequential mutation a commuting proof

Next check:

Test post-generation repeated crossing across successive causal closures, explicit dependency-ordered chains, combined identity predicates, and non-additive or conserved sea operators. Preserve the current simultaneous frontier as a bounded theorem rather than widening it by case count.

### H-022: One finite constructor law can denote and causally realize a connected Bubble family without a host world catalog

Status: supported for the bounded `v0.5.8` demanded slice; general closure remains unproven

Claim:

A finite typed system of roots, schemas, and recursive constructors can denote a potentially unbounded connected Bubble family while a finite evaluator materializes only a demanded complete local subcoalgebra, preserves every unresolved frontier, derives lineage-relative identity and anchors, and lets generated worlds continue through their own laws without host selection or universal time.

Current supporting evidence:

- a recursive binary constructor at demanded depth two derives 7 deterministic lineage-addressed worlds from one root without listing those instances in the source
- all 6 generated edges create relation anchors, two exact channel sea actions, one exact payload transport, and `hostSelection: false`
- every transported condition causes the corresponding child-local structural law; removing transport leaves both generated children present and locally dormant
- world budget 2 cannot preserve one of two admitted root siblings, so neither is committed
- an unresolved formal admission preserves both sibling coordinates as unresolved and commits neither
- a natural constructor materializes the demanded prefix and retains an explicit `natural-open` frontier
- removing the scalar legacy projection preserves worldhood and topology while withholding unsupported causal-adapter execution
- inspection and same-program replay preserve topology, channels, transports, frontiers, local continuations, and tamper evidence
- an exact-false root constructor remains dormant, activates only after root-local condensation, forms its child, and reaches a three-closure configuration fixpoint after that child executes and one unchanged confirming pass; a one-closure bound reports `undetermined`
- the canonical all-admitted topology requires a second closure to prove that its changed post-condensation fields are a true configuration fixpoint rather than only stable topology
- a recursive 3-world/5-anchor condition down/up fixture returns to its exact input configuration through 6 events and closes as `persistent-recurrence`, not a fixpoint, only after invariant lineage, anchor identity, identity-dependency nonmutation, and monotone evidence are certified
- a plural causal closure derives every continuation as a lineage-bearing generated-universe branch; one root split followed by a child split yields three independently closed branches without host selection
- a generation branch limit of one preserves the complete two-continuation frontier on its common input and continues neither member
- malformed axes, incomplete parameter signatures, wrong exact kinds, and unavailable parent sources contradict the program before they can masquerade as false world law

Would be weakened or falsified by:

- traversal order changing world identity or constructor declaration order selecting a sibling
- a finite resource bound being reported as the end of a recursive or natural family
- generated anchors having no causal or material effect on receiving worlds
- scalar viability becoming mandatory ontology for the channel-valued generator
- host-created schema instances, partial sibling commitment, lost relation provenance, or replay that reconstructs only final fields
- claiming dynamic law/schema invention, topology-changing or non-periodic persistence, component self-maintenance, general coinduction, or whole-universe completion from the finite supplied-schema fixture

Next check:

Separately define lawful branch equivalence/convergence and generated law/schema transformation. Extend recurrence only from a concrete topology-changing, quotient, non-periodic, or cross-membrane case; do not conflate instance generation with semantic self-invention.

### H-023: A finite internal demand can deterministically close a view of an infinite Bubble while realization evidence self-complements

Status: supported for finite v0.5.8 demanded cuts; universal convergence and external observation unproven

Claim:

For a typed intensional Bubble program `P` and finite demand `delta`, evaluation can terminate with one reproducible semantic result even when `P` denotes a potentially unbounded universe, provided plurality is returned as the complete lawful branch family and every unexecuted continuation remains an explicit frontier. Repeated causal-generation closure can monotonically extend an evidence ledger even when the world state itself is non-monotone.

Current supporting evidence:

- recursive constructor incidence and natural coordinates are distinguished from finite-by-current-graph denotation
- canonical finite cuts close as one result while retaining depth frontiers and denying whole-universe completion
- plural causal worlds close as one complete three-branch result with no host selection
- insufficient closure or branch resources return an open boundary, not a fabricated finite ending or selected prefix
- realized root state reactivates a dormant constructor and this transition appears in the evidence chain
- every chain step commits its predecessor digest, so inspection/replay preserve monotone evidence provenance and reject mutation
- exact active generated recurrence now preserves lineage and anchor identity, rejects identity-dependency mutation hidden between equal cuts, and separates replay evidence from committed world history

Would be weakened or falsified by:

- identical program and demand producing different branch families without declared non-effective input provenance
- any resource bound silently dropping a sibling, continuation, or frontier
- a closed demanded slice claiming the entire recursive denotation is materialized
- evidence digest growth being used as proof that fields are monotone or every recurrent run converges
- an external observer or host branch selector being required for the Phase 1 result

Next check:

Test source-lowered and generated-schema variants against the same result-form and recurrence-identity contracts, then study topology-changing or non-periodic persistence without assuming convergence.

### H-024: Exact generated recurrence can preserve universe identity without becoming a fixpoint or fabricating history

Status: supported for bounded exact v0.5.8 recurrence; topology-changing and non-periodic persistence unproven

Claim:

An active finite generated-universe cut can be certified as the same persistent recurrence when its complete causal-generation configuration repeats, lineage/world and anchor/generation structure are invariant, every world and relation identity predicate holds at both cuts, no causal event inside the cycle mutates an identity dependency, and causal occurrence evidence extends without host selection. This does not require zero activity and does not imply that internal committed history extended.

Current supporting evidence:

- one recursive constructor produces a 3-world, 2-generation-event, 5-anchor cut whose six local condition events return the exact configuration in one closure
- the branch resolves as `persistent-recurrence` while `fixpointReached` remains false
- all world IDs, schemas, lineage addresses, generation causes, anchors, and identity predicates remain exact across the cuts
- changing and restoring an identity-bound condition within the same cycle yields `not-certified` despite equal endpoint digests
- exhausting the formal identity budget yields `undetermined`, not persistence
- uncommitted recurrence records six causal evidence entries, zero committed-history entries, `worldHistoryExtended: false`, and `fullAnchoredStateRepeated: true`
- adding exact condition commits records causal and committed extensions separately and makes `fullAnchoredStateRepeated: false`
- inspection and replay preserve the certificate, and stored-certificate mutation fails integrity

Would be weakened or falsified by:

- endpoint digest equality certifying a cycle that changes an identity dependency internally
- a removed, rewritten, or host-selected anchor/generation event surviving certification
- replay evidence alone being reported as internal world history
- identity proof exhaustion becoming false, true, or a selected fallback
- this finite-cut continuity certificate being used as proof of component self-maintenance, lawful branch quotient, general convergence, or whole-universe persistence

Next check:

Construct the smallest recurrence that lawfully changes topology or crosses a membrane over successive closures. Require an explicit identity morphism or history-preserving quotient before treating different configurations as one persistent universe.

### H-025: Typed inherited law revisions can make generated worlds semantically differentiated without arbitrary self-modification

Status: supported for bounded irreversible-law effects; complete law-set and world-local schema-graph morphisms are supported separately in H-026/H-027, while intensional generation remains unproven

Claim:

A constructor can organically differentiate descendant world law when the child inherits a concrete parent revision and a typed intensional morphism derives exact lineage-relative law operands. This can remain replayable, causal, and host-selection-free without accepting executable source text or an opaque host callback.

Current supporting evidence:

- roots carry one content-addressed base revision and untransformed same-schema descendants inherit it exactly
- the canonical recursive constructor produces six child revisions from parent revision lineage, depth, and local coordinate
- each transformation records the exact query, result, proof digest, source revision, target revision, constructor, child, and relation reference
- the causal compiler executes `world.schemaRevision.internalLaws`; compiled effect values equal the realized revision rather than the static schema table
- unknown law IDs, duplicate targets, out-of-range effects, reversible laws, and wrong exact kinds are rejected before materialization
- formal proof exhaustion leaves the complete sibling family uncommitted and visible as a two-coordinate transformation frontier
- recurrence structure includes the complete revision, and inspection/replay preserve provenance and reject mutation

Would be weakened or falsified by:

- a descendant revision depending on traversal order or undeclared host state
- one unresolved sibling allowing another sibling revision to become real
- a compiled law differing from the revision stored on its world
- revision changes disappearing from recurrence identity, causal provenance, inspection, or replay
- this bounded operand morphism being presented as arbitrary law invention or executable self-construction

Next check:

The complete child-local law-set morphism is tested separately in H-026, and H-027 now tests the complete world-local executable schema graph. Next test intensional graph/family generation or strict source lowering while preserving typed dependencies, identity, old-revision history, and atomic sibling closure before any code-generation surface is considered.

### H-026: Idempotent remove/upsert forms a recursively closed internal-law-set morphism

Status: supported for complete typed child-local internal laws; complete world-local graph replacement is tested separately in H-027

Claim:

A constructor can transform an inherited complete internal-law set at every recursive depth without depth-specific host logic when removal is idempotent and a complete typed upsert means add-if-absent or replace-if-inherited. The resulting revision remains executable and replay-identifiable when its full law contracts validate before materialization.

Current supporting evidence:

- one base root has `condense`; two first-generation children remove it and add `lineage-condense`
- four second-generation children inherit `lineage-condense`, make the same requested removal a no-op, and replace the inherited law through the same morphism
- exact effect specialization runs after upsert, so each generated law receives its own depth/coordinate value
- compiled root and descendant law IDs and effects exactly match their stored revisions, and every descendant realizes only `lineage-condense`
- event provenance distinguishes requested/effective removal, addition, replacement, source law set, and target law set
- invalid inverse pairs, wrong effect kinds, duplicate effect writers, empty operations, duplicate/unknown removals, and duplicate/overlapping upserts contradict before generation
- stored law-set provenance tampering fails replay integrity

Would be weakened or falsified by:

- the same morphism becoming invalid solely because its valid result was inherited at the next depth
- declaration or traversal order changing the target law set
- a law compiling with a guard, effect, commit, or inverse different from the stored revision
- removal or upsert failure committing a partial sibling family
- describing finite typed law templates as generated executable implementation code

Next check:

H-027 closes the next bounded whole-schema relation. Continue only from a concrete need for intensional graph/family generation, constructor/schema-incidence transformation, or source lowering without weakening prior revisions or importing host callbacks.

### H-027: A complete pre-instantiation schema graph can differentiate generated worlds coherently

Status: supported for finitely declared complete world-local graph replacement; intensional graph generation unproven

Claim:

A recursive constructor can give descendants a different executable field/protection/port/sea/identity/law/emergence/projection structure without host mutation order when it derives one complete typed target graph before child instantiation and every later operation consumes that realized revision.

Current supporting evidence:

- one base root retains its base graph while every generated descendant carries a content-addressed replacement graph
- the replacement introduces a lineage-relative field and initializer, protects it, adds a port and sea channel, changes self-identity, replaces the internal law and emergence criterion, and changes the causal objective in one atomic target
- child initialization evaluates the new field from depth and coordinate before relation transport or sea action
- relation anchors bind the replacement port; sea refresh reads replacement channels; compilation emits replacement fields, protection, laws, emergence, and objectives
- the same total replacement remains valid at the next recursive depth rather than colliding as a one-shot migration
- source/target graph digests and changed component identities are recorded with `hostSelection: false`
- missing protected fields, emergence witnesses, and projection channels contradict statically and materialize no world
- all prior law-set, sibling atomicity, recurrence-identity, inspection, and replay tests remain valid

Would be weakened or falsified by:

- any generated field being initialized from the base graph and relabeled afterward
- self-anchor, relation, sea, compiler, recurrence, or replay reloading a static component that differs from the stored revision
- a graph with a dangling typed dependency reaching runtime mutation
- recursive application depending on depth-specific host exceptions or declaration order
- presenting a finite declared target graph as intensional invention of arbitrary schemas, formal families, or executable code

Next check:

Define whether the next necessary seam is intensional graph/family generation or strict `.bubble` lowering. Keep constructor/schema-incidence transformation, successor implementation generation, and code execution open until their own identity and replay contracts exist.

### H-028: One strict source can preserve the complete endogenous program without a second runtime

Status: supported for the current connected-universe contract; intensional definition generation remains open

Claim:

A constrained declarative Bubble source can express exact intensional families, complete world-local schema graphs, recursive constructors, relation anchors, sea actions, and typed schema morphisms without flattening them into the older causal profile or embedding executable host text, provided it lowers losslessly to the same typed program and validator.

Current supporting evidence:

- the canonical `.bubble` source deep-equals the retained `EndogenousUniverseProgram` JSON projection
- the ordinary endogenous run, inspection, record, and replay CLIs consume that source without a separate execution path
- a source-declared replacement graph contains all eight executable graph components and reaches the existing graph validator
- source algebra covers exact values, axes, parameters, unary/binary terms, conditionals, family-coordinate references, and guarded natural recursion
- shared formal validation rejects declared-result, operator, conditional, and coordinate-argument kind mismatches for both source and JSON programs
- universal time, incomplete graph structure, dangling references, and replay drift remain rejected before or across execution

Would be weakened or falsified by:

- source and JSON lowering to different typed programs for the same declarations
- a semantic feature available only through an untyped source escape hatch
- declaration text or order selecting a generated branch or changing sibling materialization
- a source-declared graph bypassing identity, inverse, sea, projection, or recursive endpoint validation
- this finite authoring surface being presented as endogenous invention of new graph definitions or executable implementation code

Next check:

Derive the next source construct only from a required intensional graph/family-generation or constructor-incidence semantic contract. Do not widen syntax independently of executable meaning.
