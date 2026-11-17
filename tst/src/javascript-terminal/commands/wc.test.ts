import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("wc", () => {
    it("should count lines, words and characters", () => {
        const shell = mockShell();

        const result = shell.run("wc /home/numbers.txt");

        expect(result).toBe("3 3 7 /home/numbers.txt");
    });

    it("should count only lines", () => {
        const shell = mockShell();

        const result = shell.run("wc -l /home/numbers.txt");

        expect(result).toBe("3 /home/numbers.txt");
    });

    it("should count only words", () => {
        const shell = mockShell();

        const result = shell.run("wc -w /home/people.csv");

        expect(result).toBe("2 /home/people.csv");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("wc");

        expect(result).toBe("usage: wc [-lwc] [file]");
    });
});
