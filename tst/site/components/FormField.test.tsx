import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../helpers/render";

import FormField, { emailProblem } from "../../../site/components/FormField";

describe("emailProblem", () => {
    it("should accept a valid email", () => {
        expect(emailProblem("a@b.com")).toBeNull();
    });

    it("should explain an invalid email", () => {
        expect(emailProblem("nope")).toBe("Enter a valid email.");
    });
});

describe("FormField", () => {
    it("should label the field", () => {
        renderWithApp(<FormField label={"Email"} value={""} />);

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("should wait until typing settles before showing a problem", () => {
        vi.useFakeTimers();
        renderWithApp(<FormField label={"Email"} value={"nope"} problem={emailProblem} />);

        act(() => void vi.advanceTimersByTime(600));

        expect(screen.getByText("Enter a valid email.")).toBeInTheDocument();
        vi.useRealTimers();
    });

    it("should show its own helper text", () => {
        renderWithApp(<FormField label={"Email"} helperText={"Required"} />);

        expect(screen.getByText("Required")).toBeInTheDocument();
    });
});
