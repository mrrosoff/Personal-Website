import { Grid, Typography } from "@mui/material";

import FolderIcon from "@mui/icons-material/Folder";

import { useAppContext } from "../AppContext";
import { TerminalTheme } from "./Terminal";

const PromptSymbol = (props: {
    theme: TerminalTheme;
    cwd?: string;
    children: string;
}) => {
    const { emulatorState } = useAppContext();
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
                    {props.cwd ? props.cwd : emulatorState.getEnvVariables().cwd}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default PromptSymbol;
