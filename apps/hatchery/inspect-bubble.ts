import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
    BubbleCompilerError,
    compileBubbleSource,
    formatDiagnostics,
} from "../../src/bubbles/language";
import {
    inspectBubbleProgram,
    type BubbleObservationCommitPolicyOverride,
    type BubbleObservationCommitPolicySelectionRule,
    type BubbleInspectionQuery,
    type BubbleInspectionReport,
    type BubbleInspectionSection,
    type BubbleRuntimeOptions,
} from "../../src/bubbles/runtime";

async function main(): Promise<void> {
    const { inputPath, outputPath, section, query, options } = parseCliArgs(process.argv.slice(2));

    if (!inputPath) {
        throw new Error("Usage: tsx apps/hatchery/inspect-bubble.ts <input.bubble> [output.json] [--section summary|plan|selfRealization|externalObservationLimit|observationCommitPolicy|observationCommitPolicyComparison|ontology|semantics|proof|bundle|grammars|artifacts|commits|evidence|sourceAttributions|observationStates|trace|report] [--observation-policy-override <commit-single-observed-region|commit-hidden-region-with-latent-bubble-siblings|defer-multiple-hidden-region-targets|defer-no-eligible-observed-target>] [--emission <id>] [--address <id>] [--activation <id>] [--grammar-profile <name>] [--observation-state <id>] [--observation-phase <observed-uncommitted|observed-history-open|observed-committed>] [--observation-policy-rule <commit-single-observed-region|commit-hidden-region-with-latent-bubble-siblings|defer-multiple-hidden-region-targets|defer-no-eligible-observed-target>] [--observation-history-shape <fully-committed|partially-committed|history-open-only|uncommitted-only|mixed-open>] [--semantic <id>] [--semantic-kind <constraint|partial-law|anchor-criterion>] [--semantic-status <satisfied|violated|undetermined>] [--claim <id>] [--claim-kind <syntax|worldhood|effect|anchor|lineage|consistency|replay|self-realization>] [--claim-status <certified|contradicted|undetermined>] [--evidence-kind <kind>] [--attribution-status <resolved|unresolved>] [--attribution <internal-world-event|negative-sea-pressure|anchor-drift|positive-sea-shift|unresolved-source>] [--kind <trace-kind>]");
    }

    const source = await readFile(inputPath, "utf8");
    const result = compileBubbleSource(source, { sourcePath: inputPath });

    if (result.diagnostics.length > 0) {
        process.stderr.write(`${formatDiagnostics(result.diagnostics)}\n`);
    }

    const report = inspectBubbleProgram(result.program, query, options);
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
        case "selfRealization":
            return report.selfRealization;
        case "externalObservationLimit":
            return report.externalObservationLimit;
        case "observationCommitPolicy":
            return report.observationCommitPolicy;
        case "observationCommitPolicyComparison":
            return report.observationCommitPolicyComparison;
        case "ontology":
            return report.ontology;
        case "semantics":
            return report.semantics;
        case "proof":
            return report.proof;
        case "bundle":
            return report.bundle;
        case "grammars":
            return report.grammars;
        case "artifacts":
            return report.artifacts;
        case "commits":
            return report.commits;
        case "evidence":
            return report.evidence;
        case "sourceAttributions":
            return report.sourceAttributions;
        case "observationStates":
            return report.observationStates;
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
    options: BubbleRuntimeOptions;
} {
    let section: BubbleInspectionSection = "report";
    const query: BubbleInspectionQuery = {};
    let observationCommitPolicyOverride: BubbleObservationCommitPolicyOverride | null = null;
    const positional: string[] = [];

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === "--section") {
            const rawSection = argv[index + 1];
            if (!rawSection || !isInspectionSection(rawSection)) {
                throw new Error("--section requires one of: summary, plan, selfRealization, externalObservationLimit, observationCommitPolicy, observationCommitPolicyComparison, ontology, semantics, proof, bundle, grammars, artifacts, commits, evidence, observationStates, trace, report");
            }

            section = rawSection;
            index += 1;
            continue;
        }

        if (argument === "--observation-policy-override") {
            const rawRule = argv[index + 1];
            if (!rawRule || !isObservationPolicyRule(rawRule)) {
                throw new Error("--observation-policy-override requires one of: commit-single-observed-region, commit-hidden-region-with-latent-bubble-siblings, defer-multiple-hidden-region-targets, defer-no-eligible-observed-target");
            }

            observationCommitPolicyOverride = createObservationCommitPolicyOverride(rawRule, "inspect CLI override");
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

        if (argument === "--observation-state") {
            const observationStateId = argv[index + 1];
            if (!observationStateId) {
                throw new Error("--observation-state requires an observation state id value");
            }

            query.observationStateId = observationStateId;
            index += 1;
            continue;
        }

        if (argument === "--observation-phase") {
            const rawPhase = argv[index + 1];
            if (!rawPhase || !isObservationStatePhase(rawPhase)) {
                throw new Error("--observation-phase requires one of: observed-uncommitted, observed-history-open, observed-committed");
            }

            query.observationStatePhase = rawPhase;
            index += 1;
            continue;
        }

        if (argument === "--observation-policy-rule") {
            const rawRule = argv[index + 1];
            if (!rawRule || !isObservationPolicyRule(rawRule)) {
                throw new Error("--observation-policy-rule requires one of: commit-single-observed-region, commit-hidden-region-with-latent-bubble-siblings, defer-multiple-hidden-region-targets, defer-no-eligible-observed-target");
            }

            query.observationPolicyRule = rawRule;
            index += 1;
            continue;
        }

        if (argument === "--observation-history-shape") {
            const rawShape = argv[index + 1];
            if (!rawShape || !isObservationHistoryShape(rawShape)) {
                throw new Error("--observation-history-shape requires one of: fully-committed, partially-committed, history-open-only, uncommitted-only, mixed-open");
            }

            query.observationHistoryShape = rawShape;
            index += 1;
            continue;
        }

        if (argument === "--semantic") {
            const semanticId = argv[index + 1];
            if (!semanticId) {
                throw new Error("--semantic requires a semantic subject or evaluation id value");
            }

            query.semanticId = semanticId;
            index += 1;
            continue;
        }

        if (argument === "--semantic-kind") {
            const rawKind = argv[index + 1];
            if (!rawKind || !isSemanticKind(rawKind)) {
                throw new Error("--semantic-kind requires one of: constraint, partial-law, anchor-criterion");
            }

            query.semanticKind = rawKind;
            index += 1;
            continue;
        }

        if (argument === "--semantic-status") {
            const rawStatus = argv[index + 1];
            if (!rawStatus || !isSemanticStatus(rawStatus)) {
                throw new Error("--semantic-status requires one of: satisfied, violated, undetermined");
            }

            query.semanticStatus = rawStatus;
            index += 1;
            continue;
        }

        if (argument === "--claim") {
            const claimId = argv[index + 1];
            if (!claimId) {
                throw new Error("--claim requires a proof claim id value");
            }

            query.claimId = claimId;
            index += 1;
            continue;
        }

        if (argument === "--claim-kind") {
            const rawKind = argv[index + 1];
            if (!rawKind || !isClaimKind(rawKind)) {
                throw new Error("--claim-kind requires one of: syntax, worldhood, effect, anchor, lineage, consistency, replay");
            }

            query.claimKind = rawKind;
            index += 1;
            continue;
        }

        if (argument === "--claim-status") {
            const rawStatus = argv[index + 1];
            if (!rawStatus || !isClaimStatus(rawStatus)) {
                throw new Error("--claim-status requires one of: certified, contradicted, undetermined");
            }

            query.claimStatus = rawStatus;
            index += 1;
            continue;
        }

        if (argument === "--evidence-kind") {
            const rawKind = argv[index + 1];
            if (!rawKind || !isEvidenceKind(rawKind)) {
                throw new Error("--evidence-kind requires a supported evidence kind");
            }

            query.evidenceKind = rawKind;
            index += 1;
            continue;
        }

        if (argument === "--attribution-status") {
            const rawStatus = argv[index + 1];
            if (!rawStatus || !isAttributionStatus(rawStatus)) {
                throw new Error("--attribution-status requires one of: resolved, unresolved");
            }

            query.attributionStatus = rawStatus;
            index += 1;
            continue;
        }

        if (argument === "--attribution") {
            const rawClassification = argv[index + 1];
            if (!rawClassification || !isAttributionClassification(rawClassification)) {
                throw new Error("--attribution requires one of: internal-world-event, negative-sea-pressure, anchor-drift, positive-sea-shift, unresolved-source");
            }

            query.attributionClassification = rawClassification;
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
        options: {
            observationCommitPolicyOverride,
        },
    };
}

