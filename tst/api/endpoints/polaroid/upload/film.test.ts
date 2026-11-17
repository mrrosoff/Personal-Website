import { describe, expect, it } from "vitest";

import { applyFilm } from "../../../../../api/endpoints/polaroid/upload/film";

describe("applyFilm", () => {
    it("should keep every channel between 0 and 1", () => {
        const linear = Float32Array.from([0, 0, 0, 1, 1, 1, 0.5, 0.2, 0.9, 2, -1, 0.4]);

        applyFilm(linear, 2, 2);

        expect(linear.every((value) => value >= 0 && value <= 1)).toBe(true);
    });

    it("should lift pure black slightly, like the film's paper", () => {
        const linear = new Float32Array(3);

        applyFilm(linear, 1, 1);

        expect(linear[0]).toBeGreaterThan(0);
    });
});
