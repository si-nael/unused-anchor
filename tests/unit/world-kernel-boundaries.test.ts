import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function readRepositoryFile(path: string): string {
    return readFileSync(resolve(process.cwd(), path), "utf8");
}

const observerIndependentKernel = [
    "src/bubbles/world-kernel/intensional.ts",
    "src/bubbles/world-kernel/causal.ts",
    "src/bubbles/world-kernel/causal-runtime.ts",
    "src/bubbles/world-kernel/persistent.ts",
    "src/bubbles/world-kernel/persistent-runtime.ts",
    "src/bubbles/world-kernel/endogenous.ts",
    "src/bubbles/world-kernel/endogenous-runtime.ts",
] as const;

test("the observer-independent world kernel cannot depend on human-scale interpretation modules", () => {
    for (const path of observerIndependentKernel) {
        const source = readRepositoryFile(path);
        assert.doesNotMatch(source, /from\s+["']\.\/(?:narrative|narrative-runtime|teleonomic-runtime)["']/);
    }
});

test("the public world-kernel surface exposes interpretations only through an explicit namespace", () => {
    const publicSurface = readRepositoryFile("src/bubbles/world-kernel/index.ts");
    const coreSurface = readRepositoryFile("src/bubbles/world-kernel/core.ts");
    const interpretiveSurface = readRepositoryFile("src/bubbles/world-kernel/interpretive.ts");

    assert.equal(publicSurface, 'export * from "./core";\nexport * as interpretive from "./interpretive";\n');
    assert.doesNotMatch(coreSurface, /narrative|teleonomic|protagonist|story|agent|observer/i);
    assert.match(interpretiveSurface, /Optional human-scale interpretations/);
    assert.match(interpretiveSurface, /They are not Bubble primitives/);
});
