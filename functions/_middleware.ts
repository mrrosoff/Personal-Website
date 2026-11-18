import { PREVIEW_CARD_PAGES } from "../api/previewCardPages.mts";
import type { DatabaseFlavor } from "../api/types";
import { COLORS } from "../site/theme";

type PagesContext = {
    request: Request;
    next: () => Promise<Response>;
    env: { API_ENDPOINT?: string };
};

declare global {
    class HTMLRewriter {
        on(selector: string, handlers: { element: (element: Element) => void }): HTMLRewriter;
        transform(response: Response): Response;
    }
}

const TERMINAL_CLIENTS = /^(curl|wget|httpie)\//i;
const API_ENDPOINT = "https://api.maxrosoff.com";
const SHOP = "https://maxrosoff.com/ice-cream";
const CARD_PAGES = new Set<string>(PREVIEW_CARD_PAGES);
const LEADER_WIDTH = 26;

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = rgb(COLORS.green);

function rgb(hex: string): string {
    if (!/^#[\da-f]{6}$/i.test(hex)) {
        return "";
    }
    const [red, green, blue] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
    return `\x1b[38;2;${String(red)};${String(green)};${String(blue)}m`;
}

function leader(label: string): string {
    const dots = Array.from({ length: LEADER_WIDTH - label.length - 1 }, (_, index) =>
        (label.length + 1 + index) % 2 === 0 ? " " : "."
    );
    return `${label} ${dots.join("")}`;
}

const statuses = [
    ["Booting OS", "SUCCESS"],
    ["Terminal", "ONLINE"],
    ["Network", "CONNECTED"]
]
    .map(([label, status]) => `  ${leader(label)} ${GREEN}${status}${RESET}`)
    .join("\n");

const links = [
    ["GitHub", "https://github.com/mrrosoff"],
    ["LinkedIn", "https://linkedin.com/in/max-rosoff"],
    ["Email", "me@maxrosoff.com"],
    ["Ice Cream", SHOP]
]
    .map(([name, link]) => `  ${DIM}${name.padEnd(11)}${RESET}${link}`)
    .join("\n");

const TERMINAL_CARD = `
  ${BOLD}Max Rosoff${RESET}

${statuses}

${links}

  Open ${GREEN}https://maxrosoff.com${RESET} for the full terminal

`;

async function loadFlavors(api: string): Promise<DatabaseFlavor[] | null> {
    try {
        const response = await fetch(`${api}/ice-cream/inventory`, {
            method: "POST",
            signal: AbortSignal.timeout(2000)
        });
        const { inventory } = (await response.json()) as { inventory: DatabaseFlavor[] };
        return inventory;
    } catch {
        return null;
    }
}

async function freezerCard(api: string): Promise<string> {
    const flavors = await loadFlavors(api);
    if (!flavors) {
        return `
  ${BOLD}Max's Freezer Stash${RESET}

  The freezer is offline right now. Try ${GREEN}${SHOP}${RESET}

`;
    }
    const inStock = flavors.filter(
        (flavor) =>
            (flavor.type === "currentFlavor" || flavor.type === "lastBatch") && flavor.count > 0
    );
    const upcoming = flavors.filter((flavor) => flavor.type === "upcoming");
    const stock = inStock.length
        ? inStock.map((flavor) => `  ${rgb(flavor.color)}${flavor.name}${RESET}`).join("\n")
        : "  Restocking soon";
    const comingUp = upcoming.length
        ? `\n\n  ${DIM}Coming up${RESET}  ${upcoming.map((flavor) => flavor.name).join(", ")}`
        : "";
    return `
  ${BOLD}Max's Freezer Stash${RESET}
  ${DIM}Small batch, $6 a pint${RESET}

${stock}${comingUp}

  Order at ${GREEN}${SHOP}${RESET}

`;
}

function text(body: string): Response {
    return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

async function answerTerminal(page: URL, { env }: PagesContext): Promise<Response> {
    switch (page.pathname) {
        case "/ice-cream":
            return text(await freezerCard(env.API_ENDPOINT ?? API_ENDPOINT));
        default:
            return text(TERMINAL_CARD);
    }
}

function previewImage(page: URL): string {
    const image = new URL("https://api.maxrosoff.com/preview.png");
    image.search = page.search;
    image.searchParams.set("page", page.pathname);
    return image.toString();
}

async function addPreviewImage(page: URL, { next }: PagesContext): Promise<Response> {
    const image = previewImage(page);
    return new HTMLRewriter()
        .on('meta[property="og:image"]', { element: (meta) => meta.setAttribute("content", image) })
        .transform(await next());
}

export function onRequest(context: PagesContext): Promise<Response> {
    const page = new URL(context.request.url);
    if (TERMINAL_CLIENTS.test(context.request.headers.get("user-agent") ?? "")) {
        return answerTerminal(page, context);
    }
    return CARD_PAGES.has(page.pathname) ? addPreviewImage(page, context) : context.next();
}
