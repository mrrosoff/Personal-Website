import { render } from "@cf-wasm/og/node";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { textOf } from "../../../helpers/card";
import { mockDocumentClient, mockFlavor } from "../../../mocks/aws/dynamodb";
import { mockToken } from "../../../setup";

import { handler } from "../../../../api/endpoints/preview/preview";
import { PREVIEW_CARD_PAGES } from "../../../../api/previewCardPages.mts";
import { UserType } from "../../../../api/types";

vi.mock("@cf-wasm/og/node", () => ({
    render: vi.fn(),
    CustomFont: vi.fn()
}));

function renderedText(): string {
    return textOf(vi.mocked(render).mock.calls[0][0] as ReactElement);
}

beforeEach(() => {
    vi.mocked(render).mockReturnValue({
        asPng: () => Promise.resolve({ image: new Uint8Array([1, 2, 3]) })
    } as never);
});

describe("preview", () => {
    it("should return the card as a base64 png", async () => {
        const result = await handler();

        expect(result).toBe(Buffer.from([1, 2, 3]).toString("base64"));
    });

    it("should show the home card without a page", async () => {
        await handler({ queryStringParameters: {} });

        expect(renderedText()).toMatch(/Terminal[ .]+ONLINE/);
    });

    it("should show the home card for a page without its own", async () => {
        await handler({ queryStringParameters: { page: "/privacy-policy" } });

        expect(renderedText()).toMatch(/Terminal[ .]+ONLINE/);
    });

    it("should show the freezer for the shop", async () => {
        await handler({ queryStringParameters: { page: "/ice-cream/checkout" } });

        expect(renderedText()).toContain("Max's Freezer Stash");
        expect(renderedText()).toContain(mockFlavor.name);
    });

    it("should show an empty freezer when the flavors cannot be loaded", async () => {
        mockDocumentClient.on(ScanCommand).rejects(new Error("throttled"));

        await handler({ queryStringParameters: { page: "/ice-cream" } });

        expect(renderedText()).toContain("Restocking soon");
    });

    it("should show the mailing list card", async () => {
        await handler({ queryStringParameters: { page: "/ice-cream/mailing-list" } });

        expect(renderedText()).toContain("Mailing List");
    });

    it("should show the invite card with the invite", async () => {
        const token = await mockToken(UserType.SHARE, { id: "Ada" });

        await handler({ queryStringParameters: { page: "/register-friend", token } });

        expect(renderedText()).toContain("Ada");
    });

    it("should show the home card for an invite that cannot be verified", async () => {
        await handler({ queryStringParameters: { page: "/register-friend", token: "x" } });

        expect(renderedText()).toMatch(/Terminal[ .]+ONLINE/);
    });

    it("should show the home card for an invite link without a token", async () => {
        await handler({ queryStringParameters: { page: "/register-friend" } });

        expect(renderedText()).toMatch(/Terminal[ .]+ONLINE/);
    });

    it("should show the home card for a token that is not an invite", async () => {
        const token = await mockToken(UserType.FRIEND, { id: "Ada" });

        await handler({ queryStringParameters: { page: "/register-friend", token } });

        expect(renderedText()).not.toContain("Ada");
    });

    it("should show the subscription card with the link", async () => {
        const token = await mockToken(UserType.SUBSCRIBER, { id: "sub_1" });

        await handler({ queryStringParameters: { page: "/ice-cream/cancel", token } });

        expect(renderedText()).toContain("Manage or cancel anytime");
    });

    it("should show the home card for a link that is not a subscription", async () => {
        const token = await mockToken(UserType.SHARE, { id: "Ada" });

        await handler({ queryStringParameters: { page: "/ice-cream/cancel", token } });

        expect(renderedText()).toMatch(/Terminal[ .]+ONLINE/);
    });

    it("should give every page that runs the preview function its own card", async () => {
        const tokens = {
            "/register-friend": await mockToken(UserType.SHARE, { id: "Ada" }),
            "/ice-cream/cancel": await mockToken(UserType.SUBSCRIBER, { id: "sub_1" })
        };

        for (const page of PREVIEW_CARD_PAGES) {
            vi.mocked(render).mockClear();
            const token = page in tokens ? tokens[page as keyof typeof tokens] : undefined;

            await handler({ queryStringParameters: { page, token } });

            expect(renderedText()).not.toMatch(/Terminal[ .]+ONLINE/);
        }
    });
});
