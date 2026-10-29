import { length } from 'flo-bezier3';
import { sampleLoopAt } from './sample-loop-at.js';


/**
 * Returns a closed polygon with `n` vertices spaced evenly (by arc length)
 * along the given closed loop of bezier curves.
 *
 * @param beziers a closed loop of order 1, 2 or 3 bezier curves
 * @param n the number of vertices
 */
function resampleLoop(
        beziers: number[][][],
        n: number): number[][] {

    let total = 0;
    for (const ps of beziers) { total += length([0,1], ps); }

    return sampleLoopAt(beziers, Array.from({ length: n }, (_, k) => k*total/n));
}


export { resampleLoop }
