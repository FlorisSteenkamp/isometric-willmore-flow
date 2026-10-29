import { useEffect, useMemo, useRef, useState } from 'react';
import { Slider } from '../components/simple-slider.js';
import { SimpleSelect } from '../components/simple-select.js';
import { Checkbox } from '../components/simple-checkbox.js';
import { PlayIcon, PauseIcon } from '../components/icons.js';
import { getGlyphNames } from './load-path.js';
import { useShape } from './use-shape.js';
import { computeFair, getView } from './compute-fair.js';
import { stepsToRound } from '../fair/remaining-curvature.js';
import {
    MAX_TIME_STEP, getInitialPageState, savePageState, type PageState
} from './page-state.js';


const { max, min } = Math;

/** the fraction of the curvature left that counts as round */
const ROUND = 0.01;

/** the morph's playback: one pass, original → round (seconds) */
const MORPH_PASS_SECONDS = 3;
/** the playback's hold at either end before turning back (seconds) */
const MORPH_HOLD_SECONDS = 1;

/** a playing morph (`onPlayPauseClicked`) */
interface Playback {
    /** the pending animation frame's id */
    raf: number;
    /** the current point of the morph (0 to 1, as the slider) */
    t: number;
    /** playing towards round (1) or back towards the original (-1) */
    dir: 1 | -1;
    /** the last frame's time (ms) */
    last: number;
    /** holding at an end until this time (ms; 0: not holding) */
    holdUntil: number;
}


