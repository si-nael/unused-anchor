# Boundary Log

## Purpose

This log records the first identifiable boundary and membrane failures inside the Bubble Language bubble itself.

The point is not to treat every compiler error as deep theory.

The point is to keep visible the classes of failure that show where Bubble's own membranes, compatibility rules, or self-descriptive limits need to harden.

## 2026-11-16

### B-053: Two identity semantics remained implicit at the confirmation boundary

Observed surface:

The v0.5.8 confirmation audit found two places where anchor identity is weaker than a reader of the recurrence certificate might assume. First, a `parent-field` source inside a relation-identity query is resolved from the parent snapshot at generation and baked into the stored predicate. The predicate therefore cannot see later parent state, and its field is not an identity dependency: a cycle that changes and restores `parent.condition` is not certified when the predicate binds that field live, but it is certified as `persistent-recurrence` when the same comparison reads `parent-field(condition)`. Second, a demanded fixpoint is certified by configuration equality, no new world, and zero realized events. It does not evaluate anchor identity at the final cut, unlike `persistent-recurrence`, so a run can report `fixpointReached: true` and `single-closed-result` while a generated relation anchor's identity predicate evaluates false.

Boundary meaning:

Neither behavior contradicts a written v0.5.8 claim: `parent-field` was deliberately admitted as a birth-snapshot source (D-125), and the fixpoint contract never mentioned identity. Both are semantic choices about what an anchor is, and the repository's discipline reserves those for the author rather than for a release-preparation patch.

Current handling:

Left unchanged and recorded as open in the v0.5.8 architecture record. Candidate resolutions: reject `parent-field` sources in identity predicates, or keep them but expose frozen inputs in the certificate; and require, or merely report, anchor identity at a fixpoint cut, with an explicit status for an identity-broken fixpoint.

Next check:

Decide both semantics before any later recurrence, convergence, or anchor-calculus work builds on them.

### B-052: An admitted sibling vanished when another sibling's admission was unresolved

Observed surface:

When one coordinate of a constructor family was admitted and another coordinate's admission exhausted its proof budget, the whole family was correctly withheld, but only the unresolved coordinate was recorded. The admitted sibling was neither materialized nor present in any frontier.

Boundary meaning:

All-or-nothing sibling atomicity must not erase evidence. A withheld admitted world is still a demanded consequence of Bubble law, and dropping it from the frontier makes the open boundary smaller than it is.

Current handling:

Each admitted member of an unresolved family is recorded as a `sibling-admission-pending` frontier. A regression covers one admitted and one unresolved coordinate.

Next check:

Any future partial-evaluation path must record every withheld member of the family it withholds.

### B-051: World budgets selected an order-dependent prefix and claimed exhaustiveness

Observed surface:

The root loop materialized roots in identifier order and stopped at the world budget without recording a frontier. With two roots and `maxWorlds: 1`, one root existed, no frontier remained, and the materialization, inspection, and finite-realization certificate all reported an exhaustive whole universe. Renaming a root changed which one survived. Separately, sibling atomicity held per parent only: under a tight budget, the first parent's children at a depth could be materialized while a cousin family was not, so coordinate order decided which cousins existed.

Boundary meaning:

A resource limit may stop realization, but it may not choose which part of the demanded slice exists, and an unresolved slice can never be the whole universe.

Current handling:

Roots are materialized all-or-nothing, and each withheld root becomes a `root-world-budget` frontier. Generation proceeds one lineage depth at a time: every admitted sibling family of a level is proposed before any is committed, and if the level does not fit, no member of it is materialized and every proposal becomes a `world-budget` frontier. `exhaustiveUniverse` now also requires a resolved, complete demanded slice, which corrects `finiteMaterializationIsWholeUniverse`. Regressions cover the root and cousin cases.

Next check:

Keep budget checks at the granularity of a complete demanded level whenever generation order is not itself a semantic order.

### B-050: An inherited replacement graph exposed protected and missing transport endpoints

Observed surface:

Each constructor was validated against the base child schema plus only its own `replaceGraph`. At runtime, a same-schema child inherits whatever revision its parent realized, including a graph produced by a different constructor. A constructor whose own endpoints were valid could therefore transport into a field that another constructor's replacement graph had protected and given the `identity-state` role, with zero diagnostics and a resolved run. If that replacement graph lacked the transport source, validation still passed and the run contradicted only after four worlds existed. In endogenous programs, `protectedFieldIds` is enforced statically for transports and is not consulted by the causal kernel's internal laws, so the missed static check was the only guard.

Boundary meaning:

The schema-graph closure claim ("before any sibling exists") must hold for every revision a world can actually carry, not only for the revision its own constructor writes.

Current handling:

Validation derives, for each schema, its base graph plus every replacement graph any constructor produces for it. Every constructor's ports, admission, relation-identity bindings, transports (existence, kind, sea-role, world-condition role, protection), sea actions, and law morphisms are closed against every realizable parent and child revision. A runtime guard additionally refuses a transport into a protected or non-condition field of the realized child revision. A regression covers both the protected-target and missing-source variants and shows that no world is created.

Next check:

Any new way to derive a revision, such as intensional graph generation, must extend the realizable-revision set before it can be validated.

### B-049: Source-level graph-replacement evidence was described as proof of executable change

Observed surface:

The v0.5.8 architecture record said the source test "separately proves complete graph replacement plus recursive family-coordinate syntax". The test's replacement graph is identical to the base schema, its recursive `countdown` family is never queried, and the test checks lowered keys and counts without running the program. At runtime, its only changed component is the law morphism.

Boundary meaning:

Lowering and validating a syntax form is evidence that the syntax is accepted with the right typed shape, not evidence that its executable consequence happens.

Current handling:

The architecture record now states that the source test is parse-and-validate evidence and that executable whole-graph change is evidenced by the JSON-level whole-schema fixture. Source-level executable evidence is recorded as open.

Next check:

Add a source fixture whose replacement graph actually differs from its base and whose recursive family is evaluated, then run it through the ordinary evidence cycle.

## 2026-07-17

