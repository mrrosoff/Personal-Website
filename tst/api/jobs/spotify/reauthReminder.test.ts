import { beforeEach, describe, expect, it } from "vitest";

import { mockDynamoDB } from "../../../__mocks__/__aws__/dynamodb";
import { mockDeviceParameters } from "../../../__mocks__/__aws__/parameterStore";
import { mockDevice, mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";
import { mockResend } from "../../../__mocks__/resend";

import { DEVICES_TABLE, PASSKEYS_TABLE } from "../../../../api/common";
import { refreshTokenSetAtParam } from "../../../../api/endpoints/spotify/exchange";
import { handler } from "../../../../api/jobs/spotify/reauthReminder";
import { DeviceKind } from "../../../../api/types";

const setAtParam = refreshTokenSetAtParam(mockDevice.deviceId);
const spotifyDisplay = { ...mockDevice, kind: DeviceKind.SPOTIFY };

function connectedDaysAgo(days: number) {
    mockDeviceParameters.set(setAtParam, String(Date.now() - days * 24 * 60 * 60 * 1000));
}

beforeEach(() => {
    mockDynamoDB.seed(DEVICES_TABLE, spotifyDisplay);
});

describe("reauthReminder", () => {
    it("should skip a display that never connected", async () => {
        await handler();

        expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it("should stay quiet early in the token's life", async () => {
        connectedDaysAgo(30);

        await handler();

        expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it("should stay quiet once the token has already expired", async () => {
        connectedDaysAgo(200);

        await handler();

        expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it("should email the owner as expiry nears", async () => {
        mockDynamoDB.seed(DEVICES_TABLE, spotifyDisplay);
        connectedDaysAgo(175);

        await handler();

        expect(mockResend.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({ to: mockPasskey.email })
        );
    });

    it("should email Max when nobody owns the display", async () => {
        mockDynamoDB.clear(PASSKEYS_TABLE);
        connectedDaysAgo(175);

        await handler();

        expect(mockResend.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({ to: "me@maxrosoff.com" })
        );
    });

    it("should ignore polaroids", async () => {
        mockDynamoDB.seed(DEVICES_TABLE, mockDevice);
        connectedDaysAgo(175);

        await handler();

        expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it("should throw if a reminder fails to send", async () => {
        mockResend.emails.send.mockResolvedValue({ data: null, error: { message: "down" } });
        connectedDaysAgo(175);

        await expect(handler()).rejects.toThrow("Error Sending Spotify Reauth Email");
    });
});
