
interface Glyph {
    readonly name: string;
    readonly d: string;
}


/** all test shapes, stored as the `<glyph>`s of one SVG font */
const path = 'html/vectors/vectors.svg';


const _font = loadSvgFont(path);


/** Fetches the SVG font at the given URL and returns its glyphs */
async function loadSvgFont(url: string): Promise<Glyph[]> {
    const str = await (await fetch(url)).text();
    const doc = new DOMParser().parseFromString(str, 'image/svg+xml');

    return [...doc.querySelectorAll('glyph')].map(glyph => ({
        name: glyph.getAttribute('glyph-name') ?? '',
        d: glyph.getAttribute('d') ?? ''
    }));
}


/**
 * The SVG path string of the glyph of the given name (or of the first glyph if
 * there is no such glyph).
 */
async function loadPath(glyphName: string): Promise<string> {
    const font = await _font;
    const glyph = font.find(glyph => glyph.name === glyphName) ?? font[0];
    if (!glyph?.d) { throw new Error(`No glyph '${glyphName}' found in ${path}`); }

    return glyph.d;
}


async function getGlyphNames(): Promise<string[]> {
    const font = await _font;

    return font.map(glyph => glyph.name);
}


export { loadPath, getGlyphNames }
