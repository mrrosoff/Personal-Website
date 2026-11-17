import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../helpers/render";

import CropDialog from "../../../../src/components/polaroid/CropDialog";

const decodeHeic = vi.hoisted(() => vi.fn());

vi.mock("heic-decode", () => ({ default: decodeHeic }));
vi.mock("react-easy-crop", () => ({
    default: (props: {
        image: string;
        onCropComplete: (area: object, pixels: object) => void;
        onCropChange: (crop: object) => void;
        onZoomChange: (zoom: number) => void;
    }) => (
        <>
            <img alt="crop" src={props.image} />
            <button onClick={() => props.onCropComplete({}, { x: 1, y: 2, width: 40, height: 60 })}>
                {"crop done"}
            </button>
            <button onClick={() => props.onCropChange({ x: 5, y: 5 })}>{"move"}</button>
            <button onClick={() => props.onZoomChange(2)}>{"zoom"}</button>
        </>
    )
}));

Blob.prototype.arrayBuffer ??= function (this: Blob) {
    return new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(this);
    });
};

const context = {
    drawImage: vi.fn(),
    putImageData: vi.fn(),
    imageSmoothingEnabled: false,
    imageSmoothingQuality: "low"
};

function canvas(options: { context?: boolean; blob?: boolean } = {}) {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
        (options.context === false ? null : context) as never
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((resolve) =>
        resolve(options.blob === false ? null : new Blob(["jpeg"], { type: "image/jpeg" }))
    );
}

const bitmap = { close: vi.fn() };

function jpeg(name = "photo.jpg") {
    return new File([new Uint8Array(16)], name, { type: "image/jpeg" });
}

function heic() {
    const header = new TextEncoder().encode("\0\0\0\x18ftypheic");
    return new File([header], "photo.heic", { type: "" });
}

function renderDialog(file: File | null, remaining = 0) {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const result = renderWithApp(
        <CropDialog file={file} remaining={remaining} onCancel={onCancel} onConfirm={onConfirm} />
    );
    return { ...result, onCancel, onConfirm };
}

