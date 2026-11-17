import { describe, expect, it } from "vitest";

import * as CommandMapping from "../../../../site/javascript-terminal/emulatorState/CommandMapping";

describe("CommandMapping", () => {
    it("should know which commands exist", () => {
        const result = CommandMapping.isCommandSet(undefined, "ls");

        expect(result).toBe(true);
    });

    it("should return nothing for an unknown command", () => {
        expect(CommandMapping.getCommandFn(undefined, "nope")).toBeUndefined();
        expect(CommandMapping.getCommandOptDef(undefined, "nope")).toBeUndefined();
    });

    it("should list command names", () => {
        const result = CommandMapping.getCommandNames();

        expect(result).toContain("ls");
    });
});

describe("errorMessage", () => {
    it("should read an error's message", () =>
        expect(CommandMapping.errorMessage(new Error("bad"))).toBe("bad"));

    it("should stringify anything else", () =>
        expect(CommandMapping.errorMessage("bad")).toBe("bad"));
});
