import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthenticationResponseJSON, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { DateTime } from "luxon";

import { PASSKEY_CHALLENGES_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { deleteItem, getItem } from "../../aws/services/dynamodb";
import { getParameters } from "../../aws/services/parameterStore";
import { generateToken } from "../../auth";
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
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Invalid Expired Challenge");
    }

    const currentTime = DateTime.now().toSeconds();
    if (challengeRecord.expiresAt < currentTime) {
        await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.id);
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Challenge Expired");
    }

    try {
        const credentialIdBase64 = Buffer.from(body.response.rawId, "base64").toString("base64");

        const parameters = await getParameters("/website/admin/passkeyId", "/website/admin/publicKey");
        const storedCredentialId = parameters["/website/admin/passkeyId"];
        const storedPublicKey = parameters["/website/admin/publicKey"];

        console.error(credentialIdBase64, storedCredentialId, body.response.rawId);
        if (credentialIdBase64 !== storedCredentialId) {
            return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Credential not found");
        }

        const webAuthnCredential = {
            id: storedCredentialId,
            publicKey: Buffer.from(storedPublicKey, "base64"),
            counter: 0 // Not tracking counter for simplicity
        };

        const verification = await verifyAuthenticationResponse({
            response: body.response,
            expectedChallenge: challengeRecord.id,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID,
            credential: webAuthnCredential
        });

        if (!verification.verified) {
            return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Authentication failed");
        }

        await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.id);

        return buildResponse(event, HttpResponseStatus.OK, {
            verified: true,
            message: "Authentication successful",
            token: await generateToken("admin")
        });
    } catch (error) {
        console.error("Passkey authentication error:", error);
        return buildErrorResponse(event, HttpResponseStatus.INTERNAL_SERVER_ERROR, "Authentication failed");
    }
};
