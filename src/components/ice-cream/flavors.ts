export type IceCreamFlavor = {
    name: string;
    color?: string;
    priceId?: string;
};

export const ICE_CREAM_FLAVORS: Record<string, IceCreamFlavor[]> = {
    currentFlavors: [
        {
            name: "Pumpkin Spice Latte 🎃",
            color: "coral",
            priceId: "price_1SUGdnGZZEzkLsbi5Wbv7U8t"
        },
        {
            name: "Mint Chocolate Chip 🍃",
            color: "mediumspringgreen",
            priceId: "price_1SUGeKGZZEzkLsbie8XG9ORR"
        },
        {
            name: "Chili Chocolate Peanut Butter Cup 🌶️",
            color: "lightsalmon",
            priceId: "price_1SUGeTGZZEzkLsbi3r1AXTZr"
        }
    ],
    lastBatch: [
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "chocolate",
            priceId: "price_1STmV8GZZEzkLsbiuQIZaVwK"
        },
        {
            name: "Salted Pretzel 🥨",
            color: "moccasin",
            priceId: "price_1SUGejGZZEzkLsbiLGFK1HIo"
        },
        {
            name: "Strawberry 🍓",
            color: "lightpink",
            priceId: "price_1SUGdUGZZEzkLsbiQjZzrNJD"
        }
    ],
    upcomingFlavors: [
        {
            name: "Gingerbread Cookie Dough 🍪",
            color: "peru"
        },
        {
            name: "Chocolate Potato Chip Cupcake 🥔",
            color: "burlywood"
        },
        {
            name: "Champagne Sorbet 🥂",
            color: "beige"
        }
    ]
};
