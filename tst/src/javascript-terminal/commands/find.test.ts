import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

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
});
