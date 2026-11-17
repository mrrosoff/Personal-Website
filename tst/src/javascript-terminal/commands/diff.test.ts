import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

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
});
