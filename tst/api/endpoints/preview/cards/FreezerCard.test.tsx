import { describe, expect, it } from "vitest";

import { textOf } from "../../../../helpers/card";
import { mockFlavor } from "../../../../mocks/aws/dynamodb";

import FreezerCard from "../../../../../api/endpoints/preview/cards/FreezerCard";

describe("FreezerCard", () => {
    it("should list the flavors in the freezer", () => {
        const result = textOf(<FreezerCard flavors={[mockFlavor]} />);

        expect(result).toContain(mockFlavor.name);
        expect(result).not.toContain("Restocking soon");
    });

    it("should say it is restocking when nothing is for sale", () => {
        const result = textOf(
            <FreezerCard
                flavors={[
                    { ...mockFlavor, count: 0 },
                    { ...mockFlavor, productId: "prod_upcoming", type: "upcoming" }
                ]}
            />
        );

        expect(result).toContain("Restocking soon");
        expect(result).not.toContain(mockFlavor.name);
    });
});
