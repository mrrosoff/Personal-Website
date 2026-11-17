import { encode as encodeJpeg } from "jpeg-js";
import { describe, expect, it } from "vitest";

import { decodeImage, resizeToCover } from "../../../../../api/endpoints/polaroid/upload/image";

function jpeg(width: number, height: number): Buffer {
    return encodeJpeg({ data: Buffer.alloc(width * height * 4, 200), width, height }).data;
}

describe("decodeImage", () => {
    it("should decode a jpeg to rgb", () => {
        const result = decodeImage(jpeg(4, 2));

        expect(result).toMatchObject({ width: 4, height: 2 });
        expect(result.data).toHaveLength(4 * 2 * 3);
    });

    it("should refuse anything that is not a jpeg", () => {
        expect(() => decodeImage(Buffer.from("not a photo"))).toThrow("Unsupported image format");
    });
});

describe("resizeToCover", () => {
    it("should crop a wide photo to fill the target", () => {
        const result = resizeToCover(decodeImage(jpeg(40, 10)), 2, 3);

        expect(result).toMatchObject({ width: 2, height: 3 });
        expect(result.data).toHaveLength(2 * 3 * 3);
    });
});
