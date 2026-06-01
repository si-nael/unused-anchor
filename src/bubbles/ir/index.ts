import type { EffectKind, EffectScope, EffectSpec } from "../effects";

export type ScalarValue = boolean | number | string;

export type BubbleVersion = "0.1.0" | "0.2.0" | "0.3.0" | "0.4.0";
export type BubbleProfile = "bubbles.v0.1" | "bubbles.v0.2" | "bubbles.v0.3" | "bubbles.v0.4";
export type BubbleRealizationMode = "deterministic" | "nondeterministic";
export type BubbleLifecycleMode = "latent" | "active";
export type BubbleRelationKind = "branch" | "spawn" | "collapse";
export type BubbleRelationTarget = "alternative-bubble" | "descendant-bubble" | "retired-bubble";
export type BubbleAddressLocatorKind = "source-relative" | "lineage-relative";
export type BubbleAddressStepKind = "root" | BubbleRelationKind;
export type BubbleEmissionTarget = "descendant" | "artifact";
export type BubbleExpressionLogicalOperator = "and" | "or";
export type BubbleExpressionComparisonOperator = "=" | "!=" | ">" | ">=" | "<" | "<=";

export interface BubbleTextExpressionIR {
    kind: "text";
    value: string;
}

export interface BubbleReferenceExpressionIR {
    kind: "reference";
    path: string;
}

export interface BubbleLiteralExpressionIR {
    kind: "literal";
    value: ScalarValue;
}

export interface BubbleComparisonExpressionIR {
    kind: "comparison";
    operator: BubbleExpressionComparisonOperator;
    left: BubbleExpressionOperandIR;
    right: BubbleExpressionOperandIR;
}

export interface BubbleLogicalExpressionIR {
    kind: "logical";
    operator: BubbleExpressionLogicalOperator;
    left: BubbleExpressionIR;
    right: BubbleExpressionIR;
}

export type BubbleExpressionOperandIR = BubbleReferenceExpressionIR | BubbleLiteralExpressionIR;
export type BubbleExpressionIR =
    | BubbleTextExpressionIR
    | BubbleExpressionOperandIR
    | BubbleComparisonExpressionIR
    | BubbleLogicalExpressionIR;

export type BubbleConditionLogicalOperator = BubbleExpressionLogicalOperator;
export type BubbleConditionComparisonOperator = BubbleExpressionComparisonOperator;
export type BubbleConditionTextIR = BubbleTextExpressionIR;
export type BubbleConditionReferenceIR = BubbleReferenceExpressionIR;
export type BubbleConditionLiteralIR = BubbleLiteralExpressionIR;
export type BubbleConditionComparisonIR = BubbleComparisonExpressionIR;
export type BubbleConditionLogicalIR = BubbleLogicalExpressionIR;
export type BubbleConditionOperandIR = BubbleExpressionOperandIR;
export type BubbleConditionExpressionIR = BubbleExpressionIR;

export interface BubbleAddressStepIR {
    kind: BubbleAddressStepKind;
    key: string;
}

export interface BubbleAddressIR {
    scheme: "bubble-lineage.v1";
    locatorKind: BubbleAddressLocatorKind;
    anchor: string;
    path: BubbleAddressStepIR[];
    id: string;
}

export interface BubbleAddressTemplateIR {
    locatorKind: "lineage-relative";
    baseAddressId: string;
    pathSuffix: BubbleAddressStepIR[];
    description: string;
}

export interface EffectIR extends EffectSpec {
    id: string;
    sourceLine: number;
    sourceConstruct: "effect";
}

export interface ObligationIR {
    effectId: string;
    effectKind: EffectKind;
    scope: EffectScope;
    description: string;
}

export type EffectDeclarationIR = EffectIR;
export type EffectObligationIR = ObligationIR;

export interface EffectPermissionIR {
    effectId: string;
    effectKind: EffectKind;
    scope: EffectScope;
    requirement: EffectIR["requirement"];
    description: string;
}

export type EffectPressureKind =
    | "branch-pressure"
    | "collapse-pressure"
    | "local-leak"
    | "membrane-leak"
    | "global-leak"
    | "unresolved-debt"
    | "law-perturbation";

export interface EffectPressureIR {
    effectId: string;
    effectKind: EffectKind;
    scope: EffectScope;
    pressureKind: EffectPressureKind;
    description: string;
}

export type EffectEventKind =
    | "observation-surface"
    | "history-commit"
    | "descendant-generation"
    | "alternative-branch"
    | "retirement-collapse";

export interface EffectEventIR {
    effectId: string;
    effectKind: EffectKind;
    scope: EffectScope;
    eventKind: EffectEventKind;
    description: string;
}

