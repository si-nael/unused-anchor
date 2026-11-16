// Deterministic host-cost meter for the reference oracle.
//
// It measures external realization work, never Bubble time: counts of operations the host performed while
// deriving a world. It records no wall-clock time, so the same program and options always produce the same
// profile. A backend may optimize these costs freely; conformance compares semantic outcomes, not costs.
// When no meter is active, every hook is a single property check.

export interface HostCostProfile {
    /** Exact rational constructions, including arithmetic results and parsed operands. */
    exactRationalConstructions: number;
    /** Largest bit length of any rational numerator or denominator constructed (operand growth). */
    maxRationalBits: number;
    /** Intensional coordinate queries evaluated. */
    intensionalQueries: number;
    /** Intensional coordinates materialized across all queries (proof steps). */
    materializedIntensionalCoordinates: number;
    /**
     * State predicates evaluated: law guards, hard constraints, anchor identity, and emergence criteria. Field
     * initializers are plain intensional queries and are counted only under `intensionalQueries`.
     */
    predicateEvaluations: number;
    /** Internal-law occurrences applied to a realization. */
    lawApplications: number;
    /** Maximal commuting frontiers enumerated as internal branch candidates. */
    branchFrontierCandidates: number;
    /** Whole-realization copies (no structural sharing exists yet, so every copy allocates). */
    realizationCopies: number;
    /** Deep value copies. */
    valueCopies: number;
    /** Host digests computed and the bytes they hashed, including the BIR envelope integrity check. */
    digestsComputed: number;
    bytesHashed: number;
    /** BIR nodes decoded and BIR bytes read. */
    birNodesDecoded: number;
    birBytesRead: number;
}

export type HostCostCounter = Exclude<keyof HostCostProfile, "maxRationalBits">;

function emptyProfile(): HostCostProfile {
    return {
        exactRationalConstructions: 0,
        maxRationalBits: 0,
        intensionalQueries: 0,
        materializedIntensionalCoordinates: 0,
        predicateEvaluations: 0,
        lawApplications: 0,
        branchFrontierCandidates: 0,
        realizationCopies: 0,
        valueCopies: 0,
        digestsComputed: 0,
        bytesHashed: 0,
        birNodesDecoded: 0,
        birBytesRead: 0,
    };
}

let active: HostCostProfile | undefined;

export function countHostCost(counter: HostCostCounter, amount = 1): void {
    if (active) active[counter] += amount;
}

function bitLength(value: bigint): number {
    const magnitude = value < 0n ? -value : value;
    return magnitude === 0n ? 0 : magnitude.toString(2).length;
}

export function noteRationalConstruction(numerator: bigint, denominator: bigint): void {
    if (!active) return;
    active.exactRationalConstructions += 1;
    const bits = Math.max(bitLength(numerator), bitLength(denominator));
    if (bits > active.maxRationalBits) active.maxRationalBits = bits;
}

/** Runs `work` with a fresh meter. Meters do not nest: an inner call measures only its own work. */
export function meterHostCost<T>(work: () => T): { result: T; cost: HostCostProfile } {
    const previous = active;
    const profile = emptyProfile();
    active = profile;
    try {
        return { result: work(), cost: profile };
    } finally {
        active = previous;
    }
}
