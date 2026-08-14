import { useState } from "react";
import { Box, Dialog, IconButton, Skeleton, Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

export type Photo = {
    id: string;
    uploadedAt: number;
    previewUrl: string;
};

type PhotoGridProps = {
    photos: Photo[];
    loading: boolean;
    onRemove: (id: string) => void;
};

const ROWS = 3;
const GAP = 24;
const SKELETONS = 9;

export default function PhotoGrid({ photos, loading, onRemove }: PhotoGridProps) {
    const [enlarged, setEnlarged] = useState<Photo | null>(null);

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 0,
                    display: "grid",
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    gridAutoFlow: "column",
                    gridAutoColumns: "auto",
                    gap: `${GAP}px`,
                    overflowX: "auto",
                    overflowY: "hidden"
                }}
            >
                {loading &&
                    Array.from({ length: SKELETONS }, (_, index) => (
                        <Skeleton
                            key={index}
                            variant="rounded"
                            sx={{ height: "100%", aspectRatio: "2 / 3", borderRadius: 1 }}
                        />
                    ))}
                {!loading &&
                    photos.map((photo) => (
                        <Box
                            key={photo.id}
                            sx={{ position: "relative", height: "100%", aspectRatio: "2 / 3" }}
                        >
                            {/* The dithered framebuffer, so this is exactly what the panel shows. */}
                            <Box
                                component="img"
                                src={photo.previewUrl}
                                alt=""
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "block",
                                    objectFit: "contain",
                                    borderRadius: 1
                                }}
                            />
                            <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ position: "absolute", top: 6, right: 6 }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => setEnlarged(photo)}
                                    sx={{
                                        bgcolor: "background.paper",
                                        "&:hover": { bgcolor: "background.paper" }
                                    }}
                                >
                                    <OpenInFullIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => onRemove(photo.id)}
                                    sx={{
                                        bgcolor: "background.paper",
                                        "&:hover": { bgcolor: "background.paper" }
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Box>
                    ))}
            </Box>

            <Dialog open={enlarged !== null} onClose={() => setEnlarged(null)} maxWidth={false}>
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
