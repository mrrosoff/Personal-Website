import { render } from "@cf-wasm/og/node";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";
import { mockFlavor } from "../../../__mocks__/__data__/aws/dynamodb";

import { FLAVORS_TABLE } from "../../../../api/common";
import { handler } from "../../../../api/endpoints/preview/preview";

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
        return textOf((node.props as { children?: ReactNode }).children);
    }
    return "";
}

function stockFreezer(...items: object[]) {
    mockDocumentClient.on(ScanCommand, { TableName: FLAVORS_TABLE }).resolves({ Items: items });
}

describe("preview", () => {
    beforeEach(() => {
        vi.mocked(render).mockReturnValue({
            asPng: async () => ({ image: new Uint8Array([1, 2, 3]) })
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
        stockFreezer({ ...mockFlavor, count: 0 }, { ...mockFlavor, type: "upcoming" });

        await handler();

        expect(textOf(renderedCard())).toContain("EMPTY");
    });

    it("should show a last batch flavor in white without a color", async () => {
        stockFreezer({ ...mockFlavor, type: "lastBatch", color: "" });

        await handler();

        expect(JSON.stringify(renderedCard())).toContain('"color":"white"');
    });

    it("should render an empty freezer when the inventory fails to load", async () => {
        mockDocumentClient.on(ScanCommand).rejects(new Error("throttled"));

        await handler();

        expect(textOf(renderedCard())).toContain("EMPTY");
    });
});
