import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";

import { PASSKEY_CHALLENGES_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/admin/passkeyAuthOptions";

describe("passkeyAuthOptions", () => {
    it("should offer a challenge for the site", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result).rpId).toBe("maxrosoff.com");
    });

    it("should store the challenge", async () => {
        const result = await handler(mockEvent());

        expect(mockDocumentClient).toHaveReceivedCommandWith(PutCommand, {
            TableName: PASSKEY_CHALLENGES_TABLE,
            Item: expect.objectContaining({ id: responseBody(result).challenge })
        });
    });
});
