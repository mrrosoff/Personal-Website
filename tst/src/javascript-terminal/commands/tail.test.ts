import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("tail", () => {
    it("should show the last lines", () => {
        const shell = mockShell();

        const result = shell.run("tail -n 1 /home/fruit.txt");

        expect(result).toBe("cherry");
    });

    it("should show ten lines by default", () => {
        const shell = mockShell();

        const result = shell.run("tail /home/numbers.txt");

        expect(result).toBe("10\n2\n33");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("tail");

        expect(result).toBe("usage: tail [-n count] [file]");
    });
});
