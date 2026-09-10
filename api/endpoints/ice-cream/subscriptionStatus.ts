import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { getParameter } from "../../aws/services/parameterStore";
import { HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";

type SubscriptionStatusPayload = {
    email?: string;
};

const LIVE_STATUSES: Stripe.Subscription.Status[] = [
    "active",
    "trialing",
    "past_due",
    "unpaid",
    "paused"
];

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const payload: SubscriptionStatusPayload = JSON.parse(event.body);
    const email = payload.email?.trim();
    if (!email) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Email");
    }

    const stripe = new Stripe(await getParameter("/website/stripe/api-key"));
    return buildResponse(event, HttpResponseStatus.OK, {
        subscribed: await hasSubscription(stripe, email)
    });
};

async function hasSubscription(stripe: Stripe, email: string): Promise<boolean> {
    const customers = await stripe.customers.list({ email, limit: 10 });
    for (const customer of customers.data) {
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "all",
            limit: 100
        });
        if (subscriptions.data.some(({ status }) => LIVE_STATUSES.includes(status))) {
            return true;
        }
    }
    return false;
}
