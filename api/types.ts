export type DynamoDBScalar = number | string | boolean | undefined | null;
export type DynamoDBFieldValue =
    | DynamoDBScalar
    | DynamoDBScalar[]
    | { [key: string]: DynamoDBFieldValue };

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

export type PasskeyCredential = {
    id: string; // base64url-encoded ID
    credentialId: string; // base64url-encoded ID
    publicKey: string; // base64url-encoded public key
    transports: AuthenticatorTransport[];
};

export type PasskeyChallenge = {
    challenge: string; // base64url-encoded challenge
    expiresAt: number; // epoch time in seconds
    type: "registration" | "authentication";
};
