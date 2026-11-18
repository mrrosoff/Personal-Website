import { expect, test } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

async function previewImage(request: APIRequestContext, path: string): Promise<string | null> {
    const html = await (await request.get(path)).text();
    const match = /<meta\s+property="og:image"\s+content="([^"]*)"/.exec(html);
    return match ? match[1].replaceAll("&amp;", "&") : null;
}

test("passes a link's page and input to its preview card", async ({ request }) => {
    const image = await previewImage(request, "/register-friend?token=a.b.c");

    expect(image).toBe("https://api.maxrosoff.com/preview.png?token=a.b.c&page=%2Fregister-friend");
});

test("passes the page to its preview card without input", async ({ request }) => {
    const image = await previewImage(request, "/ice-cream");

    expect(image).toBe("https://api.maxrosoff.com/preview.png?page=%2Fice-cream");
});

test("leaves the page out for the home page", async ({ request }) => {
    const image = await previewImage(request, "/");

    expect(image).toBe("https://api.maxrosoff.com/preview.png");
});

test("ignores a page the link tries to pick", async ({ request }) => {
    const image = await previewImage(request, "/ice-cream?page=/elsewhere");

    expect(image).toBe("https://api.maxrosoff.com/preview.png?page=%2Fice-cream");
});

test("keeps a crafted link from breaking out of the tag", async ({ request }) => {
    const html = await (
        await request.get('/register-friend?token="><script>alert(1)</script>')
    ).text();

    expect(html).not.toContain("<script>alert(1)</script>");
});

test("leaves pages without their own card alone", async ({ request }) => {
    const image = await previewImage(request, "/polaroid?token=a.b.c");

    expect(image).toBe("https://api.maxrosoff.com/preview.png");
});

test("serves an empty agent manifest", async ({ request }) => {
    const response = await request.get("/.well-known/ard.json");

    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.json()).toEqual({ entries: [] });
});

test("greets curl with a terminal card", async ({ request }) => {
    const response = await request.get("/", { headers: { "user-agent": "curl/8.7.1" } });

    expect(response.headers()["content-type"]).toContain("text/plain");
    const text = await response.text();
    expect(text).toMatch(/Booting OS[ .]+\S+SUCCESS/);
    expect(text).toContain("https://github.com/mrrosoff");
});

test("serves the site to browsers on the home page", async ({ request }) => {
    const response = await request.get("/", { headers: { "user-agent": "Mozilla/5.0" } });

    expect(response.headers()["content-type"]).toContain("text/html");
});

test("sends security headers on pages with and without a function", async ({ request }) => {
    for (const path of ["/", "/polaroid", "/ice-cream"]) {
        const headers = (await request.get(path)).headers();

        expect(headers["strict-transport-security"]).toBe("max-age=31536000");
        expect(headers["x-frame-options"]).toBe("DENY");
        expect(headers["content-security-policy"]).toBe("frame-ancestors 'none'");
        expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    }
});

test("shows curl what is in the freezer", async ({ request }) => {
    const response = await request.get("/ice-cream", { headers: { "user-agent": "curl/8.7.1" } });

    const text = await response.text();
    expect(response.headers()["content-type"]).toContain("text/plain");
    expect(text).toContain("Max's Freezer Stash");
    expect(text).toMatch(/Checking Freezer[ .]+\S+3 FLAVORS/);
    expect(text).toContain("Mint Chip");
    expect(text).toContain("Strawberry");
    expect(text).toMatch(/Coming up\S*\s+Pumpkin Pie/);
});

test("serves the shop to browsers", async ({ request }) => {
    const response = await request.get("/ice-cream", { headers: { "user-agent": "Mozilla/5.0" } });

    expect(response.headers()["content-type"]).toContain("text/html");
});

test("greets curl with the terminal card on any page", async ({ request }) => {
    const response = await request.get("/some/page", { headers: { "user-agent": "curl/8.7.1" } });

    expect(response.headers()["content-type"]).toContain("text/plain");
    expect(await response.text()).toMatch(/Booting OS[ .]+\S+SUCCESS/);
});
