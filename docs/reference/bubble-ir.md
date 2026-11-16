# Bubble Intermediate Representation (BIR) v1 Reference

Recorded: 2026-11-16

Status: completed bounded `v0.5.9` Gate C surface; confirmed by author selection on 2026-11-16

BIR is the first machine-independent execution authority for Bubble. Version 1 covers one semantic section, `core.causal-program`, which denotes an `ExecutableAnchoredCausalProgram` (`bubble-anchored-causal-program.v2`). Every bounded world path in the repository executes through that program form: causal JSON worlds, persistent and teleonomic programs, strict `causal bubble` source, and endogenous connected universes after compilation.

This document is normative. A second implementation conforms when it produces and accepts exactly the bytes described here and, after lifting, reproduces the TypeScript reference oracle's execution (Gate D defines the execution fixture corpus).

## 1. Identity layers

BIR keeps three identities separate.

| Identity | Definition | Changes when |
| --- | --- | --- |
| Semantic graph identity | SHA-256 over the domain string `bubble-bir-semantic-identity.v1\0`, the critical-section count (unsigned LEB128), and for each critical section in raw-name-byte order its length-prefixed name text, payload length (unsigned LEB128), and payload | the program's meaning changes |
| Canonical storage identity | SHA-256 over every byte of the envelope, including non-critical sections and the trailer | any stored byte changes, including provenance or annotations |
| Backend program identity | the reference oracle's `programDigest`: SHA-256 of the host object's stable JSON serialization | the host object's array order or layout changes, even with the same meaning |

Two programs that differ only in the order of an unordered collection have the same semantic identity and the same bytes, but may have different backend program identities. A lifted program is canonical: encoding it again yields identical bytes.

## 2. Canonical string order

Wherever BIR or a Bubble kernel orders strings, the order is lexicographic by Unicode scalar value (code point), which equals bytewise order of UTF-8 encodings. It is not host locale collation (`localeCompare`, ICU) and not UTF-16 code-unit order. For example `"B" < "a"`, `"a-b" < "a_b"`, `"trace:10:x" < "trace:1:x"`, and `"￿" < "\u{1F600}"`. The TypeScript kernels implement this order in `src/bubbles/world-kernel/canonical-order.ts`.

## 3. Primitive encodings

- **Unsigned integer (`uvar`)**: unsigned LEB128. The encoding must be minimal: a multi-byte encoding may not end with a `0x00` byte.
- **Signed integer**: zigzag mapping (`n >= 0 -> 2n`, `n < 0 -> -2n - 1`) followed by `uvar`. Integers have arbitrary precision.
- **Text**: `uvar` byte length followed by well-formed UTF-8. Unpaired surrogates cannot be encoded; malformed UTF-8 is rejected; a leading BOM is ordinary content.

## 4. Node encoding

Every node starts with one tag byte.

| Tag | Node | Body |
| --- | --- | --- |
| `0x01` / `0x02` | structural boolean false / true | none |
| `0x03` | integer | signed integer |
| `0x04` | string | text |
| `0x05` | sequence | `uvar` count, then items in semantic order |
| `0x06` | set | `uvar` count, then members in strictly increasing bytewise order of their full encodings |
| `0x07` | record | `uvar` count, then (key text, node) pairs with keys strictly increasing in canonical string order |
| `0x08` | map | same layout as a record; keys are data rather than schema field names |
| `0x10` | exact rational | signed numerator, unsigned denominator; denominator > 0, gcd = 1, zero is `0/1` |
| `0x11` / `0x12` | exact boolean false / true | none |
| `0x13` | exact symbol | text |

A set cannot contain two members with identical encodings, and a record or map cannot repeat a key. Encoders and decoders reject nesting deeper than 1024 nodes; the bound is normative and chosen so that every accepted document can be lifted, validated, and evaluated by the reference oracle. A decoder also rejects unknown tags, non-canonical bodies, and trailing bytes after the root node. Structural booleans (for example `universalClock`) and exact booleans (world values) are distinct node kinds.

## 5. Envelope

```
magic        "BUBBLEIR" (8 bytes: 42 55 42 42 4C 45 49 52)
major        uvar  (1)
minor        uvar  (0)
count        uvar
section*     name text | flags uvar | length uvar | payload bytes
trailer      32-byte SHA-256 of every preceding byte
```

Section names match `[a-z][a-z0-9]*([.-][a-z0-9]+)*` and appear in strictly increasing bytewise order of their raw UTF-8 name bytes (not of the length-prefixed text encoding), without duplicates. A section named `core.*` must be critical; a non-critical `core.*` section is rejected (`BIR029`). Flag bit 0 marks a **critical** section; every other flag bit must be zero. A decoder rejects a different major version, a trailer mismatch, misordered or duplicate sections, undefined flags, and bytes between the last section and the trailer.

