// Portable canonical string order for every Bubble kernel.
//
// Bubble evidence and identity must not depend on a host locale or collation library. Strings are ordered
// lexicographically by Unicode scalar value (code point), which is identical to bytewise order of their
// UTF-8 encodings. This is the order a portable BIR backend reproduces; it is not ICU collation
// (`localeCompare`) and not UTF-16 code-unit order, which differs for supplementary-plane characters.

export function compareCanonicalStrings(left: string, right: string): -1 | 0 | 1 {
    if (left === right) return 0;
    const leftPoints = left[Symbol.iterator]();
    const rightPoints = right[Symbol.iterator]();
    for (;;) {
        const leftNext = leftPoints.next();
        const rightNext = rightPoints.next();
        if (leftNext.done) return rightNext.done ? 0 : -1;
        if (rightNext.done) return 1;
        const leftCode = leftNext.value.codePointAt(0)!;
        const rightCode = rightNext.value.codePointAt(0)!;
        if (leftCode !== rightCode) return leftCode < rightCode ? -1 : 1;
    }
}

/** Returns a new array of strings in portable canonical order. */
export function sortCanonicalStrings(values: Iterable<string>): string[] {
    return [...values].sort(compareCanonicalStrings);
}
