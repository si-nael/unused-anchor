import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { compileEndogenousBubbleSource } from "../../src/bubbles/language";
import type {
    EndogenousConnectedUniverseExecutionOptions,
    EndogenousUniverseProgram,
} from "../../src/bubbles/world-kernel";

function positiveInteger(source: string | undefined, flag: string, allowZero = false): number {
    if (source === undefined || !/^(0|[1-9][0-9]*)$/.test(source)) {
        throw new Error(`${flag} needs a ${allowZero ? "non-negative" : "positive"} integer`);
    }
    const value = Number(source);
    if (!Number.isSafeInteger(value) || (allowZero ? value < 0 : value < 1)) {
        throw new Error(`${flag} is outside the supported safe-integer boundary`);
    }
    return value;
}

export async function readEndogenousProgram(inputPath: string): Promise<EndogenousUniverseProgram> {
    const source = await readFile(inputPath, "utf8");
    if (source.trimStart().startsWith("{")) return JSON.parse(source) as EndogenousUniverseProgram;
    return compileEndogenousBubbleSource(source, { sourcePath: inputPath }).program;
}

export async function readEndogenousJson<T>(inputPath: string): Promise<T> {
    return JSON.parse(await readFile(inputPath, "utf8")) as T;
}

export async function emitEndogenousJson(payload: unknown, outputPath: string | null): Promise<void> {
    const serialized = JSON.stringify(payload, null, 2);
    if (!outputPath) {
        process.stdout.write(`${serialized}\n`);
        return;
    }
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${serialized}\n`, "utf8");
}

export function parseEndogenousExecutionArgs(argv: string[]): {
    inputPath: string | null;
    outputPath: string | null;
    options: EndogenousConnectedUniverseExecutionOptions;
} {
    const positional: string[] = [];
    const generation: NonNullable<EndogenousConnectedUniverseExecutionOptions["generation"]> = {};
    const causal: NonNullable<EndogenousConnectedUniverseExecutionOptions["causal"]> = {};
    let maxGenerationClosures: number | undefined;
    let maxGenerationBranches: number | undefined;
    for (let index = 0; index < argv.length; index += 1) {
        const value = argv[index]!;
        if (!value.startsWith("--")) {
            positional.push(value);
            continue;
        }
        if (value === "--max-depth") generation.maxDepth = positiveInteger(argv[++index], value, true);
        else if (value === "--max-worlds") generation.maxWorlds = positiveInteger(argv[++index], value);
        else if (value === "--natural-coordinate-limit") generation.naturalCoordinateLimit = positiveInteger(argv[++index], value);
        else if (value === "--evaluation-budget") {
            const budget = positiveInteger(argv[++index], value);
            generation.evaluationBudgetPerQuery = budget;
            causal.evaluationBudgetPerQuery = budget;
        } else if (value === "--max-internal-frontiers") causal.maxInternalFrontiers = positiveInteger(argv[++index], value);
        else if (value === "--max-internal-branches") causal.maxInternalBranches = positiveInteger(argv[++index], value);
        else if (value === "--max-generation-closures") maxGenerationClosures = positiveInteger(argv[++index], value);
        else if (value === "--max-generation-branches") maxGenerationBranches = positiveInteger(argv[++index], value);
        else throw new Error(`Unknown endogenous-universe option '${value}'`);
    }
    if (positional.length > 2) throw new Error("expected at most one input and one output path");
    return {
        inputPath: positional[0] ?? null,
        outputPath: positional[1] ?? null,
        options: {
            ...(Object.keys(generation).length > 0 ? { generation } : {}),
            ...(Object.keys(causal).length > 0 ? { causal } : {}),
            ...(maxGenerationClosures !== undefined ? { maxGenerationClosures } : {}),
            ...(maxGenerationBranches !== undefined ? { maxGenerationBranches } : {}),
        },
    };
}
