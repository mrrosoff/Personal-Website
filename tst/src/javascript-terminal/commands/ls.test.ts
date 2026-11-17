import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("ls", () => {
    it("should list visible entries in order", () => {
        const shell = mockShell();

        const result = shell.run("ls home");

        expect(result).toBe("fruit.txt\nnumbers.txt\nother.txt\npeople.csv\nprojects");
    });

    it("should include hidden entries", () => {
        const shell = mockShell();

        const result = shell.run("ls -A home/projects");

        expect(result).toBe("site.ts");
    });

    it("should include . and ..", () => {
        const shell = mockShell();

        const result = shell.run("ls -a empty");

        expect(result).toBe(".\n..");
    });

    it("should show types and permissions", () => {
        const shell = mockShell();

        const result = shell.run("ls -l media");

        expect(result).toBe("-rwx------ photo.png\n-rwx------ song.mp3");
    });

    it("should list the working directory", () => {
        const shell = mockShell();
        shell.run("cd /home/projects");

        const result = shell.run("ls");

        expect(result).toBe("site.ts");
    });

    it("should fail on a missing directory", () => {
        const shell = mockShell();

        const result = shell.run("ls nowhere");

        expect(result).toBe("Specified Path Not In Filesystem");
    });
});
