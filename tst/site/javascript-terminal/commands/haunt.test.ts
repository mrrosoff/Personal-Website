import { describe, expect, it } from "vitest";

import haunt from "../../../../site/javascript-terminal/commands/haunt";
import EmulatorState from "../../../../site/javascript-terminal/emulatorState/EmulatorState";

describe("haunt", () => {
    it("should wish a happy halloween", () => {
        const result = haunt.functionDef(EmulatorState.create({}), []);

        expect(result.output).toMatch(/^👻 HAPPY HALLOWEEN! 👻/);
    });
});
