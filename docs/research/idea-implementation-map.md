# Idea and Question Implementation Map

Last reconciled: 2026-07-17

## Purpose

This map prevents user ideas, research questions, specifications, implementation, and verification from drifting into separate stories. It does not declare every idea complete. It records what is implemented, what remains an interpretation, what is deliberately deferred, and which milestone may change each status.

## Status Vocabulary

- **implemented baseline:** represented in code and mandatory verification, while wider research may remain open
- **partial:** a bounded operational slice exists but does not fulfill the whole idea
- **selected closure:** the next bounded release must finish this slice before opening a new feature family
- **active candidate:** implemented evidence is under adversarial hardening and does not yet authorize release closure
- **open:** the question remains active and lacks enough implementation or evidence
- **deferred:** intentionally kept out of the current release because its prerequisites are not stable

## Foundational Idea Trace

| User idea cluster | Questions | Current operational support | Honest status | Next milestone |
| --- | --- | --- | --- | --- |
| Independent bubble worlds with their own law, history, boundary, lineage, will, and identity | Q-001, Q-004 | Bubble IR, lineage-relative address, first-class boundary, semantic plan, worldhood/anchor proof claims | Partial | Strengthen identity conditions only from concrete same-world counterexamples |
| Finite representation of abundant or unbounded worlds | Q-006, Q-007 | Quotes, generators, latent bubbles, staged emissions, bundle plans, selective materialization, commit evidence | Partial | Bounded expanding-lineage storage and traversal experiment |
| Embedded observers recover truth from finite evidence | Q-013, Q-014, Q-016, Q-017 | Bounded outside observation, collapse records, local observation state, event-source attribution, inspection and replay reports | Partial | Phase 2 only, after the bubble universe is complete |
| World will acts as governing law rather than lore | Q-001, Q-004, Q-009, Q-018 | Executable candidate-admission law over projected state, branch-local baselines, and robust set-valued realization consequences | Implemented bounded baseline | Extend through cross-world anchor and richer internal-purpose seams |
| A world may change without universal time | Q-018, Q-019, Q-024 | No-universal-clock self-realization, explicit causal DAG, separate host evaluation order, reciprocal reversibility, commit-only history arrow, exact causal-configuration lasso recurrence, and separate monotone anchor-history extension | Partial | Add concurrency, duration, or synchronization only from a concrete world requirement |
| Finite language denotes infinity and infinite-dimensional world structure | Q-006, Q-009, Q-020 | Exact intensional families, countable product domains, guarded recursion, demand proofs, state-bound narrative predicates, honest budget exhaustion | Implemented bounded baseline | Extend only from a concrete representation failure |
| Infinite Bubble closes a finite demand and self-complements through its own execution | Q-020, Q-030 | Potentially unbounded constructor denotation, deterministic finite internal result forms, complete plural branch results, explicit frontiers, dormant-law reactivation, digest-linked monotone realization evidence, exact active recurrence certified by lineage/revision/anchor identity, recursively inherited complete executable schema-graph morphisms, and strict lossless `.bubble` lowering | Partial: bounded v0.5.8 baseline | Add intensional schema/formal-family generation; extend recurrence only from a concrete topology-changing or non-periodic failure without importing Phase 2 observation |
| Bubble may have world semantics wider than effective host computation | Q-020, Q-026 | Infinite intensional denotation, bounded proof traces, honest `undetermined`, no-universal-clock causal order, anchor provenance, and a formal trans-Turing research note; no oracle or limit-stage runtime | Open | Prove the effective conservation boundary, then compare typed oracle, symbolic limit, and disguised-oracle counterexamples |
| Bubble must execute efficiently without belonging to one host language or machine | Q-005, Q-008, Q-027, Q-028 | TypeScript reference runtimes, typed AST/IR, exact values, strict causal `.bubble` lifecycle and one-relation membrane lowering, deterministic replay, bounded proof failures, and an explicit late-5.x-to-6.x transition architecture, and bounded v0.5.9 BIR v1 plus a frozen causal conformance corpus with portable code-point ordering; no independent or native backend | Open selected transition boundary | Adversarially close the membrane, then portable semantic graph and conformance/cost fixtures in 5.x; begin Rust in 6.x |
| Persistent beings, agency, and stories may arise without being mandatory world primitives | Q-001, Q-018, Q-021, Q-023, Q-024, Q-025 | Actor-neutral causal fields/laws, factor-graph recurrent components, boundary-mediated law hypercuts, identity recurrence, universal memory erasure, recurrent-reference restoration, outward influence, an authored-goal-free invariant viability set, internally differentiated necessary responses, plus a compatible explicit narrative specialization | Partial | Add relation-mediated or simultaneous-alternative evidence before agency |
| World Will intervenes through anchors under objectives without puppeteering protagonists | Q-004, Q-018, Q-021, Q-029 | Exact global objective/cost, post-state hard constraints, identity-checked intervention, no-choice-overwrite guard, and a separate World-Will-disabled cross-world membrane whose receiver responds by its own law | Implemented bounded local baseline; bounded cross-world relation through v0.5.8 | Keep World Will distinct from transfer causality; later test richer relations without weakening autonomy |
| Bubble recursively creates modules, code, and a successor form of itself | Q-009, Q-012, Q-022 | Meta artifacts, staged grammar descriptions, reflection, and an intensional kernel are precursors only | Deferred | Reopen after every prior obligation and the current Bubble universe are complete |
| Bubble-generated worlds inherit and transform their own semantic structure | Q-018, Q-022, Q-031 | Content-addressed complete executable schema graphs, recursive inheritance, pre-instantiation whole-graph replacement, closed field/protection/port/sea/identity/law/emergence/projection dependencies, exact graph-change provenance, idempotent law-set morphisms, atomic unresolved sibling frontiers, and a strict source projection identical to the typed program | Partial: bounded v0.5.8 baseline | Derive intensional schema/family definitions without host callbacks; keep constructor/schema-incidence and successor implementation generation open |
| A dedicated language raises the representability frontier | Q-008, Q-009 | Versioned DSL, typed AST/IR, partial laws, constraints, quotations, reflection, latent semantics | Implemented baseline | Compare one Bubble-native task with a realistic host-language embedding |
| Nondeterminism and world formation have explicit semantic cost | Q-010, Q-014, Q-018, Q-029 | Eight typed effects, deterministic underdetermination, plural World-Will ties, v0.5.5 maximal-commuting autonomous branches, v0.5.6 lifecycle, and one transfer whose latent endpoint requires causal birth | Partial | Derive multi-transfer commute/conflict semantics without weakening branch or lifecycle provenance |
| Bubbles generate worlds, descendants, artifacts, and staged language structure | Q-006, Q-009, Q-012 | Meta profile, quotes, generators, reflection, emission, grammar artifacts and staged activation | Partial | Expand only from an observed membrane or composition failure |
| Negative sea, positive sea, and anchor form one operational ontology | Q-002, Q-003, Q-004, Q-005, Q-014, Q-021, Q-024, Q-029 | Explicit IR source projections, runtime assessments, theorem witness, bounded attribution, exact local sea-to-viability coupling, identity-checked intervention, one erosion/restoration chain, and an active exact transfer candidate with source negative residue and target positive placement | Partial | Generalize only from a concrete second relation; do not call local accounting a global sea |
| Observation materializes and deforms latent world state | Q-016, Q-017 | Single-region materialization law, perturbation mix, sea/anchor state structure, commit/replay records | Implemented bounded baseline | Reopen only for a concrete coupled-region or author-control requirement |
| Deterministic substrate may host probabilistic-fractal worldhood | Q-015 | Research note and explicit non-goals only | Deferred | Requires distributional identity, contradiction, and replay semantics first |
| Bubble must earn its existence as a research instrument | Q-011, Q-013 | End-to-end executable loop and inspectable ontology, but no comparative scored benchmark | Open | Phase 2 benchmark after world-core completion |

