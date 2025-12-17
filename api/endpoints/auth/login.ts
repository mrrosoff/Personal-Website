import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getParameter } from "../../aws/services/parameterStore";
import { generateToken } from "../../auth";
import { buildResponse, buildErrorResponse, HttpResponseStatus } from "../../common";

type LoginPayload = {
    password: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const { password }: LoginPayload = JSON.parse(event.body);
    const adminPassword = await getParameter("/website/password");
    if (password === adminPassword) {
        return buildResponse(event, HttpResponseStatus.OK, {
            token: await generateToken()
        });
    }
    return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Invalid Password");
};
