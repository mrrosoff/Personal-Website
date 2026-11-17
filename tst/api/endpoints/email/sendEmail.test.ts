import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockBroadcastId, mockInbox, mockResend } from "../../../mocks/resend";

import { handler, sendOrderSuccessEmails } from "../../../../api/endpoints/email/sendEmail";
import { UserType } from "../../../../api/types";

const order = { customerEmail: "a@b.com", items: [{ name: "Fig", quantity: 1 }] };

describe("sendEmail", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should be admin only", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, body: { message: "hi" } }));

        expect(result.statusCode).toBe(401);
    });

    it("should send a flavor drop broadcast", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await handler(mockEvent({ token, body: { message: "hi" } }));

        expect(responseBody(result)).toEqual({ broadcastId: mockBroadcastId });
        expect(mockResend.broadcasts.send).toHaveBeenCalledWith(mockBroadcastId);
    });

    it("should throw if the broadcast cannot be created", async () => {
        mockResend.broadcasts.create.mockResolvedValue({ data: null, error: { message: "down" } });
        const token = await mockToken(UserType.ADMIN);

        const result = handler(mockEvent({ token, body: { message: "hi" } }));

        await expect(result).rejects.toThrow("Error Creating Broadcast: down");
    });

    it("should throw if the broadcast cannot be sent", async () => {
        mockResend.broadcasts.send.mockResolvedValue({ data: null, error: { message: "down" } });
        const token = await mockToken(UserType.ADMIN);

        const result = handler(mockEvent({ token, body: { message: "hi" } }));

        await expect(result).rejects.toThrow("Error Sending Broadcast: down");
    });
});

describe("sendOrderSuccessEmails", () => {
    it("should only email Max by default", async () => {
        await sendOrderSuccessEmails(order);

        expect(mockInbox.map(({ to }) => to)).toEqual(["me@maxrosoff.com"]);
    });

    it("should email the customer when asked", async () => {
        await sendOrderSuccessEmails({ ...order, notifyCustomer: true });

        expect(mockInbox.map(({ to, subject }) => [to, subject])).toEqual([
            ["me@maxrosoff.com", "Ice Cream Order"],
            ["a@b.com", "Your Ice Cream Order"]
        ]);
    });

    it("should throw if Max's email fails", async () => {
        mockResend.emails.send.mockResolvedValue({ data: null, error: { message: "down" } });

        const result = sendOrderSuccessEmails(order);

        await expect(result).rejects.toThrow("Error Sending Order Success Email");
    });

    it("should not throw if only the customer's email fails", async () => {
        mockResend.emails.send
            .mockResolvedValueOnce({ data: { id: "1" }, error: null })
            .mockResolvedValueOnce({ data: null, error: { message: "bounced" } });

        const result = sendOrderSuccessEmails({ ...order, notifyCustomer: true });

        await expect(result).resolves.toBeUndefined();
    });
});
