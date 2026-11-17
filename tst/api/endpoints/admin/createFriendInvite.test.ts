import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDevice, mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";
import { mockResend } from "../../../__mocks__/resend";

import { decryptToken } from "../../../../api/auth";
import { handler } from "../../../../api/endpoints/admin/createFriendInvite";
import { UserType } from "../../../../api/types";

describe("createFriendInvite", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should be admin only", async () => {
        const result = await handler(mockEvent({ body: { friendName: "Zed" } }));

        expect(result.statusCode).toBe(401);
    });

    it("should need a name", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token, body: { friendName: "   " } }));

        expect(responseBody(result).message).toBe("Missing Friend Name");
    });

    it("should refuse a name a friend already has", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(
            mockEvent({ token, body: { friendName: mockPasskey.name.toLowerCase() } })
        );

        expect(responseBody(result).message).toBe(
            `${mockPasskey.name} Is Already Registered. Add A Last Name To Tell Them Apart`
        );
    });

    it("should make an invite for the chosen devices", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(
            mockEvent({
                token,
                body: { friendName: "  Zed   Q  ", deviceIds: [mockDevice.deviceId] }
            })
        );

        const invite = await decryptToken(responseBody(result).token);
        expect(invite).toMatchObject({
            id: "Zed Q",
            userType: UserType.SHARE,
            deviceIds: [mockDevice.deviceId]
        });
        expect(responseBody(result).url).toStartWith(
            "https://maxrosoff.com/register-friend?token="
        );
    });

    it("should email the invite when given an address", async () => {
        const token = await mockToken(UserType.ADMIN);

        await handler(
            mockEvent({
                token,
                body: { friendName: "Zed", email: "zed@example.com", expiresInHours: 48 }
            })
        );

        expect(mockResend.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({ to: "zed@example.com", subject: "You're Invited, Zed" })
        );
    });

    it("should throw if the invite email fails", async () => {
        mockResend.emails.send.mockResolvedValue({ data: null, error: { message: "down" } });
        const token = await mockToken(UserType.ADMIN);

        const result = handler(
            mockEvent({ token, body: { friendName: "Zed", email: "zed@example.com" } })
        );

        await expect(result).rejects.toThrow("Error Sending Friend Invite Email");
    });
});
