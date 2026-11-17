import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("rmdir", () => {
    it("should remove a directory", () => {
        const shell = mockShell();
        shell.run("rmdir /empty");

        const result = shell.run("ls /");

        expect(result).toBe("home\nmedia");
    });

    it("should remove empty parents", () => {
        const shell = mockShell();
        shell.run("mkdir -p /a/b/c");
        shell.run("rmdir -p /a/b/c");

        const result = shell.run("ls /");

        expect(result).toBe("empty\nhome\nmedia");
    });

    it("should need a directory", () => {
        const shell = mockShell();

        const result = shell.run("rmdir");

        expect(result).toBe("usage: rmdir [-p] directory");
    });
});
