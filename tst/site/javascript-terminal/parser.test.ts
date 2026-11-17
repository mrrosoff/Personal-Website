import { describe, expect, it } from "vitest";

import { parseCommands, parseOptions } from "../../../site/javascript-terminal/parser";

describe("parseCommands", () => {
    it("should split a command into its name and options", () => {
        const result = parseCommands("ls -la /home");

        expect(result).toEqual([{ commandName: "ls", commandOptions: ["-la", "/home"] }]);
    });

    it("should collapse extra whitespace", () => {
        const result = parseCommands("   echo    hi   there  ");

        expect(result).toEqual([{ commandName: "echo", commandOptions: ["hi", "there"] }]);
    });

    it("should split chained commands", () => {
        const result = parseCommands("cd /home && ls; pwd");

        expect(result.map(({ commandName }) => commandName)).toEqual(["cd", "ls", "pwd"]);
    });
});

describe("parseOptions", () => {
    it("should separate flags from arguments", () => {
        const result = parseOptions(["-n", "5", "file.txt"], { "-n, --lines": "<count>" });

        expect(result).toMatchObject({ options: { lines: "5" }, argv: ["file.txt"] });
    });
});
