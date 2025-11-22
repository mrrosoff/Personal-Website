import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

import { buildResponse, HttpResponseStatus } from "../common";

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!);

    // Get priceIds from query string parameters
    const priceIdsParam = event.queryStringParameters?.priceIds || "";
    const priceIds = priceIdsParam.split(",").filter((id) => id.trim() !== "");

    // If no priceIds provided, return error
    if (priceIds.length === 0) {
        return buildResponse(event, HttpResponseStatus.BAD_REQUEST, {
            error: "No priceIds provided"
        });
    }

    // Create line items for each priceId
    const lineItems = priceIds.map((priceId) => ({
        price: priceId.trim(),
        quantity: 1
    }));

    const session = await stripe.checkout.sessions.create({
        ui_mode: "custom",
        line_items: lineItems,
        mode: "payment",
        cancel_url: "https://maxrosoff.com/ice-cream",
        return_url: `https://maxrosoff.com/ice-cream/checkout/return?sessionId={CHECKOUT_SESSION_ID}`
    });
    return buildResponse(event, HttpResponseStatus.OK, session);
};
