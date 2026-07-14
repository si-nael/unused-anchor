import type {
    BubbleAddressIR,
    BubbleBoundaryIR,
    BubbleEmissionIR,
    BubbleEmissionTarget,
    BubbleGrammarArtifactIR,
    BubbleLatentRegionDescriptorIR,
    BubbleLatentTopologyIR,
    BubbleProgramIR,
    BubbleTransformationIR,
    ObligationIR,
    ScalarValue,
} from "../ir";
import type { Diagnostic } from "../language";
import type {
    BubbleAnchorPointAssessment as OntologyBubbleAnchorPointAssessment,
    BubbleAnchorPointStrength as OntologyBubbleAnchorPointStrength,
    BubbleAnchorRewindStability as OntologyBubbleAnchorRewindStability,
    BubbleNegativeSeaAssessment as OntologyBubbleNegativeSeaAssessment,
    BubbleNegativeSeaPressure as OntologyBubbleNegativeSeaPressure,
    BubblePositiveSeaAssessment as OntologyBubblePositiveSeaAssessment,
    BubblePositiveSeaSupport as OntologyBubblePositiveSeaSupport,
    BubbleSeaAnchorAssessment as OntologyBubbleSeaAnchorAssessment,
    BubbleSeaAnchorTheoremWitness as OntologyBubbleSeaAnchorTheoremWitness,
    BubbleWorldhoodCondition as OntologyBubbleWorldhoodCondition,
} from "./ontology";
import type {
    BubbleAnchorPointEvidenceRecord as EvidenceBubbleAnchorPointEvidenceRecord,
    BubbleCollapseRecordEvidenceRecord as EvidenceBubbleCollapseRecordEvidenceRecord,
    BubbleEffectTraceCausalLink as EvidenceBubbleEffectTraceCausalLink,
    BubbleEffectTraceCausalRelation as EvidenceBubbleEffectTraceCausalRelation,
    BubbleEffectTraceEvidenceRecord as EvidenceBubbleEffectTraceEvidenceRecord,
    BubbleEffectTraceMaterializationState as EvidenceBubbleEffectTraceMaterializationState,
    BubbleEventSourceAttributionBasis as EvidenceBubbleEventSourceAttributionBasis,
    BubbleEventSourceAttributionEvidenceRecord as EvidenceBubbleEventSourceAttributionEvidenceRecord,
    BubbleEventSourceAttributionStatus as EvidenceBubbleEventSourceAttributionStatus,
    BubbleEventSourceCandidate as EvidenceBubbleEventSourceCandidate,
    BubbleEventSourceClassification as EvidenceBubbleEventSourceClassification,
    BubbleEventSourceSubjectKind as EvidenceBubbleEventSourceSubjectKind,
    BubbleEvidenceKind as EvidenceBubbleEvidenceKind,
    BubbleEvidenceRecord as EvidenceBubbleEvidenceRecord,
    BubbleHistoryCommitEvidenceRecord as EvidenceBubbleHistoryCommitEvidenceRecord,
    BubbleNegativeSeaEvidenceRecord as EvidenceBubbleNegativeSeaEvidenceRecord,
    BubbleObservationStateRecord as EvidenceBubbleObservationStateRecord,
    BubbleObservationEvidenceRecord as EvidenceBubbleObservationEvidenceRecord,
    BubblePositiveSeaEvidenceRecord as EvidenceBubblePositiveSeaEvidenceRecord,
    BubbleSelfRealizationEvidenceRecord as EvidenceBubbleSelfRealizationEvidenceRecord,
} from "./evidence";
import type { BubbleConsistencyCertificate } from "./proof";
import type { BubbleSemanticEvaluation, BubbleSemanticEvaluationPlan } from "./semantics";

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

export type BubbleObservationCommitPolicySelectionRule =
    | "commit-single-observed-region"
    | "commit-hidden-region-with-latent-bubble-siblings"
    | "defer-multiple-hidden-region-targets"
    | "defer-no-eligible-observed-target";

export type BubbleObservationCommitPolicyDecisionSource = "bounded-runtime" | "runtime-override";

export type BubbleObservationCommitPolicyHistoryShape =
    | "fully-committed"
    | "partially-committed"
    | "history-open-only"
    | "uncommitted-only"
    | "mixed-open";

