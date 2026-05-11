# Work Log

## 2026-05-11

- Reviewed the initial idea list and selected ideas 3, 4, 9, and 11 as the project basis.
- Chose the project framing: embedded AI agents infer world laws and detect contradictions inside a compact procedural universe.
- Expanded the repository README into a project seed document.
- Added persistent workspace logs for ideas, decisions, and progress.
- Recommended starting from a formal discrete micro-world before any graphics or large-scale simulation.
- Reviewed the discarded AIPS repository structure and kept its separation of world, agent, simulation, and inspection concerns as a reference.
- Added the larger vision explicitly: a multiverse of bubble universes, each with its own world will and story logic.
- Recorded the rule that long-range vision and first executable scope must stay separate.
- Added the user's stronger foundational motivation: our world appears complex yet coherent, so the project should ask whether artificial worlds can also remain contradiction-free.
- Added a stricter documentation and memory-management scheme with dedicated research logs.
- Added the new multiverse direction: generate many bubble universes that can appear and disappear dynamically under hidden governing laws.
- Recorded the storage principle that very large or unbounded world collections must be represented generatively, not as full explicit state.
- Reworked the repository plan toward a bubble-first structure with ontology-driven names such as bubbles, cosmos, beings, and traces.
- Added explicit dependency-topology guidance so the special naming scheme does not turn into architectural ambiguity.
- Added a language direction for the project: start from a constrained world-definition DSL and compile it to an internal representation instead of beginning with a general-purpose programming language.
- Refined the language ambition: not literal representation of the absolutely inexpressible, but a higher-order language that can express structures unavailable to lower layers through constraints, generators, placeholders, and reflective constructs.
- Added a new language axis: semantic nondeterminism with explicit effect typing, so world generation can create branches and consequences without hiding them inside arbitrary runtime behavior.
- Chose the current portfolio strategy: keep one repository, but run research and language as two coordinated workstreams sharing a single semantic kernel.
- Bootstrapped the language workstream in TypeScript with a minimal `Bubbles` DSL parser, Bubble IR lowering path, typed effect declarations, compile CLI, example source file, and unit tests.
- Promoted the language bootstrap into a cleaner `v0.1` profile with structured diagnostics, a shared compile pipeline, explicit semantic validation rules, a `verify` command, and a dedicated profile document.
