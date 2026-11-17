import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import keyMapping from "../../../fixtures/jwks/keyMapping.json";

import { handler } from "../../../../api/endpoints/jwks/keys";

describe("keys", () => {
    it("should publish the signing key", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result).keys).toMatchObject([{ kid: keyMapping.authentication }]);
    });

    it("should never publish the private half", async () => {
        const result = await handler(mockEvent());

        expect(result.body).not.toContain('"d"');
    });
});
