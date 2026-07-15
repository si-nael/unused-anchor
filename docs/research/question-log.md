# Question Log

Last reconciled: 2026-07-15

## Open Questions

### Q-001: What is the minimal independent bubble-world schema?

Status: partially answered through v0.5.2

Question:

What is the smallest Bubble world definition that still deserves to count as an independent world rather than as a loose generated fragment?

Current implementation:

- the compiler separates minimum authored shape from stronger runtime worldhood certification
- the anchored narrative IR adds formal fields, protagonists, goals, relationships, local sea coupling, anchors, World Will, causal events, and no-universal-clock order to the executable minimum
- a bubble receives its own lineage-relative address, boundary, generation lifecycle, semantic plan, ontology assessment, and proof surface
- `claim:worldhood` prevents mere syntax success from being presented as sufficient worldhood

Remaining gap:

- the current minimum is still a bounded engineering contract, not a final philosophical criterion for independent worldhood
- observer-agent recovery and long-running autonomous persistence are not part of the minimum schema yet

Next check:

Use the current minimum schema as the `v0.4` baseline and revise it only when a concrete world that should count as independent cannot be represented or certified honestly.

### Q-002: How should the negative sea be represented operationally?

Status: partially answered through v0.5.3

Question:

Which runtime and IR structures should carry erosion, outside residue, leakage, and boundary pressure without reducing the negative sea to decorative vocabulary?

Current implementation:

- `negativeSea.pressure`
- `negativeSea.pressureSources`
- `bubble.seaSemantics.negativePressureSources`
- `negative-sea-state` evidence records
- boundary and effect-role structure lowering into explicit sea-source IR, then feeding runtime ontology and proof basis
- `bubble-anchored-narrative-program.v1` projects exact negative-sea state into viability after initialization and every causal transition
- the v0.5.3 persistence fixture separates negative-sea admission, sea-caused structural erosion, sea release, and internal restoration into directed causal events

Remaining gap:

- pressure sources are now explicit IR semantics, but still projected from authored structure rather than direct source-level law objects
- local step-level coupling exists, but no global multi-world transport, continuous erosion, or membrane flow law exists yet

Next check:

Reopen from the first world that requires cross-world transport, continuous erosion, or a membrane pressure law beyond exact local projection.

### Q-003: How should the positive sea be represented operationally?

Status: partially answered through v0.5.2

Question:

Which runtime and IR structures should carry lineage, placement, growth, and stabilization across related worlds?

Current implementation:

- `positiveSea.support`
- `positiveSea.supportSources`
- `bubble.seaSemantics.positiveSupportSources`
- `positive-sea-state` evidence records
- lineage, boundary, history-support, and staged-emission structure lowering into explicit sea-source IR, then feeding runtime ontology and proof basis
- `bubble-anchored-narrative-program.v1` projects exact positive-sea state into viability after initialization and every causal transition

Remaining gap:

- support sources are now explicit IR semantics, but still projected from authored structure rather than direct source-level stabilization law
- local step-level coupling exists, but no global placement, transport, or growth law exists yet

Next check:

Reopen from the first lineage-placement, cross-world transport, or growth case that exact local projection cannot express.

### Q-004: What makes an anchor point strong enough?

Status: partially answered through v0.5.2

Question:

Which combination of laws, seed continuity, history commitment, observation support, and lineage placement is sufficient to hold a world to its own identity?

Current implementation:

- inferred `anchorPoint.strength`
- separated `declaredHistorySupport` and `materializedHistoryEvidence`
- `authoredCriterionStatus`, `authoredCriterionBasis`, `materializedEvidenceSources`, and `identityStatus`
- theorem witness plus bounded proof claims for anchor and replay identity
- exact formal anchor-identity predicates, route permission, target reachability, cut-anchor counterfactuals, and intervention trace are executable in the anchored narrative runtime

Remaining gap:

- anchor strength is still an inferred bounded score, not a full authored identity calculus
- the bounded predicate and route contract is not yet a complete cross-world same-identity calculus

Next check:

Extend identity only from a concrete same-world counterexample, semantic migration, or cross-world anchor transfer that the current exact predicate cannot decide.

### Q-005: When does replay return to the same world?

Status: partially answered through v0.5.3

Question:

