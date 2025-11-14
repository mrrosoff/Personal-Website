import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

type CreateCheckoutSessionPayload = {
    lineItems: string[];
};

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return { statusCode: 400, body: "Missing Request Body" };
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY!);
    const payload: CreateCheckoutSessionPayload = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: payload.lineItems.map((item) => ({ price: item, quantity: 1 })),
        mode: "payment",
        return_url: `https://maxrosoff.com/return?session_id={CHECKOUT_SESSION_ID}`
    });
    return {
        statusCode: 200,
        body: `Created Checkout Session With Secret: ${session.client_secret}`
    };
};
