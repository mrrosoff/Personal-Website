import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockStripe } from "../../../__mocks__/stripe";

import { handler } from "../../../../api/endpoints/ice-cream/subscriptionStatus";

describe("subscriptionStatus", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should need an email", async () => {
        const result = await handler(mockEvent({ body: { email: "  " } }));

        expect(responseBody(result).message).toBe("Missing Email");
    });

    it("should report a live subscription", async () => {
        const result = await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(responseBody(result)).toEqual({ subscribed: true });
    });

    it("should ignore a cancelled subscription", async () => {
        mockStripe.subscriptions.list.mockResolvedValue({ data: [{ status: "canceled" }] });

        const result = await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(responseBody(result)).toEqual({ subscribed: false });
    });

    it("should report no subscription for a stranger", async () => {
        mockStripe.customers.list.mockResolvedValue({ data: [] });

        const result = await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(responseBody(result)).toEqual({ subscribed: false });
    });
});
