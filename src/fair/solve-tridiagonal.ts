
/**
 * Solves the tridiagonal system `Ax = d` using the Thomas algorithm.
 *
 * * stable for diagonally dominant or symmetric positive definite `A`
 *
 * @param a sub-diagonal (`a[0]` is ignored)
 * @param b diagonal
 * @param c super-diagonal (`c[n-1]` is ignored)
 * @param d right-hand side
 */
function solveTridiagonal(
        a: number[],
        b: number[],
        c: number[],
        d: number[]): number[] {

    const n = b.length;
    const c_: number[] = new Array(n);
    const d_: number[] = new Array(n);

    c_[0] = c[0]/b[0];
    d_[0] = d[0]/b[0];
    for (let i=1; i<n; i++) {
        const m = b[i] - a[i]*c_[i-1];
        c_[i] = c[i]/m;
        d_[i] = (d[i] - a[i]*d_[i-1])/m;
    }

    const x: number[] = new Array(n);
    x[n-1] = d_[n-1];
    for (let i=n-2; i>=0; i--) {
        x[i] = d_[i] - c_[i]*x[i+1];
    }

    return x;
}


export { solveTridiagonal }
