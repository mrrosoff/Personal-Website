import { beforeEach, describe, expect, it } from "vitest";

import { mockDynamoDB } from "../../../mocks/aws/dynamodb";
import { mockParameterStore } from "../../../mocks/aws/parameterStore";
import { mockDevice, mockPasskey } from "../../../fixtures/aws/dynamodb";
import { mockInbox, mockResend } from "../../../mocks/resend";

import { DEVICES_TABLE, PASSKEYS_TABLE } from "../../../../api/common";
import { refreshTokenSetAtParam } from "../../../../api/endpoints/spotify/exchange";
import { handler } from "../../../../api/jobs/spotify/reauthReminder";
import { DeviceKind } from "../../../../api/types";

const setAtParam = refreshTokenSetAtParam(mockDevice.deviceId);
const spotifyDisplay = { ...mockDevice, kind: DeviceKind.SPOTIFY };

function connectedDaysAgo(days: number) {
    mockParameterStore.set(setAtParam, String(Date.now() - days * 24 * 60 * 60 * 1000));
}

beforeEach(() => {
    mockDynamoDB.seed(DEVICES_TABLE, spotifyDisplay);
});

describe("reauthReminder", () => {
    it("should skip a display that never connected", async () => {
        await handler();

        expect(mockInbox).toHaveLength(0);
    });

    it("should stay quiet early in the token's life", async () => {
        connectedDaysAgo(30);

        await handler();

        expect(mockInbox).toHaveLength(0);
    });

    it("should stay quiet once the token has already expired", async () => {
        connectedDaysAgo(200);

        await handler();

        expect(mockInbox).toHaveLength(0);
    });

    it("should email the owner as expiry nears", async () => {
        mockDynamoDB.seed(DEVICES_TABLE, spotifyDisplay);
        connectedDaysAgo(175);

        await handler();

        expect(mockInbox).toContainEqual(expect.objectContaining({ to: mockPasskey.email }));
    });

    it("should email Max when nobody owns the display", async () => {
        mockDynamoDB.clear(PASSKEYS_TABLE);
        connectedDaysAgo(175);

        await handler();

        expect(mockInbox).toContainEqual(expect.objectContaining({ to: "me@maxrosoff.com" }));
    });

    it("should ignore polaroids", async () => {
        mockDynamoDB.seed(DEVICES_TABLE, mockDevice);
        connectedDaysAgo(175);

        await handler();

        expect(mockInbox).toHaveLength(0);
    });

    it("should throw if a reminder fails to send", async () => {
        mockResend.emails.send.mockResolvedValue({ data: null, error: { message: "down" } });
        connectedDaysAgo(175);

        await expect(handler()).rejects.toThrow("Error Sending Spotify Reauth Email");
    });
});
