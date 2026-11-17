import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { POLAROID_FRIEND_TOKEN, fakeApi, openTerminal, signedIn, skipBoot } from "./fakes/api";
import type { FakeApi } from "./fakes/api";
import { fakeStripe } from "./fakes/stripe";

const CART = {
    lineItems: [
        { name: "Mint Chip", amount: "$6.00" },
        { name: "Fig", amount: "$6.00" }
    ],
    total: "$12.00"
};

async function openCheckout(page: Page, search: string): Promise<FakeApi> {
    await skipBoot(page);
    const api = await fakeApi(page);
    api.reply("/ice-cream/checkout", { json: { client_secret: "cs_test_secret" } });
    api.reply("/ice-cream/subscribe", { json: { client_secret: "cs_test_secret" } });
    api.reply("/ice-cream/subscription-status", { json: { subscribed: false } });
    api.reply("/ice-cream/checkout-status", {
        json: { status: "complete", customer_details: { email: "ada@example.com" } }
    });
    await page.goto(`/ice-cream/checkout${search}`);
    return api;
}

async function fillDelivery(page: Page) {
    await page.getByLabel("Street Address").fill("1 Ferry Building");
    await page.getByLabel("ZIP").fill("94111");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Enter Test Card" }).click();
}

test("pays for a cart and confirms the order", async ({ page }) => {
    await fakeStripe(page, CART);
    const api = await openCheckout(page, "?priceIds=price_mint,price_fig");

    await expect(page.getByText("Mint Chip")).toHaveCSS("color", "rgb(63, 218, 216)");
    await fillDelivery(page);
    await page.getByRole("button", { name: "Pay $12.00" }).click();

    await expect(page.getByText("Order Confirmed")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
    expect(api.calls("/ice-cream/checkout").at(0)?.search).toBe("?priceIds=price_mint,price_fig");
    expect(api.calls("/ice-cream/checkout-status").at(0)?.body).toEqual({ sessionId: "cs_test" });
});

test("starts a monthly subscription", async ({ page }) => {
    await fakeStripe(page, {
        lineItems: [{ name: "Two Pints", amount: "$10.00" }],
        total: "$10.00"
    });
    const api = await openCheckout(page, "?subscription=true");

    await expect(page.getByText(/Renews monthly at \$10\.00/)).toBeVisible();
    await fillDelivery(page);
    await page.getByRole("button", { name: "Pay $10.00" }).click();

    await expect(page.getByText("Order Confirmed")).toBeVisible();
    expect(api.calls("/ice-cream/subscription-status").at(0)?.body).toEqual({
        email: "ada@example.com"
    });
});

test("gives a friend their order on the house", async ({ page }) => {
    await signedIn(page, POLAROID_FRIEND_TOKEN);
    const api = await fakeApi(page);
    api.reply("/ice-cream/checkout", { json: {} });
    await openTerminal(page);

    await page.keyboard.type("icecream");
    await page.keyboard.press("Enter");
    await expect(page.getByText("on the house for friends of Max.")).toBeVisible();
    await page.getByText("Mint Chip").click();
    await page
        .getByLabel("Checkout, 1 in cart")
        .or(page.getByText("Cart (1)"))
        .filter({ visible: true })
        .click();
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Complete Order" }).click();

    await expect(page.getByText(/Thanks for dropping by, Ada!/)).toBeVisible();
    const order = api.calls("/ice-cream/checkout").at(0);
    expect(order?.body).toEqual({ email: "ada@example.com" });
    expect(order?.authorization).toBe(`Bearer ${POLAROID_FRIEND_TOKEN}`);
});
