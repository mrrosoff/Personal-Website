import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";
import { mockParameters } from "../../../__mocks__/__aws__/parameterStore";
import { mockDevice, mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";
import { mockResend } from "../../../__mocks__/resend";

import { DEVICES_TABLE, PASSKEYS_TABLE } from "../../../../api/common";
import { refreshTokenSetAtParam } from "../../../../api/endpoints/spotify/exchange";
import { handler } from "../../../../api/jobs/spotify/reauthReminder";
import { DeviceKind } from "../../../../api/types";

const setAtParam = refreshTokenSetAtParam(mockDevice.deviceId);

function connectedDaysAgo(days: number) {
    mockParameters[setAtParam] = String(Date.now() - days * 24 * 60 * 60 * 1000);
}

beforeEach(() => {
    mockDocumentClient
        .on(ScanCommand, { TableName: DEVICES_TABLE })
        .resolves({ Items: [{ ...mockDevice, kind: DeviceKind.SPOTIFY }] });
});

afterEach(() => {
    delete mockParameters[setAtParam];
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
        connectedDaysAgo(175);

        await handler();

        expect(mockResend.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({ to: mockPasskey.email })
        );
    });

    it("should email Max when nobody owns the display", async () => {
        mockDocumentClient.on(ScanCommand, { TableName: PASSKEYS_TABLE }).resolves({ Items: [] });
        connectedDaysAgo(175);

        await handler();

        expect(mockResend.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({ to: "me@maxrosoff.com" })
        );
    });

    it("should ignore polaroids", async () => {
        mockDocumentClient
            .on(ScanCommand, { TableName: DEVICES_TABLE })
            .resolves({ Items: [mockDevice] });
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
