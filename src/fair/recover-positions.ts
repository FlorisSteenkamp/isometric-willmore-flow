import { solveTridiagonal } from './solve-tridiagonal.js';


/**
 * Returns the closed polygon whose edges best agree with the given (generally
 * not exactly closing) edge vectors (Section 5.2 of the paper).
 *
 * Solves the discrete Poisson problem `Lf = b` with
 * `L_ij = -1/ℓ_ij`, `L_ii = 1/ℓ_{i-1,i} + 1/ℓ_{i,i+1}` and
 * `b_i = T_{i-1,i}/ℓ_{i-1,i} - T_{i,i+1}/ℓ_{i,i+1}`, i.e. it minimizes
 * `Σ |f_{i+1} - f_i - T_{i,i+1}|²/ℓ_{i,i+1}` so that the closure error is
 * distributed over all edges.
 *
 * * `L` is singular (constants are in its kernel) so `f_0` is pinned to the
 * origin - the result is only determined up to a translation anyway
 * * with `f_0` pinned the cyclic system becomes an ordinary tridiagonal one
 *
 * @param Ts the edge vectors where edge `i` runs from vertex `i` to vertex `i+1`
 * @param ℓs the edge lengths used as weights
 */
function recoverPositions(
        Ts: number[][],
        ℓs: number[]): number[][] {

    const n = Ts.length;
    const m = n - 1;  // unknowns f_1, ..., f_{n-1}

    const a: number[] = [];
    const b: number[] = [];
    const c: number[] = [];
    const dx: number[] = [];
    const dy: number[] = [];
    for (let i=1; i<n; i++) {
        const ℓPrev = ℓs[i-1];
        const ℓNext = ℓs[i];
        a.push(-1/ℓPrev);
        b.push(1/ℓPrev + 1/ℓNext);
        c.push(-1/ℓNext);
        dx.push(Ts[i-1][0]/ℓPrev - Ts[i][0]/ℓNext);
        dy.push(Ts[i-1][1]/ℓPrev - Ts[i][1]/ℓNext);
    }

    const xs = solveTridiagonal(a, b, c, dx);
    const ys = solveTridiagonal(a, b, c, dy);

    const ps: number[][] = [[0,0]];
    for (let i=0; i<m; i++) {
        ps.push([xs[i], ys[i]]);
    }

    return ps;
}


export { recoverPositions }
