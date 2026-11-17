# BIR v1 Schema Appendix

Status: normative appendix to [bubble-ir.md](bubble-ir.md) and [causal-conformance.md](causal-conformance.md).

This file is generated from the exported schema objects by `npx tsx apps/hatchery/print-bir-schemas.ts`, and `tests/unit/bir-schema-doc.test.ts` fails whenever it differs from the generator output. Change the schemas or the generator, never this file by hand.

Every section payload listed here is exactly one BIR node, and each root is a record node. The tables below list every position of that node, so a backend can produce, and not only decode, each payload.

## Reading the tables

- **Path.** `$` is the payload's root node. `.name` is a record field, `[]` is a member of a set or an item of a sequence, `{}` is a value of a map (map keys are data), and `<tag>` selects one alternative of a variant.
- **Order of rows.** The fields of a record are listed in canonical string order of their keys, which is the order in which they are encoded. Variant alternatives are listed in canonical order of their tags.
- **Presence.** A `required` field is always encoded, and an `optional` field may be absent. `member`, `item`, and `value` mark collection elements. For a collection field, the presence also states whether an empty collection is encoded (see below). A record carries exactly its listed fields: a decoder rejects any other key (`BIRL12`) and an absent required field (`BIRL11`).
- **Node tag.** The tag byte, in hex, of the node at that position ([bubble-ir.md](bubble-ir.md) section 4).
- **`same schema as P`.** The position has exactly the schema listed under path `P`, whose rows are not repeated. `recursive: same schema as P` marks a position nested inside `P` that refers back to it.

| Schema | Node | Constraint |
| --- | --- | --- |
| `bool` | structural boolean `01` (false) / `02` (true) | never an exact boolean |
| `text` | string `04` | well-formed UTF-8 text |
| `literal "v"` | string `04` | exactly the text `v` |
| `integer-text` | integer `03` | the host value is a canonical decimal string `0` or `-?[1-9][0-9]*` (`BIRL05`) |
| `safe-integer` | integer `03` | the host value is an integer with absolute value at most 2^53 - 1 (`BIRL08`, `BIRL15`) |
| `exact` | rational `10`, exact boolean `11` / `12`, or symbol `13` | a canonical exact world value (`BIRL06`) |
| `record` | record `07` | exactly the listed fields |
| `variant on k` | record `07` | a record whose string field `k` is one of the listed tags, together with that alternative's fields; the tag field is listed in each alternative as a literal |
| `set` | set `06` | unordered; members in strictly increasing bytewise order of their encodings, no duplicates |
| `seq` | sequence `05` | ordered; item position is part of meaning |
| `map` | map `08` | keys are data, in strictly increasing canonical string order |

## Optional fields and empty collections

- In every section, a required collection is always encoded, even when empty: an empty set is `06 00`, an empty sequence `05 00`, and an empty map `08 00`. The tables mark these fields `required, even if empty`.
- In `core.causal-program` and `core.causal-execution-options`, presence is preserved exactly. An optional field is encoded exactly when the host object has it, and an optional collection given as empty is encoded as an empty node, which differs from an absent field in bytes and in semantic identity. No field is identified with a default. The tables mark these collections `optional, kept if empty`.
- In `conformance.causal-outcome`, the projection applies exactly one normalization, at every depth: an optional set or sequence that would be empty is omitted. The tables mark these collections `optional, omitted if empty`. An optional field of any other kind (record, map, exact value, text, or boolean) is present exactly when the executed run defines it and is never omitted for being empty. Fields the run carries outside the schema are dropped before encoding, so they never affect conformance; a decoder of the section still rejects unknown keys.
- In `conformance.host-cost` and `conformance.label`, every field is required.

## Sections

