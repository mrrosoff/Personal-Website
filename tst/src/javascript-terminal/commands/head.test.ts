import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("head", () => {
    it("should show the first lines", () => {
        const shell = mockShell();

        const result = shell.run("head -n 2 /home/fruit.txt");

        expect(result).toBe("banana\napple");
    });

    it("should show ten lines by default", () => {
        const shell = mockShell();

        const result = shell.run("head /home/numbers.txt");

        expect(result).toBe("10\n2\n33");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("head");

        expect(result).toBe("usage: head [-n count] [file]");
    });

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("head /home/missing.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });
});
