import {
    inspectTeleonomicCausalRun,
    realizeTeleonomicCausalWorld,
    type TeleonomicCausalInspection,
} from "../../src/bubbles/world-kernel";
import { emitCausalJson } from "./causal-cli";
import { parsePersistentExecutionArgs, readPersistentProgram } from "./persistent-cli";

type InspectionSection = "summary" | "persistent" | "assessments" | "report";

async function main(): Promise<void> {
    const { executionArgs, section } = parseArgs(process.argv.slice(2));
    const { inputPath, outputPath, options } = parsePersistentExecutionArgs(executionArgs);
    if (!inputPath) throw new Error("Usage: tsx apps/hatchery/inspect-teleonomic-world.ts <program.json> [output.json] [--section <section>] [options]");
    const program = await readPersistentProgram(inputPath);
    const inspection = inspectTeleonomicCausalRun(realizeTeleonomicCausalWorld(program, options));
    await emitCausalJson(selectSection(inspection, section), outputPath);
    if (outputPath) process.stdout.write(`Inspected teleonomic causal world ${inputPath} -> ${outputPath}\n`);
}

function parseArgs(argv: string[]): { executionArgs: string[]; section: InspectionSection } {
    const executionArgs: string[] = [];
    let section: InspectionSection = "report";
    for (let index = 0; index < argv.length; index += 1) {
        if (argv[index] !== "--section") {
            executionArgs.push(argv[index]!);
            continue;
        }
        const value = argv[++index];
        if (!value || !isSection(value)) throw new Error("--section requires summary, persistent, assessments, or report");
        section = value;
    }
    return { executionArgs, section };
}

function selectSection(inspection: TeleonomicCausalInspection, section: InspectionSection): unknown {
    if (section === "summary") return inspection.summary;
    if (section === "persistent") return inspection.persistentSummary;
    if (section === "assessments") return inspection.assessments;
    return inspection;
}

function isSection(value: string): value is InspectionSection {
    return ["summary", "persistent", "assessments", "report"].includes(value);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
