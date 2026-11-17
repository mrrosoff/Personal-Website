import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockDynamoDB } from "../../../mocks/aws/dynamodb";
import { mockParameters } from "../../../mocks/aws/parameterStore";
import { mockFlavor } from "../../../fixtures/aws/dynamodb";
import { mockContacts } from "../../../mocks/resend";
import { mockCheckoutSession, mockStripe } from "../../../mocks/stripe";

import { FLAVORS_TABLE } from "../../../../api/common";
import {
    fulfillSubscriptionMonth,
    handler,
    pickRandomFlavors,
    registerSubscriberOnMailingList
} from "../../../../api/endpoints/ice-cream/subscribe";

const invoice = { id: "in_1", customer_email: "a@b.com" } as never;

describe("subscribe", () => {
    it("should start a subscription checkout", async () => {
        const result = await handler(mockEvent());

        expect(responseBody(result)).toEqual(mockCheckoutSession);
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: "subscription",
                line_items: [
                    { price: mockParameters["/website/stripe/subscription-price"], quantity: 1 }
                ]
            })
        );
    });
});

describe("registerSubscriberOnMailingList", () => {
    it("should add the subscriber", async () => {
        await registerSubscriberOnMailingList(mockCheckoutSession as never);

        expect(mockContacts.has(mockCheckoutSession.customer_details.email)).toBe(true);
    });

    it("should skip a session without an email", async () => {
        await registerSubscriberOnMailingList({} as never);

        expect(mockContacts.size).toBe(0);
    });
});

describe("fulfillSubscriptionMonth", () => {
    it("should take the month's flavors out of the freezer", async () => {
        await fulfillSubscriptionMonth(mockStripe as never, invoice);

        expect(mockDynamoDB.get(FLAVORS_TABLE, mockFlavor.productId)?.count).toBe(
            mockFlavor.count - 1
        );
    });

    it("should record the flavors on the invoice", async () => {
        await fulfillSubscriptionMonth(mockStripe as never, invoice);

        expect(mockStripe.invoices.update).toHaveBeenCalledWith("in_1", {
            metadata: { fulfilledFlavors: mockFlavor.name }
        });
    });

    it("should only send flavors that are current and in stock", async () => {
        const soldOut = { ...mockFlavor, count: 0 };
        const upcoming = { ...mockFlavor, productId: "prod_upcoming", type: "upcoming" as const };
        mockDynamoDB.seed(FLAVORS_TABLE, soldOut, upcoming);

        await fulfillSubscriptionMonth(mockStripe as never, invoice);

        expect(mockDynamoDB.items(FLAVORS_TABLE)).toEqual([soldOut, upcoming]);
    });

    it("should never fulfill the same invoice twice", async () => {
        mockStripe.invoices.retrieve.mockResolvedValue({ metadata: { fulfilledFlavors: "mint" } });

        await fulfillSubscriptionMonth(mockStripe as never, invoice);

        expect(mockStripe.invoices.update).not.toHaveBeenCalled();
    });
});

describe("pickRandomFlavors", () => {
    it("should pick two flavors", () => {
        const result = pickRandomFlavors([mockFlavor, mockFlavor, mockFlavor]);

        expect(result).toHaveLength(2);
    });

    it("should pick what there is when there are fewer than two", () => {
        const result = pickRandomFlavors([mockFlavor]);

        expect(result).toEqual([mockFlavor]);
    });
});
