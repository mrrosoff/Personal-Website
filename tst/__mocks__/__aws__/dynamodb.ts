import {
    DeleteCommand,
    DynamoDBDocument,
    GetCommand,
    PutCommand,
    QueryCommand,
    ScanCommand,
    UpdateCommand,
    type UpdateCommandInput,
    type UpdateCommandOutput
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeEach } from "vitest";

import {
    DEVICES_TABLE,
    FLAVORS_TABLE,
    PASSKEY_CHALLENGES_TABLE,
    PASSKEYS_TABLE
} from "../../../api/common";
import type { Table, TableObject } from "../../../api/aws/services/dynamodb";
import { mockChallenge, mockDevice, mockFlavor, mockPasskey } from "../__data__/aws/dynamodb";

export const mockDocumentClient = mockClient(DynamoDBDocument);

const mockItems: Record<Table, TableObject<Table>> = {
    [FLAVORS_TABLE]: mockFlavor,
    [DEVICES_TABLE]: mockDevice,
    [PASSKEYS_TABLE]: mockPasskey,
    [PASSKEY_CHALLENGES_TABLE]: mockChallenge
};

function updatedItem(input: UpdateCommandInput): UpdateCommandOutput {
    const item: Record<string, unknown> = { ...mockItems[input.TableName as Table] };
    const names = input.ExpressionAttributeNames ?? {};
    const values = input.ExpressionAttributeValues ?? {};
    const [setPart = "", removePart = ""] = (input.UpdateExpression ?? "")
        .replace(/^SET /, "")
        .split(/\s*REMOVE\s*/);

    for (const assignment of setPart.split(/,\s*/).filter(Boolean)) {
        const adjust = /^(#\w+) = \1 \+ (:\w+)$/.exec(assignment);
        const set = /^(#\w+) = (:\w+)$/.exec(assignment);
        if (adjust) {
            item[names[adjust[1]]] =
                (item[names[adjust[1]]] as number) + (values[adjust[2]] as number);
        } else if (set) {
            item[names[set[1]]] = values[set[2]];
        }
    }
    const removed = removePart
        .split(/,\s*/)
        .filter(Boolean)
        .map((name) => names[name]);

    return {
        Attributes: Object.fromEntries(
            Object.entries(item).filter(([attribute]) => !removed.includes(attribute))
        ),
        $metadata: {}
    };
}

beforeEach(() => {
    for (const [table, item] of Object.entries(mockItems)) {
        mockDocumentClient.on(ScanCommand, { TableName: table }).resolves({ Items: [item] });
        mockDocumentClient.on(GetCommand, { TableName: table }).resolves({ Item: item });
        mockDocumentClient.on(QueryCommand, { TableName: table }).resolves({ Items: [item] });
        mockDocumentClient.on(DeleteCommand, { TableName: table }).resolves({ Attributes: item });
    }
    mockDocumentClient.on(PutCommand).resolves({});
    mockDocumentClient.on(UpdateCommand).callsFake(updatedItem);
});

afterEach(() => {
    mockDocumentClient.reset();
});
