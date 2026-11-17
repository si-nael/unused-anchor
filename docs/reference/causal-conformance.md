# Causal Conformance Reference (Gate D)

Recorded: 2026-11-16

Status: completed bounded `v0.5.9` Gate D surface; confirmed by author selection on 2026-11-16, and extended by bounded `v0.5.10` (sea medium fields and fixtures)

A backend may claim execution authority for the causal kernel only by reproducing the portable outcome of every fixture in the frozen corpus. This document defines the fixture format, the portable outcome, the evidence-id derivations a backend must reproduce, the host-cost profile, and the corpus discipline. It builds on [bubble-ir.md](bubble-ir.md).

## 1. Fixture document

A fixture is one BIR envelope.

| Section | Critical | Content |
| --- | --- | --- |
| `core.causal-program` | yes | the causal program (BIR v1 schema) |
| `core.causal-execution-options` | yes | execution options, part of the input meaning |
| `conformance.causal-outcome` | no | the expected portable outcome (normative assertion) |
| `conformance.host-cost` | no | the reference oracle's deterministic host-cost profile (informational) |
| `conformance.label` | no | fixture name and description |

A fixture's semantic identity is therefore its input. Every section payload is exactly one record node. The generated appendix [bir-schemas.md](bir-schemas.md) lists the complete schema of each one and is normative. The expected outcome has its own identity: the lowercase-hex SHA-256 of the concatenation of the 33 ASCII bytes `bubble-causal-outcome-identity.v1`, one `0x00` byte, and the outcome payload bytes, with no length prefix.

