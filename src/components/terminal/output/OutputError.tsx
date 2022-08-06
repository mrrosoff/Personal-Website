import { Typography } from "@mui/material";

const OutputError = (props) => {
	return props.children.split("\n").map((line, key) => (
		<Typography key={key} style={{ color: props.theme.errorColor }}>
			{line}
		</Typography>
	));
};

export default OutputError;
