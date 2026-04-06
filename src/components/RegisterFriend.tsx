import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { Box, Button, Typography } from "@mui/material";
import { startRegistration } from "@simplewebauthn/browser";
import axios from "axios";
import { DateTime } from "luxon";

import { API_URL, decodeToken } from "./App";

const RegisterForm = (props: { token: string; friendName: string }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const authHeaders = { headers: { Authorization: `Bearer ${props.token}` } };
            const optionsUrl = `${API_URL}/friends/passkey-register-options`;
            const { data: options } = await axios.post(optionsUrl, {}, authHeaders);

            const registrationResponse = await startRegistration({ optionsJSON: options });
            await axios.post(
                `${API_URL}/friends/passkey-register`,
                { challenge: options.challenge, response: registrationResponse },
                authHeaders
            );
            return navigate("/");
        } catch (err: unknown) {
            console.error(err);
            setIsLoading(false);
            setError("Registration Failed. Ask For A New Link.");
        }
    };

    return (
        <>
            <Typography variant={"body1"}>Register a passkey to unlock friend mode.</Typography>
            <Typography variant={"body1"} mb={4}>
                Then run{" "}
                <code
                    style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontFamily: "monospace"
                    }}
                >
                    sudo su ${props.friendName}
                </code>{" "}
                in the terminal.
            </Typography>
            <Button
                variant={"contained"}
                size={"large"}
                onClick={handleRegister}
                loading={isLoading}
                sx={{
                    fontSize: 20,
                    backgroundColor: "#52535F",
                    color: "white",
                    ":hover": { backgroundColor: "#5F6272" }
                }}
            >
                Register Passkey
            </Button>
            {error && (
                <Typography mt={3} color="error">
                    {error}
                </Typography>
            )}
        </>
    );
};

const RegisterFriend = () => {
    const [params] = useSearchParams();
    const token = params.get("token");

    if (!token) {
        return <Navigate to={"/"} replace />;
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken) {
        return <Navigate to={"/"} replace />;
    }

    const friendName = decodedToken.id;
    const isExpired = DateTime.fromSeconds(decodedToken.exp) < DateTime.now();

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"100%"}
            textAlign={"center"}
        >
            <Typography variant={"h1"} mb={3}>
                Welcome, {friendName}
            </Typography>
            {isExpired ? (
                <Typography variant={"body1"} color="error">
                    This invite link has expired. Ask for a new one.
                </Typography>
            ) : (
                <RegisterForm token={token} friendName={friendName} />
            )}
        </Box>
    );
};

export default RegisterFriend;
