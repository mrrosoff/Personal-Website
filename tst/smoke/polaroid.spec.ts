import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { POLAROID_FRIEND_TOKEN, fakeApi, signedIn, skipBoot } from "./fakes/api";
import type { FakeApi } from "./fakes/api";
import { PASSKEY_AUTH_OPTIONS, fakePasskeys } from "./fakes/passkeys";
import { png, previewUrl } from "./fakes/photos";

type Photo = { id: string; uploadedAt: number; previewUrl: string };

async function frameWith(page: Page, photos: Photo[]): Promise<FakeApi> {
    const api = await fakeApi(page);
    api.reply("/polaroid/photos", () => ({ json: { photos } }));
    api.reply("/polaroid/upload", () => {
        photos.push({
            id: `p${photos.length.toString()}`,
            uploadedAt: Date.now(),
            previewUrl: previewUrl()
        });
        return { json: {} };
    });
    api.reply("/polaroid/remove", (request) => {
        const { id } = request.postDataJSON() as { id: string };
        photos.splice(
            photos.findIndex((photo) => photo.id === id),
            1
        );
        return { json: {} };
    });
    return api;
}

function photo(id: string): Photo {
    return { id, uploadedAt: Date.now(), previewUrl: previewUrl() };
}

async function choosePhoto(page: Page) {
    await page
        .locator("input[type=file]")
        .setInputFiles({ name: "beach.png", mimeType: "image/png", buffer: png(600, 900) });
}

test("crops and uploads a photo", async ({ page }) => {
    await signedIn(page, POLAROID_FRIEND_TOKEN);
    const api = await frameWith(page, []);
    await page.goto("/polaroid");

    await choosePhoto(page);
    await page.getByRole("dialog").getByRole("button", { name: "Add" }).click();

    await expect(page.locator("img[src^='data:image/png']")).toHaveCount(1);
    const upload = api.calls("/polaroid/upload").at(0);
    expect(upload?.authorization).toBe(`Bearer ${POLAROID_FRIEND_TOKEN}`);
});

test("removes a photo from the frame", async ({ page }) => {
    await signedIn(page, POLAROID_FRIEND_TOKEN);
    const api = await frameWith(page, [photo("p1")]);
    await page.goto("/polaroid");

    await page.locator("img[src^='data:image/png']").click();
    await page.getByRole("dialog").getByRole("button").click();

    await expect(page.locator("img[src^='data:image/png']")).toHaveCount(0);
    expect(api.calls("/polaroid/remove").at(0)?.body).toEqual({ id: "p1" });
});

test("signs a friend in with a passkey to open the frame", async ({ page }) => {
    await skipBoot(page);
    await fakePasskeys(page);
    const api = await frameWith(page, [photo("p1")]);
    api.reply("/admin/passkey-auth-options", { json: PASSKEY_AUTH_OPTIONS });
    api.reply("/admin/passkey-auth", { json: { token: POLAROID_FRIEND_TOKEN } });
    await page.goto("/polaroid");

    await page.getByText("Unlock").click();

    await expect(page.locator("img[src^='data:image/png']")).toHaveCount(1);
});
