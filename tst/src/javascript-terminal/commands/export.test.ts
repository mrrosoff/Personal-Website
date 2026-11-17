import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("export", () => {
    it("should set a variable", () => {
        const shell = mockShell();
        shell.run("export COLOR=blue");

        const result = shell.run("printenv COLOR");

        expect(result).toBe("blue");
    });

    it("should list every variable", () => {
        const shell = mockShell();

        const result = shell.run("export");

        expect(result).toBe("cwd=/");
    });

    it("should reject a bad assignment", () => {
        const shell = mockShell();

        const result = shell.run("export nope");

        expect(result).toBe("export: invalid syntax. Use: export VAR=value");
    });
});
