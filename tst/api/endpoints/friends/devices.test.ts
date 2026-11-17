import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDevice } from "../../../mocks/aws/dynamodb";

import { handler } from "../../../../api/endpoints/friends/devices";
import { DeviceKind, UserType } from "../../../../api/types";

describe("devices", () => {
    it("should need an invite", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result).message).toBe("Invalid Invite Token");
    });

    it("should list the kinds of device on the invite", async () => {
        const token = await mockToken(UserType.SHARE, { deviceIds: [mockDevice.deviceId] });

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result)).toEqual({ deviceKinds: [DeviceKind.POLAROID] });
    });

    it("should list nothing for the admin", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result)).toEqual({ deviceKinds: [] });
    });
});
