import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
    CausalExecutionOptions,
    ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";

export async function readCausalProgram(inputPath: string): Promise<ExecutableAnchoredCausalProgram> {
    return JSON.parse(await readFile(inputPath, "utf8")) as ExecutableAnchoredCausalProgram;
}

export async function readCausalJson<T>(inputPath: string): Promise<T> {
    return JSON.parse(await readFile(inputPath, "utf8")) as T;
}

export async function emitCausalJson(payload: unknown, outputPath: string | null): Promise<void> {
    const serialized = JSON.stringify(payload, null, 2);
    if (!outputPath) {
        process.stdout.write(`${serialized}\n`);
        return;
    }
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${serialized}\n`, "utf8");
}

export function parseCausalExecutionArgs(argv: string[]): {
    inputPath: string | null;
    outputPath: string | null;
    options: CausalExecutionOptions;
} {
    const positional: string[] = [];
    const cutAnchorIds: string[] = [];
    const counterfactualInternalEventAblationLawIds: string[] = [];
    let worldWillEnabled = true;
    let evaluationBudgetPerQuery: number | undefined;
    let maxInterventionCombinations: number | undefined;
    let maxInternalFrontiers: number | undefined;
    let maxInternalBranches: number | undefined;
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index]!;
        if (argument === "--disable-world-will") {
            worldWillEnabled = false;
        } else if (argument === "--cut-anchor") {
            cutAnchorIds.push(requiredValue(argv, ++index, argument));
        } else if (argument === "--counterfactual-ablate-internal-event") {
            counterfactualInternalEventAblationLawIds.push(requiredValue(argv, ++index, argument));
        } else if (argument === "--evaluation-budget") {
            evaluationBudgetPerQuery = nonNegativeInteger(requiredValue(argv, ++index, argument), argument, false);
        } else if (argument === "--max-intervention-combinations") {
            maxInterventionCombinations = nonNegativeInteger(requiredValue(argv, ++index, argument), argument, true);
        } else if (argument === "--max-internal-frontiers") {
            maxInternalFrontiers = nonNegativeInteger(requiredValue(argv, ++index, argument), argument, false);
        } else if (argument === "--max-internal-branches") {
            maxInternalBranches = nonNegativeInteger(requiredValue(argv, ++index, argument), argument, false);
        } else if (argument.startsWith("--")) {
            throw new Error(`Unknown option: ${argument}`);
        } else {
            positional.push(argument);
        }
    }
    if (positional.length > 2) throw new Error("too many positional arguments");
    return {
        inputPath: positional[0] ?? null,
        outputPath: positional[1] ?? null,
        options: {
            worldWillEnabled,
            cutAnchorIds,
            ...(counterfactualInternalEventAblationLawIds.length > 0
                ? { counterfactualInternalEventAblationLawIds }
                : {}),
            evaluationBudgetPerQuery,
            maxInterventionCombinations,
            maxInternalFrontiers,
            maxInternalBranches,
        },
    };
}

function requiredValue(argv: string[], index: number, option: string): string {
    const value = argv[index];
    if (!value || value.startsWith("--")) throw new Error(`${option} requires a value`);
    return value;
}

function nonNegativeInteger(raw: string, option: string, allowZero: boolean): number {
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1)) {
        throw new Error(`${option} requires ${allowZero ? "a non-negative" : "a positive"} safe integer`);
    }
    return value;
}
