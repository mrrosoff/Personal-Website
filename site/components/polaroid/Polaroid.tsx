import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Typography, useMediaQuery } from "@mui/material";
import axios, { isAxiosError } from "axios";

import { MAX_PHOTOS } from "../../../api/common";
import { API_ENDPOINT_URL, DeviceKind } from "../../../api/types";
import type { ErrorResponseBody } from "../../../api/types";
import { decodeToken, ownsDeviceKind } from "../../auth";
import { signInWithPasskey } from "../../javascript-terminal/commands/sudo";
import { useAppContext } from "../AppContext";
import CropDialog from "./CropDialog";
import type { Photo } from "./PhotoGrid";
import DropArea from "./Polaroid/DropArea";
import Gallery from "./Polaroid/Gallery";
import Unlock from "./Polaroid/Unlock";
import UploadControls, { isSupportedImage } from "./Polaroid/UploadControls";

const API = `${API_ENDPOINT_URL}/polaroid`;

export default function Polaroid() {
    const { emulatorState } = useAppContext();
    const [token, setToken] = useState(() => emulatorState.getEnvVariables().AUTH_TOKEN);

    const unlock = useCallback(async () => {
        const fresh = await signInWithPasskey();
        emulatorState.setEnvVariables({
            ...emulatorState.getEnvVariables(),
            AUTH_TOKEN: fresh
        });
        setToken(fresh);
    }, [emulatorState]);

    const authorized = useMemo(
        () => ownsDeviceKind(token ? decodeToken(token) : null, DeviceKind.POLAROID),
        [token]
    );

    const authHeader = useMemo(() => ({ Authorization: `Bearer ${token ?? ""}` }), [token]);

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
            setPhotos((current) =>
                response.data.photos.map(
                    (photo) => current.find((existing) => existing.id === photo.id) ?? photo
                )
            );
        } catch {
            setError("Couldn't load your photos.");
        }
    }, [authHeader]);

    useEffect(() => {
        if (!authorized) {
            return;
        }
        let interval: ReturnType<typeof setInterval> | undefined;
        const poll = () => {
            clearInterval(interval);
            if (document.hidden) {
                return;
            }
            void refresh();
            interval = setInterval(() => void refresh(), 30_000);
        };

        poll();
        document.addEventListener("visibilitychange", poll);
        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", poll);
        };
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
            } catch (err) {
                if (isAxiosError<ErrorResponseBody>(err) && err.response?.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError("That photo didn't go through. Try another?");
                }
                await refresh();
            } finally {
                setBusy(false);
            }
        },
        [authHeader, refresh]
    );

    const free = Math.max(0, MAX_PHOTOS - photos.length - (busy ? 1 : 0));

    const acceptFiles = useCallback(
        (files: File[]) => {
            const supported = files.filter(isSupportedImage);
            const accepted = supported.slice(0, free);
            setError(
                supported.length < files.length
                    ? "Photos only — JPEG, PNG, WebP or HEIC."
                    : accepted.length < supported.length
                      ? `Room for ${free.toString()} more. The rest didn't make it in.`
                      : null
            );
            setQueue(accepted);
        },
        [free]
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

    const compact = useMediaQuery((theme) => theme.breakpoints.down("sm"));

    if (!authorized) {
        return token ? <Navigate to="/" replace /> : <Unlock onUnlock={unlock} />;
    }

    const secondaryText =
        "Can't wait? Shake it like a Polaroid picture and it'll pull down whatever you just added.";
    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Typography variant="h2" gutterBottom>
                Polaroid
            </Typography>
            <Typography color="text.secondary" sx={{ mb: -1, fontSize: { xs: 18, sm: 22 } }}>
                Drop photos in and they'll develop onto the frame, a new one every hour or so.
                {compact && " " + secondaryText}
            </Typography>
            {!compact && (
                <Typography color="text.secondary" sx={{ fontSize: { xs: 18, sm: 22 } }}>
                    {secondaryText}
                </Typography>
            )}
            <DropArea
                dragging={dragging}
                setDragging={setDragging}
                onFiles={acceptFiles}
                full={free === 0}
            >
                <UploadControls onFiles={acceptFiles} full={free === 0} />
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
