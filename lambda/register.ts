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
    try {
        const payload: RegisterPayload = JSON.parse(event.body);
        const audienceId = await findAudienceId(resend);
        const userId = await findUserIfAlreadyRegistered(resend, audienceId, payload.email);
        if (userId) {
            return buildResponse(200, "Email Already Registered");
        }
        const newUserId = await registerNewUser(resend, audienceId, payload);
        return buildResponse(200, `Email Registered Successfully With ID: ${newUserId}`);
    } catch (error: unknown) {
        console.error(error);
        const errorMessage = (error instanceof Error) ? error.message : "Internal Server Error";
        return buildResponse(500, errorMessage);
    }
};

async function findAudienceId(resend: Resend): Promise<string> {
    const { data, error } = await resend.audiences.list();
    if (error || !data) {
        throw Error(`Error Fetching Audiences: ${error?.message}`);
    }
    const { data: audiences } = data;
    const audienceId = audiences[0]?.id;
    if (!audienceId) {
        throw Error("No Audience Found");
    }
    return audienceId;
}

async function findUserIfAlreadyRegistered(
    resend: Resend,
    audienceId: string,
    email: string
): Promise<string | null> {
    const { data, error } = await resend.contacts.get({ audienceId, email });
    console.error(error);
    // if (error?.message === "Contact not found") {
    //     return null;
    // }
    if (error || !data) {
        throw Error(`Error Fetching User: ${error?.message}`);
    }
    return data.id;
}

async function registerNewUser(
    resend: Resend,
    audienceId: string,
    payload: RegisterPayload
): Promise<string> {
    const { data, error } = await resend.contacts.create({
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        unsubscribed: false,
        audienceId: audienceId
    });
    if (error || !data) {
        throw Error(`Error Creating Contact: ${error?.message}`);
    }
    return data.id;
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
