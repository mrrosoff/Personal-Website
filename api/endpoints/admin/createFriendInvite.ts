import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { generateToken, isAdmin, UserType } from "../../auth";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { RP_ORIGIN } from "./passkeyAuthOptions";

type CreateFriendInvitePayload = {
    friendName: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    if (!(await isAdmin(event))) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication required"
        );
    }

    const body: CreateFriendInvitePayload = JSON.parse(event.body);
    const friendName = body.friendName.trim();

    const inviteToken = await generateToken(friendName, {
        userType: UserType.SHARE,
        expiresIn: "5m"
    });
    const url = `${RP_ORIGIN}/register-friend?token=${encodeURIComponent(inviteToken)}`;

    return buildResponse(event, HttpResponseStatus.OK, { url, token: inviteToken });
};
