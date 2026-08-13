import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export const FLAVORS_TABLE = "website-flavors";
export const PASSKEY_CHALLENGES_TABLE = "website-passkey-challenges";
export const PASSKEYS_TABLE = "website-passkeys";

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
    body: Record<string, any>
): APIGatewayProxyResult {
    const alternativeAllowedOrigins = ["http://localhost:3000"];
    const originHeader = event.headers?.Origin || event.headers?.origin;
    const otherOrigin = alternativeAllowedOrigins.find((origin) => origin === originHeader);
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": otherOrigin ?? "https://maxrosoff.com",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: JSON.stringify(body)
    };
}
