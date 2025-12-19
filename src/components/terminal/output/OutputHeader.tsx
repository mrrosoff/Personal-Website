import { Grid } from "@mui/material";

import PromptSymbol from "../PromptSymbol";
import OutputText from "./OutputText";
import { TerminalTheme } from "../Terminal";
import { EmulatorState } from "../../../javascript-terminal";

const OutputHeader = (props: {
    theme: TerminalTheme;
    promptSymbol: string;
    emulatorState: EmulatorState;
    children: string;
    cwd?: string;
}) => (
    <Grid container alignContent={"center"} alignItems={"center"} spacing={2}>
        <Grid>
            <PromptSymbol {...props} cwd={props.cwd}>
                {props.promptSymbol}
            </PromptSymbol>
        </Grid>
        <Grid>
            <OutputText {...props}>{props.children}</OutputText>
        </Grid>
    </Grid>
);

export default OutputHeader;
