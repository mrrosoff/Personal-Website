import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import { DateTime } from "luxon";

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

    it("should print the local date by default", () => {
        const shell = mockShell();

        const result = shell.run("date");

        expect(result).toMatch(/^\w{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2}$/);
    });

    it("should format in UTC with + patterns", () => {
        const shell = mockShell();

        const result = shell.run("date -u +%H");

        expect(result).toBe(new Date().toISOString().slice(11, 13));
    });

    it("should report a clock failure", () => {
        const shell = mockShell();
        vi.spyOn(DateTime, "now").mockImplementation(() => {
            throw new Error("no clock");
        });

        const result = shell.run("date");

        expect(result).toBe("no clock");
    });
});
