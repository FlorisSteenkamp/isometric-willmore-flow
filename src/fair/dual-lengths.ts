
/**
 * Returns the dual (barycentric) length `L_i = (ℓ_{i-1,i} + ℓ_{i,i+1})/2` at
 * each vertex of a closed polygon given its edge lengths.
 *
 * @param ℓs edge lengths where edge `i` runs from vertex `i` to vertex `i+1`
 */
function dualLengths(ℓs: number[]): number[] {
    const n = ℓs.length;

    return ℓs.map((ℓ, i) => (ℓs[(i - 1 + n)%n] + ℓ)/2);
}


export { dualLengths }
