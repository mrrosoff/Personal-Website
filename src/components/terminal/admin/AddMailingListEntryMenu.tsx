import { useEffect, useState } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import type {
    AdminConsoleState,
    MailingListEntry
} from "../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../AppContext";
import type { TerminalTheme } from "../Terminal";
import MenuItem from "./common/MenuItem";

type FormField = MailingListEntry["currentField"];

const AddMailingListEntryMenu = (props: {
    theme?: TerminalTheme;
    onAction: (key: string) => void;
}) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode() as AdminConsoleState;
    const entry = mode.mailingListEntry;
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    if (!entry) return null;

    const outputColor = props.theme?.outputColor || "#FCFCFC";
    const commandColor = props.theme?.commandColor || "#FFFFFF";

    const selectField = (field: FormField) => {
        emulatorState.setAdminConsoleMode({
            ...mode,
            mailingListEntry: { ...entry, currentField: field }
        });
        props.onAction("");
    };

    const fields: Array<{ field: FormField; label: string }> = [
        { field: "firstName", label: "First Name" },
        { field: "lastName", label: "Last Name" },
        { field: "email", label: "Email" }
    ];

    return (
        <Box sx={{ paddingTop: 1 }}>
            <Typography sx={{ color: outputColor, fontWeight: "bold", mb: 1.25 }}>
                === Admin Console (Add To Mailing List) ===
            </Typography>
            {entry.added ? (
                <Typography sx={{ color: outputColor, mb: 1, px: 1 }}>
                    {entry.email.trim()} is on the mailing list.
                </Typography>
            ) : (
                <Box sx={{ mb: 1 }}>
                    {fields.map(({ field, label }) => {
                        const active = entry.currentField === field;
                        return (
                            <Typography
                                key={field}
                                onClick={smallScreen ? () => selectField(field) : undefined}
                                sx={{
                                    color: active ? commandColor : outputColor,
                                    backgroundColor: active
                                        ? "rgba(255,255,255,0.1)"
                                        : "transparent",
                                    padding: "4px 8px",
                                    mb: 1,
                                    cursor: smallScreen ? "pointer" : undefined,
                                    overflowWrap: "anywhere"
                                }}
                            >
                                {active ? "> " : "  "}
                                {label}: {entry[field]}
                                {active && !mode.loading && "_"}
                            </Typography>
                        );
                    })}
                </Box>
            )}

            {smallScreen && !mode.loading && (
                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    {!entry.added && (
                        <MenuItem
                            selected={false}
                            theme={props.theme}
                            disabled={!entry.email}
                            onClick={() => props.onAction("Enter")}
                        >
                            Add
                        </MenuItem>
                    )}
                    <MenuItem
                        selected={false}
                        theme={props.theme}
                        onClick={() => props.onAction("Escape")}
                    >
                        {entry.added ? "Back" : "Cancel"}
                    </MenuItem>
                </Box>
            )}

            <Typography sx={{ color: outputColor, fontSize: "0.9em", opacity: 0.7 }}>
                {mode.loading
                    ? `Adding${dots}`
                    : entry.added
                      ? smallScreen
                          ? "tap Back to return"
                          : "enter: back | escape: back"
                      : smallScreen
                        ? "tap a field to edit, then Add"
                        : "up/down: navigate fields | type to edit | enter: add | escape: cancel"}
            </Typography>
        </Box>
    );
};

export default AddMailingListEntryMenu;