function isInspectionSection(value: string): value is BubbleInspectionSection {
    return value === "summary"
        || value === "plan"
        || value === "selfRealization"
        || value === "externalObservationLimit"
        || value === "observationCommitPolicy"
        || value === "observationCommitPolicyComparison"
        || value === "ontology"
        || value === "semantics"
        || value === "proof"
        || value === "bundle"
        || value === "grammars"
        || value === "artifacts"
        || value === "commits"
        || value === "evidence"
        || value === "sourceAttributions"
        || value === "observationStates"
        || value === "trace"
        || value === "report";
}

function isObservationStatePhase(value: string): value is NonNullable<BubbleInspectionQuery["observationStatePhase"]> {
    return value === "observed-uncommitted"
        || value === "observed-history-open"
        || value === "observed-committed";
}

function isObservationPolicyRule(value: string): value is NonNullable<BubbleInspectionQuery["observationPolicyRule"]> {
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

function isObservationHistoryShape(value: string): value is NonNullable<BubbleInspectionQuery["observationHistoryShape"]> {
    return value === "fully-committed"
        || value === "partially-committed"
        || value === "history-open-only"
        || value === "uncommitted-only"
        || value === "mixed-open";
}

function isTraceKind(value: string): value is NonNullable<BubbleInspectionQuery["kind"]> {
    return value === "materialization-started"
        || value === "grammar-activation-staged"
        || value === "no-emissions"
        || value === "reflection-captured"
        || value === "emission-materialized"
        || value === "self-realization-resolved"
        || value === "materialization-committed";
}

function isSemanticKind(value: string): value is NonNullable<BubbleInspectionQuery["semanticKind"]> {
    return value === "constraint"
        || value === "partial-law"
        || value === "anchor-criterion";
}

function isSemanticStatus(value: string): value is NonNullable<BubbleInspectionQuery["semanticStatus"]> {
    return value === "satisfied"
        || value === "violated"
        || value === "undetermined";
}

function isClaimKind(value: string): value is NonNullable<BubbleInspectionQuery["claimKind"]> {
    return value === "syntax"
        || value === "worldhood"
        || value === "effect"
        || value === "anchor"
        || value === "lineage"
        || value === "consistency"
        || value === "replay"
        || value === "self-realization";
}

function isClaimStatus(value: string): value is NonNullable<BubbleInspectionQuery["claimStatus"]> {
    return value === "certified"
        || value === "contradicted"
        || value === "undetermined";
}

function assertNever(value: never): never {
    throw new Error(`Unhandled inspection section: ${String(value)}`);
}

function isEvidenceKind(value: string): value is NonNullable<BubbleInspectionQuery["evidenceKind"]> {
    return value === "observation-context"
        || value === "collapse-record"
        || value === "history-commit"
        || value === "negative-sea-state"
        || value === "positive-sea-state"
        || value === "anchor-point-state"
        || value === "self-realization"
        || value === "effect-trace"
        || value === "event-source-attribution";
}

function isAttributionStatus(value: string): value is NonNullable<BubbleInspectionQuery["attributionStatus"]> {
    return value === "resolved" || value === "unresolved";
}

function isAttributionClassification(
    value: string,
): value is NonNullable<BubbleInspectionQuery["attributionClassification"]> {
    return value === "internal-world-event"
        || value === "negative-sea-pressure"
        || value === "anchor-drift"
        || value === "positive-sea-shift"
        || value === "unresolved-source";
}
