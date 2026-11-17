import { describe, expect, it } from "vitest";

import { mockToken } from "../../../setup";
import { mockShell } from "../../../helpers/terminal";
import { DeviceKind, UserType } from "../../../../api/types";

describe("polaroid", () => {
    it("should deny a signed out visitor", () => {
        const shell = mockShell();

        const result = shell.run("polaroid");

        expect(result).toBe("Permission Denied");
    });

    it("should deny a friend without a polaroid", async () => {
        const shell = mockShell({
            AUTH_TOKEN: await mockToken(UserType.FRIEND, { deviceKinds: [DeviceKind.SPOTIFY] })
        });

        const result = shell.run("polaroid");

        expect(result).toBe("Permission Denied");
    });

    it("should open the polaroid for a friend who has one", async () => {
        const shell = mockShell({
            AUTH_TOKEN: await mockToken(UserType.FRIEND, { deviceKinds: [DeviceKind.POLAROID] })
        });

        const result = shell.run("polaroid");

        expect(result).toBe("/polaroid");
    });
});
