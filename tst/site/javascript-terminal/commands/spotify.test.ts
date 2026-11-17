import { describe, expect, it, vi } from "vitest";

import { mockToken } from "../../../setup";
import { mockShell } from "../../../helpers/terminal";
import { DeviceKind, UserType } from "../../../../api/types";
import { axiosPost } from "../../../mocks/axios";

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

    it("should open the authorize page spotify returns", async () => {
        axiosPost.mockResolvedValue({
            data: { authorizeUrl: "https://accounts.spotify.com/authorize" }
        });
        const assign = vi.fn();
        vi.stubGlobal("location", { assign });
        const shell = mockShell({
            AUTH_TOKEN: await mockToken(UserType.FRIEND, { deviceKinds: [DeviceKind.SPOTIFY] })
        });

        shell.run("spotify reconnect");

        await vi.waitFor(() =>
            expect(assign).toHaveBeenCalledWith("https://accounts.spotify.com/authorize")
        );
    });

    it("should log when spotify cannot be reached", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const shell = mockShell({
            AUTH_TOKEN: await mockToken(UserType.FRIEND, { deviceKinds: [DeviceKind.SPOTIFY] })
        });

        shell.run("spotify reconnect");

        await vi.waitFor(() =>
            expect(error).toHaveBeenCalledWith("Spotify Authentication Failed:", expect.any(Error))
        );
    });
});
