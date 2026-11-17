import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDynamoDB } from "../../../mocks/aws/dynamodb";
import { mockDevice, mockPasskey } from "../../../fixtures/aws/dynamodb";

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
        mockDynamoDB.clear(PASSKEYS_TABLE);
        mockDynamoDB.seed(
            PASSKEYS_TABLE,
            ...["Cy", "Ada", "Bo"].map((name) => ({ ...mockPasskey, credentialId: name, name }))
        );
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).devices).toMatchObject([{ name: "Ada, Bo & Cy's Polaroid" }]);
    });

    it("should list devices by name", async () => {
        mockDynamoDB.seed(DEVICES_TABLE, {
            ...mockDevice,
            deviceId: "spotify",
            kind: DeviceKind.SPOTIFY
        });
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).devices).toMatchObject([
            { name: `${mockPasskey.name}'s Polaroid` },
            { name: "Unclaimed Spotify Display" }
        ]);
    });

    it("should mark a device nobody has claimed", async () => {
        mockDynamoDB.clear(PASSKEYS_TABLE);
        mockDynamoDB.seed(DEVICES_TABLE, { ...mockDevice, kind: DeviceKind.SPOTIFY });
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).devices).toMatchObject([{ name: "Unclaimed Spotify Display" }]);
    });
});
