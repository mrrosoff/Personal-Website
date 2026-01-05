import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateRegistrationOptions } from "@simplewebauthn/server";

import { buildResponse, HttpResponseStatus } from "../../common";
import { putItem } from "../../aws/services/dynamodb";
import { PASSKEY_CHALLENGES_TABLE } from "../../../infrastructure/WebsiteAPIStack";

const RP_NAME = "Max Rosoff's Website";
export const RP_ID = "maxrosoff.com";
export const RP_ORIGIN = "https://maxrosoff.com";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userName: "admin"
    });

    await putItem(PASSKEY_CHALLENGES_TABLE, {
        id: options.challenge,
        type: "registration",
        expiresAt: Math.floor(Date.now() / 1000) + 300 // 5 minutes
    });

    return buildResponse(event, HttpResponseStatus.OK, options);
};
