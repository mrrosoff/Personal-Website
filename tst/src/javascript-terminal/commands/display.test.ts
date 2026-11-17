import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

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
});
