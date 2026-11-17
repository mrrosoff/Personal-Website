import { linearToByteTriple, rgbToOklab, srgbToLinear } from "./color";
import type { Lab } from "./color";

type InkCode = (typeof INK)[keyof typeof INK];

type Ink = {
    name: string;
    code: InkCode;
    rgb: [number, number, number];
    weight: number;
};

type PreparedPalette = {
    inks: Ink[];
    labs: Lab[];
};

const INK = {
    BLACK: 0x0,
    WHITE: 0x1,
    YELLOW: 0x2,
    RED: 0x3,
    BLUE: 0x5,
    GREEN: 0x6
} as const;

const SPECTRA_6: Ink[] = [
    { name: "black", code: INK.BLACK, rgb: [45, 43, 42], weight: 1.0 },
    { name: "white", code: INK.WHITE, rgb: [220, 218, 210], weight: 1.0 },
    { name: "yellow", code: INK.YELLOW, rgb: [215, 190, 40], weight: 1.28 },
    { name: "red", code: INK.RED, rgb: [165, 45, 45], weight: 1.05 },
    { name: "blue", code: INK.BLUE, rgb: [50, 75, 140], weight: 1.12 },
    { name: "green", code: INK.GREEN, rgb: [60, 120, 80], weight: 1.35 }
];

const DITHER_STRENGTH = 0.88;

const DITHER_ERROR_CLAMP = 0.35;

const DITHER_NOISE = 0.05;

const LIGHTNESS_WEIGHT = 1.0;

const CHROMA_WEIGHT = 4.0;

export const PANEL_WIDTH = 400;

export const PANEL_HEIGHT = 600;

const PANEL_ROW_BYTES = PANEL_WIDTH / 2;

const PANEL_BYTES = PANEL_ROW_BYTES * PANEL_HEIGHT;

function preparePalette(): PreparedPalette {
    const inks = SPECTRA_6;
    return { inks, labs: inks.map((ink) => rgbToOklab(...ink.rgb)) };
}

export function ditherToPalette(linear: Float32Array, width: number, height: number): Uint8Array {
    const palette = preparePalette();
    const strength = DITHER_STRENGTH;
    const errorClamp = DITHER_ERROR_CLAMP;

    // Working copy: the dither mutates as it goes and callers keep their input.
    const work = Float32Array.from(linear);
    const out = new Uint8Array(width * height);

    const diffuse = (x: number, y: number, weight: number, er: number, eg: number, eb: number) => {
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return;
        }
        const i = (y * width + x) * 3;
        work[i] = work[i] + clamp(er * weight, errorClamp);
        work[i + 1] = work[i + 1] + clamp(eg * weight, errorClamp);
        work[i + 2] = work[i + 2] + clamp(eb * weight, errorClamp);
    };

    for (let y = 0; y < height; y++) {
        const rightward = y % 2 === 0;
        const start = rightward ? 0 : width - 1;
        const end = rightward ? width : -1;
        const step = rightward ? 1 : -1;

        for (let x = start; x !== end; x += step) {
            const i = (y * width + x) * 3;

            const r = work[i];
            const g = work[i + 1];
            const b = work[i + 2];

            // Floyd-Steinberg alone organises into worms and checkerboards.
            // Jittering only the ink choice breaks that up without touching the
            // error below, so the grain is random but the tone stays exact.
            const n = pixelNoise(x, y) * DITHER_NOISE;
            const index = nearestInk(
                palette,
                rgbToOklab(...linearToByteTriple(r + n, g + n, b + n))
            );
            out[y * width + x] = index;

            const chosen = palette.inks[index].rgb;
            const er = (r - srgbToLinear(chosen[0])) * strength;
            const eg = (g - srgbToLinear(chosen[1])) * strength;
            const eb = (b - srgbToLinear(chosen[2])) * strength;

            const ahead = step;
            diffuse(x + ahead, y, 7 / 16, er, eg, eb);
            diffuse(x - ahead, y + 1, 3 / 16, er, eg, eb);
            diffuse(x, y + 1, 5 / 16, er, eg, eb);
            diffuse(x + ahead, y + 1, 1 / 16, er, eg, eb);
        }
    }

    return out;
}

function clamp(value: number, limit: number): number {
    return value < -limit ? -limit : value > limit ? limit : value;
}

// Deterministic per-pixel value in [-0.5, 0.5]. Same photo, same grain, so a
// re-upload does not produce a different hash.
function pixelNoise(x: number, y: number): number {
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296 - 0.5;
}

function nearestInk(palette: PreparedPalette, lab: Lab): number {
    let bestIndex = 0;
    let bestDistance = Infinity;

    for (let i = 0; i < palette.labs.length; i++) {
        const candidate = palette.labs[i];
        const dl = (lab[0] - candidate[0]) * LIGHTNESS_WEIGHT;
        const da = (lab[1] - candidate[1]) * CHROMA_WEIGHT;
        const db = (lab[2] - candidate[2]) * CHROMA_WEIGHT;
        const distance = (dl * dl + da * da + db * db) * palette.inks[i].weight;

        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
        }
    }

    return bestIndex;
}

// 4bpp, two pixels per byte, high nibble first, no padding, no header.
export function packFramebuffer(indices: Uint8Array): Buffer {
    const inks = SPECTRA_6;
    const out = Buffer.allocUnsafe(PANEL_BYTES);

    for (let y = 0; y < PANEL_HEIGHT; y++) {
        for (let x = 0; x < PANEL_WIDTH; x += 2) {
            const high = inks[indices[y * PANEL_WIDTH + x]].code;
            const low = inks[indices[y * PANEL_WIDTH + x + 1]].code;
            out[y * PANEL_ROW_BYTES + x / 2] = (high << 4) | low;
        }
    }

    return out;
}

export function indicesToRgb(indices: Uint8Array): Uint8Array {
    const inks = SPECTRA_6;
    const out = new Uint8Array(indices.length * 3);
    for (let i = 0; i < indices.length; i++) {
        const rgb = inks[indices[i]].rgb;
        out[i * 3] = rgb[0];
        out[i * 3 + 1] = rgb[1];
        out[i * 3 + 2] = rgb[2];
    }
    return out;
}
