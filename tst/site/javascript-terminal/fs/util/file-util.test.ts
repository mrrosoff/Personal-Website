import { describe, expect, it } from "vitest";

import {
    isDirectory,
    makeEmptyDirectory,
    makeEmptyFile
} from "../../../../../site/javascript-terminal/fs/util/file-util";

describe("file-util", () => {
    it("should make an empty file", () =>
        expect(makeEmptyFile()).toEqual({ type: "-", permissions: "rwx------", contents: "" }));

    it("should make an empty directory", () => {
        expect(isDirectory(makeEmptyDirectory())).toBe(true);
        expect(isDirectory(makeEmptyFile())).toBe(false);
    });
});
