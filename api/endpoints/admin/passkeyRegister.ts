import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { RegistrationResponseJSON, verifyRegistrationResponse } from "@simplewebauthn/server";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { getAllItems, deleteItem, putItem } from "../../aws/services/dynamodb";
import {
    PASSKEY_CHALLENGES_TABLE,
    PASSKEY_CREDENTIALS_TABLE
} from "../../../infrastructure/WebsiteAPIStack";
import { RP_ID, RP_ORIGIN } from "./passkeyRegisterOptions";

type PasskeyRegisterPayload = {
    response: RegistrationResponseJSON;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: PasskeyRegisterPayload = JSON.parse(event.body);

    // Get the challenge
    const challenges = await getAllItems(PASSKEY_CHALLENGES_TABLE);
    const challengeRecord = challenges?.find((c: any) => c.type === "registration");

    if (!challengeRecord) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            "Invalid or expired challenge"
        );
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (challengeRecord.expiresAt < currentTime) {
        await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.challenge);
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Challenge expired");
    }

    try {
        const verification = await verifyRegistrationResponse({
            response: body.response,
            expectedChallenge: challengeRecord.challenge,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID
        });

        if (!verification.verified || !verification.registrationInfo) {
            return buildErrorResponse(
                event,
                HttpResponseStatus.UNAUTHORIZED,
                "Registration verification failed"
            );
        }

        const { credential } = verification.registrationInfo;

        // Store the credential directly - DynamoDB handles binary data
        await putItem(PASSKEY_CREDENTIALS_TABLE, {
            id: Buffer.from(credential.id).toString("base64"), // ID as base64 for easy lookup
            publicKey: credential.publicKey, // Store as Buffer directly
            counter: credential.counter,
            transports: body.response.response.transports
        });
        await deleteItem(PASSKEY_CHALLENGES_TABLE, challengeRecord.challenge);

        return buildResponse(event, HttpResponseStatus.OK, {
            verified: true,
            message: "Passkey registered successfully"
        });
    } catch (error) {
        console.error("Passkey registration error:", error);
        return buildErrorResponse(
            event,
            HttpResponseStatus.INTERNAL_SERVER_ERROR,
            "Registration failed"
        );
    }
};
