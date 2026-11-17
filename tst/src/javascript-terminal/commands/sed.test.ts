import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("sed", () => {
    it("should replace the first match on each line", () => {
        const shell = mockShell();

        const result = shell.run("sed s/a/o/ /home/people.csv");

        expect(result).toBe("oda,lovelace,1815\nolan,turing,1912");
    });

    it("should replace every match", () => {
        const shell = mockShell();

        const result = shell.run("sed s/an/AN/g /home/fruit.txt");

        expect(result).toBe("bANANa\napple\napple\ncherry");
    });

    it("should ignore case", () => {
        const shell = mockShell();

        const result = shell.run("sed s/APPLE/pear/i /home/fruit.txt");

        expect(result).toBe("banana\npear\npear\ncherry");
    });

    it("should reject a bad expression", () => {
        const shell = mockShell();

        const result = shell.run("sed nonsense /home/fruit.txt");

        expect(result).toBe("sed: invalid command. Use format: s/find/replace/[gi]");
    });

    it("should need an expression and file", () => {
        const shell = mockShell();

        const result = shell.run("sed s/a/b/");

        expect(result).toBe("sed: missing operand");
    });
});
