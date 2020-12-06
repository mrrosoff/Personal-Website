import React, {useEffect} from 'react';

import { CommandMapping, DefaultCommandMapping, EmulatorState, FileSystem } from '../../javascript-terminal';

import Terminal from './terminal/Terminal';
import {files} from "../FileSystem";

const TerminalEmbed = props =>
{
	useEffect(() =>
	{
		for(let form of document.getElementsByTagName("FORM"))
		{
			form.setAttribute("spellcheck", "false")
		}
	});

	const customState = EmulatorState.create({
		'fs': FileSystem.create(files),
		'commandMapping': CommandMapping.create({
			...DefaultCommandMapping,
			'exit': {
				'functionDef': (state, opts) => close(),
				'optDef': {}
			},
			'help': {
				'functionDef': (state, opts) => ({
					output:
						'Welcome to Help!' + '\n' + '\n' +
						"Some Basic Commands" + '\n' + '\n' +
						'cat: Read A File ' + '\n' +
						'display: Display A Media Link' + '\n' +
						'cd: Change Directory' + '\n' +
						'ls: List Files' + '\n' + '\n' +
						'For More Information, Try \"man [command]\"'
				}),
				'optDef': {}
			}
		})
	});

	return (
		<Terminal
			theme={{
				background: '#121212',
				promptSymbolColor: '#2BC903',
				commandColor: '#FCFCFC',
				outputColor: '#FCFCFC',
				errorOutputColor: '#ff0606',
				width: '100%',
				height: '88vh'
			}}
			emulatorState={customState}
			promptSymbol={"dev@rosoff"}
			errorStr={"Looks Like That Command Isn't Valid. Try 'help' For More Information."}
		/>
	);
};

export default TerminalEmbed;
