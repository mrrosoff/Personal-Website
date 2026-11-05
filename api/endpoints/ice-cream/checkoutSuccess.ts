import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { decrementField, incrementField } from "../../aws/services/dynamodb";
import { getParameters } from "../../aws/services/parameterStore";
import { FLAVORS_TABLE, HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";
import { registerNewMailingListUser } from "../email/register";
import { sendOrderSuccessEmails } from "../email/sendEmail";
import { fulfillSubscriptionMonth, registerSubscriberOnMailingList } from "./subscribe";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const stripeKeys = await getParameters("/website/stripe/api-key", "/website/stripe/webhook");

    const stripe = new Stripe(stripeKeys["/website/stripe/api-key"]);
    const stripeEvent = await stripe.webhooks.constructEventAsync(
        event.body,
        event.headers["stripe-signature"]!,
        stripeKeys["/website/stripe/webhook"]
    );

    const invoice = stripeEvent.data.object as Stripe.Invoice;
    if (stripeEvent.type === "invoice.paid" && invoice.parent?.type === "subscription_details") {
        await fulfillSubscriptionMonth(stripe, invoice);
        return buildResponse(event, HttpResponseStatus.OK, { received: true });
    }

    if (stripeEvent.type !== "checkout.session.completed") {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Wrong Webhook Endpoint");
    }

    const session = stripeEvent.data.object;
    if (session.mode === "subscription") {
        await registerSubscriberOnMailingList(session);
        return buildResponse(event, HttpResponseStatus.OK, { received: true });
    }

    const paymentIntentId = session.payment_intent as string;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.metadata.fulfilled) {
        return buildResponse(event, HttpResponseStatus.OK, { received: true });
    }

    const customerEmail = session.customer_details?.email ?? session.customer_email ?? undefined;
    if (customerEmail) {
        const stripeName = session.customer_details?.name;
        const nameParts = stripeName?.split(" ");
        await registerNewMailingListUser({
            email: customerEmail,
            firstName: nameParts?.[0],
            lastName: nameParts?.[1]
        });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const productIds = lineItems.data.map((item) => item.price?.product as string);

    const decrementResults = await Promise.all(
        productIds.map(async (productId) => {
            const updated = await decrementField(FLAVORS_TABLE, productId, "count");
            return { productId, newCount: updated.count };
        })
    );
    const oversoldProductIds = decrementResults
        .filter((result) => result.newCount < 0)
        .map((result) => result.productId);

    if (oversoldProductIds.length > 0) {
        await processCheckoutOversold(stripe, session, lineItems.data, oversoldProductIds);
    }

    const keptItems = lineItems.data.filter(
        (item) => !oversoldProductIds.includes(item.price?.product as string)
    );
    if (keptItems.length > 0) {
        await sendOrderSuccessEmails({
            customerName: session.customer_details?.name ?? undefined,
            customerEmail,
            shippingAddress: session.customer_details?.address ?? undefined,
            items: keptItems.map((item) => ({
                name: item.description ?? "Unknown Item",
                quantity: item.quantity ?? 1
            }))
        });
    }

    await stripe.paymentIntents.update(paymentIntentId, {
        metadata: { fulfilled: "true" }
    });

    return buildResponse(event, HttpResponseStatus.OK, { received: true });
};

async function processCheckoutOversold(
    stripe: Stripe,
    session: Stripe.Checkout.Session,
    lineItems: Stripe.LineItem[],
    oversoldProductIds: string[]
) {
    await Promise.all(
        oversoldProductIds.map((productId) => incrementField(FLAVORS_TABLE, productId, "count"))
    );

    const paymentIntentId = session.payment_intent as string;
    const oversoldLineItems = lineItems.filter(({ price }) =>
        oversoldProductIds.includes(price!.product as string)
    );
    const refundAmount = oversoldLineItems.reduce((sum, item) => sum + item.amount_total, 0);

    if (!paymentIntentId || refundAmount <= 0) {
        return;
    }

    await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmount,
        reason: "requested_by_customer"
    });
}
