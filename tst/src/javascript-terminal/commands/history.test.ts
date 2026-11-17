import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("history", () => {
    it("should list past commands", () => {
        const shell = mockShell();
        shell.run("pwd");

        const result = shell.run("history");

        expect(result).toBe("pwd\nhistory");
    });
});
