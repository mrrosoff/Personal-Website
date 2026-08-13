import { Box, IconButton, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export type Photo = {
    id: string;
    uploadedAt: number;
    previewUrl: string;
};

type PhotoGridProps = {
    photos: Photo[];
    onRemove: (id: string) => void;
};

export default function PhotoGrid({ photos, onRemove }: PhotoGridProps) {
    return (
        <>
            <Typography variant="h6" gutterBottom>
                On the frame ({photos.length})
            </Typography>
            {photos.length === 0 ? (
                <Typography color="text.secondary">Nothing yet. Add your first photo.</Typography>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: 3
                    }}
                >
                    {photos.map((photo) => (
                        <Box key={photo.id} sx={{ position: "relative" }}>
                            {/* The dithered framebuffer, so this is exactly what the panel shows. */}
                            <Box
                                component="img"
                                src={photo.previewUrl}
                                alt=""
                                sx={{
                                    width: "100%",
                                    display: "block",
                                    borderRadius: 1,
                                    boxShadow: 2,
                                    imageRendering: "pixelated"
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => onRemove(photo.id)}
                                sx={{
                                    position: "absolute",
                                    top: 6,
                                    right: 6,
                                    bgcolor: "background.paper",
                                    "&:hover": { bgcolor: "background.paper" }
                                }}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}
        </>
    );
}
