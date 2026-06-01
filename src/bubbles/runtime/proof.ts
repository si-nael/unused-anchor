import type {
    BubbleAddressIR,
    BubbleCollapseEvidenceDraftIR,
    BubbleEmissionTarget,
    BubbleProgramIR,
    BubbleUnresolvedSemanticKind,
    BubbleUnresolvedSemanticIR,
    EffectIR,
} from "../ir";
import type {
    BubbleCollapseRecordEvidenceRecord,
    BubbleEvidenceRecord,
} from "./evidence";
import type { BubbleSeaAnchorAssessment } from "./ontology";
import type { BubbleSemanticEvaluationPlan } from "./semantics";

export type BubbleConsistencyClaimStatus = "certified" | "contradicted" | "undetermined";
export type BubbleConsistencyCertificateVerdict = "certified" | "partially-certified" | "contradicted" | "undetermined";
export type BubbleConsistencyClaimKind = "syntax" | "worldhood" | "effect" | "anchor" | "lineage" | "consistency" | "replay";
export type BubbleConsistencyClaimScope = "source" | "plan" | "materialized-run" | "replay";

export interface BubbleConsistencyClaim {
    id: string;
    kind: BubbleConsistencyClaimKind;
    status: BubbleConsistencyClaimStatus;
    basis: string[];
    evidenceIds?: string[];
    dependsOnClaims?: string[];
    assumptions?: string[];
    scope: BubbleConsistencyClaimScope;
    explanation: string;
}

export interface BubbleConsistencyCertificate {
    mode: "bubble-consistency-certificate.v1";
    bubbleAddressId: string;
    profile: BubbleProgramIR["profile"];
    verdict: BubbleConsistencyCertificateVerdict;
    claims: BubbleConsistencyClaim[];
}

export function deriveConsistencyVerdict(claims: BubbleConsistencyClaim[]): BubbleConsistencyCertificateVerdict {
    if (claims.length === 0) {
        return "undetermined";
    }

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

export interface BubbleProofEmissionPlan {
    emissionId: string;
    target: BubbleEmissionTarget | null;
    derivedAddress: BubbleAddressIR | null;
}

export interface BubbleProofGrammarActivationPlan {
    activationId: string;
    grammarId: string | null;
    grammarName: string;
    requestedProfileName: string | null;
    resolvedProfileName: string | null;
    extendsProfile: string | null;
    staged: true;
}

export function buildConsistencyCertificate(
    program: BubbleProgramIR,
    emissionPlan: BubbleProofEmissionPlan[],
    grammarActivationPlan: BubbleProofGrammarActivationPlan[],
    ontology: BubbleSeaAnchorAssessment,
    semantics: BubbleSemanticEvaluationPlan,
): BubbleConsistencyCertificate {
    const claims = [
        buildWellFormedSourceClaim(program),
        buildMinimumAuthoredShapeClaim(program),
        buildWorldhoodRolesPresentClaim(program, semantics),
        buildRequiredEffectClaim(program, emissionPlan),
        buildAnchorIdentityClaim(program, ontology, semantics),
        buildLineageTraceabilityClaim(program, emissionPlan, grammarActivationPlan),
        buildReplayIdentityClaim(program, ontology, semantics),
        buildInternalConsistencyClaim(program, semantics),
    ];

    return {
        mode: "bubble-consistency-certificate.v1",
        bubbleAddressId: program.bubble.address.id,
        profile: program.profile,
        verdict: deriveConsistencyVerdict(claims),
        claims,
    };
}

export function buildMaterializedConsistencyCertificate(
    program: BubbleProgramIR,
    planProof: BubbleConsistencyCertificate,
    evidence: BubbleEvidenceRecord[],
    semantics: BubbleSemanticEvaluationPlan,
): BubbleConsistencyCertificate {
    const collapseRecords = collectCollapseRecordEvidence(evidence);
    if (collapseRecords.length === 0) {
        return planProof;
    }

    const residualDrafts = collectLatentCollapseDrafts(program).filter((draft) =>
        !collapseRecords.some((record) => record.latentRegionId === draft.latentRegionId),
    );
    const claims = planProof.claims.map((claim) => {
        switch (claim.id) {
            case "claim:replay-identity":
                return refineReplayIdentityClaim(program, claim, collapseRecords, residualDrafts);
            case "claim:internal-law-consistency":
                return refineInternalConsistencyClaim(program, claim, collapseRecords, residualDrafts, semantics);
            default:
                return claim;
        }
    });

    return {
        ...planProof,
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
        evidenceIds: [],
        dependsOnClaims: [],
        assumptions: [],
        scope: "source",
        explanation: `Bubble ${program.bubble.name} compiled into a semantic plan under ${program.profile}.`,
    };
}

function buildMinimumAuthoredShapeClaim(program: BubbleProgramIR): BubbleConsistencyClaim {
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
        id: "claim:minimum-authored-shape",
        kind: "worldhood",
        status: missing.length === 0 ? "certified" : "contradicted",
        basis: missing.length === 0 ? basis : missing,
        evidenceIds: [],
        dependsOnClaims: ["claim:well-formed-source"],
        assumptions: [],
        scope: "source",
        explanation: missing.length === 0
            ? `Bubble ${program.bubble.name} satisfies the current minimum authored shape through ${basis.join(", ")}.`
            : `Bubble ${program.bubble.name} is missing minimum authored shape requirements: ${missing.join(", ")}.`,
    };
}

