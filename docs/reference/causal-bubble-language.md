# Causal Bubble Language Profile

Status: completed bounded `v0.5.7` profile including the exact one-relation membrane baseline

Date: 2026-07-17

## Purpose

The `causal bubble` profile lowers authored `.bubble` source directly into `bubble-anchored-causal-program.v2`. It exists beside the earlier descriptive Bubble IR and does not reinterpret an old `effect spawn` or `effect collapse` declaration as an executed birth or death.

The first profile is deliberately strict. Every world declares exact fields, sea coupling, an anchor, and a World-Will objective. Every internal law declares a local exact guard and reversibility. Lifecycle transitions can be caused only by an irreversible internal law.

## Document shape

```bubble
causal bubble Name {
  decision deterministic
  world-will stable-id
  # typed declarations
}
```

The supported declarations are:

```text
world <world-id> active|latent
field <world-id>.<field-id> role <causal-field-role> = <exact-literal>
protect <world-id>.<field-id>
sea <world-id> positive <field-id> negative <field-id> viability <field-id> weights <positive-rational> <negative-rational>
anchor <anchor-id> world <world-id> port <port-id> identity true permit <intervention-kind,...>
anchor <anchor-id> between <source-world>.<source-port> and <target-world>.<target-port> identity true permit <intervention-kind,...>
transfer <transfer-id> anchor <anchor-id> from <source-world>.<source-port> field <source-field> to <target-world>.<target-port> field <target-condition-field> negative-residue <non-negative-rational> positive-placement <non-negative-rational>
objective <objective-id> world <world-id> field <field-id> direction maximize|minimize|stabilize weight <positive-rational> [target <rational>]
law <law-id> world <world-id> when <local-field-id> <comparison> <exact-literal> reversible|irreversible
law-effect <law-id> set|add|subtract <local-field-id> <exact-literal>
law-inverse <law-id> add|subtract <local-field-id> <exact-rational>
law-lifecycle <law-id> spawn <latent-world-id>
law-lifecycle <law-id> retire-self
law-transfer <law-id> <transfer-id>
law-commit <law-id> <local-field-id,...>
sea-medium <medium-id> closed|open
sea-region <region-id> negative <exact-rational> positive <exact-rational>
place <world-id> in <region-id>
adjacent <adjacency-id> <region-id> <region-id>
exchange <exchange-id> negative|positive <positive-rational> from region <region-id>|world <world-id> to region <region-id>|world <world-id>
exchange-when <exchange-id> <world-id>.<field-id> <comparison> <exact-literal>
exchange-when <exchange-id> region <region-id> negative|positive <comparison> <exact-rational>
```

Exact literals are normalized integers, rationals such as `3/5`, booleans, or JSON-quoted symbols. Sea weights, objective weights, additive inverse operands, residue, and placement are rational. Boolean and symbol guards support equality and inequality; order comparison is restricted to rationals. A reversible law must supply one opposite additive `law-inverse` for every effect and cannot commit history or carry lifecycle effects. The internal-law guard surface is one local field compared with one exact literal; only sea exchange guards (below) conjoin clauses. Internal-law conjunction, intensional authored families, interventions, general transport composition, and emergence criteria remain later typed extensions rather than opaque host callbacks.

## Semantic invariants

- The lowering target is the existing causal runtime; it does not implement a second lifecycle engine.
- Fields bound by an internal-law guard are always local to that law's world.
- A spawn target must be declared latent and cannot be the source world.
- Birth and retirement are irreversible and remain distinct from observation materialization and branch nonrealization.
- World Will has explicit objectives but cannot call lifecycle transitions.
- Anchors and objectives for latent worlds remain dormant until causal birth.
- Host execution order is not a universal Bubble clock.
- Compilation runs the same causal-program validator used by JSON programs.
- Bounded `v0.5.7` permits one exact transfer definition per program. Its source law is irreversible and transfer-only; it cannot hide local, lifecycle, or commit effects beside the crossing.
- Transfer endpoints belong to one two-world anchor, carry the same exact value kind, and must both be active. The target is an unprotected `world-condition`, never protected structure, a sea coordinate, or viability.
- A crossing copies one exact source snapshot, adds source negative-sea residue and target positive-sea placement, and passes pre/post anchor identity before any mutation becomes visible.
- The receiving world responds only through a later local law. Cut or inactive anchors block the crossing; an internally born endpoint contributes birth provenance before transfer.

## Multiversal sea medium (bounded `v0.5.10`)

The medium statements lower to `world.seaMedium` ([contract](../architecture/v0.5.10-multiversal-sea-medium.md)). A source with no medium statement lowers exactly as before, with no `seaMedium` and no extra families.

