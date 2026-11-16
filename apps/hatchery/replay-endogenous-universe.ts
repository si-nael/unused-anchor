import {
    replayEndogenousConnectedUniverse,
    type EndogenousConnectedUniverseReplayRecord,
} from "../../src/bubbles/world-kernel";
import { emitEndogenousJson, readEndogenousJson } from "./endogenous-cli";

async function main(): Promise<void> {
    const [inputPath, outputPath, ...extra] = process.argv.slice(2);
    if (!inputPath || extra.length > 0) throw new Error("Usage: tsx apps/hatchery/replay-endogenous-universe.ts <record.json> [output.json]");
    const record = await readEndogenousJson<EndogenousConnectedUniverseReplayRecord>(inputPath);
    await emitEndogenousJson(replayEndogenousConnectedUniverse(record), outputPath ?? null);
    if (outputPath) process.stdout.write(`Replayed endogenous connected universe ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
