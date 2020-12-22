import React from 'react';

import {Typography} from '@material-ui/core';

const OutputText = props =>
{
	return (
		props.children.split('\n').map((line, key) =>
			<Typography key={key} style={{color: props.theme.outputColor}}>
				{line}
			</Typography>
		)
	);
};


export default OutputText;