Under what conditions should rewind or replay be interpreted as returning to the same world identity rather than to a nearby reconstructed variant?

Current implementation:

- bounded `claim:replay-identity`
- explicit distinction between declared history support and materialized history evidence
- authored anchor criterion and runtime ontology basis feeding replay proof
- observed history shapes preserved through materialization, inspection, and replay
- anchored narrative records store the exact formal program and options, re-execute them, compare the complete run digest, and preserve selected and unresolved continuation identities
- persistent causal records additionally preserve exact closure cycles, derived-component assessments, memory counterfactuals, maintenance evidence, and stored-run integrity across re-execution

Remaining gap:

- observation-history shape still influences replay mainly through basis and runtime policy surfaces rather than a dedicated proof family
- same-program deterministic re-execution is bounded to the current runtime semantics; cross-version, multi-region, and stochastic replay remain open

Next check:

Reopen from the first runtime-version migration, cross-implementation execution, multi-region history, or stochastic identity case; do not generalize same-program digest equality into a universal same-world theorem.

### Q-006: How should an unbounded multiverse be represented?

Status: partially answered through v0.5.2

Question:

What finite representation can preserve the operational meaning of a potentially unbounded collection of bubble universes without storing full explicit state for each one?

Current implementation:

- lineage-relative addresses and templates avoid one cheap absolute multiverse index
- quotes, generators, latent-bubble semantics, staged emissions, and bundle plans preserve world families intensionally
- materialization creates only selected artifacts and local observed regions
- exact natural, integer, and finite-product intensional families denote countably infinite and infinite-dimensional fields while evaluating only demanded coordinates

Remaining gap:

- there is no long-running store, eviction policy, or traversal protocol for a genuinely unbounded generated lineage
- finite-memory behavior has examples and IR shape but no scale benchmark yet

Next check:

Measure one expanding lineage using bounded materialization and replay storage before adding a global multiverse catalog.

### Q-007: When does a latent world become committed history?

Status: partially answered through v0.4.9

Question:

What events force a procedurally generable world or region to become persistent history rather than a regenerable possibility?

Current implementation:

- authored `commit` support is separated from concrete `history-commit` evidence
- selected local observation targets can move from latent state through collapse record into committed history
- materialized descendant or artifact runs carry commit records, and observed history shape survives inspection and replay bundles

Remaining gap:

- commit selection is still a bounded runtime policy rather than a stable author-controlled semantic contract
- multi-region dependency and conflicting concurrent commit semantics do not exist yet

Next check:

Keep the single-region commit rule stable until a concrete second-region case proves that the existing policy cannot preserve history honestly.

### Q-008: Should world definition use a DSL or a full programming language?

Status: answered for the current architecture through v0.4.9

Question:

What is the smallest language expressive enough to define rich bubble universes while still supporting static checks, replay, compilation, and explicit world semantics?

Answer in force:

Use a dedicated constrained Bubble DSL bootstrapped in TypeScript, with versioned profiles, explicit lowering, validation, runtime evidence, and host-language implementation kept behind the semantic boundary. Do not widen it into an unrestricted general-purpose language while the current semantics remain research-active.

Reopen condition:

Reopen this decision only if representative bubble-native tasks repeatedly require opaque host-language escape hatches or if the constrained DSL blocks a necessary semantic construct that cannot remain inspectable any other way.

### Q-009: How can the language raise the representability frontier without becoming opaque?

Status: partially answered through v0.4.9

Question:

Which constructs such as partial specifications, constraint objects, generator schemas, quotations, or reflective laws let the language describe structures that lower layers cannot express while still preserving validation and inspection?

Current implementation:

- unresolved semantic fragments lower into explicit IR instead of disappearing into prose
- parseable `constraint`, `partial law`, `anchor identity`, and world will expressions remain inspectable and executable when possible
- unparseable forms remain preserved as bounded unresolved or explicit descriptive text rather than forcing fake executability

Remaining gap:

- no broader law solver yet exists
- higher-order representability has not yet been stabilized against cross-file composition or richer authored collapse semantics

Next check:

Stabilize the current unresolved-semantics and executable-semantics frontier before adding new language classes.

### Q-010: What should be the primitive sea-anchor effects?

Status: partially answered through v0.4.9

Question:

Which effects should exist as first-class Bubble primitives, such as branch, spawn, collapse, commit, leak, debt, perturb, or observe, so that world formation remains analyzable rather than opaque?

Current implementation:

- all eight candidate effects are parsed, validated, lowered, typed by requirement and scope, and projected into separate declaration, obligation, permission, pressure, event, and trace roles
- concrete runtime effects emit provenance-bearing evidence and `v0.4.8` causal links without inventing executed targets for potential capabilities

Remaining gap:

- `branch` and retirement `collapse` still lack concrete executed transition record types
- primitive completeness has not been tested against a demanding multi-world experiment

Next check:

Do not add another primitive until a concrete transition cannot be represented by the current eight. Add branch or retirement records only when the runtime actually executes those transitions.

### Q-011: What work can only Bubble do cleanly?

Status: partially answered through v0.4.9

Question:

Which concrete tasks in world generation, replay, sea-anchor modeling, or staged language formation become materially cleaner or more faithful in Bubble than in a host-language embedding with ordinary tooling?

### Q-012: What are the first membrane surfaces inside the Bubble Language bubble itself?

Status: open

Question:

If Bubble Language is itself one governing bubble, where do membrane pressure and boundary failure first appear inside it: profile compatibility, staged activation, reflective scope, runtime escape hatches, provenance loss, or some other boundary?

Current implementation:

- the boundary log records grammar-base, activation-target, staged-cycle, provenance, and canonical-document encoding failures
- compiler diagnostics preserve profile compatibility and staged activation boundaries

Remaining gap:

- reflective scope, runtime escape hatches, and evidence-loss membranes do not yet have a systematic executable catalog

Next check:

Add a boundary class only from an observed failure, then decide whether repeated classes justify first-class runtime boundary evidence.

### Q-013: What is the first directly usable sea-anchor benchmark loop?

Status: partially answered through v0.4.9

Question:

What is the smallest end-to-end combination of Bubble-authored world, operational step semantics, lineage or boundary signals, and evaluation surface that would let the project run immediate sea-anchor experiments rather than only language validation?

Current implementation:

- canonical examples compile, plan, materialize, inspect, record, and replay through mandatory verification commands
- reports expose boundary, ontology, proof, observation state, effect provenance, commits, and artifacts

Remaining gap:

- this is an executable experiment loop, but not yet a benchmark: it has no scored task, perturbation matrix, repeated trials, or host-language comparison

Next check:

Define one small scored same-world attribution or replay task before claiming that Bubble has demonstrated unique research leverage.

### Q-014: How should runtime distinguish internal event, negative-sea residue, and anchor drift?

Status: bounded runtime source-attribution slice completed in v0.4.9

Question:

When a weakly anchored bubble world is observed under pressure from outside residue or boundary disturbance, how should the runtime classify what appears to be an internal event, a negative-sea intrusion, or record instability from anchor weakness?

Current implementation:

- typed `event-source-attribution` evidence for collapse records, history commits, descendant artifacts, and observation contexts
- `internal-world-event`, `negative-sea-pressure`, `anchor-drift`, `positive-sea-shift`, and `unresolved-source` classifications
- direct and contextual candidates with typed basis references to authored effects, same-run evidence, runtime ontology, or materialized artifacts
- perturb effects become materialized sources only when a concrete collapse record names their contribution
- weak anchor state alone does not become drift; concrete drifting materialization plus insecure identity or rewind support is required
- inspection filters, a dedicated `sourceAttributions` section, stored replay preservation, and the canonical `attribution-crossroads` ambiguity fixture

Bounded result:

The implemented fixtures resolve all four supported direct classes. When negative-sea pressure and anchor drift remain simultaneously direct for the same concrete collapse, the final verdict stays `unresolved-source` and both candidates survive inspection and replay unchanged.

Remaining gap and reopen condition:

This is event-level attribution over the bounded current runtime, not a general causal calculus or a classifier for continuous sea dynamics. Reopen Q-014 only when a concrete new runtime subject, cross-world residue transfer, or observer benchmark cannot be classified honestly by the current evidence vocabulary.

### Q-015: How can a deterministic machine host a probabilistic fractal bubble world without destroying anchor semantics?

Status: open and explicitly deferred beyond the v0.5 entry gate

Related note: [Deterministic Substrate and Probabilistic-Fractal Worldhood](probabilistic-fractal-worldhood.md)

