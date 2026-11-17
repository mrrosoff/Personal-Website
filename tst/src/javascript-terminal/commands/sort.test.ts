import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("sort", () => {
    it("should sort alphabetically", () => {
        const shell = mockShell();

        const result = shell.run("sort /home/numbers.txt");

        expect(result).toBe("10\n2\n33");
    });

    it("should sort numerically", () => {
        const shell = mockShell();

        const result = shell.run("sort -n /home/numbers.txt");

        expect(result).toBe("2\n10\n33");
    });

    it("should sort in reverse", () => {
        const shell = mockShell();

        const result = shell.run("sort -rn /home/numbers.txt");

        expect(result).toBe("33\n10\n2");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("sort");

        expect(result).toBe("usage: sort [-rn] [file]");
    });

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("sort /home/missing.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });
});
