import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../../helpers/render";

import UploadControls, {
    isSupportedImage
} from "../../../../../site/components/polaroid/Polaroid/UploadControls";

describe("UploadControls", () => {
    it("should hand over the chosen files", () => {
        const onFiles = vi.fn();
        renderWithApp(<UploadControls onFiles={onFiles} full={false} />);
        const file = new File(["x"], "a.jpg", { type: "image/jpeg" });

        fireEvent.change(screen.getByLabelText("Choose Photos"), { target: { files: [file] } });

        expect(onFiles).toHaveBeenCalledWith([file]);
    });

    it("should say when the frame is full", () => {
        renderWithApp(<UploadControls onFiles={vi.fn()} full />);

        expect(screen.getByText("Frame Full")).toBeInTheDocument();
    });
});

describe("isSupportedImage", () => {
    it("should accept photos by type or by extension", () => {
        expect(isSupportedImage(new File([""], "a.png", { type: "image/png" }))).toBe(true);
        expect(isSupportedImage(new File([""], "IMG_1.HEIC", { type: "" }))).toBe(true);
    });

    it("should turn away anything else", () => {
        expect(isSupportedImage(new File([""], "notes.txt", { type: "text/plain" }))).toBe(false);
    });
});
