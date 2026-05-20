import type {
    BubbleAddressIR,
    BubbleEmissionIR,
    BubbleExpressionIR,
    BubbleGrammarArtifactIR,
    BubbleGrammarActivationIR,
    BubbleGrammarIR,
    BubbleGeneratorIR,
    BubbleLatentTopologyIR,
    BubbleProgramIR,
    BubbleQuoteIR,
    BubbleReflectionIR,
    BubbleEmissionTarget,
    EffectIR,
    ObligationIR,
} from "../ir";
import { compileBubbleSource, formatBubbleExpression } from "../language";
import type { Diagnostic } from "../language";
import {
    createCommitEvidence,
    createEffectTraceEvidence,
    createObservationEvidence,
    createSeaAnchorEvidence,
} from "./evidence";
import {
    buildSeaAnchorAssessment,
    withMaterializedHistoryEvidence,
    type BubbleAnchorPointAssessment as OntologyBubbleAnchorPointAssessment,
    type BubbleAnchorPointStrength as OntologyBubbleAnchorPointStrength,
    type BubbleAnchorRewindStability as OntologyBubbleAnchorRewindStability,
    type BubbleNegativeSeaAssessment as OntologyBubbleNegativeSeaAssessment,
    type BubbleNegativeSeaPressure as OntologyBubbleNegativeSeaPressure,
    type BubblePositiveSeaAssessment as OntologyBubblePositiveSeaAssessment,
    type BubblePositiveSeaSupport as OntologyBubblePositiveSeaSupport,
    type BubbleSeaAnchorAssessment as OntologyBubbleSeaAnchorAssessment,
    type BubbleSeaAnchorTheoremWitness as OntologyBubbleSeaAnchorTheoremWitness,
    type BubbleWorldhoodCondition as OntologyBubbleWorldhoodCondition,
} from "./ontology";
import {
    buildConsistencyCertificate,
    type BubbleConsistencyCertificate,
} from "./proof";
import type {
    BubbleAnchorPointEvidenceRecord as EvidenceBubbleAnchorPointEvidenceRecord,
    BubbleEffectTraceEvidenceRecord as EvidenceBubbleEffectTraceEvidenceRecord,
    BubbleEffectTraceMaterializationState as EvidenceBubbleEffectTraceMaterializationState,
    BubbleEvidenceKind as EvidenceBubbleEvidenceKind,
    BubbleEvidenceRecord as EvidenceBubbleEvidenceRecord,
    BubbleHistoryCommitEvidenceRecord as EvidenceBubbleHistoryCommitEvidenceRecord,
    BubbleNegativeSeaEvidenceRecord as EvidenceBubbleNegativeSeaEvidenceRecord,
    BubbleObservationEvidenceRecord as EvidenceBubbleObservationEvidenceRecord,
    BubblePositiveSeaEvidenceRecord as EvidenceBubblePositiveSeaEvidenceRecord,
} from "./evidence";
import {
    buildSemanticEvaluationPlan,
    type BubbleSemanticEvaluationPlan,
} from "./semantics";

export interface BubbleEmissionPlan {
    emissionId: string;
    sourceName: string;
    sourceKind: BubbleEmissionIR["sourceKind"];
    target: BubbleEmissionTarget | null;
    quoteName: string | null;
    generatorName: string | null;
    derivedAddress: BubbleAddressIR | null;
    reflectionPaths: string[];
}

export interface BubbleGrammarPlan {
    grammarId: string;
    grammarName: string;
    artifactKind: BubbleGrammarArtifactIR["kind"];
    profileName: string;
    extendsProfile: string;
}

export interface BubbleGrammarActivationPlan {
    activationId: string;
    grammarId: string | null;
    grammarName: string;
    requestedProfileName: string | null;
    resolvedProfileName: string | null;
    extendsProfile: string | null;
    staged: true;
}

