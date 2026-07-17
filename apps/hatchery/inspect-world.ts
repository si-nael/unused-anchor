import {
    inspectAnchoredCausalRun,
    realizeAnchoredCausalWorld,
    type AnchoredCausalInspection,
} from "../../src/bubbles/world-kernel";
import { emitCausalJson, parseCausalExecutionArgs, readCausalProgram } from "./causal-cli";

type InspectionSection = "summary" | "decision" | "continuations" | "formal-evidence" | "report";

async function main(): Promise<void> {
    const { executionArgs, section } = parseArgs(process.argv.slice(2));
    const { inputPath, outputPath, options } = parseCausalExecutionArgs(executionArgs);
    if (!inputPath) throw new Error("Usage: tsx apps/hatchery/inspect-world.ts <program.json|causal.bubble> [output.json] [--section <section>] [causal options]");
    const program = await readCausalProgram(inputPath);
    const inspection = inspectAnchoredCausalRun(realizeAnchoredCausalWorld(program, options));
    await emitCausalJson(selectSection(inspection, section), outputPath);
    if (outputPath) process.stdout.write(`Inspected anchored causal world ${inputPath} -> ${outputPath}\n`);
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
        if (!value || !isSection(value)) throw new Error("--section requires summary, decision, continuations, formal-evidence, or report");
        section = value;
    }
    return { executionArgs, section };
}

function selectSection(inspection: AnchoredCausalInspection, section: InspectionSection): unknown {
    if (section === "summary") return inspection.summary;
    if (section === "decision") return inspection.decision;
    if (section === "continuations") return inspection.continuations;
    if (section === "formal-evidence") return inspection.formalEvidence;
    return inspection;
}

function isSection(value: string): value is InspectionSection {
    return ["summary", "decision", "continuations", "formal-evidence", "report"].includes(value);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
