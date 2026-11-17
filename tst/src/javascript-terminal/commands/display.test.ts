import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("display", () => {
    it("should render an image", () => {
        const shell = mockShell();

        const [result] = shell.results("display /media/photo.png");

        expect(result.type).toBe("react");
    });

    it("should need a file", () => {
        const shell = mockShell();

        const result = shell.run("display");

        expect(result).toBe("usage: display [file ...]");
    });

    it("should render a video", () => {
        const shell = mockShell();
        shell.run("tee https://example.com/clip /media/clip.mp4");

        const [result] = shell.results("display /media/clip.mp4");

        expect(result.type).toBe("react");
    });

    it("should fail on a missing image", () => {
        const shell = mockShell();

        const result = shell.run("display /media/missing.png");

        expect(result).toBe("Not A File At Specified Path: /media/missing.png");
    });
});