## Question Ledger

| Question | Reconciled status | Why it is not more complete | Planned boundary |
| --- | --- | --- | --- |
| Q-001 minimal independent world | Partial | Minimum engineering schema is not a final worldhood philosophy | Preserve baseline; revise from counterexample |
| Q-002 negative sea | Partial | Exact local pressure changes viability, but global transport and erosion laws do not exist | Reopen from a multi-world or membrane-pressure case |
| Q-003 positive sea | Partial | Exact local support changes viability, but placement/growth transport does not exist | Reopen from lineage placement or cross-world growth |
| Q-004 strong anchor | Partial | Inferred score and criterion are not a full identity calculus | Later same-world counterexamples |
| Q-005 same-world replay | Partial | v0.5.1 through completed bounded v0.5.5 have deterministic same-program re-execution, including persistence, teleonomic counterfactuals, exhaustive endogenous branch lineage, and set-valued World-Will evidence, not a universal identity theorem across implementations | Extend from a concrete migration or semantic-version case |
| Q-006 unbounded multiverse | Partial | Intensional forms exist without scale/storage experiment | Later Phase 1 lineage experiment |
| Q-007 latent-to-history commit | Partial | Single-region runtime policy lacks coupled commits | Reopen only from second-region case |
| Q-008 DSL or general language | Answered for current architecture | Long-term language shape may still evolve | Dedicated constrained DSL remains in force |
| Q-009 representability frontier | Partial | No broad solver or cross-file semantic composition | Stabilize before widening |
| Q-010 primitive effects | Partial | The causal kernel executes and records branch nonrealization, observation materialization, finite internal-law birth, and self-retirement as distinct transitions | Extend only from a concrete typed cross-world or dynamic-schema requirement |
| Q-011 unique Bubble leverage | Open | No realistic host-language comparison | Phase 2 benchmark gate |
| Q-012 language-bubble membranes | Partial | Several observed classes logged; catalog incomplete | Evidence-led additions only |
| Q-013 usable benchmark loop | Partial | Executable loop lacks scores and repeated trials | Phase 2 benchmark gate |
| Q-014 event source distinction | Implemented bounded baseline | Event-level attribution is not a general causal calculus | Reopen from a concrete unsupported subject or cross-world transfer |
| Q-015 probabilistic-fractal worldhood | Deferred | Identity and replay under probability clouds are undefined | Later, after deterministic world core |
| Q-016 observation materialization | Implemented bounded baseline | No coupled regions or general solver | Keep closed until concrete reopen condition |
| Q-017 observation-changing replay | Partial | History shape is preserved but not separately proven | Reopen after deterministic replay design |
| Q-018 organic self-realization | Implemented bounded baseline with bounded v0.5.8 extension | Multi-frontier closure, exact recurrent persistence, bounded endogenous branching, finite lifecycle, state-reactivated generation, recursively branch-indexed connected-universe closure, bounded exact generated recurrence, and inherited complete executable schema-graph transformation exist, but intensional schema/formal-family generation and topology-changing or non-periodic generated persistence do not | Define one intensional schema/family seam; reopen recurrence only from a concrete stronger cycle |
| Q-019 time inside a bubble | Partial | Exact closure-lasso recurrence now exists without duration, metric time, concurrency, or cross-world synchronization | Extend only from a concrete world law |
| Q-020 finite language for infinity | Implemented bounded baseline with bounded v0.5.8 extension | Exact countable indexed families, typed query sources, guarded recursion, and strict causal plus endogenous connected-universe source lowering exist; richer domains and endogenous generation of new family definitions do not | Extend from a concrete representation failure |
| Q-021 anchored narrative agency | Implemented bounded connected special case | Finite explicit agent-bearing execution exists; it is not the universal world minimum and persistent stories, relationship affordances, global seas, and cross-world anchors do not | Reopen one organic extension at a time |
| Q-022 recursive self-construction | Deferred | No self-hosting compiler, module generator, verified code execution, or successor-equivalence proof exists | Later version after accepted Bubble completion |
| Q-023 natural emergence without forced narrative | Implemented actor-neutral, persistent, teleonomic, endogenous-branching, and finite-lifecycle baselines | Canonical and distributed-state components have invariant norms and necessary responses, while plural formation and lifecycle worlds remain actor-neutral; deliberative agency, relations, and narrative projection remain open | Next bounded relation or internal-selection case |
| Q-024 genuine persistence | Implemented bounded exact baseline | Strongly connected field cuts and finite recurrence are not a universal individuality, biology, or infinite-history theorem | Reopen from a richer topology or maintenance requirement |
| Q-025 endogenous goal-directed capacity | Implemented bounded teleonomic-capacity baseline | The exact lasso yields only a finite invariant subset; v0.5.5 adds world branching but not option representation or internal selection, so deliberation, agency, relation, and life remain open | Later preference- or relation-bearing agency contract |
| Q-026 trans-Turing Bubble semantics | Open independent foundational question | Current infinite denotation, causal plurality, and self-reference remain effectively computable; no typed oracle, computability degree, limit-stage transition, non-computable continuum source, physical substrate contract, or non-effective replay provenance exists | Formal effective/oracle/limit/disguised-oracle comparison before any release selection |
| Q-027 portable execution authority | Partial: bounded v0.5.9 Gate C and Gate D slices | BIR v1 encodes the executable causal kernel as one canonical binary semantic graph with code-point ordering, set/sequence classification backed by permutation evidence, extension preservation, and separated semantic, storage, and backend identities; all canonical causal programs round-trip and execute identically. TypeScript remains the only executor, and run-evidence digests still use stable JSON serialization | An independent backend reproducing the frozen causal conformance corpus from the specifications, then outcome schemas for other program forms, before Rust 6.x |
| Q-028 efficient cross-substrate execution | Open across late 5.x and 6.x | Intensional demand evaluation and honest budgets exist, but branch search, exact arithmetic, state cloning, hashing, and dependency recomputation have no portable cost or optimization contract | Specify cost equivalence in 5.x; validate optimized Rust execution from 6.x |
| Q-029 autonomous cross-world membrane | Completed bounded v0.5.7 baseline with bounded v0.5.8 generated-topology extension | Generated relation anchors carry exact state, distinct sea actions, and complete child schema-revision provenance into recursively branching connected worlds; repeated crossings, payload transformations, conservation, global seas, and general anchor identity remain undefined | Extend only from a concrete repeated-crossing, dependency-order, identity, or quantity-law failure |
| Q-030 finite-cut determinacy and self-complementing realization | Partial: bounded v0.5.8 finite certificate | The runtime deterministically certifies one closed result, the complete closed branch family, an open boundary, or contradiction; exact active recurrence includes inherited complete executable schema-graph identity and a replay/commit-separated evidence ledger; strict source lowers the same program; no branch is selected | Implement intensional schema/formal-family generation; keep general convergence, topology-changing persistence, and Phase 2 observation open |
| Q-031 generated law/schema structure | Complete executable world-local graph and source slice; intensional generation active | Every world carries and executes an inherited content-addressed field/protection/port/sea/identity/law/emergence/projection graph; one recursively closed pre-instantiation replacement closes dependencies and records exact provenance, with typed law specialization, atomic failure, and lossless strict source lowering | Add intensional graph/family generation only with worldhood preservation; keep constructor/schema-incidence and executable self-construction open |