### B-048: JSON-only generation crossed away from Bubble's own language

Observed surface:

The connected-universe kernel could execute complete endogenous generation, but its canonical program was available only as TypeScript types and JSON. Reusing the flat causal profile would omit intensional family algebra and complete graph morphisms, while embedding arbitrary JSON or code text in `.bubble` would make the extension cosmetic. During source testing, the shared intensional validator also accepted a family declared `rational` whose body yielded `boolean`.

Boundary meaning:

An authoring language and its typed execution graph must be two projections of one semantic object. Source must neither lose connected-universe structure nor gain a host-code escape hatch. Type validity must belong to the shared formal kernel so JSON and source cannot disagree about executable truth.

Current handling:

The strict `endogenous bubble` compiler covers typed family axes, parameters, exact algebra and guarded recursion; total queries; complete schemas and replacement graphs; roots; constructors; relation identity; exact transport and sea actions; graph/law/effect morphisms; and mandatory causal-partial order without a universal clock. It lowers to the existing `EndogenousUniverseProgram`, invokes the ordinary validators, and is structurally identical to the retained canonical JSON. The shared intensional validator now checks family-coordinate arguments, unary/binary operators, conditionals, and declared result kinds. The existing CLI evidence cycle starts from `.bubble`; complete graph replacement, replay, missing graph structure, host-time, and type shortcuts are tested.

Next check:

Do not confuse authored finite graph declarations with intensional generation of new graph or family definitions. The next language widening must come from that semantic need or another concrete representation failure, preserve earlier revisions, and still reject executable host callbacks and hidden selection.

### B-047: A revised schema label crossed over a base-schema world

Observed surface:

The first inherited revision stored and compiled transformed internal laws, but fields, protection, ports, sea channels, self-identity, emergence, and causal projection still came from the static base schema. Simply adding independent mutation arrays would allow a field to disappear after its law, identity binding, sea endpoint, emergence witness, or anchor port had already been accepted. Transforming after instantiation would create a base-schema child and attach different revision metadata to it.

Boundary meaning:

A world-local schema is one dependency graph, not a bag of independently optional categories. Its revision must exist before the world it defines, every consumer must share that revision, and a recursive constructor must remain valid when its target graph becomes the next parent graph.

Current handling:

`replaceGraph` supplies the complete typed field/protection/port/sea/identity/law/emergence/projection graph. It is normalized and content-addressed before child initializers run. Static closure rejects missing protected fields, sea endpoints, predicate bindings, law targets, commits, emergence witnesses, projection channels/objectives, and recursive endpoint dependencies. Runtime generation checks realized ports, relation fields, and sea channels; self-anchors, sea refresh, causal compilation, recurrence, inspection, and replay use the revision. Transformation events bind source/target graph digests and changed components. One focused recursive fixture changes all eight components together and compiles/executes the resulting worlds; malformed cross-references contradict before generation.

Next check:

Do not call a finitely declared total target graph self-generation. The remaining boundary is intensional derivation of new graph or family definitions, constructor/schema-incidence transformation, and source lowering, each with preserved prior revisions and no executable host callback.

### B-046: One-shot law addition crossed into a recursively inherited revision

Observed surface:

After effect-value inheritance worked, the obvious structural extension was a list of `add`, `replace`, and `remove` operations. In a recursive constructor, however, the first child would add a law and its child would inherit that law, causing the same `add` to collide. A strict removal would likewise become invalid after its first success. Host application order or depth-specific exceptions would decide semantic structure.

Boundary meaning:

A recursive constructor needs an endomorphism on the space of valid revisions, not a one-use migration script. Law membership, full guard/effect definition, reversibility, and prior revision history must remain coherent under repeated application.

Current handling:

One typed morphism uses idempotent base-law removal plus complete-law upsert. Upsert adds when absent and replaces when inherited. The canonical first generation removes `condense` and adds `lineage-condense`; the next recursive generation removes nothing and replaces the inherited `lineage-condense`, then applies its lineage-relative exact effect specialization. Static validation rejects empty morphisms, unknown or duplicate removals, duplicate or removal-overlapping upserts, duplicate field effects, wrong exact kinds or operations, broken inverses, and invalid commits. Each event records actual add/replace/remove classifications and source/target law sets; replay binds them exactly.

Next check:

Do not generalize one-shot mutation syntax. The next structural morphism must be closed under recursive inheritance and must explain how fields, ports, identity, seas, emergence, constructors, or formal family definitions preserve worldhood. Executable implementation generation remains a later successor-Bubble problem.

### B-045: Generated state crossed into static host-reloaded law identity

Observed surface:

The endogenous constructor generated lineage, fields, anchors, sea actions, and receiving-world continuation, but compilation still read `schema.internalLaws` from the static program. A descendant could therefore look internally generated while its actual law definition remained silently fixed by the host. The apparent remedy—accept arbitrary code or mutable schema callbacks—would merely move the host shortcut into an untyped self-modification channel.

Boundary meaning:

Generating a world instance, inheriting a semantic revision, transforming a typed law operand, inventing a new law, and generating executable implementation code are different claims. Law change also belongs to recurrence identity: equal fields do not establish the same universe if the active law revision differs.

Current handling:

Every world now carries a content-addressed schema revision consumed by the causal compiler. Same-schema descendants inherit the parent's realized revision, and a constructor may derive exact replacements for unique irreversible-law effect operands through total typed intensional queries. Each transformation has source and target revisions, exact query/value/proof provenance, constructor and child causes, relation references, inspection, replay, and `hostSelection: false`. Wrong-kind, missing, duplicate, reversible, and out-of-range targets are rejected statically. An unresolved sibling transformation commits no world or revision and records the whole sibling frontier. Recurrence structure digests include the complete revision.

Next check:

Design a necessity-derived contract for changing guards or complete law/schema topology without host callbacks, hidden code strings, broken inverse semantics, or erased prior revisions. Keep successor-Bubble code construction under Q-022 and do not call this bounded effect-value morphism general self-creation.

### B-044: Equal recurrence cuts crossed over a broken identity interval

Observed surface:

The causal-generation runtime could see identical complete input and output digests after realized events. Declaring persistence from those two cuts alone would allow a law to mutate an anchor-identity dependency and another law to restore it before the output digest, making a temporarily broken world appear continuously identical. A growing replay log could also be mislabeled as growing internal world history.

Boundary meaning:

Configuration recurrence, identity continuity, replay evidence, and committed history are different claims. Endpoint equality does not erase a causally meaningful identity break inside the interval, and host-preserved evidence does not create an internal arrow of time.

Current handling:

Generated recurrence now checks stable lineage/world structure, exact anchor and generation-event sets, true identity predicates at both cuts, and the complete cycle's mutated field keys against every identity dependency. Any overlap prevents certification even if the field is restored. Identity proof exhaustion stays `undetermined`. The recurrence ledger separately counts causal evidence and explicit history commits; `worldHistoryExtended` is false and `fullAnchoredStateRepeated` true when only replay evidence grows.

Next check:

Extend only from a concrete topology-changing, quotient, non-periodic, or recurrent cross-membrane case. Do not relax exact recurrence into field-projection equality or call generated-universe identity a proof of component self-maintenance.

### B-043: Finite determinacy crossed into host-selected observation collapse

Observed surface:

The statement that observing an infinite Bubble exposes a deterministic finite space could be implemented as a host function that chooses one continuation and reports it as the observed world. The same language could also let a closed finite slice claim that the infinite universe had ended, or let repeated execution claim universal convergence from a growing log.

Boundary meaning:

Finite demand, external observation, branch collapse, and complete denotation are different relations. Determinism concerns reproducibility and completeness of the finite semantic answer; it does not require singularity. Evidence may grow monotonically while world fields recur or reverse.

Current handling:

The Phase 1 runtime emits a finite internal realization certificate whose result is one closed run, the complete closed branch family, an open boundary, or contradiction. It marks `selectsBranch: false`, preserves intensional infinity and every remaining frontier, and carries a digest-linked self-complementation evidence chain. It explicitly disclaims world-state monotonicity, guaranteed convergence, whole-universe completion, and any external observer requirement.

Next check:

Integrate persistent recurrent causal-generation identity and committed anchor history, then keep later Phase 2 observation/collapse evidence separate from this internal demand certificate.

### B-042: Malformed query structure crossed into a lawfully closed constructor

Observed surface:

Endogenous query templates were evaluated by the exact intensional kernel, but their axes, combined direct/bound parameter signature, source kinds, reachable seeds, and parent availability were not all checked before materialization. A malformed template could therefore return contradicted at runtime and resemble a genuinely false admission.

Boundary meaning:

Program ill-formedness crossed into world-law negation. A world that lawfully remains dormant is not equivalent to a host document whose query cannot denote the declared family coordinate.

Current handling:

Static validation now requires exact family-axis and parameter sets, exactly-once direct or field-bound supply, exact value-kind agreement, valid literal coordinates, reachable seed values, and necessary compatible parent snapshots. The contract covers initializers, identities, law guards, emergence criteria, admissions, and relation identities. Invalid templates contradict the program before any world exists; valid bounded proof exhaustion remains `undetermined`.

Next check:

Preserve the same total typed contract when connected-universe syntax lowering and generated law/schema definitions are introduced.

### B-041: A finite branch budget crossed into host-selected universe survival

Observed surface:

Once causal continuations began feeding constructor reevaluation, iterating them until a branch budget filled would have made traversal order decide which generated universes continued. Refusing all plurality avoided the false selection but also prevented the universe from following its own internally derived branch structure.

Boundary meaning:

Resource-bounded traversal crossed into ontology. A bound may expose an open complete family, but it cannot convert a prefix chosen by host order into the worlds that exist.

Current handling:

Every causal continuation now derives a deterministic branch lineage with `hostSelection: false`, and each branch recursively carries its own materialization, anchors, seas, causal witnesses, and closure state. Before continuing a plural frontier, the runtime checks the cardinality of the complete prospective family together with already terminal branches. If it exceeds `maxGenerationBranches`, no member is continued; every continuation remains recorded as an open outcome on the common input. Equal projected configurations remain distinct histories unless a later identity proof permits convergence.

Next check:

Define branch equivalence, lawful convergence, and persistent recurrent branch identity without using field equality or digest equality as a substitute for anchor-history proof.

### B-040: Topology stability crossed into causal-generation configuration closure

Observed surface:

The first successive-closure implementation declared a demanded fixpoint as soon as post-law constructor reevaluation generated no new world. In the canonical run, topology was already stable after the first causal closure, but protected structure and condition fields had changed from their input configuration. A law enabled again in a later realization could therefore continue changing the universe even though the world count stayed constant.

Boundary meaning:

No-new-world topology crossed into full world closure. Generation stability, causal-state stability, recurrent configuration, and monotone anchor history are distinct claims.

Current handling:

Every causal-generation closure records exact input and output configuration digests over worlds, anchors, generation events, and frontiers plus its realized-event count. A fixpoint requires no new generation event, identical input/output configuration, and no realized causal event. The canonical world therefore uses a second closure to prove stability; a delayed constructor path uses a third after its child responds. A two-event condition down/up fixture returns to the same fields but is classified as uncertified recurrence rather than a fixpoint. Budget exhaustion remains `undetermined`. A nontrivial repeated digest is recorded as recurrent configuration and withheld from persistence until identity and anchor-history certification exist.

Next check:

Integrate recurrent causal-generation configurations with the persistence evidence layer without equating configuration recurrence with full anchored-world recurrence or replay identity.

### B-039: Multiple crossings crossed into an accidental sequential transport order

Observed surface:

The bounded `v0.5.7` runtime applied its sole anchor transfer by mutating the current realization. Removing only the validator's one-transfer limit would make several same-frontier laws execute transfers in sorted host order. A later transfer could then read a field written by an earlier transfer, shared sea-field causes would be overwritten, and a serialized implementation detail could masquerade as world causality.

Boundary meaning:

Cardinality crossed into composition without a law. Several individually valid relations do not automatically form one valid simultaneous relation, and a deterministic loop is not a causal proof of commutativity.

Current handling:

Multiple crossings are admitted only when target fields are unique, no target is another crossing's source in the same frontier, and no other crossing writes a field used by an anchor's identity assessment. All payloads are staged from the pre-frontier state, the state commit is atomic, sea changes are exact additions, shared field causes retain every transfer event, and all transfer events occupy one evaluation frontier without causal edges among them. Chained transfer receives `CKW104` and must wait for another causal frontier.

Next check:

Extend composition only from an explicit dependency graph and combined identity proof when transformations, conservation constraints, post-generation recurrence, or non-additive sea operators are introduced.

### B-038: A bounded scalar sea proxy crossed into universal world ontology

Observed surface:

The actor-neutral causal kernel still requires every world to declare one rational `viabilityFieldId`. Runtime sea coupling adds weighted positive- and negative-sea values into that coordinate, and later persistence interpretation treats it as a distinguished layer.

Boundary meaning:

One executable benchmark coordinate crossed into the definition of every causal Bubble. The observer-free `v0.4.7` model derives exterior forcing, structural support, and identity control as distinct mathematical roles; it does not require their effects to collapse into one scalar named viability.

Current handling:

Keep the field for compatibility while classifying it as bounded proxy debt in the necessity-first architecture record. Do not copy it as a required coordinate of the `v0.5.8` generator. Removing or renaming it before a general structural sea relation exists would hide rather than solve the boundary.

Next check:

Define a typed sea action/support contract whose scalar viability is at most an optional derived functional, then prove that existing exact fixtures embed into that more general structure without becoming the ontology.

### B-037: A release commit label crossed away from manifest and record identity

Observed surface:

HEAD commit `bd89f40` is named `v0.5.7`, while `package.json`, `package-lock.json`, the obligation ledger, project-memory release text, and record tests still identify `0.5.6` plus an unversioned membrane candidate.

Boundary meaning:

Git history and executable artifact identity disagree about which release exists. Beginning `v0.5.8` from only the commit subject would silently skip manifest and record reconciliation; trusting only the manifest would erase the author's apparent release selection.

Current handling:

The author-selected commit remains unchanged. D-121 reconciles manifest, lock, obligation ledger, project memory, release tests, references, and architecture status to bounded `v0.5.7` before any `v0.5.8` implementation claim. The semantic release boundary remains the one exact membrane relation; metadata repair does not widen it.

Next check:

Require future release selection, package identity, durable memory, and Git commit or tag to agree before the next version begins.

### B-036: Human-scale projection modules crossed into the public core surface

Observed surface:

`src/bubbles/world-kernel/index.ts` exported narrative protagonist/story types and teleonomic/affordance evidence beside intensional, causal, and persistent semantics. Historical CLIs and tests consumed those names from the undifferentiated top-level path.

Boundary meaning:

Compatibility experiments appeared to be peer Bubble ontology even though the causal and persistent core did not depend on them. Public import convenience contradicted the author's distinction between necessary world structure and later human interpretation.

Current handling:

The top-level surface now exports only the observer-independent core directly and exposes preserved human-scale experiments through an explicit `interpretive` namespace. Historical direct module paths, execution, records, and replay remain intact. A regression rejects any core import from narrative or teleonomic modules.

Next check:

Apply the same dependency rule to every `v0.5.8` generator module and reject any acceptance criterion that requires a human-scale projected label.

### B-035: Cross-world connection crossed into a host router or protected-state shortcut

Observed surface:

Once a two-world anchor had explicit ports, the easiest implementation shapes were to let the host copy arbitrary fields, let World Will deliver the value, or let a transfer write the receiver's protected structure directly. A first general transport array would also imply that simultaneous crossings already had defined composition and commutativity.

Boundary meaning:

Connection crossed the world-autonomy and anchor/sea membrane. An anchor is not a message broker, sea changes are not decorative annotations, and receiving a condition is not the same event as the receiving world reorganizing itself.

Current handling:

Bounded `v0.5.7` admits one exact transfer definition caused by an irreversible source-world internal law. It verifies typed ports, active endpoints, an uncut anchor, equal exact value kinds, and identity before and after a cloned atomic transition. It writes only an unprotected receiving `world-condition`, records source negative-sea residue and target positive-sea placement, and leaves all protected response to a later receiving-world law. The source snapshot, target, and sea-accounting fields reject competing local writers so host application order cannot select the payload. Mixed local/lifecycle/commit effects, multiple transfer definitions, protected targets, foreign guards, and failed identity are rejected. Cut and latent endpoints block; internal birth can activate an endpoint and becomes a transfer cause.

Next check:

Do not widen the one-relation restriction from convenience. First produce a concrete organic requirement for two interacting transfers and prove whether their endpoints, sea effects, identity predicates, branch alternatives, and lifecycle transitions commute, conflict, or require a new causal frontier. Preserve blocked and underdetermined outcomes without host selection.

### B-034: Parseable reversibility crossed into an unauthorable inverse contract

Observed surface:

The strict `causal bubble` profile accepted the `reversible` law marker but exposed no source form for inverse effects. Every reversible law could therefore be parsed while necessarily failing the shared causal validator, creating a language surface that could be named but never honestly executed.

Boundary meaning:

Syntactic availability crossed the executable-semantics membrane. The same audit also found that symbol and boolean order comparisons could reach runtime even though their order has no declared Bubble meaning.

Current handling:

`law-inverse` now authors exact opposite additive effects for reversible laws, and the existing causal validator checks the complete reciprocal contract. The compiler rejects ordered comparison over symbols or booleans and permits only equality or inequality for those values. Focused positive and negative regressions cover both boundaries.

Next check:

Require every future causal-language form to have one complete lowering and validation path before documenting it as executable. Do not infer an ordering on a value domain unless that order is explicitly part of the semantic graph.

### B-033: Descriptive spawn and collapse crossed into executable lifecycle

Observed surface:

The earlier `.bubble` IR already contained `spawn` and `collapse` effect roles, while the newer causal kernel had real birth and retirement events. Reusing the old words as if they already had the new runtime contract would fabricate causal history from capability metadata and would also confuse observation collapse with world retirement.

Boundary meaning:

Similar vocabulary crossed a semantic-version membrane. A declared possibility, an observation-induced local materialization, a branch-nonrealized event, a causal birth, and a retirement residue are different objects even when prose uses `spawn` or `collapse` for several of them.

Current handling:

The old profiles remain unchanged. A separate strict `causal bubble` profile explicitly declares worlds, exact fields, sea coupling, anchors, objectives, local laws, lifecycle effects, and commits, then lowers into the existing causal program validator and runtime. No legacy effect role is promoted into executed history.

Next check:

Extend the causal language only through typed cross-world anchor/sea transfer and the portable semantic graph. Do not merge the two language surfaces until a compatibility proof can preserve every older meaning.

### B-032: A second active world exposed an unanchored guard channel

Observed surface:

State-bound predicate bindings were originally generic enough that an internal law could name a field in another world. With only one canonical causal world this did not execute a hidden transfer, but causal birth makes the shortcut immediately usable.

Boundary meaning:

Convenient predicate reuse crossed the anchor membrane. Information could move between active worlds without an anchor identity, transfer kind, or causal provenance.

Current handling:

Internal-law guards may bind only fields in their own world. Cross-world guard bindings are rejected until a typed anchor-transfer contract exists. World-Will global constraints remain separate from internal local law.

Next check:

Design cross-world transfer only together with anchor identity, source and target ports, transferred value or relation, sea interaction, and replay evidence.

### B-031: A retired world crossed back into latent initialization during persistent continuation

Observed surface:

The persistence coalgebra previously resumed only exact field coordinates. If lifecycle were added only to one causal run, the next closure would reconstruct a declared latent world from its initial definition and could execute its birth again.

Boundary meaning:

Configuration recurrence crossed into identity erasure. Equal field coordinates do not imply equal world existence: latent, active, and retired phases carry different causal histories.

Current handling:

Persistent closure forwards typed lifecycle state and provenance beside field overrides. Configuration digests include lifecycle, retired sources cannot run laws, and a retired spawn target is not latent and cannot be born again.

Next check:

Require persistent stored replay and tamper regressions to preserve lifecycle phase, lineage, and residue across every selected path.

### B-030: Latent initialized coordinates crossed into active-world behavior

Observed surface:

A latent world still needs intensional field definitions so that its eventual birth is exact. Treating those initialized potential coordinates like ordinary active state would let its laws, objectives, constraints, anchors, and sea traces act before the birth event.

Boundary meaning:

Representability crossed into existence. A finite definition of a possible world was being mistaken for a realized world.

Current handling:

Lifecycle phase gates internal laws, predicate applicability, World-Will objectives and interventions, and anchor activity. Initial latent sea values are computed without active coupling trace; causal birth activates the world, emits the coupling trace, and becomes the direct cause of the child's fields.

Next check:

Test newly activated and retired anchors in the canonical world, and keep observation-materialized regions separate from causal-world birth.

### B-029: A plural run surface crossed into duplicate single-world evidence

Observed surface:

The first passing v0.5.5 run schema emitted both `autonomousContinuation` and an `autonomousContinuations` array even when only one autonomous world existed. Nested persistence and teleonomic records then repeated the same complete trace many times and expanded generated evidence by tens of thousands of lines.

Boundary meaning:

API generality crossed into repository-memory duplication. The data remained correct but made the durable evidence harder to inspect, review, and preserve.

Current handling:

Single-world runs retain the compatible singular continuation and baseline score. Plural arrays and branch lineage appear only when real plurality exists. The complete repository was regenerated and reverified after this compaction.

Next check:

Require future plural schemas to add information proportional to actual multiplicity rather than copying complete singular evidence into parallel compatibility fields.

### B-028: A favorable internal outcome crossed into World-Will selection

Observed surface:

After one intervention creates several endogenous internal branches, the ordinary candidate structure makes it tempting to score each result as if it were an independently selectable continuation.

Boundary meaning:

Objective optimization crossed into branch collapse. World Will would become a hidden selector able to erase unfavorable lawful outcomes that the world's own law generated.

Current handling:

One intervention combination is one set-valued candidate. Every outcome must preserve anchor identity and hard constraints. Its decision value is the minimum exact net improvement across all outcomes, and selecting the group preserves every outcome.

Next check:

If later preferences, agents, or relations can lawfully select among internal alternatives, keep their causal selection evidence separate from World-Will robust optimization.

### B-027: The presence of any set effect crossed into non-commutativity

Observed surface:

The original conflict predicate classified every pair of same-field effects containing `set` as non-commuting, including two identical projections and additive zero.

Boundary meaning:

A conservative implementation shortcut crossed into the mathematical semantics and could fabricate branch plurality where execution order changes nothing.

Current handling:

Identical set projections and zero additive effects commute. Unequal sets, or a meaningful additive operation combined with a set on the same field, remain order-dependent. A regression requires identical projections to share one frontier with no branch lineage.

Next check:

Extend commutativity only from exact operator semantics; do not infer it from syntax names alone when richer field operations arrive.

### B-026: A rejected simultaneous law crossed back into the same branch later

Observed surface:

A first branching sketch applied one maximal commuting subset but left conflicting enabled alternatives merely unapplied. An always-true excluded law could then execute on the next frontier, making branches converge by sequentially realizing mutually exclusive alternatives.

Boundary meaning:

Potential law membership crossed into actual history. The branch record would claim one actualization while execution later smuggled the rejected alternative into the same world.

Current handling:

Each branch records `nonrealizedLawIds` for the enabled alternatives outside its maximal frontier. Those laws remain in the program for provenance and other branches but are resolved as nonrealized for the current realization.

Next check:

Reuse the distinction between retained law, nonrealized event, and removed program element for future choice, collapse, and counterfactual semantics.

### B-025: Syntactic memory binding crossed into semantic dependence

Observed surface:

A response guard could include a memory field through a tautology and still be described as boundary-and-memory-dependent.