function buildWorldhoodRolesPresentClaim(
    program: BubbleProgramIR,
    semantics: BubbleSemanticEvaluationPlan,
): BubbleConsistencyClaim {
    const presentRoles: string[] = [];
    const missingRoles: string[] = [];

    if (Object.keys(program.bubble.axioms).length > 0) {
        presentRoles.push("local-law-basis");
    } else {
        missingRoles.push("missing-local-law-basis");
    }

    const boundaryBasis = collectBoundarySemanticsBasis(program, semantics);
    if (boundaryBasis.length > 0) {
        presentRoles.push("boundary-semantics", ...boundaryBasis);
    } else {
        missingRoles.push("missing-boundary-semantics");
    }

    if (program.bubble.address.id.length > 0) {
        presentRoles.push(
            program.bubble.address.locatorKind === "source-relative"
                ? "source-lineage-address"
                : "lineage-relative-address",
            "lineage-placement",
        );
    } else {
        missingRoles.push("missing-lineage-placement");
    }

    if (semantics.anchorCriterion !== null) {
        presentRoles.push("authored-anchor-criterion");
    } else {
        missingRoles.push("missing-authored-anchor-criterion");
    }

    const status = missingRoles.includes("missing-local-law-basis") || missingRoles.includes("missing-lineage-placement")
        ? "contradicted"
        : missingRoles.length > 0
            ? "undetermined"
            : "certified";
    const explanation = status === "certified"
        ? `Bubble ${program.bubble.name} currently presents all required worldhood roles through ${presentRoles.join(", ")}.`
        : status === "contradicted"
            ? `Bubble ${program.bubble.name} fails the independent worldhood contract because it is missing ${missingRoles.join(", ")}.`
            : `Bubble ${program.bubble.name} preserves minimum authored shape, but independent worldhood remains undetermined while ${missingRoles.join(", ")} are not yet explicitly authored.`;

    return {
        id: "claim:worldhood-roles-present",
        kind: "worldhood",
        status,
        basis: Array.from(new Set([...presentRoles, ...missingRoles])),
        evidenceIds: [],
        dependsOnClaims: ["claim:minimum-authored-shape"],
        assumptions: missingRoles.length > 0 ? ["boundary-and-anchor-worldhood-roles-remain-partially-explicit-in-v0.4"] : [],
        scope: "plan",
        explanation,
    };
}

function collectBoundarySemanticsBasis(
    program: BubbleProgramIR,
    semantics: BubbleSemanticEvaluationPlan,
): string[] {
    const basis: string[] = [];
    const boundary = program.bubble.boundary;
    const hasBoundaryScopedEffect = boundary.scopes.some((scope) => scope.effectIds.length > 0 || scope.obligationEffectIds.length > 0);
    const hasBoundaryScopedRelation = boundary.scopes.some((scope) => scope.relationSourceEffectIds.length > 0);
    const hasBoundaryReference = boundary.semanticReferences.length > 0;

    basis.push("boundary-object");
    if (boundary.observationSurface === "declared-observation-surface") {
        basis.push("boundary-observation-surface");
    }
    if (boundary.historyCommitSurface === "declared-history-support") {
        basis.push("boundary-history-commit-surface");
    }

    if (hasBoundaryScopedEffect) {
        basis.push("boundary-scoped-effect");
        basis.push(...boundary.scopes.map((scope) => `boundary-scope:${scope.scope}`));
    }

    if (hasBoundaryScopedRelation) {
        basis.push("boundary-scoped-relation");
    }

    if (hasBoundaryReference) {
        basis.push("boundary-referenced-semantics");
        basis.push(...boundary.semanticReferences.map((reference) => `boundary-reference:${reference.path}`));
    }

    return Array.from(new Set(basis));
}

