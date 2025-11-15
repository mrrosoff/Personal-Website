import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

import { buildResponse } from "../common";

type GetCheckoutSessionStatusPayload = {
    session_id: string;
};

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildResponse(400, "Missing Request Body");
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY!);
    const payload: GetCheckoutSessionStatusPayload = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.retrieve(payload.session_id);
    return buildResponse(200, `Found Checkout Session With Status: ${session.status}`);
};
