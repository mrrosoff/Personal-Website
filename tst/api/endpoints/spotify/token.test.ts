import { PutParameterCommand } from "@aws-sdk/client-ssm";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { mockEvent, responseBody } from "../../../setup";
import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";
import { mockParameters, mockSSMClient } from "../../../__mocks__/__aws__/parameterStore";
import { AxiosError, axiosPost } from "../../../__mocks__/axios";
import { mockDevice, mockDeviceToken } from "../../../__mocks__/__data__/aws/dynamodb";

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
    mockDocumentClient
        .on(GetCommand, { TableName: DEVICES_TABLE })
        .resolves({ Item: { ...mockDevice, kind: DeviceKind.SPOTIFY } });
    mockParameters[refreshParam] = "refresh";
    axiosPost.mockResolvedValue({ data: { access_token: "access", expires_in: 3600 } });
});

afterEach(() => {
    delete mockParameters[refreshParam];
});

describe("token", () => {
    it("should need a display", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(401);
    });

    it("should ask to connect a display that never has", async () => {
        delete mockParameters[refreshParam];

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

        expect(mockSSMClient).toHaveReceivedCommandWith(PutParameterCommand, {
            Name: refreshParam,
            Value: "new"
        });
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

    it("should rethrow anything else", async () => {
        axiosPost.mockRejectedValue(spotifyError(401, { error: "invalid_client" }));

        const result = handler(event);

        await expect(result).rejects.toThrow("failed");
    });
});
