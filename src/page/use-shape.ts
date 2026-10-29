import { useEffect, useState } from 'react';
import { getPathsFromStr } from 'flo-boolean';
import { loadPath } from './load-path.js';


interface Shape {
    readonly vectorName: string;
    readonly pathStr: string;
    readonly loops: number[][][][];
}


/**
 * Loads the shape of the given (glyph) name (see `loadPath`), returning it
 * (once loaded) or the error that occurred.
 */
function useShape(vectorName: string) {
    const [shape, setShape] = useState<Shape>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        let cancelled = false;
        loadPath(vectorName).then(pathStr => {
            if (cancelled) { return; }
            setShape({ vectorName, pathStr, loops: getPathsFromStr(pathStr) });
            setError(undefined);
        }).catch((e: unknown) => {
            if (!cancelled) { setError(String(e)); }
        });

        return () => { cancelled = true; };
    }, [vectorName]);

    return { shape, error };
}


export type { Shape }
export { useShape }
