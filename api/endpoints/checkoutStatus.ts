import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../common";
import { registerNewMailingListUser } from "./register";

type GetCheckoutSessionStatusPayload = {
    sessionId: string;
};

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY!);
    const payload: GetCheckoutSessionStatusPayload = JSON.parse(event.body);
    try {
        const session = await stripe.checkout.sessions.retrieve(payload.sessionId);
        if (session.customer_email) {
            await registerNewMailingListUser({ email: session.customer_email });
        }
        return buildResponse(event, HttpResponseStatus.OK, session);
    } catch (error) {
        let message = "An Unknown Error Occurred";
        if (error instanceof Error) {
            message = error.message;
        }
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, message);
    }
};
