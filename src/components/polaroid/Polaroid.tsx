import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import axios from "axios";

import { UserType } from "../../../api/types";
import { API_URL } from "../App";
import { decodeToken } from "../../auth";
import { useAppContext } from "../AppContext";
import CropDialog from "./CropDialog";
import PhotoGrid, { type Photo } from "./PhotoGrid";

const API = `${API_URL}/polaroid`;

// What the browser can decode for the crop step. HEIC often arrives with an
// empty type, so the extension is the only reliable signal for it.
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
const ACCEPT_ATTRIBUTE = [...ACCEPTED_TYPES, ".heic", ".heif"].join(",");

const isSupportedImage = (file: File) =>
    ACCEPTED_TYPES.includes(file.type.toLowerCase()) ||
    ACCEPTED_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension));

export default function Polaroid() {
    const { emulatorState } = useAppContext();
    const token = emulatorState.getEnvVariables()["AUTH_TOKEN"];

    const authorized = useMemo(() => {
        if (import.meta.env.DEV) {
            return true;
        }
        const payload = token ? decodeToken(token) : null;
        if (!payload) {
            return false;
        }
        return payload.userType === UserType.ADMIN || payload.userType === UserType.POLAROID_OWNER;
    }, [token]);

    const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [queue, setQueue] = useState<File[]>([]);
    const [dragging, setDragging] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const response = await axios.get<{ photos: Photo[] }>(`${API}/photos`, {
                headers: authHeader
            });
            setPhotos(response.data.photos);
        } catch {
            setError("Couldn't load your photos.");
        }
    }, [authHeader]);

    useEffect(() => {
        if (authorized) {
            void refresh();
        }
    }, [authorized, refresh]);

    const upload = useCallback(
        async (cropped: Blob) => {
            setQueue((current) => current.slice(1));
            setBusy(true);
            setError(null);
            try {
                await axios.post(`${API}/upload`, cropped, {
                    headers: { ...authHeader, "Content-Type": "image/jpeg" }
                });
                await refresh();
            } catch {
                setError("That photo didn't go through. Try another?");
            } finally {
                setBusy(false);
            }
        },
        [authHeader, refresh]
    );

    const acceptFiles = useCallback((files: File[]) => {
        const supported = files.filter(isSupportedImage);
        setError(supported.length < files.length ? "Photos only — JPEG, PNG, WebP or HEIC." : null);
        setQueue(supported);
    }, []);

    const remove = useCallback(
        async (id: string) => {
            setPhotos((current) => current.filter((photo) => photo.id !== id));
            try {
                await axios.post(`${API}/remove`, { id }, { headers: authHeader });
            } catch {
                setError("Couldn't remove that one.");
                await refresh();
            }
        },
        [authHeader, refresh]
    );

    const compact = useMediaQuery((theme) => theme.breakpoints.down("sm"));

    if (!authorized) {
        return <Navigate to="/" replace />;
    }

    const secondaryText =
        "Can't wait? Shake it like a Polaroid picture and it'll pull down whatever you just added.";
    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Typography variant="h2" gutterBottom>
                Polaroid
            </Typography>
            <Typography color="text.secondary" sx={{ mb: -1 }}>
                Drop photos in and they'll develop onto the frame, a new one every hour or so.
                {compact && " " + secondaryText}
            </Typography>
            {!compact && <Typography color="text.secondary">{secondaryText}</Typography>}
            <DropArea dragging={dragging} setDragging={setDragging} onFiles={acceptFiles}>
                <UploadControls onFiles={acceptFiles} />
                <Gallery
                    photos={photos}
                    uploading={busy}
                    error={error}
                    onRemove={(id) => void remove(id)}
                />
            </DropArea>
            <CropDialog
                file={queue[0] ?? null}
                remaining={Math.max(0, queue.length - 1)}
                onCancel={() => setQueue((current) => current.slice(1))}
                onConfirm={(cropped) => void upload(cropped)}
            />
        </Box>
    );
}

function DropArea(props: {
    dragging: boolean;
    setDragging: (dragging: boolean) => void;
    onFiles: (files: File[]) => void;
    children: ReactNode;
}) {
    const compact = useMediaQuery((theme) => theme.breakpoints.down("lg"));
    return (
        <Box
            onDragOver={(event) => {
                event.preventDefault();
                props.setDragging(true);
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
                props.onFiles(Array.from(event.dataTransfer.files));
            }}
            sx={{
                mt: compact ? 6 : 2,
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

function UploadControls(props: { onFiles: (files: File[]) => void }) {
    return (
        <Button
            variant="contained"
            component="label"
            size="large"
            sx={{
                // Straddling the border, so the photos below start at the very
                // top of the box instead of below a row of controls.
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
            Choose Photos
            <input
                hidden
                multiple
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                onChange={(event) => {
                    if (event.target.files) {
                        props.onFiles(Array.from(event.target.files));
                    }
                    // Without this, picking the same files again fires no change
                    // event and the picker looks broken.
                    event.target.value = "";
                }}
            />
        </Button>
    );
}

function Gallery(props: {
    photos: Photo[];
    uploading: boolean;
    error: string | null;
    onRemove: (id: string) => void;
}) {
    return (
        <Box
            sx={{
                flex: "1 1 0",
                minHeight: 0,
                overflow: "hidden",
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