Question:

If Bubble eventually treats apparent uncertainty as something generated by deterministic substrate limits, chaotic amplification, recurrence structure, or other fractal machine dynamics rather than only by explicit authored branching, what semantics would still let the system distinguish three cases:

- a genuine world inconsistency
- an ordinary but rare tail event inside lawful stochastic structure
- a replay or anchor-identity failure caused by probability-cloud drift

This is the core stochastic SOT problem: how to preserve same-world identity, contradiction detection, and replay meaning when the world's anchor is no longer a single crisp fixed point but a structured probabilistic cloud.

### Q-016: How should a latent region become concrete under observation or interaction?

Status: bounded single-region implementation slice stabilized through v0.4.8

Related note: [Observation-Induced Materialization and Perturbative Collapse](observation-induced-materialization.md)

Question:

If Bubble allows unobserved regions to exist only as compact generative law, seed structure, and unresolved semantic potential, what semantics should determine how one observation or one contact event materializes that region locally?

In particular, what authored Bubble structures should decide how the runtime mixes:

- latent world law
- seed continuity
- perturbation or boundary stress
- anchor condition
- nearby committed history
- the observer's actual interaction path

into one concrete local world result?

Current implementation:

- `latentTopology` and collapse-evidence drafts
- `observationState.localMaterialization`
- bounded `observationCommitPolicy`
- explicit plan-level `observationMaterializationLaw` for `single-region-observation-kernel.v3`
- explicit `externalObservationLimit` surface tying bounded outside access to observation, perturbation, history support, and trace consequences

Remaining gap:

- this is still a bounded runtime kernel, not authored collapse syntax or a general solver
- multi-region coupled collapse and probabilistic observation semantics remain intentionally deferred

Current closure:

The current single-region law is now covered across proof, inspection, replay, causal effect traces, and the mandatory `verify:collapse` / `verify:replay` paths. Keep this slice as the stable bounded baseline rather than widening syntax or solver scope inside `v0.4.8`.

Next check:

Only reopen the materialization-law surface when a concrete second-region coupling requirement or author-controlled policy choice cannot be represented by the current bounded law and evidence vocabulary.

### Q-017: How should same-world replay work once observation itself changes the world?

Status: partially explored through v0.4.9

Related note: [Observation-Induced Materialization and Perturbative Collapse](observation-induced-materialization.md)

Question:

If observation is a causal event rather than a passive read, what combination of commit, anchor criterion, and replay semantics should distinguish:

- lawful observation-induced change inside the same world
- drift into a nearby but non-identical world
- a genuine contradiction in world law

without weakening bounded proof or making replay meaning ambiguous?

Current implementation:

- authored anchor criteria can participate in replay identity
- materialized history evidence and observed history shapes survive into replay records
- observation commit policy and observation materialization law are inspectable runtime surfaces rather than hidden replay assumptions

Remaining gap:

- observation-driven replay is still bounded to the current local kernel and history-shape vocabulary
- there is no dedicated proof family yet for observation-history shape separate from replay-identity and internal consistency

Next check:

Preserve the current bounded semantics through `v0.4.9`. Reopen the proof shape only after source attribution is stable and a deterministic replay design can state what additional observation-history claim would discriminate.

### Q-018: How can a bubble realize itself through world will rather than an external chooser?

Status: implemented bounded baseline through v0.5.3

Question:

What minimum state, possibility, selection, continuation, and evidence structure lets a bubble operate organically through its own world will, while preserving deterministic ambiguity and authored nondeterministic plurality rather than letting host code choose a convenient outcome?

Current implementation:

- explicit scalar `state` declarations and reversible or irreversible `transform` declarations
- projected preserve/transform candidate environments evaluated by executable world will
- statuses for stable, realized, plural, underdetermined, blocked, and contradicted world states
- provenance-bearing continuations and explicit resume input that cannot select a winner
- self-realization proof, evidence, effect causality, source attribution, inspection, and replay
- actual history commit only for an admitted `commit` transformation
- the v0.5.1 anchored narrative runtime closes a finite causal story, evaluates exact World-Will objectives/costs and post-state constraints, preserves equal alternatives, and reports resource exhaustion without a host selection
- the v0.5.3 persistence layer unfolds every selected causal continuation, preserves contradiction and unresolved frontiers, and certifies exact recurrence without choosing a branch

