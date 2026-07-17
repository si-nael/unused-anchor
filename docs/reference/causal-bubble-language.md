# Causal Bubble Language Profile

Status: completed bounded `v0.5.6` lifecycle-lowering profile plus active unversioned membrane extension

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
```

Exact literals are normalized integers, rationals such as `3/5`, booleans, or JSON-quoted symbols. Sea weights, objective weights, additive inverse operands, residue, and placement are rational. Boolean and symbol guards support equality and inequality; order comparison is restricted to rationals. A reversible law must supply one opposite additive `law-inverse` for every effect and cannot commit history or carry lifecycle effects. The current guard surface is one local field compared with one exact literal; conjunction, intensional authored families, interventions, general transport composition, and emergence criteria remain later typed extensions rather than opaque host callbacks.

## Semantic invariants

- The lowering target is the existing causal runtime; it does not implement a second lifecycle engine.
- Fields bound by an internal-law guard are always local to that law's world.
- A spawn target must be declared latent and cannot be the source world.
- Birth and retirement are irreversible and remain distinct from observation materialization and branch nonrealization.
- World Will has explicit objectives but cannot call lifecycle transitions.
- Anchors and objectives for latent worlds remain dormant until causal birth.
- Host execution order is not a universal Bubble clock.
- Compilation runs the same causal-program validator used by JSON programs.
- The active unversioned membrane extension permits one exact transfer definition per program. Its source law is irreversible and transfer-only; it cannot hide local, lifecycle, or commit effects beside the crossing.
- Transfer endpoints belong to one two-world anchor, carry the same exact value kind, and must both be active. The target is an unprotected `world-condition`, never protected structure, a sea coordinate, or viability.
- A crossing copies one exact source snapshot, adds source negative-sea residue and target positive-sea placement, and passes pre/post anchor identity before any mutation becomes visible.
- The receiving world responds only through a later local law. Cut or inactive anchors block the crossing; an internally born endpoint contributes birth provenance before transfer.

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

The released profile closes one authored lifecycle-lowering seam. The unversioned extension adds only one exact typed cross-world snapshot relation; it is not general transport composition, a global sea, the portable BIR, a binary encoding, a native engine, a general-purpose language, or dynamic schema generation. Those distinctions are preserved by Q-027/Q-028/Q-029 and the 5.x-to-6.x transition architecture.
