import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    QueryCommand,
    ScanCommand,
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockDocumentClient } from "../../../__mocks__/__aws__/dynamodb";
import { mockFlavor, mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";

import {
    decrementField,
    deleteItem,
    getEntireTable,
    getItem,
    getItemByIndex,
    getItemsByIndex,
    incrementField,
    putItem,
    updateItem,
    updateItemFields
} from "../../../../api/aws/services/dynamodb";
import { FLAVORS_TABLE, PASSKEYS_TABLE } from "../../../../api/common";

describe("dynamodb", () => {
    it("should scan an entire table", async () => {
        const result = await getEntireTable(FLAVORS_TABLE);

        expect(result).toEqual([mockFlavor]);
    });

    it("should return an empty array if a scan has no items", async () => {
        mockDocumentClient.on(ScanCommand).resolves({});

        const result = await getEntireTable(FLAVORS_TABLE);

        expect(result).toBeEmpty();
    });

    it("should get an item by its primary key", async () => {
        await getItem(FLAVORS_TABLE, mockFlavor.productId);

        expect(mockDocumentClient).toHaveReceivedCommandWith(GetCommand, {
            TableName: FLAVORS_TABLE,
            Key: { productId: mockFlavor.productId }
        });
    });

    it("should get an item by an index", async () => {
        const result = await getItemByIndex(PASSKEYS_TABLE, "email", mockPasskey.email);

        expect(result).toEqual(mockPasskey);
    });

    it("should throw if an index lookup is not unique", async () => {
        mockDocumentClient.on(QueryCommand).resolves({ Items: [mockPasskey, mockPasskey] });

        const result = getItemByIndex(PASSKEYS_TABLE, "email", mockPasskey.email);

        await expect(result).rejects.toThrow(`email ${mockPasskey.email} Is Not Unique`);
    });

    it("should return an empty array if a query has no items", async () => {
        mockDocumentClient.on(QueryCommand).resolves({});

        const result = await getItemsByIndex(PASSKEYS_TABLE, "email", mockPasskey.email);

        expect(result).toBeEmpty();
    });

    it("should decrement a field", async () => {
        const result = await decrementField(FLAVORS_TABLE, mockFlavor.productId, "count");

        expect(result.count).toBe(mockFlavor.count - 1);
    });

    it("should increment a field", async () => {
        const result = await incrementField(FLAVORS_TABLE, mockFlavor.productId, "count");

        expect(result.count).toBe(mockFlavor.count + 1);
    });

    it("should throw if adjusting a missing item", async () => {
        mockDocumentClient.on(UpdateCommand).resolves({});

        const result = decrementField(FLAVORS_TABLE, mockFlavor.productId, "count");

        await expect(result).rejects.toThrow("Called DynamoDB Without Validating Item Exists");
    });

    it("should put an item", async () => {
        const result = await putItem(FLAVORS_TABLE, mockFlavor);

        expect(result).toEqual(mockFlavor);
        expect(mockDocumentClient).toHaveReceivedCommandWith(PutCommand, { Item: mockFlavor });
    });

    it("should update a single field", async () => {
        const result = await updateItem(FLAVORS_TABLE, mockFlavor.productId, "name", "Fig");

        expect(result.name).toBe("Fig");
    });

    it("should set and remove fields in one update", async () => {
        await updateItemFields(FLAVORS_TABLE, mockFlavor.productId, {
            name: "Fig",
            color: undefined
        });

        expect(mockDocumentClient).toHaveReceivedCommandWith(UpdateCommand, {
            UpdateExpression: "SET #name = :0 REMOVE #color"
        });
    });

    it("should throw if updating a missing item", async () => {
        mockDocumentClient.on(UpdateCommand).resolves({});

        const result = updateItemFields(FLAVORS_TABLE, mockFlavor.productId, { name: "Fig" });

        await expect(result).rejects.toThrow("Called DynamoDB Without Validating Item Exists");
    });

    it("should delete an item", async () => {
        const result = await deleteItem(FLAVORS_TABLE, mockFlavor.productId);

        expect(result).toEqual(mockFlavor);
        expect(mockDocumentClient).toHaveReceivedCommand(DeleteCommand);
    });

    it("should throw if deleting a missing item", async () => {
        mockDocumentClient.on(DeleteCommand).resolves({});

        const result = deleteItem(FLAVORS_TABLE, mockFlavor.productId);

        await expect(result).rejects.toThrow("Called DynamoDB Without Validating Item Exists");
    });
});
