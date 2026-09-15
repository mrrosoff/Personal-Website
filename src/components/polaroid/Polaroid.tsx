import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import axios from "axios";

import { MAX_PHOTOS } from "../../../api/common";
import { DeviceKind } from "../../../api/types";
import { API_URL } from "../App";
import { decodeToken, ownsDeviceKind } from "../../auth";
import { signInWithPasskey } from "../../javascript-terminal/commands/sudo";
import { TERMINAL_COLORS } from "../terminal/Terminal";
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
    const [token, setToken] = useState(() => emulatorState.getEnvVariables()["AUTH_TOKEN"]);

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
            } catch (err) {
                const message = axios.isAxiosError(err)
                    ? (err.response?.data as { message?: string } | undefined)?.message
                    : undefined;
                setError(message ?? "That photo didn't go through. Try another?");
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

function Unlock({ onUnlock }: { onUnlock: () => Promise<void> }) {
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);

    const attempt = useCallback(async () => {
        setBusy(true);
        try {
            await onUnlock();
        } catch {
            void navigate("/", { replace: true });
        }
    }, [onUnlock, navigate]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (busy || event.metaKey || event.ctrlKey || event.altKey) return;
            if (event.key.length === 1 || event.key === "Enter") {
                void attempt();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [attempt, busy]);

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none"
            }}
        >
            <Box
                onClick={busy ? undefined : () => void attempt()}
                sx={{
                    color: TERMINAL_COLORS.outputColor,
                    cursor: busy ? "default" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    transition: "color 180ms ease-out",
                    ...(!busy && {
                        "&:hover": { color: TERMINAL_COLORS.promptSymbolColor },
                        "&:hover .unlock-shackle": {
                            transform: "translateY(-2px) rotate(14deg)"
                        }
                    })
                }}
            >
                <Box
                    component={"svg"}
                    viewBox={"0 0 24 24"}
                    sx={{
                        width: 34,
                        height: 34,
                        overflow: "visible",
                        display: "block"
                    }}
                >
                    <Box
                        component={"path"}
                        className={"unlock-shackle"}
                        d={"M8 12 V8 Q8 6 10 6 H14 Q16 6 16 8 V12"}
                        sx={{
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: 1.75,
                            strokeLinecap: "square",
                            transformBox: "fill-box",
                            transformOrigin: "100% 100%",
                            transform: busy ? "translateY(-2px) rotate(14deg)" : "none",
                            transition: "transform 200ms ease-out"
                        }}
                    />
                    <Box
                        component={"rect"}
                        x={4}
                        y={12}
                        width={16}
                        height={9}
                        rx={0.5}
                        sx={{
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: 1.75,
                            strokeLinejoin: "miter"
                        }}
                    />
                    <Box
                        component={"rect"}
                        x={11.25}
                        y={15}
                        width={1.5}
                        height={3.5}
                        sx={{ fill: "currentColor" }}
                    />
                </Box>
                <Typography sx={{ fontSize: "0.9em", opacity: 0.7 }}>
                    {busy ? "Authenticating" : "Unlock"}
                    {busy && (
                        <Box
                            component={"span"}
                            sx={{
                                display: "inline-block",
                                width: "3ch",
                                textAlign: "left",
                                verticalAlign: "bottom",
                                overflow: "hidden",
                                whiteSpace: "nowrap"
                            }}
                        >
                            <Box
                                component={"span"}
                                sx={{
                                    display: "inline-block",
                                    overflow: "hidden",
                                    verticalAlign: "bottom",
                                    whiteSpace: "nowrap",
                                    animation: "unlock-dots 1.2s steps(4, end) infinite",
                                    "@keyframes unlock-dots": {
                                        from: { width: 0 },
                                        to: { width: "4ch" }
                                    }
                                }}
                            >
                                ...
                            </Box>
                        </Box>
                    )}
                </Typography>
            </Box>
        </Box>
    );
}

function DropArea(props: {
    dragging: boolean;
    setDragging: (dragging: boolean) => void;
    onFiles: (files: File[]) => void;
    full: boolean;
    children: ReactNode;
}) {
    const compact = useMediaQuery((theme) => theme.breakpoints.down("lg"));
    return (
        <Box
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

function UploadControls(props: { onFiles: (files: File[]) => void; full: boolean }) {
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
