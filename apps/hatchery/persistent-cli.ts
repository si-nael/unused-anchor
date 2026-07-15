import { readFile } from "node:fs/promises";
import type {
    PersistentCausalExecutionOptions,
    PersistentCausalProgram,
} from "../../src/bubbles/world-kernel";
import { parseCausalExecutionArgs } from "./causal-cli";

export async function readPersistentProgram(inputPath: string): Promise<PersistentCausalProgram> {
    return JSON.parse(await readFile(inputPath, "utf8")) as PersistentCausalProgram;
}

export function parsePersistentExecutionArgs(argv: string[]): {
    inputPath: string | null;
    outputPath: string | null;
    options: PersistentCausalExecutionOptions;
} {
    const causalArgs: string[] = [];
    let maxClosures: number | undefined;
    let maxPaths: number | undefined;
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index]!;
        if (argument === "--max-closures") {
            maxClosures = positiveInteger(requiredValue(argv, ++index, argument), argument);
        } else if (argument === "--max-paths") {
            maxPaths = positiveInteger(requiredValue(argv, ++index, argument), argument);
        } else {
            causalArgs.push(argument);
        }
    }
    const causal = parseCausalExecutionArgs(causalArgs);
    return {
        inputPath: causal.inputPath,
        outputPath: causal.outputPath,
        options: {
            ...(maxClosures === undefined ? {} : { maxClosures }),
            ...(maxPaths === undefined ? {} : { maxPaths }),
            causalOptions: causal.options,
        },
    };
}

function requiredValue(argv: string[], index: number, option: string): string {
    const value = argv[index];
    if (!value || value.startsWith("--")) throw new Error(`${option} requires a value`);
    return value;
}

function positiveInteger(raw: string, option: string): number {
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${option} requires a positive safe integer`);
    return value;
}
