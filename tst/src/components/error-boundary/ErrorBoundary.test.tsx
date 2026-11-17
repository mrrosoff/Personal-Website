import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../helpers/render";

import ErrorBoundary from "../../../../src/components/error-boundary/ErrorBoundary";

vi.mock("../../../../src/components/error-boundary/CrashScreen", () => ({
    default: () => <p>{"crashed"}</p>
}));

function Explodes(): never {
    throw new Error("boom");
}

describe("ErrorBoundary", () => {
    it("should render its children", () => {
        renderWithApp(
            <ErrorBoundary>
                <p>{"fine"}</p>
            </ErrorBoundary>
        );

        expect(screen.getByText("fine")).toBeInTheDocument();
    });

    it("should show the crash screen when a child throws", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);

        renderWithApp(
            <ErrorBoundary>
                <Explodes />
            </ErrorBoundary>
        );

        expect(screen.getByText("crashed")).toBeInTheDocument();
    });

    it("should show a custom fallback", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);

        renderWithApp(
            <ErrorBoundary fallback={<p>{"custom"}</p>}>
                <Explodes />
            </ErrorBoundary>
        );

        expect(screen.getByText("custom")).toBeInTheDocument();
    });
});
