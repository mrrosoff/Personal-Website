import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("man", () => {
    it("should show a manual page", () => {
        const shell = mockShell();

        const result = shell.run("man ls");

        expect(result).toContain("ls -- list directory contents");
    });

    it("should print nothing for an unknown command", () => {
        const shell = mockShell();

        const result = shell.run("man nope");

        expect(result).toBe("");
    });
});
