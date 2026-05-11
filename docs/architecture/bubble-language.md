# Bubble Language Strategy

## Position

Yes, a dedicated language is a strong direction for this project.

But the right first move is not a full general-purpose programming language.

The right first move is a constrained world-definition DSL that can later evolve into a richer language stack.

## Ambition

The ambitious version of the project is not merely to define worlds.

It is to build a language that can talk about structures that are inexpressible in a lower descriptive layer.

That goal needs careful wording.

The language will not literally capture every absolutely inexpressible or uncomputable object.

Instead, it should raise the representability frontier by making the following first-class:

- partial specifications
- latent or unknown entities
- constraint-defined objects
- generators of world families
- quotations of laws or rule fragments as manipulable objects
- reflective statements about worlds, models, or other laws

This is the useful technical reading of a language for "making the unimaginable."

## Why A Language Helps

If worlds are defined directly in a host language, several things become harder:

- static validation of consistency-related structure
- replay and deterministic regeneration
- comparison between authored law and executed behavior
- inspection tooling for contradictions and anomalies
- cross-world transformations and normalization

A dedicated language makes the world definition itself a first-class research object.

## Recommended Three-Layer Model

### 1. Surface DSL

Human-authored source for defining bubble universes.

It should express concepts such as:

- axiom declarations
- world will declarations
- seed generators
- membranes and boundary policies
- observation interfaces
- anomaly or exception policies
- lifecycle rules for birth, persistence, and collapse

### 2. Bubble IR

A normalized intermediate representation used by validators, inspectors, compilers, and runtime services.

This layer should:

- erase surface syntax variation
- expose explicit dependency graphs
- support static analyses
- make serialization and replay straightforward
- preserve unknowns and obligations explicitly instead of pretending everything is already resolved

### 3. Execution Kernel

The runtime semantics that execute or materialize the world.

This layer should own:

- event stepping
- causal scheduling
- persistence hooks
- observation commits
- state evolution under world laws

## Nondeterminism Position

Yes, the language can be nondeterministic.

But it should be nondeterministic in a disciplined way.

Bad version:

- hidden randomness
- arbitrary ambient mutation
- host-language side effects that escape inspection

Good version:

- explicit choice points
- explicit branch identity
- explicit effect declarations
- replayable or inspectable branch realization
- durable traces of what was committed and why

This means nondeterminism belongs in the semantics, not in incidental implementation noise.

## Effect Discipline

The language should treat world generation as producing at least two things:

- a world contribution
- an effect contribution

Possible first-class effect kinds include:

- `branch`: a new possibility or fork was created
- `spawn`: a bubble universe or region was brought into existence
- `collapse`: a branch or world was retired or resolved
- `commit`: an observation or event became stable history
- `leak`: information or causal influence crossed a membrane
- `debt`: a future obligation or unresolved consistency burden was created
- `perturb`: a law, parameter, or local regime was intentionally disturbed
- `observe`: an agent interaction forced resolution or recording

These effects should be typed, declared, and lowered into explicit IR nodes.

## Side Effects As Meaning

One interesting design direction is that some worlds cannot be generated innocently.

To ask for a certain kind of world may necessarily imply consequences:

- extra branches must exist
- hidden boundaries must accumulate pressure
- observations must collapse latent possibilities
- consistency debt must be paid later

In that sense, side effects are not bugs. They are part of the ontology of world creation.

But they still have to be declared. Otherwise the language stops being a research instrument and becomes a magic trick.

## Initial Non-Goals

Do not start with:

- unrestricted user-defined general recursion everywhere
- arbitrary host-language escape hatches
- opaque side effects in core world definitions
- a large standard library that hides semantics

Those features increase expressiveness, but they directly damage inspectability.

## Higher-Order Requirements

To move beyond ordinary configuration syntax, the language should eventually support constructs such as:

- `unknown`: a deliberate semantic placeholder, not a parse-time omission
- `constraint`: a relation that narrows possible worlds without fully materializing one
- `generator`: a compact description of a family of possible worlds or regions
- `quote`: a law fragment treated as data that can be inspected or transformed
- `reflect`: a controlled ability to express statements about models, observers, or other laws

These should still lower into explicit IR nodes.

The same rule applies to nondeterministic and effectful constructs.

## Design Goal

The language should be powerful enough to define rich worlds, but narrow enough that the project can still ask:

- what laws were authored
- what laws were compiled
- what laws were actually executed
- where contradictions or mismatches entered

And, in richer cases:

- which parts of the world were left intentionally open
- which constraints fixed those open parts later
- which law fragments remained quoted, hypothetical, or observer-relative

## Suggested Folder Shape

Inside `src/bubbles/`, reserve space for:

- `language/`: parser, AST, syntax definitions, author-facing tooling
- `ir/`: normalized schemas, lowering targets, validators, dependency graphs
- `axioms/`: semantic primitives used by the IR and runtime
- `effects/`: effect vocabularies, effect typing, branch identities, and lowering rules

## Naming

If you want the language itself to feel native to the project, `Bubbles` is a plausible working name for the surface DSL family.

That said, the important distinction is architectural, not cosmetic:

- surface language for authors
- IR for machines and tools
- runtime semantics for execution

## Recommendation

Make the language, but keep the bar high.

If it does not improve validation, inspection, and semantic clarity, it is just another syntax layer and not worth maintaining.

The standard is higher than "can it express more things."

The standard is "can it express higher-order things without losing the ability to know what was meant, what was executed, and what remains unresolved."

The same applies to nondeterminism: if the language cannot say which side effects were intended, it is not powerful, only vague.

Surprise is only valuable here when it remains semantically attributable.
