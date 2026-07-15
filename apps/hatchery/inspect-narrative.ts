import {
    inspectAnchoredNarrativeRun,
    realizeAnchoredNarrativeWorld,
    type AnchoredNarrativeInspection,
} from "../../src/bubbles/world-kernel";
import {
    emitJson,
    parseNarrativeExecutionArgs,
    readNarrativeProgram,
} from "./narrative-cli";

type InspectionSection = "summary" | "decision" | "continuations" | "formal-evidence" | "report";

async function main(): Promise<void> {
    const { executionArgs, section } = parseArgs(process.argv.slice(2));
    const { inputPath, outputPath, options } = parseNarrativeExecutionArgs(executionArgs);
    if (!inputPath) {
        throw new Error("Usage: tsx apps/hatchery/inspect-narrative.ts <program.json> [output.json] [--section summary|decision|continuations|formal-evidence|report] [--disable-world-will] [--cut-anchor <id>] [--evaluation-budget <n>] [--max-intervention-combinations <n>]");
    }

    const program = await readNarrativeProgram(inputPath);
    const inspection = inspectAnchoredNarrativeRun(realizeAnchoredNarrativeWorld(program, options));
    await emitJson(selectSection(inspection, section), outputPath);

    if (outputPath) {
        process.stdout.write(`Inspected anchored narrative ${inputPath} -> ${outputPath}\n`);
    }
}

function parseArgs(argv: string[]): { executionArgs: string[]; section: InspectionSection } {
    const executionArgs: string[] = [];
    let section: InspectionSection = "report";

    for (let index = 0; index < argv.length; index += 1) {
        if (argv[index] !== "--section") {
            executionArgs.push(argv[index]);
            continue;
        }

        const value = argv[++index];
        if (!value || !isSection(value)) {
            throw new Error("--section requires one of: summary, decision, continuations, formal-evidence, report");
        }
        section = value;
    }

    return { executionArgs, section };
}

function selectSection(inspection: AnchoredNarrativeInspection, section: InspectionSection): unknown {
    switch (section) {
        case "summary": return inspection.summary;
        case "decision": return inspection.decision;
        case "continuations": return inspection.continuations;
        case "formal-evidence": return inspection.formalEvidence;
        case "report": return inspection;
    }
}

function isSection(value: string): value is InspectionSection {
    return value === "summary"
        || value === "decision"
        || value === "continuations"
        || value === "formal-evidence"
        || value === "report";
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
