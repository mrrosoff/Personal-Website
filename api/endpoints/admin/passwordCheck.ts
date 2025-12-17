import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getParameter } from "../../aws/services/parameterStore";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";

type PasswordCheckPayload = {
    password: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: PasswordCheckPayload = JSON.parse(event.body);

    const password = await getParameter("/website/password");
    if (password !== body.password) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Invalid Admin Password");
    }

    return buildResponse(event, HttpResponseStatus.OK, { message: "Password Valid" });
};
