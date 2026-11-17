import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../../helpers/render";

import DropArea from "../../../../../site/components/polaroid/Polaroid/DropArea";

function renderDropArea(full = false) {
    const setDragging = vi.fn();
    const onFiles = vi.fn();
    renderWithApp(
        <DropArea dragging={false} setDragging={setDragging} onFiles={onFiles} full={full}>
            <p>{"photos"}</p>
        </DropArea>
    );
    return { area: screen.getByRole("region", { name: "Drop photos here" }), setDragging, onFiles };
}

describe("DropArea", () => {
    it("should light up while a file is dragged over", () => {
        const { area, setDragging } = renderDropArea();

        fireEvent.dragOver(area);

        expect(setDragging).toHaveBeenCalledWith(true);
    });

    it("should take dropped files", () => {
        const { area, onFiles } = renderDropArea();
        const file = new File(["x"], "a.jpg", { type: "image/jpeg" });

        fireEvent.drop(area, { dataTransfer: { files: [file] } });

        expect(onFiles).toHaveBeenCalledWith([file]);
    });

    it("should ignore drags and drops once the frame is full", () => {
        const { area, setDragging, onFiles } = renderDropArea(true);

        fireEvent.dragOver(area);
        fireEvent.drop(area, { dataTransfer: { files: [] } });

        expect(setDragging).toHaveBeenCalledWith(false);
        expect(setDragging).not.toHaveBeenCalledWith(true);
        expect(onFiles).not.toHaveBeenCalled();
    });
});
