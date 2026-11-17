import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockStripe, mockSubscription } from "../../../mocks/stripe";

import { handler } from "../../../../api/endpoints/ice-cream/cancel";
import { UserType } from "../../../../api/types";

describe("cancel", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should need a token", async () => {
        const result = await handler(mockEvent({ body: {} }));

        expect(responseBody(result).message).toBe("Missing Token");
    });

    it("should reject a token that is not a subscriber's", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ body: { token } }));

        expect(result.statusCode).toBe(401);
    });

    it("should reject a junk token", async () => {
        const result = await handler(mockEvent({ body: { token: "junk" } }));

        expect(result.statusCode).toBe(401);
    });

    it("should 404 a missing subscription", async () => {
        mockStripe.subscriptions.retrieve.mockRejectedValue(new Error("No such subscription"));
        const token = await mockToken(UserType.SUBSCRIBER);

        const result = await handler(mockEvent({ body: { token } }));

        expect(result.statusCode).toBe(404);
    });

    it("should cancel the subscription", async () => {
        const token = await mockToken(UserType.SUBSCRIBER);

        const result = await handler(mockEvent({ body: { token } }));

        expect(responseBody(result)).toEqual({ cancelled: true });
        expect(mockStripe.subscriptions.cancel).toHaveBeenCalled();
    });

    it("should leave an already cancelled subscription alone", async () => {
        mockStripe.subscriptions.retrieve.mockResolvedValue({
            ...mockSubscription,
            status: "canceled"
        });
        const token = await mockToken(UserType.SUBSCRIBER);

        await handler(mockEvent({ body: { token } }));

        expect(mockStripe.subscriptions.cancel).not.toHaveBeenCalled();
    });
});
