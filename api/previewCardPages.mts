export const PREVIEW_CARD_PAGES = [
    "/ice-cream",
    "/ice-cream/checkout",
    "/ice-cream/checkout/return",
    "/ice-cream/mailing-list",
    "/ice-cream/mailing-list/unsubscribe",
    "/ice-cream/cancel",
    "/register-friend"
] as const;

export type PreviewCardPage = (typeof PREVIEW_CARD_PAGES)[number];