export type BubbleObservationMaterializationLawPerturbationMix = "observation-only" | "perturb-mixed";
export type BubbleObservationMaterializationLawNearbyHistoryInfluence = "isolated-latency" | "history-open-neighborhood" | "committed-neighborhood";
export type BubbleObservationMaterializationLawAnchorBinding = "drifting" | "tethered" | "anchored";
export type BubbleObservationMaterializationLawSeaBalance = "negative-skewed" | "contested" | "positive-skewed";
export type BubbleObservationMaterializationLawMembraneCondition =
    | "settled-edge"
    | "pressured-edge"
    | "frayed-edge"
    | "settled-shell"
    | "pressured-shell"
    | "frayed-shell";
export type BubbleObservationMaterializationLawCommitStatus = "uncommitted" | "history-open" | "committed";
export type BubbleObservationMaterializationLawRealizedForm =
    | "boundary-canopy-edge"
    | "boundary-canopy-perturbed-edge"
    | "boundary-canopy-frayed-edge"
    | "boundary-canopy-frayed-wake"
    | "boundary-canopy-anchored-edge"
    | "boundary-canopy-anchored-wake"
    | "boundary-canopy-anchored-fray"
    | "latent-bubble-shell"
    | "latent-bubble-perturbed-shell"
    | "latent-bubble-frayed-shell"
    | "latent-bubble-frayed-echo"
    | "latent-bubble-anchored-shell"
    | "latent-bubble-anchored-echo"
    | "latent-bubble-anchored-fray";

export interface BubbleObservationMaterializationAnchorBindingRule {
    id: string;
    whenAnchorStrength: OntologyBubbleAnchorPointStrength;
    whenNearbyHistoryInfluence?: BubbleObservationMaterializationLawNearbyHistoryInfluence;
    whenCommitStatus?: BubbleObservationMaterializationLawCommitStatus;
    binding: BubbleObservationMaterializationLawAnchorBinding;
}

export interface BubbleObservationMaterializationSeaBalanceLaw {
    positiveSeaRanks: Record<OntologyBubblePositiveSeaSupport, number>;
    negativeSeaRanks: Record<OntologyBubbleNegativeSeaPressure, number>;
    positiveSkewThreshold: number;
    negativeSkewThreshold: number;
    contestedBalance: BubbleObservationMaterializationLawSeaBalance;
}

export interface BubbleObservationMaterializationMembraneRule {
    id: string;
    resultPrefix: "settled" | "pressured" | "frayed";
    whenSeaBalance?: BubbleObservationMaterializationLawSeaBalance;
    whenPerturbationMix?: BubbleObservationMaterializationLawPerturbationMix;
    whenNearbyHistoryInfluence?: BubbleObservationMaterializationLawNearbyHistoryInfluence;
    whenWorldhoodCondition?: OntologyBubbleWorldhoodCondition;
}

export interface BubbleObservationMaterializationRealizedFormRule {
    id: string;
    regionKind: BubbleLatentRegionDescriptorIR["kind"];
    realizedForm: BubbleObservationMaterializationLawRealizedForm;
    whenHistoryCoupling?: BubbleObservationMaterializationLawNearbyHistoryInfluence;
    whenCommitStatus?: BubbleObservationMaterializationLawCommitStatus;
    whenAnchorBinding?: BubbleObservationMaterializationLawAnchorBinding;
    whenSeaBalance?: BubbleObservationMaterializationLawSeaBalance;
    whenMembraneCondition?: BubbleObservationMaterializationLawMembraneCondition;
    whenPerturbationMix?: BubbleObservationMaterializationLawPerturbationMix;
}

export interface BubbleObservationMaterializationLaw {
    mode: "bubble-observation-materialization-law.v1";
    kernel: "single-region-observation-kernel.v3";
    determinantAxes: string[];
    stateStructure: {
        anchorBindingRules: BubbleObservationMaterializationAnchorBindingRule[];
        seaBalanceLaw: BubbleObservationMaterializationSeaBalanceLaw;
        membraneRules: BubbleObservationMaterializationMembraneRule[];
    };
    realizedFormRules: BubbleObservationMaterializationRealizedFormRule[];
    description: string;
}

export type BubbleExternalObservationLatentInteriorKind = BubbleLatentRegionDescriptorIR["kind"] | "unobservable-relation";

