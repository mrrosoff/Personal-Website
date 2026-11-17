import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDynamoDB, mockFlavor } from "../../../mocks/aws/dynamodb";
import { mockStripe } from "../../../mocks/stripe";

import { FLAVORS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/admin/updateInventory";
import { UserType } from "../../../../api/types";

const body = { ...mockFlavor, name: "Fig", count: 9 };

describe("updateInventory", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should be admin only", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, body }));

        expect(result.statusCode).toBe(401);
    });

    it("should rename the stripe product", async () => {
        const token = await mockToken(UserType.ADMIN);

        await handler(mockEvent({ token, body }));

        expect(mockStripe.products.update).toHaveBeenCalledWith(mockFlavor.productId, {
            name: "Fig"
        });
    });

    it("should update the flavor", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token, body }));

        expect(responseBody(result)).toMatchObject({ name: "Fig", count: 9 });
        expect(mockDynamoDB.get(FLAVORS_TABLE, mockFlavor.productId)).toMatchObject({
            name: "Fig",
            count: 9
        });
    });
});
