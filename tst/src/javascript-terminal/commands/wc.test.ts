import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

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

    it("should count only characters", () => {
        const shell = mockShell();

        const result = shell.run("wc -c /home/numbers.txt");

        expect(result).toBe("7 /home/numbers.txt");
    });

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("wc /home/missing.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });
});
