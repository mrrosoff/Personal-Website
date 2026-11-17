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

describe("dirname", () => {
    it("should return the parent of a path", () => {
        const shell = mockShell();

        const result = shell.run("dirname /a/b/file.txt");

        expect(result).toBe("/a/b");
    });

    it("should return . for a bare name", () => {
        const shell = mockShell();

        const result = shell.run("dirname file.txt");

        expect(result).toBe(".");
    });

    it("should return / for a top level path", () => {
        const shell = mockShell();

        const result = shell.run("dirname /file.txt");

        expect(result).toBe("/");
    });

    it("should need a path", () => {
        const shell = mockShell();

        const result = shell.run("dirname");

        expect(result).toBe("dirname: missing operand");
    });

    it("should return / for the root", () => {
        const shell = mockShell();

        const result = shell.run("dirname /");

        expect(result).toBe("/");
    });

    it("should report an argument it cannot read", () => {
        const shell = mockShell();
        vi.mocked(parseOptions).mockReturnValueOnce({
            options: {},
            argv: [unreadableArgument]
        } as never);

        const [result] = shell.results("dirname x");

        expect(result.type).toBe("error");
    });
});
