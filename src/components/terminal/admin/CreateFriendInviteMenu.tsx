import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Box, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

import {
    type AdminConsoleState,
    type FriendInvite,
    type InviteDevice,
    shareTokenDurationLabel
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { API_URL } from "../../App";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";
import Stepper from "./common/Stepper";

const CreateFriendInviteMenu = (props: {
    theme?: TerminalTheme;
    onAction: (key: string) => void;
}) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const invite = mode.friendInvite;
    const [copied, setCopied] = useState(false);
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const devices = mode.inviteDevices;
    const authToken = emulatorState.getEnvVariables()["AUTH_TOKEN"];

    const requestedDevices = useRef(false);

    useEffect(() => {
        if (devices || !authToken || requestedDevices.current) return;
        requestedDevices.current = true;
        void (async () => {
            const loaded = await axios
                .get<{ devices: InviteDevice[] }>(`${API_URL}/admin/devices`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
                .then(({ data }) => data.devices)
                .catch(() => []);
            emulatorState.setAdminConsoleMode({
                ...emulatorState.getAdminConsoleMode(),
                inviteDevices: loaded
            });
            props.onAction("");
        })();
    }, [devices, authToken, emulatorState, props]);

    const outputColor = props.theme?.outputColor || "#FCFCFC";
    const commandColor = props.theme?.commandColor || "#FFFFFF";

    const onCopy = async () => {
        if (!invite?.url) return;
        await navigator.clipboard.writeText(invite.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const toggleDevice = (index: number) => {
        if (!invite) return;
        emulatorState.setAdminConsoleMode({
            ...mode,
            friendInvite: { ...invite, deviceIndex: index }
        });
        props.onAction(" ");
    };

    const selectField = (field: FriendInvite["currentField"]) => {
        if (!invite) return;
        emulatorState.setAdminConsoleMode({
            ...mode,
            friendInvite: { ...invite, currentField: field }
        });
        props.onAction("");
    };

    const fields: Array<{ field: FriendInvite["currentField"]; label: string; value: string }> = [
        { field: "friendName", label: "Friend Name", value: invite?.friendName ?? "" },
        { field: "email", label: "Email", value: invite?.email ?? "" },
        {
            field: "durationHours",
            label: "Link Lasts",
            value: invite ? shareTokenDurationLabel(invite.durationHours) : ""
        },
        { field: "devices", label: "Devices", value: chosenDevices(invite, devices) }
    ];

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography sx={{ color: outputColor, fontWeight: "bold", mb: 1.25 }}>
                === Admin Console (Create Friend Invite) ===
            </Typography>

            {invite?.url ? (
                <Box sx={{ mb: 1, px: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    <Typography sx={{ color: outputColor, opacity: 0.7, mt: 0.5 }}>
                        {invite.email
                            ? `Emailed to ${invite.email}, good for ${shareTokenDurationLabel(invite.durationHours)}`
                            : `Good for ${shareTokenDurationLabel(invite.durationHours)}`}
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ mb: 1 }}>
                    {fields.map(({ field, label, value }) => {
                        const active = invite?.currentField === field;
                        return (
                            <Box key={field}>
                                <Typography
                                    onClick={smallScreen ? () => selectField(field) : undefined}
                                    sx={{
                                        color: active ? commandColor : outputColor,
                                        backgroundColor: active
                                            ? "rgba(255,255,255,0.1)"
                                            : "transparent",
                                        padding: "4px 8px",
                                        mb: 1,
                                        cursor: smallScreen ? "pointer" : undefined
                                    }}
                                >
                                    {active ? "> " : "  "}
                                    {label}:{" "}
                                    {active && field === "durationHours" && smallScreen ? (
                                        <Stepper
                                            value={value}
                                            width={"13ch"}
                                            theme={props.theme}
                                            onStep={(key) => props.onAction(key)}
                                        />
                                    ) : (
                                        <>
                                            {value}
                                            {active && !mode.loading && field !== "devices"
                                                ? "_"
                                                : ""}
                                            {active && field === "durationHours"
                                                ? " (type hours or ←/→)"
                                                : ""}
                                        </>
                                    )}
                                </Typography>
                                {active && field === "devices"
                                    ? devices?.map((device, index) => (
                                          <Typography
                                              key={device.deviceId}
                                              onClick={
                                                  smallScreen
                                                      ? () => toggleDevice(index)
                                                      : undefined
                                              }
                                              sx={{
                                                  color:
                                                      invite?.deviceIndex === index
                                                          ? commandColor
                                                          : outputColor,
                                                  opacity: invite?.deviceIndex === index ? 1 : 0.7,
                                                  pl: 4,
                                                  cursor: smallScreen ? "pointer" : undefined
                                              }}
                                          >
                                              {invite?.deviceIndex === index && !smallScreen
                                                  ? "› "
                                                  : "  "}
                                              [
                                              {invite?.deviceIds.includes(device.deviceId)
                                                  ? "x"
                                                  : " "}
                                              ] {device.name}
                                          </Typography>
                                      ))
                                    : null}
                            </Box>
                        );
                    })}
                </Box>
            )}

            {smallScreen && !mode.loading && (
                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    {!invite?.url && (
                        <MenuItem
                            selected={false}
                            theme={props.theme}
                            disabled={!invite?.friendName}
                            onClick={() => props.onAction("Enter")}
                        >
                            Create
                        </MenuItem>
                    )}
                    <MenuItem
                        selected={false}
                        theme={props.theme}
                        onClick={() => props.onAction("Escape")}
                    >
                        {invite?.url ? "Back" : "Cancel"}
                    </MenuItem>
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
                      ? smallScreen
                          ? "tap copy for full url"
                          : "click copy for full url | escape: back"
                      : smallScreen
                        ? "tap a field to edit, then Create"
                        : "up/down: fields | ←/→ and space: devices | enter: create | escape: cancel"}
            </Typography>
        </Box>
    );
};

function chosenDevices(
    invite: FriendInvite | undefined,
    devices: InviteDevice[] | undefined
): string {
    if (!devices) return "Loading";
    if (!devices.length) return "None Registered";
    const chosen = devices.filter((device) => invite?.deviceIds.includes(device.deviceId));
    return chosen.length ? chosen.map((device) => device.name).join(", ") : "None";
}

export default CreateFriendInviteMenu;
