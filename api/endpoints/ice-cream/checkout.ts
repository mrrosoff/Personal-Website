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
import { sendOrderSuccessEmails } from "../email/sendEmail";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const priceIdsParam = event.queryStringParameters?.priceIds || "";
    const priceIds = priceIdsParam.split(",").filter((id) => id.trim() !== "");

    if (priceIds.length === 0) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "No priceIds Provided");
    }

    const { token, error } = await authenticateHTTPAccessToken(event);
    if (error) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, error);
    }
    if (token?.userType === UserType.FRIEND) {
        return handleFriendCheckout(event, priceIds, token.id);
    }

    const stripe = await stripeForEvent(event);
    const lineItems = await Promise.all(
        priceIds.map((priceId) => checkoutLineItem(event, priceId.trim()))
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

const handleFriendCheckout = async (
    event: APIGatewayEvent,
    priceIds: string[],
    customerName: string
): Promise<APIGatewayProxyResult> => {
    if (isLocalTest(event)) {
        return buildResponse(event, HttpResponseStatus.OK, { friendCheckout: true });
    }

    const allFlavors = await getEntireTable(FLAVORS_TABLE);
    const selectedFlavors = allFlavors.filter((flavor) => priceIds.includes(flavor.priceId));

    await Promise.all(
        selectedFlavors.map((flavor) => decrementField(FLAVORS_TABLE, flavor.productId, "count"))
    );

    const { email } = JSON.parse(event.body ?? "{}");
    await sendOrderSuccessEmails({
        customerName,
        customerEmail: email,
        items: selectedFlavors.map((flavor) => ({ name: flavor.name, quantity: 1 }))
    });

    return buildResponse(event, HttpResponseStatus.OK, { friendCheckout: true });
};
