import { expect, test } from "@playwright/test";

import { UserType } from "../../api/types";
import { fakeApi, fakeToken, openTerminal, skipBoot } from "./fakes/api";

const SUBSCRIBER = fakeToken({
    id: "sub_1",
    userType: UserType.SUBSCRIBER,
    email: "ada@example.com"
});

test.beforeEach(async ({ page }) => {
    await skipBoot(page);
});

test("gets between the terminal and the shop", async ({ page }) => {
    await fakeApi(page);
    await openTerminal(page);
    const shop = page.getByRole("link", { name: "Ice Cream" });

    if ((page.viewportSize()?.width ?? 0) >= 900) {
        await shop.click();
        await expect(page).toHaveURL("/ice-cream");
        await page.getByRole("link", { name: "Home" }).click();
        await expect(page).toHaveURL("/");
    } else {
        await expect(shop).toBeHidden();
        await page.keyboard.type("icecream");
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL("/ice-cream");
    }
});

test("opens the social links from the avatar", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await page.getByRole("img", { name: "Max Rosoff" }).click();

    await expect(page.getByText("Résumé")).toBeVisible();
});

test("cancels a subscription from its email link", async ({ page }) => {
    const api = await fakeApi(page);
    api.reply("/ice-cream/cancel", { json: {} });
    await page.goto(`/ice-cream/cancel?token=${SUBSCRIBER}`);

    await expect(page.getByText(/stops the monthly charge/)).toBeVisible();
    await page.getByRole("button", { name: "Cancel Subscription" }).click();
    await expect(page.getByText(/Your subscription is cancelled/)).toBeVisible();
    await page.getByRole("button", { name: "Back To The Flavors" }).click();

    await expect(page).toHaveURL("/ice-cream");
    expect(api.calls("/ice-cream/cancel").at(0)?.body).toEqual({ token: SUBSCRIBER });
});

test("connects spotify and heads home", async ({ page }) => {
    const api = await fakeApi(page);
    api.reply("/spotify/exchange", { json: {} });
    await page.goto("/spotify/callback?code=c&state=s");

    await expect(page.getByText("Spotify Connected")).toBeVisible();
    expect(api.calls("/spotify/exchange").at(0)?.body).toEqual({ code: "c", state: "s" });
    await expect(page).toHaveURL("/", { timeout: 8000 });
});
