import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthenticationResponseJSON, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { DateTime } from "luxon";

import { PASSKEY_CHALLENGES_TABLE, PASSKEYS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { deleteItem, getItem } from "../../aws/services/dynamodb";
import { generateToken, UserType } from "../../auth";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { RP_ID, RP_ORIGIN } from "./passkeyAuthOptions";

type PasskeyAuthPayload = {
    response: AuthenticationResponseJSON;
    challenge: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: PasskeyAuthPayload = JSON.parse(event.body);

    const challengeRecord = await getItem(PASSKEY_CHALLENGES_TABLE, body.challenge);
    if (!challengeRecord) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            "Invalid Expired Challenge"
        );
    }

    const currentTime = DateTime.now().toSeconds();
    if (currentTime > challengeRecord.expiresAt) {
        await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.id);
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Challenge Expired");
    }

    const presentedCredentialId = body.response.id;

    const storedPasskey = await getItem(PASSKEYS_TABLE, presentedCredentialId);
    if (!storedPasskey) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Credential Not Recognized"
        );
    }

    const userType = storedPasskey.userType ?? UserType.ADMIN;
    const webAuthnCredential: Parameters<typeof verifyAuthenticationResponse>[0]["credential"] = {
        id: storedPasskey.credentialId,
        publicKey: Buffer.from(storedPasskey.publicKey, "base64"),
        counter: 0 // Not tracking counter for simplicity
    };

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: body.response,
            expectedChallenge: challengeRecord.id,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID,
            credential: webAuthnCredential
        });
    } catch (error) {
        console.error(error);
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Authentication Failed");
    }

    if (!verification.verified) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Passkey Verification Returned Unverified"
        );
    }

    await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.id);

    return buildResponse(event, HttpResponseStatus.OK, {
        verified: true,
        message: "Authentication Successful",
        token: await generateToken(storedPasskey.name, { userType })
    });
};
