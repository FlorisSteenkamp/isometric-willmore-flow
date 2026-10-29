
/**
 * Orthonormalizes the given vectors under the given inner product, dropping
 * any that are (numerically) linearly dependent on the previous ones.
 */
function gramSchmidt(
        vs: number[][],
        dot: (u: number[], v: number[]) => number): number[][] {

    const es: number[][] = [];
    for (const v of vs) {
        const u = v.slice();
        for (const e of es) {
            const a = dot(u, e);
            for (let i=0; i<u.length; i++) { u[i] -= a*e[i]; }
        }

        const norm = Math.sqrt(dot(u, u));
        if (norm <= 1e-12*Math.sqrt(dot(v, v))) { continue; }

        es.push(u.map(x => x/norm));
    }

    return es;
}


export { gramSchmidt }
