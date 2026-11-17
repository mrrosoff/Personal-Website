export type Lab = [number, number, number];

export const LUMA = [0.2126, 0.7152, 0.0722] as const;

const srgbToLinearLut = new Float64Array(256);

for (let i = 0; i < 256; i++) {
    const value = i / 255;
    srgbToLinearLut[i] = value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

export function srgbToLinear(channel: number): number {
    const clamped = Math.max(0, Math.min(255, channel));
    const low = Math.floor(clamped);
    const high = Math.min(255, low + 1);
    const t = clamped - low;
    return srgbToLinearLut[low] * (1 - t) + srgbToLinearLut[high] * t;
}

export function linearToByteTriple(r: number, g: number, b: number): [number, number, number] {
    return [linearToByte(r), linearToByte(g), linearToByte(b)];
}

function linearToByte(value: number): number {
    const clamped = value < 0 ? 0 : value > 1 ? 1 : value;
    const encoded =
        clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return encoded * 255;
}

export function rgbToOklab(r: number, g: number, b: number): Lab {
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);

    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

    return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    ];
}

export function clamp01(value: number): number {
    return value < 0 ? 0 : value > 1 ? 1 : value;
}
