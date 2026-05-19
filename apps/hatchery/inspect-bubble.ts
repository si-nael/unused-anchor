import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
    BubbleCompilerError,
    compileBubbleSource,
    formatDiagnostics,
} from "../../src/bubbles/language";
import {
    inspectBubbleProgram,
    type BubbleInspectionQuery,
    type BubbleInspectionReport,
    type BubbleInspectionSection,
} from "../../src/bubbles/runtime";

async function main(): Promise<void> {
    const { inputPath, outputPath, section, query } = parseCliArgs(process.argv.slice(2));

    if (!inputPath) {
        throw new Error("Usage: tsx apps/hatchery/inspect-bubble.ts <input.bubble> [output.json] [--section summary|plan|ontology|grammars|artifacts|commits|evidence|trace|report] [--emission <id>] [--address <id>] [--activation <id>] [--grammar-profile <name>] [--kind <trace-kind>]");
    }

    const source = await readFile(inputPath, "utf8");
    const result = compileBubbleSource(source, { sourcePath: inputPath });

    if (result.diagnostics.length > 0) {
        process.stderr.write(`${formatDiagnostics(result.diagnostics)}\n`);
    }

    const report = inspectBubbleProgram(result.program, query);
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
        case "ontology":
            return report.ontology;
        case "grammars":
            return report.grammars;
        case "artifacts":
            return report.artifacts;
        case "commits":
            return report.commits;
        case "evidence":
            return report.evidence;
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
    query: BubbleInspectionQuery;
} {
    let section: BubbleInspectionSection = "report";
    const query: BubbleInspectionQuery = {};
    const positional: string[] = [];

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === "--section") {
            const rawSection = argv[index + 1];
            if (!rawSection || !isInspectionSection(rawSection)) {
                throw new Error("--section requires one of: summary, plan, ontology, grammars, artifacts, commits, evidence, trace, report");
            }

            section = rawSection;
            index += 1;
            continue;
        }

        if (argument === "--emission") {
            const emissionId = argv[index + 1];
            if (!emissionId) {
                throw new Error("--emission requires an emission id value");
            }

            query.emissionId = emissionId;
            index += 1;
            continue;
        }

        if (argument === "--address") {
            const addressId = argv[index + 1];
            if (!addressId) {
                throw new Error("--address requires an address id value");
            }

            query.addressId = addressId;
            index += 1;
            continue;
        }

        if (argument === "--activation") {
            const activationId = argv[index + 1];
            if (!activationId) {
                throw new Error("--activation requires a grammar activation id value");
            }

            query.activationId = activationId;
            index += 1;
            continue;
        }

        if (argument === "--grammar-profile") {
            const grammarProfile = argv[index + 1];
            if (!grammarProfile) {
                throw new Error("--grammar-profile requires a profile name value");
            }

            query.grammarProfile = grammarProfile;
            index += 1;
            continue;
        }

        if (argument === "--kind" || argument === "--trace-kind") {
            const rawKind = argv[index + 1];
            if (!rawKind || !isTraceKind(rawKind)) {
                throw new Error("--kind requires one of: materialization-started, grammar-activation-staged, no-emissions, reflection-captured, emission-materialized, materialization-committed");
            }

            query.kind = rawKind;
            index += 1;
            continue;
        }

        if (argument.startsWith("--")) {
            throw new Error(`Unknown option: ${argument}`);
        }

        positional.push(argument);
    }

    return {
        inputPath: positional[0] ?? null,
        outputPath: positional[1] ?? null,
        section,
        query,
    };
}

function isInspectionSection(value: string): value is BubbleInspectionSection {
    return value === "summary"
        || value === "plan"
        || value === "ontology"
        || value === "grammars"
        || value === "artifacts"
        || value === "commits"
        || value === "evidence"
        || value === "trace"
        || value === "report";
}

function isTraceKind(value: string): value is NonNullable<BubbleInspectionQuery["kind"]> {
    return value === "materialization-started"
        || value === "grammar-activation-staged"
        || value === "no-emissions"
        || value === "reflection-captured"
        || value === "emission-materialized"
        || value === "materialization-committed";
}

function assertNever(value: never): never {
    throw new Error(`Unhandled inspection section: ${String(value)}`);
}