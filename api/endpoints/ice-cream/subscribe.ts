import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { decrementField, getEntireTable } from "../../aws/services/dynamodb";
import { getParameters } from "../../aws/services/parameterStore";
import { FLAVORS_TABLE, HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";
import type { DatabaseFlavor } from "../../types";
import { registerNewMailingListUser } from "../email/register";
import { sendOrderSuccessEmails } from "../email/sendEmail";

type SubscribePayload = {
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

    const payload: SubscribePayload = JSON.parse(event.body);
    const email = payload.email?.trim();

    const stripeKeys = await getParameters(
        "/website/stripe/api-key",
        "/website/stripe/subscription-price"
    );
    const stripe = new Stripe(stripeKeys["/website/stripe/api-key"]);

    if (email) {
        return buildResponse(event, HttpResponseStatus.OK, {
            subscribed: await hasSubscription(stripe, email)
        });
    }

    const session = await stripe.checkout.sessions.create({
        ui_mode: "custom",
        line_items: [{ price: stripeKeys["/website/stripe/subscription-price"], quantity: 1 }],
        mode: "subscription",
        return_url: `https://maxrosoff.com/ice-cream/checkout/return?sessionId={CHECKOUT_SESSION_ID}`
    });
    return buildResponse(event, HttpResponseStatus.OK, session);
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

export const registerSubscriberOnMailingList = async (session: Stripe.Checkout.Session) => {
    const email = session.customer_email ?? session.customer_details?.email;
    if (!email) {
        return;
    }
    const nameParts = session.customer_details?.name?.split(" ");
    await registerNewMailingListUser({
        email,
        firstName: nameParts?.[0],
        lastName: nameParts?.[1]
    });
};

export const fulfillSubscriptionMonth = async (stripe: Stripe, invoice: Stripe.Invoice) => {
    const fulfilledMetadataKey = "fulfilledFlavors";
    if (invoice.metadata?.[fulfilledMetadataKey]) {
        return;
    }

    const allFlavors = await getEntireTable(FLAVORS_TABLE);
    const available = allFlavors.filter(
        (flavor) => flavor.type === "currentFlavor" && flavor.count > 0
    );
    const picked = pickRandomFlavors(available);

    await stripe.invoices.update(invoice.id!, {
        metadata: { [fulfilledMetadataKey]: picked.map((flavor) => flavor.name).join(", ") }
    });

    await Promise.all(
        picked.map((flavor) => decrementField(FLAVORS_TABLE, flavor.productId, "count"))
    );

    const customerName = invoice.customer_name ?? undefined;
    const customerEmail = invoice.customer_email ?? undefined;
    await sendOrderSuccessEmails({
        customerName,
        customerEmail,
        items: picked.map((flavor) => ({ name: flavor.name, quantity: 1 })),
        notifyCustomer: false
    });
};

export const pickRandomFlavors = (flavors: DatabaseFlavor[]): DatabaseFlavor[] => {
    const shuffled = [...flavors];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 2); // 2 flavors per month
};
