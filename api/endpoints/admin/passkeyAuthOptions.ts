import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

import { PASSKEY_CHALLENGES_TABLE, PASSKEY_CREDENTIALS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { getAllItems, putItem } from "../../aws/services/dynamodb";
import { buildResponse, HttpResponseStatus } from "../../common";

export const RP_NAME = `Max's Personal Website`;
export const RP_ID = "maxrosoff.com";
export const RP_ORIGIN = "https://maxrosoff.com";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const credentials = await getAllItems(PASSKEY_CREDENTIALS_TABLE);
    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: credentials.map(passkey => ({
            id: passkey.id,
            transports: passkey.transports,
        })),
    });
    await putItem(PASSKEY_CHALLENGES_TABLE, {
        id: options.challenge,
        type: "authentication",
        expiresAt: Math.floor(Date.now() / 1000) + 300 // 5 minutes from now
    });
    return buildResponse(event, HttpResponseStatus.OK, options);
};
