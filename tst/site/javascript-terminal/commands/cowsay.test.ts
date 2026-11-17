import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import cowsayCommand from "../../../../site/javascript-terminal/commands/cowsay";
import EmulatorState from "../../../../site/javascript-terminal/emulatorState/EmulatorState";

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

    it("should draw an empty bubble for blank words", () => {
        const result = cowsayCommand.functionDef(EmulatorState.create({}), ["", ""]);

        expect(result.output).toMatch(/^ __\n< {2}>/);
    });
});
