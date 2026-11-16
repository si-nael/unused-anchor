// Confirms that a run executed from a BIR document is the same world as the run executed from its source.
// Only `programDigest` may differ: it identifies the host TypeScript object (backend program identity),
// whose array order is canonicalized by BIR lifting.
import { readCausalJson } from "./causal-cli";
import type { AnchoredCausalRun } from "../../src/bubbles/world-kernel";

function stable(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

async function main(): Promise<void> {
    const [sourceRunPath, birRunPath] = process.argv.slice(2);
    if (!sourceRunPath || !birRunPath) {
        throw new Error("Usage: tsx apps/hatchery/check-bir-equivalence.ts <source-run.json> <bir-run.json>");
    }
    const { programDigest: _source, ...sourceRun } = await readCausalJson<AnchoredCausalRun>(sourceRunPath);
    const { programDigest: _bir, ...birRun } = await readCausalJson<AnchoredCausalRun>(birRunPath);
    if (stable(sourceRun) !== stable(birRun)) {
        throw new Error(`BIR execution drifted from source execution: ${sourceRunPath} vs ${birRunPath}`);
    }
    process.stdout.write(`BIR execution matches source execution: ${birRunPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
