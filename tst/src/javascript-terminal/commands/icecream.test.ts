import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("icecream", () => {
    it("should navigate to the shop", () => {
        const shell = mockShell();

        const [result] = shell.results("icecream");

        expect(result).toEqual({ output: "/ice-cream", type: "navigate", oldCwdPath: undefined });
    });
});
