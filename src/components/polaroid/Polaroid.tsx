import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
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

    if (!authorized) {
        return <Navigate to="/" replace />;
    }

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Intro />
            <DropArea dragging={dragging} setDragging={setDragging} onFiles={acceptFiles}>
                <UploadControls busy={busy} onFiles={acceptFiles} />
                <Gallery photos={photos} error={error} onRemove={(id) => void remove(id)} />
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

function Intro() {
    return (
        <>
            <Typography variant="h2" gutterBottom>
                Polaroid
            </Typography>
            <Typography color="text.secondary" sx={{ mb: -1 }}>
                Add photos here and they'll show up on the frame. It changes on its own about once
                an hour.
            </Typography>
            <Typography color="text.secondary">
                Give it a shake to make it fetch new photos right away — it'll land on whatever you
                just added.
            </Typography>
        </>
    );
}

function DropArea({
    dragging,
    setDragging,
    onFiles,
    children
}: {
    dragging: boolean;
    setDragging: (dragging: boolean) => void;
    onFiles: (files: File[]) => void;
    children: ReactNode;
}) {
    return (
        <Box
            onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
            }}
            onDragLeave={(event) => {
                // Fires when crossing into a child too, so ignore those.
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDragging(false);
                }
            }}
            onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                onFiles(Array.from(event.dataTransfer.files));
            }}
            sx={{
                mt: 4,
                p: 3,
                pt: 5,
                flex: "1 1 0",
                minHeight: 0,
                position: "relative",
                borderRadius: 2,
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: dragging ? "primary.main" : "divider",
                bgcolor: dragging ? "action.hover" : "transparent",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {children}
        </Box>
    );
}

function UploadControls({ busy, onFiles }: { busy: boolean; onFiles: (files: File[]) => void }) {
    return (
        <Button
            variant="contained"
            component="label"
            size="large"
            disabled={busy}
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
                py: "7px",
                // Disabled defaults to a translucent background, which would let
                // the dashed border show through the button.
                "&.Mui-disabled": { bgcolor: "background.paper", color: "text.secondary" }
            }}
        >
            {busy ? "Developing…" : "Choose Photos"}
            <input
                hidden
                multiple
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                onChange={(event) => {
                    if (event.target.files) onFiles(Array.from(event.target.files));
                }}
            />
        </Button>
    );
}

function Gallery({
    photos,
    error,
    onRemove
}: {
    photos: Photo[];
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
            {error && (
                <Typography
                    color="error"
                    sx={{ textAlign: "center", mb: photos.length > 0 ? 3 : 0 }}
                >
                    {error}
                </Typography>
            )}
            <Box sx={{ flex: "1 1 0", minHeight: 0, position: "relative" }}>
                <PhotoGrid photos={photos} onRemove={onRemove} />
            </Box>
        </Box>
    );
}
