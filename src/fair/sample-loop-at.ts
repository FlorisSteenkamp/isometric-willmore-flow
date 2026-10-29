import { evalDeCasteljau, getTAtLength, length } from 'flo-bezier3';


/**
 * Returns the points at the given arc lengths along the given closed loop of
 * bezier curves.
 *
 * @param beziers a closed loop of order 1, 2 or 3 bezier curves
 * @param ss the arc lengths (measured from the loop's start, taken modulo its
 * total length)
 */
function sampleLoopAt(
        beziers: number[][][],
        ss: number[]): number[][] {

    // cumulative lengths at the start of each bezier
    const cums = [0];
    for (const ps of beziers) {
        cums.push(cums[cums.length - 1] + length([0,1], ps));
    }
    const total = cums[cums.length - 1];

    return ss.map(s => {
        s = ((s % total) + total) % total;

        // the last bezier starting at or before `s` (binary search)
        let lo = 0;
        let hi = beziers.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (cums[mid] <= s) { lo = mid; } else { hi = mid - 1; }
        }

        const t = getTAtLength(beziers[lo], s - cums[lo]);
        return evalDeCasteljau(beziers[lo], Math.min(t, 1));
    });
}


export { sampleLoopAt }
