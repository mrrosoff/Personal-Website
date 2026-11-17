import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockDynamoDB } from "../../../__mocks__/__aws__/dynamodb";
import { mockParameters } from "../../../__mocks__/__aws__/parameterStore";
import { mockDevice } from "../../../__mocks__/__data__/aws/dynamodb";

import { DEVICES_TABLE } from "../../../../api/common";
import { REDIRECT_URI, handler, stateHmac } from "../../../../api/endpoints/spotify/connect";
import { DeviceKind, UserType } from "../../../../api/types";

const secret = mockParameters["/website/spotify/client-secret"];

function ownSpotifyDisplay() {
    mockDynamoDB.seed(DEVICES_TABLE, { ...mockDevice, kind: DeviceKind.SPOTIFY });
}

async function authorizeUrl() {
    const token = await mockToken(UserType.FRIEND);
    const result = await handler(mockEvent({ token }));
    return new URL(responseBody(result).authorizeUrl as string);
}

describe("connect", () => {
    it("should need a friend", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(401);
    });

    it("should 404 a friend without a display", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).message).toBe("No Spotify Display Registered");
    });

    it("should send the friend to spotify", async () => {
        ownSpotifyDisplay();

        const result = await authorizeUrl();

        expect(result.origin + result.pathname).toBe("https://accounts.spotify.com/authorize");
        expect(result.searchParams.get("redirect_uri")).toBe(REDIRECT_URI);
        expect(result.searchParams.get("client_id")).toBe(
            mockParameters["/website/spotify/client-id"]
        );
    });

    it("should sign the state for the display", async () => {
        ownSpotifyDisplay();

        const [encoded, signature] =
            (await authorizeUrl()).searchParams.get("state")?.split(".") ?? [];

        expect(signature).toBe(stateHmac(encoded, secret));
        expect(JSON.parse(Buffer.from(encoded, "base64url").toString())).toMatchObject({
            deviceId: mockDevice.deviceId
        });
    });
});
