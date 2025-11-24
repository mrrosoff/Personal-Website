import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { buildResponse, HttpResponseStatus } from "../common";
import { getAllItems } from "../aws/dynamodb";
import { FLAVORS_TABLE } from "../../infrastructure/WebsiteAPIStack";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const inventory = await getAllItems(FLAVORS_TABLE);
    return buildResponse(event, HttpResponseStatus.OK, { inventory });
};
