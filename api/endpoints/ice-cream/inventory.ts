import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getEntireTable } from "../../aws/services/dynamodb";
import { FLAVORS_TABLE, HttpResponseStatus, buildResponse } from "../../common";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const inventory = await getEntireTable(FLAVORS_TABLE);
    return buildResponse(event, HttpResponseStatus.OK, { inventory });
};
