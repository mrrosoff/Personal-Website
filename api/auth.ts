import type { APIGatewayProxyEvent } from "aws-lambda";
import axios from "axios";
import { IncomingMessage } from "http";
import {
    decode,
    sign,
    verify,
    type JwtPayload,
    type SignOptions,
    type VerifyOptions
} from "jsonwebtoken";
import { JWK } from "node-jose";

import keys from "./jwks/keys.json";
import keyMapping from "./jwks/keyMapping.json";

import { type AccessToken, API_ENDPOINT_URL, UserType } from "./types";

export { UserType };
export type { AccessToken };

export async function verifyJWTFromURI(
    token: string,
    uri: string,
    options?: VerifyOptions
): Promise<JwtPayload | null> {
    try {
        const decoded = decode(token, { complete: true });
        if (!decoded?.header.kid) {
            return null;
        }
        const response = await axios.get(uri);
        const keystore = await JWK.asKeyStore(response.data as object);
        const key = keystore.get(decoded.header.kid);
        return verify(token, key.toPEM(), options) as JwtPayload;
    } catch (err) {
        console.info(err);
        return null;
    }
}

export async function generateToken(
    id: string,
    options: {
        userType: UserType;
        email?: string;
        expiresIn?: SignOptions["expiresIn"];
    }
): Promise<string> {
    console.debug(`Generating auth token for user ${id}`);
    const keyStore = await JWK.asKeyStore(keys);
    const key = keyStore.get(keyMapping.authentication).toPEM(true);
    return sign(
        {
            id,
            userType: options.userType,
            ...(options.email && { email: options.email })
        },
        key,
        {
            algorithm: "ES256",
            issuer: API_ENDPOINT_URL,
            expiresIn: options.expiresIn ?? "6h"
        }
    );
}

export async function decryptToken(token: string): Promise<AccessToken> {
    console.debug(`Decrypting access token for user with token ${token}`);
    const keyStore = await JWK.asKeyStore(keys);
    const key = keyStore.get(keyMapping.authentication).toPEM(true);
    return verify(token, key) as AccessToken;
}

function authorizationHeader(req: IncomingMessage | APIGatewayProxyEvent): string | undefined {
    const header = req.headers?.authorization ?? req.headers?.Authorization;
    return Array.isArray(header) ? undefined : (header ?? undefined);
}

export function bearerToken(req: IncomingMessage | APIGatewayProxyEvent): string | undefined {
    return authorizationHeader(req)?.split(" ")[1];
}

export function isDevice(
    req: IncomingMessage | APIGatewayProxyEvent,
    deviceSecret: string | undefined
): boolean {
    const token = bearerToken(req);
    if (!token || !deviceSecret) {
        return false;
    }
    return token === deviceSecret;
}

export async function authenticateHTTPAccessToken(
    req: IncomingMessage | APIGatewayProxyEvent
): Promise<{ token?: AccessToken; error?: string }> {
    if (!authorizationHeader(req)) {
        return {};
    }

    const token = bearerToken(req);
    if (!token) {
        const error = "Authentication Token Not Specified";
        console.info(error);
        return { error };
    }

    try {
        return { token: await decryptToken(token) };
    } catch (err) {
        console.info(err);
        return { error: "Invalid Authentication Token" };
    }
}

export async function authorizeUserType(
    req: IncomingMessage | APIGatewayProxyEvent,
    allowed: UserType[]
): Promise<{ token?: AccessToken; error?: string }> {
    const { token, error } = await authenticateHTTPAccessToken(req);
    if (error) {
        return { error };
    }
    return token && [...allowed, UserType.ADMIN].includes(token.userType) ? { token } : {};
}

export async function isAdmin(event: IncomingMessage | APIGatewayProxyEvent): Promise<boolean> {
    const { token } = await authenticateHTTPAccessToken(event);
    return token?.userType === UserType.ADMIN;
}