export interface EffectTraceIR {
    effectId: string;
    sourceLine: number;
    traceKind: "declared-effect";
    description: string;
}

export interface BubbleEffectRolesIR {
    declarations: EffectDeclarationIR[];
    obligations: EffectObligationIR[];
    permissions: EffectPermissionIR[];
    pressures: EffectPressureIR[];
    events: EffectEventIR[];
    traces: EffectTraceIR[];
}

export interface BubbleLifecycleIR {
    initialMode: BubbleLifecycleMode;
    observationMode: string | null;
    commitsHistory: boolean;
    supportsCollapse: boolean;
    supportsLeakage: boolean;
    carriesDebt: boolean;
    supportsPerturbation: boolean;
}

export interface BubbleGenerativeRelationIR {
    kind: BubbleRelationKind;
    sourceEffectId: string;
    requirement: EffectIR["requirement"];
    scope: EffectScope;
    target: BubbleRelationTarget;
    familyName: string | null;
    condition: BubbleExpressionIR | null;
    targetAddressTemplate: BubbleAddressTemplateIR;
    description: string;
}

export interface BubbleGenerationIR {
    realizationMode: BubbleRealizationMode;
    realizationSource: "authored" | "inferred";
    worldWillMode: "descriptive-text" | "criterion" | "absent";
    lifecycle: BubbleLifecycleIR;
    relations: BubbleGenerativeRelationIR[];
}

export type BubbleBoundaryObservationSurfaceIR = "declared-observation-surface" | "undeclared-observation-surface";
export type BubbleBoundaryCommitSurfaceIR = "declared-history-support" | "undeclared-history-support";
export type BubbleBoundaryPerturbationSurfaceIR = "declared-perturbation" | "no-declared-perturbation";

export interface BubbleBoundaryScopeIR {
    scope: Extract<EffectScope, "membrane" | "global">;
    effectIds: string[];
    obligationEffectIds: string[];
    relationSourceEffectIds: string[];
    relationKinds: BubbleRelationKind[];
}

export interface BubbleBoundarySemanticReferenceIR {
    path: string;
    sourceKind: "constraint" | "partial-law" | "anchor-criterion" | "world-will";
    sourceId: string;
}

export interface BubbleBoundaryIR {
    mode: "bubble-boundary.v1";
    observationSurface: BubbleBoundaryObservationSurfaceIR;
    historyCommitSurface: BubbleBoundaryCommitSurfaceIR;
    perturbationSurface: BubbleBoundaryPerturbationSurfaceIR;
    observationEffectIds: string[];
    commitEffectIds: string[];
    perturbEffectIds: string[];
    scopes: BubbleBoundaryScopeIR[];
    semanticReferences: BubbleBoundarySemanticReferenceIR[];
    description: string;
}

export type BubbleWorldWillKindIR = "descriptive-text" | "criterion";

export interface BubbleWorldWillIR {
    id: string;
    sourceLine: number;
    kind: BubbleWorldWillKindIR;
    description: string;
    expression: BubbleExpressionIR;
}

export type BubbleNegativeSeaSourceKindIR =
    | "nondeterministic-realization"
    | "branch"
    | "boundary-stress"
    | "leak"
    | "perturb";

export interface BubbleNegativeSeaSourceSemanticIR {
    id: string;
    kind: BubbleNegativeSeaSourceKindIR;
    sourceEffectId: string | null;
    relationKind: BubbleRelationKind | null;
    boundaryScope: EffectScope | null;
    strength: "elevated" | "high";
    pressureContribution: 1 | 2;
    evidenceBasis: string[];
}

export type BubblePositiveSeaSourceKindIR =
    | "source-lineage"
    | "seed-origin"
    | "descendant-lineage"
    | "staged-growth"
    | "declared-history-support";

export interface BubblePositiveSeaSourceSemanticIR {
    id: string;
    kind: BubblePositiveSeaSourceKindIR;
    addressId: string | null;
    sourceEffectId: string | null;
    support: "present" | "strong";
    supportContribution: 1;
    evidenceBasis: string[];
}

export interface BubbleSeaSemanticsIR {
    mode: "bubble-sea-semantics.v1";
    negativePressureSources: BubbleNegativeSeaSourceSemanticIR[];
    positiveSupportSources: BubblePositiveSeaSourceSemanticIR[];
    description: string;
}

export interface BubbleQuoteIR {
    id: string;
    name: string;
    sourceLine: number;
    artifactKind: "bubble-source";
    artifactSource: string;
}

export interface BubbleGeneratorIR {
    id: string;
    name: string;
    sourceLine: number;
    parameterName: string | null;
    sourceQuoteName: string;
}