beforeEach(() => {
    vi.stubGlobal(
        "createImageBitmap",
        vi.fn(async () => bitmap)
    );
    vi.stubGlobal(
        "ImageData",
        class {
            constructor(
                public data: Uint8ClampedArray,
                public width: number,
                public height: number
            ) {}
        }
    );
    URL.createObjectURL = vi.fn(() => "blob:photo");
    URL.revokeObjectURL = vi.fn();
    canvas();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("CropDialog", () => {
    it("should stay closed without a file", () => {
        renderDialog(null);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should open a photo for cropping", async () => {
        renderDialog(jpeg(), 2);

        expect(screen.getByText("Opening…")).toBeInTheDocument();
        expect(await screen.findByAltText("crop")).toHaveAttribute("src", "blob:photo");
        expect(screen.getByText("2 more")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    });

    it("should crop to the panel's size and hand it back", async () => {
        const { user, onConfirm } = renderDialog(jpeg());
        await user.click(await screen.findByText("crop done"));

        await user.click(screen.getByRole("button", { name: "Add" }));

        await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(expect.any(Blob)));
        expect(context.drawImage).toHaveBeenCalledWith(bitmap, 1, 2, 40, 60, 0, 0, 1200, 1800);
        expect(bitmap.close).toHaveBeenCalled();
    });

    it("should zoom with the slider and the cropper", async () => {
        const { user } = renderDialog(jpeg());
        await screen.findByAltText("crop");

        await user.click(screen.getByText("move"));
        await user.click(screen.getByText("zoom"));
        act(() => screen.getByRole("slider").focus());
        await user.keyboard("{ArrowRight}");

        expect(screen.getByRole("slider")).toHaveValue("2.01");
    });

    it("should skip a photo", async () => {
        const { user, onCancel } = renderDialog(jpeg());

        await user.click(screen.getByRole("button", { name: "Skip" }));

        expect(onCancel).toHaveBeenCalled();
    });

    it("should convert a HEIC photo first", async () => {
        decodeHeic.mockResolvedValue({ width: 2, height: 3, data: new Uint8Array(24) });

        renderDialog(heic());

        expect(await screen.findByAltText("crop")).toBeInTheDocument();
        expect(context.putImageData).toHaveBeenCalled();
    });

    it("should treat a tiny file as not HEIC", async () => {
        renderDialog(new File([new Uint8Array(4)], "tiny.jpg", { type: "image/jpeg" }));

        expect(await screen.findByAltText("crop")).toBeInTheDocument();
    });

    it("should treat other formats as not HEIC", async () => {
        const avif = new File([new TextEncoder().encode("\0\0\0\x18ftypavif")], "photo.avif");

        renderDialog(avif);

        expect(await screen.findByAltText("crop")).toBeInTheDocument();
        expect(decodeHeic).not.toHaveBeenCalled();
    });

    it("should say when a photo cannot be read", async () => {
        decodeHeic.mockRejectedValue(new Error("corrupt"));

        renderDialog(heic());

        expect(await screen.findByText("Couldn't read that one.")).toBeInTheDocument();
    });

    it("should fail without a canvas to convert with", async () => {
        canvas({ context: false });
        decodeHeic.mockResolvedValue({ width: 2, height: 3, data: new Uint8Array(24) });

        renderDialog(heic());

        expect(await screen.findByText("Couldn't read that one.")).toBeInTheDocument();
    });

    it("should fail when the converted photo comes back empty", async () => {
        canvas({ blob: false });
        decodeHeic.mockResolvedValue({ width: 2, height: 3, data: new Uint8Array(24) });

        renderDialog(heic());

        expect(await screen.findByText("Couldn't read that one.")).toBeInTheDocument();
    });

    it("should not crop without a canvas", async () => {
        const { user, onConfirm } = renderDialog(jpeg());
        await user.click(await screen.findByText("crop done"));
        canvas({ context: false });

        await user.click(screen.getByRole("button", { name: "Add" }));

        expect(await screen.findByText("Couldn't read that one.")).toBeInTheDocument();
        expect(bitmap.close).toHaveBeenCalled();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("should not crop when the canvas comes back empty", async () => {
        const { user, onConfirm } = renderDialog(jpeg());
        await user.click(await screen.findByText("crop done"));
        canvas({ blob: false });

        await user.click(screen.getByRole("button", { name: "Add" }));

        expect(await screen.findByText("Couldn't read that one.")).toBeInTheDocument();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("should forget a photo it moved on from", async () => {
        const { rerender } = renderDialog(jpeg());
        await screen.findByAltText("crop");

        rerender(<CropDialog file={null} remaining={0} onCancel={vi.fn()} onConfirm={vi.fn()} />);

        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo");
    });

    it("should drop a photo that was swapped out mid-open", async () => {
        let finish: (value: object) => void = () => undefined;
        decodeHeic.mockReturnValue(new Promise((resolve) => (finish = resolve)));
        const { rerender } = renderDialog(heic());
        await waitFor(() => expect(decodeHeic).toHaveBeenCalled());

        rerender(<CropDialog file={null} remaining={0} onCancel={vi.fn()} onConfirm={vi.fn()} />);
        await act(async () => finish({ width: 2, height: 3, data: new Uint8Array(24) }));

        expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it("should drop a failure for a photo that was swapped out", async () => {
        let fail: (error: Error) => void = () => undefined;
        decodeHeic.mockReturnValue(new Promise((_, reject) => (fail = reject)));
        const { rerender } = renderDialog(heic());
        await waitFor(() => expect(decodeHeic).toHaveBeenCalled());

        rerender(<CropDialog file={null} remaining={0} onCancel={vi.fn()} onConfirm={vi.fn()} />);
        await act(async () => fail(new Error("corrupt")));

        expect(screen.queryByText("Couldn't read that one.")).not.toBeInTheDocument();
    });
});
