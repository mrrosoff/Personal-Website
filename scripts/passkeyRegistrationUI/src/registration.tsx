import { useState } from "react";

import { startRegistration } from "@simplewebauthn/browser";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";

const Registration = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleClick = async () => {
        try {
            const server = "http://localhost:3456";
            const optionsRes = await axios.post(
                `${server}/options`,
                {},
                { headers: { "Content-Type": "application/json" } }
            );

            const registrationResponse = await startRegistration(optionsRes.data);

            const verifyRes = await axios.post(`${server}/register`, registrationResponse, {
                headers: { "Content-Type": "application/json" }
            });

            if (verifyRes.data) {
                setMessage("✓ Passkey registered successfully!");
                setTimeout(() => window.close(), 2000);
            } else {
                throw new Error("Registration Verification Failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setMessage("✗ Registration failed. See console for details.");
        }
    };

    return (
        <Box>
            <Button disabled={loading} loading={loading} onClick={handleClick}>
                {loading ? "Loading" : "Register Passkey"}
            </Button>
            <Typography variant="body1" mt={2}>
                {message}
            </Typography>
        </Box>
    );
};

export default Registration;
