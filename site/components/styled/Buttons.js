import React from "react";

import {Button} from "@material-ui/core";

export const LinkButtonWithIcon = props =>
{
	return (
		<Button
			href={props.href}
			target="_blank"
			rel="noopener"
			className={props.className ? props.className : ""}
			startIcon={props.icon}
		>
			{props.children}
		</Button>
	);
};
