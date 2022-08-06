import { Typography } from "@mui/material";

const OutputText = (props) => {
	return props.children.split("\n").map((line, key) => (
		<Typography key={key} style={{ color: props.theme.outputColor }}>
			{line}
		</Typography>
	));
};

export default OutputText;
