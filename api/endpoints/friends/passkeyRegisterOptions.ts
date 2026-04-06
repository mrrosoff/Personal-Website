import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { DateTime } from "luxon";

import { PASSKEY_CHALLENGES_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { putItem } from "../../aws/services/dynamodb";
import { authenticateHTTPAccessToken, UserType } from "../../auth";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { RP_ID, RP_NAME } from "../admin/passkeyAuthOptions";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const payload = await authenticateHTTPAccessToken(event);
    if (payload?.userType !== UserType.SHARE) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Invalid Invite Token");
    }

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userName: payload.id,
        attestationType: "none",
        authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred"
        }
    });

    await putItem(PASSKEY_CHALLENGES_TABLE, {
        id: options.challenge,
        expiresAt: DateTime.now().plus({ minutes: 5 }).toSeconds()
    });

    return buildResponse(event, HttpResponseStatus.OK, options);
};
