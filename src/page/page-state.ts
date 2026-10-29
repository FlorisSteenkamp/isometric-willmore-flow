
/** The page's settings - remembered in local storage */
interface PageState {
    readonly version: number;
    readonly vectorName: string;
    /** the total number of polygon vertices (shared among the loops by length) */
    readonly vertexCount: number;
    /** the time step τ */
    readonly τ: number;
    /** the point of the morph, from `0` (the initial shape) to `1` (the last step) */
    readonly morph: number;
    /** if `true` the morph plays back and forth (see `onPlayPauseClicked`) */
    readonly morphPlaying: boolean;
    readonly showOriginal: boolean;
    readonly showVertices: boolean;
}


const STORAGE_KEY = 'fairing-page-state';

/** the largest time step τ offered */
const MAX_TIME_STEP = 0.1;


const defaultPageState: PageState = {
    version: 2,
    vectorName: 'hart',
    vertexCount: 1000,
    τ: 0.01,
    morph: 0,
    morphPlaying: true,
    showOriginal: true,
    showVertices: false
};


function getInitialPageState(): PageState {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) { return defaultPageState; }
        const stored: PageState = JSON.parse(json);
        if (stored.version !== defaultPageState.version) {
            return defaultPageState;
        }
        const state = { ...defaultPageState, ...stored };
        return { ...state, τ: Math.min(state.τ, MAX_TIME_STEP) };
    } catch {
        return defaultPageState;
    }
}


function savePageState(pageState: PageState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pageState));
    } catch {
        // ignore - it's only a convenience
    }
}


export type { PageState }
export { MAX_TIME_STEP, getInitialPageState, savePageState }
