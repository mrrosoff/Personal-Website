import { render } from "@cf-wasm/og/node";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockDocumentClient, mockDynamoDB, mockFlavor } from "../../../mocks/aws/dynamodb";
import { mockToken } from "../../../setup";

import { FLAVORS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/preview/preview";
import { UserType } from "../../../../api/types";

vi.mock("@cf-wasm/og/node", () => ({
    render: vi.fn(),
    CustomFont: vi.fn()
}));
vi.mock("../../../../public/fonts/clacon.ttf", () => ({ default: "font" }));
vi.mock("../../../../public/images/profile.jpg", () => ({ default: "photo" }));

function renderedCard(): ReactElement {
    return vi.mocked(render).mock.calls[0][0] as ReactElement;
}

function textOf(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(textOf).join("");
    if (node && typeof node === "object" && "props" in node) {
        const element = node as ReactElement<{ children?: ReactNode }>;
        return typeof element.type === "function"
            ? textOf((element.type as (props: object) => ReactNode)(element.props))
            : textOf(element.props.children);
    }
    return "";
}

describe("preview", () => {
    beforeEach(() => {
        vi.mocked(render).mockReturnValue({
            asPng: () => Promise.resolve({ image: new Uint8Array([1, 2, 3]) })
        } as never);
    });

    it("should return the card as a base64 png", async () => {
        const result = await handler();

        expect(result).toBe(Buffer.from([1, 2, 3]).toString("base64"));
    });

    it("should list the flavors in the freezer", async () => {
        await handler();

        expect(textOf(renderedCard())).toContain("1 FLAVORS");
        expect(textOf(renderedCard())).toContain(mockFlavor.name);
    });

    it("should leave out flavors that are sold out or not for sale", async () => {
        mockDynamoDB.seed(
            FLAVORS_TABLE,
            { ...mockFlavor, count: 0 },
            { ...mockFlavor, productId: "prod_upcoming", type: "upcoming" }
        );

        await handler();

        expect(textOf(renderedCard())).toContain("EMPTY");
    });

    it("should show a last batch flavor in white without a color", async () => {
        mockDynamoDB.seed(FLAVORS_TABLE, { ...mockFlavor, type: "lastBatch", color: "" });

        await handler();

        expect(JSON.stringify(renderedCard())).toContain('"color":"white"');
    });

    it("should render an empty freezer when the inventory fails to load", async () => {
        mockDocumentClient.on(ScanCommand).rejects(new Error("throttled"));

        await handler();

        expect(textOf(renderedCard())).toContain("EMPTY");
    });

    it("should name the friend an invite is for", async () => {
        const invite = await mockToken(UserType.SHARE, { id: "Ada" });

        await handler({ queryStringParameters: { token: invite } });

        expect(textOf(renderedCard())).toContain("Checking Invite . . . . . .\u00a0FOR ADA");
    });

    it("should say when the invite expires, in San Francisco time", async () => {
        vi.useFakeTimers({ now: new Date("2026-11-17T20:00:00Z"), toFake: ["Date"] });
        const invite = await mockToken(UserType.SHARE, { id: "Ada", expiresIn: "3d" });

        await handler({ queryStringParameters: { token: invite } });
        vi.useRealTimers();

        expect(textOf(renderedCard())).toContain(
            "Invite Expires . . . . . .\u00a0NOV 20, 12:00 PM"
        );
    });

    it("should shorten a long name", async () => {
        const invite = await mockToken(UserType.SHARE, { id: "Bartholomew Montgomery" });

        await handler({ queryStringParameters: { token: invite } });

        expect(textOf(renderedCard())).toContain("FOR BARTHOLOMEW MONTGOM…");
    });

    it("should not describe a friend or admin token", async () => {
        const token = await mockToken(UserType.FRIEND, { id: "Ada" });

        await handler({ queryStringParameters: { token } });

        expect(textOf(renderedCard())).toBe(
            "Max RosoffBooting Rosoff OS . . . . . .\u00a0SUCCESS" +
                `Checking Freezer Stash . . . . . .\u00a01 FLAVORS${mockFlavor.name}maxrosoff.com`
        );
    });

    it("should flag a link that cannot be verified", async () => {
        await handler({ queryStringParameters: { token: "not-a-token" } });

        expect(textOf(renderedCard())).toContain("Checking Link . . . . . .\u00a0INVALID");
    });

    it("should say when an invite has expired", async () => {
        const invite = await mockToken(UserType.SHARE, { id: "Ada", expiresIn: -60 });

        await handler({ queryStringParameters: { token: invite } });

        expect(textOf(renderedCard())).toContain("FOR ADA");
        expect(textOf(renderedCard())).toContain("Invite Expires . . . . . .\u00a0EXPIRED");
    });

    it("should recognize a subscription link without showing the email", async () => {
        const link = await mockToken(UserType.SUBSCRIBER, { id: "sub_1", expiresIn: "7d" });

        await handler({ queryStringParameters: { token: link } });

        expect(textOf(renderedCard())).toContain("Checking Subscription . . . . . .\u00a0FOUND");
        expect(textOf(renderedCard())).toContain("Link Expires");
        expect(textOf(renderedCard())).not.toContain("@");
    });

    it("should say when a subscription link has expired", async () => {
        const link = await mockToken(UserType.SUBSCRIBER, { id: "sub_1", expiresIn: -60 });

        await handler({ queryStringParameters: { token: link } });

        expect(textOf(renderedCard())).toContain("Link Expires . . . . . .\u00a0EXPIRED");
    });

    it("should add nothing without a token", async () => {
        await handler({ queryStringParameters: { token: "" } });

        expect(textOf(renderedCard())).not.toContain("Checking Invite");
    });
});
