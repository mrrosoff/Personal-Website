import { expect } from "@playwright/test";
import type { Page, Request } from "@playwright/test";

import { DeviceKind, UserType } from "../../../api/types";
import type { DatabaseFlavor } from "../../../api/types";
import flavors from "./flavors.json";

const API = "https://api.maxrosoff.com";

const FLAVORS = flavors as DatabaseFlavor[];

type Reply = { status?: number; json?: unknown; body?: Buffer; contentType?: string };
type Handler = Reply | ((request: Request) => Reply);

export type ApiCall = { path: string; search: string; body: unknown; authorization?: string };

export type FakeApi = {
    reply: (path: string, handler: Handler) => void;
    calls: (path: string) => ApiCall[];
};

export async function fakeApi(page: Page): Promise<FakeApi> {
    const handlers = new Map<string, Handler>([
        ["/ice-cream/inventory", { json: { inventory: FLAVORS } }]
    ]);
    const calls: ApiCall[] = [];

    await page.route(`${API}/**`, async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (request.method() === "OPTIONS") {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        calls.push({
            path: url.pathname,
            search: url.search,
            body: request.postData() ? parseBody(request.postData() ?? "") : undefined,
            authorization: (await request.headerValue("authorization")) ?? undefined
        });
        const handler = handlers.get(url.pathname) ?? {
            status: 404,
            json: { message: "Not Found" }
        };
        const reply = typeof handler === "function" ? handler(request) : handler;
        await route.fulfill({
            status: reply.status ?? 200,
            headers: corsHeaders(),
            contentType: reply.contentType ?? "application/json",
            body: reply.body ?? JSON.stringify(reply.json ?? {})
        });
    });

    return {
        reply: (path, handler) => handlers.set(path, handler),
        calls: (path) => calls.filter((call) => call.path === path)
    };
}

function corsHeaders() {
    return {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "*"
    };
}

function parseBody(body: string): unknown {
    try {
        return JSON.parse(body);
    } catch {
        return body;
    }
}

type TokenClaims = {
    id: string;
    userType: UserType;
    email?: string;
    deviceKinds?: DeviceKind[];
    expiresInSeconds?: number;
};

export function fakeToken(claims: TokenClaims): string {
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        id: claims.id,
        userType: claims.userType,
        ...(claims.email && { email: claims.email }),
        ...(claims.deviceKinds && { deviceKinds: claims.deviceKinds }),
        iat: now,
        exp: now + (claims.expiresInSeconds ?? 3600)
    };
    return `${encode({ alg: "ES256", typ: "JWT" })}.${encode(payload)}.signature`;
}

export const ADMIN_TOKEN = fakeToken({
    id: "Max",
    userType: UserType.ADMIN,
    email: "max@example.com"
});

export const POLAROID_FRIEND_TOKEN = fakeToken({
    id: "Ada",
    userType: UserType.FRIEND,
    email: "ada@example.com",
    deviceKinds: [DeviceKind.POLAROID]
});

export async function signedIn(page: Page, token: string) {
    await page.addInitScript((value) => {
        sessionStorage.setItem("HAS_BOOTED_UP", "true");
        sessionStorage.setItem("AUTH_TOKEN", value);
    }, token);
}

export async function openTerminal(page: Page) {
    await page.goto("/");
    await expect(page.locator("main input")).toBeFocused();
}

export async function skipBoot(page: Page) {
    await page.addInitScript(() => sessionStorage.setItem("HAS_BOOTED_UP", "true"));
}
