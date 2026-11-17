import { describe, expect, it } from "vitest";

import { mockEvent } from "../../setup";
import { mockStripe } from "../../__mocks__/stripe";
import { mockFlavor } from "../../__mocks__/__data__/aws/dynamodb";

import {
    checkoutLineItem,
    isLocalTest,
    siteUrlForEvent,
    stripeForEvent
} from "../../../api/stripe/environment";
import { GetParametersCommand } from "@aws-sdk/client-ssm";
import { mockSSMClient } from "../../__mocks__/__aws__/parameterStore";

describe("isLocalTest", () => {
    it("should be true for local development", () => {
        expect(isLocalTest(mockEvent({ local: true }))).toBeTrue();
    });

    it("should be false for the site", () => {
        expect(isLocalTest(mockEvent())).toBeFalse();
    });
});

describe("stripeForEvent", () => {
    it("should build a stripe client", async () => {
        const result = await stripeForEvent(mockEvent());

        expect(result).toBe(mockStripe);
    });
});

describe("siteUrlForEvent", () => {
    it("should point at the site", () => {
        expect(siteUrlForEvent(mockEvent())).toBe("https://maxrosoff.com");
    });

    it("should point at local development", () => {
        expect(siteUrlForEvent(mockEvent({ local: true }))).toBe("http://localhost:3000");
    });
});

describe("checkoutLineItem", () => {
    it("should use the live price on the site", async () => {
        const result = await checkoutLineItem(mockEvent(), mockFlavor.priceId);

        expect(result).toEqual({ price: mockFlavor.priceId, quantity: 1 });
    });

    it("should copy the live price into test mode locally", async () => {
        const result = await checkoutLineItem(mockEvent({ local: true }), mockFlavor.priceId);

        expect(result.price_data).toMatchObject({
            currency: "usd",
            unit_amount: 600,
            product_data: { name: mockFlavor.name, tax_code: "txcd_99999999" }
        });
    });

    it("should keep a recurring interval", async () => {
        mockStripe.prices.retrieve.mockResolvedValue({
            currency: "usd",
            unit_amount: 2400,
            recurring: { interval: "month", interval_count: 1 },
            product: { name: "Subscription", tax_code: { id: "txcd_1" } }
        });

        const result = await checkoutLineItem(mockEvent({ local: true }), mockFlavor.priceId);

        expect(result.price_data?.recurring).toEqual({ interval: "month", interval_count: 1 });
    });

    it("should use test keys for local development", async () => {
        await stripeForEvent(mockEvent({ local: true }));

        expect(mockSSMClient).toHaveReceivedCommandWith(GetParametersCommand, {
            Names: ["/website/stripe/test/api-key"]
        });
    });

    it("should copy a free price as zero", async () => {
        mockStripe.prices.retrieve.mockResolvedValue({
            currency: "usd",
            unit_amount: null,
            recurring: null,
            product: { name: "Free", tax_code: null }
        });

        const result = await checkoutLineItem(mockEvent({ local: true }), mockFlavor.priceId);

        expect(result.price_data).toMatchObject({
            unit_amount: 0,
            product_data: { tax_code: undefined }
        });
    });
});
