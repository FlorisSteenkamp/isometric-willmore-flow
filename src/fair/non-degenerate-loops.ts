import { length } from 'flo-bezier3';


/** loops shorter than this fraction of the shape's total length are dropped */
const MIN_RELATIVE_LOOP_LENGTH = 1e-9;


/**
 * Returns the given shape's loops (and their lengths) without the degenerate
 * (e.g. `M 1 2 L 1 2 Z`) ones, which can't be resampled.
 *
 * @param loops the shape as closed loops of bezier curves
 */
function nonDegenerateLoops(loops: number[][][][]) {
    const lengths = loops.map(beziers => {
        let l = 0;
        for (const ps of beziers) { l += length([0,1], ps); }
        return l;
    });
    let total = 0;
    for (const l of lengths) { total += l; }

    const keep = lengths.map(l => l > MIN_RELATIVE_LOOP_LENGTH*total);

    return {
        loops: loops.filter((_, i) => keep[i]),
        lengths: lengths.filter((_, i) => keep[i]),
        total
    };
}


export { nonDegenerateLoops }
