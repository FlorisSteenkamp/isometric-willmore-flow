import { fairLoop } from './fair-loop.js';
import { nonDegenerateLoops } from './non-degenerate-loops.js';
import { resampleLoop } from './resample-loop.js';


const MIN_VERTICES_PER_LOOP = 8;


/**
 * Resamples each loop of the given shape to a polygon and flows each by
 * isometric Willmore flow independently.
 *
 * Returns, per loop, the frames of the flow (starting with the resampled
 * polygon); degenerate (zero length) loops are dropped.
 *
 * @param loops the shape as closed loops of bezier curves
 * @param vertexCount the total number of polygon vertices, shared among the
 * loops in proportion to their lengths
 * @param τs the time step of each step, each `0 < τ < 1` (see `getTimeSteps`)
 */
function fairShape(
        loops: number[][][][],
        vertexCount: number,
        τs: number[]): number[][][][] {

    const { lengths, total, loops: loops_ } = nonDegenerateLoops(loops);

    return loops_.map((beziers, i) => {
        const n = Math.max(
            MIN_VERTICES_PER_LOOP,
            Math.round(vertexCount*lengths[i]/total)
        );
        return fairLoop(resampleLoop(beziers, n), τs);
    });
}


export { fairShape }
