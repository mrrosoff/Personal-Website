import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export const FLAVORS_TABLE = "website-flavors";
export const PASSKEY_CHALLENGES_TABLE = "website-passkey-challenges";
export const PASSKEYS_TABLE = "website-passkeys";
export const DEVICES_TABLE = "website-devices";

export const LOCAL_ORIGIN = "http://localhost:3000";

export const POLAROID_PHOTOS_BUCKET = "website-polaroid-photos";
export const MAX_PHOTOS = 50;

export const SHARE_TOKEN_MIN_HOURS = 1;
export const SHARE_TOKEN_MAX_HOURS = 24 * 7;
export const SHARE_TOKEN_DEFAULT_HOURS = 6;

export function shareTokenDurationLabel(hours: number): string {
    if (hours >= 24 && hours % 24 === 0) {
        const days = hours / 24;
        return `${days.toString()} ${days === 1 ? "Day" : "Days"}`;
    }
    return `${hours.toString()} ${hours === 1 ? "Hour" : "Hours"}`;
}

export enum HttpResponseStatus {
    OK = 200,
    SPOTIFY_NEEDS_AUTH = 246,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503
}

export function buildErrorResponse(
    event: APIGatewayEvent,
    statusCode: HttpResponseStatus,
    message: string
): APIGatewayProxyResult {
    return buildResponse(event, statusCode, { message });
}

export function buildResponse(
    event: APIGatewayEvent,
    statusCode: HttpResponseStatus,
    body: object
): APIGatewayProxyResult {
    const alternativeAllowedOrigins = [LOCAL_ORIGIN];
    const originHeader = event.headers.Origin || event.headers.origin;
    const otherOrigin = alternativeAllowedOrigins.find((origin) => origin === originHeader);
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": otherOrigin ?? "https://maxrosoff.com",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE"
        },
        body: JSON.stringify(body)
    };
}
