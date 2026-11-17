import { describe, expect, it } from "vitest";

import FileUtil from "../../../../../src/javascript-terminal/fs/util/file-util";

describe("file-util", () => {
    it("should make an empty file", () => {
        const result = FileUtil.makeEmptyFile();

        expect(FileUtil.isFile(result)).toBeTrue();
    });

    it("should make an empty directory", () => {
        const result = FileUtil.makeEmptyDirectory();

        expect(FileUtil.isDirectory(result)).toBeTrue();
    });

    it("should recognize a symbolic link", () => {
        const result = FileUtil.isSymbolicLink({ type: "l", permissions: "", contents: "" });

        expect(result).toBeTrue();
    });
});
