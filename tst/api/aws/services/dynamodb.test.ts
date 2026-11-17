import { QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";

import { mockDocumentClient, mockDynamoDB } from "../../../__mocks__/__aws__/dynamodb";
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

    it("should scan an empty table", async () => {
        mockDynamoDB.clear(FLAVORS_TABLE);

        const result = await getEntireTable(FLAVORS_TABLE);

        expect(result).toHaveLength(0);
    });

    it("should treat a scan without an item list as empty", async () => {
        mockDocumentClient.on(ScanCommand).resolves({});

        const result = await getEntireTable(FLAVORS_TABLE);

        expect(result).toHaveLength(0);
    });

    it("should get an item by its primary key", async () => {
        const result = await getItem(FLAVORS_TABLE, mockFlavor.productId);

        expect(result).toEqual(mockFlavor);
    });

    it("should get an item by an index", async () => {
        mockDynamoDB.seed(PASSKEYS_TABLE, mockPasskey);

        const result = await getItemByIndex(PASSKEYS_TABLE, "email", mockPasskey.email);

        expect(result).toEqual(mockPasskey);
    });

    it("should throw if an index lookup is not unique", async () => {
        mockDynamoDB.seed(PASSKEYS_TABLE, mockPasskey, { ...mockPasskey, credentialId: "other" });

        const result = getItemByIndex(PASSKEYS_TABLE, "email", mockPasskey.email);

        await expect(result).rejects.toThrow(`email ${mockPasskey.email} Is Not Unique`);
    });

    it("should find nothing for an index value no item has", async () => {
        const result = await getItemsByIndex(PASSKEYS_TABLE, "email", "nobody@example.com");

        expect(result).toHaveLength(0);
    });

    it("should treat a query without an item list as empty", async () => {
        mockDocumentClient.on(QueryCommand).resolves({});

        const result = await getItemsByIndex(PASSKEYS_TABLE, "email", mockPasskey.email);

        expect(result).toHaveLength(0);
    });

    it("should decrement a field", async () => {
        await decrementField(FLAVORS_TABLE, mockFlavor.productId, "count");

        expect(mockDynamoDB.get(FLAVORS_TABLE, mockFlavor.productId)?.count).toBe(
            mockFlavor.count - 1
        );
    });

    it("should increment a field", async () => {
        const result = await incrementField(FLAVORS_TABLE, mockFlavor.productId, "count");

        expect(result.count).toBe(mockFlavor.count + 1);
    });

    it("should throw if an adjustment returns no item", async () => {
        mockDocumentClient.on(UpdateCommand).resolves({});

        const result = decrementField(FLAVORS_TABLE, mockFlavor.productId, "count");

        await expect(result).rejects.toThrow("Called DynamoDB Without Validating Item Exists");
    });

    it("should put an item", async () => {
        const result = await putItem(FLAVORS_TABLE, mockFlavor);

        expect(result).toEqual(mockFlavor);
        expect(mockDynamoDB.get(FLAVORS_TABLE, mockFlavor.productId)).toEqual(mockFlavor);
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

        expect(mockDynamoDB.get(FLAVORS_TABLE, mockFlavor.productId)).toEqual({
            ...mockFlavor,
            name: "Fig",
            color: undefined
        });
    });

    it("should throw if an update returns no item", async () => {
        mockDocumentClient.on(UpdateCommand).resolves({});

        const result = updateItemFields(FLAVORS_TABLE, mockFlavor.productId, { name: "Fig" });

        await expect(result).rejects.toThrow("Called DynamoDB Without Validating Item Exists");
    });

    it("should delete an item", async () => {
        const result = await deleteItem(FLAVORS_TABLE, mockFlavor.productId);

        expect(result).toEqual(mockFlavor);
        expect(mockDynamoDB.items(FLAVORS_TABLE)).toHaveLength(0);
    });

    it("should throw if deleting a missing item", async () => {
        const result = deleteItem(FLAVORS_TABLE, "prod_missing");

        await expect(result).rejects.toThrow("Called DynamoDB Without Validating Item Exists");
    });
});
