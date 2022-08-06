import { Grid, Typography } from "@mui/material";

import FolderIcon from "@mui/icons-material/Folder";

const PromptSymbol = (props) => {
	return (
		<Grid container alignContent={"center"} alignItems={"center"} spacing={1}>
			<Grid item>
				<Typography style={{ color: props.theme.promptSymbolColor }}>
					{props.children}
				</Typography>
			</Grid>
			<Grid item>
				<FolderIcon
					color={"inherit"}
					fontSize={"small"}
					style={{ paddingBottom: 2, paddingRight: 2, display: "block" }}
				/>
			</Grid>
			<Grid item align={"center"}>
				<Typography style={{ color: props.theme.promptSymbolColor }}>
					{props.cwd ? props.cwd : props.emulatorState.getEnvVariables().cwd}
				</Typography>
			</Grid>
		</Grid>
	);
};

export default PromptSymbol;
