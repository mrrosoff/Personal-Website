import { describe, expect, it } from "vitest";

import CommandMapping, {
    errorMessage
} from "../../../../src/javascript-terminal/emulator-state/CommandMapping";

describe("CommandMapping", () => {
    it("should reject a command without a definition", () => {
        const result = () => CommandMapping.create({ broken: {} as never });

        expect(result).toThrow("Failed To Initialize Terminal: Invalid Command (broken)");
    });

    it("should know which commands exist", () => {
        const result = CommandMapping.isCommandSet(undefined, "ls");

        expect(result).toBeTrue();
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
    it("should read an error's message", () => {
        expect(errorMessage(new Error("bad"))).toBe("bad");
    });

    it("should stringify anything else", () => {
        expect(errorMessage("bad")).toBe("bad");
    });

    it("should reject a command without options", () => {
        const result = () =>
            CommandMapping.create({ broken: { functionDef: () => ({}) } as never });

        expect(result).toThrow("Failed To Initialize Terminal: Invalid Command (broken)");
    });

    it("should accept every built in command", () => {
        expect(CommandMapping.create()).toHaveProperty("ls");
    });
});
