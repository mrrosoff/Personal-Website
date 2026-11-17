import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("cat", () => {
    it("should print a file", () => {
        const shell = mockShell();

        const result = shell.run("cat /home/numbers.txt");

        expect(result).toBe("10\n2\n33");
    });

    it("should number each line", () => {
        const shell = mockShell();

        const result = shell.run("cat -n /home/numbers.txt");

        expect(result).toBe("     1\t10\n     2\t2\n     3\t33");
    });

    it("should join several files", () => {
        const shell = mockShell();

        const result = shell.run("cat /home/numbers.txt /home/numbers.txt");

        expect(result).toBe("10\n2\n33\n10\n2\n33");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("cat");

        expect(result).toBe("usage: cat [-n] [file ...]");
    });

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("cat /home/missing.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });
});
