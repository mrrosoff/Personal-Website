import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockDynamoDB } from "../../../mocks/aws/dynamodb";

import { PASSKEY_CHALLENGES_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/admin/passkeyAuthOptions";

describe("passkeyAuthOptions", () => {
    it("should offer a challenge for the site", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result).rpId).toBe("maxrosoff.com");
    });

    it("should store the challenge", async () => {
        const result = await handler(mockEvent());

        const challenge = responseBody(result).challenge as string;
        expect(mockDynamoDB.get(PASSKEY_CHALLENGES_TABLE, challenge)).toBeDefined();
    });
});
