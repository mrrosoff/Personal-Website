import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import { Resend } from "resend";

type UnsubscribePayload = {
    email: string;
};

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildResponse(400, "Missing Request Body");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const payload: UnsubscribePayload = JSON.parse(event.body);
    const audienceId = process.env.RESEND_AUDIENCE_ID!;
    const removed = await unsubscribeUser(resend, audienceId, payload.email);
    if (!removed) {
        return buildResponse(200, "User Doesn't Exist");
    }
    return buildResponse(200, "Email Unsubscribed Successfully");
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

function buildResponse(statusCode: number, body: string): APIGatewayProxyResult {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "https://maxrosoff.com",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body
    };
}
