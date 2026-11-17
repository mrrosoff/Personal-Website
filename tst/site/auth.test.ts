import { describe, expect, it } from "vitest";

import { mockToken } from "../setup";

import { decodeToken, ownsDeviceKind, unexpiredToken } from "../../site/auth";
import { DeviceKind, UserType } from "../../api/types";

describe("decodeToken", () => {
    it("should decode a token", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = decodeToken(token);

        expect(result?.userType).toBe(UserType.FRIEND);
    });

    it("should return null for junk", () => {
        expect(decodeToken("junk")).toBeNull();
    });
});

describe("ownsDeviceKind", () => {
    it("should let the admin use every device", async () => {
        const payload = decodeToken(await mockToken(UserType.ADMIN));

        expect(ownsDeviceKind(payload, DeviceKind.SPOTIFY)).toBe(true);
    });

    it("should let a friend use only their devices", async () => {
        const payload = decodeToken(
            await mockToken(UserType.FRIEND, { deviceKinds: [DeviceKind.POLAROID] })
        );

        expect(ownsDeviceKind(payload, DeviceKind.POLAROID)).toBe(true);
        expect(ownsDeviceKind(payload, DeviceKind.SPOTIFY)).toBe(false);
    });
});

describe("unexpiredToken", () => {
    it("should keep a live token", async () => {
        const token = await mockToken(UserType.FRIEND);

        expect(unexpiredToken(token)).toBe(token);
    });

    it("should drop an expired token", async () => {
        const token = await mockToken(UserType.FRIEND, { expiresIn: -10 });

        expect(unexpiredToken(token)).toBeNull();
    });

    it("should drop a missing or junk token", () => {
        expect(unexpiredToken(null)).toBeNull();
        expect(unexpiredToken("junk")).toBeNull();
    });
});
