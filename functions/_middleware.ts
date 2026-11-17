type PagesContext = { request: Request; next: () => Promise<Response> };

declare global {
    class HTMLRewriter {
        on(selector: string, handlers: { element: (element: Element) => void }): HTMLRewriter;
        transform(response: Response): Response;
    }
}

function previewImage(page: URL): string {
    const image = new URL("https://api.maxrosoff.com/preview.png");
    image.search = page.search;
    image.searchParams.delete("page");
    if (page.pathname !== "/") {
        image.searchParams.set("page", page.pathname);
    }
    return image.toString();
}

export async function onRequest({ request, next }: PagesContext): Promise<Response> {
    const image = previewImage(new URL(request.url));
    return new HTMLRewriter()
        .on('meta[property="og:image"]', { element: (meta) => meta.setAttribute("content", image) })
        .transform(await next());
}
