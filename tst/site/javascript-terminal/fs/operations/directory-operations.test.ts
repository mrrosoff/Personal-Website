import { describe, expect, it } from "vitest";

import { mockDirectory, mockFileSystem } from "../../../../__mocks__/__data__/fileSystem";

import * as DirOp from "../../../../../site/javascript-terminal/fs/operations/directory-operations";

describe("directory-operations", () => {
    it("should list a directory", () => {
        const result = DirOp.list(mockFileSystem(), "/media");

        expect(result).toEqual(["song.mp3", "photo.png"]);
    });

    it("should add a directory", () => {
        const fs = mockFileSystem();

        DirOp.add(fs, "/empty/new", mockDirectory());

        expect(DirOp.list(fs, "/empty")).toEqual(["new"]);
    });

    it("should copy a directory", () => {
        const fs = mockFileSystem();

        DirOp.copy(fs, "/home/projects", "/home/backup");

        expect(DirOp.list(fs, "/home/backup")).toEqual(["site.ts"]);
    });

    it("should rename a directory", () => {
        const fs = mockFileSystem();

        DirOp.rename(fs, "/home/projects", "/home/work");

        expect(DirOp.list(fs, "/home")).toContain("work");
        expect(DirOp.list(fs, "/home")).not.toContain("projects");
    });

    it("should remove a directory", () => {
        const fs = mockFileSystem();

        DirOp.remove(fs, "/empty");

        expect(DirOp.list(fs, "/")).toEqual(["home", "media"]);
    });
});
