import { expect, test } from "@playwright/test";

import { DeviceKind, UserType } from "../../api/types";
import { POLAROID_FRIEND_TOKEN, fakeApi, fakeToken, skipBoot } from "./fakes/api";
import { PASSKEY_AUTH_OPTIONS, PASSKEY_REGISTER_OPTIONS, fakePasskeys } from "./fakes/passkeys";

const INVITE = fakeToken({ id: "Ada", userType: UserType.SHARE });

test.beforeEach(async ({ page }) => {
    await skipBoot(page);
});

test("welcomes a friend and lists what they were added to", async ({ page }) => {
    const api = await fakeApi(page);
    api.reply("/friends/devices", {
        json: { deviceKinds: [DeviceKind.POLAROID, DeviceKind.SPOTIFY] }
    });
    await page.goto(`/register-friend?token=${INVITE}`);

    await expect(page.getByRole("heading", { name: "Welcome, Ada" })).toBeVisible();
    await expect(page.getByText(/a Polaroid device & a Spotify device/)).toBeVisible();
    await expect(page.getByText("sudo su Ada")).toBeVisible();
});

test("registers a passkey and opens the polaroid", async ({ page }) => {
    const api = await fakeApi(page);
    await fakePasskeys(page);
    api.reply("/friends/devices", { json: { deviceKinds: [DeviceKind.POLAROID] } });
    api.reply("/friends/passkey-register-options", { json: PASSKEY_REGISTER_OPTIONS });
    api.reply("/friends/passkey-register", { json: { verified: true } });
    api.reply("/admin/passkey-auth-options", { json: PASSKEY_AUTH_OPTIONS });
    api.reply("/admin/passkey-auth", { json: { token: POLAROID_FRIEND_TOKEN } });
    api.reply("/polaroid/photos", { json: { photos: [] } });
    await page.goto(`/register-friend?token=${INVITE}`);

    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Register Passkey" }).click();

    await expect(page).toHaveURL("/polaroid");
    const registration = api.calls("/friends/passkey-register").at(0);
    expect(registration?.body).toMatchObject({
        email: "ada@example.com",
        challenge: PASSKEY_REGISTER_OPTIONS.challenge
    });
    expect(registration?.authorization).toBe(`Bearer ${INVITE}`);
});

test("explains a failed registration", async ({ page }) => {
    const api = await fakeApi(page);
    await fakePasskeys(page);
    api.reply("/friends/devices", { json: { deviceKinds: [] } });
    api.reply("/friends/passkey-register-options", { json: PASSKEY_REGISTER_OPTIONS });
    api.reply("/friends/passkey-register", { status: 500, json: {} });
    await page.goto(`/register-friend?token=${INVITE}`);

    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Register Passkey" }).click();

    await expect(page.getByText("Registration Failed. Ask For A New Link.")).toBeVisible();
});

test("says when an invite has expired", async ({ page }) => {
    await fakeApi(page);
    const expired = fakeToken({ id: "Ada", userType: UserType.SHARE, expiresInSeconds: -60 });
    await page.goto(`/register-friend?token=${expired}`);

    await expect(page.getByText("This invite link has expired. Ask for a new one.")).toBeVisible();
});

test("sends a visitor without an invite home", async ({ page }) => {
    await fakeApi(page);
    await page.goto("/register-friend");

    await expect(page).toHaveURL("/");
});
