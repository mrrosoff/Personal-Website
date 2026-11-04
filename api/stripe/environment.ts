import type { APIGatewayEvent } from "aws-lambda";
import Stripe from "stripe";

import { LOCAL_ORIGIN } from "../common";
import { getParameter } from "../aws/services/parameterStore";

const LIVE_API_KEY = "/website/stripe/api-key";
const TEST_API_KEY = "/website/stripe/test/api-key";

function isLocalTest(event: APIGatewayEvent): boolean {
    const origin = event.headers?.Origin || event.headers?.origin;
    return origin === LOCAL_ORIGIN;
}

export async function stripeForEvent(event: APIGatewayEvent): Promise<Stripe> {
    const apiKey = await getParameter(isLocalTest(event) ? TEST_API_KEY : LIVE_API_KEY);
    return new Stripe(apiKey);
}

export function siteUrlForEvent(event: APIGatewayEvent): string {
    return isLocalTest(event) ? LOCAL_ORIGIN : "https://maxrosoff.com";
}

export async function checkoutLineItem(
    event: APIGatewayEvent,
    priceId: string
): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
    if (!isLocalTest(event)) {
        return { price: priceId, quantity: 1 };
    }

    const live = new Stripe(await getParameter(LIVE_API_KEY));
    const price = await live.prices.retrieve(priceId, { expand: ["product"] });
    const product = price.product as Stripe.Product;
    const taxCode = typeof product.tax_code === "string" ? product.tax_code : product.tax_code?.id;
    const recurring = price.recurring
        ? { interval: price.recurring.interval, interval_count: price.recurring.interval_count }
        : undefined;

    return {
        quantity: 1,
        price_data: {
            currency: price.currency,
            unit_amount: price.unit_amount ?? 0,
            recurring,
            product_data: { name: product.name, tax_code: taxCode }
        }
    };
}