export type BubbleNegativeSeaPressure = OntologyBubbleNegativeSeaPressure;
export type BubblePositiveSeaSupport = OntologyBubblePositiveSeaSupport;
export type BubbleAnchorPointStrength = OntologyBubbleAnchorPointStrength;
export type BubbleAnchorRewindStability = OntologyBubbleAnchorRewindStability;
export type BubbleNegativeSeaAssessment = OntologyBubbleNegativeSeaAssessment;
export type BubblePositiveSeaAssessment = OntologyBubblePositiveSeaAssessment;
export type BubbleAnchorPointAssessment = OntologyBubbleAnchorPointAssessment;
export type BubbleWorldhoodCondition = OntologyBubbleWorldhoodCondition;
export type BubbleSeaAnchorTheoremWitness = OntologyBubbleSeaAnchorTheoremWitness;
export type BubbleSeaAnchorAssessment = OntologyBubbleSeaAnchorAssessment;

export type BubbleBundleMemberKind = "root-bubble" | "descendant-bubble" | "artifact" | "staged-emission" | "grammar-activation";
export type BubbleBundleMemberProvenance = "root-bubble" | "staged-emission" | "staged-grammar-activation";
export type BubbleMaterializationScopeTarget = "root-bubble" | "emission" | "grammar-activation";

export interface BubbleBundleMemberPlan {
    memberId: string;
    kind: BubbleBundleMemberKind;
    emissionId: string | null;
    activationId: string | null;
    addressId: string | null;
    profileName: string | null;
    sourcePath: string | null;
    provenance: BubbleBundleMemberProvenance;
    description: string;
}

export interface BubbleMaterializationScopePlan {
    scopeId: string;
    target: BubbleMaterializationScopeTarget;
    emissionId: string | null;
    activationId: string | null;
    addressId: string | null;
    description: string;
}

export interface BubbleBundlePlan {
    mode: "bubble-bundle-plan.v1";
    bundleId: string;
    rootAddressId: string;
    members: BubbleBundleMemberPlan[];
    materializationScopes: BubbleMaterializationScopePlan[];
}

export interface BubbleExecutionPlan {
    mode: "semantic-plan.v1";
    sourcePath: string | null;
    profile: BubbleProgramIR["profile"];
    bubbleAddress: BubbleAddressIR;
    semantics: BubbleSemanticEvaluationPlan;
    ontology: BubbleSeaAnchorAssessment;
    proof: BubbleConsistencyCertificate;
    bundle: BubbleBundlePlan;
    latentTopology: BubbleLatentTopologyIR | null;
    obligations: ObligationIR[];
    plannedRelations: BubbleProgramIR["bubble"]["generation"]["relations"];
    grammars: BubbleGrammarPlan[];
    grammarActivationPlan: BubbleGrammarActivationPlan[];
    emissionPlan: BubbleEmissionPlan[];
}

export interface MaterializedBubbleArtifact {
    emissionId: string;
    target: BubbleEmissionTarget | null;
    address: BubbleAddressIR | null;
    sourcePath: string;
    source: string;
    program: BubbleProgramIR;
    diagnostics: Diagnostic[];
    reflections: Record<string, unknown>;
}

export interface BubbleMaterializationCommit {
    id: string;
    emissionId: string;
    committedAddressId: string | null;
    description: string;
}

export type BubbleEvidenceKind = EvidenceBubbleEvidenceKind;
export type BubbleEffectTraceMaterializationState = EvidenceBubbleEffectTraceMaterializationState;
export type BubbleObservationEvidenceRecord = EvidenceBubbleObservationEvidenceRecord;
export type BubbleHistoryCommitEvidenceRecord = EvidenceBubbleHistoryCommitEvidenceRecord;
export type BubbleNegativeSeaEvidenceRecord = EvidenceBubbleNegativeSeaEvidenceRecord;
export type BubblePositiveSeaEvidenceRecord = EvidenceBubblePositiveSeaEvidenceRecord;
export type BubbleAnchorPointEvidenceRecord = EvidenceBubbleAnchorPointEvidenceRecord;
export type BubbleEffectTraceEvidenceRecord = EvidenceBubbleEffectTraceEvidenceRecord;
export type BubbleEvidenceRecord = EvidenceBubbleEvidenceRecord;

