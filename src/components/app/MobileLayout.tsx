import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, CircularProgress, Grid } from "@mui/material";
import axios from "axios";
import { startAuthentication } from "@simplewebauthn/browser";

import SmallProfile from "../../images/small-profile.webp";
import { MobileSocialButtonList } from "./SocialButtons";
import { API_URL } from "../App";
import { useAppContext } from "../AppContext";

const HOLD_DELAY_MS = 500;
const PROGRESS_DURATION_MS = 1500;

const MobileLayout = () => {
    const navigate = useNavigate();
    const { setFriendToken } = useAppContext();

    const [avatarSize, setAvatarSize] = useState<number>(200);
    const [progress, setProgress] = useState<number>(0);
    const [isHolding, setIsHolding] = useState<boolean>(false);
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

    const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const authTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        function handleResize() {
            const smallHeight = window.innerHeight < 620;
            setAvatarSize(smallHeight ? 150 : 200);
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const cancelHold = () => {
        if (holdDelayRef.current) clearTimeout(holdDelayRef.current);
        if (authTimerRef.current) clearTimeout(authTimerRef.current);
        holdDelayRef.current = null;
        authTimerRef.current = null;
        setIsHolding(false);
        setProgress(0);
    };

    useEffect(() => {
        return () => cancelHold();
    }, []);

    const triggerAuth = async () => {
        setIsAuthenticating(true);
        try {
            // @ts-expect-error
            if (import.meta.env.DEV) {
                console.warn("Passkey Auth Unavailable In Local Environment");
                return;
            }
            const { data: authOptions } = await axios.post(
                `${API_URL}/admin/passkey-auth-options`
            );
            const authResponse = await startAuthentication({ optionsJSON: authOptions });
            const { data: authResult } = await axios.post(`${API_URL}/admin/passkey-auth`, {
                response: authResponse,
                challenge: authOptions.challenge
            });
            setFriendToken(authResult.token);
            setIsAuthenticating(false);
            cancelHold();
            navigate("/ice-cream");
        } catch (err) {
            console.error("Friend Mode Auth Failed:", err);
            setIsAuthenticating(false);
            cancelHold();
        }
    };

    const startHold = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isAuthenticating) return;
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
        cancelHold();

        holdDelayRef.current = setTimeout(() => {
            holdDelayRef.current = null;
            setIsHolding(true);
            requestAnimationFrame(() => setProgress(100));
            authTimerRef.current = setTimeout(() => {
                authTimerRef.current = null;
                void triggerAuth();
            }, PROGRESS_DURATION_MS);
        }, HOLD_DELAY_MS);
    };

    const ringSize = avatarSize + 8;
    const ringThickness = 2;

    return (
        <Grid
            container
            direction={"column"}
            justifyContent={"space-around"}
            alignItems={"center"}
            sx={{ width: "100dvw", height: "90dvh", minHeight: 500 }}
        >
            <Grid>
                <Box
                    sx={{
                        position: "relative",
                        width: ringSize,
                        height: ringSize,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none",
                        touchAction: "none"
                    }}
                    onPointerDown={startHold}
                    onPointerUp={cancelHold}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: ringSize,
                            height: ringSize,
                            opacity: isHolding || isAuthenticating ? 1 : 0,
                            transition: "opacity 120ms ease-out",
                            pointerEvents: "none"
                        }}
                    >
                        <CircularProgress
                            variant={isAuthenticating ? "indeterminate" : "determinate"}
                            value={progress}
                            size={ringSize}
                            thickness={ringThickness}
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                color: "#FFFFFF",
                                "& circle": {
                                    transition:
                                        progress === 100
                                            ? `stroke-dashoffset ${PROGRESS_DURATION_MS}ms linear`
                                            : "none"
                                }
                            }}
                        />
                    </Box>
                    <Avatar
                        alt="Max Rosoff"
                        src={SmallProfile}
                        slotProps={{ img: { draggable: false } }}
                        sx={{
                            width: avatarSize,
                            height: avatarSize,
                            fetchPriority: "high",
                            pointerEvents: "none",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            WebkitTouchCallout: "none"
                        }}
                    />
                </Box>
            </Grid>
            <Grid>
                <MobileSocialButtonList />
            </Grid>
        </Grid>
    );
};

export default MobileLayout;
