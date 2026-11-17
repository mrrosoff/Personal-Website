import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("mv", () => {
    it("should rename a file", () => {
        const shell = mockShell();
        shell.run("mv /media/song.mp3 /media/tune.mp3");

        const result = shell.run("ls /media");

        expect(result).toBe("photo.png\ntune.mp3");
    });

    it("should say what it moved when verbose", () => {
        const shell = mockShell();

        const result = shell.run("mv -v /media/song.mp3 /media/tune.mp3");

        expect(result).toBe("'/media/song.mp3' -> '/media/tune.mp3'");
    });

    it("should refuse to move onto itself", () => {
        const shell = mockShell();

        const result = shell.run("mv /media/song.mp3 /media/song.mp3");

        expect(result).toBe("Source and destination are the same (not copied).");
    });

    it("should need a source and target", () => {
        const shell = mockShell();

        const result = shell.run("mv /media/song.mp3");

        expect(result).toBe("usage: mv [-v] source target");
    });
});
