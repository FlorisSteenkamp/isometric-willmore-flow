import { describe, it, expect } from '@jest/globals';
import { fairLoop } from '../../src/fair/fair-loop.js';
import { morphFrame } from '../../src/fair/morph-frame.js';
import { getTimeSteps } from '../../src/fair/get-time-steps.js';


const { PI, cos, sin, abs, max } = Math;


/** A wobbly, asymmetric (but simple) closed curve */
function star(n: number): number[][] {
    const ps: number[][] = [];
    for (let i=0; i<n; i++) {
        const θ = 2*PI*i/n;
        const r = 1 + 0.3*cos(3*θ) + 0.25*sin(2*θ + 1) + 0.1*cos(7*θ);
        ps.push([r*cos(θ), r*sin(θ)]);
    }
    return ps;
}


/** The largest distance between corresponding vertices */
function maxDist(ps: number[][], qs: number[][]) {
    return max(...ps.map((p, i) => abs(p[0] - qs[i][0]) + abs(p[1] - qs[i][1])));
}


describe('morphFrame', function() {
    const τs = getTimeSteps(0.3, 5);
    const frames = fairLoop(star(200), τs);

    it('should return the keyframes at whole steps (and clamp)', function() {
        for (let j=0; j<=τs.length; j++) {
            expect(morphFrame(frames, τs, j)).toBe(frames[j]);
        }
        expect(morphFrame(frames, τs, -1)).toBe(frames[0]);
        expect(morphFrame(frames, τs, 9)).toBe(frames[5]);
    });

    it('should be continuous, also across keyframes', function() {
        for (let j=1; j<τs.length; j++) {
            expect(maxDist(morphFrame(frames, τs, j - 1e-6), frames[j])).toBeLessThan(1e-4);
            expect(maxDist(morphFrame(frames, τs, j + 1e-6), frames[j])).toBeLessThan(1e-4);
        }
    });

    it('should depend only on t', function() {
        const a = morphFrame(frames, τs, 2.251);
        const b = morphFrame(frames, τs, 2.251);
        expect(a).toEqual(b);
    });
});
