import {
    replayAnchoredNarrativeWorld,
    type AnchoredNarrativeReplayRecord,
} from "../../src/bubbles/world-kernel";
import { emitJson, readJson } from "./narrative-cli";

async function main(): Promise<void> {
    const [inputPath, outputPath, ...extra] = process.argv.slice(2);
    if (!inputPath || extra.length > 0) {
        throw new Error("Usage: tsx apps/hatchery/replay-narrative.ts <record.json> [output.json]");
    }

    const record = await readJson<AnchoredNarrativeReplayRecord>(inputPath);
    await emitJson(replayAnchoredNarrativeWorld(record), outputPath ?? null);

    if (outputPath) {
        process.stdout.write(`Replayed anchored narrative ${inputPath} -> ${outputPath}\n`);
    }
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
