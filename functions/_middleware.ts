import { COLORS } from "../site/theme";

type PagesContext = { request: Request; next: () => Promise<Response> };

declare global {
    class HTMLRewriter {
        on(selector: string, handlers: { element: (element: Element) => void }): HTMLRewriter;
        transform(response: Response): Response;
    }
}

const TERMINAL_CLIENTS = /^(curl|wget|httpie)\//i;
const LEADER_WIDTH = 26;

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = rgb(COLORS.green);

function rgb(hex: string): string {
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
    ["Ice Cream", "https://maxrosoff.com/ice-cream"]
]
    .map(([name, link]) => `  ${DIM}${name.padEnd(11)}${RESET}${link}`)
    .join("\n");

const TERMINAL_CARD = `
  ${BOLD}Max Rosoff${RESET}

${statuses}

${links}

  Open ${GREEN}https://maxrosoff.com${RESET} for the full terminal

`;

function greetTerminal({ request, next }: PagesContext): Response | Promise<Response> {
    const client = request.headers.get("user-agent") ?? "";
    return TERMINAL_CLIENTS.test(client)
        ? new Response(TERMINAL_CARD, { headers: { "content-type": "text/plain; charset=utf-8" } })
        : next();
}

function previewImage(page: URL): string {
    const image = new URL("https://api.maxrosoff.com/preview.png");
    image.search = page.search;
    image.searchParams.set("page", page.pathname);
    return image.toString();
}

async function addPreviewImage({ request, next }: PagesContext): Promise<Response> {
    const image = previewImage(new URL(request.url));
    return new HTMLRewriter()
        .on('meta[property="og:image"]', { element: (meta) => meta.setAttribute("content", image) })
        .transform(await next());
}

export function onRequest(context: PagesContext): Response | Promise<Response> {
    return new URL(context.request.url).pathname === "/"
        ? greetTerminal(context)
        : addPreviewImage(context);
}
