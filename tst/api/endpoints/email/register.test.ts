import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockContactId, mockResend } from "../../../__mocks__/resend";

import { handler } from "../../../../api/endpoints/email/register";

describe("register", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should return an existing contact", async () => {
        const result = await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(responseBody(result)).toEqual({ userId: mockContactId });
        expect(mockResend.contacts.create).not.toHaveBeenCalled();
    });

    it("should create a new contact", async () => {
        mockResend.contacts.get.mockResolvedValue({ data: null, error: { name: "not_found" } });

        await handler(mockEvent({ body: { email: "a@b.com", firstName: "Ada" } }));

        expect(mockResend.contacts.create).toHaveBeenCalledWith(
            expect.objectContaining({ email: "a@b.com", firstName: "Ada", unsubscribed: false })
        );
    });

    it("should throw if the lookup fails", async () => {
        mockResend.contacts.get.mockResolvedValue({ data: null, error: { message: "down" } });

        const result = handler(mockEvent({ body: { email: "a@b.com" } }));

        await expect(result).rejects.toThrow("Error Fetching User: down");
    });

    it("should throw if creating the contact fails", async () => {
        mockResend.contacts.get.mockResolvedValue({ data: null, error: { name: "not_found" } });
        mockResend.contacts.create.mockResolvedValue({ data: null, error: { message: "down" } });

        const result = handler(mockEvent({ body: { email: "a@b.com" } }));

        await expect(result).rejects.toThrow("Error Creating Contact: down");
    });
});
