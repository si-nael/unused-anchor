# Question Log

Last reconciled: 2026-07-15

## Open Questions

### Q-001: What is the minimal independent bubble-world schema?

Status: partially answered through v0.4.9

Question:

What is the smallest Bubble world definition that still deserves to count as an independent world rather than as a loose generated fragment?

Current implementation:

- the compiler separates minimum authored shape from stronger runtime worldhood certification
- a bubble receives its own lineage-relative address, boundary, generation lifecycle, semantic plan, ontology assessment, and proof surface
- `claim:worldhood` prevents mere syntax success from being presented as sufficient worldhood

Remaining gap:

- the current minimum is still a bounded engineering contract, not a final philosophical criterion for independent worldhood
- observer-agent recovery and long-running autonomous persistence are not part of the minimum schema yet

Next check:

Use the current minimum schema as the `v0.4` baseline and revise it only when a concrete world that should count as independent cannot be represented or certified honestly.

### Q-002: How should the negative sea be represented operationally?

Status: partially answered through v0.4.9

Question:

Which runtime and IR structures should carry erosion, outside residue, leakage, and boundary pressure without reducing the negative sea to decorative vocabulary?

Current implementation:

- `negativeSea.pressure`
- `negativeSea.pressureSources`
- `bubble.seaSemantics.negativePressureSources`
- `negative-sea-state` evidence records
- boundary and effect-role structure lowering into explicit sea-source IR, then feeding runtime ontology and proof basis

Remaining gap:

- pressure sources are now explicit IR semantics, but still projected from authored structure rather than direct source-level law objects
- no continuous or step-level negative-sea dynamics exists yet

Next check:

Decide whether any negative-sea source classes need direct authored syntax beyond the current IR projection, or whether richer dynamics should come first.

### Q-003: How should the positive sea be represented operationally?

Status: partially answered through v0.4.9

Question:

Which runtime and IR structures should carry lineage, placement, growth, and stabilization across related worlds?

Current implementation:

- `positiveSea.support`
- `positiveSea.supportSources`
- `bubble.seaSemantics.positiveSupportSources`
- `positive-sea-state` evidence records
- lineage, boundary, history-support, and staged-emission structure lowering into explicit sea-source IR, then feeding runtime ontology and proof basis

Remaining gap:

- support sources are now explicit IR semantics, but still projected from authored structure rather than direct source-level stabilization law
- there is still no richer positive-sea dynamics model beyond bounded source aggregation

Next check:

Decide whether any stabilization or lineage signals need direct authored law surfaces beyond the current IR projection.

### Q-004: What makes an anchor point strong enough?

Status: partially answered through v0.4.9

Question:

Which combination of laws, seed continuity, history commitment, observation support, and lineage placement is sufficient to hold a world to its own identity?

Current implementation:

- inferred `anchorPoint.strength`
- separated `declaredHistorySupport` and `materializedHistoryEvidence`
- `authoredCriterionStatus`, `authoredCriterionBasis`, `materializedEvidenceSources`, and `identityStatus`
- theorem witness plus bounded proof claims for anchor and replay identity

Remaining gap:

- anchor strength is still an inferred bounded score, not a full authored identity calculus
- boundary, world will, and runtime evidence are more honest now, but still not yet a complete same-world proof basis

Next check:

Continue replacing coarse proxy scoring with explicit authored or IR-supported identity conditions where the semantics are now stable enough.

### Q-005: When does replay return to the same world?

Status: partially answered through v0.4.9

Question:

Under what conditions should rewind or replay be interpreted as returning to the same world identity rather than to a nearby reconstructed variant?

Current implementation:

- bounded `claim:replay-identity`
- explicit distinction between declared history support and materialized history evidence
- authored anchor criterion and runtime ontology basis feeding replay proof
- observed history shapes preserved through materialization, inspection, and replay

Remaining gap:

- observation-history shape still influences replay mainly through basis and runtime policy surfaces rather than a dedicated proof family
- multi-region and stochastic replay semantics remain intentionally out of scope for stabilization

Next check:

Keep the stored-report replay claim explicitly bounded. Before `v0.5` promises same-world replay, define a deterministic re-execution comparison that can distinguish artifact equality, lawful same-world evolution, and nearby reconstruction.

### Q-006: How should an unbounded multiverse be represented?

Status: partially answered through v0.4.9

Question:

What finite representation can preserve the operational meaning of a potentially unbounded collection of bubble universes without storing full explicit state for each one?

Current implementation:

- lineage-relative addresses and templates avoid one cheap absolute multiverse index
- quotes, generators, latent-bubble semantics, staged emissions, and bundle plans preserve world families intensionally
- materialization creates only selected artifacts and local observed regions

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

Status: implemented bounded baseline in v0.5.0

Question:

What minimum state, possibility, selection, continuation, and evidence structure lets a bubble operate organically through its own world will, while preserving deterministic ambiguity and authored nondeterministic plurality rather than letting host code choose a convenient outcome?

Current implementation:

- explicit scalar `state` declarations and reversible or irreversible `transform` declarations
- projected preserve/transform candidate environments evaluated by executable world will
- statuses for stable, realized, plural, underdetermined, blocked, and contradicted world states
- provenance-bearing continuations and explicit resume input that cannot select a winner
- self-realization proof, evidence, effect causality, source attribution, inspection, and replay
- actual history commit only for an admitted `commit` transformation

Remaining gap:

- one materialization evaluates one self-realization frontier; there is no bounded autonomous multi-step traversal yet
- branch, spawn, and collapse are typed continuation consequences but not all yet execute concrete world artifacts or retirement records from self-realization
- transformations currently change one scalar coordinate at a time
- selected realization consequences do not yet feed back into a full sea/anchor dynamics calculus

Next check:

Use `v0.5.1` to close one concrete continuation seam without introducing an external scheduler or universal clock. Prefer concrete branch/spawn/collapse execution or bounded multi-step closure only after its termination and provenance law is explicit.

### Q-019: What does time mean inside a bubble universe?

Status: partially implemented in v0.5.0

Question:

Should Bubble have universal time at all? If time is absent, does that mean no change, invariant existence, reversibility, cyclic return, or merely that world events form causal and partial orders rather than one scalar clock? When does an irreversible history arrow actually begin?

Current implementation:

- every self-realization records `clockAssumption: no-universal-clock`
- invariant preservation introduces no new order
- reversible transforms require exact reciprocal inverse and create causal order without durable history
- non-commit irreversible transforms remain causally ordered without being misreported as committed history
- selected commit transforms create `committed-history` order and the history arrow
- branch and terminal consequences have distinct topology

Remaining gap:

- no explicit causal graph or partial-order proof
- no first-class cyclic trajectory, duration, synchronization, or metric-time semantics
- no theorem yet connecting the discrete realization order to the analytic path parameter used in the sea-anchor proof
- interaction among multiple bubbles with distinct order structures remains open

Next check:

Keep universal time absent by default. Add order structure only when a concrete world requires cycles, concurrency, cross-bubble synchronization, or duration and the semantics can remain inspectable without reducing all worlds to host clock ticks.
