import { createHmac } from "crypto";

import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { DateTime, Duration } from "luxon";

import { getParameters } from "../../aws/services/parameterStore";
import { authenticateHTTPAccessToken, UserType } from "../../auth";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";

export const REDIRECT_URI = "https://maxrosoff.com/spotify/callback";
const SPOTIFY_SCOPE = "user-read-currently-playing";
const STATE_TTL = Duration.fromObject({ minutes: 10 });

export type StatePayload = { exp: number };

export function stateHmac(encodedPayload: string, secret: string): string {
    return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

/**
 * Builds the OAuth `state` as `encoded.signature` (like a JWT), so the public
 * /callback can validate it with no server-side storage.
 *
 * - `encoded`: the base64url JSON payload, carrying the expiry. Readable, but
 *   on its own forgeable.
 * - `signature`: an HMAC of `encoded` keyed with the Spotify client secret.
 *   Only we can produce it, and it can't be reversed into the payload.
 *
 * To verify, /callback splits on `.`, recomputes `stateHmac(encoded, secret)`
 * from the received `encoded`, and timing-safe compares it to the received
 * `signature`; a tampered payload won't match, and an expired one is rejected.
 */
function signState(secret: string): string {
    const payload: StatePayload = {
        exp: Math.floor(DateTime.now().plus(STATE_TTL).toSeconds())
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${encoded}.${stateHmac(encoded, secret)}`;
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const payload = await authenticateHTTPAccessToken(event);
    if (payload?.userType !== UserType.ADMIN && payload?.userType !== UserType.SPOTIFY_OWNER) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication required"
        );
    }

    const {
        "/website/spotify/client-id": clientId,
        "/website/spotify/client-secret": clientSecret
    } = await getParameters("/website/spotify/client-id", "/website/spotify/client-secret");

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: SPOTIFY_SCOPE,
        state: signState(clientSecret)
    });
    const authorizeUrl = `https://accounts.spotify.com/authorize?${params}`;

    return buildResponse(event, HttpResponseStatus.OK, { authorizeUrl });
};
