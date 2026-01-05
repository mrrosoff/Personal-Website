import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { FLAVORS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { getParameter } from "../../aws/services/parameterStore";
import { putItem } from "../../aws/services/dynamodb";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { FlavorType } from "../../types";
import { isAuthenticated } from "../../auth";

type ProvisionFlavorPayload = {
    flavorName: string;
    initialQuantity: number;
    color: string;
    type: FlavorType | null;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: ProvisionFlavorPayload = JSON.parse(event.body);

    if (!(await isAuthenticated(event))) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Authentication required");
    }

    const stripeApiKey = await getParameter("/website/stripe/api-key");
    const stripe = new Stripe(stripeApiKey);
    const product = await stripe.products.create({
        name: body.flavorName
    });
    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 500,
        currency: "usd"
    });

    const flavor = {
        productId: product.id,
        priceId: price.id,
        name: body.flavorName,
        color: body.color,
        count: body.initialQuantity,
        type: body.type
    };
    await putItem(FLAVORS_TABLE, flavor);
    return buildResponse(event, HttpResponseStatus.OK, flavor);
};
