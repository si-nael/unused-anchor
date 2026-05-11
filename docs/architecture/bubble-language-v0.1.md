# Bubble Language v0.1 Profile

## Purpose

This document defines what the current implementation must satisfy to be considered a real `v0.1` language kernel rather than a rough bootstrap.

## Scope

The `v0.1` profile is intentionally narrow.

It supports:

- one `bubble` declaration per source file
- `axiom` declarations
- one optional `will` declaration
- one optional `seed` declaration
- one optional `observe` declaration
- explicit `effect` declarations with typed requirement and scope

The goal of the profile is not broad expressiveness. It is a clean end-to-end contract:

source -> AST -> Bubble IR -> validation diagnostics -> persisted JSON IR

## v0.1 Semantic Requirements

Under the current profile, a valid bubble world should satisfy these constraints:

1. it declares at least one axiom
2. it declares a world will
3. it declares a seed
4. it declares at least one effect
5. each effect kind is declared at most once
6. if it declares `observe`, it also declares an `observe` effect
7. if it declares `observe`, it also declares a required `commit` effect

The compiler may also emit warnings when the world is technically valid but semantically weak, such as when every effect is optional.

## Why These Constraints Exist

- axioms make the world more than a label
- world will makes the project's core ontology explicit
- seed preserves reproducibility
- effect declarations expose semantic cost instead of hiding it in runtime behavior
- observe plus commit ties observation to durable history

## Compiler Surface

The current implementation exposes:

- parser: `parseBubbleSource`
- lowerer: `lowerBubbleDocument`
- validator: `validateBubbleCompilation`
- compiler entry: `compileBubbleSource`
- CLI: `apps/hatchery/compile-bubble.ts`

## Validation Commands

- `npm run check`
- `npm test`
- `npm run validate:example`
- `npm run compile:example`
- `npm run verify`

## Non-Goals For v0.1

This profile does not yet support:

- multiple bubbles per file
- nested blocks or expression grammars
- `unknown`, `constraint`, `generator`, `quote`, or `reflect`
- cross-file imports
- effect execution in a runtime kernel

Those belong to later versions.

## Standard

`v0.1` should be small, but it should not be vague.

If a source file compiles successfully, the project should be able to answer:

- what world was authored
- what effects were declared
- what obligations were introduced
- why the compiler accepted it
