import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import axios from "axios";
import { Box, Button, Typography, Paper, Container } from "@mui/material";

const RegisterPasskey = () => {
    const [status, setStatus] = useState<"idle" | "registering" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleRegister = async () => {
        setStatus("registering");
        setMessage("Generating registration options...");

        try {
            // Get registration options from server
            const { data: options } = await axios.post(
                "https://api.maxrosoff.com/admin/passkey-register-options"
            );

            setMessage("Please complete the passkey registration in your browser...");

            // Start browser registration
            const registrationResponse = await startRegistration(options);

            setMessage("Verifying passkey...");

            // Send response to server
            await axios.post("https://api.maxrosoff.com/admin/passkey-register", {
                response: registrationResponse
            });

            setStatus("success");
            setMessage("Passkey registered successfully! You can now use it to authenticate.");
        } catch (err) {
            console.error("Registration error:", err);
            setStatus("error");
            setMessage(
                `Registration failed: ${err instanceof Error ? err.message : "Unknown error"}`
            );
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: "100%",
                        textAlign: "center"
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Register Admin Passkey
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                        Register your passkey to authenticate as admin
                    </Typography>

                    {status === "idle" && (
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleRegister}
                            sx={{ mt: 2 }}
                        >
                            Register Passkey
                        </Button>
                    )}

                    {status === "registering" && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="primary">
                                {message}
                            </Typography>
                        </Box>
                    )}

                    {status === "success" && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
                                ✓ {message}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You can now close this page.
                            </Typography>
                        </Box>
                    )}

                    {status === "error" && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                                ✗ {message}
                            </Typography>
                            <Button variant="outlined" onClick={handleRegister} sx={{ mt: 1 }}>
                                Try Again
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default RegisterPasskey;
