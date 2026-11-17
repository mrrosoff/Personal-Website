import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("rm", () => {
    it("should remove a file", () => {
        const shell = mockShell();
        shell.run("rm /media/song.mp3");

        const result = shell.run("ls /media");

        expect(result).toBe("photo.png");
    });

    it("should say what it removed when verbose", () => {
        const shell = mockShell();

        const result = shell.run("rm -v /media/song.mp3");

        expect(result).toBe("removed '/media/song.mp3'");
    });

    it("should refuse a directory without -r", () => {
        const shell = mockShell();

        const result = shell.run("rm /home/projects");

        expect(result).toBe("Not A File At Specified Path: /home/projects");
    });

    it("should remove a directory with -r", () => {
        const shell = mockShell();
        shell.run("rm -r /home/projects");

        const result = shell.run("ls /home");

        expect(result).toBe("fruit.txt\nnumbers.txt\nother.txt\npeople.csv");
    });

    it("should protect the root", () => {
        const shell = mockShell();
        shell.run("rm -r /");

        const result = shell.run("ls /");

        expect(result).toBe("empty\nhome\nmedia");
    });
});
