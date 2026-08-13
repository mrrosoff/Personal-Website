import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { createHash, randomUUID } from "node:crypto";
import { decode as decodeJpeg } from "jpeg-js";
import { encode as encodePng } from "fast-png";
import { putObject } from "../../aws/services/s3";
import { authenticateHTTPAccessToken, UserType } from "../../auth";
import {
    HttpResponseStatus,
    POLAROID_PHOTOS_BUCKET,
    buildErrorResponse,
    buildResponse
} from "../../common";
import { framebufferKey, previewKey, previewUrl } from "./photos";

type InkCode = (typeof INK)[keyof typeof INK];

type Ink = {
    name: string;
    code: InkCode;
    rgb: [number, number, number];
    weight: number;
};

type Lab = [number, number, number];

type PreparedPalette = {
    inks: Ink[];
    labs: Lab[];
};

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

type RgbImage = {
    data: Uint8Array;
    width: number;
    height: number;
};

type CropRect = { x: number; y: number; width: number; height: number };

type RenderResult = {
    framebuffer: Buffer;
    preview: Buffer;
    hash: string;
    width: number;
    height: number;
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

const srgbToLinearLut = new Float64Array(256);
for (let i = 0; i < 256; i++) {
    const value = i / 255;
    srgbToLinearLut[i] = value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

const DITHER_STRENGTH = 0.88;
const DITHER_ERROR_CLAMP = 0.35;

const LIGHTNESS_WEIGHT = 1.0;
const CHROMA_WEIGHT = 4.0;

const POLAROID_FILM: FilmStock = {
    blackLift: 0.07,
    highlightRolloff: 0.8,
    contrast: 1.12,
    pivot: 0.4,
    whiteBalance: [1.04, 1.0, 0.96],
    shadowTint: [0.015, 0.05, 0.065],
    highlightTint: [0.075, 0.055, 0.0],
    tintStrength: 1.0,
    saturation: 0.9,
    midtoneMagenta: 0.045,
    vignette: 0.22
};

const LUMA = [0.2126, 0.7152, 0.0722] as const;

const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 600;
const PANEL_ROW_BYTES = PANEL_WIDTH / 2;
const PANEL_BYTES = PANEL_ROW_BYTES * PANEL_HEIGHT;

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const payload = await authenticateHTTPAccessToken(event);
    const allowedUserTypes = [UserType.ADMIN, UserType.POLAROID_OWNER];
    if (!payload || !allowedUserTypes.includes(payload.userType)) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication Required"
        );
    }

    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const source = Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8");

    let rendered;
    try {
        rendered = renderPhoto(source);
    } catch (err) {
        console.info(err);
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            err instanceof Error ? err.message : "Could Not Read Photo"
        );
    }

    const photoId = randomUUID().replace(/-/g, "").slice(0, 12);

    // Framebuffer last: it is the record, so writing it publishes the photo.
    await putObject(POLAROID_PHOTOS_BUCKET, previewKey(photoId), rendered.preview, "image/png");
    await putObject(
        POLAROID_PHOTOS_BUCKET,
        framebufferKey(photoId),
        rendered.framebuffer,
        "application/octet-stream"
    );

    return buildResponse(event, HttpResponseStatus.OK, {
        id: photoId,
        previewUrl: await previewUrl(photoId)
    });
};

function renderPhoto(input: Buffer): RenderResult {
    const cropped = resizeToCover(decodeImage(input), PANEL_WIDTH, PANEL_HEIGHT);

    const linear = new Float32Array(PANEL_WIDTH * PANEL_HEIGHT * 3);
    for (let i = 0; i < linear.length; i++) {
        linear[i] = srgbToLinear(cropped.data[i]!);
    }

    applyFilm(linear, PANEL_WIDTH, PANEL_HEIGHT);

    const full = ditherToPalette(linear, PANEL_WIDTH, PANEL_HEIGHT);

    const framebuffer = packFramebuffer(full);
    if (framebuffer.length !== PANEL_BYTES) {
        throw new Error(`framebuffer is ${framebuffer.length} bytes, must be ${PANEL_BYTES}`);
    }

    const preview = Buffer.from(
        encodePng({
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            channels: 3,
            depth: 8,
            data: indicesToRgb(full)
        })
    );

    const hash = createHash("sha256").update(framebuffer).digest("hex").slice(0, 8);

    return { framebuffer, preview, hash, width: PANEL_WIDTH, height: PANEL_HEIGHT };
}

