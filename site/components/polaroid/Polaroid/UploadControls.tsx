import { Button } from "@mui/material";

// What the browser can decode for the crop step. HEIC often arrives with an
// empty type, so the extension is the only reliable signal for it.
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
const ACCEPT_ATTRIBUTE = [...ACCEPTED_TYPES, ".heic", ".heif"].join(",");

export const isSupportedImage = (file: File) =>
    ACCEPTED_TYPES.includes(file.type.toLowerCase()) ||
    ACCEPTED_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension));

type UploadControlsProps = { onFiles: (files: File[]) => void; full: boolean };

export default function UploadControls(props: UploadControlsProps) {
    return (
        <Button
            variant="contained"
            component="label"
            size="large"
            disabled={props.full}
            sx={{
                // Straddles the border so the photos below start at the box's top.
                position: "absolute",
                top: 0,
                right: 24,
                transform: "translateY(-50%)",
                zIndex: 1,
                fontSize: "1rem",
                px: "19px",
                py: "7px"
            }}
        >
            {props.full ? "Frame Full" : "Choose Photos"}
            <input
                disabled={props.full}
                hidden
                multiple
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                onChange={(event) => {
                    props.onFiles(Array.from(event.target.files ?? []));
                    // Without this, picking the same files again fires no change
                    // event and the picker looks broken.
                    event.target.value = "";
                }}
            />
        </Button>
    );
}
