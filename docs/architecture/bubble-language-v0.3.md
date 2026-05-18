# Bubble Language v0.3 Meta-Grammar Profile

## Purpose

This document defines the first explicit staged meta-grammar layer for Bubble Language.

`v0.3` extends the `v0.2` meta profile with grammar artifacts and grammar-activation requests.

The goal is not live parser mutation.

The goal is a staged, inspectable path toward grammar-generating grammar.

## Scope

The `v0.3` profile retains all `v0.2` requirements.

It adds these declarations inside a `bubble` body:

- `grammar <Name> = <grammar artifact source>`
- `activate grammar <Name> as <ProfileName>`

The current implementation keeps the surface syntax line-oriented.

Grammar artifacts no longer lower as opaque source strings.

They now lower into a first structured grammar-artifact IR shape.

The current structured artifact kind is:

- `profile <Name> extends <BaseProfile>`

Activation requests are also staged.

They declare intent to activate a grammar artifact later, but they do not modify the current parser while the same file is being compiled.

## Semantic Intent

`v0.3` introduces two new meta-grammar constructs.

- `grammar`: captures an inspectable grammar artifact
- `activate grammar`: records a staged request to activate a grammar artifact under an explicit profile boundary

This is the first explicit step toward language families inside Bubble.

The current profile is still conservative.

It lets bubbles define or stage grammar artifacts, but it does not let those artifacts rewrite the active parser same-stage.

## Lowering Contract

A `v0.3` compilation should answer at least these questions:

- which grammar artifacts were declared
- which structured grammar artifact shape each declaration produced
- which staged grammar activations were requested
- which profile name, if any, each activation requested
- which profile name each activation resolves to when no explicit target name is provided
- whether those activations referenced known local grammar artifacts

These declarations lower into `bubble.meta.grammars` and `bubble.meta.grammarActivations` in Bubble IR.

The runtime also exposes these declarations as staged grammar plans and staged grammar-activation plans inside inspection and replay reports.

If a source file contains any `grammar` or `activate grammar` declarations, the compiler emits:

- `version: "0.3.0"`
- `profile: "bubbles.v0.3"`

## Validation Rules

The current `v0.3` layer adds these checks:

1. grammar names share the meta namespace with quotes and generators and may not collide
2. every grammar activation must reference an existing local grammar artifact
3. every grammar artifact must parse into a supported structured grammar-artifact form
4. profile-extension grammars must extend either a built-in Bubble profile or another locally declared grammar profile until cross-file grammar imports exist
5. if an activation names a target profile explicitly, that profile must match the one declared by the grammar artifact

## Non-Goals

The current `v0.3` profile does not yet provide:

- same-stage parser mutation
- executable grammar activation during the same compile step
- cross-file grammar imports
- grammar artifact materialization in the runtime kernel
- automatic parser regeneration from grammar artifacts

The current runtime does provide:

- staged grammar activation planning
- staged grammar activation trace events
- default resolution from `activate grammar <Name>` to the grammar artifact's declared profile name
- inspection and replay queries by grammar activation id or grammar profile name

Those belong to later versions.

## Commands

- `npm run compile:grammar-example`
- `npm run inspect:grammar-example`
- `npm run verify`

## Example

```bubbles
bubble GrammarNursery {
  axiom coherence = stable
  will "grow language variants"
  seed grammar_seed
  effect spawn required
  grammar TwigSyntax = "profile twig.v0.3 extends bubbles.v0.2"
  activate grammar TwigSyntax as twig.v0.3
}
```