| Section | Critical | Content |
| --- | --- | --- |
| [`core.causal-program`](#corecausal-program) | yes | The executable causal program `bubble-anchored-causal-program.v2` ([bubble-ir.md](bubble-ir.md) section 6). |
| [`core.causal-execution-options`](#corecausal-execution-options) | yes | Execution options, part of the input meaning ([causal-conformance.md](causal-conformance.md) section 1). An absent field means the oracle default; options with no field encode as `07 00`. |
| [`conformance.causal-outcome`](#conformancecausal-outcome) | no | The expected portable outcome `bubble-causal-outcome.v1` ([causal-conformance.md](causal-conformance.md) section 3). |
| [`conformance.host-cost`](#conformancehost-cost) | no | The reference oracle's deterministic host-cost profile, informational ([causal-conformance.md](causal-conformance.md) section 5). |
| [`conformance.label`](#conformancelabel) | no | Fixture name and description. |

## core.causal-program

The executable causal program `bubble-anchored-causal-program.v2` ([bubble-ir.md](bubble-ir.md) section 6).

| Path | Presence | Schema | Node tag |
| --- | --- | --- | --- |
| `$` | root | record | `07` |
| `$.execution` | required | record | `07` |
| `$.execution.anchorIdentity` | required, even if empty | set | `06` |
| `$.execution.anchorIdentity[]` | member | record | `07` |
| `$.execution.anchorIdentity[].anchorId` | required | text | `04` |
| `$.execution.anchorIdentity[].fieldParameters` | required, even if empty | set | `06` |
| `$.execution.anchorIdentity[].fieldParameters[]` | member | record | `07` |
| `$.execution.anchorIdentity[].fieldParameters[].fieldId` | required | text | `04` |
| `$.execution.anchorIdentity[].fieldParameters[].parameterName` | required | text | `04` |
| `$.execution.anchorIdentity[].fieldParameters[].worldId` | required | text | `04` |
| `$.execution.anchorIdentity[].id` | required | text | `04` |
| `$.execution.anchorIdentity[].query` | required | record | `07` |
| `$.execution.anchorIdentity[].query.at` | required, even if empty | map (keys are data) | `08` |
| `$.execution.anchorIdentity[].query.at{}` | value | integer-text | `03` |
| `$.execution.anchorIdentity[].query.familyId` | required | text | `04` |
| `$.execution.anchorIdentity[].query.parameters` | required, even if empty | map (keys are data) | `08` |
| `$.execution.anchorIdentity[].query.parameters{}` | value | exact | `10` / `11` / `12` / `13` |
| `$.execution.decisionMode` | required | text | `04` |
| `$.execution.hardConstraints` | required, even if empty | set | `06` |
| `$.execution.hardConstraints[]` | member | record | `07` |
| `$.execution.hardConstraints[].fieldParameters` | required, even if empty | set | `06` |
| `$.execution.hardConstraints[].fieldParameters[]` | member | record, same schema as `$.execution.anchorIdentity[].fieldParameters[]` | `07` |
| `$.execution.hardConstraints[].id` | required | text | `04` |
| `$.execution.hardConstraints[].query` | required | record, same schema as `$.execution.anchorIdentity[].query` | `07` |
| `$.execution.internalConflictMode` | optional | text | `04` |
| `$.execution.interventionCosts` | required, even if empty | set | `06` |
| `$.execution.interventionCosts[]` | member | record | `07` |
| `$.execution.interventionCosts[].cost` | required | exact | `10` / `11` / `12` / `13` |
| `$.execution.interventionCosts[].interventionId` | required | text | `04` |
| `$.fieldInitializers` | required, even if empty | set | `06` |
| `$.fieldInitializers[]` | member | record | `07` |
| `$.fieldInitializers[].fieldId` | required | text | `04` |
| `$.fieldInitializers[].query` | required | record, same schema as `$.execution.anchorIdentity[].query` | `07` |
| `$.fieldInitializers[].worldId` | required | text | `04` |
| `$.mode` | required | literal `"bubble-anchored-causal-program.v2"` | `04` |
| `$.seaLaws` | required, even if empty | set | `06` |
| `$.seaLaws[]` | member | record | `07` |
| `$.seaLaws[].negativeWeight` | required | exact | `10` / `11` / `12` / `13` |
| `$.seaLaws[].positiveWeight` | required | exact | `10` / `11` / `12` / `13` |
| `$.seaLaws[].worldId` | required | text | `04` |
| `$.world` | required | record | `07` |
| `$.world.anchorTransfers` | optional, kept if empty | set | `06` |
| `$.world.anchorTransfers[]` | member | record | `07` |
| `$.world.anchorTransfers[].anchorId` | required | text | `04` |
| `$.world.anchorTransfers[].id` | required | text | `04` |
| `$.world.anchorTransfers[].source` | required | record | `07` |
| `$.world.anchorTransfers[].source.fieldId` | required | text | `04` |
| `$.world.anchorTransfers[].source.portId` | required | text | `04` |
| `$.world.anchorTransfers[].source.worldId` | required | text | `04` |
| `$.world.anchorTransfers[].sourceNegativeSeaResidue` | required | exact | `10` / `11` / `12` / `13` |
| `$.world.anchorTransfers[].target` | required | record, same schema as `$.world.anchorTransfers[].source` | `07` |
| `$.world.anchorTransfers[].targetPositiveSeaPlacement` | required | exact | `10` / `11` / `12` / `13` |
| `$.world.anchors` | required, even if empty | set | `06` |
| `$.world.anchors[]` | member | record | `07` |
| `$.world.anchors[].endpoints` | required, even if empty | set | `06` |
| `$.world.anchors[].endpoints[]` | member | variant on `kind`: `"unresolved-world-relation"`, `"world"` | `07` |
| `$.world.anchors[].endpoints[]<unresolved-world-relation>.kind` | required | literal `"unresolved-world-relation"` | `04` |
| `$.world.anchors[].endpoints[]<unresolved-world-relation>.portId` | required | text | `04` |
| `$.world.anchors[].endpoints[]<unresolved-world-relation>.questionId` | required | text | `04` |
| `$.world.anchors[].endpoints[]<unresolved-world-relation>.relationId` | required | text | `04` |
| `$.world.anchors[].endpoints[]<world>.kind` | required | literal `"world"` | `04` |
| `$.world.anchors[].endpoints[]<world>.portId` | required | text | `04` |
| `$.world.anchors[].endpoints[]<world>.worldId` | required | text | `04` |
| `$.world.anchors[].id` | required | text | `04` |
| `$.world.anchors[].identityPredicateFamilyIds` | required, even if empty | set | `06` |
| `$.world.anchors[].identityPredicateFamilyIds[]` | member | text | `04` |
| `$.world.anchors[].permittedInterventionKinds` | required, even if empty | set | `06` |
| `$.world.anchors[].permittedInterventionKinds[]` | member | text | `04` |
| `$.world.emergenceCriteria` | required, even if empty | set | `06` |
| `$.world.emergenceCriteria[]` | member | record | `07` |
| `$.world.emergenceCriteria[].id` | required | text | `04` |
| `$.world.emergenceCriteria[].predicate` | required | record, same schema as `$.execution.hardConstraints[]` | `07` |
| `$.world.emergenceCriteria[].witnessFieldIds` | required, even if empty | set | `06` |
| `$.world.emergenceCriteria[].witnessFieldIds[]` | member | text | `04` |
| `$.world.emergenceCriteria[].worldId` | required | text | `04` |
| `$.world.formal` | required | record | `07` |
| `$.world.formal.families` | required, even if empty | set | `06` |
| `$.world.formal.families[]` | member | record | `07` |
| `$.world.formal.families[].body` | required | variant on `kind`: `"binary"`, `"family-coordinate"`, `"if"`, `"index"`, `"parameter"`, `"unary"`, `"value"` | `07` |
| `$.world.formal.families[].body<binary>.kind` | required | literal `"binary"` | `04` |
| `$.world.formal.families[].body<binary>.left` | required | variant, recursive: same schema as `$.world.formal.families[].body` | `07` |
| `$.world.formal.families[].body<binary>.operator` | required | text | `04` |
| `$.world.formal.families[].body<binary>.right` | required | variant, recursive: same schema as `$.world.formal.families[].body` | `07` |
| `$.world.formal.families[].body<family-coordinate>.at` | required, even if empty | map (keys are data) | `08` |
| `$.world.formal.families[].body<family-coordinate>.at{}` | value | variant, recursive: same schema as `$.world.formal.families[].body` | `07` |
| `$.world.formal.families[].body<family-coordinate>.familyId` | required | text | `04` |
| `$.world.formal.families[].body<family-coordinate>.kind` | required | literal `"family-coordinate"` | `04` |
| `$.world.formal.families[].body<family-coordinate>.parameters` | required, even if empty | map (keys are data) | `08` |
| `$.world.formal.families[].body<family-coordinate>.parameters{}` | value | variant, recursive: same schema as `$.world.formal.families[].body` | `07` |
| `$.world.formal.families[].body<if>.condition` | required | variant, recursive: same schema as `$.world.formal.families[].body` | `07` |
| `$.world.formal.families[].body<if>.kind` | required | literal `"if"` | `04` |
| `$.world.formal.families[].body<if>.otherwise` | required | variant, recursive: same schema as `$.world.formal.families[].body` | `07` |
| `$.world.formal.families[].body<if>.then` | required | variant, recursive: same schema as `$.world.formal.families[].body` | `07` |
| `$.world.formal.families[].body<index>.axis` | required | text | `04` |
| `$.world.formal.families[].body<index>.kind` | required | literal `"index"` | `04` |
| `$.world.formal.families[].body<parameter>.kind` | required | literal `"parameter"` | `04` |
| `$.world.formal.families[].body<parameter>.name` | required | text | `04` |
| `$.world.formal.families[].body<unary>.kind` | required | literal `"unary"` | `04` |
| `$.world.formal.families[].body<unary>.operand` | required | variant, recursive: same schema as `$.world.formal.families[].body` | `07` |
| `$.world.formal.families[].body<unary>.operator` | required | text | `04` |
| `$.world.formal.families[].body<value>.kind` | required | literal `"value"` | `04` |
| `$.world.formal.families[].body<value>.value` | required | exact | `10` / `11` / `12` / `13` |
| `$.world.formal.families[].domain` | required | record | `07` |
| `$.world.formal.families[].domain.axes` | required, even if empty | seq (item order is meaning) | `05` |
| `$.world.formal.families[].domain.axes[]` | item | variant on `kind`: `"finite"`, `"integer"`, `"natural"` | `07` |
| `$.world.formal.families[].domain.axes[]<finite>.kind` | required | literal `"finite"` | `04` |
| `$.world.formal.families[].domain.axes[]<finite>.name` | required | text | `04` |
| `$.world.formal.families[].domain.axes[]<finite>.size` | required | integer-text | `03` |
| `$.world.formal.families[].domain.axes[]<integer>.kind` | required | literal `"integer"` | `04` |
| `$.world.formal.families[].domain.axes[]<integer>.name` | required | text | `04` |
| `$.world.formal.families[].domain.axes[]<natural>.kind` | required | literal `"natural"` | `04` |
| `$.world.formal.families[].domain.axes[]<natural>.name` | required | text | `04` |
| `$.world.formal.families[].id` | required | text | `04` |
| `$.world.formal.families[].parameters` | required, even if empty | set | `06` |
| `$.world.formal.families[].parameters[]` | member | record | `07` |
| `$.world.formal.families[].parameters[].name` | required | text | `04` |
| `$.world.formal.families[].parameters[].valueKind` | required | text | `04` |
| `$.world.formal.families[].recursion` | optional | record | `07` |
| `$.world.formal.families[].recursion.kind` | required | text | `04` |
| `$.world.formal.families[].recursion.measureAxis` | required | text | `04` |
| `$.world.formal.families[].valueKind` | required | text | `04` |
| `$.world.formal.mode` | required | literal `"bubble-intensional-system.v1"` | `04` |
| `$.world.internalLaws` | required, even if empty | set | `06` |
| `$.world.internalLaws[]` | member | record | `07` |
| `$.world.internalLaws[].anchorTransferIds` | optional, kept if empty | set | `06` |
| `$.world.internalLaws[].anchorTransferIds[]` | member | text | `04` |
| `$.world.internalLaws[].application` | required | text | `04` |
| `$.world.internalLaws[].commitAffectedFieldIds` | optional, kept if empty | set | `06` |
| `$.world.internalLaws[].commitAffectedFieldIds[]` | member | text | `04` |
| `$.world.internalLaws[].effects` | required, even if empty | set | `06` |
| `$.world.internalLaws[].effects[]` | member | record | `07` |
| `$.world.internalLaws[].effects[].fieldId` | required | text | `04` |
| `$.world.internalLaws[].effects[].operation` | required | text | `04` |
| `$.world.internalLaws[].effects[].value` | required | exact | `10` / `11` / `12` / `13` |
| `$.world.internalLaws[].guard` | required | record, same schema as `$.execution.hardConstraints[]` | `07` |
| `$.world.internalLaws[].id` | required | text | `04` |
| `$.world.internalLaws[].inverseEffects` | optional, kept if empty | set | `06` |
| `$.world.internalLaws[].inverseEffects[]` | member | record, same schema as `$.world.internalLaws[].effects[]` | `07` |
| `$.world.internalLaws[].lifecycleEffects` | optional, kept if empty | set | `06` |
| `$.world.internalLaws[].lifecycleEffects[]` | member | variant on `kind`: `"retire-self"`, `"spawn-world"` | `07` |
| `$.world.internalLaws[].lifecycleEffects[]<retire-self>.kind` | required | literal `"retire-self"` | `04` |
| `$.world.internalLaws[].lifecycleEffects[]<spawn-world>.kind` | required | literal `"spawn-world"` | `04` |
| `$.world.internalLaws[].lifecycleEffects[]<spawn-world>.targetWorldId` | required | text | `04` |
| `$.world.internalLaws[].reversibility` | required | text | `04` |
| `$.world.internalLaws[].worldId` | required | text | `04` |
| `$.world.mode` | required | literal `"bubble-anchored-causal-world.v2"` | `04` |
| `$.world.order` | required | record | `07` |
| `$.world.order.kind` | required | text | `04` |
| `$.world.order.universalClock` | required | bool | `01` / `02` |
| `$.world.seaMedium` | optional | record | `07` |
| `$.world.seaMedium.adjacency` | required, even if empty | set | `06` |
| `$.world.seaMedium.adjacency[]` | member | record | `07` |
| `$.world.seaMedium.adjacency[].id` | required | text | `04` |
| `$.world.seaMedium.adjacency[].regionIds` | required, even if empty | set | `06` |
| `$.world.seaMedium.adjacency[].regionIds[]` | member | text | `04` |
| `$.world.seaMedium.closure` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws` | required, even if empty | set | `06` |
| `$.world.seaMedium.exchangeLaws[]` | member | record | `07` |
| `$.world.seaMedium.exchangeLaws[].amount` | required | exact | `10` / `11` / `12` / `13` |
| `$.world.seaMedium.exchangeLaws[].application` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].from` | required | variant on `kind`: `"region"`, `"world"` | `07` |
| `$.world.seaMedium.exchangeLaws[].from<region>.kind` | required | literal `"region"` | `04` |
| `$.world.seaMedium.exchangeLaws[].from<region>.regionId` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].from<world>.kind` | required | literal `"world"` | `04` |
| `$.world.seaMedium.exchangeLaws[].from<world>.worldId` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].guard` | required | record | `07` |
| `$.world.seaMedium.exchangeLaws[].guard.fieldParameters` | required, even if empty | set | `06` |
| `$.world.seaMedium.exchangeLaws[].guard.fieldParameters[]` | member | record, same schema as `$.execution.anchorIdentity[].fieldParameters[]` | `07` |
| `$.world.seaMedium.exchangeLaws[].guard.id` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].guard.query` | required | record, same schema as `$.execution.anchorIdentity[].query` | `07` |
| `$.world.seaMedium.exchangeLaws[].guard.regionParameters` | required, even if empty | set | `06` |
| `$.world.seaMedium.exchangeLaws[].guard.regionParameters[]` | member | record | `07` |
| `$.world.seaMedium.exchangeLaws[].guard.regionParameters[].parameterName` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].guard.regionParameters[].quantity` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].guard.regionParameters[].regionId` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].id` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].quantity` | required | text | `04` |
| `$.world.seaMedium.exchangeLaws[].to` | required | variant, same schema as `$.world.seaMedium.exchangeLaws[].from` | `07` |
| `$.world.seaMedium.id` | required | text | `04` |
| `$.world.seaMedium.placements` | required, even if empty | set | `06` |
| `$.world.seaMedium.placements[]` | member | record | `07` |
| `$.world.seaMedium.placements[].regionId` | required | text | `04` |
| `$.world.seaMedium.placements[].worldId` | required | text | `04` |
| `$.world.seaMedium.regions` | required, even if empty | set | `06` |
| `$.world.seaMedium.regions[]` | member | record | `07` |
| `$.world.seaMedium.regions[].id` | required | text | `04` |
| `$.world.seaMedium.regions[].negative` | required | exact | `10` / `11` / `12` / `13` |
| `$.world.seaMedium.regions[].positive` | required | exact | `10` / `11` / `12` / `13` |
| `$.world.worldWill` | required | record | `07` |
| `$.world.worldWill.hardConstraintFamilyIds` | required, even if empty | set | `06` |
| `$.world.worldWill.hardConstraintFamilyIds[]` | member | text | `04` |
| `$.world.worldWill.id` | required | text | `04` |
| `$.world.worldWill.interventions` | required, even if empty | set | `06` |
| `$.world.worldWill.interventions[]` | member | record | `07` |
| `$.world.worldWill.interventions[].anchorId` | required | text | `04` |
| `$.world.worldWill.interventions[].effects` | required, even if empty | set | `06` |
| `$.world.worldWill.interventions[].effects[]` | member | record, same schema as `$.world.internalLaws[].effects[]` | `07` |
| `$.world.worldWill.interventions[].id` | required | text | `04` |
| `$.world.worldWill.interventions[].kind` | required | text | `04` |
| `$.world.worldWill.interventions[].targetWorldId` | required | text | `04` |
| `$.world.worldWill.objectives` | required, even if empty | set | `06` |
| `$.world.worldWill.objectives[]` | member | record | `07` |
| `$.world.worldWill.objectives[].direction` | required | text | `04` |
| `$.world.worldWill.objectives[].fieldId` | required | text | `04` |
| `$.world.worldWill.objectives[].id` | required | text | `04` |
| `$.world.worldWill.objectives[].targetValue` | optional | exact | `10` / `11` / `12` / `13` |
| `$.world.worldWill.objectives[].targetWorldId` | required | text | `04` |
| `$.world.worldWill.objectives[].weight` | required | exact | `10` / `11` / `12` / `13` |
| `$.world.worlds` | required, even if empty | set | `06` |
| `$.world.worlds[]` | member | record | `07` |
| `$.world.worlds[].fields` | required, even if empty | set | `06` |
| `$.world.worlds[].fields[]` | member | record | `07` |
| `$.world.worlds[].fields[].familyId` | required | text | `04` |
| `$.world.worlds[].fields[].id` | required | text | `04` |
| `$.world.worlds[].fields[].role` | required | text | `04` |
| `$.world.worlds[].id` | required | text | `04` |
| `$.world.worlds[].initialExistence` | optional | text | `04` |
| `$.world.worlds[].protectedFieldIds` | required, even if empty | set | `06` |
| `$.world.worlds[].protectedFieldIds[]` | member | text | `04` |
| `$.world.worlds[].seaCoupling` | required | record | `07` |
| `$.world.worlds[].seaCoupling.negativeFieldId` | required | text | `04` |
| `$.world.worlds[].seaCoupling.positiveFieldId` | required | text | `04` |
| `$.world.worlds[].seaCoupling.viabilityFieldId` | required | text | `04` |

## core.causal-execution-options

Execution options, part of the input meaning ([causal-conformance.md](causal-conformance.md) section 1). An absent field means the oracle default; options with no field encode as `07 00`.

| Path | Presence | Schema | Node tag |
| --- | --- | --- | --- |
| `$` | root | record | `07` |
| `$.counterfactualInternalEventAblationLawIds` | optional, kept if empty | set | `06` |
| `$.counterfactualInternalEventAblationLawIds[]` | member | text | `04` |
| `$.cutAnchorIds` | optional, kept if empty | set | `06` |
| `$.cutAnchorIds[]` | member | text | `04` |
| `$.evaluationBudgetPerQuery` | optional | safe-integer | `03` |
| `$.fieldOverrideCauses` | optional, kept if empty | map (keys are data) | `08` |
| `$.fieldOverrideCauses{}` | value | set | `06` |
| `$.fieldOverrideCauses{}[]` | member | text | `04` |
| `$.fieldOverrides` | optional, kept if empty | map (keys are data) | `08` |
| `$.fieldOverrides{}` | value | exact | `10` / `11` / `12` / `13` |
| `$.maxInternalBranches` | optional | safe-integer | `03` |
| `$.maxInternalFrontiers` | optional | safe-integer | `03` |
| `$.maxInterventionCombinations` | optional | safe-integer | `03` |
| `$.seaRegionOverrideCauses` | optional, kept if empty | map (keys are data) | `08` |
| `$.seaRegionOverrideCauses{}` | value | set | `06` |
| `$.seaRegionOverrideCauses{}[]` | member | text | `04` |
| `$.seaRegionOverrides` | optional, kept if empty | map (keys are data) | `08` |
| `$.seaRegionOverrides{}` | value | record | `07` |
| `$.seaRegionOverrides{}.negative` | required | exact | `10` / `11` / `12` / `13` |
| `$.seaRegionOverrides{}.positive` | required | exact | `10` / `11` / `12` / `13` |
| `$.worldLifecycleOverrides` | optional, kept if empty | map (keys are data) | `08` |
| `$.worldLifecycleOverrides{}` | value | record | `07` |
| `$.worldLifecycleOverrides{}.lineageId` | optional | text | `04` |
| `$.worldLifecycleOverrides{}.parentWorldIds` | optional, kept if empty | set | `06` |
| `$.worldLifecycleOverrides{}.parentWorldIds[]` | member | text | `04` |
| `$.worldLifecycleOverrides{}.phase` | required | text | `04` |
| `$.worldLifecycleOverrides{}.retiredByEventId` | optional | text | `04` |
| `$.worldLifecycleOverrides{}.spawnedByEventId` | optional | text | `04` |
| `$.worldWillEnabled` | optional | bool | `01` / `02` |

## conformance.causal-outcome

The expected portable outcome `bubble-causal-outcome.v1` ([causal-conformance.md](causal-conformance.md) section 3).

| Path | Presence | Schema | Node tag |
| --- | --- | --- | --- |
| `$` | root | record | `07` |
| `$.autonomousContinuations` | required, even if empty | set | `06` |
| `$.autonomousContinuations[]` | member | record | `07` |
| `$.autonomousContinuations[].anchorIdentity` | optional, omitted if empty | set | `06` |
| `$.autonomousContinuations[].anchorIdentity[]` | member | record | `07` |
| `$.autonomousContinuations[].anchorIdentity[].anchorId` | required | text | `04` |
| `$.autonomousContinuations[].anchorIdentity[].predicateId` | required | text | `04` |
| `$.autonomousContinuations[].anchorIdentity[].status` | required | text | `04` |
| `$.autonomousContinuations[].anchorIdentity[].value` | optional | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferAssessments` | optional, omitted if empty | set | `06` |
| `$.autonomousContinuations[].anchorTransferAssessments[]` | member | record | `07` |
| `$.autonomousContinuations[].anchorTransferAssessments[].anchorId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferAssessments[].id` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferAssessments[].lawId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferAssessments[].sourceWorldId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferAssessments[].status` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferAssessments[].targetWorldId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferAssessments[].transferId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents` | optional, omitted if empty | set | `06` |
| `$.autonomousContinuations[].anchorTransferEvents[]` | member | record | `07` |
| `$.autonomousContinuations[].anchorTransferEvents[].anchorId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].composition` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].frontierId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].id` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].lawEventId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].lawId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].source` | required | record | `07` |
| `$.autonomousContinuations[].anchorTransferEvents[].source.fieldId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].source.portId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].source.value` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].source.worldId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].sourceNegativeSea` | required | record | `07` |
| `$.autonomousContinuations[].anchorTransferEvents[].sourceNegativeSea.after` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].sourceNegativeSea.before` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].sourceNegativeSea.fieldId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].sourceNegativeSea.frontierAfter` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].sourceNegativeSea.residue` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].target` | required | record | `07` |
| `$.autonomousContinuations[].anchorTransferEvents[].target.after` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].target.before` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].target.fieldId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].target.portId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].target.worldId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].targetPositiveSea` | required | record | `07` |
| `$.autonomousContinuations[].anchorTransferEvents[].targetPositiveSea.after` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].targetPositiveSea.before` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].targetPositiveSea.fieldId` | required | text | `04` |
| `$.autonomousContinuations[].anchorTransferEvents[].targetPositiveSea.frontierAfter` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].targetPositiveSea.placement` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].anchorTransferEvents[].transferId` | required | text | `04` |
| `$.autonomousContinuations[].branchLineage` | optional, omitted if empty | seq (item order is meaning) | `05` |
| `$.autonomousContinuations[].branchLineage[]` | item | record | `07` |
| `$.autonomousContinuations[].branchLineage[].derivation` | required | text | `04` |
| `$.autonomousContinuations[].branchLineage[].enabledLawIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].branchLineage[].enabledLawIds[]` | member | text | `04` |
| `$.autonomousContinuations[].branchLineage[].frontierIndex` | required | safe-integer | `03` |
| `$.autonomousContinuations[].branchLineage[].id` | required | text | `04` |
| `$.autonomousContinuations[].branchLineage[].nonrealizedLawIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].branchLineage[].nonrealizedLawIds[]` | member | text | `04` |
| `$.autonomousContinuations[].branchLineage[].realizedLawIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].branchLineage[].realizedLawIds[]` | member | text | `04` |
| `$.autonomousContinuations[].emergence` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].emergence[]` | member | record | `07` |
| `$.autonomousContinuations[].emergence[].causedByEventIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].emergence[].causedByEventIds[]` | member | text | `04` |
| `$.autonomousContinuations[].emergence[].criterionId` | required | text | `04` |
| `$.autonomousContinuations[].emergence[].status` | required | text | `04` |
| `$.autonomousContinuations[].emergence[].witnessFields` | required, even if empty | map (keys are data) | `08` |
| `$.autonomousContinuations[].emergence[].witnessFields{}` | value | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].emergence[].worldId` | required | text | `04` |
| `$.autonomousContinuations[].historyCommits` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].historyCommits[]` | member | record | `07` |
| `$.autonomousContinuations[].historyCommits[].affectedFields` | required, even if empty | map (keys are data) | `08` |
| `$.autonomousContinuations[].historyCommits[].affectedFields{}` | value | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].historyCommits[].causedByEventId` | required | text | `04` |
| `$.autonomousContinuations[].historyCommits[].eventId` | required | text | `04` |
| `$.autonomousContinuations[].historyCommits[].stateDigest` | required | text | `04` |
| `$.autonomousContinuations[].historyCommits[].worldId` | required | text | `04` |
| `$.autonomousContinuations[].id` | required | text | `04` |
| `$.autonomousContinuations[].internalEventAblations` | optional, omitted if empty | set | `06` |
| `$.autonomousContinuations[].internalEventAblations[]` | member | record | `07` |
| `$.autonomousContinuations[].internalEventAblations[].causes` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].internalEventAblations[].causes[]` | member | text | `04` |
| `$.autonomousContinuations[].internalEventAblations[].frontierIndex` | required | safe-integer | `03` |
| `$.autonomousContinuations[].internalEventAblations[].id` | required | text | `04` |
| `$.autonomousContinuations[].internalEventAblations[].kind` | required | text | `04` |
| `$.autonomousContinuations[].internalEventAblations[].lawId` | required | text | `04` |
| `$.autonomousContinuations[].internalEventAblations[].worldId` | required | text | `04` |
| `$.autonomousContinuations[].internalEventAblations[].wouldHaveEventId` | required | text | `04` |
| `$.autonomousContinuations[].interventionIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].interventionIds[]` | member | text | `04` |
| `$.autonomousContinuations[].ledger` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].ledger[]` | member | record | `07` |
| `$.autonomousContinuations[].ledger[].anchorId` | optional | text | `04` |
| `$.autonomousContinuations[].ledger[].causes` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].ledger[].causes[]` | member | text | `04` |
| `$.autonomousContinuations[].ledger[].effects` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].ledger[].effects[]` | member | record | `07` |
| `$.autonomousContinuations[].ledger[].effects[].after` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].ledger[].effects[].before` | optional | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].ledger[].effects[].fieldId` | required | text | `04` |
| `$.autonomousContinuations[].ledger[].effects[].layer` | required | text | `04` |
| `$.autonomousContinuations[].ledger[].effects[].operand` | optional | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].ledger[].effects[].operation` | required | text | `04` |
| `$.autonomousContinuations[].ledger[].effects[].regionId` | optional | text | `04` |
| `$.autonomousContinuations[].ledger[].effects[].worldId` | optional | text | `04` |
| `$.autonomousContinuations[].ledger[].eventId` | optional | text | `04` |
| `$.autonomousContinuations[].ledger[].interventionId` | optional | text | `04` |
| `$.autonomousContinuations[].ledger[].key` | required | text | `04` |
| `$.autonomousContinuations[].ledger[].kind` | required | text | `04` |
| `$.autonomousContinuations[].ledger[].lawId` | optional | text | `04` |
| `$.autonomousContinuations[].ledger[].lifecycleEventId` | optional | text | `04` |
| `$.autonomousContinuations[].ledger[].transferId` | optional | text | `04` |
| `$.autonomousContinuations[].ledger[].worldId` | required | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents` | optional, omitted if empty | set | `06` |
| `$.autonomousContinuations[].lifecycleEvents[]` | member | record | `07` |
| `$.autonomousContinuations[].lifecycleEvents[].afterPhase` | required | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].beforePhase` | required | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].causedByLawEventIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].lifecycleEvents[].causedByLawEventIds[]` | member | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].id` | required | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].kind` | required | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].lineageId` | optional | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].residue` | optional | record | `07` |
| `$.autonomousContinuations[].lifecycleEvents[].residue.finalStateDigest` | required | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].residue.localNegativeSea` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].lifecycleEvents[].residue.retainedHistoryCommitIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].lifecycleEvents[].residue.retainedHistoryCommitIds[]` | member | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].residue.seaRelease` | optional | record | `07` |
| `$.autonomousContinuations[].lifecycleEvents[].residue.seaRelease.negative` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].lifecycleEvents[].residue.seaRelease.positive` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].lifecycleEvents[].residue.seaRelease.regionId` | required | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].sourceWorldIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].lifecycleEvents[].sourceWorldIds[]` | member | text | `04` |
| `$.autonomousContinuations[].lifecycleEvents[].targetWorldId` | required | text | `04` |
| `$.autonomousContinuations[].order` | required | record | `07` |
| `$.autonomousContinuations[].order.causalEdges` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].order.causalEdges[]` | member | record | `07` |
| `$.autonomousContinuations[].order.causalEdges[].cause` | required | text | `04` |
| `$.autonomousContinuations[].order.causalEdges[].effect` | required | text | `04` |
| `$.autonomousContinuations[].order.createsHistoryArrow` | required | bool | `01` / `02` |
| `$.autonomousContinuations[].order.evaluationFrontiers` | required, even if empty | seq (item order is meaning) | `05` |
| `$.autonomousContinuations[].order.evaluationFrontiers[]` | item | set | `06` |
| `$.autonomousContinuations[].order.evaluationFrontiers[][]` | member | text | `04` |
| `$.autonomousContinuations[].order.historyArrowSources` | optional, omitted if empty | set | `06` |
| `$.autonomousContinuations[].order.historyArrowSources[]` | member | text | `04` |
| `$.autonomousContinuations[].order.irreversibleEventIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].order.irreversibleEventIds[]` | member | text | `04` |
| `$.autonomousContinuations[].order.reversibleEventIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].order.reversibleEventIds[]` | member | text | `04` |
| `$.autonomousContinuations[].realizedEventIds` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].realizedEventIds[]` | member | text | `04` |
| `$.autonomousContinuations[].score` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaExchangeEvents` | optional, omitted if empty | set | `06` |
| `$.autonomousContinuations[].seaExchangeEvents[]` | member | record | `07` |
| `$.autonomousContinuations[].seaExchangeEvents[].amount` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaExchangeEvents[].causes` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].seaExchangeEvents[].causes[]` | member | text | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].from` | required | variant on `kind`: `"region"`, `"world"` | `07` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<region>.after` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<region>.before` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<region>.kind` | required | literal `"region"` | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<region>.regionId` | required | text | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<world>.after` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<world>.before` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<world>.fieldId` | required | text | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<world>.kind` | required | literal `"world"` | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].from<world>.worldId` | required | text | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].id` | required | text | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].lawId` | required | text | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].quantity` | required | text | `04` |
| `$.autonomousContinuations[].seaExchangeEvents[].to` | required | variant, same schema as `$.autonomousContinuations[].seaExchangeEvents[].from` | `07` |
| `$.autonomousContinuations[].seaMedium` | optional | record | `07` |
| `$.autonomousContinuations[].seaMedium.balance` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].seaMedium.balance[]` | member | record | `07` |
| `$.autonomousContinuations[].seaMedium.balance[].balanced` | required | bool | `01` / `02` |
| `$.autonomousContinuations[].seaMedium.balance[].finalTotal` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaMedium.balance[].initialTotal` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaMedium.balance[].production` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaMedium.balance[].quantity` | required | text | `04` |
| `$.autonomousContinuations[].seaMedium.regions` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].seaMedium.regions[]` | member | record | `07` |
| `$.autonomousContinuations[].seaMedium.regions[].id` | required | text | `04` |
| `$.autonomousContinuations[].seaMedium.regions[].negative` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].seaMedium.regions[].positive` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].selection` | required | text | `04` |
| `$.autonomousContinuations[].worldStates` | required, even if empty | set | `06` |
| `$.autonomousContinuations[].worldStates[]` | member | record | `07` |
| `$.autonomousContinuations[].worldStates[].fields` | required, even if empty | map (keys are data) | `08` |
| `$.autonomousContinuations[].worldStates[].fields{}` | value | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].worldStates[].intrinsicViability` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].worldStates[].lifecycle` | optional | record | `07` |
| `$.autonomousContinuations[].worldStates[].lifecycle.lineageId` | optional | text | `04` |
| `$.autonomousContinuations[].worldStates[].lifecycle.parentWorldIds` | optional, omitted if empty | set | `06` |
| `$.autonomousContinuations[].worldStates[].lifecycle.parentWorldIds[]` | member | text | `04` |
| `$.autonomousContinuations[].worldStates[].lifecycle.phase` | required | text | `04` |
| `$.autonomousContinuations[].worldStates[].lifecycle.retiredByEventId` | optional | text | `04` |
| `$.autonomousContinuations[].worldStates[].lifecycle.spawnedByEventId` | optional | text | `04` |
| `$.autonomousContinuations[].worldStates[].seaContribution` | required | exact | `10` / `11` / `12` / `13` |
| `$.autonomousContinuations[].worldStates[].worldId` | required | text | `04` |
| `$.baselineScore` | optional | exact | `10` / `11` / `12` / `13` |
| `$.baselineScores` | optional, omitted if empty | set | `06` |
| `$.baselineScores[]` | member | record | `07` |
| `$.baselineScores[].continuationId` | required | text | `04` |
| `$.baselineScores[].score` | required | exact | `10` / `11` / `12` / `13` |
| `$.candidateAssessments` | required, even if empty | set | `06` |
| `$.candidateAssessments[]` | member | record | `07` |
| `$.candidateAssessments[].baselineContinuationId` | optional | text | `04` |
| `$.candidateAssessments[].cost` | optional | exact | `10` / `11` / `12` / `13` |
| `$.candidateAssessments[].id` | required | text | `04` |
| `$.candidateAssessments[].improvement` | optional | exact | `10` / `11` / `12` / `13` |
| `$.candidateAssessments[].interventionIds` | required, even if empty | set | `06` |
| `$.candidateAssessments[].interventionIds[]` | member | text | `04` |
| `$.candidateAssessments[].outcomes` | optional, omitted if empty | set | `06` |
| `$.candidateAssessments[].outcomes[]` | member | record | `07` |
| `$.candidateAssessments[].outcomes[].id` | required | text | `04` |
| `$.candidateAssessments[].outcomes[].improvement` | required | exact | `10` / `11` / `12` / `13` |
| `$.candidateAssessments[].outcomes[].score` | required | exact | `10` / `11` / `12` / `13` |
| `$.candidateAssessments[].score` | optional | exact | `10` / `11` / `12` / `13` |
| `$.candidateAssessments[].status` | required | text | `04` |
| `$.continuations` | required, even if empty | set | `06` |
| `$.continuations[]` | member | record, same schema as `$.autonomousContinuations[]` | `07` |
| `$.diagnosticCodes` | required, even if empty | set | `06` |
| `$.diagnosticCodes[]` | member | text | `04` |
| `$.initialSeaMedium` | optional, omitted if empty | set | `06` |
| `$.initialSeaMedium[]` | member | record, same schema as `$.autonomousContinuations[].seaMedium.regions[]` | `07` |
| `$.initialWorldStates` | required, even if empty | set | `06` |
| `$.initialWorldStates[]` | member | record, same schema as `$.autonomousContinuations[].worldStates[]` | `07` |
| `$.interventionEligibility` | required, even if empty | set | `06` |
| `$.interventionEligibility[]` | member | record | `07` |
| `$.interventionEligibility[].anchorId` | required | text | `04` |
| `$.interventionEligibility[].baselineContinuationId` | optional | text | `04` |
| `$.interventionEligibility[].interventionId` | required | text | `04` |
| `$.interventionEligibility[].status` | required | text | `04` |
| `$.mode` | required | literal `"bubble-causal-outcome.v1"` | `04` |
| `$.resourceVerdict` | required | record | `07` |
| `$.resourceVerdict.exhaustiveInternalBranching` | required | bool | `01` / `02` |
| `$.resourceVerdict.exhaustiveInterventionSearch` | required | bool | `01` / `02` |
| `$.selectedContinuationIds` | required, even if empty | set | `06` |
| `$.selectedContinuationIds[]` | member | text | `04` |
| `$.status` | required | text | `04` |
| `$.unresolvedAlternativeIds` | required, even if empty | set | `06` |
| `$.unresolvedAlternativeIds[]` | member | text | `04` |

