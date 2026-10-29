import { describe, it, expect } from '@jest/globals';
import { getTimeSteps } from '../../src/fair/get-time-steps.js';


describe('getTimeSteps', function() {
    it('should return constant steps', function() {
        expect(getTimeSteps(0.3, 4)).toEqual([0.3, 0.3, 0.3, 0.3]);
        expect(getTimeSteps(0.3, 0)).toEqual([]);
    });
});
