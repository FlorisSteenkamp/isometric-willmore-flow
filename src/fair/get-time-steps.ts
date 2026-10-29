
/**
 * Returns the time step to use for each of the given number of steps - all
 * the same.
 *
 * Each step multiplies the unconstrained part of the curvature by `1 - 2τ`, so
 * it decays geometrically (see `remainingCurvature`).
 *
 * @param τ the (constant) time step
 * @param steps the number of steps
 */
function getTimeSteps(
        τ: number,
        steps: number): number[] {

    return new Array(steps).fill(τ);
}


export { getTimeSteps }
