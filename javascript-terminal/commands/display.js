import React from "react";

import {parseOptions} from '../parser';
import * as FileOp from '../fs/operations-with-permissions/file-operations';
import * as OutputFactory from '../output';
import {relativeToAbsolutePath} from '../emulator-state/util';

const fileToImageOutput = (fs, filePath) =>
{
	const {err, file} = FileOp.readFile(fs, filePath);

	if(err) return OutputFactory.makeErrorOutput(err);

	let jsxElement = <img alt={"Image"} src={file.get('content')} style={{width: "auto", height: 360, padding: 10}} />;

	if(filePath.match(new RegExp('\.(mov|mp4)$', 'g')))
	{
		jsxElement = <iframe width="640" height="360" frameBorder="0" src={file.get('content')} style={{padding: 10}} />;
	}

	return OutputFactory.makeTextOutput(jsxElement);
};

export const optDef = {};

const display = (state, commandOptions) =>
{
	const {argv} = parseOptions(commandOptions, optDef);

	if(argv.length === 0) return {};

	const regex = new RegExp('\.(png|jpe?g|mov|mp4)$', 'g');
	const filePaths = argv.map(pathArg => relativeToAbsolutePath(state, pathArg)).filter(item => item.match(regex));

	return { outputs: filePaths.map(path => fileToImageOutput(state.getFileSystem(), path)) };
};

export default display;
