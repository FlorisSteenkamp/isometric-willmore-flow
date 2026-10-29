import { edgeLengths } from './edge-lengths.js';
import { isometricWillmoreStep } from './isometric-willmore-step.js';


/**
 * Returns the frames (starting with the given polygon itself) of flowing the
 * given closed polygon by isometric Willmore flow, one step per given time
 * step.
 *
 * * the edge lengths of the given polygon are the ones preserved
 *
 * @param ps the closed polygon's vertices
 * @param τs the time step of each step, each `0 < τ < 1` (see `getTimeSteps`)
 */
function fairLoop(
        ps: number[][],
        τs: number[]): number[][][] {

    const ℓs = edgeLengths(ps);

    const frames = [ps];
    for (const τ of τs) {
        ps = isometricWillmoreStep(ps, ℓs, τ);
        frames.push(ps);
    }

    return frames;
}


export { fairLoop }