## Contradiction Guards

These tensions are intentional and must not be collapsed into accidental contradictions:

1. **Observer-independent existence vs observation-caused materialization:** a latent bubble exists as compressed lawful structure before contact; observation selects or deforms a concrete local history without creating worldhood from nothing.
2. **Authored intent vs inferred assessment:** authored will, anchor criterion, and effects remain distinct from runtime sea/anchor scores and materialized evidence.
3. **Potential effect vs executed event:** a declared capability may remain potential; the runtime must not fabricate a causal target.
4. **Stored replay vs same-world proof:** reopening a preserved bundle demonstrates record continuity, not deterministic re-execution identity.
5. **Unbounded possibility vs finite storage:** unbounded lineage is represented intensionally; only contacted or committed slices become explicit state.
6. **Deterministic baseline vs probabilistic ambition:** deterministic bounded semantics remain authoritative until distributional identity and contradiction rules are specified.
7. **Universal bubble ontology vs host implementation:** TypeScript may implement the stack, but host-only behavior must not silently become Bubble semantics.
8. **World autonomy vs external scheduling:** tooling may materialize, inspect, or resume an explicit continuation, but it must not choose a world outcome outside executable world will.
9. **No universal clock vs no change:** absence of one global clock preserves invariant, reversible, cyclic, causal, branching, and committed-history possibilities; it does not mean every world is frozen.
10. **Phase 1 world completion vs Phase 2 observation:** observers may later investigate worldhood but must not define or substitute for the unfinished world core.
11. **Natural-language provenance vs executable semantics:** author text remains immutable evidence of intent, while only typed formal lowering may govern execution.
12. **Portable semantics vs binary or backend identity:** BIR, canonical storage, TypeScript execution, Rust execution, and future substrates may realize one meaning, but none is allowed to redefine that meaning through object layout or evaluation order.
13. **Finite determinacy vs singular collapse:** one deterministic result may be the complete lawful branch family; finite demand cannot select a member or claim that the infinite denotation has ended.
14. **Self-complementing evidence vs monotone world state:** closure evidence may accumulate while fields reverse or recur; evidence growth is not a convergence or whole-universe theorem.
13. **Host performance vs internal time:** CPU duration, memory, work counters, and parallel scheduling describe physical realization cost; they do not install a scalar clock or causal order inside a Bubble.
12. **Possible internal being vs external observer-agent:** a being that lawfully emerges inside a Bubble belongs to Phase 1 world semantics; a later evaluator or benchmark agent remains Phase 2. Neither makes protagonists mandatory schema.
13. **Finite representation vs literal completion of infinity:** an intensional family denotes all lawful coordinates but one run proves only demanded coordinates.
14. **World-Will influence vs manufacture:** intervention may change permitted conditions through an anchor; direct replacement of protagonist choice or direct writing of protected internal structure violates the causal contract.
15. **Self-construction horizon vs current completion:** later recursive code and module generation must not replace or hide unfinished Bubble-universe semantics.
16. **World branching vs agency:** plural autonomous worlds may arise from incompatible internal laws without any being representing or choosing among them; branch actualization alone must not be renamed deliberation.
17. **Infinite denotation vs hypercomputation:** a world may denote more structure than one run materializes and may contain truths inaccessible to host or inhabitants, but no non-recursive answer is `effective` unless its extra oracle, limit, axiom, exact-continuum, or physical source is typed and preserved.
18. **Cross-world connection vs host routing:** a typed anchor crossing may establish a receiving boundary condition, but the host, World Will, or transfer itself may not manufacture the receiver's protected internal response.

