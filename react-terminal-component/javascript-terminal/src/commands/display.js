import React from "react";
/**
 * Combines one or more files to display in the terminal output
 * Usage: cat file1.txt file2.txt
 */
import parseOptions from 'parser/option-parser';
import * as FileOp from 'fs/operations-with-permissions/file-operations';
import * as OutputFactory from 'emulator-output/output-factory';
import {resolvePath} from 'emulator-state/util';

const fileToImageOutput = (fs, filePath) =>
{
	const {err, file} = FileOp.readFile(fs, filePath);

	if(err)
	{
		return OutputFactory.makeErrorOutput(err);
	}

	let jsxElement = <img src={file.get('content')} style={{width: "auto", height: 360, padding: 10}}/>;

	if(filePath.match(new RegExp('\.(mov|mp4)$', 'g')))
	{
		jsxElement =
			<iframe
				width="640" height="360" frameBorder="0"
				src={file.get('content')} style={{padding: 10}}
			/>;
	}

	return OutputFactory.makeTextOutput(jsxElement);
};

export const optDef = {};

export default (state, commandOptions) =>
{
	const {argv} = parseOptions(commandOptions, optDef);

	if(argv.length === 0)
	{
		return {};
	}

	const regex = new RegExp('\.(png|jpe?g|mov|mp4)$', 'g');
	const filePaths = argv.map(pathArg => resolvePath(state, pathArg)).filter(item => item.match(regex));

	return {
		outputs: filePaths.map(path => fileToImageOutput(state.getFileSystem(), path))
	};
};
