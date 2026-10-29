import { dualLengths } from './dual-lengths.js';
import { edgeLengths } from './edge-lengths.js';
import { turningAngle } from './turning-angle.js';


/**
 * Returns the discrete Willmore (bending) energy `E = Σ L_i κ_i² = Σ φ_i²/L_i`
 * of the given closed polygon.
 *
 * * a circle with `n` vertices and length `ℓ` has `E = (2π)²/ℓ` (the minimum
 * among curves of that length with turning number ±1)
 */
function willmoreEnergy(ps: number[][]): number {
    const n = ps.length;
    const Ls = dualLengths(edgeLengths(ps));

    let E = 0;
    for (let i=0; i<n; i++) {
        const φ = turningAngle(ps[(i - 1 + n)%n], ps[i], ps[(i + 1)%n]);
        E += φ*φ/Ls[i];
    }

    return E;
}


export { willmoreEnergy }
