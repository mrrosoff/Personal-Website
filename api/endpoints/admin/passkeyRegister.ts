import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { RegistrationResponseJSON, verifyRegistrationResponse } from "@simplewebauthn/server";
import { DateTime } from "luxon";

import { PASSKEY_CHALLENGES_TABLE, PASSKEYS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { deleteItem, getItem, putItem } from "../../aws/services/dynamodb";
import { authenticateHTTPAccessToken, UserType } from "../../auth";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { DatabasePasskey } from "../../types";
import { RP_ID, RP_ORIGIN } from "./passkeyAuthOptions";

type Payload = {
    challenge: string;
    response: RegistrationResponseJSON;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const sharePayload = await authenticateHTTPAccessToken(event);
    if (sharePayload?.userType !== UserType.SHARE) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Invalid Invite Token");
    }

    const body: Payload = JSON.parse(event.body);
    const challengeRecord = await getItem(PASSKEY_CHALLENGES_TABLE, body.challenge);
    if (!challengeRecord) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            "Invalid Or Expired Challenge"
        );
    }

    if (DateTime.now().toSeconds() > challengeRecord.expiresAt) {
        await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.id);
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Challenge Expired");
    }

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: body.response,
            expectedChallenge: body.challenge,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID
        });
    } catch (error) {
        console.error("Passkey Registration Error:", error);
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Registration Failed");
    }

    if (!verification.verified || !verification.registrationInfo) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Registration Failed");
    }

    const credential = verification.registrationInfo.credential;
    const passkey: DatabasePasskey = {
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64"),
        userType: UserType.FRIEND
    };
    await putItem(PASSKEYS_TABLE, passkey);
    await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.id);
    return buildResponse(event, HttpResponseStatus.OK, { verified: true });
};
