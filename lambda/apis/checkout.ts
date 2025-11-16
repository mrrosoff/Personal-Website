import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

import { buildResponse, HttpResponseStatus } from "../common";

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!);
    const session = await stripe.checkout.sessions.create({
        ui_mode: "custom",
        line_items: [
            {
                price: "price_1STmV8GZZEzkLsbiuQIZaVwK",
                quantity: 1
            }
        ],
        mode: "payment",
        return_url: `https://maxrosoff.com/ice-cream/checkout/return?session_id={CHECKOUT_SESSION_ID}`
    });
    return buildResponse(event, HttpResponseStatus.OK, session);
};
