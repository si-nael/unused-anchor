# Boundary Log

## Purpose

This log records the first identifiable boundary and membrane failures inside the Bubble Language bubble itself.

The point is not to treat every compiler error as deep theory.

The point is to keep visible the classes of failure that show where Bubble's own membranes, compatibility rules, or self-descriptive limits need to harden.

## 2026-07-15

### B-005: Canonical README encoding escaped the ordinary text-edit boundary

Observed surface:

The repository README had become UTF-16 while the surrounding TypeScript and Markdown toolchain expected ordinary UTF-8 text. Normal line-oriented patching and inspection therefore treated a canonical public document as binary or failed to match its content reliably.

Boundary meaning:

This was a language-bubble tooling boundary failure: the semantic content still existed, but its encoding prevented the repository's normal inspection and editing surfaces from preserving that content transparently.

Current handling:

The README was normalized back to UTF-8 during `v0.4.8`. Canonical source and documentation files should remain UTF-8, and an encoding anomaly must be logged rather than handled as an invisible editor inconvenience.

Next check:

Keep README and canonical Markdown readable by the same text-oriented verification and patch surfaces used for the rest of the repository.

### B-006: PowerShell command discovery selected a policy-blocked npm wrapper

Observed surface:

Running `npm run verify:records` or `npm run check` from PowerShell selected `npm.ps1`, which the local execution policy refused to load even though the installed Node and npm runtime were otherwise usable.

Boundary meaning:

The repository verification path crossed an operating-shell membrane whose wrapper policy was stricter than the underlying executable. Treating that failure as a test failure would confuse host tooling access with Bubble correctness.

Current handling:

Use `npm.cmd` for repository commands in this Windows PowerShell environment. The same record verification and TypeScript check passed through that executable.

Next check:

Keep user-facing Windows launch instructions explicit when a `.ps1` wrapper may be blocked, while preserving ordinary `npm` commands for shells where command discovery is not policy-constrained.

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
