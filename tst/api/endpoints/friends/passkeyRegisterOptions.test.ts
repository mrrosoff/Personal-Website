import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";

import { PASSKEY_CHALLENGES_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/friends/passkeyRegisterOptions";
import { UserType } from "../../../../api/types";

describe("passkeyRegisterOptions", () => {
    it("should need an invite", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(401);
    });

    it("should register the friend under their invite name", async () => {
        const token = await mockToken(UserType.SHARE);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).rp).toEqual({
            name: "Max's Personal Website",
            id: "maxrosoff.com"
        });
    });

    it("should store the challenge", async () => {
        const token = await mockToken(UserType.SHARE);

        const result = await handler(mockEvent({ token }));

        expect(mockDocumentClient).toHaveReceivedCommandWith(PutCommand, {
            TableName: PASSKEY_CHALLENGES_TABLE,
            Item: expect.objectContaining({ id: responseBody(result).challenge })
        });
    });
});
