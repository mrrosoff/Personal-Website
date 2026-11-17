import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("diff", () => {
    it("should show changed lines", () => {
        const shell = mockShell();

        const result = shell.run("diff /home/fruit.txt /home/other.txt");

        expect(result).toBe("< apple\n> pear\n---");
    });

    it("should print nothing for identical files", () => {
        const shell = mockShell();

        const result = shell.run("diff /home/fruit.txt /home/fruit.txt");

        expect(result).toBe("");
    });

    it("should need two files", () => {
        const shell = mockShell();

        const result = shell.run("diff /home/fruit.txt");

        expect(result).toBe("diff: missing operand");
    });

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("diff /home/fruit.txt /home/missing.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });

    it("should show lines only one file has", () => {
        const shell = mockShell();

        const result = shell.run("diff /home/numbers.txt /home/fruit.txt");

        expect(result).toBe("< 10\n> banana\n---\n< 2\n> apple\n---\n< 33\n> apple\n---\n> cherry");
    });
});
