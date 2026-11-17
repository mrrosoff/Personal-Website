import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockEvent, mockToken } from "../setup";
import { mockDocumentClient } from "../__mocks__/__aws__/dynamodb";
import { mockDevice } from "../__mocks__/__data__/aws/dynamodb";

import { DEVICES_TABLE } from "../../api/common";
import { authorize, isAdmin } from "../../api/permissions";
import { DeviceKind, UserType } from "../../api/types";

describe("isAdmin", () => {
    it("should recognize the admin", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await isAdmin(mockEvent({ token }));

        expect(result).toBeTrue();
    });

    it("should reject a friend", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await isAdmin(mockEvent({ token }));

        expect(result).toBeFalse();
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

        expect(result).toBeEmptyObject();
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

    it("should not look up devices for an invite", async () => {
        const token = await mockToken(UserType.SHARE);

        await authorize(mockEvent({ token }), UserType.SHARE, DeviceKind.POLAROID);

        expect(mockDocumentClient).not.toHaveReceivedCommandWith(GetCommand, {
            TableName: DEVICES_TABLE
        });
    });
});
