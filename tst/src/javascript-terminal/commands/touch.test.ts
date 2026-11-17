import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("touch", () => {
    it("should create an empty file", () => {
        const shell = mockShell();
        shell.run("touch /empty/new.txt");

        const result = shell.run("cat /empty/new.txt");

        expect(result).toBe("");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("touch");

        expect(result).toBe("usage: touch file");
    });
});
