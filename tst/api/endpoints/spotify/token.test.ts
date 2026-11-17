import { PutParameterCommand } from "@aws-sdk/client-ssm";
import { beforeEach, describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockDynamoDB } from "../../../mocks/aws/dynamodb";
import { mockParameterStore, mockSSMClient } from "../../../mocks/aws/parameterStore";
import { AxiosError, axiosPost } from "../../../mocks/axios";
import { mockDevice, mockDeviceToken } from "../../../fixtures/aws/dynamodb";

import { DEVICES_TABLE } from "../../../../api/common";
import { refreshTokenParam } from "../../../../api/endpoints/spotify/exchange";
import { handler } from "../../../../api/endpoints/spotify/token";
import { DeviceKind } from "../../../../api/types";

const refreshParam = refreshTokenParam(mockDevice.deviceId);
const event = mockEvent({ token: mockDeviceToken });

function spotifyError(status?: number, data?: object) {
    return new AxiosError(
        "failed",
        "ERR",
        undefined,
        undefined,
        status ? ({ status, data } as never) : undefined
    );
}

beforeEach(() => {
    mockDynamoDB.seed(DEVICES_TABLE, { ...mockDevice, kind: DeviceKind.SPOTIFY });
    mockParameterStore.set(refreshParam, "refresh");
    axiosPost.mockResolvedValue({ data: { access_token: "access", expires_in: 3600 } });
});

describe("token", () => {
    it("should need a display", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(401);
    });

    it("should ask to connect a display that never has", async () => {
        mockParameterStore.delete(refreshParam);

        const result = await handler(event);

        expect(result.statusCode).toBe(246);
    });

    it("should hand out an access token", async () => {
        const result = await handler(event);

        expect(responseBody(result)).toEqual({ access_token: "access", expires_in: 3600 });
    });

    it("should save a rotated refresh token", async () => {
        axiosPost.mockResolvedValue({
            data: { access_token: "a", expires_in: 1, refresh_token: "new" }
        });

        await handler(event);

        expect(mockParameterStore.get(refreshParam)).toBe("new");
    });

    it("should not rewrite an unchanged refresh token", async () => {
        axiosPost.mockResolvedValue({
            data: { access_token: "a", expires_in: 1, refresh_token: "refresh" }
        });

        await handler(event);

        expect(mockSSMClient).not.toHaveReceivedCommand(PutParameterCommand);
    });

    it("should ask to reconnect when spotify revokes the grant", async () => {
        axiosPost.mockRejectedValue(spotifyError(400, { error: "invalid_grant" }));

        const result = await handler(event);

        expect(result.statusCode).toBe(246);
    });

    it("should report spotify being down", async () => {
        axiosPost.mockRejectedValue(spotifyError(502));

        const result = await handler(event);

        expect(result.statusCode).toBe(503);
    });

    it("should report spotify being unreachable", async () => {
        axiosPost.mockRejectedValue(spotifyError());

        const result = await handler(event);

        expect(result.statusCode).toBe(503);
    });

    it("should rethrow a bad request that isn't a revoked grant", async () => {
        axiosPost.mockRejectedValue(spotifyError(400, { error: "invalid_request" }));

        const result = handler(event);

        await expect(result).rejects.toThrow();
    });

    it("should rethrow an error that didn't come from the request", async () => {
        axiosPost.mockRejectedValue(new Error("boom"));

        const result = handler(event);

        await expect(result).rejects.toThrow("boom");
    });

    it("should rethrow anything else", async () => {
        axiosPost.mockRejectedValue(spotifyError(401, { error: "invalid_client" }));

        const result = handler(event);

        await expect(result).rejects.toThrow("failed");
    });
});
