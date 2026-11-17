import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocument,
    UpdateCommand,
    QueryCommand,
    ScanCommand,
    PutCommand,
    GetCommand,
    DeleteCommand
} from "@aws-sdk/lib-dynamodb";

import {
    DEVICES_TABLE,
    FLAVORS_TABLE,
    PASSKEY_CHALLENGES_TABLE,
    PASSKEYS_TABLE
} from "../../common";
import { SDK_SETTINGS } from "../common";
import {
    type DatabaseDevice,
    type DatabaseFlavor,
    type DatabasePasskey,
    type DatabasePasskeyChallenge,
    type DynamoDBFieldValue
} from "../../types";

// prettier-ignore
export type Table =
    typeof FLAVORS_TABLE |
    typeof PASSKEY_CHALLENGES_TABLE |
    typeof PASSKEYS_TABLE |
    typeof DEVICES_TABLE;

type UpdateItemInput<T extends Table> = Partial<
    Record<ValuesOfType<TableObject<T>, DynamoDBFieldValue>, DynamoDBFieldValue>
>;

// prettier-ignore
export type TableObject<T extends Table> =
    T extends typeof FLAVORS_TABLE ? DatabaseFlavor :
    T extends typeof PASSKEY_CHALLENGES_TABLE ? DatabasePasskeyChallenge :
    T extends typeof PASSKEYS_TABLE ? DatabasePasskey :
    T extends typeof DEVICES_TABLE ? DatabaseDevice :
    never;

// prettier-ignore
export type ValuesOfType<T, TCondition> = {
    [K in keyof T]: T[K] extends TCondition | undefined ? K : never;
}[keyof T] & string;

const dynamodbClient = new DynamoDBClient(SDK_SETTINGS);
export const documentClient = DynamoDBDocument.from(dynamodbClient);

export const primaryKeys: Record<Table, string> = {
    [FLAVORS_TABLE]: "productId",
    [PASSKEY_CHALLENGES_TABLE]: "id",
    [PASSKEYS_TABLE]: "credentialId",
    [DEVICES_TABLE]: "deviceId"
};

export async function getEntireTable<T extends Table>(table: T): Promise<TableObject<T>[]> {
    const scanItemsRequest = new ScanCommand({ TableName: table });
    const itemOutput = await documentClient.send(scanItemsRequest);
    return (itemOutput.Items ?? []) as TableObject<T>[];
}

export async function getItem<T extends Table>(
    table: T,
    key: string
): Promise<TableObject<T> | undefined> {
    const getItemRequest = new GetCommand({ TableName: table, Key: { [primaryKeys[table]]: key } });
    const itemOutput = await documentClient.send(getItemRequest);
    return itemOutput.Item as TableObject<T> | undefined;
}

export async function getItemByIndex<T extends Table>(
    table: T,
    key: ValuesOfType<TableObject<T>, string>,
    value: string
): Promise<TableObject<T> | undefined> {
    const items = await getItemsByIndex(table, key, value);
    if (items.length > 1) {
        throw new Error(`${key} ${value} Is Not Unique`);
    }
    return items[0];
}

export async function getItemsByIndex<T extends Table>(
    table: T,
    key: ValuesOfType<TableObject<T>, string>,
    value: string
): Promise<TableObject<T>[]> {
    const queryRequest = new QueryCommand({
        TableName: table,
        IndexName: key,
        KeyConditionExpression: "#key = :value",
        ExpressionAttributeNames: { "#key": key },
        ExpressionAttributeValues: { ":value": value }
    });
    const itemOutput = await documentClient.send(queryRequest);
    return (itemOutput.Items ?? []) as TableObject<T>[];
}

export async function decrementField<T extends Table>(
    table: T,
    key: string,
    fieldName: ValuesOfType<TableObject<T>, number>
): Promise<TableObject<T>> {
    return adjustField(table, key, fieldName, -1);
}

export async function incrementField<T extends Table>(
    table: T,
    key: string,
    fieldName: ValuesOfType<TableObject<T>, number>
): Promise<TableObject<T>> {
    return adjustField(table, key, fieldName, 1);
}

async function adjustField<T extends Table>(
    table: T,
    key: string,
    fieldName: ValuesOfType<TableObject<T>, number>,
    delta: number
): Promise<TableObject<T>> {
    const updateItemRequest = new UpdateCommand({
        TableName: table,
        Key: { [primaryKeys[table]]: key },
        UpdateExpression: `SET #prop = #prop + :delta`,
        ExpressionAttributeNames: {
            "#prop": fieldName
        },
        ExpressionAttributeValues: {
            ":delta": delta
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
    const putItemRequest = new PutCommand({ TableName: table, Item: item });
    await documentClient.send(putItemRequest);
    return item as TableObject<T>;
}

export async function updateItem<T extends Table>(
    table: T,
    id: string,
    key: ValuesOfType<TableObject<T>, DynamoDBFieldValue>,
    value: DynamoDBFieldValue
): Promise<TableObject<T>> {
    return updateItemFields(table, id, { [key]: value } as UpdateItemInput<T>);
}

export async function updateItemFields<T extends Table>(
    table: T,
    key: string,
    fields: UpdateItemInput<T>
): Promise<TableObject<T>> {
    const setExpressions: string[] = [];
    const removeExpressions: string[] = [];
    const dynamoAttributeNames: Record<string, string> = {};
    const dynamoAttributeValues: Record<string, DynamoDBFieldValue> = {};
    Object.entries<DynamoDBFieldValue>(fields).forEach(([key, value], i) => {
        dynamoAttributeNames[`#${key}`] = key;
        if (value === undefined) {
            removeExpressions.push(`#${key}`);
        } else {
            dynamoAttributeValues[`:${i.toString()}`] = value;
            setExpressions.push(`#${key} = :${i.toString()}`);
        }
    });
    const expressionParts = [
        setExpressions.length && `SET ${setExpressions.join(", ")}`,
        removeExpressions.length && `REMOVE ${removeExpressions.join(", ")}`
    ];

    const updateItemRequest = new UpdateCommand({
        TableName: table,
        Key: { [primaryKeys[table]]: key },
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

export async function deleteItem<T extends Table>(table: T, key: string): Promise<TableObject<T>> {
    const deleteItemRequest = new DeleteCommand({
        TableName: table,
        Key: { [primaryKeys[table]]: key },
        ReturnValues: "ALL_OLD"
    });
    const itemOutput = await documentClient.send(deleteItemRequest);
    const object = itemOutput.Attributes as TableObject<T> | undefined;
    if (!object) {
        throw new Error("Called DynamoDB Without Validating Item Exists");
    }
    return object;
}
