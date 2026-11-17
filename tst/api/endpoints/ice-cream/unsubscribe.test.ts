import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockInbox, mockResend } from "../../../mocks/resend";
import { mockStripe } from "../../../mocks/stripe";

import { handler } from "../../../../api/endpoints/ice-cream/unsubscribe";

describe("unsubscribe", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should need an email", async () => {
        const result = await handler(mockEvent({ body: {} }));

        expect(responseBody(result).message).toBe("Missing Email");
    });

    it("should email a cancel link to a subscriber", async () => {
        await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(mockInbox).toContainEqual(
            expect.objectContaining({
                to: "a@b.com",
                subject: "Cancel Your Ice Cream Subscription"
            })
        );
    });

    it("should say it sent even for a stranger", async () => {
        mockStripe.customers.list.mockResolvedValue({ data: [] });

        const result = await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(responseBody(result)).toEqual({ sent: true });
        expect(mockInbox).toHaveLength(0);
    });

    it("should not email a customer whose subscription has ended", async () => {
        mockStripe.subscriptions.list.mockResolvedValue({
            data: [{ id: "sub_old", status: "canceled" }]
        });

        await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(mockInbox).toHaveLength(0);
    });

    it("should throw if the email fails to send", async () => {
        mockResend.emails.send.mockResolvedValue({ data: null, error: { message: "down" } });

        const result = handler(mockEvent({ body: { email: "a@b.com" } }));

        await expect(result).rejects.toThrow("Error Sending Cancel Link Email");
    });
});
