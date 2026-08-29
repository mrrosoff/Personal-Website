import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";

import { getParameter, getParameters } from "../../aws/services/parameterStore";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { resolveDevice } from "../devices";
import { DeviceKind } from "../../types";
import { refreshTokenParam, saveRefreshToken } from "./exchange";

type SpotifyRefreshResponse = {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const device = await resolveDevice(event, DeviceKind.SPOTIFY);
    if (!device) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Invalid Device Token");
    }

    const {
        "/website/spotify/client-id": clientId,
        "/website/spotify/client-secret": clientSecret
    } = await getParameters("/website/spotify/client-id", "/website/spotify/client-secret");

    const refreshToken = await getParameter(refreshTokenParam(device.deviceId));

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
                console.error("Spotify Token Request Failed", err.response?.data ?? err.message);
                return buildErrorResponse(
                    event,
                    HttpResponseStatus.SERVICE_UNAVAILABLE,
                    "Spotify Token Request Failed"
                );
            }
        }
        console.error(err);
        throw err;
    }

    if (data.refresh_token && data.refresh_token !== refreshToken) {
        await saveRefreshToken(device.deviceId, data.refresh_token);
    }

    return buildResponse(event, HttpResponseStatus.OK, {
        access_token: data.access_token,
        expires_in: data.expires_in
    });
};
