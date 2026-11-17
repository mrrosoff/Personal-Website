import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("cowsay", () => {
    it("should moo by default", () => {
        const shell = mockShell();

        const result = shell.run("cowsay");

        expect(result).toContain("< moo >");
    });

    it("should say the message", () => {
        const shell = mockShell();

        const result = shell.run("cowsay hi there");

        expect(result).toContain("< hi there >");
    });

    it("should draw the cow", () => {
        const shell = mockShell();

        const result = shell.run("cowsay");

        expect(result).toContain("(oo)");
    });
});
