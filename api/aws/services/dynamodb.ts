import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, UpdateCommand, ScanCommand, PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

import { FLAVORS_TABLE, PASSKEY_CHALLENGES_TABLE, PASSKEY_CREDENTIALS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { DatabaseFlavor, DynamoDBFieldValue, PasskeyChallenge, PasskeyCredential } from "../../types";

// prettier-ignore
export type Table =
    typeof FLAVORS_TABLE |
    typeof PASSKEY_CHALLENGES_TABLE |
    typeof PASSKEY_CREDENTIALS_TABLE;

// prettier-ignore
type ItemKeyInput<T extends Table> =
    T extends typeof FLAVORS_TABLE ? string :
    T extends typeof PASSKEY_CHALLENGES_TABLE ? string :
    T extends typeof PASSKEY_CREDENTIALS_TABLE ? string :
    never;

type UpdateItemInput<T extends Table> = Partial<
    Record<ValuesOfType<TableObject<T>, DynamoDBFieldValue>, DynamoDBFieldValue>
>;

// prettier-ignore
export type TableObject<T extends Table> =
    T extends typeof FLAVORS_TABLE ? DatabaseFlavor :
    T extends typeof PASSKEY_CHALLENGES_TABLE ? PasskeyChallenge :
    T extends typeof PASSKEY_CREDENTIALS_TABLE ? PasskeyCredential :
    never;

// prettier-ignore
export type ValuesOfType<T, TCondition> = {
    [K in keyof T]: T[K] extends TCondition | undefined ? K : never;
}[keyof T] & string;

const dynamodbClient = new DynamoDBClient();
export const documentClient = DynamoDBDocument.from(dynamodbClient);

const primaryKeys: Record<Table, string> = {
    [FLAVORS_TABLE]: "productId",
    [PASSKEY_CHALLENGES_TABLE]: "id",
    [PASSKEY_CREDENTIALS_TABLE]: "id"
};

// Generic helper functions for passkey tables
export async function getItem<T extends Table>(table: T, key: Record<string, any>): Promise<any> {
    console.debug(`Getting item from ${table} with key ${JSON.stringify(key)}`);
    const getItemRequest = new GetCommand({ TableName: table, Key: key });
    const itemOutput = await documentClient.send(getItemRequest);
    return itemOutput.Item;
}

export async function getAllItems<T extends Table>(table: T): Promise<TableObject<T>[]> {
    console.debug(`Getting all items from ${table}`);

    const scanItemsRequest = new ScanCommand({ TableName: table });
    const itemOutput = await documentClient.send(scanItemsRequest);
    if (!itemOutput.Items) {
        return [];
    }
    return itemOutput.Items as TableObject<T>[];
}

export async function decrementField<T extends Table>(
    table: T,
    key: ItemKeyInput<T>,
    fieldName: ValuesOfType<TableObject<T>, number>
): Promise<TableObject<T>> {
    console.debug(
        `Decrementing ${String(fieldName)} by 1 for item in ${table} with id ${JSON.stringify(key)}`
    );
    const compositeKey = generateCompositeKey(table, key);

    const updateItemRequest = new UpdateCommand({
        TableName: table,
        Key: compositeKey,
        UpdateExpression: `SET #prop = #prop - :dec`,
        ExpressionAttributeNames: {
            "#prop": fieldName
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

export async function putItem<T extends Table>(
    table: T,
    item: Partial<TableObject<T>>
): Promise<TableObject<T>> {
    console.debug(`Putting item into ${table}`);
    const putItemRequest = new PutCommand({ TableName: table, Item: item });
    await documentClient.send(putItemRequest);
    return item as TableObject<T>;
}

export async function updateItem<T extends Table>(
    table: T,
    id: ItemKeyInput<T>,
    key: ValuesOfType<TableObject<T>, DynamoDBFieldValue>,
    value: DynamoDBFieldValue
): Promise<TableObject<T>> {
    return updateItemFields(table, id, { [key]: value } as UpdateItemInput<T>);
}

export async function updateItemFields<T extends Table>(
    table: T,
    key: ItemKeyInput<T>,
    fields: UpdateItemInput<T>
): Promise<TableObject<T>> {
    console.debug(
        `Updating item in ${table} with id ${JSON.stringify(key)}. New data: ${JSON.stringify(fields)}`
    );
    const compositeKey = generateCompositeKey(table, key);

    const setExpressions: string[] = [];
    const removeExpressions: string[] = [];
    const dynamoAttributeNames: Record<string, string> = {};
    const dynamoAttributeValues: Record<string, DynamoDBFieldValue> = {};
    Object.entries<DynamoDBFieldValue>(fields).forEach(([key, value], i) => {
        dynamoAttributeNames[`#${key}`] = key;
        if (value === undefined) {
            removeExpressions.push(`#${key}`);
        } else {
            dynamoAttributeValues[`:${i}`] = value;
            setExpressions.push(`#${key} = :${i}`);
        }
    });
    const expressionParts = [
        setExpressions.length && `SET ${setExpressions.join(", ")}`,
        removeExpressions.length && `REMOVE ${removeExpressions.join(", ")}`
    ];

    const updateItemRequest = new UpdateCommand({
        TableName: table,
        Key: compositeKey,
        UpdateExpression: expressionParts.filter(Boolean).join(" "),
        ExpressionAttributeNames: dynamoAttributeNames,
        ...(Object.keys(dynamoAttributeValues).length && {
            ExpressionAttributeValues: dynamoAttributeValues
        }),
        ReturnValues: "ALL_NEW"
    });
    const itemOutput = await documentClient.send(updateItemRequest);
    const object = itemOutput.Attributes as TableObject<T> | undefined;
    if (!object) {
        throw new Error("Called DynamoDB Without Validating Item Exists");
    }
    return object;
}

export async function deleteItem<T extends Table>(table: T, key: ItemKeyInput<T>): Promise<TableObject<T>> {
    console.debug(`Deleting item in ${table} with key ${JSON.stringify(key)}.`);
    const compositeKey = generateCompositeKey(table, key);

    const deleteItemRequest = new DeleteCommand({
        TableName: table,
        Key: compositeKey,
        ReturnValues: "ALL_OLD"
    });
    const itemOutput = await documentClient.send(deleteItemRequest);
    const object = itemOutput.Attributes as TableObject<T> | undefined;
    if (!object) {
        throw new Error("Called DynamoDB Without Validating Item Exists");
    }
    return object;
}

function generateCompositeKey<T extends Table>(
    table: T,
    key: ItemKeyInput<T>
): Record<string, string> {
    return typeof key === "string" ? { [primaryKeys[table]]: key } : key;
}
