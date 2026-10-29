
/**
 * Returns the given points rotated and translated (no scaling) to best match
 * the reference points in the weighted least squares sense, i.e. "removes the
 * mean change in position and angle" (Section 5.1 of the paper).
 *
 * @param ps the points to move
 * @param refs the reference points (same length as `ps`)
 * @param ws a weight per point
 */
function alignRigidly(
        ps: number[][],
        refs: number[][],
        ws: number[]): number[][] {

    const n = ps.length;

    let W = 0;
    let cx = 0; let cy = 0;
    let rx = 0; let ry = 0;
    for (let i=0; i<n; i++) {
        const w = ws[i];
        W += w;
        cx += w*ps[i][0];   cy += w*ps[i][1];
        rx += w*refs[i][0]; ry += w*refs[i][1];
    }
    cx /= W; cy /= W;
    rx /= W; ry /= W;

    // optimal 2d rotation (Procrustes) from centered `ps` to centered `refs`
    let sCross = 0;
    let sDot = 0;
    for (let i=0; i<n; i++) {
        const w = ws[i];
        const qx = ps[i][0] - cx;   const qy = ps[i][1] - cy;
        const ux = refs[i][0] - rx; const uy = refs[i][1] - ry;
        sCross += w*(qx*uy - qy*ux);
        sDot   += w*(qx*ux + qy*uy);
    }
    const α = Math.atan2(sCross, sDot);
    const sinα = Math.sin(α);
    const cosα = Math.cos(α);

    return ps.map(p => {
        const qx = p[0] - cx;
        const qy = p[1] - cy;
        return [
            rx + cosα*qx - sinα*qy,
            ry + sinα*qx + cosα*qy
        ];
    });
}


export { alignRigidly }
