import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { DateTime } from "luxon";

import { putItem } from "../../aws/services/dynamodb";
import { authorizeUserType, UserType } from "../../auth";
import {
    HttpResponseStatus,
    PASSKEY_CHALLENGES_TABLE,
    buildErrorResponse,
    buildResponse
} from "../../common";
import { RP_ID, RP_NAME } from "../admin/passkeyAuthOptions";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const { token, error } = await authorizeUserType(event, [UserType.SHARE]);
    if (!token) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            error ?? "Invalid Invite Token"
        );
    }

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userName: token.id,
        attestationType: "none",
        authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "required"
        }
    });

    await putItem(PASSKEY_CHALLENGES_TABLE, {
        id: options.challenge,
        expiresAt: DateTime.now().plus({ minutes: 5 }).toSeconds()
    });

    return buildResponse(event, HttpResponseStatus.OK, options);
};
