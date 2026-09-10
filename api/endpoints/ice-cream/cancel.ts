import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { decryptToken, UserType } from "../../auth";
import { getParameter } from "../../aws/services/parameterStore";
import { HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";

type CancelPayload = {
    token?: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const payload: CancelPayload = JSON.parse(event.body);
    if (!payload.token) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Token");
    }

    const accessToken = await decryptToken(payload.token).catch(() => null);
    if (!accessToken || accessToken.userType !== UserType.SUBSCRIBER) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "That link is not valid anymore. Ask for a new one."
        );
    }

    const stripe = new Stripe(await getParameter("/website/stripe/api-key"));
    const subscription = await stripe.subscriptions.retrieve(accessToken.id).catch(() => null);
    if (!subscription) {
        return buildErrorResponse(event, HttpResponseStatus.NOT_FOUND, "No Subscription Found");
    }

    if (subscription.status === "canceled") {
        return buildResponse(event, HttpResponseStatus.OK, { cancelled: true });
    }

    await stripe.subscriptions.cancel(accessToken.id);
    return buildResponse(event, HttpResponseStatus.OK, { cancelled: true });
};
