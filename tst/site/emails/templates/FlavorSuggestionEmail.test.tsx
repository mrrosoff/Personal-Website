import { describe, expect, it } from "vitest";

import { renderEmail } from "../../../helpers/render";

import FlavorSuggestionEmail from "../../../../site/emails/templates/FlavorSuggestionEmail";

describe("FlavorSuggestionEmail", () => {
    it("should say who suggested which flavor", async () => {
        const result = await renderEmail(
            <FlavorSuggestionEmail friendName={"Ada"} flavor={"Fig"} />
        );

        expect(result).toContain("Ada");
        expect(result).toContain("Fig");
    });
});
