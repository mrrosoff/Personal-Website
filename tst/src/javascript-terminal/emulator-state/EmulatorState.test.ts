import { describe, expect, it } from "vitest";

import EmulatorState, {
    relativeToAbsolutePath
} from "../../../../src/javascript-terminal/emulator-state/EmulatorState";

describe("EmulatorState", () => {
    it("should start at the root", () => {
        const result = EmulatorState.create({});

        expect(result.getEnvVariables()).toEqual({ cwd: "/" });
    });

    it("should refuse to be built directly", () => {
        const result = () => new EmulatorState(undefined as never);

        expect(result).toThrow("Do Not Use Constructor Directly. Use create Method");
    });

    it("should resolve paths against the working directory", () => {
        const state = EmulatorState.create({ environmentVariables: { cwd: "/home" } });

        const result = relativeToAbsolutePath(state, "projects");

        expect(result).toBe("/home/projects");
    });

    it("should swap in a new filesystem", () => {
        const state = EmulatorState.create({});
        const fs = { "/": { type: "d" as const, permissions: "", contents: {} } };

        state.setFileSystem(fs);

        expect(state.getFileSystem()).toBe(fs);
    });
});
