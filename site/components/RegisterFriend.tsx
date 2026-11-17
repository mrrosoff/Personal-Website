import { useEffect, useState, useMemo } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { Box, Button, Typography } from "@mui/material";
import { browserSupportsWebAuthn, startRegistration, WebAuthnError } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/browser";
import axios from "axios";
import { DateTime } from "luxon";

import FormField, { emailProblem } from "./FormField";
import { decodeToken } from "../auth";
import { API_ENDPOINT_URL, DeviceKind } from "../../api/types";

const Code = ({ children }: { children: string }) => (
    <code
        style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            padding: "2px 6px",
            borderRadius: 4,
            fontFamily: "monospace"
        }}
    >
        {children}
    </code>
);

const registrationErrorMessage = (err: unknown): string => {
    if (err instanceof WebAuthnError) {
        switch (err.code) {
            case "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT":
                return "This Device Doesn't Support Biometric Passkeys";
            case "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED":
                return "A Passkey Is Already Registered With This Device";
            case "ERROR_CEREMONY_ABORTED":
                return "Registration Cancelled. Try Again";
        }
    }
    return "Registration Failed. Ask For A New Link.";
};

const RegisterForm = (props: { token: string; friendName: string }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [devices, setDevices] = useState<DeviceKind[]>([]);

    const authHeaders = useMemo(
        () => ({ headers: { Authorization: `Bearer ${props.token}` } }),
        [props.token]
    );

    useEffect(() => {
        const loadDevices = async () => {
            try {
                const url = `${API_ENDPOINT_URL}/friends/devices`;
                const { data } = await axios.get<{ deviceKinds: DeviceKind[] }>(url, authHeaders);
                setDevices(data.deviceKinds);
            } catch (err) {
                console.error(err);
            }
        };
        void loadDevices();
    }, [authHeaders]);

    const isValidEmail = !emailProblem(email.trim());

    const handleRegister = async () => {
        if (!browserSupportsWebAuthn()) {
            setError("This Browser / Device Doesn't Support Biometric Passkeys.");
            return;
        }
        setIsLoading(true);
        try {
            const optionsUrl = `${API_ENDPOINT_URL}/friends/passkey-register-options`;
            const { data: options } = await axios.post<PublicKeyCredentialCreationOptionsJSON>(
                optionsUrl,
                {},
                authHeaders
            );

            const registrationResponse = await startRegistration({ optionsJSON: options });
            await axios.post(
                `${API_ENDPOINT_URL}/friends/passkey-register`,
                {
                    challenge: options.challenge,
                    response: registrationResponse,
                    email: email.trim()
                },
                authHeaders
            );
            const onlyPolaroid = devices.length === 1 && devices[0] === DeviceKind.POLAROID;
            await navigate(onlyPolaroid ? "/polaroid" : "/");
            return;
        } catch (err: unknown) {
            console.error(err);
            setIsLoading(false);
            setError(registrationErrorMessage(err));
        }
    };

    return (
        <>
            <Typography variant={"body1"}>
                Register a passkey to unlock the rest of the terminal.
            </Typography>
            <Typography variant={"body1"}>
                Then run <Code>{`sudo su ${props.friendName}`}</Code> in the terminal.
            </Typography>
            {devices.length > 0 && (
                <Typography variant={"body1"} sx={{ mt: 3 }}>
                    You've been added to{" "}
                    {devices
                        .map((kind) => `a ${kind[0] + kind.slice(1).toLowerCase()} device`)
                        .join(" & ")}
                    .
                    {devices.includes(DeviceKind.POLAROID) && (
                        <>
                            {" "}
                            Your photos go up at <Code>/polaroid</Code>.
                        </>
                    )}
                </Typography>
            )}
            <FormField
                type={"email"}
                label={"Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                problem={emailProblem}
                placeholder={"karl@fog.sf"}
                autoComplete="email"
                sx={{ mt: 4, mb: 3, width: 320, maxWidth: "100%" }}
            />
            <Button
                variant={"contained"}
                size={"large"}
                onClick={() => void handleRegister()}
                loading={isLoading}
                disabled={!isValidEmail}
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
                <Typography sx={{ mt: 3 }} color="error">
                    {error}
                </Typography>
            )}
        </>
    );
};

const RegisterFriend = () => {
    const [params] = useSearchParams();
    const token = params.get("token") ?? "";
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
        return <Navigate to={"/"} replace />;
    }

    const friendName = decodedToken.id;
    const isExpired = DateTime.fromSeconds(decodedToken.exp) < DateTime.now();

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center"
            }}
        >
            <Typography variant={"h1"} sx={{ mb: 3 }}>
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
