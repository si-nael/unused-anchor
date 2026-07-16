# Teleonomic Causal World Reference

Applies to: `bubble-persistent-causal-program.v1` analyzed by `v0.5.4`

## Input Contract

The teleonomic runtime consumes the existing persistent program unchanged. There is no authored teleonomic schema and no `goal`, `agent`, `actionCandidates`, or protagonist requirement. Validation and causal execution remain owned by the persistent and anchored-causal layers.

## Run Contract

`realizeTeleonomicCausalWorld(program, options)` returns `bubble-teleonomic-causal-run.v1` with one of:

- `teleonomic-capacity`: every lawful recurrent path has at least one certified component satisfying the complete bounded contract;
- `non-teleonomic`: execution is resolved but the contract is not met;
- `undetermined`: a closure, counterfactual, or resource frontier is incomplete;
- `contradicted`: the substrate or autonomy counterfactual is contradicted.

The run embeds the complete persistent run and records exact resource use. Its order record is always:

```json
{
  "kind": "causal-closure-viability-analysis",
  "universalClock": false,
  "hostAffordanceSelector": false
}
```

`resourceUse` separates persistent executions, response-event nonrealization executions, and per-response memory-erasure executions. Exhaustiveness is false whenever persistence, autonomy, or either response counterfactual remains unresolved.

## Assessment Fields

Each `TeleonomicStructureAssessment` contains:

- `endogenousNorm`: exact digests of the bounded invariant component-configuration set, its cardinality, cycle closure evidence, response-law identifiers, and `authoredGoalDeclaration: false`;
- `affordances`: factual sea/disturbance/response events, input/output kernel digests, internal discriminator values, one same-law response-event nonrealization result, and one same-program memory-erasure dependence result per factual occurrence;
- `plurality`: distinct response laws, pairwise-disjoint internal discriminator values, causal provenance for each discriminator recurrence, organic differentiation, and `hostSelection: false`;
- `autonomy`: factual absence of World-Will intervention plus path-indexed evidence from the full World-Will-disabled/all-anchors-cut persistence re-execution; every lawful path must persistently preserve the same component kernel;
- exact failure reasons.

An affordance counterfactual reconstructs the factual closure input, keeps the same program digest and response-law definition, disables World Will, cuts all anchors, and suppresses only the enabled internal response event and its effects. Every selected continuation must carry an `internal-event-nonrealization` witness. `necessary` means every witnessed continuation leaves the factual kernel. `mixed` is folded into unresolved affordance evidence, never accepted existentially.

Memory dependence is quantified separately. Every memory-role field bound by the response is reset to its pre-formation value in the same program with World Will disabled and every anchor cut. `necessary` means the factual response event is absent from every selected continuation. The report stores remembered and erased values plus each continuation verdict.

An internal discriminator is organic only when every response value was written causally downstream of that episode's structural disturbance and every recurrent input value was written causally downstream of the preceding response. This rejects a detached scheduler even if it produces the same phase sequence.

## Inspection And Replay

Inspection reports summary, embedded persistence summary, and full assessments. Stored replay checks record integrity, program identity, and exact full-run re-execution. Any changed kernel digest, assessment, ablation, or embedded persistence evidence produces `reexecution-drift`.

Commands:

```text
npm run run:teleonomy-example
npm run inspect:teleonomy-example
npm run record:teleonomy-example
npm run replay:teleonomy-example
npm run verify:teleonomy
npm run verify:teleonomy-example
```

The CLIs accept the persistent execution options, including `--max-closures`, `--max-paths`, `--disable-world-will`, anchor cuts, formal-query budgets, and intervention-search bounds. The lower-level causal CLI also accepts `--counterfactual-ablate-internal-event <law-id>` for an explicitly diagnostic same-program event-nonrealization run; the persistence layer rejects such a run as factual evidence.

Generated evidence is stored separately as `data/runs/self-maintaining-field.teleonomic.*.json` and `data/runs/distributed-channel-field.teleonomic.*.json`; it does not overwrite the v0.5.3 persistence artifacts.
