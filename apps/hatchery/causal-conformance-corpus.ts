// The Gate D causal conformance corpus: canonical worlds plus resource-boundary and counterfactual verdicts.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { CausalConformanceCase } from "../../src/bubbles/bir";
import { compileCausalBubbleSource } from "../../src/bubbles/language";
import {
    causalOptionsForEndogenousCompilation,
    compileEndogenousUniverse,
    materializeEndogenousUniverse,
    type EndogenousUniverseProgram,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";

export const CAUSAL_CONFORMANCE_DIRECTORY = "data/conformance/causal";

export function causalConformanceCases(root = process.cwd()): CausalConformanceCase[] {
    const read = (file: string): string => readFileSync(path.join(root, file), "utf8");
    const json = (name: string): ExecutableAnchoredCausalProgram => JSON.parse(read(`examples/${name}.world.json`));
    const persistent = (name: string): ExecutableAnchoredCausalProgram => JSON.parse(read(`examples/${name}.world.json`)).causalProgram;
    const source = (name: string): ExecutableAnchoredCausalProgram => (
        compileCausalBubbleSource(read(`examples/${name}.causal.bubble`), { sourcePath: `examples/${name}.causal.bubble` }).program
    );
    const endogenous = JSON.parse(read("examples/endogenous-connected-universe.world.json")) as EndogenousUniverseProgram;
    const compiled = compileEndogenousUniverse(endogenous, materializeEndogenousUniverse(endogenous, { maxDepth: 2, maxWorlds: 32 }));
    if (!compiled) throw new Error("the canonical connected universe no longer compiles to one causal program");

    const selfOrganizing = json("self-organizing-field");
    const branching = json("endogenous-branching-field");
    const grove = json("generational-grove");
    const maintaining = persistent("self-maintaining-field");
    const connected = source("connected-fields");

    return [
        { name: "self-organizing-field", description: "World-Will intervention over exact sea-coupled structure emergence", program: selfOrganizing, options: {} },
        { name: "endogenous-branching-field", description: "every maximal commuting frontier becomes an autonomous branch with robust World Will", program: branching, options: {} },
        { name: "generational-grove", description: "internal-law birth of a latent world and self-retirement with residue", program: grove, options: {} },
        { name: "self-maintaining-field", description: "persistent recurrent component under negative-sea erosion and restoration", program: maintaining, options: {} },
        { name: "distributed-channel-field", description: "distributed two-channel persistence without a scalar phase coordinate", program: persistent("distributed-channel-field"), options: {} },
        { name: "generational-seed", description: "strict causal Bubble source lowering lifecycle with World Will disabled", program: source("generational-seed"), options: { worldWillEnabled: false } },
        { name: "connected-fields", description: "one identity-checked anchor crossing with sea residue and receiver-local response", program: connected, options: { worldWillEnabled: false } },
        {
            name: "endogenous-connected-universe",
            description: "the compiled 7-world generated universe with transported conditions as field overrides",
            program: compiled.program,
            options: causalOptionsForEndogenousCompilation(compiled),
        },
        {
            name: "branch-budget-exhausted",
            description: "a branch budget below the maximal frontier family returns an honest boundary, not a chosen branch",
            program: branching,
            options: { maxInternalBranches: 1 },
        },
        {
            name: "intervention-budget-exhausted",
            description: "an intervention search budget below the combination space returns an honest boundary",
            program: branching,
            options: { maxInterventionCombinations: 1 },
        },
        {
            name: "proof-budget-exhausted",
            description: "a per-query proof budget too small for the formal families leaves the world unresolved",
            program: selfOrganizing,
            options: { evaluationBudgetPerQuery: 1 },
        },
        {
            name: "autonomy-all-anchors-cut",
            description: "World Will disabled and every anchor cut leaves one intervention-free autonomous continuation",
            program: grove,
            options: { worldWillEnabled: false, cutAnchorIds: grove.world.anchors.map((anchor) => anchor.id) },
        },
        {
            name: "internal-event-nonrealization",
            description: "a same-program counterfactual suppresses one enabled law occurrence without deleting the law",
            program: maintaining,
            options: {
                worldWillEnabled: false,
                counterfactualInternalEventAblationLawIds: [maintaining.world.internalLaws[0]!.id],
            },
        },
        {
            name: "membrane-anchor-cut",
            description: "cutting the transfer anchor blocks the crossing and the receiver cannot respond",
            program: connected,
            options: { worldWillEnabled: false, cutAnchorIds: (connected.world.anchorTransfers ?? []).map((transfer) => transfer.anchorId) },
        },
        {
            name: "unknown-option-target",
            description: "an execution option naming no anchor contradicts execution instead of being ignored",
            program: selfOrganizing,
            options: { cutAnchorIds: ["no-such-anchor"] },
        },
    ];
}