function resizeToCover(image: RgbImage, targetW: number, targetH: number): RgbImage {
    const crop = coverRect(image.width, image.height, targetW, targetH);
    return boxResize(
        image,
        {
            x: Math.round((image.width - crop.width) / 2),
            y: Math.round((image.height - crop.height) / 2),
            ...crop
        },
        targetW,
        targetH
    );
}

function coverRect(
    srcW: number,
    srcH: number,
    targetW: number,
    targetH: number
): { width: number; height: number } {
    const targetAspect = targetW / targetH;
    const srcAspect = srcW / srcH;

    return srcAspect > targetAspect
        ? { width: Math.round(srcH * targetAspect), height: srcH }
        : { width: srcW, height: Math.round(srcW / targetAspect) };
}

function boxResize(image: RgbImage, rect: CropRect, targetW: number, targetH: number): RgbImage {
    const out = new Uint8Array(targetW * targetH * 3);
    const scaleX = rect.width / targetW;
    const scaleY = rect.height / targetH;

    for (let ty = 0; ty < targetH; ty++) {
        const y0 = rect.y + ty * scaleY;
        const y1 = y0 + scaleY;
        const sy0 = Math.max(rect.y, Math.floor(y0));
        const sy1 = Math.min(rect.y + rect.height, Math.max(sy0 + 1, Math.ceil(y1)));

        for (let tx = 0; tx < targetW; tx++) {
            const x0 = rect.x + tx * scaleX;
            const x1 = x0 + scaleX;
            const sx0 = Math.max(rect.x, Math.floor(x0));
            const sx1 = Math.min(rect.x + rect.width, Math.max(sx0 + 1, Math.ceil(x1)));

            let r = 0;
            let g = 0;
            let b = 0;
            let weight = 0;

            for (let sy = sy0; sy < sy1; sy++) {
                // Partial coverage, so a non-integer scale doesn't shimmer.
                const wy = Math.min(sy + 1, y1) - Math.max(sy, y0);
                if (wy <= 0) continue;
                for (let sx = sx0; sx < sx1; sx++) {
                    const wx = Math.min(sx + 1, x1) - Math.max(sx, x0);
                    if (wx <= 0) continue;
                    const w = wx * wy;
                    const i = (sy * image.width + sx) * 3;
                    r += image.data[i]! * w;
                    g += image.data[i + 1]! * w;
                    b += image.data[i + 2]! * w;
                    weight += w;
                }
            }

            const o = (ty * targetW + tx) * 3;
            if (weight > 0) {
                out[o] = Math.round(r / weight);
                out[o + 1] = Math.round(g / weight);
                out[o + 2] = Math.round(b / weight);
            }
        }
    }

    return { data: out, width: targetW, height: targetH };
}

function decodeImage(buffer: Buffer): RgbImage {
    if (!isJpeg(buffer)) {
        throw new Error("Unsupported image format");
    }

    const raw = decodeJpeg(buffer, { useTArray: true });
    const pixels = raw.width * raw.height;
    const data = new Uint8Array(pixels * 3);
    for (let i = 0; i < pixels; i++) {
        data[i * 3] = raw.data[i * 4]!;
        data[i * 3 + 1] = raw.data[i * 4 + 1]!;
        data[i * 3 + 2] = raw.data[i * 4 + 2]!;
    }
    return { data, width: raw.width, height: raw.height };
}

