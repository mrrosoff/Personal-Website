import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { FLAVORS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { decrementField, getAllItems } from "../../aws/services/dynamodb";
import { getParameter } from "../../aws/services/parameterStore";
import { authenticateHTTPAccessToken, UserType } from "../../auth";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { sendOrderSuccessEmail } from "../email/sendEmail";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const priceIdsParam = event.queryStringParameters?.priceIds || "";
    const priceIds = priceIdsParam.split(",").filter((id) => id.trim() !== "");

    if (priceIds.length === 0) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "No priceIds Provided");
    }

    const payload = await authenticateHTTPAccessToken(event);
    if (payload?.userType === UserType.FRIEND) {
        return handleFriendCheckout(event, priceIds);
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
    priceIds: string[]
): Promise<APIGatewayProxyResult> => {
    const allFlavors = await getAllItems(FLAVORS_TABLE);
    const selectedFlavors = allFlavors.filter((flavor) => priceIds.includes(flavor.priceId));

    await Promise.all(
        selectedFlavors.map((flavor) => decrementField(FLAVORS_TABLE, flavor.productId, "count"))
    );

    const payload = await authenticateHTTPAccessToken(event);
    await sendOrderSuccessEmail({
        customerName: payload?.id,
        items: selectedFlavors.map((flavor) => ({ name: flavor.name, quantity: 1 }))
    });

    return buildResponse(event, HttpResponseStatus.OK, { friendCheckout: true });
};
