import type { EffectSpec } from "../effects";
import type { BubbleProgramIR, ObligationIR } from "../ir";
import type { BubbleDocument } from "./ast";
import { throwDiagnostic } from "./diagnostics";

export function lowerBubbleDocument(document: BubbleDocument): BubbleProgramIR {
    const axioms = new Map<string, boolean | number | string>();
    let worldWill: string | null = null;
    let seed: string | null = null;
    let observationMode: string | null = null;
    const effects: EffectSpec[] = [];

    for (const declaration of document.bubble.declarations) {
        switch (declaration.kind) {
            case "axiom":
                if (axioms.has(declaration.name)) {
                    throwDiagnostic({
                        code: "BBL101",
                        severity: "error",
                        message: `Duplicate axiom '${declaration.name}' on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                axioms.set(declaration.name, declaration.value);
                break;
            case "will":
                if (worldWill !== null) {
                    throwDiagnostic({
                        code: "BBL102",
                        severity: "error",
                        message: `Duplicate world will declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                worldWill = declaration.expression;
                break;
            case "seed":
                if (seed !== null) {
                    throwDiagnostic({
                        code: "BBL103",
                        severity: "error",
                        message: `Duplicate seed declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                seed = declaration.value;
                break;
            case "observe":
                if (observationMode !== null) {
                    throwDiagnostic({
                        code: "BBL104",
                        severity: "error",
                        message: `Duplicate observe declaration on line ${declaration.line}.`,
                        sourcePath: document.sourcePath,
                        line: declaration.line,
                    });
                }

                observationMode = declaration.mode;
                break;
            case "effect":
                effects.push({
                    kind: declaration.effectKind,
                    requirement: declaration.requirement,
                    scope: declaration.scope,
                });
                break;
            default:
                assertNever(declaration);
        }
    }

    const obligations = buildObligations(effects);

    return {
        version: "0.1.0",
        profile: "bubbles.v0.1",
        sourcePath: document.sourcePath,
        bubble: {
            name: document.bubble.name,
            axioms: Object.fromEntries(axioms),
            worldWill,
            seed,
            observationMode,
            effects,
            obligations,
        },
    };
}

function buildObligations(effects: EffectSpec[]): ObligationIR[] {
    return effects
        .filter((effect) => effect.requirement === "required")
        .map((effect) => ({
            effectKind: effect.kind,
            scope: effect.scope,
            description: `Author declared ${effect.kind} as a required ${effect.scope} effect.`,
        }));
}

function assertNever(value: never): never {
    throw new Error(`Unhandled declaration: ${JSON.stringify(value)}`);
}
