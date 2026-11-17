import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "../../../helpers/render";

import { DesktopSocialButtonList } from "../../../../src/components/app/SocialButtons";

describe("DesktopSocialButtonList", () => {
    it("should label the résumé and email buttons", () => {
        renderWithApp(<DesktopSocialButtonList />);

        expect(screen.getByText("Résumé")).toBeInTheDocument();
        expect(screen.getByText("Email").closest("a")).toHaveAttribute(
            "href",
            "mailto:me@maxrosoff.com"
        );
    });

    it("should open social profiles in a new tab", () => {
        renderWithApp(<DesktopSocialButtonList />);

        expect(screen.getByLabelText("GitHub")).toHaveAttribute("target", "_blank");
        expect(screen.getByLabelText("Instagram")).toHaveAttribute("rel", "noopener");
    });
});