export interface BubbleExternalObservationLimit {
    mode: "bubble-external-observation-limit.v1";
    observerPosition: "outside-bubble";
    preContactInteriorAccess: "concrete-interior-not-fully-readable";
    interiorExistenceMode: "compressed-lawful-existence";
    declaredObservationSurface: BubbleBoundaryIR["observationSurface"];
    declaredPerturbationSurface: BubbleBoundaryIR["perturbationSurface"];
    declaredHistorySurface: BubbleBoundaryIR["historyCommitSurface"];
    latentInteriorKinds: BubbleExternalObservationLatentInteriorKind[];
    causalContactEffectIds: {
        observation: string[];
        perturbation: string[];
        historyCommit: string[];
    };
    traceConsequences: {
        recordsObservationContext: boolean;
        mayMaterializeLatentInterior: boolean;
        mayRecordCollapse: boolean;
        mayAnchorHistory: boolean;
    };
    description: string;
}

export interface BubbleObservationCommitPolicyPlan {
    mode: "runtime-observation-commit-policy.v1";
    policyId: string;
    decisionSource: BubbleObservationCommitPolicyDecisionSource;
    selectionRule: BubbleObservationCommitPolicySelectionRule;
    localMaterializationTargetId: string | null;
    observedRegionIds: string[];
    selectedTargetIds: string[];
    deferredTargetIds: string[];
    projectedHistoryShape: BubbleObservationCommitPolicyHistoryShape;
    description: string;
}

export interface BubbleObservationCommitPolicyOverride {
    mode: "runtime-observation-commit-policy-override.v1";
    source: "runtime-option";
    forcedSelectionRule: BubbleObservationCommitPolicySelectionRule;
    reason: string;
}

export type BubbleObservationCommitPolicyDifference =
    | "selection-rule-changed"
    | "selected-targets-changed"
    | "deferred-targets-changed"
    | "projected-history-shape-changed";

export interface BubbleObservationCommitPolicyComparison {
    mode: "runtime-observation-commit-policy-comparison.v1";
    comparisonId: string;
    overrideApplied: boolean;
    override: BubbleObservationCommitPolicyOverride | null;
    baseline: BubbleObservationCommitPolicyPlan;
    effective: BubbleObservationCommitPolicyPlan;
    differences: BubbleObservationCommitPolicyDifference[];
    description: string;
}

export interface BubbleRuntimeOptions {
    observationCommitPolicyOverride?: BubbleObservationCommitPolicyOverride | null;
    selfRealizationResume?: BubbleSelfRealizationResume | null;
}

export interface BubbleSelfRealizationResume {
    mode: "bubble-self-realization-resume.v1";
    bubbleAddressId: string;
    sourceContinuationId: string;
    state: Record<string, ScalarValue>;
}

export type BubbleSelfRealizationStatus =
    | "stable"
    | "realized"
    | "plural"
    | "underdetermined"
    | "blocked"
    | "contradicted";
export type BubbleSelfRealizationStateSource = "authored-initial" | "resumed-continuation";
export type BubbleSelfRealizationReversibility = "identity" | BubbleTransformationIR["reversibility"];
export type BubbleSelfRealizationOrdering = "none" | "causal" | "committed-history";
export type BubbleSelfRealizationTopology = "single" | "branching" | "terminal";
export type BubbleSelfRealizationIdentityOutcome = "preserved" | "open" | "released";
export type BubbleSelfRealizationConsequence =
    | "none"
    | "causal-trace"
    | "history-commit"
    | "branch-continuation"
    | "descendant-continuation"
    | "world-collapse";

export interface BubbleSelfRealizationCandidate {
    candidateId: string;
    kind: "preserve" | "transform";
    transformationId: string | null;
    transformationName: string;
    reversibility: BubbleSelfRealizationReversibility;
    ordering: BubbleSelfRealizationOrdering;
    topology: BubbleSelfRealizationTopology;
    identityOutcome: BubbleSelfRealizationIdentityOutcome;
    effectId: string | null;
    effectKind: BubbleProgramIR["bubble"]["effects"][number]["kind"] | null;
    effectRequirement: BubbleProgramIR["bubble"]["effects"][number]["requirement"] | null;
    consequence: BubbleSelfRealizationConsequence;
    eligible: boolean;
    stateBefore: Record<string, ScalarValue>;
    stateAfter: Record<string, ScalarValue>;
    worldWillEvaluation: BubbleSemanticEvaluation | null;
    admittedByWorldWill: boolean;
    selected: boolean;
    description: string;
}

