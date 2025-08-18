export type IceCreamFlavor = {
    name: string;
    color?: string;
};

export const ICE_CREAM_FLAVORS: Record<string, IceCreamFlavor[]> = {
    currentFlavors: [
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "sienna"
        },
        {
            name: "Salted Pretzel 🥨",
            color: "linen"
        },
        {
            name: "Blueberry Matcha 🍵",
            color: "lightgreen"
        },
        {
            name: "Coffee + Chocolate Tres Leches ☕",
            color: "chocolate"
        }
    ],
    lastBatch: [
        {
            name: "Strawberry Cucumber 🥒",
            color: "salmon"
        },
        {
            name: "Black Pepper Goat Cheese Ganache 🍨",
            color: "oldlace"
        },
        {
            name: "Coconut + Caramelized Pineapple 🍍",
            color: "gold"
        },
        {
            name: "👻 Ghostly Presence 😱",
            color: "lightgrey"
        }
    ],
    upcomingFlavors: []
};
