import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
    BIR_MAGIC,
    BIR_MAX_DEPTH,
    BirFormatError,
    BirLoweringError,
    causalProgramSchema,
    decodeBir,
    decodeNode,
    encodeCausalProgramBir,
    encodeBirEnvelope,
    encodeNode,
    encodeUnsigned,
    liftCausalProgramFromBir,
    lowerCausalProgramToBirNode,
    realizeAnchoredCausalWorldFromBir,
    reencodeBir,
    type BirNode,
    type BirSchema,
} from "../../src/bubbles/bir";
import { compileCausalBubbleSource } from "../../src/bubbles/language";
import {
    causalOptionsForEndogenousCompilation,
    compareCanonicalStrings,
    compileEndogenousUniverse,
    evaluateIntensionalCoordinate,
    materializeEndogenousUniverse,
    realizeAnchoredCausalWorld,
    validateExecutableCausalProgram,
    type AnchoredCausalRun,
    type CausalExecutionOptions,
    type EndogenousUniverseProgram,
    type ExecutableAnchoredCausalProgram,
    type IntensionalTerm,
} from "../../src/bubbles/world-kernel";

function repositoryFile(path: string): string {
    return readFileSync(resolve(process.cwd(), path), "utf8");
}

function stable(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

function withoutProgramDigest(run: AnchoredCausalRun): string {
    const { programDigest: _programDigest, ...rest } = run;
    return stable(rest);
}

interface Fixture {
    name: string;
    program: ExecutableAnchoredCausalProgram;
    options: CausalExecutionOptions;
}

function canonicalFixtures(): Fixture[] {
    const fixtures: Fixture[] = [];
    for (const name of ["self-organizing-field", "endogenous-branching-field", "generational-grove"]) {
        fixtures.push({ name, program: JSON.parse(repositoryFile(`examples/${name}.world.json`)), options: {} });
    }
    for (const name of ["self-maintaining-field", "distributed-channel-field"]) {
        fixtures.push({ name, program: JSON.parse(repositoryFile(`examples/${name}.world.json`)).causalProgram, options: {} });
    }
    for (const name of ["generational-seed", "connected-fields"]) {
        const program = compileCausalBubbleSource(repositoryFile(`examples/${name}.causal.bubble`), { sourcePath: name }).program;
        fixtures.push({ name, program, options: { worldWillEnabled: false } });
    }
    const endogenous = JSON.parse(repositoryFile("examples/endogenous-connected-universe.world.json")) as EndogenousUniverseProgram;
    const materialization = materializeEndogenousUniverse(endogenous, { maxDepth: 2, maxWorlds: 32 });
    const compiled = compileEndogenousUniverse(endogenous, materialization);
    assert.ok(compiled, "the canonical connected universe compiles to one causal program");
    fixtures.push({
        name: "endogenous-connected-universe",
        program: compiled.program,
        options: causalOptionsForEndogenousCompilation(compiled),
    });
    return fixtures;
}

/** Reverses every array the BIR schema classifies as a set, recursively, leaving sequences in place. */
function reverseSetPositions(value: unknown, schema: BirSchema): unknown {
    let resolved = schema;
    while (resolved.kind === "lazy") resolved = resolved.resolve();
    switch (resolved.kind) {
        case "set":
            return [...(value as unknown[])].reverse().map((item) => reverseSetPositions(item, resolved.of));
        case "seq":
            return (value as unknown[]).map((item) => reverseSetPositions(item, resolved.of));
        case "map":
            return Object.fromEntries(Object.entries(value as Record<string, unknown>).reverse()
                .map(([key, item]) => [key, reverseSetPositions(item, resolved.of)]));
        case "record":
        case "variant": {
            const record = value as Record<string, unknown>;
            const fields = resolved.kind === "record"
                ? resolved.fields
                : resolved.variants[record[resolved.tag] as string]!;
            return Object.fromEntries(Object.entries(record).reverse().map(([key, item]) => [
                key,
                fields[key] ? reverseSetPositions(item, fields[key]!.schema) : item,
            ]));
        }
        default:
            return value;
    }
}

function reseal(body: Uint8Array): Uint8Array {
    const out = new Uint8Array(body.length + 32);
    out.set(body);
    out.set(createHash("sha256").update(body).digest(), body.length);
    return out;
}

test("every canonical causal world round-trips through BIR and executes identically", () => {
    for (const fixture of canonicalFixtures()) {
        const encoded = encodeCausalProgramBir(fixture.program);
        const document = decodeBir(encoded.bytes);
        assert.equal(document.executable, true, fixture.name);
        assert.deepEqual(Buffer.from(reencodeBir(document)), Buffer.from(encoded.bytes), `${fixture.name} re-encodes byte for byte`);
        const lifted = liftCausalProgramFromBir(document);
        assert.equal(lifted.status, "lifted", fixture.name);
        assert.deepEqual(validateExecutableCausalProgram(lifted.program!), []);

        // Lifting is a fixed point: the lifted program encodes to the same bytes and the same semantic identity.
        const again = encodeCausalProgramBir(lifted.program!);
        assert.deepEqual(Buffer.from(again.bytes), Buffer.from(encoded.bytes), `${fixture.name} lift is canonical`);
        assert.equal(again.semanticDigest, encoded.semanticDigest);
        assert.equal(again.sourceBackendProgramDigest, lifted.backendProgramDigest);

        const original = realizeAnchoredCausalWorld(fixture.program, fixture.options);
        const fromBir = realizeAnchoredCausalWorldFromBir(encoded.bytes, fixture.options);
        assert.ok(fromBir.run, fixture.name);
        assert.equal(withoutProgramDigest(fromBir.run), withoutProgramDigest(original), `${fixture.name} executes the same world`);
        assert.equal(fromBir.run.programDigest, lifted.backendProgramDigest);
    }
});

test("semantic identity and execution are invariant under every set permutation", () => {
    for (const fixture of canonicalFixtures()) {
        const permuted = reverseSetPositions(fixture.program, causalProgramSchema) as ExecutableAnchoredCausalProgram;
        const original = encodeCausalProgramBir(fixture.program);
        const reordered = encodeCausalProgramBir(permuted);
        assert.equal(reordered.semanticDigest, original.semanticDigest, fixture.name);
        assert.deepEqual(Buffer.from(reordered.bytes), Buffer.from(original.bytes), fixture.name);
        assert.equal(
            withoutProgramDigest(realizeAnchoredCausalWorld(permuted, fixture.options)),
            withoutProgramDigest(realizeAnchoredCausalWorld(fixture.program, fixture.options)),
            `${fixture.name} execution does not depend on host declaration order`,
        );
    }
});

test("an ordered position stays part of semantic identity", () => {
    const program = canonicalFixtures()[0]!.program;
    const withAxes = structuredClone(program);
    withAxes.world.formal.families.push({
        id: "two-axis-probe",
        domain: { axes: [{ name: "a", kind: "natural" }, { name: "b", kind: "finite", size: "2" }] },
        valueKind: "rational",
        parameters: [],
        body: { kind: "value", value: { kind: "rational", numerator: "0", denominator: "1" } },
    });
    const swapped = structuredClone(withAxes);
    swapped.world.formal.families.at(-1)!.domain.axes.reverse();
    assert.notEqual(encodeCausalProgramBir(swapped).semanticDigest, encodeCausalProgramBir(withAxes).semanticDigest);
});

test("non-critical extensions are preserved byte for byte, excluded from meaning, and never executed", () => {
    const fixture = canonicalFixtures().find((candidate) => candidate.name === "connected-fields")!;
    const plain = encodeCausalProgramBir(fixture.program);
    const payload = Uint8Array.from([0xde, 0xad, 0xbe, 0xef, 0x00, 0xff]);
    const extended = encodeCausalProgramBir(fixture.program, {
        extensions: [{ name: "ext.authoring-provenance", critical: false, payload }],
    });
    assert.equal(extended.semanticDigest, plain.semanticDigest);
    assert.notEqual(extended.storageDigest, plain.storageDigest);
    const document = decodeBir(extended.bytes);
    assert.deepEqual(document.preservedExtensionSections, ["ext.authoring-provenance"]);
    assert.deepEqual(Buffer.from(document.envelope.sections.find((section) => section.name === "ext.authoring-provenance")!.payload), Buffer.from(payload));
    assert.deepEqual(Buffer.from(reencodeBir(document)), Buffer.from(extended.bytes));
    const run = realizeAnchoredCausalWorldFromBir(extended.bytes, fixture.options).run!;
    assert.equal(withoutProgramDigest(run), withoutProgramDigest(realizeAnchoredCausalWorld(fixture.program, fixture.options)));
    assert.throws(
        () => encodeCausalProgramBir(fixture.program, { extensions: [{ name: "core.causal-program", critical: true, payload }] }),
        (error: unknown) => error instanceof BirLoweringError && error.code === "BIRL21",
    );
});

test("an unknown critical section is preserved but makes the document non-executable", () => {
    const fixture = canonicalFixtures()[0]!;
    const encoded = encodeCausalProgramBir(fixture.program, {
        extensions: [{ name: "core.future-semantics", critical: true, payload: Uint8Array.of(1, 2, 3) }],
    });
    const document = decodeBir(encoded.bytes);
    assert.equal(document.executable, false);
    assert.deepEqual(document.unknownCriticalSections, ["core.future-semantics"]);
    assert.equal(liftCausalProgramFromBir(document).status, "not-executable");
    assert.equal(realizeAnchoredCausalWorldFromBir(encoded.bytes).run, undefined);
    assert.deepEqual(Buffer.from(reencodeBir(document)), Buffer.from(encoded.bytes));
    assert.notEqual(document.semanticDigest, encodeCausalProgramBir(fixture.program).semanticDigest);
});

test("the envelope rejects corruption, foreign bytes, and unsupported major versions", () => {
    const bytes = encodeCausalProgramBir(canonicalFixtures()[0]!.program).bytes;
    const code = (input: Uint8Array): string | undefined => {
        try {
            decodeBir(input);
            return undefined;
        } catch (error) {
            return error instanceof BirFormatError ? error.code : "other";
        }
    };
    const flipped = Uint8Array.from(bytes);
    flipped[20] = flipped[20]! ^ 0x01;
    assert.equal(code(flipped), "BIR023");
    const body = bytes.subarray(0, bytes.length - 32);
    const foreign = Uint8Array.from(body);
    foreign[0] = 0x00;
    assert.equal(code(reseal(foreign)), "BIR024");
    const future = Uint8Array.from(body);
    future[BIR_MAGIC.length] = 2;
    assert.equal(code(reseal(future)), "BIR025");
    assert.equal(code(reseal(Uint8Array.from([...body, 0x00]))), "BIR028");
    assert.equal(code(bytes.subarray(0, 10)), "BIR022");
});

test("node decoding accepts only the canonical encoding", () => {
    const rejects = (bytes: number[], expected: string): void => {
        assert.throws(
            () => decodeNode(Uint8Array.from(bytes)),
            (error: unknown) => error instanceof BirFormatError && error.code === expected,
            `expected ${expected} for ${bytes.join(",")}`,
        );
    };
    rejects([0x03, 0x82, 0x00], "BIR011");                  // non-minimal integer
    rejects([0x06, 0x02, 0x02, 0x01], "BIR015");            // set {true, false} unsorted
    rejects([0x06, 0x02, 0x01, 0x01], "BIR015");            // duplicate set member
    rejects([0x07, 0x02, 0x01, 0x62, 0x01, 0x01, 0x61, 0x01], "BIR016"); // record keys b, a
    rejects([0x10, 0x04, 0x04], "BIR004");                  // 2/4 is not reduced
    rejects([0x10, 0x00, 0x02], "BIR004");                  // zero must be 0/1
    rejects([0x10, 0x02, 0x00], "BIR004");                  // zero denominator
    rejects([0x04, 0x02, 0xc3, 0x28], "BIR013");            // malformed UTF-8
    rejects([0x01, 0x01], "BIR018");                        // trailing bytes
    rejects([0x7f], "BIR017");                              // unknown tag
    assert.deepEqual(decodeNode(encodeNode({ kind: "rational", numerator: -3n, denominator: 7n })), {
        kind: "rational", numerator: -3n, denominator: 7n,
    });
    const big = 2n ** 200n + 1n;
    assert.deepEqual(decodeNode(encodeNode({ kind: "int", value: -big })), { kind: "int", value: -big });
});

test("lowering refuses to lose or invent meaning", () => {
    const program = canonicalFixtures()[0]!.program;
    const lowerCode = (candidate: unknown): string | undefined => {
        try {
            encodeNode(lowerCausalProgramToBirNode(candidate as ExecutableAnchoredCausalProgram));
            return undefined;
        } catch (error) {
            return error instanceof BirLoweringError || error instanceof BirFormatError ? error.code : "other";
        }
    };
    assert.equal(lowerCode({ ...program, hostNote: "drop me" }), "BIRL01");
    const nonReduced = structuredClone(program);
    nonReduced.seaLaws[0]!.positiveWeight = { kind: "rational", numerator: "2", denominator: "4" };
    assert.equal(lowerCode(nonReduced), "BIRL06");
    const negativeZero = structuredClone(program);
    negativeZero.fieldInitializers[0]!.query.at = Object.fromEntries(
        Object.keys(negativeZero.fieldInitializers[0]!.query.at).map((axis) => [axis, "-0"]),
    );
    if (Object.keys(negativeZero.fieldInitializers[0]!.query.at).length > 0) assert.equal(lowerCode(negativeZero), "BIRL05");
    const duplicate = structuredClone(program);
    duplicate.world.anchors[0]!.identityPredicateFamilyIds.push(duplicate.world.anchors[0]!.identityPredicateFamilyIds[0]!);
    assert.equal(lowerCode(duplicate), "BIR005");
    const invalid = structuredClone(program);
    invalid.world.internalLaws[0]!.worldId = "no-such-world";
    assert.throws(() => encodeCausalProgramBir(invalid), (error: unknown) => error instanceof BirLoweringError && error.code === "BIRL20");
});

test("canonical order is portable code-point order, not host collation or UTF-16 code units", () => {
    assert.equal(compareCanonicalStrings("B", "a"), -1);
    assert.equal(compareCanonicalStrings("a-b", "a_b"), -1);
    assert.equal(compareCanonicalStrings("trace:10:x", "trace:1:x"), -1);
    assert.equal(compareCanonicalStrings("￿", "\u{1F600}"), -1);
    assert.equal(compareCanonicalStrings("same", "same"), 0);
    assert.notEqual(["B", "a"].sort((left, right) => left.localeCompare(right))[0], "B", "host collation differs");
});

test("a law cannot commit the same field twice", () => {
    const program = canonicalFixtures().find((fixture) => fixture.program.world.internalLaws.some((law) => (law.commitAffectedFieldIds?.length ?? 0) > 0))!.program;
    const duplicated = structuredClone(program);
    const law = duplicated.world.internalLaws.find((candidate) => (candidate.commitAffectedFieldIds?.length ?? 0) > 0)!;
    law.commitAffectedFieldIds = [...law.commitAffectedFieldIds!, law.commitAffectedFieldIds![0]!];
    assert.ok(validateExecutableCausalProgram(duplicated).some((diagnostic) => diagnostic.code === "CKW105"));
});

test("sections follow raw name-byte order, and semantic identity is computable from the specification", () => {
    const program = canonicalFixtures()[0]!.program;
    const programPayload = encodeNode(lowerCausalProgramToBirNode(program));
    const optionsPayload = encodeNode({ kind: "record", fields: [] });
    const document = decodeBir(encodeBirEnvelope({
        formatVersion: { major: 1, minor: 0 },
        sections: [
            { name: "core.causal-program", critical: true, payload: programPayload },
            { name: "core.causal-execution-options", critical: true, payload: optionsPayload },
        ],
    }));
    // Raw bytes: "core.causal-e..." < "core.causal-p..."; the length-prefixed text would order them the other way.
    assert.deepEqual(document.envelope.sections.map((section) => section.name), ["core.causal-execution-options", "core.causal-program"]);
    const uvar = (value: number): Buffer => Buffer.from(encodeUnsigned(value));
    const text = (value: string): Buffer => Buffer.concat([uvar(Buffer.byteLength(value)), Buffer.from(value, "utf8")]);
    const expected = createHash("sha256").update(Buffer.concat([
        Buffer.from("bubble-bir-semantic-identity.v1\u0000", "utf8"),
        uvar(2),
        text("core.causal-execution-options"), uvar(optionsPayload.length), Buffer.from(optionsPayload),
        text("core.causal-program"), uvar(programPayload.length), Buffer.from(programPayload),
    ])).digest("hex");
    assert.equal(document.semanticDigest, expected);

    // An envelope written in length-prefixed order is not canonical and is rejected.
    const body = Buffer.concat([
        Buffer.from(BIR_MAGIC), uvar(1), uvar(0), uvar(2),
        text("core.causal-program"), uvar(1), uvar(programPayload.length), Buffer.from(programPayload),
        text("core.causal-execution-options"), uvar(1), uvar(optionsPayload.length), Buffer.from(optionsPayload),
    ]);
    assert.throws(() => decodeBir(reseal(new Uint8Array(body))), (error: unknown) => error instanceof BirFormatError && error.code === "BIR026");
});

test("a core section can never be non-critical", () => {
    assert.throws(
        () => encodeBirEnvelope({ formatVersion: { major: 1, minor: 0 }, sections: [{ name: "core.annotations", critical: false, payload: Uint8Array.of(1) }] }),
        (error: unknown) => error instanceof BirFormatError && error.code === "BIR029",
    );
});

test("the nesting bound is normative for encoding and decoding and safe for the whole pipeline", () => {
    let deep: BirNode = { kind: "bool", value: true };
    for (let depth = 0; depth < BIR_MAX_DEPTH + 5; depth += 1) deep = { kind: "seq", items: [deep] };
    assert.throws(() => encodeNode(deep), (error: unknown) => error instanceof BirFormatError && error.code === "BIR014");
    const bytes = new Uint8Array([...Array.from({ length: BIR_MAX_DEPTH + 5 }, () => [0x05, 0x01]).flat(), 0x02]);
    assert.throws(() => decodeNode(bytes), (error: unknown) => error instanceof BirFormatError && error.code === "BIR014");

    // A term nested as deeply as the bound allows still lifts, validates, and executes without exhausting the stack.
    const program = structuredClone(canonicalFixtures()[0]!.program);
    let body: IntensionalTerm = { kind: "value", value: { kind: "boolean", value: true } };
    for (let depth = 0; depth < BIR_MAX_DEPTH - 32; depth += 1) body = { kind: "unary", operator: "not", operand: body };
    program.world.formal.families.push({
        id: "deep-probe",
        domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
        valueKind: "boolean",
        parameters: [],
        body,
    });
    const realized = realizeAnchoredCausalWorldFromBir(encodeCausalProgramBir(program).bytes);
    assert.equal(realized.lift.status, "lifted");
    assert.ok(realized.run);
});

test("family-coordinate parameters are evaluated independently of declaration order", () => {
    const program = structuredClone(canonicalFixtures()[0]!.program);
    let heavy: IntensionalTerm = { kind: "value", value: { kind: "rational", numerator: "1", denominator: "1" } };
    for (let depth = 0; depth < 6; depth += 1) heavy = { kind: "binary", operator: "add", left: heavy, right: { kind: "value", value: { kind: "rational", numerator: "0", denominator: "1" } } };
    program.world.formal.families.push(
        {
            id: "two-parameter-target",
            domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
            valueKind: "rational",
            parameters: [{ name: "a", valueKind: "rational" }, { name: "b", valueKind: "rational" }],
            body: { kind: "parameter", name: "a" },
        },
        {
            id: "two-parameter-caller",
            domain: { axes: [{ name: "unit", kind: "finite", size: "1" }] },
            valueKind: "rational",
            parameters: [],
            body: {
                kind: "family-coordinate",
                familyId: "two-parameter-target",
                at: { unit: { kind: "value", value: { kind: "rational", numerator: "0", denominator: "1" } } },
                parameters: {
                    a: heavy,
                    b: { kind: "binary", operator: "divide", left: { kind: "value", value: { kind: "rational", numerator: "1", denominator: "1" } }, right: { kind: "value", value: { kind: "rational", numerator: "0", denominator: "1" } } },
                },
            },
        },
    );
    const evaluate = (system: typeof program.world.formal) => evaluateIntensionalCoordinate(system, {
        familyId: "two-parameter-caller", at: { unit: "0" }, parameters: {},
    }, { budget: 6 });
    const reversed = structuredClone(program.world.formal);
    reversed.families.find((family) => family.id === "two-parameter-target")!.parameters.reverse();
    const left = evaluate(program.world.formal);
    const right = evaluate(reversed);
    assert.equal(left.status, right.status);
    assert.equal(stable(left.proof), stable(right.proof));
});

test("hard constraints, anchor-identity predicates, and objectives leave the whole run order-free", () => {
    const fixture = canonicalFixtures()[0]!;
    const program = structuredClone(fixture.program);
    const identity = program.execution.anchorIdentity[0]!;
    program.execution.anchorIdentity.push({ ...structuredClone(identity), id: `${identity.id}-again` });
    const objective = program.world.worldWill.objectives[0]!;
    program.world.worldWill.objectives.push({ ...structuredClone(objective), id: `${objective.id}-again` });
    program.execution.hardConstraints.push(
        { ...structuredClone(identity), id: "constraint-a" } as never,
        { ...structuredClone(identity), id: "constraint-b" } as never,
    );
    for (const constraint of program.execution.hardConstraints as unknown as Array<Record<string, unknown>>) delete constraint.anchorId;
    assert.deepEqual(validateExecutableCausalProgram(program), []);
    const reversed = structuredClone(program);
    reversed.execution.anchorIdentity.reverse();
    reversed.world.worldWill.objectives.reverse();
    reversed.execution.hardConstraints.reverse();
    assert.equal(
        withoutProgramDigest(realizeAnchoredCausalWorld(reversed, fixture.options)),
        withoutProgramDigest(realizeAnchoredCausalWorld(program, fixture.options)),
    );
});
