import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { DateTime } from "luxon";

import { getParameters, putSecureParameter } from "../../aws/services/parameterStore";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { REDIRECT_URI, type StatePayload, stateHmac } from "./connect";

export function refreshTokenParam(deviceId: string): string {
    return `/website/spotify/devices/${deviceId}/refresh-token`;
}

export function refreshTokenSetAtParam(deviceId: string): string {
    return `/website/spotify/devices/${deviceId}/refresh-token-set-at`;
}

/**
 * Persists a freshly issued Spotify refresh token and stamps the moment it was
 * issued. The timestamp drives the proactive reauth reminder (see
 * reauthReminder.ts): each new token restarts the expiry countdown.
 */
export async function saveRefreshToken(deviceId: string, token: string): Promise<void> {
    await putSecureParameter(refreshTokenParam(deviceId), token);
    await putSecureParameter(
        refreshTokenSetAtParam(deviceId),
        DateTime.now().toMillis().toString()
    );
}

type SpotifyTokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
};

/** The payload when the signature checks out and it has not expired, else null. */
function parseState(state: string, secret: string): StatePayload | null {
    const [encoded, signature] = state.split(".");
    if (!encoded || !signature) return null;

    if (stateHmac(encoded, secret) !== signature) return null;

    try {
        const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as StatePayload;
        if (payload.exp < DateTime.now().toSeconds() || !payload.deviceId) return null;
        return payload;
    } catch {
        return null;
    }
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const { code, state } = JSON.parse(event.body);
    if (!code || !state) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Code or State");
    }

    const {
        "/website/spotify/client-id": clientId,
        "/website/spotify/client-secret": clientSecret
    } = await getParameters("/website/spotify/client-id", "/website/spotify/client-secret");

    const statePayload = parseState(state, clientSecret);
    if (!statePayload) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            "Invalid or Expired State"
        );
    }

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
    });
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const { data } = await axios.post<SpotifyTokenResponse>(
        "https://accounts.spotify.com/api/token",
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${basicAuth}`
            }
        }
    );

    await saveRefreshToken(statePayload.deviceId, data.refresh_token);
    return buildResponse(event, HttpResponseStatus.OK, { connected: true });
};
