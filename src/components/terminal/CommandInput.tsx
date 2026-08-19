import {
    forwardRef,
    useEffect,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
    type Ref
} from "react";

import { Box, InputBase, Typography } from "@mui/material";

import PromptSymbol from "./PromptSymbol";
import type { TerminalTheme } from "./Terminal";

const CommandInput = (
    props: {
        theme: TerminalTheme;
        promptSymbol: string;
        value: string;
        onChange: (e: ChangeEvent<HTMLInputElement>) => void;
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    },
    ref: Ref<HTMLInputElement | null>
) => {
    const [visibleCursor, setVisibleCursor] = useState<boolean>(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCursor((visible) => !visible);
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <Typography
            component={"div"}
            style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-all"
            }}
        >
            <Box component={"span"} sx={{ display: "inline-flex", verticalAlign: "middle", mr: 1 }}>
                <PromptSymbol {...props}>{props.promptSymbol}</PromptSymbol>
            </Box>
            {props.value}
            <Box
                id={"cursor"}
                component={"span"}
                sx={{
                    display: "inline-block",
                    width: "8px",
                    height: "18px",
                    verticalAlign: "middle",
                    visibility: visibleCursor ? "visible" : "hidden",
                    background: "#FFFFFF"
                }}
            />
            <InputBase
                autoFocus
                inputRef={ref}
                value={props.value}
                onChange={props.onChange}
                onKeyDown={props.onKeyDown}
                inputProps={{
                    autoComplete: "off",
                    autoCorrect: "off",
                    autoCapitalize: "none",
                    spellCheck: false
                }}
                style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
            />
        </Typography>
    );
};

export default forwardRef(CommandInput);
