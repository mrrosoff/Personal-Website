import { decode as decodeJpeg } from "jpeg-js";

type RgbImage = {
    data: Uint8Array;
    width: number;
    height: number;
};

type CropRect = { x: number; y: number; width: number; height: number };

export function decodeImage(buffer: Buffer): RgbImage {
    if (!isJpeg(buffer)) {
        throw new Error("Unsupported image format");
    }

    const raw = decodeJpeg(buffer, { useTArray: true });
    const pixels = raw.width * raw.height;
    const data = new Uint8Array(pixels * 3);
    for (let i = 0; i < pixels; i++) {
        data[i * 3] = raw.data[i * 4];
        data[i * 3 + 1] = raw.data[i * 4 + 1];
        data[i * 3 + 2] = raw.data[i * 4 + 2];
    }
    return { data, width: raw.width, height: raw.height };
}

function isJpeg(buffer: Buffer): boolean {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

export function resizeToCover(image: RgbImage, targetW: number, targetH: number): RgbImage {
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
                for (let sx = sx0; sx < sx1; sx++) {
                    const wx = Math.min(sx + 1, x1) - Math.max(sx, x0);
                    const w = wx * wy;
                    const i = (sy * image.width + sx) * 3;
                    r += image.data[i] * w;
                    g += image.data[i + 1] * w;
                    b += image.data[i + 2] * w;
                    weight += w;
                }
            }

            const o = (ty * targetW + tx) * 3;
            out[o] = Math.round(r / weight);
            out[o + 1] = Math.round(g / weight);
            out[o + 2] = Math.round(b / weight);
        }
    }

    return { data: out, width: targetW, height: targetH };
}
