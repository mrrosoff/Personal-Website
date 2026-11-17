import { describe, expect, it } from "vitest";

import { mockEvent } from "../../../setup";
import { mockDynamoDB } from "../../../mocks/aws/dynamodb";
import { mockFlavor } from "../../../fixtures/aws/dynamodb";
import { mockContacts, mockInbox } from "../../../mocks/resend";
import { mockCheckoutSession, mockLineItem, mockStripe } from "../../../mocks/stripe";

import { FLAVORS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/ice-cream/checkoutSuccess";

const event = mockEvent({ body: "{}", headers: { "stripe-signature": "signature" } });

function storedFlavor() {
    return mockDynamoDB.get(FLAVORS_TABLE, mockFlavor.productId);
}

describe("checkoutSuccess", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should check an unsigned event against an empty signature", async () => {
        await handler(mockEvent({ body: "{}" }));

        expect(mockStripe.webhooks.constructEventAsync).toHaveBeenCalledWith(
            "{}",
            "",
            expect.any(String)
        );
    });

    it("should reject events meant for another webhook", async () => {
        mockStripe.webhooks.constructEventAsync.mockResolvedValue({
            type: "customer.created",
            data: { object: {} }
        });

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
    });

    it("should take a pint out of the freezer", async () => {
        await handler(event);

        expect(storedFlavor()?.count).toBe(mockFlavor.count - 1);
    });

    it("should email the order", async () => {
        await handler(event);

        expect(mockInbox).toContainEqual(expect.objectContaining({ subject: "Ice Cream Order" }));
    });

    it("should add the customer to the mailing list", async () => {
        await handler(event);

        expect(mockContacts.has(mockCheckoutSession.customer_details.email)).toBe(true);
    });

    it("should mark the payment fulfilled", async () => {
        await handler(event);

        expect(mockStripe.paymentIntents.update).toHaveBeenCalledWith(
            mockCheckoutSession.payment_intent,
            { metadata: { fulfilled: "true" } }
        );
    });

    it("should skip an order it already fulfilled", async () => {
        mockStripe.paymentIntents.retrieve.mockResolvedValue({ metadata: { fulfilled: "true" } });

        await handler(event);

        expect(storedFlavor()?.count).toBe(mockFlavor.count);
    });

    it("should refund and restock an oversold pint", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, count: 0 });

        await handler(event);

        expect(storedFlavor()?.count).toBe(0);
        expect(mockStripe.refunds.create).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 600 })
        );
    });

    it("should not email an order where everything oversold", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, count: 0 });

        await handler(event);

        expect(mockInbox).toHaveLength(0);
    });

    it("should unlist a last batch flavor once it sells out", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, count: 1, type: "lastBatch" });

        await handler(event);

        expect(storedFlavor()).toMatchObject({ count: 0, type: null });
    });

    it("should fulfill a paid subscription invoice", async () => {
        mockStripe.webhooks.constructEventAsync.mockResolvedValue({
            type: "invoice.paid",
            data: { object: { id: "in_1", parent: { type: "subscription_details" } } }
        });

        await handler(event);

        expect(mockStripe.invoices.update).toHaveBeenCalled();
    });

    it("should add a new subscriber to the mailing list", async () => {
        mockStripe.webhooks.constructEventAsync.mockResolvedValue({
            type: "checkout.session.completed",
            data: { object: { ...mockCheckoutSession, mode: "subscription" } }
        });

        await handler(event);

        expect(mockContacts.has(mockCheckoutSession.customer_details.email)).toBe(true);
        expect(storedFlavor()?.count).toBe(mockFlavor.count);
    });

    it("should handle a guest who left no details", async () => {
        mockStripe.webhooks.constructEventAsync.mockResolvedValue({
            type: "checkout.session.completed",
            data: { object: { ...mockCheckoutSession, customer_details: null } }
        });
        mockStripe.checkout.sessions.listLineItems.mockResolvedValue({
            data: [{ ...mockLineItem, description: null, quantity: null }]
        });

        await handler(event);

        expect(mockContacts.size).toBe(0);
        expect(mockInbox).toContainEqual(expect.objectContaining({ subject: "Ice Cream Order" }));
    });

    it("should fall back to the session email", async () => {
        mockStripe.webhooks.constructEventAsync.mockResolvedValue({
            type: "checkout.session.completed",
            data: {
                object: {
                    ...mockCheckoutSession,
                    customer_details: null,
                    customer_email: "a@b.com"
                }
            }
        });

        await handler(event);

        expect(mockContacts.has("a@b.com")).toBe(true);
    });

    it("should read a product that came back expanded", async () => {
        mockStripe.checkout.sessions.listLineItems.mockResolvedValue({
            data: [{ ...mockLineItem, price: { product: { id: mockFlavor.productId } } }]
        });

        await handler(event);

        expect(storedFlavor()?.count).toBe(mockFlavor.count - 1);
    });

    it("should leave the freezer alone for a line item without a price", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, count: 0 });
        mockStripe.checkout.sessions.listLineItems.mockResolvedValue({
            data: [mockLineItem, { ...mockLineItem, price: null, description: "Gift Card" }]
        });

        await handler(event);

        expect(storedFlavor()?.count).toBe(0);
        expect(mockInbox).toContainEqual(expect.objectContaining({ subject: "Ice Cream Order" }));
    });

    it("should not refund an oversold pint that cost nothing", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, count: 0 });
        mockStripe.checkout.sessions.listLineItems.mockResolvedValue({
            data: [{ ...mockLineItem, amount_total: 0 }]
        });

        await handler(event);

        expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("should not refund without a payment", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, count: 0 });
        mockStripe.webhooks.constructEventAsync.mockResolvedValue({
            type: "checkout.session.completed",
            data: { object: { ...mockCheckoutSession, payment_intent: null } }
        });

        await handler(event);

        expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });
});
