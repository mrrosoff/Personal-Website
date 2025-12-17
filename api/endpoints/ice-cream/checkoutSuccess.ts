import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { FLAVORS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { decrementPropertyCount } from "../../aws/services/dynamodb";
import { getParameters } from "../../aws/services/parameterStore";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { registerNewMailingListUser } from "../email/register";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const stripeKeys = await getParameters("/website/stripe/api-key", "/website/stripe/webhook");

    const stripe = new Stripe(stripeKeys["/website/stripe/api-key"]);
    const stripeEvent = await stripe.webhooks.constructEventAsync(
        event.body,
        event.headers["stripe-signature"]!,
        stripeKeys["/website/stripe/webhook"]
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

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceIds = lineItems.data.map((item) => item.price!.id);
    await Promise.all(
        priceIds.map((priceId) => decrementPropertyCount(FLAVORS_TABLE, priceId, "count"))
    );
    return buildResponse(event, HttpResponseStatus.OK, { received: true });
};
