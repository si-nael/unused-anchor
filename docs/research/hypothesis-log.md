# Hypothesis Log

## Active Hypotheses

### H-001: Contradiction-free artificial worlds are possible

Status: active

Claim:

Artificial worlds can remain contradiction-free if they use explicit operational semantics, controlled expressive power, and disciplined subsystem composition.

Would be weakened by:

- a minimal world class that still generates unavoidable contradictions under faithful execution
- evidence that practical richness always forces incompatible constraints even in tightly controlled languages

Next check:

Define a minimal world schema and state what consistency guarantee it is supposed to satisfy.

### H-002: Contradictions emerge first at composition boundaries

Status: active

Claim:

Most meaningful contradictions in rich artificial worlds will arise where local rule systems, narrative layers, or bubble-universe boundaries interact.

Would be weakened by:

- repeated examples of contradictions inside isolated single-rule worlds with no composition pressure

Next check:

Build examples that compare isolated worlds against composed or boundary-crossing worlds.

### H-003: Synthetic consistency training can improve anomaly detection

Status: active

Claim:

Agents trained to infer laws and detect contradiction in controlled artificial worlds will learn reusable strategies for identifying mismatch, anomaly, or incoherence in external domains.

Would be weakened by:

- failure to transfer beyond the exact synthetic training distribution
- agents learning only shallow world-specific cues instead of general inspection strategies

Next check:

Define evaluation tasks that require transfer outside the original world family.

### H-004: Apparent inexpressibility can often be lifted into higher-order representation

Status: active

Claim:

Many world structures that seem inexpressible at one layer can be represented at a richer layer as generators, constraint systems, placeholders, quoted laws, or partially specified semantic objects without collapsing the project into unrestricted host-language programming.

Would be weakened by:

- higher-order constructs that cannot be lowered into explicit inspectable IR
- repeated need for opaque escape hatches to express basic target worlds
- evidence that useful higher-order constructs destroy replayability or validation

Next check:

Define a minimal set of IR nodes for unknowns, constraints, generator schemas, and quoted law fragments.

### H-005: Explicit effect typing can preserve inspectability under nondeterminism

Status: active

Claim:

World definitions can remain replayable and inspectable even when the language includes semantic nondeterminism, provided every branch and side effect is represented explicitly in the IR and execution trace.

Would be weakened by:

- ordinary authored worlds requiring hidden runtime effects outside the declared effect system
- effect traces growing too ambiguous to explain which law caused which consequence
- explicit branching proving too costly to replay or inspect in practice

Next check:

Define a minimal effect vocabulary and show how a nondeterministic world fragment lowers into explicit IR plus an effect trace.

### H-006: Bubble can justify itself only through unique semantic leverage

Status: active

Claim:

Bubble Language will be worth keeping only if it can represent and preserve bubble-generative semantics, replay structure, contradiction surfaces, and higher-order language artifacts more coherently than a host-language embedding plus ad hoc tooling.

Would be weakened by:

- representative target problems turning out to be equally clear in a host language with a thin configuration layer
- Bubble features repeatedly lowering to little more than reorganized syntax over ordinary implementation machinery
- the language needing opaque escape hatches for the very semantics it claims to make first-class

Next check:

Choose one target task involving world generation, inspection, replay, or grammar staging and compare the Bubble path against a realistic host-language alternative.

### H-007: The Bubble Language bubble has its own contradiction surface that can be studied directly

Status: active

Claim:

The language stack itself has identifiable membranes, invariants, and failure modes, and studying those boundaries will produce useful research insight rather than only implementation cleanup.

Would be weakened by:

- the language stack proving to have no meaningful internal contradiction classes beyond ordinary software bugs
- reflexive language features providing no analyzable structure beyond convenience

Next check:

Extend the current contradiction catalog beyond grammar-profile compatibility into reflective scope, activation-graph, provenance, and runtime-escape-hatch failures.
