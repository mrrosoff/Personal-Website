import { describe, expect, it } from "vitest";

import { mockShell, mockToken } from "../../../setup";
import { DeviceKind, UserType } from "../../../../api/types";

describe("spotify", () => {
    it("should show help without reconnect", () => {
        const shell = mockShell();

        const result = shell.run("spotify");

        expect(result).toContain("spotify");
    });

    it("should deny a signed out visitor", () => {
        const shell = mockShell();

        const result = shell.run("spotify reconnect");

        expect(result).toBe("Permission Denied");
    });

    it("should deny a friend without a display", async () => {
        const shell = mockShell({
            AUTH_TOKEN: await mockToken(UserType.FRIEND, { deviceKinds: [DeviceKind.POLAROID] })
        });

        const result = shell.run("spotify reconnect");

        expect(result).toBe("Permission Denied");
    });

    it("should open spotify for a friend with a display", async () => {
        const shell = mockShell({
            AUTH_TOKEN: await mockToken(UserType.FRIEND, { deviceKinds: [DeviceKind.SPOTIFY] })
        });

        const result = shell.run("spotify reconnect");

        expect(result).toBe("Opening Spotify Authorization Page...");
    });
});