function buildRequiredEffectClaim(
    program: BubbleProgramIR,
    emissionPlan: BubbleProofEmissionPlan[],
): BubbleConsistencyClaim {
    const requiredEffects = program.bubble.effects.filter((effect) => effect.requirement === "required");
    if (requiredEffects.length === 0) {
        return {
            id: "claim:required-effect-obligations",
            kind: "effect",
            status: "undetermined",
            basis: ["no-required-effects"],
            evidenceIds: [],
            dependsOnClaims: ["claim:well-formed-source"],
            assumptions: [],
            scope: "source",
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
        evidenceIds: requiredEffects.map((effect) => `evidence:effect:${effect.id}`),
        dependsOnClaims: ["claim:minimum-authored-shape"],
        assumptions: ["effect-trace-records-mirror-the-current-materialization-plan"],
        scope: "plan",
        explanation: statuses.map((status) => status.explanation).join(" "),
    };
}

function resolveRequiredEffectCertification(
    effect: EffectIR,
    program: BubbleProgramIR,
    emissionPlan: BubbleProofEmissionPlan[],
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
                    basis: ["declared-history-support"],
                    explanation: `Required effect ${effect.id} is certified by declared history support.`,
                }
                : {
                    status: "contradicted",
                    basis: ["missing-declared-history-support"],
                    explanation: `Required effect ${effect.id} is contradicted because declared history support is absent.`,
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
    semantics: BubbleSemanticEvaluationPlan,
): BubbleConsistencyClaim {
    const anchorCriterion = semantics.anchorCriterion;
    const identityBasis = collectAnchorIdentityBasis(program, ontology);

    if (anchorCriterion?.status === "violated") {
        return {
            id: "claim:anchor-identity",
            kind: "anchor",
            status: "contradicted",
            basis: Array.from(new Set([...identityBasis, ...anchorCriterion.basis])),
            evidenceIds: resolveAnchorEvidenceIds(program),
            dependsOnClaims: ["claim:worldhood-roles-present"],
            assumptions: ["sea-anchor-theorem-witness-is-bounded", "anchor-criterion-evaluation-uses-the-current-executable-subset"],
            scope: "plan",
            explanation: `${anchorCriterion.explanation} Bubble ${program.bubble.name} therefore does not currently certify same-world anchor identity.`,
        };
    }

    if (!ontology.theoremWitness.sustained) {
        return {
            id: "claim:anchor-identity",
            kind: "anchor",
            status: "contradicted",
            basis: identityBasis.length > 0 ? identityBasis : ["missing-anchor-basis"],
            evidenceIds: resolveAnchorEvidenceIds(program),
            dependsOnClaims: ["claim:worldhood-roles-present"],
            assumptions: ["sea-anchor-theorem-witness-is-bounded"],
            scope: "plan",
            explanation: `Bubble ${program.bubble.name} does not currently sustain same-world identity under the theorem witness and is classified as ${ontology.theoremWitness.condition}.`,
        };
    }

    if (anchorCriterion === null) {
        return {
            id: "claim:anchor-identity",
            kind: "anchor",
            status: "undetermined",
            basis: Array.from(new Set([...identityBasis, "missing-authored-anchor-criterion"])),
            evidenceIds: resolveAnchorEvidenceIds(program),
            dependsOnClaims: ["claim:worldhood-roles-present"],
            assumptions: ["sea-anchor-theorem-witness-is-bounded"],
            scope: "plan",
            explanation: `Bubble ${program.bubble.name} keeps an inferred anchor basis, but same-world anchor identity remains undetermined without an authored anchor criterion.`,
        };
    }

    if (anchorCriterion?.status === "undetermined") {
        return {
            id: "claim:anchor-identity",
            kind: "anchor",
            status: "undetermined",
            basis: Array.from(new Set([...identityBasis, ...anchorCriterion.basis])),
            evidenceIds: resolveAnchorEvidenceIds(program),
            dependsOnClaims: ["claim:worldhood-roles-present"],
            assumptions: ["sea-anchor-theorem-witness-is-bounded", "anchor-criterion-evaluation-uses-the-current-executable-subset"],
            scope: "plan",
            explanation: `${anchorCriterion.explanation} Bubble ${program.bubble.name} keeps an inferred anchor basis, but authored same-world identity remains undetermined.`,
        };
    }

    return {
        id: "claim:anchor-identity",
        kind: "anchor",
        status: "certified",
        basis: Array.from(new Set([
            ...identityBasis,
            "authored-anchor-criterion",
            ...(anchorCriterion?.basis ?? []),
        ])),
        evidenceIds: resolveAnchorEvidenceIds(program),
        dependsOnClaims: ["claim:worldhood-roles-present"],
        assumptions: ["sea-anchor-theorem-witness-is-bounded", ...(anchorCriterion ? ["anchor-criterion-evaluation-uses-the-current-executable-subset"] : [])],
        scope: "plan",
        explanation: `Bubble ${program.bubble.name} currently certifies anchor identity as ${ontology.anchorPoint.strength} with theorem condition ${ontology.theoremWitness.condition}${anchorCriterion ? " under the authored anchor criterion" : ""}.`,
    };
}

function buildLineageTraceabilityClaim(
    program: BubbleProgramIR,
    emissionPlan: BubbleProofEmissionPlan[],
    grammarActivationPlan: BubbleProofGrammarActivationPlan[],
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
            evidenceIds: resolveLineageEvidenceIds(program),
            dependsOnClaims: ["claim:well-formed-source"],
            assumptions: [],
            scope: "plan",
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
            evidenceIds: resolveLineageEvidenceIds(program),
            dependsOnClaims: ["claim:well-formed-source"],
            assumptions: [],
            scope: "plan",
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
        evidenceIds: resolveLineageEvidenceIds(program),
        dependsOnClaims: ["claim:well-formed-source"],
        assumptions: [],
        scope: "plan",
        explanation: `Bubble ${program.bubble.name} preserves traceable lineage for every currently declared descendant or staged generation path.`,
    };
}

