import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../site/components/App", () => ({ default: () => <p>{"the app"}</p> }));

describe("index", () => {
    it("should mount the app into the root element", async () => {
        document.body.innerHTML = '<div id="root"></div>';

        await import("../../site/index");

        expect(await screen.findByText("the app")).toBeInTheDocument();
    });

    it("should refuse to start without a root element", async () => {
        vi.resetModules();
        document.body.innerHTML = "";

        const result = import("../../site/index");

        await expect(result).rejects.toThrow("Missing Root Element");
    });
});
