import { describe, expect, it } from "vitest";

import haunt from "../../../../src/javascript-terminal/commands/haunt";
import EmulatorState from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("haunt", () => {
    it("should wish a happy halloween", () => {
        const result = haunt.functionDef(EmulatorState.create({}), []);

        expect(result.output).toMatch(/^👻 HAPPY HALLOWEEN! 👻/);
    });
});
