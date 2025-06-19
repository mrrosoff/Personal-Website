export type IceCreamFlavor = {
    name: string;
    color?: string;
};

export const ICE_CREAM_FLAVORS: Record<string, IceCreamFlavor[]> = {
    currentFlavors: [
        {
            name: "Strawberry Cucumber 🥒",
            color: "salmon"
        },
        {
            name: "Honey Roasted Banana 🍌",
            color: "yellow"
        },
        {
            name: "Lemon Zest & Vanilla Meringues 🍋",
            color: "lemonchiffon"
        },
        {
            name: "Coconut + Caramelized Pineapple 🍍",
            color: "gold"
        }
    ],
    lastBatch: [
        {
            name: "Black Pepper Goat Cheese Ganache 🍨",
            color: "oldlace"
        },
        {
            name: "Orange Creamsicle 🍊",
            color: "orange"
        },
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "sienna"
        },
        {
            name: "👻 Ghostly Presence 😱",
            color: "lightgrey"
        }
    ],
    upcomingFlavors: [
        {
            name: "Matcha Matcha Man 🍵",
            color: "lightgreen"
        },
        {
            name: "Coffee + Chocolate Tres Leches ☕",
            color: "chocolate"
        },
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "sienna"
        },
        {
            name: "Salted Pretzel 🥨",
            color: "linen"
        },
        {
            name: "Mango Pistacio 🥭",
            color: "orangered"
        }
    ]
};
