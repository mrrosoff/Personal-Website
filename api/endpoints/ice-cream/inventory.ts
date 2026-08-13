import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getAllItems } from "../../aws/services/dynamodb";
import { FLAVORS_TABLE, HttpResponseStatus, buildResponse } from "../../common";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const inventory = await getAllItems(FLAVORS_TABLE);
    return buildResponse(event, HttpResponseStatus.OK, { inventory });
};
