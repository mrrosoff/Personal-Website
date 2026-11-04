import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { stripeForEvent } from "../../stripe/environment";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";

type GetCheckoutSessionStatusPayload = {
    sessionId: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const stripe = await stripeForEvent(event);
    const payload: GetCheckoutSessionStatusPayload = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.retrieve(payload.sessionId);
    return buildResponse(event, HttpResponseStatus.OK, session);
};