## v0.5 Status And Completed v0.5.1/v0.5.2/v0.5.3/v0.5.4/v0.5.5/v0.5.6/v0.5.7/v0.5.8/v0.5.9 Gates

`v0.5.0` implements the first organic self-realization vertical flow. It does not declare the whole bubble universe complete.

Completed `v0.5.1` satisfies its bounded connected gate by:

- keep every question's honest current status and reopen condition
- preserve the no-universal-clock and no-external-selector contracts
- keep Phase 2 observer and comparison work deferred
- passing mandatory `verify:self-realization`, narrative run/inspect/record/replay, and full repository verification
- executing one connected Phase 1 seam from exact intensional representation through protagonist story, anchor-mediated World-Will intervention, sea coupling, causal evidence, and replay
- keep natural-language ideas as provenance while requiring typed formal semantics for execution
- reject any return to independent semantic-regime menus or a hidden host selector

Current evidence:

- the author idea corpus and machine-readable obligation ledger are present
- the exact intensional-family kernel and focused tests are present
- narrative-world IR, agency validation, post-state constraints, and causal counterfactuals are present
- the generic runtime and CLI execute, inspect, record, and deterministically re-execute the canonical formal world
- general open-ended persistence, relationship-mediated action, global sea transport, cross-world anchors, and full identity remain open

