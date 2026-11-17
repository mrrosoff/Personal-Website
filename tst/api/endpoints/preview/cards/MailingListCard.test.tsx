import { describe, expect, it } from "vitest";

import { textOf } from "../../../../helpers/card";
import { mockFlavor } from "../../../../mocks/aws/dynamodb";

import MailingListCard from "../../../../../api/endpoints/preview/cards/MailingListCard";

describe("MailingListCard", () => {
    it("should tease the flavors coming up", () => {
        const upcoming = { ...mockFlavor, name: "Pumpkin Pie", type: "upcoming" as const };

        const result = textOf(<MailingListCard flavors={[mockFlavor, upcoming]} />);

        expect(result).toContain("Hear first when these drop");
        expect(result).toContain("Pumpkin Pie");
        expect(result).not.toContain(mockFlavor.name);
    });

    it("should leave the teaser out with nothing coming up", () => {
        const result = textOf(<MailingListCard flavors={[mockFlavor]} />);

        expect(result).toBe("Mailing ListNew flavors, firstmaxrosoff.com");
    });
});
