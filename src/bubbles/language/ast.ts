import type { EffectKind, EffectRequirement, EffectScope } from "../effects";
import type { ScalarValue } from "../ir";

export interface SourceSpan {
    line: number;
}

export interface BubbleDocument {
    sourcePath: string | null;
    bubble: BubbleDeclaration;
}

export interface BubbleDeclaration extends SourceSpan {
    kind: "bubble";
    name: string;
    declarations: BubbleStatement[];
}

export type BubbleStatement =
    | AxiomDeclaration
    | WillDeclaration
    | SeedDeclaration
    | ObserveDeclaration
    | EffectDeclaration;

export interface AxiomDeclaration extends SourceSpan {
    kind: "axiom";
    name: string;
    value: ScalarValue;
}

export interface WillDeclaration extends SourceSpan {
    kind: "will";
    expression: string;
}

export interface SeedDeclaration extends SourceSpan {
    kind: "seed";
    value: string;
}

export interface ObserveDeclaration extends SourceSpan {
    kind: "observe";
    mode: string;
}

export interface EffectDeclaration extends SourceSpan {
    kind: "effect";
    effectKind: EffectKind;
    requirement: EffectRequirement;
    scope: EffectScope;
}
