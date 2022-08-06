import { Grid } from "@mui/material";

import PromptSymbol from "../PromptSymbol";
import OutputText from "./OutputText";

const OutputHeader = (props) => (
	<Grid container alignContent={"center"} alignItems={"center"} spacing={2}>
		<Grid item>
			<PromptSymbol theme={props.theme} {...props}>
				{props.promptSymbol}
			</PromptSymbol>
		</Grid>
		<Grid item>
			<OutputText {...props}>{props.children}</OutputText>
		</Grid>
	</Grid>
);

export default OutputHeader;
