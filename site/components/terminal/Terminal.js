import React, {useEffect} from 'react';

import ReactTerminal from '../../../react-terminal-component';
import {
	CommandMapping,
	defaultCommandMapping,
	EmulatorState,
	FileSystem,
	OutputFactory
} from '../../../react-terminal-component/javascript-terminal';

import {files} from "./FileSystem";

const Terminal = props =>
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
			...defaultCommandMapping,
			'exit': {
				'function': (state, opts) => close(),
				'optDef': {}
			},
			'help': {
				'function': (state, opts) =>
				{
					return {
						output: OutputFactory.makeTextOutput(
							'Welcome to Help!' + '\n' + '\n' +
							"Some Basic Commands" + '\n' + '\n' +
							'cat: Read A File ' + '\n' +
							'display: Display A Media Link' + '\n' +
							'cd: Change Directory' + '\n' +
							'ls: List Files' + '\n' + '\n' +
							'For More Information, Try \"man [command]\"'
						)
					};
				},
				'optDef': {}
			},
			'man': {
				'function': (state, opts) =>
				{
					let input = opts.toString()

					if(input === 'cat')
					{
						return {
							output: OutputFactory.makeTextOutput('NAME\n' +
								'     cat -- concatenate and print files\n' +
								'\n' +
								'SYNOPSIS\n' +
								'     cat [file ...]\n' +
								'\n' +
								'DESCRIPTION\n' +
								'     The cat utility reads files sequentially, writing them to the standard\n' +
								'     output.')
						};
					}

					if(input === 'display')
					{
						return {
							output: OutputFactory.makeTextOutput('NAME\n' +
								'     display -- display image and video files\n' +
								'\n' +
								'SYNOPSIS\n' +
								'     display [file ...]\n' +
								'\n' +
								'DESCRIPTION\n' +
								'     The display utility views files sequentially, writing them to the standard\n' +
								'     output.')
						};
					}

					else if(input === 'cd')
					{
						return {
							output: OutputFactory.makeTextOutput('NAME\n' +
								'    cd - Change the shell working directory.\n' +
								'\n' +
								'SYNOPSIS\n' +
								'    cd [dir]\n' +
								'\n' +
								'DESCRIPTION\n' +
								'    Change the shell working directory.')
						};
					}

					else if(input === 'ls')
					{
						return {
							output: OutputFactory.makeTextOutput('NAME\n' +
								'     ls -- list directory contents\n' +
								'\n' +
								'SYNOPSIS\n' +
								'     ls [file ...]\n' +
								'\n' +
								'DESCRIPTION\n' +
								'     For each operand that names a file of a type other than directory, ls\n' +
								'     displays its name as well as any requested, associated information.  For\n' +
								'     each operand that names a file of type directory, ls displays the names\n' +
								'     of files contained within that directory, as well as any requested, associated\n' +
								'     information.')
						};
					}
				},
				'optDef': {}
			}
		})
	});

	return (
		<ReactTerminal
			theme={{
				background: '#121212',
				promptSymbolColor: '#2BC903',
				commandColor: '#FCFCFC',
				outputColor: '#FCFCFC',
				errorOutputColor: '#ff0606',
				width: '100%',
				height: '88vh'
			}}
			promptSymbol={"dev@rosoff:$"}
			clickToFocus={true}
			emulatorState={customState}
			errorStr={"Looks Like That Command Isn't Valid. Try 'help' For More Information."}
		/>
	);
};

export default Terminal;
