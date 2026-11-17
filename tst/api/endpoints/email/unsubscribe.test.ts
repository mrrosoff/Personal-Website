import { describe, expect, it } from "vitest";

import { mockEvent } from "../../../setup";
import { mockParameters } from "../../../__mocks__/__aws__/parameterStore";
import { mockResend } from "../../../__mocks__/resend";

import { handler } from "../../../../api/endpoints/email/unsubscribe";

describe("unsubscribe", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should remove the contact from the audience", async () => {
        await handler(mockEvent({ body: { email: "a@b.com" } }));

        expect(mockResend.contacts.remove).toHaveBeenCalledWith({
            audienceId: mockParameters["/website/resend/audience"],
            email: "a@b.com"
        });
    });

    it("should throw if removing the contact fails", async () => {
        mockResend.contacts.remove.mockResolvedValue({ data: null, error: { message: "down" } });

        const result = handler(mockEvent({ body: { email: "a@b.com" } }));

        await expect(result).rejects.toThrow("Error Unsubscribing Contact: down");
    });
});
