import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("find", () => {
    it("should list everything below a path", () => {
        const shell = mockShell();

        const result = shell.run("find /home/projects");

        expect(result).toBe("/home/projects/site.ts");
    });

    it("should filter by name", () => {
        const shell = mockShell();

        const result = shell.run("find / -name *.ts");

        expect(result).toBe("/home/projects/site.ts");
    });

    it("should accept a double dash name", () => {
        const shell = mockShell();

        const result = shell.run("find / --name *.mp3");

        expect(result).toBe("/media/song.mp3");
    });

    it("should search the working directory by default", () => {
        const shell = mockShell();
        shell.run("cd /home/projects");

        const result = shell.run("find");

        expect(result).toBe("/home/projects/site.ts");
    });

    it("should find nothing below a file", () => {
        const shell = mockShell();

        const result = shell.run("find /home/fruit.txt");

        expect(result).toBe("");
    });
});