Boundary meaning:

Field-role presence crossed into causal necessity. Another closure could carry the repository's general memory evidence while one alleged affordance ignored memory entirely.

Current handling:

Every factual response now receives its own same-program memory-erasure counterfactual. All bound memory fields are reset to their pre-formation values with World Will disabled and every anchor cut. The response must disappear on every selected continuation; decorative memory keeps persistence but makes the teleonomic assessment fail.

Next check:

Use the same per-occurrence semantic-dependence rule when relations, preferences, learning state, or narrative memory become affordance prerequisites.

### B-024: An unrepresentable plural future crossed into a forced current fixture

Observed surface:

The candidate appeared to require a real plural autonomous-path example even though the current causal kernel has no endogenous branching transition: plural selected continuations come only from World-Will intervention ties.

Boundary meaning:

A future semantic capability crossed backward into the current release and tempted the implementation to add an ad hoc branch menu merely to satisfy a test.

Current handling:

The runtime keeps universal path-indexed autonomy evidence, while a direct regression proves that disabling World Will removes its plural intervention continuations and leaves one autonomous closure. Non-commuting internal laws remain `underdetermined`. Endogenous branching stays an explicit later obligation.

Next check:

When branch/spawn/collapse becomes executable, reuse the existing universal path contract and add real plural autonomous worlds without changing the meaning of `v0.5.4`.

## 2026-07-15

### B-023: One autonomous path crossed into path-universal autonomy

Observed surface:

The World-Will-disabled, all-anchors-cut re-execution searched for any persistent path whose component kernel matched the factual kernel.

Boundary meaning:

Existence of one matching continuation crossed into autonomy over the complete lawful future. In a plural run, the host could silently ignore a path where the component disappears or changes its invariant set.

Current handling:

Autonomy now records every disabled-and-cut path with its status, component-persistence verdict, and kernel-preservation verdict. Certification requires the same component and kernel on every path; empty or mixed evidence fails.

Next check:

Keep every future autonomy, agency, relation, and narrative counterfactual path-indexed and universally quantified unless the world itself supplies a lawful internal selection mechanism.

### B-022: One passing release slice crossed into version completion

Observed surface:

The first period-two teleonomic fixture, focused tests, generated records, and a full green repository run were immediately described as a completed `v0.5.4` release.

Boundary meaning:

Implementation success crossed into release closure. A version boundary is a durable philosophical and semantic claim, not a counter increment after one happy-path slice.

Current handling:

`0.5.4` remains the working package version, but every completion claim is withdrawn. Its status is an active hardening candidate, and the new tests are evidence inside that candidate rather than permission to advance.

Next check:

Require repeated adversarial generalization, record consistency, and an explicit closure judgment before calling any future `v0.5.x` complete.

### B-021: Alternating phase crossed into organic causal differentiation

Observed surface:

Two restoration laws could receive different phase values from a separate law that merely scheduled the next route. The resulting cycle remained persistent and each restoration remained necessary, yet the phase change was not caused by the restoration response itself.

Boundary meaning:

A correlated internal label crossed into organic recurrence. Removing a host selector is insufficient when a hidden scheduler inside the program still supplies the differentiation.

Current handling:

Discriminator value sets must be nonempty and pairwise disjoint across affordances. Each response value must be produced downstream of its structural disturbance, and each next-cycle input must be written by an event causally downstream of the preceding response. The detached-scheduler regression remains persistent but is `non-teleonomic`.

Next check:

Apply the same causal-provenance demand to future relations, preferences, learning, and simultaneous-alternative structures.

### B-020: Law deletion crossed into same-world response nonrealization

Observed surface:

Deleting a response law from the program made its transition disappear and was reported as action ablation.

Boundary meaning:

A different law system crossed into a counterfactual about one event in the same world. The result could show dependence on program structure without showing necessity of the factual response occurrence.

Current handling:

The causal runtime now retains the exact program and law definition, evaluates the same guard, records a typed `internal-event-nonrealization` witness, and suppresses only that event's effects. Teleonomic necessity requires equal program digests and witnessed suppression in every selected continuation. Factual persistence refuses to begin from this diagnostic mode.

Next check:

Do not call a counterfactual same-world evidence unless the retained laws, state reconstruction, suppressed event, and quantifier are all explicit.

### B-019: World-Will-supported persistence crossed into autonomous capacity

Observed surface:

A response repertoire can appear internally effective while an enabled World-Will intervention or anchor route supplies the condition that keeps its recurrent kernel intact.

Boundary meaning:

External governing support crossed into the structure's own capacity. Disabling intervention only on the factual trace is insufficient if the complete recurrent world cannot sustain the same invariant set after every anchor route is cut.

Current handling:

The teleonomic runtime re-executes the full persistent world with World Will disabled and every declared anchor cut. Certification requires a persistent path with the identical component-configuration kernel, in addition to factual response events carrying no intervention identifiers.

Next check:

Repeat this autonomy counterfactual for every future relation, agency, learning, and narrative-capacity claim.

### B-018: A finite invariant subset crossed into a maximal viability kernel

Observed surface:

The recurrent lasso supplies an exact finite set of component configurations, which makes the mathematical phrase `viability kernel` tempting even though the runtime does not search every admissible configuration or compute a greatest fixed point.

Boundary meaning:

A bounded certificate crossed into a global maximality theorem. This would hide both the finite proof frontier and lawful viable configurations outside the witnessed cycle.

Current handling:

Reports and architecture call the result a `bounded-invariant-viability-kernel` and define it explicitly as the invariant subset witnessed by the certified lasso. They deny greatest, maximal, and unbounded-history interpretations.

Next check:

Reserve maximal-kernel or greatest-fixed-point language for an implementation that actually quantifies the full declared state space and transition relation.

### B-017: Parallel response names crossed into organic affordances

Observed surface:

Two response laws can be listed in a program or report without showing that the world's own state makes each response occur. A host could then select between them and still advertise plurality.

Boundary meaning:

An authored option menu crossed into organic causal differentiation, repeating the rejected regime-selection architecture at a smaller scale.