This transition does not close or delete the partial, open, or deferred rows above.

Completed bounded `v0.5.2` adds the forward corrective gate by:

- preserving the already completed and pushed `v0.5.1` narrative kernel as a compatible explicit specialization
- removing protagonists and authored event graphs from the universal minimum without banning their later formation
- generating internal events from exact state-bound law guards over multiple causal frontiers
- applying simultaneous frontiers only when their effects commute and preserving non-commutation as `underdetermined`
- coupling both seas after state transitions and keeping universal-clock claims false
- preventing World Will from directly mutating protected structure while allowing anchored condition changes to activate internal response
- recording generic structure emergence or dissolution with exact witnesses and causal provenance
- preserving run, inspection, stored record, and deterministic replay evidence

At the `v0.5.2` boundary, persistence, memory, self-maintenance, derived agency and relations, narrative projection, recurrence, global sea transport, cross-world anchors, and full identity remained open. That corrective gate did not close OB-001, OB-005, or OB-011; `v0.5.3` takes only the bounded persistence slice below.

Completed bounded `v0.5.3` adds the first persistence-and-boundary gate by:

- wrapping the unchanged actor-neutral causal program in a closure coalgebra rather than changing `v0.5.2` semantics
- deriving strongly connected field projections and their incoming/outgoing boundary-mediated law hypercuts from a conjunctive field/law factor graph without declaring an entity
- unfolding every lawful selected continuation and certifying exact finite configuration-lasso recurrence only after at least two closures while preserving monotone committed anchor history separately
- requiring invariant identity, universally effective retained memory, negative-sea-caused deviation followed by exact recurrent-reference restoration, and universally discriminated outward influence as separate evidence
- preserving no-universal-clock semantics, contradiction, ambiguity, explicit proof budgets, inspection, stored record, and integrity-checked replay
- rejecting a name-only memory field, mixed plural counterfactual, unmediated pairwise cut, non-reference change-and-return, over-capacity erosion, incomplete recurrence search, and tampered evidence

