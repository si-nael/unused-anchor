// Regenerates the frozen Gate D causal conformance corpus from the TypeScript reference oracle.
// Run this only for an intentional, recorded semantic change: `check-causal-conformance` treats the
// committed corpus as the expectation every backend, including the oracle itself, must meet.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildCausalConformanceFixture } from "../../src/bubbles/bir";
import { CAUSAL_CONFORMANCE_DIRECTORY, causalConformanceCases } from "./causal-conformance-corpus";

async function main(): Promise<void> {
    const directory = process.argv[2] ?? CAUSAL_CONFORMANCE_DIRECTORY;
    await mkdir(directory, { recursive: true });
    const fixtures = causalConformanceCases().map((entry) => buildCausalConformanceFixture(entry));
    for (const fixture of fixtures) {
        await writeFile(path.join(directory, `${fixture.name}.bir`), fixture.bytes);
    }
    const manifest = {
        mode: "bubble-causal-conformance-manifest.v1",
        oracle: "typescript-reference",
        outcomeMode: "bubble-causal-outcome.v1",
        note: "Expected outcomes are normative; host costs are informational and may differ for any conforming backend.",
        fixtures: fixtures.map((fixture) => ({
            name: fixture.name,
            description: fixture.description,
            file: `${fixture.name}.bir`,
            byteLength: fixture.bytes.length,
            inputSemanticDigest: fixture.inputSemanticDigest,
            storageDigest: fixture.storageDigest,
            outcomeDigest: fixture.outcomeDigest,
            status: fixture.status,
            resourceVerdict: fixture.resourceVerdict,
            hostCost: fixture.hostCost,
        })),
    };
    await writeFile(path.join(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    process.stdout.write(`Built ${fixtures.length} causal conformance fixtures in ${directory}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
