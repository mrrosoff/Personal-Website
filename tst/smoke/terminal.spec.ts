import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { ADMIN_TOKEN, POLAROID_FRIEND_TOKEN, fakeApi, skipBoot } from "./fakes/api";
import { PASSKEY_AUTH_OPTIONS, fakePasskeys } from "./fakes/passkeys";

const GREEN = "rgb(43, 201, 3)";
const RED = "rgb(255, 6, 6)";

async function run(page: Page, command: string) {
    await page.keyboard.type(command);
    await page.keyboard.press("Enter");
}

test.beforeEach(async ({ page }) => {
    await skipBoot(page);
});

test("lists, enters and reads folders", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await run(page, "ls");
    await expect(page.getByText("Documents")).toBeVisible();
    await run(page, "cd Documents");
    await run(page, "cat consultation.txt");

    await expect(page.getByText(/Looking for something custom made\?/)).toBeVisible();
    await expect(page.getByText("/Documents").last()).toHaveCSS("color", GREEN);
});

test("completes paths with tab", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await page.keyboard.type("cd /Doc");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await run(page, "ls");

    await expect(page.getByText("consultation.txt")).toBeVisible();
});

test("recalls earlier commands with the arrow keys", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await run(page, "ls");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");

    await expect(page.getByText("Documents", { exact: true })).toHaveCount(2);
});

test("rejects an unknown command in red", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await run(page, "frobnicate");

    await expect(page.getByText("Command Not Found")).toHaveCSS("color", RED);
});

test("clears the screen", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await run(page, "clear");

    await expect(page.getByText("Welcome To Rosoff OS BETA v4.1.2")).toHaveCount(0);
});

test("opens the shop", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await run(page, "icecream");

    await expect(page).toHaveURL("/ice-cream");
    await expect(page.getByRole("heading", { name: "Max's Freezer Stash" })).toBeVisible();
});

test("plays snake", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await run(page, "snake");

    await expect(page.getByText("SNAKE - Score: 0")).toBeVisible();
    await expect(page.getByText("Use arrow keys to move")).toBeVisible();
});

test("keeps admin commands behind a passkey", async ({ page }) => {
    const api = await fakeApi(page);
    await fakePasskeys(page);
    api.reply("/admin/passkey-auth-options", { json: PASSKEY_AUTH_OPTIONS });
    api.reply("/admin/passkey-auth", { json: { token: ADMIN_TOKEN } });
    await page.goto("/");

    await run(page, "sudo whoami");

    await expect(page.getByText("admin@rosoff").last()).toBeVisible();
    expect(api.calls("/admin/passkey-auth").at(0)?.body).toMatchObject({
        challenge: PASSKEY_AUTH_OPTIONS.challenge
    });
});

test("lets a friend sign in and open their polaroid", async ({ page }) => {
    const api = await fakeApi(page);
    await fakePasskeys(page);
    api.reply("/admin/passkey-auth-options", { json: PASSKEY_AUTH_OPTIONS });
    api.reply("/admin/passkey-auth", { json: { token: POLAROID_FRIEND_TOKEN } });
    api.reply("/polaroid/photos", { json: { photos: [] } });
    await page.goto("/");

    await run(page, "sudo polaroid");

    await expect(page).toHaveURL("/polaroid");
    await expect
        .poll(() => api.calls("/polaroid/photos").at(0)?.authorization)
        .toBe(`Bearer ${POLAROID_FRIEND_TOKEN}`);
});

test("turns a visitor away from the polaroid", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/");

    await run(page, "polaroid");

    await expect(page.getByText("Permission Denied")).toHaveCSS("color", RED);
});
