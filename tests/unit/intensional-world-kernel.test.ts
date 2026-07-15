import assert from "node:assert/strict";
import test from "node:test";
import {
    evaluateIntensionalCoordinate,
    exact,
    term,
    validateIntensionalSystem,
    type IntensionalSystem,
} from "../../src/bubbles/world-kernel";

test("a finite definition addresses an unbounded exact vector without enumerating it", () => {
    const system: IntensionalSystem = {
        mode: "bubble-intensional-system.v1",
        families: [{
            id: "basis-vector",
            domain: { axes: [{ name: "coordinate", kind: "natural" }] },
            valueKind: "rational",
            parameters: [{ name: "pivot", valueKind: "rational" }],
            body: term.if(
                term.binary("equal", term.index("coordinate"), term.parameter("pivot")),
                term.value(exact.integer(1)),
                term.value(exact.integer(0)),
            ),
        }],
    };
    const hugeCoordinate = "100000000000000000000000000000000000000000000000001";
    const result = evaluateIntensionalCoordinate(system, {
        familyId: "basis-vector",
        at: { coordinate: hugeCoordinate },
        parameters: { pivot: exact.integer(hugeCoordinate) },
    });

    assert.equal(result.status, "resolved");
    assert.deepEqual(result.value, exact.integer(1));
    assert.equal(result.denotation.cardinality, "countably-infinite");
    assert.equal(result.denotation.materializedCoordinateCount, 1);
    assert.equal(result.denotation.exhaustiveMaterializationClaim, false);
    assert.ok(result.budget.consumed < 10);
});

test("a product-indexed family represents an infinite-dimensional exact operator", () => {
    const identityOperator: IntensionalSystem = {
        mode: "bubble-intensional-system.v1",
        families: [{
            id: "identity-operator",
            domain: {
                axes: [
                    { name: "row", kind: "natural" },
                    { name: "column", kind: "natural" },
                ],
            },
            valueKind: "rational",
            parameters: [],
            body: term.if(
                term.binary("equal", term.index("row"), term.index("column")),
                term.value(exact.integer(1)),
                term.value(exact.integer(0)),
            ),
        }],
    };

    const diagonal = evaluateIntensionalCoordinate(identityOperator, {
        familyId: "identity-operator",
        at: { row: "900719925474099300000", column: "900719925474099300000" },
        parameters: {},
    });
    const offDiagonal = evaluateIntensionalCoordinate(identityOperator, {
        familyId: "identity-operator",
        at: { row: "900719925474099300000", column: "900719925474099300001" },
        parameters: {},
    });

    assert.deepEqual(diagonal.value, exact.integer(1));
    assert.deepEqual(offDiagonal.value, exact.integer(0));
    assert.equal(diagonal.denotation.cardinality, "countably-infinite");
});

function fibonacciSystem(): IntensionalSystem {
    const n = term.index("n");
    const previous = (distance: number) => term.coordinate("fibonacci", {
        n: term.binary("subtract", n, term.value(exact.integer(distance))),
    });
    return {
        mode: "bubble-intensional-system.v1",
        families: [{
            id: "fibonacci",
            domain: { axes: [{ name: "n", kind: "natural" }] },
            valueKind: "rational",
            parameters: [],
            recursion: { kind: "well-founded-natural-axis", measureAxis: "n" },
            body: term.if(
                term.binary("less-than", n, term.value(exact.integer(2))),
                n,
                term.binary("add", previous(1), previous(2)),
            ),
        }],
    };
}

test("guarded recursion resolves only demanded coordinates and records their dependency proof", () => {
    const result = evaluateIntensionalCoordinate(fibonacciSystem(), {
        familyId: "fibonacci",
        at: { n: "20" },
        parameters: {},
    });

    assert.equal(result.status, "resolved");
    assert.deepEqual(result.value, exact.integer(6765));
    assert.equal(result.proof.length, 21);
    assert.ok(result.proof.every((step) => step.rule === "guarded-recursion"));
    assert.ok(result.proof.some((step) => step.coordinate.n === "20" && step.dependencies.length > 0));
});

test("insufficient computation remains undetermined rather than becoming a fabricated value", () => {
    const result = evaluateIntensionalCoordinate(
        fibonacciSystem(),
        { familyId: "fibonacci", at: { n: "20" }, parameters: {} },
        { budget: 20 },
    );

    assert.equal(result.status, "undetermined");
    assert.equal(result.value, undefined);
    assert.match(result.reason ?? "", /budget exhausted/);
    assert.equal(result.budget.remaining, 0);
    assert.equal(result.denotation.exhaustiveMaterializationClaim, false);
});

test("recursion without a strict natural descent is rejected before evaluation", () => {
    const invalid: IntensionalSystem = {
        mode: "bubble-intensional-system.v1",
        families: [{
            id: "closed-loop",
            domain: { axes: [{ name: "n", kind: "natural" }] },
            valueKind: "rational",
            parameters: [],
            recursion: { kind: "well-founded-natural-axis", measureAxis: "n" },
            body: term.coordinate("closed-loop", { n: term.index("n") }),
        }],
    };

    const diagnostics = validateIntensionalSystem(invalid);
    assert.ok(diagnostics.some((entry) => entry.code === "BIK018"));
    const result = evaluateIntensionalCoordinate(invalid, {
        familyId: "closed-loop",
        at: { n: "0" },
        parameters: {},
    });
    assert.equal(result.status, "contradicted");
    assert.equal(result.proof.length, 0);
});
