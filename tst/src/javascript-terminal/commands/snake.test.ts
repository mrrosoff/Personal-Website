import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("snake", () => {
    it("should take over the terminal", () => {
        const shell = mockShell();

        shell.run("snake");

        expect(shell.state.getBlockingMode()).toEqual({});
    });
});
