import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDynamoDB, mockFlavor } from "../../../mocks/aws/dynamodb";
import { mockInbox } from "../../../mocks/resend";
import { mockCheckoutSession, mockStripe } from "../../../mocks/stripe";

import { FLAVORS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/ice-cream/checkout";
import { UserType } from "../../../../api/types";

const query = { priceIds: mockFlavor.priceId };

function pintsLeft() {
    return mockDynamoDB.get(FLAVORS_TABLE, mockFlavor.productId)?.count;
}

describe("checkout", () => {
    it("should reject a bad token", async () => {
        const result = await handler(mockEvent({ token: "junk", query }));

        expect(result.statusCode).toBe(401);
    });

    it("should refuse a flavor that is not for sale", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, type: "upcoming" });

        const result = await handler(mockEvent({ query }));

        expect(responseBody(result).message).toBe("One of those flavors isn't available anymore.");
    });

    it("should refuse an unknown flavor", async () => {
        const result = await handler(mockEvent({ query: { priceIds: "price_unknown" } }));

        expect(responseBody(result).message).toBe("One of those flavors isn't available anymore.");
    });

    it("should refuse more pints than are left", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, count: 1 });

        const result = await handler(
            mockEvent({ query: { priceIds: `${mockFlavor.priceId},${mockFlavor.priceId}` } })
        );

        expect(responseBody(result).message).toBe(`Sorry, ${mockFlavor.name} just sold out.`);
    });

    it("should start a stripe checkout for a guest", async () => {
        const result = await handler(mockEvent({ query }));

        expect(responseBody(result)).toEqual(mockCheckoutSession);
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: "payment",
                line_items: [{ price: mockFlavor.priceId, quantity: 1 }]
            })
        );
    });

    it("should let a friend skip payment", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, query, body: { email: "a@b.com" } }));

        expect(responseBody(result)).toEqual({ friendCheckout: true });
        expect(pintsLeft()).toBe(mockFlavor.count - 1);
        expect(mockInbox).toHaveLength(2);
    });

    it("should not touch the freezer for a friend testing locally", async () => {
        const token = await mockToken(UserType.FRIEND);

        await handler(mockEvent({ token, query, local: true }));

        expect(pintsLeft()).toBe(mockFlavor.count);
    });

    it("should refuse a checkout with no flavors", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result).message).toBe("One of those flavors isn't available anymore.");
    });

    it("should let a friend check out without an email", async () => {
        const token = await mockToken(UserType.FRIEND);

        await handler(mockEvent({ token, query }));

        expect(mockInbox).toHaveLength(1);
    });
});
