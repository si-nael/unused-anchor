import type {
    BubbleAddressIR,
    BubbleEmissionIR,
    BubbleExpressionIR,
    BubbleGrammarArtifactIR,
    BubbleGrammarActivationIR,
    BubbleGrammarIR,
    BubbleGeneratorIR,
    BubbleProgramIR,
    BubbleQuoteIR,
    BubbleReflectionIR,
    BubbleEmissionTarget,
    EffectIR,
    ObligationIR,
} from "../ir";
import { compileBubbleSource, formatBubbleExpression } from "../language";
import type { Diagnostic } from "../language";

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

export type BubbleNegativeSeaPressure = "low" | "elevated" | "high";
export type BubblePositiveSeaSupport = "weak" | "present" | "strong";
export type BubbleAnchorPointStrength = "weak" | "steady" | "strong";
export type BubbleAnchorRewindStability = "fragile" | "guarded" | "stable";

export interface BubbleNegativeSeaAssessment {
    pressure: BubbleNegativeSeaPressure;
    signals: string[];
}

export interface BubblePositiveSeaAssessment {
    support: BubblePositiveSeaSupport;
    signals: string[];
}

export interface BubbleAnchorPointAssessment {
    strength: BubbleAnchorPointStrength;
    trustedHistory: boolean;
    rewindStability: BubbleAnchorRewindStability;
    signals: string[];
}

export type BubbleWorldhoodCondition = "stable" | "stressed" | "dissolving";

export interface BubbleSeaAnchorTheoremWitness {
    theorem: "sea-anchor-necessity.v1";
    negativeRank: number;
    positiveRank: number;
    anchorRank: number;
    worldhoodDelta: number;
    identityDelta: number;
    sustained: boolean;
    condition: BubbleWorldhoodCondition;
    explanation: string;
}

export interface BubbleSeaAnchorAssessment {
    negativeSea: BubbleNegativeSeaAssessment;
    positiveSea: BubblePositiveSeaAssessment;
    anchorPoint: BubbleAnchorPointAssessment;
    theoremWitness: BubbleSeaAnchorTheoremWitness;
}

export type BubbleConsistencyClaimStatus = "certified" | "contradicted" | "undetermined";
export type BubbleConsistencyCertificateVerdict = "certified" | "partially-certified" | "contradicted" | "undetermined";
export type BubbleConsistencyClaimKind = "syntax" | "worldhood" | "effect" | "anchor" | "lineage" | "consistency" | "replay";

export interface BubbleConsistencyClaim {
    id: string;
    kind: BubbleConsistencyClaimKind;
    status: BubbleConsistencyClaimStatus;
    basis: string[];
    explanation: string;
}

export interface BubbleConsistencyCertificate {
    mode: "bubble-consistency-certificate.v1";
    bubbleAddressId: string;
    profile: BubbleProgramIR["profile"];
    verdict: BubbleConsistencyCertificateVerdict;
    claims: BubbleConsistencyClaim[];
}

export interface BubbleExecutionPlan {
    mode: "semantic-plan.v1";
    sourcePath: string | null;
    profile: BubbleProgramIR["profile"];
    bubbleAddress: BubbleAddressIR;
    ontology: BubbleSeaAnchorAssessment;
    proof: BubbleConsistencyCertificate;
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

export type BubbleEvidenceKind =
    | "observation-context"
    | "history-commit"
    | "negative-sea-state"
    | "positive-sea-state"
    | "anchor-point-state"
    | "effect-trace";

export type BubbleEffectTraceMaterializationState = "potential" | "materialized";

interface BubbleEvidenceRecordBase {
    id: string;
    kind: BubbleEvidenceKind;
    bubbleAddressId: string;
    subjectAddressId: string;
    sourcePath: string | null;
    observationMode: string | null;
    emissionId: string | null;
    commitId: string | null;
    description: string;
}

export interface BubbleObservationEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "observation-context";
}

export interface BubbleHistoryCommitEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "history-commit";
}

export interface BubbleNegativeSeaEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "negative-sea-state";
    pressure: BubbleNegativeSeaPressure;
    signals: string[];
}

export interface BubblePositiveSeaEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "positive-sea-state";
    support: BubblePositiveSeaSupport;
    signals: string[];
}