export interface BubbleMaterializationTraceEvent {
    kind:
    | "materialization-started"
    | "grammar-activation-staged"
    | "no-emissions"
    | "reflection-captured"
    | "emission-materialized"
    | "materialization-committed";
    message: string;
    emissionId?: string;
    activationId?: string;
    details?: Record<string, unknown>;
}

export interface BubbleMaterializationResult {
    plan: BubbleExecutionPlan;
    runtimeOntology: BubbleSeaAnchorAssessment;
    artifacts: MaterializedBubbleArtifact[];
    commits: BubbleMaterializationCommit[];
    evidence: BubbleEvidenceRecord[];
    trace: BubbleMaterializationTraceEvent[];
}

export function planBubbleProgram(program: BubbleProgramIR): BubbleExecutionPlan {
    const meta = program.bubble.meta;
    const emissions = meta?.emissions ?? [];
    const grammars = buildGrammarPlan(meta?.grammars ?? []);
    const grammarActivationPlan = buildGrammarActivationPlan(meta?.grammarActivations ?? [], grammars);
    const emissionPlan = emissions.map((emission) => ({
        emissionId: emission.id,
        sourceName: emission.sourceName,
        sourceKind: emission.sourceKind,
        target: emission.target,
        quoteName: emission.provenance.quoteName,
        generatorName: emission.provenance.generatorName,
        derivedAddress: deriveEmissionAddress(program.bubble.address, emission),
        reflectionPaths: emission.provenance.reflectionIds
            .map((reflectionId) => meta?.reflections.find((reflection) => reflection.id === reflectionId)?.path)
            .filter((path): path is string => path !== undefined),
    }));
    const semantics = buildSemanticEvaluationPlan(program, emissionPlan, grammarActivationPlan);
    const ontology = buildSeaAnchorAssessment(program, emissionPlan, semantics);
    const proof = buildConsistencyCertificate(program, emissionPlan, grammarActivationPlan, ontology, semantics);
    const bundle = buildBundlePlan(program, emissionPlan, grammarActivationPlan);

    return {
        mode: "semantic-plan.v1",
        sourcePath: program.sourcePath,
        profile: program.profile,
        bubbleAddress: program.bubble.address,
        semantics,
        ontology,
        proof,
        bundle,
        latentTopology: program.bubble.latentTopology ?? null,
        obligations: program.bubble.obligations,
        plannedRelations: program.bubble.generation.relations,
        grammars,
        grammarActivationPlan,
        emissionPlan,
    };
}

