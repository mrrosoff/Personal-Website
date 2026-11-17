import { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Slider,
    Stack,
    Typography
} from "@mui/material";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 1800;
const PANEL_ASPECT = 400 / 600;

const HEIF_BRANDS = ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"];

type CropDialogProps = {
    file: File | null;
    remaining: number;
    onCancel: () => void;
    onConfirm: (cropped: Blob) => void;
};

type CropView = { file: File | null; crop: Point; zoom: number; area: Area | null };

type ImageState =
    { status: "loading" } | { status: "failed" } | { status: "ready"; source: Blob; src: string };

function freshView(file: File | null): CropView {
    return { file, crop: { x: 0, y: 0 }, zoom: 1, area: null };
}

export default function CropDialog({ file, remaining, onCancel, onConfirm }: CropDialogProps) {
    const [view, setView] = useState(() => freshView(file));
    const [image, setImage] = useState<ImageState>({ status: "loading" });

    if (file !== view.file) {
        setView(freshView(file));
        setImage({ status: "loading" });
    }

    useEffect(() => {
        if (!file) {
            return;
        }

        const controller = new AbortController();
        let url: string | null = null;

        void (async () => {
            try {
                const source = await toDisplayable(file);
                if (controller.signal.aborted) {
                    return;
                }
                url = URL.createObjectURL(source);
                setImage({ status: "ready", source, src: url });
            } catch {
                if (!controller.signal.aborted) {
                    setImage({ status: "failed" });
                }
            }
        })();

        return () => {
            controller.abort();
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [file]);

    const confirm = useCallback(
        async (source: Blob, area: Area) => {
            try {
                onConfirm(await renderCrop(source, area));
            } catch {
                setImage({ status: "failed" });
            }
        },
        [onConfirm]
    );

    const cropped =
        image.status === "ready" && view.area ? { source: image.source, area: view.area } : null;

    return (
        <Dialog
            open={file !== null}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderStyle: "solid",
                        borderWidth: 2,
                        borderColor: "grey.800"
                    }
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box
                    sx={{
                        position: "relative",
                        height: 460,
                        bgcolor: "black",
                        display: "grid",
                        placeItems: "center"
                    }}
                >
                    {image.status === "loading" && file && (
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress />
                            <Typography color="text.secondary">Opening…</Typography>
                        </Stack>
                    )}
                    {image.status === "failed" && (
                        <Typography color="text.secondary">Couldn't read that one.</Typography>
                    )}
                    {image.status === "ready" && (
                        <Cropper
                            image={image.src}
                            crop={view.crop}
                            zoom={view.zoom}
                            aspect={PANEL_ASPECT}
                            onCropChange={(crop) => setView((current) => ({ ...current, crop }))}
                            onZoomChange={(zoom) => setView((current) => ({ ...current, zoom }))}
                            onCropComplete={(_, area) =>
                                setView((current) => ({ ...current, area }))
                            }
                            showGrid={false}
                        />
                    )}
                </Box>
                <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                    <Typography color="text.secondary" variant="body2">
                        Drag to move, pinch or scroll to zoom. The panel shows exactly what you see
                        here.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions disableSpacing sx={{ px: 3, pb: 2, gap: 2 }}>
                {remaining > 0 && (
                    <Typography color="text.secondary" variant="body2" noWrap>
                        {remaining} more
                    </Typography>
                )}
                <Slider
                    value={view.zoom}
                    min={1}
                    max={4}
                    step={0.01}
                    disabled={image.status !== "ready"}
                    onChange={(_, zoom) => setView((current) => ({ ...current, zoom }))}
                    sx={{ flex: 1, minWidth: 100, mx: 1 }}
                />
                <Button variant="outlined" onClick={onCancel} sx={{ py: 0.25 }}>
                    Skip
                </Button>
                <Button
                    variant="contained"
                    onClick={cropped ? () => void confirm(cropped.source, cropped.area) : undefined}
                    disabled={!cropped}
                    sx={{ py: 0.25 }}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

async function isHeif(file: File): Promise<boolean> {
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (header.length < 12) {
        return false;
    }
    const ascii = (start: number, end: number) =>
        String.fromCharCode(...header.subarray(start, end));
    return ascii(4, 8) === "ftyp" && HEIF_BRANDS.includes(ascii(8, 12));
}

// Chrome and Firefox have no HEIC decoder. Imported lazily; ~1.5MB.
async function toDisplayable(file: File): Promise<Blob> {
    if (!(await isHeif(file))) {
        return file;
    }

    const { default: decodeHeic } = await import("heic-decode");
    const { width, height, data } = await decodeHeic({
        buffer: new Uint8Array(await file.arrayBuffer())
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Canvas unavailable");
    }
    context.putImageData(new ImageData(new Uint8ClampedArray(data), width, height), 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95)
    );
    if (!blob) {
        throw new Error("Could not convert that photo");
    }
    return blob;
}

// The cropper shows the photo upright, so the bitmap has to be upright too.
async function renderCrop(source: Blob, area: Area): Promise<Blob> {
    const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context = canvas.getContext("2d");
    if (!context) {
        bitmap.close();
        throw new Error("Canvas unavailable");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
        bitmap,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT
    );
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
    );
    if (!blob) {
        throw new Error("Could not read that photo");
    }
    return blob;
}
