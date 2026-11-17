import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import { parseOptions } from "../../../../src/javascript-terminal/parser";

vi.mock("../../../../src/javascript-terminal/parser", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../../src/javascript-terminal/parser")>();
    return { ...actual, parseOptions: vi.fn(actual.parseOptions) };
});

const unreadableArgument = {
    toString: () => {
        throw new Error("unreadable argument");
    }
};

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

    it("should print nothing without exactly one command", () => {
        const shell = mockShell();

        const result = shell.run("man ls cd");

        expect(result).toBe("");
    });

    it("should report an argument it cannot read", () => {
        const shell = mockShell();
        vi.mocked(parseOptions).mockReturnValueOnce({
            options: {},
            argv: [unreadableArgument]
        } as never);

        const [result] = shell.results("man x");

        expect(result.type).toBe("error");
    });
});
