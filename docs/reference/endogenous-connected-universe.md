# Endogenous Connected-Universe Reference

Recorded: 2026-07-17

Status: completed bounded `v0.5.8` surface; confirmed by author selection on 2026-11-16

This surface derives a finite demanded view of a potentially unbounded connected Bubble universe from typed schemas, root seeds, and recursive constructors. It is an observer-independent core API. Human-scale entities, stories, agents, and teleonomic labels are not part of the contract.

## Program

An `EndogenousUniverseProgram` has mode `bubble-endogenous-connected-universe-program.v1` and contains:

- one exact intensional family system;
- typed world schemas with fields, protected fields, ports, local laws, identity predicates, emergence criteria, and channel-valued positive/negative seas;
- root seeds;
- constructors with a finite or natural local coordinate domain, exact admission predicate, parent and child ports, relation identity, optional exact field transports, an optional typed schema-revision transformation, and material sea actions;
- causal partial order with `universalClock: false`.

A relation transport copies one parent snapshot field into one unprotected child `world-condition` field. Source and target exact value kinds must agree. Sea fields cannot masquerade as payload, protected child state cannot be written, and duplicate target transport is invalid.

Every query template is a total typed contract. Its axis names must exactly equal the referenced family domain, its direct sources plus field bindings must supply every declared parameter exactly once, exact kinds must agree, and a parent field may appear only where every realization has a compatible parent snapshot. Invalid templates are rejected before any world is materialized; they do not become false laws by accident.

## Strict Endogenous Bubble Source

`compileEndogenousBubbleSource` lowers an `endogenous bubble <Name> { ... }` document directly to the same `EndogenousUniverseProgram` accepted by materialization, execution, inspection, record, and replay. The compiler does not introduce a second runtime model. The canonical `.bubble` source and the retained JSON projection lower to structurally identical typed programs.

The source surface declares:

- exact intensional `family` definitions over finite, natural, or integer axes, typed parameters, optional well-founded natural recursion, and algebraic terms;
- reusable total `query` templates whose index and value sources may be literal, lineage-relative, root-relative, seed-relative, or parent-field-relative as allowed by the kernel;
- executable `schema` graphs and transformation-only complete `graph` values containing fields, protection, ports, sea channels, self-identity, internal laws, emergence criteria, and optional causal projection;
- roots and constructors with local coordinate domains, admission, parent/child ports, relation identity, exact transports, sea actions, and optional graph/law/effect morphisms;
- the explicit `order causal-partial universal-clock false` boundary.

Intensional terms use exact atoms and prefix algebra: `$name` is a parameter, `@axis` is an index, `(if condition then otherwise)` is typed conditional structure, arithmetic/comparison/logical operators are binary forms, and `(coordinate family (at axis term) (with parameter term) ...)` denotes another family coordinate. A recursion declaration names the natural measure axis; the ordinary intensional validator still proves strict descent.

Source is declarative semantic data, not an executable text escape hatch. It cannot contain a host callback, arbitrary TypeScript, a runtime selector, or a universal clock. Complete replacement graphs must spell out all eight components. Both source and JSON pass through the same graph, query, exact-kind, inverse, constructor, identity, sea, and projection validation. The shared intensional validator also rejects result-kind mismatches inside family bodies, coordinate arguments, operators, and conditionals before materialization.

## Inherited Executable Schema Revisions

Every generated world carries an `EndogenousGeneratedSchemaRevision` containing the exact executable world-local schema graph that it will use: fields and initializers, protected set, ports, sea channels, self-identity, internal laws, emergence criteria, and optional causal projection. Roots receive a deterministic base revision. A same-schema child inherits its parent's realized revision; a cross-schema child starts from the declared child schema's base revision.

`schemaTransformation.replaceGraph` supplies all eight components as one complete target graph. It is not a list of independent field/port/sea toggles. The graph is normalized, reference-checked, and content-addressed before child initialization. The child fields are then evaluated from the target initializers, and self-anchor creation, relation-port checks, sea actions, compilation, local-law execution, emergence, and the compatibility objective all read that same revision.

The validator requires the replacement to close every typed dependency: protected fields, sea endpoints, predicate bindings, law effects and commits, emergence witnesses, projected channels, and objective fields must exist with their required exact kinds. A recursive constructor must also retain every parent-side field, port, identity binding, transport source, and sea channel that its next application requires. Invalid graphs contradict before any sibling world is committed.

`schemaTransformation.removeLawIds` idempotently removes named base child laws. `upsertLaws` adds a complete internal-law template when absent and replaces it when inherited, so one recursive constructor can apply the same law-set morphism at every depth. Upserts validate their child-local Boolean guards, exact field effects, unique targets, operations, reversibility, inverse effects, and history commits before materialization. A reversible upsert must replace the complete forward/inverse contract.

