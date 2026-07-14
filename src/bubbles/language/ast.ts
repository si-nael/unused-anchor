import type { EffectKind, EffectRequirement, EffectScope } from "../effects";
import type {
    BubbleExpressionIR,
    BubbleEmissionTarget,
    BubbleGrammarArtifactIR,
    BubbleRealizationMode,
    BubbleTransformationReversibilityIR,
    BubbleUnresolvedSemanticKind,
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
    | AnchorDeclaration
    | StateDeclaration
    | TransformDeclaration
    | UnresolvedSemanticDeclaration
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
    expression: BubbleExpressionIR;
    description: string;
}

export interface SeedDeclaration extends SourceSpan {
    kind: "seed";
    value: string;
}

export interface ObserveDeclaration extends SourceSpan {
    kind: "observe";
    mode: string;
}

export interface AnchorDeclaration extends SourceSpan {
    kind: "anchor";
    expression: BubbleExpressionIR;
    description: string;
}

export interface StateDeclaration extends SourceSpan {
    kind: "state";
    name: string;
    initialValue: ScalarValue;
}

export interface TransformDeclaration extends SourceSpan {
    kind: "transform";
    name: string;
    reversibility: BubbleTransformationReversibilityIR;
    stateName: string;
    fromValue: ScalarValue;
    toValue: ScalarValue;
    inverseName: string | null;
    effectKind: EffectKind | null;
}

export interface UnresolvedSemanticDeclaration extends SourceSpan {
    kind: "unresolved-semantic";
    semanticKind: BubbleUnresolvedSemanticKind;
    name: string;
    description: string;
    expression: BubbleExpressionIR | null;
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
    artifact: BubbleGrammarArtifactIR;
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
