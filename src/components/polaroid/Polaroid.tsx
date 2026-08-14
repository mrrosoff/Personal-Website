import { useCallback, useEffect, useMemo, useState } from "react";
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
            <Box
                sx={{
                    mt: 4,
                    p: 3,
                    flexGrow: 1,
                    borderRadius: 2,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 3 }}
                >
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
                                if (event.target.files) setQueue(Array.from(event.target.files));
                            }}
                        />
                    </Button>
                </Stack>
                <Box
                    sx={{
                        flexGrow: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: photos.length > 0 ? "flex-start" : "center"
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
                    <PhotoGrid photos={photos} onRemove={(id) => void remove(id)} />
                </Box>
            </Box>
            <CropDialog
                file={queue[0] ?? null}
                remaining={Math.max(0, queue.length - 1)}
                onCancel={() => setQueue((current) => current.slice(1))}
                onConfirm={(cropped) => void upload(cropped)}
            />
        </Box>
    );
}
