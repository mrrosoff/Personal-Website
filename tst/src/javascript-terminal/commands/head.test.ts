import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

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
});
