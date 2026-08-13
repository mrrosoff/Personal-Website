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
import Cropper, { type Area } from "react-easy-crop";

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

export default function CropDialog({ file, remaining, onCancel, onConfirm }: CropDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState<Area | null>(null);
    const [source, setSource] = useState<Blob | null>(null);
    const [src, setSrc] = useState<string | null>(null);
    const [preparing, setPreparing] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setArea(null);
        setFailed(false);

        if (!file) {
            setSource(null);
            setSrc(null);
            return;
        }

        let cancelled = false;
        let url: string | null = null;

        void (async () => {
            setPreparing(true);
            try {
                const displayable = await toDisplayable(file);
                if (cancelled) {
                    return;
                }
                url = URL.createObjectURL(displayable);
                setSource(displayable);
                setSrc(url);
            } catch {
                if (!cancelled) {
                    setFailed(true);
                }
            } finally {
                if (!cancelled) {
                    setPreparing(false);
                }
            }
        })();

        return () => {
            cancelled = true;
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [file]);

    const confirm = useCallback(async () => {
        if (!source || !area) {
            return;
        }
        onConfirm(await renderCrop(source, area));
    }, [area, onConfirm, source]);

    return (
        <Dialog open={file !== null} maxWidth="sm" fullWidth>
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
                    {preparing && (
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress />
                            <Typography color="text.secondary">Opening…</Typography>
                        </Stack>
                    )}
                    {failed && (
                        <Typography color="text.secondary">Couldn't read that one.</Typography>
                    )}
                    {src && !preparing && (
                        <Cropper
                            image={src}
                            crop={crop}
                            zoom={zoom}
                            aspect={PANEL_ASPECT}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, pixels) => setArea(pixels)}
                            showGrid={false}
                        />
                    )}
                </Box>
                <Box sx={{ px: 3, pt: 2 }}>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                        Drag to move, pinch or scroll to zoom. The panel shows exactly what you see
                        here.
                    </Typography>
                    <Slider
                        value={zoom}
                        min={1}
                        max={4}
                        step={0.01}
                        disabled={!src}
                        onChange={(_, value) => setZoom(value as number)}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                {remaining > 0 && (
                    <Typography color="text.secondary" variant="body2" sx={{ mr: "auto" }}>
                        {remaining} more after this
                    </Typography>
                )}
                <Button onClick={onCancel}>Skip</Button>
                <Button variant="contained" onClick={() => void confirm()} disabled={!area}>
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