Remaining gap:

- the original `.bubble` self-realization path still evaluates one scalar frontier; the v0.5.3 recurrence proof is bounded to an exact actor-neutral field structure rather than a persistent story or general open-ended process
- branch, spawn, and collapse are typed continuation consequences but not all yet execute concrete world artifacts or retirement records from self-realization
- transformations currently change one scalar coordinate at a time
- narrative consequences feed exact local sea-coupled viability but not a global multi-world sea/anchor dynamics calculus

Next check:

Reopen from a concrete persistent-story, branch/spawn/collapse artifact, relationship-affordance, or cross-world sea/anchor requirement. Preserve explicit termination, provenance, and no hidden scheduler.

### Q-019: What does time mean inside a bubble universe?

Status: partially implemented through v0.5.3

Question:

Should Bubble have universal time at all? If time is absent, does that mean no change, invariant existence, reversibility, cyclic return, or merely that world events form causal and partial orders rather than one scalar clock? When does an irreversible history arrow actually begin?

Current implementation:

- every self-realization records `clockAssumption: no-universal-clock`
- invariant preservation introduces no new order
- reversible transforms require exact reciprocal inverse and create causal order without durable history
- non-commit irreversible transforms remain causally ordered without being misreported as committed history
- selected commit transforms create `committed-history` order and the history arrow
- branch and terminal consequences have distinct topology
- the anchored narrative runtime records an explicit causal DAG, host evaluation order, reversible/irreversible event sets, and commit-created history arrows separately
- the persistent causal runtime records an exact closure coalgebra and finite lasso recurrence certificate while keeping `universalClock: false`; closure numbers are proof coordinates rather than duration

Remaining gap:

- no duration, synchronization, metric-time semantics, or general concurrent/cross-world recurrence calculus
- no theorem yet connecting the discrete realization order to the analytic path parameter used in the sea-anchor proof
- interaction among multiple bubbles with distinct order structures remains open

Next check:

Keep universal time absent by default. Add order structure only when a concrete world requires cycles, concurrency, cross-bubble synchronization, or duration and the semantics can remain inspectable without reducing all worlds to host clock ticks.

### Q-020: How can a finite formal language denote infinity and infinite-dimensional Bubble structure?

Status: implemented bounded baseline in v0.5.1

Question:

What exact representation lets a finite Bubble source denote unbounded world families, infinite-dimensional fields, operators, or recurrences without eager enumeration, opaque host callbacks, floating-point drift, or a false claim that literal infinity has been materialized?

Current implementation:

- `bubble-intensional-system.v1` defines exact indexed families over natural, integer, finite, and finite-product axes
- values are exact rationals, booleans, or symbols
- evaluation is demand-driven and records coordinate proof dependencies
- direct recursion requires a declared natural-axis measure and strict syntactic descent
- cross-family cycles without a well-founded measure are rejected
- budget exhaustion returns `undetermined` without a fabricated value
- narrative world fields, hard constraints, and anchor identity predicates are evaluated through the same exact query and proof surface
- state-bound predicate parameters let a formal constraint inspect the post-intervention connected world without an opaque callback

Remaining gap:

- no authored Bubble surface syntax lowers into the anchored narrative kernel yet; the current canonical input is typed JSON
- no coinduction, uncountable domain, symbolic limit, infinite sum/integral, operator composition, probability measure, or topology exists
- guardedness currently proves only a strict natural-number descent fragment

Next check:

Add a new mathematical form only when a concrete required Bubble field, law, or proof cannot be represented by the exact countable fragment.

### Q-021: How can protagonists, story, World Will, anchors, and seas form one organic causal world?

Status: implemented bounded connected baseline in v0.5.1

Correction in force from v0.5.2: this remains a valid explicitly agent-bearing special case, not the universal minimum Bubble ontology. Q-023 owns the actor-neutral generative generalization.

Question:

What coupled formal structure lets each bubble universe carry distinct protagonists and an autonomous story while World Will pursues explicit objectives through anchors, positive and negative seas alter viability, and no hidden host selector or menu of unrelated regimes decides the outcome?

Current architecture:

