import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import type { MailingListEntry } from "../../../../javascript-terminal/emulator-state/EmulatorState";
import { useAppContext } from "../../../AppContext";
import type { TerminalTheme } from "../../Terminal";
import MenuItem from "../common/MenuItem";
import { ConsoleHeading, ConsoleHint } from "../common/ConsoleText";
import useLoadingDots from "../common/useLoadingDots";

type FormField = MailingListEntry["currentField"];

const AddMailingListEntryMenu = (props: {
    theme: TerminalTheme;
    onAction: (key: string) => void;
}) => {
    const { emulatorState } = useAppContext();
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const mode = emulatorState.getAdminConsoleMode()!;
    const entry = mode.mailingListEntry!;
    const dots = useLoadingDots();

    const outputColor = props.theme.outputColor;
    const commandColor = props.theme.commandColor;

    const selectField = (field: FormField) => {
        emulatorState.setAdminConsoleMode({
            ...mode,
            mailingListEntry: { ...entry, currentField: field }
        });
        props.onAction("");
    };

    const fields: { field: FormField; label: string }[] = [
        { field: "firstName", label: "First Name" },
        { field: "lastName", label: "Last Name" },
        { field: "email", label: "Email" }
    ];

    return (
        <Box sx={{ paddingTop: 1 }}>
            <ConsoleHeading theme={props.theme} title={"Add To Mailing List"} />
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

            <ConsoleHint theme={props.theme}>
                {mode.loading
                    ? `Adding${dots}`
                    : entry.added
                      ? smallScreen
                          ? "tap Back to return"
                          : "enter: back | escape: back"
                      : smallScreen
                        ? "tap a field to edit, then Add"
                        : "up/down: navigate fields | type to edit | enter: add | escape: cancel"}
            </ConsoleHint>
        </Box>
    );
};

export default AddMailingListEntryMenu;
