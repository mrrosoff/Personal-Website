import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("which", () => {
    it("should find a command", () => {
        const shell = mockShell();

        const result = shell.run("which ls");

        expect(result).toBe("/bin/ls");
    });

    it("should miss an unknown command", () => {
        const shell = mockShell();

        const result = shell.run("which nope");

        expect(result).toBe("nope: command not found");
    });

    it("should need a command", () => {
        const shell = mockShell();

        const result = shell.run("which");

        expect(result).toBe("which: missing command operand");
    });
});
