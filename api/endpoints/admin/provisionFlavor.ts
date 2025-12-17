import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { buildResponse, HttpResponseStatus } from "../../common";
import { getParameter } from "../../aws/services/parameterStore";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const body = JSON.parse(event.body || "{}");

    const adminPassword = await getParameter("/website/password");
    console.log("Provision flavor request (placeholder):", body);

    return buildResponse(event, HttpResponseStatus.OK, {
        message: "Flavor provisioning is not yet implemented",
        placeholder: true,
        receivedData: body
    });
};
