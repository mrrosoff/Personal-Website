import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("cut", () => {
    it("should pick a field", () => {
        const shell = mockShell();

        const result = shell.run("cut -d , -f 2 /home/people.csv");

        expect(result).toBe("lovelace\nturing");
    });

    it("should pick a range of fields", () => {
        const shell = mockShell();

        const result = shell.run("cut -d , -f 1-2 /home/people.csv");

        expect(result).toBe("ada,lovelace\nalan,turing");
    });

    it("should pick a list of fields", () => {
        const shell = mockShell();

        const result = shell.run("cut -d , -f 1,3 /home/people.csv");

        expect(result).toBe("ada,1815\nalan,1912");
    });

    it("should need fields", () => {
        const shell = mockShell();

        const result = shell.run("cut /home/people.csv");

        expect(result).toBe("cut: you must specify a list of fields with -f");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("cut");

        expect(result).toBe("cut: missing file operand");
    });

    it("should split on tabs by default", () => {
        const shell = mockShell();

        const result = shell.run("cut -f 1 /home/numbers.txt");

        expect(result).toBe("10\n2\n33");
    });

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("cut -f 1 /home/missing.txt");

        expect(result).toBe("Not A File At Specified Path: /home/missing.txt");
    });

    it("should leave a missing field blank", () => {
        const shell = mockShell();

        const result = shell.run("cut -d , -f 4 /home/people.csv");

        expect(result).toBe("\n");
    });
});
