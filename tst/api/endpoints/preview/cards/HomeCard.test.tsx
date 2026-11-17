import { describe, expect, it } from "vitest";

import { textOf } from "../../../../helpers/card";

import HomeCard from "../../../../../api/endpoints/preview/cards/HomeCard";

describe("HomeCard", () => {
    it("should boot the terminal", () => {
        const result = textOf(<HomeCard />);

        expect(result).toMatch(/Booting OS[ .]+SUCCESS/);
        expect(result).toMatch(/Terminal[ .]+ONLINE/);
        expect(result).toMatch(/Network[ .]+CONNECTED/);
    });
});
