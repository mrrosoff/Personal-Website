import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "../../../../../helpers/render";

import BootLine from "../../../../../../site/components/app/desktop/BootUp/BootLine";
import { TERMINAL_COLORS } from "../../../../../../site/components/terminal/Terminal";

describe("BootLine", () => {
    it("should trail its label with dots while waiting", () => {
        renderWithApp(<BootLine label="Detecting Drive" dots={3} />);

        expect(screen.getByText("Detecting Drive . . .")).toBeInTheDocument();
    });

    it("should show a good result in green", () => {
        renderWithApp(
            <BootLine label="Detecting Drive" dots={3} status={{ text: "SUCCESS", ok: true }} />
        );

        expect(screen.getByText("SUCCESS")).toHaveStyle({
            color: TERMINAL_COLORS.promptSymbolColor
        });
    });

    it("should show a bad result in red", () => {
        renderWithApp(
            <BootLine label="Detecting Network" dots={3} status={{ text: "OFFLINE", ok: false }} />
        );

        expect(screen.getByText("OFFLINE")).toHaveStyle({ color: TERMINAL_COLORS.errorColor });
    });
});
