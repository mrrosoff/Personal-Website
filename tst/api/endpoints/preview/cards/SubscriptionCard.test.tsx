import { describe, expect, it } from "vitest";

import { textOf } from "../../../../helpers/card";

import SubscriptionCard from "../../../../../api/endpoints/preview/cards/SubscriptionCard";

describe("SubscriptionCard", () => {
    it("should say what the link is for", () => {
        const result = textOf(<SubscriptionCard />);

        expect(result).toContain("Manage or cancel anytime");
    });
});
