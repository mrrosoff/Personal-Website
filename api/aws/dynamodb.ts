import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { FLAVORS_TABLE } from "../../infrastructure/WebsiteAPIStack";
import { DatabaseFlavor, DynamoDBFieldValue } from "../types";

export type Table = typeof FLAVORS_TABLE;

// prettier-ignore
type ItemKeyInput<T extends Table> =
    T extends typeof FLAVORS_TABLE ? string :
    never;

type UpdateItemInput<T extends Table> = Partial<
    Record<ValuesOfType<TableObject<T>, DynamoDBFieldValue>, DynamoDBFieldValue>
>;

// prettier-ignore
export type TableObject<T extends Table> =
    T extends typeof FLAVORS_TABLE ? DatabaseFlavor :
    never;

// prettier-ignore
export type ValuesOfType<T, TCondition> = {
    [K in keyof T]: T[K] extends TCondition | undefined ? K : never;
}[keyof T] & string;

const dynamodbClient = new DynamoDBClient();
export const documentClient = DynamoDBDocument.from(dynamodbClient);

const primaryKeys: Record<Table, string> = {
    [FLAVORS_TABLE]: "priceId"
};

export async function getAllItems<T extends Table>(table: T): Promise<TableObject<T>[]> {
    console.debug(`Getting all items from ${table}`);

    const scanItemsRequest = new ScanCommand({ TableName: table });
    const itemOutput = await documentClient.send(scanItemsRequest);
    if (!itemOutput.Items) {
        return [];
    }
    return itemOutput.Items as TableObject<T>[];
}

export async function decrementPropertyCount<T extends Table>(
    table: T,
    key: ItemKeyInput<T>,
    propertyName: ValuesOfType<TableObject<T>, number>
): Promise<TableObject<T>> {
    console.debug(
        `Decrementing ${String(propertyName)} by 1 for item in ${table} with id ${JSON.stringify(key)}`
    );
    const compositeKey = { [primaryKeys[table]]: key };

    const updateItemRequest = new UpdateCommand({
        TableName: table,
        Key: compositeKey,
        UpdateExpression: `SET #prop = #prop - :dec`,
        ExpressionAttributeNames: {
            "#prop": propertyName
        },
        ExpressionAttributeValues: {
            ":dec": 1
        },
        ReturnValues: "ALL_NEW"
    });
    const itemOutput = await documentClient.send(updateItemRequest);
    const object = itemOutput.Attributes as TableObject<T> | undefined;
    if (!object) {
        throw new Error("Called DynamoDB Without Validating Item Exists");
    }
    return object;
}
