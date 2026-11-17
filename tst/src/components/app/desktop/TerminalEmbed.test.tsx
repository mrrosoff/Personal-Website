import { screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "../../../../helpers/render";

import TerminalEmbed from "../../../../../src/components/app/desktop/TerminalEmbed";

describe("TerminalEmbed", () => {
    it("should turn off spellcheck on forms and show the terminal", () => {
        document.body.appendChild(document.createElement("form"));

        renderWithApp(<TerminalEmbed ref={createRef()} scrollContainerRef={createRef()} />);

        expect(document.querySelector("form")).toHaveAttribute("spellcheck", "false");
        expect(screen.getByText(/Welcome To Rosoff OS/)).toBeInTheDocument();
    });
});
