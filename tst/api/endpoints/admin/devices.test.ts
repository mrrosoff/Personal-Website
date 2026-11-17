import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";
import { mockDevice, mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";

import { DEVICES_TABLE, PASSKEYS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/admin/devices";
import { DeviceKind, UserType } from "../../../../api/types";

describe("devices", () => {
    it("should be admin only", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(401);
    });

    it("should name a device after its owner", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).devices).toEqual([
            {
                deviceId: mockDevice.deviceId,
                kind: DeviceKind.POLAROID,
                name: `${mockPasskey.name}'s Polaroid`
            }
        ]);
    });

    it("should list shared owners together", async () => {
        mockDocumentClient.on(ScanCommand, { TableName: PASSKEYS_TABLE }).resolves({
            Items: [
                { ...mockPasskey, name: "Cy" },
                { ...mockPasskey, name: "Ada" },
                { ...mockPasskey, name: "Bo" }
            ]
        });
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).devices).toMatchObject([{ name: "Ada, Bo & Cy's Polaroid" }]);
    });

    it("should mark a device nobody has claimed", async () => {
        mockDocumentClient
            .on(ScanCommand, { TableName: DEVICES_TABLE })
            .resolves({ Items: [{ ...mockDevice, deviceId: "x", kind: DeviceKind.SPOTIFY }] });
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).devices).toMatchObject([{ name: "Unclaimed Spotify Display" }]);
    });
});
