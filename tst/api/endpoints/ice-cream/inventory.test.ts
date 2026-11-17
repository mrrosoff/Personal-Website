import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockFlavor } from "../../../fixtures/aws/dynamodb";

import { handler } from "../../../../api/endpoints/ice-cream/inventory";

describe("inventory", () => {
    it("should list every flavor", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result)).toEqual({ inventory: [mockFlavor] });
    });
});
