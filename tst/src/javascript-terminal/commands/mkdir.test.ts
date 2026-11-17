import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

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

    it("should fail inside a file", () => {
        const shell = mockShell();

        const result = shell.run("mkdir /home/fruit.txt/x");

        expect(result).toBe("Cannot Descend Into File");
    });

    it("should skip parents it cannot make", () => {
        const shell = mockShell();
        shell.run("mkdir -p /home/fruit.txt/x");

        const result = shell.run("ls /home");

        expect(result).toBe("fruit.txt\nnumbers.txt\nother.txt\npeople.csv\nprojects");
    });
});
