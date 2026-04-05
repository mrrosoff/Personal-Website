import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { Box, Button, Typography } from "@mui/material";
import { startRegistration } from "@simplewebauthn/browser";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { API_URL } from "./App";
import { AccessToken } from "../../api/auth";

const RegisterFriend = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = params.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!token) {
        return <Navigate to={"/"} replace />;
    }

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const optionsUrl = `${API_URL}/admin/passkey-register-options`;
            const { data: options } = await axios.post(optionsUrl, { token });

            const registrationResponse = await startRegistration({ optionsJSON: options });
            await axios.post(`${API_URL}/admin/passkey-register`, {
                token,
                challenge: options.challenge,
                response: registrationResponse
            });
            return navigate("/");
        } catch (err: unknown) {
            console.error(err);
            setIsLoading(false);
            setError("Registration Failed. Ask For A New Link.");
        }
    };

    const decodedToken = jwtDecode<AccessToken>(token);

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
                Welcome, {decodedToken.id}
            </Typography>
            <Typography variant={"body1"}>Register a passkey to unlock friend mode.</Typography>
            <Typography variant={"body1"} mb={4}>
                Then run <code>sudo su friend</code> in the terminal.
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
            {error && <Typography mt={3}>{error}</Typography>}
        </Box>
    );
};

export default RegisterFriend;
