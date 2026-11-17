import { describe, expect, it } from "vitest";

import { mockEvent } from "../../../setup";
import { mockContacts, mockResend } from "../../../mocks/resend";

import { handler } from "../../../../api/endpoints/email/unsubscribe";

describe("unsubscribe", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should remove the contact from the audience", async () => {
        mockContacts.set("a@b.com", { id: "contact", email: "a@b.com" });

        await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(mockContacts.has("a@b.com")).toBe(false);
    });

    it("should throw if removing the contact fails", async () => {
        mockResend.contacts.remove.mockResolvedValue({ data: null, error: { message: "down" } });

        const result = handler(mockEvent({ body: { email: "a@b.com" } }));

        await expect(result).rejects.toThrow("Error Unsubscribing Contact: down");
    });
});
