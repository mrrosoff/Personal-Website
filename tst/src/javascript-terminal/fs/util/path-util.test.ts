import { describe, expect, it } from "vitest";

import * as PathUtil from "../../../../../src/javascript-terminal/fs/util/path-util";

describe("path-util", () => {
    it("should split an absolute path", () => {
        expect(PathUtil.toPathParts("/home/max/")).toEqual(["/", "home", "max"]);
    });

    it("should split a relative path", () => {
        expect(PathUtil.toPathParts("docs/notes.txt")).toEqual(["docs", "notes.txt"]);
    });

    it("should join parts back into a path", () => {
        expect(PathUtil.toPath(["/", "home", "max"])).toBe("/home/max");
        expect(PathUtil.toPath(["docs", "notes.txt"])).toBe("docs/notes.txt");
    });

    it("should resolve a relative path", () => {
        expect(PathUtil.toAbsolutePath("../a/./b", "/home/max")).toBe("/home/a/b");
    });

    it("should stop going up at the root", () => {
        expect(PathUtil.toAbsolutePath("../../..", "/home")).toBe("/");
    });

    it("should find the parent of a path", () => {
        expect(PathUtil.getPathParent("/home/max/file")).toBe("/home/max");
        expect(PathUtil.getPathParent("/")).toBe("/");
    });

    it("should find the last part of a path", () => {
        expect(PathUtil.getLastPathPart("/home/max/file")).toBe("file");
    });
});
