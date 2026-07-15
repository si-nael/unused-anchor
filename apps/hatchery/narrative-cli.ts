import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
    ExecutableAnchoredNarrativeProgram,
    NarrativeExecutionOptions,
} from "../../src/bubbles/world-kernel";

export async function readNarrativeProgram(
    inputPath: string,
): Promise<ExecutableAnchoredNarrativeProgram> {
    return JSON.parse(await readFile(inputPath, "utf8")) as ExecutableAnchoredNarrativeProgram;
}

export async function readJson<T>(inputPath: string): Promise<T> {
    return JSON.parse(await readFile(inputPath, "utf8")) as T;
}

export async function emitJson(payload: unknown, outputPath: string | null): Promise<void> {
    const serialized = JSON.stringify(payload, null, 2);
    if (!outputPath) {
        process.stdout.write(`${serialized}\n`);
        return;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${serialized}\n`, "utf8");
}

export function parseNarrativeExecutionArgs(argv: string[]): {
    inputPath: string | null;
    outputPath: string | null;
    options: NarrativeExecutionOptions;
} {
    const positional: string[] = [];
    const cutAnchorIds: string[] = [];
    let worldWillEnabled = true;
    let evaluationBudgetPerQuery: number | undefined;
    let maxInterventionCombinations: number | undefined;

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === "--disable-world-will") {
            worldWillEnabled = false;
            continue;
        }

        if (argument === "--cut-anchor") {
            cutAnchorIds.push(requiredValue(argv, ++index, "--cut-anchor"));
            continue;
        }

        if (argument === "--evaluation-budget") {
            evaluationBudgetPerQuery = positiveInteger(
                requiredValue(argv, ++index, "--evaluation-budget"),
                "--evaluation-budget",
            );
            continue;
        }

        if (argument === "--max-intervention-combinations") {
            maxInterventionCombinations = positiveInteger(
                requiredValue(argv, ++index, "--max-intervention-combinations"),
                "--max-intervention-combinations",
            );
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
        options: {
            worldWillEnabled,
            cutAnchorIds,
            evaluationBudgetPerQuery,
            maxInterventionCombinations,
        },
    };
}

function requiredValue(argv: string[], index: number, option: string): string {
    const value = argv[index];
    if (!value || value.startsWith("--")) {
        throw new Error(`${option} requires a value`);
    }

    return value;
}

function positiveInteger(raw: string, option: string): number {
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new Error(`${option} requires a positive safe integer`);
    }

    return value;
}
