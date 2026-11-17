import { Box, Typography } from "@mui/material";

import PhotoGrid from "../PhotoGrid";
import type { Photo } from "../PhotoGrid";

type GalleryProps = {
    photos: Photo[];
    uploading: boolean;
    error: string | null;
    onRemove: (id: string) => void;
};

export default function Gallery(props: GalleryProps) {
    return (
        <Box
            sx={{
                flex: "1 1 0",
                minHeight: 0,
                display: "flex",
                flexDirection: "column"
            }}
        >
            {props.error && (
                <Typography
                    color="error"
                    sx={{ textAlign: "center", mb: props.photos.length > 0 ? 3 : 0 }}
                >
                    {props.error}
                </Typography>
            )}
            <Box sx={{ flex: "1 1 0", minHeight: 0, position: "relative" }}>
                <PhotoGrid
                    photos={props.photos}
                    uploading={props.uploading}
                    onRemove={props.onRemove}
                />
            </Box>
        </Box>
    );
}
