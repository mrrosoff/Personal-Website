import { describe, expect, it } from "vitest";

import {
    PANEL_HEIGHT,
    PANEL_WIDTH,
    ditherToPalette,
    indicesToRgb,
    packFramebuffer
} from "../../../../../api/endpoints/polaroid/upload/ink";

const WHITE = 1;

describe("ditherToPalette", () => {
    it("should paint white with white ink", () => {
        const result = ditherToPalette(new Float32Array(2 * 2 * 3).fill(1), 2, 2);

        expect([...result]).toEqual([WHITE, WHITE, WHITE, WHITE]);
    });

    it("should leave its input untouched", () => {
        const linear = new Float32Array(3).fill(0.5);

        ditherToPalette(linear, 1, 1);

        expect([...linear]).toEqual([0.5, 0.5, 0.5]);
    });
});

describe("packFramebuffer", () => {
    it("should pack two pixels per byte", () => {
        const result = packFramebuffer(new Uint8Array(PANEL_WIDTH * PANEL_HEIGHT).fill(WHITE));

        expect(result).toHaveLength((PANEL_WIDTH * PANEL_HEIGHT) / 2);
        expect(result[0]).toBe(0x11);
    });
});

describe("indicesToRgb", () => {
    it("should show each pixel in its ink's colour", () => {
        const result = indicesToRgb(Uint8Array.from([WHITE]));

        expect([...result]).toEqual([220, 218, 210]);
    });
});
