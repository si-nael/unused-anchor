import type { EffectKind, EffectScope, EffectSpec } from "../effects";

export type ScalarValue = boolean | number | string;

export type BubbleVersion = "0.1.0" | "0.2.0" | "0.3.0";
export type BubbleProfile = "bubbles.v0.1" | "bubbles.v0.2" | "bubbles.v0.3";
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
    worldWillMode: "governing-principle" | "absent";
    lifecycle: BubbleLifecycleIR;
    relations: BubbleGenerativeRelationIR[];
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

export interface BubbleIR {
    address: BubbleAddressIR;
    name: string;
    axioms: Record<string, ScalarValue>;
    worldWill: string | null;
    seed: string | null;
    observationMode: string | null;
    effects: EffectIR[];
    obligations: ObligationIR[];
    generation: BubbleGenerationIR;
    meta?: BubbleMetaIR;
}

export interface BubbleProgramIR {
    version: BubbleVersion;
    profile: BubbleProfile;
    sourcePath: string | null;
    bubble: BubbleIR;
}