Remaining work now includes internally maintained goals, counterfactual choice among lawful affordances, relations, narrative projection, dynamic field/population formation, general coinduction, global sea transport, cross-world anchors, and full identity. This gate does not close OB-001, OB-004, OB-005, or OB-011.

Completed bounded `v0.5.4` adds the teleonomic-capacity gate by:

- preserving the same persistent program rather than adding goal, agent, action-menu, or protagonist declarations
- deriving a finite exact invariant viability set from the certified recurrent component configurations without claiming maximality
- requiring at least two response laws realized in one recurrent path under pairwise-disjoint internal component-state values that are causally regenerated by the response cycle
- suppressing each factual response event while retaining the same program and law, and universally requiring every witnessed World-Will-disabled, all-anchors-cut continuation to leave the factual invariant set
- erasing retained memory separately for every factual response and universally requiring that response event to disappear
- re-executing the complete persistent world with World Will disabled and every anchor cut and requiring the identical kernel
- preserving no-universal-clock order, configuration/history separation, proof-budget uncertainty, inspection, stored evidence, and exact replay
- rejecting single-response persistence, detached phase scheduling, decorative memory, host selection, existential counterfactual success, external puppetry, maximal-kernel overclaim, and tampered evidence; period-three and distributed-channel positive cases check beyond the canonical scalar period-two shape

