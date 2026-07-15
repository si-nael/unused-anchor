import {
    recordAnchoredNarrativeWorld,
} from "../../src/bubbles/world-kernel";
import {
    emitJson,
    parseNarrativeExecutionArgs,
    readNarrativeProgram,
} from "./narrative-cli";

async function main(): Promise<void> {
    const { inputPath, outputPath, options } = parseNarrativeExecutionArgs(process.argv.slice(2));
    if (!inputPath) {
        throw new Error("Usage: tsx apps/hatchery/record-narrative.ts <program.json> [output.json] [--disable-world-will] [--cut-anchor <id>] [--evaluation-budget <n>] [--max-intervention-combinations <n>]");
    }

    const program = await readNarrativeProgram(inputPath);
    await emitJson(recordAnchoredNarrativeWorld(program, options), outputPath);

    if (outputPath) {
        process.stdout.write(`Recorded anchored narrative ${inputPath} -> ${outputPath}\n`);
    }
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
