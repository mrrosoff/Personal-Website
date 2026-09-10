import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";
import { Resend } from "resend";

import { getParameters } from "../../aws/services/parameterStore";
import { HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";

type ManageSubscriptionPayload = {
    email: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const payload: ManageSubscriptionPayload = JSON.parse(event.body);
    const email = payload.email?.trim();
    if (!email) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Email");
    }

    const keys = await getParameters("/website/stripe/api-key", "/website/resend/api-key");
    const stripe = new Stripe(keys["/website/stripe/api-key"]);

    const portalUrl = await createPortalSession(stripe, email);
    if (portalUrl) {
        await sendPortalLinkEmail(keys["/website/resend/api-key"], email, portalUrl);
    }

    return buildResponse(event, HttpResponseStatus.OK, { sent: true });
};

async function createPortalSession(stripe: Stripe, email: string): Promise<string | null> {
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) {
        return null;
    }

    const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 1
    });
    if (subscriptions.data.length === 0) {
        return null;
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: "https://maxrosoff.com/ice-cream"
    });
    return session.url;
}

async function sendPortalLinkEmail(resendApiKey: string, email: string, portalUrl: string) {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
        from: "Max's Freezer Stash <orders@ice-cream.maxrosoff.com>",
        to: email,
        replyTo: "me@maxrosoff.com",
        subject: "Manage Your Ice Cream Subscription",
        text: [
            "Here is your link to manage the ice cream subscription.",
            portalUrl,
            "You can update your card or cancel from there. The link expires shortly, so grab a new one from the site if it stops working."
        ].join("\n\n")
    });

    if (error) {
        console.error(error);
        throw Error("Error Sending Subscription Portal Email");
    }
}
