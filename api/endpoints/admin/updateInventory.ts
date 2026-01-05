import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { updateItemFields } from "../../aws/services/dynamodb";
import { FLAVORS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { buildResponse, buildErrorResponse, HttpResponseStatus } from "../../common";
import { DatabaseFlavor, FlavorType } from "../../types";
import { isAuthenticated } from "../../auth";

type UpdateInventoryPayload = {
    productId: string;
    name: string;
    color: string;
    count: number;
    type: FlavorType | null;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: UpdateInventoryPayload = JSON.parse(event.body);

    if (!(await isAuthenticated(event))) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Authentication required");
    }

    const updatedFields: Partial<DatabaseFlavor> = {
        name: body.name,
        color: body.color,
        count: body.count,
        type: body.type
    };

    const updatedFlavor = await updateItemFields(FLAVORS_TABLE, body.productId, updatedFields);
    return buildResponse(event, HttpResponseStatus.OK, updatedFlavor);
};
