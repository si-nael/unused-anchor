# Boundary Log

## Purpose

This log records the first identifiable boundary and membrane failures inside the Bubble Language bubble itself.

The point is not to treat every compiler error as deep theory.

The point is to keep visible the classes of failure that show where Bubble's own membranes, compatibility rules, or self-descriptive limits need to harden.

## 2026-05-15

### B-001: Unknown grammar base profile

- Surface: `grammar <Name> = "profile <Child> extends <Base>"`
- Failure mode: the grammar artifact names a base profile that is neither built into Bubble nor declared locally
- Why it matters: profile extension without a valid base dissolves staged grammar compatibility into an ungrounded name reference
- Current handling: compiler error `BBL220`

### B-002: Explicit activation target mismatches declared grammar profile

- Surface: `activate grammar <Name> as <ProfileName>`
- Failure mode: the activation requests one profile name while the grammar artifact declares another
- Why it matters: staged activation becomes semantically ambiguous unless the requested and declared profile identities agree
- Current handling: compiler error `BBL221`

### B-003: Duplicate declared grammar profile identity

- Surface: multiple `grammar` declarations lower to the same declared profile name
- Failure mode: local grammar selection becomes ambiguous even if artifact names remain distinct
- Why it matters: Bubble needs profile identity to be stable and replayable, not only artifact labels to be unique
- Current handling: compiler error `BBL222`

### B-004: Local grammar profile-extension cycle

- Surface: locally declared grammar profiles extend one another in a closed loop
- Failure mode: no well-founded profile ancestry exists inside the local grammar graph
- Why it matters: a governing language bubble cannot explain or activate profile lineage if its own local profile graph is cyclic
- Current handling: compiler error `BBL223`

## Next Surfaces To Probe

- reflective scope overreach beyond the intended staged membrane
- activation-graph drift once multi-step or cross-file activation exists
- provenance loss between quoted artifacts, materialized descendants, and replay records
- hidden runtime escape hatches where semantics leave the explicit Bubble IR contract
