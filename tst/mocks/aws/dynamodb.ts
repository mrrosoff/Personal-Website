import { faker } from "@faker-js/faker";
import { createHash } from "node:crypto";
import { DateTime } from "luxon";
import {
    DeleteCommand,
    DynamoDBDocument,
    GetCommand,
    PutCommand,
    QueryCommand,
    ScanCommand,
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import type {
    DeleteCommandInput,
    GetCommandInput,
    PutCommandInput,
    QueryCommandInput,
    ScanCommandInput,
    UpdateCommandInput
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeEach } from "vitest";

import { DeviceKind, UserType } from "../../../api/types";
import type {
    DatabaseDevice,
    DatabaseFlavor,
    DatabasePasskey,
    DatabasePasskeyChallenge
} from "../../../api/types";
import { primaryKeys } from "../../../api/aws/services/dynamodb";
import type { Table, TableObject } from "../../../api/aws/services/dynamodb";
import {
    DEVICES_TABLE,
    FLAVORS_TABLE,
    PASSKEY_CHALLENGES_TABLE,
    PASSKEYS_TABLE
} from "../../../api/common";

const mockDeviceSecret = faker.string.alphanumeric(32);

export const mockFlavor: DatabaseFlavor = {
    productId: `prod_${faker.string.alphanumeric(14)}`,
    priceId: `price_${faker.string.alphanumeric(14)}`,
    name: "Brown Butter Pecan",
    color: faker.color.rgb(),
    count: 5,
    type: "currentFlavor"
};

export const mockDevice: DatabaseDevice = {
    deviceId: faker.string.hexadecimal({ length: 12, casing: "lower", prefix: "" }),
    kind: DeviceKind.POLAROID,
    secretHash: createHash("sha256").update(mockDeviceSecret).digest("hex"),
    lastSeenAt: 0
};

export const mockDeviceToken = `${mockDevice.deviceId}.${mockDeviceSecret}`;

export const mockPasskey: DatabasePasskey = {
    credentialId: faker.string.alphanumeric(22),
    publicKey: faker.string.alphanumeric(88),
    userType: UserType.FRIEND,
    name: faker.person.firstName(),
    email: faker.internet.email().toLowerCase(),
    deviceIds: [mockDevice.deviceId]
};

export const mockChallenge: DatabasePasskeyChallenge = {
    id: faker.string.alphanumeric(43),
    expiresAt: DateTime.now().plus({ minutes: 5 }).toSeconds()
};

type Item = Record<string, unknown>;

export const mockDocumentClient = mockClient(DynamoDBDocument);

const tables = new Map<string, Map<string, Item>>();

function table(name: string | undefined): Map<string, Item> {
    const existing = tables.get(name ?? "");
    if (existing) {
        return existing;
    }
    const created = new Map<string, Item>();
    tables.set(name ?? "", created);
    return created;
}

function keyOf(name: string | undefined, item: Item | undefined): string {
    return String(item?.[primaryKeys[name as Table]]);
}

export const mockDynamoDB = {
    seed<T extends Table>(name: T, ...items: TableObject<T>[]) {
        for (const item of items) {
            table(name).set(keyOf(name, item), structuredClone(item));
        }
    },
    get<T extends Table>(name: T, key: string) {
        return table(name).get(key) as TableObject<T> | undefined;
    },
    items<T extends Table>(name: T) {
        return [...table(name).values()] as TableObject<T>[];
    },
    clear(name: Table) {
        table(name).clear();
    }
};

function update({
    TableName,
    Key,
    UpdateExpression = "",
    ExpressionAttributeNames = {},
    ExpressionAttributeValues = {}
}: UpdateCommandInput) {
    const item: Item = { ...table(TableName).get(keyOf(TableName, Key)), ...Key };
    const [setPart = "", removePart = ""] = UpdateExpression.replace(/^SET /, "").split(
        /\s*REMOVE\s*/
    );

    for (const assignment of setPart.split(/,\s*/).filter(Boolean)) {
        const adjust = /^(#\w+) = \1 \+ (:\w+)$/.exec(assignment);
        const set = /^(#\w+) = (:\w+)$/.exec(assignment);
        if (adjust) {
            const name = ExpressionAttributeNames[adjust[1]];
            item[name] = (item[name] as number) + (ExpressionAttributeValues[adjust[2]] as number);
        } else if (set) {
            item[ExpressionAttributeNames[set[1]]] = ExpressionAttributeValues[set[2]];
        } else {
            throw new Error(`Mock DynamoDB Cannot Apply "${assignment}"`);
        }
    }
    const removed = removePart
        .split(/,\s*/)
        .filter(Boolean)
        .map((name) => ExpressionAttributeNames[name]);
    const updated = Object.fromEntries(
        Object.entries(item).filter(([attribute]) => !removed.includes(attribute))
    );

    table(TableName).set(keyOf(TableName, Key), updated);
    return { Attributes: structuredClone(updated) };
}

function query({
    TableName,
    KeyConditionExpression,
    ExpressionAttributeNames = {},
    ExpressionAttributeValues = {}
}: QueryCommandInput) {
    if (KeyConditionExpression !== "#key = :value") {
        throw new Error(`Mock DynamoDB Cannot Query "${String(KeyConditionExpression)}"`);
    }
    const attribute = ExpressionAttributeNames["#key"];
    const value: unknown = ExpressionAttributeValues[":value"];
    const matches = [...table(TableName).values()].filter((item) => item[attribute] === value);
    return { Items: structuredClone(matches) };
}

function remove({ TableName, Key }: DeleteCommandInput) {
    const key = keyOf(TableName, Key);
    const existing = table(TableName).get(key);
    table(TableName).delete(key);
    return { Attributes: existing };
}

beforeEach(() => {
    mockDynamoDB.seed(FLAVORS_TABLE, mockFlavor);
    mockDynamoDB.seed(DEVICES_TABLE, mockDevice);
    mockDynamoDB.seed(PASSKEYS_TABLE, mockPasskey);
    mockDynamoDB.seed(PASSKEY_CHALLENGES_TABLE, mockChallenge);
    mockDocumentClient.on(GetCommand).callsFake(({ TableName, Key }: GetCommandInput) => ({
        Item: structuredClone(table(TableName).get(keyOf(TableName, Key)))
    }));
    mockDocumentClient.on(PutCommand).callsFake(({ TableName, Item }: PutCommandInput) => {
        table(TableName).set(keyOf(TableName, Item), structuredClone(Item as Item));
        return {};
    });
    mockDocumentClient.on(ScanCommand).callsFake(({ TableName }: ScanCommandInput) => ({
        Items: structuredClone([...table(TableName).values()])
    }));
    mockDocumentClient.on(QueryCommand).callsFake(query);
    mockDocumentClient.on(DeleteCommand).callsFake(remove);
    mockDocumentClient.on(UpdateCommand).callsFake(update);
});

afterEach(() => {
    tables.clear();
    mockDocumentClient.reset();
});
