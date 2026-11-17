# Multiversal Sea Medium Reference

Applies to: `bubble-anchored-causal-program.v2` with `world.seaMedium`, bounded `v0.5.10`

Status: completed bounded `v0.5.10` surface; confirmed by author selection on 2026-11-17. The contract and its necessity gate are recorded in [v0.5.10-multiversal-sea-medium.md](../architecture/v0.5.10-multiversal-sea-medium.md).

Without a medium, a world's positive and negative seas are two scalar fields inside that world. With one, every world is placed in a shared, exact, conserved sea. Residue from a retired world enters that sea, and the medium's own laws move it between regions and worlds. A program without `world.seaMedium` runs exactly as before, and its run and portable outcome are unchanged.

## Program contract

`world.seaMedium` (`CausalSeaMedium` in [`causal.ts`](../../src/bubbles/world-kernel/causal.ts)) has these members:

| Member | Meaning |
| --- | --- |
| `id` | stable medium id. It cannot also name a world. |
| `closure` | `closed`: only the medium (exchanges and retirement releases) may change a world sea field. `open`: internal laws, World-Will interventions, and anchor-transfer residue or placement may also change one, and the balance records that as production. |
| `regions` | shared portions of the sea, each `{ id, negative, positive }` with exact non-negative rationals. |
| `placements` | `{ worldId, regionId }`. Every declared world, active or latent, is placed in exactly one region. |
| `adjacency` | `{ id, regionIds: [a, b] }`, an undirected nearness edge between two distinct regions. Each pair is declared once. |
| `exchangeLaws` | the medium's own laws: `{ id, quantity, from, to, amount, guard, application: "once-per-realization" }`. |

An exchange moves an exact positive `amount` of one `quantity` (`negative` or `positive`) from one endpoint to another. An endpoint is `{ kind: "region", regionId }`, or `{ kind: "world", worldId }`, which means that world's local sea field for the quantity (`seaCoupling.negativeFieldId` or `positiveFieldId`).

- A region-to-region exchange needs a declared adjacency.
- A world-to-region or region-to-world exchange needs the world to be placed in that region.
- A world-to-world exchange is refused, because worlds exchange content only through anchors.
- The guard is a boolean state predicate. Its `fieldParameters` may bind only fields of the exchange's endpoint worlds, and its `regionParameters` (`{ parameterName, regionId, quantity }`) may bind only quantities of its endpoint regions.
- Exchange ids are disjoint from internal-law ids.