## conformance.host-cost

The reference oracle's deterministic host-cost profile, informational ([causal-conformance.md](causal-conformance.md) section 5).

| Path | Presence | Schema | Node tag |
| --- | --- | --- | --- |
| `$` | root | record | `07` |
| `$.birBytesRead` | required | safe-integer | `03` |
| `$.birNodesDecoded` | required | safe-integer | `03` |
| `$.branchFrontierCandidates` | required | safe-integer | `03` |
| `$.bytesHashed` | required | safe-integer | `03` |
| `$.digestsComputed` | required | safe-integer | `03` |
| `$.exactRationalConstructions` | required | safe-integer | `03` |
| `$.intensionalQueries` | required | safe-integer | `03` |
| `$.lawApplications` | required | safe-integer | `03` |
| `$.materializedIntensionalCoordinates` | required | safe-integer | `03` |
| `$.maxRationalBits` | required | safe-integer | `03` |
| `$.predicateEvaluations` | required | safe-integer | `03` |
| `$.realizationCopies` | required | safe-integer | `03` |
| `$.valueCopies` | required | safe-integer | `03` |

## conformance.label

Fixture name and description.

| Path | Presence | Schema | Node tag |
| --- | --- | --- | --- |
| `$` | root | record | `07` |
| `$.description` | required | text | `04` |
| `$.name` | required | text | `04` |
