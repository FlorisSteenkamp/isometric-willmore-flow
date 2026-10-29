import { describe, it, expect } from '@jest/globals';
import { remainingCurvature, stepsToRound } from '../../src/fair/remaining-curvature.js';
import { fairLoop } from '../../src/fair/fair-loop.js';
import { edgeLengths } from '../../src/fair/edge-lengths.js';
import { willmoreEnergy } from '../../src/fair/willmore-energy.js';
import { getTimeSteps } from '../../src/fair/get-time-steps.js';


const { PI, cos, sin } = Math;


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


describe('remainingCurvature', function() {
    it('should multiply by 1 - 2τ per (partial) step', function() {
        const τs = getTimeSteps(0.05, 10);
        expect(remainingCurvature(τs, 0)).toBe(1);
        expect(remainingCurvature(τs, 10)).toBeCloseTo(0.9**10, 12);
        expect(remainingCurvature(τs, 2.5)).toBeCloseTo(0.9**2*0.95, 12);
        expect(remainingCurvature(τs, 99)).toBeCloseTo(0.9**10, 12);
    });
});


describe('stepsToRound', function() {
    it('should give the fewest steps leaving at most ε', function() {
        expect(stepsToRound(0.05, 0.01)).toBe(44);
        expect(stepsToRound(0.1, 0.01)).toBe(21);
        for (const τ of [0.005, 0.03, 0.1]) {
            const N = stepsToRound(τ, 0.01);
            expect((1 - 2*τ)**N).toBeLessThanOrEqual(0.01);
            expect((1 - 2*τ)**(N - 1)).toBeGreaterThan(0.01);
        }
    });

    it('should (nearly) reach the circle\'s energy after that many steps', function() {
        const ps = star(400);
        const L = edgeLengths(ps).reduce((a, b) => a + b);
        const Ecircle = (2*PI)**2/L;
        const ratio = (N: number) => {
            const frames = fairLoop(ps, getTimeSteps(0.05, N));
            return willmoreEnergy(frames[N])/Ecircle;
        };

        expect(ratio(10)).toBeGreaterThan(1.05);
        expect(ratio(stepsToRound(0.05, 0.01))).toBeCloseTo(1, 2);
    });
});
