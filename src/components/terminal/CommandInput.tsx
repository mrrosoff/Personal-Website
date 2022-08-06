import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import PromptSymbol from "./PromptSymbol";

import { Grid, InputBase, Typography } from "@mui/material";

const CommandInput = (props, ref) => {
	useEffect(() => {
		let interval = setInterval(() => {
			let visibility = document.getElementById("cursor").style.visibility;
			document.getElementById("cursor").style.visibility =
				visibility === "visible" ? "hidden" : "visible";
		}, 600);
		return () => clearInterval(interval);
	});

	return (
		<Grid container alignItems={"center"} spacing={2}>
			<Grid item>
				<PromptSymbol theme={props.theme} {...props}>
					{props.promptSymbol}
				</PromptSymbol>
			</Grid>
			<Grid item>
				<Grid container justifyContent={"center"} alignItems={"center"}>
					<Grid item>
						<Typography style={{ whiteSpace: "pre" }}>{props.value}</Typography>
					</Grid>
					<Grid item>
						<div
							id={"cursor"}
							style={{ width: 8, height: 18, background: "#FFFFFF" }}
						/>
					</Grid>
					<Grid item style={{ width: 0, height: 0 }}>
						<InputBase
							autoFocus
							inputRef={ref}
							value={props.value}
							onChange={props.onChange}
							onKeyDown={props.onKeyDown}
							style={{ width: 0, height: 0, opacity: 0 }}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default forwardRef(CommandInput);
