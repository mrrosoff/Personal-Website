export type IceCreamFlavor = {
    name: string;
    color?: string;
    priceId?: string;
};

export const ICE_CREAM_FLAVORS: Record<string, IceCreamFlavor[]> = {
    currentFlavors: [
        {
            name: "Chili Chocolate Peanut Butter Cup 🌶️",
            color: "lightsalmon",
            priceId: "price_1SUGeTGZZEzkLsbi3r1AXTZr"
        },
        {
            name: "Gingerbread Cookie Dough 🎄",
            color: "peru",
            priceId: "price_1Sf9NgGZZEzkLsbiqEv2v75q"
        },
        {
            name: "Chocolate Chip Cookie Dough 🍪",
            color: "navajowhite",
            priceId: "price_1Sf9P2GZZEzkLsbilYjBh3Ii"
        }
    ],
    lastBatch: [
        {
            name: "Pumpkin Spice Latte 🎃",
            color: "coral",
            priceId: "price_1SUGdnGZZEzkLsbi5Wbv7U8t"
        },
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
    ],
    upcomingFlavors: [
        {
            name: "Champagne Sorbet 🥂",
            color: "beige"
        },
        {
            name: "Chocolate Potato Chip Cupcake 🥔",
            color: "burlywood"
        },
        {
            name: "Lemon Sorbet 🍋",
            color: "lightyellow"
        }
    ]
};