export interface BubbleAnchorPointEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "anchor-point-state";
    strength: BubbleAnchorPointStrength;
    trustedHistory: boolean;
    rewindStability: BubbleAnchorRewindStability;
    signals: string[];
}

export interface BubbleEffectTraceEvidenceRecord extends BubbleEvidenceRecordBase {
    kind: "effect-trace";
    effectId: string;
    effectKind: EffectIR["kind"];
    requirement: EffectIR["requirement"];
    scope: EffectIR["scope"];
    sourceLine: number;
    materializationState: BubbleEffectTraceMaterializationState;
    runtimeSignals: string[];
}

export type BubbleEvidenceRecord =
    | BubbleObservationEvidenceRecord
    | BubbleHistoryCommitEvidenceRecord
    | BubbleNegativeSeaEvidenceRecord
    | BubblePositiveSeaEvidenceRecord
    | BubbleAnchorPointEvidenceRecord
    | BubbleEffectTraceEvidenceRecord;

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
    const ontology = buildSeaAnchorAssessment(program, emissionPlan);
    const proof = buildConsistencyCertificate(program, emissionPlan, grammarActivationPlan, ontology);

    return {
        mode: "semantic-plan.v1",
        sourcePath: program.sourcePath,
        profile: program.profile,
        bubbleAddress: program.bubble.address,
        ontology,
        proof,
        obligations: program.bubble.obligations,
        plannedRelations: program.bubble.generation.relations,
        grammars,
        grammarActivationPlan,
        emissionPlan,
    };
}

