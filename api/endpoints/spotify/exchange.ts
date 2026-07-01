import { timingSafeEqual } from "crypto";

import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { DateTime } from "luxon";

import { getParameters, putSecureParameter } from "../../aws/services/parameterStore";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { REDIRECT_URI, type StatePayload, stateHmac } from "./connect";

const REFRESH_TOKEN_PARAM = "/website/spotify/refresh-token";
const REFRESH_TOKEN_SET_AT_PARAM = "/website/spotify/refresh-token-set-at";

/**
 * Persists a freshly issued Spotify refresh token and stamps the moment it was
 * issued. The timestamp drives the proactive reauth reminder (see
 * reauthReminder.ts): each new token restarts the expiry countdown.
 */
export async function saveRefreshToken(token: string): Promise<void> {
    await putSecureParameter(REFRESH_TOKEN_PARAM, token);
    await putSecureParameter(REFRESH_TOKEN_SET_AT_PARAM, DateTime.now().toMillis().toString());
}

type SpotifyTokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
};

function isValidState(state: string, secret: string): boolean {
    const [encoded, signature] = state.split(".");
    if (!encoded || !signature) return false;

    const a = Buffer.from(signature);
    const b = Buffer.from(stateHmac(encoded, secret));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

    try {
        const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as StatePayload;
        return payload.exp >= DateTime.now().toSeconds();
    } catch {
        return false;
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

    if (!isValidState(state, clientSecret)) {
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

    await saveRefreshToken(data.refresh_token);
    return buildResponse(event, HttpResponseStatus.OK, { connected: true });
};
