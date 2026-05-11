import type { EffectKind, EffectScope, EffectSpec } from "../effects";

export type ScalarValue = boolean | number | string;

export interface ObligationIR {
    effectKind: EffectKind;
    scope: EffectScope;
    description: string;
}

export interface BubbleIR {
    name: string;
    axioms: Record<string, ScalarValue>;
    worldWill: string | null;
    seed: string | null;
    observationMode: string | null;
    effects: EffectSpec[];
    obligations: ObligationIR[];
}

export interface BubbleProgramIR {
    version: "0.1.0";
    profile: "bubbles.v0.1";
    sourcePath: string | null;
    bubble: BubbleIR;
}
