import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import { Resend } from "resend";

import { buildErrorResponse, buildResponse } from "../common";

type UnsubscribePayload = {
    email: string;
};

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(400, "Missing Request Body");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const payload: UnsubscribePayload = JSON.parse(event.body);
    const audienceId = process.env.RESEND_AUDIENCE_ID!;
    const removed = await unsubscribeUser(resend, audienceId, payload.email);
    if (!removed) {
        return buildResponse(200, {});
    }
    return buildResponse(200, {});
};

async function unsubscribeUser(
    resend: Resend,
    audienceId: string,
    email: string
): Promise<boolean> {
    const { data, error } = await resend.contacts.remove({
        audienceId: audienceId,
        email
    });
    if (error || !data) {
        throw Error(`Error Unsubscribing Contact: ${error?.message}`);
    }
    return data.deleted;
}
