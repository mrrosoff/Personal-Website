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
            name: "Lemon Zest & Vanilla Meringues 🍋",
            color: "lemonchiffon"
        },
        {
            name: "Carmelized Pineapple 🍍",
            color: "gold"
        },
        {
            name: "Black Pepper Goat Chesse Ganache 🍨",
            color: "oldlace"
        }
    ],
    lastBatch: [
        {
            name: "Orange Creamsicle 🍊",
            color: "orange"
        },
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "sienna"
        },
        {
            name: "Mexican Hot Chocolate ☕",
            color: "tomato"
        },
        {
            name: "👻 Ghostly Presence 😱",
            color: "lightgrey"
        }
    ],
    upcomingFlavors: [
        {
            name: "Coffee + Chocolate Tres Leches ☕",
            color: "chocolate"
        },
        {
            name: "Salted Pretzel 🥨",
            color: "linen"
        },
        {
            name: "Mango Pistacio 🥭",
            color: "orangered"
        },
        {
            name: "Black Milk Tea Boba 🧋",
            color: "lightgrey"
        }
    ]
};