- [v0.5.1 Anchored Narrative World Architecture](../architecture/v0.5.1-anchored-narrative-world.md) separates protagonist action, World-Will intervention, anchor route, sea condition, causal event order, and committed history
- the author corpus and obligation ledger preserve the no-menu, agency, story, anchor, and formal-language requirements
- internal protagonists are explicitly Phase 1 constituents, distinct from the Phase 2 external observer-agent
- `bubble-anchored-narrative-world.v1` now types worlds, fields, protagonists, goals, relationships, sea coupling, anchors, World-Will objectives/constraints/interventions, and causal events
- validation rejects direct intervention into protagonist choice, anchor routes that do not reach the target world, forbidden intervention kinds, causal cycles, and stories with no World-Will-independent protagonist action
- analysis derives World-Will-disabled and per-anchor-cut causal counterfactuals without inventing an execution result
- `bubble-anchored-narrative-program.v1` evaluates typed field initializers, autonomous non-intervention causal closure, exact sea-dependent viability, state-bound hard constraints, global objective and cost, and exhaustive bounded intervention combinations
- every executed intervention crosses an identity-validated anchor and carries causal provenance; direct mutation of protagonist choice or story by World Will is rejected
- inspection, stored record, and deterministic re-execution preserve selected continuations and unresolved alternatives
- canonical and counterfactual tests cover Will disabled, anchor cut, objective conflict, post-state constraint failure, sea pressure, deterministic ties, plural ties, and resource exhaustion

Remaining gap:

- causal closure is finite and acyclic; it is not a persistent open-ended or cyclic story process across records
- relationship state is typed but does not yet change action affordances or objective structure
- anchors execute bounded local channels but do not yet transfer state across multiple worlds or provide a full identity calculus
- sea projections change local viability after events, but there is no global multi-world sea field or transport law
- the unresolved `고유 세계` topology remains explicit rather than being silently replaced by a privileged root

Next check:

Reopen from the first concrete need for persistent story continuation, relationship-mediated agency, cross-world anchor transfer, or global sea transport. Do not widen source syntax ahead of that semantic need.

### Q-022: Can Bubble recursively construct modules, code, and a successor form of itself?

Status: explicitly deferred until the current Bubble universe and prior idea obligations are complete

Question:

After the intended Bubble universe is complete, can Bubble use its own concept and language to generate modules, synthesize formally admissible code, execute that code, and construct a verified successor representation of itself without losing identity, provenance, boundaries, or the author's accumulated ideas?

Existing precursors:

- quoted artifacts, generators, bounded reflection, staged emission, grammar artifacts, and later-stage activation
- exact intensional families and structural narrative-world IR
- proof, evidence, inspection, replay, and idea-obligation records

Why it is deferred:

- these components do not yet form a self-hosting compiler, module system, code synthesizer, verifier, or execution sandbox
- implementing recursive self-construction now would divert work from the incomplete generative world/World-Will/anchor/sea universe and from lawful emergence of stronger internal structures
- self-generation must not become a shortcut that silently invents or forgets unfinished semantics

Reopen condition:

Reopen only after all earlier idea obligations are realized, the current Bubble universe passes its full completion gates, and the author explicitly chooses a later version for recursive self-construction.

### Q-023: How can protagonists, agency, and stories arise without being forced into every world?

Status: implemented actor-neutral generative and bounded persistent baseline through v0.5.3; agency remains open

Question:

What is the most general executable Bubble substrate that forms real world states and causal events from its own laws, while allowing persistent beings, agency, relationships, and narrative histories to emerge naturally when supported rather than requiring or deleting them by schema?

Current implementation:

- `bubble-anchored-causal-world.v2` requires exact fields, guarded internal laws, sea coupling, generic anchors, World-Will objectives and constraints, causal partial order, and optional history commits; it requires no protagonist or story field
- enabled internal laws generate events from exact state predicates instead of replaying a pre-authored causal-event graph
- simultaneously enabled non-commuting laws return `underdetermined` rather than inheriting host or declaration order
- protected fields prevent World Will from directly manufacturing internal structure; it may change lawful conditions through an identity-checked anchor, after which the world's own law may respond
- generic emergence criteria compare initial and realized states, preserve exact witness fields and causal provenance, and distinguish absent, persistent, emerged, dissolved, unresolved, and contradicted structure
- the canonical actor-neutral field world self-organizes even with World Will disabled; an anchored condition intervention can later activate an internal response without directly writing coherence
- pre- and post-state anchor identity checks prevent an intervention-dependent closure from silently leaving the declared world identity
- same-frontier co-causes, explicit viability trace layers, lazy exact-bounded intervention search, and stored-run integrity close the first adversarial audit counterexamples
- the `v0.5.1` narrative kernel remains validated as a compatible explicitly agent-bearing specialization
- `bubble-persistent-causal-program.v1` derives recurrent field components from a field/law factor graph while retaining complete conjunctive law dependencies rather than declaring an entity
- every lawful selected closure path is unfolded; exact causal-configuration recurrence yields a finite lasso without a universal clock or host-selected branch, while irreversible commits extend a separate monotone anchor-history ledger
- a stronger persistence assessment separately requires a fully boundary-mediated causal hypercut with effective cut ablation, invariant identity, memory effective on every counterfactual continuation, negative-sea-caused deviation followed by exact recurrent-reference restoration, and universally counterfactually discriminated outward influence
- memory erasure, excessive erosion, proof-budget exhaustion, contradiction, stored-record tampering, and disabled World Will have explicit regression evidence

Remaining gap:

- the bounded persistence detector does not derive life, goals, counterfactual choice among affordances, relationships, or narrative coherence
- recurrence is certified only by finite exact closure lassos; general coinductive, spatial, evolutionary, concurrent, and open-ended dynamics remain open
- the causal boundary is derived around existing exact fields; no law yet forms a new field schema, population, or relationship network dynamically
- multi-world sea transport, anchor transfer, and full identity remain absent

Next check:

Add the smallest goal-and-affordance case in which a certified persistent structure changes a lawful outcome under an internally maintained objective and action ablation. Do not call it an agent until counterfactual choice and autonomy are executable, and do not force that structure into worlds whose laws do not generate it.

### Q-024: When is a recurrent causal structure genuinely persistent?

Status: implemented bounded exact baseline in v0.5.3

Question:

What executable evidence distinguishes a field pattern that merely repeats from a structure that maintains a boundary and identity, carries causally active memory, repairs sea-caused damage, and affects its surroundings without being named as an entity in advance?

Current implementation:

- internal-law guard tuples and effect tuples derive a field/law factor graph and strongly connected field projections without discarding conjunctive dependency structure
- single-world recurrent components with structural, identity, memory, and boundary roles become candidates without an entity declaration
- incoming and outgoing law hypercuts provide a bounded causal membrane only when every crossing law binds boundary state and pre-formation boundary-state ablation changes every crossing law's realization on every lawful anchored continuation after unrelated recovery laws are suppressed
- the closure map is unfolded as a finite-branching coalgebra; all lawful selected continuations survive and an exact repeated causal configuration creates a finite lasso certificate only after at least two closures; committed anchor history remains a separate monotone extension and is never claimed to repeat with the configuration
- identity fields must remain invariant across the certified recurrence cuts
- erasing retained memory to its pre-formation value must change every lawful next continuation; mixed branches remain `undetermined`
- self-maintenance requires an explicit causal chain from negative-sea increase to structural deviation away from the recurrent reference and a boundary-and-memory-dependent internal restoration to that exact reference
- outward causal influence requires a realized outgoing-cut law and an externally changed field in every memory-erasure continuation
- non-recurrence under the closure bound and path-capacity exhaustion remain `undetermined`; contradiction remains contradiction
- run, inspection, stored record, and deterministic re-execution preserve cycles and all persistence evidence

Remaining gap:

- the component detector uses exact strongly connected field dependencies and four semantic field roles; this is not a universal biological, topological, or categorical account of individuality
- finite configuration-lasso recurrence does not prove an actually infinite physical history or repeated committed history, only exact closure of the causal configuration under the implemented coalgebra
- maintenance covers one exact sea pulse and restoration capacity, not continuous membrane flow, learning, metabolism, reproduction, or evolution
- persistence alone does not establish goals, action alternatives, agency, relationships, experience, or narrative

Next check:

Reopen from the first certified persistent structure that needs an internal objective, more than one lawful affordance, and action-ablation evidence. Preserve the distinction between persistence, agency, protagonist identity, and narrative projection.