function buildReplayIdentityClaim(
    program: BubbleProgramIR,
    ontology: BubbleSeaAnchorAssessment,
    semantics: BubbleSemanticEvaluationPlan,
): BubbleConsistencyClaim {
    const anchorCriterion = semantics.anchorCriterion;
    const latentCollapseDrafts = collectLatentCollapseDrafts(program);
    const basis = Array.from(new Set([
        ...collectReplayIdentityBasis(program, ontology),
        ...collectLatentCollapseBasis(latentCollapseDrafts),
        ...(anchorCriterion?.basis ?? []),
    ]));

    if (anchorCriterion?.status === "violated") {
        return {
            id: "claim:replay-identity",
            kind: "replay",
            status: "contradicted",
            basis,
            evidenceIds: resolveReplayEvidenceIds(program),
            dependsOnClaims: ["claim:anchor-identity"],
            assumptions: ["same-world-replay-is-evaluated-from-the-current-plan-basis"],
            scope: "plan",
            explanation: `${anchorCriterion.explanation} Bubble ${program.bubble.name} therefore does not currently certify same-world replay.`,
        };
    }

    if (!ontology.theoremWitness.sustained) {
        return {
            id: "claim:replay-identity",
            kind: "replay",
            status: "contradicted",
            basis,
            evidenceIds: resolveReplayEvidenceIds(program),
            dependsOnClaims: ["claim:anchor-identity"],
            assumptions: ["same-world-replay-is-evaluated-from-the-current-plan-basis"],
            scope: "plan",
            explanation: `Bubble ${program.bubble.name} does not currently certify same-world replay because the theorem witness is ${ontology.theoremWitness.condition}.`,
        };
    }

    if (latentCollapseDrafts.length > 0) {
        return {
            id: "claim:replay-identity",
            kind: "replay",
            status: "undetermined",
            basis,
            evidenceIds: resolveReplayEvidenceIds(program),
            dependsOnClaims: ["claim:anchor-identity"],
            assumptions: [
                "same-world-replay-is-evaluated-from-the-current-plan-basis",
                "latent-collapse-history-is-not-yet-materialized",
                ...(anchorCriterion ? ["anchor-criterion-evaluation-uses-the-current-executable-subset"] : []),
            ],
            scope: "plan",
            explanation: [
                anchorCriterion?.status === "undetermined" ? anchorCriterion.explanation : null,
                `Bubble ${program.bubble.name} preserves a replay basis for currently declared history, but same-world replay across latent regions remains undetermined while collapse drafts are only ${describeLatentCollapseDrafts(latentCollapseDrafts)}.`,
            ].filter((part): part is string => part !== null).join(" "),
        };
    }

    if (anchorCriterion === null) {
        return {
            id: "claim:replay-identity",
            kind: "replay",
            status: "undetermined",
            basis: [...basis, "missing-authored-anchor-criterion"],
            evidenceIds: resolveReplayEvidenceIds(program),
            dependsOnClaims: ["claim:anchor-identity"],
            assumptions: ["same-world-replay-is-evaluated-from-the-current-plan-basis"],
            scope: "plan",
            explanation: `Bubble ${program.bubble.name} preserves an inferred replay basis, but same-world replay remains undetermined without an authored anchor criterion.`,
        };
    }

    if (anchorCriterion?.status === "undetermined") {
        return {
            id: "claim:replay-identity",
            kind: "replay",
            status: "undetermined",
            basis,
            evidenceIds: resolveReplayEvidenceIds(program),
            dependsOnClaims: ["claim:anchor-identity"],
            assumptions: ["same-world-replay-is-evaluated-from-the-current-plan-basis", "anchor-criterion-evaluation-uses-the-current-executable-subset"],
            scope: "plan",
            explanation: `${anchorCriterion.explanation} Bubble ${program.bubble.name} keeps a replay basis, but explicit same-world replay remains undetermined.`,
        };
    }

    if (program.bubble.seed !== null && program.bubble.generation.lifecycle.commitsHistory) {
        return {
            id: "claim:replay-identity",
            kind: "replay",
            status: "certified",
            basis,
            evidenceIds: resolveReplayEvidenceIds(program),
            dependsOnClaims: ["claim:anchor-identity"],
            assumptions: ["same-world-replay-is-evaluated-from-the-current-plan-basis"],
            scope: "plan",
            explanation: `Bubble ${program.bubble.name} currently certifies replay identity through seed continuity, stable root addressing, and declared history support.`,
        };
    }

    return {
        id: "claim:replay-identity",
        kind: "replay",
        status: "undetermined",
        basis: [...basis, ...(program.bubble.generation.lifecycle.commitsHistory ? [] : ["missing-declared-history-support"])],
        evidenceIds: resolveReplayEvidenceIds(program),
        dependsOnClaims: ["claim:anchor-identity"],
        assumptions: ["same-world-replay-is-evaluated-from-the-current-plan-basis"],
        scope: "plan",
        explanation: `Bubble ${program.bubble.name} preserves a replay basis, but same-world replay remains undetermined without declared history support fixation.`,
    };
}