export function materializeBubbleProgram(program: BubbleProgramIR): BubbleMaterializationResult {
    const plan = planBubbleProgram(program);
    const baseEvidence = createObservationEvidence(program);
    const trace: BubbleMaterializationTraceEvent[] = [
        {
            kind: "materialization-started",
            message: `Started materialization for ${program.bubble.name}.`,
            details: {
                profile: program.profile,
                address: program.bubble.address.id,
            },
        },
    ];

    for (const activation of plan.grammarActivationPlan) {
        trace.push({
            kind: "grammar-activation-staged",
            activationId: activation.activationId,
            message: activation.resolvedProfileName === null
                ? `Staged grammar activation ${activation.activationId} for ${activation.grammarName}.`
                : `Staged grammar activation ${activation.activationId} for ${activation.grammarName} as ${activation.resolvedProfileName}.`,
            details: {
                grammarId: activation.grammarId,
                grammarName: activation.grammarName,
                requestedProfileName: activation.requestedProfileName,
                resolvedProfileName: activation.resolvedProfileName,
                extendsProfile: activation.extendsProfile,
                staged: activation.staged,
            },
        });
    }

    const meta = program.bubble.meta;
    if (!meta || meta.emissions.length === 0) {
        trace.push({
            kind: "no-emissions",
            message: `Bubble ${program.bubble.name} has no staged emissions to materialize.`,
        });
        const runtimeOntology = withMaterializedHistoryEvidence(plan.ontology, false);
        return {
            plan,
            runtimeOntology,
            artifacts: [],
            commits: [],
            evidence: [
                ...createSeaAnchorEvidence(program, runtimeOntology),
                ...baseEvidence,
                ...createEffectTraceEvidence(program, plan, [], []),
            ],
            trace,
        };
    }

    const quotesByName = new Map(meta.quotes.map((quote) => [quote.name, quote]));
    const generatorsByName = new Map(meta.generators.map((generator) => [generator.name, generator]));
    const reflectionsById = new Map(meta.reflections.map((reflection) => [reflection.id, reflection]));
    const artifacts: MaterializedBubbleArtifact[] = [];
    const commits: BubbleMaterializationCommit[] = [];
    const commitEvidence: BubbleHistoryCommitEvidenceRecord[] = [];

    for (const emission of meta.emissions) {
        const quote = resolveEmissionQuote(emission, quotesByName, generatorsByName);
        const generator = emission.provenance.generatorName === null ? null : generatorsByName.get(emission.provenance.generatorName) ?? null;
        const reflections = resolveEmissionReflections(program, emission, reflectionsById);
        const source = deriveEmissionSource(quote, generator, emission.argument);
        const sourcePath = createMaterializedSourcePath(program.sourcePath, emission.id);
        const compiled = compileBubbleSource(source, { sourcePath });
        const address = deriveEmissionAddress(program.bubble.address, emission);

        trace.push({
            kind: "reflection-captured",
            emissionId: emission.id,
            message: `Captured ${Object.keys(reflections).length} reflections for ${emission.id}.`,
            details: reflections,
        });

        artifacts.push({
            emissionId: emission.id,
            target: emission.target,
            address,
            sourcePath,
            source,
            program: compiled.program,
            diagnostics: compiled.diagnostics,
            reflections,
        });

        trace.push({
            kind: "emission-materialized",
            emissionId: emission.id,
            message: `Materialized emission ${emission.id} from ${emission.sourceName}.`,
            details: {
                target: emission.target,
                address: address?.id ?? null,
                sourceName: emission.sourceName,
            },
        });

        const commit = {
            id: `commit:${emission.id}`,
            emissionId: emission.id,
            committedAddressId: address?.id ?? null,
            description: emission.target === "descendant"
                ? `Committed descendant materialization for ${emission.id} at ${address?.id ?? "<none>"}.`
                : `Committed artifact materialization for ${emission.id}.`,
        } satisfies BubbleMaterializationCommit;
        commits.push(commit);

        if (program.bubble.generation.lifecycle.commitsHistory) {
            commitEvidence.push(createCommitEvidence(program, commit));
        }

        trace.push({
            kind: "materialization-committed",
            emissionId: emission.id,
            message: commit.description,
            details: {
                commitId: commit.id,
            },
        });
    }

    const runtimeOntology = withMaterializedHistoryEvidence(plan.ontology, commitEvidence.length > 0);

    return {
        plan,
        runtimeOntology,
        artifacts,
        commits,
        evidence: [
            ...createSeaAnchorEvidence(program, runtimeOntology),
            ...baseEvidence,
            ...commitEvidence,
            ...createEffectTraceEvidence(program, plan, artifacts, commits),
        ],
        trace,
    };
}

function buildGrammarPlan(grammars: BubbleGrammarIR[]): BubbleGrammarPlan[] {
    return grammars.map((grammar) => ({
        grammarId: grammar.id,
        grammarName: grammar.name,
        artifactKind: grammar.artifact.kind,
        profileName: grammar.artifact.profileName,
        extendsProfile: grammar.artifact.extendsProfile,
    }));
}

function buildGrammarActivationPlan(
    activations: BubbleGrammarActivationIR[],
    grammars: BubbleGrammarPlan[],
): BubbleGrammarActivationPlan[] {
    const grammarsByName = new Map(grammars.map((grammar) => [grammar.grammarName, grammar]));

    return activations.map((activation) => {
        const grammar = grammarsByName.get(activation.grammarName) ?? null;
        return {
            activationId: activation.id,
            grammarId: grammar?.grammarId ?? null,
            grammarName: activation.grammarName,
            requestedProfileName: activation.profileName,
            resolvedProfileName: activation.profileName ?? grammar?.profileName ?? null,
            extendsProfile: grammar?.extendsProfile ?? null,
            staged: true,
        };
    });
}

