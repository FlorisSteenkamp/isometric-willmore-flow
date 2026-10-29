import { edgeLengths } from './edge-lengths.js';
import { isometricWillmoreStep } from './isometric-willmore-step.js';


/**
 * Returns the polygon at the given fractional step `t` of a flow, given the
 * frames of the flow (see `fairLoop`) as keyframes.
 *
 * Frame `j + s` (with `0 ≤ s < 1`) is a single step of `s·τ_j` from keyframe
 * `j`, so it tends to keyframe `j + 1` as `s → 1`.
 *
 * * a step of `0` is not the identity - it rebuilds the polygon with the
 * initial edge lengths, snapping away the (small) length drift of the
 * keyframe - so that snap is blended out linearly, `(1 - s)` of it being
 * undone, making frame `j + 0` exactly keyframe `j` and the morph continuous
 * * it is computed afresh from its keyframe (rather than stepped from a
 * previous morph frame) so that it depends only on `t`
 *
 * @param frames the keyframes (frame `0` being the initial polygon)
 * @param τs the time steps the keyframes were computed with
 * @param t the fractional step, clamped to `[0, τs.length]`
 */
function morphFrame(
        frames: number[][][],
        τs: number[],
        t: number): number[][] {

    const t_ = Math.min(Math.max(t, 0), τs.length);
    const j = Math.floor(t_);
    const s = t_ - j;
    if (s === 0) { return frames[j]; }

    const ps = frames[j];
    const ℓs = edgeLengths(frames[0]);
    const qs = isometricWillmoreStep(ps, ℓs, s*τs[j]);
    const snapped = isometricWillmoreStep(ps, ℓs, 0);

    return qs.map((q, i) => [
        q[0] + (1 - s)*(ps[i][0] - snapped[i][0]),
        q[1] + (1 - s)*(ps[i][1] - snapped[i][1])
    ]);
}


export { morphFrame }
