import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("play", () => {
    it("should render a player", () => {
        const shell = mockShell();

        const [result] = shell.results("play /media/song.mp3");

        expect(result.type).toBe("react");
    });

    it("should refuse a file that is not audio", () => {
        const shell = mockShell();

        const result = shell.run("play /media/photo.png");

        expect(result).toBe("No Supported Audio Files Found");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("play");

        expect(result).toBe("usage: play [file ...]");
    });

    it("should fail on a missing file", () => {
        const shell = mockShell();

        const result = shell.run("play /media/missing.mp3");

        expect(result).toBe("Not A File At Specified Path: /media/missing.mp3");
    });
});