At the `v0.5.4` boundary, remaining work included deliberative or simultaneous counterfactual choice, relation-mediated action, agency, narrative projection, dynamic field/population formation, endogenous causal birth/retirement, general coinduction, global sea transport, cross-world anchors, and full identity. Later releases close only the explicitly recorded slices below; this gate itself does not close OB-001, OB-004, OB-005, or OB-011.

Completed bounded `v0.5.5` adds the endogenous-causal-branching gate by:

- preserving the previous `underdetermined` behavior unless a program explicitly opts into maximal-commuting branches
- deriving the exact compatibility graph of simultaneously enabled laws and realizing every maximal commuting frontier
- recording every enabled, realized, and branch-nonrealized law with `hostSelection: false`
- retaining laws compatible with all alternatives in every branch and rejecting false conflicts from identical set projections or additive zero
- refusing any partial selected branch when branch or frontier capacity cannot preserve the complete finite result
- assigning every autonomous branch its own anchor identity, World-Will baseline, and intervention frontier
- treating post-intervention branches as one set-valued consequence, requiring every outcome to be admissible, comparing guaranteed minimum exact improvement, and preserving every selected outcome
- unfolding real plural autonomous formation paths through the persistence coalgebra and retaining boundary, identity, causal memory, recurrent-reference restoration, and outward influence on both
- preserving branch lineage and exhaustive status through inspection, stored record, and exact replay

Remaining work includes an internally generated chooser or relation that could support deliberation, agency, and narrative projection; dynamic fields and populations; general coinduction; global sea transport; cross-world anchors; and full identity. This gate does not close OB-001, OB-004, OB-005, or OB-011, and it does not revise the narrower completed claim of `v0.5.4`.

Completed bounded `v0.5.6` adds the endogenous-world-lifecycle and source-lowering gate by:

- preserving every existing world as initially active unless a program explicitly declares a latent world
- allowing only irreversible internal law events to actualize declared latent worlds or retire their own active source world
- making spawn events the direct causal source of the child's initialized fields and later internal-law execution
- deriving one multi-parent lineage event when several commuting laws conjunctively cause the same birth
- distinguishing causal birth, branch nonrealization, observation-induced local materialization, and world retirement
- retaining final exact fields, local negative-sea residue, lineage, and committed-memory ids after retirement rather than deleting the world
- making anchors, World-Will objectives, constraints, and interventions range only over active endpoints and targets
- forwarding lifecycle phase and provenance through the persistence coalgebra and exact configuration digest
- preserving lifecycle counts, events, history direction, and tamper evidence through inspection and replay
- demonstrating one canonical generational world whose origin births a descendant and retires while the descendant's newly active anchor carries a condition that the descendant answers by its own law
- lowering authored exact lifecycle declarations through a strict `causal bubble` profile into the same runtime, with explicit inverse effects for reversible laws and static exact-value comparison boundaries

This completed bounded release actualizes a finite declared latent graph; it does not generate schemas, law sets, populations, global sea transport, cross-world transfer, agency, narrative coherence, or the whole universe. Its strict source profile preserves the original `.bubble` spawn/collapse meanings unchanged. The partial, open, and deferred obligations above remain live.

Completed bounded `v0.5.7` Gate B adds only:

- one directed typed two-world anchor span caused by an irreversible source-world internal law
- active endpoint and explicit port checks, exact-kind agreement, cut handling, and atomic pre/post identity
- exact source negative-sea residue, target positive-sea placement, and local viability recomputation
- target-condition admission followed by protected structural response from the target world's own law
- causal birth before transfer into a formerly latent endpoint
- strict source lowering, inspection, record, replay, and adversarial shortcut rejection

This bounded release does not revise the completed `v0.5.6` lifecycle claim. Multiple or repeated transfers, their branch/actualization commutativity, global sea structure, conservation, transformations, dynamic topology, BIR, Rust, Phase 2 observers, and whole-universe completion remain open. Human-scale agency or narrative labels are optional interpretations, not required completion gates.

Completed bounded `v0.5.8` adds the endogenous connected-universe generation gate:

