// The Gate D causal conformance corpus: canonical worlds plus resource-boundary and counterfactual verdicts,
// sea-medium worlds, and derivation probes requested by the independent clean-room reader.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { CausalConformanceCase } from "../../src/bubbles/bir";
import { compileCausalBubbleSource } from "../../src/bubbles/language";
import {
    causalOptionsForEndogenousCompilation,
    compileEndogenousUniverse,
    materializeEndogenousUniverse,
    type CausalInternalLaw,
    type EndogenousUniverseProgram,
    type ExecutableAnchoredCausalProgram,
} from "../../src/bubbles/world-kernel";

export const CAUSAL_CONFORMANCE_DIRECTORY = "data/conformance/causal";

/** Replaces one exact source fragment, refusing silently unchanged derived programs. */
function replacedOnce(text: string, search: string, replacement: string, label: string): string {
    if (!text.includes(search)) throw new Error(`conformance probe '${label}' no longer finds '${search}' in its base example`);
    return text.replace(search, replacement);
}

/** Inserts declarations just before a causal Bubble source's closing brace. */
function withDeclarations(text: string, lines: string[]): string {
    const closing = text.lastIndexOf("}");
    return `${text.slice(0, closing)}\n${lines.map((line) => `  ${line}\n`).join("")}}\n`;
}

export function causalConformanceCases(root = process.cwd()): CausalConformanceCase[] {
    const read = (file: string): string => readFileSync(path.join(root, file), "utf8");
    const json = (name: string): ExecutableAnchoredCausalProgram => JSON.parse(read(`examples/${name}.world.json`));
    const persistent = (name: string): ExecutableAnchoredCausalProgram => JSON.parse(read(`examples/${name}.world.json`)).causalProgram;
    const sourceText = (name: string): string => read(`examples/${name}.causal.bubble`);
    const compileSource = (text: string, sourcePath: string): ExecutableAnchoredCausalProgram => (
        compileCausalBubbleSource(text, { sourcePath }).program
    );
    const source = (name: string): ExecutableAnchoredCausalProgram => compileSource(sourceText(name), `examples/${name}.causal.bubble`);
    const endogenous = JSON.parse(read("examples/endogenous-connected-universe.world.json")) as EndogenousUniverseProgram;
    const compiled = compileEndogenousUniverse(endogenous, materializeEndogenousUniverse(endogenous, { maxDepth: 2, maxWorlds: 32 }));
    if (!compiled) throw new Error("the canonical connected universe no longer compiles to one causal program");

    const selfOrganizing = json("self-organizing-field");
    const branching = json("endogenous-branching-field");
    const grove = json("generational-grove");
    const maintaining = persistent("self-maintaining-field");
    const connected = source("connected-fields");

    // v0.5.10 multiversal sea medium: the canonical residue commons, and a scarcity variant in which the sheltered
    // world's closed boundary is removed so both far worlds' seep exchanges draw the one far-region residue unit.
    const residueCommons = source("residue-commons");
    const openShelter = replacedOnce(
        sourceText("residue-commons"),
        'field sheltered.boundary role boundary-state = "closed"',
        'field sheltered.boundary role boundary-state = "open"',
        "sea-scarcity",
    );
    const scarcityUnderdetermined = compileSource(openShelter, "examples/residue-commons.causal.bubble#open-shelter");
    const scarcityBranches = compileSource(
        replacedOnce(openShelter, "decision deterministic", "decision deterministic conflicts maximal-commuting-branches", "sea-scarcity-branches"),
        "examples/residue-commons.causal.bubble#open-shelter-branches",
    );

    // Clean-room probe (a): a co-realized law renamed `z`, so BIR set order of realizedLawIds ("z" encodes shorter)
    // differs from canonical string order ("raise-common-positive-gradient" sorts first).
    const renamedBranching = structuredClone(branching);
    const renamedLaw = renamedBranching.world.internalLaws.find((law) => law.id === "form-left-structure");
    if (!renamedLaw) throw new Error("conformance probe 'branch-set-order' no longer finds law 'form-left-structure'");
    renamedLaw.id = "z";

    // Clean-room probe (b): two further conflicting laws become enabled only once either first-frontier branch has
    // formed structure, so every continuation's branch lineage has two sequential steps and the second has a parent.
    const nestedBranching = structuredClone(branching);
    const settleMemory = (id: string, memory: string): CausalInternalLaw => ({
        id,
        worldId: "branching-field",
        guard: {
            id: `${id}-once-structured`,
            query: { familyId: "structure-exists", at: { coordinate: "0" }, parameters: {} },
            fieldParameters: [{ parameterName: "structure", worldId: "branching-field", fieldId: "structure" }],
        },
        effects: [{ fieldId: "memory", operation: "set", value: { kind: "rational", numerator: memory, denominator: "1" } }],
        application: "once-per-realization",
        reversibility: "irreversible",
        commitAffectedFieldIds: ["memory"],
    });
    nestedBranching.world.internalLaws.push(settleMemory("settle-shallow-memory", "2"), settleMemory("settle-deep-memory", "3"));

    // Clean-room probe (c): the spawned descendant itself spawns a grandchild, so the grandchild's lineage record
    // names the descendant's assigned lineage id, not an `initial:<worldId>` parent.
    const chainedLineage = compileSource(withDeclarations(sourceText("generational-seed"), [
        "world grandchild-seed latent",
        "field grandchild-seed.positive role positive-sea = 1",
        "field grandchild-seed.negative role negative-sea = 1",
        "field grandchild-seed.viability role viability = 1",
        "field grandchild-seed.structure role structural-state = 0",
        "sea grandchild-seed positive positive negative negative viability viability weights 1 1",
        "anchor grandchild-seed-anchor world grandchild-seed port grandchild-boundary identity true permit condition",
        "objective preserve-grandchild-seed world grandchild-seed field viability direction maximize weight 1",
        "law germinate-grandchild-seed world descendant-seed when structure = 1 irreversible",
        "law-effect germinate-grandchild-seed set condition 1",
        "law-lifecycle germinate-grandchild-seed spawn grandchild-seed",
        "law-commit germinate-grandchild-seed condition",
    ]), "examples/generational-seed.causal.bubble#grandchild");

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
        {
            name: "residue-commons",
            description: "closed sea medium: elder retirement releases residue that diffuses to a far region and seeps only through an open boundary",
            program: residueCommons,
            options: { worldWillEnabled: false },
        },
        {
            name: "sea-scarcity-underdetermined",
            description: "two seep exchanges draw one scarce far-region residue under the default conflict mode and stay unresolved",
            program: scarcityUnderdetermined,
            options: { worldWillEnabled: false },
        },
        {
            name: "sea-scarcity-branches",
            description: "two seep exchanges draw one scarce far-region residue and each maximal commuting draw becomes its own branch",
            program: scarcityBranches,
            options: { worldWillEnabled: false },
        },
        {
            name: "branch-set-order",
            description: "a co-realized law id makes BIR set order of realizedLawIds differ from canonical string order",
            program: renamedBranching,
            options: {},
        },
        {
            name: "nested-branch-lineage",
            description: "a branch inside a branch gives every continuation a two-step lineage whose second step has a parent",
            program: nestedBranching,
            options: {},
        },
        {
            name: "chained-lineage",
            description: "a spawned world spawns a grandchild whose lineage record names a non-initial parent lineage",
            program: chainedLineage,
            options: { worldWillEnabled: false },
        },
    ];
}
