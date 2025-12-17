import { APIGatewayProxyEvent } from "aws-lambda";
import axios from "axios";
import { IncomingMessage } from "http";
import { decode, JwtPayload, sign, verify, VerifyOptions } from "jsonwebtoken";
import { JWK } from "node-jose";

import { API_ENDPOINT_URL } from "./types";

import keys from "./jwks/keys.json";
import keyMapping from "./jwks/keyMapping.json";

export type AccessToken = {
    id: string;
    iss: string;
    sub?: string;
    iat: number;
    exp: number;
};

export enum GrantType {
    AUTH,
    REFRESH
}

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
        console.error(err);
        return null;
    }
}

export async function generateToken(
    grant_type: GrantType = GrantType.AUTH
): Promise<string> {
    console.debug(`Generating ${GrantType[grant_type]} token`);
    const keyStore = await JWK.asKeyStore(keys);
    const key = keyStore.get(keyMapping.authentication).toPEM(true);
    return sign({ sour: "cream" }, key, {
        algorithm: "ES256",
        issuer: API_ENDPOINT_URL,
        expiresIn: `${getTokenExpiryInHours(grant_type)}h`
    });
}

function getTokenExpiryInHours(grant_type: GrantType) {
    switch (grant_type) {
        case GrantType.AUTH:
            return 6;
        case GrantType.REFRESH:
            return 48;
    }
}

export async function decryptToken(token: string): Promise<AccessToken> {
    console.debug(`Decrypting access token for user with token ${token}`);
    const keyStore = await JWK.asKeyStore(keys);
    const key = keyStore.get(keyMapping.authentication).toPEM(true);
    return verify(token, key) as AccessToken;
}
