export type DynamoDBScalar = number | string | boolean | undefined;
export type DynamoDBFieldValue =
    | DynamoDBScalar
    | DynamoDBScalar[]
    | { [key: string]: DynamoDBFieldValue };

export const API_ENDPOINT_URL = "https://api.maxrosoff.com";
export const JWKS_URI = `${API_ENDPOINT_URL}/jwks`;

export type DatabaseFlavor = {
    productId: string;
    priceId: string;
    name: string;
    color: string;
    count: number;
};
