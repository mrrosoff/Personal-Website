import { describe, expect, it, vi } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockInbox, mockResend } from "../../../mocks/resend";

import { handler } from "../../../../api/endpoints/email/receive";

const data = { email_id: "email_1" };
const event = mockEvent({ body: { type: "email.received", data } });

describe("receive", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should reject a bad signature", async () => {
        mockResend.webhooks.verify.mockImplementation(() => {
            throw new Error("bad signature");
        });

        const result = await handler(event);

        expect(responseBody(result).message).toBe("Invalid Webhook Signature");
    });

    it("should forward the email to Max", async () => {
        const result = await handler(event);

        expect(responseBody(result)).toEqual(data);
        expect(mockInbox).toContainEqual(
            expect.objectContaining({ to: ["me@maxrosoff.com"], attachments: [] })
        );
    });

    it("should forward attachments", async () => {
        mockResend.emails.attachments.list.mockResolvedValue({
            data: { data: [{ download_url: "https://example.com/a" }] },
            error: null
        });
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("file"));

        await handler(event);

        expect(mockInbox).toContainEqual(
            expect.objectContaining({
                attachments: [
                    expect.objectContaining({ content: Buffer.from("file").toString("base64") })
                ]
            })
        );
    });

    it("should throw if the email cannot be fetched", async () => {
        mockResend.emails.receiving.get.mockResolvedValue({
            data: null,
            error: { message: "gone" }
        });

        await expect(handler(event)).rejects.toThrow("Error Fetching Email: gone");
    });

    it("should throw if the attachments cannot be listed", async () => {
        mockResend.emails.attachments.list.mockResolvedValue({
            data: null,
            error: { message: "gone" }
        });

        await expect(handler(event)).rejects.toThrow("Error Retrieving Email Attachments: gone");
    });

    it("should throw if forwarding fails", async () => {
        mockResend.emails.send.mockResolvedValue({ data: null, error: { message: "down" } });

        await expect(handler(event)).rejects.toThrow("Error Forwarding Email: down");
    });
});
