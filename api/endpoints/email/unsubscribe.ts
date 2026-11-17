import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import { getParameters } from "../../aws/services/parameterStore";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";

type UnsubscribePayload = {
    email: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const resendKeys = await getParameters("/website/resend/api-key", "/website/resend/audience");
    const resend = new Resend(resendKeys["/website/resend/api-key"]);
    const payload = JSON.parse(event.body) as UnsubscribePayload;
    await unsubscribeUser(resend, resendKeys["/website/resend/audience"], payload.email);
    return buildResponse(event, HttpResponseStatus.OK, {});
};

async function unsubscribeUser(resend: Resend, audienceId: string, email: string): Promise<void> {
    const { error } = await resend.contacts.remove({
        audienceId: audienceId,
        email
    });
    if (error) {
        throw Error(`Error Unsubscribing Contact: ${error.message}`);
    }
}
