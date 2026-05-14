import type { EffectKind, EffectRequirement, EffectScope } from "../effects";
import type {
    BubbleExpressionIR,
    BubbleEmissionTarget,
    BubbleRealizationMode,
    ScalarValue,
} from "../ir";

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
    | RealizationDeclaration
    | WillDeclaration
    | SeedDeclaration
    | ObserveDeclaration
    | SpawnDeclaration
    | QuoteDeclaration
    | GeneratorDeclaration
    | GrammarDeclaration
    | ActivateGrammarDeclaration
    | ReflectDeclaration
    | EmitDeclaration
    | EffectDeclaration;

export interface AxiomDeclaration extends SourceSpan {
    kind: "axiom";
    name: string;
    value: ScalarValue;
}

export interface RealizationDeclaration extends SourceSpan {
    kind: "realization";
    mode: BubbleRealizationMode;
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

export interface SpawnDeclaration extends SourceSpan {
    kind: "spawn";
    familyName: string;
    condition: BubbleExpressionIR | null;
}

export interface QuoteDeclaration extends SourceSpan {
    kind: "quote";
    name: string;
    artifactSource: string;
}

export interface GeneratorDeclaration extends SourceSpan {
    kind: "generator";
    name: string;
    parameterName: string | null;
    sourceQuoteName: string;
}

export interface GrammarDeclaration extends SourceSpan {
    kind: "grammar";
    name: string;
    artifactSource: string;
}

export interface ActivateGrammarDeclaration extends SourceSpan {
    kind: "activate-grammar";
    grammarName: string;
    profileName: string | null;
}

export interface ReflectDeclaration extends SourceSpan {
    kind: "reflect";
    path: string;
}

export interface EmitDeclaration extends SourceSpan {
    kind: "emit";
    sourceName: string;
    argument: BubbleExpressionIR | null;
    target: BubbleEmissionTarget | null;
}

export interface EffectDeclaration extends SourceSpan {
    kind: "effect";
    effectKind: EffectKind;
    requirement: EffectRequirement;
    scope: EffectScope;
}
