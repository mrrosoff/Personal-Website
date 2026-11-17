import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, keyframes } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import axios, { isAxiosError } from "axios";

import { API_ENDPOINT_URL } from "../../api/types";
import type { ErrorResponseBody } from "../../api/types";

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
                        animationDelay: `${(index * 0.15).toString()}s`
                    }}
                />
            ))}
        </Box>
        <Typography variant="h2">Connecting Spotify...</Typography>
    </Box>
);

const REDIRECT_SECONDS = 5;

function callbackProblem(params: URLSearchParams) {
    if (params.has("error")) {
        return "Authorization Was Denied";
    }
    return params.has("code") && params.has("state") ? null : "Missing Authorization Details";
}

const SpotifyCallback = () => {
    const [params] = useSearchParams();
    const problem = callbackProblem(params);
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        problem ? "error" : "loading"
    );
    const [message, setMessage] = useState(problem ?? "");
    const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
    const navigate = useNavigate();

    useEffect(() => {
        if (status === "loading") {
            return;
        }
        if (secondsLeft <= 0) {
            void navigate("/");
            return;
        }
        const timeout = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
        return () => clearTimeout(timeout);
    }, [status, secondsLeft, navigate]);

    useEffect(() => {
        if (problem) {
            return;
        }

        const exchange = async () => {
            try {
                await axios.post(`${API_ENDPOINT_URL}/spotify/exchange`, {
                    code: params.get("code"),
                    state: params.get("state")
                });
                setStatus("success");
            } catch (err: unknown) {
                if (isAxiosError<ErrorResponseBody>(err) && err.response?.data.message) {
                    setMessage(err.response.data.message);
                } else {
                    setMessage("Could Not Connect Spotify, Please Try Again");
                }
                setStatus("error");
            }
        };
        void exchange();
    }, [params, problem]);

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
                    <Typography>The display is reconnected.</Typography>
                </>
            )}
            {status === "error" && (
                <>
                    <ErrorOutlineIcon sx={{ fontSize: 48 }} color="error" />
                    <Typography variant="h1">Connection Failed</Typography>
                    <Typography color="error">{message}</Typography>
                </>
            )}
            {status !== "loading" && (
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                    Redirecting in {secondsLeft}...
                </Typography>
            )}
        </Box>
    );
};

export default SpotifyCallback;
