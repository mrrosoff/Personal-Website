import { describe, expect, it } from "vitest";

import {
    clamp01,
    linearToByteTriple,
    rgbToOklab,
    srgbToLinear
} from "../../../../../api/endpoints/polaroid/upload/color";

describe("srgbToLinear", () => {
    it("should map the ends of the byte range to 0 and 1", () => {
        expect(srgbToLinear(0)).toBe(0);
        expect(srgbToLinear(255)).toBe(1);
    });

    it("should clamp values outside the byte range", () => {
        expect(srgbToLinear(-10)).toBe(0);
        expect(srgbToLinear(300)).toBe(1);
    });
});

describe("linearToByteTriple", () => {
    it("should round trip back to bytes", () => {
        const result = linearToByteTriple(1, 0, srgbToLinear(128));

        expect(result.map(Math.round)).toEqual([255, 0, 128]);
    });
});

describe("rgbToOklab", () => {
    it("should give white full lightness and no colour", () => {
        const [lightness, a, b] = rgbToOklab(255, 255, 255);

        expect(lightness).toBeCloseTo(1, 3);
        expect(a).toBeCloseTo(0, 3);
        expect(b).toBeCloseTo(0, 3);
    });
});

describe("clamp01", () => {
    it("should keep values between 0 and 1", () => {
        expect([clamp01(-1), clamp01(0.5), clamp01(2)]).toEqual([0, 0.5, 1]);
    });
});