- `sea-medium` declares the one shared medium. `closed` makes the medium the only source and sink of world sea quantity. `open` lets other writes happen, and the balance records them as production. It may appear at most once, and every other medium statement requires it.
- `sea-region` declares a shared portion of the sea with exact non-negative `negative` and `positive` quantities.
- `place` puts a world in a region. Under a medium, every declared world, active or latent, needs exactly one placement.
- `adjacent` declares an undirected nearness edge between two distinct regions. Its id is explicit, and a region pair may be declared only once.
- `exchange` declares one law of the medium that moves an exact positive amount of one quantity from one endpoint to another. A `world` endpoint means that world's local sea field for the quantity, taken from its `sea` declaration. Region to region requires adjacency. World to region and region to world require the world to be placed in that region. World to world is refused, because worlds exchange content only through anchors.
- `exchange-when` adds one guard clause to an exchange. The field form uses the law-guard comparison rules: the literal kind must match the field, and only rationals may be ordered. It may read only a field of one of the exchange's endpoint worlds. The region form compares one quantity of one of the exchange's endpoint regions with an exact rational. Clauses of one exchange are conjoined, and an exchange without clauses is always guarded true.

Lowering is deterministic and keeps source order. Exchange `<id>` gets the boolean family `sea-guard-<id>` over the `coordinate` axis. Its clause `i`, counted in source order, is the parameter `value-<i>`, compared with the literal the same way a law guard compares `value`. Clauses are joined with `and`, and an exchange with no clauses gets a constant `true` body. The predicate `sea-predicate-<id>` queries that family at coordinate `0` with no literal parameters. Field clauses become `fieldParameters`, and region clauses become `regionParameters` with `regionId` and `quantity`. Every exchange has `application: "once-per-realization"`. Execution semantics (enablement, the sufficiency condition, conflicts, release on retirement, balance) belong to the kernel, not to the source profile.

| Code | Refusal |
| --- | --- |
| `CBL024` | `sea-medium` declared more than once |
| `CBL025` | medium statement without a `sea-medium` declaration (reported at the first medium statement) |
| `CBL026` | unknown sea region |
| `CBL027` | negative region quantity |
| `CBL028` | exchange amount that is not a positive rational |
| `CBL029` | world without a placement under a declared medium |
| `CBL030` | adjacency of a region with itself |
| `CBL031` | world-to-world exchange |
| `CBL032` | region-to-region exchange without a declared adjacency |
| `CBL033` | world/region exchange whose world is placed in another region |
| `CBL034` | exchange guard reading a world or region that is not an endpoint of that exchange |
| `CBL035` | `exchange-when` naming an unknown exchange |
| `CBL036` | under a `closed` medium, a `law-effect` or `law-inverse` targeting a world's coupled positive or negative sea field, or a `transfer` with non-zero residue or placement |

Existing codes keep their meaning for medium statements. `CBL016` reports a non-rational quantity, amount, or region-guard literal. `CBL018` reports a duplicate region, placement, adjacency id, adjacency region pair, or exchange. `CBL019` and `CBL020` report an unknown world or field. `CBL015` and `CBL021` report a guard kind mismatch or ordering on a non-rational value. After lowering, compilation still runs the kernel validator, which owns the `CKW2xx` medium checks.

## CLI

The causal run, inspection, and record commands accept either a JSON causal program or a source file beginning with `causal bubble`:

```text
tsx apps/hatchery/run-world.ts examples/generational-seed.causal.bubble
tsx apps/hatchery/inspect-world.ts examples/generational-seed.causal.bubble
tsx apps/hatchery/record-world.ts examples/generational-seed.causal.bubble
```

Stored replay embeds the lowered typed program and uses the existing exact re-execution boundary.

The canonical source-lowered lifecycle cycle is regenerated and replayed with:

```text
npm run verify:lifecycle-language-example
```

The active membrane candidate is exercised with World Will disabled by:

```text
npm run verify:membrane
npm run verify:membrane-example
```

## Current boundary

The released profile closes lifecycle lowering and one exact typed cross-world snapshot relation through bounded `v0.5.7`. The `v0.5.10` candidate adds a declarable shared sea medium of exact regions, adjacency, and once-per-realization exchange laws, but no continuous flow or metric distance. The profile is not general transport composition, the portable BIR, a binary encoding, a native engine, a general-purpose language, or dynamic schema generation. Those distinctions are preserved by Q-027/Q-028/Q-029 and the 5.x-to-6.x transition architecture.
