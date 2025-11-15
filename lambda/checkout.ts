import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

config();

export const handler = async (_event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!);
    const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
            {
                price: "price_1STmV8GZZEzkLsbiuQIZaVwK",
                quantity: 1
            }
        ],
        mode: "payment",
        return_url: `https://maxrosoff.com/ice-cream/checkout/return?session_id={CHECKOUT_SESSION_ID}`
    });
    return {
        statusCode: 200,
        body: `Created Checkout Session With Secret: ${session.client_secret}`
    };
};
