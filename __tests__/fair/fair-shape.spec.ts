import { describe, it, expect } from '@jest/globals';
import { fairShape } from '../../src/fair/fair-shape.js';
import { getTimeSteps } from '../../src/fair/get-time-steps.js';


/** A long thin rectangle (as lines) */
const rect = [[
    [[0,0],[10,0]],
    [[10,0],[10,1]],
    [[10,1],[0,1]],
    [[0,1],[0,0]]
]];


describe('fairShape', function() {
    it('should skip zero-length loops (e.g. `M 1 2 L 1 2 Z`)', function() {
        const loops = [
            ...rect,
            [[[1240,-1245],[1240,-1245]], [[1240,-1245],[1240,-1245]]]
        ];
        const framess = fairShape(loops, 200, getTimeSteps(0.2, 5));

        expect(framess.length).toBe(1);
        for (const ps of framess.flat(2)) {
            expect(Number.isFinite(ps[0]) && Number.isFinite(ps[1])).toBe(true);
        }
    });
});
