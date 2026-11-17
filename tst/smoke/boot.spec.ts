import { expect, test } from "@playwright/test";

import { fakeApi, skipBoot } from "./fakes/api";

test.beforeEach(async ({ page }) => {
    await fakeApi(page);
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "connection", { value: { type: "wifi" } });
    });
});

test("boots up on a first visit, then opens the terminal", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");

    await page.clock.runFor(5600);
    await expect(page.getByText(/Detecting Network Link \(WIFI\)/)).toBeVisible();
    await expect(page.getByText("CONNECTED")).toHaveCSS("color", "rgb(43, 201, 3)");
    await expect(page.getByText(/Starting Computer/)).toBeVisible();

    await page.clock.runFor(1000);
    await expect(page.getByText("Welcome To Rosoff OS BETA v4.1.2")).toBeVisible();
});

test("goes straight to the terminal on a return visit", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/");

    await expect(page.getByText("Welcome To Rosoff OS BETA v4.1.2")).toBeVisible();
    await expect(page.getByText(/Starting Computer/)).toHaveCount(0);
});
