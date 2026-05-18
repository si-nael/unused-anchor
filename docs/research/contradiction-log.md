# Contradiction Log

## Purpose

This log records the first identifiable contradiction surfaces inside the Bubble Language bubble itself.

The point is not to treat every compiler error as research.

The point is to identify classes of language-level incoherence that reveal where Bubble's own membranes, compatibility rules, or self-descriptive limits need to harden.

## 2026-05-15

### C-001: Unknown grammar base profile

- Surface: `grammar <Name> = "profile <Child> extends <Base>"`
- Failure mode: the grammar artifact names a base profile that is neither built into Bubble nor declared locally
- Why it matters: profile extension without a valid base dissolves staged grammar compatibility into an ungrounded name reference
- Current handling: compiler error `BBL220`

### C-002: Explicit activation target mismatches declared grammar profile

- Surface: `activate grammar <Name> as <ProfileName>`
- Failure mode: the activation requests one profile name while the grammar artifact declares another
- Why it matters: staged activation becomes semantically ambiguous unless the requested and declared profile identities agree
- Current handling: compiler error `BBL221`

### C-003: Duplicate declared grammar profile identity

- Surface: multiple `grammar` declarations lower to the same declared profile name
- Failure mode: local grammar selection becomes ambiguous even if artifact names remain distinct
- Why it matters: Bubble needs profile identity to be stable and replayable, not only artifact labels to be unique
- Current handling: compiler error `BBL222`

### C-004: Local grammar profile-extension cycle

- Surface: locally declared grammar profiles extend one another in a closed loop
- Failure mode: no well-founded profile ancestry exists inside the local grammar graph
- Why it matters: a governing language bubble cannot explain or activate profile lineage if its own local profile graph is cyclic
- Current handling: compiler error `BBL223`

## Next Surfaces To Probe

- reflective scope contradictions that expose more than the current staged membrane intends
- activation-graph contradictions once multi-step or cross-file activation exists
- provenance loss between quoted artifacts, materialized descendants, and replay records
- hidden runtime escape hatches where semantics leave the explicit Bubble IR contract
