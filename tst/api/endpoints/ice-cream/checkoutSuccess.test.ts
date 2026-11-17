import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockEvent } from "../../../setup";
import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";
import { mockFlavor } from "../../../__mocks__/__data__/aws/dynamodb";
import { mockResend } from "../../../__mocks__/resend";
import { mockCheckoutSession, mockLineItem, mockStripe } from "../../../__mocks__/stripe";

import { handler } from "../../../../api/endpoints/ice-cream/checkoutSuccess";

const event = mockEvent({ body: "{}", headers: { "stripe-signature": "signature" } });

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

        expect(mockDocumentClient).toHaveReceivedCommandWith(UpdateCommand, {
            Key: { productId: mockFlavor.productId },
            ExpressionAttributeValues: { ":delta": -1 }
        });
    });

    it("should email the order", async () => {
        await handler(event);

        expect(mockResend.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({ subject: "Ice Cream Order" })
        );
    });

    it("should add the customer to the mailing list", async () => {
        await handler(event);

        expect(mockResend.contacts.get).toHaveBeenCalledWith(
            expect.objectContaining({ email: mockCheckoutSession.customer_details.email })
        );
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

        expect(mockDocumentClient).not.toHaveReceivedCommand(UpdateCommand);
    });

    it("should refund and restock an oversold pint", async () => {
        mockDocumentClient.on(UpdateCommand).resolves({ Attributes: { ...mockFlavor, count: -1 } });

        await handler(event);

        expect(mockDocumentClient).toHaveReceivedCommandWith(UpdateCommand, {
            ExpressionAttributeValues: { ":delta": 1 }
        });
        expect(mockStripe.refunds.create).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 600 })
        );
    });

    it("should not email an order where everything oversold", async () => {
        mockDocumentClient.on(UpdateCommand).resolves({ Attributes: { ...mockFlavor, count: -1 } });

        await handler(event);

        expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it("should unlist a last batch flavor once it sells out", async () => {
        mockDocumentClient
            .on(UpdateCommand)
            .resolves({ Attributes: { ...mockFlavor, count: 0, type: "lastBatch" } });

        await handler(event);

        expect(mockDocumentClient).toHaveReceivedCommandWith(UpdateCommand, {
            UpdateExpression: "SET #type = :0",
            ExpressionAttributeValues: { ":0": null }
        });
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

        expect(mockResend.contacts.get).toHaveBeenCalled();
        expect(mockDocumentClient).not.toHaveReceivedCommand(UpdateCommand);
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

        expect(mockResend.contacts.get).not.toHaveBeenCalled();
        expect(mockResend.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({ subject: "Ice Cream Order" })
        );
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

        expect(mockResend.contacts.get).toHaveBeenCalledWith(
            expect.objectContaining({ email: "a@b.com" })
        );
    });

    it("should not refund an oversold pint that cost nothing", async () => {
        mockDocumentClient.on(UpdateCommand).resolves({ Attributes: { ...mockFlavor, count: -1 } });
        mockStripe.checkout.sessions.listLineItems.mockResolvedValue({
            data: [{ ...mockLineItem, amount_total: 0 }]
        });

        await handler(event);

        expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("should not refund without a payment", async () => {
        mockDocumentClient.on(UpdateCommand).resolves({ Attributes: { ...mockFlavor, count: -1 } });
        mockStripe.webhooks.constructEventAsync.mockResolvedValue({
            type: "checkout.session.completed",
            data: { object: { ...mockCheckoutSession, payment_intent: null } }
        });

        await handler(event);

        expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });
});
