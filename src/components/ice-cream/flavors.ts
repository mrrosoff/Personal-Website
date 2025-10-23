export type IceCreamFlavor = {
    name: string;
    color?: string;
    sparkle?: boolean;
};

export const ICE_CREAM_FLAVORS: Record<string, IceCreamFlavor[]> = {
    currentFlavors: [
        {
            name: "Pumpkin Spice Latte 🎃",
            color: "coral",
            sparkle: true
        },
        {
            name: "Mint Chocolate Chip 🍃",
            color: "mediumspringgreen"
        },
        {
            name: "Chili Chocolate Peanut Butter Cup 🌶️",
            color: "lightsalmon"
        }
    ],
    lastBatch: [
        {
            name: "Chocolate Gooey Brownie 🍫",
            color: "chocolate"
        },
        {
            name: "Salted Pretzel 🥨",
            color: "moccasin"
        },
        {
            name: "Strawberry 🍓",
            color: "lightpink"
        }
    ],
    upcomingFlavors: [
        {
            name: "Gingerbread Cookie Dough 🍪",
            color: "peru"
        },
        {
            name: "Chocolate Caramel Potato Chip Cupcake 🥔",
            color: "burlywood"
        },
        {
            name: "Champagne Sorbet 🥂",
            color: "beige",
            sparkle: true
        }
    ]
};
