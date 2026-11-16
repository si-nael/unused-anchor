// Checks the TypeScript reference oracle against the frozen Gate D causal conformance corpus.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { birStorageDigest, checkCausalConformance } from "../../src/bubbles/bir";
import { CAUSAL_CONFORMANCE_DIRECTORY } from "./causal-conformance-corpus";

interface ManifestEntry {
    name: string;
    file: string;
    inputSemanticDigest: string;
    storageDigest: string;
    outcomeDigest: string;
}

async function main(): Promise<void> {
    const directory = process.argv[2] ?? CAUSAL_CONFORMANCE_DIRECTORY;
    const manifest = JSON.parse(await readFile(path.join(directory, "manifest.json"), "utf8")) as { fixtures: ManifestEntry[] };
    const failures: string[] = [];
    for (const entry of manifest.fixtures) {
        const bytes = new Uint8Array(await readFile(path.join(directory, entry.file)));
        if (birStorageDigest(bytes) !== entry.storageDigest) {
            failures.push(`${entry.name}: fixture bytes do not match the manifest storage digest`);
            continue;
        }
        const result = checkCausalConformance(bytes);
        if (result.status !== "conformant"
            || result.inputSemanticDigest !== entry.inputSemanticDigest
            || result.expectedOutcomeDigest !== entry.outcomeDigest) {
            failures.push(`${entry.name}: ${result.status}${result.firstDifference ? ` at ${result.firstDifference}` : ""}${result.detail ? ` (${result.detail})` : ""}`);
        }
    }
    if (failures.length > 0) throw new Error(`Causal conformance failed:\n${failures.join("\n")}`);
    process.stdout.write(`Reference oracle conforms to all ${manifest.fixtures.length} causal fixtures in ${directory}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
