import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { getParameters } from "../../aws/services/parameterStore";

type UnsubscribePayload = {
    email: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const resendKeys = await getParameters("/website/resend/api-key", "/website/resend/audience-id");
    const resend = new Resend(resendKeys["/website/resend/api-key"]);
    const payload: UnsubscribePayload = JSON.parse(event.body);
    const removed = await unsubscribeUser(resend, resendKeys["/website/resend/audience-id"], payload.email);
    if (!removed) {
        return buildResponse(event, HttpResponseStatus.OK, {});
    }
    return buildResponse(event, HttpResponseStatus.OK, {});
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
