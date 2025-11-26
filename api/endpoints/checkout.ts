import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../common";

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!);

    const priceIdsParam = event.queryStringParameters?.priceIds || "";
    const priceIds = priceIdsParam.split(",").filter((id) => id.trim() !== "");

    if (priceIds.length === 0) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "No priceIds Provided");
    }

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
