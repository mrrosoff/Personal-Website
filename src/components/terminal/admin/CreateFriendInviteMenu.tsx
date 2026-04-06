import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

import EmulatorState, {
    AdminConsoleState
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { TerminalTheme } from "../Terminal";

const CreateFriendInviteMenu = (props: { theme?: TerminalTheme; emulatorState: EmulatorState }) => {
    const mode = props.emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const invite = mode.friendInvite;
    const [copied, setCopied] = useState(false);
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const outputColor = props.theme?.outputColor || "#FCFCFC";
    const commandColor = props.theme?.commandColor || "#FFFFFF";

    const onCopy = async () => {
        if (!invite?.url) return;
        await navigator.clipboard.writeText(invite.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography sx={{ color: outputColor, fontWeight: "bold", mb: 1.25 }}>
                === Admin Console (Create Friend Invite) ===
            </Typography>

            {invite?.url ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, px: 1 }}>
                    <Typography
                        sx={{
                            color: outputColor,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 500
                        }}
                    >
                        {invite.url}
                    </Typography>
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
                <Box sx={{ mb: 1 }}>
                    <Typography
                        sx={{
                            color: commandColor,
                            backgroundColor: "rgba(255,255,255,0.1)",
                            padding: "4px 8px",
                            mb: 1
                        }}
                    >
                        {"> "}Friend Name: {invite?.friendName || ""}
                        {!mode.loading && "_"}
                    </Typography>
                </Box>
            )}

            <Typography
                sx={{
                    color: outputColor,
                    fontSize: "0.9em",
                    opacity: 0.7
                }}
            >
                {mode.loading
                    ? `Loading${dots}`
                    : invite?.url
                      ? "click copy for full url | escape: back"
                      : "type to edit | enter: create | escape: cancel"}
            </Typography>
        </Box>
    );
};

export default CreateFriendInviteMenu;
