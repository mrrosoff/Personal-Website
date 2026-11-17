import { describe, expect, it } from "vitest";

import { mockFile, mockFileSystem } from "../../../../__mocks__/__data__/fileSystem";

import {
    add,
    fsSearch,
    fsSearchParent,
    remove
} from "../../../../../site/javascript-terminal/fs/operations/base-operations";

describe("base-operations", () => {
    it("should find a directory", () => {
        const result = fsSearch(mockFileSystem(), "/home/projects");

        expect(Object.keys(result)).toEqual(["site.ts"]);
    });

    it("should fail on a missing path", () => {
        const result = () => fsSearch(mockFileSystem(), "/nowhere");

        expect(result).toThrow("Specified Path Not In Filesystem");
    });

    it("should refuse to descend into a file", () => {
        const result = () => fsSearch(mockFileSystem(), "/home/fruit.txt");

        expect(result).toThrow("Cannot Descend Into File");
    });

    it("should find the parent of a path", () => {
        const result = fsSearchParent(mockFileSystem(), "/home/projects/site.ts");

        expect(Object.keys(result)).toEqual(["site.ts"]);
    });

    it("should add and remove an entry", () => {
        const fs = mockFileSystem();

        add(fs, "/empty/new.txt", mockFile("new"));
        remove(fs, "/home/fruit.txt");

        expect(Object.keys(fsSearch(fs, "/empty"))).toEqual(["new.txt"]);
        expect(Object.keys(fsSearch(fs, "/home"))).not.toContain("fruit.txt");
    });

    it("should stop at the deepest folder that exists", () => {
        const result = fsSearchParent(mockFileSystem(), "/home/missing/deeper/file");

        expect(Object.keys(result)).toContain("fruit.txt");
    });
});
