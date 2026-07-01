import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";

import { getParameters } from "../../aws/services/parameterStore";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { saveRefreshToken } from "./exchange";

type SpotifyRefreshResponse = {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
};

function bearerToken(event: APIGatewayEvent): string | undefined {
    const header = event.headers?.Authorization ?? event.headers?.authorization;
    return header?.split(" ")[1];
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const {
        "/website/spotify/client-id": clientId,
        "/website/spotify/client-secret": clientSecret,
        "/website/spotify/device-secret": deviceSecret,
        "/website/spotify/refresh-token": refreshToken
    } = await getParameters(
        "/website/spotify/client-id",
        "/website/spotify/client-secret",
        "/website/spotify/device-secret",
        "/website/spotify/refresh-token"
    );

    if (!deviceSecret || bearerToken(event) !== deviceSecret) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Invalid Device Token");
    }

    if (!refreshToken) {
        return buildErrorResponse(event, HttpResponseStatus.SPOTIFY_NEEDS_AUTH, "Never Connected");
    }

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
    });
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    let data: SpotifyRefreshResponse;
    try {
        ({ data } = await axios.post<SpotifyRefreshResponse>(
            "https://accounts.spotify.com/api/token",
            body.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${basicAuth}`
                },
                timeout: 10000
            }
        ));
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 400 && err.response.data?.error === "invalid_grant") {
                return buildErrorResponse(
                    event,
                    HttpResponseStatus.SPOTIFY_NEEDS_AUTH,
                    "Reauthentication Required"
                );
            }
            if (!err.response || err.response.status >= 500) {
                return buildErrorResponse(
                    event,
                    HttpResponseStatus.SERVICE_UNAVAILABLE,
                    "Spotify Token Request Failed"
                );
            }
        }
        throw err;
    }

    if (data.refresh_token && data.refresh_token !== refreshToken) {
        await saveRefreshToken(data.refresh_token);
    }

    return buildResponse(event, HttpResponseStatus.OK, {
        access_token: data.access_token,
        expires_in: data.expires_in
    });
};
