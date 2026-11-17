import { describe, expect, it } from "vitest";

import * as terminal from "../../../site/javascript-terminal";

describe("javascript-terminal", () => {
    it("should export the emulator and its state", () => {
        expect(Object.keys(terminal).sort()).toEqual([
            "CommandMapping",
            "DefaultCommandMapping",
            "Emulator",
            "EmulatorState"
        ]);
    });
});
