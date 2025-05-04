import { Grid } from "@mui/material";

import PromptSymbol from "../PromptSymbol";
import OutputText from "./OutputText";

const OutputHeader = (props: any) => (
    <Grid container alignContent={"center"} alignItems={"center"} spacing={2}>
        <Grid>
            <PromptSymbol theme={props.theme} {...props}>
                {props.promptSymbol}
            </PromptSymbol>
        </Grid>
        <Grid>
            <OutputText {...props}>{props.children}</OutputText>
        </Grid>
    </Grid>
);

export default OutputHeader;
