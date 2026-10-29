
/** What to draw (and report) - the result of `getView` */
interface View {
    /** the faired shape (drawn bold and filled), as one SVG path string */
    readonly current: string;
    /** the faired shape's vertices */
    readonly vertices: number[][];
    /** the stats line as label/value pairs */
    readonly stats: readonly (readonly [string, string])[];
    readonly ms: number;
}


export type { View }
