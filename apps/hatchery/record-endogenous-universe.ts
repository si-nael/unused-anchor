import { recordEndogenousConnectedUniverse } from "../../src/bubbles/world-kernel";
import {
    emitEndogenousJson,
    parseEndogenousExecutionArgs,
    readEndogenousProgram,
} from "./endogenous-cli";

async function main(): Promise<void> {
    const { inputPath, outputPath, options } = parseEndogenousExecutionArgs(process.argv.slice(2));
    if (!inputPath) throw new Error("Usage: tsx apps/hatchery/record-endogenous-universe.ts <program.bubble|program.json> [output.json] [options]");
    const program = await readEndogenousProgram(inputPath);
    await emitEndogenousJson(recordEndogenousConnectedUniverse(program, options), outputPath);
    if (outputPath) process.stdout.write(`Recorded endogenous connected universe ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