function isJpeg(buffer: Buffer): boolean {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function srgbToLinear(channel: number): number {
    const clamped = Math.max(0, Math.min(255, channel));
    const low = Math.floor(clamped);
    const high = Math.min(255, low + 1);
    const t = clamped - low;
    return srgbToLinearLut[low]! * (1 - t) + srgbToLinearLut[high]! * t;
}

/** In place. Values are 0-1 linear, three channels, row-major. */
function applyFilm(
    linear: Float32Array,
    width: number,
    height: number,
    stock: FilmStock = POLAROID_FILM
): void {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 3;

            let rgb: [number, number, number] = [
                linear[i]! * stock.whiteBalance[0],
                linear[i + 1]! * stock.whiteBalance[1],
                linear[i + 2]! * stock.whiteBalance[2]
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
    if (stock.vignette <= 0) {
        return 1;
    }

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

    // Shadows can never reach zero -- true of the film and of the panel.
    out = stock.blackLift + out * (1 - stock.blackLift);

    return clamp01(out);
}

function clamp01(value: number): number {
    return value < 0 ? 0 : value > 1 ? 1 : value;
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

function preparePalette(): PreparedPalette {
    const inks = SPECTRA_6;
    return { inks, labs: inks.map((ink) => rgbToOklab(...ink.rgb)) };
}

function rgbToOklab(r: number, g: number, b: number): Lab {
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

function ditherToPalette(linear: Float32Array, width: number, height: number): Uint8Array {
    const palette = preparePalette();
    const strength = DITHER_STRENGTH;
    const serpentine = true;
    const errorClamp = DITHER_ERROR_CLAMP;

    // Working copy: the dither mutates as it goes and callers keep their input.
    const work = Float32Array.from(linear);
    const out = new Uint8Array(width * height);

    const diffuse = (x: number, y: number, weight: number, er: number, eg: number, eb: number) => {
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return;
        }
        const i = (y * width + x) * 3;
        work[i] = work[i]! + clamp(er * weight, errorClamp);
        work[i + 1] = work[i + 1]! + clamp(eg * weight, errorClamp);
        work[i + 2] = work[i + 2]! + clamp(eb * weight, errorClamp);
    };

    for (let y = 0; y < height; y++) {
        const rightward = !serpentine || y % 2 === 0;
        const start = rightward ? 0 : width - 1;
        const end = rightward ? width : -1;
        const step = rightward ? 1 : -1;

        for (let x = start; x !== end; x += step) {
            const i = (y * width + x) * 3;

            const r = work[i]!;
            const g = work[i + 1]!;
            const b = work[i + 2]!;

            const index = nearestInk(palette, rgbToOklab(...linearToByteTriple(r, g, b)));
            out[y * width + x] = index;

            const chosen = palette.inks[index]!.rgb;
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

function nearestInk(palette: PreparedPalette, lab: Lab): number {
    let bestIndex = 0;
    let bestDistance = Infinity;

    for (let i = 0; i < palette.labs.length; i++) {
        const candidate = palette.labs[i]!;
        const dl = (lab[0] - candidate[0]) * LIGHTNESS_WEIGHT;
        const da = (lab[1] - candidate[1]) * CHROMA_WEIGHT;
        const db = (lab[2] - candidate[2]) * CHROMA_WEIGHT;
        const distance = (dl * dl + da * da + db * db) * palette.inks[i]!.weight;

        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
        }
    }

    return bestIndex;
}

function linearToByteTriple(r: number, g: number, b: number): [number, number, number] {
    return [linearToByte(r), linearToByte(g), linearToByte(b)];
}

function linearToByte(value: number): number {
    const clamped = value < 0 ? 0 : value > 1 ? 1 : value;
    const encoded =
        clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return encoded * 255;
}

// 4bpp, two pixels per byte, high nibble first, no padding, no header.
function packFramebuffer(indices: Uint8Array): Buffer {
    const inks = SPECTRA_6;
    if (indices.length !== PANEL_WIDTH * PANEL_HEIGHT) {
        throw new Error(`expected ${PANEL_WIDTH * PANEL_HEIGHT} pixels, got ${indices.length}`);
    }

    const out = Buffer.allocUnsafe(PANEL_BYTES);

    for (let y = 0; y < PANEL_HEIGHT; y++) {
        for (let x = 0; x < PANEL_WIDTH; x += 2) {
            const high = inks[indices[y * PANEL_WIDTH + x]!]!.code;
            const low = inks[indices[y * PANEL_WIDTH + x + 1]!]!.code;
            out[(y * PANEL_ROW_BYTES + x / 2) as number] = (high << 4) | low;
        }
    }

    return out;
}

function indicesToRgb(indices: Uint8Array): Uint8Array {
    const inks = SPECTRA_6;
    const out = new Uint8Array(indices.length * 3);
    for (let i = 0; i < indices.length; i++) {
        const rgb = inks[indices[i]!]!.rgb;
        out[i * 3] = rgb[0];
        out[i * 3 + 1] = rgb[1];
        out[i * 3 + 2] = rgb[2];
    }
    return out;
}
