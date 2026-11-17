import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockTerminalTheme, renderWithApp } from "../../../../../helpers/render";

import Stepper from "../../../../../../site/components/terminal/admin/common/Stepper";

describe("Stepper", () => {
    it("should step left and right", async () => {
        const onStep = vi.fn();
        const { user } = renderWithApp(
            <Stepper value={6} width={"2ch"} theme={mockTerminalTheme} onStep={onStep} />
        );

        await user.click(screen.getByText("<"));
        await user.click(screen.getByText(">"));

        expect(onStep.mock.calls).toEqual([["ArrowLeft"], ["ArrowRight"]]);
    });
});
