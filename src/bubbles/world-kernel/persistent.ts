import {
    validateExecutableCausalProgram,
    type ExecutableAnchoredCausalProgram,
} from "./causal-runtime";
import type { CausalDiagnostic, CausalFieldRole } from "./causal";

export interface PersistentCausalProgram {
    mode: "bubble-persistent-causal-program.v1";
    causalProgram: ExecutableAnchoredCausalProgram;
}

export interface CausalInfluenceEndpoint {
    worldId: string;
    fieldId: string;
}

export interface CausalInfluenceEdge {
    lawId: string;
    from: CausalInfluenceEndpoint;
    to: CausalInfluenceEndpoint;
}

export interface CausalLawDependency {
    lawId: string;
    worldId: string;
    guardFieldKeys: string[];
    effectFieldKeys: string[];
}

export interface DerivedCausalComponent {
    id: string;
    worldIds: string[];
    memberFieldKeys: string[];
    memberLawIds: string[];
    fieldRoles: Array<{ worldId: string; fieldId: string; role: CausalFieldRole }>;
    recurrent: boolean;
    incomingEdges: CausalInfluenceEdge[];
    outgoingEdges: CausalInfluenceEdge[];
    incomingDependencies: CausalLawDependency[];
    outgoingDependencies: CausalLawDependency[];
}

function issue(code: string, path: string, message: string): CausalDiagnostic {
    return { code, severity: "error", path, message };
}

function fieldKey(endpoint: CausalInfluenceEndpoint): string {
    return `${endpoint.worldId}.${endpoint.fieldId}`;
}

function edgeKey(edge: CausalInfluenceEdge): string {
    return `${fieldKey(edge.from)}>${fieldKey(edge.to)}@${edge.lawId}`;
}

function dependencyKey(dependency: CausalLawDependency): string {
    return `${dependency.lawId}:${dependency.guardFieldKeys.join("+")}>${dependency.effectFieldKeys.join("+")}`;
}

export function validatePersistentCausalProgram(program: PersistentCausalProgram): CausalDiagnostic[] {
    const diagnostics: CausalDiagnostic[] = [];
    if (program.mode !== "bubble-persistent-causal-program.v1") {
        diagnostics.push(issue("PKW001", "mode", "unsupported persistent causal program mode"));
    }
    if (!program.causalProgram || typeof program.causalProgram !== "object") {
        diagnostics.push(issue("PKW002", "causalProgram", "persistent execution needs an anchored causal program"));
        return diagnostics;
    }
    return [...diagnostics, ...validateExecutableCausalProgram(program.causalProgram)];
}

export function deriveCausalInfluenceEdges(program: PersistentCausalProgram): CausalInfluenceEdge[] {
    const edges = new Map<string, CausalInfluenceEdge>();
    for (const law of program.causalProgram.world.internalLaws) {
        for (const binding of law.guard.fieldParameters) {
            for (const effect of law.effects) {
                const edge: CausalInfluenceEdge = {
                    lawId: law.id,
                    from: { worldId: binding.worldId, fieldId: binding.fieldId },
                    to: { worldId: law.worldId, fieldId: effect.fieldId },
                };
                edges.set(edgeKey(edge), edge);
            }
        }
    }
    return [...edges.values()].sort((left, right) => edgeKey(left).localeCompare(edgeKey(right)));
}

export function deriveCausalLawDependencies(program: PersistentCausalProgram): CausalLawDependency[] {
    return program.causalProgram.world.internalLaws.map((law) => ({
        lawId: law.id,
        worldId: law.worldId,
        guardFieldKeys: [...new Set(law.guard.fieldParameters.map((binding) => (
            `${binding.worldId}.${binding.fieldId}`
        )))].sort(),
        effectFieldKeys: [...new Set(law.effects.map((effect) => `${law.worldId}.${effect.fieldId}`))].sort(),
    })).sort((left, right) => dependencyKey(left).localeCompare(dependencyKey(right)));
}

