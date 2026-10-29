
/**
 * Returns the signed exterior (turning) angle at vertex `b` of the polygon
 * `a → b → c`, i.e. the angle from the edge `ab` to the edge `bc`, in `(-π,π]`.
 *
 * * positive for a left (counter-clockwise) turn
 */
function turningAngle(
        a: number[],
        b: number[],
        c: number[]): number {

    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const vx = c[0] - b[0];
    const vy = c[1] - b[1];

    return Math.atan2(ux*vy - uy*vx, ux*vx + uy*vy);
}


export { turningAngle }
