# Persistent Causal World Reference

Applies to: `bubble-persistent-causal-program.v1` and `v0.5.3`

## Program

A persistent program wraps one unchanged `bubble-anchored-causal-program.v2`:

```json
{
  "mode": "bubble-persistent-causal-program.v1",
  "causalProgram": { "mode": "bubble-anchored-causal-program.v2" }
}
```

No entity, protagonist, agent, or persistence criterion is declared. [`persistent.ts`](../../src/bubbles/world-kernel/persistent.ts) retains conjunctive law dependencies in a field/law factor graph and derives strongly connected field projections. [`persistent-runtime.ts`](../../src/bubbles/world-kernel/persistent-runtime.ts) unfolds exact causal closures and evaluates stronger evidence.

## Execution Options

- `maxClosures`: maximum closures unfolded on one path; must be at least two, default `8`.
- `maxPaths`: maximum distinct lawful branch paths, default `32`.
- `causalOptions`: the complete underlying causal execution options, including World-Will disabling, anchor cuts, formal-query budgets, and intervention-search bounds.

Budgets constrain proof search, not denoted worldhood. Exhaustion returns `undetermined`.

## Derived Components

For each internal law, the runtime retains the whole guard tuple and effect tuple as one `CausalLawDependency`. The inspectable pairwise influence edges are projections only. Tarjan analysis runs on distinct field and law nodes, and each report includes member fields, member laws, roles, projected edges, and incoming/outgoing law-hypercut dependencies.

The v1 detector evaluates a component only when it:

- belongs to one world;
- is recurrent by a non-trivial component or self-loop;
- contains structural, identity, memory, and boundary field roles.

These are bounded operational criteria, not universal definitions of life or agency.

## Persistence Assessment

Each assessment separately reports:

- boundary-mediated incoming/outgoing dependencies, pre-formation boundary-state ablation, tested crossing laws, suppressed non-crossing recovery laws, and `boundary.derivedFromCausalCut`;
- recurrent and invariant identity evidence;
- per-continuation memory-erasure evidence and changed internal/external fields;
- the negative-sea, structural-deviation, exact recurrent reference, and restoration evidence;
- realized outgoing laws and counterfactually changed external fields;
- exact failure reasons.

For a multi-state recurrence, boundary ablation ranges over every closure in the certified cycle. Every crossing law must be realized and semantically discriminated in at least one relevant closure; a law that appears only in a later phase cannot escape the proof.

`persistent` requires all surfaces on every lawful path and every selected counterfactual continuation. Mixed or unresolved counterfactuals make the assessment `undetermined`. Missing evidence makes it `non-persistent`.

## Closure Paths And Order

The runtime records every selected continuation. A closure output configuration is carried to the next run by exact field overrides; intrinsic viability, not already sea-coupled visible viability, is carried into the viability initializer. History commits are not folded back into the field digest: they are appended to a separate `monotone-causal-commit-ledger` with closure identity and ordinal.

Causal-configuration repetition yields a lasso certificate with `startConfigurationIndex`, `periodClosures`, and `repeatedConfigurationDigest`. Its nested `anchoredHistory` evidence records ledger counts at both cuts, extension count, and whether the full anchored state repeated. A configuration lasso therefore never silently erases committed history. Closure identifiers and evaluation order are proof coordinates only. Reports always state:

```json
{
  "kind": "causal-closure-coalgebra",
  "universalClock": false
}
```

## Inspection And Replay

Replay verifies stored-run integrity, recorded program identity, full-run equality, path-cycle preservation, and persistence-evidence preservation. A changed stored assessment or closure record yields `reexecution-drift`.

Commands:

```text
npm run run:persistence-example
npm run inspect:persistence-example
npm run record:persistence-example
npm run replay:persistence-example
npm run verify:persistence
npm run verify:persistence-example
```

CLI flags include `--max-closures`, `--max-paths`, and all anchored-causal flags such as `--disable-world-will` and `--evaluation-budget`.
