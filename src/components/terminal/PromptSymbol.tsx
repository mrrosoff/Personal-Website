import { Grid, Typography } from "@mui/material";

import FolderIcon from "@mui/icons-material/Folder";

import { EmulatorState } from "../../javascript-terminal";

const PromptSymbol = (props: {
    theme: any;
    emulatorState: EmulatorState;
    cwd?: string;
    children: string;
}) => {
    return (
        <Grid container alignContent={"center"} alignItems={"center"} spacing={1}>
            <Grid>
                <Typography style={{ color: props.theme.promptSymbolColor }}>
                    {props.children}
                </Typography>
            </Grid>
            <Grid>
                <FolderIcon
                    color={"inherit"}
                    fontSize={"small"}
                    style={{ paddingBottom: 2, paddingRight: 2, display: "block" }}
                />
            </Grid>
            <Grid>
                <Typography style={{ color: props.theme.promptSymbolColor }}>
                    {props.cwd ? props.cwd : props.emulatorState.getEnvVariables().cwd}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default PromptSymbol;
