import { type ReactNode, useState } from "react";
import { Box, CircularProgress, Dialog, IconButton, Stack, useMediaQuery } from "@mui/material";
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
    uploading: boolean;
    onRemove: (id: string) => void;
};

const ROWS = 2;
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

export default function PhotoGrid({ photos, uploading, onRemove }: PhotoGridProps) {
    const [enlarged, setEnlarged] = useState<Photo | null>(null);
    // On a phone the overlay buttons give way to tapping the photo.
    const compact = useMediaQuery((theme) => theme.breakpoints.down("sm"));

    // Enough empty slots to read as room for more without scrolling through the
    // whole cap, and fewer as the frame fills up.
    const empty = Math.max(0, Math.min(EMPTY_SLOTS, MAX_PHOTOS - photos.length));
    // Leading, because the list is newest first and that is where the finished
    // photo lands. Trailing would put the spinner at the far end from it.
    const slots: (Photo | "pending" | null)[] = [
        ...(uploading ? (["pending"] as const) : []),
        ...photos,
        ...Array.from({ length: empty }, () => null)
    ];

    return (
        <>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
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
                            gap: 3
                        }}
                    >
                        {row.map((slot, index) =>
                            slot === null ? (
                                <EmptySlot key={index} />
                            ) : slot === "pending" ? (
                                <EmptySlot key={index}>
                                    <CircularProgress size={22} />
                                </EmptySlot>
                            ) : (
                                <PhotoCell
                                    key={slot.id}
                                    photo={slot}
                                    compact={compact}
                                    onEnlarge={() => setEnlarged(slot)}
                                    onRemove={() => onRemove(slot.id)}
                                />
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
                <Box sx={{ position: "relative", display: "flex" }}>
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
                    {compact && enlarged && (
                        <IconButton
                            size="small"
                            onClick={() => {
                                onRemove(enlarged.id);
                                setEnlarged(null);
                            }}
                            sx={{ ...overlayButton, position: "absolute", top: 8, right: 8 }}
                        >
                            <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                    )}
                </Box>
            </Dialog>
        </>
    );
}

function PhotoCell({
    photo,
    compact,
    onEnlarge,
    onRemove
}: {
    photo: Photo;
    compact: boolean;
    onEnlarge: () => void;
    onRemove: () => void;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        // The ratio is reserved up front. Sizing from the image's intrinsic
        // width instead would collapse the cell until it decodes, then pop.
        <Box
            onClick={compact ? onEnlarge : undefined}
            sx={{
                position: "relative",
                height: "100%",
                aspectRatio: "2 / 3",
                borderRadius: 1,
                bgcolor: "grey.900",
                cursor: compact ? "pointer" : "default"
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
            {!compact && (
                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <IconButton size="small" onClick={onEnlarge} sx={overlayButton}>
                        <OpenInFullIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                    <IconButton size="small" onClick={onRemove} sx={overlayButton}>
                        <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                </Stack>
            )}
        </Box>
    );
}

function EmptySlot({ children }: { children?: ReactNode }) {
    return (
        <Box
            sx={{
                height: "100%",
                aspectRatio: "2 / 3",
                borderRadius: 1,
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: "divider",
                opacity: 0.5,
                display: "grid",
                placeItems: "center"
            }}
        >
            {children}
        </Box>
    );
}
