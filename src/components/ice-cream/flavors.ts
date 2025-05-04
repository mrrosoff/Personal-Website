export type IceCreamFlavor = {
    name: string;
    color?: string;
};

export const ICE_CREAM_FLAVORS: Record<string, IceCreamFlavor[]> = {
    currentFlavors: [
        {
            name: "Orange Creamsicle 🍊",
            color: "orange"
        },
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "brown"
        }
    ],
    lastBatch: [
        {
            name: "Mexican Hot Chocolate ☕",
            color: "chocolate"
        },
        {
            name: "👻 Ghostly Presence 😱",
            color: "lightgrey"
        },
        {
            name: "❤️ Love Potion 💖",
            color: "maroon"
        },
        {
            name: "🌰 Chestnut's Roasting...",
            color: "chocolate"
        }
    ],
    upcomingFlavors: [
        {
            name: "Carrot Cake 🥕",
            color: "orange"
        },
        {
            name: "Chocolate Chocolate Chip 🍪",
            color: "brown"
        },
        {
            name: "Pistachio 🍦",
            color: "lightgreen"
        },
        {
            name: "Lemon Sorbet 🍋‍🟩",
            color: "yellow"
        },
        {
            name: "🐎 Horseradish"
        },
        {
            name: "Black Milk Tea Boba 🧋"
        }
    ]
};
