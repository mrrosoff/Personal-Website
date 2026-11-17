import { clamp01, LUMA } from "./color";

type FilmStock = {
    blackLift: number;
    highlightRolloff: number;
    contrast: number;
    pivot: number;
    whiteBalance: [number, number, number];
    shadowTint: [number, number, number];
    highlightTint: [number, number, number];
    tintStrength: number;
    saturation: number;
    midtoneMagenta: number;
    vignette: number;
};

const POLAROID_FILM: FilmStock = {
    blackLift: 0.02,
    highlightRolloff: 0.8,
    contrast: 1.12,
    pivot: 0.4,
    whiteBalance: [1.04, 1.0, 0.96],
    shadowTint: [0.008, 0.025, 0.033],
    highlightTint: [0.075, 0.055, 0.0],
    tintStrength: 1.0,
    saturation: 1.05,
    midtoneMagenta: 0.045,
    vignette: 0.22
};

/** In place. Values are 0-1 linear, three channels, row-major. */
export function applyFilm(
    linear: Float32Array,
    width: number,
    height: number,
    stock: FilmStock = POLAROID_FILM
): void {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 3;

            let rgb: [number, number, number] = [
                linear[i] * stock.whiteBalance[0],
                linear[i + 1] * stock.whiteBalance[1],
                linear[i + 2] * stock.whiteBalance[2]
            ];

            const vignette = vignetteFactor(x, y, width, height, stock);
            rgb = [rgb[0] * vignette, rgb[1] * vignette, rgb[2] * vignette];

            rgb = [toneCurve(rgb[0], stock), toneCurve(rgb[1], stock), toneCurve(rgb[2], stock)];

            rgb = splitTone(rgb, stock);
            rgb = applySaturation(rgb, stock);

            linear[i] = rgb[0];
            linear[i + 1] = rgb[1];
            linear[i + 2] = rgb[2];
        }
    }
}

function vignetteFactor(
    x: number,
    y: number,
    width: number,
    height: number,
    stock: FilmStock
): number {
    const dx = (x / width - 0.5) * 2;
    const dy = (y / height - 0.5) * 2;
    const radius = Math.sqrt(dx * dx + dy * dy) / Math.SQRT2;

    // Cosine falloff. A linear one reads as a lens defect; this reads as light.
    const falloff = Math.pow(Math.cos(Math.min(1, radius) * (Math.PI / 2)), 0.7);
    return 1 - stock.vignette * (1 - falloff);
}

function toneCurve(value: number, stock: FilmStock): number {
    const x = Math.max(value, 1e-6);

    const logged = Math.log2(x / stock.pivot) * stock.contrast;
    let out = stock.pivot * Math.pow(2, logged);

    // Asymptotic, so nothing clips hard. The blooming look around windows.
    out = out / (1 + Math.pow(out, 1 / stock.highlightRolloff) * (1 - stock.highlightRolloff));

    // Barely any: the panel's black is only ~18% reflectance, so the paper
    // already lifts the shadows. Lifting much here too puts the darkest pixel
    // above ink black, and a palette with no grey can only dither that gap
    // with white dots.
    out = stock.blackLift + out * (1 - stock.blackLift);

    return clamp01(out);
}

function splitTone(rgb: [number, number, number], stock: FilmStock): [number, number, number] {
    const luma = LUMA[0] * rgb[0] + LUMA[1] * rgb[1] + LUMA[2] * rgb[2];

    const shadowWeight = (1 - luma) * (1 - luma) * stock.tintStrength;
    const highlightWeight = luma * luma * stock.tintStrength;

    return [
        clamp01(
            rgb[0] + stock.shadowTint[0] * shadowWeight + stock.highlightTint[0] * highlightWeight
        ),
        clamp01(
            rgb[1] + stock.shadowTint[1] * shadowWeight + stock.highlightTint[1] * highlightWeight
        ),
        clamp01(
            rgb[2] + stock.shadowTint[2] * shadowWeight + stock.highlightTint[2] * highlightWeight
        )
    ];
}

function applySaturation(
    rgb: [number, number, number],
    stock: FilmStock
): [number, number, number] {
    const luma = LUMA[0] * rgb[0] + LUMA[1] * rgb[1] + LUMA[2] * rgb[2];

    const midtone = 1 - Math.abs(luma - 0.5) * 2;
    const magenta = stock.midtoneMagenta * Math.max(0, midtone);

    return [
        clamp01(luma + (rgb[0] - luma) * stock.saturation + magenta),
        clamp01(luma + (rgb[1] - luma) * stock.saturation - magenta * 0.5),
        clamp01(luma + (rgb[2] - luma) * stock.saturation + magenta * 0.6)
    ];
}
