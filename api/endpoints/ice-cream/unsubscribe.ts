import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";
import { Resend } from "resend";

import { generateToken, UserType } from "../../auth";
import { getParameters } from "../../aws/services/parameterStore";
import { HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";

type UnsubscribePayload = {
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

    const payload: UnsubscribePayload = JSON.parse(event.body);
    const email = payload.email?.trim();
    if (!email) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Email");
    }

    const keys = await getParameters("/website/stripe/api-key", "/website/resend/api-key");
    const stripe = new Stripe(keys["/website/stripe/api-key"]);

    const subscriptionId = await findLiveSubscription(stripe, email);
    if (subscriptionId) {
        const token = await generateToken(subscriptionId, {
            userType: UserType.SUBSCRIBER,
            email,
            expiresIn: "30m"
        });
        await sendCancelLinkEmail(keys["/website/resend/api-key"], email, token);
    }

    return buildResponse(event, HttpResponseStatus.OK, { sent: true });
};

async function findLiveSubscription(stripe: Stripe, email: string): Promise<string | null> {
    const customers = await stripe.customers.list({ email, limit: 10 });
    for (const customer of customers.data) {
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "all",
            limit: 100
        });
        const live = subscriptions.data.find(({ status }) => LIVE_STATUSES.includes(status));
        if (live) {
            return live.id;
        }
    }
    return null;
}

async function sendCancelLinkEmail(resendApiKey: string, email: string, token: string) {
    const resend = new Resend(resendApiKey);
    const url = `https://maxrosoff.com/ice-cream/cancel?token=${encodeURIComponent(token)}`;

    const { error } = await resend.emails.send({
        from: "Max's Freezer Stash <orders@ice-cream.maxrosoff.com>",
        to: email,
        replyTo: "me@maxrosoff.com",
        subject: "Cancel Your Ice Cream Subscription",
        text: [
            "Here is your link to cancel the ice cream subscription.",
            url,
            "The link works for the next 30 minutes. Ask for another from the site if it expires."
        ].join("\n\n")
    });

    if (error) {
        console.error(error);
        throw Error("Error Sending Cancel Link Email");
    }
}
