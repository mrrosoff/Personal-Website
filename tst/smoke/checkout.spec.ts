import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { POLAROID_FRIEND_TOKEN, fakeApi, signedIn, skipBoot } from "./fakes/api";
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

test("sends an empty cart back to the shop", async ({ page }) => {
    await fakeStripe(page, CART);
    await openCheckout(page, "");

    await expect(page).toHaveURL("/ice-cream");
});

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

test("only delivers within San Francisco", async ({ page }) => {
    await fakeStripe(page, CART);
    await openCheckout(page, "?priceIds=price_mint,price_fig");

    await fillDelivery(page);
    await page.getByLabel("ZIP").fill("10001");

    await expect(page.getByText("I only deliver within San Francisco.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay $12.00" })).toBeDisabled();
});

test("shows a declined card", async ({ page }) => {
    await fakeStripe(page, { ...CART, declined: true });
    await openCheckout(page, "?priceIds=price_mint,price_fig");

    await fillDelivery(page);
    await page.getByRole("button", { name: "Pay $12.00" }).click();

    await expect(page.getByText("Your card was declined.")).toBeVisible();
});

test("explains why a checkout could not start", async ({ page }) => {
    await fakeStripe(page, CART);
    await skipBoot(page);
    const api = await fakeApi(page);
    api.reply("/ice-cream/checkout", { status: 400, json: { message: "Fig Is Sold Out" } });
    await page.goto("/ice-cream/checkout?priceIds=price_fig");

    await expect(page.getByText("Fig Is Sold Out")).toBeVisible();
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

test("does not subscribe an email twice", async ({ page }) => {
    await fakeStripe(page, {
        lineItems: [{ name: "Two Pints", amount: "$10.00" }],
        total: "$10.00"
    });
    const api = await openCheckout(page, "?subscription=true");
    api.reply("/ice-cream/subscription-status", { json: { subscribed: true } });

    await fillDelivery(page);
    await page.getByRole("button", { name: "Pay $10.00" }).click();

    await expect(page.getByText("This email already has a subscription.")).toBeVisible();
});

test("sends an unfinished payment back to the shop", async ({ page }) => {
    await skipBoot(page);
    const api = await fakeApi(page);
    api.reply("/ice-cream/checkout-status", { json: { status: "open" } });
    await page.goto("/ice-cream/checkout/return?sessionId=cs_test");

    await expect(page).toHaveURL("/ice-cream");
});

test("gives a friend their order on the house", async ({ page }) => {
    await signedIn(page, POLAROID_FRIEND_TOKEN);
    const api = await fakeApi(page);
    api.reply("/ice-cream/checkout", { json: {} });
    await page.goto("/");

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