function buildBundlePlan(
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
    grammarActivationPlan: BubbleGrammarActivationPlan[],
): BubbleBundlePlan {
    const rootAddressId = program.bubble.address.id;

    return {
        mode: "bubble-bundle-plan.v1",
        bundleId: `bundle:${rootAddressId}`,
        rootAddressId,
        members: [
            {
                memberId: `bundle-member:${rootAddressId}`,
                kind: "root-bubble",
                emissionId: null,
                activationId: null,
                addressId: rootAddressId,
                profileName: program.profile,
                sourcePath: program.sourcePath,
                provenance: "root-bubble",
                description: `Root bubble ${program.bubble.name} anchors this bundle.`,
            },
            ...emissionPlan.map<BubbleBundleMemberPlan>((emission) => ({
                memberId: `bundle-member:${emission.emissionId}`,
                kind: emission.target === "descendant"
                    ? "descendant-bubble"
                    : emission.target === "artifact"
                        ? "artifact"
                        : "staged-emission",
                emissionId: emission.emissionId,
                activationId: null,
                addressId: emission.derivedAddress?.id ?? null,
                profileName: null,
                sourcePath: program.sourcePath,
                provenance: "staged-emission",
                description: emission.target === "descendant"
                    ? `Emission ${emission.emissionId} stages one descendant member inside the bundle.`
                    : emission.target === "artifact"
                        ? `Emission ${emission.emissionId} stages one artifact member inside the bundle.`
                        : `Emission ${emission.emissionId} remains staged inside the bundle without a fixed target.`,
            })),
            ...grammarActivationPlan.map<BubbleBundleMemberPlan>((activation) => ({
                memberId: `bundle-member:${activation.activationId}`,
                kind: "grammar-activation",
                emissionId: null,
                activationId: activation.activationId,
                addressId: rootAddressId,
                profileName: activation.resolvedProfileName,
                sourcePath: program.sourcePath,
                provenance: "staged-grammar-activation",
                description: `Grammar activation ${activation.activationId} contributes a staged language-boundary member to the bundle.`,
            })),
        ],
        materializationScopes: [
            {
                scopeId: `bundle-scope:${rootAddressId}`,
                target: "root-bubble",
                emissionId: null,
                activationId: null,
                addressId: rootAddressId,
                description: `The root bubble ${program.bubble.name} is always inside its own materialization scope.`,
            },
            ...emissionPlan.map<BubbleMaterializationScopePlan>((emission) => ({
                scopeId: `bundle-scope:${emission.emissionId}`,
                target: "emission",
                emissionId: emission.emissionId,
                activationId: null,
                addressId: emission.derivedAddress?.id ?? null,
                description: `Emission ${emission.emissionId} defines one staged materialization scope within the bundle.`,
            })),
            ...grammarActivationPlan.map<BubbleMaterializationScopePlan>((activation) => ({
                scopeId: `bundle-scope:${activation.activationId}`,
                target: "grammar-activation",
                emissionId: null,
                activationId: activation.activationId,
                addressId: rootAddressId,
                description: `Grammar activation ${activation.activationId} defines one staged language-boundary scope within the bundle.`,
            })),
        ],
    };
}

function resolveEmissionQuote(
    emission: BubbleEmissionIR,
    quotesByName: Map<string, BubbleQuoteIR>,
    generatorsByName: Map<string, BubbleGeneratorIR>,
): BubbleQuoteIR {
    if (emission.sourceKind === "quote") {
        const quote = quotesByName.get(emission.sourceName);
        if (quote) {
            return quote;
        }
    }

    const quoteName = emission.provenance.quoteName;
    if (quoteName) {
        const quote = quotesByName.get(quoteName);
        if (quote) {
            return quote;
        }
    }

    const generatorName = emission.provenance.generatorName;
    if (generatorName) {
        const generator = generatorsByName.get(generatorName);
        if (generator) {
            const quote = quotesByName.get(generator.sourceQuoteName);
            if (quote) {
                return quote;
            }
        }
    }

    throw new Error(`Could not resolve quote for emission '${emission.id}'.`);
}

