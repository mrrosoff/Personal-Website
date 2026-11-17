import { describe, expect, it } from "vitest";

import { mockFileSystem } from "../../../__mocks__/__data__/fileSystem";

import commands from "../../../../src/javascript-terminal/commands";
import {
    suggestCommandOptions,
    suggestCommands,
    suggestFileSystemNames
} from "../../../../src/javascript-terminal/emulator/auto-complete";

describe("suggestCommands", () => {
    it("should suggest commands with the prefix", () => {
        const result = suggestCommands(commands, "ca");

        expect(result).toEqual(["cat"]);
    });
});

describe("suggestCommandOptions", () => {
    it("should suggest options for a command", () => {
        const result = suggestCommandOptions(commands, "ls", "--a");

        expect(result).toEqual(["--all", "--almost-all"]);
    });

    it("should suggest nothing for an unknown command", () => {
        const result = suggestCommandOptions(commands, "nope", "-");

        expect(result).toHaveLength(0);
    });
});

describe("suggestFileSystemNames", () => {
    it("should suggest names with the prefix", () => {
        const result = suggestFileSystemNames(mockFileSystem(), "/home", "n");

        expect(result).toEqual(["numbers.txt"]);
    });

    it("should suggest everything inside a directory", () => {
        const result = suggestFileSystemNames(mockFileSystem(), "/", "media/");

        expect(result).toEqual(["media/song.mp3", "media/photo.png"]);
    });

    it("should suggest nothing for a command without options", () => {
        const result = suggestCommandOptions(
            { bare: { functionDef: () => ({}) } } as never,
            "bare",
            "-"
        );

        expect(result).toHaveLength(0);
    });
});
