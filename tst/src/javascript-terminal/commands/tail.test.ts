import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

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

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("tail /home/missing.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });
});