After law-set change, `effectValues` may specialize one existing irreversible law effect value with the exact result of an `EndogenousQueryTemplate`. The target is `(lawId, effectIndex)`. Targets must be unique, present in the post-upsert set, in range, irreversible, and exact-kind compatible with the affected field. Forward-only specialization of a reversible law is rejected.

The current surface transforms the complete executable world-local graph but does not generate new graph definitions intensionally, transform constructors or schema incidence, or define new intensional families. It does not accept host callbacks or executable source strings.

Each successful transformation produces an `EndogenousSchemaTransformationEvent` binding parent world, constructor, source/target graph digests, complete-replacement flag, changed graph components, requested/effective removals, upserts, actual additions/replacements, source/target law sets, intensional query and proof digest, exact value, target revision, generated world, and `hostSelection: false`. Generated relation anchors and generation events reference it. The causal compiler consumes the complete `world.schemaRevision`, not the static schema table.

## Materialization

`materializeEndogenousUniverse(program, options)` returns a `bubble-endogenous-connected-universe-materialization.v1` value.

Options:

- `maxDepth`: maximum demanded lineage depth;
- `maxWorlds`: total materialized-world bound;
- `naturalCoordinateLimit`: demanded prefix of a natural constructor;
- `evaluationBudgetPerQuery`: exact formal work bound per query.

The result distinguishes `resolved`, `undetermined`, and `contradicted`. A resolved demanded slice may still have depth, natural-open, or exactly false `admission-closed` frontiers and therefore need not be an exhaustive universe. Generation proceeds one lineage depth at a time: if the world budget cannot preserve every admitted sibling family of a level, no member of that level is materialized and each proposal becomes a `world-budget` frontier. If the budget is below the root set, no root is materialized and each root becomes a `root-world-budget` frontier carrying `rootId` instead of a parent and constructor. If any sibling admission is unresolved, no partial sibling family is committed: the unresolved coordinate is an `admission-undetermined` frontier and every admitted sibling of that family is a `sibling-admission-pending` frontier. `coverage.exhaustiveUniverse` is true only for a resolved, complete demanded slice with no frontier.

Validation closes every constructor against every revision a world of its parent or child schema can carry: the base graph and every complete replacement graph any constructor produces for that schema. A transport into a field that any such revision protects, or that lacks the world-condition role, contradicts before materialization.

If one sibling's schema-revision query or target initializer is unresolved, no sibling world, generation event, anchor, or revision is committed. Every coordinate in that sibling family remains visible as a `schema-transformation-undetermined` frontier.

Generated identifiers are deterministic digests of root-relative constructor lineages. The full address, not traversal order, is semantic provenance.

## Relation Evidence

Every generated relation anchor records:

- exact endpoint world and port identities;
- exact relation identity predicates;
- every copied payload with source value and target before/after value;
- every positive/negative sea-channel action;
- `hostSelection: false`.

All siblings read the same parent snapshot. Their target writes are child-local and their sea actions combine by exact addition.

## Execution

`realizeEndogenousConnectedUniverse(program, options)` materializes the demanded slice and, when every schema supplies an explicit legacy causal projection, lowers every generated instance into the actor-neutral causal kernel.

Execution adds `maxGenerationClosures`, the maximum alternating causal-generation depth before a demanded fixpoint must be established, and `maxGenerationBranches`, the maximum complete family of active and terminal generated-universe branches. If the next whole branch family exceeds its bound, no partial subset is continued.

The projection supplies the old executor's scalar positive, negative, and viability coordinates. It is an adapter only. Removing it does not invalidate generated worldhood; it withholds causal-backend execution and reports `undetermined`.

Transport IDs become field-override causes. A receiving local-law guard that depends on the transported field therefore records a causal edge from the generated transport to that law event. Removing the transport leaves the world present while preventing any response that requires the carried condition.

After one unique causal continuation, `continueEndogenousUniverseFromState` overlays the realized exact schema fields onto the same lineage-addressed slice and reevaluates every still-unmaterialized constructor coordinate. Existing worlds and relation effects remain historical and are not regenerated. Newly admitted siblings form atomically and receive the next causal closure. The run is resolved when this alternating process reaches a demanded generation fixpoint.

Every closure records input and output configuration digests and realized-event count. Fixpoint requires no new generation event, an unchanged full configuration, and zero realized events, not only an unchanged world count. Returning to the same configuration through causal activity is recurrence, not a fixpoint. It becomes resolved only when an `EndogenousGeneratedRecurrenceCertificate` certifies the exact repeated finite configuration.

