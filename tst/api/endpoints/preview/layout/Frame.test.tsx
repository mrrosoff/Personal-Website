import { describe, expect, it } from "vitest";

import { textOf } from "../../../../helpers/card";

import Frame, { Chips } from "../../../../../api/endpoints/preview/layout/Frame";

describe("Frame", () => {
    it("should put the site under every card", () => {
        const result = textOf(<Frame>Hello</Frame>);

        expect(result).toBe("Hellomaxrosoff.com");
    });

    it("should show Max on every card", () => {
        const result = JSON.stringify(Frame({ children: "Hello" }));

        expect(result).toContain("data:image/jpeg;base64,");
    });
});

describe("Chips", () => {
    it("should color each flavor, falling back to the text color", () => {
        const result = JSON.stringify(
            Chips({
                flavors: [
                    { productId: "a", name: "Mint", color: "#3FDAD8" },
                    { productId: "b", name: "Plain", color: "" }
                ]
            })
        );

        expect(result).toContain('"color":"#3fdad8"');
        expect(result).toContain('"color":"#FCFCFC"');
    });
});
