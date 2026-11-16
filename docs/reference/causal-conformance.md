# Causal Conformance Reference (Gate D)

Recorded: 2026-11-16

Status: completed bounded `v0.5.9` Gate D surface; confirmed by author selection on 2026-11-16

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

A fixture's semantic identity is therefore its input. Its expected outcome has its own identity: SHA-256 over `bubble-causal-outcome-identity.v1\0` followed by the outcome payload.

Execution options schema: `worldWillEnabled` (bool), `cutAnchorIds` (set), `fieldOverrides` (map of exact values), `fieldOverrideCauses` (map of sets), `worldLifecycleOverrides` (map of lifecycle states), `counterfactualInternalEventAblationLawIds` (set), and the safe integers `evaluationBudgetPerQuery`, `maxInterventionCombinations`, `maxInternalFrontiers`, `maxInternalBranches`. Every field is optional; absence means the oracle default.

## 2. Conformance

A backend executes the lifted program with the lifted options, projects its result onto the portable outcome, and encodes it with the BIR v1 node encoding. Only fields the outcome schema declares are projected, so host-only fields a backend adds are ignored. It conforms on the fixture exactly when those bytes equal the `conformance.causal-outcome` payload. Comparison is bytewise, so every set member, exact value, and id must match, and nothing else is compared. `checkCausalConformance(bytes, executor)` performs this check for any executor and never throws: a malformed, tampered, or wrongly flagged fixture is `invalid-fixture`, an unknown critical section is `not-executable`, an executor that throws is `executor-failed`, and an executor whose output differs from, or cannot be projected onto, the expected outcome is `drift` with the first differing path.

## 3. Portable outcome (`bubble-causal-outcome.v1`)

The outcome records what the world did:

- run `status`, the set of diagnostic codes, the initial world states, and the resource-boundary verdict (`exhaustiveInterventionSearch`, `exhaustiveInternalBranching`);
- autonomous continuations, all continuations, selected continuation ids, and unresolved alternative ids;
- World-Will decision evidence: intervention eligibility status, baseline scores, and each candidate's interventions, status, score, cost, improvement, and branch outcomes;
- for each autonomous continuation, the identity verdict of every declared anchor-identity predicate (`resolved` with its value, `undetermined`, `contradicted`, or `not-evaluated` when an endpoint world is inactive);
- for each continuation: selection, interventions, score, branch lineage, final world states (fields, intrinsic viability, sea contribution, lifecycle), realized events, the event ledger, history commits, lifecycle events, anchor-transfer events and assessment statuses, internal-event nonrealizations, emergence statuses with witnesses and causes, and the causal order (edges, synchronous evaluation frontiers, reversible and irreversible events, history-arrow sources).

Only schema-declared fields are kept, and an empty optional collection is identified with an absent one. A runtime contradiction that is not a validation failure, such as an unknown option target, has no diagnostic code; its outcome records the status alone.

The event ledger is every non-derived trace entry keyed by its stable suffix (for example `law:condense`, `commit:law:condense`, `initial:world.field`), with its kind, world, event and law references, cause set, and field-effect set.

The outcome deliberately omits how the oracle computed that world, because a conforming backend may compute it differently:

- intensional proof traces and evaluation subject ids;
- the single evaluation linearization (`evaluationOrder`); the synchronous frontier layering is kept;
- sequential trace numbering and derived sea-coupling trace entries, whose results appear in states and later effects;
- prose reasons and diagnostic paths;
- resource counters and the host program digest.

## 4. Evidence-id derivations

Some ids carry world identity and are part of the outcome. Each is lowercase-hex SHA-256 over the RFC 8785 JSON Canonicalization Scheme serialization of a fixed record, truncated as stated. Exact values serialize as `{"kind":"rational","numerator":"…","denominator":"…"}`, `{"kind":"boolean","value":…}`, or `{"kind":"symbol","value":"…"}`.

| Id | Record | Prefix and length |
| --- | --- | --- |
| branch step | `{ parent: prior step ids, frontierIndex, realizedLawIds }` | `branch:` + 16 |
| transfer frontier | the frontier's `[{ lawId, transferId }, …]` | `transfer-frontier:` + 16 |
| world lineage | `{ targetWorldId, sourceWorldIds, causedByLawEventIds, parentLineages, branchLineage }`, where a parent without lineage is `initial:<worldId>` | `lineage:` + 20 |
| commit state | the committing world's complete field map at commit time | full 64 |
| retirement residue | `{ fields, intrinsicViability, seaContribution }` of the retired world's final state | full 64 |

Array order inside these records is part of the derivation. `parent` keeps lineage order, the transfer-frontier list is ordered by law id, and every other array (`realizedLawIds`, `sourceWorldIds`, `causedByLawEventIds`, `parentLineages` following `sourceWorldIds`) is in canonical string order. The outcome stores those arrays as BIR sets, whose order is the bytewise order of member encodings (shorter strings first), so a backend that rebuilds a record from the outcome must re-sort it before hashing.

The reference oracle's stable serialization coincides with RFC 8785 for these records, which contain only strings, safe integers, booleans, arrays, and objects. The conformance tests rebuild branch, transfer-frontier, lineage, and retirement-residue records from the decoded portable outcome alone, including a program whose law ids make BIR set order differ from canonical string order, and recompute the ids with an independent RFC 8785 implementation.

## 5. Host cost (`conformance.host-cost`)

The profile counts external realization work over the whole portable path (envelope decoding, lifting, execution). It never measures wall-clock time, so the same fixture always yields the same profile on the reference oracle:

`exactRationalConstructions`, `maxRationalBits`, `intensionalQueries` (including field initializers), `materializedIntensionalCoordinates`, `predicateEvaluations` (law guards, hard constraints, anchor identity, emergence criteria), `lawApplications`, `branchFrontierCandidates`, `realizationCopies`, `valueCopies`, `digestsComputed` and `bytesHashed` (including the envelope integrity check), `birNodesDecoded`, `birBytesRead`.

Cost is informational. A backend may reduce or reorganize it arbitrarily. Structural sharing does not exist in the oracle yet, so every realization copy allocates.

## 6. Corpus

The frozen corpus is `data/conformance/causal/` with `manifest.json`. It contains eight canonical worlds (World-Will intervention, endogenous branching, lifecycle, two persistent kernels, two strict-source worlds including the membrane, and the compiled 7-world connected universe) and seven verdict fixtures: branch-budget, intervention-budget, and proof-budget exhaustion (all `underdetermined`), autonomy with World Will disabled and every anchor cut, same-program internal-event nonrealization, a cut transfer anchor, and an unknown option target (`contradicted`).

`npm run check:conformance` runs inside `npm run verify` and requires the reference oracle to conform to every committed fixture. `npm run build:conformance` regenerates the corpus. It must be run only for an intentional semantic change recorded in the decision log, because regenerating it would otherwise hide oracle drift.

## 7. Not covered

- conformance for endogenous materialization, persistence certificates, finite-demand certificates, and narrative programs as their own outcome schemas;
- portable replay records;
- a second independent backend; the oracle checks itself against the frozen expectation, and executor tests show that semantic changes drift while host-only differences conform;
- equivalence classes broader than exact outcome equality.