Current handling:

Affordances are discovered only from response events actually present in one recurrent causal path. Distinct laws must have different exact values on at least one internal component-state field. The canonical phase guards generate each route in succession; there is no candidate list or selector, and both host-selection flags are false.

Next check:

Do not call simultaneous alternatives choice until the world supplies an internal discrimination or deliberation mechanism with its own counterfactual evidence.

### B-016: Passive recurrence crossed into an endogenous goal

Observed surface:

A stable or repairing loop can preserve itself indefinitely under the bounded executor while containing only one automatic response and no evidence that more than one internal possibility is structured by the recurrent state.

Boundary meaning:

Persistence crossed into goal-directed capacity. A name such as `goal` or `health` would not repair the missing causal evidence.

Current handling:

The teleonomic layer authors no goal surface. It derives the norm from exact recurrent component configurations and requires at least two internally differentiated response laws. A one-response version of the canonical world remains persistent but is explicitly `non-teleonomic`.

Next check:

Keep persistence, teleonomic capacity, deliberative agency, and life as separate promotion boundaries.

### B-015: One successful action ablation crossed into universal necessity

Observed surface:

Removing a response can produce several lawful counterfactual continuations. Accepting one continuation that leaves the invariant set would treat an existential failure as proof that the response was necessary.

Boundary meaning:

Branch aggregation crossed into universal causal necessity, the same quantifier error previously found in memory evidence.

Current handling:

Each selected same-program event-nonrealization continuation retains its own witness, component digest, and inside/outside verdict. A response occurrence is necessary only when every continuation leaves the factual kernel; mixed evidence remains unresolved.

Next check:

Preserve explicit universal quantification for future simultaneous action, relation, preference, and agency counterfactuals.

### B-014: Pairwise dependency projection crossed into a causal-membrane claim

Observed surface:

The first passing `v0.5.3` candidate expanded each conjunctive guard into independent field-to-effect edges and accepted any two-sided SCC cut containing a boundary-role field. That topology did not prove that boundary state mediated the crossing laws.

Boundary meaning:

An inspectable dependency projection crossed the membrane into causal sufficiency. A decorative boundary field could have certified a membrane while outside influence entered through an unrelated conjunct.

Current handling:

The runtime now retains exact guard/effect tuples in a field/law factor graph. Every incoming and outgoing crossing dependency must bind boundary state. The runtime then restores that state to its pre-formation value, suppresses unrelated recovery laws, and requires every crossing law's realization to change on every lawful counterfactual continuation. One regression rebinds the apparent boundary conjunct to identity; another keeps the binding but makes its predicate tautological. Both are rejected.

Next check:

Do not promote a projected graph cut to topology, individuality, or membrane transport without exact law-level mediation evidence.

### B-013: Change-and-return crossed into recurrent self-maintenance

Observed surface:

The first maintenance detector accepted a negative-sea-caused structural change followed by a return to the closure's final value, even when the alleged disturbance began away from the recurrent reference.

Boundary meaning:

Coincidental return crossed into repair. Without a reference configuration or authored health order, an arbitrary structural excursion could be named erosion and restoration.

Current handling:

The detector derives the exact reference from the certified configuration cycle. The disturbance must begin at that value, deviate from it, and the boundary-and-memory-dependent law must restore exactly that value. A synthetic pre-shift/change/return trace is rejected.

Next check:

Use `deviation` generically; reserve directional terms such as erosion or healing for worlds that supply a formal structural order or potential.

### B-012: Existential union crossed into plural counterfactual proof

Observed surface:

Memory-erasure differences from plural lawful continuations were unioned before classification. One changed branch could therefore certify causal memory even when another lawful branch was unchanged.

Boundary meaning:

Host aggregation silently selected an existential success while the documentation claimed evidence on every lawful continuation.

Current handling:

Every counterfactual continuation now carries separate difference evidence. All changed is `causally-effective`, none changed is `not-effective`, and a mixture is `mixed` and therefore `undetermined`. Outward influence likewise requires an external change on every continuation.

Next check:

Apply the same explicit quantifier discipline to future goal, affordance, event-nonrealization, and relationship evidence.

### B-011: Configuration recurrence crossed into full anchored-world recurrence

Observed surface:

The first passing lasso hashed causal field configurations only, yet its reason string called the result exact world-state recurrence. The canonical closure appended a new restoration commit on every loop.

Boundary meaning:

A quotient observation crossed into identity of the whole. Treating committed anchor history as if it repeated would erase the very history arrow the repository is required to preserve.

Current handling:

Closure certificates now distinguish causal-configuration digests from an append-only anchor-history ledger. The lasso records ledger counts at cycle start and recurrence and explicitly reports whether the full anchored state repeated. In the canonical case the configuration repeats and the full anchored state does not.

Next check:

Any future recurrence, reversibility, or same-world claim must state its projection and retain non-recurrent identity/history dimensions explicitly.

### B-010: Joint sea-and-damage effects confounded pressure with structural cause

Observed surface:

The first `v0.5.3` canonical fixture used one internal event to increase negative sea and reduce structural integrity simultaneously. It produced the intended final values and a repair cycle, but could not prove that the negative sea caused erosion rather than merely accompanying an unrelated damage effect.

Boundary meaning:

A correlated field change crossed the membrane into a causal claim. If retained, the runtime could have advertised sea-driven self-maintenance using a trace that did not contain a sea-to-structure causal edge.

Current handling:

The fixture now separates negative-sea admission, sea-dependent erosion, sea release, and boundary-and-memory-dependent restoration into distinct exact events. The persistence runtime accepts maintenance evidence only when a negative-sea increase causally precedes structural deviation from the recurrent reference and that deviation causally precedes exact internal restoration to the reference.

Next check:

Reject stronger sea, anchor, agency, or relationship claims whenever the evidence records only simultaneous correlation or a convenient final score rather than the required directed causal chain.

### B-009: Explanatory protagonist metaphor crossed into mandatory world ontology

Observed surface:

