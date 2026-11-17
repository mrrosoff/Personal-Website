import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";
import { mockResend } from "../../../__mocks__/resend";

import { handler } from "../../../../api/endpoints/friends/suggestFlavor";
import { UserType } from "../../../../api/types";

describe("suggestFlavor", () => {
    it("should need a friend", async () => {
        const token = await mockToken(UserType.SUBSCRIBER);

        const result = await handler(mockEvent({ token, body: { flavor: "Fig" } }));

        expect(result.statusCode).toBe(401);
    });

    it("should need a body", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token }));

        expect(result.statusCode).toBe(400);
    });

    it("should need a flavor", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, body: { flavor: "  " } }));

        expect(responseBody(result).message).toBe("Missing Flavor Name");
    });

    it("should email the suggestion", async () => {
        const token = await mockToken(UserType.FRIEND);

        await handler(mockEvent({ token, body: { flavor: "Fig" } }));

        expect(mockResend.emails.send).toHaveBeenCalledWith(
            expect.objectContaining({ subject: `Flavor Suggestion From ${mockPasskey.name}` })
        );
    });

    it("should throw if the email fails", async () => {
        mockResend.emails.send.mockResolvedValue({ data: null, error: { message: "down" } });
        const token = await mockToken(UserType.FRIEND);

        const result = handler(mockEvent({ token, body: { flavor: "Fig" } }));

        await expect(result).rejects.toThrow("Error Sending Flavor Email");
    });
});
