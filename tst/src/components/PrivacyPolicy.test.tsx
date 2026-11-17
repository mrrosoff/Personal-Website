import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "../../helpers/render";

import PrivacyPolicy from "../../../src/components/PrivacyPolicy";

describe("PrivacyPolicy", () => {
    it("should list every section", () => {
        renderWithApp(<PrivacyPolicy />);

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Privacy Policy");
        expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5);
    });
});
