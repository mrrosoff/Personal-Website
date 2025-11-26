import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import Stripe from "stripe";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../common";
import { registerNewMailingListUser } from "./register";
import { decrementPropertyCount } from "../aws/dynamodb";
import { FLAVORS_TABLE } from "../../infrastructure/WebsiteAPIStack";

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY!);
    const stripeEvent = await stripe.webhooks.constructEventAsync(
        event.body,
        event.headers["stripe-signature"]!,
        process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (stripeEvent.type !== "checkout.session.completed") {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Wrong Webhook Endpoint");
    }

    const session = stripeEvent.data.object;
    if (session.customer_email) {
        const stripeName = session.customer_details?.name;
        const nameParts = stripeName?.split(" ");
        await registerNewMailingListUser({
            email: session.customer_email,
            firstName: nameParts?.[0],
            lastName: nameParts?.[1]
        });
    }

    const priceIds = (session.line_items?.data ?? []).map((item) => item.price!.id);
    await Promise.all(
        priceIds.map((priceId) => decrementPropertyCount(FLAVORS_TABLE, priceId, "count"))
    );
    return buildResponse(event, HttpResponseStatus.OK, stripeEvent);
};
