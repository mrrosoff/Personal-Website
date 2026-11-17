import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("mkdir", () => {
    it("should make a directory", () => {
        const shell = mockShell();
        shell.run("mkdir /empty/new");

        const result = shell.run("ls /empty");

        expect(result).toBe("new");
    });

    it("should make parents", () => {
        const shell = mockShell();
        shell.run("mkdir -p /a/b/c");

        const result = shell.run("ls /a/b");

        expect(result).toBe("c");
    });

    it("should need a name", () => {
        const shell = mockShell();

        const result = shell.run("mkdir");

        expect(result).toBe("usage: mkdir [-p] directory_name");
    });
});