export function materializeBubbleProgram(program: BubbleProgramIR): BubbleMaterializationResult {
    const plan = planBubbleProgram(program);
    const evidence = [
        ...createSeaAnchorEvidence(program, plan.ontology),
        ...createObservationEvidence(program),
    ];
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
        return {
            plan,
            artifacts: [],
            commits: [],
            evidence: [...evidence, ...createEffectTraceEvidence(program, plan, [], [])],
            trace,
        };
    }

    const quotesByName = new Map(meta.quotes.map((quote) => [quote.name, quote]));
    const generatorsByName = new Map(meta.generators.map((generator) => [generator.name, generator]));
    const reflectionsById = new Map(meta.reflections.map((reflection) => [reflection.id, reflection]));
    const artifacts: MaterializedBubbleArtifact[] = [];
    const commits: BubbleMaterializationCommit[] = [];

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
            evidence.push(createCommitEvidence(program, commit));
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

    return {
        plan,
        artifacts,
        commits,
        evidence: [...evidence, ...createEffectTraceEvidence(program, plan, artifacts, commits)],
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

function buildSeaAnchorAssessment(
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
): BubbleSeaAnchorAssessment {
    const { bubble } = program;
    const { relations, lifecycle, realizationMode } = bubble.generation;
    const boundaryExposureCount = countBoundaryExposure(program);
    const branchRelationCount = relations.filter((relation) => relation.kind === "branch").length;
    const descendantRelationCount = relations.filter((relation) => relation.kind === "spawn").length;
    const descendantEmissionCount = emissionPlan.filter((emission) => emission.target === "descendant").length;

    const negativeSignals: string[] = [];
    let negativeScore = 0;
    if (realizationMode === "nondeterministic") {
        negativeScore += 1;
        negativeSignals.push("nondeterministic-realization");
    }

    if (branchRelationCount > 0) {
        negativeScore += 1;
        negativeSignals.push("branch-pressure");
    }

    if (boundaryExposureCount > 0) {
        negativeScore += boundaryExposureCount > 1 ? 2 : 1;
        negativeSignals.push("boundary-exposure");
    }

    if (lifecycle.supportsLeakage) {
        negativeScore += 1;
        negativeSignals.push("membrane-leak");
    }

    if (lifecycle.supportsPerturbation) {
        negativeScore += 1;
        negativeSignals.push("law-perturbation");
    }

    const negativePressure = negativeScore >= 3 ? "high"
        : negativeScore >= 1 ? "elevated"
            : "low";

    const positiveSignals: string[] = [];
    let positiveScore = 0;
    if (bubble.address.locatorKind === "source-relative") {
        positiveScore += 1;
        positiveSignals.push("source-lineage-address");
    }

    if (bubble.seed !== null) {
        positiveScore += 1;
        positiveSignals.push("seeded-origin");
    }

    if (descendantRelationCount > 0) {
        positiveScore += 1;
        positiveSignals.push("descendant-lineage");
    }

    if (descendantEmissionCount > 0) {
        positiveScore += 1;
        positiveSignals.push("staged-growth");
    }

    if (lifecycle.commitsHistory) {
        positiveScore += 1;
        positiveSignals.push("durable-history");
    }

    const positiveSupport = positiveScore >= 4 ? "strong"
        : positiveScore >= 2 ? "present"
            : "weak";

    const anchorSignals: string[] = [];
    let anchorScore = 0;
    if (Object.keys(bubble.axioms).length > 0) {
        anchorScore += 1;
        anchorSignals.push("axiomatic-basis");
    }

    if (bubble.worldWill !== null) {
        anchorScore += 1;
        anchorSignals.push("world-will");
    }

    if (bubble.seed !== null) {
        anchorScore += 1;
        anchorSignals.push("seed-continuity");
    }

    if (lifecycle.commitsHistory) {
        anchorScore += 1;
        anchorSignals.push("durable-history");
    }

    if (lifecycle.observationMode !== null) {
        anchorScore += 1;
        anchorSignals.push("observation-surface");
    }

    if (negativePressure === "high") {
        anchorScore -= 1;
        anchorSignals.push("negative-pressure");
    }

    if (boundaryExposureCount > 0) {
        anchorScore -= 1;
        anchorSignals.push("boundary-stress");
    }

    if (branchRelationCount > 0) {
        anchorScore -= 1;
        anchorSignals.push("branch-instability");
    }

    if (lifecycle.carriesDebt) {
        anchorScore -= 1;
        anchorSignals.push("unresolved-debt");
    }

    if (lifecycle.supportsPerturbation) {
        anchorScore -= 1;
        anchorSignals.push("perturbation-stress");
    }

    const anchorStrength = anchorScore >= 4 ? "strong"
        : anchorScore >= 2 ? "steady"
            : "weak";
    const rewindStress = negativePressure === "high" || branchRelationCount > 0 || lifecycle.carriesDebt;
    const rewindStability = bubble.seed !== null && lifecycle.commitsHistory
        ? rewindStress ? "guarded" : "stable"
        : bubble.seed !== null || lifecycle.commitsHistory ? "guarded" : "fragile";
    const theoremWitness = buildSeaAnchorTheoremWitness(negativePressure, positiveSupport, anchorStrength);

    return {
        negativeSea: {
            pressure: negativePressure,
            signals: negativeSignals,
        },
        positiveSea: {
            support: positiveSupport,
            signals: positiveSignals,
        },
        anchorPoint: {
            strength: anchorStrength,
            trustedHistory: lifecycle.commitsHistory,
            rewindStability,
            signals: anchorSignals,
        },
        theoremWitness,
    };
}

function buildSeaAnchorTheoremWitness(
    negativePressure: BubbleNegativeSeaPressure,
    positiveSupport: BubblePositiveSeaSupport,
    anchorStrength: BubbleAnchorPointStrength,
): BubbleSeaAnchorTheoremWitness {
    const negativeRank = rankNegativeSeaPressure(negativePressure);
    const positiveRank = rankPositiveSeaSupport(positiveSupport);
    const anchorRank = rankAnchorStrength(anchorStrength);
    const worldhoodDelta = anchorRank + positiveRank - negativeRank;
    const identityDelta = anchorRank - negativeRank;
    const sustained = anchorRank > 0 && worldhoodDelta > 0;
    const condition = !sustained
        ? "dissolving"
        : worldhoodDelta >= 2
            ? "stable"
            : "stressed";
    const explanation = condition === "stable"
        ? `Bubble worldhood remains stable because A=${anchorRank}, P=${positiveRank}, N=${negativeRank}, so A + P - N = ${worldhoodDelta}.`
        : condition === "stressed"
            ? `Bubble worldhood remains stressed but sustained because A=${anchorRank}, P=${positiveRank}, N=${negativeRank}, so A + P - N = ${worldhoodDelta}.`
            : `Bubble worldhood is dissolving because A=${anchorRank}, P=${positiveRank}, N=${negativeRank}, so A + P - N = ${worldhoodDelta} with identity margin ${identityDelta}.`;

    return {
        theorem: "sea-anchor-necessity.v1",
        negativeRank,
        positiveRank,
        anchorRank,
        worldhoodDelta,
        identityDelta,
        sustained,
        condition,
        explanation,
    };
}

function buildConsistencyCertificate(
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
    grammarActivationPlan: BubbleGrammarActivationPlan[],
    ontology: BubbleSeaAnchorAssessment,
): BubbleConsistencyCertificate {
    const claims = [
        buildWellFormedSourceClaim(program),
        buildMinimumWorldhoodClaim(program),
        buildRequiredEffectClaim(program, emissionPlan),
        buildAnchorIdentityClaim(program, ontology),
        buildLineageTraceabilityClaim(program, emissionPlan, grammarActivationPlan),
        buildReplayIdentityClaim(program, ontology),
        buildInternalConsistencyClaim(program),
    ];

    return {
        mode: "bubble-consistency-certificate.v1",
        bubbleAddressId: program.bubble.address.id,
        profile: program.profile,
        verdict: deriveConsistencyVerdict(claims),
        claims,
    };
}

function buildWellFormedSourceClaim(program: BubbleProgramIR): BubbleConsistencyClaim {
    return {
        id: "claim:well-formed-source",
        kind: "syntax",
        status: "certified",
        basis: ["parser", "profile-validator"],
        explanation: `Bubble ${program.bubble.name} compiled into a semantic plan under ${program.profile}.`,
    };
}

function buildMinimumWorldhoodClaim(program: BubbleProgramIR): BubbleConsistencyClaim {
    const basis: string[] = [];
    const missing: string[] = [];

    if (Object.keys(program.bubble.axioms).length > 0) {
        basis.push("axiom");
    } else {
        missing.push("axiom");
    }

    if (program.bubble.worldWill !== null) {
        basis.push("worldWill");
    } else {
        missing.push("worldWill");
    }

    if (program.bubble.seed !== null) {
        basis.push("seed");
    } else {
        missing.push("seed");
    }

    if (program.bubble.effects.length > 0) {
        basis.push("effect");
    } else {
        missing.push("effect");
    }

    return {
        id: "claim:minimum-worldhood",
        kind: "worldhood",
        status: missing.length === 0 ? "certified" : "contradicted",
        basis: missing.length === 0 ? basis : missing,
        explanation: missing.length === 0
            ? `Bubble ${program.bubble.name} satisfies the current minimum worldhood basis through ${basis.join(", ")}.`
            : `Bubble ${program.bubble.name} is missing minimum worldhood requirements: ${missing.join(", ")}.`,
    };
}

function buildRequiredEffectClaim(
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
): BubbleConsistencyClaim {
    const requiredEffects = program.bubble.effects.filter((effect) => effect.requirement === "required");
    if (requiredEffects.length === 0) {
        return {
            id: "claim:required-effect-obligations",
            kind: "effect",
            status: "undetermined",
            basis: ["no-required-effects"],
            explanation: `Bubble ${program.bubble.name} declares no required effects, so no effect obligation proof was generated.`,
        };
    }

    const statuses = requiredEffects.map((effect) => resolveRequiredEffectCertification(effect, program, emissionPlan));
    const claimStatus = statuses.some((status) => status.status === "contradicted")
        ? "contradicted"
        : statuses.some((status) => status.status === "undetermined")
            ? "undetermined"
            : "certified";

    return {
        id: "claim:required-effect-obligations",
        kind: "effect",
        status: claimStatus,
        basis: Array.from(new Set(statuses.flatMap((status) => status.basis))),
        explanation: statuses.map((status) => status.explanation).join(" "),
    };
}

function resolveRequiredEffectCertification(
    effect: EffectIR,
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
): Pick<BubbleConsistencyClaim, "status" | "basis" | "explanation"> {
    const { generation } = program.bubble;

    switch (effect.kind) {
        case "observe":
            return generation.lifecycle.observationMode === null
                ? {
                    status: "contradicted",
                    basis: ["missing-observation-surface"],
                    explanation: `Required effect ${effect.id} is contradicted because no observation surface is declared.`,
                }
                : {
                    status: "certified",
                    basis: ["observation-surface"],
                    explanation: `Required effect ${effect.id} is certified by the declared observation surface.`,
                };
        case "commit":
            return generation.lifecycle.commitsHistory
                ? {
                    status: "certified",
                    basis: ["durable-history"],
                    explanation: `Required effect ${effect.id} is certified by durable history support.`,
                }
                : {
                    status: "contradicted",
                    basis: ["missing-durable-history"],
                    explanation: `Required effect ${effect.id} is contradicted because durable history support is absent.`,
                };
        case "spawn": {
            const hasRelationWitness = generation.relations.some((relation) => relation.sourceEffectId === effect.id);
            const hasEmissionWitness = emissionPlan.some((emission) => emission.target === "descendant");
            if (hasRelationWitness || hasEmissionWitness) {
                return {
                    status: "certified",
                    basis: ["descendant-lineage", ...(hasEmissionWitness ? ["staged-growth"] : [])],
                    explanation: `Required effect ${effect.id} is certified by descendant lineage ${hasEmissionWitness ? "and staged descendant materialization" : "support"}.`,
                };
            }

            return {
                status: "undetermined",
                basis: ["no-descendant-witness"],
                explanation: `Required effect ${effect.id} remains undetermined because the current plan has no descendant relation or descendant emission witness.`,
            };
        }
        case "branch":
            return generation.realizationMode === "nondeterministic"
                ? {
                    status: "certified",
                    basis: ["nondeterministic-realization"],
                    explanation: `Required effect ${effect.id} is certified by nondeterministic realization semantics.`,
                }
                : {
                    status: "contradicted",
                    basis: ["deterministic-realization"],
                    explanation: `Required effect ${effect.id} is contradicted because the world is deterministic.`,
                };
        case "collapse":
            return {
                status: "undetermined",
                basis: ["collapse-support", "no-collapse-execution-semantics"],
                explanation: `Required effect ${effect.id} remains undetermined because collapse support exists but executable collapse semantics are not yet defined.`,
            };
        case "leak":
            return {
                status: "certified",
                basis: [resolveLeakSignal(effect.scope)],
                explanation: `Required effect ${effect.id} is certified by explicit ${effect.scope} leak semantics.`,
            };
        case "debt":
            return {
                status: "certified",
                basis: ["unresolved-debt"],
                explanation: `Required effect ${effect.id} is certified by explicit unresolved debt semantics.`,
            };
        case "perturb":
            return {
                status: "certified",
                basis: ["law-perturbation"],
                explanation: `Required effect ${effect.id} is certified by explicit perturbation semantics.`,
            };
        default:
            return assertNever(effect.kind);
    }
}

function resolveLeakSignal(scope: EffectIR["scope"]): string {
    switch (scope) {
        case "local":
            return "local-leak";
        case "membrane":
            return "membrane-leak";
        case "global":
            return "global-leak";
        default:
            return assertNever(scope);
    }
}

function buildAnchorIdentityClaim(
    program: BubbleProgramIR,
    ontology: BubbleSeaAnchorAssessment,
): BubbleConsistencyClaim {
    const identityBasis = ontology.anchorPoint.signals.filter((signal) =>
        signal === "axiomatic-basis"
        || signal === "world-will"
        || signal === "seed-continuity"
        || signal === "durable-history"
        || signal === "observation-surface",
    );

    if (!ontology.theoremWitness.sustained) {
        return {
            id: "claim:anchor-identity",
            kind: "anchor",
            status: "contradicted",
            basis: identityBasis.length > 0 ? identityBasis : ["missing-anchor-basis"],
            explanation: `Bubble ${program.bubble.name} does not currently sustain same-world identity under the theorem witness and is classified as ${ontology.theoremWitness.condition}.`,
        };
    }

    return {
        id: "claim:anchor-identity",
        kind: "anchor",
        status: "certified",
        basis: identityBasis,
        explanation: `Bubble ${program.bubble.name} currently certifies anchor identity as ${ontology.anchorPoint.strength} with theorem condition ${ontology.theoremWitness.condition}.`,
    };
}

function buildLineageTraceabilityClaim(
    program: BubbleProgramIR,
    emissionPlan: BubbleEmissionPlan[],
    grammarActivationPlan: BubbleGrammarActivationPlan[],
): BubbleConsistencyClaim {
    const hasDescendantRelation = program.bubble.generation.relations.some((relation) => relation.target === "descendant-bubble");
    const descendantEmissions = emissionPlan.filter((emission) => emission.target === "descendant");
    const hasStagedLineage = hasDescendantRelation || descendantEmissions.length > 0 || grammarActivationPlan.length > 0;

    if (!hasStagedLineage) {
        return {
            id: "claim:lineage-traceability",
            kind: "lineage",
            status: "undetermined",
            basis: ["no-descendant-lineage-claim"],
            explanation: `Bubble ${program.bubble.name} declares no descendant or staged grammar lineage that needs certification in the current plan.`,
        };
    }

    const unresolvedDescendants = descendantEmissions.some((emission) => emission.derivedAddress === null);
    const brokenRelations = program.bubble.generation.relations.some((relation) =>
        relation.target === "descendant-bubble" && relation.targetAddressTemplate.baseAddressId !== program.bubble.address.id,
    );

    if (unresolvedDescendants || brokenRelations) {
        return {
            id: "claim:lineage-traceability",
            kind: "lineage",
            status: "contradicted",
            basis: ["lineage-address-mismatch"],
            explanation: `Bubble ${program.bubble.name} has descendant or staged lineage that cannot be traced back cleanly to the current root bubble.`,
        };
    }

    return {
        id: "claim:lineage-traceability",
        kind: "lineage",
        status: "certified",
        basis: Array.from(new Set([
            "source-lineage-address",
            ...(hasDescendantRelation ? ["descendant-lineage"] : []),
            ...(descendantEmissions.length > 0 ? ["staged-growth"] : []),
            ...(grammarActivationPlan.length > 0 ? ["staged-grammar-lineage"] : []),
        ])),
        explanation: `Bubble ${program.bubble.name} preserves traceable lineage for every currently declared descendant or staged generation path.`,
    };
}

function buildReplayIdentityClaim(
    program: BubbleProgramIR,
    ontology: BubbleSeaAnchorAssessment,
): BubbleConsistencyClaim {
    const basis = [
        ...(program.bubble.seed === null ? [] : ["seed-continuity"]),
        ...(program.bubble.address.locatorKind === "source-relative" ? ["source-lineage-address"] : ["lineage-relative-address"]),
        ...(program.bubble.generation.lifecycle.commitsHistory ? ["durable-history"] : []),
    ];

    if (!ontology.theoremWitness.sustained) {
        return {
            id: "claim:replay-identity",
            kind: "replay",
            status: "contradicted",
            basis,
            explanation: `Bubble ${program.bubble.name} does not currently certify same-world replay because the theorem witness is ${ontology.theoremWitness.condition}.`,
        };
    }

    if (program.bubble.seed !== null && program.bubble.generation.lifecycle.commitsHistory) {
        return {
            id: "claim:replay-identity",
            kind: "replay",
            status: "certified",
            basis,
            explanation: `Bubble ${program.bubble.name} currently certifies replay identity through seed continuity, stable root addressing, and durable history.`,
        };
    }

    return {
        id: "claim:replay-identity",
        kind: "replay",
        status: "undetermined",
        basis: [...basis, ...(program.bubble.generation.lifecycle.commitsHistory ? [] : ["missing-durable-history"])],
        explanation: `Bubble ${program.bubble.name} preserves a replay basis, but same-world replay remains undetermined without durable history fixation.`,
    };
}

function buildInternalConsistencyClaim(program: BubbleProgramIR): BubbleConsistencyClaim {
    return {
        id: "claim:internal-law-consistency",
        kind: "consistency",
        status: "undetermined",
        basis: ["no-executable-law-semantics-yet"],
        explanation: `Bubble ${program.bubble.name} does not yet have a full executable law solver, so internal semantic consistency remains undetermined.`,
    };
}

function deriveConsistencyVerdict(claims: BubbleConsistencyClaim[]): BubbleConsistencyCertificateVerdict {
    if (claims.some((claim) => claim.status === "contradicted")) {
        return "contradicted";
    }

    if (claims.every((claim) => claim.status === "certified")) {
        return "certified";
    }

    if (claims.some((claim) => claim.status === "certified") && claims.some((claim) => claim.status === "undetermined")) {
        return "partially-certified";
    }

    return "undetermined";
}

function rankNegativeSeaPressure(pressure: BubbleNegativeSeaPressure): number {
    switch (pressure) {
        case "low":
            return 0;
        case "elevated":
            return 1;
        case "high":
            return 2;
        default:
            return assertNever(pressure);
    }
}

function rankPositiveSeaSupport(support: BubblePositiveSeaSupport): number {
    switch (support) {
        case "weak":
            return 0;
        case "present":
            return 1;
        case "strong":
            return 2;
        default:
            return assertNever(support);
    }
}

function rankAnchorStrength(strength: BubbleAnchorPointStrength): number {
    switch (strength) {
        case "weak":
            return 0;
        case "steady":
            return 1;
        case "strong":
            return 2;
        default:
            return assertNever(strength);
    }
}

function countBoundaryExposure(program: BubbleProgramIR): number {
    const boundaryScopes = new Set(["membrane", "global"]);
    const obligationExposure = program.bubble.obligations.filter((obligation) => boundaryScopes.has(obligation.scope)).length;
    const relationExposure = program.bubble.generation.relations.filter((relation) => boundaryScopes.has(relation.scope)).length;

    return obligationExposure + relationExposure;
}

function createSeaAnchorEvidence(
    program: BubbleProgramIR,
    assessment: BubbleSeaAnchorAssessment,
): BubbleEvidenceRecord[] {
    const rootAddressId = program.bubble.address.id;

    return [
        {
            id: `evidence:negative-sea:${rootAddressId}`,
            kind: "negative-sea-state",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: null,
            commitId: null,
            pressure: assessment.negativeSea.pressure,
            signals: assessment.negativeSea.signals,
            description: assessment.negativeSea.signals.length === 0
                ? `Bubble ${program.bubble.name} currently shows low negative-sea pressure.`
                : `Bubble ${program.bubble.name} currently shows ${assessment.negativeSea.pressure} negative-sea pressure via ${assessment.negativeSea.signals.join(", ")}.`,
        },
        {
            id: `evidence:positive-sea:${rootAddressId}`,
            kind: "positive-sea-state",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: null,
            commitId: null,
            support: assessment.positiveSea.support,
            signals: assessment.positiveSea.signals,
            description: assessment.positiveSea.signals.length === 0
                ? `Bubble ${program.bubble.name} currently shows weak positive-sea support.`
                : `Bubble ${program.bubble.name} currently shows ${assessment.positiveSea.support} positive-sea support via ${assessment.positiveSea.signals.join(", ")}.`,
        },
        {
            id: `evidence:anchor-point:${rootAddressId}`,
            kind: "anchor-point-state",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: null,
            commitId: null,
            strength: assessment.anchorPoint.strength,
            trustedHistory: assessment.anchorPoint.trustedHistory,
            rewindStability: assessment.anchorPoint.rewindStability,
            signals: assessment.anchorPoint.signals,
            description: `Bubble ${program.bubble.name} currently shows ${assessment.anchorPoint.strength} anchor support with ${assessment.anchorPoint.rewindStability} rewind stability.`,
        },
    ];
}

function createObservationEvidence(program: BubbleProgramIR): BubbleObservationEvidenceRecord[] {
    const observationMode = program.bubble.generation.lifecycle.observationMode;
    if (observationMode === null) {
        return [];
    }

    const rootAddressId = program.bubble.address.id;
    return [
        {
            id: `evidence:observe:${rootAddressId}`,
            kind: "observation-context",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode,
            emissionId: null,
            commitId: null,
            description: program.bubble.generation.lifecycle.commitsHistory
                ? `Bubble ${program.bubble.name} declares observation mode ${observationMode} with durable history support.`
                : `Bubble ${program.bubble.name} declares observation mode ${observationMode}.`,
        },
    ];
}

function createEffectTraceEvidence(
    program: BubbleProgramIR,
    plan: BubbleExecutionPlan,
    artifacts: MaterializedBubbleArtifact[],
    commits: BubbleMaterializationCommit[],
): BubbleEffectTraceEvidenceRecord[] {
    const rootAddressId = program.bubble.address.id;

    return program.bubble.effects.map((effect) => {
        const runtimeSignals = resolveEffectRuntimeSignals(effect, plan, artifacts, commits, program);
        const materializationState = resolveEffectMaterializationState(effect, artifacts, commits, program);

        return {
            id: `evidence:effect:${effect.id}`,
            kind: "effect-trace",
            bubbleAddressId: rootAddressId,
            subjectAddressId: rootAddressId,
            sourcePath: program.sourcePath,
            observationMode: program.bubble.generation.lifecycle.observationMode,
            emissionId: null,
            commitId: null,
            effectId: effect.id,
            effectKind: effect.kind,
            requirement: effect.requirement,
            scope: effect.scope,
            sourceLine: effect.sourceLine,
            materializationState,
            runtimeSignals,
            description: runtimeSignals.length === 0
                ? `Bubble ${program.bubble.name} recorded ${effect.requirement} ${effect.scope} ${effect.kind} as ${materializationState} in this run.`
                : `Bubble ${program.bubble.name} recorded ${effect.requirement} ${effect.scope} ${effect.kind} as ${materializationState} in this run via ${runtimeSignals.join(", ")}.`,
        };
    });
}

function createCommitEvidence(
    program: BubbleProgramIR,
    commit: BubbleMaterializationCommit,
): BubbleHistoryCommitEvidenceRecord {
    return {
        id: `evidence:${commit.id}`,
        kind: "history-commit",
        bubbleAddressId: program.bubble.address.id,
        subjectAddressId: commit.committedAddressId ?? program.bubble.address.id,
        sourcePath: program.sourcePath,
        observationMode: program.bubble.generation.lifecycle.observationMode,
        emissionId: commit.emissionId,
        commitId: commit.id,
        description: `Recorded durable history for ${commit.emissionId} at ${commit.committedAddressId ?? program.bubble.address.id}.`,
    };
}

function resolveEffectMaterializationState(
    effect: EffectIR,
    artifacts: MaterializedBubbleArtifact[],
    commits: BubbleMaterializationCommit[],
    program: BubbleProgramIR,
): BubbleEffectTraceMaterializationState {
    switch (effect.kind) {
        case "observe":
            return program.bubble.generation.lifecycle.observationMode === null ? "potential" : "materialized";
        case "commit":
            return commits.length > 0 ? "materialized" : "potential";
        case "spawn":
            return artifacts.some((artifact) => artifact.target === "descendant") ? "materialized" : "potential";
        case "branch":
        case "collapse":
        case "leak":
        case "debt":
        case "perturb":
            return "potential";
        default:
            return assertNever(effect.kind);
    }
}

function resolveEffectRuntimeSignals(
    effect: EffectIR,
    plan: BubbleExecutionPlan,
    artifacts: MaterializedBubbleArtifact[],
    commits: BubbleMaterializationCommit[],
    program: BubbleProgramIR,
): string[] {
    switch (effect.kind) {
        case "observe":
            return program.bubble.generation.lifecycle.observationMode === null ? [] : ["observation-surface"];
        case "commit":
            return commits.length > 0 ? ["durable-history", "history-commit"] : ["durable-history"];
        case "spawn":
            return artifacts.some((artifact) => artifact.target === "descendant")
                ? ["descendant-materialization"]
                : plan.plannedRelations.some((relation) => relation.sourceEffectId === effect.id)
                    ? ["descendant-capability"]
                    : [];
        case "branch":
            return plan.plannedRelations.some((relation) => relation.sourceEffectId === effect.id) ? ["branch-pressure"] : [];
        case "collapse":
            return plan.plannedRelations.some((relation) => relation.sourceEffectId === effect.id) ? ["collapse-capability"] : [];
        case "leak":
            return [effect.scope === "global" ? "global-leak" : effect.scope === "membrane" ? "membrane-leak" : "local-leak"];
        case "debt":
            return ["unresolved-debt"];
        case "perturb":
            return ["law-perturbation"];
        default:
            return assertNever(effect.kind);
    }
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