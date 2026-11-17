import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import type { DatabaseFlavor } from "../../api/types";

const FLAVORS: DatabaseFlavor[] = [
    {
        productId: "prod_mint",
        priceId: "price_mint",
        name: "Mint Chip",
        color: "#3fdad8",
        count: 4,
        type: "currentFlavor"
    },
    {
        productId: "prod_berry",
        priceId: "price_berry",
        name: "Strawberry",
        color: "#fb07d9",
        count: 2,
        type: "lastBatch"
    },
    {
        productId: "prod_gone",
        priceId: "price_gone",
        name: "Pumpkin Pie",
        color: "#ff9a00",
        count: 0,
        type: "upcoming"
    }
];

async function fakeApi(page: Page) {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "connection", { value: { type: "wifi" } });
    });
    await page.route("https://api.maxrosoff.com/**", (route) =>
        route.fulfill({ status: 404, json: { message: "Not Found" } })
    );
    await page.route("https://api.maxrosoff.com/ice-cream/inventory", (route) =>
        route.fulfill({ json: { inventory: FLAVORS } })
    );
}

async function skipBoot(page: Page) {
    await page.addInitScript(() => sessionStorage.setItem("HAS_BOOTED_UP", "true"));
}

test.beforeEach(async ({ page }) => {
    await fakeApi(page);
});

test("boot screen", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    await page.clock.runFor(5600);

    await expect(page.getByText(/Detecting Network Link \(WIFI\)/)).toBeVisible();
    await expect(page.getByText("CONNECTED")).toHaveCSS("color", "rgb(43, 201, 3)");
});

test("terminal", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/");
    await page.keyboard.type("ls");
    await page.keyboard.press("Enter");

    await expect(page.getByText("Documents")).toBeVisible();
    await expect(page.getByText("dev@rosoff").first()).toHaveCSS("color", "rgb(43, 201, 3)");
});

test("ice cream", async ({ page }) => {
    await skipBoot(page);
    await page.goto("/ice-cream");

    await expect(page.getByText("Mint Chip")).toHaveCSS("color", "rgb(63, 218, 216)");
    await expect(page.getByText("Strawberry")).toHaveCSS("color", "rgb(251, 7, 217)");
});
