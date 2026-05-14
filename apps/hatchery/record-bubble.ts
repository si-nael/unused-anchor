import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
    BubbleCompilerError,
    compileBubbleSource,
    formatDiagnostics,
} from "../../src/bubbles/language";
import { recordBubbleProgram } from "../../src/bubbles/runtime";

async function main(): Promise<void> {
    const { inputPath, outputPath } = parseCliArgs(process.argv.slice(2));

    if (!inputPath) {
        throw new Error("Usage: tsx apps/hatchery/record-bubble.ts <input.bubble> [output.json]");
    }

    const source = await readFile(inputPath, "utf8");
    const result = compileBubbleSource(source, { sourcePath: inputPath });

    if (result.diagnostics.length > 0) {
        process.stderr.write(`${formatDiagnostics(result.diagnostics)}\n`);
    }

    const record = recordBubbleProgram(result.program);
    const serialized = JSON.stringify(record, null, 2);

    if (!outputPath) {
        process.stdout.write(`${serialized}\n`);
        return;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${serialized}\n`, "utf8");
    process.stdout.write(`Recorded ${inputPath} -> ${outputPath}\n`);
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

function parseCliArgs(argv: string[]): {
    inputPath: string | null;
    outputPath: string | null;
} {
    const positional = argv.filter((argument) => !argument.startsWith("--"));
    return {
        inputPath: positional[0] ?? null,
        outputPath: positional[1] ?? null,
    };
}