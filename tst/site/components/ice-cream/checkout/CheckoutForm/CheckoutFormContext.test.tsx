import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    isDeliverable,
    toStripeContact,
    useCheckoutForm
} from "../../../../../../site/components/ice-cream/checkout/CheckoutForm/CheckoutFormContext";

describe("isDeliverable", () => {
    it("should accept a numbered street in the city", () => {
        expect(isDeliverable({ line1: "1 Ferry Building", line2: "", postalCode: "94111" })).toBe(
            true
        );
    });

    it("should refuse an address without a number or outside the city", () => {
        expect(isDeliverable({ line1: "Ferry Building", line2: "", postalCode: "94111" })).toBe(
            false
        );
        expect(isDeliverable({ line1: "1 Main St", line2: "", postalCode: "90210" })).toBe(false);
    });
});

describe("toStripeContact", () => {
    it("should fill in the city and keep an apartment", () => {
        const result = toStripeContact({
            line1: " 1 Ferry Building ",
            line2: " 4 ",
            postalCode: "94111"
        });

        expect(result.address).toMatchObject({
            line1: "1 Ferry Building",
            line2: "4",
            city: "San Francisco"
        });
    });
});

describe("useCheckoutForm", () => {
    it("should need a provider", () => {
        expect(() => renderHook(() => useCheckoutForm())).toThrow(
            "useCheckoutForm must be used within CheckoutFormProvider"
        );
    });
});
