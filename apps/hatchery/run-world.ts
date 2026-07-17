import { realizeAnchoredCausalWorld } from "../../src/bubbles/world-kernel";
import { emitCausalJson, parseCausalExecutionArgs, readCausalProgram } from "./causal-cli";

async function main(): Promise<void> {
    const { inputPath, outputPath, options } = parseCausalExecutionArgs(process.argv.slice(2));
    if (!inputPath) throw new Error("Usage: tsx apps/hatchery/run-world.ts <program.json|causal.bubble> [output.json] [causal options]");
    const program = await readCausalProgram(inputPath);
    await emitCausalJson(realizeAnchoredCausalWorld(program, options), outputPath);
    if (outputPath) process.stdout.write(`Realized anchored causal world ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
