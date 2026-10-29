import { alignRigidly } from './align-rigidly.js';
import { dualLengths } from './dual-lengths.js';
import { gramSchmidt } from './gram-schmidt.js';
import { recoverPositions } from './recover-positions.js';
import { turningAngle } from './turning-angle.js';


const { cos, sin, atan2 } = Math;


/**
 * Takes a single forward Euler step of the isometric Willmore flow of a closed
 * polygon, as in Section 5 and Table 1 (left) of "Robust Fairing via Conformal
 * Curvature Flow" (Crane, Pinkall & Schröder, 2013).
 *
 * The flow `κ̇ = -2κ` is done in *curvature* space (not position space) and
 * edge lengths are preserved by construction, so a closed curve flows to a
 * circle (of the same length and turning number) - typically in only a few
 * steps.
 *
 * @param ps the current polygon vertices `f_i`; edge `i` runs from vertex `i`
 * to vertex `i+1` and the last edge closes the polygon
 * @param ℓs the edge lengths to preserve (typically those of the initial
 * polygon - passing them in rather than measuring `ps` prevents drift)
 * @param τ the time step; the flow is stable for `0 < τ < 1` (and `τ = 0.5`
 * removes all unconstrained curvature in one step)
 */
function isometricWillmoreStep(
        ps: number[][],
        ℓs: number[],
        τ: number): number[][] {

    const n = ps.length;

    /** dual lengths - the diagonal of the mass matrix `B` */
    const Ls = dualLengths(ℓs);

    /** the `B`-weighted (i.e. discrete L²) inner product on vertex functions */
    function dot(u: number[], v: number[]) {
        let s = 0;
        for (let i=0; i<n; i++) { s += Ls[i]*u[i]*v[i]; }
        return s;
    }

    // I. Evaluate (pointwise) curvature `κ_i = φ_i/L_i`
    const κs = ps.map((p, i) =>
        turningAngle(ps[(i - 1 + n)%n], p, ps[(i + 1)%n])/Ls[i]
    );

    // II. Pick the flow direction `κ̇ = -∇E(κ) = -2κ`
    const κ̇s = κs.map(κ => -2*κ);

    // III. Build an orthonormal basis for the constraints `{1, f_x, f_y}`
    // (total curvature and closure) using Gram-Schmidt
    const cs = gramSchmidt([
        ps.map(() => 1),
        ps.map(p => p[0]),
        ps.map(p => p[1])
    ], dot);

    // IV. Project the flow onto the constraints, `κ̇ ← κ̇ - Σ<κ̇,ĉ_i>ĉ_i`
    for (const c of cs) {
        const a = dot(κ̇s, c);
        for (let i=0; i<n; i++) { κ̇s[i] -= a*c[i]; }
    }

    // V. Take an explicit Euler step `κ ← κ + τκ̇`
    const κs_ = κs.map((κ, i) => κ + τ*κ̇s[i]);

    // VI. Recover tangents by integrating curvature, starting from the
    // direction of the last (closing) edge; tangents get the *primal* edge
    // lengths so that the flow is isometric
    const pL = ps[n-1];
    const p0 = ps[0];
    let θ = atan2(p0[1] - pL[1], p0[0] - pL[0]);
    const Ts: number[][] = [];
    for (let i=0; i<n; i++) {
        θ += Ls[i]*κs_[i];
        Ts.push([ℓs[i]*cos(θ), ℓs[i]*sin(θ)]);
    }

    // VII. Recover positions (closing the curve) and remove the mean change
    // in position and angle
    return alignRigidly(recoverPositions(Ts, ℓs), ps, Ls);
}


export { isometricWillmoreStep }
