import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it, vi } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";
import { mockChallenge, mockDevice, mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";

import { PASSKEY_CHALLENGES_TABLE, PASSKEYS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/friends/passkeyRegister";
import { UserType } from "../../../../api/types";

vi.mock("@simplewebauthn/server", () => ({ verifyRegistrationResponse: vi.fn() }));

const body = { challenge: mockChallenge.id, response: {}, email: "  New@Example.com " };

function verified() {
    vi.mocked(verifyRegistrationResponse).mockResolvedValue({
        verified: true,
        registrationInfo: { credential: { id: "credential", publicKey: new Uint8Array([1, 2, 3]) } }
    } as never);
}

function invite() {
    return mockToken(UserType.SHARE, { deviceIds: [mockDevice.deviceId] });
}

describe("passkeyRegister", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should need an invite", async () => {
        const result = await handler(mockEvent({ body }));

        expect(result.statusCode).toBe(401);
    });

    it("should need a valid email", async () => {
        const result = await handler(
            mockEvent({ token: await invite(), body: { ...body, email: "nope" } })
        );

        expect(responseBody(result).message).toBe("Valid Email Required");
    });

    it("should refuse an email that is already registered", async () => {
        const result = await handler(mockEvent({ token: await invite(), body }));

        expect(responseBody(result).message).toBe("That Email Is Already Registered");
    });

    it("should refuse an unknown challenge", async () => {
        mockDocumentClient.on(QueryCommand, { TableName: PASSKEYS_TABLE }).resolves({ Items: [] });
        mockDocumentClient.on(GetCommand, { TableName: PASSKEY_CHALLENGES_TABLE }).resolves({});

        const result = await handler(mockEvent({ token: await invite(), body }));

        expect(responseBody(result).message).toBe("Invalid Or Expired Challenge");
    });

    it("should refuse and clear an expired challenge", async () => {
        mockDocumentClient.on(QueryCommand, { TableName: PASSKEYS_TABLE }).resolves({ Items: [] });
        mockDocumentClient
            .on(GetCommand, { TableName: PASSKEY_CHALLENGES_TABLE })
            .resolves({ Item: { ...mockChallenge, expiresAt: 0 } });

        const result = await handler(mockEvent({ token: await invite(), body }));

        expect(responseBody(result).message).toBe("Challenge Expired");
        expect(mockDocumentClient).toHaveReceivedCommand(DeleteCommand);
    });

    it("should refuse a registration that fails to verify", async () => {
        mockDocumentClient.on(QueryCommand, { TableName: PASSKEYS_TABLE }).resolves({ Items: [] });
        vi.mocked(verifyRegistrationResponse).mockRejectedValue(new Error("bad attestation"));

        const result = await handler(mockEvent({ token: await invite(), body }));

        expect(responseBody(result).message).toBe("Registration Failed");
    });

    it("should refuse an unverified registration", async () => {
        mockDocumentClient.on(QueryCommand, { TableName: PASSKEYS_TABLE }).resolves({ Items: [] });
        vi.mocked(verifyRegistrationResponse).mockResolvedValue({ verified: false } as never);

        const result = await handler(mockEvent({ token: await invite(), body }));

        expect(responseBody(result).message).toBe("Registration Failed");
    });

    it("should save the friend's passkey with their invited devices", async () => {
        mockDocumentClient.on(QueryCommand, { TableName: PASSKEYS_TABLE }).resolves({ Items: [] });
        verified();

        await handler(mockEvent({ token: await invite(), body }));

        expect(mockDocumentClient).toHaveReceivedCommandWith(PutCommand, {
            TableName: PASSKEYS_TABLE,
            Item: {
                credentialId: "credential",
                publicKey: "AQID",
                userType: UserType.FRIEND,
                name: mockPasskey.name,
                email: "new@example.com",
                deviceIds: [mockDevice.deviceId]
            }
        });
    });

    it("should leave off devices when the invite has none", async () => {
        mockDocumentClient.on(QueryCommand, { TableName: PASSKEYS_TABLE }).resolves({ Items: [] });
        verified();

        await handler(mockEvent({ token: await mockToken(UserType.SHARE), body }));

        expect(mockDocumentClient).toHaveReceivedCommandWith(PutCommand, {
            Item: expect.not.objectContaining({ deviceIds: expect.anything() })
        });
    });

    it("should let the admin register without granting devices", async () => {
        mockDocumentClient.on(QueryCommand, { TableName: PASSKEYS_TABLE }).resolves({ Items: [] });
        verified();

        await handler(mockEvent({ token: await mockToken(UserType.ADMIN), body }));

        expect(mockDocumentClient).toHaveReceivedCommandWith(PutCommand, {
            Item: expect.objectContaining({ name: "admin" })
        });
    });
});
