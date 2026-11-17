import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("dirname", () => {
    it("should return the parent of a path", () => {
        const shell = mockShell();

        const result = shell.run("dirname /a/b/file.txt");

        expect(result).toBe("/a/b");
    });

    it("should return . for a bare name", () => {
        const shell = mockShell();

        const result = shell.run("dirname file.txt");

        expect(result).toBe(".");
    });

    it("should return / for a top level path", () => {
        const shell = mockShell();

        const result = shell.run("dirname /file.txt");

        expect(result).toBe("/");
    });

    it("should need a path", () => {
        const shell = mockShell();

        const result = shell.run("dirname");

        expect(result).toBe("dirname: missing operand");
    });

    it("should return / for the root", () => {
        const shell = mockShell();

        const result = shell.run("dirname /");

        expect(result).toBe("/");
    });
});
