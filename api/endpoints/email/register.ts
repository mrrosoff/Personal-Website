import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { getParameters } from "../../aws/services/parameterStore";

type RegisterPayload = {
    firstName?: string;
    lastName?: string;
    email: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const payload: RegisterPayload = JSON.parse(event.body);
    const userId = await registerNewMailingListUser(payload);
    return buildResponse(event, HttpResponseStatus.OK, { userId });
};

export async function registerNewMailingListUser(payload: RegisterPayload) {
    const resendKeys = await getParameters("/website/resend/api-key", "/website/resend/audience-id");
    const resend = new Resend(resendKeys["/website/resend/api-key"]);

    const audienceId = resendKeys["/website/resend/audience-id"];
    const userId = await findUserIfAlreadyRegistered(resend, audienceId, payload.email);
    if (userId) {
        return userId;
    }
    return await registerNewUser(resend, audienceId, payload);
}

async function findUserIfAlreadyRegistered(
    resend: Resend,
    audienceId: string,
    email: string
): Promise<string | null> {
    const { data, error } = await resend.contacts.get({ audienceId, email });
    if (error?.name === "not_found") {
        return null;
    }
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