- a finite exact program denoting recursive finite or natural constructor families with polynomial-coalgebra-like structure
- root-relative constructor/coordinate lineage addresses and deterministic derived world identity without an absolute multiverse ordinal
- complete-sibling admission and atomic materialization from one parent snapshot, including no-partial-family resource failure
- local identity anchors, generated relation anchors, and multiple named positive/negative sea channels whose sibling actions compose by exact addition
- exact parent-payload to child-condition transport with type/protection checks and causal provenance into the receiving world's own law
- a derived simultaneous causal membrane frontier with unique targets, no same-frontier transfer chaining, combined field causes, and no host order among sibling crossings
- explicit depth, natural-open, world-budget, and admission-undetermined frontiers without a false exhaustive-universe claim
- optional scalar projection only at the legacy causal adapter, plus run, inspection, stored replay, CLI artifacts, tamper rejection, and transport-removal counterevidence
- bounded alternation of causal closure and constructor admission, where a dormant exact-false constructor can activate from realized state and a closure budget cannot leave a newly formed world falsely complete
- recursive branch-indexed generation in which every lawful causal continuation receives deterministic lineage, branch-local topology/sea/anchor evidence, and its own later closure; an insufficient branch budget preserves the complete frontier and selects no subset
- total typed query-template validation for exact axes, parameter coverage, source kinds, reachable seeds, and parent-state availability before world materialization
- deterministic finite internal-demand result forms, intensional infinity preservation, and a digest-linked self-complementing evidence chain without external observation or branch selection
- exact active generated recurrence certified by lineage, revision, anchor identity, in-cycle dependency preservation, and separate replay/commit ledgers rather than endpoint equality
- content-addressed complete executable schema graphs inherited through recursive lineage, with atomic pre-instantiation graph replacement, closed field/protection/port/sea/identity/law/emergence/projection dependencies, exact graph-change provenance, idempotent law morphisms, compiler consumption, and whole-sibling failure atomicity

This is a substantial OB-003/OB-004/OB-006/OB-007/OB-008/OB-011/OB-014 advance, not whole-universe completion. Strict `.bubble` lowering now covers the current connected-universe contract. Intensional schema/formal-family generation, constructor/schema-incidence transformation, topology-changing or non-periodic persistence, lawful branch equivalence/convergence, general identity calculus, global sea operators, portable BIR, Rust, Phase 2, recursive implementation self-construction, and trans-Turing execution remain open. The author selected confirmation at this scope on 2026-11-16 and the package identity is `0.5.8`; that selection closes no item in this paragraph.

Completed bounded `v0.5.9` adds the first Gate C portable-graph slice:

- portable Unicode code-point string order in every kernel in place of host ICU collation
- removal of world, effect, committed-field, and anchor declaration-order leaks from causal evidence, plus rejection of duplicate committed fields
- BIR v1 for `bubble-anchored-causal-program.v2`: a canonical node algebra, schema-directed strict lowering and lifting, a versioned sectioned envelope with an integrity trailer, preserved non-executed extensions, non-executable unknown critical sections, and separated semantic, storage, and backend identities
- byte-for-byte round-trip, canonical lift, permutation invariance, and identical execution for every canonical causal program, including the compiled 7-world connected universe, and a source-to-BIR-to-execution cycle inside `npm run verify`

The same release adds the first Gate D slice:

- a portable causal outcome projection that keeps what the world did and drops how the oracle computed it
- RFC 8785 derivations for world-identity evidence ids, reproduced by an independent implementation
- a frozen 15-fixture conformance corpus of canonical worlds and resource-boundary, autonomy, nonrealization, membrane-cut, and contradiction verdicts, checked inside `npm run verify`
- deterministic host-cost count profiles for the four Q-028 workload classes

This advances OB-013, Q-027, and Q-028 only. An independent backend, outcome schemas and BIR sections for endogenous, persistent, and narrative programs, portable replay records, cost-justified representation choices, Rust, and every v0.5.8 open item remain open.
