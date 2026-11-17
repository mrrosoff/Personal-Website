import { describe, expect, it } from "vitest";

import EmulatorState, {
    AdminConsoleScreen,
    relativeToAbsolutePath
} from "../../../../site/javascript-terminal/emulatorState/EmulatorState";

describe("EmulatorState", () => {
    it("should start at the root", () => {
        const result = EmulatorState.create({});

        expect(result.getEnvVariables()).toEqual({ cwd: "/" });
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

    it("should leave a closed admin console closed when updating it", () => {
        const state = EmulatorState.create({});

        state.updateAdminConsoleMode({ loading: true });

        expect(state.getAdminConsoleMode()).toBeUndefined();
    });

    it("should refuse the admin console mode for a screen it is not on", () => {
        const state = EmulatorState.create({});
        state.setAdminConsoleMode({ screen: AdminConsoleScreen.Main });

        const result = () => state.getAdminConsoleModeOn(AdminConsoleScreen.SelectFlavor);

        expect(result).toThrow("Admin Console Is Not On The select-flavor Screen");
    });
});
