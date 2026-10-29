import { fairShape } from '../fair/fair-shape.js';
import { getTimeSteps } from '../fair/get-time-steps.js';
import { edgeLengths } from '../fair/edge-lengths.js';
import { willmoreEnergy } from '../fair/willmore-energy.js';
import { morphFrame } from '../fair/morph-frame.js';
import { remainingCurvature } from '../fair/remaining-curvature.js';
import type { View } from './view.js';


const { abs, max } = Math;


/** The keyframes of a flowed shape - the result of `computeFair` */
interface Fair {
    readonly τs: number[];
    /** per loop, its keyframes (see `fairShape`) */
    readonly framess: number[][][][];
    readonly ms: number;
}


/** Flows the given shape and returns its keyframes */
function computeFair(
        loops: number[][][][],
        vertexCount: number,
        τ: number,
        steps: number): Fair {

    const timeStart = performance.now();
    const τs = getTimeSteps(τ, steps);
    const framess = fairShape(loops, vertexCount, τs);
    const ms = performance.now() - timeStart;

    return { τs, framess, ms };
}


/**
 * Returns what to draw at the given point of the morph (see `morphFrame`)
 *
 * @param fair the keyframes
 * @param morph the point of the morph, from `0` (the initial shape) to `1`
 * (the last keyframe)
 */
function getView(fair: Fair, morph: number): View {
    const { τs, framess } = fair;

    const timeStart = performance.now();
    const t = morph*τs.length;
    const initial = framess.map(frames => frames[0]);
    const current = framess.map(frames => morphFrame(frames, τs, t));
    const ms = fair.ms + performance.now() - timeStart;

    let maxLengthChange = 0;
    for (let i=0; i<initial.length; i++) {
        const ℓs = edgeLengths(initial[i]);
        const ℓs_ = edgeLengths(current[i]);
        for (let j=0; j<ℓs.length; j++) {
            maxLengthChange = max(maxLengthChange, abs(ℓs_[j] - ℓs[j])/ℓs[j]);
        }
    }

    return {
        current: current.map(toPathStr).join(''),
        vertices: current.flat(),
        ms,
        stats: [
            ['vertices', String(sumOf(initial, ps => ps.length))],
            ['energy',
                `${sumOf(initial, willmoreEnergy).toPrecision(4)} → ` +
                `${sumOf(current, willmoreEnergy).toPrecision(4)}`],
            ['curvature left', `${(100*remainingCurvature(τs, t)).toPrecision(2)}%`],
            ['max edge length change', `${(100*maxLengthChange).toPrecision(2)}%`]
        ]
    };
}


/** Returns an SVG path string of the given closed polygon */
function toPathStr(ps: number[][]): string {
    return 'M' + ps.map(p => `${p[0]} ${p[1]}`).join('L') + 'Z';
}


function sumOf(pss: number[][][], f: (ps: number[][]) => number) {
    return pss.reduce((s, ps) => s + f(ps), 0);
}


export { computeFair, getView }