function Page() {
    const [pageState, setPageState] = useState(getInitialPageState);

    const {
        vectorName, vertexCount, τ, morph, morphPlaying,
        showOriginal, showVertices
    } = pageState;

    // the morph's playback (`onPlayPauseClicked`) - and its point while
    // playing, for the slider and view (the page state is only set when it
    // pauses, so it isn't saved every frame)
    const playRef = useRef<Playback | null>(null);
    const [playMorph, setPlayMorph] = useState<number | undefined>(undefined);
    const shownMorph = playMorph ?? morph;

    // resume the playback if it was left playing - and no frames after the
    // page is gone
    useEffect(() => {
        if (pageState.morphPlaying) { startPlayback(pageState.morph); }
        return () => {
            if (playRef.current !== null) {
                cancelAnimationFrame(playRef.current.raf);
            }
        };
    }, []);

    // always flow until round - the number of steps depends only on `τ`
    const steps = stepsToRound(τ, ROUND);

    function upd(changes: Partial<PageState>) {
        setPageState(s => ({ ...s, ...changes }));
    }

    useEffect(() => { savePageState(pageState); }, [pageState]);

    const [glyphNames, setGlyphNames] = useState<string[]>([]);
    useEffect(() => { getGlyphNames().then(setGlyphNames, () => {}); }, []);

    const { shape, error } = useShape(vectorName);

    const fair = useMemo(() => {
        if (!shape) { return undefined; }
        return computeFair(shape.loops, vertexCount, τ, steps);
    }, [shape, vertexCount, τ, steps]);

    const view = useMemo(() => fair && getView(fair, shownMorph), [fair, shownMorph]);

    // fit all keyframes so the view doesn't jump while morphing
    const bounds = useMemo(() => fair && getViewBox(fair.framess.flat()), [fair]);


    /**
     * Shows the next frame of the playback: the morph advanced by the time
     * since the last frame - on reaching either end, held there for
     * `MORPH_HOLD_SECONDS`, then turning back.
     *
     * * reads only the playback ref, so the first render's copy serves every
     * frame
     */
    function playStep(now: number) {
        const play = playRef.current;
        if (play === null) { return; }

        // holding at an end: nothing moves (and the hold's time is not
        // played on afterwards)
        if (now < play.holdUntil) {
            play.last = now;
            play.raf = requestAnimationFrame(playStep);
            return;
        }

        const dt = (now - play.last)/1000;
        play.last = now;

        let t = play.t + play.dir*dt/MORPH_PASS_SECONDS;
        if (t >= 1 || t <= 0) {
            t = t >= 1 ? 1 : 0;
            play.dir = t === 1 ? -1 : 1;
            play.holdUntil = now + 1000*MORPH_HOLD_SECONDS;
        }
        play.t = t;

        setPlayMorph(t);
        play.raf = requestAnimationFrame(playStep);
    }


    /** Starts the playback from the given point of the morph (see `playStep`) */
    function startPlayback(t: number) {
        const next: Playback = {
            raf: 0, t, dir: t >= 1 ? -1 : 1,
            last: performance.now(), holdUntil: 0
        };
        playRef.current = next;
        next.raf = requestAnimationFrame(playStep);
    }


    /**
     * Plays the morph from where it is - back and forth between the original
     * and round (`playStep`) - or, if playing, pauses it where it is.
     */
    function onPlayPauseClicked() {
        const play = playRef.current;
        if (play !== null) {
            cancelAnimationFrame(play.raf);
            playRef.current = null;
            setPlayMorph(undefined);
            upd({ morph: play.t, morphPlaying: false });

            return;
        }

        upd({ morphPlaying: true });
        startPlayback(morph);
    }


    function morphChanged(t: number) {
        upd({ morph: t });

        // dragging the slider while playing moves the play position
        if (playRef.current !== null) {
            playRef.current.t = t;
            setPlayMorph(t);
        }
    }

    return (
        <>
            <header className="app-header">
                <div className="app-header-titles">
                    <h1 className="app-header-title">Fairing</h1>
                    <div className="app-header-tagline">
                        Isometric Willmore flow of closed curves, in curvature
                        space (Crane, Pinkall &amp; Schröder 2013)
                    </div>
                </div>
            </header>

            <div className="ui-toolbar">
                <div className="ui-group">
                    <div className="ui-group-label">Shape</div>
                    <div className="ui-group-body">
                        <SimpleSelect
                            value={vectorName}
                            options={glyphNames}
                            onChanged={vectorName => upd({ vectorName })}
                        />
                    </div>
                </div>
                <div className="ui-group">
                    <div className="ui-group-label">Morph</div>
                    <div className="ui-group-body">
                        <button
                            className="ui-btn ui-play"
                            title={morphPlaying ? 'Pause' : 'Play'}
                            onClick={onPlayPauseClicked}
                        >
                            {morphPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <div className="ui-slider-field" style={{ width: '400px' }}>
                            <Slider
                                value={shownMorph} min={0} max={1} step={0.001}
                                onChange={morphChanged}
                            />
                            <span className="ui-value">{(shownMorph*steps).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="ui-group">
                    <div className="ui-group-label">Vertices</div>
                    <div className="ui-group-body ui-slider-field" style={{ width: '170px' }}>
                        <Slider
                            value={vertexCount} min={20} max={1000} step={10}
                            onChange={vertexCount => upd({ vertexCount })}
                        />
                        <span className="ui-value">{vertexCount}</span>
                    </div>
                </div>
                <div className="ui-group">
                    <div className="ui-group-label">Time step τ</div>
                    <div className="ui-group-body ui-slider-field" style={{ width: '170px' }}>
                        <Slider
                            value={τ} min={0.005} max={MAX_TIME_STEP} step={0.005}
                            onChange={τ => upd({ τ })}
                        />
                        <span className="ui-value">{τ.toFixed(3)}</span>
                    </div>
                </div>
                <div className="ui-group">
                    <div className="ui-group-label">Steps</div>
                    <div
                        className="ui-group-body"
                        title={`The steps after which ${100*ROUND}% of the curvature is left`}
                    >
                        <span className="ui-value">{steps}</span>
                    </div>
                </div>
                <div className="ui-group">
                    <div className="ui-group-label">Show</div>
                    <div className="ui-group-body">
                        <Checkbox
                            text="Original" checked={showOriginal}
                            onChanged={showOriginal => upd({ showOriginal })}
                        />
                        <Checkbox
                            text="Vertices" checked={showVertices}
                            onChanged={showVertices => upd({ showVertices })}
                        />
                    </div>
                </div>
            </div>

            <div className="stats">
                {error && <span className="error">{error}</span>}
                {view && <>
                    {view.stats.map(([label, value]) =>
                        <span key={label}>{label} <b>{value}</b></span>
                    )}
                    <span>took <b>{view.ms.toFixed(1)} ms</b></span>                </>}
            </div>

            {shape && view && bounds &&
                <svg className="view" viewBox={bounds.viewBox}>
                    {showOriginal &&
                        <path className="original" d={shape.pathStr} fillRule="evenodd" />
                    }
                    <path className="faired" fillRule="evenodd" d={view.current} />
                    {showVertices && view.vertices.map((p, i) =>
                        <circle
                            key={i} className="vertex"
                            cx={p[0]} cy={p[1]} r={0.003*bounds.size}
                        />
                    )}
                </svg>
            }
        </>
    );
}


/**
 * Returns an SVG `viewBox` string fitting the given polygons (with margin) and
 * the larger of its width and height.
 */
function getViewBox(pss: number[][][]) {
    let minX = Infinity; let minY = Infinity;
    let maxX = -Infinity; let maxY = -Infinity;
    for (const ps of pss) {
        for (const [x, y] of ps) {
            minX = min(minX, x); minY = min(minY, y);
            maxX = max(maxX, x); maxY = max(maxY, y);
        }
    }

    const m = 0.05*max(maxX - minX, maxY - minY);
    const w = maxX - minX + 2*m;
    const h = maxY - minY + 2*m;

    return { viewBox: `${minX - m} ${minY - m} ${w} ${h}`, size: max(w, h) };
}


export { Page }
