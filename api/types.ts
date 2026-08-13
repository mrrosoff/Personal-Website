export type DynamoDBScalar = number | string | boolean | undefined | null;
export type DynamoDBFieldValue =
    | DynamoDBScalar
    | DynamoDBScalar[]
    | { [key: string]: DynamoDBFieldValue };

export type PolaroidObjectKey = `framebuffer/${string}.bin` | `preview/${string}.png`;
export const API_ENDPOINT_URL = "https://api.maxrosoff.com";
export const JWKS_URI = `${API_ENDPOINT_URL}/jwks`;

export const FLAVOR_TYPES = ["currentFlavor", "lastBatch", "upcoming"] as const;
export type FlavorType = (typeof FLAVOR_TYPES)[number];

export type DatabaseFlavor = {
    productId: string;
    priceId: string;
    name: string;
    color: string;
    count: number;
    type: FlavorType | null;
};

export type DatabasePasskeyChallenge = {
    id: string;
    expiresAt: number;
};

export type DatabasePasskey = {
    credentialId: string;
    publicKey: string;
    userType?: UserType;
    name: string;
    email: string;
};

export enum UserType {
    ADMIN,
    FRIEND,
    SPOTIFY_OWNER,
    POLAROID_OWNER,
    SHARE
}

export type AccessToken = {
    id: string;
    userType: UserType;
    email?: string;
    iss: string;
    sub?: string;
    iat: number;
    exp: number;
};
