import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { generateToken, isAdmin, UserType } from "../../auth";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";

const FRONTEND_ORIGIN = "https://maxrosoff.com";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!(await isAdmin(event))) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication required"
        );
    }

    const inviteToken = await generateToken(UserType[UserType.SHARE], {
        userType: UserType.SHARE,
        expiresIn: "5m"
    });
    const url = `${FRONTEND_ORIGIN}/friend-register?token=${encodeURIComponent(inviteToken)}`;

    return buildResponse(event, HttpResponseStatus.OK, { url, token: inviteToken });
};
