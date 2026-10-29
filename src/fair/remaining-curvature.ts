
/**
 * Returns the fraction of the initial unconstrained curvature that is left
 * after the given fractional step `t` (see `morphFrame`) of the flow with the
 * given time steps.
 *
 * Each step multiplies the unconstrained part of the curvature by `1 - 2τ`
 * (see `isometricWillmoreStep`), whatever its frequency, so this doesn't
 * depend on the shape.
 *
 * * it is exact for the linearized flow only - the constraints change as the
 * curve moves
 *
 * @param τs the time steps
 * @param t the fractional step, clamped to `[0, τs.length]`
 */
function remainingCurvature(
        τs: number[],
        t: number): number {

    const t_ = Math.min(Math.max(t, 0), τs.length);
    const j = Math.floor(t_);
    const s = t_ - j;

    let r = 1;
    for (let i=0; i<j; i++) { r *= Math.abs(1 - 2*τs[i]); }
    if (s > 0) { r *= Math.abs(1 - 2*s*τs[j]); }

    return r;
}


/**
 * Returns the number of steps of the given (constant) time step after which
 * at most the given fraction of the unconstrained curvature is left, i.e. the
 * shape is round up to that fraction (see `remainingCurvature`).
 *
 * @param τ the time step, `0 < τ < 1/2`
 * @param ε the fraction of the curvature allowed to be left, `0 < ε < 1`
 */
function stepsToRound(τ: number, ε: number): number {
    return Math.ceil(Math.log(ε)/Math.log(1 - 2*τ));
}


export { remainingCurvature, stepsToRound }
