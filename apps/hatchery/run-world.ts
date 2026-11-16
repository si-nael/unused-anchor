import { realizeAnchoredCausalWorld } from "../../src/bubbles/world-kernel";
import { emitCausalJson, parseCausalExecutionArgs, readCausalInput } from "./causal-cli";

async function main(): Promise<void> {
    const { inputPath, outputPath, options: cliOptions, explicitOptionCount } = parseCausalExecutionArgs(process.argv.slice(2));
    if (!inputPath) throw new Error("Usage: tsx apps/hatchery/run-world.ts <program.json|causal.bubble> [output.json] [causal options]");
    const { program, options } = await readCausalInput(inputPath, cliOptions, explicitOptionCount);
    await emitCausalJson(realizeAnchoredCausalWorld(program, options), outputPath);
    if (outputPath) process.stdout.write(`Realized anchored causal world ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
