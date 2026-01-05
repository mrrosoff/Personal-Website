import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthenticationResponseJSON, verifyAuthenticationResponse } from "@simplewebauthn/server";

import { PASSKEY_CHALLENGES_TABLE, PASSKEY_CREDENTIALS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { deleteItem, getAllItems, putItem } from "../../aws/services/dynamodb";
import { generateToken, GrantType } from "../../auth";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { RP_ID, RP_ORIGIN } from "./passkeyAuthOptions";

type PasskeyAuthPayload = {
    response: AuthenticationResponseJSON;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: PasskeyAuthPayload = JSON.parse(event.body);

    const challenges = await getAllItems(PASSKEY_CHALLENGES_TABLE);
    const challengeRecord = challenges?.find((c: any) => c.type === "authentication");

    if (!challengeRecord) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Invalid or expired challenge");
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (challengeRecord.expiresAt < currentTime) {
        await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.id);
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Challenge expired");
    }

    try {
        const credentialIdBase64 = Buffer.from(body.response.rawId, "base64").toString("base64");
        const credentials = await getAllItems(PASSKEY_CREDENTIALS_TABLE);
        const credential = credentials?.find((c: any) => c.id === credentialIdBase64);

        if (!credential) {
            return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Credential not found");
        }

        // Convert database format (base64 publicKey) to WebAuthnCredential format (Buffer)
        const webAuthnCredential = {
            id: credential.id,
            publicKey: Buffer.from(credential.publicKey, "base64"),
            counter: credential.counter,
            transports: credential.transports
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

        await putItem(PASSKEY_CREDENTIALS_TABLE, {
            ...credential,
            counter: verification.authenticationInfo.newCounter
        });

        await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.id);

        const token = await generateToken("admin", GrantType.AUTH);

        return buildResponse(event, HttpResponseStatus.OK, {
            verified: true,
            message: "Authentication successful",
            token
        });
    } catch (error) {
        console.error("Passkey authentication error:", error);
        return buildErrorResponse(event, HttpResponseStatus.INTERNAL_SERVER_ERROR, "Authentication failed");
    }
};
