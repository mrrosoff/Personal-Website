import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { getParameter } from "../../aws/services/parameterStore";

type GetCheckoutSessionStatusPayload = {
    sessionId: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const stripe = new Stripe(await getParameter("/website/stripe/api-key"));
    const payload: GetCheckoutSessionStatusPayload = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.retrieve(payload.sessionId);
    return buildResponse(event, HttpResponseStatus.OK, session);
};
