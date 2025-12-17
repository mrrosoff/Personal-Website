import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { buildResponse, HttpResponseStatus } from "../../common";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const body = JSON.parse(event.body || "{}");

    console.log("Provision flavor request (placeholder):", body);

    return buildResponse(event, HttpResponseStatus.OK, {
        message: "Flavor provisioning is not yet implemented",
        placeholder: true,
        receivedData: body
    });
};
