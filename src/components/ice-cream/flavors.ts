export type IceCreamFlavor = {
    name: string;
    color?: string;
};

export const ICE_CREAM_FLAVORS: Record<string, IceCreamFlavor[]> = {
    currentFlavors: [
        {
            name: "Nothing Here! Check back soon! :)",
            color: "white"
        }
    ],
    lastBatch: [
        {
            name: "Nothing Here! Check back soon! :)",
            color: "white"
        }
    ],
    upcomingFlavors: [
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "sienna"
        },
        {
            name: "Salted Pretzel 🥨",
            color: "linen"
        }
    ]
};