The recurrence certificate requires stable world IDs, schemas, lineage addresses, parents, generation provenance, complete anchor definitions, and generation-event definitions. Every anchor identity predicate must resolve true at both cycle cuts. No causal occurrence within the cycle may mutate a field on which any world or relation identity predicate depends, even if a later event restores that value. Identity proof exhaustion produces an `undetermined` certificate; failed identity or dependency mutation produces `not-certified` recurrence.

Stable world structure includes the complete realized schema revision. A repeated field configuration with a changed law revision is not the same recurrent causal-generation configuration.

`anchoredHistory` separates causal replay evidence from world history. Causal event occurrences always extend the evidence ledger. Only explicit causal history commits or generation events set `worldHistoryExtended: true`. Consequently a reversible or uncommitted active cycle may have `fullAnchoredStateRepeated: true` while its evidence ledger grows; a commit-bearing cycle has a monotone internal-history extension and `fullAnchoredStateRepeated: false`.

A certified branch has `closureKind: "persistent-recurrence"`; `generationClosure.persistentRecurrenceCertified` becomes true while `fixpointReached` remains false. This certifies identity-preserving recurrence of the generated finite universe cut. It does not by itself establish the stronger component-level boundary, memory, self-maintenance, and outward-influence assessment of `PersistentCausalRun`.

If the closure bound ends after new worlds form but before they execute, the run is `undetermined`. If a causal closure has multiple lawful continuations, every continuation becomes an `EndogenousGenerationBranchStep` with `hostSelection: false`. Each `branchUniverse` then carries its own materialization, causal lineage, closure IDs, local continuation evidence, anchors, and sea relations. Branches can recursively branch again and reach fixpoints at different closure depths. A branch resource limit is checked against the complete prospective family before any member continues, so it cannot select a prefix.

For a singular run, the sole branch marks `evidenceLocation: "top-level"` and references the run's materialization and continuation evidence instead of serializing identical copies. Plural branches use `"branch-local"` and store their divergent evidence independently. `representativeCausalClosureId` likewise references the singular branch's last closure rather than duplicating its full causal run.

## Finite Realization Certificate

Every `EndogenousConnectedUniverseRun` includes `finiteRealization` with mode `bubble-endogenous-finite-realization-certificate.v1`.

`infiniteDenotation` records whether natural coordinates or recursive constructor incidence make the supplied law potentially unbounded. `infinityRemainsIntensional` is always true: this runtime never substitutes a finite materialization for the whole denotation. `finiteMaterializationIsWholeUniverse` can be true only for a finite-by-current-constructor-graph program whose complete branch materializations have no frontier.

`finiteCut` content-digests the exact generation and closure demand. The result form is exactly one of:

- `single-closed-result`;
- `complete-closed-branch-family`;
- `open-boundary`;
- `contradiction`.

Evaluation is deterministic and `selectsBranch: false`. A complete plural family is one semantic result, not a host menu. This is an internal Phase 1 demand; `externalObserverRequired` is false.

`selfComplementation.steps` forms a predecessor-digest chain over every causal-generation closure. Each step records input frontier and dormant-admission counts, realized events, newly generated events, derived branches, fixed, persistent-recurrence, and open outcomes, and whether realized state reactivated dormant generation. The ledger is monotone as evidence. The certificate explicitly sets `worldStateMonotonicityClaim`, `convergenceGuaranteed`, and `wholeUniverseCompletionClaim` to false.

## Inspection And Replay

- `inspectEndogenousConnectedUniverseRun` exposes the common topology, schema-revision transformation events, complete generated-universe branch family, frontiers, relation transports, sea channels, world-local continuation evidence, generated-recurrence certificates, finite realization certificate, and causal inspection.
- `recordEndogenousConnectedUniverse` stores the exact program, demand, materialization, causal run, and stable digests.
- `replayEndogenousConnectedUniverse` rejects stored-content tampering and same-program drift.

CLI paths:

```text
npm run run:endogenous-example
npm run inspect:endogenous-example
npm run record:endogenous-example
npm run replay:endogenous-example
```

The canonical authoring source is `examples/endogenous-connected-universe.bubble`. `examples/endogenous-connected-universe.world.json` remains the structurally identical typed JSON projection and compatibility fixture.

## Current Boundary

Bounded `v0.5.8` lowers its complete connected-universe contract from strict `.bubble` source, but it does not intensionally generate new schema graphs or formal families; transform constructors or schema incidence; certify topology-changing or non-periodic generated persistence; prove lawful branch equivalence or convergence; prove general self-complementing convergence; prove a general anchor identity calculus; or implement a native backend. Its complete executable-schema morphism remains a typed semantic graph operation, not arbitrary code generation or self-rewriting. It makes no whole-universe, component-level self-maintenance, Phase 2 observer, successor-Bubble self-construction, or trans-Turing claim.
