import { faker } from "@faker-js/faker";
import { beforeEach, vi } from "vitest";

import { mockFlavor } from "../mocks/aws/dynamodb";

export const mockCheckoutSession = {
    id: `cs_${faker.string.alphanumeric(24)}`,
    mode: "payment",
    status: "complete",
    payment_intent: `pi_${faker.string.alphanumeric(24)}`,
    customer_details: { email: faker.internet.email(), name: faker.person.fullName() }
};

export const mockLineItem = {
    price: { product: mockFlavor.productId },
    description: mockFlavor.name,
    quantity: 1,
    amount_total: 600
};

export const mockSubscription = { id: `sub_${faker.string.alphanumeric(24)}`, status: "active" };

export const mockStripe = {
    webhooks: { constructEventAsync: vi.fn() },
    checkout: { sessions: { create: vi.fn(), retrieve: vi.fn(), listLineItems: vi.fn() } },
    paymentIntents: { retrieve: vi.fn(), update: vi.fn() },
    refunds: { create: vi.fn() },
    subscriptions: { retrieve: vi.fn(), cancel: vi.fn(), list: vi.fn() },
    customers: { list: vi.fn() },
    products: { create: vi.fn(), update: vi.fn() },
    prices: { retrieve: vi.fn() },
    invoices: { retrieve: vi.fn(), update: vi.fn() }
};

beforeEach(() => {
    mockStripe.webhooks.constructEventAsync.mockResolvedValue({
        type: "checkout.session.completed",
        data: { object: mockCheckoutSession }
    });
    mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession);
    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockCheckoutSession);
    mockStripe.checkout.sessions.listLineItems.mockResolvedValue({ data: [mockLineItem] });
    mockStripe.paymentIntents.retrieve.mockResolvedValue({ metadata: {} });
    mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);
    mockStripe.subscriptions.list.mockResolvedValue({ data: [mockSubscription] });
    mockStripe.customers.list.mockResolvedValue({
        data: [{ id: `cus_${faker.string.alphanumeric(14)}` }]
    });
    mockStripe.products.create.mockResolvedValue({
        id: mockFlavor.productId,
        default_price: mockFlavor.priceId
    });
    mockStripe.prices.retrieve.mockResolvedValue({
        currency: "usd",
        unit_amount: 600,
        recurring: null,
        product: { name: mockFlavor.name, tax_code: "txcd_99999999" }
    });
    mockStripe.invoices.retrieve.mockResolvedValue({ metadata: {} });
});

export default function Stripe() {
    return mockStripe;
}
