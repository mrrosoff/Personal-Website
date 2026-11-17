import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Box, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

import type { AdminConsoleScreen } from "../../../javascript-terminal/emulatorState/EmulatorState";
import type {
    FriendInvite,
    InviteDevice,
    AdminConsoleMode
} from "../../../javascript-terminal/emulatorState/EmulatorState";
import { shareTokenDurationLabel } from "../../../../api/common";
import { API_ENDPOINT_URL } from "../../../../api/types";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "./common/ConsoleText";
import useLoadingDots from "./common/useLoadingDots";
import Stepper from "./common/Stepper";
import { COLORS } from "../../../theme";

type CreateFriendInviteMenuProps = {
    theme: TerminalTheme;
    onAction: (key: string) => void;
    mode: AdminConsoleMode<AdminConsoleScreen.CreateFriendInvite>;
};

const CreateFriendInviteMenu = (props: CreateFriendInviteMenuProps) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const invite = props.mode.friendInvite;
    const inviteUrl = invite.url;
    const [copied, setCopied] = useState(false);
    const dots = useLoadingDots();

    const devices = props.mode.inviteDevices;
    const authToken = emulatorState.getEnvVariables().AUTH_TOKEN;

    const requestedDevices = useRef(false);

    useEffect(() => {
        if (devices || !authToken || requestedDevices.current) return;
        requestedDevices.current = true;
        void (async () => {
            const loaded = await axios
                .get<{ devices: InviteDevice[] }>(`${API_ENDPOINT_URL}/admin/devices`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
                .then(({ data }) => data.devices)
                .catch(() => []);
            emulatorState.updateAdminConsoleMode({ inviteDevices: loaded });
            props.onAction("");
        })();
    }, [devices, authToken, emulatorState, props]);

    const outputColor = props.theme.outputColor;
    const commandColor = props.theme.commandColor;

    const onCopy = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const toggleDevice = (index: number) => {
        emulatorState.setAdminConsoleMode({
            ...props.mode,
            friendInvite: { ...invite, deviceIndex: index }
        });
        props.onAction(" ");
    };

    const selectField = (field: FriendInvite["currentField"]) => {
        emulatorState.setAdminConsoleMode({
            ...props.mode,
            friendInvite: { ...invite, currentField: field }
        });
        props.onAction("");
    };

    const fields: { field: FriendInvite["currentField"]; label: string; value: string }[] = [
        { field: "friendName", label: "Friend Name", value: invite.friendName },
        { field: "email", label: "Email", value: invite.email },
        {
            field: "durationHours",
            label: "Link Lasts",
            value: shareTokenDurationLabel(invite.durationHours)
        },
        { field: "devices", label: "Devices", value: chosenDevices(invite, devices) }
    ];

    return (
        <Box sx={{ paddingTop: 1 }}>
            <ConsoleHeading theme={props.theme} title={"Create Friend Invite"} />

            {inviteUrl ? (
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
                            {inviteUrl}
                        </Typography>
                        <Tooltip title={copied ? "Copied" : "Copy"} placement="right">
                            <IconButton
                                size="small"
                                onClick={() => void onCopy(inviteUrl)}
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
                        const active = invite.currentField === field;
                        return (
                            <Box key={field}>
                                <Typography
                                    onClick={smallScreen ? () => selectField(field) : undefined}
                                    sx={{
                                        color: active ? commandColor : outputColor,
                                        backgroundColor: active ? COLORS.faint : "transparent",
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
                                            {active && !props.mode.loading && field !== "devices"
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
                                                      invite.deviceIndex === index
                                                          ? commandColor
                                                          : outputColor,
                                                  opacity: invite.deviceIndex === index ? 1 : 0.7,
                                                  pl: 4,
                                                  cursor: smallScreen ? "pointer" : undefined
                                              }}
                                          >
                                              {invite.deviceIndex === index && !smallScreen
                                                  ? "› "
                                                  : "  "}
                                              [
                                              {invite.deviceIds.includes(device.deviceId)
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

            {smallScreen && !props.mode.loading && (
                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    {!inviteUrl && (
                        <MenuItem
                            selected={false}
                            theme={props.theme}
                            disabled={!invite.friendName}
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
                        {inviteUrl ? "Back" : "Cancel"}
                    </MenuItem>
                </Box>
            )}

            <ConsoleHint theme={props.theme}>
                {props.mode.loading
                    ? `Loading${dots}`
                    : inviteUrl
                      ? smallScreen
                          ? "tap copy for full url"
                          : "click copy for full url | escape: back"
                      : smallScreen
                        ? "tap a field to edit, then Create"
                        : "up/down: fields | ←/→ and space: devices | enter: create | escape: cancel"}
            </ConsoleHint>
        </Box>
    );
};

function chosenDevices(invite: FriendInvite, devices: InviteDevice[] | undefined): string {
    if (!devices) return "Loading";
    if (!devices.length) return "None Registered";
    const chosen = devices.filter((device) => invite.deviceIds.includes(device.deviceId));
    return chosen.length ? chosen.map((device) => device.name).join(", ") : "None";
}

export default CreateFriendInviteMenu;
