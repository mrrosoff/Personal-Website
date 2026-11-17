import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDynamoDB } from "../../../__mocks__/__aws__/dynamodb";
import { mockFlavor } from "../../../__mocks__/__data__/aws/dynamodb";
import { mockStripe } from "../../../__mocks__/stripe";

import { FLAVORS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/admin/provisionFlavor";
import { UserType } from "../../../../api/types";

const body = { flavorName: "Fig", initialQuantity: 4, color: "#a0a", type: "upcoming" };

describe("provisionFlavor", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should be admin only", async () => {
        const result = await handler(mockEvent({ body }));

        expect(result.statusCode).toBe(401);
    });

    it("should refuse a name that is already taken", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(
            mockEvent({
                token,
                body: { ...body, flavorName: ` ${mockFlavor.name.toUpperCase()} ` }
            })
        );

        expect(responseBody(result).message).toBe(
            `A Flavor Named "${mockFlavor.name}" Already Exists`
        );
    });

    it("should create a six dollar stripe product", async () => {
        const token = await mockToken(UserType.ADMIN);

        await handler(mockEvent({ token, body }));

        expect(mockStripe.products.create).toHaveBeenCalledWith({
            name: "Fig",
            default_price_data: { unit_amount: 600, currency: "usd" }
        });
    });

    it("should stock the new flavor", async () => {
        const token = await mockToken(UserType.ADMIN);

        await handler(mockEvent({ token, body }));

        expect(mockDynamoDB.items(FLAVORS_TABLE)).toEqual([
            {
                productId: mockFlavor.productId,
                priceId: mockFlavor.priceId,
                name: "Fig",
                color: "#a0a",
                count: 4,
                type: "upcoming"
            }
        ]);
    });
});
