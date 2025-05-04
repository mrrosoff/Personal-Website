import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import { Resend } from "resend";

type RegisterPayload = {
    firstName: string;
    lastName: string;
    email: string;
};

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildResponse(400, "Missing Request Body");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const audienceId = await findAudienceId(resend);
    if (!audienceId) {
        return buildResponse(500, "Audience Not Found");
    }

    const payload: RegisterPayload = JSON.parse(event.body);
    const { error } = await resend.contacts.create({
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        unsubscribed: false,
        audienceId: audienceId
    });

    if (error) {
        const message = "Error Creating Contact";
        console.error(message, error);
        return buildResponse(500, message);
    }

    return buildResponse(200, "Email Registered Successfully");
};

async function findAudienceId(resend: Resend): Promise<string | null> {
    const { data, error } = await resend.audiences.list();
    if (error || !data) {
        console.error("Error Fetching Audiences", error);
        return null;
    }
    const { data: audiences } = data;
    return audiences[0]?.id || null;
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
