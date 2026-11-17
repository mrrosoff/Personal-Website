import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import keyMapping from "../../../__mocks__/__data__/jwks/keyMapping.json";

import { handler } from "../../../../api/endpoints/jwks/keys";

describe("keys", () => {
    it("should publish the signing key", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result).keys[0].kid).toBe(keyMapping.authentication);
    });

    it("should never publish the private half", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result).keys[0]).not.toHaveProperty("d");
    });
});