- A critical section carries meaning. A reader that does not understand a critical section preserves it but must not execute the document.
- A non-critical section (provenance, annotations, tooling data) never affects meaning or execution. It is excluded from semantic identity, included in storage identity, and preserved byte for byte on re-encoding.
- `core.causal-program` and `core.causal-execution-options` are the critical sections BIR v1 understands. When a document carries execution options, they are part of its meaning: `realizeAnchoredCausalWorldFromBir` and the causal CLIs run with them and refuse additional caller options (`BIRL22`). An extension may not reuse a core name.

## 6. `core.causal-program` schema

The payload is one record node lowered from the causal program by a schema. Lowering is strict:

- a host field outside the schema is rejected (`BIRL01`) rather than dropped;
- an exact value must already be canonical (`BIRL06`): reduced rational with decimal strings `0` or `-?[1-9][0-9]*` and a positive denominator;
- decimal integer strings (finite axis sizes, query coordinates) must be canonical, and `-0` is rejected (`BIRL05`);
- a duplicate set member is rejected at encoding (`BIR005`);
- the source program must pass the reference validator before encoding (`BIRL20`).

Vocabulary strings such as field roles, intervention kinds, operators, value kinds, decision modes, and reversibility are encoded as text, so an open research vocabulary is not frozen into byte tags. Optional host fields are preserved as present or absent exactly; BIR v1 does not identify an omitted field with an explicitly stated default.

Collection classification:

| Position | Kind | Basis |
| --- | --- | --- |
| families, family parameters, worlds, fields, protected fields, anchors, anchor endpoints, identity families, permitted intervention kinds, anchor transfers, objectives, hard-constraint families, interventions and their effects, internal laws and their effects, lifecycle effects, transfer references, inverse effects, committed fields, emergence criteria and witness fields, predicate field parameters, field initializers, sea laws, hard constraints, anchor-identity predicates, intervention costs | set | identity or field keyed; the reference oracle is invariant under every permutation (regression-tested on all canonical fixtures, and with two-member programs at positions the fixtures leave with at most one member) |
| intensional domain axes | sequence | no evidence yet that axis position is free; reordering axes changes semantic identity |
| query coordinates and parameters, family-coordinate `at` and `parameters` | map | keyed by axis or parameter name |
| term operands (`left`/`right`, `if` branches) | record fields | fixed by the term grammar |

Discriminated host unions (terms, axes, anchor endpoints, lifecycle effects) are records whose `kind` field is a string.

## 7. API and CLI

- `encodeCausalProgramBir(program, { extensions })` returns bytes plus semantic, storage, and source backend identities.
- `decodeBir(bytes)` returns the envelope, identities, executability, unknown critical sections, and preserved extensions.
- `liftCausalProgramFromBir(document)` returns `lifted` (with the document’s own execution options when it carries them), `not-executable`, or `contradicted`, revalidating the lifted program.
- `realizeAnchoredCausalWorldFromBir(bytes, options)` decodes, lifts, and executes on the reference oracle.
- `reencodeBir(document)` re-encodes every section byte for byte.

```bash
npx tsx apps/hatchery/encode-bir.ts examples/connected-fields.causal.bubble data/bir/connected-fields.bir
npx tsx apps/hatchery/inspect-bir.ts data/bir/connected-fields.bir data/bir/connected-fields.inspect.json
npx tsx apps/hatchery/run-world.ts data/bir/connected-fields.bir data/runs/connected-fields.bir.run.json --disable-world-will
npx tsx apps/hatchery/check-bir-equivalence.ts data/runs/connected-fields.run.json data/runs/connected-fields.bir.run.json
```

`run-world`, `inspect-world`, and `record-world` accept a `.bir` document wherever they accept a causal JSON or `causal bubble` program; a document with its own execution options runs with them, and explicit execution flags are then refused. `encode-bir` re-encodes an existing `.bir` canonically with every section preserved. A stored causal replay record still carries the lifted JSON program, not BIR bytes. `npm run verify:bir` runs the focused contract, and `npm run verify:bir-example` runs the source-to-BIR-to-execution evidence cycle inside `npm run verify`.

## 8. Not covered by BIR v1

- run evidence, replay records, and the execution fixture corpus (Gate D);
- endogenous universe programs, persistent-program wrappers, and narrative programs as their own semantic sections (they reach BIR after compilation to a causal program);
- equivalence between an omitted optional field and an explicit default;
- canonical ordering of validator diagnostics, which are host error reports rather than world evidence;
- any claim that a binary layout is more ontologically real than the typed graph it encodes.
