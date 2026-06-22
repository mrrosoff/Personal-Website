import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, keyframes } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import axios from "axios";

import { API_URL } from "./App";

const SPOTIFY_GREEN = "#1DB954";

const bounce = keyframes`
    0%, 100% { transform: scaleY(0.3); opacity: 0.55; }
    50% { transform: scaleY(1); opacity: 1; }
`;

const ConnectingAnimation = () => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        <Box display="flex" alignItems="flex-end" gap="6px" height={56}>
            {[0, 1, 2, 3, 4].map((index) => (
                <Box
                    key={index}
                    sx={{
                        width: 8,
                        height: "100%",
                        borderRadius: 4,
                        backgroundColor: SPOTIFY_GREEN,
                        transformOrigin: "bottom",
                        animation: `${bounce} 1s ease-in-out infinite`,
                        animationDelay: `${index * 0.15}s`
                    }}
                />
            ))}
        </Box>
        <Typography variant="h2">Connecting Spotify...</Typography>
    </Box>
);

const SpotifyCallback = () => {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (status !== "error") {
            return;
        }
        const timeout = setTimeout(() => navigate("/"), 5000);
        return () => clearTimeout(timeout);
    }, [status, navigate]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const code = params.get("code");
        const state = params.get("state");

        if (error || !code || !state) {
            setMessage(error ? "Authorization Was Denied" : "Missing Authorization Details");
            setStatus("error");
            return;
        }

        const exchange = async () => {
            try {
                await axios.post(`${API_URL}/spotify/exchange`, { code, state });
                setStatus("success");
            } catch (err: unknown) {
                let detail = "Could Not Connect Spotify, Please Try Again";
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    detail = err.response.data.message;
                }
                setMessage(detail);
                setStatus("error");
            }
        };
        void exchange();
    }, []);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textAlign="center"
            gap={2}
        >
            {status === "loading" && <ConnectingAnimation />}
            {status === "success" && (
                <>
                    <CheckCircleOutlineIcon sx={{ fontSize: 48 }} />
                    <Typography variant="h1">Spotify Connected</Typography>
                    <Typography>The display is reconnected. You can close this tab.</Typography>
                </>
            )}
            {status === "error" && (
                <>
                    <ErrorOutlineIcon sx={{ fontSize: 48 }} color="error" />
                    <Typography variant="h1">Connection Failed</Typography>
                    <Typography color="error">{message}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6 }}>
                        Taking you back home...
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default SpotifyCallback;
