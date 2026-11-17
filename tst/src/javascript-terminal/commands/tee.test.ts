import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("tee", () => {
    it("should echo what it writes", () => {
        const shell = mockShell();

        const result = shell.run("tee hi /empty/a.txt");

        expect(result).toBe("hi");
    });

    it("should write the file", () => {
        const shell = mockShell();
        shell.run("tee hi /empty/a.txt");

        const result = shell.run("cat /empty/a.txt");

        expect(result).toBe("hi");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("tee hi");

        expect(result).toBe("tee: missing file operand");
    });
});
