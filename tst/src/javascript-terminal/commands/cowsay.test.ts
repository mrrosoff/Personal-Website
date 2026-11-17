import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import { parseOptions } from "../../../../src/javascript-terminal/parser";
import cowsayCommand from "../../../../src/javascript-terminal/commands/cowsay";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

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

describe("cowsay", () => {
    it("should moo by default", () => {
        const shell = mockShell();

        const result = shell.run("cowsay");

        expect(result).toContain("< moo >");
    });

    it("should say the message", () => {
        const shell = mockShell();

        const result = shell.run("cowsay hi there");

        expect(result).toContain("< hi there >");
    });

    it("should draw the cow", () => {
        const shell = mockShell();

        const result = shell.run("cowsay");

        expect(result).toContain("(oo)");
    });

    it("should wrap a long message across lines", () => {
        const shell = mockShell();

        const result = shell.run("cowsay moo moo moo moo moo moo moo moo moo moo moo moo");

        expect(result).toContain("/ moo moo moo moo moo moo moo moo moo moo \\");
    });

    it("should close a wrapped message with the last line", () => {
        const shell = mockShell();

        const result = shell.run(`cowsay ${"moo ".repeat(25)}`);

        expect(result).toContain("| moo moo");
        expect(result).toMatch(/\\ moo .* \//);
    });

    it("should start a new line for a very long word", () => {
        const shell = mockShell();

        const result = shell.run("cowsay aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa b");

        expect(result).toContain("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    });

    it("should report an argument it cannot read", () => {
        const shell = mockShell();
        vi.mocked(parseOptions).mockReturnValueOnce({
            options: {},
            argv: [unreadableArgument]
        } as never);

        const [result] = shell.results("cowsay x");

        expect(result.type).toBe("error");
    });

    it("should draw an empty bubble for blank words", () => {
        const result = cowsayCommand.functionDef(EmulatorState.create({}), ["", ""]);

        expect(result.output).toStartWith(" __\n<  >");
    });
});
