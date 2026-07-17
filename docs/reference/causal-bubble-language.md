# Causal Bubble Language Profile

Status: completed bounded `v0.5.6` lifecycle-lowering profile

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
objective <objective-id> world <world-id> field <field-id> direction maximize|minimize|stabilize weight <positive-rational> [target <rational>]
law <law-id> world <world-id> when <local-field-id> <comparison> <exact-literal> reversible|irreversible
law-effect <law-id> set|add|subtract <local-field-id> <exact-literal>
law-inverse <law-id> add|subtract <local-field-id> <exact-rational>
law-lifecycle <law-id> spawn <latent-world-id>
law-lifecycle <law-id> retire-self
law-commit <law-id> <local-field-id,...>
```

Exact literals are normalized integers, rationals such as `3/5`, booleans, or JSON-quoted symbols. Sea weights, objective weights, and additive inverse operands are rational. Boolean and symbol guards support equality and inequality; order comparison is restricted to rationals. A reversible law must supply one opposite additive `law-inverse` for every effect and cannot commit history or carry lifecycle effects. The current guard surface is one local field compared with one exact literal; conjunction, intensional authored families, interventions, cross-world transfer, and emergence criteria remain later typed extensions rather than opaque host callbacks.

## Semantic invariants

- The lowering target is the existing causal runtime; it does not implement a second lifecycle engine.
- Fields bound by an internal-law guard are always local to that law's world.
- A spawn target must be declared latent and cannot be the source world.
- Birth and retirement are irreversible and remain distinct from observation materialization and branch nonrealization.
- World Will has explicit objectives but cannot call lifecycle transitions.
- Anchors and objectives for latent worlds remain dormant until causal birth.
- Host execution order is not a universal Bubble clock.
- Compilation runs the same causal-program validator used by JSON programs.

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

## Current boundary

This profile closes one authored lifecycle-lowering seam. It is not yet the portable BIR, a binary encoding, a native engine, a general-purpose language, dynamic schema generation, or typed cross-world transport. Those distinctions are preserved by Q-027/Q-028 and the 5.x-to-6.x transition architecture.