The completed `v0.5.1` seam required named protagonists and an authored story graph in every world kernel. The implementation was internally consistent and useful for an agent-bearing example, but it treated the author's explanatory analogy as the universal minimum of a Bubble and risked turning a universe project into a narrative schema.

Boundary meaning:

An example crossed the membrane between evidence and ontology. The correction cannot be deletion, because worlds must still be able to form persistent beings and stories naturally. It must move the universal boundary downward to causal state, law, seas, anchors, World Will, and history while retaining stronger structures as lawful possibilities.

Current handling:

`v0.5.1` remains immutable as a pushed bounded release. `v0.5.2` adds the actor-neutral `bubble-anchored-causal-world.v2`; internal guards generate events, generic predicates record emergence, protected fields block direct World-Will manufacture, and the narrative kernel is tested as a compatible special case.

Next check:

Reject both mandatory narrative labels and their blanket removal. Require executable persistence, boundary, memory, or counterfactual evidence before promoting an emergent structure to a stronger ontology such as agent, protagonist, relationship, or story.

### B-008: Independent semantic-regime selection violated the organic-world boundary

Observed surface:

An initial `v0.5.1` experiment modeled several mathematical or semantic regimes as parallel authored candidates and let runtime machinery select a staged winner. It compiled and passed tests but contradicted the author's requirement that the Bubble universe be one organically and necessarily coupled world.

Boundary meaning:

External implementation mathematics crossed into the world ontology as a menu. That confused how Bubble is implemented with what Bubble inhabitants and worlds choose, and it repeated the bounded `v0.5.0` candidate pattern at a level where protagonists, story, anchors, seas, and World Will should instead be causally integrated.

Current handling:

All code, examples, generated records, and documentation from that experiment were removed before `v0.5.1` development resumed. The replacement architecture keeps mathematical techniques host-side, records natural language as provenance only, and starts from one typed intensional kernel plus an anchored narrative-world contract.

Next check:

Reject any architecture that introduces unrelated regime menus, hidden host selection, or direct World-Will puppeteering where one coupled causal model is required.

### B-007: Phase-2 benchmark planning crossed the unfinished-world boundary

Observed surface:

The first proposed `v0.5` objective was a scored observer or Bubble-versus-host benchmark even though the user's priority was completion of the bubble universe itself and observer work was explicitly Phase 2.

Boundary meaning:

The planning layer imported an external evaluation concern across the Phase 1 world boundary. Had it been implemented, the repository could have optimized how an incomplete world is observed while leaving the world's own state transition, world-will agency, and time semantics unresolved.

Current handling:

The historical proposal remains visible in the `v0.4.9` closure plan with a supersession note. `v0.5` instead implements world self-realization, and the project memory now fixes bubble-universe completion before observer or agent work.

Next check:

Reject any `v0.5.x` proposal that makes an external observer, agent, scheduler, or comparison harness responsible for semantics that should belong to the bubble world itself.

### B-005: Canonical README encoding escaped the ordinary text-edit boundary

Observed surface:

The repository README had become UTF-16 while the surrounding TypeScript and Markdown toolchain expected ordinary UTF-8 text. Normal line-oriented patching and inspection therefore treated a canonical public document as binary or failed to match its content reliably.

Boundary meaning:

This was a language-bubble tooling boundary failure: the semantic content still existed, but its encoding prevented the repository's normal inspection and editing surfaces from preserving that content transparently.

Current handling:

The README was normalized back to UTF-8 during `v0.4.8`. Canonical source and documentation files should remain UTF-8, and an encoding anomaly must be logged rather than handled as an invisible editor inconvenience.

Next check:

Keep README and canonical Markdown readable by the same text-oriented verification and patch surfaces used for the rest of the repository.

### B-006: PowerShell command discovery selected a policy-blocked npm wrapper

Observed surface:

Running `npm run verify:records` or `npm run check` from PowerShell selected `npm.ps1`, which the local execution policy refused to load even though the installed Node and npm runtime were otherwise usable.

Boundary meaning:

The repository verification path crossed an operating-shell membrane whose wrapper policy was stricter than the underlying executable. Treating that failure as a test failure would confuse host tooling access with Bubble correctness.

Current handling:

Use `npm.cmd` for repository commands in this Windows PowerShell environment. The same record verification and TypeScript check passed through that executable.

Next check:

Keep user-facing Windows launch instructions explicit when a `.ps1` wrapper may be blocked, while preserving ordinary `npm` commands for shells where command discovery is not policy-constrained.

## 2026-05-15

### B-001: Unknown grammar base profile

- Surface: `grammar <Name> = "profile <Child> extends <Base>"`
- Failure mode: the grammar artifact names a base profile that is neither built into Bubble nor declared locally
- Why it matters: profile extension without a valid base dissolves staged grammar compatibility into an ungrounded name reference
- Current handling: compiler error `BBL220`

### B-002: Explicit activation target mismatches declared grammar profile

- Surface: `activate grammar <Name> as <ProfileName>`
- Failure mode: the activation requests one profile name while the grammar artifact declares another
- Why it matters: staged activation becomes semantically ambiguous unless the requested and declared profile identities agree
- Current handling: compiler error `BBL221`

### B-003: Duplicate declared grammar profile identity

- Surface: multiple `grammar` declarations lower to the same declared profile name
- Failure mode: local grammar selection becomes ambiguous even if artifact names remain distinct
- Why it matters: Bubble needs profile identity to be stable and replayable, not only artifact labels to be unique
- Current handling: compiler error `BBL222`

### B-004: Local grammar profile-extension cycle

- Surface: locally declared grammar profiles extend one another in a closed loop
- Failure mode: no well-founded profile ancestry exists inside the local grammar graph
- Why it matters: a governing language bubble cannot explain or activate profile lineage if its own local profile graph is cyclic
- Current handling: compiler error `BBL223`

## Next Surfaces To Probe

- reflective scope overreach beyond the intended staged membrane
- activation-graph drift once multi-step or cross-file activation exists
- provenance loss between quoted artifacts, materialized descendants, and replay records
- hidden runtime escape hatches where semantics leave the explicit Bubble IR contract
