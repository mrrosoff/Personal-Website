import { describe, expect, it } from "vitest";

import { mockShell } from "../../../helpers/terminal";

describe("clear", () => {
    it("should wipe the screen", () => {
        const shell = mockShell();
        shell.run("pwd");

        shell.run("clear");

        expect(shell.state.getOutputs()).toHaveLength(0);
    });
});
