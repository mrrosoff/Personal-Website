import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("printenv", () => {
    it("should print a variable", () => {
        const shell = mockShell({ NAME: "max" });

        const result = shell.run("printenv NAME");

        expect(result).toBe("max");
    });

    it("should print every variable", () => {
        const shell = mockShell();

        const result = shell.run("printenv");

        expect(result).toBe("cwd=/");
    });

    it("should print nothing for an unset variable", () => {
        const shell = mockShell();

        const result = shell.run("printenv NOPE");

        expect(result).toBe("");
    });
});
