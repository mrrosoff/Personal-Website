import { describe, expect, it } from "vitest";

import { mockEvent, mockToken } from "../setup";
import { mockDevice } from "../__mocks__/__data__/aws/dynamodb";

import { authorize, isAdmin } from "../../api/permissions";
import { DeviceKind, UserType } from "../../api/types";

describe("isAdmin", () => {
    it("should recognize the admin", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await isAdmin(mockEvent({ token }));

        expect(result).toBe(true);
    });

    it("should reject a friend", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await isAdmin(mockEvent({ token }));

        expect(result).toBe(false);
    });
});

describe("authorize", () => {
    it("should pass along an invalid token error", async () => {
        const result = await authorize(mockEvent({ token: "junk" }), UserType.FRIEND);

        expect(result).toEqual({ error: "Invalid Authentication Token" });
    });

    it("should let the admin in anywhere", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await authorize(mockEvent({ token }), UserType.FRIEND);

        expect(result.token?.userType).toBe(UserType.ADMIN);
    });

    it("should keep out the wrong kind of user", async () => {
        const token = await mockToken(UserType.SUBSCRIBER);

        const result = await authorize(mockEvent({ token }), UserType.FRIEND);

        expect(result).toEqual({});
    });

    it("should find the friend's device", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await authorize(mockEvent({ token }), UserType.FRIEND, DeviceKind.POLAROID);

        expect(result.device).toEqual(mockDevice);
    });

    it("should find nothing when the friend has no device of that kind", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await authorize(mockEvent({ token }), UserType.FRIEND, DeviceKind.SPOTIFY);

        expect(result.device).toBeUndefined();
    });

    it("should not give an invite the friend's device", async () => {
        const token = await mockToken(UserType.SHARE);

        const result = await authorize(mockEvent({ token }), UserType.SHARE, DeviceKind.POLAROID);

        expect(result.device).toBeUndefined();
    });
});
