import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { FLAVORS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { documentClient } from "../../aws/services/dynamodb";
import { buildResponse, buildErrorResponse, HttpResponseStatus } from "../../common";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const body = JSON.parse(event.body || "{}");
    const { priceId, count } = body;

    // Validate inputs
    if (!priceId || typeof priceId !== "string") {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Invalid or missing priceId");
    }

    if (typeof count !== "number" || count < 0 || !Number.isInteger(count)) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Count must be a non-negative integer");
    }

    try {
        const updateItemRequest = new UpdateCommand({
            TableName: FLAVORS_TABLE,
            Key: { priceId },
            UpdateExpression: "SET #count = :count",
            ExpressionAttributeNames: {
                "#count": "count"
            },
            ExpressionAttributeValues: {
                ":count": count
            },
            ReturnValues: "ALL_NEW"
        });

        const result = await documentClient.send(updateItemRequest);

        return buildResponse(event, HttpResponseStatus.OK, {
            message: "Inventory updated successfully",
            item: result.Attributes
        });
    } catch (err: unknown) {
        console.error("Failed to update inventory:", err);
        return buildErrorResponse(
            event,
            HttpResponseStatus.INTERNAL_SERVER_ERROR,
            "Failed to update inventory"
        );
    }
};
