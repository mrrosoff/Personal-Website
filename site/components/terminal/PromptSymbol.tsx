import { Grid, Typography } from "@mui/material";

import FolderIcon from "@mui/icons-material/Folder";

import { useAppContext } from "../AppContext";
import type { TerminalTheme } from "./Terminal";

const PromptSymbol = (props: { theme: TerminalTheme; cwd?: string; children: string }) => {
    const { emulatorState } = useAppContext();
    return (
        <Grid container sx={{ alignContent: "center", alignItems: "center" }} spacing={1}>
            <Grid>
                <Typography sx={{ color: props.theme.promptSymbolColor }}>
                    {props.children}
                </Typography>
            </Grid>
            <Grid>
                <FolderIcon
                    color={"inherit"}
                    fontSize={"small"}
                    sx={{ paddingBottom: "2px", paddingRight: "2px", display: "block" }}
                />
            </Grid>
            <Grid>
                <Typography sx={{ color: props.theme.promptSymbolColor }}>
                    {props.cwd ?? emulatorState.getEnvVariables().cwd}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default PromptSymbol;
