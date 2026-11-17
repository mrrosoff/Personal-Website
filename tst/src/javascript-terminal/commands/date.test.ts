import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("date", () => {
    it("should fill in a format", () => {
        const shell = mockShell();

        const result = shell.run("date +%Y");

        expect(result).toBe(String(new Date().getFullYear()));
    });

    it("should print UTC in HTTP format", () => {
        const shell = mockShell();

        const result = shell.run("date -u");

        expect(result).toMatch(/GMT$/);
    });
});
