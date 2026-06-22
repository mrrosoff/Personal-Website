import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import axios from "axios";

import { API_URL } from "./App";

const SpotifyCallback = () => {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const code = params.get("code");
        const state = params.get("state");

        if (error || !code || !state) {
            setMessage(error ? "Authorization was denied." : "Missing authorization details.");
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
            {status === "loading" && <Typography variant="h2">Connecting Spotify...</Typography>}
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
                </>
            )}
        </Box>
    );
};

export default SpotifyCallback;
