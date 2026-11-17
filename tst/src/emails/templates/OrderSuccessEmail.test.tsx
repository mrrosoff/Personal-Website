import { describe, expect, it } from "vitest";

import { renderEmail } from "../../../helpers/render";

import OrderSuccessEmail from "../../../../src/emails/templates/OrderSuccessEmail";

const address = {
    line1: "123 Main St",
    line2: null,
    city: "Denver",
    state: "CO",
    postal_code: "80202",
    country: "US"
};

describe("OrderSuccessEmail", () => {
    it("should tell Max who ordered what and where it goes", async () => {
        const result = await renderEmail(
            <OrderSuccessEmail
                customerName={"Ada"}
                customerEmail={"ada@example.com"}
                shippingAddress={address}
                items={[
                    { name: "Fig", quantity: 1 },
                    { name: "Plum", quantity: 2 }
                ]}
            />
        );

        expect(result).toContain("Order From Ada");
        expect(result).toContain("New order from Ada for 2 pints");
        expect(result).toContain("ada@example.com");
        expect(result).toContain("Deliver To");
        expect(result).toContain("Denver, CO 80202");
    });

    it("should name an order by its email when there is no name", async () => {
        const result = await renderEmail(
            <OrderSuccessEmail
                customerEmail={"ada@example.com"}
                items={[{ name: "Fig", quantity: 1 }]}
            />
        );

        expect(result).toContain("New Order");
        expect(result).toContain("New order from ada@example.com for 1 pint");
    });

    it("should handle an order with no details", async () => {
        const result = await renderEmail(<OrderSuccessEmail items={[]} />);

        expect(result).toContain("New order from a customer for 0 pints");
        expect(result).not.toContain("Deliver To");
    });

    it("should thank the customer", async () => {
        const result = await renderEmail(
            <OrderSuccessEmail
                forCustomer
                customerName={"Ada"}
                customerEmail={"ada@example.com"}
                shippingAddress={{ ...address, line2: "Apt 4", state: null, postal_code: null }}
                items={[{ name: "Fig", quantity: 1 }]}
            />
        );

        expect(result).toContain("Thanks, Ada!");
        expect(result).toContain("Your ice cream order for 1 pint");
        expect(result).toContain("Delivering To");
        expect(result).toContain("Apt 4");
        expect(result).not.toContain("ada@example.com");
    });

    it("should thank a customer without a name", async () => {
        const result = await renderEmail(<OrderSuccessEmail forCustomer items={[]} />);

        expect(result).toContain("Thanks For Your Order!");
    });
});
