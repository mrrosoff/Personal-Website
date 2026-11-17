import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { fakeApi, skipBoot } from "./fakes/api";

function cart(page: Page, count: number) {
    return page
        .getByLabel(`Checkout, ${count.toString()} in cart`)
        .or(page.getByText(`Cart (${count.toString()})`))
        .filter({ visible: true });
}

async function signUp(page: Page) {
    await page.getByLabel("First Name").fill("Ada");
    await page.getByLabel("Last Name").fill("Lovelace");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Sign Up" }).click();
}

test.beforeEach(async ({ page }) => {
    await skipBoot(page);
});

test("shows each flavor in its section and color", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/ice-cream");

    await expect(page.getByText("Mint Chip")).toHaveCSS("color", "rgb(63, 218, 216)");
    await expect(page.getByText("Fig")).toHaveCSS("color", "rgb(186, 12, 248)");
    await expect(page.getByText("Strawberry")).toHaveCSS("color", "rgb(251, 7, 217)");
    await expect(page.getByText("Pumpkin Pie")).toBeVisible();
    await expect(page.getByText("$10 for two every month")).toBeVisible();
});

test("picks and unpicks flavors, then checks out", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/ice-cream");

    await page.getByText("Mint Chip").click();
    await page.getByText("Fig").click();
    await expect(cart(page, 2)).toBeVisible();
    await page.getByText("Fig").click();
    await cart(page, 1).click();

    await expect(page).toHaveURL("/ice-cream/checkout?priceIds=price_mint");
});

test("signs up for the mailing list", async ({ page }) => {
    const api = await fakeApi(page);
    api.reply("/email/register", { json: { userId: "u1" } });
    await page.goto("/ice-cream");

    await page.getByRole("link", { name: "Join our mailing list" }).click();
    await signUp(page);

    await expect(page.getByRole("button", { name: "Sign Up" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Sign Up" }).locator("svg")).toBeVisible();
    expect(api.calls("/email/register").at(0)?.body).toEqual({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com"
    });
});

test("leaves the mailing list", async ({ page }) => {
    const api = await fakeApi(page);
    api.reply("/email/unsubscribe", { json: {} });
    await page.goto("/ice-cream/mailing-list/unsubscribe");

    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Remove From Mailing List" }).click();

    const button = page.getByRole("button", { name: "Remove From Mailing List" });
    await expect(button).toBeDisabled();
    await expect(button.locator("svg")).toBeVisible();
    expect(api.calls("/email/unsubscribe").at(0)?.body).toEqual({ email: "ada@example.com" });
});
