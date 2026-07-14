# Idea and Question Implementation Map

Last reconciled: 2026-07-15

## Purpose

This map prevents user ideas, research questions, specifications, implementation, and verification from drifting into separate stories. It does not declare every idea complete. It records what is implemented, what remains an interpretation, what is deliberately deferred, and which milestone may change each status.

## Status Vocabulary

- **implemented baseline:** represented in code and mandatory verification, while wider research may remain open
- **partial:** a bounded operational slice exists but does not fulfill the whole idea
- **selected closure:** the next bounded release must finish this slice before opening a new feature family
- **open:** the question remains active and lacks enough implementation or evidence
- **deferred:** intentionally kept out of the current release because its prerequisites are not stable

## Foundational Idea Trace

| User idea cluster | Questions | Current operational support | Honest status | Next milestone |
| --- | --- | --- | --- | --- |
| Independent bubble worlds with their own law, history, boundary, lineage, will, and identity | Q-001, Q-004 | Bubble IR, lineage-relative address, first-class boundary, semantic plan, worldhood/anchor proof claims | Partial | Strengthen identity conditions only from concrete same-world counterexamples |
| Finite representation of abundant or unbounded worlds | Q-006, Q-007 | Quotes, generators, latent bubbles, staged emissions, bundle plans, selective materialization, commit evidence | Partial | Bounded expanding-lineage storage and traversal experiment |
| Embedded observers recover truth from finite evidence | Q-013, Q-014, Q-016, Q-017 | Bounded outside observation, collapse records, local observation state, event-source attribution, inspection and replay reports | Partial | A scored observer/inspector task in `v0.5` |
| World will acts as governing law rather than lore | Q-001, Q-004, Q-009 | Explicit descriptive/executable mode split and executable criterion when parseable | Partial | Add no syntax until a real world requires a missing executable condition |
| A dedicated language raises the representability frontier | Q-008, Q-009 | Versioned DSL, typed AST/IR, partial laws, constraints, quotations, reflection, latent semantics | Implemented baseline | Compare one Bubble-native task with a realistic host-language embedding |
| Nondeterminism and world formation have explicit semantic cost | Q-010, Q-014 | Eight typed effects, separated roles, obligations, pressure/event projections, causal links, and evidence-bounded source attribution | Partial | Test the current surface in a scored `v0.5` task before adding effects |
| Bubbles generate worlds, descendants, artifacts, and staged language structure | Q-006, Q-009, Q-012 | Meta profile, quotes, generators, reflection, emission, grammar artifacts and staged activation | Partial | Expand only from an observed membrane or composition failure |
| Negative sea, positive sea, and anchor form one operational ontology | Q-002, Q-003, Q-004, Q-005, Q-014 | Explicit IR source projections, runtime assessments, theorem witness, evidence, proof basis, and bounded event-source attribution | Partial | Keep dynamics and the full identity calculus open beyond the completed `v0.4.9` slice |
| Observation materializes and deforms latent world state | Q-016, Q-017 | Single-region materialization law, perturbation mix, sea/anchor state structure, commit/replay records | Implemented bounded baseline | Reopen only for a concrete coupled-region or author-control requirement |
| Deterministic substrate may host probabilistic-fractal worldhood | Q-015 | Research note and explicit non-goals only | Deferred | Requires distributional identity, contradiction, and replay semantics first |
| Bubble must earn its existence as a research instrument | Q-011, Q-013 | End-to-end executable loop and inspectable ontology, but no comparative scored benchmark | Open | First `v0.5` benchmark should compare Bubble with a credible host-language path |

## Question Ledger

| Question | Reconciled status | Why it is not more complete | Planned boundary |
| --- | --- | --- | --- |
| Q-001 minimal independent world | Partial | Minimum engineering schema is not a final worldhood philosophy | Preserve baseline; revise from counterexample |
| Q-002 negative sea | Partial | Source aggregation exists; dynamics do not | No new sea syntax in `v0.4.9` |
| Q-003 positive sea | Partial | Structural support exists; placement/growth dynamics do not | No new sea syntax in `v0.4.9` |
| Q-004 strong anchor | Partial | Inferred score and criterion are not a full identity calculus | Later same-world counterexamples |
| Q-005 same-world replay | Partial | Stored replay is not deterministic re-execution proof | Explicitly bounded; reopen after attribution |
| Q-006 unbounded multiverse | Partial | Intensional forms exist without scale/storage experiment | `v0.5` experiment candidate |
| Q-007 latent-to-history commit | Partial | Single-region runtime policy lacks coupled commits | Reopen only from second-region case |
| Q-008 DSL or general language | Answered for current architecture | Long-term language shape may still evolve | Dedicated constrained DSL remains in force |
| Q-009 representability frontier | Partial | No broad solver or cross-file semantic composition | Stabilize before widening |
| Q-010 primitive effects | Partial | Candidate set exists; branch/retirement transitions remain potential | Extend only with concrete record types |
| Q-011 unique Bubble leverage | Open | No realistic host-language comparison | `v0.5` benchmark gate |
| Q-012 language-bubble membranes | Partial | Several observed classes logged; catalog incomplete | Evidence-led additions only |
| Q-013 usable benchmark loop | Partial | Executable loop lacks scores and repeated trials | `v0.5` benchmark gate |
| Q-014 event source distinction | Implemented bounded baseline | Event-level attribution is not a general causal calculus | Reopen from a concrete unsupported subject or cross-world transfer |
| Q-015 probabilistic-fractal worldhood | Deferred | Identity and replay under probability clouds are undefined | Beyond `v0.5` entry gate |
| Q-016 observation materialization | Implemented bounded baseline | No coupled regions or general solver | Keep closed until concrete reopen condition |
| Q-017 observation-changing replay | Partial | History shape is preserved but not separately proven | Reopen after deterministic replay design |

## Contradiction Guards

These tensions are intentional and must not be collapsed into accidental contradictions:

1. **Observer-independent existence vs observation-caused materialization:** a latent bubble exists as compressed lawful structure before contact; observation selects or deforms a concrete local history without creating worldhood from nothing.
2. **Authored intent vs inferred assessment:** authored will, anchor criterion, and effects remain distinct from runtime sea/anchor scores and materialized evidence.
3. **Potential effect vs executed event:** a declared capability may remain potential; the runtime must not fabricate a causal target.
4. **Stored replay vs same-world proof:** reopening a preserved bundle demonstrates record continuity, not deterministic re-execution identity.
5. **Unbounded possibility vs finite storage:** unbounded lineage is represented intensionally; only contacted or committed slices become explicit state.
6. **Deterministic baseline vs probabilistic ambition:** deterministic bounded semantics remain authoritative until distributional identity and contradiction rules are specified.
7. **Universal bubble ontology vs host implementation:** TypeScript may implement the stack, but host-only behavior must not silently become Bubble semantics.

## v0.5 Entry Gate

`v0.5` does not require every research question to be solved. It requires:

- every question to have an honest current status and reopen condition
- no known contradiction between canonical ontology, code, tests, replay artifacts, and public documentation
- completion of the `v0.4.9` source-attribution slice
- passing mandatory repository verification
- explicit selection of one `v0.5` research objective, preferably the first scored Bubble-versus-host benchmark rather than another wide syntax expansion

The `v0.4.9` gate is complete. The next version is `v0.5`; this transition does not close or delete the partial, open, or deferred rows above.