export interface BubbleProfileExtensionGrammarIR {
    kind: "profile-extension";
    profileName: string;
    extendsProfile: string;
}

export type BubbleGrammarArtifactIR = BubbleProfileExtensionGrammarIR;

export interface BubbleGrammarIR {
    id: string;
    name: string;
    sourceLine: number;
    artifact: BubbleGrammarArtifactIR;
}

export interface BubbleGrammarActivationIR {
    id: string;
    sourceLine: number;
    grammarName: string;
    profileName: string | null;
}

export interface BubbleReflectionIR {
    id: string;
    sourceLine: number;
    path: string;
}

export interface BubbleEmissionProvenanceIR {
    quoteName: string | null;
    generatorName: string | null;
    reflectionIds: string[];
}

export interface BubbleEmissionIR {
    id: string;
    sourceLine: number;
    sourceName: string;
    sourceKind: "quote" | "generator" | "unknown";
    argument: BubbleExpressionIR | null;
    target: BubbleEmissionTarget | null;
    provenance: BubbleEmissionProvenanceIR;
}

export interface BubbleMetaIR {
    quotes: BubbleQuoteIR[];
    generators: BubbleGeneratorIR[];
    reflections: BubbleReflectionIR[];
    emissions: BubbleEmissionIR[];
    grammars?: BubbleGrammarIR[];
    grammarActivations?: BubbleGrammarActivationIR[];
}

export type BubbleUnresolvedSemanticKind =
    | "unknown-value"
    | "unknown-entity"
    | "constraint"
    | "partial-law"
    | "hidden-region"
    | "unobservable-relation"
    | "latent-bubble";

export interface BubbleUnresolvedSemanticIR {
    id: string;
    kind: BubbleUnresolvedSemanticKind;
    name: string;
    description: string;
    expression?: BubbleExpressionIR;
    sourceLine: number | null;
}

export type BubbleLatentRegionKind = Extract<BubbleUnresolvedSemanticKind, "hidden-region" | "latent-bubble">;
export type BubbleLatentObservationBoundaryIR = BubbleBoundaryObservationSurfaceIR;
export type BubbleLatentCommitBoundaryIR = BubbleBoundaryCommitSurfaceIR;
export type BubbleLatentPerturbationModeIR = BubbleBoundaryPerturbationSurfaceIR;
export type BubbleCollapseEvidenceDraftStatus = "observation-ready" | "history-open" | "underspecified";

export interface BubbleLatentRegionDescriptorIR {
    id: string;
    sourceSemanticId: string;
    name: string;
    kind: BubbleLatentRegionKind;
    description: string;
    sourceLine: number | null;
    initialState: "latent";
    observationBoundary: BubbleLatentObservationBoundaryIR;
    commitBoundary: BubbleLatentCommitBoundaryIR;
    perturbationMode: BubbleLatentPerturbationModeIR;
}

export interface BubbleCollapseEvidenceDraftIR {
    id: string;
    latentRegionId: string;
    sourceSemanticId: string;
    observationEffectIds: string[];
    perturbEffectIds: string[];
    commitEffectIds: string[];
    draftStatus: BubbleCollapseEvidenceDraftStatus;
    description: string;
}

export interface BubbleLatentTopologyIR {
    mode: "bubble-latent-topology.v1";
    regions: BubbleLatentRegionDescriptorIR[];
    collapseEvidenceDrafts: BubbleCollapseEvidenceDraftIR[];
}

export interface BubbleAnchorCriterionIR {
    id: string;
    sourceLine: number;
    description: string;
    expression: BubbleExpressionIR;
}

export interface BubbleWorldWillCriterionIR {
    id: string;
    sourceLine: number;
    description: string;
    expression: BubbleExpressionIR;
}

export interface BubbleIR {
    address: BubbleAddressIR;
    name: string;
    axioms: Record<string, ScalarValue>;
    worldWill: string | null;
    worldWillDeclaration?: BubbleWorldWillIR;
    worldWillCriterion?: BubbleWorldWillCriterionIR;
    seed: string | null;
    observationMode: string | null;
    boundary: BubbleBoundaryIR;
    effects: EffectIR[];
    obligations: ObligationIR[];
    effectRoles: BubbleEffectRolesIR;
    generation: BubbleGenerationIR;
    seaSemantics: BubbleSeaSemanticsIR;
    anchorCriterion?: BubbleAnchorCriterionIR;
    unresolvedSemantics?: BubbleUnresolvedSemanticIR[];
    latentTopology?: BubbleLatentTopologyIR;
    meta?: BubbleMetaIR;
}

export interface BubbleProgramIR {
    version: BubbleVersion;
    profile: BubbleProfile;
    sourcePath: string | null;
    bubble: BubbleIR;
}
