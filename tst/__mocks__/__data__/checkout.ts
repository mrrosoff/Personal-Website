import { mockFlavor } from "./aws/dynamodb";

export const mockCheckoutFlavors = ["Fig", "Plum", "Yuzu", "Mint", "Kiwi"].map((name) => ({
    ...mockFlavor,
    productId: name,
    priceId: `price_${name}`,
    name,
    color: name === "Plum" ? "" : "pink"
}));
