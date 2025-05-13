export type IceCreamFlavor = {
    name: string;
    color?: string;
};

export const ICE_CREAM_FLAVORS: Record<string, IceCreamFlavor[]> = {
    currentFlavors: [
        {
            name: "Carrot Cake 🥕 Ice Cream Sandwiches",
            color: "coral"
        },
        {
            name: "Orange Creamsicle 🍊",
            color: "orange"
        },
        {
            name: "Black Pepper Goat Chesse Ganache 🍨",
            color: "oldlace"
        },
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "sienna"
        }
    ],
    lastBatch: [
        {
            name: "Mexican Hot Chocolate ☕",
            color: "tomato"
        },
        {
            name: "👻 Ghostly Presence 😱",
            color: "lightgrey"
        },
        {
            name: "Chestnut 🌰",
            color: "chocolate"
        }
    ],
    upcomingFlavors: [
        {
            name: "Strawberry Cucumber Sorbet 🥒",
            color: "salmon"
        },
        {
            name: "Cocao Nib French Press Sherbet ☕",
            color: "chocolate"
        },
        {
            name: "Pistachio 🍦",
            color: "lightgreen"
        },
        {
            name: "Black Milk Tea Boba 🧋",
            color: "lightgrey"
        }
    ]
};