export function deriveCausalComponents(program: PersistentCausalProgram): DerivedCausalComponent[] {
    const roles = new Map<string, { worldId: string; fieldId: string; role: CausalFieldRole }>();
    for (const world of program.causalProgram.world.worlds) {
        for (const field of world.fields) {
            roles.set(`${world.id}.${field.id}`, { worldId: world.id, fieldId: field.id, role: field.role });
        }
    }
    const edges = deriveCausalInfluenceEdges(program);
    const dependencies = deriveCausalLawDependencies(program);
    const adjacency = new Map<string, string[]>();
    const fieldNode = (key: string): string => `field:${key}`;
    const lawNode = (lawId: string): string => `law:${lawId}`;
    for (const key of roles.keys()) adjacency.set(fieldNode(key), []);
    for (const dependency of dependencies) {
        const law = lawNode(dependency.lawId);
        adjacency.set(law, adjacency.get(law) ?? []);
        for (const guard of dependency.guardFieldKeys) {
            const from = fieldNode(guard);
            adjacency.set(from, [...new Set([...(adjacency.get(from) ?? []), law])].sort());
        }
        for (const effect of dependency.effectFieldKeys) {
            adjacency.set(law, [...new Set([...(adjacency.get(law) ?? []), fieldNode(effect)])].sort());
        }
    }

    let nextIndex = 0;
    const indices = new Map<string, number>();
    const lowLinks = new Map<string, number>();
    const stack: string[] = [];
    const onStack = new Set<string>();
    const components: string[][] = [];

    const visit = (node: string): void => {
        indices.set(node, nextIndex);
        lowLinks.set(node, nextIndex);
        nextIndex += 1;
        stack.push(node);
        onStack.add(node);
        for (const successor of adjacency.get(node) ?? []) {
            if (!indices.has(successor)) {
                visit(successor);
                lowLinks.set(node, Math.min(lowLinks.get(node)!, lowLinks.get(successor)!));
            } else if (onStack.has(successor)) {
                lowLinks.set(node, Math.min(lowLinks.get(node)!, indices.get(successor)!));
            }
        }
        if (lowLinks.get(node) !== indices.get(node)) return;
        const component: string[] = [];
        while (stack.length > 0) {
            const member = stack.pop()!;
            onStack.delete(member);
            component.push(member);
            if (member === node) break;
        }
        components.push(component.sort());
    };

    for (const node of [...adjacency.keys()].sort()) {
        if (!indices.has(node)) visit(node);
    }

    return components.map((nodes) => {
        const members = nodes.filter((node) => node.startsWith("field:")).map((node) => node.slice("field:".length)).sort();
        const memberLawIds = nodes.filter((node) => node.startsWith("law:")).map((node) => node.slice("law:".length)).sort();
        const memberSet = new Set(members);
        const worldIds = [...new Set(members.map((member) => roles.get(member)!.worldId))].sort();
        const recurrent = nodes.length > 1 || nodes.some((node) => adjacency.get(node)?.includes(node));
        const incomingDependencies = dependencies.filter((dependency) => (
            dependency.guardFieldKeys.some((key) => !memberSet.has(key))
            && dependency.effectFieldKeys.some((key) => memberSet.has(key))
        ));
        const outgoingDependencies = dependencies.filter((dependency) => (
            dependency.guardFieldKeys.some((key) => memberSet.has(key))
            && dependency.effectFieldKeys.some((key) => !memberSet.has(key))
        ));
        return {
            id: `component:${members.join("+")}`,
            worldIds,
            memberFieldKeys: members,
            memberLawIds,
            fieldRoles: members.map((member) => roles.get(member)!),
            recurrent,
            incomingEdges: edges.filter((edge) => !memberSet.has(fieldKey(edge.from)) && memberSet.has(fieldKey(edge.to))),
            outgoingEdges: edges.filter((edge) => memberSet.has(fieldKey(edge.from)) && !memberSet.has(fieldKey(edge.to))),
            incomingDependencies,
            outgoingDependencies,
        };
    }).filter((component) => component.memberFieldKeys.length > 0)
        .sort((left, right) => left.id.localeCompare(right.id));
}
