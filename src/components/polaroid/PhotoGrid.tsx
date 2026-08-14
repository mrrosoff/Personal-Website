import { useState } from "react";
import { Box, Dialog, IconButton, Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

import { MAX_PHOTOS } from "../../../api/common";

export type Photo = {
    id: string;
    uploadedAt: number;
    previewUrl: string;
};

type PhotoGridProps = {
    photos: Photo[];
    onRemove: (id: string) => void;
};

const ROWS = 2;
const GAP = 24;
const EMPTY_SLOTS = 18;

const overlayButton = {
    width: 24,
    height: 24,
    bgcolor: "grey.900",
    borderStyle: "solid",
    borderWidth: "1.5px",
    borderColor: "common.white",
    "&:hover": { bgcolor: "grey.800" }
};

// Down the first column before starting the second, so index 1 sits under 0.
const intoRows = <T,>(items: T[]) =>
    Array.from({ length: ROWS }, (_, row) => items.filter((_, index) => index % ROWS === row));

export default function PhotoGrid({ photos, onRemove }: PhotoGridProps) {
    const [enlarged, setEnlarged] = useState<Photo | null>(null);

    // Enough empty slots to read as room for more without scrolling through the
    // whole cap, and fewer as the frame fills up.
    const empty = Math.max(0, Math.min(EMPTY_SLOTS, MAX_PHOTOS - photos.length));
    const slots: (Photo | null)[] = [...photos, ...Array.from({ length: empty }, () => null)];

    return (
        <>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: `${GAP}px`,
                    overflowX: "auto",
                    overflowY: "hidden"
                }}
            >
                {intoRows(slots).map((row, rowIndex) => (
                    <Box
                        key={rowIndex}
                        sx={{
                            flex: "1 1 0",
                            minHeight: 0,
                            width: "max-content",
                            display: "flex",
                            gap: `${GAP}px`
                        }}
                    >
                        {row.map((photo, index) =>
                            photo ? (
                                <PhotoCell
                                    key={photo.id}
                                    photo={photo}
                                    onEnlarge={() => setEnlarged(photo)}
                                    onRemove={() => onRemove(photo.id)}
                                />
                            ) : (
                                <EmptySlot key={index} />
                            )
                        )}
                    </Box>
                ))}
            </Box>

            <Dialog
                open={enlarged !== null}
                onClose={() => setEnlarged(null)}
                maxWidth={false}
                slotProps={{
                    paper: {
                        sx: { borderStyle: "solid", borderWidth: 2, borderColor: "grey.800" }
                    }
                }}
            >
                <Box
                    component="img"
                    src={enlarged?.previewUrl}
                    alt=""
                    sx={{
                        display: "block",
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                        imageRendering: "pixelated"
                    }}
                />
            </Dialog>
        </>
    );
}

function PhotoCell({
    photo,
    onEnlarge,
    onRemove
}: {
    photo: Photo;
    onEnlarge: () => void;
    onRemove: () => void;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        // The ratio is reserved up front. Sizing from the image's intrinsic
        // width instead would collapse the cell until it decodes, then pop.
        <Box
            sx={{
                position: "relative",
                height: "100%",
                aspectRatio: "2 / 3",
                borderRadius: 1,
                bgcolor: "grey.900"
            }}
        >
            {/* The dithered framebuffer, so this is exactly what the panel shows. */}
            <Box
                component="img"
                src={photo.previewUrl}
                alt=""
                onLoad={() => setLoaded(true)}
                sx={{
                    height: "100%",
                    width: "100%",
                    display: "block",
                    borderRadius: 1,
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 200ms ease"
                }}
            />
            <Stack direction="row" spacing={0.75} sx={{ position: "absolute", top: 8, right: 8 }}>
                <IconButton size="small" onClick={onEnlarge} sx={overlayButton}>
                    <OpenInFullIcon sx={{ fontSize: 12 }} />
                </IconButton>
                <IconButton size="small" onClick={onRemove} sx={overlayButton}>
                    <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                </IconButton>
            </Stack>
        </Box>
    );
}

function EmptySlot() {
    return (
        <Box
            sx={{
                height: "100%",
                aspectRatio: "2 / 3",
                borderRadius: 1,
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: "divider",
                opacity: 0.5
            }}
        />
    );
}
