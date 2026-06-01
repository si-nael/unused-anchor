# Question Log

## Open Questions

### Q-001: What is the minimal independent bubble-world schema?

Status: open

Question:

What is the smallest Bubble world definition that still deserves to count as an independent world rather than as a loose generated fragment?

### Q-002: How should the negative sea be represented operationally?

Status: partially answered by v0.4.1

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

Status: partially answered by v0.4.1

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

Status: partially answered by v0.4.1

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

Status: partially answered by v0.4.1

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

Keep replay identity bounded during `v0.4.1` stabilization and decide later whether observation-history shape deserves its own first-class proof claim.

### Q-006: How should an unbounded multiverse be represented?

Status: open

Question:

What finite representation can preserve the operational meaning of a potentially unbounded collection of bubble universes without storing full explicit state for each one?

### Q-007: When does a latent world become committed history?

Status: open

Question:

What events force a procedurally generable world or region to become persistent history rather than a regenerable possibility?

### Q-008: Should world definition use a DSL or a full programming language?

Status: open

Question:

What is the smallest language expressive enough to define rich bubble universes while still supporting static checks, replay, compilation, and explicit world semantics?

### Q-009: How can the language raise the representability frontier without becoming opaque?

Status: partially answered by v0.4.1

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

Status: open

Question:

Which effects should exist as first-class Bubble primitives, such as branch, spawn, collapse, commit, leak, debt, perturb, or observe, so that world formation remains analyzable rather than opaque?

### Q-011: What work can only Bubble do cleanly?

Status: open

Question:

Which concrete tasks in world generation, replay, sea-anchor modeling, or staged language formation become materially cleaner or more faithful in Bubble than in a host-language embedding with ordinary tooling?

### Q-012: What are the first membrane surfaces inside the Bubble Language bubble itself?

Status: open

Question:

If Bubble Language is itself one governing bubble, where do membrane pressure and boundary failure first appear inside it: profile compatibility, staged activation, reflective scope, runtime escape hatches, provenance loss, or some other boundary?

### Q-013: What is the first directly usable sea-anchor benchmark loop?

Status: open

Question:

What is the smallest end-to-end combination of Bubble-authored world, operational step semantics, lineage or boundary signals, and evaluation surface that would let the project run immediate sea-anchor experiments rather than only language validation?

### Q-014: How should runtime distinguish internal event, negative-sea residue, and anchor drift?

Status: open

Question:

When a weakly anchored bubble world is observed under pressure from outside residue or boundary disturbance, how should the runtime classify what appears to be an internal event, a negative-sea intrusion, or record instability from anchor weakness?

### Q-015: How can a deterministic machine host a probabilistic fractal bubble world without destroying anchor semantics?

Status: open

Related note: [Deterministic Substrate and Probabilistic-Fractal Worldhood](probabilistic-fractal-worldhood.md)

Question:

If Bubble eventually treats apparent uncertainty as something generated by deterministic substrate limits, chaotic amplification, recurrence structure, or other fractal machine dynamics rather than only by explicit authored branching, what semantics would still let the system distinguish three cases:

- a genuine world inconsistency
- an ordinary but rare tail event inside lawful stochastic structure
- a replay or anchor-identity failure caused by probability-cloud drift

This is the core stochastic SOT problem: how to preserve same-world identity, contradiction detection, and replay meaning when the world's anchor is no longer a single crisp fixed point but a structured probabilistic cloud.

### Q-016: How should a latent region become concrete under observation or interaction?

Status: first bounded implementation slice exists in v0.4.1

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

Next check:

Finish stabilizing the current single-region law across proof, inspection, replay, and verify coverage before widening syntax or solver scope.

### Q-017: How should same-world replay work once observation itself changes the world?

Status: partially explored by v0.4.1

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

Preserve the current bounded semantics during `v0.4.1` stabilization, then decide whether observation-history shape should become its own proof claim.
