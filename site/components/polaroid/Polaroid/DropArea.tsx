import type { ReactNode } from "react";
import { Box, useMediaQuery } from "@mui/material";

type DropAreaProps = {
    dragging: boolean;
    setDragging: (dragging: boolean) => void;
    onFiles: (files: File[]) => void;
    full: boolean;
    children: ReactNode;
};

export default function DropArea(props: DropAreaProps) {
    const compact = useMediaQuery((theme) => theme.breakpoints.down("lg"));
    return (
        <Box
            role="region"
            aria-label="Drop photos here"
            onDragOver={(event) => {
                event.preventDefault();
                if (!props.full) {
                    props.setDragging(true);
                }
            }}
            onDragLeave={(event) => {
                // Fires when crossing into a child too, so ignore those.
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    props.setDragging(false);
                }
            }}
            onDrop={(event) => {
                event.preventDefault();
                props.setDragging(false);
                if (!props.full) {
                    props.onFiles(Array.from(event.dataTransfer.files));
                }
            }}
            sx={{
                mt: compact ? 4 : 2,
                p: compact ? 2 : 3,
                pt: 5,
                flex: "1 1 0",
                minHeight: 0,
                position: "relative",
                borderRadius: 2,
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: props.dragging ? "primary.main" : "divider",
                bgcolor: props.dragging ? "action.hover" : "transparent",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {props.children}
        </Box>
    );
}
