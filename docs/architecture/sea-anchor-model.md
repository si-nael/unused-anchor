# Sea-Anchor Model

## Status

This document records a working ontology for the Bubble multiverse.

It is not a claim that the final system must literally implement every word here exactly as written.

It is a stabilization document for three concepts that now matter enough to guide later language, runtime, and research design:

- negative sea
- positive sea
- anchor point

The goal is to stop treating these as loose imagery and start treating them as an operational model.

## Core Structure

The current intended world structure is:

```text
negative sea
    -> shaking, loosening, erosion, outside residue

bubble universe
    -> independent world with its own laws, history, boundary, and anchor point

positive sea
    -> lineage, growth, placement, connection, stabilization
```

More precisely:

- a bubble universe is an independent world suspended between the negative sea and the positive sea
- the negative sea pushes worlds toward loosening, ambiguity, erosion, and boundary disturbance
- the positive sea gives worlds lineage, placement, continuity, and stable relation to other worlds
- the anchor point keeps one bubble universe identifiable as itself across disturbance, growth, observation, and replay

## Independent World Principle

A bubble universe is not the shadow or projection of one privileged original world.

Each bubble universe is its own world.

That means each world must be understood as having its own:

- laws
- history
- boundary
- anchor point
- relation to other worlds

This principle matters because otherwise Bubble collapses into a primary-world model with secondary copies.

That is not the intended ontology.

## Negative Sea

### Negative-Sea Definition

The negative sea is the outer sea that destabilizes a bubble universe.

`negative` does not mean evil.

It means directionally dissolving rather than fixing.

The negative sea is the side of the ontology that loosens form, blurs boundaries, and makes stable world identity harder to maintain.

It should not be treated as empty space.

It contains material that failed to become world, leaked out of a world, survived a collapsed world, or has not yet been fixed into durable record.

### Negative-Sea Contents

- possibilities not yet fixed into one world
- residue from collapsed worlds
- fragments of unrecorded events
- information leaking from other bubble universes
- traces pressing in from beyond a local boundary
- law fragments that no longer successfully hold a world together
- observed memories that were never secured by an anchor point

### Negative-Sea Operational Reading

The negative sea does not only destroy worlds.

It makes it harder for a world to remain unambiguously itself.

When negative-sea pressure grows, the system should expect effects such as:

- blurred or unstable boundaries
- records that no longer align cleanly
- ambiguity between internal events and outside residue
- reappearance of foreign traces inside local observation
- loss of confidence that a world's apparent history is fully internal
- eventual release of a world back into unresolved multiversal residue

### Negative-Sea Research Role

The negative sea is one of the main sources of instability in Bubble research.

It is also one of the main sources of interesting questions.

When an observer encounters an anomaly, the observer may need to distinguish among at least three possibilities:

- a genuine internal contradiction
- a trace imported from outside the world
- record instability caused by weak anchoring

That distinction should become a first-class research problem.

## Positive Sea

### Positive-Sea Definition

The positive sea is the outer sea that lets bubble universes take stable place, relation, and lineage as worlds.

`positive` does not mean morally good.

It means directionally structuring rather than dissolving.

If the negative sea loosens worlds, the positive sea gives them place, continuity, and relation.

### Positive-Sea Carried Structure

- world lineage
- nearness or distance among worlds
- world splitting and growth
- persistence potential
- placement within a larger field
- continuity of records
- history that can be replayed or rewound meaningfully

### Positive-Sea Operational Reading

The positive sea is not one single nail that fixes one world absolutely.

That is the role of the anchor point.

The positive sea provides the wider structure in which worlds can:

- belong to lineages
- inherit or diverge from nearby worlds
- keep durable relation to prior history
- stabilize enough to remain investigable
- occupy a meaningful place rather than drifting as disconnected fragments

### Positive-Sea Research Role

The positive sea is the source of structural worldhood.

Without it, worlds drift without stable genealogy, placement, or replayable continuity.

