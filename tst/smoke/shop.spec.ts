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

test("says when the freezer cannot be checked", async ({ page }) => {
    const api = await fakeApi(page);
    api.reply("/ice-cream/inventory", { status: 500, json: { message: "Down" } });
    await page.goto("/ice-cream");

    await expect(page.getByText("FAILED")).toHaveCSS("color", "rgb(255, 6, 6)");
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

test("does not pick upcoming flavors", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/ice-cream");

    await page.getByText("Pumpkin Pie").click();

    await expect(cart(page, 1)).toHaveCount(0);
});

test("picks a flavor shared in a link", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/ice-cream?flavor=price_fig");

    await expect(cart(page, 1)).toBeVisible();
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

test("explains why a mailing list sign up failed", async ({ page }) => {
    const api = await fakeApi(page);
    api.reply("/email/register", { status: 400, json: { message: "Already Signed Up" } });
    await page.goto("/ice-cream/mailing-list");

    await signUp(page);

    await expect(page.getByText("Already Signed Up")).toBeVisible();
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

test("explains why leaving the mailing list failed", async ({ page }) => {
    const api = await fakeApi(page);
    api.reply("/email/unsubscribe", { status: 404, json: { message: "Not On The List" } });
    await page.goto("/ice-cream/mailing-list/unsubscribe");

    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Remove From Mailing List" }).click();

    await expect(page.getByText("Not On The List")).toBeVisible();
});
