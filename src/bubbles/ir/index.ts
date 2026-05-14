import type { EffectKind, EffectScope, EffectSpec } from "../effects";

export type ScalarValue = boolean | number | string;

export type BubbleRealizationMode = "deterministic" | "nondeterministic";
export type BubbleLifecycleMode = "latent" | "active";
export type BubbleRelationKind = "branch" | "spawn" | "collapse";
export type BubbleRelationTarget = "alternative-bubble" | "descendant-bubble" | "retired-bubble";
export type BubbleAddressLocatorKind = "source-relative" | "lineage-relative";
export type BubbleAddressStepKind = "root" | BubbleRelationKind;

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
}

export interface BubbleGenerativeRelationIR {
    kind: BubbleRelationKind;
    sourceEffectId: string;
    requirement: EffectIR["requirement"];
    scope: EffectScope;
    target: BubbleRelationTarget;
    familyName: string | null;
    condition: string | null;
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
}

export interface BubbleProgramIR {
    version: "0.1.0";
    profile: "bubbles.v0.1";
    sourcePath: string | null;
    bubble: BubbleIR;
}