function buildInternalConsistencyClaim(
    program: BubbleProgramIR,
    semantics: BubbleSemanticEvaluationPlan,
): BubbleConsistencyClaim {
    const unresolvedSemantics = program.bubble.unresolvedSemantics ?? [];
    const latentCollapseDrafts = collectLatentCollapseDrafts(program);
    const executableChecks = [...semantics.constraints, ...semantics.partialLaws];
    const checkedFragmentIds = new Set(executableChecks.map((check) => check.subjectId));
    const residualFragments = unresolvedSemantics.filter((fragment) => !checkedFragmentIds.has(fragment.id));

    if (executableChecks.some((check) => check.status === "violated")) {
        return {
            id: "claim:internal-law-consistency",
            kind: "consistency",
            status: "contradicted",
            basis: Array.from(new Set([
                ...executableChecks.flatMap((check) => check.basis),
                ...residualFragments.map((fragment) => unresolvedSemanticBasis(fragment)),
                ...collectLatentCollapseBasis(latentCollapseDrafts),
            ])),
            evidenceIds: [],
            dependsOnClaims: ["claim:well-formed-source"],
            assumptions: [
                "only-the-current-executable-semantic-subset-is-checked",
                ...(latentCollapseDrafts.length > 0 ? ["observation-induced-collapse-is-not-yet-executed"] : []),
            ],
            scope: "plan",
            explanation: executableChecks
                .filter((check) => check.status === "violated")
                .map((check) => check.explanation)
                .join(" "),
        };
    }

    if (executableChecks.length > 0 && executableChecks.every((check) => check.status === "satisfied") && residualFragments.length === 0) {
        return {
            id: "claim:internal-law-consistency",
            kind: "consistency",
            status: "certified",
            basis: Array.from(new Set(executableChecks.flatMap((check) => check.basis))),
            evidenceIds: [],
            dependsOnClaims: ["claim:well-formed-source"],
            assumptions: ["only-the-current-executable-semantic-subset-is-checked"],
            scope: "plan",
            explanation: executableChecks.map((check) => check.explanation).join(" "),
        };
    }

    if (unresolvedSemantics.length > 0) {
        const unresolvedKinds = Array.from(new Set(residualFragments.map((fragment) => fragment.kind)));
        const basis = Array.from(new Set([
            ...executableChecks.flatMap((check) => check.basis),
            ...residualFragments.map((fragment) => unresolvedSemanticBasis(fragment)),
            ...collectLatentCollapseBasis(latentCollapseDrafts),
            ...(executableChecks.length > 0 ? [] : ["no-executable-law-semantics-yet"]),
        ]));
        const certifiedConstraintCount = semantics.constraints.filter((check) => check.status === "satisfied").length;
        const certifiedPartialLawCount = semantics.partialLaws.filter((check) => check.status === "satisfied").length;
        const undeterminedConstraintExplanations = executableChecks
            .filter((check) => check.status === "undetermined")
            .map((check) => check.explanation);

        return {
            id: "claim:internal-law-consistency",
            kind: "consistency",
            status: "undetermined",
            basis,
            evidenceIds: [],
            dependsOnClaims: ["claim:well-formed-source"],
            assumptions: [
                "only-the-current-executable-semantic-subset-is-checked",
                "no-general-law-solver-is-present",
                ...(latentCollapseDrafts.length > 0 ? ["observation-induced-collapse-is-not-yet-executed"] : []),
            ],
            scope: "plan",
            explanation: [
                certifiedConstraintCount > 0
                    ? `Bubble ${program.bubble.name} certified ${certifiedConstraintCount} authored constraint${certifiedConstraintCount === 1 ? "" : "s"} through the executable checker.`
                    : null,
                certifiedPartialLawCount > 0
                    ? `Bubble ${program.bubble.name} certified ${certifiedPartialLawCount} authored partial law fragment${certifiedPartialLawCount === 1 ? "" : "s"} through the executable checker.`
                    : null,
                undeterminedConstraintExplanations.length > 0
                    ? undeterminedConstraintExplanations.join(" ")
                    : null,
                latentCollapseDrafts.length > 0
                    ? `Latent collapse drafts (${describeLatentCollapseDrafts(latentCollapseDrafts)}) keep observation-induced consistency bounded rather than fully discharged.`
                    : null,
                unresolvedKinds.length > 0
                    ? `Residual unresolved semantic fragments (${unresolvedKinds.join(", ")}) keep overall internal semantic consistency undetermined.`
                    : null,
            ].filter((part): part is string => part !== null).join(" "),
        };
    }

    return {
        id: "claim:internal-law-consistency",
        kind: "consistency",
        status: "undetermined",
        basis: ["no-executable-law-semantics-yet"],
        evidenceIds: [],
        dependsOnClaims: ["claim:well-formed-source"],
        assumptions: ["no-general-law-solver-is-present"],
        scope: "plan",
        explanation: `Bubble ${program.bubble.name} does not yet have a full executable law solver, so internal semantic consistency remains undetermined.`,
    };
}

function resolveAnchorEvidenceIds(program: BubbleProgramIR): string[] {
    const rootAddressId = program.bubble.address.id;
    return [
        `evidence:anchor-point:${rootAddressId}`,
        `evidence:positive-sea:${rootAddressId}`,
        `evidence:negative-sea:${rootAddressId}`,
        ...(program.bubble.generation.lifecycle.observationMode === null ? [] : [`evidence:observe:${rootAddressId}`]),
    ];
}

function resolveLineageEvidenceIds(program: BubbleProgramIR): string[] {
    return program.bubble.effects
        .filter((effect) => effect.kind === "spawn" || effect.kind === "branch" || effect.kind === "collapse")
        .map((effect) => `evidence:effect:${effect.id}`);
}

function resolveReplayEvidenceIds(program: BubbleProgramIR): string[] {
    return Array.from(new Set([
        ...resolveAnchorEvidenceIds(program),
        ...program.bubble.effects
            .filter((effect) => effect.kind === "commit" || effect.kind === "observe")
            .map((effect) => `evidence:effect:${effect.id}`),
    ]));
}

function collectCollapseRecordEvidence(evidence: BubbleEvidenceRecord[]): BubbleCollapseRecordEvidenceRecord[] {
    return evidence.filter((entry): entry is BubbleCollapseRecordEvidenceRecord => entry.kind === "collapse-record");
}

function collectLatentCollapseDrafts(program: BubbleProgramIR): BubbleCollapseEvidenceDraftIR[] {
    return program.bubble.latentTopology?.collapseEvidenceDrafts ?? [];
}

function collectLatentCollapseBasis(drafts: BubbleCollapseEvidenceDraftIR[]): string[] {
    if (drafts.length === 0) {
        return [];
    }

    return Array.from(new Set([
        "latent-topology",
        ...drafts.map(latentCollapseDraftBasis),
    ]));
}

function latentCollapseDraftBasis(draft: BubbleCollapseEvidenceDraftIR): string {
    switch (draft.draftStatus) {
        case "observation-ready":
            return "latent-observation-ready";
        case "history-open":
            return "latent-history-open";
        case "underspecified":
            return "latent-collapse-underspecified";
        default:
            return assertNever(draft.draftStatus);
    }
}

function describeLatentCollapseDrafts(drafts: BubbleCollapseEvidenceDraftIR[]): string {
    return Array.from(new Set(drafts.map((draft) => draft.draftStatus))).join(", ");
}

