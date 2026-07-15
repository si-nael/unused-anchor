import {
    replayAnchoredCausalRecord,
    type AnchoredCausalReplayRecord,
} from "../../src/bubbles/world-kernel";
import { emitCausalJson, readCausalJson } from "./causal-cli";

async function main(): Promise<void> {
    const [inputPath, outputPath, ...extra] = process.argv.slice(2);
    if (!inputPath || extra.length > 0) throw new Error("Usage: tsx apps/hatchery/replay-world.ts <record.json> [output.json]");
    const record = await readCausalJson<AnchoredCausalReplayRecord>(inputPath);
    await emitCausalJson(replayAnchoredCausalRecord(record), outputPath ?? null);
    if (outputPath) process.stdout.write(`Replayed anchored causal world ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
