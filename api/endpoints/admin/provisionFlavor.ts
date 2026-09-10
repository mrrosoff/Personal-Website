import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

import { getParameter } from "../../aws/services/parameterStore";
import { getEntireTable, putItem } from "../../aws/services/dynamodb";
import { FLAVORS_TABLE, HttpResponseStatus, buildErrorResponse, buildResponse } from "../../common";
import type { FlavorType } from "../../types";
import { isAdmin } from "../../auth";

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

    if (!(await isAdmin(event))) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication Required"
        );
    }

    const existingFlavors = await getEntireTable(FLAVORS_TABLE);
    const normalizedName = body.flavorName.trim().toLowerCase();
    const duplicate = existingFlavors.find(
        (flavor) => flavor.name.trim().toLowerCase() === normalizedName
    );
    if (duplicate) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            `A Flavor Named "${duplicate.name}" Already Exists`
        );
    }

    const stripeApiKey = await getParameter("/website/stripe/api-key");
    const stripe = new Stripe(stripeApiKey);
    const product = await stripe.products.create({
        name: body.flavorName,
        default_price_data: {
            unit_amount: 600,
            currency: "usd"
        }
    });

    const priceId = product.default_price as string;
    const flavor = {
        productId: product.id,
        priceId,
        name: body.flavorName,
        color: body.color,
        count: body.initialQuantity,
        type: body.type
    };
    await putItem(FLAVORS_TABLE, flavor);
    return buildResponse(event, HttpResponseStatus.OK, flavor);
};
