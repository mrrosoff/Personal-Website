import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockContacts, mockResend } from "../../../mocks/resend";

import { handler } from "../../../../api/endpoints/email/register";

describe("register", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should return an existing contact", async () => {
        mockContacts.set("a@b.com", { id: "contact", email: "a@b.com" });

        const result = await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(responseBody(result)).toEqual({ userId: "contact" });
        expect(mockContacts.size).toBe(1);
    });

    it("should create a new contact", async () => {
        await handler(mockEvent({ body: { email: "a@b.com", firstName: "Ada" } }));

        expect(mockContacts.get("a@b.com")).toMatchObject({
            firstName: "Ada",
            unsubscribed: false
        });
    });

    it("should throw if the lookup fails", async () => {
        mockResend.contacts.get.mockResolvedValue({ data: null, error: { message: "down" } });

        const result = handler(mockEvent({ body: { email: "a@b.com" } }));

        await expect(result).rejects.toThrow("Error Fetching User: down");
    });

    it("should throw if creating the contact fails", async () => {
        mockResend.contacts.create.mockResolvedValue({ data: null, error: { message: "down" } });

        const result = handler(mockEvent({ body: { email: "a@b.com" } }));

        await expect(result).rejects.toThrow("Error Creating Contact: down");
    });
});