A `seaMedium` value that is not an object with a string `id` and `closure` and array `regions`, `placements`, `adjacency`, and `exchangeLaws` is `CKW238`, and the run is `contradicted`. The kernel validator reports medium violations with `CKW2xx` codes, and the runtime with `CKR2xx` codes (for example `CKR200`: an exchange may not move an anchor transfer's identity field).

## Execution semantics

The medium joins the existing synchronous frontier closure and adds no clock.

- **Enablement.** An exchange is enabled at a frontier when it has not occurred yet in this realization, all its endpoint and guard worlds are active, its guard resolves true, and its source holds at least `amount`. The runtime adds the sufficiency condition itself and records it as evidence `…:medium:<id>:sufficiency`.
- **Simultaneity.** Enabled exchanges and enabled internal laws form one frontier. They read the frontier state, so simultaneous exchanges never see each other's effects.
- **Conflict.** Two exchanges that draw from the same source quantity (one region quantity, or one world sea field) conflict, because there is one draw per scarce source per frontier. An exchange also conflicts with any other entry that writes one of its world sea fields, including a retiring law, whose release writes both sea fields of its world. An exchange conflicts with an internal law that performs an anchor transfer when it changes a field that transfer's identity certificate reads: the changed fields are each world endpoint's exchanged sea field and its sea-coupled viability field, and the read fields are the field parameters of the transferred anchor's identity predicates. Conflicts follow `execution.internalConflictMode`. Under `underdetermined` (the default) the run is `underdetermined` and names the alternatives `medium:<id>`. Under `maximal-commuting-branches`, every maximal commuting frontier becomes its own branch. No host order chooses which exchange draws.
- **Effect and event.** The source loses exactly `amount` and the target gains exactly `amount`, and a changed world sea field recomputes that world's viability. The event id is `medium:<lawId>`. Its causes are the events that last changed every bound world field and region quantity, guard and endpoints alike. The trace entry has kind `sea-medium`. It belongs to the endpoint world, or to the medium id for a region-to-region exchange, and carries `sea-region` effects (`regionId`, with the quantity as `fieldId`).
- **Release on retirement.** When a world retires, its entire local negative and positive sea move into its placement region in the same lifecycle step, and its two sea fields become zero. The changed region quantities are then caused by that retirement event, together with any exchange of the same frontier that also changed them.
- **Balance.** Per quantity, `initialTotal` and `finalTotal` sum all regions and the sea fields of all worlds, latent and retired ones included. `production` is the net change of world sea fields caused by anything other than exchanges and releases. `balanced` holds when `finalTotal = initialTotal + production`. A closed medium has zero production.

Execution options `seaRegionOverrides` (`{ <regionId>: { negative, positive } }`) and `seaRegionOverrideCauses` (`{ "<regionId>#<quantity>": [causes] }`) replace initial region quantities, as `fieldOverrides` does for fields. Each cause key needs an override of its region. An override that names an unknown region or holds a negative or non-rational quantity contradicts the run, and so does a malformed or unmatched cause key.

## Run fields

Defined in [`causal-runtime.ts`](../../src/bubbles/world-kernel/causal-runtime.ts), and present only under a medium:

- `run.initialSeaMedium`: regions after overrides, in canonical region order;
- `continuation.seaMedium`: `regions` (final) and `balance` (one entry per quantity);
- `continuation.seaExchangeEvents`: `{ id, lawId, quantity, amount, from, to, causes, hostSelection: false }`, where each side records `before` and `after`;
- `lifecycleEvent.residue.seaRelease`: `{ regionId, negative, positive }`;
- inspection summary: `seaRegionCount`, `seaExchangeCount`, `seaReleaseCount`, `seaBalanced`.

The portable outcome projects the same positions ([causal-conformance.md](causal-conformance.md) section 3).

## Source statements

The strict causal Bubble profile ([causal-bubble-language.md](causal-bubble-language.md#multiversal-sea-medium-v0510-candidate)) lowers these statements to `world.seaMedium`:

```text
sea-medium <medium-id> closed|open
sea-region <region-id> negative <exact-rational> positive <exact-rational>
place <world-id> in <region-id>
adjacent <adjacency-id> <region-id> <region-id>
exchange <exchange-id> negative|positive <positive-rational> from region <region-id>|world <world-id> to region <region-id>|world <world-id>
exchange-when <exchange-id> <world-id>.<field-id> <comparison> <exact-literal>
exchange-when <exchange-id> region <region-id> negative|positive <comparison> <exact-rational>
```

`exchange-when` clauses of one exchange are conjoined. Under `closed`, the source refuses a law effect or inverse on a coupled sea field, and a transfer with non-zero residue or placement (`CBL036`). Source refusals use `CBL024` to `CBL036`.

## CLI

The causal run, inspection, and record commands accept a medium program as JSON, BIR, or causal Bubble source. Replay re-executes the stored record:

```text
tsx apps/hatchery/run-world.ts examples/residue-commons.causal.bubble --disable-world-will
npm run verify:sea-medium            # kernel, source, BIR, and example tests
npm run verify:sea-medium-example    # run, inspect, record, and replay into data/runs/residue-commons.*
```

## Canonical example: residue commons

[`examples/residue-commons.causal.bubble`](../../examples/residue-commons.causal.bubble) is one universe connected only through its seas, run with World Will disabled. The medium is closed, because no world law needs to write a sea field. The law effects touch only `condition`, `structure`, and `integrity`, so the medium is the only source and sink.

- Region `near` holds the active `elder` and its latent `heir`. Region `far`, adjacent to it, holds `exposed` (boundary `"open"`) and `sheltered` (boundary `"closed"`).
- `support-heir` moves positive 1 from `near` to the heir. `diffuse-residue` moves negative 1 from `near` to `far`, guarded by `near negative > 1`. `seep-exposed` and `seep-sheltered` each move negative 1 from `far` into their world, guarded by that world's `boundary = "open"`.

The run is `stable` with one autonomous continuation. Closure frontiers are numbered from 0, as `frontierIndex` counts them. A lifecycle step is its own entry of `order.evaluationFrontiers` but belongs to the closure frontier whose laws caused it.

| Closure frontier | Events |
| --- | --- |
| 0 | `law:germinate-heir`, then `spawn:heir:by:germinate-heir` |
| 1 | `law:retire-elder`, `medium:support-heir`, then `retire:elder:by:retire-elder` (releases negative 2 and positive 1 into `near`) |
| 2 | `medium:diffuse-residue`, `law:form-heir` |
| 3 | `medium:seep-exposed` (`seep-sheltered` is sufficient, but its guard is false) |
| 4 | `law:erode-exposed` (integrity 2 to 1) |

Its causal edges include `law:retire-elder -> retire:elder:by:retire-elder -> medium:diffuse-residue -> medium:seep-exposed -> law:erode-exposed`, and `spawn:heir:by:germinate-heir -> medium:support-heir -> law:form-heir`. The sheltered world keeps its initial state and appears in no edge. The balance is exact: negative 2 = 2 and positive 7 = 7, with zero production. The eroded world remains active with an unchanged protected boundary. Its viability falls from 3 to 2, and its anchor identity still resolves true.

Opening the sheltered boundary makes both seeps draw the one far residue unit in the same frontier. The default run is then `underdetermined`, with the unresolved alternatives `medium:seep-exposed` and `medium:seep-sheltered`. With `decision deterministic conflicts maximal-commuting-branches`, the run is `plural`, with one branch per draw, and only the exposed-draw branch erodes. [`tests/unit/sea-medium-example.test.ts`](../../tests/unit/sea-medium-example.test.ts) asserts all of this. The conformance corpus builder carries the example and both scarcity variants as `residue-commons`, `sea-scarcity-underdetermined`, and `sea-scarcity-branches`.

## Not claimed

The medium has no continuous flow, no repeated diffusion within one realization, no metric distance beyond adjacency, and no multi-channel medium in the causal kernel. It does not replace the scalar viability proxy. See the architecture record, section 5.
