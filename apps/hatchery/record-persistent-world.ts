import { recordPersistentCausalReplay } from "../../src/bubbles/world-kernel";
import { emitCausalJson } from "./causal-cli";
import { parsePersistentExecutionArgs, readPersistentProgram } from "./persistent-cli";

async function main(): Promise<void> {
    const { inputPath, outputPath, options } = parsePersistentExecutionArgs(process.argv.slice(2));
    if (!inputPath) throw new Error("Usage: tsx apps/hatchery/record-persistent-world.ts <program.json> [output.json] [options]");
    const program = await readPersistentProgram(inputPath);
    await emitCausalJson(recordPersistentCausalReplay(program, options), outputPath);
    if (outputPath) process.stdout.write(`Recorded persistent causal world ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
