import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { decrementField, getEntireTable } from "../../aws/services/dynamodb";
import {
    checkoutLineItem,
    isLocalTest,
    siteUrlForEvent,
    stripeForEvent
} from "../../stripe/environment";
import { authenticateHTTPAccessToken, UserType } from "../../auth";
import { FLAVORS_TABLE, HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";
import type { DatabaseFlavor } from "../../types";
import { sendOrderSuccessEmails } from "../email/sendEmail";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const priceIds = (event.queryStringParameters?.priceIds ?? "").split(",");

    const { token, error } = await authenticateHTTPAccessToken(event);
    if (error) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, error);
    }

    const flavors = await getEntireTable(FLAVORS_TABLE);
    const unavailable = findUnavailableFlavor(flavors, priceIds);
    if (unavailable) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, unavailable);
    }

    if (token?.userType === UserType.FRIEND) {
        return handleFriendCheckout(event, flavors, priceIds, token.id);
    }

    const stripe = await stripeForEvent(event);
    const lineItems = await Promise.all(
        priceIds.map((priceId) => checkoutLineItem(event, priceId))
    );

    const session = await stripe.checkout.sessions.create({
        ui_mode: "custom",
        automatic_tax: { enabled: true },
        line_items: lineItems,
        mode: "payment",
        return_url: `${siteUrlForEvent(event)}/ice-cream/checkout/return?sessionId={CHECKOUT_SESSION_ID}`,
        metadata: {
            priceIds: priceIds.join(",")
        }
    });
    return buildResponse(event, HttpResponseStatus.OK, session);
};

function findUnavailableFlavor(flavors: DatabaseFlavor[], priceIds: string[]): string | null {
    for (const priceId of new Set(priceIds)) {
        const flavor = flavors.find((candidate) => candidate.priceId === priceId);
        if (!flavor || (flavor.type !== "currentFlavor" && flavor.type !== "lastBatch")) {
            return "One of those flavors isn't available anymore.";
        }
        const wanted = priceIds.filter((id) => id === priceId).length;
        if (flavor.count < wanted) {
            return `Sorry, ${flavor.name} just sold out.`;
        }
    }
    return null;
}

const handleFriendCheckout = async (
    event: APIGatewayEvent,
    flavors: DatabaseFlavor[],
    priceIds: string[],
    customerName: string
): Promise<APIGatewayProxyResult> => {
    if (isLocalTest(event)) {
        return buildResponse(event, HttpResponseStatus.OK, { friendCheckout: true });
    }

    const selectedFlavors = flavors.filter((flavor) => priceIds.includes(flavor.priceId));

    await Promise.all(
        selectedFlavors.map((flavor) => decrementField(FLAVORS_TABLE, flavor.productId, "count"))
    );

    const { email } = JSON.parse(event.body ?? "{}");
    await sendOrderSuccessEmails({
        customerName,
        customerEmail: email,
        notifyCustomer: true,
        items: selectedFlavors.map((flavor) => ({ name: flavor.name, quantity: 1 }))
    });

    return buildResponse(event, HttpResponseStatus.OK, { friendCheckout: true });
};
