import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockCheckoutSession, mockStripe } from "../../../mocks/stripe";

import { handler } from "../../../../api/endpoints/ice-cream/checkoutStatus";

describe("checkoutStatus", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should return the stripe session", async () => {
        const result = await handler(mockEvent({ body: { sessionId: mockCheckoutSession.id } }));

        expect(responseBody(result)).toEqual(mockCheckoutSession);
        expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(mockCheckoutSession.id);
    });
});
