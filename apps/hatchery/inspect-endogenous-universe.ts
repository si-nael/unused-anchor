import {
    inspectEndogenousConnectedUniverseRun,
    realizeEndogenousConnectedUniverse,
    type EndogenousConnectedUniverseInspection,
} from "../../src/bubbles/world-kernel";
import {
    emitEndogenousJson,
    parseEndogenousExecutionArgs,
    readEndogenousProgram,
} from "./endogenous-cli";

type InspectionSection = "summary" | "topology" | "world-continuations" | "causal" | "report";

function parseArgs(argv: string[]): { executionArgs: string[]; section: InspectionSection } {
    const executionArgs: string[] = [];
    let section: InspectionSection = "report";
    for (let index = 0; index < argv.length; index += 1) {
        if (argv[index] === "--section") {
            const value = argv[++index] as InspectionSection | undefined;
            if (!value || !["summary", "topology", "world-continuations", "causal", "report"].includes(value)) {
                throw new Error("--section needs summary, topology, world-continuations, causal, or report");
            }
            section = value;
        } else executionArgs.push(argv[index]!);
    }
    return { executionArgs, section };
}

function selectSection(inspection: EndogenousConnectedUniverseInspection, section: InspectionSection): unknown {
    if (section === "summary") return inspection.summary;
    if (section === "topology") return inspection.topology;
    if (section === "world-continuations") return inspection.worldContinuations;
    if (section === "causal") return inspection.causal ?? null;
    return inspection;
}

async function main(): Promise<void> {
    const { executionArgs, section } = parseArgs(process.argv.slice(2));
    const { inputPath, outputPath, options } = parseEndogenousExecutionArgs(executionArgs);
    if (!inputPath) throw new Error("Usage: tsx apps/hatchery/inspect-endogenous-universe.ts <program.bubble|program.json> [output.json] [--section <section>] [options]");
    const program = await readEndogenousProgram(inputPath);
    const inspection = inspectEndogenousConnectedUniverseRun(realizeEndogenousConnectedUniverse(program, options));
    await emitEndogenousJson(selectSection(inspection, section), outputPath);
    if (outputPath) process.stdout.write(`Inspected endogenous connected universe ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
