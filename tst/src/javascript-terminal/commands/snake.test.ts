import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("snake", () => {
    it("should take over the terminal", () => {
        const shell = mockShell();

        shell.run("snake");

        expect(shell.state.getBlockingMode()).toEqual({});
    });
});
