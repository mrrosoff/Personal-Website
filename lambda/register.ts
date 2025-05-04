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
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing Request Body" })
        };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const audienceId = await findAudienceId(resend);
    if (!audienceId) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Audience Not Found" })
        };
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
        console.error("Error Creating Contact", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error })
        };
    }

    return {
        statusCode: 200,
        body: "Email Registered Successfully"
    };
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