Execution options ([schema](bir-schemas.md#corecausal-execution-options)) are one record node with these fields:

- `worldWillEnabled`: a structural boolean (`01` false, `02` true), never an exact boolean;
- `cutAnchorIds`: a set of anchor ids;
- `fieldOverrides`: a map from field key `<worldId>.<fieldId>` to an exact value;
- `fieldOverrideCauses`: a map from field key to a set of cause ids;
- `worldLifecycleOverrides`: a map from world id to a lifecycle-state record `{ phase, lineageId?, parentWorldIds?, spawnedByEventId?, retiredByEventId? }`;
- `seaRegionOverrides` (sea medium, v0.5.10): a map from region id to a record `{ negative, positive }` of exact values;
- `seaRegionOverrideCauses` (sea medium, v0.5.10): a map from region-quantity key `<regionId>#<quantity>` to a set of cause ids;
- `counterfactualInternalEventAblationLawIds`: a set of law ids;
- `evaluationBudgetPerQuery`, `maxInterventionCombinations`, `maxInternalFrontiers`, `maxInternalBranches`: safe integers (integer node `03`).

Every field is optional, and an absent field means the oracle default. Presence is preserved exactly: an explicitly empty set or map is encoded (`06 00` or `08 00`) and differs from an absent field. Options with no field encode as the two bytes `07 00`, which is the options payload of every corpus fixture that runs with default options. The label is one record node `{ description, name }` of two required texts.

## 2. Conformance

A backend executes the lifted program with the lifted options, projects its result onto the portable outcome, and encodes it with the BIR v1 node encoding. Only fields the outcome schema declares are projected, so host-only fields a backend adds are ignored. It conforms on the fixture exactly when those bytes equal the `conformance.causal-outcome` payload. Comparison is bytewise, so every set member, exact value, and id must match, and nothing else is compared. `checkCausalConformance(bytes, executor)` performs this check for any executor and never throws: a malformed, tampered, or wrongly flagged fixture is `invalid-fixture`, an unknown critical section is `not-executable`, an executor that throws is `executor-failed`, and an executor whose output differs from, or cannot be projected onto, the expected outcome is `drift` with the first differing path.

## 3. Portable outcome (`bubble-causal-outcome.v1`)

The outcome records what the world did. Its exact schema, with every field name, node kind, set, sequence, or map classification, presence, and literal, is the normative generated appendix [bir-schemas.md](bir-schemas.md#conformancecausal-outcome). The list below is a guide to it:

- run `status`, the set of diagnostic codes, the initial world states, and the resource-boundary verdict (`exhaustiveInterventionSearch`, `exhaustiveInternalBranching`);
- autonomous continuations, all continuations, selected continuation ids, and unresolved alternative ids;
- World-Will decision evidence: intervention eligibility status, baseline scores, and each candidate's interventions, status, score, cost, improvement, and branch outcomes;
- for each autonomous continuation, the identity verdict of every declared anchor-identity predicate (`resolved` with its value, `undetermined`, `contradicted`, or `not-evaluated` when an endpoint world is inactive);
- for each continuation: selection, interventions, score, branch lineage, final world states (fields, intrinsic viability, sea contribution, lifecycle), realized events, the event ledger, history commits, lifecycle events, anchor-transfer events and assessment statuses, internal-event nonrealizations, emergence statuses with witnesses and causes, and the causal order (edges, synchronous evaluation frontiers, reversible and irreversible events, history-arrow sources);
- under a sea medium (v0.5.10): the run's `initialSeaMedium` (set of regions `{ id, negative, positive }`); per continuation `seaMedium` with its final `regions` (set) and `balance` (set keyed by `quantity`, with exact `initialTotal`, `finalTotal`, `production`, and boolean `balanced`), and `seaExchangeEvents` (set of `{ id, lawId, quantity, amount, from, to, causes }`, where `from` and `to` are `region { regionId, before, after }` or `world { worldId, fieldId, before, after }` and `causes` is a set); and a retirement residue's `seaRelease { regionId, negative, positive }`. Every position is optional and absent without a medium, so outcomes of programs without one are byte-identical to before. The constant `hostSelection: false` is not projected.

Exactly two outcome positions are sequences, because their order is meaning: a continuation's `branchLineage` (its branch steps, root first) and `order.evaluationFrontiers` (the synchronous frontiers in evaluation order, each frontier a set of event ids). Every other collection is a set or a map. `autonomousContinuations` and `continuations` share one continuation schema.

Only schema-declared fields are kept. A required collection is always present, even when empty: for example `diagnosticCodes`, `candidateAssessments`, and a continuation's `interventionIds` and `order.reversibleEventIds` encode as `06 00` when empty. An optional set or sequence that would be empty is omitted instead of encoded empty, for example `branchLineage`, `lifecycleEvents`, `anchorTransferEvents`, `baselineScores`, or `initialSeaMedium`. No other position is normalized, and the appendix marks every collection with its rule. A runtime contradiction that is not a validation failure, such as an unknown option target, has no diagnostic code; its outcome records the status alone.

A backend holds exact values in the JSON form used in section 4 (decimal strings for rationals), while their BIR nodes are the exact-value tags; an `integer-text` position is a decimal string in the host and an integer node in bytes. Sets may be held in any order; sequences (`branchLineage`, `order.evaluationFrontiers`) keep their order.

The ledger `kind` vocabulary is the oracle's trace kinds other than `sea-coupling`: `initial-field`, `internal-law`, `world-will-intervention`, `history-commit`, `world-spawn`, `world-retirement`, `anchor-transfer`, and `sea-medium`. A branch step is located at the evaluation frontier containing the events of its realized laws; a spawn is located at the frontier after the frontier containing its `causedByLawEventIds`.

The event ledger is every non-derived trace entry keyed by its stable suffix It is not a map. Each record carries its own key in its `key` field, which is the trace entry id with the oracle's sequential numbering prefix `trace:<n>:` removed (for example `law:condense`, `commit:law:condense`, `initial:world.field`, `medium:<lawId>`). Like any set, the ledger is ordered by the bytes of its members' encodings, not by key. Each record also carries its `kind`, its `worldId`, the optional `eventId`, `lawId`, `interventionId`, `anchorId`, `lifecycleEventId`, and `transferId` references, the `causes` set, and the `effects` set. A `sea-region` effect carries `regionId` and has the quantity as its `fieldId`.

The outcome deliberately omits how the oracle computed that world, because a conforming backend may compute it differently:

- intensional proof traces and evaluation subject ids;
- the single evaluation linearization (`evaluationOrder`); the synchronous frontier layering is kept;
- sequential trace numbering and derived sea-coupling trace entries, whose results appear in states and later effects;
- prose reasons and diagnostic paths;
- resource counters and the host program digest.

## 4. Evidence-id derivations

Some ids carry world identity and are part of the outcome. Each is the lowercase-hex SHA-256 of the UTF-8 bytes of the RFC 8785 JSON Canonicalization Scheme serialization of a fixed record, truncated as stated. `+ 16` and `+ 20` mean the first 16 or 20 lowercase hexadecimal characters of the digest (8 or 10 bytes), appended to the prefix. `full 64` means all 64 characters with no prefix. Exact values serialize as the JSON objects `{"kind":"rational","numerator":"…","denominator":"…"}`, `{"kind":"boolean","value":…}`, or `{"kind":"symbol","value":"…"}`, whose members RFC 8785 then orders by name like those of every object.

| Id | Record | Prefix and length |
| --- | --- | --- |
| branch step (`branchLineage[].id`) | `{ parent, frontierIndex, realizedLawIds }` | `branch:` + 16 |
| transfer frontier (`frontierId`) | `[{ lawId, transferId }, …]` | `transfer-frontier:` + 16 |
| world lineage (`lineageId`) | `{ targetWorldId, sourceWorldIds, causedByLawEventIds, parentLineages, branchLineage }` | `lineage:` + 20 |
| commit state (`stateDigest`) | the committing world's complete field map at commit time | full 64 |
| retirement residue (`finalStateDigest`) | `{ fields, intrinsicViability, seaContribution }` of the retiring world | full 64 |

A **closure frontier** below is one synchronous step of a realization's internal causal closure: the internal laws (and, under a sea medium, the sea-exchange laws) enabled together. Applying it realizes their events as one entry of `order.evaluationFrontiers`, derives sea coupling, records history commits, applies the frontier's anchor transfers, and then applies its lifecycle transitions, in that order. A closure run starts from the initial state for the autonomous continuations. For a World-Will candidate it starts after the candidate's interventions are applied to the closed autonomous base realization, which it continues.

- **Branch step.** When the enabled laws of a closure frontier do not commute and `internalConflictMode` is `maximal-commuting-branches`, each maximal commuting subset becomes one child realization with one new branch step. `parent` lists the ids of every earlier step of that realization's branch lineage, in lineage order (root first; empty for a first branch), so a step id chains all of its ancestors, including steps inherited from an autonomous base. `frontierIndex` is the zero-based number of closure frontiers, branching or not, that the realization had already applied in the current closure run; it restarts at 0 in a candidate's closure run. `realizedLawIds` lists the ids of the laws the child realizes, in canonical string order. The step's `enabledLawIds`, `nonrealizedLawIds`, and `derivation` are recorded but not hashed.
- **Transfer frontier.** The internal laws of one closure frontier that name an anchor transfer cause one transfer frontier. A law names at most one transfer (the validator rejects more with `CKW097`), and a law occurs at most once in a frontier, so the transfer frontier holds exactly one event `transfer:<transferId>:by:<lawId>` per such law. Those events form one entry of `order.evaluationFrontiers` and all carry the same `frontierId`. The record is the array of `{ lawId, transferId }` for those laws, ordered by `lawId` in canonical string order; ties cannot occur.
- **World lineage.** When the internal laws of one closure frontier spawn a world (the laws whose `spawn-world` effect targets it), the record has five members. `targetWorldId` is that world. `sourceWorldIds` lists the distinct worlds of those laws in canonical string order. `causedByLawEventIds` lists their event ids `law:<lawId>` in canonical string order. `parentLineages` has one entry per source world, in the order of `sourceWorldIds`: that world's lifecycle `lineageId` at spawn time (assigned by an earlier spawn in the same realization or by its `worldLifecycleOverrides` entry), or `initial:<worldId>` when it has none. `branchLineage` lists the ids of the steps of the realization's branch lineage at the moment of the spawn, in lineage order. It includes the step created at the spawning frontier itself when that frontier branched, because a step is recorded before its frontier's laws apply, and it excludes steps created later. A lineage id never changes once assigned, so a source world's `lifecycle.lineageId` in the continuation's final `worldStates` is its lineage at spawn time.
- **Commit state.** The record is a JSON object mapping every field id of the committing world (the committing law's world) to its exact value. It covers all of that world's fields, including its sea and viability fields, and not only `affectedFields`. It is taken at commit time: after every effect of the closure frontier that realized the law, including its sea exchanges and the derived sea-coupling recomputation, and before that frontier's anchor transfers and lifecycle transitions. The executing backend computes `stateDigest` from its own state at that moment. It is not reconstructible from the outcome alone, because the outcome stores each world's final state and only the committed subset `affectedFields`, and it omits derived sea-coupling trace entries, so the committing world's full field map at commit time is not recorded.
- **Retirement residue.** The record is `{ fields, intrinsicViability, seaContribution }` of the retired world's final state: its state after every effect of the frontier that retires it and after the retirement itself. Without a sea medium the retirement changes no field. Under a sea medium the retirement releases the world's sea (`residue.seaRelease`), setting its two sea fields to zero and recomputing its viability field and `seaContribution`, and the digest is taken after that release. Nothing changes a retired world afterwards, so in both cases the record equals that world's entry in the continuation's final `worldStates` and is reproducible from the outcome alone.

Array order inside these records is part of the derivation, as stated above. `parent` and `branchLineage` keep lineage order, `parentLineages` follows `sourceWorldIds`, the transfer-frontier list follows `lawId`, and `realizedLawIds`, `sourceWorldIds`, and `causedByLawEventIds` are in canonical string order. The outcome stores a continuation's `branchLineage` as a BIR sequence, so its order survives. It stores `realizedLawIds`, `sourceWorldIds`, `causedByLawEventIds`, and the anchor-transfer events as BIR sets. Set order is the bytewise order of member encodings ([bubble-ir.md](bubble-ir.md) section 4), which is not canonical string order, so a backend that rebuilds a record from the outcome must re-sort its arrays before hashing.

The reference oracle's stable serialization coincides with RFC 8785 for these records, which contain only strings, safe integers, booleans, arrays, and objects. The conformance tests rebuild branch, transfer-frontier, lineage, and retirement-residue records from the decoded portable outcome alone on every committed fixture, including the sea-medium fixtures, whose retirement-residue digests are taken after the release. The corpus includes a program whose law ids make BIR set order differ from canonical string order, a branch lineage of two steps, and a lineage chained through a spawned world, and the tests recompute the ids with an independent RFC 8785 implementation. Commit state digests are not rebuilt, for the reason above.

## 5. Host cost (`conformance.host-cost`)

The profile counts external realization work over the whole portable path (envelope decoding, lifting, execution). It never measures wall-clock time, so the same fixture always yields the same profile on the reference oracle. Its payload is one record node of thirteen required safe integers ([schema](bir-schemas.md#conformancehost-cost)):

`exactRationalConstructions`, `maxRationalBits`, `intensionalQueries` (including field initializers), `materializedIntensionalCoordinates`, `predicateEvaluations` (law guards, hard constraints, anchor identity, emergence criteria), `lawApplications`, `branchFrontierCandidates`, `realizationCopies`, `valueCopies`, `digestsComputed` and `bytesHashed` (including the envelope integrity check), `birNodesDecoded`, `birBytesRead`.

Cost is informational. A backend may reduce or reorganize it arbitrarily. Structural sharing does not exist in the oracle yet, so every realization copy allocates.

## 6. Corpus

The frozen corpus is `data/conformance/causal/` with `manifest.json`; `manifest.json` is the authoritative list. It contains twenty-one fixtures:

- eight canonical worlds: World-Will intervention, endogenous branching, lifecycle, two persistent kernels, two strict-source worlds including the membrane, and the compiled 7-world connected universe;
- seven verdict fixtures: branch-budget, intervention-budget, and proof-budget exhaustion (all `underdetermined`), autonomy with World Will disabled and every anchor cut, same-program internal-event nonrealization, a cut transfer anchor, and an unknown option target (`contradicted`);
- three sea-medium fixtures: the canonical `residue-commons` world (closed medium, `stable`) and a scarce region drawn by two exchanges under the default conflict mode (`underdetermined`) and under `maximal-commuting-branches` (`plural`);
- three specification probes: a co-realized law id whose BIR set order differs from canonical string order, a two-step branch lineage, and a lineage chained through a spawned world.

Rows of the schema appendix that no fixture exercises (for example `seaRegionOverrides`, `inverseEffects`, `objectives[].targetValue`, unary and family-coordinate terms, integer axes, and `recursion`) remain covered only by unit tests, not by the corpus.

`npm run check:conformance` runs inside `npm run verify` and requires the reference oracle to conform to every committed fixture. `npm run build:conformance` regenerates the corpus. It must be run only for an intentional semantic change recorded in the decision log, because regenerating it would otherwise hide oracle drift.

## 7. Not covered

- conformance for endogenous materialization, persistence certificates, finite-demand certificates, and narrative programs as their own outcome schemas;
- portable replay records;
- a second independent backend; the oracle checks itself against the frozen expectation, and executor tests show that semantic changes drift while host-only differences conform;
- equivalence classes broader than exact outcome equality.
