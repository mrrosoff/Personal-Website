import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../../helpers/render";

import Gallery from "../../../../../site/components/polaroid/Polaroid/Gallery";

describe("Gallery", () => {
    it("should show an error above the photos", () => {
        renderWithApp(<Gallery photos={[]} uploading={false} error={"Oops"} onRemove={vi.fn()} />);

        expect(screen.getByText("Oops")).toBeInTheDocument();
    });

    it("should show no error when there is none", () => {
        renderWithApp(<Gallery photos={[]} uploading={false} error={null} onRemove={vi.fn()} />);

        expect(screen.queryByText("Oops")).not.toBeInTheDocument();
    });
});
