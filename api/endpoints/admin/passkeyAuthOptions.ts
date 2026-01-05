import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { DateTime } from "luxon";

import { PASSKEY_CHALLENGES_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { putItem } from "../../aws/services/dynamodb";
import { buildResponse, HttpResponseStatus } from "../../common";

export const RP_NAME = `Max's Personal Website`;
export const RP_ID = "maxrosoff.com";
export const RP_ORIGIN = "https://maxrosoff.com";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const options = await generateAuthenticationOptions({
        rpID: RP_ID
    });
    await putItem(PASSKEY_CHALLENGES_TABLE, {
        id: options.challenge,
        expiresAt: DateTime.now().plus({ minutes: 5 }).toSeconds()
    });
    return buildResponse(event, HttpResponseStatus.OK, options);
};
