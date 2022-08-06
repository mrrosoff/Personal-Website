import { Typography } from "@mui/material";

const OutputText = (props: any) => {
	return props.children.split("\n").map((line: string, key: number) => (
		<Typography key={key} style={{ color: props.theme.outputColor }}>
			{line}
		</Typography>
	));
};

export default OutputText;
