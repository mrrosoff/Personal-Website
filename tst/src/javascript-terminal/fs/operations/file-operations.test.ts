import { describe, expect, it } from "vitest";

import { mockFile, mockFileSystem } from "../../../../__mocks__/__data__/fileSystem";

import * as FileOp from "../../../../../src/javascript-terminal/fs/operations/file-operations";

describe("file-operations", () => {
    it("should read a file", () => {
        const result = FileOp.read(mockFileSystem(), "/home/numbers.txt");

        expect(result).toBe("10\n2\n33");
    });

    it("should refuse to read a directory", () => {
        const result = () => FileOp.read(mockFileSystem(), "/home");

        expect(result).toThrow("Not A File At Specified Path: /home");
    });

    it("should write a file", () => {
        const fs = mockFileSystem();

        FileOp.write(fs, "/empty/new.txt", mockFile("new"));

        expect(FileOp.read(fs, "/empty/new.txt")).toBe("new");
    });

    it("should copy a file", () => {
        const fs = mockFileSystem();

        FileOp.copy(fs, "/home/numbers.txt", "/home/copy.txt");

        expect(FileOp.read(fs, "/home/copy.txt")).toBe("10\n2\n33");
    });

    it("should rename a file", () => {
        const fs = mockFileSystem();

        FileOp.rename(fs, "/home/numbers.txt", "/home/renamed.txt");

        expect(() => FileOp.read(fs, "/home/numbers.txt")).toThrow();
    });

    it("should refuse to copy or remove a directory", () => {
        expect(() => {
            FileOp.copy(mockFileSystem(), "/home/projects", "/x");
        }).toThrow();
        expect(() => {
            FileOp.remove(mockFileSystem(), "/home/projects");
        }).toThrow();
    });
});
