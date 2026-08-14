import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import axios from "axios";

import { UserType } from "../../../api/types";
import { API_URL, decodeToken } from "../App";
import { useAppContext } from "../AppContext";
import CropDialog from "./CropDialog";
import PhotoGrid, { type Photo } from "./PhotoGrid";

const API = `${API_URL}/polaroid`;

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [queue, setQueue] = useState<File[]>([]);

    const refresh = useCallback(async () => {
        try {
            const response = await axios.get<{ photos: Photo[] }>(`${API}/photos`, {
                headers: authHeader
            });
            setPhotos(response.data.photos);
        } catch {
            setError("Couldn't load your photos.");
        } finally {
            setLoading(false);
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
            <DropArea onFiles={setQueue}>
                <UploadControls busy={busy} onFiles={setQueue} />
                <Gallery
                    photos={photos}
                    loading={loading}
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
    onFiles,
    children
}: {
    onFiles: (files: File[]) => void;
    children: ReactNode;
}) {
    const [dragging, setDragging] = useState(false);

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
                flexGrow: 1,
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
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mb={3}>
            {busy && (
                <>
                    <CircularProgress size={22} />
                    <Typography color="text.secondary">Developing…</Typography>
                </>
            )}
            <Button
                variant="contained"
                component="label"
                size="large"
                disabled={busy}
                sx={{ fontSize: "1rem", px: "19px", py: "7px" }}
            >
                Choose Photos
                <input
                    hidden
                    multiple
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={(event) => {
                        if (event.target.files) onFiles(Array.from(event.target.files));
                    }}
                />
            </Button>
        </Stack>
    );
}

function Gallery({
    photos,
    loading,
    error,
    onRemove
}: {
    photos: Photo[];
    loading: boolean;
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
                flexDirection: "column",
                justifyContent: loading || photos.length > 0 ? "flex-start" : "center"
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
            <PhotoGrid photos={photos} loading={loading} onRemove={onRemove} />
        </Box>
    );
}
