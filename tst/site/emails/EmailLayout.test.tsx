import { describe, expect, it } from "vitest";

import { renderEmail } from "../../helpers/render";

import { EmailFooter, EmailLayout } from "../../../site/emails/EmailLayout";

describe("EmailLayout", () => {
    it("should wrap the content with its preview text", async () => {
        const result = await renderEmail(
            <EmailLayout preview={"A peek inside"}>
                <p>{"Hello"}</p>
            </EmailLayout>
        );

        expect(result).toContain("A peek inside");
        expect(result).toContain("<p>Hello</p>");
    });
});

describe("EmailFooter", () => {
    it("should show its tagline", async () => {
        const result = await renderEmail(<EmailFooter tagline={"Order Up!"} />);

        expect(result).toContain("Order Up!");
        expect(result).toContain("San Francisco, CA 94114");
    });

    it("should link its tagline", async () => {
        const result = await renderEmail(
            <EmailFooter tagline={"Unsubscribe"} href={"https://maxrosoff.com/x"} />
        );

        expect(result).toContain('href="https://maxrosoff.com/x"');
    });
});