function refineReplayIdentityClaim(
    program: BubbleProgramIR,
    claim: BubbleConsistencyClaim,
    collapseRecords: BubbleCollapseRecordEvidenceRecord[],
    residualDrafts: BubbleCollapseEvidenceDraftIR[],
): BubbleConsistencyClaim {
    const collapseHistoryShape = resolveObservedCollapseHistoryShape(collapseRecords);
    const observedBasis = collectObservedCollapseBasis(collapseRecords);
    const allObservedCommitted = collapseHistoryShape === "fully-committed";
    const basis = Array.from(new Set([
        ...stripResolvedLatentCollapseBasis(claim.basis, residualDrafts),
        ...observedBasis,
        ...collectLatentCollapseBasis(residualDrafts),
    ]));
    const hasSatisfiedAnchorCriterion = basis.includes("authored-anchor-criterion");
    const replayCertified = claim.status === "undetermined" && allObservedCommitted && residualDrafts.length === 0 && hasSatisfiedAnchorCriterion;
    const replayResolution = replayCertified
        ? "is now certified by committed collapse history"
        : allObservedCommitted && residualDrafts.length === 0
            ? "remains inferred because no authored anchor criterion fixes same-world replay"
            : "remains open until that observed history is committed";

    return {
        ...claim,
        status: replayCertified
            ? "certified"
            : claim.status,
        basis,
        evidenceIds: mergeEvidenceIds(claim.evidenceIds, collapseRecords.map((record) => record.id)),
        assumptions: refineCollapseAwareAssumptions(claim.assumptions, collapseRecords, residualDrafts),
        scope: "materialized-run",
        explanation: [
            claim.explanation,
            `Observed collapse records (${describeCollapseRecords(collapseRecords)}) mean this run is no longer pristine latent possibility; same-world replay ${replayResolution}.`,
            residualDrafts.length === 0
                ? null
                : `Residual latent regions still remain only ${describeLatentCollapseDrafts(residualDrafts)}.`,
        ].filter((part): part is string => part !== null).join(" "),
    };
}

function refineInternalConsistencyClaim(
    program: BubbleProgramIR,
    claim: BubbleConsistencyClaim,
    collapseRecords: BubbleCollapseRecordEvidenceRecord[],
    residualDrafts: BubbleCollapseEvidenceDraftIR[],
    semantics: BubbleSemanticEvaluationPlan,
): BubbleConsistencyClaim {
    const collapseHistoryShape = resolveObservedCollapseHistoryShape(collapseRecords);
    const unresolvedSemantics = program.bubble.unresolvedSemantics ?? [];
    const executableChecks = [...semantics.constraints, ...semantics.partialLaws];
    const checkedFragmentIds = new Set(executableChecks.map((check) => check.subjectId));
    const committedCollapseSemanticIds = new Set(
        collapseRecords
            .filter((record) => record.commitStatus === "committed")
            .map((record) => record.sourceSemanticId),
    );
    const committedResolvedFragments = unresolvedSemantics.filter((fragment) => committedCollapseSemanticIds.has(fragment.id));
    const residualFragments = unresolvedSemantics.filter((fragment) =>
        !checkedFragmentIds.has(fragment.id) && !committedCollapseSemanticIds.has(fragment.id),
    );
    const observedBasis = collectObservedCollapseBasis(collapseRecords);
    const committedFragmentBasis = committedResolvedFragments.map(committedResolvedFragmentBasis);
    const executableBasis = executableChecks.flatMap((check) => check.basis);
    const unresolvedKinds = Array.from(new Set(residualFragments.map((fragment) => fragment.kind)));
    const certifiedConstraintCount = semantics.constraints.filter((check) => check.status === "satisfied").length;
    const certifiedPartialLawCount = semantics.partialLaws.filter((check) => check.status === "satisfied").length;
    const undeterminedConstraintExplanations = executableChecks
        .filter((check) => check.status === "undetermined")
        .map((check) => check.explanation);
    const allExecutableChecksSatisfied = executableChecks.length > 0 && executableChecks.every((check) => check.status === "satisfied");
    const basis = Array.from(new Set([
        ...stripResolvedInternalConsistencyBasis(claim.basis),
        ...executableBasis,
        ...residualFragments.map((fragment) => unresolvedSemanticBasis(fragment)),
        ...committedFragmentBasis,
        ...observedBasis,
        ...collectLatentCollapseBasis(residualDrafts),
        ...(executableChecks.length > 0 ? [] : ["no-executable-law-semantics-yet"]),
    ]));

    const status = executableChecks.some((check) => check.status === "violated")
        ? "contradicted"
        : allExecutableChecksSatisfied && residualFragments.length === 0 && residualDrafts.length === 0 && collapseHistoryShape === "fully-committed"
            ? "certified"
            : claim.status === "certified" && collapseRecords.some((record) => record.commitStatus !== "committed")
                ? "undetermined"
                : claim.status === "undetermined" && allExecutableChecksSatisfied && residualFragments.length === 0 && residualDrafts.length === 0
                    ? (collapseHistoryShape === "fully-committed" ? "certified" : "undetermined")
                    : claim.status;

    return {
        ...claim,
        status,
        basis,
        evidenceIds: mergeEvidenceIds(claim.evidenceIds, collapseRecords.map((record) => record.id)),
        assumptions: refineCollapseAwareAssumptions(claim.assumptions, collapseRecords, residualDrafts),
        scope: "materialized-run",
        explanation: buildRuntimeInternalConsistencyExplanation(
            program,
            status,
            certifiedConstraintCount,
            certifiedPartialLawCount,
            undeterminedConstraintExplanations,
            committedResolvedFragments,
            residualDrafts,
            unresolvedKinds,
            collapseRecords,
            executableChecks.length === 0,
        ),
    };
}

function collectObservedCollapseBasis(records: BubbleCollapseRecordEvidenceRecord[]): string[] {
    if (records.length === 0) {
        return [];
    }

    const shape = resolveObservedCollapseHistoryShape(records);
    return Array.from(new Set([
        "collapse-record",
        observedCollapseHistoryShapeBasis(shape),
        ...records.map((record) => observedCollapseBasis(record.commitStatus)),
    ]));
}

type BubbleObservedCollapseHistoryShape =
    | "fully-committed"
    | "partially-committed"
    | "history-open-only"
    | "uncommitted-only"
    | "mixed-open";

