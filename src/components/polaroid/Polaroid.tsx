import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Alert, Button, Card, CircularProgress, Container, Stack, Typography } from "@mui/material";
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
    const [dragging, setDragging] = useState(false);
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
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" gutterBottom>
                Your Polaroid
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
                Add photos here and they'll show up on the frame. It changes on its own about once
                an hour.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                <strong>Give it a shake</strong> to make it fetch new photos right away — it'll land
                on whatever you just added.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            <Card
                variant="outlined"
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    setQueue(Array.from(event.dataTransfer.files));
                }}
                sx={{
                    p: 6,
                    mb: 5,
                    textAlign: "center",
                    borderStyle: "dashed",
                    borderWidth: 2,
                    bgcolor: dragging ? "action.hover" : "background.paper"
                }}
            >
                {busy ? (
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress />
                        <Typography color="text.secondary">Developing…</Typography>
                    </Stack>
                ) : (
                    <Stack alignItems="center" spacing={2}>
                        <Typography>Drag photos here</Typography>
                        <Button variant="contained" component="label">
                            Choose photos
                            <input
                                hidden
                                multiple
                                type="file"
                                accept="image/*,.heic,.heif"
                                onChange={(event) => {
                                    if (event.target.files)
                                        setQueue(Array.from(event.target.files));
                                }}
                            />
                        </Button>
                    </Stack>
                )}
            </Card>
            <PhotoGrid photos={photos} onRemove={(id) => void remove(id)} />
            <CropDialog
                file={queue[0] ?? null}
                remaining={Math.max(0, queue.length - 1)}
                onCancel={() => setQueue((current) => current.slice(1))}
                onConfirm={(cropped) => void upload(cropped)}
            />
        </Container>
    );
}
