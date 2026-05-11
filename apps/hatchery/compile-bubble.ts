import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
    BubbleCompilerError,
    compileBubbleSource,
    formatDiagnostics,
} from "../../src/bubbles/language";

async function main(): Promise<void> {
    const { checkOnly, inputPath, outputPath } = parseCliArgs(process.argv.slice(2));

    if (!inputPath) {
        throw new Error("Usage: tsx apps/hatchery/compile-bubble.ts <input.bubble> [output.json]");
    }

    const source = await readFile(inputPath, "utf8");
    const result = compileBubbleSource(source, { sourcePath: inputPath });

    if (result.diagnostics.length > 0) {
        process.stderr.write(`${formatDiagnostics(result.diagnostics)}\n`);
    }

    const serialized = JSON.stringify(result.program, null, 2);

    if (checkOnly) {
        process.stdout.write(`Validated ${inputPath}\n`);
        return;
    }

    if (!outputPath) {
        process.stdout.write(`${serialized}\n`);
        return;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${serialized}\n`, "utf8");
    process.stdout.write(`Compiled ${inputPath} -> ${outputPath}\n`);
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
    checkOnly: boolean;
    inputPath: string | null;
    outputPath: string | null;
} {
    let checkOnly = false;
    const positional: string[] = [];

    for (const argument of argv) {
        if (argument === "--check") {
            checkOnly = true;
            continue;
        }

        positional.push(argument);
    }

    return {
        checkOnly,
        inputPath: positional[0] ?? null,
        outputPath: positional[1] ?? null,
    };
}