function resolveObservedCollapseHistoryShape(
    records: BubbleCollapseRecordEvidenceRecord[],
): BubbleObservedCollapseHistoryShape {
    const committedCount = records.filter((record) => record.commitStatus === "committed").length;
    const historyOpenCount = records.filter((record) => record.commitStatus === "history-open").length;
    const uncommittedCount = records.filter((record) => record.commitStatus === "uncommitted").length;

    if (records.length > 0 && committedCount === records.length) {
        return "fully-committed";
    }

    if (committedCount > 0) {
        return "partially-committed";
    }

    if (records.length > 0 && historyOpenCount === records.length) {
        return "history-open-only";
    }

    if (records.length > 0 && uncommittedCount === records.length) {
        return "uncommitted-only";
    }

    return "mixed-open";
}

function observedCollapseHistoryShapeBasis(
    shape: BubbleObservedCollapseHistoryShape,
): string {
    return `observed-history-shape-${shape}`;
}

function observedCollapseBasis(
    commitStatus: BubbleCollapseRecordEvidenceRecord["commitStatus"],
): string {
    switch (commitStatus) {
        case "uncommitted":
            return "observed-history-uncommitted";
        case "history-open":
            return "observed-history-open";
        case "committed":
            return "observed-history-committed";
        default:
            return assertNever(commitStatus);
    }
}

function stripResolvedLatentCollapseBasis(
    basis: string[],
    residualDrafts: BubbleCollapseEvidenceDraftIR[],
): string[] {
    if (residualDrafts.length > 0) {
        return basis;
    }

    return basis.filter((entry) => !isLatentCollapseBasis(entry));
}

function isLatentCollapseBasis(entry: string): boolean {
    return entry === "latent-topology"
        || entry === "latent-observation-ready"
        || entry === "latent-history-open"
        || entry === "latent-collapse-underspecified";
}

function isInternalConsistencyRuntimeBasis(entry: string): boolean {
    return isLatentCollapseBasis(entry)
        || entry === "hidden-region"
        || entry === "latent-admitted-bubble"
        || entry === "no-executable-law-semantics-yet"
        || entry === "collapse-record"
        || entry.startsWith("observed-history-shape-")
        || entry === "observed-history-uncommitted"
        || entry === "observed-history-open"
        || entry === "observed-history-committed"
        || entry === "committed-hidden-region-history"
        || entry === "committed-latent-bubble-history";
}

function stripResolvedInternalConsistencyBasis(basis: string[]): string[] {
    return basis.filter((entry) => !isInternalConsistencyRuntimeBasis(entry));
}

function refineCollapseAwareAssumptions(
    assumptions: string[] | undefined,
    collapseRecords: BubbleCollapseRecordEvidenceRecord[],
    residualDrafts: BubbleCollapseEvidenceDraftIR[],
): string[] {
    const retained = (assumptions ?? []).filter((entry) =>
        entry !== "latent-collapse-history-is-not-yet-materialized"
        && entry !== "observation-induced-collapse-is-not-yet-executed",
    );

    return Array.from(new Set([
        ...retained,
        ...(collapseRecords.some((record) => record.commitStatus !== "committed") ? ["observed-collapse-history-is-not-yet-committed"] : []),
        ...(residualDrafts.length > 0 ? ["residual-latent-regions-remain-unmaterialized"] : []),
    ]));
}

function describeCollapseRecords(records: BubbleCollapseRecordEvidenceRecord[]): string {
    const statuses = Array.from(new Set(records.map((record) => record.commitStatus)));
    const shape = resolveObservedCollapseHistoryShape(records);
    return `${records.length} record${records.length === 1 ? "" : "s"} at ${statuses.join(", ")} with shape ${shape}`;
}

function committedResolvedFragmentBasis(fragment: BubbleUnresolvedSemanticIR): string {
    switch (fragment.kind) {
        case "hidden-region":
            return "committed-hidden-region-history";
        case "latent-bubble":
            return "committed-latent-bubble-history";
        default:
            return unresolvedSemanticBasis(fragment);
    }
}

function buildRuntimeInternalConsistencyExplanation(
    program: BubbleProgramIR,
    status: BubbleConsistencyClaimStatus,
    certifiedConstraintCount: number,
    certifiedPartialLawCount: number,
    undeterminedConstraintExplanations: string[],
    committedResolvedFragments: BubbleUnresolvedSemanticIR[],
    residualDrafts: BubbleCollapseEvidenceDraftIR[],
    unresolvedKinds: BubbleUnresolvedSemanticKind[],
    collapseRecords: BubbleCollapseRecordEvidenceRecord[],
    noExecutableLawSemantics: boolean,
): string {
    if (status === "contradicted") {
        return [
            undeterminedConstraintExplanations.length > 0 ? undeterminedConstraintExplanations.join(" ") : null,
            committedResolvedFragments.length === 0
                ? null
                : `Committed collapse history already absorbed ${describeCommittedResolvedFragments(committedResolvedFragments)} into observed local history.`,
            `Observed collapse records (${describeCollapseRecords(collapseRecords)}) now witness executed observation-induced materialization for Bubble ${program.bubble.name}.`,
        ].filter((part): part is string => part !== null).join(" ");
    }

    return [
        certifiedConstraintCount > 0
            ? `Bubble ${program.bubble.name} certified ${certifiedConstraintCount} authored constraint${certifiedConstraintCount === 1 ? "" : "s"} through the executable checker.`
            : null,
        certifiedPartialLawCount > 0
            ? `Bubble ${program.bubble.name} certified ${certifiedPartialLawCount} authored partial law fragment${certifiedPartialLawCount === 1 ? "" : "s"} through the executable checker.`
            : null,
        undeterminedConstraintExplanations.length > 0
            ? undeterminedConstraintExplanations.join(" ")
            : null,
        committedResolvedFragments.length === 0
            ? null
            : `Committed collapse history reinterprets ${describeCommittedResolvedFragments(committedResolvedFragments)} as observed local history rather than residual unresolved semantics.`,
        `Observed collapse records (${describeCollapseRecords(collapseRecords)}) now witness executed observation-induced materialization for Bubble ${program.bubble.name}.`,
        residualDrafts.length === 0
            ? null
            : `Residual latent regions still remain only ${describeLatentCollapseDrafts(residualDrafts)}.`,
        unresolvedKinds.length > 0
            ? `Residual unresolved semantic fragments (${unresolvedKinds.join(", ")}) keep overall internal semantic consistency ${status}.`
            : null,
        noExecutableLawSemantics
            ? `Bubble ${program.bubble.name} still has no full executable law solver, so internal semantic consistency remains ${status}.`
            : null,
    ].filter((part): part is string => part !== null).join(" ");
}

