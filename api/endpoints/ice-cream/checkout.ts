import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { decrementField, getAllItems } from "../../aws/services/dynamodb";
import { getParameter } from "../../aws/services/parameterStore";
import { authenticateHTTPAccessToken, UserType } from "../../auth";
import { FLAVORS_TABLE, HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";
import { sendOrderSuccessEmail } from "../email/sendEmail";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const priceIdsParam = event.queryStringParameters?.priceIds || "";
    const priceIds = priceIdsParam.split(",").filter((id) => id.trim() !== "");

    if (priceIds.length === 0) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "No priceIds Provided");
    }

    const payload = await authenticateHTTPAccessToken(event);
    const allowedUserTypes = [UserType.FRIEND, UserType.SPOTIFY_OWNER];
    if (payload && allowedUserTypes.includes(payload.userType)) {
        return handleFriendCheckout(event, priceIds, payload.id);
    }

    const stripe = new Stripe(await getParameter("/website/stripe/api-key"));

    const lineItems = priceIds.map((priceId) => ({
        price: priceId.trim(),
        quantity: 1
    }));

    const session = await stripe.checkout.sessions.create({
        ui_mode: "custom",
        line_items: lineItems,
        mode: "payment",
        return_url: `https://maxrosoff.com/ice-cream/checkout/return?sessionId={CHECKOUT_SESSION_ID}`,
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
    const allFlavors = await getAllItems(FLAVORS_TABLE);
    const selectedFlavors = allFlavors.filter((flavor) => priceIds.includes(flavor.priceId));

    await Promise.all(
        selectedFlavors.map((flavor) => decrementField(FLAVORS_TABLE, flavor.productId, "count"))
    );

    await sendOrderSuccessEmail({
        customerName,
        items: selectedFlavors.map((flavor) => ({ name: flavor.name, quantity: 1 }))
    });

    return buildResponse(event, HttpResponseStatus.OK, { friendCheckout: true });
};
