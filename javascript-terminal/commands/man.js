import {parseOptions} from '../parser';
import * as OutputFactory from '../output';

export const optDef = {};

const man = (state, commandOptions) =>
{
	const {argv} = parseOptions(commandOptions, optDef);

	if(argv.length !== 1) return {};

	const command = argv[0];

	if(command === 'cat')
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

	if(command === 'display')
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

	else if(command === 'cd')
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

	else if(command === 'ls')
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
};

export default man;