function describeCommittedResolvedFragments(fragments: BubbleUnresolvedSemanticIR[]): string {
    const names = fragments.map((fragment) => `${fragment.kind}:${fragment.name}`);
    return names.join(", ");
}

function mergeEvidenceIds(existing: string[] | undefined, next: string[]): string[] {
    return Array.from(new Set([...(existing ?? []), ...next]));
}

function unresolvedSemanticBasis(fragment: BubbleUnresolvedSemanticIR): string {
    switch (fragment.kind) {
        case "unknown-value":
            return "unknown-value";
        case "unknown-entity":
            return "unknown-entity";
        case "constraint":
            return "unresolved-constraint";
        case "partial-law":
            return "unknown-law-fragment";
        case "hidden-region":
            return "hidden-region";
        case "unobservable-relation":
            return "unobservable-relation";
        case "latent-bubble":
            return "latent-admitted-bubble";
        default:
            return assertNever(fragment.kind);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled proof variant: ${String(value)}`);
}

function collectAnchorIdentityBasis(
    program: BubbleProgramIR,
    ontology: BubbleSeaAnchorAssessment,
): string[] {
    return Array.from(new Set([
        ...(Object.keys(program.bubble.axioms).length > 0 ? ["axiomatic-basis"] : []),
        ...(program.bubble.worldWill === null ? [] : ["world-will"]),
        ...(program.bubble.seed === null ? [] : ["seed-continuity"]),
        ...(program.bubble.generation.lifecycle.commitsHistory ? ["declared-history-support"] : []),
        ...(program.bubble.generation.lifecycle.observationMode === null ? [] : ["observation-surface"]),
        ...collectTheoremWitnessBasis(ontology),
        ...collectNegativeSeaSourceBasis(ontology),
        ...collectPositiveSeaSourceBasis(ontology),
        ...collectAnchorStateBasis(ontology),
    ]));
}

function collectReplayIdentityBasis(
    program: BubbleProgramIR,
    ontology: BubbleSeaAnchorAssessment,
): string[] {
    return Array.from(new Set([
        ...collectAnchorIdentityBasis(program, ontology),
        ...(program.bubble.address.locatorKind === "source-relative" ? ["source-lineage-address"] : ["lineage-relative-address"]),
    ]));
}

function collectTheoremWitnessBasis(ontology: BubbleSeaAnchorAssessment): string[] {
    return [
        ontology.theoremWitness.theorem,
        `theorem-condition:${ontology.theoremWitness.condition}`,
        `theorem-worldhood-delta:${ontology.theoremWitness.worldhoodDelta}`,
        `theorem-identity-delta:${ontology.theoremWitness.identityDelta}`,
    ];
}

function collectNegativeSeaSourceBasis(ontology: BubbleSeaAnchorAssessment): string[] {
    return ontology.negativeSea.pressureSources.flatMap((source) => Array.from(new Set([
        `negative-source:${source.kind}`,
        `negative-source-strength:${source.strength}`,
        ...(source.sourceEffectId === null ? [] : [`negative-source-effect:${source.sourceEffectId}`]),
        ...(source.relationKind === null ? [] : [`negative-source-relation:${source.relationKind}`]),
        ...(source.boundaryScope === null ? [] : [`negative-source-scope:${source.boundaryScope}`]),
        ...source.evidenceBasis,
    ])));
}

function collectPositiveSeaSourceBasis(ontology: BubbleSeaAnchorAssessment): string[] {
    return ontology.positiveSea.supportSources.flatMap((source) => Array.from(new Set([
        `positive-source:${source.kind}`,
        `positive-source-support:${source.support}`,
        ...(source.addressId === null ? [] : [`positive-source-address:${source.addressId}`]),
        ...(source.sourceEffectId === null ? [] : [`positive-source-effect:${source.sourceEffectId}`]),
        ...source.evidenceBasis,
    ])));
}

function collectAnchorStateBasis(ontology: BubbleSeaAnchorAssessment): string[] {
    return Array.from(new Set([
        `anchor-support:${ontology.anchorPoint.strength}`,
        `anchor-rewind:${ontology.anchorPoint.rewindStability}`,
        `anchor-identity-status:${ontology.anchorPoint.identityStatus}`,
        `anchor-authored-criterion-status:${ontology.anchorPoint.authoredCriterionStatus}`,
        ...ontology.anchorPoint.authoredCriterionBasis,
        ...ontology.anchorPoint.materializedEvidenceSources.flatMap((source) => Array.from(new Set([
            `anchor-materialized-evidence:${source.kind}`,
            ...source.evidenceBasis,
        ]))),
    ]));
}