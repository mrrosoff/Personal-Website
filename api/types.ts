export type DynamoDBScalar = number | string | boolean | undefined;
export type DynamoDBFieldValue =
    | DynamoDBScalar
    | DynamoDBScalar[]
    | { [key: string]: DynamoDBFieldValue };

export type DatabaseFlavor = {
    priceId: string;
    count: number;
};
