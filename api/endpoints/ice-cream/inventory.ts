import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { FLAVORS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { getAllItems } from "../../aws/services/dynamodb";
import { buildResponse, HttpResponseStatus } from "../../common";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const inventory = await getAllItems(FLAVORS_TABLE);
    return buildResponse(event, HttpResponseStatus.OK, { inventory });
};