Bubble research therefore needs more than local world laws.

It also needs some account of how worlds take place inside a larger structured field.

## Anchor Point

### Anchor-Point Definition

An anchor point is the fixing point that keeps a bubble universe identifiable as itself.

The negative sea shakes a world.

The positive sea gives it place.

But neither alone is enough to answer the question: why is this still this world?

The anchor point is the answer to that identity question.

### Anchor-Point Held Structure

- what world this is
- which laws count as its basis
- which events belong to its committed history
- which observation records are trusted
- where its boundary currently holds
- where it sits relative to the positive sea
- how much outside residue may be admitted before identity failure
- whether a rewind returns to the same world rather than to a nearby impostor

The anchor point is therefore not just a location marker.

It is the world-identity fixpoint that binds laws, history, boundary, memory, and observation into one world.

### Strong Anchor Behavior

When the anchor point is strong, a world can remain itself even under disturbance.

Typical consequences:

- laws remain comparatively stable
- history records do not drift easily
- observation records retain higher trust
- boundary interpretation stays clearer
- outside residue is easier to separate from internal events
- replay and rewind are more likely to return to the same world identity
- contradictions are easier to localize and diagnose

These worlds are useful as calibration worlds for research.

### Weak Anchor Behavior

When the anchor point is weak, a world may no longer remain cleanly itself.

Typical consequences:

- laws appear to wobble
- records of the same event may diverge
- observers confuse external residue with internal events
- the world can lose place even if some local structure remains
- replay or rewind may fail to recover the same world identity

These worlds are risky operationally, but they are high-value research targets.

They are where the distinction between contradiction, leakage, and identity drift becomes hardest.

## Interaction Model

These concepts should not be treated as independent decorative lore.

They define one connected world condition.

- negative sea: force of loosening
- positive sea: force of structuring
- anchor point: world-identity fixpoint
- bubble universe: independent world sustained within that tension

Useful readings of the interaction:

- strong negative sea plus weak anchor point -> laws and records shake visibly
- weak positive-sea relation -> a world loses lineage, placement, and continuity
- strong anchor point under negative pressure -> the world still shakes, but the shaking can remain attributable and inspectable
- strong positive sea plus strong anchor point -> the world keeps genealogy and durable history well
- strong negative pressure plus strong anchor -> instability becomes observable without immediate identity collapse

That last case is especially important.

Bubble should not study only perfect worlds or only dissolved worlds.

It should study worlds that are stressed but still interpretable.

## Design Consequences For Bubble

These concepts are not yet surface-language keywords by default.

They are ontology first.

The implementation consequence is that later Bubble work should preserve room for at least these categories of semantics:

- negative-sea pressure, erosion, leakage, or residue
- positive-sea lineage, placement, growth, and stabilization
- anchor strength, trusted record, and identity-preserving rewind
- explicit distinction between internal contradiction and external trace intrusion

That does not mean the next step is to immediately add `negativeSea`, `positiveSea`, or `anchor` syntax.

The safer rule is:

- define the ontology first
- decide which parts belong in Bubble core and which belong in research-specific layers
- add IR and runtime support only when the semantic meaning is clear enough to inspect and replay
- add surface syntax only after the underlying contract is stable enough not to become decorative language inflation

## Initial Operationalization Targets

The first useful concrete consequences are likely these:

1. define benchmark worlds with explicit anchor strength and boundary pressure regimes
2. add evidence categories that can mark likely internal event, likely external residue, or unresolved source
3. introduce replay and inspection questions about identity stability under rewind or repeated observation
4. define world-lineage and world-placement data that can serve as early positive-sea structure

These should begin as research and runtime concepts before they become heavy syntax.

## Immediate Research Question

Under weak anchoring and finite observation, can an embedded observer distinguish:

- true contradiction
- negative-sea residue
- anchor-induced record drift

This is one of the strongest near-term questions created by the sea-anchor model.