export interface BubbleSelfRealizationContinuation {
    continuationId: string;
    candidateId: string;
    transformationId: string | null;
    state: Record<string, ScalarValue>;
    reversibility: BubbleSelfRealizationReversibility;
    ordering: BubbleSelfRealizationOrdering;
    topology: BubbleSelfRealizationTopology;
    consequence: BubbleSelfRealizationConsequence;
    createsHistoryArrow: boolean;
}

export interface BubbleSelfRealizationPlan {
    mode: "bubble-self-realization.v1";
    realizationId: string;
    governingWillId: string;
    clockAssumption: "no-universal-clock";
    stateSource: BubbleSelfRealizationStateSource;
    sourceContinuationId: string | null;
    currentState: Record<string, ScalarValue>;
    status: BubbleSelfRealizationStatus;
    candidates: BubbleSelfRealizationCandidate[];
    selectedCandidateIds: string[];
    continuations: BubbleSelfRealizationContinuation[];
    obligationConflicts: string[];
    description: string;
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
    boundary: BubbleBoundaryIR;
    observationMaterializationLaw: BubbleObservationMaterializationLaw | null;
    externalObservationLimit: BubbleExternalObservationLimit;
    semantics: BubbleSemanticEvaluationPlan;
    ontology: BubbleSeaAnchorAssessment;
    proof: BubbleConsistencyCertificate;
    selfRealization: BubbleSelfRealizationPlan | null;
    bundle: BubbleBundlePlan;
    latentTopology: BubbleLatentTopologyIR | null;
    observationCommitPolicy: BubbleObservationCommitPolicyPlan | null;
    observationCommitPolicyComparison: BubbleObservationCommitPolicyComparison | null;
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
export type BubbleEffectTraceCausalRelation = EvidenceBubbleEffectTraceCausalRelation;
export type BubbleEffectTraceCausalLink = EvidenceBubbleEffectTraceCausalLink;
export type BubbleEventSourceClassification = EvidenceBubbleEventSourceClassification;
export type BubbleEventSourceAttributionStatus = EvidenceBubbleEventSourceAttributionStatus;
export type BubbleEventSourceSubjectKind = EvidenceBubbleEventSourceSubjectKind;
export type BubbleEventSourceAttributionBasis = EvidenceBubbleEventSourceAttributionBasis;
export type BubbleEventSourceCandidate = EvidenceBubbleEventSourceCandidate;
export type BubbleEventSourceAttributionEvidenceRecord = EvidenceBubbleEventSourceAttributionEvidenceRecord;
export type BubbleObservationEvidenceRecord = EvidenceBubbleObservationEvidenceRecord;
export type BubbleObservationStateRecord = EvidenceBubbleObservationStateRecord;
export type BubbleCollapseRecordEvidenceRecord = EvidenceBubbleCollapseRecordEvidenceRecord;
export type BubbleHistoryCommitEvidenceRecord = EvidenceBubbleHistoryCommitEvidenceRecord;
export type BubbleNegativeSeaEvidenceRecord = EvidenceBubbleNegativeSeaEvidenceRecord;
export type BubblePositiveSeaEvidenceRecord = EvidenceBubblePositiveSeaEvidenceRecord;
export type BubbleAnchorPointEvidenceRecord = EvidenceBubbleAnchorPointEvidenceRecord;
export type BubbleEffectTraceEvidenceRecord = EvidenceBubbleEffectTraceEvidenceRecord;
export type BubbleSelfRealizationEvidenceRecord = EvidenceBubbleSelfRealizationEvidenceRecord;
export type BubbleEvidenceRecord = EvidenceBubbleEvidenceRecord;

export interface BubbleMaterializationTraceEvent {
    kind:
    | "materialization-started"
    | "self-realization-resolved"
    | "grammar-activation-staged"
    | "no-emissions"
    | "local-collapse-materialized"
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
    proof: BubbleConsistencyCertificate;
    runtimeOntology: BubbleSeaAnchorAssessment;
    selfRealization: BubbleSelfRealizationPlan | null;
    artifacts: MaterializedBubbleArtifact[];
    commits: BubbleMaterializationCommit[];
    evidence: BubbleEvidenceRecord[];
    trace: BubbleMaterializationTraceEvent[];
}
