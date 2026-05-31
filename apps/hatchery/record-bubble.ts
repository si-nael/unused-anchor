import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
    compileBubbleSource,
    BubbleCompilerError,
    formatDiagnostics,
} from "../../src/bubbles/language";
import {
    recordBubbleProgram,
    type BubbleObservationCommitPolicyOverride,
    type BubbleObservationCommitPolicySelectionRule,
    type BubbleRuntimeOptions,
} from "../../src/bubbles/runtime";

async function main(): Promise<void> {
    const { inputPath, outputPath, options } = parseCliArgs(process.argv.slice(2));

    if (!inputPath) {
        throw new Error("Usage: tsx apps/hatchery/record-bubble.ts <input.bubble> [output.json] [--observation-policy-override <commit-single-observed-region|commit-hidden-region-with-latent-bubble-siblings|defer-multiple-hidden-region-targets|defer-no-eligible-observed-target>]");
    }

    const source = await readFile(inputPath, "utf8");
    const result = compileBubbleSource(source, { sourcePath: inputPath });

    if (result.diagnostics.length > 0) {
        process.stderr.write(`${formatDiagnostics(result.diagnostics)}\n`);
    }

    const record = recordBubbleProgram(result.program, options);
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
    options: BubbleRuntimeOptions;
} {
    const positional: string[] = [];
    let observationCommitPolicyOverride: BubbleObservationCommitPolicyOverride | null = null;

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === "--observation-policy-override") {
            const rawRule = argv[index + 1];
            if (!rawRule || !isObservationPolicyRule(rawRule)) {
                throw new Error("--observation-policy-override requires one of: commit-single-observed-region, commit-hidden-region-with-latent-bubble-siblings, defer-multiple-hidden-region-targets, defer-no-eligible-observed-target");
            }

            observationCommitPolicyOverride = createObservationCommitPolicyOverride(rawRule, "record CLI override");
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
        options: {
            observationCommitPolicyOverride,
        },
    };
}

function isObservationPolicyRule(value: string): value is BubbleObservationCommitPolicySelectionRule {
    return value === "commit-single-observed-region"
        || value === "commit-hidden-region-with-latent-bubble-siblings"
        || value === "defer-multiple-hidden-region-targets"
        || value === "defer-no-eligible-observed-target";
}

function createObservationCommitPolicyOverride(
    forcedSelectionRule: BubbleObservationCommitPolicySelectionRule,
    reason: string,
): BubbleObservationCommitPolicyOverride {
    return {
        mode: "runtime-observation-commit-policy-override.v1",
        source: "runtime-option",
        forcedSelectionRule,
        reason,
    };
}