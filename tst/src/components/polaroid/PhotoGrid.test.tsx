import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, renderWithApp } from "../../../helpers/render";

import PhotoGrid, { type Photo } from "../../../../src/components/polaroid/PhotoGrid";

const photos: Photo[] = [
    { id: "p1", uploadedAt: 2, previewUrl: "https://example.com/p1.png" },
    { id: "p2", uploadedAt: 1, previewUrl: "https://example.com/p2.png" }
];

function images(): HTMLImageElement[] {
    return Array.from(document.querySelectorAll("img"));
}

describe("PhotoGrid", () => {
    it("should fill the frame's empty slots", () => {
        renderWithApp(<PhotoGrid photos={photos} uploading={false} onRemove={vi.fn()} />);

        expect(images().map((image) => image.getAttribute("src"))).toEqual([
            "https://example.com/p1.png",
            "https://example.com/p2.png"
        ]);
    });

    it("should leave fewer empty slots as the frame fills", () => {
        const full = Array.from({ length: 50 }, (_, i) => ({
            ...photos[0],
            id: `p${i.toString()}`
        }));

        renderWithApp(<PhotoGrid photos={full} uploading={false} onRemove={vi.fn()} />);

        expect(images()).toHaveLength(50);
    });

    it("should show a spinner for the photo being uploaded", () => {
        renderWithApp(<PhotoGrid photos={[]} uploading onRemove={vi.fn()} />);

        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should fade a photo in once it loads", () => {
        renderWithApp(<PhotoGrid photos={photos} uploading={false} onRemove={vi.fn()} />);

        fireEvent.load(images()[0]);

        expect(images()[0]).toHaveStyle({ opacity: "1" });
    });

    it("should enlarge a photo and delete it from there", async () => {
        mockSmallScreen();
        const onRemove = vi.fn();
        const { user } = renderWithApp(
            <PhotoGrid photos={photos} uploading={false} onRemove={onRemove} />
        );

        await user.click(images()[1]);
        await user.click(screen.getByTestId("DeleteOutlineIcon"));

        expect(onRemove).toHaveBeenCalledWith("p2");
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("should close an enlarged photo", async () => {
        const { user } = renderWithApp(
            <PhotoGrid photos={photos} uploading={false} onRemove={vi.fn()} />
        );
        await user.click(images()[0]);

        await user.keyboard("{Escape}");

        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });
});
