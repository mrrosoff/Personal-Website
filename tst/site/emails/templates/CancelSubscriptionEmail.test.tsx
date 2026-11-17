import { describe, expect, it } from "vitest";

import { renderEmail } from "../../../helpers/render";

import CancelSubscriptionEmail from "../../../../site/emails/templates/CancelSubscriptionEmail";

describe("CancelSubscriptionEmail", () => {
    it("should link to the cancel page and say how long it lasts", async () => {
        const result = await renderEmail(
            <CancelSubscriptionEmail
                cancelUrl={"https://maxrosoff.com/ice-cream/cancel?token=t"}
                minutesValid={30}
            />
        );

        expect(result).toContain("https://maxrosoff.com/ice-cream/cancel?token=t");
        expect(result).toContain("30 minutes");
    });
});
