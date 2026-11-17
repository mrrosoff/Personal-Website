import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "../../../../../helpers/render";

import Header from "../../../../../../site/components/app/desktop/BootUp/Header";

describe("Header", () => {
    it("should show the release and link the source", () => {
        renderWithApp(<Header creationDate="Mon Jan 01 2026" smallScreen={false} />);

        expect(screen.getByText("Rosoff OS (BETA PROGRAM)")).toBeInTheDocument();
        expect(screen.getByText("Released: Mon Jan 01 2026")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Source (BETA 4.1.2)" })).toHaveAttribute(
            "href",
            "https://github.com/mrrosoff/Personal-Website"
        );
    });

    it("should split the title on a small screen", () => {
        renderWithApp(<Header creationDate="Mon Jan 01 2026" smallScreen />);

        expect(screen.getByText("Rosoff OS")).toBeInTheDocument();
        expect(screen.getByText("(BETA PROGRAM)")).toBeInTheDocument();
    });
});
