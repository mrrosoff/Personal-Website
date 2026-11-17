import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "../../../../../helpers/render";

import SystemInfo from "../../../../../../site/components/app/desktop/BootUp/SystemInfo";

describe("SystemInfo", () => {
    it("should show only the rows reached so far", () => {
        renderWithApp(<SystemInfo step={4} />);

        expect(screen.getByText("Developer")).toBeInTheDocument();
        expect(screen.getByText("Rosoff Virtual Machine")).toBeInTheDocument();
        expect(screen.queryByText("Memory Test:")).not.toBeInTheDocument();
    });

    it("should start the memory test at its total", () => {
        renderWithApp(<SystemInfo step={5} />);

        expect(screen.getByText("2.0MB")).toBeInTheDocument();
    });

    it("should count the memory up", () => {
        renderWithApp(<SystemInfo step={8} />);

        expect(screen.getByText("173KB")).toBeInTheDocument();
    });

    it("should settle on the total once counted", () => {
        renderWithApp(<SystemInfo step={11} />);

        expect(screen.getByText("2.0MB")).toBeInTheDocument();
    });
});
