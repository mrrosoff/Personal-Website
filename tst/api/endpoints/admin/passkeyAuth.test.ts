import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it, vi } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";
import { mockChallenge, mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";

import { decryptToken } from "../../../../api/auth";
import { PASSKEY_CHALLENGES_TABLE, PASSKEYS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/admin/passkeyAuth";
import { DeviceKind, UserType } from "../../../../api/types";

vi.mock("@simplewebauthn/server", () => ({ verifyAuthenticationResponse: vi.fn() }));

const body = { challenge: mockChallenge.id, response: { id: mockPasskey.credentialId } };

describe("passkeyAuth", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should reject an unknown challenge", async () => {
        mockDocumentClient.on(GetCommand, { TableName: PASSKEY_CHALLENGES_TABLE }).resolves({});

        const result = await handler(mockEvent({ body }));

        expect(responseBody(result).message).toBe("Invalid Expired Challenge");
    });

    it("should reject and clear an expired challenge", async () => {
        mockDocumentClient
            .on(GetCommand, { TableName: PASSKEY_CHALLENGES_TABLE })
            .resolves({ Item: { ...mockChallenge, expiresAt: 0 } });

        const result = await handler(mockEvent({ body }));

        expect(responseBody(result).message).toBe("Challenge Expired");
        expect(mockDocumentClient).toHaveReceivedCommand(DeleteCommand);
    });

    it("should reject an unknown passkey", async () => {
        mockDocumentClient.on(GetCommand, { TableName: PASSKEYS_TABLE }).resolves({});

        const result = await handler(mockEvent({ body }));

        expect(responseBody(result).message).toBe("Credential Not Recognized");
    });

    it("should reject a signature that fails to verify", async () => {
        vi.mocked(verifyAuthenticationResponse).mockRejectedValue(new Error("bad signature"));

        const result = await handler(mockEvent({ body }));

        expect(responseBody(result).message).toBe("Authentication Failed");
    });

    it("should reject an unverified response", async () => {
        vi.mocked(verifyAuthenticationResponse).mockResolvedValue({ verified: false } as never);

        const result = await handler(mockEvent({ body }));

        expect(responseBody(result).message).toBe("Passkey Verification Returned Unverified");
    });

    it("should sign in a friend with their devices", async () => {
        vi.mocked(verifyAuthenticationResponse).mockResolvedValue({ verified: true } as never);

        const result = await handler(mockEvent({ body }));

        const token = await decryptToken(responseBody(result).token);
        expect(token).toMatchObject({
            id: mockPasskey.name,
            userType: UserType.FRIEND,
            email: mockPasskey.email,
            deviceKinds: [DeviceKind.POLAROID]
        });
    });

    it("should sign in the admin as admin", async () => {
        vi.mocked(verifyAuthenticationResponse).mockResolvedValue({ verified: true } as never);
        mockDocumentClient
            .on(GetCommand, { TableName: PASSKEYS_TABLE })
            .resolves({ Item: { ...mockPasskey, userType: UserType.ADMIN } });

        const result = await handler(mockEvent({ body }));

        const token = await decryptToken(responseBody(result).token);
        expect(token).toMatchObject({ id: "admin", userType: UserType.ADMIN });
    });

    it("should use up the challenge", async () => {
        vi.mocked(verifyAuthenticationResponse).mockResolvedValue({ verified: true } as never);

        await handler(mockEvent({ body }));

        expect(mockDocumentClient).toHaveReceivedCommandWith(DeleteCommand, {
            TableName: PASSKEY_CHALLENGES_TABLE,
            Key: { id: mockChallenge.id }
        });
    });
});
