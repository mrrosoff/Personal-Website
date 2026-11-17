import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/components/App", () => ({ default: () => <p>{"the app"}</p> }));

describe("index", () => {
    it("should mount the app into the root element", async () => {
        document.body.innerHTML = '<div id="root"></div>';

        await import("../../src/index");

        expect(await screen.findByText("the app")).toBeInTheDocument();
    });
});
