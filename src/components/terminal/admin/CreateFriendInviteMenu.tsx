import { KeyboardEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Box, Button, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

import EmulatorState from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";
import { API_URL } from "../../App";

const CreateFriendInviteMenu = (props: { theme?: TerminalTheme; emulatorState: EmulatorState }) => {
    const mode = props.emulatorState.getAdminConsoleMode()!;
    const [friendName, setFriendName] = useState("");
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onCopy = async () => {
        if (!mode.friendInviteUrl) return;
        await navigator.clipboard.writeText(mode.friendInviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const onSubmit = async () => {
        props.emulatorState.setAdminConsoleMode({ ...mode, loading: true });
        try {
            const authToken = props.emulatorState.getEnvVariables()["AUTH_TOKEN"];
            const { data } = await axios.post<{ url: string }>(
                `${API_URL}/admin/create-friend-invite`,
                { friendName },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            props.emulatorState.setAdminConsoleMode({
                ...props.emulatorState.getAdminConsoleMode(),
                friendInviteUrl: data.url,
                loading: false
            });
        } catch (err) {
            console.error("Failed to create friend invite", err);
            props.emulatorState.setAdminConsoleMode({
                ...props.emulatorState.getAdminConsoleMode(),
                friendInviteUrl: "Failed To Create Friend Invite",
                loading: false
            });
        }
    };

    const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void onSubmit();
        }
    };

    const outputColor = props.theme?.outputColor || "#FCFCFC";

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography sx={{ color: outputColor, fontWeight: "bold", mb: 1.25 }}>
                === Admin Console (Create Friend Invite) ===
            </Typography>
            {mode.friendInviteUrl ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography sx={{ color: outputColor }}>{mode.friendInviteUrl}</Typography>
                    <Tooltip title={copied ? "Copied" : "Copy"} placement="right">
                        <IconButton
                            size="small"
                            onClick={onCopy}
                            sx={{ color: outputColor, padding: 0.25 }}
                        >
                            {copied ? (
                                <CheckIcon fontSize="small" />
                            ) : (
                                <ContentCopyIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>
                </Box>
            ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TextField
                        inputRef={inputRef}
                        variant="standard"
                        size="small"
                        placeholder="Friend Name"
                        value={friendName}
                        onChange={(e) => setFriendName(e.target.value)}
                        onKeyDown={onInputKeyDown}
                        disabled={mode.loading}
                        sx={{ input: { color: outputColor } }}
                    />
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onSubmit}
                        loading={mode.loading}
                    >
                        Create Invite
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default CreateFriendInviteMenu;
