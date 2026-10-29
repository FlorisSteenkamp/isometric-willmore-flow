import { describe, it, expect } from '@jest/globals';
import { fairLoop } from '../../src/fair/fair-loop.js';
import { edgeLengths } from '../../src/fair/edge-lengths.js';
import { willmoreEnergy } from '../../src/fair/willmore-energy.js';
import { turningAngle } from '../../src/fair/turning-angle.js';
import { resampleLoop } from '../../src/fair/resample-loop.js';
import { getTimeSteps } from '../../src/fair/get-time-steps.js';


const { PI, cos, sin, abs, max } = Math;


function circle(n: number, r = 1): number[][] {
    const ps: number[][] = [];
    for (let i=0; i<n; i++) {
        const θ = 2*PI*i/n;
        ps.push([r*cos(θ), r*sin(θ)]);
    }
    return ps;
}


/**
 * A wobbly, asymmetric (but simple) closed curve
 *
 * * not symmetric, else the tangents close up exactly by symmetry and there
 * is no length distortion to measure
 */
function star(n: number): number[][] {
    const ps: number[][] = [];
    for (let i=0; i<n; i++) {
        const θ = 2*PI*i/n;
        const r = 1 + 0.3*cos(3*θ) + 0.25*sin(2*θ + 1) + 0.1*cos(7*θ);
        ps.push([r*cos(θ), r*sin(θ)]);
    }
    return ps;
}


function totalTurning(ps: number[][]) {
    const n = ps.length;
    let s = 0;
    for (let i=0; i<n; i++) {
        s += turningAngle(ps[(i - 1 + n)%n], ps[i], ps[(i + 1)%n]);
    }
    return s;
}


function maxRelLengthChange(ps: number[][], qs: number[][]) {
    const ℓs = edgeLengths(ps);
    const ℓs_ = edgeLengths(qs);
    return max(...ℓs.map((ℓ, i) => abs(ℓs_[i] - ℓ)/ℓ));
}


describe('fairLoop', function() {
    it('should leave a circle (the global minimum) unchanged', function() {
        const ps = circle(64);
        const frames = fairLoop(ps, getTimeSteps(0.5, 3));
        const qs = frames[3];
        for (let i=0; i<ps.length; i++) {
            expect(qs[i][0]).toBeCloseTo(ps[i][0], 10);
            expect(qs[i][1]).toBeCloseTo(ps[i][1], 10);
        }
    });

    it('should decrease the energy monotonically and flow to a circle', function() {
        const ps = star(200);
        const frames = fairLoop(ps, getTimeSteps(0.2, 20));
        const Es = frames.map(willmoreEnergy);
        for (let i=1; i<Es.length; i++) {
            expect(Es[i]).toBeLessThanOrEqual(Es[i-1] + 1e-12);
        }

        // a circle of the same length has energy (2π)²/L
        const L = edgeLengths(ps).reduce((a, b) => a + b);
        expect(Es[Es.length - 1]/((2*PI)**2/L)).toBeCloseTo(1, 3);
    });

    it('should (nearly) preserve edge lengths and the turning number', function() {
        const ps = star(200);
        const frames = fairLoop(ps, getTimeSteps(0.2, 20));
        const qs = frames[frames.length - 1];

        expect(maxRelLengthChange(ps, qs)).toBeLessThan(0.01);
        expect(totalTurning(qs)).toBeCloseTo(totalTurning(ps), 8);
    });

    it('should converge quadratically in the time step (Figure 11)', function() {
        const ps = star(200);
        const e1 = maxRelLengthChange(ps, fairLoop(ps, getTimeSteps(0.02, 1))[1]);
        const e2 = maxRelLengthChange(ps, fairLoop(ps, getTimeSteps(0.01, 1))[1]);
        expect(e1/e2).toBeGreaterThan(3);
        expect(e1/e2).toBeLessThan(5);
    });

    it('should be unstable for τ > 1', function() {
        const ps = star(100);
        const frames = fairLoop(ps, getTimeSteps(1.2, 10));
        const Es = frames.map(willmoreEnergy);
        expect(Es[Es.length - 1]).toBeGreaterThan(Es[0]);
    });
});


describe('resampleLoop', function() {
    it('should space vertices evenly by arc length', function() {
        const square = [
            [[0,0],[2,0]],
            [[2,0],[2,1],[2,2]],             // quadratic
            [[2,2],[1.5,2],[0.5,2],[0,2]],   // cubic
            [[0,2],[0,0]]
        ];
        const ps = resampleLoop(square, 16);
        expect(ps.length).toBe(16);
        for (const ℓ of edgeLengths(ps)) {
            expect(ℓ).toBeCloseTo(0.5, 10);
        }
    });
});
