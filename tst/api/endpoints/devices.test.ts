import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockEvent } from "../../setup";
import { mockDocumentClient, mockDynamoDB } from "../../mocks/aws/dynamodb";
import { mockDevice, mockDeviceToken, mockPasskey } from "../../fixtures/aws/dynamodb";

import { DEVICES_TABLE } from "../../../api/common";
import { deviceForOwner, devicesForIds, resolveDevice } from "../../../api/endpoints/devices";
import { DeviceKind } from "../../../api/types";

function resolve(token = mockDeviceToken, kind = DeviceKind.POLAROID) {
    return resolveDevice(mockEvent({ token }), kind);
}

describe("resolveDevice", () => {
    it("should resolve a device from its token", async () => {
        const result = await resolve();

        expect(result).toMatchObject({ deviceId: mockDevice.deviceId });
    });

    it("should need a token", async () => {
        const result = await resolveDevice(mockEvent(), DeviceKind.POLAROID);

        expect(result).toBeUndefined();
    });

    it("should not treat a sign in token as a device token", async () => {
        const result = await resolve("a.b.c");

        expect(result).toBeUndefined();
    });

    it("should reject the wrong secret", async () => {
        const result = await resolve(`${mockDevice.deviceId}.wrong`);

        expect(result).toBeUndefined();
    });

    it("should reject an unknown device", async () => {
        mockDynamoDB.clear(DEVICES_TABLE);

        const result = await resolve();

        expect(result).toBeUndefined();
    });

    it("should reject the wrong kind of device", async () => {
        const result = await resolve(mockDeviceToken, DeviceKind.SPOTIFY);

        expect(result).toBeUndefined();
    });

    it("should record when the device was last seen", async () => {
        await resolve();

        expect(mockDynamoDB.get(DEVICES_TABLE, mockDevice.deviceId)?.lastSeenAt).toBeGreaterThan(0);
    });

    it("should record a device that has never been seen", async () => {
        mockDynamoDB.seed(DEVICES_TABLE, { ...mockDevice, lastSeenAt: undefined });

        await resolve();

        expect(mockDynamoDB.get(DEVICES_TABLE, mockDevice.deviceId)?.lastSeenAt).toBeDefined();
    });

    it("should not record a device seen moments ago", async () => {
        const lastSeenAt = Math.floor(Date.now() / 1000) - 1;
        mockDynamoDB.seed(DEVICES_TABLE, { ...mockDevice, lastSeenAt });

        await resolve();

        expect(mockDynamoDB.get(DEVICES_TABLE, mockDevice.deviceId)?.lastSeenAt).toBe(lastSeenAt);
    });

    it("should still resolve when recording last seen fails", async () => {
        mockDocumentClient.on(UpdateCommand).rejects(new Error("throttled"));

        const result = await resolve();

        expect(result).toEqual(mockDevice);
    });
});

describe("devicesForIds", () => {
    it("should return nothing for no ids", async () => {
        const result = await devicesForIds();

        expect(result).toHaveLength(0);
    });

    it("should look up each device and skip missing ones", async () => {
        const result = await devicesForIds([mockDevice.deviceId, "missing"]);

        expect(result).toEqual([mockDevice]);
    });
});

describe("deviceForOwner", () => {
    it("should return nothing without an email", async () => {
        const result = await deviceForOwner(undefined, DeviceKind.POLAROID);

        expect(result).toBeUndefined();
    });

    it("should find the owner's device of that kind", async () => {
        const result = await deviceForOwner(mockPasskey.email, DeviceKind.POLAROID);

        expect(result).toEqual(mockDevice);
    });
});
