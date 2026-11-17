import { describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockParameterStore, mockParameters } from "../../../mocks/aws/parameterStore";
import { axiosPost } from "../../../mocks/axios";
import { mockDevice } from "../../../mocks/aws/dynamodb";

import { stateHmac } from "../../../../api/endpoints/spotify/connect";
import {
    handler,
    refreshTokenParam,
    refreshTokenSetAtParam
} from "../../../../api/endpoints/spotify/exchange";

function mockState(payload: object, secret = mockParameters["/website/spotify/client-secret"]) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${encoded}.${stateHmac(encoded, secret)}`;
}

const validState = mockState({ exp: Date.now() / 1000 + 600, deviceId: mockDevice.deviceId });

describe("exchange", () => {
    it("should need a body", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(400);
    });

    it("should need a code and state", async () => {
        const result = await handler(mockEvent({ body: {} }));

        expect(responseBody(result).message).toBe("Missing Code or State");
    });

    it("should reject a forged state", async () => {
        const state = mockState({ exp: Date.now() / 1000 + 600, deviceId: "x" }, "wrong secret");

        const result = await handler(mockEvent({ body: { code: "c", state } }));

        expect(responseBody(result).message).toBe("Invalid or Expired State");
    });

    it("should reject an expired state", async () => {
        const state = mockState({ exp: 0, deviceId: mockDevice.deviceId });

        const result = await handler(mockEvent({ body: { code: "c", state } }));

        expect(responseBody(result).message).toBe("Invalid or Expired State");
    });

    it("should reject a state that is not JSON", async () => {
        const encoded = Buffer.from("junk").toString("base64url");
        const state = `${encoded}.${stateHmac(encoded, mockParameters["/website/spotify/client-secret"])}`;

        const result = await handler(mockEvent({ body: { code: "c", state } }));

        expect(responseBody(result).message).toBe("Invalid or Expired State");
    });

    it("should save the refresh token for the display", async () => {
        axiosPost.mockResolvedValue({ data: { refresh_token: "refresh" } });

        const result = await handler(mockEvent({ body: { code: "c", state: validState } }));

        expect(responseBody(result)).toEqual({ connected: true });
        expect(mockParameterStore.get(refreshTokenParam(mockDevice.deviceId))).toBe("refresh");
        expect(mockParameterStore.has(refreshTokenSetAtParam(mockDevice.deviceId))).toBe(true);
    });

    it("should reject a state without a signature", async () => {
        const result = await handler(mockEvent({ body: { code: "c", state: "unsigned" } }));

        expect(responseBody(result).message).toBe("Invalid or Expired State");
    });
});
