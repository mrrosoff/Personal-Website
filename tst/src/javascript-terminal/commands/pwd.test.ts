import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("pwd", () => {
    it("should start at the root", () => {
        const shell = mockShell();

        const result = shell.run("pwd");

        expect(result).toBe("/");
    });
});