function resolveEmissionReflections(
    program: BubbleProgramIR,
    emission: BubbleEmissionIR,
    reflectionsById: Map<string, BubbleReflectionIR>,
): Record<string, unknown> {
    const resolvedEntries = emission.provenance.reflectionIds.map((reflectionId) => {
        const reflection = reflectionsById.get(reflectionId);
        if (!reflection) {
            return [reflectionId, null] as const;
        }

        return [reflection.path, resolveReflectionValue(program, reflection.path)] as const;
    });

    return Object.fromEntries(resolvedEntries);
}

function resolveReflectionValue(program: BubbleProgramIR, path: string): unknown {
    switch (path) {
        case "self.address":
            return program.bubble.address;
        case "self.profile":
            return program.profile;
        case "self.seed":
            return program.bubble.seed;
        case "self.worldWill":
            return program.bubble.worldWill;
        default:
            return null;
    }
}

function deriveEmissionSource(
    quote: BubbleQuoteIR,
    generator: BubbleGeneratorIR | null,
    argument: BubbleExpressionIR | null,
): string {
    const normalizedSource = normalizeQuotedArtifactSource(quote.artifactSource);

    if (generator === null || generator.parameterName === null || argument === null) {
        return normalizedSource;
    }

    const formattedArgument = formatBubbleExpression(argument);
    const replacedSource = normalizedSource.replace(
        /\bseed\s+("[^"]*"|'[^']*'|[^\s{}]+)/,
        `seed ${formattedArgument}`,
    );

    if (replacedSource !== normalizedSource) {
        return replacedSource;
    }

    return normalizedSource.replace(/\n\}\s*$/, `\n  seed ${formattedArgument}\n}`);
}

function deriveEmissionAddress(baseAddress: BubbleAddressIR, emission: BubbleEmissionIR): BubbleAddressIR | null {
    if (emission.target !== "descendant") {
        return null;
    }

    const path = [
        ...baseAddress.path,
        {
            kind: "spawn" as const,
            key: emission.id,
        },
    ];

    return {
        scheme: baseAddress.scheme,
        locatorKind: "lineage-relative",
        anchor: baseAddress.anchor,
        path,
        id: createAddressId(baseAddress.anchor, path),
    };
}

function createMaterializedSourcePath(sourcePath: string | null, emissionId: string): string {
    return `${sourcePath ?? "<memory>"}#${emissionId}`;
}

function createAddressId(
    anchor: string,
    path: ReadonlyArray<{
        kind: string;
        key: string;
    }>,
): string {
    const encodedPath = path.map((step) => `${step.kind}:${step.key}`).join("/");
    return `bubble:${anchor}::${encodedPath}`;
}

function assertNever(value: never): never {
    throw new Error(`Unhandled effect kind: ${String(value)}`);
}

function normalizeQuotedArtifactSource(source: string): string {
    if (source.includes("\n")) {
        return source;
    }

    const match = source.match(/^bubble\s+([A-Za-z_][\w-]*)\s*\{\s*(.*)\s*\}\s*$/s);
    if (!match) {
        return source;
    }

    const bubbleName = match[1];
    const body = match[2]
        .replace(/\s+(?=realization\b)/g, "\n  ")
        .replace(/\s+(?=axiom\b)/g, "\n  ")
        .replace(/\s+(?=will\b)/g, "\n  ")
        .replace(/\s+(?=seed\b)/g, "\n  ")
        .replace(/\s+(?=observe\b)/g, "\n  ")
        .replace(/(?<!effect)\s+(?=spawn\b)/g, "\n  ")
        .replace(/\s+(?=effect\b)/g, "\n  ")
        .replace(/\s+(?=quote\b)/g, "\n  ")
        .replace(/\s+(?=generator\b)/g, "\n  ")
        .replace(/\s+(?=reflect\b)/g, "\n  ")
        .replace(/\s+(?=emit\b)/g, "\n  ")
        .trim();

    const statements = body
        .split(/\n/)
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0)
        .map((statement) => `  ${statement}`);

    return [`bubble ${bubbleName} {`, ...statements, `}`].join("\n");
}