import { forwardRef, useEffect, useState } from "react";

import { Box, Grid, InputBase, Typography } from "@mui/material";

import PromptSymbol from "./PromptSymbol";

const CommandInput = (props: any, ref: any) => {
    const [visibleCursor, setVisibleCursor] = useState<boolean>(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCursor((visible) => !visible);
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <Grid container alignItems={"center"} spacing={2}>
            <Grid item>
                <PromptSymbol theme={props.theme} {...props}>
                    {props.promptSymbol}
                </PromptSymbol>
            </Grid>
            <Grid item>
                <Grid container justifyContent={"center"} alignItems={"center"}>
                    <Grid item>
                        <Typography style={{ whiteSpace: "pre" }}>{props.value}</Typography>
                    </Grid>
                    <Grid item>
                        <Box
                            id={"cursor"}
                            width={8}
                            height={18}
                            sx={{
                                visibility: visibleCursor ? "visible" : "hidden",
                                background: "#FFFFFF"
                            }}
                        />
                    </Grid>
                    <Grid item style={{ width: 0, height: 0 }}>
                        <InputBase
                            autoFocus
                            inputRef={ref}
                            value={props.value}
                            onChange={props.onChange}
                            onKeyDown={props.onKeyDown}
                            style={{ width: 0, height: 0, opacity: 0 }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default forwardRef(CommandInput);
