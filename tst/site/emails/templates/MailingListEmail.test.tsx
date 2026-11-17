import { describe, expect, it } from "vitest";

import { renderEmail } from "../../../helpers/render";

import { mockFlavor } from "../../../fixtures/aws/dynamodb";

import MailingListEmail from "../../../../site/emails/templates/MailingListEmail";

describe("MailingListEmail", () => {
    it("should list each kind of flavor with links to buy", async () => {
        const result = await renderEmail(
            <MailingListEmail
                currentFlavors={[mockFlavor]}
                lastBatch={[{ ...mockFlavor, name: "Last Fig" }]}
                upcoming={[{ ...mockFlavor, name: "Soon Plum", priceId: "" }]}
                message={"A note from Max"}
            />
        );

        expect(result).toContain(`https://maxrosoff.com/ice-cream?flavor=${mockFlavor.priceId}`);
        expect(result).toContain("Last Fig");
        expect(result).toContain("Soon Plum");
        expect(result).toContain("A note from Max");
    });

    it("should leave out empty sections and the note", async () => {
        const result = await renderEmail(
            <MailingListEmail currentFlavors={[mockFlavor]} lastBatch={[]} upcoming={[]} />
        );

        expect(result).toContain(mockFlavor.name);
        expect(result).not.toContain("A note from Max");
    });
});
