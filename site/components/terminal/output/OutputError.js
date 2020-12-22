import React from 'react';

import {Typography} from '@material-ui/core';


const OutputError = props =>
{
	return (
		props.children.split('\n').map((line, key) =>
			<Typography key={key} style={{color: props.theme.errorColor}}>
				{line}
			</Typography>
		)
	);
};


export default OutputError;
