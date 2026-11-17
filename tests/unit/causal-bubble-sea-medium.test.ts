import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { BubbleCompilerError, compileCausalBubbleSource } from "../../src/bubbles/language";
import {
    evaluateIntensionalCoordinate,
    validateExecutableCausalProgram,
    type ExactValue,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";

const MEDIUM_SOURCE = `causal bubble SharedSeas {
  decision deterministic
  world-will shared-seas-will

  world alpha active
  field alpha.positive role positive-sea = 2
  field alpha.negative role negative-sea = 3
  field alpha.viability role viability = 1
  field alpha.phase role world-state = "open"
  sea alpha positive positive negative negative viability viability weights 1 1
  anchor alpha-anchor world alpha port alpha-boundary identity true permit condition
  objective preserve-alpha world alpha field viability direction maximize weight 1

  world beta active
  field beta.positive role positive-sea = 1
  field beta.negative role negative-sea = 1
  field beta.viability role viability = 1
  field beta.ready role world-condition = true
  sea beta positive positive negative negative viability viability weights 1 1
  anchor beta-anchor world beta port beta-boundary identity true permit condition
  objective preserve-beta world beta field viability direction maximize weight 1

  world gamma latent
  field gamma.positive role positive-sea = 1
  field gamma.negative role negative-sea = 0
  field gamma.viability role viability = 1
  sea gamma positive positive negative negative viability viability weights 1 1
  anchor gamma-anchor world gamma port gamma-boundary identity true permit condition
  objective preserve-gamma world gamma field viability direction maximize weight 1

  sea-medium shared-sea closed
  sea-region shore negative 4 positive 2
  sea-region deep negative 1/2 positive 6
  sea-region rim negative 0 positive 0
  place alpha in shore
  place beta in deep
  place gamma in rim
  adjacent shore-deep shore deep
  adjacent deep-rim deep rim

  exchange shed-alpha negative 1 from world alpha to region shore
  exchange-when shed-alpha alpha.negative >= 2
  exchange-when shed-alpha alpha.phase = "open"
  exchange-when shed-alpha region shore negative < 5
  exchange feed-beta positive 1/2 from region deep to world beta
  exchange-when feed-beta beta.ready = true
  exchange drift-shore negative 1 from region shore to region deep
  exchange-when drift-shore region deep positive >= 6
  exchange settle-rim positive 1 from region deep to region rim
}
`;

function rational(numerator: number, denominator = 1): ExactValue {
    return { kind: "rational", numerator: String(numerator), denominator: String(denominator) };
}

function symbol(value: string): ExactValue {
    return { kind: "symbol", value };
}

function boolean(value: boolean): ExactValue {
    return { kind: "boolean", value };
}

function compileMedium(source = MEDIUM_SOURCE): ExecutableAnchoredCausalProgram {
    return compileCausalBubbleSource(source, { sourcePath: "shared-seas.causal.bubble" }).program;
}

/** Insert declarations just before the closing brace. */
function withLines(...lines: string[]): string {
    const closing = MEDIUM_SOURCE.lastIndexOf("}");
    return `${MEDIUM_SOURCE.slice(0, closing)}${lines.map((line) => `  ${line}\n`).join("")}}\n`;
}

function replaced(search: string, replacement: string): string {
    assert.ok(MEDIUM_SOURCE.includes(search), `fixture lacks '${search}'`);
    return MEDIUM_SOURCE.replace(search, replacement);
}

function without(line: string): string {
    return replaced(`  ${line}\n`, "");
}

function lineOf(source: string, text: string): number {
    const index = source.split("\n").findIndex((line) => line.trim() === text);
    assert.ok(index >= 0, `source lacks '${text}'`);
    return index + 1;
}

function expectCode(source: string, code: string, line?: number): void {
    assert.throws(
        () => compileCausalBubbleSource(source, { sourcePath: "misuse.causal.bubble" }),
        (error: unknown) => {
            assert.ok(error instanceof BubbleCompilerError, String(error));
            const match = error.diagnostics.find((entry) => entry.code === code);
            assert.ok(match, `expected ${code}, received ${error.diagnostics.map((entry) => `${entry.code}: ${entry.message}`).join("; ")}`);
            if (line !== undefined) assert.equal(match.line, line);
            return true;
        },
    );
}

function evaluateGuard(program: ExecutableAnchoredCausalProgram, familyId: string, parameters: Record<string, ExactValue>): ExactValue | undefined {
    const result = evaluateIntensionalCoordinate(program.world.formal, { familyId, at: { coordinate: "0" }, parameters });
    assert.equal(result.status, "resolved", result.reason);
    return result.value;
}

test("causal Bubble sea medium source lowers regions, placements, adjacency, and every endpoint combination", () => {
    const program = compileMedium();
    const medium = program.world.seaMedium;
    assert.ok(medium);
    assert.equal(medium.id, "shared-sea");
    assert.equal(medium.closure, "closed");
    assert.deepEqual(medium.regions, [
        { id: "shore", negative: rational(4), positive: rational(2) },
        { id: "deep", negative: rational(1, 2), positive: rational(6) },
        { id: "rim", negative: rational(0), positive: rational(0) },
    ]);
    assert.deepEqual(medium.placements, [
        { worldId: "alpha", regionId: "shore" },
        { worldId: "beta", regionId: "deep" },
        { worldId: "gamma", regionId: "rim" },
    ]);
    assert.deepEqual(medium.adjacency, [
        { id: "shore-deep", regionIds: ["shore", "deep"] },
        { id: "deep-rim", regionIds: ["deep", "rim"] },
    ]);
    assert.deepEqual(medium.exchangeLaws, [
        {
            id: "shed-alpha",
            quantity: "negative",
            from: { kind: "world", worldId: "alpha" },
            to: { kind: "region", regionId: "shore" },
            amount: rational(1),
            guard: {
                id: "sea-predicate-shed-alpha",
                query: { familyId: "sea-guard-shed-alpha", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [
                    { parameterName: "value-0", worldId: "alpha", fieldId: "negative" },
                    { parameterName: "value-1", worldId: "alpha", fieldId: "phase" },
                ],
                regionParameters: [{ parameterName: "value-2", regionId: "shore", quantity: "negative" }],
            },
            application: "once-per-realization",
        },
        {
            id: "feed-beta",
            quantity: "positive",
            from: { kind: "region", regionId: "deep" },
            to: { kind: "world", worldId: "beta" },
            amount: rational(1, 2),
            guard: {
                id: "sea-predicate-feed-beta",
                query: { familyId: "sea-guard-feed-beta", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [{ parameterName: "value-0", worldId: "beta", fieldId: "ready" }],
                regionParameters: [],
            },
            application: "once-per-realization",
        },
        {
            id: "drift-shore",
            quantity: "negative",
            from: { kind: "region", regionId: "shore" },
            to: { kind: "region", regionId: "deep" },
            amount: rational(1),
            guard: {
                id: "sea-predicate-drift-shore",
                query: { familyId: "sea-guard-drift-shore", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [],
                regionParameters: [{ parameterName: "value-0", regionId: "deep", quantity: "positive" }],
            },
            application: "once-per-realization",
        },
        {
            id: "settle-rim",
            quantity: "positive",
            from: { kind: "region", regionId: "deep" },
            to: { kind: "region", regionId: "rim" },
            amount: rational(1),
            guard: {
                id: "sea-predicate-settle-rim",
                query: { familyId: "sea-guard-settle-rim", at: { coordinate: "0" }, parameters: {} },
                fieldParameters: [],
                regionParameters: [],
            },
            application: "once-per-realization",
        },
    ]);
    // The rest of the program is the same local-sea lowering as before.
    assert.deepEqual(program.world.worlds.map((world) => [world.id, world.initialExistence ?? "active"]), [
        ["alpha", "active"], ["beta", "active"], ["gamma", "latent"],
    ]);
    assert.equal(program.world.internalLaws.length, 0);
});

test("causal Bubble sea exchange guards lower to intensional families whose evaluation gives the authored booleans", () => {
    const program = compileMedium();
    const families = new Map(program.world.formal.families.map((family) => [family.id, family]));
    for (const law of program.world.seaMedium!.exchangeLaws) {
        const family = families.get(law.guard.query.familyId);
        assert.ok(family, law.guard.query.familyId);
        assert.equal(family.valueKind, "boolean");
        const bound = [...law.guard.fieldParameters.map((entry) => entry.parameterName), ...law.guard.regionParameters.map((entry) => entry.parameterName)];
        assert.deepEqual(family.parameters.map((parameter) => parameter.name), bound);
    }
    assert.deepEqual(families.get("sea-guard-shed-alpha")!.parameters, [
        { name: "value-0", valueKind: "rational" },
        { name: "value-1", valueKind: "symbol" },
        { name: "value-2", valueKind: "rational" },
    ]);

    const shed = (negative: ExactValue, phase: ExactValue, shore: ExactValue) => evaluateGuard(
        program, "sea-guard-shed-alpha", { "value-0": negative, "value-1": phase, "value-2": shore },
    );
    assert.deepEqual(shed(rational(3), symbol("open"), rational(4)), boolean(true));
    assert.deepEqual(shed(rational(2), symbol("open"), rational(9, 2)), boolean(true));
    assert.deepEqual(shed(rational(3, 2), symbol("open"), rational(4)), boolean(false));
    assert.deepEqual(shed(rational(3), symbol("sealed"), rational(4)), boolean(false));
    assert.deepEqual(shed(rational(3), symbol("open"), rational(5)), boolean(false));

    assert.deepEqual(evaluateGuard(program, "sea-guard-feed-beta", { "value-0": boolean(true) }), boolean(true));
    assert.deepEqual(evaluateGuard(program, "sea-guard-feed-beta", { "value-0": boolean(false) }), boolean(false));
    assert.deepEqual(evaluateGuard(program, "sea-guard-drift-shore", { "value-0": rational(6) }), boolean(true));
    assert.deepEqual(evaluateGuard(program, "sea-guard-drift-shore", { "value-0": rational(11, 2) }), boolean(false));
    assert.deepEqual(families.get("sea-guard-settle-rim")!.parameters, []);
    assert.deepEqual(evaluateGuard(program, "sea-guard-settle-rim", {}), boolean(true));
});

test("causal Bubble source without medium statements lowers no medium and no medium families", () => {
    for (const name of ["generational-seed.causal.bubble", "connected-fields.causal.bubble"]) {
        const path = resolve(process.cwd(), "examples", name);
        const program = compileCausalBubbleSource(readFileSync(path, "utf8"), { sourcePath: path }).program;
        assert.equal("seaMedium" in program.world, false);
        assert.equal(program.world.formal.families.some((family) => family.id.startsWith("sea-guard-")), false);
    }
});

test("causal Bubble sea medium statements refuse misuse with specific diagnostics", () => {
    // Declaration and literal misuse.
    expectCode(withLines("sea-medium second-sea open"), "CBL024", lineOf(withLines("sea-medium second-sea open"), "sea-medium second-sea open"));
    const noMedium = without("sea-medium shared-sea closed");
    expectCode(noMedium, "CBL025", lineOf(noMedium, "sea-region shore negative 4 positive 2"));
    expectCode(replaced("sea-region rim negative 0 positive 0", "sea-region rim negative -1 positive 0"), "CBL027");
    expectCode(replaced("sea-region rim negative 0 positive 0", "sea-region rim negative 0 positive -1/3"), "CBL027");
    expectCode(replaced("sea-region rim negative 0 positive 0", "sea-region rim negative true positive 0"), "CBL016");
    expectCode(replaced("exchange settle-rim positive 1 from", "exchange settle-rim positive 0 from"), "CBL028");
    expectCode(replaced("exchange settle-rim positive 1 from", "exchange settle-rim positive -1/2 from"), "CBL028");
    expectCode(replaced("exchange settle-rim positive 1 from", "exchange settle-rim positive true from"), "CBL016");
    expectCode(replaced("region deep positive >= 6", "region deep positive >= true"), "CBL016");
    expectCode(replaced("sea-medium shared-sea closed", "sea-medium shared-sea sealed"), "CBL008");

    // Regions, placements, and adjacency.
    expectCode(replaced("place alpha in shore", "place alpha in abyss"), "CBL026");
    expectCode(replaced("adjacent deep-rim deep rim", "adjacent deep-rim deep abyss"), "CBL026");
    expectCode(replaced("exchange settle-rim positive 1 from region deep to region rim", "exchange settle-rim positive 1 from region deep to region abyss"), "CBL026");
    expectCode(withLines("exchange-when settle-rim region abyss positive > 0"), "CBL026");
    expectCode(withLines("place delta in shore"), "CBL019");
    expectCode(withLines("exchange stray negative 1 from world delta to region shore"), "CBL019");
    const unplaced = without("place gamma in rim");
    expectCode(unplaced, "CBL029", lineOf(unplaced, "world gamma latent"));
    expectCode(withLines("place alpha in deep"), "CBL018");
    expectCode(withLines("sea-region rim negative 1 positive 1"), "CBL018");
    expectCode(withLines("adjacent deep-shore deep shore"), "CBL018");
    expectCode(withLines("adjacent shore-deep shore rim"), "CBL018");
    expectCode(withLines("exchange settle-rim positive 1 from region rim to region deep"), "CBL018");
    expectCode(withLines("adjacent shore-loop shore shore"), "CBL030");

    // Exchange endpoint rules.
    expectCode(withLines("exchange leak negative 1 from world alpha to world beta"), "CBL031");
    expectCode(withLines("exchange jump positive 1 from region shore to region rim"), "CBL032");
    expectCode(withLines("exchange stay positive 1 from region shore to region shore"), "CBL032");
    expectCode(withLines("exchange stray negative 1 from world alpha to region deep"), "CBL033");
    expectCode(withLines("exchange stray positive 1 from region shore to world beta"), "CBL033");

    // Guard rules: locality, references, and the existing exact comparison rules.
    expectCode(withLines("exchange-when absent-exchange alpha.negative > 0"), "CBL035");
    expectCode(withLines("exchange-when feed-beta alpha.phase = \"open\""), "CBL034");
    expectCode(withLines("exchange-when drift-shore alpha.negative > 0"), "CBL034");
    expectCode(withLines("exchange-when settle-rim region shore negative > 0"), "CBL034");
    expectCode(withLines("exchange-when feed-beta beta.absent = 1"), "CBL020");
    expectCode(withLines("exchange-when feed-beta beta.ready = 1"), "CBL015");
    expectCode(withLines("exchange-when feed-beta beta.ready > true"), "CBL021");
    expectCode(withLines("exchange-when shed-alpha alpha.phase < \"sealed\""), "CBL021");

    // A closed medium is the only source and sink of sea quantity.
    const lawOnSea = ["law shed world alpha when phase = \"open\" irreversible", "law-effect shed add negative 1"];
    expectCode(withLines(...lawOnSea), "CBL036", lineOf(withLines(...lawOnSea), "law-effect shed add negative 1"));
    const openLawOnSea = withLines(...lawOnSea).replace("sea-medium shared-sea closed", "sea-medium shared-sea open");
    assert.equal(compileMedium(openLawOnSea).world.seaMedium?.closure, "open");
    expectCode(withLines(
        "field alpha.signal role world-state = 1",
        "field beta.condition role world-condition = 0",
        "anchor alpha-beta between alpha.emission and beta.reception identity true permit signal",
        "transfer alpha-signal anchor alpha-beta from alpha.emission field signal to beta.reception field condition negative-residue 1 positive-placement 0",
        "law emit world alpha when signal = 1 irreversible",
        "law-transfer emit alpha-signal",
    ), "CBL036");
});

test("causal Bubble sea medium lowering passes the kernel program validator, which rejects contract violations", () => {
    const program = compileMedium();
    assert.deepEqual(validateExecutableCausalProgram(program), []);

    // Negative controls: mutations past the source checks must be caught by the kernel's CKW2xx medium validation.
    const mutate = (change: (copy: ExecutableAnchoredCausalProgram) => void): string[] => {
        const copy = structuredClone(program);
        change(copy);
        return validateExecutableCausalProgram(copy).map((entry) => entry.code);
    };
    const mediumCodes = (codes: string[]) => codes.some((code) => /^CKW2\d\d$/.test(code));
    assert.ok(mediumCodes(mutate((copy) => {
        copy.world.seaMedium!.adjacency = copy.world.seaMedium!.adjacency.filter((edge) => edge.id !== "shore-deep");
    })), "region-to-region exchange without adjacency");
    assert.ok(mediumCodes(mutate((copy) => {
        copy.world.seaMedium!.exchangeLaws[0]!.to = { kind: "world", worldId: "beta" };
    })), "world-to-world exchange");
    assert.ok(mediumCodes(mutate((copy) => {
        copy.world.seaMedium!.placements = copy.world.seaMedium!.placements.filter((entry) => entry.worldId !== "gamma");
    })), "unplaced world");
    assert.ok(mediumCodes(mutate((copy) => {
        copy.world.seaMedium!.exchangeLaws[0]!.guard.fieldParameters[0] = { parameterName: "value-0", worldId: "beta", fieldId: "negative" };
    })), "guard bound outside the exchange endpoints");
});
