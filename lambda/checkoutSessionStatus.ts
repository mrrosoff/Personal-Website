import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

type GetCheckoutSessionStatusPayload = {
    session_id: string;
};

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return { statusCode: 400, body: "Missing Request Body" };
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY!);
    const payload: GetCheckoutSessionStatusPayload = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.retrieve(payload.session_id);
    return {
        statusCode: 200,
        body: `Found Checkout Session With Status: ${session.status}`
    };
};
