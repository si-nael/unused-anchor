import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
    BubbleCompilerError,
    compileBubbleSource,
    formatDiagnostics,
} from "../../src/bubbles/language";
import {
    inspectBubbleProgram,
    type BubbleInspectionReport,
    type BubbleInspectionSection,
} from "../../src/bubbles/runtime";

async function main(): Promise<void> {
    const { inputPath, outputPath, section } = parseCliArgs(process.argv.slice(2));

    if (!inputPath) {
        throw new Error("Usage: tsx apps/hatchery/inspect-bubble.ts <input.bubble> [output.json] [--section summary|plan|artifacts|commits|trace|report]");
    }

    const source = await readFile(inputPath, "utf8");
    const result = compileBubbleSource(source, { sourcePath: inputPath });

    if (result.diagnostics.length > 0) {
        process.stderr.write(`${formatDiagnostics(result.diagnostics)}\n`);
    }

    const report = inspectBubbleProgram(result.program);
    const payload = selectSection(report, section);
    const serialized = JSON.stringify(payload, null, 2);

    if (!outputPath) {
        process.stdout.write(`${serialized}\n`);
        return;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${serialized}\n`, "utf8");
    process.stdout.write(`Inspected ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    const message =
        error instanceof BubbleCompilerError
            ? formatDiagnostics(error.diagnostics)
            : error instanceof Error
                ? error.message
                : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
});

function selectSection(report: BubbleInspectionReport, section: BubbleInspectionSection): unknown {
    switch (section) {
        case "summary":
            return report.summary;
        case "plan":
            return report.plan;
        case "artifacts":
            return report.artifacts;
        case "commits":
            return report.commits;
        case "trace":
            return report.trace;
        case "report":
            return report;
        default:
            return assertNever(section);
    }
}

function parseCliArgs(argv: string[]): {
    inputPath: string | null;
    outputPath: string | null;
    section: BubbleInspectionSection;
} {
    let section: BubbleInspectionSection = "report";
    const positional: string[] = [];

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === "--section") {
            const rawSection = argv[index + 1];
            if (!rawSection || !isInspectionSection(rawSection)) {
                throw new Error("--section requires one of: summary, plan, artifacts, commits, trace, report");
            }

            section = rawSection;
            index += 1;
            continue;
        }

        positional.push(argument);
    }

    return {
        inputPath: positional[0] ?? null,
        outputPath: positional[1] ?? null,
        section,
    };
}

function isInspectionSection(value: string): value is BubbleInspectionSection {
    return value === "summary"
        || value === "plan"
        || value === "artifacts"
        || value === "commits"
        || value === "trace"
        || value === "report";
}

function assertNever(value: never): never {
    throw new Error(`Unhandled inspection section: ${String(value)}`);
}