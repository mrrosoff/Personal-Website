import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockEvent } from "../../setup";
import { mockDocumentClient } from "../../__mocks__/__aws__/dynamodb";
import { mockDevice, mockDeviceToken, mockPasskey } from "../../__mocks__/__data__/aws/dynamodb";

import { DEVICES_TABLE, PASSKEYS_TABLE } from "../../../api/common";
import { deviceForOwner, devicesForIds, resolveDevice } from "../../../api/endpoints/devices";
import { DeviceKind } from "../../../api/types";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

describe("resolveDevice", () => {
    it("should resolve a device from its token", async () => {
        const result = await resolveDevice(
            mockEvent({ token: mockDeviceToken }),
            DeviceKind.POLAROID
        );

        expect(result).toEqual(mockDevice);
    });

    it("should skip the lookup for a token that is not a device token", async () => {
        await resolveDevice(mockEvent({ token: "a.b.c" }), DeviceKind.POLAROID);

        expect(mockDocumentClient).not.toHaveReceivedCommand(GetCommand);
    });

    it("should reject the wrong secret", async () => {
        const token = `${mockDevice.deviceId}.wrong`;

        const result = await resolveDevice(mockEvent({ token }), DeviceKind.POLAROID);

        expect(result).toBeUndefined();
    });

    it("should reject an unknown device", async () => {
        mockDocumentClient.on(GetCommand, { TableName: DEVICES_TABLE }).resolves({});

        const result = await resolveDevice(
            mockEvent({ token: mockDeviceToken }),
            DeviceKind.POLAROID
        );

        expect(result).toBeUndefined();
    });

    it("should reject the wrong kind of device", async () => {
        const result = await resolveDevice(
            mockEvent({ token: mockDeviceToken }),
            DeviceKind.SPOTIFY
        );

        expect(result).toBeUndefined();
    });

    it("should record when the device was last seen", async () => {
        await resolveDevice(mockEvent({ token: mockDeviceToken }), DeviceKind.POLAROID);

        expect(mockDocumentClient).toHaveReceivedCommandWith(UpdateCommand, {
            TableName: DEVICES_TABLE,
            Key: { deviceId: mockDevice.deviceId }
        });
    });

    it("should not record a device seen moments ago", async () => {
        mockDocumentClient
            .on(GetCommand, { TableName: DEVICES_TABLE })
            .resolves({ Item: { ...mockDevice, lastSeenAt: Math.floor(Date.now() / 1000) } });

        await resolveDevice(mockEvent({ token: mockDeviceToken }), DeviceKind.POLAROID);

        expect(mockDocumentClient).not.toHaveReceivedCommand(UpdateCommand);
    });

    it("should still resolve when recording last seen fails", async () => {
        mockDocumentClient.on(UpdateCommand).rejects(new Error("throttled"));

        const result = await resolveDevice(
            mockEvent({ token: mockDeviceToken }),
            DeviceKind.POLAROID
        );

        expect(result).toEqual(mockDevice);
    });
});

describe("devicesForIds", () => {
    it("should return nothing for no ids", async () => {
        const result = await devicesForIds();

        expect(result).toBeEmpty();
    });

    it("should look up each device", async () => {
        const result = await devicesForIds([mockDevice.deviceId]);

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
        expect(mockDocumentClient).toHaveReceivedCommandWith(QueryCommand, {
            TableName: PASSKEYS_TABLE,
            IndexName: "email"
        });
    });
});
