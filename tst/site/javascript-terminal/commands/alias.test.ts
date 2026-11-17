import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("alias", () => {
    it("should print nothing when there are no aliases", () => {
        const shell = mockShell();

        const result = shell.run("alias");

        expect(result).toBe("");
    });

    it("should list a stored alias", () => {
        const shell = mockShell();
        shell.run("alias ll='ls -l'");

        const result = shell.run("alias");

        expect(result).toBe("alias ll='ls -l'");
    });

    it("should reject an alias without a command", () => {
        const shell = mockShell();

        const result = shell.run("alias ll");

        expect(result).toBe("alias: invalid syntax. Use: alias name='command'");
    });
});
