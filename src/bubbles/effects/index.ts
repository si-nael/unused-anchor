export const EFFECT_KINDS = [
    "branch",
    "spawn",
    "collapse",
    "commit",
    "leak",
    "debt",
    "perturb",
    "observe",
] as const;

export const EFFECT_REQUIREMENTS = ["required", "optional"] as const;
export const EFFECT_SCOPES = ["local", "membrane", "global"] as const;

export type EffectKind = (typeof EFFECT_KINDS)[number];
export type EffectRequirement = (typeof EFFECT_REQUIREMENTS)[number];
export type EffectScope = (typeof EFFECT_SCOPES)[number];

export interface EffectSpec {
    kind: EffectKind;
    requirement: EffectRequirement;
    scope: EffectScope;
}

export function effectKey(spec: Pick<EffectSpec, "kind" | "scope">): string {
    return `${spec.kind}:${spec.scope}`;
}

export function isEffectKind(value: string): value is EffectKind {
    return EFFECT_KINDS.includes(value as EffectKind);
}

export function isEffectRequirement(value: string): value is EffectRequirement {
    return EFFECT_REQUIREMENTS.includes(value as EffectRequirement);
}

export function isEffectScope(value: string): value is EffectScope {
    return EFFECT_SCOPES.includes(value as EffectScope);
}
