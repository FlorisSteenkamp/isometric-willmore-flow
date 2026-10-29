
/**
 * Returns the edge lengths of the given closed polygon where edge `i` runs
 * from vertex `i` to vertex `i+1` (and the last edge closes the polygon).
 */
function edgeLengths(ps: number[][]): number[] {
    const n = ps.length;

    return ps.map((p, i) => {
        const q = ps[(i + 1)%n];
        return Math.hypot(q[0] - p[0], q[1] - p[1]);
    });
}


export { edgeLengths }
