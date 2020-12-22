import React from 'react';

import {parseOptions} from '../parser';
import {relativeToAbsolutePath} from '../emulator-state/EmulatorState';
import * as FileOp from '../fs/operations/file-operations';

const fileToImageOutput = (fs, filePath) =>
{
	const file = FileOp.read(fs, filePath);

	let jsxElement = <img alt={'Image'} src={file} style={{width: 'auto', height: 360, padding: 10}}/>;

	if(filePath.match(new RegExp('\.(mov|mp4)$', 'g')))
	{
		jsxElement = <iframe width="640" height="360" frameBorder="0" src={file} style={{padding: 10}}/>;
	}

	return jsxElement;
};

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
	const {options, argv} = parseOptions(commandOptions, optDef);

	if(argv.length === 0)
	{
		return {};
	}

	try
	{
		const regex = new RegExp('\.(png|jpe?g|mov|mp4)$', 'g');
		const filePaths = argv.map(pathArg => relativeToAbsolutePath(state, pathArg)).filter(item => item.match(regex));

		return {output: filePaths.map(path => fileToImageOutput(state.getFileSystem(), path)).join('\n')};
	}

	catch(err)
	{
		return {output: err.message, type: 'error'};
	}
};

export default {optDef, functionDef};
