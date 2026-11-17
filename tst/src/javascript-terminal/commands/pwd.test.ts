import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("pwd", () => {
    it("should start at the root", () => {
        const shell = mockShell();

        const result = shell.run("pwd");

        expect(result).toBe("/");
    });
});
